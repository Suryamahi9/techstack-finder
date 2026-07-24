const MARKET_SHARE = {
  'React': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 42.1,
    data: [
      { year: 2018, share: 28.5 },
      { year: 2019, share: 32.1 },
      { year: 2020, share: 35.8 },
      { year: 2021, share: 38.2 },
      { year: 2022, share: 40.1 },
      { year: 2023, share: 41.3 },
      { year: 2024, share: 42.1 },
      { year: 2025, share: 42.8 },
    ],
    topSites: ['facebook.com', 'netflix.com', 'airbnb.com', 'twitter.com', 'github.com'],
    usageCount: 14200000,
  },
  'Next.js': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 18.4,
    data: [
      { year: 2018, share: 2.1 },
      { year: 2019, share: 4.5 },
      { year: 2020, share: 7.2 },
      { year: 2021, share: 10.1 },
      { year: 2022, share: 13.8 },
      { year: 2023, share: 16.2 },
      { year: 2024, share: 18.4 },
      { year: 2025, share: 20.1 },
    ],
    topSites: ['vercel.com', 'netlify.com', 'hulu.com', 'lego.com', 'twitch.tv'],
    usageCount: 6200000,
  },
  'Vue.js': {
    category: 'Frontend Framework',
    trend: 'stable',
    currentShare: 16.8,
    data: [
      { year: 2018, share: 8.2 },
      { year: 2019, share: 11.5 },
      { year: 2020, share: 14.1 },
      { year: 2021, share: 15.8 },
      { year: 2022, share: 16.5 },
      { year: 2023, share: 16.9 },
      { year: 2024, share: 16.8 },
      { year: 2025, share: 16.5 },
    ],
    topSites: ['gitlab.com', 'alibaba.com', 'baidu.com', 'nintendo.com', 'adobe.com'],
    usageCount: 5700000,
  },
  'Angular': {
    category: 'Frontend Framework',
    trend: 'declining',
    currentShare: 9.7,
    data: [
      { year: 2018, share: 17.2 },
      { year: 2019, share: 15.8 },
      { year: 2020, share: 14.1 },
      { year: 2021, share: 12.5 },
      { year: 2022, share: 11.2 },
      { year: 2023, share: 10.3 },
      { year: 2024, share: 9.7 },
      { year: 2025, share: 9.2 },
    ],
    topSites: ['youtube.com', 'gmail.com', 'google.com', 'microsoft.com', 'paypal.com'],
    usageCount: 3300000,
  },
  'WordPress': {
    category: 'CMS',
    trend: 'stable',
    currentShare: 38.9,
    data: [
      { year: 2018, share: 32.1 },
      { year: 2019, share: 34.2 },
      { year: 2020, share: 35.8 },
      { year: 2021, share: 37.1 },
      { year: 2022, share: 38.2 },
      { year: 2023, share: 38.7 },
      { year: 2024, share: 38.9 },
      { year: 2025, share: 38.5 },
    ],
    topSites: ['techcrunch.com', 'bbc.com', 'cnn.com', 'time.com', 'variety.com'],
    usageCount: 32000000,
  },
  'Shopify': {
    category: 'E-Commerce',
    trend: 'growing',
    currentShare: 6.2,
    data: [
      { year: 2018, share: 2.1 },
      { year: 2019, share: 2.8 },
      { year: 2020, share: 3.5 },
      { year: 2021, share: 4.2 },
      { year: 2022, share: 5.1 },
      { year: 2023, share: 5.8 },
      { year: 2024, share: 6.2 },
      { year: 2025, share: 6.5 },
    ],
    topSites: ['allbirds.com', 'gymshark.com', 'fashionnova.com', 'brooksrunning.com'],
    usageCount: 4400000,
  },
  'Tailwind CSS': {
    category: 'CSS Framework',
    trend: 'growing',
    currentShare: 15.3,
    data: [
      { year: 2018, share: 0.8 },
      { year: 2019, share: 2.1 },
      { year: 2020, share: 4.5 },
      { year: 2021, share: 7.2 },
      { year: 2022, share: 10.5 },
      { year: 2023, share: 13.1 },
      { year: 2024, share: 15.3 },
      { year: 2025, share: 17.1 },
    ],
    topSites: ['vercel.com', 'github.com', 'tailwindcss.com', 'dub.co'],
    usageCount: 5200000,
  },
  'Bootstrap': {
    category: 'CSS Framework',
    trend: 'declining',
    currentShare: 12.1,
    data: [
      { year: 2018, share: 22.5 },
      { year: 2019, share: 20.1 },
      { year: 2020, share: 18.2 },
      { year: 2021, share: 16.1 },
      { year: 2022, share: 14.3 },
      { year: 2023, share: 13.1 },
      { year: 2024, share: 12.1 },
      { year: 2025, share: 11.2 },
    ],
    topSites: ['twitter.com', 'lyft.com', 'jira.atlassian.com'],
    usageCount: 8100000,
  },
  'jQuery': {
    category: 'JavaScript Library',
    trend: 'declining',
    currentShare: 21.5,
    data: [
      { year: 2018, share: 42.1 },
      { year: 2019, share: 38.2 },
      { year: 2020, share: 34.5 },
      { year: 2021, share: 30.1 },
      { year: 2022, share: 26.8 },
      { year: 2023, share: 23.9 },
      { year: 2024, share: 21.5 },
      { year: 2025, share: 19.8 },
    ],
    topSites: ['wordpress.org', 'jquery.com'],
    usageCount: 14500000,
  },
  'Google Analytics': {
    category: 'Analytics',
    trend: 'stable',
    currentShare: 28.3,
    data: [
      { year: 2018, share: 31.2 },
      { year: 2019, share: 30.8 },
      { year: 2020, share: 29.5 },
      { year: 2021, share: 28.8 },
      { year: 2022, share: 28.5 },
      { year: 2023, share: 28.3 },
      { year: 2024, share: 28.3 },
      { year: 2025, share: 28.1 },
    ],
    topSites: ['google.com', 'wordpress.com', 'shopify.com'],
    usageCount: 19200000,
  },
  'Node.js': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 34.2,
    data: [
      { year: 2018, share: 18.5 },
      { year: 2019, share: 22.1 },
      { year: 2020, share: 25.8 },
      { year: 2021, share: 28.5 },
      { year: 2022, share: 31.2 },
      { year: 2023, share: 32.8 },
      { year: 2024, share: 34.2 },
      { year: 2025, share: 35.1 },
    ],
    topSites: ['linkedin.com', 'netflix.com', 'uber.com', 'paypal.com'],
    usageCount: 11600000,
  },
  'TypeScript': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 28.5,
    data: [
      { year: 2018, share: 5.2 },
      { year: 2019, share: 8.5 },
      { year: 2020, share: 12.1 },
      { year: 2021, share: 16.8 },
      { year: 2022, share: 21.5 },
      { year: 2023, share: 25.2 },
      { year: 2024, share: 28.5 },
      { year: 2025, share: 31.2 },
    ],
    topSites: ['microsoft.com', 'github.com', 'slack.com', 'figma.com'],
    usageCount: 9700000,
  },
  'Python': {
    category: 'Platform / Language',
    trend: 'growing',
    currentShare: 31.8,
    data: [
      { year: 2018, share: 22.1 },
      { year: 2019, share: 24.5 },
      { year: 2020, share: 26.2 },
      { year: 2021, share: 28.1 },
      { year: 2022, share: 29.8 },
      { year: 2023, share: 30.9 },
      { year: 2024, share: 31.8 },
      { year: 2025, share: 32.5 },
    ],
    topSites: ['instagram.com', 'pinterest.com', 'reddit.com', 'dropbox.com'],
    usageCount: 10800000,
  },
  'Cloudflare': {
    category: 'CDN / Hosting',
    trend: 'growing',
    currentShare: 22.1,
    data: [
      { year: 2018, share: 8.5 },
      { year: 2019, share: 11.2 },
      { year: 2020, share: 14.1 },
      { year: 2021, share: 16.8 },
      { year: 2022, share: 19.2 },
      { year: 2023, share: 20.8 },
      { year: 2024, share: 22.1 },
      { year: 2025, share: 23.2 },
    ],
    topSites: ['discord.com', 'twitch.tv', 'canva.com'],
    usageCount: 7500000,
  },
  'Vercel': {
    category: 'CDN / Hosting',
    trend: 'growing',
    currentShare: 8.5,
    data: [
      { year: 2018, share: 0.5 },
      { year: 2019, share: 1.2 },
      { year: 2020, share: 2.5 },
      { year: 2021, share: 4.1 },
      { year: 2022, share: 6.2 },
      { year: 2023, share: 7.5 },
      { year: 2024, share: 8.5 },
      { year: 2025, share: 9.8 },
    ],
    topSites: ['vercel.com', 'nextjs.org', 'cal.com', 'dub.co'],
    usageCount: 2900000,
  },
  'Docker': {
    category: 'Container / Orchestration',
    trend: 'growing',
    currentShare: 24.8,
    data: [
      { year: 2018, share: 10.2 },
      { year: 2019, share: 14.1 },
      { year: 2020, share: 17.5 },
      { year: 2021, share: 20.2 },
      { year: 2022, share: 22.5 },
      { year: 2023, share: 23.8 },
      { year: 2024, share: 24.8 },
      { year: 2025, share: 25.5 },
    ],
    topSites: ['docker.com', 'atlassian.com', 'gitlab.com'],
    usageCount: 8400000,
  },
  'PostgreSQL': {
    category: 'Database',
    trend: 'growing',
    currentShare: 18.5,
    data: [
      { year: 2018, share: 7.2 },
      { year: 2019, share: 9.1 },
      { year: 2020, share: 11.5 },
      { year: 2021, share: 13.8 },
      { year: 2022, share: 15.8 },
      { year: 2023, share: 17.2 },
      { year: 2024, share: 18.5 },
      { year: 2025, share: 19.8 },
    ],
    topSites: ['postgresql.org', 'supabase.com', 'hasura.io'],
    usageCount: 6300000,
  },
  'MongoDB': {
    category: 'Database',
    trend: 'stable',
    currentShare: 8.2,
    data: [
      { year: 2018, share: 5.1 },
      { year: 2019, share: 6.2 },
      { year: 2020, share: 7.1 },
      { year: 2021, share: 7.8 },
      { year: 2022, share: 8.1 },
      { year: 2023, share: 8.3 },
      { year: 2024, share: 8.2 },
      { year: 2025, share: 8.1 },
    ],
    topSites: ['mongodb.com', 'segfault.blog'],
    usageCount: 2800000,
  },
  'Svelte': {
    category: 'Frontend Framework',
    trend: 'growing',
    currentShare: 4.8,
    data: [
      { year: 2018, share: 0.2 },
      { year: 2019, share: 0.8 },
      { year: 2020, share: 1.5 },
      { year: 2021, share: 2.5 },
      { year: 2022, share: 3.2 },
      { year: 2023, share: 3.9 },
      { year: 2024, share: 4.8 },
      { year: 2025, share: 5.5 },
    ],
    topSites: ['apple.com', 'newyorker.com', 'nba.com'],
    usageCount: 1600000,
  },
  'Stripe': {
    category: 'Payment Processor',
    trend: 'growing',
    currentShare: 12.5,
    data: [
      { year: 2018, share: 4.2 },
      { year: 2019, share: 5.8 },
      { year: 2020, share: 7.5 },
      { year: 2021, share: 9.1 },
      { year: 2022, share: 10.5 },
      { year: 2023, share: 11.5 },
      { year: 2024, share: 12.5 },
      { year: 2025, share: 13.2 },
    ],
    topSites: ['shopify.com', 'lyft.com', 'github.com', 'notion.so'],
    usageCount: 4200000,
  },
  'GraphQL': {
    category: 'API Protocol',
    trend: 'growing',
    currentShare: 7.5,
    data: [
      { year: 2018, share: 1.2 },
      { year: 2019, share: 2.1 },
      { year: 2020, share: 3.2 },
      { year: 2021, share: 4.5 },
      { year: 2022, share: 5.8 },
      { year: 2023, share: 6.8 },
      { year: 2024, share: 7.5 },
      { year: 2025, share: 8.1 },
    ],
    topSites: ['github.com', 'shopify.com', 'yelp.com'],
    usageCount: 2500000,
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

  if (change > 0.5) return { direction: 'up', change: change.toFixed(1), label: `+${change.toFixed(1)}% YoY` };
  if (change < -0.5) return { direction: 'down', change: change.toFixed(1), label: `${change.toFixed(1)}% YoY` };
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
