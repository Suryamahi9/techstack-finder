'use client';
import { useState } from 'react';

export default function MultiPageScan({ domain }) {
  const [pages, setPages] = useState('/');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!domain) return null;

  const scan = async () => {
    const paths = pages.split('\n').map((p) => p.trim()).filter(Boolean);
    if (!paths.length) return;
    setScanning(true);
    setResults(null);
    setError(null);

    const allResults = [];
    for (const path of paths) {
      const url = path.startsWith('http') ? path : `https://${domain}${path.startsWith('/') ? '' : '/'}${path}`;
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          const data = await res.json();
          allResults.push({ path, url, success: data.success, total: data.summary?.total || 0, categories: data.categories || [], techs: (data.categories || []).flatMap((c) => c.technologies.map((t) => t.name)) });
        } else {
          allResults.push({ path, url, success: false, total: 0, error: `HTTP ${res.status}` });
        }
      } catch (e) {
        allResults.push({ path, url, success: false, total: 0, error: e.message });
      }
    }

    setResults(allResults);
    setScanning(false);
  };

  const allTechs = results ? [...new Set(results.filter((r) => r.success).flatMap((r) => r.techs))].sort() : [];
  const techFrequency = results ? allTechs.map((tech) => ({ tech, count: results.filter((r) => r.techs?.includes(tech)).length, pct: Math.round((results.filter((r) => r.techs?.includes(tech)).length / Math.max(results.filter((r) => r.success).length, 1)) * 100) })) : [];

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0H3m6 0h12M3 9v10a2 2 0 0 0 2 2h4m-6-12h12m0 0v10a2 2 0 0 1-2 2h-4" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Multi-Page Scan</h3>
      </div>
      <p className="mb-3 text-[11px] text-muted">Scan multiple pages to discover which technologies are used site-wide.</p>
      <textarea
        value={pages}
        onChange={(e) => setPages(e.target.value)}
        rows={4}
        placeholder={'/about\n/blog\n/pricing\n/contact\n/api/docs'}
        className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-2.5 font-mono text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none resize-none"
      />
      <button onClick={scan} disabled={scanning} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:brightness-110 disabled:opacity-40">
        {scanning ? 'Scanning pages...' : `Scan ${pages.split('\n').filter((p) => p.trim()).length} pages`}
      </button>

      {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

      {results && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-faint">Page Results</div>
            <div className="space-y-1.5">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`inline-block h-2 w-2 rounded-full ${r.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="font-mono text-muted truncate max-w-[200px]">{r.path}</span>
                  <span className="ml-auto text-faint">{r.success ? `${r.total} techs` : r.error}</span>
                </div>
              ))}
            </div>
          </div>

          {techFrequency.length > 0 && (
            <div className="rounded-xl border border-border bg-bg/50 p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-faint">Site-Wide Technologies ({allTechs.length})</div>
              <div className="max-h-[200px] overflow-y-auto space-y-1">
                {techFrequency.sort((a, b) => b.count - a.count).map(({ tech, count, pct }) => (
                  <div key={tech} className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-muted w-[140px] truncate">{tech}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-mono text-faint w-14 text-right">{count}/{results.filter((r) => r.success).length} ({pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
