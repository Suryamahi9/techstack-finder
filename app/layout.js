import './globals.css';
import BackgroundManager from '../components/BackgroundManager';

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('tsf-theme');
                  if (['dark','terminal','blueprint','solarized','neon','monochrome','sakura','ocean','lavender','ember','arctic','crimson','mint','amber','light'].indexOf(t) !== -1) {
                    document.documentElement.setAttribute('data-theme', t);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <BackgroundManager />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
