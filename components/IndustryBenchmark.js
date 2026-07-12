'use client';
import { useMemo } from 'react';

const BENCHMARKS = {
  'E-commerce': {
    typical: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal', 'React', 'Next.js', 'Tailwind CSS', 'Google Analytics', 'Google Tag Manager', 'reCAPTCHA', 'Cloudflare'],
    description: 'Online stores and shopping platforms',
    keywords: ['shop', 'store', 'buy', 'cart', 'checkout', 'product', 'price', 'commerce'],
  },
  'SaaS': {
    typical: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Stripe', 'PostgreSQL', 'AWS', 'Docker', 'Google Analytics', 'Intercom', 'Sentry'],
    description: 'Software-as-a-Service products',
    keywords: ['app', 'dashboard', 'platform', 'saas', 'workspace', 'account', 'pricing', 'login'],
  },
  'Blog / Content': {
    typical: ['WordPress', 'Google Analytics', 'Google Tag Manager', 'Disqus', 'Mailchimp', 'Google Fonts', 'Font Awesome', 'YouTube', 'Facebook Pixel'],
    description: 'Blogs, magazines, and content sites',
    keywords: ['blog', 'post', 'article', 'news', 'read', 'story', 'author', 'category'],
  },
  'Portfolio': {
    typical: ['React', 'Next.js', 'Tailwind CSS', 'Vercel', 'Framer Motion', 'Three.js', 'GSAP', 'Vimeo', 'Cloudinary'],
    description: 'Personal portfolios and agency sites',
    keywords: ['portfolio', 'work', 'about', 'contact', 'project', 'showcase', 'creative'],
  },
  'Corporate': {
    typical: ['WordPress', 'React', 'Google Analytics', 'HubSpot', 'Salesforce', 'LinkedIn', 'Cookiebot', 'Cloudflare'],
    description: 'Enterprise and corporate websites',
    keywords: ['about', 'team', 'careers', 'contact', 'investor', 'press', 'enterprise'],
  },
  'Social / Community': {
    typical: ['React', 'Vue.js', 'Node.js', 'Firebase', 'Socket.io', 'Redis', 'MongoDB', 'Cloudflare', 'Auth0'],
    description: 'Social networks and community platforms',
    keywords: ['community', 'forum', 'chat', 'group', 'feed', 'follow', 'profile'],
  },
  'AI / ML': {
    typical: ['Python', 'FastAPI', 'React', 'Next.js', 'Docker', 'AWS', 'PostgreSQL', 'Redis', 'TensorFlow', 'Hugging Face'],
    description: 'AI/ML products and tools',
    keywords: ['ai', 'ml', 'model', 'gpt', 'llm', 'inference', 'neural', 'data'],
  },
  'Education': {
    typical: ['WordPress', 'React', 'Moodle', 'Google Analytics', 'Zoom', 'YouTube', 'Google Fonts', 'Cloudflare'],
    description: 'Educational platforms and LMS',
    keywords: ['learn', 'course', 'student', 'school', 'university', 'education', 'teach', 'academy'],
  },
  'Finance / Fintech': {
    typical: ['React', 'Next.js', 'Node.js', 'Stripe', 'Plaid', 'AWS', 'PostgreSQL', 'Docker', 'Sentry', 'Auth0'],
    description: 'Banking, payments, and financial tools',
    keywords: ['bank', 'finance', 'payment', 'invest', 'trading', 'wallet', 'fintech'],
  },
  'Healthcare': {
    typical: ['React', 'Angular', 'Node.js', 'AWS', 'HIPAA', 'Auth0', 'Google Analytics', 'Cloudflare'],
    description: 'Health and medical platforms',
    keywords: ['health', 'medical', 'doctor', 'patient', 'clinic', 'hospital', 'healthcare'],
  },
  'Media / Entertainment': {
    typical: ['React', 'Next.js', 'YouTube', 'Vimeo', 'Cloudinary', 'Google Analytics', 'Google Tag Manager', 'Cloudflare', 'Facebook Pixel'],
    description: 'Streaming, media, and entertainment',
    keywords: ['watch', 'stream', 'video', 'music', 'movie', 'show', 'entertainment'],
  },
  'Developer Tools': {
    typical: ['React', 'Vue.js', 'TypeScript', 'Node.js', 'Vite', 'Docker', 'GitHub', 'PostgreSQL', 'Redis', 'Terraform'],
    description: 'Developer platforms and tools',
    keywords: ['docs', 'api', 'developer', 'sdk', 'cli', 'git', 'code', 'dev'],
  },
};

