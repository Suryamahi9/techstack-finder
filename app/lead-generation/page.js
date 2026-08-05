import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import TechDirectory from '../../components/TechDirectory';
import { getMarketShareTrends } from '../../lib/market-share';

export const metadata = {
  title: 'Lead Generation — TechStack Finder',
  description:
    'Turn website technology data into outbound pipeline: find accounts running your target stack, verify the signal, and export.',
};

export default function LeadGenerationPage() {
  const rising = getMarketShareTrends(30).filter((t) => t.trend === 'growing').slice(0, 12);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Lead Generation"
          lede="Turn website technology data into outbound pipeline. Find accounts running your target stack, verify the signal with a live scan, and export straight to your CRM."
          cta={{ href: '/signup', label: 'Start generating leads' }}
          secondary={{ href: '/pricing', label: 'See pricing' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              { k: 'Target', v: 'Filter by the exact technologies your product complements' },
              { k: 'Verify', v: 'One-click scan confirms the stack before you reach out' },
              { k: 'Export', v: 'CSV or JSON enriched with category, domain, and traffic signals' },
            ].map((s) => (
              <div key={s.k} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.k}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        <TechDirectory
          techs={rising.map((t) => t.name)}
          hint="Start with a technology your ideal customers already run."
          searchPlaceholder="Search accounts…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Lead lists built from live adoption, not stale directories',
              'Segment by technology, category, and geography',
              'Enrichment fields ready for your outreach templates',
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
