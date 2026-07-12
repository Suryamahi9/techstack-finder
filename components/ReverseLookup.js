'use client';
import { useState, useMemo } from 'react';

const KNOWN_SITES = {
  'React': ['facebook.com', 'github.com', 'netflix.com', 'airbnb.com', 'dropbox.com', 'paypal.com', 'twitter.com'],
  'Next.js': ['vercel.com', 'netlify.com', 'hulu.com', 'lego.com', 'carrefour.com', 'gymshark.com'],
  'Vue.js': ['gitlab.com', 'alibaba.com', 'baidu.com', 'grammarly.com', 'nintendo.com', 'adobe.com'],
  'Angular': ['youtube.com', 'gmail.com', 'google.com', 'microsoft.com', 'samsung.com', 'deutschebank.com'],
  'Svelte': ['apple.com', 'newyorker.com', 'nba.com', 'godaddy.com', 'abril.com.br'],
  'Tailwind CSS': ['vercel.com', 'github.com', 'tailwindcss.com', 'planetscale.com', 'resend.com'],
  'WordPress': ['techcrunch.com', 'bbc.com', 'cnn.com', 'time.com', 'merriam-webster.com', 'variety.com'],
  'Shopify': ['allbirds.com', 'gymshark.com', 'fashionnova.com', 'MVMT.com', 'chubbies.com'],
  'Stripe': ['shopify.com', 'lyft.com', 'github.com', 'amazon.com', 'google.com'],
  'Node.js': ['linkedin.com', 'netflix.com', 'uber.com', 'paypal.com', 'trello.com'],
  'Django': ['instagram.com', 'pinterest.com', 'mozilla.org', 'disqus.com', 'eventbrite.com'],
  'Ruby on Rails': ['github.com', 'shopify.com', 'airbnb.com', 'basecamp.com', 'twitch.tv'],
  'Laravel': ['laravel.com', 'itch.io', 'aldorithm.com', 'brewww.com'],
  'Python': ['instagram.com', 'pinterest.com', 'reddit.com', 'dropbox.com', 'spotify.com'],
  'TypeScript': ['microsoft.com', 'github.com', 'slack.com', 'asana.com', 'notion.so'],
  'Vite': ['vitejs.dev', 'svelte.dev', 'qwik.dev', 'astro.build'],
  'Docker': ['docker.com', 'dockerhub.com'],
  'Kubernetes': ['kubernetes.io', 'google.com', 'microsoft.com'],
  'Cloudflare': ['cloudflare.com'],
  'Firebase': ['firebase.google.com', 'google.com'],
  'PostgreSQL': ['postgresql.org', 'hasura.io', 'supabase.com'],
  'MongoDB': ['mongodb.com', 'ferretdb.com'],
  'Redis': ['redis.io'],
  'GraphQL': ['github.com', 'shopify.com', 'yelp.com'],
  'Sentry': ['sentry.io'],
  'Auth0': ['auth0.com'],
  'Algolia': ['algolia.com'],
  'Intercom': ['intercom.com'],
  'HubSpot': ['hubspot.com'],
  'Stripe.js': ['stripe.com'],
  'Google Analytics': ['google.com', 'analytics.google.com'],
  'Google Tag Manager': ['google.com', 'tagmanager.google.com'],
  'Vercel': ['vercel.com', 'nextjs.org'],
  'Netlify': ['netlify.com'],
  'AWS': ['aws.amazon.com'],
};

export default function ReverseLookup() {
  const [selectedTech, setSelectedTech] = useState('');
  const [search, setSearch] = useState('');

  const techs = useMemo(() => Object.keys(KNOWN_SITES).sort(), []);

  const filtered = useMemo(() => {
    if (!selectedTech) return [];
    return KNOWN_SITES[selectedTech] || [];
  }, [selectedTech]);

  const searched = useMemo(() => {
    if (!search) return techs;
    return techs.filter((t) => t.toLowerCase().includes(search.toLowerCase()));
  }, [search, techs]);

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Reverse Lookup</h3>
      </div>
      <p className="mb-3 text-[11px] text-muted">Find which popular sites use a specific technology.</p>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search a technology..."
        className="mb-3 w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-fg placeholder:text-faint focus:border-accent focus:outline-none"
      />
      <div className="mb-3 max-h-[120px] overflow-y-auto">
        <div className="flex flex-wrap gap-1.5">
          {searched.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(selectedTech === tech ? '' : tech)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
                selectedTech === tech
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-border bg-bg text-muted hover:border-border-strong'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>
      {selectedTech && (
        <div className="rounded-xl border border-border bg-bg/50 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Sites using {selectedTech} ({filtered.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((site) => (
              <a
                key={site}
                href={`https://${site}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent/10"
              >
                {site}
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
