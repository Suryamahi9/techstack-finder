'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import useInView from '../lib/useInView';

const B = '#050505';
const BG = '#F4F4F0';
const RED = '#E61919';
const MID = '#555555';

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
    tag: 'HTTP CLIENT',
    body: 'Downloads the full HTML with a configurable timeout. No browser overhead.',
    stats: '2.4kb avg · 8s timeout',
  },
  {
    n: '02',
    title: 'Parse',
    tag: 'DOM ANALYSIS',
    body: 'Walks the document tree extracting scripts, meta tags, headers, and CSS.',
    stats: '50+ signals · 800ms',
  },
  {
    n: '03',
    title: 'Match',
    tag: 'RULE ENGINE',
    body: '2,300+ rules fingerprint each technology from the exact HTML signal.',
    stats: '92 categories · 2,300+ rules',
  },
];

const USE_CASES = [
  {
    title: 'Security audits',
    desc: 'Verify headers, CSP, and HTTPS enforcement across your stack.',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: 'Competitive research',
    desc: 'Compare tech choices across similar products in your market.',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    title: 'Vendor due diligence',
    desc: 'Validate a vendor stack before committing to a platform.',
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  },
  {
    title: 'Portfolio tracking',
    desc: 'Track technology changes across sites you own or monitor.',
    icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Team onboarding',
    desc: "Get new engineers up to speed on a codebase's external dependencies.",
    icon: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },
  {
    title: 'Dependency mapping',
    desc: 'Understand the full web of third-party services any site relies on.',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.44a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.757-1.757',
  },
];

const EXPORT_OPTIONS = [
  { label: 'JSON EXPORT', tag: 'RAW DATA' },
  { label: 'CSV EXPORT', tag: 'SPREADSHEET' },
  { label: 'PDF REPORT', tag: 'DOCUMENT' },
  { label: 'EMBED BADGE', tag: 'WIDGET' },
];

