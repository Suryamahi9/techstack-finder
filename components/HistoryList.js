'use client';
import { useState, useEffect } from 'react';

export default function HistoryList() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tsf-history');
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const stored = localStorage.getItem('tsf-history');
        if (stored) setHistory(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('storage', handler);
    window.addEventListener('tsf-history-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('tsf-history-updated', handler);
    };
  }, []);

  if (history.length === 0) return null;

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-faint">
        <span className="h-px w-6 bg-border-strong" />
        Recent scans
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((h) => (
          <a
            key={h.domain}
            href={`/results?site=${encodeURIComponent(h.domain)}`}
            className="group flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm transition-all hover:border-border-strong hover:bg-bg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={h.favicon}
              alt=""
              className="h-3.5 w-3.5 rounded-sm"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <span className="font-mono text-xs">{h.domain}</span>
            <span className="text-[10px] text-faint group-hover:text-muted">
              {h.total} techs
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
