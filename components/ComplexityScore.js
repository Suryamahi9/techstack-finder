export default function ComplexityScore({ complexity }) {
  if (!complexity) return null;

  const { normalizedScore, level, color, breakdown, techScores, suggestions } = complexity;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (normalizedScore / 100) * circumference;

  const barColor = normalizedScore <= 25 ? 'var(--tag-green-fg)' : normalizedScore <= 50 ? 'var(--tag-blue-fg)' : normalizedScore <= 75 ? 'var(--tag-yellow-fg)' : 'var(--tag-red-fg)';

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Stack Complexity</h3>
          <p className="text-xs text-faint">{techScores.length} techs analyzed</p>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-5">
        <div className="relative shrink-0">
          <svg width="84" height="84" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="42" cy="42" r="36" fill="none" stroke={barColor} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 42 42)" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-lg font-bold">{normalizedScore}</span>
            <span className="text-[8px] text-faint">/100</span>
          </div>
        </div>
        <div>
          <div className={`text-base font-bold ${color}`}>{level}</div>
          <div className="text-[10px] text-faint mt-0.5">Operational complexity rating</div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-4 space-y-1">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border border-border bg-tag-yellow-bg px-3 py-1.5 text-[11px] text-tag-yellow-fg">{s}</div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {techScores.slice(0, 10).map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span className="w-24 shrink-0 truncate font-medium">{t.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${(t.score / 5) * 100}%` }} />
            </div>
            <span className="w-6 text-right font-mono text-[10px] text-faint shrink-0">{t.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
