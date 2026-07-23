'use client';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import HistoryList from '../components/HistoryList';
import PopularScans from '../components/PopularScans';
import LiveScanPreview from '../components/LiveScanPreview';
import FloatingLogos from '../components/FloatingLogos';
import CategoryGrid from '../components/CategoryGrid';
import TerminalScanner from '../components/TerminalScanner';
import ComparePreview from '../components/ComparePreview';
import MouseGlow from '../components/MouseGlow';
import useInView from '../lib/useInView';

const EXAMPLE_SITES = [
  { label: 'github.com', desc: 'Dev platform' },
  { label: 'stripe.com', desc: 'Payments' },
  { label: 'vercel.com', desc: 'Hosting' },
  { label: 'shopify.com', desc: 'E-commerce' },
  { label: 'netflix.com', desc: 'Streaming' },
];

const STEPS = [
  {
    n: '01',
    title: 'Fetch',
    tag: 'HTTP client',
    body: 'Downloads the full HTML with a configurable timeout. No browser overhead.',
    stats: '2.4kb avg · 8s timeout',
  },
  {
    n: '02',
    title: 'Parse',
    tag: 'DOM analysis',
    body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.',
    stats: '50+ signals · 800ms',
  },
  {
    n: '03',
    title: 'Match',
    tag: 'rule engine',
    body: '2,300+ rules fingerprint each technology from the exact HTML signal.',
    stats: '92 categories · 2,300+ rules',
  },
];

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref} className="counter-number">{count}{suffix}</span>;
}

function DataTicker() {
  const TECH_NAMES = [
    'React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Vercel', 'Cloudflare',
    'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'Prisma', 'Stripe', 'AWS', 'Supabase',
  ];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-5 overflow-hidden opacity-[0.5]">
      <div className="animate-ticker-scroll inline-flex gap-12 py-1">
        {[...TECH_NAMES, ...TECH_NAMES].map((name, i) => (
          <span key={i} className="font-mono text-[10px] uppercase tracking-[0.15em] text-fg/60">
            {name}
            <span className="ml-2 inline-block h-1 w-1 rounded-full bg-accent/30" />
          </span>
        ))}
      </div>
    </div>
  );
}

function LiveBar() {
  const [time, setTime] = useState('');
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-white/[0.04] bg-zinc-950/70 px-6 py-2.5 backdrop-blur-xl">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">System online</span>
        <span className="ml-auto font-mono text-[10px] text-faint">{time}</span>
    </div>
  );
}

