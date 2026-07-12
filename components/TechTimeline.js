'use client';
import { useMemo, useState } from 'react';

const TYPE_COLORS = {
  frontend: '#3b82f6',
  backend: '#10b981',
  infra: '#f59e0b',
};

const CONF_MAP = { high: 0.95, medium: 0.7, low: 0.4 };

function toNum(c) {
  if (typeof c === 'number') return c;
  return CONF_MAP[c] || 0.7;
}

export default function TechTimeline({ categories }) {
  const [selectedType, setSelectedType] = useState('all');

  const items = useMemo(() => {
    if (!categories) return [];
    const result = [];
    categories.forEach((cat) => {
      cat.technologies.forEach((tech) => {
        result.push({
          name: tech.name,
          type: tech.type,
          category: cat.category,
          confidence: toNum(tech.confidence),
          detectedVia: tech.detectedVia,
          version: tech.version,
        });
      });
    });
    result.sort((a, b) => b.confidence - a.confidence);
    return result;
  }, [categories]);

  const filtered = selectedType === 'all' ? items : items.filter((t) => t.type === selectedType);
  const counts = useMemo(() => {
    const c = { all: items.length, frontend: 0, backend: 0, infra: 0 };
    items.forEach((t) => { c[t.type] = (c[t.type] || 0) + 1; });
    return c;
  }, [items]);

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Detection Timeline</h3>
        <div className="flex items-center gap-1.5">
          {['all', 'frontend', 'backend', 'infra'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                selectedType === t
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-faint hover:text-muted border border-transparent'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="ml-1 font-mono">{counts[t]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-h-[400px] overflow-y-auto pr-2">
        {/* Vertical line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-0.5">
          {filtered.map((tech, i) => {
            const color = TYPE_COLORS[tech.type] || '#8b5cf6';
            const confPct = Math.round(tech.confidence * 100);
            return (
              <div
                key={tech.name}
                className="group relative flex items-start gap-4 py-2.5 pl-1 animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
              >
                {/* Dot */}
                <div className="relative z-10 mt-1 flex shrink-0 items-center justify-center">
                  <div
                    className="h-3.5 w-3.5 rounded-full border-2 transition-all group-hover:scale-125"
                    style={{
                      borderColor: color,
                      background: `${color}30`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 rounded-lg border border-transparent px-3 py-2 transition-all group-hover:border-border group-hover:bg-elevated">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-semibold text-sm text-fg">{tech.name}</span>
                      {tech.version && (
                        <span className="shrink-0 font-mono text-[10px] text-faint">v{tech.version}</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${confPct}%`, background: color }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-muted">{confPct}%</span>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                    <span
                      className="rounded-full px-1.5 py-0.5 font-medium"
                      style={{ color, background: `${color}15` }}
                    >
                      {tech.type}
                    </span>
                    <span className="text-faint">·</span>
                    <span className="text-muted">{tech.category}</span>
                    <span className="text-faint">·</span>
                    <span className="text-faint">via {tech.detectedVia}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
