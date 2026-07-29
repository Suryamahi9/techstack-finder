'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import OnboardingTour from '../components/OnboardingTour';
import MouseGlow from '../components/MouseGlow';
import useInView from '../lib/useInView';

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function BrowserWindow({ children, url = 'https://techstack-finder.vercel.app', className = '' }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0806] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
        </div>
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1.5">
          <svg className="h-3 w-3 shrink-0 text-faint/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a4 4 0 0 0-4 4c0 2 4 6 4 6s4-4 4-6a4 4 0 0 0-4-4z"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/>
          </svg>
          <span className="flex-1 truncate text-[10px] text-faint/50">{url}</span>
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">12 technologies</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function ResultsMockup() {
  return (
    <BrowserWindow url="https://techstack-finder.vercel.app/results?site=stripe.com">
      <div className="p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-1 border-b border-white/[0.04] pb-2">
          {['Overview', 'Technologies', 'Analysis', 'Code', 'Tools'].map((t, i) => (
            <span key={t} className={`px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider ${i === 1 ? 'border-b-2 border-accent text-accent' : 'text-faint/40'}`}>{t}</span>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {['Frontend', 'Backend', 'Infrastructure', 'Analytics', 'CMS', 'CDN'].map((c) => (
            <span key={c} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[9px] uppercase tracking-wider text-faint/60">{c}</span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { name: 'React', cat: 'Frontend', conf: 98, color: '#61dafb' },
            { name: 'Next.js', cat: 'Framework', conf: 94, color: '#fff' },
            { name: 'TypeScript', cat: 'Language', conf: 92, color: '#3178c6' },
            { name: 'Tailwind CSS', cat: 'CSS', conf: 89, color: '#38bdf8' },
            { name: 'Stripe', cat: 'Payments', conf: 87, color: '#635bff' },
            { name: 'Vercel', cat: 'Hosting', conf: 85, color: '#fff' },
            { name: 'NextAuth.js', cat: 'Auth', conf: 82, color: '#8134af' },
            { name: 'Prisma', cat: 'ORM', conf: 78, color: '#2d3748' },
            { name: 'PostgreSQL', cat: 'Database', conf: 74, color: '#336791' },
          ].map((t) => (
            <div key={t.name} className="rounded-lg border border-white/[0.04] bg-white/[0.015] px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[11px] font-medium text-fg/80">{t.name}</span>
                    <span className="ml-1 shrink-0 font-mono text-[9px] text-faint">{t.conf}%</span>
                  </div>
                  <div className="text-[9px] text-faint/50">{t.cat}</div>
                </div>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-accent/50" style={{ width: `${t.conf}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserWindow>
  );
}

function HowItWorksMockup() {
  return (
    <BrowserWindow url="https://techstack-finder.vercel.app/api/scan?site=stripe.com" className="h-fit">
      <div className="space-y-1 p-4 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-accent/70">
          <span className="text-faint">$</span>
          <span>curl -X POST https://api.techstack-finder.com/scan</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400/60">
          <span className="text-faint">&gt;</span>
          <span>fetching  https://stripe.com ... 340ms</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400/60">
          <span className="text-faint">&gt;</span>
          <span>parsing  DOM  ·  124 nodes extracted</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400/60">
          <span className="text-faint">&gt;</span>
          <span>matching  2,347 rules  ·  41 signals</span>
        </div>
        <div className="flex items-center gap-2 text-accent/80">
          <span className="text-faint">$</span>
          <span className="font-semibold text-accent">12 technologies detected in 1.4s</span>
        </div>
      </div>
    </BrowserWindow>
  );
}

const FEATURES = [
  {
    title: '2,300+ detection rules',
    desc: 'Hand-crafted fingerprints for frameworks, CMS, analytics, hosting, databases, and more. Updated weekly.',
    icon: 'search',
  },
  {
    title: 'Deep DOM parsing',
    desc: 'Extracts scripts, meta tags, headers, CSS classes, and JS variables from the full document tree.',
    icon: 'code',
  },
  {
    title: 'Playwright browser fallback',
    desc: 'When HTTP fetch is blocked, a headless browser renders the page to detect SPAs and client-side tech.',
    icon: 'globe',
  },
  {
    title: 'Export any format',
    desc: 'Download as JSON, CSV, PDF, or embed a live SVG badge in your README. Share via permanent link.',
    icon: 'download',
  },
  {
    title: 'API-first design',
    desc: 'REST API with API keys, rate limiting, and monthly quotas. Integrate into your CI/CD pipeline.',
    icon: 'terminal',
  },
  {
    title: 'Monitor & compare',
    desc: 'Track tech stacks over time. Compare any two websites side-by-side. Get weekly digests.',
    icon: 'activity',
  },
];

const ICONS = {
  search: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35" />,
  code: <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  terminal: <><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></>,
  activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
};

const TESTIMONIALS = [
  { quote: 'Used it to audit a competitor\'s stack before our pitch. Found they were on Shopify — completely changed our approach.', name: 'Alex Chen', role: 'Product @ Linear' },
  { quote: 'Scanned 2,000+ domains for our market research report. The API handled it flawlessly. No rate limit issues.', name: 'Sarah Kim', role: 'Data @ Sequoia' },
  { quote: 'The accuracy is insane. Picks up frameworks I didn\'t even know existed. Built our entire sales prospecting tool around it.', name: 'Marcus Johansson', role: 'Founder @ Grip' },
];

const PRICING_TIERS = [
  { name: 'Free', price: '$0', scans: '50', rate: '10/min', features: ['2,300+ rules', 'Deep scan', 'Export CSV/JSON'], cta: 'Start free', href: '/signup' },
  { name: 'Pro', price: '$12', scans: '2,000', rate: '100/min', features: ['Everything in Free', 'API access', 'Monitor & compare', 'Weekly digests', 'Priority support'], cta: 'Get Pro', href: '/pricing', popular: true },
  { name: 'Enterprise', price: '$49', scans: '20,000', rate: '500/min', features: ['Everything in Pro', 'SSO / SAML', 'Custom rules', 'SLA guarantee', 'Dedicated support'], cta: 'Contact sales', href: '/pricing' },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MouseGlow />
      <Header />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main id="main-content" className="relative z-10">

        {/* ═══════ HERO ═══════ */}
        <section className="relative overflow-hidden pb-12 pt-28 sm:pt-36">
          <div className="pointer-events-none absolute inset-0 z-[-1]">
            <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url(https://picsum.photos/seed/datacenter/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>

          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 text-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/[0.04] px-4 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent/80">
                  Now in public beta
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="max-w-3xl text-[2.5rem] font-bold leading-[1.05] tracking-tighter sm:text-5xl lg:text-[5rem]">
                What websites are made of
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Paste any URL and fingerprint the frameworks, CMS, analytics,
                hosting, and databases powering it &mdash; in under 3 seconds.
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="w-full max-w-xl">
                <SearchBar />
              </div>
            </FadeIn>

            <FadeIn delay={0.32}>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-faint">
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                  No signup required
                </span>
                <span className="h-1 w-1 rounded-full bg-faint/30" />
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                  2,300+ rules
                </span>
                <span className="h-1 w-1 rounded-full bg-faint/30" />
                <span className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Results in &lt; 3s
                </span>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.45}>
            <div className="mx-auto mt-10 max-w-5xl px-6">
              <ResultsMockup />
            </div>
          </FadeIn>
        </section>

        {/* ═══════ SOCIAL PROOF ═══════ */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <FadeIn>
            <p className="mb-8 text-center text-[10px] uppercase tracking-[0.25em] text-faint">
              Trusted by developers and teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 opacity-35">
              {['Vercel', 'Stripe', 'GitHub', 'Netflix', 'Shopify', 'Railway', 'Linear', 'Figma'].map((n) => (
                <span key={n} className="font-mono text-sm font-semibold text-white/60">{n}</span>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ═══════ STATS ═══════ */}
        <section className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="grid grid-cols-2 divide-x divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.015] sm:grid-cols-4">
              {[
                { value: 2347, suffix: '+', label: 'Detection rules' },
                { value: 92, label: 'Categories' },
                { value: 1.4, suffix: 's', label: 'Avg scan time' },
                { value: 0, label: 'Signup needed', check: true },
              ].map((s, i) => (
                <div key={i} className="px-4 py-7 text-center sm:px-6">
                  <div className="font-mono text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                    {s.check ? (
                      <svg className="mx-auto h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : (
                      <span>{s.value}{s.suffix || ''}</span>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-faint">{s.label}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ═══════ FEATURES GRID ═══════ */}
        <section className="relative mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
          <div className="pointer-events-none absolute inset-0 z-[-1] opacity-[0.02]" style={{ backgroundImage: 'url(https://picsum.photos/seed/circuits/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <FadeIn>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                One tool to analyze, monitor, and compare the technology stack behind any website.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.06}>
                <div className="group h-full rounded-xl border border-white/[0.06] bg-white/[0.015] px-6 py-6 transition-all duration-300 hover:border-accent/15 hover:bg-accent/[0.02] hover:shadow-[0_0_24px_-8px_var(--accent-glow)]">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-accent/20 group-hover:bg-accent/[0.06]">
                    <svg className="h-5 w-5 text-fg/60 transition-colors group-hover:text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[f.icon]}
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-fg/90">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section className="relative mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
          <div className="pointer-events-none absolute inset-0 z-[-1] opacity-[0.015]" style={{ backgroundImage: 'url(https://picsum.photos/seed/network/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
            <div className="flex-1">
              <FadeIn>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  How it works
                </h2>
                <p className="mt-3 max-w-md text-sm text-muted">
                  Three stages from URL to a complete technology profile.
                </p>
              </FadeIn>
              <div className="mt-8 space-y-4">
                {[
                  { n: '01', title: 'Fetch', desc: 'Downloads the full HTML, headers, and cookies with a configurable timeout and proxy support.', stat: '~340ms · 8s timeout' },
                  { n: '02', title: 'Parse & extract', desc: 'Parses the DOM tree, extracts scripts, meta tags, CSS classes, JS variables, and headers.', stat: '50+ signal types · 800ms' },
                  { n: '03', title: 'Match technologies', desc: '2,347 rules fingerpint each technology from the extracted signals with confidence scoring.', stat: '92 categories · 1.4s avg' },
                ].map((s, i) => (
                  <FadeIn key={s.n} delay={i * 0.1}>
                    <div className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 py-4 transition-colors hover:border-white/[0.1]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/15 bg-accent/[0.04] font-mono text-xs font-semibold text-accent">
                        {s.n}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-fg/90">{s.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{s.desc}</p>
                        <div className="mt-2 font-mono text-[10px] text-faint">{s.stat}</div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <FadeIn delay={0.25}>
                <HowItWorksMockup />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIALS ═══════ */}
        <section className="relative mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
          <div className="pointer-events-none absolute inset-0 z-[-1] opacity-[0.02]" style={{ backgroundImage: 'url(https://picsum.photos/seed/abstract/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <FadeIn>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by engineers
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                Used by product teams, investors, and developers worldwide.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.015] px-6 py-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-3.5 w-3.5 text-accent/70" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-muted/90">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-white/[0.04]">
                    <div className="text-xs font-medium text-fg/80">{t.name}</div>
                    <div className="text-[10px] text-faint">{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════ PRICING ═══════ */}
        <section className="relative mx-auto max-w-6xl px-6 pt-24 sm:pt-32">
          <div className="pointer-events-none absolute inset-0 z-[-1] opacity-[0.015]" style={{ backgroundImage: 'url(https://picsum.photos/seed/dataflow/1920/1080)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <FadeIn>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple pricing
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted">
                Start free, upgrade as you scale. No hidden fees.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <div className={`relative flex flex-col rounded-xl border bg-white/[0.015] px-6 py-6 transition-all duration-300 hover:border-accent/20 ${tier.popular ? 'border-accent/30 shadow-[0_0_30px_-8px_var(--accent-glow)]' : 'border-white/[0.06]'}`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-black">
                      Most popular
                    </div>
                  )}
                  <div className="mb-1 text-xs uppercase tracking-[0.12em] text-faint">{tier.name}</div>
                  <div className="mb-1">
                    <span className="text-3xl font-bold text-fg">{tier.price}</span>
                    {tier.price !== '$0' && <span className="ml-1 text-xs text-faint">/mo</span>}
                  </div>
                  <div className="mb-4 font-mono text-[10px] text-faint">
                    {tier.scans} scans/mo · {tier.rate}
                  </div>
                  <ul className="mb-6 flex-1 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted">
                        <svg className="h-3 w-3 shrink-0 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.href}
                    className={`w-full rounded-lg py-2.5 text-center text-xs font-semibold transition-all active:scale-[0.97] ${
                      tier.popular
                        ? 'bg-accent text-black hover:brightness-110'
                        : 'border border-white/[0.1] bg-white/[0.04] text-fg hover:bg-white/[0.08]'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════ BOTTOM CTA ═══════ */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-28 text-center sm:pt-36">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to explore any stack?
            </h2>
            <p className="mt-3 text-sm text-muted">
              Paste a URL. No signup. Results in seconds.
            </p>
            <div className="mx-auto mt-8 max-w-xl">
              <SearchBar />
            </div>
          </FadeIn>
        </section>

        <OnboardingTour />
      </main>

      <Footer />
    </div>
  );
}
