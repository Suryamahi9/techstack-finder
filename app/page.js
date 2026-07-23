'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import LiveScanPreview from '../components/LiveScanPreview';
import TerminalScanner from '../components/TerminalScanner';
import MouseGlow from '../components/MouseGlow';
import FloatingLogos from '../components/FloatingLogos';
import CategoryGrid from '../components/CategoryGrid';
import useInView from '../lib/useInView';

const EXAMPLE_SITES = ['github.com', 'stripe.com', 'vercel.com', 'shopify.com', 'netflix.com'];

const STEPS = [
  { n: '01', title: 'FETCH', tag: 'HTTP client', body: 'Downloads the full HTML with a configurable timeout. No browser overhead.', stats: '2.4kb avg \u00b7 8s timeout' },
  { n: '02', title: 'PARSE', tag: 'DOM analysis', body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.', stats: '50+ signals \u00b7 800ms' },
  { n: '03', title: 'MATCH', tag: 'rule engine', body: '2,300+ rules fingerprint each technology from the exact HTML signal.', stats: '92 categories \u00b7 2,300+ rules' },
];

const USE_CASES = [
  { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'Competitive research', desc: 'Compare tech choices across similar products in your space.', icon: 'M3 3v18h18M7 16l4-8 4 4 4-10' },
  { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a partnership.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', accent: true },
  { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own over time.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { title: 'Team onboarding', desc: 'Get new engineers up to speed on the dependencies and stack.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { title: 'API discovery', desc: 'Map third-party integrations across any website or application.', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

const BADGE_TECHS = ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Stripe', 'Vercel', 'PostgreSQL'];

function ConstellationCanvas() {
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const COUNT = 50;
    const PROXIMITY = 120;
    dotsRef.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));

    const onResize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const dots = dotsRef.current;
      for (let i = 0; i < COUNT; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(244,244,238,0.12)';
        ctx.fill();
      }
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < PROXIMITY) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(244,244,238,${0.06 * (1 - dist / PROXIMITY)})`;
            ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ willChange: 'transform' }} />;
}

function FadeSection({ children, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div ref={ref} className={inView ? 'animate-fade-in-view' : 'opacity-0'} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
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
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{text}<span className="animate-pulse ml-0.5">|</span></span>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);
  return <span className="font-mono text-[11px] text-faint">{time}</span>;
}

const STAT_SVGS = [
  'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
];

function StatCell({ icon, value, suffix, label, isText }) {
  return (
    <div className="bg-[#0a0a0e] p-6 flex flex-col items-center text-center">
      <svg className="h-4 w-4 text-accent/60 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <div className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-fg">
        {isText ? value : <AnimatedCounter end={value} suffix={suffix || ''} />}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint mt-2">{label}</div>
    </div>
  );
}

function UseCaseCard({ useCase, idx }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  return (
    <div ref={ref} className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[1px] transition-all duration-300 hover:border-accent/15 hover:scale-[1.01] ${inView ? 'animate-fade-in-view' : 'opacity-0'}`} style={{ animationDelay: `${idx * 0.08}s` }}>
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5">
        <div className={`h-10 w-10 rounded-xl border ${useCase.accent ? 'border-accent/20 bg-accent/10' : 'border-white/[0.06] bg-white/[0.03]'} flex items-center justify-center`}>
          <svg className={`h-5 w-5 ${useCase.accent ? 'text-accent' : 'text-fg/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d={useCase.icon} />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-fg/90 mt-3">{useCase.title}</h3>
        <p className="text-xs leading-relaxed text-muted mt-1.5">{useCase.desc}</p>
      </div>
    </div>
  );
}

function ComparisonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[1px]">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <img src="https://www.google.com/s2/favicons?domain=github.com&sz=32" alt="" className="h-4 w-4 rounded-sm" />
            </div>
            <span className="font-mono text-xs text-fg/80">github.com</span>
          </div>
          <span className="text-[10px] font-mono text-accent/60 border border-accent/10 bg-accent/5 rounded-full px-2 py-0.5">vs</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-fg/80">gitlab.com</span>
            <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
              <img src="https://www.google.com/s2/favicons?domain=gitlab.com&sz=32" alt="" className="h-4 w-4 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {['React', 'Ruby on Rails', 'PostgreSQL'].map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
              <span className="text-fg/70">{t}</span>
              <span className="ml-auto font-mono text-[10px] text-accent/60">shared</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
          <span className="font-mono text-[10px] text-faint">3 shared technologies</span>
          <span className="font-mono text-[10px] text-accent/80">View full compare &rarr;</span>
        </div>
      </div>
    </div>
  );
}

function BadgePreviewCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[1px]">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 flex flex-col items-center">
        <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <img src="https://www.google.com/s2/favicons?domain=stripe.com&sz=32" alt="" className="h-4 w-4 rounded-sm" />
              <span className="font-mono text-sm text-fg truncate">stripe.com</span>
            </div>
            <div className="font-mono text-[10px] text-faint mt-0.5">12 technologies detected</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
          {BADGE_TECHS.map((t) => (
            <span key={t} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-muted">{t}</span>
          ))}
          <span className="rounded-full border border-accent/10 bg-accent/5 px-2.5 py-1 font-mono text-[10px] text-accent/70">+5 more</span>
        </div>
        <div className="mt-4 w-full grid grid-cols-3 gap-3">
          {[
            { label: 'Frontend', val: '4' },
            { label: 'Backend', val: '3' },
            { label: 'Infra', val: '5' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-2.5 text-center">
              <div className="font-mono text-lg font-bold text-fg">{s.val}</div>
              <div className="font-mono text-[9px] uppercase tracking-wider text-faint mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <ConstellationCanvas />
      <MouseGlow />
      <Header />

      <main className="relative z-10">
        {/* HERO */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <FloatingLogos />
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 max-w-4xl mx-auto lg:mx-0">
                <FadeSection>
                  <TypewriterBadge />
                </FadeSection>

                <FadeSection delay={0.1}>
                  <h1 className="mt-6 text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.9] text-fg">
                    What&apos;s it<br />
                    <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">built with?</span>
                  </h1>
                </FadeSection>

                <FadeSection delay={0.2}>
                  <p className="mt-5 max-w-lg text-sm md:text-base text-muted leading-relaxed">
                    Instantly detect every technology powering any website. No signup, no wait.
                  </p>
                </FadeSection>

                <FadeSection delay={0.3}>
                  <div className="mt-8 max-w-xl">
                    <SearchBar />
                  </div>
                </FadeSection>

                <FadeSection delay={0.4}>
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {EXAMPLE_SITES.map((site) => (
                      <button key={site} className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-300 hover:border-accent/20 hover:bg-accent/[0.03] active:scale-[0.97]">
                        <img src={`https://www.google.com/s2/favicons?domain=${site}&sz=32`} alt="" className="h-4 w-4 rounded-sm" />
                        <span className="font-mono text-xs text-muted group-hover:text-fg transition-colors">{site}</span>
                        <span className="text-[10px] text-faint group-hover:text-accent/60 transition-colors">&rarr;</span>
                      </button>
                    ))}
                  </div>
                </FadeSection>
              </div>

              <div className="hidden lg:block w-[360px] flex-shrink-0">
                <FadeSection delay={0.5}>
                  <LiveScanPreview />
                </FadeSection>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <FadeSection>
          <section className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/[0.06] rounded-2xl overflow-hidden">
              <StatCell icon={STAT_SVGS[0]} value={2300} suffix="+" label="Detection rules" />
              <StatCell icon={STAT_SVGS[1]} value={92} label="Categories" />
              <StatCell icon={STAT_SVGS[2]} value={2} suffix="s" label="Avg scan time" />
              <StatCell icon={STAT_SVGS[3]} value="No signup" label="Required" isText />
            </div>
          </section>
        </FadeSection>

        {/* USE CASES */}
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <FadeSection>
            <div className="mb-10">
              <div className="mb-2 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint">[ USE CASES ]</div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Built for <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">real workflows</span></h2>
              <p className="mt-2 max-w-lg text-sm text-muted">Whether you&apos;re auditing security or researching competitors, TechStack Finder gives you the data you need in seconds.</p>
            </div>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USE_CASES.map((uc, i) => <UseCaseCard key={uc.title} useCase={uc} idx={i} />)}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <FadeSection>
            <div className="mb-10">
              <div className="mb-2 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint">[ HOW IT WORKS ]</div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Three steps. <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">Zero guesswork.</span></h2>
            </div>
          </FadeSection>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-3">
              {STEPS.map((step, i) => (
                <FadeSection key={step.n} delay={i * 0.1}>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-[1px] transition-all duration-300 hover:border-accent/15">
                    <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 flex items-start gap-4">
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        <div className="h-9 w-9 rounded-xl border border-accent/20 bg-accent/10 flex items-center justify-center font-mono text-xs font-bold text-accent">{step.n}</div>
                        <span className="rounded-full border border-accent/10 bg-accent/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.15em] text-accent">{step.tag}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-fg">{step.title}</h3>
                        <p className="text-xs leading-relaxed text-muted mt-1">{step.body}</p>
                        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-faint">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {step.stats}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
            <div className="lg:col-span-2">
              <FadeSection delay={0.2}>
                <TerminalScanner />
              </FadeSection>
            </div>
          </div>
        </section>

        {/* COMPARISON */}
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <FadeSection>
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint">[ COMPARE ]</div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Side by side <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">comparison</span></h2>
                <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">Compare the tech stacks of two websites. See shared technologies and unique choices at a glance.</p>
                <a href="/compare" className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-all duration-300 hover:bg-accent/20 active:scale-[0.97]">
                  Try comparison
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </a>
              </div>
            </FadeSection>
            <FadeSection delay={0.15}>
              <ComparisonCard />
            </FadeSection>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <FadeSection>
            <CategoryGrid />
          </FadeSection>
        </section>

        {/* EXPORT & SHARE */}
        <section className="max-w-7xl mx-auto px-6 mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <FadeSection>
              <div>
                <div className="mb-2 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint">[ EXPORT ]</div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Share your <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">findings</span></h2>
                <p className="mt-3 max-w-md text-sm text-muted leading-relaxed">Export scan results as JSON, CSV, or PDF. Embed a live badge on your site to show what powers it.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['JSON', 'CSV', 'PDF', 'Badge'].map((fmt) => (
                    <span key={fmt} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">{fmt}</span>
                  ))}
                </div>
              </div>
            </FadeSection>
            <FadeSection delay={0.15}>
              <BadgePreviewCard />
            </FadeSection>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="max-w-3xl mx-auto px-6 mt-32 mb-20 text-center">
          <FadeSection>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Start <span className="bg-gradient-to-r from-accent via-accent to-accent/40 bg-clip-text text-transparent">scanning</span>
            </h2>
            <p className="mt-3 text-sm text-muted">Paste any URL and discover every technology behind it.</p>
            <div className="mt-8 max-w-xl mx-auto">
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
          </FadeSection>
        </section>
      </main>

      <Footer />

      {/* LIVE STATUS BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-white/[0.04] bg-zinc-950/80 backdrop-blur-xl px-6 py-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] text-faint">System online</span>
        <span className="ml-auto"><LiveClock /></span>
      </div>
    </div>
  );
}
