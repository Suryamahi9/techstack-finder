export default function AdsTxtPanel({ adsTxt }) {
  if (!adsTxt || !adsTxt.found) return null;

  const { networks, summary } = adsTxt;

  const typeColors = {
    'SSP': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    'Ad Network': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    'Social Ad': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
    'Native Ad Network': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
    'Header Bidding': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    'Ad Verification': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    'Ad Quality': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    'Unknown SSP': { bg: 'bg-faint/10', text: 'text-faint', border: 'border-faint/20' },
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <path d="M8 21h8m-4-4v4" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Ad Tech &amp; Monetization</h3>
          <p className="text-xs text-faint">
            ads.txt analysis &middot; {summary.uniqueDomains} partner{summary.uniqueDomains !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg border border-border bg-bg/50 p-3 text-center">
          <div className="text-lg font-bold text-fg">{summary.uniqueDomains}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Partners</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 p-3 text-center">
          <div className="text-lg font-bold text-fg">{summary.totalEntries}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Entries</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 p-3 text-center">
          <div className="text-lg font-bold text-fg">{summary.directCount}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Direct</div>
        </div>
      </div>

      {(summary.hasHeaderBidding || summary.hasPrebid) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-[11px] font-semibold text-amber-400">
            Header Bidding Active
            {summary.hasPrebid && ' (Prebid.js)'}
          </span>
        </div>
      )}

      <div className="space-y-1.5">
        {networks.slice(0, 12).map((n, i) => {
          const colors = typeColors[n.type] || typeColors['Unknown SSP'];
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-bg/50 px-3 py-2">
              <span className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                {n.type.length > 10 ? n.type.substring(0, 10) : n.type}
              </span>
              <span className="text-xs font-semibold truncate">{n.name}</span>
              <span className="font-mono text-[10px] text-faint shrink-0">{n.domain}</span>
              <div className="ml-auto flex gap-1 shrink-0">
                {n.accountIds.slice(0, 2).map((aid, j) => (
                  <span key={j} className="font-mono text-[9px] text-faint rounded bg-border/50 px-1 py-0.5">{aid}</span>
                ))}
              </div>
            </div>
          );
        })}
        {networks.length > 12 && (
          <div className="text-center text-[11px] text-faint py-1">
            +{networks.length - 12} more partner{networks.length - 12 > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-bg/30 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <svg className="h-3 w-3 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4m0-4h.01" />
          </svg>
          <span className="text-[11px] font-semibold text-faint">What is ads.txt?</span>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          ads.txt is an IAB standard that lists authorized digital sellers for a domain. Direct partnerships
          ({summary.directCount}) indicate first-party integrations, while reseller entries ({summary.resellerCount})
          are managed through intermediary platforms.
        </p>
      </div>
    </div>
  );
}
