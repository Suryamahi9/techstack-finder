'use client';
import { useState, useEffect } from 'react';

const DEMO_STACK = [
  { name: 'Next.js', category: 'Frontend Framework', confidence: 98, color: '#fff' },
  { name: 'React', category: 'JavaScript Library', confidence: 96, color: '#61dafb' },
  { name: 'TypeScript', category: 'Platform / Language', confidence: 94, color: '#3178c6' },
  { name: 'Tailwind CSS', category: 'CSS Framework', confidence: 91, color: '#38bdf8' },
  { name: 'Vercel', category: 'CDN / Hosting', confidence: 89, color: '#fff' },
  { name: 'Stripe', category: 'Payment Processor', confidence: 85, color: '#635bff' },
  { name: 'PostgreSQL', category: 'Database', confidence: 82, color: '#336791' },
  { name: 'Sentry', category: 'Monitoring', confidence: 78, color: '#362d59' },
];

function ConfidenceBar({ confidence, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(confidence), 300 + delay);
    return () => clearTimeout(t);
  }, [confidence, delay]);

  return (
    <div className="h-1.5 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${width}%`,
          transitionDelay: `${delay}ms`,
          background: confidence >= 90
            ? 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white))'
            : confidence >= 80
            ? 'linear-gradient(90deg, var(--accent-soft), var(--accent))'
            : 'var(--accent-soft)',
        }}
      />
    </div>
  );
}

function ScanPulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

export default function LiveScanPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [scanPhase, setScanPhase] = useState('idle');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    setScanPhase('scanning');
    const t1 = setTimeout(() => setScanPhase('complete'), 1800);
    return () => clearTimeout(t1);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_STACK.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div className="w-full rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-[1px] backdrop-blur-sm shadow-diffusion">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 sm:p-5">
        {/* Header bar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="ml-2 flex-1 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-faint">
            github.com
          </div>
          <div className="flex items-center gap-1.5">
            {scanPhase === 'scanning' ? (
              <>
                <ScanPulse />
                <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                  scanning...
                </span>
              </>
            ) : (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
                8 techs
              </span>
            )}
          </div>
        </div>

        {/* Tech list */}
        <div className="space-y-1">
          {DEMO_STACK.map((tech, i) => (
            <div
              key={tech.name}
              className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-all duration-300 ${
                i === activeIndex
                  ? 'bg-accent/[0.06] border border-accent/10 shadow-[inset_0_1px_0_rgba(197,251,69,0.05)]'
                  : 'border border-transparent hover:bg-white/[0.02]'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full transition-transform duration-200"
                style={{
                  backgroundColor: tech.color,
                  opacity: 0.8,
                  transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
              <span className="w-28 shrink-0 truncate text-xs font-medium text-fg/80 sm:w-36">
                {tech.name}
              </span>
              <ConfidenceBar confidence={tech.confidence} delay={i * 100} />
              <span className="w-8 shrink-0 text-right font-mono text-[10px] text-faint">
                {tech.confidence}%
              </span>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
          <span className="font-mono text-[10px] text-faint">
            Detected in 2.1s
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-accent/60 transition-colors group-hover:text-accent">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Try it live
          </span>
        </div>
      </div>
    </div>
  );
}
