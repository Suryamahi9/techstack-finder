'use client';
import { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getScanHistory, getHistoryForDomain, diffScans, clearScanHistory } from '../../lib/scan-history';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [compareIdx, setCompareIdx] = useState(0);
  const [diffResult, setDiffResult] = useState(null);

  useEffect(() => {
    setHistory(getScanHistory());
    const handler = () => setHistory(getScanHistory());
    window.addEventListener('tsf-scan-history-updated', handler);
    return () => window.removeEventListener('tsf-scan-history-updated', handler);
  }, []);

  const domains = [...new Set(history.map((h) => h.domain))];
  const domainHistory = useMemo(() => selectedDomain ? history.filter((h) => h.domain === selectedDomain) : [], [selectedDomain, history]);

  useEffect(() => {
    if (domainHistory.length >= 2) {
      setCompareIdx(1);
      setDiffResult(diffScans(domainHistory[1], domainHistory[0]));
    } else {
      setDiffResult(null);
    }
  }, [selectedDomain, domainHistory]);

  const handleCompare = (idx) => {
    setCompareIdx(idx);
    setDiffResult(diffScans(domainHistory[idx], domainHistory[0]));
  };

  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
            <p className="mt-1 text-sm text-muted">
              {history.length} snapshots across {domains.length} domains
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => { clearScanHistory(); setHistory([]); }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
            >
              Clear All
            </button>
          )}
        </div>

        {domains.length === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">No scan history yet</h3>
            <p className="mt-2 text-sm text-muted">
              Scan some sites to start building a history of detected technologies.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
            >
              Scan a site
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-elevated p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
                Domains
              </h2>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => {
                  const count = getHistoryForDomain(d).length;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDomain(d)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedDomain === d
                          ? 'border-accent/30 bg-accent/10 text-accent'
                          : 'border-border bg-bg text-muted hover:border-border-strong hover:text-fg'
                      }`}
                    >
                      {d}
                      <span className="ml-1.5 rounded-full bg-border/50 px-1.5 py-0.5 text-[10px] font-mono">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDomain && domainHistory.length >= 2 && (
              <div className="rounded-2xl border border-border bg-elevated p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
                  Compare Scans
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>Compare</span>
                  <select
                    value={compareIdx}
                    onChange={(e) => handleCompare(parseInt(e.target.value))}
                    className="rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-fg focus:border-accent focus:outline-none"
                  >
                    {domainHistory.slice(1).map((h, i) => {
                      const d = new Date(h.scannedAt);
                      return (
                        <option key={i} value={i + 1}>
                          {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({h.total} techs)
                        </option>
                      );
                    })}
                  </select>
                  <span>against</span>
                  <span className="rounded-lg border border-border bg-bg px-3 py-1.5 font-medium text-fg">
                    Latest ({domainHistory[0]?.total} techs)
                  </span>
                </div>
              </div>
            )}

            {selectedDomain && domainHistory.length < 2 && (
              <div className="rounded-2xl border border-border bg-elevated/50 p-6 text-center">
                <p className="text-sm text-muted">
                  Scan <span className="font-medium text-fg">{selectedDomain}</span> again to compare with the previous scan.
                </p>
                <a
                  href={`/results?site=${encodeURIComponent(selectedDomain)}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
                >
                  Re-scan now
                </a>
              </div>
            )}

            {diffResult && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">+{diffResult.added.length}</div>
                    <div className="mt-1 text-xs font-medium text-emerald-400">Added</div>
                  </div>
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">-{diffResult.removed.length}</div>
                    <div className="mt-1 text-xs font-medium text-red-400">Removed</div>
                  </div>
                  <div className="rounded-xl border border-border bg-elevated p-4 text-center">
                    <div className="text-2xl font-bold text-fg">{diffResult.unchanged.length}</div>
                    <div className="mt-1 text-xs font-medium text-muted">Unchanged</div>
                  </div>
                </div>

                {diffResult.added.length > 0 && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Added Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {diffResult.added.map((t) => (
                        <span key={t.name} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                          +{t.name}
                          {t.version && <span className="font-mono text-[10px] opacity-70">v{t.version}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {diffResult.removed.length > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-red-400">
                      Removed Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {diffResult.removed.map((t) => (
                        <span key={t.name} className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          -{t.name}
                          {t.version && <span className="font-mono text-[10px] opacity-70">v{t.version}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {diffResult.unchanged.length > 0 && (
                  <div className="rounded-2xl border border-border bg-elevated/50 p-5">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Unchanged
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {diffResult.unchanged.map((t) => (
                        <span key={t.name} className="rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] text-muted">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedDomain && (
              <div className="rounded-2xl border border-border bg-elevated p-5">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
                  Full Timeline
                </h2>
                <div className="relative">
                  <div className="absolute left-[14px] top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-1">
                    {domainHistory.map((entry, i) => {
                      const d = new Date(entry.scannedAt);
                      const isLatest = i === 0;
                      return (
                        <div
                          key={entry.id}
                          className="group relative flex items-start gap-4 py-2.5 pl-1 animate-fade-up"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <div className="relative z-10 mt-1 flex shrink-0 items-center justify-center">
                            <div
                              className={`h-3 w-3 rounded-full border-2 transition-all group-hover:scale-125 ${
                                isLatest ? 'bg-accent border-accent' : 'bg-bg border-border'
                              }`}
                            />
                          </div>
                          <div className="flex-1 rounded-lg border border-transparent px-3 py-2 transition-all group-hover:border-border group-hover:bg-bg/50">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-faint">
                                {d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isLatest && (
                                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Latest</span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                              <span>{entry.total} techs</span>
                              <span className="text-sky-400">{entry.frontend} FE</span>
                              <span className="text-emerald-400">{entry.backend} BE</span>
                              <span className="text-amber-400">{entry.infra} Infra</span>
                            </div>
                            {!isLatest && (
                              <a
                                href={`/results?site=${encodeURIComponent(entry.url || entry.domain)}`}
                                className="mt-1 inline-block text-[10px] text-accent hover:underline"
                              >
                                View this scan →
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
