'use client';
import { useState, useEffect } from 'react';

const TECH_CARDS = [
  { name: 'Next.js', cat: 'Framework', conf: 98, color: '#fff' },
  { name: 'React', cat: 'Library', conf: 96, color: '#61dafb' },
  { name: 'Tailwind CSS', cat: 'CSS', conf: 91, color: '#38bdf8' },
  { name: 'Vercel', cat: 'Hosting', conf: 89, color: '#fff' },
  { name: 'TypeScript', cat: 'Language', conf: 94, color: '#3178c6' },
  { name: 'Stripe', cat: 'Payments', conf: 85, color: '#635bff' },
  { name: 'PostgreSQL', cat: 'Database', conf: 82, color: '#336791' },
  { name: 'Prisma', cat: 'ORM', conf: 80, color: '#2d3748' },
  { name: 'NextAuth', cat: 'Auth', conf: 78, color: '#eb4d4b' },
  { name: 'Sentry', cat: 'Monitoring', conf: 76, color: '#362d59' },
  { name: 'Radix UI', cat: 'UI Library', conf: 73, color: '#fff' },
  { name: 'Stripe', cat: 'Payments', conf: 85, color: '#635bff' },
];

function MockupCard({ tech, index, active }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all duration-500 ${
        active
          ? 'border-accent/20 bg-accent/[0.05] shadow-[0_0_20px_rgba(197,251,69,0.04)]'
          : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]'
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: tech.color, boxShadow: `0 0 6px ${tech.color}40` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-medium text-fg/90">{tech.name}</span>
          <span className="shrink-0 font-mono text-[9px] text-faint">{tech.conf}%</span>
        </div>
        <div className="mt-1 h-1 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: active ? `${tech.conf}%` : '0%',
              background: `linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white))`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResultsMockup() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setPhase('results'), 1200);
    const t2 = setTimeout(() => setPhase('live'), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  useEffect(() => {
    if (phase !== 'live') return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TECH_CARDS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className={`w-full transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-[1px] shadow-[0_0_60px_rgba(197,251,69,0.03)] backdrop-blur-sm">
        <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.03] to-transparent">

          {/* ─── Window Chrome ─── */}
          <div className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-3">
            <div className="flex gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${phase === 'loading' ? 'bg-red-500/40' : 'bg-red-500/70'}`} />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
              <span className={`h-2.5 w-2.5 rounded-full transition-colors duration-500 ${phase === 'results' ? 'bg-accent/60' : 'bg-green-500/40'}`} />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5">
              <svg className="h-3 w-3 shrink-0 text-faint/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a16 16 0 0 1 4 10 16 16 0 0 1-4 10 16 16 0 0 1-4-10 16 16 0 0 1 4-10z" />
              </svg>
              <span className="flex-1 truncate text-[10px] text-faint/60">https://techstack-finder.vercel.app/results?site=github.com</span>
              {phase === 'loading' && (
                <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-[9px] text-accent">Scanning</span>
                </span>
              )}
              {phase === 'results' && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[9px] text-accent">12 techs</span>
              )}
            </div>
          </div>

          {/* ─── Tab Bar ─── */}
          <div className="flex items-center gap-0.5 border-b border-white/[0.04] px-4 py-0">
            {['Overview', 'Technologies', 'Analysis', 'Code', 'Tools'].map((tab, i) => (
              <button
                key={tab}
                className={`border-b-2 px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.1em] transition-all duration-300 ${
                  i === 1
                    ? 'border-accent text-accent'
                    : 'border-transparent text-faint/40 hover:text-faint/70'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="rounded-full bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-faint/50">2.3s</span>
            </div>
          </div>

          {/* ─── Content ─── */}
          <div className="p-4">

            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-fg">github.com</h3>
                <p className="text-[10px] text-faint">24 technologies detected across 8 categories</p>
              </div>
              <div className="flex gap-1">
                {['JSON', 'CSV', 'PDF'].map((fmt) => (
                  <span key={fmt} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-faint/60">
                    {fmt}
                  </span>
                ))}
              </div>
            </div>

            {/* Tech Cards Grid */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TECH_CARDS.slice(0, 6).map((tech, i) => (
                <MockupCard key={tech.name} tech={tech} index={i} active={i === activeIndex} />
              ))}
            </div>

            {/* Bottom row: charts placeholder + categories */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.04] bg-white/[0.02]">
                  <div className="h-6 w-6 rounded-full border-2 border-accent/30 border-t-accent" style={{ animation: 'spin 2s linear infinite' }} />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-fg/70">Categories</div>
                  <div className="mt-0.5 flex gap-1">
                    {['Frontend', 'Backend', 'Infra'].map((c) => (
                      <span key={c} className="rounded-full bg-white/[0.04] px-1.5 py-0.5 font-mono text-[8px] text-faint">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ml-auto flex gap-1.5">
                {['react', 'next', 'node', 'ts', 'tw'].map((t, i) => (
                  <span
                    key={t}
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-[8px] font-bold uppercase transition-all duration-300 ${
                      i === activeIndex % 5
                        ? 'bg-accent/20 text-accent ring-1 ring-accent/30'
                        : 'bg-white/[0.04] text-faint/30'
                    }`}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Glow ─── */}
          <div className="pointer-events-none absolute -bottom-20 -left-20 -right-20 -top-20 z-[-1]">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-30 blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
