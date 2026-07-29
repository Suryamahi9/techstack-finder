'use client';
import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { id: 'resolve', label: 'Resolving domain', duration: 800 },
  { id: 'fetch', label: 'Fetching page HTML', duration: 2200 },
  { id: 'headers', label: 'Analyzing headers & meta tags', duration: 1200 },
  { id: 'challenge', label: 'Checking for challenge pages', duration: 600 },
  { id: 'css', label: 'Deep scanning CSS & JS assets', duration: 2800 },
  { id: 'probes', label: 'Probing common paths', duration: 1800 },
  { id: 'browser', label: 'Running browser engine', duration: 3000 },
  { id: 'rules', label: 'Matching tech rules', duration: 1500 },
  { id: 'results', label: 'Building results', duration: 1000 },
];

export default function ScanProgress({ site, onCancel, streamUrl }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    if (streamUrl) return;
    let stepIdx = 0;

    function advance() {
      if (stepIdx >= STEPS.length) return;
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
      timers.current.forEach(clearTimeout);
      timers.current.forEach(clearInterval);
      timers.current = [];
    };
  }, [streamUrl]);

  useEffect(() => {
    if (!streamUrl) return;
    const es = new EventSource(streamUrl);
    es.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.step) {
          const idx = STEPS.findIndex((s) => s.id === data.step);
          if (idx >= 0) {
            setCurrentStep(idx);
            setCompletedSteps((prev) => {
              if (prev.includes(data.step)) return prev;
              return [...prev, data.step];
            });
          }
        }
      } catch {}
    });
    es.addEventListener('done', () => {
      setCurrentStep(STEPS.length);
      setCompletedSteps(STEPS.map((s) => s.id));
      es.close();
    });
    es.addEventListener('error', () => {
      es.close();
    });
    return () => { es.close(); };
  }, [streamUrl]);

  const done = completedSteps.length;
  const pct = Math.min((done / STEPS.length) * 100, 100);

  return (
    <div className="scan-wrap animate-fade-in">
      <div className="scan-card">
        <div className="scan-viz">
          <div className="scan-viz-bg" />
          <div className="scan-viz-line l1" />
          <div className="scan-viz-line l2" />
          <div className="scan-viz-line l3" />
          <div className="scan-viz-ring" />
          <div className="scan-viz-ring r2" />
          <div className="scan-viz-core" />
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
            <button onClick={onCancel} className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted transition-all duration-300 hover:border-red-500/30 hover:text-red-400 active:scale-95">
              Cancel scan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
