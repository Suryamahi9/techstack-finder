function computeScore(seo, performance, security) {
  let score = 0;
  let max = 0;

  if (seo) {
    score += (seo.score || 0) * 0.4;
    max += 100 * 0.4;
  }

  if (performance) {
    let perfScore = 0;
    if (performance.isHttps) perfScore += 20;
    if (performance.compression && performance.compression !== 'none') perfScore += 20;
    if (performance.cacheControl && performance.cacheControl !== 'none') perfScore += 20;
    if (performance.httpVersion && performance.httpVersion !== 'unknown') perfScore += 20;
    if (performance.keepAlive && performance.keepAlive !== 'unknown') perfScore += 20;
    score += perfScore * 0.3;
    max += 100 * 0.3;
  }

  if (security) {
    let secScore = 0;
    const headers = [
      security.contentSecurityPolicy,
      security.strictTransportSecurity,
      security.xFrameOptions,
      security.xContentTypeOptions,
      security.referrerPolicy,
      security.permissionsPolicy,
      security.xssProtection,
    ];
    const present = headers.filter((h) => h && h !== 'missing' && h !== 'not set').length;
    secScore = (present / headers.length) * 100;
    score += secScore * 0.3;
    max += 100 * 0.3;
  }

  return max > 0 ? Math.round((score / max) * 100) : 0;
}

function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#10b981', label: 'Great' };
  if (score >= 70) return { grade: 'B+', color: '#22d3ee', label: 'Good' };
  if (score >= 60) return { grade: 'B', color: '#3b82f6', label: 'Good' };
  if (score >= 50) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
  if (score >= 30) return { grade: 'D', color: '#f97316', label: 'Needs Work' };
  return { grade: 'F', color: '#ef4444', label: 'Poor' };
}

export default function StackScore({ seo, performance, security }) {
  if (!seo && !performance && !security) return null;

  const score = computeScore(seo, performance, security);
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
          <h3 className="text-lg font-bold tracking-tight">Stack Health</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}
