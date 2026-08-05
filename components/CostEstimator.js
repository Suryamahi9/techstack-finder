export default function CostEstimator({ costEstimate }) {
  if (!costEstimate || !costEstimate.items || costEstimate.items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-tag-green-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Estimated Stack Cost</h3>
          <p className="text-xs text-faint">Monthly infrastructure cost estimate</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-faint mb-1">Estimated Monthly Cost</div>
        <div className="text-xl font-bold font-mono text-accent">{costEstimate.totalMonthlyEstimate}</div>
        <div className="text-[10px] text-faint mt-1">{costEstimate.note}</div>
      </div>

      <div className="flex gap-2 mb-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-tag-green-bg px-2.5 py-0.5 text-[11px] font-semibold text-tag-green-fg">
          {costEstimate.summary.free} Free
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-tag-yellow-bg px-2.5 py-0.5 text-[11px] font-semibold text-tag-yellow-fg">
          {costEstimate.summary.paid} Paid
        </span>
      </div>

      <div className="space-y-1.5">
        {costEstimate.items.map((item, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-bg/50 px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold truncate">{item.name}</span>
              <span className="text-[9px] text-faint shrink-0">{item.category}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-faint">{item.tier}</span>
              <span className={`font-mono text-xs font-bold ${item.baseCost === 0 ? 'text-tag-green-fg' : 'text-muted'}`}>
                {item.baseCost === 0 ? 'Free' : `$${item.baseCost}/mo`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
