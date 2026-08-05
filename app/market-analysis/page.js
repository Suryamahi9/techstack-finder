import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import DataChart from '../../components/DataChart';
import { getMarketShareTrends } from '../../lib/market-share';
import { formatCount } from '../../lib/format';

export const metadata = {
  title: 'Market Analysis — TechStack Finder',
  description:
    'Analyze technology adoption across the web: share of market, growth curves, and category breakdowns from live crawl data.',
};

export default function MarketAnalysisPage() {
  const trends = getMarketShareTrends(12);
  const growing = trends.filter((t) => t.trend === 'growing').length;
  const declining = trends.filter((t) => t.trend === 'declining').length;
  const maxShare = trends[0]?.currentShare || 0;
  const totalUsage = trends.reduce((a, t) => a + t.usageCount, 0);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Market Analysis"
          lede="Analyze technology adoption across the web. Share of market, eight-year growth curves, and category breakdowns — computed from the same crawl data that powers every scan."
          cta={{ href: '/trends', label: 'Open full trends report' }}
          secondary={{ href: '/datasets', label: 'Download data' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {[
              { label: 'Top share', value: `${maxShare}%`, note: 'across tracked technologies' },
              { label: 'Growing', value: growing, note: 'of top technologies' },
              { label: 'Declining', value: declining, note: 'of top technologies' },
              { label: 'Sites tracked', value: formatCount(totalUsage), note: 'in usage series' },
            ].map((s) => (
              <div key={s.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Adoption curves · market share</p>
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
                    <p className={`font-mono text-[9px] ${t.trend === 'growing' ? 'text-tag-green-fg' : t.trend === 'declining' ? 'text-tag-red-fg' : 'text-muted'}`}>
                      {t.trend}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <DataChart data={t.data} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Category-level breakdowns from 270+ technology groups',
              'Adoption, churn, and version drift on every series',
              'Export charts and tables for reports and decks',
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
