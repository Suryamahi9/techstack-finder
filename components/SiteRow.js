'use client';
import { useState } from 'react';
import InlineScan from './InlineScan';

// A single directory row: live screenshot, domain, description, tech tags,
// and a Scan button that runs the real detection engine inline.

export default function SiteRow({ site, tagKey = 'tags' }) {
  const [scanOpen, setScanOpen] = useState(false);
  const tags = site[tagKey] || site.tags || [];

  return (
    <div className="border border-border bg-bg">
      <div className="flex items-center gap-4 p-3">
        <a
          href={site.url}
          target="_blank"
          rel="noreferrer"
          className="block h-14 w-24 shrink-0 overflow-hidden border border-border bg-elevated"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/screenshot?url=${encodeURIComponent(site.url)}&viewport=desktop`}
            alt={`Screenshot of ${site.domain}`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        </a>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="truncate font-serif text-[15px] text-fg transition-colors hover:text-accent"
            >
              {site.domain}
            </a>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.15em] text-faint sm:block">{site.category}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">{site.desc}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="border border-border bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted">{t}</span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setScanOpen(!scanOpen)}
          className="shrink-0 border border-border px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
        >
          {scanOpen ? 'Close' : 'Scan'}
        </button>
      </div>
      {scanOpen && (
        <div className="border-t border-border p-4">
          <InlineScan url={site.url} buttonLabel="Re-scan" />
        </div>
      )}
    </div>
  );
}
