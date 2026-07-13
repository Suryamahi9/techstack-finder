'use client';

import { useState, useMemo } from 'react';
import CategorySection from './CategorySection';
import StackVisualization from './StackVisualization';
import TechTimeline from './TechTimeline';
import TechVersionInfo from './TechVersionInfo';
import TechDependencyTree from './TechDependencyTree';
import TechRadar from './TechRadar';

const POPULAR_TECH = new Set([
  'HTML', 'HTML5', 'CSS', 'CSS3', 'JavaScript', 'TypeScript', 'PHP', 'Ruby', 'Python', 'Java', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
  'React', 'Next.js', 'Vue.js', 'Vue', 'Angular', 'Svelte', 'Nuxt', 'Gatsby', 'Remix', 'Astro', 'Solid.js', 'Preact', 'Ember.js',
  'Backbone.js', 'jQuery', 'Lodash', 'moment', 'Day.js', 'Axios', 'Three.js', 'D3.js', 'GSAP', 'Framer Motion',
  'Node.js', 'Express', 'Django', 'Laravel', 'Ruby on Rails', 'Ruby on Rails (probe)', 'Spring Boot', 'Flask', 'FastAPI',
  'WordPress', 'Drupal', 'Joomla', 'Shopify', 'Webflow', 'Squarespace', 'Wix', 'Squarespace (probe)', 'Magento',
  'Tailwind CSS', 'Bootstrap', 'Bulma', 'Foundation', 'Material UI', 'Chakra UI', 'Ant Design', 'Vuetify',
  'Webpack', 'Vite', 'Rollup', 'Parcel', 'esbuild', 'Babel',
  'Nginx', 'Apache', 'IIS', 'LiteSpeed', 'Caddy',
  'Cloudflare', 'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify', 'Firebase', 'Supabase',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Elasticsearch',
  'Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'CircleCI', 'Travis CI',
  'Stripe', 'PayPal', 'Braintree', 'Square',
  'Google Analytics', 'Google Tag Manager', 'Segment', 'Hotjar', 'Mixpanel', 'Amplitude', 'Plausible',
  'Sentry', 'New Relic', 'Datadog', 'DataDog', 'Bugsnag',
  'Cloudflare CDN', 'Amazon CloudFront', 'Fastly', 'KeyCDN', 'MaxCDN',
  'Mailchimp', 'SendGrid', 'Twilio',
  'reCAPTCHA', 'hCaptcha', 'Cloudflare Turnstile',
  'Open Graph', 'Twitter Card', 'Schema.org', 'JSON-LD',
  'Google Fonts', 'Adobe Typekit', 'Font Awesome', 'Google reCAPTCHA',
  'Facebook Pixel', 'Google Ads', 'Google AdSense', 'Facebook SDK',
  'GraphQL', 'REST API', 'gRPC',
  'Ubuntu', 'Debian', 'CentOS', 'Alpine Linux',
  'Let\'s Encrypt', 'DigiCert', 'Comodo', 'GlobalSign',
  'Microsoft IIS', 'pm2', 'Forever',
  'Prisma', 'TypeORM', 'Sequelize', 'Mongoose',
  'Redis Cache', 'Memcached', 'Varnish',
  'Nginx Proxy', 'HAProxy',
  'Cloudflare Workers', 'Cloudflare WAF', 'Cloudflare DNS',
  'Contentful', 'Sanity', 'Strapi', 'Ghost',
  'Mapbox', 'Google Maps', 'Leaflet',
  'Disqus', 'Intercom', 'Zendesk',
  'HubSpot', 'Salesforce', 'Marketo',
  'Slack', 'Discord',
  'WebAssembly', 'WASM',
  'Progressive Web App', 'Service Worker', 'Web Worker',
  'HTTPS', 'HTTP/2', 'HTTP/3',
  'Google reCAPTCHA v3', 'Google reCAPTCHA v2',
  'Google Search Console', 'Bing Webmaster',
  'Sitemap', 'RSS',
  'BEM', 'SMACSS', 'OOCSS',
  'Jest', 'Mocha', 'Cypress', 'Playwright', 'Selenium',
  'Storybook', 'Chromatic',
  'ESLint', 'Prettier',
  'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Pinia', 'Vuex',
  'NextAuth', 'Auth0', 'Clerk', 'Firebase Auth',
  'Supabase Auth', 'AWS Cognito',
  'Sanity Studio', 'KeystoneJS',
  'Strapi v4', 'Strapi v5',
  'Notion', 'Airtable',
  'Heroku', 'DigitalOcean', 'Linode', 'Fly.io', 'Render',
  'Cloudflare Pages',
  'PHPMailer', 'Nodemailer',
  'Socket.io', 'Pusher', 'Ably',
  'Algolia', 'MeiliSearch', 'ElasticSearch',
  'Shopify Liquid', 'BigCommerce',
  'WordPress WooCommerce', 'WordPress Elementor', 'WordPress Yoast',
  'Cloudinary', 'Imgix', 'Fastly Image Optimizer',
  'AMP',
  'iFrame',
  'Font Awesome 5', 'Font Awesome 6',
  'Material Icons', 'Feather Icons',
  'Unsplash', 'Pexels',
  'YouTube', 'Vimeo', 'Wistia',
  'Stripe Checkout', 'Stripe Elements',
  'Recaptcha', 'Turnstile',
  'X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security',
]);

