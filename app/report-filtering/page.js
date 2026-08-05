import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import ReportFilter from '../../components/ReportFilter';
import { getMarketShareTrends } from '../../lib/market-share';

export const metadata = {
  title: 'Report Filtering — TechStack Finder',
  description:
    'Slice any technology report by search, category, trend, and sort — then export the exact rows you need.',
};

export default function ReportFilteringPage() {
  const rows = getMarketShareTrends(60);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Report Filtering"
          lede="Slice any report down to the rows that matter. Search, filter by category or trend, sort by share or usage — and export the exact dataset with one click."
          cta={{ href: '/datasets', label: 'Browse full datasets' }}
          secondary={{ href: '/api-keys', label: 'Filter via API' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <ReportFilter rows={rows} />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Combine text, category, trend, and sort filters',
              'Inline sparklines show momentum on every row',
              'Export the filtered result as CSV, instantly',
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
