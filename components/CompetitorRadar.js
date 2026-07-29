'use client';

export default function CompetitorRadar({ radar }) {
  if (!radar || !radar.scores || radar.scores.length === 0) return null;

  const { scores, overall, strongest, weakest, suggestions } = radar;
  const cx = 100, cy = 100, r = 70;
  const n = scores.length;

  const points = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const scoreR = (s.score / 10) * r;
    return { x: cx + scoreR * Math.cos(angle), y: cy + scoreR * Math.sin(angle) };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const labelPoints = scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const lx = cx + (r + 16) * Math.cos(angle);
    const ly = cy + (r + 16) * Math.sin(angle);
    return { ...s, lx, ly };
  });

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 0110 10M12 2a10 10 0 00-10 10M22 12a10 10 0 01-10 10M22 12a10 10 0 00-10-10" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Stack Competitor Radar</h3>
          <p className="text-xs text-faint">Overall: {overall}/10 &middot; Strongest: {strongest} &middot; Weakest: {weakest}</p>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {gridLevels.map((pct, i) => {
            const pts = scores.map((_, j) => {
              const angle = (Math.PI * 2 * j) / n - Math.PI / 2;
              return `${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`;
            }).join(' ');
            return <polygon key={i} points={pts} fill="none" stroke="var(--border)" strokeWidth="0.5" />;
          })}
          {scores.map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="var(--border)" strokeWidth="0.5" />;
          })}
          <polygon points={polygonPoints} fill="rgba(217,119,6,0.15)" stroke="var(--accent)" strokeWidth="1.5" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
          ))}
          {labelPoints.map((l, i) => (
            <text key={i} x={l.lx} y={l.ly} textAnchor="middle" dominantBaseline="middle" className="fill-muted" fontSize="8" fontFamily="var(--font-sans)">
              {l.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {scores.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg bg-bg/50 border border-border px-2.5 py-1.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(s.score / 10) * 100}%` }} />
            </div>
            <span className="text-[10px] font-mono text-faint w-4 text-right">{s.score}</span>
            <span className="text-[9px] text-muted truncate">{s.label}</span>
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-[11px] text-accent">{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}
