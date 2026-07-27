const HOSTING_COSTS = {
  'Vercel': { base: 20, per: 10, unit: 'month', tier: 'Pro' },
  'Netlify': { base: 19, per: 10, unit: 'month', tier: 'Pro' },
  'Cloudflare': { base: 0, per: 5, unit: 'month', tier: 'Free / Pro' },
  'AWS': { base: 50, per: 25, unit: 'month', tier: 'EC2' },
  'Google Cloud': { base: 50, per: 25, unit: 'month', tier: 'Compute Engine' },
  'Azure': { base: 50, per: 25, unit: 'month', tier: 'App Service' },
  'Heroku': { base: 25, per: 25, unit: 'month', tier: 'Eco' },
  'DigitalOcean': { base: 12, per: 12, unit: 'month', tier: 'Droplet' },
  'Firebase': { base: 25, per: 10, unit: 'month', tier: 'Blaze' },
};

const CDN_COSTS = {
  'Cloudflare CDN': { base: 0, tier: 'Free' },
  'Fastly': { base: 50, tier: 'Pro' },
  'Akamai': { base: 200, tier: 'Edge' },
  'AWS CloudFront': { base: 10, tier: 'Pay-as-you-go' },
  'KeyCDN': { base: 4, tier: 'Pay-as-you-go' },
  'jsDelivr': { base: 0, tier: 'Free' },
  'unpkg': { base: 0, tier: 'Free' },
};

const DB_COSTS = {
  'PostgreSQL': { base: 0, tier: 'Self-hosted / Supabase Free' },
  'MongoDB': { base: 0, tier: 'Atlas Free (512MB)' },
  'MySQL': { base: 0, tier: 'Self-hosted / PlanetScale Free' },
  'Redis': { base: 0, tier: 'Upstash Free (10K cmds/day)' },
  'Firebase Firestore': { base: 0, tier: 'Free tier' },
  'Supabase': { base: 0, tier: 'Free (500MB)' },
  'PlanetScale': { base: 0, tier: 'Free (5GB)' },
  'DynamoDB': { base: 0, tier: 'Free tier' },
};

const ANALYTICS_COSTS = {
  'Google Analytics': { base: 0, tier: 'Free' },
  'Mixpanel': { base: 0, tier: 'Free (20K events)' },
  'Amplitude': { base: 0, tier: 'Free (10K events)' },
  'Segment': { base: 120, tier: 'Team' },
  'Plausible': { base: 9, tier: 'Starter' },
  'Fathom': { base: 14, tier: 'Basic' },
  'PostHog': { base: 0, tier: 'Free (1M events)' },
  'Hotjar': { base: 0, tier: 'Free (35 sessions/day)' },
};

const MONITORING_COSTS = {
  'Sentry': { base: 0, tier: 'Free (5K errors)' },
  'New Relic': { base: 0, tier: 'Free (100GB)' },
  'Datadog': { base: 15, tier: 'Pro (per host)' },
  'Grafana': { base: 0, tier: 'Free / OSS' },
  'UptimeRobot': { base: 0, tier: 'Free (50 monitors)' },
  'Pingdom': { base: 15, tier: 'Standard' },
};

const AUTH_COSTS = {
  'Auth0': { base: 0, tier: 'Free (7K active users)' },
  'Firebase Auth': { base: 0, tier: 'Free' },
  'NextAuth.js': { base: 0, tier: 'Open Source' },
  'Clerk': { base: 0, tier: 'Free (10K MAU)' },
  'Supabase Auth': { base: 0, tier: 'Free (50K MAU)' },
};

const PAYMENT_COSTS = {
  'Stripe': { base: 0, tier: '2.9% + 30c per txn' },
  'Paddle': { base: 0, tier: '5% + 50c per txn' },
  'PayPal': { base: 0, tier: '2.9% + 30c per txn' },
};

const CMS_COSTS = {
  'WordPress': { base: 0, tier: 'Self-hosted Free' },
  'Contentful': { base: 0, tier: 'Free (5 users)' },
  'Sanity': { base: 0, tier: 'Free (10K docs)' },
  'Strapi': { base: 0, tier: 'Open Source' },
  'Ghost': { base: 9, tier: 'Starter' },
  'Prismic': { base: 0, tier: 'Free (1 user)' },
  'Webflow': { base: 14, tier: 'Basic' },
  'Squarespace': { base: 16, tier: 'Personal' },
  'Wix': { base: 16, tier: 'Combo' },
  'Shopify': { base: 39, tier: 'Basic' },
};

const ALL_COSTS = {
  hosting: HOSTING_COSTS,
  cdn: CDN_COSTS,
  database: DB_COSTS,
  analytics: ANALYTICS_COSTS,
  monitoring: MONITORING_COSTS,
  auth: AUTH_COSTS,
  payments: PAYMENT_COSTS,
  cms: CMS_COSTS,
};

function matchCategory(techName, categoryMap) {
  for (const [key, val] of Object.entries(categoryMap)) {
    if (techName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(techName.toLowerCase())) {
      return { ...val, name: key };
    }
  }
  return null;
}

export function estimateStackCost(technologies, categories) {
  const items = [];
  const seen = new Set();
  let totalMin = 0;
  let totalMax = 0;

  for (const tech of technologies) {
    if (seen.has(tech.name)) continue;
    seen.add(tech.name);

    for (const [catKey, catMap] of Object.entries(ALL_COSTS)) {
      const match = matchCategory(tech.name, catMap);
      if (match) {
        items.push({
          name: match.name,
          category: catKey,
          baseCost: match.base,
          tier: match.tier,
          estimatedMin: match.base,
          estimatedMax: match.base + (match.per || 0) * 3,
        });
        totalMin += match.base;
        totalMax += match.base + (match.per || 0) * 3;
        break;
      }
    }
  }

  const hosting = items.filter(i => i.category === 'hosting');
  const totalMonthlyBase = hosting.length > 0 ? Math.max(...hosting.map(h => h.baseCost)) : totalMin;

  return {
    items,
    totalMonthlyBase,
    totalMonthlyEstimate: `$${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}`,
    summary: {
      free: items.filter(i => i.baseCost === 0).length,
      paid: items.filter(i => i.baseCost > 0).length,
      total: items.length,
    },
    note: 'Estimates based on published pricing for small/medium workloads. Actual costs vary by traffic, storage, and usage.',
  };
}
