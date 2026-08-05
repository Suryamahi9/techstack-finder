'use client';

import { useEffect, useState } from 'react';

// Country selector for the trends page — Worldwide + country tabs.
// Buttons stay disabled until hydration so early clicks aren't swallowed.

export default function TrendsCountryBar({ value, onChange }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const countries = [
    { code: 'WW', flag: '🌍', name: 'Worldwide' },
    { code: 'IN', flag: '🇮🇳', name: 'India' },
    { code: 'US', flag: '🇺🇸', name: 'United States' },
    { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
    { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {countries.map((c) => {
        const active = value === c.code;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => onChange(c.code)}
            disabled={!ready}
            aria-pressed={active}
            className={`border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-bg text-muted hover:border-border-strong hover:text-fg'
            }`}
          >
            <span className="mr-1.5">{c.flag}</span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
