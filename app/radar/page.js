'use client';
import { Suspense, useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ADOPTION = {
  'Next.js': 'adopt', 'React': 'adopt', 'TypeScript': 'adopt', 'Tailwind CSS': 'adopt', 'Node.js': 'adopt',
  'Vite': 'adopt', 'PostgreSQL': 'adopt', 'Docker': 'adopt', 'AWS': 'adopt', 'Cloudflare': 'adopt',
  'Vue.js': 'adopt', 'Svelte': 'trial', 'Astro': 'trial', 'Remix': 'trial', 'Nuxt': 'trial',
  'Vercel': 'adopt', 'Netlify': 'trial', 'Supabase': 'trial', 'Prisma': 'trial', 'tRPC': 'trial',
  'Turborepo': 'trial', 'esbuild': 'trial', 'Solid.js': 'assess', 'Qwik': 'assess', 'Bun': 'assess',
  'Deno': 'assess', 'Effect-TS': 'assess', 'Drizzle ORM': 'trial', 'Turso': 'assess',
  'Firebase': 'adopt', 'MongoDB': 'adopt', 'Redis': 'adopt', 'Django': 'adopt', 'Flask': 'adopt',
  'FastAPI': 'trial', 'Laravel': 'adopt', 'Express': 'adopt', 'GraphQL': 'trial', 'REST API': 'adopt',
  'Stripe': 'adopt', 'PayPal': 'adopt', 'Sentry': 'adopt', 'Playwright': 'trial', 'Cypress': 'adopt',
  'Jest': 'adopt', 'Vitest': 'trial', 'Storybook': 'trial', 'Framer Motion': 'adopt',
  'GSAP': 'hold', 'jQuery': 'hold', 'Bootstrap': 'hold', 'Webpack': 'hold', 'Babel': 'hold',
  'Gatsby': 'hold', 'Parcel': 'hold', 'Moment.js': 'hold', 'Lodash': 'hold',
  'Three.js': 'trial', 'D3.js': 'adopt', 'Mapbox': 'trial',
  'Kubernetes': 'adopt', 'Terraform': 'adopt', 'GitHub Actions': 'adopt',
  'Auth0': 'adopt', 'Clerk': 'trial', 'NextAuth.js': 'trial', 'Firebase Auth': 'adopt',
  'Google Analytics': 'adopt', 'Plausible': 'trial', 'Fathom': 'trial', 'PostHog': 'trial',
  'Algolia': 'trial', 'Elasticsearch': 'adopt', 'Contentful': 'trial', 'Sanity': 'trial', 'Strapi': 'trial',
  'Sass': 'adopt', 'styled-components': 'trial', 'Emotion': 'trial', 'Chakra UI': 'trial',
  'Material UI': 'adopt', 'Ant Design': 'adopt', 'Radix UI': 'trial', 'Headless UI': 'trial',
  'Socket.io': 'adopt', 'Webpack Dev Server': 'hold', 'Browserslist': 'adopt',
  'Jenkins': 'hold', 'CircleCI': 'trial', 'Travis CI': 'hold', 'GitLab CI': 'adopt',
  'Apache': 'adopt', 'Nginx': 'adopt', 'Varnish': 'assess',
  'New Relic': 'adopt', 'Datadog': 'adopt', 'Grafana': 'adopt', 'Prometheus': 'adopt',
  'Twilio': 'adopt', 'SendGrid': 'adopt', 'Mailchimp': 'adopt',
  'Contentstack': 'trial', 'Prismic': 'trial', 'Ghost': 'trial',
  'Stripe Elements': 'adopt', 'Shopify': 'adopt', 'WooCommerce': 'adopt',
  'reCAPTCHA': 'adopt', 'hCaptcha': 'trial', 'Turnstile': 'trial',
  'Mapbox GL': 'trial', 'Leaflet': 'adopt', 'Google Maps': 'adopt',
};

const RINGS = {
  adopt: { label: 'Adopt', color: '#10b981', description: 'Battle-tested, safe for production' },
  trial: { label: 'Trial', color: '#3b82f6', description: 'Promising, worth experimenting with' },
  assess: { label: 'Assess', color: '#f59e0b', description: 'Explore, not yet for production' },
  hold: { label: 'Hold', color: '#ef4444', description: 'Proceed with caution' },
};

function RadarPageContent() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tsf-history');
      if (raw) {
        const parsed = JSON.parse(raw);
        setScans(Array.isArray(parsed) ? parsed.slice(0, 10) : []);
      }
    } catch {}
  }, []);

  const allTechs = useMemo(() => {
    const seen = new Map();
    scans.forEach((scan) => {
      (scan.categories || []).forEach((cat) => {
        cat.technologies.forEach((t) => {
          if (!seen.has(t.name)) seen.set(t.name, { name: t.name, type: t.type, category: cat.category, ring: ADOPTION[t.name] || 'trial', count: 0 });
          seen.get(t.name).count++;
        });
      });
    });
    return [...seen.values()];
  }, [scans]);

  const grouped = { adopt: [], trial: [], assess: [], hold: [] };
  allTechs.forEach((item) => grouped[item.ring]?.push(item));

  const totalTechs = allTechs.length;
  const ringCounts = Object.fromEntries(Object.entries(grouped).map(([k, v]) => [k, v.length]));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pt-28 pb-20 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tech <span className="text-accent">Radar</span>
          </h1>
          <p className="mt-3 text-sm text-muted">
            Categorize technologies by adoption readiness across your scans.
          </p>
        </div>

        {scans.length === 0 ? (
          <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
            <p className="text-sm text-muted">Scan some sites first to populate the radar.</p>
            <a href="/" className="mt-4 inline-block text-xs text-accent hover:underline">Scan a site →</a>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(RINGS).map(([key, q]) => (
                <div key={key} className="rounded-xl border p-4 text-center" style={{ borderColor: `${q.color}30`, background: `${q.color}08` }}>
                  <div className="font-mono text-2xl font-bold" style={{ color: q.color }}>{ringCounts[key]}</div>
                  <div className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</div>
                  <p className="mt-1 text-[10px] text-muted">{q.description}</p>
                </div>
              ))}
            </div>

            <div className="mb-4 text-xs text-faint">{totalTechs} unique technologies across {Math.min(scans.length, 10)} scans</div>

            {Object.entries(RINGS).map(([key, q]) => (
              grouped[key].length > 0 && (
                <div key={key} className="mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: q.color }} />
                    <span className="text-sm font-semibold" style={{ color: q.color }}>{q.label}</span>
                    <span className="font-mono text-[10px] text-faint">({grouped[key].length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[key].map((item) => (
                      <div key={item.name} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: `${q.color}20`, background: `${q.color}05` }}>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.type === 'frontend' ? '#3b82f6' : item.type === 'backend' ? '#10b981' : '#f59e0b' }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-fg truncate">{item.name}</div>
                          <div className="text-[10px] text-faint">{item.category} · {item.count} scan{item.count > 1 ? 's' : ''}</div>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ color: q.color, background: `${q.color}15` }}>
                          {item.type.slice(0, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function RadarPage() {
  return <RadarPageContent />;
}
