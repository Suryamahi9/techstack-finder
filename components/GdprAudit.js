export default function GdprAudit({ gdpr }) {
  if (!gdpr) return null;

  const { consentManagers, trackers, trackerCategories, totalTrackers, cmpBanner, complianceScore, trackerOrder } = gdpr;

  const scoreColor = complianceScore >= 80 ? '#22c55e' : complianceScore >= 50 ? '#eab308' : '#ef4444';
  const scoreLabel = complianceScore >= 80 ? 'Good' : complianceScore >= 50 ? 'Needs Review' : 'Non-Compliant';

  const categoryLabels = {
    'Analytics': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'A' },
    'Advertising': { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'R' },
    'Social Media': { color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: 'S' },
    'Marketing': { color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: 'M' },
    'Fingerprinting': { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: 'F' },
    'Session Recording': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'R' },
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">GDPR &amp; Consent Audit</h3>
          <p className="text-xs text-faint">
            {consentManagers.length > 0
              ? `CMP detected: ${consentManagers[0]}`
              : 'No consent management platform found'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: scoreColor }}>{complianceScore}</div>
          <div className="text-[10px] text-faint">{scoreLabel}</div>
        </div>
      </div>

      <div className="mb-5">
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${complianceScore}%`, backgroundColor: scoreColor }}
          />
        </div>
      </div>

      {consentManagers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {consentManagers.map((cm, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {cm}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
          Tracking Categories ({totalTrackers} scripts)
        </div>
        <div className="space-y-2">
          {Object.entries(trackers).map(([category, patterns]) => {
            const style = categoryLabels[category] || { color: 'bg-faint/10 text-faint border-faint/20', icon: '?' };
            return (
              <div key={category} className="rounded-lg border border-border bg-bg/50 p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold border ${style.color}`}>
                    {style.icon}
                  </span>
                  <span className="text-xs font-semibold">{category}</span>
                  <span className="text-[10px] text-faint">({patterns.length} detected)</span>
                </div>
                <div className="flex flex-wrap gap-1 pl-7">
                  {patterns.slice(0, 5).map((p, i) => (
                    <span key={i} className="rounded bg-border/50 px-1.5 py-0.5 font-mono text-[9px] text-muted">{p}</span>
                  ))}
                  {patterns.length > 5 && (
                    <span className="text-[9px] text-faint">+{patterns.length - 5}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cmpBanner.hasBanner && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-bg/30 px-3 py-2">
          <svg className="h-3 w-3 text-faint shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          <span className="text-[11px] text-muted">Cookie consent banner signals: {cmpBanner.signals.slice(0, 3).join(', ')}</span>
        </div>
      )}

      <div className={`rounded-lg border p-3 ${
        trackerOrder.compliant
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : trackerOrder.status === 'partial_deferred'
            ? 'border-yellow-500/20 bg-yellow-500/5'
            : 'border-red-500/20 bg-red-500/5'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <svg className={`h-3 w-3 shrink-0 ${
            trackerOrder.compliant ? 'text-emerald-400' :
            trackerOrder.status === 'partial_deferred' ? 'text-yellow-400' :
            'text-red-400'
          }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {trackerOrder.compliant ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <path d="M12 9v4m0 4h.01" />
            )}
          </svg>
          <span className={`text-[11px] font-semibold ${
            trackerOrder.compliant ? 'text-emerald-400' :
            trackerOrder.status === 'partial_deferred' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {trackerOrder.message}
          </span>
        </div>
        <p className="text-[11px] text-muted pl-5">{trackerOrder.details}</p>
      </div>
    </div>
  );
}
