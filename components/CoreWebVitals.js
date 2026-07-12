'use client';
import { useState, useEffect } from 'react';

function VitalCard({ label, value, unit, rating, description, threshold }) {
  const ratingColors = {
    good: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    needsImprovement: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
    poor: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400' },
  };
  const r = ratingColors[rating] || ratingColors.good;

  return (
    <div className={`rounded-xl border ${r.border} ${r.bg} p-4`}>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${r.dot}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-faint">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`font-mono text-2xl font-bold ${r.text}`}>{value}</span>
        <span className="font-mono text-xs text-muted">{unit}</span>
      </div>
      <p className="mt-1.5 text-[11px] text-muted leading-relaxed">{description}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-faint">
        <span>Good: {threshold.good}</span>
        <span className="text-border">|</span>
        <span>Poor: {threshold.poor}</span>
      </div>
    </div>
  );
}

export default function CoreWebVitals({ url }) {
  const [vitals, setVitals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVitals = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setVitals(data.vitals);
      } else {
        setError(data.error || 'Failed to measure vitals');
      }
    } catch (e) {
      setError('Could not reach vitals API');
    } finally {
      setLoading(false);
    }
  };

  if (!url) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Core Web Vitals</h3>
        </div>
        <button
          onClick={fetchVitals}
          disabled={loading}
          className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent transition-all hover:bg-accent/20 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" opacity="0.3" />
                <path d="M12 3a9 9 0 0 1 9 9" />
              </svg>
              Measuring...
            </span>
          ) : vitals ? 'Re-measure' : 'Measure now'}
        </button>
      </div>

      {!vitals && !loading && !error && (
        <div className="rounded-xl border border-dashed border-border bg-bg/30 p-6 text-center">
          <svg className="mx-auto mb-3 h-8 w-8 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <p className="text-xs text-muted">
            Click &quot;Measure now&quot; to load the page in a real browser and capture performance metrics.
          </p>
          <p className="mt-1 text-[10px] text-faint">Takes ~10-15 seconds</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={fetchVitals} className="mt-2 text-[10px] text-accent hover:underline">
            Try again
          </button>
        </div>
      )}

      {vitals && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <VitalCard
            label="LCP"
            value={vitals.lcp !== null ? (vitals.lcp / 1000).toFixed(2) : '—'}
            unit="s"
            rating={vitals.lcp !== null ? (vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'needsImprovement' : 'poor') : 'good'}
            description="Largest Contentful Paint — time for the largest visible element to render"
            threshold={{ good: '≤ 2.5s', poor: '> 4.0s' }}
          />
          <VitalCard
            label="CLS"
            value={vitals.cls !== null ? vitals.cls.toFixed(3) : '—'}
            unit=""
            rating={vitals.cls !== null ? (vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'needsImprovement' : 'poor') : 'good'}
            description="Cumulative Layout Shift — visual stability of the page as it loads"
            threshold={{ good: '≤ 0.1', poor: '> 0.25' }}
          />
          <VitalCard
            label="TBT"
            value={vitals.tbt !== null ? vitals.tbt.toFixed(0) : '—'}
            unit="ms"
            rating={vitals.tbt !== null ? (vitals.tbt <= 200 ? 'good' : vitals.tbt <= 600 ? 'needsImprovement' : 'poor') : 'good'}
            description="Total Blocking Time — total time main thread was blocked during page load"
            threshold={{ good: '≤ 200ms', poor: '> 600ms' }}
          />
        </div>
      )}
    </div>
  );
}
