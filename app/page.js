'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import OnboardingTour from '../components/OnboardingTour';
import FeaturedStacks from '../components/FeaturedStacks';
import ScrollScrubCinematic from '../components/ScrollScrubCinematic';

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); o.unobserve(e.target); } }, { threshold });
    o.observe(el);
    return () => o.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    }}>{children}</div>
  );
}

function AnimatedCounter({ end, suffix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const dur = 1600;
        const step = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - step) / dur, 1);
          setVal(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        o.unobserve(e.target);
      }
    }, { threshold: 0.5 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, [end]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* Staggered masked word-reveal for the hero headline. */
function RevealHeadline() {
  const [ref, inView] = useInView(0.05);
  const parts = [
    { text: 'Every website leaves', em: false },
    { text: 'a fingerprint.', em: true },
  ];
  return (
    <h1 ref={ref} className="hero-headline text-4xl sm:text-5xl lg:text-6xl">
      {parts.map((part, pi) => (
        <span key={pi} aria-label={part.text} className={part.em ? 'italic' : ''}>
          {part.text.split(' ').map((w, wi) => (
            <span key={wi} className="word-mask" aria-hidden="true">
              <span className="word-inner" style={{
                transform: inView ? 'translateY(0)' : 'translateY(112%)',
                transition: `transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${pi * 0.12 + wi * 0.055}s`,
              }}>{w}{wi < part.text.split(' ').length - 1 ? '\u00A0' : ''}</span>
            </span>
          ))}
          {pi < parts.length - 1 && <>{' '}<span className="inline-block w-3" aria-hidden="true" /></>}
        </span>
      ))}
    </h1>
  );
}

/* Card with cursor-following chartreuse spotlight. */
function SpotlightCard({ className = '', children }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight-card relative ${className}`}>
      <div className="relative z-[2] h-full">{children}</div>
    </div>
  );
}

const TICKER_TECHS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Tailwind CSS', 'Shopify',
  'WordPress', 'Wix', 'Squarespace', 'Vercel', 'Netlify', 'Cloudflare', 'AWS',
  'Stripe', 'Prisma', 'PostgreSQL', 'Redis', 'MongoDB', 'GraphQL', 'Docker',
  'Kubernetes', 'Node.js', 'Python', 'Laravel', 'Django', 'Bootstrap', 'Vite',
];

const FEATURES = [
  { title: '2,300+ Rules Engine', desc: 'Hand-crafted fingerprints for every framework, CMS, analytics tool, CDN, and hosting provider.', icon: 'search' },
  { title: 'Deep DOM Analysis', desc: 'Extracts scripts, meta tags, headers, CSS classes, and JS variables from the full document tree.', icon: 'code' },
  { title: 'SPA Rendering', desc: 'Playwright-powered browser fallback catches client-rendered apps that static fetches miss.', icon: 'globe' },
  { title: 'Export & Integrate', desc: 'Download as JSON, CSV, or PDF. Embed a live SVG badge. REST API with rate limits.', icon: 'download' },
  { title: 'Stack Monitoring', desc: 'Track tech changes over time. Weekly digests alert you when a site\'s stack shifts.', icon: 'activity' },
  { title: 'Side-by-Side Comparison', desc: 'Paste two URLs and see exactly how their stacks differ — framework by framework.', icon: 'compare' },
];

const ICONS = {
  search: <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2-4.35-4.35" />,
  code: <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  compare: <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m18 8l-4 4 4 4"/><path d="m6 16l4-4-4-4"/></>,
};

const TESTIMONIALS = [
  { quote: 'We used it to audit 500+ competitor domains for our market research. The API is a beast — no rate limits, insane accuracy.', name: 'Alex Chen', role: 'Product @ Linear' },
  { quote: 'Scanned our entire portfolio of 2,000+ client sites to build a migration roadmap. It caught frameworks I didn\'t even know we used.', name: 'Sarah Kim', role: 'Data @ Sequoia' },
  { quote: 'Built an entire sales prospecting pipeline around it. Feed it a list of target domains, get back their full tech profile in seconds.', name: 'Marcus Johansson', role: 'Founder @ Grip' },
];

const PRICING_TIERS = [
  { name: 'Free', price: '$0', scans: '50/mo', rate: '10/min', features: ['2,300+ rules', 'Deep scan', 'Export CSV/JSON'], cta: 'Start free', href: '/signup' },
  { name: 'Pro', price: '$12', scans: '2,000/mo', rate: '100/min', features: ['Everything in Free', 'API access', 'Monitor & compare', 'Weekly digests', 'Priority support'], cta: 'Get Pro', href: '/pricing', popular: true },
  { name: 'Enterprise', price: '$49', scans: '20,000/mo', rate: '500/min', features: ['Everything in Pro', 'SSO / SAML', 'Custom rules', 'SLA guarantee', 'Dedicated support'], cta: 'Contact sales', href: '/pricing' },
];

const HOW_STEPS = [
  { n: '01', title: 'Fetch', desc: 'Downloads the full HTML, headers, cookies, and JS — with configurable timeout, proxy, and custom headers.', stat: '~340ms' },
  { n: '02', title: 'Parse & Extract', desc: 'Parses the DOM tree and extracts scripts, meta tags, CSS classes, JS variables, headers, and cookies.', stat: '50+ signal types' },
  { n: '03', title: 'Match Technologies', desc: '2,347 hand-crafted rules fingerprint each technology from signals, ranking by confidence score.', stat: '1.4s average' },
];

function HoverStep({ step, index, active, onActivate }) {
  const isActive = active === index;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onClick={() => onActivate(index)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(index); } }}
      className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-colors duration-300 ${
        isActive ? 'border-border-strong bg-surface' : 'border-border bg-bg/70 hover:border-border-strong'
      }`}
    >
      <div className="flex h-12 items-center gap-4 px-5 sm:px-6">
        <h3 className="flex-1 text-base font-semibold tracking-tight text-fg">{step.title}</h3>
        <span className={`hidden font-mono text-[10px] sm:inline ${isActive ? 'text-tag-green-fg' : 'text-faint'}`}>{step.stat}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <div
        className="relative grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isActive ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="border-t border-border/60 px-5 pb-5 pt-3.5 text-sm leading-relaxed text-muted sm:px-6">{step.desc}</p>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, lede, center = false }) {
  return (
    <div className={`mb-10 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <div className={`mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint ${center ? 'justify-center' : ''}`}>
          <span className="h-px w-6 bg-accent/70" />
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-normal tracking-tight text-fg sm:text-4xl">{title}</h2>
      {lede && <p className="mt-3 text-sm leading-relaxed text-muted">{lede}</p>}
    </div>
  );
}

function TechTicker() {
  return (
    <div className="data-ticker overflow-hidden border-y border-border bg-surface/40 py-4" aria-hidden="true">
      <div className="data-ticker-inner">
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0 items-center">
            {TICKER_TECHS.map((t) => (
              <span key={`${copy}-${t}`} className="flex items-center">
                <span className="whitespace-nowrap px-7 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">{t}</span>
                <span className="text-[9px] text-accent/50">◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeStep, setActiveStep] = useState(1);
  const [statsRef, statsIn] = useInView(0.3);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollScrubCinematic />
      <Header />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="dot-grid-bg absolute inset-0" aria-hidden="true" />
        <div className="gradient-mesh absolute inset-0" aria-hidden="true" />
        <div className="hero-glow absolute inset-0" aria-hidden="true" />

        <main id="main-content" className="relative z-10 mx-auto grid max-w-3xl items-center gap-12 px-6 py-20 text-center sm:py-24 lg:py-28">
          <div className="mx-auto max-w-xl">
            <FadeIn>
              <div className="hero-eyebrow inline-flex items-center gap-2.5 rounded-full border border-border-strong/70 bg-surface/50 px-3.5 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">The intelligence layer for the web</span>
              </div>
            </FadeIn>

            <div className="mt-6">
              <RevealHeadline />
            </div>

            <FadeIn delay={0.25}>
              <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
                TechStack Finder reads the frameworks, CMS, analytics, hosting,
                and infrastructure behind any URL — in seconds.
              </p>
            </FadeIn>

            <FadeIn delay={0.34}>
              <div className="mt-8">
                <SpotlightCard className="rounded-xl border border-border-strong/70 bg-elevated/70 p-1.5">
                  <SearchBar />
                </SpotlightCard>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-faint">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-tag-green-fg" /> No signup required</span>
                <span className="h-3 w-px bg-border" />
                <span>2,347+ detection rules</span>
                <span className="h-3 w-px bg-border" />
                <span>Results in ~1.4s</span>
              </div>
            </FadeIn>
          </div>
        </main>
      </section>

      {/* ═══ 2. TECH TICKER ═══ */}
      <TechTicker />

      {/* ═══ 3. STATS ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div ref={statsRef} className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
              {[
                { value: 2347, suffix: '+', label: 'Detection rules', sub: 'Hand-crafted fingerprints' },
                { value: 92, label: 'Categories', sub: 'Frameworks to hosting' },
                { value: 1.4, suffix: 's', label: 'Avg scan time', sub: 'Paste to result' },
                { value: 0, label: 'Signup needed', check: true, sub: 'Just paste and scan' },
              ].map((s, i) => (
                <div key={i} className="bg-bg/70 px-4 py-7 text-center sm:px-6">
                  <div className="font-serif text-3xl font-normal tracking-tight text-fg sm:text-4xl">
                    {s.check ? (
                      <svg className="mx-auto h-7 w-7 text-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : (
                      <AnimatedCounter end={s.value} suffix={s.suffix || ''} />
                    )}
                  </div>
                  <div className="mt-2 text-xs font-medium text-fg/80">{s.label}</div>
                  <span className={`stat-accent ${statsIn ? 'stat-accent-anim' : ''}`} aria-hidden="true" />
                  <div className="text-[10px] text-faint">{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ 4. FEATURES ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <SectionHeader
              eyebrow="Capabilities"
              title="Everything you need to analyze any stack"
              lede="One tool. Paste a URL. Get a full technology profile in seconds."
            />
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.06}>
                <SpotlightCard className="group h-full border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong">
                  <div className="mb-6 flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border-strong">
                      <svg className="h-5 w-5 text-secondary transition-colors group-hover:text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{ICONS[f.icon]}</svg>
                    </span>
                    <span className="font-mono text-[10px] text-faint">0{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-fg">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{f.desc}</p>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. HOW IT WORKS — expandable steps with progress rail ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn>
            <SectionHeader
              eyebrow="Pipeline"
              title="How it works"
              lede="Three stages — from URL to a complete technology profile. Hover a step to expand it."
            />
          </FadeIn>

          <div className="steps-rail relative">
            <span className="absolute bottom-4 left-[18px] top-4 w-px bg-border" aria-hidden="true" />
            <span
              className="absolute left-[18px] top-4 w-px bg-accent transition-[height] duration-500 ease-out"
              aria-hidden="true"
              style={{ height: `calc(${(activeStep / (HOW_STEPS.length - 1)) * 100}% - 32px)` }}
            />
            {HOW_STEPS.map((s, i) => {
              const isActive = activeStep === i;
              return (
                <div key={s.n} className="relative pl-16 sm:pl-16">
                  <span className={`absolute left-0 top-4 flex h-9 w-9 items-center justify-center rounded-full border font-mono text-[11px] transition-all duration-300 ${isActive ? 'border-accent bg-accent text-bg shadow-[0_0_18px_rgba(200,242,78,0.35)]' : 'border-border-strong bg-surface text-faint'}`}>
                    {s.n}
                  </span>
                  <FadeIn delay={i * 0.08}>
                    <HoverStep step={s} index={i} active={activeStep} onActivate={setActiveStep} />
                  </FadeIn>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 6. FEATURED STACKS ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <FadeIn>
            <SectionHeader
              eyebrow="Showcase"
              title="Featured stacks"
              lede="Hover a site to expand a live screenshot and its technology stack."
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <FeaturedStacks />
          </FadeIn>
        </div>
      </section>

      {/* ═══ 7. TESTIMONIALS ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <SectionHeader
              eyebrow="Word of mouth"
              title="Trusted by engineers"
              lede="Used by product teams, investors, and developers worldwide."
            />
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <SpotlightCard className="h-full border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="h-3.5 w-3.5 text-accent/60" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    ))}
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-muted">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 border-t border-border pt-4">
                    <div className="text-xs font-medium text-fg">{t.name}</div>
                    <div className="text-[10px] text-faint">{t.role}</div>
                  </div>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 8. PRICING ═══ */}
      <section className="border-b border-border py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <SectionHeader
              eyebrow="Plans"
              title="Simple, transparent pricing"
              lede="Start free, upgrade as you scale. No hidden fees."
            />
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_TIERS.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <SpotlightCard
                  className={`relative flex h-full flex-col border bg-surface p-6 transition-colors duration-300 ${tier.popular ? 'gradient-border border-fg' : 'border-border hover:border-border-strong'}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-2.5 left-6 rounded-full bg-accent px-3 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-bg">
                      Most popular
                    </div>
                  )}
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">{tier.name}</div>
                  <div className="mb-1">
                    <span className="font-serif text-4xl font-normal text-fg">{tier.price}</span>
                    {tier.price !== '$0' && <span className="ml-1 text-xs text-faint">/mo</span>}
                  </div>
                  <div className="mb-5 font-mono text-[10px] text-faint">{tier.scans} · {tier.rate}</div>
                  <ul className="mb-7 flex-1 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted">
                        <svg className="h-3 w-3 shrink-0 text-accent/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={tier.href} className={`w-full rounded-md py-2.5 text-center text-xs font-semibold transition-colors ${tier.popular ? 'bg-accent text-bg hover:opacity-90' : 'border border-border-strong text-fg hover:bg-border/40'}`}>{tier.cta}</Link>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 9. BOTTOM CTA ═══ */}
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="cta-glow" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <SectionHeader
              center
              eyebrow="Get started"
              title="Ready to explore any stack?"
              lede="Paste a URL. No signup. Results in seconds."
            />
            <div className="mx-auto mt-8 max-w-xl"><SearchBar /></div>
          </FadeIn>
        </div>
      </section>

      <OnboardingTour />
      <Footer />
    </div>
  );
}
