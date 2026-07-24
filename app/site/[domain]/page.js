'use client';
import { useMemo, useState, useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import TechRadar from '../../../components/TechRadar';
import StackVisualization from '../../../components/StackVisualization';
import EmbedWidget from '../../../components/EmbedWidget';
import ShareButton from '../../../components/ShareButton';
import BookmarkButton from '../../../components/BookmarkButton';

function PublicProfileContent({ domain }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `https://${domain}` }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [domain]);

  useEffect(() => {
    if (!data) return;
    document.title = `${domain} — Tech Stack | TechStack Finder`;

    const metaDesc = document.querySelector('meta[name="description"]');
    const desc = `${domain} uses ${(data.summary?.total || 0)} technologies: ${(data.categories || []).slice(0, 3).map(c => c.category).join(', ')}. View the full tech stack profile.`;
    if (metaDesc) metaDesc.setAttribute('content', desc);
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogD = document.querySelector('meta[property="og:description"]');
    const ogImg = document.querySelector('meta[property="og:image"]');
    const twCard = document.querySelector('meta[name="twitter:card"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    const setMeta = (attr, name, val) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };

    setMeta('property', 'og:title', `${domain} Tech Stack Profile`);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', `https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', `https://techstackfinder.com/site/${domain}`);
    setMeta('name', 'twitter:card', 'summary');
    setMeta('name', 'twitter:title', `${domain} Tech Stack Profile`);
    setMeta('name', 'twitter:description', desc);

    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = `https://techstackfinder.com/site/${domain}`;
      document.head.appendChild(link);
    }

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${domain} Tech Stack`,
      description: desc,
      url: `https://${domain}`,
      applicationCategory: 'DeveloperApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    };
    const existingLd = document.querySelector('script[type="application/ld+json"]');
    if (existingLd) existingLd.textContent = JSON.stringify(ld);
    else {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(ld);
      document.head.appendChild(s);
    }
  }, [data, domain]);

  const allTechs = useMemo(() => {
    if (!data) return [];
    return (data.categories || []).flatMap((c) => c.technologies.map((t) => ({ ...t, category: c.category })));
  }, [data]);

  const techCounts = useMemo(() => {
    const counts = { frontend: 0, backend: 0, infra: 0 };
    allTechs.forEach((t) => { if (counts[t.type] !== undefined) counts[t.type]++; });
    return counts;
  }, [allTechs]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-8 text-center">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="mx-auto h-8 w-48 rounded bg-elevated" />
              <div className="mx-auto h-4 w-32 rounded bg-elevated" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
              <h2 className="text-lg font-semibold">Unable to load profile</h2>
              <p className="mt-2 text-sm text-muted">{error}</p>
              <a href="/" className="mt-4 inline-block text-xs text-accent hover:underline">&larr; Back to home</a>
            </div>
          ) : (
            <>
              <div className="mb-3 inline-flex items-center gap-3 rounded-2xl border border-border bg-elevated px-6 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold text-lg">
                  {domain.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold tracking-tight">{domain}</h1>
                  <p className="text-xs text-muted">TechStack Profile &middot; {data.site?.url}</p>
                </div>
              </div>

              <div className="mt-6 mb-6 flex justify-center gap-3">
                <BookmarkButton data={data} />
                <ShareButton site={domain} />
              </div>

              <div className="mt-2 mb-8 flex justify-center gap-4">
                {[
                  { label: 'Total', value: data.summary?.total || 0, color: 'text-accent' },
                  { label: 'Frontend', value: techCounts.frontend, color: 'text-blue-400' },
                  { label: 'Backend', value: techCounts.backend, color: 'text-emerald-400' },
                  { label: 'Infrastructure', value: techCounts.infra, color: 'text-amber-400' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-elevated px-4 py-3 text-center">
                    <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-faint">{s.label}</div>
                  </div>
                ))}
              </div>

              {allTechs.length > 0 && (
                <div className="mb-8 rounded-2xl border border-border bg-elevated p-5">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">All Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTechs.map((t) => (
                      <span key={t.name + t.category} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                        t.type === 'frontend' ? 'border-blue-500/20 bg-blue-500/10 text-blue-400' :
                        t.type === 'backend' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
                        'border-amber-500/20 bg-amber-500/10 text-amber-400'
                      }`}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <TechRadar categories={data.categories} />
              </div>

              <div className="mb-8">
                <StackVisualization categories={data.categories} />
              </div>

              <div className="mb-8">
                <EmbedWidget domain={domain} />
              </div>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a href={`/results?site=${encodeURIComponent(domain)}`} className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg hover:brightness-110 transition-all">
                  View Full Report &rarr;
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`https://techstackfinder.com/site/${domain}`);
                  }}
                  className="rounded-xl border border-border bg-elevated px-6 py-3 text-sm font-medium text-muted hover:border-border-strong transition-all"
                >
                  Copy Shareable Link
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PublicProfilePage({ params }) {
  const domain = params?.domain || '';
  return <PublicProfileContent domain={decodeURIComponent(domain)} />;
}
