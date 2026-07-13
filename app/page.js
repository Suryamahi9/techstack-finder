'use client';
import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import HistoryList from '../components/HistoryList';
import PopularScans from '../components/PopularScans';
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
    body: 'Downloads the full HTML with a configurable timeout. No browser overhead — just raw, server-side extraction.',
    stats: '2.4kb avg · 8s timeout · no CORS',
  },
  {
    n: '02',
    title: 'Parse',
    tag: 'DOM analysis',
    body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS classes into a structured corpus.',
    stats: '50+ signals · 800ms parse',
  },
  {
    n: '03',
    title: 'Match',
    tag: 'rule engine',
    body: 'A 2,300+ rule engine fingerprints each technology and logs the exact HTML signal that triggered the match.',
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

  return (
    <span ref={ref} className="counter-number">
      {count}{suffix}
    </span>
  );
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
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-white/[0.04] bg-black/60 px-6 py-2 backdrop-blur-md">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        System online
      </span>
      <span className="ml-auto font-mono text-[10px] text-faint">
        {time}
      </span>
    </div>
  );
}

function ScannerRadar() {
  return (
    <div className="relative flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
      <div className="absolute inset-2 rounded-full bg-accent/[0.02] blur-2xl" />
      <div className="pulse-ring" />
      <div className="pulse-ring" style={{ animationDelay: '0.6s' }} />
      <div className="pulse-ring" style={{ animationDelay: '1.2s' }} />
      <div className="scanner-ring animate-sweep-rotate" style={{ animationDuration: '10s' }} />
      <div className="scanner-ring" style={{ animation: 'sweepRotate 7s linear infinite reverse' }} />
      <div className="scanner-sweep animate-sweep-rotate" />
      <div className="relative z-10 flex h-3.5 w-3.5 items-center justify-center">
        <div className="h-3.5 w-3.5 rounded-full border border-accent/50 bg-accent shadow-[inset_0_1.5px_0_rgba(0,0,0,0.3)]" />
      </div>
      <svg className="absolute h-[88%] w-[88%] animate-sweep-rotate" viewBox="0 0 100 100" style={{ animationDuration: '18s' }}>
        <defs>
          <path id="ringPath" d="M 50 5 A 45 45 0 1 1 49.99 5" fill="none" />
        </defs>
        <text className="fill-current text-fg/40 text-[5px] font-mono tracking-[0.4em]">
          <textPath href="#ringPath" startOffset="0%">MONITORING · ANALYZING · DETECTING ·</textPath>
        </text>
      </svg>
    </div>
  );
}

function StatCard({ label, value, suffix = '' }) {
  return (
    <div className="text-center">
      <div className="font-mono text-2xl font-bold tracking-tight text-fg sm:text-3xl">
        <AnimatedCounter end={value} suffix={suffix} />
      </div>
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
        <div className="rounded-2xl border border-white/[0.06] bg-black/30 p-[1px] backdrop-blur-sm">
          <div
            ref={tiltRef}
            className="card-shimmer rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] will-change-transform sm:px-6 sm:py-6"
            style={{
              transform: hovered ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'perspective(600px) rotateX(0deg) rotateY(0deg)',
              transition: hovered ? 'transform 0.08s cubic-bezier(0.32, 0.72, 0, 1)' : 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            onMouseMove={onMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
          >
            <div className="flex items-start gap-3">
              <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 font-mono text-xs text-accent shadow-[inset_0_1px_0_rgba(197,251,69,0.15)]">
                {step.n}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-accent">
                    {step.tag}
                  </span>
                </div>
                <h3 className="mt-2 text-sm font-semibold tracking-tight sm:text-base">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.1em] text-faint">
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

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="light-bg-art"><div className="art-blob" /><div className="art-blob" /><div className="art-blob" /></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.02] via-transparent to-transparent" />
        <div className="scan-line" />
        <DataTicker />
        <div className="glow-orb h-[500px] w-[500px] animate-orb-drift-1" style={{ top: '-100px', left: '50%', background: 'var(--accent)', opacity: 0.04 }} />
        <div className="glow-orb h-[300px] w-[300px] animate-orb-drift-2" style={{ bottom: '-50px', right: '10%', background: 'var(--accent)', opacity: 0.025 }} />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-40 sm:px-6 sm:pt-32 lg:pt-40">

        {/* ─── Hero ─── */}
        <section className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Left: Copy + Search */}
          <div className="w-full space-y-5 lg:flex-1">
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-muted backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-glow rounded-full bg-accent" />
                </span>
                <TypewriterBadge />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.06}>
              <h1 className="text-4xl font-bold leading-[1.0] tracking-tighter sm:text-6xl lg:text-7xl">
                What&apos;s it
                <br />
                <span className="relative">
                  <span className="text-accent">built with</span>
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-accent/30 sm:-bottom-1.5" />
                </span>
                <span className="text-muted">?</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.12}>
              <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                Enter any URL and fingerprint the technologies powering it —
                frameworks, CMS, analytics, hosting, and more.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.18}>
              <div className="w-full">
                <SearchBar />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.24}>
              <div className="flex flex-wrap items-center gap-2">
                {EXAMPLE_SITES.map((site) => (
                  <a
                    key={site.label}
                    href={`/results?site=${encodeURIComponent(site.label)}`}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-sm transition-all duration-300 hover:border-accent/20 hover:bg-accent/[0.03] active:scale-[0.97]"
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

          {/* Right: Radar (desktop only) */}
          <AnimatedSection delay={0.3} className="hidden shrink-0 items-center justify-center lg:flex">
            <ScannerRadar />
          </AnimatedSection>
        </section>

        {/* ─── Stats ─── */}
        <AnimatedSection delay={0.2} className="mt-16 sm:mt-20">
          <div className="grid grid-cols-3 gap-4 border-y border-white/[0.04] py-8">
            <StatCard label="Detection rules" value={2300} suffix="+" />
            <StatCard label="Categories" value={92} />
            <StatCard label="Avg scan time" value={2} suffix="s" />
          </div>
        </AnimatedSection>

        {/* ─── How it works ─── */}
        <section className="mt-20 sm:mt-28">
          <AnimatedSection delay={0}>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
                  Pipeline
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  How the <span className="text-accent">engine works</span>
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted">
                Three stages transform raw HTML into a structured technology report.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <StepCard key={step.n} step={step} index={i} />
            ))}
          </div>
        </section>

        {/* ─── Scans + History ─── */}
        <section className="mt-20 sm:mt-28">
          <AnimatedSection delay={0.1}>
            <PopularScans />
          </AnimatedSection>
          <AnimatedSection delay={0.15} className="mt-8">
            <HistoryList />
          </AnimatedSection>
        </section>

      </main>

      <LiveBar />
      <Footer />
    </div>
  );
}
