function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#10b981', label: 'Great' };
  if (score >= 70) return { grade: 'B+', color: '#22d3ee', label: 'Good' };
  if (score >= 60) return { grade: 'B', color: '#3b82f6', label: 'Decent' };
  if (score >= 50) return { grade: 'C', color: '#f59e0b', label: 'Fair' };
  if (score >= 30) return { grade: 'D', color: '#f97316', label: 'Needs Work' };
  return { grade: 'F', color: '#ef4444', label: 'Poor' };
}

function calcSecurityScore(security) {
  if (!security) return 0;
  const passed = [
    security.contentSecurityPolicy,
    security.strictTransportSecurity,
    security.xFrameOptions,
    security.xContentTypeOptions,
    security.referrerPolicy,
    security.permissionsPolicy,
    security.xssProtection,
  ].filter((h) => h && h !== 'missing' && h !== 'not set').length;
  return Math.round((passed / 7) * 100);
}

function calcPerformanceScore(p) {
  if (!p) return 0;
  return Math.round(
    ((p.isHttps ? 20 : 0) +
      (p.compression && p.compression !== 'none' ? 20 : 0) +
      (p.cacheControl && p.cacheControl !== 'none' ? 20 : 0) +
      (p.httpVersion && p.httpVersion !== 'unknown' ? 20 : 0) +
      (p.keepAlive && p.keepAlive !== 'unknown' ? 20 : 0)) /
      5
  );
}

function KpiBlock({ value, label, suffix, icon, color }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 min-w-0">
      <div className="flex items-center gap-1.5">
        {icon && (
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        )}
        <span className="font-mono text-lg font-bold tracking-tight text-fg" style={color ? { color } : undefined}>
          {value}{suffix || ''}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-faint truncate max-w-full">{label}</span>
    </div>
  );
}

export default function StackScore({ seo, performance, security, healthScore, cveSummary, dnsTls, gdpr }) {
  const score = typeof healthScore === 'number' ? healthScore : 0;

  if (score === 0 && !seo && !performance && !security && !dnsTls && !cveSummary && !gdpr) return null;

  const { grade, color } = getGrade(score);
  const seoScore = seo?.score || 0;
  const perfScore = calcPerformanceScore(performance);
  const secScore = calcSecurityScore(security);
  const tlsScore = dnsTls?.tls ? (() => {
    let t = 0;
    if (dnsTls.tls.authorized) t += 30;
    if (dnsTls.tls.protocol && !dnsTls.tls.protocol.includes('SSLv')) t += 25;
    if (dnsTls.tls.cipher && dnsTls.tls.cipher.bits >= 256) t += 20;
    if (dnsTls.tls.daysRemaining && dnsTls.tls.daysRemaining > 30) t += 25;
    return t;
  })() : null;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] animate-fade-up overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] sm:grid-cols-6">
        <KpiBlock
          value={grade}
          label="Stack Health"
          color={color}
          icon={<><path d="M12 20V10" /><path d="M18 20V5" /><path d="M6 20v-4" /></>}
        />
        {seo && (
          <KpiBlock
            value={seoScore}
            suffix="%"
            label="SEO"
            icon={<><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>}
            color={seoScore >= 80 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : '#ef4444'}
          />
        )}
        {performance && (
          <KpiBlock
            value={perfScore}
            suffix="%"
            label="Performance"
            icon={<><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></>}
            color={perfScore >= 80 ? '#10b981' : perfScore >= 50 ? '#f59e0b' : '#ef4444'}
          />
        )}
        <KpiBlock
          value={secScore}
          suffix="%"
          label="Security"
          icon={<><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /></>}
          color={secScore >= 80 ? '#10b981' : secScore >= 50 ? '#f59e0b' : '#ef4444'}
        />
        {tlsScore !== null && (
          <KpiBlock
            value={tlsScore}
            suffix="%"
            label="TLS"
            icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
            color={tlsScore >= 80 ? '#10b981' : tlsScore >= 50 ? '#f59e0b' : '#ef4444'}
          />
        )}
        {cveSummary && cveSummary.totalCves > 0 ? (
          <KpiBlock
            value={cveSummary.totalCves}
            label="CVEs"
            icon={<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>}
            color="#ef4444"
          />
        ) : gdpr ? (
          <KpiBlock
            value={gdpr.complianceScore}
            suffix="%"
            label="GDPR"
            icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
            color={gdpr.complianceScore >= 80 ? '#10b981' : '#f59e0b'}
          />
        ) : (
          <KpiBlock
            value="—"
            label="Compliance"
            icon={<><path d="M9 12l2 2 4-4" /></>}
          />
        )}
      </div>
    </div>
  );
}
