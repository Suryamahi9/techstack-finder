'use client';

import { useState } from 'react';
import { getMarketShare, getTrendDirection } from '../lib/market-share';

const TREND_ICON = {
  up: (
    <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  down: (
    <svg className="h-3 w-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  flat: (
    <svg className="h-3 w-3 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14" />
    </svg>
  ),
};

const TREND_COLOR = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  flat: 'text-faint',
};

function Sparkline({ data, width = 120, height = 32 }) {
  if (!data || data.length < 2) return null;

  const shares = data.map(d => d.share);
  const max = Math.max(...shares);
  const min = Math.min(...shares);
  const range = max - min || 1;

  const points = shares.map((v, i) => {
    const x = (i / (shares.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${height} ${points} ${width},${height}`;
  const lastPoint = shares[shares.length - 1];
  const firstPoint = shares[0];
  const isGrowing = lastPoint > firstPoint;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${isGrowing ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isGrowing ? '#22c55e' : '#ef4444'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={isGrowing ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#spark-${isGrowing ? 'up' : 'down'})`} />
      <polyline points={points} fill="none" stroke={isGrowing ? '#22c55e' : '#ef4444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {shares.map((v, i) => {
        const x = (i / (shares.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 6) - 3;
        if (i === 0 || i === shares.length - 1) {
          return <circle key={i} cx={x} cy={y} r="2" fill={isGrowing ? '#22c55e' : '#ef4444'} />;
        }
        return null;
      })}
    </svg>
  );
}

function TrendRow({ tech, data, trend, expanded, onToggle }) {
  const formatNumber = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  };

  return (
    <div className="rounded-xl border border-border bg-bg/50 overflow-hidden transition-colors hover:border-border-strong">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold truncate">{tech}</span>
            {TREND_ICON[trend.direction]}
          </div>
          <span className="text-[10px] text-faint">{data.category}</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Sparkline data={data.data} width={64} height={24} />
          <div className="text-right w-12">
            <div className={`text-[11px] font-bold font-mono ${TREND_COLOR[trend.direction]}`}>{data.currentShare}%</div>
            <div className={`text-[9px] font-mono ${TREND_COLOR[trend.direction]}`}>{trend.label}</div>
          </div>
        </div>

        <svg
          className={`h-3 w-3 text-faint shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-border px-3 py-3 space-y-2.5">
          <div>
            <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-faint">Year-over-Year</div>
            <div className="grid grid-cols-4 gap-1.5">
              {data.data.slice(-4).map((d, i) => (
                <div key={i} className="rounded-lg bg-elevated p-1.5 text-center">
                  <div className="text-[9px] text-faint">{d.year}</div>
                  <div className="text-[11px] font-bold font-mono">{d.share}%</div>
                </div>
              ))}
            </div>
          </div>
          {data.topSites && data.topSites.length > 0 && (
            <div>
              <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-faint">Top Users</div>
              <div className="flex flex-wrap gap-1">
                {data.topSites.slice(0, 5).map((site, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted font-mono">{site}</span>
                ))}
              </div>
            </div>
          )}
          {data.usageCount && (
            <div className="flex items-center gap-4 text-[10px] text-faint">
              <span>~{formatNumber(data.usageCount)} sites using this tech</span>
              <span className="font-semibold text-muted">{data.trend}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketTrends({ technologies }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  if (!technologies || technologies.length === 0) return null;

  const matched = technologies
    .map(t => {
      const ms = getMarketShare(t.name);
      if (!ms) return null;
      const trend = getTrendDirection(t.name);
      return { name: t.name, data: ms, trend };
    })
    .filter(Boolean)
    .sort((a, b) => (b.data?.currentShare || 0) - (a.data?.currentShare || 0));

  if (matched.length === 0) return null;

  const growing = matched.filter(m => m.trend?.direction === 'up').length;
  const declining = matched.filter(m => m.trend?.direction === 'down').length;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-5 4 3 5-7" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Market Trends</h3>
          <p className="text-xs text-faint">
            {matched.length} technologies with market data
            {growing > 0 && <span className="text-emerald-400"> &middot; {growing} growing</span>}
            {declining > 0 && <span className="text-red-400"> &middot; {declining} declining</span>}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        {matched.map((m, i) => (
          <TrendRow
            key={m.name}
            tech={m.name}
            data={m.data}
            trend={m.trend}
            expanded={expandedIdx === i}
            onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
          />
        ))}
      </div>
    </div>
  );
}
