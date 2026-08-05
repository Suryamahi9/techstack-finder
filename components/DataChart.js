'use client';

// Tiny SVG line chart for market-share data ({ year, share }[]).

export default function DataChart({ data, height = 150 }) {
  const w = 440;
  const h = height;
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.share));
  const min = Math.min(...data.map((d) => d.share));
  const range = Math.max(1, max - min);
  const pts = data.map((d, i) => ({
    x: 8 + (i / (data.length - 1)) * (w - 16),
    y: h - 18 - ((d.share - min) / range) * (h - 34),
  }));
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const rising = pts[pts.length - 1].y < pts[0].y;
  const color = rising ? 'var(--tag-green-fg)' : 'var(--tag-red-fg)';

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden="true">
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill={color} />
          {i % 2 === 0 && (
            <text x={p.x} y={h - 4} textAnchor="middle" fontSize="8" fill="var(--faint)">
              {data[i].year}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
