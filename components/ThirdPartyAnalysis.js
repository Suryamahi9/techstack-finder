'use client';
import { useMemo } from 'react';

const SERVICE_MAP = {
  'Google Analytics': { category: 'Analytics', provider: 'Google', risk: 'low' },
  'Google Tag Manager': { category: 'Analytics', provider: 'Google', risk: 'low' },
  'Hotjar': { category: 'Analytics', provider: 'Hotjar', risk: 'medium' },
  'Mixpanel': { category: 'Analytics', provider: 'Mixpanel', risk: 'medium' },
  'Amplitude': { category: 'Analytics', provider: 'Amplitude', risk: 'medium' },
  'Segment': { category: 'Analytics', provider: 'Twilio', risk: 'medium' },
  'Plausible': { category: 'Analytics', provider: 'Plausible', risk: 'low' },
  'Fathom': { category: 'Analytics', provider: 'Fathom', risk: 'low' },
  'Vercel Analytics': { category: 'Analytics', provider: 'Vercel', risk: 'low' },
  'Facebook Pixel': { category: 'Advertising', provider: 'Meta', risk: 'high' },
  'Google Ads': { category: 'Advertising', provider: 'Google', risk: 'high' },
  'Google AdSense': { category: 'Advertising', provider: 'Google', risk: 'high' },
  'Stripe': { category: 'Payment', provider: 'Stripe', risk: 'low' },
  'PayPal': { category: 'Payment', provider: 'PayPal', risk: 'low' },
  'Apple Pay': { category: 'Payment', provider: 'Apple', risk: 'low' },
  'Google Pay': { category: 'Payment', provider: 'Google', risk: 'low' },
  'Intercom': { category: 'Support', provider: 'Intercom', risk: 'medium' },
  'Zendesk': { category: 'Support', provider: 'Zendesk', risk: 'low' },
  'Crisp': { category: 'Support', provider: 'Crisp', risk: 'medium' },
  'Drift': { category: 'Support', provider: 'Salesloft', risk: 'medium' },
  'HubSpot': { category: 'Marketing', provider: 'HubSpot', risk: 'medium' },
  'Salesforce': { category: 'CRM', provider: 'Salesforce', risk: 'medium' },
  'Mailchimp': { category: 'Email', provider: 'Mailchimp', risk: 'medium' },
  'SendGrid': { category: 'Email', provider: 'Twilio', risk: 'low' },
  'Sentry': { category: 'Monitoring', provider: 'Sentry', risk: 'low' },
  'New Relic': { category: 'Monitoring', provider: 'New Relic', risk: 'medium' },
  'Datadog': { category: 'Monitoring', provider: 'Datadog', risk: 'medium' },
  'Cloudflare': { category: 'CDN', provider: 'Cloudflare', risk: 'low' },
  'Amazon CloudFront': { category: 'CDN', provider: 'AWS', risk: 'low' },
  'Fastly': { category: 'CDN', provider: 'Fastly', risk: 'low' },
  'Cloudinary': { category: 'Media', provider: 'Cloudinary', risk: 'low' },
  'Imgix': { category: 'Media', provider: 'Imgix', risk: 'low' },
  'YouTube': { category: 'Embed', provider: 'Google', risk: 'medium' },
  'Vimeo': { category: 'Embed', provider: 'IAC', risk: 'medium' },
  'Disqus': { category: 'Comments', provider: 'Disqus', risk: 'high' },
  'Google Fonts': { category: 'Font CDN', provider: 'Google', risk: 'low' },
  'Font Awesome': { category: 'Icon CDN', provider: 'Fonticons', risk: 'low' },
  'reCAPTCHA': { category: 'Security', provider: 'Google', risk: 'medium' },
  'hCaptcha': { category: 'Security', provider: 'hCaptcha', risk: 'low' },
  'Algolia': { category: 'Search', provider: 'Algolia', risk: 'low' },
  'Elasticsearch': { category: 'Search', provider: 'Elastic', risk: 'low' },
  'Mapbox': { category: 'Maps', provider: 'Mapbox', risk: 'medium' },
  'Firebase': { category: 'BaaS', provider: 'Google', risk: 'medium' },
  'Supabase': { category: 'BaaS', provider: 'Supabase', risk: 'low' },
  'Auth0': { category: 'Auth', provider: 'Okta', risk: 'medium' },
  'Clerk': { category: 'Auth', provider: 'Clerk', risk: 'low' },
  'NextAuth.js': { category: 'Auth', provider: 'Open Source', risk: 'low' },
  'Firebase Auth': { category: 'Auth', provider: 'Google', risk: 'medium' },
  'Okta': { category: 'Auth', provider: 'Okta', risk: 'medium' },
};

const CATEGORY_ICONS = {
  Analytics: '📊',
  Advertising: '📢',
  Payment: '💳',
  Support: '💬',
  Marketing: '📣',
  CRM: '👥',
  Email: '📧',
  Monitoring: '🔍',
  CDN: '🌐',
  Media: '🖼️',
  Embed: '▶️',
  Comments: '💬',
  'Font CDN': '🔤',
  'Icon CDN': '🎨',
  Security: '🔒',
  Search: '🔎',
  Maps: '🗺️',
  BaaS: '☁️',
  Auth: '🔐',
};

const RISK_COLORS = {
  low: 'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
};

function ServiceBadge({ name, service }) {
  const icon = CATEGORY_ICONS[service.category] || '📦';
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2">
      <span className="text-sm">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-fg">{name}</div>
        <div className="text-[10px] text-faint">{service.provider}</div>
      </div>
      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${RISK_COLORS[service.risk]}`}>
        {service.risk}
      </span>
    </div>
  );
}

export default function ThirdPartyAnalysis({ categories, pageMetadata }) {
  const analysis = useMemo(() => {
    const detected = [];
    const byCategory = {};
    const providers = new Set();
    let highRisk = 0;

    categories?.forEach((cat) => {
      cat.technologies.forEach((t) => {
        const service = SERVICE_MAP[t.name];
        if (service) {
          detected.push({ name: t.name, ...service });
          if (!byCategory[service.category]) byCategory[service.category] = [];
          byCategory[service.category].push({ name: t.name, ...service });
          providers.add(service.provider);
          if (service.risk === 'high') highRisk++;
        }
      });
    });

    return { detected, byCategory, providers: [...providers], highRisk, total: detected.length };
  }, [categories]);

  if (!analysis.total) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-5 animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-faint">Third-Party Services</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-faint">
          <span>{analysis.total} services</span>
          <span>·</span>
          <span>{analysis.providers.length} providers</span>
          {analysis.highRisk > 0 && (
            <>
              <span>·</span>
              <span className="text-red-400">{analysis.highRisk} high-risk</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(analysis.byCategory).map(([cat, services]) => (
          <div key={cat}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-xs">{CATEGORY_ICONS[cat] || '📦'}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{cat}</span>
              <span className="text-[9px] text-faint">({services.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {services.map((s) => (
                <ServiceBadge key={s.name} name={s.name} service={s} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {analysis.highRisk > 0 && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
            Privacy Note
          </div>
          <p className="mt-1 text-[11px] text-muted leading-relaxed">
            {analysis.highRisk} high-risk service(s) detected that may collect user data.
            Review privacy implications and consider adding appropriate disclosures in your privacy policy.
          </p>
        </div>
      )}
    </div>
  );
}