function detectIndustry(domain, categories) {
  const allText = [
    domain || '',
    ...(categories || []).map((c) => c.category),
    ...(categories || []).flatMap((c) => c.technologies.map((t) => t.name)),
  ].join(' ').toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  Object.entries(BENCHMARKS).forEach(([name, bench]) => {
    const matches = bench.keywords.filter((kw) => allText.includes(kw)).length;
    if (matches > bestScore) {
      bestScore = matches;
      bestMatch = name;
    }
  });

  return bestScore > 0 ? bestMatch : 'SaaS';
}

function MatchBadge({ present, count }) {
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
      present ? 'bg-emerald-500/15 text-emerald-400' : 'bg-border/50 text-faint'
    }`}>
      {present ? `${count} match${count !== 1 ? 'es' : ''}` : 'none'}
    </span>
  );
}

export default function IndustryBenchmark({ domain, categories }) {
  const analysis = useMemo(() => {
    if (!categories) return null;

    const industry = detectIndustry(domain, categories);
    const benchmark = BENCHMARKS[industry];

    const detectedNames = new Set();
    categories.forEach((cat) => cat.technologies.forEach((t) => detectedNames.add(t.name)));

    const matched = benchmark.typical.filter((t) => detectedNames.has(t));
    const missing = benchmark.typical.filter((t) => !detectedNames.has(t));
    const matchRate = Math.round((matched.length / benchmark.typical.length) * 100);

    const uniqueToSite = [];
    categories.forEach((cat) => cat.technologies.forEach((t) => {
      if (!benchmark.typical.includes(t.name)) uniqueToSite.push(t);
    }));

    return { industry, benchmark, matched, missing, matchRate, uniqueToSite };
  }, [domain, categories]);

  if (!analysis) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Industry Benchmark</h3>
          <p className="mt-0.5 text-[11px] text-muted">{analysis.benchmark.description}</p>
        </div>
        <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {analysis.industry}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-border bg-bg/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Typical stack match</span>
          <span className="font-mono text-sm font-bold text-fg">{analysis.matchRate}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${analysis.matchRate}%`,
              backgroundColor: analysis.matchRate >= 70 ? '#10b981' : analysis.matchRate >= 40 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">
          Typical Stack ({analysis.industry})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.benchmark.typical.map((tech) => {
            const present = analysis.matched.includes(tech);
            return (
              <span
                key={tech}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  present
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-border bg-bg text-faint'
                }`}
              >
                {present && <span className="h-1 w-1 rounded-full bg-emerald-400" />}
                {tech}
              </span>
            );
          })}
        </div>
      </div>

      {analysis.missing.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Missing from typical stack ({analysis.missing.length})
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {analysis.missing.map((tech) => (
              <span key={tech} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.uniqueToSite.length > 0 && (
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Unique to your stack ({analysis.uniqueToSite.length})
          </div>
          <div className="flex flex-wrap gap-1">
            {analysis.uniqueToSite.slice(0, 12).map((t) => (
              <span key={t.name} className="rounded-full border border-accent/20 bg-accent/5 px-2 py-0.5 text-[10px] text-accent">
                {t.name}
              </span>
            ))}
            {analysis.uniqueToSite.length > 12 && (
              <span className="text-[10px] text-faint">+{analysis.uniqueToSite.length - 12} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
