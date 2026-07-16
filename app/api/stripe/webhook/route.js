import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        await prisma.user.update({ where: { id: userId }, data: { tier: plan } });
        await prisma.subscription.create({
          data: {
            userId,
            stripeSubscriptionId: session.subscription,
            stripePriceId: session.items?.data?.[0]?.price?.id,
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: invoice.subscription },
        });
        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'active',
              currentPeriodStart: new Date(invoice.period_start * 1000),
              currentPeriodEnd: new Date(invoice.period_end * 1000),
            },
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (dbSub) {
        const statusMap = {
          active: 'active',
          past_due: 'past_due',
          canceled: 'canceled',
          unpaid: 'unpaid',
        };
        await prisma.subscription.update({
          where: { id: dbSub.id },
          data: {
            status: statusMap[sub.status] || sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        if (sub.status === 'canceled' || sub.status === 'unpaid') {
          await prisma.user.update({ where: { id: dbSub.userId }, data: { tier: 'free' } });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (dbSub) {
        await prisma.subscription.delete({ where: { id: dbSub.id } });
        await prisma.user.update({ where: { id: dbSub.userId }, data: { tier: 'free' } });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
