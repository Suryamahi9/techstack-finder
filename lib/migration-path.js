const MIGRATION_PATHS = {
  'jQuery': {
    target: 'React / Vue.js / Svelte',
    steps: [
      'Audit jQuery usage — identify DOM manipulation, AJAX, and event handlers.',
      'Replace jQuery selectors with vanilla `document.querySelector` or framework equivalents.',
      'Replace `$.ajax` with `fetch()` API or axios.',
      'Replace jQuery event handlers with native `addEventListener` or framework events.',
      'Remove jQuery from dependencies and test all interactions.',
    ],
    duration: '1-4 weeks',
    risk: 'medium',
    related: ['Backbone.js', 'AngularJS'],
  },
  'AngularJS': {
    target: 'Angular 15+ / React / Vue.js',
    steps: [
      'Use AngularJS-to-Angular migration guide (ng-upgrade).',
      'Rewrite AngularJS components as Angular components incrementally.',
      'Replace $scope with Angular services and signals.',
      'Update routing from ngRoute to Angular Router.',
      'Remove AngularJS and test all modules.',
    ],
    duration: '2-6 months',
    risk: 'high',
    related: ['Backbone.js'],
  },
  'Backbone.js': {
    target: 'React / Vue.js',
    steps: [
      'Map Backbone models to API endpoints.',
      'Create equivalent React/Vue components for each Backbone view.',
      'Replace Backbone events with framework state management.',
      'Migrate templates from Underscore to JSX/template syntax.',
      'Remove Backbone, underscore, and related dependencies.',
    ],
    duration: '2-4 months',
    risk: 'high',
    related: ['AngularJS'],
  },
  'Webpack': {
    target: 'Vite',
    steps: [
      'Install Vite and required plugins (react, vue, etc.).',
      'Create `vite.config.js` with equivalent loaders/plugins.',
      'Move `index.html` to project root and add script tag.',
      'Replace `webpack.config.js` environment variable handling.',
      'Remove webpack, loaders, and dev server dependencies.',
      'Test all build modes (dev, prod, test).',
    ],
    duration: '1-3 days',
    risk: 'low',
    related: ['Gulp', 'Grunt'],
  },
  'Gulp': {
    target: 'Vite / npm scripts',
    steps: [
      'Identify all Gulp tasks and their purposes.',
      'Replace build tasks with Vite or webpack equivalents.',
      'Replace lint tasks with ESLint npm scripts.',
      'Replace copy/clean tasks with `rimraf` and `cpx` npm scripts.',
      'Remove gulp and all gulp plugins.',
    ],
    duration: '1-2 days',
    risk: 'low',
    related: ['Grunt'],
  },
  'Grunt': {
    target: 'Vite / npm scripts',
    steps: [
      'Map each Grunt task to an npm script or Vite plugin.',
      'Replace grunt-contrib-* with direct tool equivalents.',
      'Replace Gruntfile.js with package.json scripts or vite.config.js.',
      'Remove grunt and all grunt-* dependencies.',
    ],
    duration: '1-2 days',
    risk: 'low',
    related: ['Gulp'],
  },
  'Bootstrap': {
    target: 'Tailwind CSS',
    steps: [
      'Audit Bootstrap class usage across all templates/components.',
      'Install Tailwind CSS and configure purge/content paths.',
      'Replace Bootstrap grid (container/row/col) with Tailwind flex/grid.',
      'Replace Bootstrap utility classes with Tailwind equivalents.',
      'Replace Bootstrap JS components (modals, dropdowns) with headless UI libs.',
      'Remove Bootstrap CSS and JS dependencies.',
    ],
    duration: '1-2 weeks',
    risk: 'medium',
    related: ['Sass'],
  },
  'Sass': {
    target: 'Tailwind CSS / CSS Modules / Native CSS',
    steps: [
      'Identify Sass features used (variables, nesting, mixins, functions).',
      'Replace Sass variables with CSS custom properties.',
      'Replace Sass nesting with native CSS nesting (supported in modern browsers).',
      'Convert mixins to utility classes or CSS functions.',
      'Remove sass and sass-loader from dependencies.',
    ],
    duration: '3-7 days',
    risk: 'low',
    related: ['Less'],
  },
  'Less': {
    target: 'Tailwind CSS / Native CSS',
    steps: [
      'Identify all Less variables and mixins.',
      'Replace with CSS custom properties and utility classes.',
      'Remove less and less-loader from dependencies.',
    ],
    duration: '3-5 days',
    risk: 'low',
    related: ['Sass'],
  },
  'Selenium': {
    target: 'Playwright / Cypress',
    steps: [
      'Install Playwright and create playwright.config.js.',
      'Rewrite Selenium tests using Playwright\'s page.locator API.',
      'Replace explicit waits with Playwright auto-waiting.',
      'Replace WebDriver setup with Playwright browser context.',
      'Remove selenium-webdriver and chromedriver dependencies.',
    ],
    duration: '1-2 weeks',
    risk: 'medium',
    related: [],
  },
};

export function getMigrationPaths(technologies) {
  const paths = [];
  const seen = new Set();

  for (const tech of technologies) {
    const path = MIGRATION_PATHS[tech.name];
    if (path && !seen.has(tech.name)) {
      seen.add(tech.name);
      paths.push({ source: tech.name, ...path });
    }
  }

  return {
    migrations: paths,
    totalEstimatedEffort: paths.reduce((acc, p) => {
      if (p.risk === 'high') return acc + 'High effort — ';
      if (p.risk === 'medium') return acc + 'Moderate effort — ';
      return acc + 'Low effort — ';
    }, '').slice(0, -3) || 'No migrations needed',
  };
}
