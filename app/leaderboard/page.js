'use client';
import { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function getScanHistory() {
  try { return JSON.parse(localStorage.getItem('tsf-scan-history') || '[]'); } catch { return []; }
}
function getTrends() {
  try { return JSON.parse(localStorage.getItem('tsf-scan-trends') || '[]'); } catch { return []; }
}

export default function LeaderboardPage() {
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [tab, setTab] = useState('techs');

  useEffect(() => {
    setHistory(getScanHistory());
    setTrends(getTrends());
  }, []);

  const techCounts = useMemo(() => {
    const counts = {};
    [...trends, ...history].forEach((e) => {
      if (e.techBreakdown) Object.entries(e.techBreakdown).forEach(([name, c]) => { counts[name] = (counts[name] || 0) + c; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25);
  }, [trends, history]);

  const siteCounts = useMemo(() => {
    const counts = {};
    history.forEach((e) => { counts[e.domain] = (counts[e.domain] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 25);
  }, [history]);

  const catCounts = useMemo(() => {
    const counts = {};
    [...trends, ...history].forEach((e) => {
      if (e.categoryBreakdown) Object.entries(e.categoryBreakdown).forEach(([name, c]) => { counts[name] = (counts[name] || 0) + c; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [trends, history]);

  const totalScans = history.length + trends.length;
  const uniqueTechs = techCounts.length;
  const uniqueSites = siteCounts.length;

  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted">{totalScans} scans · {uniqueTechs} unique technologies · {uniqueSites} sites scanned</p>
        </div>

        {totalScans === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <h3 className="text-lg font-semibold">No data yet</h3>
            <p className="mt-2 text-sm text-muted">Scan some sites to populate the leaderboard.</p>
            <a href="/" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20">Scan a site</a>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Total Scans', value: totalScans, color: 'accent' },
                { label: 'Unique Techs', value: uniqueTechs, color: 'sky-400' },
                { label: 'Sites Scanned', value: uniqueSites, color: 'emerald-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-elevated p-4 text-center">
                  <div className={`font-mono text-2xl font-bold text-${s.color}`}>{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-faint">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mb-4 flex gap-1.5">
              {[
                { id: 'techs', label: 'Top Technologies' },
                { id: 'sites', label: 'Most Scanned Sites' },
                { id: 'cats', label: 'Top Categories' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                    tab === t.id ? 'bg-accent/10 text-accent border border-accent/30' : 'text-faint hover:text-muted border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-elevated p-5">
              {tab === 'techs' && (
                <div className="space-y-2">
                  {techCounts.map(([name, count], i) => {
                    const max = techCounts[0]?.[1] || 1;
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-6 text-right font-mono text-xs text-faint">{i + 1}</span>
                        <span className="w-32 truncate text-sm text-fg">{name}</span>
                        <div className="relative flex-1 h-5 overflow-hidden rounded-md bg-border/50">
                          <div className="absolute inset-y-0 left-0 rounded-md bg-accent transition-all duration-500" style={{ width: `${(count / max) * 100}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-fg">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {tab === 'sites' && (
                <div className="space-y-2">
                  {siteCounts.map(([domain, count], i) => (
                    <div key={domain} className="flex items-center gap-3">
                      <span className="w-6 text-right font-mono text-xs text-faint">{i + 1}</span>
                      <a href={`/results?site=${encodeURIComponent(domain)}`} className="flex-1 truncate font-mono text-sm text-fg hover:text-accent">{domain}</a>
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">{count}x</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'cats' && (
                <div className="space-y-2">
                  {catCounts.map(([name, count], i) => {
                    const max = catCounts[0]?.[1] || 1;
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="w-6 text-right font-mono text-xs text-faint">{i + 1}</span>
                        <span className="w-40 truncate text-sm text-fg">{name}</span>
                        <div className="relative flex-1 h-5 overflow-hidden rounded-md bg-border/50">
                          <div className="absolute inset-y-0 left-0 rounded-md bg-sky-400 transition-all duration-500" style={{ width: `${(count / max) * 100}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-fg">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
