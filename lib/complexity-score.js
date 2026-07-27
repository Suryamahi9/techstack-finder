const COMPLEXITY_WEIGHTS = {
  frontend: { React: 3, 'Next.js': 4, 'Vue.js': 3, 'Nuxt.js': 4, Angular: 5, Svelte: 2, 'SvelteKit': 3, 'jQuery': 1, 'Backbone.js': 2, 'Ember.js': 4 },
  backend:  { 'Node.js': 3, Express: 2, Django: 3, Flask: 2, 'Ruby on Rails': 3, Laravel: 3, 'Spring Boot': 5, 'ASP.NET': 5, FastAPI: 2, Phoenix: 3 },
  database: { PostgreSQL: 3, MySQL: 2, MongoDB: 2, Redis: 1, SQLite: 1, 'DynamoDB': 2, Cassandra: 5, Neo4j: 4, Elasticsearch: 3 },
  infra:    { Docker: 2, Kubernetes: 5, Terraform: 4, AWS: 4, GCP: 4, Azure: 4, Vercel: 1, Netlify: 1, 'Cloudflare': 1, Heroku: 1, DigitalOcean: 2 },
  build:    { Webpack: 4, Vite: 1, Turbopack: 2, esbuild: 1, Rollup: 3, Parcel: 2 },
  testing:  { Jest: 2, Cypress: 3, Playwright: 3, Vitest: 1, Mocha: 2, Selenium: 4 },
  css:      { 'Tailwind CSS': 1, Bootstrap: 2, 'Material UI': 2, 'Chakra UI': 2, Sass: 2, CSS: 0, 'CSS Modules': 1, 'styled-components': 2 },
};

const CATEGORY_MAP = {
  'frontend': ['frontend', 'ui', 'react', 'vue', 'angular', 'svelte', 'dom'],
  'backend': ['backend', 'server', 'api', 'runtime', 'framework'],
  'database': ['database', 'db', 'cache', 'store', 'data'],
  'infra': ['infrastructure', 'hosting', 'cdn', 'cloud', 'devops', 'container', 'deployment'],
  'build': ['build', 'bundler', 'compiler', 'transpiler', 'tool'],
  'testing': ['test', 'e2e', 'ci'],
  'css': ['css', 'styling', 'design', 'ui framework'],
};

function inferCategory(techName, techCategory) {
  const lower = (techCategory || '').toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  const nameLower = techName.toLowerCase();
  for (const [cat, weights] of Object.entries(COMPLEXITY_WEIGHTS)) {
    if (weights[nameLower] !== undefined) return cat;
  }
  return null;
}

export function calculateComplexity(technologies) {
  let totalScore = 0;
  const breakdown = {};
  const techScores = [];

  for (const tech of technologies) {
    const cat = inferCategory(tech.name, tech.category);
    if (!cat) continue;

    const weights = COMPLEXITY_WEIGHTS[cat];
    const nameLower = tech.name.toLowerCase();
    let score = 3;

    for (const [key, val] of Object.entries(weights)) {
      if (key.toLowerCase() === nameLower) { score = val; break; }
    }

    totalScore += score;
    if (!breakdown[cat]) breakdown[cat] = { score: 0, count: 0, techs: [] };
    breakdown[cat].score += score;
    breakdown[cat].count += 1;
    breakdown[cat].techs.push({ name: tech.name, score });
    techScores.push({ name: tech.name, category: cat, score });
  }

  const maxPossible = technologies.length * 5;
  const normalizedScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  let level, color;
  if (normalizedScore <= 25) { level = 'Simple'; color = 'text-emerald-400'; }
  else if (normalizedScore <= 50) { level = 'Moderate'; color = 'text-blue-400'; }
  else if (normalizedScore <= 75) { level = 'Complex'; color = 'text-yellow-400'; }
  else { level = 'Very Complex'; color = 'text-red-400'; }

  const suggestions = [];
  const techCount = technologies.length;
  if (techCount > 15) suggestions.push(`${techCount} technologies detected — consider reducing dependencies.`);
  if (breakdown.frontend && breakdown.frontend.count > 3) suggestions.push('Multiple frontend frameworks detected — consider consolidating.');
  if (breakdown.infra && breakdown.infra.score > 15) suggestions.push('High infra complexity — consider managed services to reduce ops burden.');
  if (breakdown.build && breakdown.build.score > 10) suggestions.push('Complex build toolchain — consider simplifying with Vite or Turbopack.');

  return {
    totalScore,
    normalizedScore,
    level,
    color,
    breakdown,
    techScores: techScores.sort((a, b) => b.score - a.score),
    suggestions,
  };
}
