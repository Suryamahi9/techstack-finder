function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#10b981', label: 'Great' };
  if (score >= 70) return { grade: 'B+', color: '#22d3ee', label: 'Good' };
  if (score >= 60) return { grade: 'B', color: '#3b82f6', label: 'Good' };
  if (score >= 50) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
  if (score >= 30) return { grade: 'D', color: '#f97316', label: 'Needs Work' };
  return { grade: 'F', color: '#ef4444', label: 'Poor' };
}

export default function StackScore({ seo, performance, security, healthScore, cveSummary, dnsTls, gdpr }) {
  const score = typeof healthScore === 'number' ? healthScore : 0;

  if (score === 0 && !seo && !performance && !security) return null;

  const { grade, color, label } = getGrade(score);

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-6">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color }}>{grade}</span>
            <span className="text-[10px] font-mono text-faint">{score}/100</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold tracking-tight">Stack Health Score</h3>
          <p className="mt-1 text-sm text-muted">{label}</p>
          <div className="mt-4 space-y-2">
            {seo && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">SEO</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-700"
                    style={{ width: `${seo.score || 0}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-muted">{seo.score || 0}</span>
              </div>
            )}
            {performance && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">Perf</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{
                      width: `${
                        (performance.isHttps ? 20 : 0) +
                        (performance.compression && performance.compression !== 'none' ? 20 : 0) +
                        (performance.cacheControl && performance.cacheControl !== 'none' ? 20 : 0) +
                        (performance.httpVersion && performance.httpVersion !== 'unknown' ? 20 : 0) +
                        (performance.keepAlive && performance.keepAlive !== 'unknown' ? 20 : 0)
                      }%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-muted">
                  {Math.round(
                    ((performance.isHttps ? 20 : 0) +
                      (performance.compression && performance.compression !== 'none' ? 20 : 0) +
                      (performance.cacheControl && performance.cacheControl !== 'none' ? 20 : 0) +
                      (performance.httpVersion && performance.httpVersion !== 'unknown' ? 20 : 0) +
                      (performance.keepAlive && performance.keepAlive !== 'unknown' ? 20 : 0)) /
                      5
                  )}
                </span>
              </div>
            )}
            {security && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">Security</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-700"
                    style={{
                      width: `${
                        ([
                          security.contentSecurityPolicy,
                          security.strictTransportSecurity,
                          security.xFrameOptions,
                          security.xContentTypeOptions,
                          security.referrerPolicy,
                          security.permissionsPolicy,
                          security.xssProtection,
                        ].filter((h) => h && h !== 'missing' && h !== 'not set').length /
                          7) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-muted">
                  {Math.round(
                    ([security.contentSecurityPolicy, security.strictTransportSecurity, security.xFrameOptions, security.xContentTypeOptions, security.referrerPolicy, security.permissionsPolicy, security.xssProtection].filter((h) => h && h !== 'missing' && h !== 'not set').length /
                      7) *
                      100
                  )}
                </span>
              </div>
            )}
            {dnsTls && dnsTls.tls && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">TLS</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                    style={{
                      width: `${(() => {
                        let t = 0;
                        if (dnsTls.tls.authorized) t += 30;
                        if (dnsTls.tls.protocol && !dnsTls.tls.protocol.includes('SSLv')) t += 25;
                        if (dnsTls.tls.cipher && dnsTls.tls.cipher.bits >= 256) t += 20;
                        if (dnsTls.tls.daysRemaining && dnsTls.tls.daysRemaining > 30) t += 25;
                        return t;
                      })()}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-muted">
                  {(() => {
                    let t = 0;
                    if (dnsTls.tls.authorized) t += 30;
                    if (dnsTls.tls.protocol && !dnsTls.tls.protocol.includes('SSLv')) t += 25;
                    if (dnsTls.tls.cipher && dnsTls.tls.cipher.bits >= 256) t += 20;
                    if (dnsTls.tls.daysRemaining && dnsTls.tls.daysRemaining > 30) t += 25;
                    return t;
                  })()}
                </span>
              </div>
            )}
            {cveSummary && cveSummary.totalCves > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">CVEs</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-red-400 transition-all duration-700"
                    style={{
                      width: `${Math.min(cveSummary.totalCves * 20 + cveSummary.critical * 30 + cveSummary.high * 15, 100)}%`,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-red-400 text-[10px]">
                  {cveSummary.totalCves} CVE{cveSummary.totalCves !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {gdpr && (
              <div className="flex items-center gap-3 text-xs">
                <span className="w-16 text-faint">GDPR</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${gdpr.complianceScore}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-muted">{gdpr.complianceScore}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
