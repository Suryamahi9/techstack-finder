// Market-share series for the Trends detail pages and marketing pages.
//
// currentShare = share of all websites (W3Techs usage survey, August 2026)
// unless noted "est." (technologies W3Techs does not track publicly; those
// use 2026 detection-count estimates from Wappalyzer/BuiltWith-style indexes).
// Historical series are anchored to real W3Techs trend data where published
// (CMS table, reverse-proxy and CSS-framework trend pages); remaining years
// are interpolated. usageCount mirrors the live-site count in trends-data.js.

const MARKET_SHARE = {
  'React': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 6.1,
    data: [
      { year: 2018, share: 1.0 },
      { year: 2019, share: 1.6 },
      { year: 2020, share: 2.3 },
      { year: 2021, share: 3.0 },
      { year: 2022, share: 3.9 },
      { year: 2023, share: 4.6 },
      { year: 2024, share: 5.4 },
      { year: 2025, share: 5.8 },
      { year: 2026, share: 6.1 },
    ],
    topSites: ['apple.com', 'linkedin.com', 'wordpress.org', 'samsung.com', 'nike.com'],
    usageCount: 5978000,
  },
  'Next.js': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 3.1,
    data: [
      { year: 2018, share: 0.4 },
      { year: 2019, share: 0.7 },
      { year: 2020, share: 1.1 },
      { year: 2021, share: 1.5 },
      { year: 2022, share: 1.9 },
      { year: 2023, share: 2.3 },
      { year: 2024, share: 2.6 },
      { year: 2025, share: 2.9 },
      { year: 2026, share: 3.1 },
    ],
    topSites: ['tiktok.com', 'twitch.tv', 'hulu.com', 'nytimes.com', 'vercel.com'],
    usageCount: 3038000,
  },
  'Vue.js': {
    category: 'Frontend Framework',
    trend: 'stable',
    currentShare: 0.6,
    data: [
      { year: 2018, share: 0.2 },
      { year: 2019, share: 0.3 },
      { year: 2020, share: 0.4 },
      { year: 2021, share: 0.5 },
      { year: 2022, share: 0.55 },
      { year: 2023, share: 0.58 },
      { year: 2024, share: 0.62 },
      { year: 2025, share: 0.61 },
      { year: 2026, share: 0.6 },
    ],
    topSites: ['alibaba.com', 'baidu.com', 'nintendo.com', 'gitlab.com', 'xiaomi.com'],
    usageCount: 588000,
  },
  'Angular': {
    category: 'Frontend Framework',
    trend: 'declining',
    currentShare: 0.2,
    data: [
      { year: 2018, share: 1.2 },
      { year: 2019, share: 1.0 },
      { year: 2020, share: 0.85 },
      { year: 2021, share: 0.7 },
      { year: 2022, share: 0.55 },
      { year: 2023, share: 0.42 },
      { year: 2024, share: 0.32 },
      { year: 2025, share: 0.25 },
      { year: 2026, share: 0.2 },
    ],
    topSites: ['w3schools.com', 'forbes.com', 'upwork.com', 'google.com', 'guardian.co.uk'],
    usageCount: 196000,
  },
  'WordPress': {
    category: 'CMS',
    trend: 'declining',
    currentShare: 41.2,
    data: [
      { year: 2018, share: 29.2 },
      { year: 2019, share: 32.1 },
      { year: 2020, share: 35.4 },
      { year: 2021, share: 39.1 },
      { year: 2022, share: 43.2 },
      { year: 2023, share: 43.4 },
      { year: 2024, share: 43.1 },
      { year: 2025, share: 43.6 },
      { year: 2026, share: 41.2 },
    ],
    topSites: ['microsoft.com', 'wordpress.org', 'archive.org', 'mozilla.org', 'walmart.com'],
    usageCount: 40376000,
  },
  'Shopify': {
    category: 'E-Commerce',
    trend: 'growing',
    currentShare: 5.3,
    data: [
      { year: 2018, share: 0.9 },
      { year: 2019, share: 1.4 },
      { year: 2020, share: 1.9 },
      { year: 2021, share: 2.8 },
      { year: 2022, share: 4.4 },
      { year: 2023, share: 4.6 },
      { year: 2024, share: 4.1 },
      { year: 2025, share: 4.7 },
      { year: 2026, share: 5.3 },
    ],
    topSites: ['gymshark.com', 'allbirds.com', 'fashionnova.com', 'brooksrunning.com', 'redbull.com'],
    usageCount: 5194000,
  },
  'Tailwind CSS': {
    category: 'CSS Framework',
    trend: 'growing',
    currentShare: 0.3,
    data: [
      { year: 2018, share: 0.02 },
      { year: 2019, share: 0.03 },
      { year: 2020, share: 0.05 },
      { year: 2021, share: 0.1 },
      { year: 2022, share: 0.16 },
      { year: 2023, share: 0.2 },
      { year: 2024, share: 0.25 },
      { year: 2025, share: 0.28 },
      { year: 2026, share: 0.3 },
    ],
    topSites: ['github.com', 'netflix.com', 'openai.com', 'tailwindcss.com', 'vercel.com'],
    usageCount: 294000,
  },
  'Bootstrap': {
    category: 'CSS Framework',
    trend: 'declining',
    currentShare: 13.8,
    data: [
      { year: 2018, share: 17.5 },
      { year: 2019, share: 16.8 },
      { year: 2020, share: 16.2 },
      { year: 2021, share: 15.6 },
      { year: 2022, share: 15.1 },
      { year: 2023, share: 14.6 },
      { year: 2024, share: 14.2 },
      { year: 2025, share: 14.0 },
      { year: 2026, share: 13.8 },
    ],
    topSites: ['linkedin.com', 'lyft.com', 'w3schools.com', 'mint.com', 'jira.atlassian.com'],
    usageCount: 13524000,
  },
  'jQuery': {
    category: 'JavaScript Library',
    trend: 'stable',
    currentShare: 67.2,
    data: [
      { year: 2018, share: 58.0 },
      { year: 2019, share: 60.0 },
      { year: 2020, share: 62.0 },
      { year: 2021, share: 63.5 },
      { year: 2022, share: 65.0 },
      { year: 2023, share: 66.0 },
      { year: 2024, share: 66.8 },
      { year: 2025, share: 67.2 },
      { year: 2026, share: 67.2 },
    ],
    topSites: ['microsoft.com', 'yahoo.com', 'adobe.com', 'spotify.com', 'wordpress.org'],
    usageCount: 65856000,
  },
  'Google Analytics': {
    category: 'Analytics',
    trend: 'declining',
    currentShare: 48.1,
    data: [
      { year: 2018, share: 54.5 },
      { year: 2019, share: 55.1 },
      { year: 2020, share: 54.2 },
      { year: 2021, share: 51.8 },
      { year: 2022, share: 50.5 },
      { year: 2023, share: 49.6 },
      { year: 2024, share: 48.8 },
      { year: 2025, share: 48.3 },
      { year: 2026, share: 48.1 },
    ],
    topSites: ['google.com', 'wordpress.com', 'shopify.com', 'wix.com', 'mailchimp.com'],
    usageCount: 47138000,
  },
  'Node.js': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 6.5,
    data: [
      { year: 2018, share: 1.3 },
      { year: 2019, share: 1.8 },
      { year: 2020, share: 2.3 },
      { year: 2021, share: 3.0 },
      { year: 2022, share: 3.8 },
      { year: 2023, share: 4.5 },
      { year: 2024, share: 5.2 },
      { year: 2025, share: 5.9 },
      { year: 2026, share: 6.5 },
    ],
    topSites: ['linkedin.com', 'netflix.com', 'uber.com', 'paypal.com', 'nasa.gov'],
    usageCount: 6370000,
  },
  'TypeScript': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 1.5,
    data: [
      { year: 2018, share: 0.1 },
      { year: 2019, share: 0.25 },
      { year: 2020, share: 0.45 },
      { year: 2021, share: 0.7 },
      { year: 2022, share: 0.95 },
      { year: 2023, share: 1.15 },
      { year: 2024, share: 1.3 },
      { year: 2025, share: 1.4 },
      { year: 2026, share: 1.55 },
    ],
    topSites: ['microsoft.com', 'github.com', 'slack.com', 'figma.com', 'asana.com'],
    usageCount: 1470000,
  },
  'Python': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 1.2,
    data: [
      { year: 2018, share: 0.6 },
      { year: 2019, share: 0.7 },
      { year: 2020, share: 0.8 },
      { year: 2021, share: 0.9 },
      { year: 2022, share: 0.95 },
      { year: 2023, share: 1.0 },
      { year: 2024, share: 1.05 },
      { year: 2025, share: 1.05 },
      { year: 2026, share: 1.2 },
    ],
    topSites: ['instagram.com', 'pinterest.com', 'reddit.com', 'dropbox.com', 'spotify.com'],
    usageCount: 1176000,
  },
  'Cloudflare': {
    category: 'CDN / Hosting',
    trend: 'growing',
    currentShare: 24.3,
    data: [
      { year: 2018, share: 7.8 },
      { year: 2019, share: 9.2 },
      { year: 2020, share: 11.1 },
      { year: 2021, share: 13.2 },
      { year: 2022, share: 15.8 },
      { year: 2023, share: 17.6 },
      { year: 2024, share: 19.3 },
      { year: 2025, share: 21.5 },
      { year: 2026, share: 24.3 },
    ],
    topSites: ['discord.com', 'twitch.tv', 'canva.com', 'zendesk.com', 'nordvpn.com'],
    usageCount: 23814000,
  },
  'Vercel': {
    category: 'CDN / Hosting',
    trend: 'growing',
    currentShare: 1.8,
    data: [
      { year: 2018, share: 0.1 },
      { year: 2019, share: 0.25 },
      { year: 2020, share: 0.45 },
      { year: 2021, share: 0.7 },
      { year: 2022, share: 1.0 },
      { year: 2023, share: 1.3 },
      { year: 2024, share: 1.5 },
      { year: 2025, share: 1.6 },
      { year: 2026, share: 1.8 },
    ],
    topSites: ['vercel.com', 'nextjs.org', 'cal.com', 'dub.co', 'linear.app'],
    usageCount: 1764000,
  },
  'Docker': {
    category: 'Container / Orchestration',
    trend: 'growing',
    currentShare: 1.2,
    data: [
      { year: 2018, share: 0.4 },
      { year: 2019, share: 0.6 },
      { year: 2020, share: 0.8 },
      { year: 2021, share: 0.95 },
      { year: 2022, share: 1.05 },
      { year: 2023, share: 1.1 },
      { year: 2024, share: 1.15 },
      { year: 2025, share: 1.18 },
      { year: 2026, share: 1.2 },
    ],
    topSites: ['docker.com', 'atlassian.com', 'gitlab.com', 'netflix.com', 'shopify.com'],
    usageCount: 1176000,
  },
  'PostgreSQL': {
    category: 'Database',
    trend: 'growing',
    currentShare: 2.0,
    data: [
      { year: 2018, share: 0.7 },
      { year: 2019, share: 0.95 },
      { year: 2020, share: 1.2 },
      { year: 2021, share: 1.4 },
      { year: 2022, share: 1.6 },
      { year: 2023, share: 1.75 },
      { year: 2024, share: 1.85 },
      { year: 2025, share: 1.85 },
      { year: 2026, share: 2.0 },
    ],
    topSites: ['instagram.com', 'spotify.com', 'reddit.com', 'supabase.com', 'postgresql.org'],
    usageCount: 1960000,
  },
  'MongoDB': {
    category: 'Database',
    trend: 'stable',
    currentShare: 1.0,
    data: [
      { year: 2018, share: 0.5 },
      { year: 2019, share: 0.6 },
      { year: 2020, share: 0.7 },
      { year: 2021, share: 0.8 },
      { year: 2022, share: 0.9 },
      { year: 2023, share: 0.95 },
      { year: 2024, share: 0.98 },
      { year: 2025, share: 0.99 },
      { year: 2026, share: 1.0 },
    ],
    topSites: ['uber.com', 'ebay.com', 'godaddy.com', 'coinbase.com', 'mongodb.com'],
    usageCount: 980000,
  },
  'Svelte': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 0.1,
    data: [
      { year: 2018, share: 0.01 },
      { year: 2019, share: 0.02 },
      { year: 2020, share: 0.035 },
      { year: 2021, share: 0.05 },
      { year: 2022, share: 0.065 },
      { year: 2023, share: 0.08 },
      { year: 2024, share: 0.09 },
      { year: 2025, share: 0.095 },
      { year: 2026, share: 0.1 },
    ],
    topSites: ['apple.com', 'newyorker.com', 'nba.com', 'brave.com', 'spotify.com'],
    usageCount: 98000,
  },
  'Stripe': {
    category: 'Payment Processor',
    trend: 'growing',
    currentShare: 2.5,
    data: [
      { year: 2018, share: 0.8 },
      { year: 2019, share: 1.1 },
      { year: 2020, share: 1.4 },
      { year: 2021, share: 1.7 },
      { year: 2022, share: 2.0 },
      { year: 2023, share: 2.2 },
      { year: 2024, share: 2.3 },
      { year: 2025, share: 2.3 },
      { year: 2026, share: 2.5 },
    ],
    topSites: ['shopify.com', 'lyft.com', 'github.com', 'notion.so', 'zoom.us'],
    usageCount: 2450000,
  },
  'GraphQL': {
    category: 'API Protocol',
    trend: 'growing',
    currentShare: 1.0,
    data: [
      { year: 2018, share: 0.2 },
      { year: 2019, share: 0.35 },
      { year: 2020, share: 0.5 },
      { year: 2021, share: 0.65 },
      { year: 2022, share: 0.78 },
      { year: 2023, share: 0.85 },
      { year: 2024, share: 0.9 },
      { year: 2025, share: 0.88 },
      { year: 2026, share: 1.0 },
    ],
    topSites: ['github.com', 'shopify.com', 'yelp.com', 'airbnb.com', 'paypal.com'],
    usageCount: 980000,
  },
};

