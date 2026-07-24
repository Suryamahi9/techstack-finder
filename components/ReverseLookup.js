'use client';
import { useState, useMemo } from 'react';

const KNOWN_SITES = {
  'React': ['facebook.com', 'github.com', 'netflix.com', 'airbnb.com', 'dropbox.com', 'paypal.com', 'twitter.com', 'figma.com', 'notion.so', 'discord.com'],
  'Next.js': ['vercel.com', 'netlify.com', 'hulu.com', 'lego.com', 'carrefour.com', 'gymshark.com', 'twitch.tv', 'hashnode.dev', 'cal.com', 'lemonsqueezy.com'],
  'Vue.js': ['gitlab.com', 'alibaba.com', 'baidu.com', 'grammarly.com', 'nintendo.com', 'adobe.com', 'trivago.com', 'behance.net', 'xe.com'],
  'Angular': ['youtube.com', 'gmail.com', 'google.com', 'microsoft.com', 'samsung.com', 'deutschebank.com', 'paypal.com', 'upwork.com'],
  'Svelte': ['apple.com', 'newyorker.com', 'nba.com', 'godaddy.com', 'abril.com.br', 'nTheOatmeal.com', 'dropbox.com'],
  'Tailwind CSS': ['vercel.com', 'github.com', 'tailwindcss.com', 'planetscale.com', 'resend.com', 'superchat.de', 'dub.co'],
  'WordPress': ['techcrunch.com', 'bbc.com', 'cnn.com', 'time.com', 'merriam-webster.com', 'variety.com', 'thewordpress.com', 'blog.wordpress.org'],
  'Shopify': ['allbirds.com', 'gymshark.com', 'fashionnova.com', 'MVMT.com', 'chubbies.com', 'brooksrunning.com', 'heinz.com'],
  'Stripe': ['shopify.com', 'lyft.com', 'github.com', 'amazon.com', 'google.com', 'notion.so', 'figma.com'],
  'Node.js': ['linkedin.com', 'netflix.com', 'uber.com', 'paypal.com', 'trello.com', 'medium.com', 'nasa.gov'],
  'Django': ['instagram.com', 'pinterest.com', 'mozilla.org', 'disqus.com', 'eventbrite.com', 'theatlantic.com', 'nationalgeographic.com'],
  'Ruby on Rails': ['github.com', 'shopify.com', 'airbnb.com', 'basecamp.com', 'twitch.tv', 'kickstarter.com', 'crunchbase.com'],
  'Laravel': ['laravel.com', 'itch.io', 'aldorithm.com', 'brewww.com', 'obdev.at'],
  'Python': ['instagram.com', 'pinterest.com', 'reddit.com', 'dropbox.com', 'spotify.com', 'netflix.com', 'quora.com'],
  'TypeScript': ['microsoft.com', 'github.com', 'slack.com', 'asana.com', 'notion.so', 'figma.com', 'postman.com'],
  'Docker': ['docker.com', 'dockerhub.com', 'atlassian.com', 'gitlab.com'],
  'Kubernetes': ['kubernetes.io', 'google.com', 'microsoft.com', 'spotify.com', 'urnotify.com'],
  'Cloudflare': ['cloudflare.com', 'discord.com', 'twitch.tv', 'canva.com', 'webflow.com'],
  'Firebase': ['firebase.google.com', 'google.com', 'trivago.com', 'thepracticaldev.com'],
  'PostgreSQL': ['postgresql.org', 'hasura.io', 'supabase.com', 'citusdata.com', 'Timescale.com'],
  'MongoDB': ['mongodb.com', 'ferretdb.com', 'quizlet.com', 'segfault.blog'],
  'Redis': ['redis.io', 'cachingtips.com', 'delayedjob.org'],
  'GraphQL': ['github.com', 'shopify.com', 'yelp.com', 'twitter.com', 'airbnb.com'],
  'Sentry': ['sentry.io', 'discourse.org', 'getsentry.com'],
  'Algolia': ['algolia.com', 'discord.com', 'lacework.com', 'medium.com'],
  'Intercom': ['intercom.com', 'notion.so', 'producthunt.com'],
  'HubSpot': ['hubspot.com', 'reddit.com', 'trello.com'],
  'Google Analytics': ['google.com', 'analytics.google.com', 'wordpress.com', 'shopify.com'],
  'Google Tag Manager': ['google.com', 'tagmanager.google.com', 'analytics.google.com'],
  'Vercel': ['vercel.com', 'nextjs.org', 'cal.com', 'dub.co', 'lemonsqueezy.com'],
  'Netlify': ['netlify.com', 'remix.run', 'docs.astro.build'],
  'AWS': ['aws.amazon.com', 'netflix.com', 'airbnb.com', 'slack.com', 'figma.com'],
  'Turborepo': ['vercel.com', 'turborepo.org'],
  'Prisma': ['prisma.io', 'zenstack.dev', 'formbricks.com'],
  'Supabase': ['supabase.com', 'snaplet.dev', 'planetscale.com'],
  'Auth0': ['auth0.com', 'auth0.net'],
  'Figma': ['figma.com', 'figma.design'],
  'Webflow': ['webflow.com', 'university.webflow.com'],
  'Framer': ['framer.com', 'framer.website'],
  'Spline': ['spline.design', 'splineviewer.com'],
  'Three.js': ['threejs.org', 'discoverthreejs.com'],
  'GSAP': ['greensock.com', 'gsap.com'],
  'Chart.js': ['chartjs.org', 'chartjs-lang.org'],
  'D3.js': ['d3js.org', 'observablehq.com'],
  'Leaflet': ['leafletjs.com', 'openstreetmap.org'],
  'Mapbox': ['mapbox.com', 'docs.mapbox.com'],
};

const REVERSE_API_CACHE = {};

export default function ReverseLookup() {
  const [selectedTech, setSelectedTech] = useState('');
  const [search, setSearch] = useState('');
  const [historySites, setHistorySites] = useState([]);

  const techs = useMemo(() => {
    const allTechs = new Set(Object.keys(KNOWN_SITES));
    historySites.forEach(scan => {
      (scan.technologies || []).forEach(t => allTechs.add(t.name || t));
    });
    return [...allTechs].sort();
  }, [historySites]);

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('tsf-scan-history') || '[]');
      setHistorySites(history);
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    if (!selectedTech) return [];
    const known = KNOWN_SITES[selectedTech] || [];
    const fromHistory = historySites
      .filter(scan => (scan.technologies || []).some(t => (t.name || t) === selectedTech))
      .map(scan => scan.domain);
    return [...new Set([...known, ...fromHistory])];
  }, [selectedTech, historySites]);

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
                href={`/results?site=${encodeURIComponent(site)}`}
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
