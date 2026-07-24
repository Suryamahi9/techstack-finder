'use client';

import { getMarketShare } from '../lib/market-share';

function AdoptionChart({ data, name }) {
  if (!data || data.length < 2) return null;

  const width = 280;
  const height = 80;
  const pad = { top: 8, right: 8, bottom: 16, left: 0 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const shares = data.map(d => d.share);
  const max = Math.max(...shares);
  const min = Math.min(...shares);
  const range = max - min || 1;

  const points = shares.map((v, i) => {
    const x = pad.left + (i / (shares.length - 1)) * innerW;
    const y = pad.top + innerH - ((v - min) / range) * innerH;
    return { x, y, v, year: data[i].year };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  const areaD = `${pathD} L${points[points.length - 1].x},${pad.top + innerH} L${points[0].x},${pad.top + innerH} Z`;

  const isGrowing = shares[shares.length - 1] > shares[0];

  const firstYear = data[0].year;
  const lastYear = data[data.length - 1].year;

  return (
    <div className="rounded-xl border border-border bg-bg/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold truncate">{name}</span>
        <span className="font-mono text-[10px] text-faint">{firstYear}&mdash;{lastYear}</span>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={`adopt-${name.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isGrowing ? '#c5fb45' : '#ef4444'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isGrowing ? '#c5fb45' : '#ef4444'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = pad.top + innerH * (1 - pct);
          const val = min + range * pct;
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={pad.left + innerW + 3} y={y + 3} className="fill-faint" fontSize="7" fontFamily="var(--font-mono)">{val.toFixed(0)}%</text>
            </g>
          );
        })}

        <path d={areaD} fill={`url(#adopt-${name.replace(/[^a-zA-Z0-9]/g, '')})`} />
        <path d={pathD} fill="none" stroke={isGrowing ? '#c5fb45' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        <circle cx={points[0].x} cy={points[0].y} r="2.5" fill="var(--bg)" stroke={isGrowing ? '#c5fb45' : '#ef4444'} strokeWidth="1.5" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={isGrowing ? '#c5fb45' : '#ef4444'} />

        <text x={points[0].x} y={pad.top + innerH + 12} textAnchor="middle" className="fill-faint" fontSize="7" fontFamily="var(--font-mono)">{firstYear}</text>
        <text x={points[points.length - 1].x} y={pad.top + innerH + 12} textAnchor="middle" className="fill-faint" fontSize="7" fontFamily="var(--font-mono)">{lastYear}</text>
      </svg>

      <div className="mt-1.5 flex items-center justify-between text-[9px] text-faint">
        <span>{shares[0]}% &rarr; {shares[shares.length - 1]}%</span>
        <span className={`font-semibold ${isGrowing ? 'text-emerald-400' : 'text-red-400'}`}>
          {isGrowing ? '+' : ''}{(shares[shares.length - 1] - shares[0]).toFixed(1)}% total
        </span>
      </div>
    </div>
  );
}

export default function HistoricalAdoption({ technologies }) {
  if (!technologies || technologies.length === 0) return null;

  const matched = technologies
    .map(t => {
      const ms = getMarketShare(t.name);
      if (!ms || !ms.data || ms.data.length < 2) return null;
      return { name: t.name, data: ms };
    })
    .filter(Boolean)
    .sort((a, b) => (b.data?.currentShare || 0) - (a.data?.currentShare || 0));

  if (matched.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Historical Adoption</h3>
          <p className="text-xs text-faint">2018&ndash;2025 market share trajectory for detected techs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matched.map(m => (
          <AdoptionChart key={m.name} name={m.name} data={m.data.data} />
        ))}
      </div>
    </div>
  );
}
