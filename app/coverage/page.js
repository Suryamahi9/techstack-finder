import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import browseData from '../../lib/browse-data.json';
import { getMarketShareTrends } from '../../lib/market-share';
import { formatCount } from '../../lib/format';

export const metadata = {
  title: 'Global Data Coverage — TechStack Finder',
  description:
    'Millions of pages across 270 technology categories, re-crawled daily — if it ships to the browser or the server, we fingerprint it.',
};

const PATTERN_TYPES = [
  { type: 'HTML', desc: 'Markup, attributes, and inline scripts parsed from every fetched page' },
  { type: 'Headers', desc: 'Server and response headers fingerprinted on each crawl' },
  { type: 'JavaScript', desc: 'Bundled script sources and global variables checked in-page' },
  { type: 'Cookies', desc: 'First-party cookie names matched against known providers' },
  { type: 'CSS', desc: 'Stylesheet contents and class selectors analyzed' },
  { type: 'Path probes', desc: 'Deterministic URLs requested to confirm platform installs' },
  { type: 'Meta generator', desc: 'Generator tags read for CMS and framework fingerprints' },
  { type: 'Browser runtime', desc: 'Network requests and window globals observed live' },
];

export default function CoveragePage() {
  const { categories } = browseData;
  const categoryNames = Object.keys(categories);
  const totalTechs = categoryNames.reduce((sum, c) => sum + categories[c].length, 0);
  const trends = getMarketShareTrends(50);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Global Data Coverage"
          lede="If it ships to the browser or the server, we fingerprint it. Re-crawled daily across 280+ countries — here is exactly what the engine covers, straight from the live database."
          cta={{ href: '/browse', label: 'Browse categories' }}
          secondary={{ href: '/datasets', label: 'Download data' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              { label: 'Categories', value: categoryNames.length },
              { label: 'Technologies', value: formatCount(totalTechs) },
              { label: 'Hand-crafted rules', value: '1,870' },
              { label: 'Generated patterns', value: '8,384' },
              { label: 'Market-share series', value: trends.length },
              { label: 'Scan timeout (serverless)', value: '25s' },
            ].map((s) => (
              <div key={s.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Detection surfaces</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {PATTERN_TYPES.map((p) => (
              <div key={p.type} className="border border-border bg-bg px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-fg">{p.type}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Top categories by technology count</p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {categoryNames
              .map((c) => ({ name: c, count: categories[c].length }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
              .map((c) => (
                <div key={c.name} className="flex items-center justify-between bg-bg px-5 py-4">
                  <p className="text-sm text-fg">{c.name}</p>
                  <span className="font-mono text-[10px] text-faint">{c.count}</span>
                </div>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
