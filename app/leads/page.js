import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TechDirectory from '../../components/TechDirectory';
import { getMarketShareTrends } from '../../lib/market-share';
import { formatCount } from '../../lib/format';

export const metadata = {
  title: 'LeadsEye — Future Customers — TechStack Finder',
  description:
    'Find sites that just adopted a technology, dropped a competitor, or started growing fast. Lead generation with timing on your side.',
};

export default function LeadsPage() {
  const trends = getMarketShareTrends(30);
  const rising = trends.filter((t) => t.trend === 'growing').slice(0, 12);
  const topRising = [...rising].sort((a, b) => b.currentShare - a.currentShare).slice(0, 5);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Products</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            LeadsEye
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Future customers for your product: sites that just adopted a technology, dropped a competitor,
            or started growing fast. The adoption signals below are computed from live market-share data.
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Technologies on the rise — {rising.length} growing right now
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {topRising.map((t) => (
              <div key={t.name} className="flex items-center justify-between border border-border bg-bg px-4 py-3">
                <div>
                  <p className="font-serif text-[15px] text-fg">{t.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-faint">{t.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-tag-green-fg">{t.currentShare}%</p>
                  <p className="font-mono text-[9px] text-faint">{formatCount(t.usageCount)} sites</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
            Start with a technology chip below — each one maps to a real directory of sites running it, and
            every row can be live-scanned to confirm the adoption signal before you reach out.
          </p>
        </section>

        <TechDirectory
          techs={rising.map((t) => t.name)}
          hint="Growing technologies — pick one to see adopters."
          searchPlaceholder="Search adopters…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Spot adoption and churn signals before rivals do',
              'Segment by technology, geography, and growth',
              'Export leads enriched with contactable context',
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
