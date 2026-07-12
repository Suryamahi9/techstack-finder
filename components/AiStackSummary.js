'use client';
import { useMemo } from 'react';

function generateSummary(domain, categories, summary, company) {
  const techs = [];
  const byType = { frontend: [], backend: [], infra: [] };
  const byCategory = {};

  categories?.forEach((cat) => {
    byCategory[cat.category] = cat.technologies.map((t) => t.name);
    cat.technologies.forEach((t) => {
      techs.push(t);
      byType[t.type]?.push(t.name);
    });
  });

  if (!techs.length) return { paragraphs: ['No technologies were detected on this site.'], highlights: [], pros: [], cons: [], migrationTips: [] };

  const name = company?.name || domain;
  const frontend = byType.frontend;
  const backend = byType.backend;
  const infra = byType.infra;

  const paragraphs = [];
  const highlights = [];
  const pros = [];
  const cons = [];
  const migrationTips = [];

  // Opening
  const framework = frontend.find((t) => ['Next.js', 'Nuxt', 'Gatsby', 'Remix', 'Astro', 'Angular', 'Vue.js', 'Svelte'].includes(t));
  if (framework) {
    paragraphs.push(`${name} is built with ${framework} as its primary frontend framework, powering a modern web experience.`);
  } else if (frontend.length > 0) {
    paragraphs.push(`${name} uses ${frontend.slice(0, 3).join(', ')}${frontend.length > 3 ? ` and ${frontend.length - 3} other frontend technologies` : ''} to build its user interface.`);
  } else {
    paragraphs.push(`${name} was scanned and ${techs.length} technologies were identified across its stack.`);
  }

  // Tech depth
  if (summary.total >= 15) {
    paragraphs.push(`The site has a rich technology stack with ${summary.total} detected technologies across ${summary.categories} categories, indicating a feature-rich application.`);
  } else if (summary.total >= 8) {
    paragraphs.push(`With ${summary.total} technologies detected, the stack is moderately complex with a good balance of tools.`);
  } else {
    paragraphs.push(`The stack is lean with only ${summary.total} technologies detected, suggesting a focused and simple architecture.`);
  }

  // Highlights
  if (byCategory['Frontend Framework']) highlights.push({ text: `Frontend Framework: ${byCategory['Frontend Framework'].join(', ')}`, color: 'accent' });
  if (byCategory['CSS Framework']) highlights.push({ text: `Styling: ${byCategory['CSS Framework'].join(', ')}`, color: 'accent' });
  if (byCategory['Backend Framework']) highlights.push({ text: `Backend: ${byCategory['Backend Framework'].join(', ')}`, color: 'emerald-400' });
  if (byCategory['Database']) highlights.push({ text: `Database: ${byCategory['Database'].join(', ')}`, color: 'amber-400' });
  if (byCategory['CDN / Edge']) highlights.push({ text: `CDN: ${byCategory['CDN / Edge'].join(', ')}`, color: 'sky-400' });
  if (byCategory['Analytics']) highlights.push({ text: `Analytics: ${byCategory['Analytics'].join(', ')}`, color: 'violet-400' });

  // Pros
  if (frontend.includes('Next.js')) pros.push('Next.js provides excellent SSR/SSG, SEO, and developer experience.');
  if (frontend.includes('React')) pros.push('React has the largest ecosystem and community support.');
  if (frontend.includes('Vue.js')) pros.push('Vue.js offers gentle learning curve and excellent documentation.');
  if (frontend.includes('Svelte')) pros.push('Svelte compiles away the framework for minimal runtime overhead.');
  if (byCategory['CSS Framework']?.some((t) => t === 'Tailwind CSS')) pros.push('Tailwind CSS enables rapid UI development with utility-first approach.');
  if (infra.includes('TypeScript')) pros.push('TypeScript adds type safety and better tooling support.');
  if (infra.includes('Docker')) pros.push('Docker enables consistent development and deployment environments.');
  if (byCategory['Performance Monitoring']) pros.push('Performance monitoring is in place for proactive issue detection.');
  if (byCategory['Cloud Platform']?.includes('Vercel')) pros.push('Vercel provides zero-config deployments with edge functions.');
  if (byCategory['Cloud Platform']?.includes('AWS')) pros.push('AWS offers comprehensive cloud infrastructure and scalability.');
  if (byCategory['Analytics']?.length > 0) pros.push('Analytics tracking is set up for data-driven decisions.');
  if (byCategory['Payment Processor']?.length > 0) pros.push('Payment processing is integrated for e-commerce capabilities.');
  if (byCategory['CMS']) pros.push('CMS integration enables content management without code changes.');
  if (byCategory['Authentication']?.length > 0) pros.push('Authentication is handled by a dedicated provider for security.');
  if (pros.length === 0) pros.push('The stack uses industry-standard technologies.');

  // Cons
  const hasOldTech = frontend.some((t) => ['jQuery', 'Bootstrap'].includes(t));
  if (hasOldTech) cons.push('Legacy technologies (jQuery/Bootstrap) may increase bundle size and limit modern patterns.');
  if (byType.frontend.length >= 5) cons.push('Multiple frontend frameworks detected — this may indicate tech debt or incomplete migration.');
  if (!byCategory['Performance Monitoring']) cons.push('No performance monitoring detected — consider adding Sentry, New Relic, or similar.');
  if (!byCategory['Analytics']?.length) cons.push('No analytics detected — you may be missing usage insights.');
  if (!infra.includes('TypeScript') && frontend.length > 0) cons.push('TypeScript not detected — consider migrating for better type safety.');
  if (byCategory['CSS Framework']?.some((t) => ['Bootstrap', 'Foundation'].includes(t))) cons.push('Bootstrap/Foundation may limit design flexibility compared to Tailwind CSS.');
  if (!byCategory['Authentication']) cons.push('No authentication provider detected — ensure auth is handled securely.');
  if (summary.total > 20) cons.push('Stack has many technologies — consider simplifying to reduce maintenance overhead.');
  if (cons.length === 0) cons.push('The stack appears well-structured with no obvious concerns.');

  // Migration tips
  if (frontend.includes('jQuery')) migrationTips.push({ from: 'jQuery', to: 'React/Vue', reason: 'Modern frameworks provide better state management, reactivity, and component architecture.' });
  if (frontend.includes('Bootstrap')) migrationTips.push({ from: 'Bootstrap', to: 'Tailwind CSS', reason: 'Tailwind offers more design flexibility with smaller bundle size.' });
  if (byCategory['CSS Framework']?.includes('Bulma')) migrationTips.push({ from: 'Bulma', to: 'Tailwind CSS', reason: 'Tailwind is more widely adopted and offers better customization.' });
  if (!byCategory['Bundler']?.some((t) => ['Vite', 'esbuild', 'Turbopack'].includes(t)) && frontend.length > 0) migrationTips.push({ from: 'Webpack', to: 'Vite', reason: 'Vite offers significantly faster development builds and HMR.' });
  if (byCategory['Monitoring']?.length === 0 && summary.total > 5) migrationTips.push({ from: 'No monitoring', to: 'Sentry', reason: 'Sentry provides free error tracking with excellent JavaScript support.' });
  if (frontend.includes('Angular') && frontend.includes('React')) migrationTips.push({ from: 'Angular + React', to: 'Pick one', reason: 'Using both Angular and React adds unnecessary complexity — standardize on one.' });

  return { paragraphs, highlights, pros, cons, migrationTips };
}