const CATEGORIES = [
  { name: 'Frontend Frameworks', count: 340, items: 'React, Vue, Angular, Svelte...' },
  { name: 'CMS Platforms', count: 210, items: 'WordPress, Shopify, Contentful...' },
  { name: 'Analytics Tools', count: 180, items: 'Google Analytics, Mixpanel...' },
  { name: 'Hosting & CDN', count: 150, items: 'Vercel, Netlify, Cloudflare...' },
  { name: 'Payment Systems', count: 85, items: 'Stripe, PayPal, Braintree...' },
  { name: 'Authentication', count: 92, items: 'Auth0, Firebase, NextAuth...' },
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

function TypewriterBadge() {
  const text = 'LIVE SCANNING \u00b7 V1.0';
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: MID }}>
      {displayed}<span className="typewriter-cursor" />
    </span>
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
    <div
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t px-6 py-2.5"
      style={{ backgroundColor: B, borderColor: '#222' }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping"
          style={{ backgroundColor: RED, opacity: 0.4 }}
        />
        <span className="relative inline-flex h-2 w-2" style={{ backgroundColor: RED }} />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#ccc' }}>
        SYS:ONLINE
      </span>
      <span className="ml-auto font-mono text-[10px]" style={{ color: '#666' }}>
        {time}
      </span>
      <span className="font-mono text-[10px] hidden sm:inline" style={{ color: '#444' }}>
        [ SYS STATUS: NOMINAL ]
      </span>
    </div>
  );
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function BrutalistScanPreview() {
  const [lines, setLines] = useState([]);
  const previewLines = [
    '$ tsf --scan github.com',
    '',
    '[ FETCH ] Connecting to github.com...',
    '[ FETCH ] 200 OK — 847.3kb HTML',
    '[ PARSE ] Walking document tree...',
    '[ PARSE ] Found 142 script tags',
    '[ PARSE ] Found 38 link tags',
    '[ PARSE ] Extracting meta generators',
    '[ MATCH ] Running 2,300+ rules...',
    '[ MATCH ] React .............. HIGH',
    '[ MATCH ] Next.js ............ HIGH',
    '[ MATCH ] TypeScript ......... HIGH',
    '[ MATCH ] Vercel ............. HIGH',
    '[ MATCH ] Tailwind CSS ....... MED',
    '',
    '[ DONE ] 14 technologies detected',
    '[ DONE ] Scan time: 1.8s',
  ];

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      if (idx < previewLines.length) {
        setLines((prev) => [...prev, previewLines[idx]]);
        idx++;
      } else {
        clearInterval(timer);
        setTimeout(() => {
          setLines([]);
          idx = 0;
        }, 3000);
      }
    }, 180);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="w-full overflow-hidden border"
      style={{ backgroundColor: '#0a0a0a', borderColor: B }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ backgroundColor: '#111', borderColor: '#222' }}
      >
        <span className="h-2.5 w-2.5" style={{ backgroundColor: RED }} />
        <span className="h-2.5 w-2.5" style={{ backgroundColor: '#555' }} />
        <span className="h-2.5 w-2.5" style={{ backgroundColor: '#555' }} />
        <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: '#555' }}>
          [ SCAN TERMINAL ]
        </span>
      </div>
      <div className="p-4 font-mono text-[11px] leading-[1.8] sm:p-5" style={{ color: '#33ff33', minHeight: 340 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ opacity: line === '' ? 0 : 1 }}>
            {line.includes('[ MATCH ]') ? (
              <span>
                <span style={{ color: '#666' }}>[ MATCH ] </span>
                <span style={{ color: '#33ff33' }}>{line.replace('[ MATCH ] ', '').split(' ')[0]} </span>
                <span style={{ color: '#444' }}>
                  {'·'.repeat(Math.max(1, 22 - line.replace('[ MATCH ] ', '').split(' ')[0].length))}{' '}
                </span>
                <span style={{ color: line.includes('HIGH') ? RED : '#aaa' }}>
                  {line.replace('[ MATCH ] ', '').split(' ').slice(1).join(' ')}
                </span>
              </span>
            ) : line.startsWith('$') ? (
              <span style={{ color: '#888' }}>{line}</span>
            ) : line.startsWith('[ DONE ]') ? (
              <span style={{ color: '#c5fb45' }}>{line}</span>
            ) : line.startsWith('[') ? (
              <span>
                <span style={{ color: RED }}>{line.split(']')[0]}]</span>
                <span style={{ color: '#666' }}>{line.split(']').slice(1).join(']')}</span>
              </span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
        {lines.length < previewLines.length && (
          <span className="typewriter-cursor" style={{ background: '#33ff33' }} />
        )}
      </div>
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-4 inline-block border px-3 py-1" style={{ borderColor: B, backgroundColor: BG }}>
      <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: MID }}>
        {children}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: BG, color: B }}>
      <Header />

      {/* Global scan line */}
      <div className="scan-line" />

      {/* Crosshair registration marks — top corners */}
      <div className="pointer-events-none fixed top-3 left-3 z-50 font-mono text-[10px] hidden lg:block" style={{ color: '#ccc' }}>+</div>
      <div className="pointer-events-none fixed top-3 right-3 z-50 font-mono text-[10px] hidden lg:block" style={{ color: '#ccc' }}>+</div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:px-10">

        {/* ═══════════════════════════════════════════════════ HERO ═══════════════════════════════════════════════════ */}
        <section className="border-b pb-10 sm:pb-14" style={{ borderColor: B }}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">

            {/* Left column */}
            <div className="flex-1 space-y-6 lg:border-r lg:pr-8" style={{ borderColor: B }}>
              <AnimatedSection delay={0}>
                <div className="mb-4 inline-flex items-center gap-2 border px-3 py-1.5" style={{ borderColor: RED }}>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping" style={{ backgroundColor: RED, opacity: 0.4 }} />
                    <span className="relative inline-flex h-2 w-2" style={{ backgroundColor: RED }} />
                  </span>
                  <TypewriterBadge />
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.06}>
                <h1
                  className="font-black uppercase leading-[0.85] tracking-[-0.04em]"
                  style={{ fontSize: 'clamp(3rem, 8vw, 10rem)', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  WHAT&apos;S IT
                  <br />
                  BUILT
                  <br />
                  WITH<span style={{ color: RED }}>?</span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.12}>
                <div className="inline-block border-2 px-4 py-2" style={{ borderColor: RED }}>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: RED }}>
                    [ SCAN ]
                  </span>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.18}>
                <p className="max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.08em]" style={{ color: MID }}>
                  ENTER ANY URL AND FINGERPRINT THE TECHNOLOGIES POWERING IT —
                  FRAMEWORKS, CMS, ANALYTICS, HOSTING, AND MORE.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.22}>
                <div className="border" style={{ borderColor: B }}>
                  <SearchBar />
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.28}>
                <div className="flex flex-wrap items-center gap-2">
                  {EXAMPLE_SITES.map((site) => (
                    <a
                      key={site.label}
                      href={`/results?site=${encodeURIComponent(site.label)}`}
                      className="group flex items-center gap-2 border px-3 py-2 transition-colors duration-150"
                      style={{ borderColor: B, backgroundColor: BG }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = RED; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; e.currentTarget.style.color = B; }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${site.label}&sz=32`}
                        alt=""
                        className="h-3 w-3"
                        style={{ borderRadius: 0 }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <span className="font-mono text-[11px] uppercase tracking-[0.08em]">{site.label}</span>
                      <span className="font-mono text-[10px] opacity-40 group-hover:opacity-100">&gt;&gt;&gt;</span>
                    </a>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Right column — CRT Terminal Preview */}
            <AnimatedSection delay={0.3} className="lg:w-[45%] lg:pl-8">
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                    [ LIVE SCAN PREVIEW ]
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                    DEMO OUTPUT
                  </span>
                </div>
                <BrutalistScanPreview />
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                  + REPRESENTATIVE OUTPUT — ACTUAL RESULTS VARY BY TARGET
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════ STATS ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.15}>
          <section className="border-b" style={{ borderColor: B }}>
            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 0 }}>
              {[
                { label: 'DETECTION RULES', value: 2300, suffix: '+', icon: '+R' },
                { label: 'CATEGORIES', value: 92, suffix: '', icon: '+C' },
                { label: 'AVG SCAN TIME', value: 2, suffix: 's', icon: '+T' },
                { label: 'NO SIGNUP', value: null, icon: '\u2713' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="group relative border-b sm:border-b-0 sm:border-r p-6 sm:p-8 transition-colors duration-150"
                  style={{
                    borderColor: B,
                    borderRight: i < 3 ? `1px solid ${B}` : undefined,
                  }}
                >
                  <div className="absolute top-0 left-0 h-[3px] w-full" style={{ backgroundColor: RED }} />
                  <div className="mb-1 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                    {stat.icon}
                  </div>
                  <div
                    className="font-mono text-3xl font-bold tracking-tight sm:text-4xl"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {stat.value !== null ? (
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    ) : (
                      <span style={{ color: RED }}>\u2713</span>
                    )}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ HOW IT WORKS ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <SectionLabel>[ DETECTION ENGINE ]</SectionLabel>
                <h2
                  className="font-black uppercase tracking-[-0.04em] leading-[0.85]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
                >
                  HOW THE
                  <br />
                  ENGINE <span style={{ color: RED }}>WORKS</span>
                </h2>
              </div>
              <div className="hidden font-mono text-[9px] uppercase tracking-[0.15em] sm:block" style={{ color: MID }}>
                3 STAGES
                <br />
                PIPELINE
              </div>
            </div>

            <p className="mb-8 max-w-lg font-mono text-xs uppercase leading-relaxed tracking-[0.08em]" style={{ color: MID }}>
              THREE STAGES TRANSFORM RAW HTML INTO A STRUCTURED TECHNOLOGY REPORT.
            </p>

            <div className="grid gap-0 lg:grid-cols-3" style={{ gap: 0 }}>
              {STEPS.map((step, i) => (
                <AnimatedSection key={step.n} delay={0.1 + i * 0.1}>
                  <div
                    className="relative border-b lg:border-b-0 lg:border-r p-6 sm:p-8 transition-colors duration-200 group"
                    style={{ borderColor: B, backgroundColor: BG }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eaeae6'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; }}
                  >
                    <div className="absolute top-0 left-0 h-[3px] w-full" style={{ backgroundColor: RED }} />

                    <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                      STAGE
                    </div>

                    <div className="mb-4 font-mono text-5xl font-black" style={{ color: RED }}>
                      {step.n}
                    </div>

                    <div className="mb-2 border inline-block px-2 py-0.5" style={{ borderColor: MID }}>
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                        {step.tag}
                      </span>
                    </div>

                    <h3 className="mb-3 font-black uppercase text-lg tracking-[-0.02em]">
                      {step.title}
                    </h3>

                    <p className="mb-4 font-mono text-[11px] uppercase leading-relaxed tracking-[0.06em]" style={{ color: MID }}>
                      {step.body}
                    </p>

                    <div className="border-t pt-3" style={{ borderColor: B }}>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#999' }}>
                        [ {step.stats} ]
                      </span>
                    </div>

                    {/* Connecting line (desktop) */}
                    {i < 2 && (
                      <div className="absolute top-1/2 -right-[1px] hidden h-[3px] w-[1px] lg:block" style={{ backgroundColor: RED, top: '50%' }} />
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Horizontal timeline connector on desktop */}
            <div className="relative mt-0 hidden lg:block" style={{ marginTop: -1 }}>
              <div className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: B }} />
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-[-4px] h-3 w-3"
                  style={{
                    backgroundColor: RED,
                    left: `${(i / 2) * 100}%`,
                    transform: 'translateX(-50%)',
                  }}
                />
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ USE CASES ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="mb-8">
              <SectionLabel>[ USE CASES ]</SectionLabel>
              <h2
                className="font-black uppercase tracking-[-0.04em] leading-[0.85]"
                style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
              >
                BUILT FOR
                <br />
                REAL <span style={{ color: RED }}>WORKFLOWS</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 0 }}>
              {USE_CASES.map((uc, i) => (
                <AnimatedSection key={i} delay={0.05 + i * 0.06}>
                  <div
                    className="relative border-b sm:border-r p-6 transition-colors duration-200 cursor-pointer group"
                    style={{
                      borderColor: B,
                      backgroundColor: BG,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = RED;
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.querySelectorAll('.uc-desc, .uc-icon').forEach((el) => {
                        el.style.color = '#fff';
                        el.style.borderColor = '#fff';
                      });
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = BG;
                      e.currentTarget.style.color = B;
                      e.currentTarget.querySelectorAll('.uc-desc').forEach((el) => {
                        el.style.color = MID;
                      });
                      e.currentTarget.querySelectorAll('.uc-icon').forEach((el) => {
                        el.style.borderColor = B;
                      });
                    }}
                  >
                    <div
                      className="uc-icon mb-4 flex h-10 w-10 items-center justify-center border"
                      style={{ borderColor: B }}
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={uc.icon} />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-black uppercase text-sm tracking-[-0.01em]">
                      {uc.title}
                    </h3>
                    <p className="uc-desc font-mono text-[11px] uppercase leading-relaxed tracking-[0.06em]" style={{ color: MID }}>
                      {uc.desc}
                    </p>
                    <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                      <span className="uc-desc group-hover:!text-white" style={{ color: '#999' }}>&gt;&gt;&gt;</span>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ TECHNOLOGY CATEGORIES ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <SectionLabel>[ CATALOG ]</SectionLabel>
                <h2
                  className="font-black uppercase tracking-[-0.04em] leading-[0.85]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
                >
                  WHAT WE
                  <br />
                  <span style={{ color: RED }}>DETECT</span>
                </h2>
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                92 CATEGORIES
                <br />
                2,300+ RULES
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 0 }}>
              {CATEGORIES.map((cat, i) => (
                <AnimatedSection key={cat.name} delay={0.05 + i * 0.06}>
                  <div
                    className="border-b sm:border-r p-5 transition-colors duration-150 group"
                    style={{ borderColor: B, backgroundColor: BG }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eaeae6'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; }}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300" style={{ backgroundColor: RED }} />
                      <div>
                        <h3 className="font-black uppercase text-sm tracking-[-0.01em]">
                          {cat.name}
                        </h3>
                        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: MID }}>
                          {cat.items}
                        </div>
                      </div>
                      <div className="shrink-0 border px-2 py-1" style={{ borderColor: B }}>
                        <span className="font-mono text-[11px] font-bold">{cat.count}</span>
                        <span className="ml-1 font-mono text-[9px] uppercase" style={{ color: MID }}>RULES</span>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ EXPORT & SHARE ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="grid gap-0 lg:grid-cols-2">
              {/* Left: Copy */}
              <div className="border-b lg:border-b-0 lg:border-r p-6 sm:p-8" style={{ borderColor: B }}>
                <SectionLabel>[ EXPORT ]</SectionLabel>
                <h2
                  className="mb-4 font-black uppercase tracking-[-0.04em] leading-[0.85]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
                >
                  SHARE YOUR
                  <br />
                  <span style={{ color: RED }}>FINDINGS</span>
                </h2>
                <p className="mb-6 max-w-md font-mono text-xs uppercase leading-relaxed tracking-[0.08em]" style={{ color: MID }}>
                  EXPORT REPORTS AS JSON OR CSV. GENERATE PDFS. EMBED A LIVE BADGE ON YOUR SITE OR README.
                </p>
                <div className="flex flex-wrap gap-0">
                  {EXPORT_OPTIONS.map((opt) => (
                    <div
                      key={opt.label}
                      className="border px-4 py-3 transition-colors duration-150 cursor-pointer group"
                      style={{ borderColor: B, backgroundColor: BG }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = B; e.currentTarget.style.color = BG; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; e.currentTarget.style.color = B; }}
                    >
                      <div className="font-mono text-[11px] uppercase tracking-[0.08em]">{opt.label}</div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>[ {opt.tag} ]</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Badge preview */}
              <div className="flex items-center justify-center p-6 sm:p-8" style={{ backgroundColor: BG }}>
                <div className="text-center">
                  <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                    [ BADGE PREVIEW ]
                  </div>
                  <div className="inline-flex items-center gap-3 border-2 px-6 py-4" style={{ borderColor: B }}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 7l8-4 8 4-8 4-8-4z" />
                    </svg>
                    <span className="font-sans text-base font-bold">github.com</span>
                    <span className="border px-2 py-0.5 font-mono text-[10px] font-bold" style={{ borderColor: RED, color: RED }}>
                      DETECTED
                    </span>
                  </div>
                  <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                    EMBED THIS BADGE IN YOUR README OR SITE
                  </div>
                  <div className="mt-3 border p-3 font-mono text-[10px]" style={{ borderColor: '#ccc', color: MID, backgroundColor: '#fff' }}>
                    &lt;img src="badge-url" alt="tech stack" /&gt;
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ SCAN EXAMPLES ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <SectionLabel>[ POPULAR SCANS ]</SectionLabel>
                <h2
                  className="font-black uppercase tracking-[-0.04em] leading-[0.85]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
                >
                  RECENT
                  <br />
                  <span style={{ color: RED }}>SCANS</span>
                </h2>
              </div>
              <a
                href="/browse"
                className="hidden border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-150 sm:block"
                style={{ borderColor: B }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = B; e.currentTarget.style.color = BG; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; e.currentTarget.style.color = B; }}
              >
                VIEW ALL &gt;&gt;&gt;
              </a>
            </div>

            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 0 }}>
              {[
                { site: 'github.com', techs: 14, time: '1.8s' },
                { site: 'stripe.com', techs: 11, time: '2.1s' },
                { site: 'vercel.com', techs: 9, time: '1.4s' },
                { site: 'shopify.com', techs: 18, time: '2.5s' },
                { site: 'netflix.com', techs: 12, time: '2.0s' },
                { site: 'reddit.com', techs: 16, time: '1.9s' },
              ].map((scan) => (
                <a
                  key={scan.site}
                  href={`/results?site=${encodeURIComponent(scan.site)}`}
                  className="border-b sm:border-r p-5 transition-colors duration-150 group block"
                  style={{ borderColor: B, backgroundColor: BG }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eaeae6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                      {scan.site}
                    </span>
                    <span className="font-mono text-[10px] opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ color: RED }}>
                      SCAN &gt;&gt;&gt;
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-mono text-2xl font-bold">{scan.techs}</span>
                      <span className="ml-1 font-mono text-[10px] uppercase" style={{ color: MID }}>TECHS</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#999' }}>
                      [ {scan.time} ]
                    </span>
                  </div>
                  <div className="mt-3 h-[3px] w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ backgroundColor: RED }} />
                </a>
              ))}
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ TECH DATA TICKER ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b overflow-hidden" style={{ borderColor: B }}>
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                [ TECH STREAM ]
              </span>
              <div className="h-px flex-1" style={{ backgroundColor: B }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                LIVE FEED
              </span>
            </div>
            <div className="overflow-hidden">
              <div className="animate-ticker-scroll inline-flex gap-12 whitespace-nowrap">
                {[
                  'React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Vercel', 'Cloudflare',
                  'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'Prisma', 'Stripe', 'AWS', 'Supabase',
                  'Vue.js', 'Angular', 'Svelte', 'Deno', 'Bun', 'MongoDB', 'Elasticsearch',
                  'Webpack', 'Vite', 'Turborepo', 'Docker', 'Kubernetes', 'Terraform',
                  ...[
                    'React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Node.js', 'Vercel', 'Cloudflare',
                    'PostgreSQL', 'Redis', 'Docker', 'GraphQL', 'Prisma', 'Stripe', 'AWS', 'Supabase',
                    'Vue.js', 'Angular', 'Svelte', 'Deno', 'Bun', 'MongoDB', 'Elasticsearch',
                    'Webpack', 'Vite', 'Turborepo', 'Docker', 'Kubernetes', 'Terraform',
                  ],
                ].map((name, i) => (
                  <span key={i} className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                    {name}
                    <span className="ml-3 inline-block h-1 w-1" style={{ backgroundColor: RED, opacity: 0.3 }} />
                  </span>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════════════ BOTTOM CTA ═══════════════════════════════════════════════════ */}
        <AnimatedSection delay={0.1}>
          <section className="py-10 sm:py-14 border-b" style={{ borderColor: B }}>
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b lg:border-b-0 lg:border-r p-8 sm:p-12" style={{ borderColor: B }}>
                <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                  [ READY TO SCAN? ]
                </div>
                <h2
                  className="mb-6 font-black uppercase tracking-[-0.04em] leading-[0.85]"
                  style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
                >
                  START
                  <br />
                  <span style={{ color: RED }}>SCANNING</span>
                </h2>
                <div className="border" style={{ borderColor: B }}>
                  <SearchBar />
                </div>
                <div className="mt-4 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: '#999' }}>
                  + NO SIGNUP REQUIRED \u00b7 FREE TIER AVAILABLE
                </div>
              </div>
              <div className="p-8 sm:p-12">
                <div className="mb-6 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: MID }}>
                  [ API ACCESS ]
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'REST API', desc: 'Full programmatic access to all scan features' },
                    { label: 'WEBHOOKS', desc: 'Get notified when monitored sites change' },
                    { label: 'BULK SCANS', desc: 'Scan hundreds of sites in a single batch' },
                    { label: 'BADGE API', desc: 'Dynamic SVG badges for your README' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border-b pb-3"
                      style={{ borderColor: '#ccc' }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ color: RED }}>+</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-bold">
                          {item.label}
                        </span>
                      </div>
                      <p className="mt-1 ml-4 font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: MID }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <a
                  href="/docs"
                  className="mt-6 inline-block border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.12em] font-bold transition-colors duration-150"
                  style={{ borderColor: B, backgroundColor: BG, color: B }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = B; e.currentTarget.style.color = BG; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BG; e.currentTarget.style.color = B; }}
                >
                  READ THE DOCS &gt;&gt;&gt;
                </a>
              </div>
            </div>
          </section>
        </AnimatedSection>

      </main>

      {/* ═══════════════════════════════════════════════════ FOOTER ═══════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: B, color: '#ccc' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          {/* Top border accent */}
          <div className="h-[3px] w-full" style={{ backgroundColor: RED }} />

          <div className="py-8 sm:py-10">
            {/* Main footer grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-sm font-bold" style={{ color: BG }}>+</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-bold" style={{ color: BG }}>
                    TECHSTACK FINDER
                  </span>
                </div>
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em]" style={{ color: '#666' }}>
                  SERVER-SIDE TECHNOLOGY DETECTION.
                  <br />
                  NO TRACKING \u00b7 NO COOKIES \u00b7 NO BS.
                </p>
              </div>

              {/* Links */}
              <div>
                <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: RED }}>
                  [ NAVIGATE ]
                </div>
                <div className="space-y-2">
                  {['BROWSE', 'COMPARE', 'LEADERBOARD', 'RADAR'].map((link) => (
                    <div key={link}>
                      <a
                        href={`/${link.toLowerCase()}`}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150"
                        style={{ color: '#888' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = BG; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
                      >
                        &gt; {link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: RED }}>
                  [ TOOLKIT ]
                </div>
                <div className="space-y-2">
                  {['DOCS', 'API KEYS', 'BULK SCAN', 'MONITOR'].map((link) => (
                    <div key={link}>
                      <a
                        href={`/${link.toLowerCase().replace(' ', '-')}`}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-150"
                        style={{ color: '#888' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = BG; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#888'; }}
                      >
                        &gt; {link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta */}
              <div>
                <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: RED }}>
                  [ SYSTEM ]
                </div>
                <div className="space-y-1 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#555' }}>
                  <div>BUILT BY MAHENDRA SURYA</div>
                  <div>V1.0.0</div>
                  <div>SERVER-SIDE SCANNING</div>
                  <div>NO TRACKING</div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center" style={{ borderColor: '#333' }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: '#555' }}>
                &copy; {new Date().getFullYear()} TECHSTACK FINDER. ALL RIGHTS RESERVED.
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px]" style={{ color: '#333' }}>+</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#444' }}>
                  \u00a9
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: '#444' }}>
                  \u00ae
                </span>
                <span className="font-mono text-[10px]" style={{ color: '#333' }}>+</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Live system bar */}
      <LiveBar />
    </div>
  );
}