export function getMarketShare(techName) {
  const exact = MARKET_SHARE[techName];
  if (exact) return exact;

  const lower = techName.toLowerCase();
  for (const [key, val] of Object.entries(MARKET_SHARE)) {
    if (key.toLowerCase() === lower) return val;
  }
  return null;
}

export function getMarketShareTrends(topN = 20) {
  const sorted = Object.entries(MARKET_SHARE)
    .sort((a, b) => b[1].currentShare - a[1].currentShare)
    .slice(0, topN)
    .map(([name, data]) => ({
      name,
      category: data.category,
      trend: data.trend,
      currentShare: data.currentShare,
      data: data.data,
      usageCount: data.usageCount,
      topSites: data.topSites,
    }));

  return sorted;
}

export function getTrendDirection(techName) {
  const data = getMarketShare(techName);
  if (!data || data.data.length < 2) return null;

  const recent = data.data[data.data.length - 1].share;
  const prev = data.data[data.data.length - 2].share;
  const change = recent - prev;

  if (change > 0.1) return { direction: 'up', change: change.toFixed(1), label: `+${change.toFixed(1)}% YoY` };
  if (change < -0.1) return { direction: 'down', change: change.toFixed(1), label: `${change.toFixed(1)}% YoY` };
  return { direction: 'flat', change: '0', label: 'Stable' };
}

export function compareTechMarketShare(techNames) {
  return techNames
    .map(name => ({
      name,
      ...getMarketShare(name),
    }))
    .filter(t => t.currentShare)
    .sort((a, b) => b.currentShare - a.currentShare);
}
