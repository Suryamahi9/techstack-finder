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
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-white/[0.04] bg-zinc-950/60 px-6 py-2 backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">System online</span>
      <span className="ml-auto font-mono text-[10px] text-faint">{time}</span>
    </div>
  );
}

function StatCard({ label, value, suffix = '' }) {
  return (
    <div className="text-center">
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
      <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-faint">{label}</div>
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
      x: -((e.clientY - rect.top) / rect.height - 0.5) * 8,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 8,
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
              <div className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 font-mono text-xs text-accent shadow-[inset_0_1px_0_rgba(197,251,69,0.15)]">
                {step.n}
              </div>
              <div className="min-w-0 flex-1">
                <span className="rounded-full border border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-accent">
                  {step.tag}
                </span>
                <h3 className="mt-1.5 text-sm font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-faint">
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
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
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
            </AnimatedSection>
          </div>

          {/* Right: Live scan preview (desktop only) */}
          <AnimatedSection delay={0.3} className="hidden shrink-0 lg:block lg:w-[42%]">
            <LiveScanPreview />
          </AnimatedSection>
        </section>

        {/* ─── Stats ─── */}
        <AnimatedSection delay={0.2} className="mt-10 sm:mt-14">
          <div className="grid grid-cols-2 gap-4 border-y border-white/[0.04] py-5 sm:grid-cols-4">
            <StatCard label="Detection rules" value={2300} suffix="+" />
            <StatCard label="Categories" value={92} />
            <StatCard label="Avg scan time" value={2} suffix="s" />
            <StatCard label="No signup" />
          </div>
        </AnimatedSection>

        {/* ─── Use Cases ─── */}
        <AnimatedSection delay={0.1} className="mt-12 sm:mt-16">
          <div className="mb-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
              Use cases
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for <span className="gradient-text-animated">real workflows</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
            {[
              { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              { title: 'Competitive research', desc: 'Compare tech choices across similar products in your market.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a platform.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own or monitor.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
            ].map((useCase, i) => (
              <div
                key={i}
                className="card-hover group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 transition-all duration-300 hover:border-accent/15 hover:bg-accent/[0.03]"
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] transition-colors group-hover:border-accent/20 group-hover:bg-accent/[0.06]">
                  <svg className="h-4 w-4 text-muted transition-colors group-hover:text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={useCase.icon} />
                  </svg>
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-fg/90 transition-colors group-hover:text-accent">{useCase.title}</h3>
                <p className="text-xs leading-relaxed text-muted">{useCase.desc}</p>
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
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-muted transition-all hover:border-accent/20 hover:text-fg"
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
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted">JSON export</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted">CSV export</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted">PDF report</span>
                <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-muted">Embed badge</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-faint">Badge preview</div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5">
                  <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7l8-4 8 4-8 4-8-4z" />
                  </svg>
                  <span className="font-sans text-sm font-semibold text-fg">github.com</span>
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[10px] font-bold text-accent">medium</span>
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
