'use client';
import { useState } from 'react';

// A working scan box: paste any URL, run the real detection engine, and see
// the detected technologies grouped by category. Used across product pages.

export default function InlineScan({ url: initialUrl = '', placeholder = 'https://example.com', buttonLabel = 'Scan site', className = '' }) {
  const [input, setInput] = useState(initialUrl);
  const [state, setState] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    const u = (input || initialUrl).trim();
    if (!u) return;
    setState('loading');
    setError('');
    setData(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Scan failed (HTTP ${res.status})`);
      setData(json);
      setState('done');
    } catch (e) {
      setError(e.message || 'Failed to scan site.');
      setState('error');
    }
  };

  return (
    <div className={className}>
      <form
        onSubmit={(e) => { e.preventDefault(); run(); }}
        className="flex max-w-xl flex-col gap-2 sm:flex-row"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-border-strong focus:outline-none"
          aria-label="URL to scan"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="shrink-0 bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === 'loading' ? 'Scanning…' : buttonLabel}
        </button>
      </form>

      {state === 'loading' && (
        <div className="mt-6 flex items-center gap-3 border border-border bg-bg px-4 py-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
          <span className="font-mono text-[11px] text-muted">detecting technologies…</span>
        </div>
      )}

      {state === 'error' && (
        <div className="mt-6 border border-tag-red-bg bg-tag-red-bg px-4 py-3 text-sm text-tag-red-fg">
          {error}
        </div>
      )}

      {state === 'done' && data && (
        <div className="mt-6 max-w-2xl">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <span className="font-serif text-lg text-fg">{data.site?.domain}</span>
            <span className="font-mono text-[11px] text-faint">{data.summary?.total} technologies</span>
          </div>
          <div className="mt-4 space-y-4">
            {(data.categories || []).map((cat) => (
              <div key={cat.category}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{cat.category}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {cat.technologies.map((t, ti) => (
                    <span key={`${t.name}-${ti}`} className="border border-border bg-surface px-2 py-1 font-mono text-[10px] text-muted">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
