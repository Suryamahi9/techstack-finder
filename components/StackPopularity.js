'use client';
import { useState, useEffect, useMemo } from 'react';

const KNOWN_TECHS = {
  'Next.js': 92, 'React': 95, 'Vue.js': 78, 'Angular': 65, 'Svelte': 42,
  'Nuxt': 38, 'Gatsby': 35, 'Remix': 30, 'Astro': 36, 'Solid.js': 15,
  'Tailwind CSS': 88, 'Bootstrap': 72, 'Bulma': 35, 'Foundation': 22,
  'Material UI': 60, 'Chakra UI': 45, 'Ant Design': 40, 'Vuetify': 28,
  'jQuery': 55, 'Lodash': 50, 'moment': 40, 'Day.js': 45, 'Axios': 70,
  'Three.js': 25, 'D3.js': 30, 'GSAP': 28, 'Framer Motion': 50,
  'Node.js': 85, 'Express': 65, 'Django': 40, 'Laravel': 42, 'Ruby on Rails': 30,
  'Spring Boot': 35, 'Flask': 32, 'FastAPI': 38, 'WordPress': 80, 'Drupal': 18,
  'Shopify': 55, 'Webflow': 40, 'Squarespace': 25, 'Vercel': 60, 'Netlify': 50,
  'AWS': 75, 'Cloudflare': 70, 'Firebase': 55, 'Supabase': 35,
  'Stripe': 60, 'PayPal': 45, 'Google Analytics': 80, 'Google Tag Manager': 65,
  'Segment': 30, 'Hotjar': 40, 'Sentry': 55, 'New Relic': 30, 'Datadog': 28,
  'Cloudflare CDN': 65, 'Amazon CloudFront': 45, 'Fastly': 20,
  'Nginx': 60, 'Apache': 40, 'Caddy': 12, 'Varnish': 10,
  'Redis': 50, 'MongoDB': 55, 'PostgreSQL': 65, 'MySQL': 60,
  'GraphQL': 40, 'REST API': 85, 'Webpack': 60, 'Vite': 55, 'Parcel': 15,
  'esbuild': 25, 'Turbopack': 18, 'Turborepo': 20,
  'TypeScript': 80, 'JavaScript': 98, 'Python': 70, 'Ruby': 25, 'Java': 50,
  'Go': 30, 'Rust': 15, 'Docker': 70, 'Kubernetes': 35, 'Terraform': 25,
  'Jest': 55, 'Cypress': 40, 'Playwright': 35, 'Selenium': 30,
  'Storybook': 30, 'Prisma': 35, 'Contentful': 25, 'Sanity': 22, 'Strapi': 28,
  'Algolia': 20, 'Elasticsearch': 25, 'SendGrid': 30, 'Mailchimp': 25,
  'Intercom': 22, 'Zendesk': 18, 'Auth0': 28, 'Clerk': 20, 'NextAuth.js': 32,
  'reCAPTCHA': 50, 'hCaptcha': 15, 'Cloudinary': 20, 'Imgix': 10,
  'YouTube': 60, 'Vimeo': 20, 'Disqus': 10, 'Google Fonts': 75, 'Font Awesome': 40,
  'HubSpot': 25, 'Salesforce': 20, 'Mapbox': 12, 'Crisp': 15, 'Drift': 10,
  'Mixpanel': 18, 'Amplitude': 15, 'Plausible': 12, 'Fathom': 8, 'Vercel Analytics': 20,
  'Firebase Auth': 22, 'Okta': 15,
};

function getPopularity(name) {
  return KNOWN_TECHS[name] || null;
}

function PopularityRing({ score, size = 64 }) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-lg font-bold text-fg">{score}</span>
        <span className="text-[8px] text-faint">/ 100</span>
      </div>
    </div>
  );
}

export default function StackPopularity({ categories }) {
  const [historyTechs, setHistoryTechs] = useState({});

  useEffect(() => {
    try {
      const trends = JSON.parse(localStorage.getItem('tsf-scan-trends') || '[]');
      const counts = {};
      trends.forEach((t) => {
        if (t.techBreakdown) {
          Object.entries(t.techBreakdown).forEach(([name, count]) => {
            counts[name] = (counts[name] || 0) + count;
          });
        }
      });
      setHistoryTechs(counts);
    } catch {}
  }, []);

  const analysis = useMemo(() => {
    if (!categories) return null;

    const techs = [];
    categories.forEach((cat) => {
      cat.technologies.forEach((t) => {
        const globalPop = getPopularity(t.name);
        const historyCount = historyTechs[t.name] || 0;
        techs.push({
          name: t.name,
          type: t.type,
          category: cat.category,
          globalPop,
          historyCount,
        });
      });
    });

    if (!techs.length) return null;

    const globalScores = techs.filter((t) => t.globalPop !== null).map((t) => t.globalPop);
    const avgGlobal = globalScores.length ? Math.round(globalScores.reduce((s, v) => s + v, 0) / globalScores.length) : 50;

    const historyCounts = techs.map((t) => t.historyCount);
    const maxHistory = Math.max(...historyCounts, 1);
    const historyScore = Math.round(
      (techs.reduce((s, t) => s + t.historyCount, 0) / Math.max(techs.length, 1)) / maxHistory * 100
    );

    const overallScore = Math.round(avgGlobal * 0.7 + historyScore * 0.3);

    const sorted = [...techs].sort((a, b) => (b.globalPop || 0) - (a.globalPop || 0));

    return { techs, overallScore, avgGlobal, historyScore, sorted };
  }, [categories, historyTechs]);

  if (!analysis) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Stack Popularity</h3>
        <PopularityRing score={analysis.overallScore} size={56} />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2 text-center">
          <div className="font-mono text-lg font-bold text-fg">{analysis.avgGlobal}</div>
          <div className="text-[10px] uppercase tracking-wider text-faint">Global Adoption</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 px-3 py-2 text-center">
          <div className="font-mono text-lg font-bold text-fg">{analysis.historyScore}</div>
          <div className="text-[10px] uppercase tracking-wider text-faint">Your History</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {analysis.sorted.slice(0, 10).map((t) => {
          const pop = t.globalPop || 0;
          const barColor = pop >= 70 ? '#10b981' : pop >= 40 ? '#f59e0b' : '#ef4444';
          return (
            <div key={t.name} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-muted">{t.name}</span>
              <div className="relative flex-1 h-4 overflow-hidden rounded-md bg-border/50">
                <div
                  className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
                  style={{ width: `${pop}%`, backgroundColor: barColor }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-fg">
                  {pop}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
