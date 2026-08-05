import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import InlineScan from '../../components/InlineScan';
import { getCveTable } from '../../lib/cve-db';

export const metadata = {
  title: 'Cyber Risk Auditing — TechStack Finder',
  description:
    'A continuous view of the third-party technology on your attack surface — what is out there, who owns it, and what is now a liability.',
};

const SEVERITY_COLORS = {
  critical: 'bg-tag-red-bg text-tag-red-fg',
  high: 'bg-tag-red-bg text-tag-red-fg',
  medium: 'bg-tag-yellow-bg text-tag-yellow-fg',
  low: 'bg-tag-blue-bg text-tag-blue-fg',
};

export default function CyberRiskPage() {
  const cveTable = getCveTable();

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Cyber Risk Auditing"
          lede="A continuous view of the third-party technology running on your attack surface. Below is the live CVE database powering the auditor — outdated libraries flagged by version."
          cta={{ href: '/results?site=example.com', label: 'Audit a site now' }}
          secondary={{ href: '/docs', label: 'Read the docs' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
              {cveTable.length} technologies with known vulnerabilities
            </p>
            <p className="text-sm text-muted">
              {cveTable.reduce((a, t) => a + t.totalCves, 0)} CVEs across{' '}
              {cveTable.reduce((a, t) => a + t.affectedVersions, 0)} affected version lines
            </p>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Technology</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">CVEs</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Affected versions</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Critical</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">High</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Medium</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-faint">Sample</th>
                </tr>
              </thead>
              <tbody>
                {cveTable.map((t) => (
                  <tr key={t.technology} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-fg">{t.technology}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-tag-red-fg">{t.totalCves}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{t.affectedVersions}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{t.bySeverity.critical}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{t.bySeverity.high}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{t.bySeverity.medium}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {t.cves.slice(0, 3).map((c) => (
                          <span key={c.id} className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${SEVERITY_COLORS[c.severity] || 'bg-tag-blue-bg text-tag-blue-fg'}`}>
                            {c.id}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 rounded-lg border border-border bg-bg p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Audit a site</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Paste a URL to detect its technology stack and see which detected libraries have known CVEs
              or are behind on versions.
            </p>
            <InlineScan url="https://example.com" className="mt-6" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Automated asset discovery across domains and subdomains',
              'Outdated or end-of-life software flagged as it appears',
              'Board-ready reports on exposure and ownership',
            ].map((b) => (
              <div key={b} className="bg-bg px-6 py-8">
                <p className="text-sm leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
