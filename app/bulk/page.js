'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

async function scanOne(url) {
  const res = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json();
  return { url, ...data };
}

export default function BulkScanPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const urls = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

  const startBulk = async () => {
    if (urls.length === 0 || scanning) return;
    setScanning(true);
    setResults([]);
    setProgress({ done: 0, total: urls.length });

    const completed = [];
    for (let i = 0; i < urls.length; i++) {
      try {
        const result = await scanOne(urls[i]);
        completed.push(result);
      } catch {
        completed.push({ url: urls[i], success: false, error: 'Scan failed' });
      }
      setResults([...completed]);
      setProgress({ done: i + 1, total: urls.length });
    }

    setScanning(false);
  };

  const exportBulk = () => {
    const rows = [['URL', 'Success', 'Total Techs', 'Frontend', 'Backend', 'Infra', 'Categories', 'Error']];
    results.forEach((r) => {
      rows.push([
        r.url,
        r.success ? 'Yes' : 'No',
        r.summary?.total || 0,
        r.summary?.frontend || 0,
        r.summary?.backend || 0,
        r.summary?.infra || 0,
        r.summary?.categories || 0,
        r.error || '',
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-scan-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Bulk Scan</h1>
          <p className="mt-1 text-sm text-muted">
            Paste multiple URLs (one per line) and scan them all at once.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-elevated p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={"https://github.com\nhttps://vercel.com\nhttps://stripe.com\nhttps://shopify.com\nhttps://netflix.com"}
            disabled={scanning}
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none disabled:opacity-50"
          />

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={startBulk}
              disabled={urls.length === 0 || scanning}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:opacity-40"
            >
              {scanning
                ? `Scanning… ${progress.done}/${progress.total}`
                : `Scan ${urls.length} URL${urls.length !== 1 ? 's' : ''}`}
            </button>
            {results.length > 0 && !scanning && (
              <button
                onClick={exportBulk}
                className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-4 py-2 text-sm text-muted hover:border-border-strong hover:text-fg transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
            )}
            <span className="ml-auto font-mono text-xs text-faint">
              {urls.length} URL{urls.length !== 1 ? 's' : ''} detected
            </span>
          </div>

          {/* Progress bar */}
          {scanning && (
            <div className="mt-4 animate-fade-up">
              <div className="flex items-center justify-between text-xs text-muted mb-2">
                <span>Progress</span>
                <span className="font-mono">{progress.done}/{progress.total} ({pct}%)</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            {results.map((r, i) => (
              <div
                key={`${r.url}-${i}`}
                className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {r.success ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      ) : (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
                      )}
                      <a
                        href={`/results?site=${encodeURIComponent(r.url)}`}
                        className="truncate font-mono text-sm font-medium text-fg hover:text-accent transition-colors"
                      >
                        {r.url}
                      </a>
                    </div>
                    {r.error && (
                      <div className="mt-1 text-xs text-red-400">{r.error}</div>
                    )}
                  </div>
                  {r.success && (
                    <div className="flex shrink-0 items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-accent">{r.summary?.total || 0}</span>
                        <span className="text-faint">techs</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        <span className="text-faint">{r.summary?.frontend || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-faint">{r.summary?.backend || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span className="text-faint">{r.summary?.infra || 0}</span>
                      </span>
                    </div>
                  )}
                </div>

                {r.success && r.categories && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.categories.slice(0, 8).map((cat) => (
                      <span
                        key={cat.category}
                        className="rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] text-muted"
                      >
                        {cat.category} ({cat.technologies.length})
                      </span>
                    ))}
                    {r.categories.length > 8 && (
                      <span className="rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] text-faint">
                        +{r.categories.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
