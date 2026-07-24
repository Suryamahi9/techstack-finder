'use client';
import { useState, useEffect } from 'react';

export default function CanonicalTechs({ technologies }) {
  if (!technologies || technologies.length === 0) return null;

  const withAliases = technologies.filter(t => t.aliases && t.aliases.length > 0);
  if (withAliases.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Deduplicated Technologies</h3>
          <p className="text-xs text-faint">Similar variants merged into canonical names</p>
        </div>
      </div>

      <div className="space-y-2">
        {withAliases.map((tech, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg/50 px-3 py-2">
            <span className="text-xs font-semibold text-fg">{tech.name}</span>
            {tech.detectionCount > 1 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[9px] font-bold text-accent">
                {tech.detectionCount}x
              </span>
            )}
            <span className="text-[10px] text-faint">←</span>
            <div className="flex flex-wrap gap-1">
              {tech.aliases.map((alias, j) => (
                <span key={j} className="rounded bg-border/50 px-1.5 py-0.5 text-[10px] font-mono text-muted">{alias}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
