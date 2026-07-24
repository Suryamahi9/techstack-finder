export default function CompanyEnrichment({ company }) {
  if (!company) return null;

  const budgetColor = {
    'Very High': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    High: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Low: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Unknown: 'bg-faint/10 text-faint border-border',
  };

  const sourceBadge = {
    known: 'bg-accent/10 text-accent border-accent/20',
    'partial match': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    estimated: 'bg-faint/10 text-faint border-border',
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 20V4a2 2 0 012-2h8a2 2 0 012 2v16" />
            <path d="M6 12h12M6 8h12M6 16h12" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company Profile</h3>
          <p className="text-xs text-faint">Firmographic enrichment data</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <span className="text-base font-bold">{company.name}</span>
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sourceBadge[company.source] || sourceBadge.estimated}`}>
          {company.source === 'known' ? 'Verified' : company.source === 'partial match' ? 'Partial Match' : 'Estimated'}
        </span>
        {company.techBudget && company.techBudget !== 'Unknown' && (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${budgetColor[company.techBudget] || budgetColor.Unknown}`}>
            {company.techBudget} tech budget
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {company.industry && company.industry !== 'Not classified' && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Industry</div>
            <div className="text-xs font-medium">{company.industry}</div>
          </div>
        )}
        {company.size && company.size !== 'Unknown' && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Company Size</div>
            <div className="text-xs font-medium">{company.size}</div>
          </div>
        )}
        {company.employees && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Employees</div>
            <div className="text-xs font-medium font-mono">{company.employees.toLocaleString()}</div>
          </div>
        )}
        {company.revenue && company.revenue !== 'Not available' && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Revenue</div>
            <div className="text-xs font-medium">{company.revenue}</div>
          </div>
        )}
        {company.hq && company.hq !== 'Not available' && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Headquarters</div>
            <div className="text-xs font-medium">{company.hq}</div>
          </div>
        )}
        {company.founded && (
          <div className="rounded-xl border border-border bg-bg/50 p-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-faint mb-1">Founded</div>
            <div className="text-xs font-medium font-mono">{company.founded}</div>
          </div>
        )}
      </div>

      {company.techScore !== undefined && (
        <div className="mt-4">
          <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-faint">Tech Maturity Score</div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-700 bg-accent"
                style={{ width: `${Math.min((company.techScore / 8) * 100, 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-muted">{company.techScore}/8</span>
          </div>
        </div>
      )}

      {company.detectedCategories && company.detectedCategories.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-faint">Detected Tech Categories</div>
          <div className="flex flex-wrap gap-1">
            {company.detectedCategories.map((cat, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted font-medium">{cat}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
