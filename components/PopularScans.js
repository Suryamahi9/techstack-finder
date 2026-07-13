'use client';
import { useState, useEffect } from 'react';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem('tsf-history') || '[]');
  } catch {
    return [];
  }
}

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('tsf-bookmarks') || '[]');
  } catch {
    return [];
  }
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PopularScans() {
  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
    setBookmarks(getBookmarks());

    const handler = () => {
      setHistory(getHistory());
      setBookmarks(getBookmarks());
    };
    window.addEventListener('tsf-history-updated', handler);
    window.addEventListener('tsf-bookmarks-updated', handler);
    return () => {
      window.removeEventListener('tsf-history-updated', handler);
      window.removeEventListener('tsf-bookmarks-updated', handler);
    };
  }, []);

  const recent = history.slice(0, 8);
  const saved = bookmarks.slice(0, 4);

  if (recent.length === 0 && saved.length === 0) return null;

  return (
    <div className="mt-20 animate-fade-up">
      <div className="">
        {saved.length > 0 && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">Bookmarked</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {saved.map((b) => (
                <a
                  key={b.domain}
                  href={`/results?site=${encodeURIComponent(b.url)}`}
                  className="card-hover group flex items-center gap-3 rounded-xl border border-border bg-elevated/60 px-4 py-3 transition-all hover:border-accent/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.favicon}
                    alt=""
                    className="h-6 w-6 rounded-md border border-border bg-bg p-0.5"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg group-hover:text-accent transition-colors">
                      {b.title || b.domain}
                    </div>
                    <div className="font-mono text-[11px] text-faint">{b.total} techs</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">Recent Scans</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((h) => (
                <a
                  key={`${h.domain}-${h.scannedAt}`}
                  href={`/results?site=${encodeURIComponent(h.url || h.domain)}`}
                  className="card-hover group flex items-center gap-2 rounded-lg border border-border bg-elevated/60 px-3 py-2 text-sm transition-all hover:border-accent/30"
                >
                  <span className="font-medium text-muted group-hover:text-accent transition-colors">
                    {h.domain}
                  </span>
                  <span className="text-[10px] text-faint">{timeAgo(h.scannedAt)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
