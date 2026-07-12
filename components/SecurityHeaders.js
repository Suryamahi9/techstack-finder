function HeaderBadge({ label, value, recommendation }) {
  const present = value !== null;
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${present ? 'border-border bg-bg/50' : 'border-dashed border-border/40 bg-transparent'}`}>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${present ? 'bg-accent' : 'bg-faint/40'}`} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">{label}</span>
        {present ? (
          <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">Present</span>
        ) : (
          <span className="ml-auto rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-400">Missing</span>
        )}
      </div>
      {present ? (
        <p className="mt-1 font-mono text-[11px] text-muted break-all leading-relaxed max-h-12 overflow-y-auto">
          {value}
        </p>
      ) : (
        <p className="mt-1 font-mono text-[10px] italic text-faint/60">Not set</p>
      )}
      {!present && recommendation && (
        <p className="mt-1 text-[10px] text-amber-400/70 leading-relaxed">{recommendation}</p>
      )}
    </div>
  );
}

const HEADERS = [
  { key: 'contentSecurityPolicy', label: 'CSP', recommendation: 'Add Content-Security-Policy to prevent XSS and code injection attacks.' },
  { key: 'strictTransportSecurity', label: 'HSTS', recommendation: 'Add Strict-Transport-Security to force HTTPS connections.' },
  { key: 'xFrameOptions', label: 'X-Frame-Options', recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking.' },
  { key: 'xContentTypeOptions', label: 'X-Content-Type-Options', recommendation: 'Add X-Content-Type-Options: nosniff to prevent MIME sniffing.' },
  { key: 'referrerPolicy', label: 'Referrer-Policy', recommendation: 'Add Referrer-Policy to control how much referrer info is shared.' },
  { key: 'permissionsPolicy', label: 'Permissions-Policy', recommendation: 'Add Permissions-Policy to restrict browser features (camera, mic, etc).' },
  { key: 'xssProtection', label: 'X-XSS-Protection', recommendation: 'Set X-XSS-Protection: 0 and rely on CSP instead.' },
];

export default function SecurityHeaders({ security }) {
  if (!security) return null;

  const present = HEADERS.filter((h) => security[h.key]).length;
  const total = HEADERS.length;
  const score = Math.round((present / total) * 100);

  const gradeColors = {
    90: 'text-emerald-400',
    70: 'text-amber-400',
    40: 'text-orange-400',
    0: 'text-red-400',
  };
  const gradeColor = Object.entries(gradeColors)
    .sort((a, b) => b[0] - a[0])
    .find(([min]) => score >= parseInt(min))?.[1] || 'text-muted';

  const recommendations = HEADERS
    .filter((h) => !security[h.key])
    .map((h) => h.recommendation);

  return (
    <section className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-faint">Security Headers</span>
        <div className="ml-auto flex items-center gap-2">
          <span className={`font-mono text-lg font-bold ${gradeColor}`}>{score}%</span>
          <span className="font-mono text-[10px] text-faint">{present}/{total}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {HEADERS.map((h) => (
          <HeaderBadge key={h.key} label={h.label} value={security[h.key]} recommendation={h.recommendation} />
        ))}
      </div>

      {security.cors && (
        <div className="mt-2 rounded-lg border border-border bg-bg/50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">CORS</span>
            <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">Present</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted break-all">Allow-Origin: {security.cors.allowOrigin}</p>
          {security.cors.allowMethods && <p className="mt-0.5 font-mono text-[10px] text-faint">Methods: {security.cors.allowMethods}</p>}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Recommendations ({recommendations.length})
          </div>
          <ul className="space-y-1.5">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                <span className="mt-0.5 shrink-0 text-amber-400">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
