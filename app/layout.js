import './globals.css';
import BackgroundManager from '../components/BackgroundManager';
import SessionProvider from '../components/SessionProvider';

export const metadata = {
  title: 'TechStack Finder — What is any website built with?',
  description:
    'Enter a URL and instantly see the technologies powering it: frameworks, CMS, analytics, hosting, and more.',
  metadataBase: new URL('https://techstack-finder.local'),
  openGraph: {
    title: 'TechStack Finder',
    description: 'Fingerprint any website\'s technology stack in seconds.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="warm" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('tsf-theme');
                  if (['dark','terminal','blueprint','solarized','neon','monochrome','sakura','ocean','lavender','ember','arctic','crimson','mint','amber','light','warm'].indexOf(t) !== -1) {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:border focus:border-accent focus:bg-bg focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent">Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'TechStack Finder',
              url: 'https://techstack-finder.vercel.app',
              description: 'Fingerprint any website\'s technology stack in seconds. Detect frameworks, CMS, analytics, hosting, and more.',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
        <SessionProvider>
          <BackgroundManager />
          <div className="noise-overlay" />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
