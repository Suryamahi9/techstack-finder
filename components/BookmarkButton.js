'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const STORAGE_KEY = 'tsf-bookmarks';
const MAX_BOOKMARKS = 20;

function getLocalBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function BookmarkButton({ data }) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!data?.site?.domain) return;

    if (session) {
      fetch('/api/bookmarks')
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setSaved(res.items.some((b) => b.domain === data.site.domain));
          }
        })
        .catch(() => {});
    } else {
      const bookmarks = getLocalBookmarks();
      setSaved(bookmarks.some((b) => b.domain === data.site.domain));
    }
  }, [data?.site?.domain, session]);

  const toggle = async () => {
    if (!data?.site?.domain) return;

    const payload = {
      domain: data.site.domain,
      url: data.site.url,
      favicon: data.site.favicon,
      name: data.site.title,
      scannedAt: data.site.scannedAt,
      total: data.summary?.total || 0,
      categories: data.summary?.categories || 0,
      frontend: data.summary?.frontend || 0,
      backend: data.summary?.backend || 0,
      infra: data.summary?.infra || 0,
    };

    if (session) {
      if (saved) {
        await fetch(`/api/bookmarks?domain=${encodeURIComponent(data.site.domain)}`, { method: 'DELETE' }).catch(() => {});
        setSaved(false);
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
        if (res?.ok) setSaved(true);
      }
    } else {
      const bookmarks = getLocalBookmarks();
      const idx = bookmarks.findIndex((b) => b.domain === data.site.domain);
      if (idx !== -1) {
        bookmarks.splice(idx, 1);
        setSaved(false);
      } else {
        if (bookmarks.length >= MAX_BOOKMARKS) bookmarks.pop();
        bookmarks.unshift(payload);
        setSaved(true);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
    window.dispatchEvent(new Event('tsf-bookmarks-updated'));
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 font-mono text-xs text-muted hover:border-border-strong hover:text-fg transition-colors"
      title={saved ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      {saved ? (
        <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
      {saved ? 'Saved' : 'Bookmark'}
    </button>
  );
}
