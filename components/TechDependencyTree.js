'use client';
import { useMemo } from 'react';

const DEPS = {
  'Next.js':       ['React', 'Node.js'],
  'React':         [],
  'Vue.js':        [],
  'Angular':       [],
  'Svelte':        [],
  'Nuxt':          ['Vue.js', 'Node.js'],
  'Gatsby':        ['React', 'Node.js'],
  'Remix':         ['React', 'Node.js'],
  'Astro':         [],
  'Solid.js':      [],
  'Tailwind CSS':  [],
  'Bootstrap':     [],
  'Bulma':         [],
  'Foundation':    [],
  'Material UI':   ['React'],
  'Chakra UI':     ['React'],
  'Ant Design':    ['React'],
  'Vuetify':       ['Vue.js'],
  'jQuery':        [],
  'Lodash':        [],
  'moment':        [],
  'Day.js':        [],
  'Axios':         [],
  'Three.js':      [],
  'D3.js':         [],
  'GSAP':          [],
  'Framer Motion': ['React'],
  'Node.js':       [],
  'Express':       ['Node.js'],
  'Django':        ['Python'],
  'Laravel':       ['PHP'],
  'Ruby on Rails': ['Ruby'],
  'Spring Boot':   ['Java'],
  'Flask':         ['Python'],
  'FastAPI':       ['Python'],
  'WordPress':     ['PHP', 'MySQL'],
  'Drupal':        ['PHP', 'MySQL'],
  'Webpack':       ['Node.js'],
  'Vite':          ['Node.js'],
  'Parcel':        ['Node.js'],
  'esbuild':       [],
  'Turbopack':     ['Node.js'],
  'TypeScript':    ['JavaScript'],
  'Prisma':        ['Node.js'],
  'Docker':        [],
  'Kubernetes':    ['Docker'],
  'Terraform':     [],
  'GraphQL':       [],
  'Jest':          ['Node.js'],
  'Cypress':       ['Node.js'],
  'Playwright':    ['Node.js'],
  'Storybook':     ['Node.js'],
  'Sentry':        [],
  'New Relic':     [],
  'Datadog':       [],
  'Firebase':      ['Node.js'],
  'Supabase':      ['Node.js'],
  'Algolia':       [],
  'Elasticsearch': [],
  'Redis':         [],
  'MongoDB':       [],
  'PostgreSQL':    [],
  'MySQL':         [],
  'Contentful':    ['Node.js'],
  'Sanity':        ['Node.js'],
  'Strapi':        ['Node.js'],
  'NextAuth.js':   ['Next.js', 'Node.js'],
  'Clerk':         ['Node.js'],
  'Auth0':         ['Node.js'],
  'Firebase Auth': ['Firebase'],
};

const TYPE_COLORS = {
  frontend: '#3b82f6',
  backend: '#10b981',
  infra: '#f59e0b',
};

export default function TechDependencyTree({ categories }) {
  const detectedNames = useMemo(() => {
    if (!categories) return new Set();
    const names = new Set();
    categories.forEach((cat) => cat.technologies.forEach((t) => names.add(t.name)));
    return names;
  }, [categories]);

  if (!detectedNames.size) return null;

  const typeOf = (name) => {
    for (const cat of categories || []) {
      for (const t of cat.technologies) {
        if (t.name === name) return t.type;
      }
    }
    return 'infra';
  };

  const tree = [];
  const seen = new Set();

  detectedNames.forEach((name) => {
    const deps = (DEPS[name] || []).filter((d) => detectedNames.has(d) && !seen.has(d));
    if (deps.length > 0) {
      deps.forEach((d) => seen.add(d));
      tree.push({ name, deps, type: typeOf(name) });
    }
  });

  if (!tree.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Technology Dependencies
        </h3>
        <p className="mt-1 text-[11px] text-muted">How your detected technologies relate</p>
      </div>
      <div className="space-y-3">
        {tree.map((item) => {
          const color = TYPE_COLORS[item.type] || '#8b5cf6';
          return (
            <div
              key={item.name}
              className="group rounded-lg border border-border bg-bg/50 p-3 transition-all hover:border-border-strong"
            >
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                <span className="text-sm font-semibold text-fg">{item.name}</span>
                <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ color, background: `${color}15` }}>
                  {item.type}
                </span>
              </div>
              <div className="mt-2 ml-4 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-faint">depends on →</span>
                {item.deps.map((dep) => {
                  const depColor = TYPE_COLORS[typeOf(dep)] || '#8b5cf6';
                  return (
                    <span
                      key={dep}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                      style={{ borderColor: `${depColor}30`, color: depColor, background: `${depColor}10` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: depColor }} />
                      {dep}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
