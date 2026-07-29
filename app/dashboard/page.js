'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';

const STORAGE_KEY = 'tsf-pinned-widgets';
const HISTORY_KEY = 'tsf-scan-history';

const WIDGET_MAP = {
  'health-score': { title: 'Health Score', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#c5fb45' },
  'tech-radar': { title: 'Tech Radar', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2', color: '#60a5fa' },
  'cost-estimator': { title: 'Cost Estimator', icon: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', color: '#f59e0b' },
  'complexity': { title: 'Complexity Score', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', color: '#a78bfa' },
  'fingerprint': { title: 'Stack Fingerprint', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z', color: '#34d399' },
  'competitor-radar': { title: 'Competitor Radar', icon: 'M21 12a9 9 0 1 1-9-9', color: '#f472b6' },
  'market-trends': { title: 'Market Trends', icon: 'M2 20h20M6 16v-4M12 16v-8M18 16V8', color: '#fb923c' },
};

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function getPinned() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export default function Dashboard() {
  const [pinned, setPinned] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setPinned(getPinned());
    setHistory(getHistory().slice(0, 5));
  }, []);

  const removeWidget = (id) => {
    const list = getPinned().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    setPinned(list);
  };

  return (
    <div className="relative min-h-screen">
      <Header />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/[0.02] via-transparent to-transparent" />
      </div>
      <main id="main-content" className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-muted">Your pinned widgets and recent scans</p>
          </div>
        </div>

        {pinned.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <svg className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">No pinned widgets</h2>
            <p className="mt-2 text-sm text-muted">Pin widgets from any scan results page by clicking the &quot;Pin&quot; button next to each feature.</p>
            <Link href="/" className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-bg">Scan a website to start</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinned.map((widget) => {
              const meta = WIDGET_MAP[widget.id] || { title: widget.title, icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', color: '#c5fb45' };
              return (
                <div key={widget.id} className="group relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.12]">
                  <button onClick={() => removeWidget(widget.id)} className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 text-muted hover:text-red-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: meta.color + '15' }}>
                    <svg className="h-5 w-5" style={{ color: meta.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d={meta.icon} />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold">{meta.title}</h3>
                  <p className="mt-1 text-xs text-muted">Scans will populate this widget with live data.</p>
                </div>
              );
            })}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold">Recent scans</h2>
            <div className="space-y-2">
              {history.map((item, i) => (
                <Link key={i} href={`/results?site=${encodeURIComponent(item.domain)}`} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-accent/20 hover:bg-accent/[0.02]">
                  <img src={item.favicon || `https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`} alt="" className="h-5 w-5 rounded" />
                  <span className="flex-1 text-sm font-medium">{item.domain}</span>
                  <span className="text-xs text-muted">{item.total || 0} tech{(item.total || 0) !== 1 ? 's' : ''}</span>
                  <svg className="h-3.5 w-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold">Available widgets</h3>
          <p className="mt-1 text-xs text-muted">Pin any of these from a scan results page to see it here.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(WIDGET_MAP).map(([id, meta]) => {
              const isPinned = pinned.some((p) => p.id === id);
              return (
                <span key={id} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${isPinned ? 'border-accent/20 text-accent' : 'border-white/10 text-muted'}`}>
                  <svg className="h-3 w-3" style={{ color: meta.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d={meta.icon} /></svg>
                  {meta.title}
                  {isPinned && <span className="text-accent">&#183; Pinned</span>}
                </span>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
