'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BackButton from '../../components/BackButton';
import TrendsCountryBar from '../../components/TrendsCountryBar';
import TechGroupFilter from '../../components/TechGroupFilter';
import TechDirectoryList from '../../components/TechDirectoryList';
import {
  SPOTLIGHT_TECHNOLOGIES,
  TECH_DIRECTORY,
  TECH_GROUPS,
  COUNTRIES,
  totalLiveSites,
} from '../../lib/trends-data';
import { getScanTrends } from '../../lib/scan-trends';
import { formatCount } from '../../lib/format';

const HISTORY_KEY = 'tsf-history';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function countryName(code) {
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? c.name : 'Worldwide';
}

function BarChart({ items, maxVal }) {
  if (!items.length) return null;
  const max = maxVal || Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 truncate text-xs text-muted" title={item.label}>
            {item.label}
          </span>
          <div className="relative flex-1 h-5 overflow-hidden rounded-md bg-border/50">
            <div
              className="absolute inset-y-0 left-0 rounded-md transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || 'var(--accent)',
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-fg">
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineDot({ entry, index }) {
  const d = new Date(entry.scannedAt);
  const dateStr = d.toLocaleDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex gap-4 animate-fade-up" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex flex-col items-center">
        <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-bg" />
        {index < 10 && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className="mb-6 flex-1">
        <div className="font-mono text-xs text-faint">{dateStr} {timeStr}</div>
        <a
          href={`/results?site=${encodeURIComponent(entry.url || entry.domain)}`}
          className="mt-1 block font-semibold text-fg hover:text-accent transition-colors"
        >
          {entry.domain}
        </a>
        <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted">
          <span>{entry.total} techs</span>
          <span>·</span>
          <span className="text-sky-400">{entry.frontend} FE</span>
          <span>·</span>
          <span className="text-emerald-400">{entry.backend} BE</span>
          <span>·</span>
          <span className="text-amber-400">{entry.infra} Infra</span>
        </div>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [country, setCountry] = useState('IN');
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    setHistory(getHistory());
    setTrends(getScanTrends());

    const handler = () => {
      setHistory(getHistory());
      setTrends(getScanTrends());
    };
    window.addEventListener('tsf-history-updated', handler);
    return () => window.removeEventListener('tsf-history-updated', handler);
  }, []);

  const handleSelectTag = (tag) => {
    setActiveTag(tag);
    document.getElementById('popular-technologies')?.scrollIntoView({ behavior: 'smooth' });
  };

  const allTechs = {};
  const allCats = {};
  [...trends, ...history].forEach((entry) => {
    if (entry.techBreakdown) {
      Object.entries(entry.techBreakdown).forEach(([name, count]) => {
        allTechs[name] = (allTechs[name] || 0) + count;
      });
    }
    if (entry.categoryBreakdown) {
      Object.entries(entry.categoryBreakdown).forEach(([name, count]) => {
        allCats[name] = (allCats[name] || 0) + count;
      });
    }
  });

  const topTechs = Object.entries(allTechs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, value]) => ({ label, value, color: 'var(--accent)' }));

  const topCats = Object.entries(allCats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, value]) => ({ label, value, color: '#38bdf8' }));

  const totalScans = history.length + trends.length;
  const totalTechsFound = [...new Set(
    [...history, ...trends].flatMap((e) => e.techBreakdown ? Object.keys(e.techBreakdown) : [])
  )].length;

  return (
    <div className="relative min-h-screen">
      <Header />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="dot-grid-bg absolute inset-0" />
        <div className="gradient-mesh absolute inset-0" />
      </div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-24">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            Web Technology Usage Trends
          </p>
          <h1 className="mt-5 font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            Technologies in use across <span className="text-accent">the web</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Live-site counts for {formatCount(TECH_DIRECTORY.length)} of the most popular
            technologies, from content management systems to ad networks — with a spotlight on
            adoption across India.
          </p>
        </div>

        <section className="mt-10 border border-border bg-elevated p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-fg">
                {country === 'IN' ? 'Trends in India' : country === 'WW' ? 'Trends Worldwide' : `Trends in ${countryName(country)}`}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {formatCount(totalLiveSites())} total live-site instances tracked across the directory.
              </p>
            </div>
            <TrendsCountryBar value={country} onChange={setCountry} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-1 text-lg font-semibold text-fg">Spotlight Technologies</h2>
          <p className="mb-4 text-sm text-muted">
            Emerging technologies moving fast on the modern web.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {SPOTLIGHT_TECHNOLOGIES.map((t) => (
              <a
                key={t.slug}
                href={`/trends/${t.slug}`}
                className="group flex flex-col border border-border bg-surface p-5 transition-colors hover:border-accent"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Spotlight
                  </span>
                  <span className="font-serif text-xl font-bold text-fg group-hover:text-accent">
                    {formatCount(t.liveSites)}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-lg font-semibold text-fg group-hover:text-accent">
                  {t.name}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">
                  {t.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="text-faint">
                    {formatCount(t.indianSites)} sites in India
                  </span>
                  <span className="font-mono text-accent">→</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Technology Groups</h2>
              <p className="mt-1 text-sm text-muted">
                Explore technologies by category. Pick a group, then filter by tag.
              </p>
            </div>
            <a
              href="/browse"
              className="border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              Browse all categories →
            </a>
          </div>
          <div className="mt-4 border border-border bg-elevated p-6">
            <TechGroupFilter groups={TECH_GROUPS} onSelectTag={handleSelectTag} />
          </div>
        </section>

        <section id="popular-technologies" className="mt-10 scroll-mt-24">
          <h2 className="mb-1 text-lg font-semibold text-fg">Popular Technologies</h2>
          <p className="mb-4 text-sm text-muted">
            Live-site and {country === 'IN' ? 'India' : countryName(country)} site counts for the
            technologies in the directory.
          </p>
          <TechDirectoryList
            techs={TECH_DIRECTORY}
            country={country}
            countryName={countryName(country)}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
          />
        </section>

        <section className="mt-12 border-t border-border pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-fg">Your Scan Trends</h2>
              <p className="mt-1 text-sm text-muted">
                {totalScans} scans tracked · {totalTechsFound} unique technologies found in your history
              </p>
            </div>
            <a
              href="/"
              className="bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Scan a site
            </a>
          </div>

          {totalScans === 0 ? (
            <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
              <svg className="mx-auto mb-4 h-10 w-10 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-10" />
              </svg>
              <h3 className="text-lg font-semibold">No scan history yet</h3>
              <p className="mt-2 text-sm text-muted">
                Scan some sites to start tracking technology trends.
              </p>
              <a
                href="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
              >
                Scan a site
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {topTechs.length > 0 && (
                <div className="rounded-2xl border border-border bg-elevated p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
                    Most Detected Technologies
                  </h2>
                  <BarChart items={topTechs} />
                </div>
              )}

              {topCats.length > 0 && (
                <div className="rounded-2xl border border-border bg-elevated p-6">
                  <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-faint">
                    Most Active Categories
                  </h2>
                  <BarChart items={topCats} />
                </div>
              )}

              {history.length > 0 && (
                <div className="rounded-2xl border border-border bg-elevated p-6">
                  <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-faint">
                    Recent Scans
                  </h2>
                  <div>
                    {history.slice(0, 10).map((entry, i) => (
                      <TimelineDot key={`${entry.domain}-${entry.scannedAt}`} entry={entry} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
