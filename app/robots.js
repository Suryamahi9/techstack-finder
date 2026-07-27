export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/settings/', '/api-keys/'],
      },
    ],
    sitemap: 'https://techstack-finder.vercel.app/sitemap.xml',
  };
}
