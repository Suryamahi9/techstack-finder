const DIMENSIONS = [
  { key: 'frontend', label: 'Frontend', techs: ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'SvelteKit', 'Nuxt.js'] },
  { key: 'backend', label: 'Backend', techs: ['Node.js', 'Django', 'Flask', 'Rails', 'Laravel', 'Spring Boot', 'Express', 'FastAPI', 'Go', 'Rust'] },
  { key: 'database', label: 'Database', techs: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Supabase', 'PlanetScale'] },
  { key: 'infra', label: 'Infrastructure', techs: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Cloudflare', 'Vercel', 'Terraform'] },
  { key: 'security', label: 'Security', techs: ['Auth0', 'Clerk', 'Sentry', 'Cloudflare', 'Stripe'] },
  { key: 'devtools', label: 'Dev Tools', techs: ['GitHub Actions', 'GitLab CI', 'Vite', 'Webpack', 'Turbopack'] },
];

function scoreDimension(techNames, dim) {
  const matched = techNames.filter(t => dim.techs.some(dt => dt.toLowerCase() === t.toLowerCase()));
  const maxScore = 10;
  const scorePerTech = maxScore / Math.max(dim.techs.length * 0.4, 1);
  return Math.min(maxScore, Math.round(matched.length * scorePerTech * 10) / 10);
}

export function generateCompetitorRadar(technologies) {
  const techNames = technologies.map(t => t.name);
  const scores = DIMENSIONS.map(dim => ({
    ...dim,
    score: scoreDimension(techNames, dim),
    matched: techNames.filter(t => dim.techs.some(dt => dt.toLowerCase() === t.toLowerCase())),
  }));

  const overall = Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length * 10) / 10;
  const strongest = scores.reduce((a, b) => a.score > b.score ? a : b);
  const weakest = scores.reduce((a, b) => a.score < b.score ? a : b);

  const suggestions = [];
  if (weakest.score < 3 && weakest.key !== 'security') {
    suggestions.push(`Your ${weakest.label.toLowerCase()} stack is thin — consider adding tools to this layer.`);
  }
  if (scores.find(s => s.key === 'security')?.score < 4) {
    suggestions.push('Security layer could be stronger — consider Auth0, Sentry, or Cloudflare.');
  }
  if (scores.find(s => s.key === 'devtools')?.score < 3) {
    suggestions.push('Dev tooling could improve — add CI/CD and modern build tools.');
  }

  return {
    scores,
    overall,
    strongest: strongest.label,
    weakest: weakest.label,
    suggestions,
  };
}
