export default function TeamEstimator({ teamEstimate }) {
  if (!teamEstimate) return null;

  const { teamSize, roles, seniorityMix, complexity, hiringAdvice } = teamEstimate;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Team Size Estimate</h3>
          <p className="text-xs text-faint">Engineering team needed to maintain this stack</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-faint mb-1">Recommended Team</div>
        <div className="text-xl font-bold font-mono text-accent">{teamSize.min}–{teamSize.max} engineers</div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-center">
          <div className="text-sm font-bold text-emerald-400">{seniorityMix.senior}</div>
          <div className="text-[9px] text-faint">Senior</div>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2 text-center">
          <div className="text-sm font-bold text-blue-400">{seniorityMix.mid}</div>
          <div className="text-[9px] text-faint">Mid-level</div>
        </div>
        <div className="rounded-lg bg-yellow-500/10 p-2 text-center">
          <div className="text-sm font-bold text-yellow-400">{seniorityMix.junior}</div>
          <div className="text-[9px] text-faint">Junior</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">Skill Areas</div>
        <div className="space-y-1.5">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-bg/50 px-3 py-2">
              <div className="min-w-0">
                <span className="text-xs font-semibold">{r.skill}</span>
                <span className="ml-2 text-[9px] text-faint">{r.techs.join(', ')}</span>
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0">{r.min}–{r.max}</span>
            </div>
          ))}
        </div>
      </div>

      {hiringAdvice.length > 0 && (
        <div className="space-y-1">
          {hiringAdvice.map((a, i) => (
            <div key={i} className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-[11px] text-accent">{a}</div>
          ))}
        </div>
      )}
    </div>
  );
}
