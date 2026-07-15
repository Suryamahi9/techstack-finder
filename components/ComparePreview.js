'use client';
import { useState } from 'react';

const SITES = [
  {
    name: 'github.com',
    techs: ['React', 'Next.js', 'TypeScript', 'Primer', 'Go', 'Redis'],
    color: '#61dafb',
  },
  {
    name: 'vercel.com',
    techs: ['Next.js', 'React', 'TypeScript', 'Turborepo', 'Edge'],
    color: '#fff',
  },
  {
    name: 'shopify.com',
    techs: ['React', 'Ruby on Rails', 'GraphQL', 'Kafka', 'MySQL'],
    color: '#96bf48',
  },
];

export default function ComparePreview() {
  const [active, setActive] = useState(0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 p-[1px] backdrop-blur-sm">
      <div className="rounded-[calc(1rem-1px)] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Compare stacks</span>
        </div>

        <div className="flex gap-2">
          {SITES.map((site, i) => (
            <button
              key={site.name}
              onClick={() => setActive(i)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
                i === active
                  ? 'border-accent/20 bg-accent/[0.05]'
                  : 'border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]'
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: site.color, opacity: 0.7 }} />
                <span className="font-mono text-[10px] text-fg/70">{site.name}</span>
              </div>
              <div className="space-y-1">
                {site.techs.map((tech) => (
                  <div key={tech} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-faint/40" />
                    <span className="text-[10px] text-faint">{tech}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
          <span className="font-mono text-[10px] text-faint">3 sites compared</span>
          <span className="font-mono text-[10px] text-accent/50">Try compare →</span>
        </div>
      </div>
    </div>
  );
}
