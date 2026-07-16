import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { stripe, PLANS } from '../../../../lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Stripe is not configured. Set STRIPE_SECRET_KEY.' },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { plan } = body;
  if (!plan || !PLANS[plan] || plan === 'free') {
    return NextResponse.json({ success: false, error: 'Invalid plan.' }, { status: 400 });
  }

  const planConfig = PLANS[plan];
  if (!planConfig.priceId) {
    return NextResponse.json(
      { success: false, error: 'Stripe price ID not configured for this plan.' },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/settings?upgraded=true`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: user.id, plan },
    });

    return NextResponse.json({ success: true, url: checkoutSession.url });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
