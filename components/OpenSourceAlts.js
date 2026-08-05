export default function OpenSourceAlts({ alternatives }) {
  if (!alternatives || !alternatives.alternatives || alternatives.alternatives.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-tag-green-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M8 12l3 3 5-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Open Source Alternatives</h3>
          <p className="text-xs text-faint">{alternatives.totalSavings}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {alternatives.alternatives.map((alt, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold">{alt.detected}</span>
              <span className="text-[9px] text-faint">{alt.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-3 w-3 text-faint shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="text-xs text-tag-green-fg font-medium">{alt.alt}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-faint">{alt.license}</span>
                {alt.savings && <span className="text-[9px] font-semibold text-tag-green-fg">Save {alt.savings}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
