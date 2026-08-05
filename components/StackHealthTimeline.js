'use client';

export default function StackHealthTimeline({ history }) {
  if (!history || history.length < 2) return null;

  const width = 320;
  const height = 100;
  const pad = { top: 10, right: 10, bottom: 20, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const scores = history.map(h => h.healthScore || h.total || 0);
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;

  const points = scores.map((v, i) => ({
    x: pad.left + (i / Math.max(scores.length - 1, 1)) * innerW,
    y: pad.top + innerH - ((v - min) / range) * innerH,
    v,
    date: history[i].scannedAt ? new Date(history[i].scannedAt).toLocaleDateString() : `#${i + 1}`,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${points[points.length - 1].x},${pad.top + innerH} L${points[0].x},${pad.top + innerH} Z`;

  const trend = scores[scores.length - 1] - scores[0];

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
          <h3 className="text-sm font-semibold">Health Score Over Time</h3>
          <p className="text-xs text-faint">
            {history.length} scans &middot;
            <span className={trend >= 0 ? 'text-tag-green-fg' : 'text-tag-red-fg'}> {trend >= 0 ? '+' : ''}{Math.round(trend)} trend</span>
          </p>
        </div>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="health-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = pad.top + innerH * (1 - pct);
          const val = Math.round(min + range * pct);
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2 3" />
              <text x={pad.left - 4} y={y + 3} textAnchor="end" className="fill-faint" fontSize="7" fontFamily="var(--font-mono)">{val}</text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#health-grad)" />
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
            <text x={p.x} y={pad.top + innerH + 12} textAnchor="middle" className="fill-faint" fontSize="6" fontFamily="var(--font-mono)">{p.date}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
