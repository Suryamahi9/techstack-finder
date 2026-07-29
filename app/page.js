'use client';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import TerminalScanner from '../components/TerminalScanner';
import MouseGlow from '../components/MouseGlow';
import FloatingLogos from '../components/FloatingLogos';
import CategoryGrid from '../components/CategoryGrid';
import OnboardingTour from '../components/OnboardingTour';
import useInView from '../lib/useInView';

const SITES = [
  { label: 'github.com', desc: 'Dev platform' },
  { label: 'stripe.com', desc: 'Payments' },
  { label: 'vercel.com', desc: 'Hosting' },
  { label: 'shopify.com', desc: 'E-commerce' },
  { label: 'netflix.com', desc: 'Streaming' },
];

const STEPS = [
  { n: '01', title: 'Fetch', tag: 'HTTP client', body: 'Downloads the full HTML with a configurable timeout.', stats: '2.4kb avg · 8s timeout' },
  { n: '02', title: 'Parse', tag: 'DOM analysis', body: 'Extracts scripts, meta tags, headers, and CSS from the document tree.', stats: '50+ signals · 800ms' },
  { n: '03', title: 'Match', tag: 'rule engine', body: '2,300+ rules fingerprint each technology from the exact HTML signal.', stats: '92 categories · 2,300+ rules' },
];

const USE_CASES = [
  { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your entire stack.', icon: 'shield' },
  { title: 'Competitive research', desc: 'Compare tech choices across similar products in your space.', icon: 'chart' },
  { title: 'Vendor due diligence', desc: 'Validate a potential vendor stack before committing to a partnership.', icon: 'check' },
  { title: 'Portfolio tracking', desc: 'Track technology changes across the sites you own over time.', icon: 'eye' },
  { title: 'Team onboarding', desc: 'Get new engineers up to speed on the stack in minutes, not days.', icon: 'users' },
  { title: 'API discovery', desc: 'Map third-party integrations across any website or application.', icon: 'code' },
];

const ICONS = {
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  chart: 'M3 3v18h18M7 16l4-8 4 4 4-10',
  check: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  users: 'M12 2l-5 5v3h10V7l-5-5zM4 22v-4a4 4 0 014-4h8a4 4 0 014 4v4M12 12a4 4 0 110-8 4 4 0 010 8z',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
};

function FadeIn({ children, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
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
  const full = 'Live scanning · v1.0';
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= full.length) { setText(full.slice(0, i)); i++; } else clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
        {text}<span className="ml-px animate-pulse text-accent">|</span>
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

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
        <div className="scan-line" />
        <FloatingLogos />
      </div>

      <main id="main-content" className="relative z-10">

        {/* ═══════════ HERO ═══════════ */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-28 pb-20 text-center sm:pt-36">
          <FadeIn>
            <TypewriterBadge />
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tighter sm:text-5xl lg:text-[5rem]">
              What&apos;s it<br />
              <span className="text-fg">built with</span><span className="text-muted">?</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              Enter any URL and fingerprint the technologies powering it &mdash;
              frameworks, CMS, analytics, hosting, and more.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
          </FadeIn>
          <FadeIn delay={0.32}>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SITES.map((site) => (
                <a
                  key={site.label}
                  href={`/results?site=${encodeURIComponent(site.label)}`}
                  className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] active:scale-[0.97]"
                >
                  <img src={`https://www.google.com/s2/favicons?domain=${site.label}&sz=32`} alt="" className="h-3.5 w-3.5 rounded-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  <span className="font-mono text-xs text-muted transition-colors group-hover:text-fg">{site.label}</span>
                  <svg className="h-2.5 w-2.5 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </div>
          </FadeIn>
        </section>

        {/* ═══════════ STATS ═══════════ */}
        <FadeIn>
          <section className="mx-auto max-w-5xl px-6 pb-8">
            <div className="grid grid-cols-2 divide-x divide-white/[0.06] border-y border-white/[0.06] sm:grid-cols-4">
              {[
                { value: 2300, suffix: '+', label: 'Detection rules' },
                { value: 92, label: 'Categories' },
                { value: 2, suffix: 's', label: 'Avg scan time' },
                { label: 'No signup', check: true },
              ].map((stat, i) => (
                <div key={i} className="px-6 py-5 text-left">
                  <div className="font-mono text-xl font-bold tracking-tight text-fg sm:text-2xl">
                    {stat.value !== undefined ? <Counter end={stat.value} suffix={stat.suffix || ''} /> : (
                      <svg className="h-5 w-5 text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-faint">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* ═══════════ USE CASES ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-16 sm:pt-24">
          <FadeIn>
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for real workflows
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                From security audits to competitive research — the tools your team needs.
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc, i) => (
              <FadeIn key={uc.title} delay={i * 0.04}>
                <div className="group bg-[#0a0a0e] px-6 py-6 transition-colors hover:bg-[#0d0d11]">
                  <svg className="mb-3 h-5 w-5 text-muted transition-colors group-hover:text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={ICONS[uc.icon]} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3 className="mb-1.5 text-sm font-semibold text-fg/80 transition-colors group-hover:text-fg">{uc.title}</h3>
                  <p className="text-xs leading-relaxed text-muted">{uc.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-16 sm:pt-24">
          <FadeIn>
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How the engine works
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                Three stages from URL to a full technology profile.
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              {STEPS.map((step, i) => (
                <FadeIn key={step.n} delay={i * 0.08}>
                  <div className="flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/[0.1]">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] font-mono text-xs font-semibold text-faint">
                      {step.n}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-fg/90">{step.title}</h3>
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-faint">{step.tag}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
                      <div className="mt-2 font-mono text-[10px] text-faint">{step.stats}</div>
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
        <section className="mx-auto max-w-7xl px-6 pt-16 sm:pt-24">
          <FadeIn>
            <CategoryGrid />
          </FadeIn>
        </section>

        {/* ═══════════ EXPORT ═══════════ */}
        <section className="mx-auto max-w-7xl px-6 pt-16 sm:pt-24">
          <div className="grid gap-8 lg:grid-cols-2">
            <FadeIn>
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Share your findings
                </h2>
                <p className="mt-2 max-w-md text-sm text-muted">
                  Export reports as JSON or CSV. Generate PDFs. Embed a live badge on your site or README.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['JSON export', 'CSV export', 'PDF report', 'Embed badge'].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-muted transition-colors hover:border-white/[0.12] hover:text-fg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="flex items-center justify-center">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-faint">Badge preview</div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2">
                    <svg className="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 7l8-4 8 4-8 4-8-4z" />
                    </svg>
                    <span className="font-sans text-sm font-semibold text-fg/90">github.com</span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold text-fg">12 techs</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════ BOTTOM CTA ═══════════ */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center sm:pt-36">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Start scanning
            </h2>
            <p className="mt-3 text-sm text-muted">Paste any URL and discover every technology behind it.</p>
            <div className="mx-auto mt-8 max-w-xl">
              <SearchBar />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {['No signup required', '2,300+ rules', 'Instant results'].map((f) => (
                <span key={f} className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] text-muted">
                  <span className="h-1 w-1 rounded-full bg-accent/60" />
                  {f}
                </span>
              ))}
            </div>
          </FadeIn>
        </section>

        <OnboardingTour />
      </main>

      <Footer />

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
