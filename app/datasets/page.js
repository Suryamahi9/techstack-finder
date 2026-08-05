import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CsvDownload from '../../components/CsvDownload';
import browseData from '../../lib/browse-data.json';
import { getMarketShareTrends } from '../../lib/market-share';
import { formatCount } from '../../lib/format';

export const metadata = {
  title: 'Datasets — TechStack Finder',
  description:
    'Download-ready exports of technology usage, adoption, and market share — delivered on a schedule you control.',
};

export default function DatasetsPage() {
  const { categories, popular } = browseData;
  const categoryNames = Object.keys(categories).sort();
  const totalTechs = categoryNames.reduce((sum, c) => sum + categories[c].length, 0);
  const trends = getMarketShareTrends(50);
  const trendRows = trends.map((t) => [t.name, t.category, t.trend, t.currentShare, formatCount(t.usageCount)]);
  const categoryRows = categoryNames.map((c) => [c, categories[c].length, categories[c].slice(0, 3).map((t) => t.name).join(', ')]);
  const popularRows = popular.map((t, i) => [i + 1, t.name, t.category, t.count]);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">API & AI Agents</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            Datasets
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Download-ready exports of technology usage, adoption, and market share. Every dataset below is
            generated from the live detection engine — export it, or pull it programmatically via the API.
          </p>
        </div>

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Categories', value: categoryNames.length, note: 'technology groups' },
              { label: 'Technologies', value: formatCount(totalTechs), note: 'in detection database' },
              { label: 'Market share series', value: trends.length, note: 'with 8-year curves' },
            ].map((s) => (
              <div key={s.label} className="border border-border bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Market share · adoption curves</p>
            <CsvDownload
              filename="techstack-market-share.csv"
              headers={['technology', 'category', 'trend', 'current_share_pct', 'usage_count']}
              rows={trendRows}
            />
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Technology</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Trend</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Share %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Usage</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.name} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-fg">{t.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{t.category}</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-mono text-[10px] ${t.trend === 'growing' ? 'text-tag-green-fg' : t.trend === 'declining' ? 'text-tag-red-fg' : 'text-muted'}`}>
                        {t.trend}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-fg">{t.currentShare}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{formatCount(t.usageCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Categories · {categoryNames.length} groups</p>
            <CsvDownload
              filename="techstack-categories.csv"
              headers={['category', 'technologies', 'top_techs']}
              rows={categoryRows}
            />
          </div>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {categoryNames.map((c) => (
              <div key={c} className="bg-bg px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-fg">{c}</p>
                  <span className="font-mono text-[10px] text-faint">{categories[c].length} techs</span>
                </div>
                <p className="mt-1 truncate font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                  {categories[c].slice(0, 3).map((t) => t.name).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Most popular · detection signals</p>
            <CsvDownload filename="techstack-popular.csv" headers={['rank', 'technology', 'category', 'signals']} rows={popularRows} />
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">#</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Technology</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-faint">Signals</th>
                </tr>
              </thead>
              <tbody>
                {popular.map((t, i) => (
                  <tr key={`${t.name}-${i}`} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-faint">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-fg">{t.name}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{t.category}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
