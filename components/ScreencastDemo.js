'use client';
import { useState, useEffect } from 'react';
import InlineScan from './InlineScan';

const STAGES = [
  { label: 'Resolving DNS + fetching HTML', ms: 700 },
  { label: 'Parsing markup & inline scripts', ms: 900 },
  { label: 'Scanning CSS / JS assets', ms: 1100 },
  { label: 'Matching 10,000+ detection rules', ms: 1200 },
  { label: 'Compiling report', ms: 800 },
];

// Auto-playing "screencast": runs a real scan of a sample URL while stepping
// through the detection pipeline, then shows the live result.

export default function ScreencastDemo({ url = 'https://example.com' }) {
  const [stage, setStage] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    STAGES.forEach((s, i) => {
      timers.push(setTimeout(() => { if (!cancelled) setStage(i); }, s.ms));
    });
    const run = async () => {
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Scan failed');
        if (!cancelled) { setResult(json); setStage(STAGES.length); }
      } catch (e) {
        if (!cancelled) { setError(e.message || 'Failed to run scan'); setStage(STAGES.length); }
      }
    };
    run();
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [url]);

  return (
    <div className="rounded-lg border border-border bg-bg">
      <div className="flex items-center gap-2 border-b border-border bg-elevated px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-tag-red-bg ring-1 ring-tag-red-fg" />
        <span className="h-2.5 w-2.5 rounded-full bg-tag-yellow-bg ring-1 ring-tag-yellow-fg" />
        <span className="h-2.5 w-2.5 rounded-full bg-tag-green-bg ring-1 ring-tag-green-fg" />
        <span className="ml-2 truncate font-mono text-[11px] text-muted">TechStack Finder — live scan: {url}</span>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-2">
          {STAGES.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[9px] ${
                stage > i ? 'border-accent bg-accent text-bg'
                : stage === i ? 'animate-pulse border-accent text-accent'
                : 'border-border text-faint'
              }`}>
                {stage > i ? '✓' : i + 1}
              </span>
              <span className={`font-mono text-[11px] ${stage >= i ? 'text-fg' : 'text-faint'}`}>{s.label}</span>
              {stage === i && <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />}
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-tag-red-fg">{error}</p>}

        {result && (
          <div className="mt-6">
            <div className="flex items-baseline justify-between border-b border-border pb-2">
              <span className="font-serif text-lg text-fg">{result.site?.domain}</span>
              <span className="font-mono text-[11px] text-faint">{result.summary?.total} technologies</span>
            </div>
            <div className="mt-4 space-y-3">
              {(result.categories || []).slice(0, 4).map((cat) => (
                <div key={cat.category}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{cat.category}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {cat.technologies.slice(0, 6).map((t, ti) => (
                      <span key={`${t.name}-${ti}`} className="border border-border bg-surface px-2 py-1 font-mono text-[10px] text-muted">{t.name}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 border-t border-border pt-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Run it on any site</p>
          <InlineScan />
        </div>
      </div>
    </div>
  );
}
