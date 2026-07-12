'use client';
import { useState, useMemo } from 'react';

const TYPE_COLORS = {
  frontend: '#3b82f6',
  backend: '#10b981',
  infra: '#f59e0b',
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function StackWordCloud({ categories }) {
  const [hovered, setHovered] = useState(null);

  const words = useMemo(() => {
    if (!categories) return [];
    const allTechs = [];
    categories.forEach((cat) => {
      cat.technologies.forEach((tech) => {
        allTechs.push({
          name: tech.name,
          type: tech.type,
          category: cat.category,
          confidence: tech.confidence || 0.9,
        });
      });
    });

    if (allTechs.length === 0) return [];

    const maxConf = Math.max(...allTechs.map((t) => t.confidence));

    return allTechs.map((t, i) => {
      const seed = hashStr(t.name);
      const size = 12 + (t.confidence / maxConf) * 28;
      const rotation = (seededRandom(seed) - 0.5) * 30;
      const x = 5 + seededRandom(seed + 1) * 90;
      const y = 5 + seededRandom(seed + 2) * 90;
      return {
        ...t,
        size,
        rotation,
        x,
        y,
        color: TYPE_COLORS[t.type] || '#8b5cf6',
      };
    });
  }, [categories]);

  if (words.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Word Cloud</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#3b82f6' }} /> Frontend</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#10b981' }} /> Backend</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#f59e0b' }} /> Infra</span>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#0a0e1a] p-4" style={{ height: '360px' }}>
        {words.map((w, i) => (
          <span
            key={w.name}
            className="absolute cursor-pointer transition-all duration-200 select-none"
            style={{
              left: `${w.x}%`,
              top: `${w.y}%`,
              fontSize: `${w.size}px`,
              color: hovered === i ? '#fff' : w.color,
              opacity: hovered !== null && hovered !== i ? 0.3 : 0.85,
              transform: `rotate(${w.rotation}deg) scale(${hovered === i ? 1.15 : 1})`,
              textShadow: hovered === i ? `0 0 12px ${w.color}` : 'none',
              fontWeight: w.size > 28 ? 700 : w.size > 20 ? 600 : 500,
              fontFamily: 'system-ui, sans-serif',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {w.name}
          </span>
        ))}
      </div>
      {hovered !== null && words[hovered] && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-bg px-3 py-2 text-xs animate-fade-up">
          <span className="font-semibold text-fg">{words[hovered].name}</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">{words[hovered].type}</span>
          <span className="text-faint">{words[hovered].category}</span>
          <span className="ml-auto font-mono text-faint">{Math.round(words[hovered].confidence * 100)}% conf</span>
        </div>
      )}
    </div>
  );
}
