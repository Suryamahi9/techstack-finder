'use client';
import { useMemo } from 'react';

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
};

const QUADRANTS = {
  adopt: { label: 'Adopt', color: '#10b981', description: 'Battle-tested, safe to use in production' },
  trial: { label: 'Trial', color: '#3b82f6', description: 'Promising and worth experimenting with' },
  assess: { label: 'Assess', color: '#f59e0b', description: 'Worth exploring, not yet for production' },
  hold: { label: 'Hold', color: '#ef4444', description: 'Proceed with caution, consider alternatives' },
};

export default function TechRadar({ categories }) {
  const items = useMemo(() => {
    if (!categories) return [];
    const result = [];
    categories.forEach((cat) => {
      cat.technologies.forEach((t) => {
        const ring = ADOPTION[t.name] || 'trial';
        result.push({ name: t.name, type: t.type, category: cat.category, ring });
      });
    });
    return result;
  }, [categories]);

  if (!items.length) return null;

  const grouped = { adopt: [], trial: [], assess: [], hold: [] };
  items.forEach((item) => grouped[item.ring]?.push(item));

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Tech Radar</h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(QUADRANTS).map(([key, q]) => (
          <div key={key} className="rounded-xl border p-3" style={{ borderColor: `${q.color}30`, background: `${q.color}08` }}>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: q.color }} />
              <span className="text-xs font-semibold" style={{ color: q.color }}>{q.label}</span>
              <span className="ml-auto font-mono text-[10px] text-faint">{grouped[key].length}</span>
            </div>
            <p className="mt-1 text-[10px] text-muted leading-relaxed">{q.description}</p>
          </div>
        ))}
      </div>

      {Object.entries(QUADRANTS).map(([key, q]) => (
        grouped[key].length > 0 && (
          <div key={key} className="mb-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: q.color }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{q.label} ({grouped[key].length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {grouped[key].map((item) => (
                <span
                  key={item.name}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  style={{ borderColor: `${q.color}30`, color: q.color, background: `${q.color}10` }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ background: item.type === 'frontend' ? '#3b82f6' : item.type === 'backend' ? '#10b981' : '#f59e0b' }} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
