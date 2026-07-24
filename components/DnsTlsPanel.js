export default function DnsTlsPanel({ dnsTls }) {
  if (!dnsTls) return null;

  const { dns, tls, cloudProviders } = dnsTls;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">DNS &amp; TLS Inspection</h3>
          <p className="text-xs text-faint">
            {cloudProviders.length > 0
              ? `Hosting: ${cloudProviders.join(', ')}`
              : 'Infrastructure analysis'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* DNS Section */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">DNS Records</div>
          <div className="space-y-2">
            {dns.provider && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
                <svg className="h-3 w-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[11px] font-semibold text-emerald-400">{dns.provider}</span>
              </div>
            )}

            {dns.a.length > 0 && (
              <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                <div className="text-[10px] font-mono uppercase text-faint mb-1">A Records</div>
                <div className="space-y-0.5">
                  {dns.a.map((ip, i) => (
                    <div key={i} className="font-mono text-[11px] text-muted">{ip}</div>
                  ))}
                </div>
              </div>
            )}

            {dns.cname && (
              <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                <div className="text-[10px] font-mono uppercase text-faint mb-1">CNAME</div>
                <div className="font-mono text-[11px] text-muted truncate">{dns.cname}</div>
              </div>
            )}

            {dns.ns.length > 0 && (
              <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                <div className="text-[10px] font-mono uppercase text-faint mb-1">Nameservers</div>
                <div className="space-y-0.5">
                  {dns.ns.slice(0, 4).map((ns, i) => (
                    <div key={i} className="font-mono text-[11px] text-muted truncate">{ns}</div>
                  ))}
                </div>
              </div>
            )}

            {dns.mx.length > 0 && (
              <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                <div className="text-[10px] font-mono uppercase text-faint mb-1">MX Records</div>
                <div className="space-y-0.5">
                  {dns.mx.slice(0, 3).map((mx, i) => (
                    <div key={i} className="font-mono text-[11px] text-muted">
                      <span className="text-faint">{mx.priority}</span> {mx.exchange}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dns.dnssec && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                DNSSEC enabled
              </div>
            )}
          </div>
        </div>

        {/* TLS Section */}
        <div>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-faint">TLS Certificate</div>
          {tls ? (
            <div className="space-y-2">
              {tls.sslProvider && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
                  <svg className="h-3 w-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-[11px] font-semibold text-emerald-400">{tls.sslProvider}</span>
                </div>
              )}

              {tls.subject && (
                <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                  <div className="text-[10px] font-mono uppercase text-faint mb-1">Subject</div>
                  <div className="font-mono text-[11px] text-muted truncate">{tls.subject.cn || 'N/A'}</div>
                  {tls.subject.o && <div className="font-mono text-[10px] text-faint truncate">{tls.subject.o}</div>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                  <div className="text-[10px] font-mono uppercase text-faint mb-1">Protocol</div>
                  <div className="font-mono text-[11px] text-muted">{tls.protocol || 'N/A'}</div>
                </div>
                <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                  <div className="text-[10px] font-mono uppercase text-faint mb-1">Cipher</div>
                  <div className="font-mono text-[11px] text-muted">{tls.cipher ? `${tls.cipher.bits}bit` : 'N/A'}</div>
                </div>
              </div>

              {tls.daysRemaining !== null && (
                <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
                  tls.isExpired ? 'border-red-500/20 bg-red-500/5' :
                  tls.isExpiringSoon ? 'border-yellow-500/20 bg-yellow-500/5' :
                  'border-emerald-500/20 bg-emerald-500/5'
                }`}>
                  <svg className={`h-3 w-3 shrink-0 ${
                    tls.isExpired ? 'text-red-400' :
                    tls.isExpiringSoon ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className={`text-[11px] font-semibold ${
                    tls.isExpired ? 'text-red-400' :
                    tls.isExpiringSoon ? 'text-yellow-400' :
                    'text-emerald-400'
                  }`}>
                    {tls.isExpired
                      ? 'Certificate expired'
                      : tls.isExpiringSoon
                        ? `Expires in ${tls.daysRemaining} days`
                        : `${tls.daysRemaining} days remaining`}
                  </span>
                </div>
              )}

              {tls.san.length > 0 && (
                <div className="rounded-lg border border-border bg-bg/50 p-2.5">
                  <div className="text-[10px] font-mono uppercase text-faint mb-1">SANs ({tls.san.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {tls.san.slice(0, 8).map((s, i) => (
                      <span key={i} className="rounded bg-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted">{s}</span>
                    ))}
                    {tls.san.length > 8 && (
                      <span className="text-[10px] text-faint">+{tls.san.length - 8}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-faint">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              TLS inspection unavailable
            </div>
          )}
        </div>
      </div>

      {cloudProviders.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {cloudProviders.map((cp, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-bg/50 px-2.5 py-1 text-[11px] font-medium text-muted">
              <svg className="h-2.5 w-2.5 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              {cp}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
