import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { stripe } from '../../../../lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function POST() {
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Stripe is not configured.' },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: 'No billing account found.' },
      { status: 400 }
    );
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings`,
    });

    return NextResponse.json({ success: true, url: portalSession.url });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to open billing portal.' },
      { status: 500 }
    );
  }
}
