'use client';
import { useState, useMemo } from 'react';
import { SITE_DIRECTORY } from '../lib/site-directory';
import SiteRow from './SiteRow';

// Interactive technology directory: filter the curated site list by technology
// chip or free-text, then scan any site. Powers eCommerce / Keyword / Leads
// product pages with different tech pools and framing.

export default function TechDirectory({
  techs = [],
  category = null,
  searchPlaceholder = 'Search sites…',
  hint = 'Pick a technology, or search below.',
}) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const sites = useMemo(() => {
    let list = SITE_DIRECTORY;
    if (category) list = list.filter((s) => s.category === category);
    if (selected) list = list.filter((s) => s.tags.includes(selected));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.domain.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [category, selected, query]);

  const chips = techs.length ? techs : selected ? [selected] : [];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{hint}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((t) => (
          <button
            key={t}
            onClick={() => setSelected(selected === t ? null : t)}
            className={`border px-2.5 py-1 font-mono text-[10px] transition-colors ${
              selected === t
                ? 'border-accent bg-accent text-bg'
                : 'border-border bg-surface text-muted hover:border-border-strong hover:text-fg'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="mt-4 max-w-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-border-strong focus:outline-none"
        aria-label="Search sites"
      />

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{sites.length} sites</p>

      <div className="mt-3 space-y-2">
        {sites.map((s) => (
          <SiteRow key={s.domain} site={s} />
        ))}
        {sites.length === 0 && (
          <div className="border border-border bg-bg px-4 py-8 text-center text-sm text-muted">
            No matching sites yet — try another technology or search.
          </div>
        )}
      </div>
    </div>
  );
}
