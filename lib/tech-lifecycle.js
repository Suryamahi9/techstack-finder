const LIFECYCLE_DB = {
  'React':        { phase: 'mature', introduced: 2013, peak: 2020, trend: 'stable', eol: null, notes: 'Dominant UI library, still growing slowly.' },
  'Next.js':      { phase: 'growing', introduced: 2016, peak: null, trend: 'growing', eol: null, notes: 'Fastest-growing React framework. Server components era.' },
  'Vue.js':       { phase: 'mature', introduced: 2014, peak: 2021, trend: 'stable', eol: null, notes: 'Stable ecosystem, Vue 3 matured.' },
  'Angular':      { phase: 'declining', introduced: 2016, peak: 2018, trend: 'declining', eol: null, notes: 'Enterprise adoption declining in favor of React/Vue.' },
  'Svelte':       { phase: 'growing', introduced: 2016, peak: null, trend: 'growing', eol: null, notes: 'Small but passionate community. SvelteKit maturing.' },
  'jQuery':       { phase: 'deprecated', introduced: 2006, peak: 2014, trend: 'declining', eol: null, notes: 'Legacy. Still powers ~20% of sites but shrinking.' },
  'Bootstrap':    { phase: 'declining', introduced: 2011, peak: 2015, trend: 'declining', eol: null, notes: 'Superseded by Tailwind CSS and utility-first frameworks.' },
  'Tailwind CSS': { phase: 'growing', introduced: 2017, peak: null, trend: 'growing', eol: null, notes: 'Industry standard utility CSS. Rapid adoption.' },
  'WordPress':    { phase: 'mature', introduced: 2003, peak: 2018, trend: 'stable', eol: null, notes: 'Powers ~40% of the web. Slowly losing share to headless CMS.' },
  'Shopify':      { phase: 'mature', introduced: 2006, peak: null, trend: 'growing', eol: null, notes: 'Dominant hosted e-commerce. Hydrogen/Oxygen growing.' },
  'Node.js':      { phase: 'mature', introduced: 2009, peak: 2020, trend: 'stable', eol: null, notes: 'Ubiquitous backend runtime. Deno/Bun emerging as alternatives.' },
  'Deno':         { phase: 'growing', introduced: 2018, peak: null, trend: 'growing', eol: null, notes: 'Growing alternative to Node.js. V2 gaining traction.' },
  'Bun':          { phase: 'growing', introduced: 2022, peak: null, trend: 'growing', eol: null, notes: 'Fast JS runtime. Still early but adoption accelerating.' },
  'TypeScript':   { phase: 'growing', introduced: 2012, peak: null, trend: 'growing', eol: null, notes: 'Becoming the default for new JS projects.' },
  'Python':       { phase: 'growing', introduced: 1991, peak: null, trend: 'growing', eol: null, notes: 'AI/ML boom driving unprecedented growth.' },
  'PHP':          { phase: 'declining', introduced: 1995, peak: 2010, trend: 'declining', eol: null, notes: 'Still massive install base (WordPress/Laravel) but shrinking.' },
  'Ruby on Rails':{ phase: 'declining', introduced: 2004, peak: 2012, trend: 'declining', eol: null, notes: 'Stable niche. Rails 7 revitalized but overall decline.' },
  'Java':         { phase: 'mature', introduced: 1995, peak: 2015, trend: 'stable', eol: null, notes: 'Enterprise backbone. Spring Boot still strong.' },
  'Go':           { phase: 'growing', introduced: 2009, peak: null, trend: 'growing', eol: null, notes: 'Cloud-native standard. Fast adoption in infrastructure.' },
  'Rust':         { phase: 'growing', introduced: 2015, peak: null, trend: 'growing', eol: null, notes: 'Most loved language. Growing in web/infra (Cloudflare, Vercel).' },
  'Docker':       { phase: 'mature', introduced: 2013, peak: 2021, trend: 'stable', eol: null, notes: 'Container standard. Podman emerging as alternative.' },
  'Kubernetes':   { phase: 'mature', introduced: 2014, peak: 2022, trend: 'stable', eol: null, notes: 'Container orchestration standard. Complexity concerns.' },
  'PostgreSQL':   { phase: 'growing', introduced: 1996, peak: null, trend: 'growing', eol: null, notes: 'Most popular open-source DB. Replacing MySQL in new projects.' },
  'MongoDB':      { phase: 'mature', introduced: 2009, peak: 2019, trend: 'stable', eol: null, notes: 'Leading document DB. Atlas simplifying adoption.' },
  'Redis':        { phase: 'mature', introduced: 2009, peak: 2020, trend: 'stable', eol: null, notes: 'In-memory standard. Valkey fork after license change.' },
  'GraphQL':      { phase: 'mature', introduced: 2015, peak: 2021, trend: 'stable', eol: null, notes: 'Stable adoption. tRPC gaining ground for type safety.' },
  'REST':         { phase: 'mature', introduced: 2000, peak: 2018, trend: 'stable', eol: null, notes: 'Still the dominant API paradigm.' },
  'Webpack':      { phase: 'declining', introduced: 2012, peak: 2020, trend: 'declining', eol: null, notes: 'Being replaced by Vite, Turbopack, esbuild.' },
  'Vite':         { phase: 'growing', introduced: 2020, peak: null, trend: 'growing', eol: null, notes: 'Fastest-growing build tool. Replacing Webpack.' },
  'Turbopack':    { phase: 'growing', introduced: 2022, peak: null, trend: 'growing', eol: null, notes: 'Vercel\'s Rust-based bundler. Still early.' },
  'nginx':        { phase: 'mature', introduced: 2004, peak: 2018, trend: 'stable', eol: null, notes: 'Most used web server. Caddy gaining niche.' },
  'Apache':       { phase: 'declining', introduced: 1995, peak: 2005, trend: 'declining', eol: null, notes: 'Legacy. Slowly replaced by nginx/Caddy.' },
  'Caddy':        { phase: 'growing', introduced: 2015, peak: null, trend: 'growing', eol: null, notes: 'Automatic HTTPS, growing in simplicity-focused stacks.' },
  'Stripe':       { phase: 'growing', introduced: 2010, peak: null, trend: 'growing', eol: null, notes: 'Dominant payment API. Expanding into billing, treasury.' },
  'Firebase':     { phase: 'mature', introduced: 2012, peak: 2020, trend: 'stable', eol: null, notes: 'Popular for MVPs. Supabase emerging as alternative.' },
  'Supabase':     { phase: 'growing', introduced: 2020, peak: null, trend: 'growing', eol: null, notes: 'Open-source Firebase alternative. Fast growth.' },
  'Elasticsearch':{ phase: 'mature', introduced: 2010, peak: 2020, trend: 'stable', eol: null, notes: 'Search standard. OpenSearch fork gaining traction.' },
  'Sass':         { phase: 'declining', introduced: 2006, peak: 2018, trend: 'declining', eol: null, notes: 'Being replaced by CSS Modules, Tailwind, CSS nesting.' },
  'Less':         { phase: 'deprecated', introduced: 2009, peak: 2014, trend: 'declining', eol: null, notes: 'Largely abandoned in favor of Sass or Tailwind.' },
  'Material UI':  { phase: 'mature', introduced: 2014, peak: 2021, trend: 'stable', eol: null, notes: 'Leading React component library. MUI v6 out.' },
  'Chakra UI':    { phase: 'mature', introduced: 2019, peak: 2022, trend: 'stable', eol: null, notes: 'Good DX but Radix/shadcn gaining share.' },
  'shadcn/ui':    { phase: 'growing', introduced: 2023, peak: null, trend: 'growing', eol: null, notes: 'Explosive growth. Copy-paste components over npm packages.' },
  'Tailwind UI':  { phase: 'growing', introduced: 2021, peak: null, trend: 'growing', eol: null, notes: 'Official Tailwind component library. Strong adoption.' },
  'Figma':        { phase: 'growing', introduced: 2016, peak: null, trend: 'growing', eol: null, notes: 'Industry standard design tool.' },
  'GitHub Actions':{ phase: 'growing', introduced: 2019, peak: null, trend: 'growing', eol: null, notes: 'Dominant CI/CD for GitHub repos.' },
  'GitLab CI':    { phase: 'mature', introduced: 2012, peak: 2020, trend: 'stable', eol: null, notes: 'Strong in self-hosted CI/CD.' },
  'Jenkins':      { phase: 'declining', introduced: 2011, peak: 2017, trend: 'declining', eol: null, notes: 'Legacy CI/CD. Replaced by cloud-native alternatives.' },
};

