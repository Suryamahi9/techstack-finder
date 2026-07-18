'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const STORAGE_KEY = 'tsf-bookmarks';

function getLocalBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function BookmarksPage() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (session) {
        try {
          const res = await fetch('/api/bookmarks');
          const data = await res.json();
          if (data.success) {
            setBookmarks(data.items.map((b) => ({
              domain: b.domain,
              url: b.url,
              favicon: b.favicon,
              title: b.name,
              scannedAt: b.createdAt,
              total: b.total || 0,
              categories: b.categories || 0,
              frontend: b.frontend || 0,
              backend: b.backend || 0,
              infra: b.infra || 0,
            })));
          }
        } catch {
          setBookmarks(getLocalBookmarks());
        }
      } else {
        setBookmarks(getLocalBookmarks());
      }
      setLoading(false);
    };
    load();

    const handler = () => {
      if (!session) setBookmarks(getLocalBookmarks());
    };
    window.addEventListener('tsf-bookmarks-updated', handler);
    return () => window.removeEventListener('tsf-bookmarks-updated', handler);
  }, [session]);

  const remove = async (domain) => {
    if (session) {
      await fetch(`/api/bookmarks?domain=${encodeURIComponent(domain)}`, { method: 'DELETE' }).catch(() => {});
    }
    setBookmarks((prev) => prev.filter((b) => b.domain !== domain));
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('tsf-bookmarks-updated'));
  };

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Bookmarks</h1>
          <p className="mt-1 text-sm text-muted">
            {bookmarks.length} saved {bookmarks.length === 1 ? 'report' : 'reports'}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-muted">Loading bookmarks...</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-lg font-semibold">No bookmarks yet</h3>
            <p className="mt-2 text-sm text-muted">
              Scan a site and click the Bookmark button to save it here.
            </p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
            >
              Scan a site
            </a>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookmarks.map((b) => (
              <div
                key={b.domain}
                className="card-hover group relative rounded-2xl border border-border bg-elevated p-5 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.favicon}
                    alt=""
                    className="h-8 w-8 rounded-lg border border-border bg-bg p-1"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/results?site=${encodeURIComponent(b.url)}`}
                      className="block"
                    >
                      <h3 className="truncate font-semibold text-fg group-hover:text-accent transition-colors">
                        {b.title || b.domain}
                      </h3>
                    </a>
                    <a
                      href={`/results?site=${encodeURIComponent(b.url)}`}
                      className="mt-0.5 block font-mono text-xs text-muted hover:text-accent transition-colors"
                    >
                      {b.domain}
                    </a>
                  </div>
                  <button
                    onClick={() => remove(b.domain)}
                    className="shrink-0 rounded-md p-1 text-faint hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Remove bookmark"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-accent">{b.total}</span>
                    techs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    {b.frontend}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {b.backend}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {b.infra}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
                  <span>{b.categories} categories</span>
                  <span>{new Date(b.scannedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
