'use client';

import { useState } from 'react';
import { countrySites } from '@/lib/trends-data';
import { formatCount } from '@/lib/format';

// Directory of technologies with live-site + per-country site counts.
// Tags are expandable; clicking a tag filters the list to that tag.

const SHOW_TAGS = 4;

export default function TechDirectoryList({ techs, country, countryName, activeTag, onSelectTag }) {
  const [expanded, setExpanded] = useState({});
  const [query, setQuery] = useState('');

  const sorted = [...techs].sort((a, b) => b.liveSites - a.liveSites);
  const filtered = sorted.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase());
    const matchesTag = !activeTag || t.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  const toggle = (slug) => setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search technologies…"
        className="w-full border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint outline-none focus:border-accent sm:w-72"
      />

      {activeTag && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted">
            Filtered by tag <span className="text-accent">{activeTag}</span>
          </span>
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className="text-xs text-accent underline underline-offset-2 hover:text-fg"
          >
            Clear filter
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const showAll = expanded[t.slug];
          const visibleTags = showAll ? t.tags : t.tags.slice(0, SHOW_TAGS);
          const countryCount = countrySites(t, country);
          return (
            <div
              key={t.slug}
              className="flex flex-col border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={`/trends/${t.slug}`}
                  className="font-serif text-base font-semibold text-fg hover:text-accent"
                >
                  {t.name}
                </a>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{t.description}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {visibleTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag(tag)}
                    className={`border px-1.5 py-0.5 text-[10px] transition-colors ${
                      activeTag === tag
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-faint hover:border-accent hover:text-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {!showAll && t.tags.length > SHOW_TAGS && (
                  <button
                    type="button"
                    onClick={() => toggle(t.slug)}
                    className="text-[10px] text-accent underline underline-offset-2 hover:text-fg"
                  >
                    +{t.tags.length - SHOW_TAGS} more
                  </button>
                )}
              </div>

              <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
                <div>
                  <p className="font-serif text-lg font-bold leading-none text-fg">{formatCount(t.liveSites)}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">Live Sites</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-bold leading-none text-accent">
                    {countryCount != null ? formatCount(countryCount) : '—'}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-faint">
                    {country === 'WW' ? 'Worldwide' : `${countryName} Sites`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-6 text-sm text-faint">
          No technologies match your search{activeTag ? ` for “${activeTag}”` : ''}.
        </p>
      )}
    </div>
  );
}
