'use client';
import { useMemo } from 'react';

const RECOMMENDATIONS = [
  {
    id: 'typescript',
    title: 'Add TypeScript',
    description: 'TypeScript catches bugs at compile time and improves developer experience with autocompletion and refactoring.',
    category: 'Developer Experience',
    priority: 'high',
    when: (techs) => !techs.includes('TypeScript'),
    alternatives: ['TypeScript', 'JSDoc type annotations'],
    impact: 'Reduces runtime errors by ~15%, improves code maintainability',
  },
  {
    id: 'tailwind',
    title: 'Switch to Tailwind CSS',
    description: 'Tailwind CSS provides utility-first styling with smaller bundle sizes and faster development.',
    category: 'Styling',
    priority: 'medium',
    when: (techs) => techs.some((t) => ['Bootstrap', 'Bulma', 'Foundation'].includes(t)) && !techs.includes('Tailwind CSS'),
    alternatives: ['Tailwind CSS', 'UnoCSS', 'Panda CSS'],
    impact: 'Typically reduces CSS bundle by 60-80%, faster prototyping',
  },
  {
    id: 'vite',
    title: 'Migrate to Vite',
    description: 'Vite offers instant HMR and faster builds compared to Webpack.',
    category: 'Build Tool',
    priority: 'medium',
    when: (techs) => techs.includes('Webpack') && !techs.includes('Vite'),
    alternatives: ['Vite', 'esbuild', 'Turbopack'],
    impact: '10-100x faster dev server startup, near-instant HMR',
  },
  {
    id: 'monitoring',
    title: 'Add Error Monitoring',
    description: 'Sentry or similar tools catch runtime errors before your users do.',
    category: 'Reliability',
    priority: 'high',
    when: (techs, cats) => !cats.some((c) => c.category === 'Error Tracking' || c.category === 'Monitoring'),
    alternatives: ['Sentry', 'Bugsnag', 'LogRocket'],
    impact: 'Catch 90%+ of production errors before users report them',
  },
  {
    id: 'analytics',
    title: 'Add Analytics',
    description: 'Understand user behavior and make data-driven decisions.',
    category: 'Insights',
    priority: 'medium',
    when: (techs, cats) => !cats.some((c) => c.category === 'Analytics'),
    alternatives: ['Plausible', 'Fathom', 'Google Analytics 4', 'PostHog'],
    impact: 'Understand user behavior, conversion funnels, and content performance',
  },
  {
    id: 'caching',
    title: 'Implement Caching',
    description: 'HTTP caching headers reduce server load and improve page load times for returning visitors.',
    category: 'Performance',
    priority: 'medium',
    when: (techs, cats, data) => !data?.performance?.cacheControl,
    alternatives: ['Cache-Control headers', 'Redis', 'CDN caching', 'Service Worker'],
    impact: 'Can reduce page load time by 50-80% for repeat visits',
  },
  {
    id: 'security-headers',
    title: 'Add Security Headers',
    description: 'CSP, HSTS, and X-Frame-Options protect against XSS, MITM, and clickjacking attacks.',
    category: 'Security',
    priority: 'high',
    when: (techs, cats, data) => {
      const sec = data?.security;
      if (!sec) return true;
      return !sec.contentSecurityPolicy || !sec.strictTransportSecurity;
    },
    alternatives: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Frame-Options'],
    impact: 'Prevents common web vulnerabilities and builds user trust',
  },
  {
    id: 'testing',
    title: 'Add Testing Framework',
    description: 'Automated tests prevent regressions and enable confident refactoring.',
    category: 'Quality',
    priority: 'high',
    when: (techs, cats) => !cats.some((c) => c.category === 'Testing'),
    alternatives: ['Jest', 'Vitest', 'Playwright', 'Cypress'],
    impact: 'Reduces bug introduction rate by ~40%, enables safe deployments',
  },
  {
    id: 'ci-cd',
    title: 'Set Up CI/CD',
    description: 'Continuous integration and deployment automate testing and shipping.',
    category: 'DevOps',
    priority: 'medium',
    when: (techs) => !techs.includes('GitHub Actions') && !techs.includes('GitLab CI'),
    alternatives: ['GitHub Actions', 'GitLab CI', 'CircleCI', 'Vercel CI'],
    impact: 'Automates quality gates, reduces deployment risk and time',
  },
  {
    id: 'a11y',
    title: 'Improve Accessibility',
    description: 'WCAG compliance expands your audience and may be legally required.',
    category: 'Accessibility',
    priority: 'medium',
    when: (techs, cats, data) => {
      const a11y = data?.a11y;
      if (!a11y) return true;
      return Object.keys(a11y).length > 3;
    },
    alternatives: ['axe-core', 'Lighthouse', 'WAVE', 'pa11y'],
    impact: 'Makes site usable for 15% of population with disabilities',
  },
  {
    id: 'performance-monitoring',
    title: 'Add Performance Monitoring',
    description: 'Track Core Web Vitals in production to catch performance regressions.',
    category: 'Performance',
    priority: 'medium',
    when: (techs, cats) => !cats.some((c) => c.category === 'Performance Monitoring'),
    alternatives: ['Vercel Analytics', 'SpeedCurve', 'DebugBear', 'Calibre'],
    impact: 'Proactively detect and fix performance regressions',
  },
  {
    id: 'bundler-upgrade',
    title: 'Upgrade Build Tool',
    description: 'Modern bundlers offer better performance and developer experience.',
    category: 'Build Tool',
    priority: 'low',
    when: (techs) => techs.includes('Parcel') && !techs.includes('Vite'),
    alternatives: ['Vite', 'esbuild'],
    impact: 'Faster builds and better ecosystem support',
  },
  {
    id: 'css-modern',
    title: 'Adopt Modern CSS',
    description: 'CSS Container Queries, :has(), and nesting reduce JavaScript complexity.',
    category: 'Styling',
    priority: 'low',
    when: (techs, cats) => cats.some((c) => c.category === 'CSS Framework') && !techs.includes('Tailwind CSS'),
    alternatives: ['Tailwind CSS v4', 'CSS Modules', 'vanilla-extract'],
    impact: 'Reduced CSS bundle size and better maintainability',
  },
  {
    id: 'image-optimization',
    title: 'Optimize Images',
    description: 'Modern formats (WebP/AVIF) and lazy loading significantly reduce page weight.',
    category: 'Performance',
    priority: 'medium',
    when: (techs, cats, data) => {
      const imgs = data?.seo?.images;
      return imgs && imgs.total > 5 && !techs.includes('Cloudinary') && !techs.includes('Imgix');
    },
    alternatives: ['Cloudinary', 'Imgix', 'next/image', 'Sharp'],
    impact: 'Images are typically 50%+ of page weight — optimization has major impact',
  },
];

