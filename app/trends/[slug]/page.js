import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import BackButton from '../../../components/BackButton';
import {
  getTechBySlug,
  relatedTechs,
  countrySites,
  COUNTRIES,
  allTechSlugs,
} from '../../../lib/trends-data';
import { getMarketShare, getTrendDirection } from '../../../lib/market-share';
import { formatCount } from '../../../lib/format';

export const dynamicParams = true;

export function generateStaticParams() {
  return allTechSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const tech = getTechBySlug(params.slug);
  if (!tech) return { title: 'Technology Not Found' };
  return {
    title: `${tech.name} Market Share & Usage Trends — TechStack Finder`,
    description: `${tech.name}: ${formatCount(tech.liveSites)} live sites detected globally and ${formatCount(tech.indianSites)} in India. See usage trends, related technologies, and market data.`,
  };
}

function TrendBadge({ trend }) {
  if (!trend) return null;
  const styles = {
    up: 'border-tag-green-bg bg-tag-green-bg text-tag-green-fg',
    down: 'border-tag-red-bg bg-tag-red-bg text-tag-red-fg',
    flat: 'border-border bg-border/50 text-muted',
  };
  const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
  return (
    <span className={`inline-flex items-center gap-1 border px-2 py-1 text-xs font-medium ${styles[trend.direction]}`}>
      {arrow} {trend.label}
    </span>
  );
}

export default function TechDetailPage({ params }) {
  const tech = getTechBySlug(params.slug);
  if (!tech) notFound();

  const market = getMarketShare(tech.name);
  const trend = getTrendDirection(tech.name);
  const related = relatedTechs(tech, 6);

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="border border-border bg-elevated p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Web Technology Usage Trends
          </p>
          <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-fg sm:text-4xl">
            {tech.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{tech.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {tech.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border bg-surface px-2 py-1 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TrendBadge trend={trend} />
            {market && (
              <span className="text-xs text-faint">
                {market.category} · {market.currentShare}% share{market.trend === 'growing' ? ' and rising' : market.trend === 'declining' ? ' but falling' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-border bg-surface p-5">
            <p className="font-serif text-2xl font-bold leading-none text-fg">
              {formatCount(tech.liveSites)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-faint">Live Sites Worldwide</p>
          </div>
          <div className="border border-border bg-surface p-5">
            <p className="font-serif text-2xl font-bold leading-none text-accent">
              {formatCount(tech.indianSites)}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-faint">Sites in India</p>
          </div>
          <div className="border border-border bg-surface p-5">
            <p className="font-serif text-2xl font-bold leading-none text-fg">
              {tech.tags.length}
            </p>
            <p className="mt-2 text-xs uppercase tracking-wide text-faint">Technology Tags</p>
          </div>
        </div>

        <div className="mt-6 border border-border bg-elevated p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
            Country Breakdown
          </h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            <div className="flex items-center justify-between border-b border-border/50 py-2 text-sm">
              <span className="text-muted">Worldwide</span>
              <span className="font-mono text-fg">{formatCount(tech.liveSites)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 py-2 text-sm">
              <span className="text-muted">🇮🇳 India</span>
              <span className="font-mono text-accent">{formatCount(tech.indianSites)}</span>
            </div>
            {COUNTRIES.filter((c) => c.code !== 'IN').map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between border-b border-border/50 py-2 text-sm"
              >
                <span className="text-muted">
                  {c.flag} {c.name}
                </span>
                <span className="font-mono text-fg">
                  {formatCount(countrySites(tech, c.code))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/"
            className="bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Scan a site using {tech.name}
          </a>
          <a
            href="/trends"
            className="border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            ← Back to Trends
          </a>
          <a
            href="/browse"
            className="border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            Browse all technologies
          </a>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
              Related Technologies
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <a
                  key={r.slug}
                  href={`/trends/${r.slug}`}
                  className="group border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <h3 className="font-serif text-base font-semibold text-fg group-hover:text-accent">
                    {r.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {r.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
                    <span className="font-mono text-fg">{formatCount(r.liveSites)}</span>
                    <span className="text-faint">live sites</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
