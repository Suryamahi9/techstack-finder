const COMMERCIAL_TOOLS = {
  'Datadog':     { alt: 'Grafana + Prometheus', type: 'Monitoring', savings: '$15-23/host/mo', license: 'Open Source', url: 'https://grafana.com' },
  'New Relic':   { alt: 'Grafana Tempo + Loki', type: 'APM', savings: '$0 (free tier)', license: 'Open Source', url: 'https://grafana.com' },
  'Sentry':      { alt: 'GlitchTip', type: 'Error Tracking', savings: '$26/mo', license: 'Open Source', url: 'https://glitchtip.com' },
  'Segment':     { alt: 'Snowplow Analytics', type: 'Analytics', savings: '$120/mo', license: 'Open Source', url: 'https://snowplow.io' },
  'Amplitude':   { alt: 'PostHog', type: 'Product Analytics', savings: '$0 (free tier)', license: 'Open Source', url: 'https://posthog.com' },
  'Mixpanel':    { alt: 'PostHog / Matomo', type: 'Analytics', savings: '$0 (free tier)', license: 'Open Source', url: 'https://posthog.com' },
  'Contentful':  { alt: 'Strapi / Sanity', type: 'Headless CMS', savings: '$300+/mo', license: 'Open Source', url: 'https://strapi.io' },
  'Sanity':      { alt: 'Directus / Strapi', type: 'Headless CMS', savings: '$99+/mo', license: 'Open Source', url: 'https://directus.io' },
  'Auth0':       { alt: 'Supabase Auth / Lucia', type: 'Authentication', savings: '$0 (free tier)', license: 'Open Source', url: 'https://supabase.com' },
  'Algolia':     { alt: 'MeiliSearch / Typesense', type: 'Search', savings: '$50+/mo', license: 'Open Source', url: 'https://meilisearch.com' },
  'Twilio':      { alt: 'Vonage / 2Factor', type: 'SMS/Communication', savings: 'Varies', license: 'Proprietary', url: 'https://vonage.com' },
  'SendGrid':    { alt: 'Resend / Mailgun', type: 'Email', savings: '$0 (free tier)', license: 'Proprietary', url: 'https://resend.com' },
  'Pingdom':     { alt: 'UptimeRobot / Grafana', type: 'Uptime Monitoring', savings: '$15/mo', license: 'Freemium', url: 'https://uptimerobot.com' },
  'Heroku':      { alt: 'Railway / Fly.io', type: 'Hosting', savings: '$7+/mo', license: 'Proprietary', url: 'https://railway.com' },
  'Netlify':     { alt: 'Vercel / Cloudflare Pages', type: 'Hosting', savings: '$0 (free tier)', license: 'Proprietary', url: 'https://vercel.com' },
  'Mapbox':      { alt: 'Leaflet + OpenStreetMap', type: 'Maps', savings: '$5+/mo', license: 'Open Source', url: 'https://leafletjs.com' },
  'Stripe Radar':{ alt: 'Sift / Open Source fraud', type: 'Fraud Detection', savings: '$0.05/txn', license: 'Proprietary', url: null },
  'LaunchDarkly':{ alt: 'Flagsmith / Unleash', type: 'Feature Flags', savings: '$0 (free tier)', license: 'Open Source', url: 'https://flagsmith.com' },
  'PagerDuty':   { alt: 'Grafana OnCall', type: 'Incident Management', savings: '$21/user/mo', license: 'Open Source', url: 'https://grafana.com/products/oncall/' },
  'Cloudflare R2':{ alt: 'AWS S3', type: 'Object Storage', savings: '$0 (free tier)', license: 'Proprietary', url: 'https://aws.amazon.com/s3/' },
};

export function findOpenSourceAlternatives(technologies) {
  const results = [];
  const seen = new Set();

  for (const tech of technologies) {
    if (seen.has(tech.name)) continue;
    seen.add(tech.name);

    for (const [commercial, info] of Object.entries(COMMERCIAL_TOOLS)) {
      if (tech.name.toLowerCase().includes(commercial.toLowerCase()) || commercial.toLowerCase().includes(tech.name.toLowerCase())) {
        results.push({
          detected: tech.name,
          commercial: commercial,
          ...info,
        });
      }
    }
  }

  return {
    alternatives: results,
    totalSavings: results.length > 0 ? `${results.length} potential switch${results.length > 1 ? 'es' : ''} found` : null,
  };
}
