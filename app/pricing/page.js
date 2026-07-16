'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: null,
    description: 'For hobbyists and casual users',
    badge: null,
    features: [
      { text: '50 scans / month', included: true },
      { text: '10 requests / minute', included: true },
      { text: 'Basic technology detection', included: true },
      { text: 'HTML analysis', included: true },
      { text: 'Deep scan (CSS, JS, paths)', included: false },
      { text: 'PDF & CSV export', included: false },
      { text: 'Badge embeds', included: false },
      { text: 'Scan history & diff', included: false },
      { text: 'Custom detection rules', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaHref: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 19,
    period: '/mo',
    description: 'For developers and small teams',
    badge: 'Most Popular',
    features: [
      { text: '2,000 scans / month', included: true },
      { text: '100 requests / minute', included: true },
      { text: 'Basic technology detection', included: true },
      { text: 'HTML analysis', included: true },
      { text: 'Deep scan (CSS, JS, paths)', included: true },
      { text: 'PDF & CSV export', included: true },
      { text: 'Badge embeds', included: true },
      { text: 'Scan history & diff', included: true },
      { text: 'Custom detection rules', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    ctaHref: '/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 79,
    period: '/mo',
    description: 'For agencies and large teams',
    badge: null,
    features: [
      { text: '20,000 scans / month', included: true },
      { text: '500 requests / minute', included: true },
      { text: 'Basic technology detection', included: true },
      { text: 'HTML analysis', included: true },
      { text: 'Deep scan (CSS, JS, paths)', included: true },
      { text: 'PDF & CSV export', included: true },
      { text: 'Badge embeds', included: true },
      { text: 'Scan history & diff', included: true },
      { text: 'Custom detection rules', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/signup',
    highlight: false,
  },
];

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-accent" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-faint" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PricingCard({ plan, session }) {
  const isLoggedIn = !!session;
  const isCurrentTier = session?.user?.tier === plan.name.toLowerCase();

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
        plan.highlight
          ? 'border-accent/30 bg-accent/5 shadow-[0_0_40px_-12px_var(--accent-glow)] scale-[1.02]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
          {plan.badge}
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-fg">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-fg">
          {plan.price === 0 ? 'Free' : `$${plan.price}`}
        </span>
        {plan.period && (
          <span className="ml-1 text-sm text-muted">{plan.period}</span>
        )}
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {f.included ? <CheckIcon /> : <XIcon />}
            <span className={f.included ? 'text-fg/80' : 'text-faint/60'}>{f.text}</span>
          </li>
        ))}
      </ul>

      {isCurrentTier ? (
        <div className="rounded-lg border border-accent/20 bg-accent/10 py-2.5 text-center text-sm font-medium text-accent">
          Current Plan
        </div>
      ) : (
        <Link
          href={plan.ctaHref}
          className={`rounded-lg py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
            plan.highlight
              ? 'bg-accent text-black hover:brightness-110 active:scale-[0.98]'
              : 'border border-white/10 bg-white/5 text-fg hover:bg-white/10 active:scale-[0.98]'
          }`}
        >
          {isLoggedIn && session?.user?.tier === 'free' && plan.price > 0 ? 'Upgrade' : plan.cta}
        </Link>
      )}
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-fg transition-colors hover:text-accent"
      >
        {question}
        <svg
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-muted">{answer}</p>
      )}
    </div>
  );
}

const FAQ = [
  {
    question: 'Can I try Pro before paying?',
    answer: 'Yes. Every new account starts on the Free plan with 50 scans/month. Upgrade to Pro anytime — no credit card required for the first 14-day trial.',
  },
  {
    question: 'What happens if I hit my scan limit?',
    answer: 'You\'ll get a clear notification in the app. You can either wait until the next billing cycle or upgrade your plan. Your scan count resets on the 1st of each month.',
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Absolutely. Upgrade instantly and get prorated billing. Downgrade at any time — the change takes effect at the end of your current billing period.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Not yet, but it\'s on our roadmap. Contact us at support@techstackfinder.com for custom annual pricing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex) through Stripe. Enterprise customers can pay via invoice.',
  },
  {
    question: 'Is there a free trial for Pro?',
    answer: 'Yes. Pro comes with a 14-day free trial. Cancel anytime during the trial and you won\'t be charged.',
  },
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Pricing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            Start free. Upgrade when you need more power. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} session={session} />
          ))}
        </div>

        <div className="mt-20">
          <h2 className="mb-6 text-center text-xl font-semibold text-fg">Frequently asked questions</h2>
          <div className="mx-auto max-w-2xl">
            {FAQ.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
