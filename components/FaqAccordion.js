'use client';

import { useState } from 'react';

// Interactive accordion for FAQ / knowledge base content.
// Rows expand on click; only one open at a time.

export default function FaqAccordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 bg-bg px-5 py-4 text-left transition-colors hover:bg-surface"
            >
              <span className="text-sm font-medium text-fg">{item.q}</span>
              <span
                className={`shrink-0 font-mono text-xs text-faint transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
              >
                +
              </span>
            </button>
            <div
              className={`grid overflow-hidden transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
