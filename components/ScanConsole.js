'use client';
import { useEffect, useRef, useState } from 'react';

const TECHS = [
  { name: 'Next.js 14.2', conf: 94 },
  { name: 'React 18.3', conf: 91 },
  { name: 'TypeScript 5.6', conf: 89 },
  { name: 'Tailwind CSS 4', conf: 87 },
  { name: 'Vercel', conf: 84 },
  { name: 'Stripe.js', conf: 81 },
  { name: 'NextAuth.js', conf: 78 },
  { name: 'Prisma 6', conf: 76 },
  { name: 'PostgreSQL 16', conf: 74 },
  { name: 'Cloudflare CDN', conf: 71 },
  { name: 'Google Analytics', conf: 68 },
  { name: 'Sentry', conf: 64 },
];

const URL_TARGET = 'stripe.com';
const ROW_DELAY = 340;
const HASH = 'F1NG3R';

function ScanConsole() {
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('boot'); // boot → scanning → done
  const [active, setActive] = useState(-1);
  const [revealed, setRevealed] = useState(() => new Set());
  const [cycle, setCycle] = useState(0);
  const timers = useRef([]);
  const reduced = useRef(false);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const schedule = (fn, ms) => {
    if (!reduced.current) timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    clearTimers();

    if (reduced.current) {
      setTyped(URL_TARGET);
      setPhase('done');
      setRevealed(new Set(TECHS.map((_, i) => i)));
      return undefined;
    }

    let i = 0;
    const typeTimer = setInterval(() => {
      i += 1;
      setTyped(URL_TARGET.slice(0, i));
      if (i >= URL_TARGET.length) {
        clearInterval(typeTimer);
        setPhase('scanning');
        TECHS.forEach((_, idx) => {
          const at = idx * ROW_DELAY;
          schedule(() => setActive(idx), at);
          schedule(() => setRevealed((prev) => new Set(prev).add(idx)), at + 300);
          schedule(() => setActive(-1), at + 400);
        });
        const lastAt = (TECHS.length - 1) * ROW_DELAY;
        schedule(() => setPhase('done'), lastAt + 1150);
        schedule(() => {
          setPhase('scanning');
          setActive(-1);
          setRevealed(new Set());
          setTyped('');
          setCycle((c) => c + 1);
        }, lastAt + 5600);
      }
    }, 36);

    return () => {
      clearInterval(typeTimer);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycle]);

  return (
    <div className="scan-console w-full overflow-hidden rounded-xl border border-border bg-elevated shadow-diffusion">
      {/* chrome bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-bg/60 px-2.5 py-1">
          <svg className="h-3 w-3 shrink-0 text-tag-green-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="flex-1 truncate font-mono text-[10px] text-fg">{typed}<span className="typewriter-cursor" /></span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${phase === 'done' ? 'bg-tag-green-fg' : 'bg-accent animate-pulse'}`} />
            {phase === 'done' ? 'live' : phase === 'scanning' ? 'scanning' : 'idle'}
          </span>
        </div>
      </div>

      {/* console body */}
      <div className="relative min-h-[360px] bg-bg/40 py-3">
        <div className="scan-beam" aria-hidden="true" />
        <div className="relative z-[2] flex flex-col gap-0.5">
          <div className="flex items-center gap-2 px-3 pb-2 font-mono text-[10px] text-faint">
            <span className="text-accent">&gt;</span>
            <span>{phase === 'boot' ? 'connecting to target…' : 'extracting signals from DOM…'}</span>
          </div>
          {TECHS.map((t, idx) => {
            const shown = revealed.has(idx);
            const isActive = active === idx;
            return (
              <div key={t.name} className={`scan-row ${shown ? 'scan-row-shown' : ''} ${isActive ? 'scan-row-active' : ''}`}>
                <span className="scan-row-mark">{shown ? '✓' : '·'}</span>
                <span className="scan-row-name">{t.name}</span>
                <span className="scan-row-bar">
                  <span className="scan-row-fill" style={{ width: shown ? `${t.conf}%` : '0%' }} />
                </span>
                <span className="scan-row-conf">{t.conf}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <span className="font-mono text-[10px] text-muted">
          {phase === 'done' ? (
            <span className="flex items-center gap-2">
              <span className="text-tag-green-fg">fingerprint complete</span>
              <span className="text-faint">·</span>
              <span className="text-faint">{TECHS.length} technologies · 1.42s</span>
            </span>
          ) : (
            <span className="text-faint">{phase === 'scanning' ? 'scanning in progress' : 'awaiting connection'}</span>
          )}
        </span>
        <span className="font-mono text-[10px] text-faint">#{HASH}-{cycle + 1}</span>
      </div>
    </div>
  );
}

export default ScanConsole;
