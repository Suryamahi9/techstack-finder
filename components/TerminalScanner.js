'use client';
import { useState, useEffect, useRef } from 'react';

const SCAN_LINES = [
  { text: '$ techstack scan github.com', delay: 0 },
  { text: '> Fetching HTML...', delay: 400 },
  { text: '> Response: 200 OK (2.4kb)', delay: 900 },
  { text: '> Parsing DOM tree...', delay: 1300 },
  { text: '> Extracting 47 signals', delay: 1700 },
  { text: '> Running 2,300+ rules...', delay: 2100 },
  { text: '', delay: 2500 },
  { text: '  DETECTED', delay: 2600, accent: true },
  { text: '  ├─ Frontend:  React, Next.js, TypeScript, Tailwind CSS', delay: 2800 },
  { text: '  ├─ Backend:   Node.js, Express', delay: 3100 },
  { text: '  ├─ Hosting:   Vercel, Cloudflare', delay: 3400 },
  { text: '  ├─ Database:  PostgreSQL, Redis', delay: 3700 },
  { text: '  ├─ Payment:   Stripe', delay: 4000 },
  { text: '  └─ Monitoring: Sentry', delay: 4300 },
  { text: '', delay: 4600 },
  { text: '  8 technologies found in 2.1s', delay: 4700, accent: true },
];

export default function TerminalScanner() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [started, setStarted] = useState(false);
  const [ref, inView] = useState({ current: null });
  const containerRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || hasRun.current) return;
    hasRun.current = true;
    let i = 0;
    const run = () => {
      if (i >= SCAN_LINES.length) return;
      setVisibleLines(i + 1);
      i++;
      const next = SCAN_LINES[i];
      if (next) {
        setTimeout(run, next.delay - SCAN_LINES[i - 1].delay);
      }
    };
    setTimeout(run, SCAN_LINES[0].delay + 100);
  }, [started]);

  const restart = () => {
    hasRun.current = false;
    setVisibleLines(0);
    setStarted(false);
    setTimeout(() => setStarted(true), 100);
  };

  return (
    <div ref={containerRef} className="w-full rounded-2xl border border-white/[0.06] bg-zinc-950/50 p-[1px] backdrop-blur-sm">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.03] to-white/[0.01] overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <span className="ml-2 font-mono text-[10px] text-faint">terminal</span>
          <button
            onClick={restart}
            className="ml-auto font-mono text-[10px] text-faint hover:text-accent transition-colors"
          >
            rerun
          </button>
        </div>

        {/* Terminal body */}
        <div className="p-4 font-mono text-[11px] leading-relaxed sm:p-5 sm:text-xs">
          {SCAN_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={line.accent ? 'text-accent' : line.text.startsWith('>') ? 'text-faint' : 'text-fg/70'}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
          {visibleLines < SCAN_LINES.length && (
            <span className="inline-block h-3.5 w-2 animate-pulse bg-accent/60" />
          )}
        </div>
      </div>
    </div>
  );
}
