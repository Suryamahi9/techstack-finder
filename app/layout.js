import './globals.css';
import SessionProvider from '../components/SessionProvider';
import dynamic from 'next/dynamic';

const ScrollWebGLBackground = dynamic(
  () => import('../components/ScrollWebGLBackground'),
  { ssr: false, loading: () => null }
);

const ChatWidget = dynamic(() => import('../components/ChatWidget'), { ssr: false, loading: () => null });

export const metadata = {
  title: 'TechStack Finder — What is any website built with?',
  description:
    'Enter a URL and instantly see the technologies powering it: frameworks, CMS, analytics, hosting, and more.',
  metadataBase: new URL('https://techstack-finder.vercel.app'),
  openGraph: {
    title: 'TechStack Finder',
    description: 'Fingerprint any website\'s technology stack in seconds.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
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
          {/* Scroll-driven WebGL image backdrop (Active Theory style) — fixed
              at z-index -1, painted before the aurora so both sit behind content */}
          <ScrollWebGLBackground />
          {/* Aurora orbs behind every route — the color the frosted glass blurs */}
          <div className="aurora" />
          <div className="noise-overlay" />
          {children}
          {/* Global AI chat widget */}
          <ChatWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
