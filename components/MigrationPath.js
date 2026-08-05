export default function MigrationPath({ migrationData }) {
  if (!migrationData || !migrationData.migrations || migrationData.migrations.length === 0) return null;

  const riskColor = { low: 'text-tag-green-fg bg-tag-green-bg', medium: 'text-tag-yellow-fg bg-tag-yellow-bg', high: 'text-tag-red-fg bg-tag-red-bg' };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Migration Paths</h3>
          <p className="text-xs text-faint">{migrationData.migrations.length} upgrade path{migrationData.migrations.length > 1 ? 's' : ''} available</p>
        </div>
      </div>

      <div className="space-y-4">
        {migrationData.migrations.map((m, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{m.source}</span>
                <svg className="h-3 w-3 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs text-accent font-medium">{m.target}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${riskColor[m.risk]}`}>{m.risk} risk</span>
                <span className="text-[9px] text-faint">{m.duration}</span>
              </div>
            </div>
            <ol className="space-y-1 ml-4 list-decimal list-inside">
              {m.steps.map((step, j) => (
                <li key={j} className="text-[11px] text-muted leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
