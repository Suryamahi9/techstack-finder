'use client';

const TECH_META = {
  'Next.js':      { released: '2016-10-26', latest: '15.3', category: 'framework' },
  'React':        { released: '2013-05-29', latest: '19.1', category: 'library' },
  'Vue.js':       { released: '2014-02-24', latest: '3.5', category: 'framework' },
  'Angular':      { released: '2016-09-14', latest: '19.2', category: 'framework' },
  'Svelte':       { released: '2016-11-26', latest: '5.28', category: 'framework' },
  'Nuxt':         { released: '2016-10-26', latest: '3.16', category: 'framework' },
  'Gatsby':       { released: '2018-01-02', latest: '5.14', category: 'framework' },
  'Remix':        { released: '2021-10-07', latest: '2.16', category: 'framework' },
  'Astro':        { released: '2021-07-13', latest: '5.7', category: 'framework' },
  'Solid.js':     { released: '2021-03-01', latest: '1.9', category: 'framework' },
  'Tailwind CSS': { released: '2017-11-01', latest: '4.1', category: 'css' },
  'Bootstrap':    { released: '2011-08-19', latest: '5.3', category: 'css' },
  'Bulma':        { released: '2014-07-01', latest: '1.0', category: 'css' },
  'Foundation':   { released: '2011-09-30', latest: '6.8', category: 'css' },
  'Material UI':  { released: '2014-07-07', latest: '6.4', category: 'css' },
  'Chakra UI':    { released: '2019-10-23', latest: '3.13', category: 'css' },
  'Ant Design':   { released: '2015-02-05', latest: '5.23', category: 'css' },
  'Vuetify':      { released: '2016-09-01', latest: '3.7', category: 'css' },
  'jQuery':       { released: '2006-08-26', latest: '3.7', category: 'library' },
  'Lodash':       { released: '2012-02-11', latest: '4.17', category: 'library' },
  'moment':       { released: '2011-06-16', latest: '2.30', category: 'library' },
  'Day.js':       { released: '2018-08-14', latest: '1.11', category: 'library' },
  'Axios':        { released: '2014-07-24', latest: '1.8', category: 'library' },
  'Three.js':     { released: '2010-04-24', latest: '0.175', category: 'library' },
  'D3.js':        { released: '2011-02-18', latest: '7.9', category: 'library' },
  'GSAP':         { released: '2008-10-09', latest: '3.12', category: 'library' },
  'Framer Motion':{ released: '2019-05-07', latest: '12.6', category: 'library' },
  'Node.js':      { released: '2009-05-27', latest: '24.1', category: 'runtime' },
  'Express':      { released: '2010-01-25', latest: '5.1', category: 'backend' },
  'Django':       { released: '2005-07-15', latest: '5.2', category: 'backend' },
  'Laravel':      { released: '2011-06-09', latest: '12.12', category: 'backend' },
  'Ruby on Rails':{ released: '2004-12-13', latest: '8.0', category: 'backend' },
  'Spring Boot':  { released: '2014-04-01', latest: '3.4', category: 'backend' },
  'Flask':        { released: '2010-04-06', latest: '3.1', category: 'backend' },
  'FastAPI':      { released: '2018-12-08', latest: '0.115', category: 'backend' },
  'PHP':          { released: '1995-06-08', latest: '8.4', category: 'language' },
  'WordPress':    { released: '2003-05-27', latest: '6.8', category: 'cms' },
  'Drupal':       { released: '2001-01-15', latest: '11.1', category: 'cms' },
  'Shopify':      { released: '2006-06-19', latest: '3.0', category: 'platform' },
  'Webflow':      { released: '2013-01-01', latest: '3.0', category: 'platform' },
  'Squarespace':  { released: '2004-01-01', latest: '7.1', category: 'platform' },
  'Vercel':       { released: '2015-10-29', latest: '3.0', category: 'platform' },
  'Netlify':      { released: '2014-06-16', latest: '3.0', category: 'platform' },
  'AWS':          { released: '2006-03-14', latest: '3.0', category: 'cloud' },
  'Cloudflare':   { released: '2010-09-28', latest: '3.0', category: 'cloud' },
  'Firebase':     { released: '2011-04-18', latest: '11.6', category: 'cloud' },
  'Supabase':     { released: '2020-01-01', latest: '2.47', category: 'cloud' },
  'Stripe':       { released: '2010-09-09', latest: '2025-01', category: 'payment' },
  'PayPal':       { released: '1998-12-01', latest: '3.0', category: 'payment' },
  'Google Analytics': { released: '2005-08-01', latest: 'GA4', category: 'analytics' },
  'Google Tag Manager': { released: '2012-10-01', latest: '2.0', category: 'analytics' },
  'Segment':      { released: '2011-10-01', latest: '3.0', category: 'analytics' },
  'Hotjar':       { released: '2014-11-01', latest: '6.0', category: 'analytics' },
  'Sentry':       { released: '2012-01-01', latest: '8.40', category: 'monitoring' },
  'New Relic':    { released: '2008-01-01', latest: '10.0', category: 'monitoring' },
  'Datadog':      { released: '2010-01-01', latest: '3.0', category: 'monitoring' },
  'Cloudflare CDN': { released: '2010-09-28', latest: '3.0', category: 'cdn' },
  'Amazon CloudFront': { released: '2008-11-01', latest: '3.0', category: 'cdn' },
  'Fastly':       { released: '2011-01-01', latest: '3.0', category: 'cdn' },
  'Nginx':        { released: '2004-10-04', latest: '1.27', category: 'server' },
  'Apache':       { released: '1995-04-01', latest: '2.4', category: 'server' },
  'Caddy':        { released: '2015-09-01', latest: '2.9', category: 'server' },
  'Varnish':      { released: '2006-02-15', latest: '7.6', category: 'server' },
  'Redis':        { released: '2009-03-10', latest: '8.0', category: 'database' },
  'MongoDB':      { released: '2009-02-11', latest: '8.0', category: 'database' },
  'PostgreSQL':   { released: '1996-07-05', latest: '17.5', category: 'database' },
  'MySQL':        { released: '1995-05-23', latest: '9.2', category: 'database' },
  'GraphQL':      { released: '2015-09-14', latest: '16.9', category: 'api' },
  'REST API':     { released: '2000-01-01', latest: '3.0', category: 'api' },
  'Webpack':      { released: '2012-03-12', latest: '5.98', category: 'bundler' },
  'Vite':         { released: '2020-04-21', latest: '6.3', category: 'bundler' },
  'Parcel':       { released: '2017-06-21', latest: '2.13', category: 'bundler' },
  'esbuild':      { released: '2020-01-09', latest: '0.25', category: 'bundler' },
  'Turbopack':    { released: '2022-10-01', latest: '2.4', category: 'bundler' },
  'Turborepo':    { released: '2021-11-01', latest: '2.4', category: 'tool' },
  'Prisma':       { released: '2019-06-11', latest: '6.6', category: 'tool' },
  'TypeScript':   { released: '2012-10-01', latest: '5.8', category: 'language' },
  'JavaScript':   { released: '1995-12-04', latest: 'ES2025', category: 'language' },
  'Python':       { released: '1991-02-20', latest: '3.13', category: 'language' },
  'Ruby':         { released: '1995-12-25', latest: '3.4', category: 'language' },
  'Java':         { released: '1995-05-23', latest: '24', category: 'language' },
  'Go':           { released: '2009-11-10', latest: '1.24', category: 'language' },
  'Rust':         { released: '2010-07-07', latest: '1.86', category: 'language' },
  'Docker':       { released: '2013-03-13', latest: '28.0', category: 'infra' },
  'Kubernetes':   { released: '2014-06-06', latest: '1.32', category: 'infra' },
  'Terraform':    { released: '2014-05-01', latest: '1.12', category: 'infra' },
  'Jest':         { released: '2016-09-12', latest: '30.0', category: 'testing' },
  'Cypress':      { released: '2017-02-03', latest: '14.0', category: 'testing' },
  'Playwright':   { released: '2020-01-16', latest: '1.51', category: 'testing' },
  'Selenium':     { released: '2004-07-01', latest: '4.29', category: 'testing' },
  'Storybook':    { released: '2016-06-01', latest: '8.5', category: 'tool' },
  'Algolia':      { released: '2012-01-01', latest: '6.0', category: 'service' },
  'Elasticsearch':{ released: '2010-02-08', latest: '8.17', category: 'service' },
  'SendGrid':     { released: '2009-01-01', latest: '3.0', category: 'service' },
  'Mailchimp':    { released: '2001-01-01', latest: '3.0', category: 'service' },
  'Intercom':     { released: '2011-01-01', latest: '4.0', category: 'service' },
  'Zendesk':      { released: '2007-01-01', latest: '3.0', category: 'service' },
  'Contentful':   { released: '2013-01-01', latest: '4.0', category: 'cms' },
  'Sanity':       { released: '2017-01-01', latest: '3.0', category: 'cms' },
  'Strapi':       { released: '2015-10-01', latest: '5.10', category: 'cms' },
  'WordPress.com':{ released: '2005-01-01', latest: '6.8', category: 'platform' },
  'Wix':          { released: '2006-01-01', latest: '3.0', category: 'platform' },
  'reCAPTCHA':    { released: '2007-09-01', latest: 'v3', category: 'service' },
  'hCaptcha':     { released: '2018-01-01', latest: '2.0', category: 'service' },
  'Cloudinary':   { released: '2012-01-01', latest: '2.0', category: 'service' },
  'Imgix':        { released: '2011-01-01', latest: '2.0', category: 'service' },
  'YouTube':      { released: '2005-02-14', latest: '3.0', category: 'embed' },
  'Vimeo':        { released: '2004-11-01', latest: '3.0', category: 'embed' },
  'Disqus':       { released: '2007-10-01', latest: '3.0', category: 'embed' },
  'Recaptcha':    { released: '2007-09-01', latest: 'v3', category: 'service' },
  'Google Fonts':  { released: '2010-01-01', latest: '3.0', category: 'service' },
  'Font Awesome': { released: '2011-01-01', latest: '6.7', category: 'service' },
  'Apple Pay':    { released: '2014-09-01', latest: '3.0', category: 'payment' },
  'Google Pay':   { released: '2018-01-01', latest: '3.0', category: 'payment' },
  'Crisp':        { released: '2016-01-01', latest: '3.0', category: 'service' },
  'Drift':        { released: '2014-01-01', latest: '3.0', category: 'service' },
  'HubSpot':      { released: '2006-01-01', latest: '3.0', category: 'service' },
  'Salesforce':   { released: '1999-01-01', latest: '3.0', category: 'service' },
  'Marketo':      { released: '2006-01-01', latest: '3.0', category: 'service' },
  'Pardot':       { released: '2007-01-01', latest: '3.0', category: 'service' },
  'Mixpanel':     { released: '2009-01-01', latest: '3.0', category: 'analytics' },
  'Amplitude':    { released: '2012-01-01', latest: '3.0', category: 'analytics' },
  'Segment':      { released: '2011-10-01', latest: '3.0', category: 'analytics' },
  'Plausible':    { released: '2019-01-01', latest: '3.0', category: 'analytics' },
  'Fathom':       { released: '2018-01-01', latest: '3.0', category: 'analytics' },
  'Vercel Analytics': { released: '2021-01-01', latest: '3.0', category: 'analytics' },
  'Mapbox':       { released: '2010-01-01', latest: '3.0', category: 'service' },
  'Stripe.js':    { released: '2011-01-01', latest: '3.0', category: 'payment' },
  'Crisp chat':   { released: '2016-01-01', latest: '3.0', category: 'service' },
  'Zendesk Chat': { released: '2013-01-01', latest: '3.0', category: 'service' },
  'Auth0':        { released: '2013-01-01', latest: '3.0', category: 'auth' },
  'Firebase Auth':{ released: '2018-05-01', latest: '3.0', category: 'auth' },
  'Clerk':        { released: '2020-01-01', latest: '3.0', category: 'auth' },
  'NextAuth.js':  { released: '2021-01-01', latest: '5.0', category: 'auth' },
  'Okta':         { released: '2009-01-01', latest: '3.0', category: 'auth' },
  'Hashicorp Vault': { released: '2015-01-01', latest: '1.18', category: 'infra' },
};

function getYearsSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return ((now - d) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
}

function getFreshness(released) {
  const years = parseFloat(getYearsSince(released));
  if (years < 1) return { label: 'Brand New', color: '#06b6d4' };
  if (years < 2) return { label: 'Recent', color: '#10b981' };
  if (years < 4) return { label: 'Established', color: '#3b82f6' };
  if (years < 7) return { label: 'Mature', color: '#8b5cf6' };
  return { label: 'Classic', color: '#f59e0b' };
}

export default function TechVersionInfo({ categories }) {
  if (!categories) return null;

  const techs = [];
  categories.forEach((cat) => {
    cat.technologies.forEach((t) => {
      const meta = TECH_META[t.name];
      if (meta) {
        const yearsAgo = getYearsSince(meta.released);
        const freshness = getFreshness(meta.released);
        techs.push({
          name: t.name,
          version: t.version,
          type: t.type,
          latest: meta.latest,
          released: meta.released,
          yearsAgo,
          freshness,
          category: cat.category,
        });
      }
    });
  });

  if (!techs.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">
          Technology Ages
        </h3>
        <span className="font-mono text-[10px] text-faint">{techs.length} tracked</span>
      </div>
      <div className="space-y-2">
        {techs.map((t) => (
          <div
            key={t.name}
            className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-all hover:border-border hover:bg-bg/50"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-fg">{t.name}</span>
                {t.version && (
                  <span className="shrink-0 font-mono text-[10px] text-faint">v{t.version}</span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span>Released {t.released}</span>
                <span className="text-faint">·</span>
                <span>{t.yearsAgo}y ago</span>
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ color: t.freshness.color, background: `${t.freshness.color}15` }}
            >
              {t.freshness.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
