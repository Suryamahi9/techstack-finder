export default function TechDebtDetector({ techDebt }) {
  if (!techDebt || !techDebt.issues || techDebt.issues.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
            <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Tech Debt Analysis</h3>
            <p className="text-xs text-emerald-400">No tech debt detected — clean stack!</p>
          </div>
        </div>
      </div>
    );
  }

  const { issues, score, summary } = techDebt;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Tech Debt Detector</h3>
          <p className="text-xs text-faint">{issues.length} issue{issues.length > 1 ? 's' : ''} found — Health: {score}/100</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {summary.critical > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">{summary.critical} Critical</span>}
        {summary.high > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-400">{summary.high} High</span>}
        {summary.medium > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-yellow-400">{summary.medium} Medium</span>}
        {summary.low > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">{summary.low} Low</span>}
      </div>

      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${issue.colorClass}`}>
                {issue.severity}
              </span>
              <span className="text-[9px] text-faint">{issue.effortLabel}</span>
            </div>
            <p className="text-xs text-muted">{issue.message}</p>
            {issue.tech && <span className="text-[9px] text-faint mt-1 block">Affected: {issue.tech}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
