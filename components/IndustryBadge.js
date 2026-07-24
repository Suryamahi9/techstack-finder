export default function IndustryBadge({ industry }) {
  if (!industry || !industry.primary) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v16H4z" />
            <path d="M4 9h16M9 4v16" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Industry Classification</h3>
          <p className="text-xs text-faint">Auto-detected from stack + content signals</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${industry.color || 'border-border bg-bg text-muted'}`}>
          {industry.icon && <span className="text-base">{industry.icon}</span>}
          {industry.primary}
        </span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          industry.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
          industry.confidence === 'medium' ? 'bg-blue-500/10 text-blue-400' :
          'bg-faint/10 text-faint'
        }`}>
          {industry.confidence} confidence
        </span>
      </div>

      {industry.all && industry.all.length > 1 && (
        <div className="mb-3">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">Also matches</div>
          <div className="flex flex-wrap gap-1.5">
            {industry.all.slice(1).map((alt, i) => (
              <span key={i} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${alt.color || 'border-border bg-bg text-muted'}`}>
                {alt.icon && <span>{alt.icon}</span>}
                {alt.name}
                <span className="text-[9px] text-faint">({alt.score})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