function classifyTech(tech) {
  if (POPULAR_TECH.has(tech.name)) return 'main';
  if (tech.confidence === 'high') return 'main';
  return 'rare';
}

export default function TechTab({ data }) {
  const [techView, setTechView] = useState('main');
  const [excludedCategories, setExcludedCategories] = useState(new Set());

  const toggleCategory = (cat) => {
    setExcludedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const splitData = useMemo(() => {
    if (!data) return { main: [], rare: [] };
    const mainCats = {};
    const rareCats = {};
    for (const cat of data.categories) {
      for (const tech of cat.technologies) {
        const bucket = classifyTech(tech) === 'main' ? mainCats : rareCats;
        if (!bucket[cat.category]) bucket[cat.category] = { category: cat.category, technologies: [] };
        bucket[cat.category].technologies.push(tech);
      }
    }
    return {
      main: Object.values(mainCats),
      rare: Object.values(rareCats),
    };
  }, [data]);

  const activeCats = splitData[techView] || [];
  const filteredCats = activeCats.filter((c) => !excludedCategories.has(c.category));

  const summary = {
    total: filteredCats.reduce((s, c) => s + c.technologies.length, 0),
    categories: filteredCats.length,
    frontend: filteredCats.reduce((s, c) => s + c.technologies.filter((t) => t.type === 'frontend').length, 0),
    backend: filteredCats.reduce((s, c) => s + c.technologies.filter((t) => t.type === 'backend').length, 0),
    infra: filteredCats.reduce((s, c) => s + c.technologies.filter((t) => t.type === 'infra').length, 0),
  };

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs uppercase tracking-wider text-faint">Filter:</span>
      {activeCats.map((cat) => {
        const active = !excludedCategories.has(cat.category);
        return (
          <button
            key={cat.category}
            onClick={() => toggleCategory(cat.category)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
              active
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border bg-elevated text-faint hover:border-border-strong hover:text-muted'
            }`}
          >
            {cat.category}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-elevated p-1">
        {[
          { id: 'main', label: 'Main Technologies', icon: '★', count: splitData.main.reduce((s, c) => s + c.technologies.length, 0) },
          { id: 'rare', label: 'Rare / Niche', icon: '◇', count: splitData.rare.reduce((s, c) => s + c.technologies.length, 0) },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setTechView(tab.id); setExcludedCategories(new Set()); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              techView === tab.id
                ? 'bg-accent/10 text-accent shadow-sm'
                : 'text-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-mono ${
              techView === tab.id ? 'bg-accent/20 text-accent' : 'bg-bg text-faint'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {techView === 'main' && (
        <p className="text-xs text-faint">
          Commonly used, industry-standard technologies detected on this site.
        </p>
      )}
      {techView === 'rare' && (
        <p className="text-xs text-faint">
          Niche, lesser-known, or auto-generated detections that may indicate specialized tooling.
        </p>
      )}

      {/* Filter + Content */}
      {summary.total === 0 ? (
        <div className="rounded-2xl border border-border bg-elevated p-12 text-center">
          <h3 className="text-lg font-semibold">
            No {techView === 'main' ? 'main' : 'rare'} technologies detected
          </h3>
          <p className="mt-2 text-sm text-muted">
            {techView === 'main'
              ? 'No commonly-recognized technologies were found for this site.'
              : 'No niche or lesser-known technologies were detected.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {activeCats.length > 1 && filterBar}

          {techView === 'main' && (
            <StackVisualization categories={filteredCats} />
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {filteredCats.map((cat, i) => (
              <CategorySection
                key={cat.category}
                category={cat.category}
                technologies={cat.technologies}
                index={i}
              />
            ))}
          </div>

          {techView === 'main' && (
            <>
              <TechTimeline categories={activeCats} />
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <TechVersionInfo categories={activeCats} />
                <TechDependencyTree categories={activeCats} />
              </div>
              <TechRadar categories={activeCats} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