export default function AiStackSummary({ domain, categories, summary, company }) {
  const analysis = useMemo(
    () => generateSummary(domain, categories, summary, company),
    [domain, categories, summary, company]
  );

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 sm:p-6 animate-fade-up">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6h-8c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z" />
          <path d="M9 21h6M10 17h4" />
          <circle cx="12" cy="9" r="1" fill="currentColor" />
        </svg>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">AI Stack Summary</h3>
      </div>

      {/* Summary paragraphs */}
      <div className="mb-4 space-y-2">
        {analysis.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-muted leading-relaxed">{p}</p>
        ))}
      </div>

      {/* Key technologies */}
      {analysis.highlights.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">Key Technologies</div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.highlights.map((h, i) => (
              <span key={i} className="rounded-full border border-border bg-bg/50 px-2.5 py-1 text-[11px] text-muted">
                {h.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pros & Cons */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Strengths ({analysis.pros.length})
          </div>
          <ul className="space-y-1.5">
            {analysis.pros.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                <span className="mt-0.5 shrink-0 text-emerald-400">+</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            Concerns ({analysis.cons.length})
          </div>
          <ul className="space-y-1.5">
            {analysis.cons.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-muted leading-relaxed">
                <span className="mt-0.5 shrink-0 text-amber-400">!</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Migration tips */}
      {analysis.migrationTips.length > 0 && (
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-accent">
            Suggested Migrations ({analysis.migrationTips.length})
          </div>
          <div className="space-y-2">
            {analysis.migrationTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] leading-relaxed">
                <span className="mt-0.5 shrink-0 text-accent">→</span>
                <div>
                  <span className="font-medium text-fg">{tip.from}</span>
                  <span className="text-muted"> → </span>
                  <span className="font-medium text-accent">{tip.to}</span>
                  <span className="text-muted"> — {tip.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
