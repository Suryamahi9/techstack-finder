import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe features will not work.');
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })
  : null;

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    scansPerMonth: 50,
    rateLimit: 10,
    features: [
      '50 scans / month',
      '10 requests / minute',
      'Basic technology detection',
      'HTML analysis',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || null,
    scansPerMonth: 2000,
    rateLimit: 100,
    features: [
      '2,000 scans / month',
      '100 requests / minute',
      'Deep scan (CSS, JS, paths)',
      'Playwright browser fallback',
      'PDF & CSV export',
      'Badge embeds',
      'Scan history & diff',
      'Email support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 79,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || null,
    scansPerMonth: 20000,
    rateLimit: 500,
    features: [
      '20,000 scans / month',
      '500 requests / minute',
      'Everything in Pro',
      'Custom detection rules',
      'Priority browser scanning',
      'Webhook notifications',
      'Bulk scan & monitor',
      'White-label PDF export',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
};

export function getPlanForTier(tier) {
  return PLANS[tier] || PLANS.free;
}
