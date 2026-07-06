function HeaderBadge({ label, value }) {
  const present = value !== null;
  return (
    <div className={`rounded-lg border px-3 py-2.5 ${present ? 'border-border bg-bg/50' : 'border-dashed border-border/40 bg-transparent'}`}>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${present ? 'bg-accent' : 'bg-faint/40'}`} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-faint">{label}</span>
      </div>
      {present ? (
        <p className="mt-1 font-mono text-[11px] text-muted break-all leading-relaxed max-h-12 overflow-y-auto">
          {value}
        </p>
      ) : (
        <p className="mt-1 font-mono text-[10px] italic text-faint/60">Not set</p>
      )}
    </div>
  );
}

export default function SecurityHeaders({ security }) {
  if (!security) return null;

  const present = [
    security.contentSecurityPolicy,
    security.strictTransportSecurity,
    security.xFrameOptions,
    security.xContentTypeOptions,
    security.referrerPolicy,
    security.permissionsPolicy,
    security.xssProtection,
    security.cors,
  ].filter(Boolean).length;

  const total = 8;

  return (
    <section className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-faint">Security Headers</span>
        <span className="ml-auto font-mono text-[10px] text-faint">{present}/{total} present</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <HeaderBadge label="CSP" value={security.contentSecurityPolicy} />
        <HeaderBadge label="HSTS" value={security.strictTransportSecurity} />
        <HeaderBadge label="X-Frame-Options" value={security.xFrameOptions} />
        <HeaderBadge label="X-Content-Type-Options" value={security.xContentTypeOptions} />
        <HeaderBadge label="Referrer-Policy" value={security.referrerPolicy} />
        <HeaderBadge label="Permissions-Policy" value={security.permissionsPolicy} />
        <HeaderBadge label="X-XSS-Protection" value={security.xssProtection} />
        <HeaderBadge label="CORS" value={security.cors?.allowOrigin || null} />
      </div>
    </section>
  );
}