function PriorityBadge({ priority }) {
  const colors = {
    high: 'bg-red-500/15 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
}

export default function StackRecommendations({ categories, security, performance, a11y }) {
  const techs = useMemo(() => {
    const names = [];
    categories?.forEach((cat) => cat.technologies.forEach((t) => names.push(t.name)));
    return names;
  }, [categories]);

  const applicable = useMemo(() => {
    return RECOMMENDATIONS
      .filter((r) => r.when(techs, categories || [], { security, performance, a11y }))
      .sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return (order[a.priority] || 2) - (order[b.priority] || 2);
      });
  }, [techs, categories, security, performance, a11y]);

  if (!applicable.length) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 sm:p-6 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Recommendations</h3>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
          {applicable.length} suggestions
        </span>
      </div>

      <div className="space-y-3">
        {applicable.map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-border bg-bg/50 p-3 transition-all hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-fg">{rec.title}</span>
                  <PriorityBadge priority={rec.priority} />
                  <span className="text-[9px] text-faint">{rec.category}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">{rec.description}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-faint">Try:</span>
              {rec.alternatives.map((alt) => (
                <span key={alt} className="rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                  {alt}
                </span>
              ))}
            </div>
            <div className="mt-1.5 text-[10px] text-faint">
              Impact: {rec.impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