function StatCard({ label, value, suffix = '', icon }) {
  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.015] px-4 py-5 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.025]">
      <div className="flex items-center gap-2">
        {icon && (
          <svg className="h-4 w-4 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        )}
        {value !== undefined ? (
          <div className="font-mono text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            <AnimatedCounter end={value} suffix={suffix} />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 font-mono text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-[11px] uppercase tracking-[0.12em] text-faint">{label}</div>
    </div>
  );
}

function SpotlightCard({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);
  return <div ref={ref} className="spotlight-card relative overflow-hidden rounded-2xl">{children}</div>;
}

function StepCard({ step, index }) {
  const tiltRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sectionRef, inView] = useInView({ threshold: 0.2 });
  const onMove = (e) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTilt({
      x: -((e.clientY - rect.top) / rect.height - 0.5) * 6,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 6,
    });
  };
  return (
    <div ref={sectionRef} className={inView ? 'animate-fade-in-view' : 'opacity-0'} style={{ animationDelay: `${index * 0.12}s` }}>
      <SpotlightCard>
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/30 p-[1px] backdrop-blur-sm">
          <div
            ref={tiltRef}
            className="card-shimmer rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] will-change-transform sm:px-5 sm:py-5"
            style={{
              transform: hovered ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'perspective(600px) rotateX(0deg) rotateY(0deg)',
              transition: hovered ? 'transform 0.08s cubic-bezier(0.32, 0.72, 0, 1)' : 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            onMouseMove={onMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
          >
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 font-mono text-xs font-bold text-accent shadow-[inset_0_1px_0_rgba(197,251,69,0.15),0_4px_12px_-2px_rgba(197,251,69,0.15)]">
                {step.n}
              </div>
              <div className="min-w-0 flex-1">
                <span className="rounded-full border border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-accent">
                  {step.tag}
                </span>
                <h3 className="mt-2 text-sm font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.body}</p>
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
        </div>
      </SpotlightCard>
    </div>
  );
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={inView ? `animate-fade-in-view ${className}` : `opacity-0 ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function TypewriterBadge() {
  const text = 'Live scanning \u00b7 v1.0';
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="font-mono uppercase tracking-[0.2em] text-faint">
      {displayed}<span className="typewriter-cursor" />
    </span>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Header />
      <MouseGlow />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="light-bg-art"><div className="art-blob" /><div className="art-blob" /><div className="art-blob" /></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.02] via-transparent to-transparent" />
        <div className="scan-line" />
        <DataTicker />
        <FloatingLogos />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-20 sm:px-8 sm:pt-24 lg:px-12 lg:pt-28">

        {/* ─── Hero ─── */}
        <section className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:gap-12">
          {/* Left: Copy + Search */}
          <div className="w-full space-y-3 lg:flex-1">
            <AnimatedSection delay={0}>
              <div className="glass-panel inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs text-muted">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <TypewriterBadge />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.06}>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tighter sm:text-5xl lg:text-[3.5rem]">
                What&apos;s it
                <br />
                <span className="relative inline-block">
                  <span className="gradient-text-animated">built with</span>
                  <span className="absolute -bottom-0.5 left-0 h-[3px] w-full rounded-full bg-accent/30 sm:-bottom-1" />
                </span>
                <span className="text-muted">?</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.12}>
              <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Enter any URL and fingerprint the technologies powering it —
                frameworks, CMS, analytics, hosting, and more.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.18}>
              <SearchBar />
            </AnimatedSection>

            <AnimatedSection delay={0.24}>
              <div className="flex flex-wrap items-center gap-2">
                {EXAMPLE_SITES.map((site) => (
                  <a
                    key={site.label}
                    href={`/results?site=${encodeURIComponent(site.label)}`}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-300 hover:border-accent/20 hover:bg-accent/[0.03] hover:shadow-[0_2px_12px_-2px_rgba(197,251,69,0.1)] active:scale-[0.97]"
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
            </AnimatedSection>
          </div>

          {/* Right: Live scan preview (desktop only) */}
          <AnimatedSection delay={0.3} className="hidden shrink-0 lg:block lg:w-[42%]">
            <LiveScanPreview />
          </AnimatedSection>
        </section>

        {/* ─── Stats ─── */}
        <AnimatedSection delay={0.2} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Detection rules" value={2300} suffix="+" icon="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            <StatCard label="Categories" value={92} icon="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            <StatCard label="Avg scan time" value={2} suffix="s" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            <StatCard label="No signup" icon="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
          </div>
        </AnimatedSection>

        {/* ─── Use Cases ─── */}
        <AnimatedSection delay={0.1} className="mt-12 sm:mt-16">
          <div className="mb-6">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
              Use cases
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for <span className="gradient-text-animated">real workflows</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', accent: false },
              { title: 'Competitive research', desc: 'Compare tech choices across similar products in your market.', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', accent: false },
              { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a platform.', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z', accent: true },
              { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own or monitor.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z', accent: false },
              { title: 'Team onboarding', desc: 'Get new engineers up to speed on a codebase\'s external dependencies.', icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z', accent: false },
            ].map((useCase, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition-all duration-300 hover-glow ${
                  useCase.accent
                    ? 'border-accent/10 bg-accent/[0.02] sm:col-span-2 sm:row-span-1'
                    : 'hover:border-white/[0.1] hover:bg-white/[0.03]'
                }`}
              >
                <div className="relative z-10">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${
                    useCase.accent
                      ? 'border border-accent/20 bg-accent/10 text-accent'
                      : 'border border-white/[0.06] bg-white/[0.03] text-muted group-hover:border-accent/15 group-hover:text-accent'
                  }`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={useCase.icon} />
                    </svg>
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-fg/90 transition-colors group-hover:text-fg">{useCase.title}</h3>
                  <p className="text-xs leading-relaxed text-muted">{useCase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* ─── How it works + Terminal ─── */}
        <section className="mt-12 sm:mt-16">
          <AnimatedSection delay={0}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                  Pipeline
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How the <span className="gradient-text-animated">engine works</span>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                Three stages transform raw HTML into a structured technology report.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-4 lg:grid-cols-5">
            {/* Steps: 3 cols */}
            <div className="space-y-4 lg:col-span-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4">
              {STEPS.map((step, i) => (
                <StepCard key={step.n} step={step} index={i} />
              ))}
            </div>
            {/* Terminal scanner: 2 cols */}
            <AnimatedSection delay={0.2} className="lg:col-span-2">
              <TerminalScanner />
            </AnimatedSection>
          </div>
        </section>

        {/* ─── Compare Preview ─── */}
        <AnimatedSection delay={0.1} className="mt-12 sm:mt-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                Compare
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Side by side <span className="gradient-text-animated">comparison</span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Compare tech stacks across multiple sites. See what platforms share and where they differ.
              </p>
              <a
                href="/compare"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-muted transition-all hover:border-accent/20 hover:text-fg press-tactile"
              >
                Try it live
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <ComparePreview />
          </div>
        </AnimatedSection>

        {/* ─── What we detect ─── */}
        <AnimatedSection delay={0.1} className="mt-12 sm:mt-16">
          <CategoryGrid />
        </AnimatedSection>

        {/* ─── Export & Share ─── */}
        <AnimatedSection delay={0.1} className="mt-12 sm:mt-16">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                Export
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Share your <span className="gradient-text-animated">findings</span>
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
            <div className="flex items-center justify-center">
              <div className="glass-panel rounded-2xl p-6 text-center">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-faint">Badge preview</div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5 shadow-[0_4px_16px_-4px_rgba(197,251,69,0.15)]">
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7l8-4 8 4-8 4-8-4z" />
                  </svg>
                  <span className="font-sans text-sm font-semibold text-fg">github.com</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">medium</span>
                </div>
                <div className="mt-3 font-mono text-[10px] text-faint">
                  Embed this badge in your README or site
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ─── Scans + History ─── */}
        <section className="mt-12 sm:mt-16">
          <AnimatedSection delay={0.1}>
            <PopularScans />
          </AnimatedSection>
          <AnimatedSection delay={0.15} className="mt-6">
            <HistoryList />
          </AnimatedSection>
        </section>

      </main>

      <LiveBar />
      <Footer />
    </div>
  );
}
