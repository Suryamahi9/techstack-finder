const DEBT_PATTERNS = [
  { pattern: /jQuery/i, category: 'legacy_js', message: 'jQuery detected — consider migrating to vanilla JS or a modern framework.', severity: 'medium', effort: 'medium' },
  { pattern: /Backbone\.js/i, category: 'legacy_js', message: 'Backbone.js is largely abandoned. Consider React/Vue/Svelte migration.', severity: 'high', effort: 'high' },
  { pattern: /AngularJS/i, category: 'legacy_js', message: 'AngularJS (1.x) reached end-of-life. Migrate to Angular 15+ or React.', severity: 'critical', effort: 'very high' },
  { pattern: /Bootstrap/i, category: 'legacy_css', message: 'Bootstrap detected — Tailwind CSS is lighter and more flexible.', severity: 'low', effort: 'low' },
  { pattern: /Sass|Less/i, category: 'legacy_css', message: 'Sass/Less can be replaced with native CSS nesting or Tailwind.', severity: 'low', effort: 'low' },
  { pattern: /Webpack/i, category: 'legacy_build', message: 'Webpack detected — Vite or Turbopack are significantly faster.', severity: 'medium', effort: 'medium' },
  { pattern: /Babel/i, category: 'legacy_build', message: 'Babel transpilation is slow — modern runtimes support ES2020+ natively.', severity: 'low', effort: 'low' },
  { pattern: /Gulp|Grunt/i, category: 'legacy_build', message: 'Gulp/Grunt are legacy task runners — replace with npm scripts or Vite.', severity: 'medium', effort: 'medium' },
  { pattern: /Mocha|Chai|Jasmine/i, category: 'legacy_test', message: 'Older test frameworks — consider Vitest or Jest for modern DX.', severity: 'low', effort: 'low' },
  { pattern: /Selenium/i, category: 'legacy_test', message: 'Selenium is slow and brittle — Playwright or Cypress are better choices.', severity: 'medium', effort: 'medium' },
];

const MIXED_FRAMEWORK_DEBT = [
  { techs: ['React', 'Vue.js'], message: 'React and Vue.js on the same page — indicates inconsistent architecture.', severity: 'high', effort: 'high' },
  { techs: ['React', 'Angular'], message: 'React and Angular on the same page — major architectural inconsistency.', severity: 'critical', effort: 'very high' },
  { techs: ['jQuery', 'React'], message: 'jQuery + React on same page — common migration debt. Phase out jQuery.', severity: 'medium', effort: 'medium' },
  { techs: ['jQuery', 'Vue.js'], message: 'jQuery + Vue.js — consider removing jQuery in favor of Vue reactivity.', severity: 'medium', effort: 'medium' },
  { techs: ['Webpack', 'Vite'], message: 'Webpack and Vite both detected — complete the migration to Vite.', severity: 'medium', effort: 'low' },
  { techs: ['Bootstrap', 'Tailwind CSS'], message: 'Multiple CSS frameworks — consolidate to one for smaller bundle.', severity: 'medium', effort: 'medium' },
  { techs: ['Sass', 'Tailwind CSS'], message: 'Sass + Tailwind — consider removing Sass in favor of Tailwind.', severity: 'low', effort: 'low' },
  { techs: ['MySQL', 'PostgreSQL'], message: 'Multiple SQL databases — consolidate to reduce operational overhead.', severity: 'medium', effort: 'high' },
  { techs: ['nginx', 'Apache'], message: 'Both nginx and Apache detected — likely running both, consolidate.', severity: 'medium', effort: 'medium' },
];

const SEVERITY_COLORS = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const EFFORT_LABELS = { low: 'Quick fix', medium: 'Moderate effort', high: 'Significant refactor', 'very high': 'Major migration' };

export function detectTechDebt(technologies) {
  const issues = [];
  const seen = new Set();
  const techNames = technologies.map(t => t.name);

  for (const tech of technologies) {
    for (const rule of DEBT_PATTERNS) {
      if (rule.pattern.test(tech.name) && !seen.has(rule.message)) {
        seen.add(rule.message);
        issues.push({ ...rule, tech: tech.name, colorClass: SEVERITY_COLORS[rule.severity], effortLabel: EFFORT_LABELS[rule.effort] });
      }
    }
  }

  for (const mix of MIXED_FRAMEWORK_DEBT) {
    if (mix.techs.every(t => techNames.some(n => n.toLowerCase().includes(t.toLowerCase())))) {
      if (!seen.has(mix.message)) {
        seen.add(mix.message);
        issues.push({ ...mix, tech: mix.techs.join(' + '), colorClass: SEVERITY_COLORS[mix.severity], effortLabel: EFFORT_LABELS[mix.effort] });
      }
    }
  }

  issues.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] || 4) - (order[b.severity] || 4);
  });

  const score = Math.max(0, 100 - issues.reduce((acc, i) => {
    if (i.severity === 'critical') return acc + 25;
    if (i.severity === 'high') return acc + 15;
    if (i.severity === 'medium') return acc + 8;
    return acc + 3;
  }, 0));

  return {
    issues,
    score,
    summary: {
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
    },
  };
}
