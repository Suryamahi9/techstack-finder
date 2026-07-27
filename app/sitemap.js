const BASE_URL = 'https://techstack-finder.vercel.app';

export default function sitemap() {
  const routes = [
    '', '/login', '/signup', '/forgot-password', '/pricing',
    '/results', '/browse', '/radar', '/leaderboard', '/compare',
    '/history', '/bulk', '/trends', '/rules', '/docs',
    '/monitor', '/bookmarks', '/api-keys', '/settings', '/backlinks',
    '/digest', '/admin',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/pricing' ? 0.9 : 0.7,
  }));
}
