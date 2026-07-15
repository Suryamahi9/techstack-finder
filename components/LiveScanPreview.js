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
    <div className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-accent/60 transition-all duration-1000 ease-out"
        style={{ width: `${width}%`, transitionDelay: `${delay}ms` }}
      />
    </div>
  );
}

export default function LiveScanPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % DEMO_STACK.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div className="w-full rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-[1px] backdrop-blur-sm">
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
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            8 techs
          </span>
        </div>

        {/* Tech list */}
        <div className="space-y-1.5">
          {DEMO_STACK.map((tech, i) => (
            <div
              key={tech.name}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 transition-all duration-300 ${
                i === activeIndex
                  ? 'bg-accent/[0.06] border border-accent/10'
                  : 'border border-transparent'
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: tech.color, opacity: 0.8 }}
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
          <span className="flex items-center gap-1 font-mono text-[10px] text-accent/60">
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
