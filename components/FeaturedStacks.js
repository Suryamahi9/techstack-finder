'use client';
import { useState, useEffect } from 'react';

// "Featured stacks" — a Skiper53-style hover-expand image accordion.
// Hovering a row expands it into a big live screenshot of the site, with its
// tech stack chips overlaid at the bottom. Screenshots lazy-load only when a
// row is expanded (one request at a time), then stay cached in the DOM.

const SITES = [
  { domain: 'vercel.com', url: 'https://vercel.com', tag: 'Web platform', tech: 'Next.js · React · TypeScript' },
  { domain: 'linear.app', url: 'https://linear.app', tag: 'Productivity', tech: 'Next.js · React · GraphQL' },
  { domain: 'stripe.com', url: 'https://stripe.com', tag: 'Payments', tech: 'React · Vue · Node.js' },
  { domain: 'airbnb.com', url: 'https://airbnb.com', tag: 'Travel', tech: 'React · Next.js · Ruby on Rails' },
  { domain: 'notion.so', url: 'https://notion.so', tag: 'Productivity', tech: 'React · Electron · Next.js' },
  { domain: 'openai.com', url: 'https://openai.com', tag: 'AI', tech: 'Next.js · React · Tailwind' },
];

function SiteShot({ site, active }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error

  useEffect(() => {
    if (active && state === 'idle') setState('loading');
  }, [active, state]);

  const showImg = active || state === 'done';
  const loading = active && (state === 'loading' || state === 'idle');

  return (
    <div className="relative h-64 w-full overflow-hidden bg-elevated sm:h-[26rem]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
            <span className="font-mono text-[10px] text-faint">capturing {site.domain}...</span>
          </div>
        </div>
      )}

      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/screenshot?url=${encodeURIComponent(site.url)}&viewport=desktop`}
          alt={`Screenshot of ${site.domain}`}
          className={`h-full w-full object-cover object-top transition-opacity duration-500 ${state === 'done' ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setState('done')}
          onError={() => setState('error')}
        />
      )}

      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-elevated">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Preview unavailable</span>
          <a href={site.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-muted underline underline-offset-2 hover:text-fg">
            Open {site.domain}
          </a>
        </div>
      )}

      {state === 'done' && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-4 pt-12">
          <div className="flex flex-wrap items-center gap-1.5">
            {site.tech.split(' · ').map((t) => (
              <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[9px] font-medium text-white/95 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeaturedStacks() {
  const [active, setActive] = useState(1);
  return (
    <div className="flex flex-col gap-2">
      {SITES.map((site, i) => {
        const isActive = active === i;
        return (
          <div
            key={site.domain}
            role="button"
            tabIndex={0}
            aria-expanded={isActive}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i); } }}
            className={`group relative cursor-pointer overflow-hidden rounded-3xl border transition-colors duration-300 active:scale-[0.98] ${
              isActive ? 'border-fg' : 'border-border bg-bg/70 hover:border-border-strong'
            }`}
          >
            {/* Always-visible strip */}
            <div className="relative z-10 flex h-14 items-center gap-4 px-5 sm:px-7">
              <span className={`font-mono text-[11px] ${isActive ? 'text-fg' : 'text-faint'}`}># {String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1 text-sm font-semibold tracking-tight text-fg">{site.domain}</span>
              <span className={`hidden font-mono text-[10px] sm:block ${isActive ? 'text-muted' : 'text-faint'}`}>{site.tag}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
            {/* Expandable screenshot panel */}
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isActive ? '1fr' : '0fr' }}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-border/60">
                  <SiteShot site={site} active={isActive} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
