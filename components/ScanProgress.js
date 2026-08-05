'use client';
import { useState, useEffect, useRef, useMemo } from 'react';

const STEPS = [
  { id: 'resolve', label: 'Resolving domain', duration: 500 },
  { id: 'fetch', label: 'Fetching page HTML', duration: 1500 },
  { id: 'headers', label: 'Analyzing headers & meta tags', duration: 800 },
  { id: 'challenge', label: 'Checking for challenge pages', duration: 500 },
  { id: 'css', label: 'Deep scanning CSS & JS assets', duration: 1800 },
  { id: 'probes', label: 'Probing common paths', duration: 1100 },
  { id: 'browser', label: 'Running browser engine', duration: 1800 },
  { id: 'rules', label: 'Matching tech rules', duration: 1100 },
  { id: 'results', label: 'Building results', duration: 700 },
];

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

const R3 = (n) => Math.round(n * 1000) / 1000;

/* Nine concentric ridge rings (one per scan step), each a ring of line segments.
   Seeded by the target site so every scan etches a different fingerprint.
   Coordinates are rounded so server and client trig agree during hydration. */
function buildRings(seed) {
  const rand = mulberry32(seed);
  const rings = [];
  for (let ri = 0; ri < 9; ri++) {
    const r = 30 + ri * 12.5;
    const count = 64;
    const gaps = [];
    const gapCount = 1 + (rand() < 0.55 ? 1 : 0);
    for (let g = 0; g < gapCount; g++) {
      gaps.push({ start: rand() * Math.PI * 2, width: 0.14 + rand() * 0.22 });
    }
    const ring = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const inGap = gaps.some((gp) => {
        const d = (((a - gp.start) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        return d < gp.width;
      });
      if (inGap) continue;
      const len = r * 0.18;
      const tx = -Math.sin(a);
      const ty = Math.cos(a);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      ring.push({ x1: R3(x - (tx * len) / 2), y1: R3(y - (ty * len) / 2), x2: R3(x + (tx * len) / 2), y2: R3(y + (ty * len) / 2) });
    }
    rings.push(ring);
  }
  return rings;
}

export default function ScanProgress({ site, onCancel }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    let stepIdx = 0;
    let cancelled = false;

    function advance() {
      if (cancelled || stepIdx >= STEPS.length) return;
      const idx = stepIdx;
      setCurrentStep(idx);
      const t = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, STEPS[idx].id]);
        stepIdx++;
        advance();
      }, STEPS[idx].duration);
      timers.current.push(t);
    }

    advance();
    const clock = setInterval(() => setElapsed((e) => e + 100), 100);
    timers.current.push(clock);

    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current.forEach(clearInterval);
      timers.current = [];
    };
  }, []);

  const done = completedSteps.length;
  const pct = Math.min((done / STEPS.length) * 100, 100);

  const seed = useMemo(() => hashCode(site || 'unknown'), [site]);
  const rings = useMemo(() => buildRings(seed), [seed]);
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
    <div className="scan-wrap animate-fade-in">
      <div className="scan-card">
        <div className="scan-viz scan-fp-viz">
          <div className="scan-fp-glow" aria-hidden="true" />
          <svg viewBox="-150 -150 300 300" className="scan-fp-svg" aria-hidden="true">
            {rings.map((ring, ri) => {
              const revealed = ri < done || ri === currentStep;
              if (!revealed) return null;
              return (
                <g key={ri} className={ri < done ? 'fp-ring-done' : 'fp-ring-active'}>
                  {ring.map((s, i) => (
                    <line
                      key={i}
                      x1={s.x1}
                      y1={s.y1}
                      x2={s.x2}
                      y2={s.y2}
                      className="fp-seg scan-fp-seg"
                      stroke="var(--accent)"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      style={{ animationDelay: `${i * 12}ms` }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          <div className="scan-fp-core" />
        </div>

        <div className="scan-fp-caption font-mono">
          {done >= STEPS.length ? (
            <span className="scan-fp-complete">fingerprint #{fid}</span>
          ) : (
            <span>
              etching ridge ring {Math.min(done + 1, STEPS.length)} / {STEPS.length}
            </span>
          )}
        </div>

        <div className="scan-body">
          <div className="scan-head">
            <span className="scan-title">
              Scanning <span className="text-accent">{site}</span>
            </span>
            <span className="scan-timer">{(elapsed / 1000).toFixed(1)}s</span>
          </div>

          <div className="scan-bar-track">
            <div className="scan-bar-fill" style={{ width: pct + '%' }} />
          </div>

          <div className="scan-steps">
            {STEPS.map((step, i) => {
              const isDone = completedSteps.includes(step.id);
              const isActive = currentStep === i && !isDone;
              return (
                <div
                  key={step.id}
                  className={
                    'scan-step' +
                    (isDone ? ' done' : '') +
                    (isActive ? ' active' : '')
                  }
                >
                  <div className="scan-step-dot">
                    {isDone ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                    ) : isActive ? (
                      <div className="scan-pulse-dot" />
                    ) : (
                      <div className="scan-step-idle" />
                    )}
                  </div>
                  <span className="scan-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>

          {onCancel && (
            <button onClick={onCancel} className="mt-4 w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-muted transition-all duration-300 hover:border-border-strong hover:text-tag-red-fg active:scale-95">
              Cancel scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
