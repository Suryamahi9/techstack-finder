import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import DataChart from '../../components/DataChart';
import { getMarketShareTrends } from '../../lib/market-share';
import { formatCount } from '../../lib/format';

export const metadata = {
  title: 'Alternative Data — TechStack Finder',
  description:
    'Usage signals no one else publishes: adoption curves, churn, and growth across millions of sites.',
};

export default function AlternativeDataPage() {
  const trends = getMarketShareTrends(12);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Alternative Data"
          lede="Usage signals no one else publishes. Adoption curves, churn, and growth across millions of sites — the non-financial data that moves investment and sales decisions. These charts are rendered from live market-share snapshots."
          cta={{ href: '/datasets', label: 'Download datasets' }}
          secondary={{ href: '/trends', label: 'View trends' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Adoption curves — top {trends.length} technologies
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map((t) => (
              <div key={t.name} className="rounded-lg border border-border bg-bg p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[15px] text-fg">{t.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-faint">{t.category}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm text-fg">{t.currentShare}%</p>
                    <p className="font-mono text-[9px] text-tag-green-fg">{t.trend}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <DataChart data={t.data} />
                </div>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-faint">
                  {formatCount(t.usageCount)} sites · {t.topSites.slice(0, 3).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Daily install, usage, and removal counts',
              'Trends broken down by category and geography',
              'CSV, JSON, and API delivery on any cadence',
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