const PHASE_ORDER = { 'growing': 0, 'mature': 1, 'declining': 2, 'deprecated': 3 };
const PHASE_COLORS = {
  growing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mature: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  declining: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  deprecated: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const PHASE_LABELS = {
  growing: 'Growing',
  mature: 'Mature',
  declining: 'Declining',
  deprecated: 'Deprecated',
};
const TREND_ICONS = { growing: '↑', stable: '→', declining: '↓' };

export function getTechLifecycle(techName) {
  const exact = LIFECYCLE_DB[techName];
  if (exact) return exact;
  const lower = techName.toLowerCase();
  for (const [key, val] of Object.entries(LIFECYCLE_DB)) {
    if (key.toLowerCase() === lower) return val;
  }
  return null;
}

export function classifyLifecycle(technologies) {
  const results = [];
  const phases = { growing: [], mature: [], declining: [], deprecated: [] };

  for (const tech of technologies) {
    const lc = getTechLifecycle(tech.name);
    if (lc) {
      const entry = { name: tech.name, ...lc, colorClass: PHASE_COLORS[lc.phase], label: PHASE_LABELS[lc.phase] };
      results.push(entry);
      phases[lc.phase].push(entry);
    }
  }

  results.sort((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]);

  const deprecatedCount = phases.deprecated.length;
  const decliningCount = phases.declining.length;
  const healthScore = Math.max(0, 100 - deprecatedCount * 15 - decliningCount * 5);

  return {
    technologies: results,
    phases,
    healthScore,
    summary: {
      growing: phases.growing.length,
      mature: phases.mature.length,
      declining: phases.declining.length,
      deprecated: phases.deprecated.length,
      total: results.length,
    },
    warnings: [
      ...phases.deprecated.map(t => `${t.name} is deprecated — consider migrating.`),
      ...phases.declining.filter(t => t.eol).map(t => `${t.name} has announced end-of-life.`),
    ],
  };
}

export { PHASE_COLORS, PHASE_LABELS, TREND_ICONS };
