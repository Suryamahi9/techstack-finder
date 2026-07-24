'use client';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import LiveScanPreview from '../components/LiveScanPreview';
import TerminalScanner from '../components/TerminalScanner';
import MouseGlow from '../components/MouseGlow';
import FloatingLogos from '../components/FloatingLogos';
import CategoryGrid from '../components/CategoryGrid';
import useInView from '../lib/useInView';

const SITES = [
  { label: 'github.com', desc: 'Dev platform' },
  { label: 'stripe.com', desc: 'Payments' },
  { label: 'vercel.com', desc: 'Hosting' },
  { label: 'shopify.com', desc: 'E-commerce' },
  { label: 'netflix.com', desc: 'Streaming' },
];

const STEPS = [
  { n: '01', title: 'Fetch', tag: 'HTTP client', body: 'Downloads the full HTML with a configurable timeout. No browser overhead.', stats: '2.4kb avg \u00b7 8s timeout' },
  { n: '02', title: 'Parse', tag: 'DOM analysis', body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.', stats: '50+ signals \u00b7 800ms' },
  { n: '03', title: 'Match', tag: 'rule engine', body: '2,300+ rules fingerprint each technology from the exact HTML signal.', stats: '92 categories \u00b7 2,300+ rules' },
];

const USE_CASES = [
  { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'Competitive research', desc: 'Compare tech choices across similar products in your space.', icon: 'M3 3v18h18M7 16l4-8 4 4 4-10' },
  { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a partnership.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', accent: true },
  { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own over time.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { title: 'Team onboarding', desc: 'Get new engineers up to speed on the dependencies and stack.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { title: 'API discovery', desc: 'Map third-party integrations across any website or application.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

const GRADIENT_STYLE = {
  background: 'linear-gradient(135deg, var(--accent), var(--accent) 60%, rgba(197,251,69,0.3))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

function FadeIn({ children, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(timer); } else setCount(current);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function TypewriterBadge() {
  const [text, setText] = useState('');
  const full = 'Live scanning \u00b7 v1.0';
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= full.length) { setText(full.slice(0, i)); i++; } else clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        {text}<span className="animate-pulse ml-px text-accent">|</span>
      </span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono text-[11px] text-faint">{time}</span>;
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MouseGlow />
      <Header />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="scan-line" />
        <FloatingLogos />
      </div>

      <main className="relative z-10">

        {/* ═══════════ HERO ═══════════ */}
        <section className="flex flex-col items-center gap-6 px-6 pt-28 pb-16 sm:pt-36 lg:flex-row lg:items-start lg:gap-12 lg:px-12">
          <div className="w-full flex-1 space-y-4 lg:max-w-4xl">
            <FadeIn>
              <TypewriterBadge />
            </FadeIn>

            <FadeIn delay={0.08}>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tighter sm:text-5xl lg:text-[4rem]">
                What&apos;s it<br />
                <span style={GRADIENT_STYLE}>built with</span><span className="text-muted">?</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.16}>
              <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Enter any URL and fingerprint the technologies powering it &mdash;
                frameworks, CMS, analytics, hosting, and more.
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="max-w-xl">
                <SearchBar />
              </div>
            </FadeIn>

            <FadeIn delay={0.32}>
              <div className="flex flex-wrap items-center gap-2">
                {SITES.map((site) => (
                  <a
                    key={site.label}
                    href={`/results?site=${encodeURIComponent(site.label)}`}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-300 hover:border-accent/20 hover:bg-accent/[0.03] active:scale-[0.97]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://www.google.com/s2/favicons?domain=${site.label}&sz=32`} alt="" className="h-3.5 w-3.5 rounded-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="font-mono text-xs text-muted transition-colors group-hover:text-fg">{site.label}</span>
                    <svg className="h-2.5 w-2.5 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </FadeIn>
          </div>

          <div className="hidden shrink-0 lg:block lg:w-[42%]">
            <FadeIn delay={0.35}>
              <LiveScanPreview />
            </FadeIn>
          </div>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <FadeIn>
          <section className="mx-auto max-w-5xl px-6">
            <div className="grid grid-cols-2 gap-[1px] bg-white/[0.06] sm:grid-cols-4">
              {[
                { value: 2300, suffix: '+', label: 'Detection rules', icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' },
                { value: 92, label: 'Categories', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
                { value: 2, suffix: 's', label: 'Avg scan time', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
                { label: 'No signup', icon: 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z' },
              ].map((stat, i) => (
                <div key={i} className="group relative flex flex-col items-center gap-2 bg-[#0a0a0e] px-4 py-6 text-center transition-colors hover:bg-[#0e0e12]">
                  <svg className="h-4 w-4 text-accent/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                  <div className="font-mono text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                    {stat.value !== undefined ? <Counter end={stat.value} suffix={stat.suffix || ''} /> : (
                      <svg className="mx-auto h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-faint">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ═══════════ USE CASES ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-20 sm:pt-28">
          <FadeIn>
            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                Use cases
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for <span style={GRADIENT_STYLE}>real workflows</span>
              </h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc, i) => (
              <FadeIn key={uc.title} delay={i * 0.06}>
                <div className={`group relative overflow-hidden rounded-2xl border bg-white/[0.02] p-5 transition-all duration-300 hover:bg-white/[0.03] ${
                  uc.accent ? 'border-accent/10 bg-accent/[0.02]' : 'border-white/[0.05] hover:border-white/[0.1]'
                }`}>
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                    uc.accent ? 'border border-accent/20 bg-accent/10 text-accent' : 'border border-white/[0.06] bg-white/[0.03] text-muted group-hover:border-accent/15 group-hover:text-accent'
                  }`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={uc.icon} />
                    </svg>
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-fg/90 transition-colors group-hover:text-fg">{uc.title}</h3>
                  <p className="text-xs leading-relaxed text-muted">{uc.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-20 sm:pt-28">
          <FadeIn>
            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                Pipeline
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How the <span style={GRADIENT_STYLE}>engine works</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-3 lg:col-span-3">
              {STEPS.map((step, i) => (
                <FadeIn key={step.n} delay={i * 0.08}>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/[0.12]">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 font-mono text-xs font-bold text-accent">
                          {step.n}
                        </div>
                        <span className="rounded-full border border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-accent">
                          {step.tag}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-faint">
                          <svg className="h-3 w-3 text-accent/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {step.stats}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <TerminalScanner />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ═══════════ CATEGORIES ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-20 sm:pt-28">
          <FadeIn>
            <CategoryGrid />
          </FadeIn>
        </section>

        {/* ═══════════ EXPORT ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-20 sm:pt-28">
          <div className="grid gap-6 lg:grid-cols-2">
            <FadeIn>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                  Export
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Share your <span style={GRADIENT_STYLE}>findings</span>
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Export reports as JSON or CSV. Generate PDFs. Embed a live badge on your site or README.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['JSON export', 'CSV export', 'PDF report', 'Embed badge'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/15 hover:text-fg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="flex items-center justify-center">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center backdrop-blur-sm">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-faint">Badge preview</div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5">
                    <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7l8-4 8 4-8 4-8-4z" />
                    </svg>
                    <span className="font-sans text-sm font-semibold text-fg">github.com</span>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">12 techs</span>
                  </div>
                  <div className="mt-3 font-mono text-[10px] text-faint">
                    Embed this badge in your README or site
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════ BOTTOM CTA ═══════════ */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-28 text-center sm:pt-36">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Start <span style={GRADIENT_STYLE}>scanning</span>
            </h2>
            <p className="mt-3 text-sm text-muted">Paste any URL and discover every technology behind it.</p>
            <div className="mx-auto mt-8 max-w-xl">
              <SearchBar />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {['No signup required', '2,300+ rules', 'Instant results'].map((f) => (
                <span key={f} className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-muted">
                  <span className="h-1 w-1 rounded-full bg-accent/60" />
                  {f}
                </span>
              ))}
            </div>
          </FadeIn>
        </section>

      </main>

      <Footer />

      {/* Live Status Bar */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-white/[0.04] bg-zinc-950/70 px-6 py-2.5 backdrop-blur-xl">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">System online</span>
        <span className="ml-auto"><LiveClock /></span>
      </div>
    </div>
  );
}
