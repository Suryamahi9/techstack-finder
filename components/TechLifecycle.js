export default function TechLifecycle({ lifecycle }) {
  if (!lifecycle || !lifecycle.technologies || lifecycle.technologies.length === 0) return null;

  const { phases, healthScore, warnings } = lifecycle;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Technology Lifecycle</h3>
          <p className="text-xs text-faint">Stack modernity: {healthScore}% healthy</p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {[
          { label: 'Growing', count: phases.growing.length, color: 'text-tag-green-fg', bg: 'bg-tag-green-bg' },
          { label: 'Mature', count: phases.mature.length, color: 'text-tag-blue-fg', bg: 'bg-tag-blue-bg' },
          { label: 'Declining', count: phases.declining.length, color: 'text-tag-yellow-fg', bg: 'bg-tag-yellow-bg' },
          { label: 'Deprecated', count: phases.deprecated.length, color: 'text-tag-red-fg', bg: 'bg-tag-red-bg' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg p-2 text-center`}>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.count}</div>
            <div className="text-[9px] text-faint">{s.label}</div>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {warnings.map((w, i) => (
            <div key={i} className="rounded-lg border border-border bg-tag-red-bg px-3 py-2 text-[11px] text-tag-red-fg">
              {w}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {lifecycle.technologies.map((t, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-bg/50 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold truncate">{t.name}</span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${t.colorClass}`}>
                {t.label}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-faint">{t.trend === 'growing' ? '↑' : t.trend === 'declining' ? '↓' : '→'} {t.trend}</span>
              {t.eol && <span className="text-[9px] text-tag-red-fg font-semibold">EOL {t.eol}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
