'use client';

import { useState } from 'react';

// Technology group tabs + tag chips for the trends page.
// Selecting a group shows its taxonomy tags; clicking a tag filters the directory.

export default function TechGroupFilter({ groups, onSelectTag }) {
  const [activeGroup, setActiveGroup] = useState(null);
  const [query, setQuery] = useState('');

  const visibleTags = activeGroup
    ? groups.find((g) => g.id === activeGroup).tags
    : [];

  const filteredTags = query
    ? visibleTags.filter((t) => t.toLowerCase().includes(query.toLowerCase()))
    : visibleTags;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => {
          const active = activeGroup === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setActiveGroup(active ? null : g.id);
                setQuery('');
                onSelectTag(null);
              }}
              className={`border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-bg text-muted hover:border-border-strong hover:text-fg'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>

      {activeGroup && (
        <div className="mt-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tags…"
            className="w-full border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-faint outline-none focus:border-accent sm:w-64"
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {filteredTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onSelectTag(t)}
                className="border border-border bg-surface px-2 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {t}
              </button>
            ))}
            {filteredTags.length === 0 && (
              <p className="text-xs text-faint">No tags match &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
