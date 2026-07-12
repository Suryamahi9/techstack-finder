'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const BOOKMARK_KEY = 'tsf-bookmarks';
const TRENDS_KEY = 'tsf-scan-trends';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]'); } catch { return []; }
}

function getTrends() {
  try { return JSON.parse(localStorage.getItem(TRENDS_KEY) || '[]'); } catch { return []; }
}

function getLastScanForDomain(domain) {
  const trends = getTrends();
  for (let i = trends.length - 1; i >= 0; i--) {
    if (trends[i].domain === domain) return trends[i];
  }
  return null;
}

function computeChanges(oldTechs, newTechs) {
  const oldSet = new Set(Object.keys(oldTechs || {}));
  const newSet = new Set(Object.keys(newTechs || {}));
  const added = [...newSet].filter((t) => !oldSet.has(t));
  const removed = [...oldSet].filter((t) => !newSet.has(t));
  const unchanged = [...newSet].filter((t) => oldSet.has(t));
  return { added, removed, unchanged };
}

function timeAgo(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DigestCard({ bookmark, scanResult, previousScan }) {
  const changes = computeChanges(
    previousScan?.techBreakdown || {},
    scanResult?.techBreakdown || {}
  );
  const hasChanges = changes.added.length > 0 || changes.removed.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bookmark.favicon}
          alt=""
          className="h-8 w-8 shrink-0 rounded-lg border border-border bg-bg p-1"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <a
              href={`/results?site=${encodeURIComponent(bookmark.url)}`}
              className="truncate font-semibold text-fg hover:text-accent transition-colors"
            >
              {bookmark.title || bookmark.domain}
            </a>
            {hasChanges ? (
              <span className="shrink-0 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                CHANGED
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                STABLE
              </span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-xs text-muted">{bookmark.domain}</div>
          <div className="mt-1 text-[11px] text-faint">
            Last scanned {timeAgo(previousScan?.scannedAt || bookmark.scannedAt)}
          </div>
        </div>
      </div>

      {scanResult && (
        <div className="mt-4 space-y-2">
          {/* Changes */}
          {changes.added.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                + Added ({changes.added.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {changes.added.map((t) => (
                  <span key={t} className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {changes.removed.length > 0 && (
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                - Removed ({changes.removed.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {changes.removed.map((t) => (
                  <span key={t} className="rounded-md bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-400 line-through">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!hasChanges && (
            <div className="text-xs text-faint">
              No changes detected — {changes.unchanged.length} technologies unchanged.
            </div>
          )}
          <div className="flex items-center gap-3 pt-1 text-xs text-muted">
            <span>{scanResult.total} techs</span>
            <span className="text-faint">·</span>
            <span className="text-sky-400">{scanResult.frontend} FE</span>
            <span className="text-emerald-400">{scanResult.backend} BE</span>
            <span className="text-amber-400">{scanResult.infra} Infra</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DigestPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [results, setResults] = useState({});
  const [previousScans, setPreviousScans] = useState({});
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const bm = getBookmarks();
    setBookmarks(bm);

    const prev = {};
    bm.forEach((b) => {
      prev[b.domain] = getLastScanForDomain(b.domain);
    });
    setPreviousScans(prev);
  }, []);

  const scanAll = useCallback(async () => {
    if (bookmarks.length === 0 || scanning) return;
    setScanning(true);
    setResults({});
    setProgress({ done: 0, total: bookmarks.length });

    for (let i = 0; i < bookmarks.length; i++) {
      const b = bookmarks[i];
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: b.url }),
        });
        const data = await res.json();
        if (data.success) {
          const techBreakdown = {};
          (data.categories || []).forEach((cat) => {
            cat.technologies.forEach((t) => {
              techBreakdown[t.name] = (techBreakdown[t.name] || 0) + 1;
            });
          });
          setResults((prev) => ({
            ...prev,
            [b.domain]: {
              total: data.summary?.total || 0,
              frontend: data.summary?.frontend || 0,
              backend: data.summary?.backend || 0,
              infra: data.summary?.infra || 0,
              techBreakdown,
            },
          }));
        }
      } catch {}
      setProgress({ done: i + 1, total: bookmarks.length });
    }

    setScanning(false);
  }, [bookmarks, scanning]);

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const resultCount = Object.keys(results).length;
  const changedCount = bookmarks.filter((b) => {
    const r = results[b.domain];
    const prev = previousScans[b.domain]?.techBreakdown;
    if (!r || !prev) return false;
    const changes = computeChanges(prev, r.techBreakdown);
    return changes.added.length > 0 || changes.removed.length > 0;
  }).length;

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Weekly Digest</h1>
          <p className="mt-1 text-sm text-muted">
            Re-scan your bookmarks and see what&apos;s changed.
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-lg font-semibold">No bookmarks</h3>
            <p className="mt-2 text-sm text-muted">
              Bookmark some sites first to track changes over time.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
            >
              Scan a site
            </a>
          </div>
        ) : (
          <>
            {/* Summary & controls */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <button
                onClick={scanAll}
                disabled={scanning}
                className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-all hover:brightness-110 disabled:opacity-40"
              >
                {scanning
                  ? `Scanning… ${progress.done}/${progress.total}`
                  : `Re-scan ${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`}
              </button>
              {resultCount > 0 && (
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-mono font-semibold text-accent">{resultCount}</span> scanned
                  <span className="text-faint">·</span>
                  <span className="font-mono font-semibold text-amber-400">{changedCount}</span> changed
                </div>
              )}
            </div>

            {/* Progress */}
            {scanning && (
              <div className="mb-6 animate-fade-up">
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-right font-mono text-[10px] text-faint">{pct}%</div>
              </div>
            )}

            {/* Cards */}
            <div className="space-y-4">
              {bookmarks.map((b) => (
                <DigestCard
                  key={b.domain}
                  bookmark={b}
                  scanResult={results[b.domain] || null}
                  previousScan={previousScans[b.domain] || null}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
