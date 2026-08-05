'use client';
import { useMemo, useState } from 'react';

const TARGET = 'stripe.com';
const TECHS = ['React', 'Next.js', 'Tailwind', 'Vercel', 'Stripe.js', 'Prisma'];

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Deterministic fingerprint whorl: concentric ridge rings with seeded gaps.
   Coordinates are rounded so server and client trig agree during hydration. */
const R3 = (n) => Math.round(n * 1000) / 1000;

function buildRidges(seed) {
  const rand = mulberry32(seed);
  const ridges = [];
  const rings = 9;
  for (let ri = 0; ri < rings; ri++) {
    const r = 30 + ri * 13.5;
    const count = 64;
    const gaps = [];
    const gapCount = 1 + (rand() < 0.55 ? 1 : 0);
    for (let g = 0; g < gapCount; g++) {
      gaps.push({ start: rand() * Math.PI * 2, width: 0.14 + rand() * 0.22 });
    }
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const inGap = gaps.some((gp) => {
        const d = (((a - gp.start) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        return d < gp.width;
      });
      if (inGap) continue;
      const len = r * 0.16;
      const tx = -Math.sin(a);
      const ty = Math.cos(a);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      ridges.push({ x1: R3(x - (tx * len) / 2), y1: R3(y - (ty * len) / 2), x2: R3(x + (tx * len) / 2), y2: R3(y + (ty * len) / 2) });
    }
  }
  const center = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 10;
    const tx = -Math.sin(a);
    const ty = Math.cos(a);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    center.push({ x1: R3(x - tx * 3), y1: R3(y - ty * 3), x2: R3(x + tx * 3), y2: R3(y + ty * 3) });
  }
  return [...center, ...ridges];
}

function FingerprintWhorl() {
  const [sweep, setSweep] = useState(0);
  const seed = useMemo(() => hashCode(TARGET), []);
  const ridges = useMemo(() => buildRidges(seed), [seed]);
  const fid = useMemo(() => {
    let out = '';
    let s = seed;
    for (let i = 0; i < 4; i++) {
      out += (s & 0xff).toString(16).padStart(2, '0').toUpperCase();
      if (i < 3) out += '-';
      s = (s >>> 8) | (s << 24);
    }
    return out;
  }, [seed]);

  return (
    <div
      onMouseEnter={() => setSweep((n) => n + 1)}
      className="stack-fingerprint w-full overflow-hidden rounded-xl border border-border bg-elevated shadow-diffusion"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Stack fingerprint</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          {TARGET}
        </span>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10">
        <div className="fp-glow" aria-hidden="true" />
        <div className="fp-orbit" aria-hidden="true" />
        <div className="pulse-ring fp-pulse absolute" aria-hidden="true" />
        <div className="pulse-ring fp-pulse fp-pulse-2 absolute" aria-hidden="true" />
        <svg key={sweep} viewBox="-150 -150 300 300" className="relative h-64 w-64" aria-hidden="true">
          {ridges.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              className="fp-seg"
              style={{ animationDelay: `${i * 4}ms` }}
              stroke="var(--fg)"
              strokeOpacity="0.5"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pb-4">
        {TECHS.map((t, i) => (
          <span key={t} className="fp-chip font-mono text-[10px]" style={{ animationDelay: `${300 + i * 120}ms` }}>
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5">
        <span className="font-mono text-[10px] text-muted">fingerprint #{fid} · 9 signal rings</span>
        <span className="font-mono text-[10px] text-faint">hover to rescan</span>
      </div>
    </div>
  );
}

export default FingerprintWhorl;
