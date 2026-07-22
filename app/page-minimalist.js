'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import useInView from '../lib/useInView';

const EXAMPLE_SITES = [
  'github.com', 'stripe.com', 'vercel.com', 'shopify.com', 'netflix.com',
];

const STEPS = [
  {
    n: '01',
    title: 'Fetch',
    body: 'Downloads the full HTML with a configurable timeout. No browser overhead.',
    stats: '2.4kb avg · 8s timeout',
  },
  {
    n: '02',
    title: 'Parse',
    body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.',
    stats: '50+ signals · 800ms',
  },
  {
    n: '03',
    title: 'Match',
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
  return <span ref={ref}>{count}{suffix}</span>;
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
    <span className="font-mono text-xs uppercase tracking-[0.15em]" style={{ color: '#A8A8A4' }}>
      {displayed}<span className="inline-block w-[1px] h-[1em] ml-0.5 align-middle" style={{ backgroundColor: '#A8A8A4', animation: 'blink 1s step-end infinite' }} />
    </span>
  );
}

function FadeIn({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: '#FBFBFA', minHeight: '100dvh' }} className="relative overflow-x-hidden">
      <style>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes driftBlob {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(40px, -30px) scale(1.05); }
          66%  { transform: translate(-20px, 20px) scale(0.97); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes terminalPulse {
          0%   { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>

      <Header />

      {/* Background blob */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 0, opacity: 0.03 }}
      >
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '25%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #D4C5B9 0%, transparent 70%)',
            animation: 'driftBlob 30s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <main className="relative" style={{ zIndex: 1 }}>

        {/* ─── Hero ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div className="mx-auto" style={{ maxWidth: '64rem' }}>
            <FadeIn delay={0}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', borderRadius: '4px', backgroundColor: '#E1F3FE' }}>
                <TypewriterBadge />
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h1
                className="mt-6 font-serif"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: '#111111',
                  maxWidth: '42rem',
                }}
              >
                What&apos;s it<br />built with?
              </h1>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="my-6" style={{ width: '100%', maxWidth: '32rem', height: '1px', backgroundColor: '#EAEAEA' }} />
            </FadeIn>

            <FadeIn delay={0.18}>
              <p
                className="leading-relaxed"
                style={{ maxWidth: '65ch', color: '#787774', fontSize: '1.05rem', lineHeight: 1.7 }}
              >
                Enter any URL and fingerprint the technologies powering it &mdash;
                frameworks, CMS, analytics, hosting, and more.
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="mt-8">
                <label
                  htmlFor="hero-search"
                  className="block mb-2 font-mono text-xs uppercase tracking-[0.12em]"
                  style={{ color: '#A8A8A4' }}
                >
                  Scan any website
                </label>
                <div className="w-full" style={{ maxWidth: '36rem' }}>
                  <SearchBar />
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.30}>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: '#A8A8A4' }}>
                {EXAMPLE_SITES.map((site, i) => (
                  <span key={site} className="flex items-center gap-3">
                    <a
                      href={`/results?site=${encodeURIComponent(site)}`}
                      className="font-mono text-xs transition-colors duration-200"
                      style={{ color: '#787774' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#111111'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#787774'; }}
                    >
                      {site}
                    </a>
                    {i < EXAMPLE_SITES.length - 1 && <span style={{ color: '#D0D0CC' }}>&middot;</span>}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <FadeIn delay={0.1} className="py-12" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div className="mx-auto" style={{ maxWidth: '64rem' }}>
            <div className="grid grid-cols-4" style={{ borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>
              <div className="py-8 text-center" style={{ borderRight: '1px solid #EAEAEA' }}>
                <div
                  className="font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em', color: '#111111' }}
                >
                  <AnimatedCounter end={2300} suffix="+" />
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>Detection rules</div>
              </div>
              <div className="py-8 text-center" style={{ borderRight: '1px solid #EAEAEA' }}>
                <div
                  className="font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em', color: '#111111' }}
                >
                  <AnimatedCounter end={92} />
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>Categories</div>
              </div>
              <div className="py-8 text-center" style={{ borderRight: '1px solid #EAEAEA' }}>
                <div
                  className="font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em', color: '#111111' }}
                >
                  <AnimatedCounter end={2} suffix="s" />
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>Avg scan time</div>
              </div>
              <div className="py-8 text-center">
                <div
                  className="font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.02em', color: '#111111' }}
                >
                  &mdash;
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>No signup</div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ─── Use Cases ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div className="mx-auto" style={{ maxWidth: '64rem' }}>
            <FadeIn delay={0}>
              <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#E1F3FE' }}>
                <span className="font-mono text-xs uppercase tracking-[0.12em]" style={{ color: '#1F6C9F' }}>Use cases</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h2
                className="mt-4 font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: '#111111' }}
              >
                Built for real workflows
              </h2>
            </FadeIn>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2" style={{ maxWidth: '56rem' }}>
              {[
                { title: 'Security audits', desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.', tall: true },
                { title: 'Competitive research', desc: 'Compare tech choices across similar products in your market.' },
                { title: 'Vendor due diligence', desc: 'Validate a vendor stack before committing to a platform.' },
                { title: 'Portfolio tracking', desc: 'Track technology changes across sites you own or monitor.' },
                { title: 'Team onboarding', desc: "Get new engineers up to speed on a codebase's external dependencies." },
              ].map((uc, i) => (
                <FadeIn
                  key={uc.title}
                  delay={0.08 * (i + 1)}
                  className={uc.tall ? 'sm:row-span-2' : ''}
                >
                  <div
                    className="group h-full rounded-lg p-8 transition-shadow duration-300"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EAEAEA',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <h3
                      className="font-sans font-semibold"
                      style={{ fontSize: '0.95rem', color: '#111111' }}
                    >
                      {uc.title}
                    </h3>
                    <p
                      className="mt-2 leading-relaxed"
                      style={{ fontSize: '0.875rem', color: '#787774' }}
                    >
                      {uc.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How It Works ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>
          <div className="mx-auto" style={{ maxWidth: '64rem' }}>
            <FadeIn delay={0}>
              <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#EDF3EC' }}>
                <span className="font-mono text-xs uppercase tracking-[0.12em]" style={{ color: '#346538' }}>Pipeline</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h2
                className="mt-4 font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: '#111111' }}
              >
                How the engine works
              </h2>
            </FadeIn>

            <div className="mt-12 grid gap-8 lg:grid-cols-5">
              {/* Steps */}
              <div className="lg:col-span-3">
                {STEPS.map((step, i) => (
                  <FadeIn key={step.n} delay={0.08 * (i + 1)}>
                    <div
                      className="flex items-start gap-6 py-8"
                      style={{ borderBottom: i < STEPS.length - 1 ? '1px solid #EAEAEA' : 'none' }}
                    >
                      <div
                        className="shrink-0 font-serif"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: '2rem',
                          lineHeight: 1,
                          letterSpacing: '-0.02em',
                          color: '#A8A8A4',
                          minWidth: '3rem',
                        }}
                      >
                        {step.n}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-sans font-semibold"
                          style={{ fontSize: '1rem', color: '#111111' }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="mt-2 leading-relaxed"
                          style={{ fontSize: '0.875rem', color: '#787774', maxWidth: '48ch' }}
                        >
                          {step.body}
                        </p>
                      </div>
                      <div
                        className="shrink-0 font-mono text-xs tracking-wider"
                        style={{ color: '#A8A8A4', minWidth: '8rem', textAlign: 'right', paddingTop: '0.15rem' }}
                      >
                        {step.stats}
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>

              {/* Terminal preview */}
              <FadeIn delay={0.3} className="lg:col-span-2">
                <div
                  className="h-full rounded-lg overflow-hidden"
                  style={{ backgroundColor: '#111111', border: '1px solid #EAEAEA' }}
                >
                  <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#FF5F56' }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#27C93F' }} />
                    <span className="ml-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>terminal</span>
                  </div>
                  <div className="p-5 font-mono text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <div style={{ color: '#27C93F' }}>$ techstack scan github.com</div>
                    <div className="mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Fetching <span style={{ color: 'rgba(255,255,255,0.65)' }}>https://github.com</span>...
                    </div>
                    <div className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Parsing <span style={{ color: 'rgba(255,255,255,0.65)' }}>42 signals</span>
                    </div>
                    <div className="mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Matching <span style={{ color: 'rgba(255,255,255,0.65)' }}>2,347 rules</span>
                    </div>
                    <div className="mt-3" style={{ color: '#27C93F' }}>
                      ✓ Detected <span style={{ color: '#FFFFFF' }}>24 technologies</span>
                    </div>
                    <div className="mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      React · Next.js · TypeScript · Vercel · Webpack
                    </div>
                    <div className="mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      GitHub Pages · Primer CSS · Sentry
                    </div>
                    <div className="mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Report saved in <span style={{ color: 'rgba(255,255,255,0.55)' }}>1.8s</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ─── Compare ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div className="mx-auto grid gap-12 lg:grid-cols-2" style={{ maxWidth: '64rem' }}>
            <FadeIn delay={0}>
              <div>
                <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#FBF3DB' }}>
                  <span className="font-mono text-xs uppercase tracking-[0.12em]" style={{ color: '#956400' }}>Compare</span>
                </div>
                <h2
                  className="mt-4 font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: '#111111' }}
                >
                  Side by side comparison
                </h2>
                <p
                  className="mt-4 leading-relaxed"
                  style={{ maxWidth: '45ch', color: '#787774', fontSize: '0.95rem' }}
                >
                  Compare tech stacks across multiple sites. See what platforms share and where they differ.
                </p>
                <a
                  href="/compare"
                  className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] transition-colors duration-200"
                  style={{ color: '#787774' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#111111'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#787774'; }}
                >
                  Try it live
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA' }}
              >
                {/* Comparison mock */}
                <div className="p-6" style={{ borderBottom: '1px solid #EAEAEA' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>github.com</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>gitlab.com</div>
                    </div>
                  </div>
                </div>
                {[
                  { label: 'Framework', a: 'React', b: 'Vue.js', match: false },
                  { label: 'Language', a: 'TypeScript', b: 'TypeScript', match: true },
                  { label: 'Hosting', a: 'Vercel', b: 'GCP', match: false },
                  { label: 'Analytics', a: 'Segment', b: 'Snowplow', match: false },
                  { label: 'CMS', a: 'Custom', b: 'Custom', match: true },
                  { label: 'Auth', a: 'OAuth', b: 'OAuth', match: true },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-2 px-6 py-3"
                    style={{ borderBottom: i < 5 ? '1px solid #F5F5F3' : 'none' }}
                  >
                    <div className="text-center">
                      <span className="font-sans text-xs" style={{ color: row.match ? '#346538' : '#111111' }}>{row.a}</span>
                    </div>
                    <div className="text-center">
                      <span className="font-sans text-xs" style={{ color: row.match ? '#346538' : '#111111' }}>{row.b}</span>
                    </div>
                  </div>
                ))}
                <div className="p-4 text-center" style={{ backgroundColor: '#FBFBFA' }}>
                  <span className="font-mono text-xs" style={{ color: '#A8A8A4' }}>
                    3 shared · 3 different
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Export & Share ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)', backgroundColor: '#FFFFFF', borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>
          <div className="mx-auto grid gap-12 lg:grid-cols-2" style={{ maxWidth: '64rem' }}>
            <FadeIn delay={0}>
              <div>
                <div style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#FBF3DB' }}>
                  <span className="font-mono text-xs uppercase tracking-[0.12em]" style={{ color: '#956400' }}>Export</span>
                </div>
                <h2
                  className="mt-4 font-serif"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: '#111111' }}
                >
                  Share your findings
                </h2>
                <p
                  className="mt-4 leading-relaxed"
                  style={{ maxWidth: '45ch', color: '#787774', fontSize: '0.95rem' }}
                >
                  Export reports as JSON or CSV. Generate PDFs. Embed a live badge on your site or README.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {[
                    { label: 'JSON export', desc: 'Raw structured data for pipelines' },
                    { label: 'CSV export', desc: 'Spreadsheet-friendly format' },
                    { label: 'PDF report', desc: 'Branded, presentation-ready' },
                    { label: 'Embed badge', desc: 'Live-updating SVG for READMEs' },
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-baseline justify-between py-3"
                      style={{ borderBottom: '1px solid #EAEAEA' }}
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-sans text-sm font-medium" style={{ color: '#111111' }}>{opt.label}</span>
                        <span className="font-sans text-xs" style={{ color: '#A8A8A4' }}>{opt.desc}</span>
                      </div>
                      <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#A8A8A4' }}>
                        <path d="M4.5 12h15M12 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="flex items-center justify-center">
                <div
                  className="rounded-lg p-8 text-center"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #EAEAEA' }}
                >
                  <div className="mb-4 font-mono text-xs uppercase tracking-[0.1em]" style={{ color: '#A8A8A4' }}>Badge preview</div>
                  <div
                    className="inline-flex items-center gap-3 rounded-lg px-5 py-3"
                    style={{ backgroundColor: '#FBFBFA', border: '1px solid #EAEAEA' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: '#787774' }}>
                      <path d="M4 7l8-4 8 4-8 4-8-4z" />
                    </svg>
                    <span className="font-sans text-sm font-semibold" style={{ color: '#111111' }}>github.com</span>
                    <span
                      className="rounded px-2 py-0.5 font-mono text-xs font-bold"
                      style={{ backgroundColor: '#EDF3EC', color: '#346538' }}
                    >
                      24 techs
                    </span>
                  </div>
                  <div className="mt-4 font-mono text-xs" style={{ color: '#A8A8A4' }}>
                    Embed this badge in your README or site
                  </div>
                  <div className="mt-3 rounded-md px-3 py-2" style={{ backgroundColor: '#F8F8F6' }}>
                    <code
                      className="font-mono text-xs"
                      style={{ color: '#787774', wordBreak: 'break-all' }}
                    >
                      ![tech](https://techstack-finder.com/badge?domain=github.com)
                    </code>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="py-24 sm:py-32" style={{ paddingLeft: 'clamp(1.5rem, 5vw, 3rem)', paddingRight: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div className="mx-auto text-center" style={{ maxWidth: '40rem' }}>
            <FadeIn delay={0}>
              <h2
                className="font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', lineHeight: 1.2, letterSpacing: '-0.01em', color: '#111111' }}
              >
                Start scanning
              </h2>
              <p
                className="mt-4 mx-auto leading-relaxed"
                style={{ maxWidth: '38ch', color: '#787774', fontSize: '0.95rem' }}
              >
                No account required. Paste a URL and see the full technology stack in seconds.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="mt-8 mx-auto" style={{ maxWidth: '28rem' }}>
                <SearchBar />
              </div>
            </FadeIn>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
