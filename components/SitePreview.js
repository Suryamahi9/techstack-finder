'use client';
import { useState } from 'react';

export default function SitePreview({ url, domain }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const screenshotUrl = `/api/screenshot?url=${encodeURIComponent(url)}`;

  return (
    <div className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span className="font-mono text-xs uppercase tracking-wider text-faint">Live Preview</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
        >
          Open site
          <svg className="h-3 w-3 opacity-50 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-bg">
        {!loaded && !error && (
          <div className="flex h-[300px] items-center justify-center sm:h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <span className="text-xs text-faint">Loading preview...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-[300px] items-center justify-center sm:h-[400px]">
            <div className="flex flex-col items-center gap-2 text-center">
              <svg className="h-8 w-8 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M10 10l4 4M14 10l-4 4" />
              </svg>
              <span className="text-xs text-faint">Preview unavailable</span>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-muted hover:border-border-strong hover:text-fg"
              >
                Visit {domain} directly
              </a>
            </div>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt={`Preview of ${domain}`}
          className={`w-full object-cover object-top transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
