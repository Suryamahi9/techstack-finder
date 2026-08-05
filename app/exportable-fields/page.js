import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';

export const metadata = {
  title: 'Exportable Fields — TechStack Finder',
  description:
    'Every field returned by the TechStack Finder scan API and available for CSV, JSON, and API export — documented with types and examples.',
};

const TOP_LEVEL = [
  { field: 'success', type: 'boolean', description: 'Whether the scan completed', example: 'true' },
  { field: 'site', type: 'object', description: 'Identity of the scanned website: url, domain, title, favicon, scannedAt, statusCode', example: '{"url":"https://shopify.com","domain":"shopify.com"}' },
  { field: 'summary', type: 'object', description: 'Totals: total technologies, category count, frontend / backend / infra split', example: '{"total":37,"frontend":14,"backend":9,"infra":6}' },
  { field: 'technologies', type: 'array<object>', description: 'Every detected technology with name, category, detectedVia, confidence, version', example: '[{"name":"Shopify","category":"eCommerce","confidence":"high"}]' },
  { field: 'categories', type: 'array<object>', description: 'Technologies grouped into ordered categories for report rendering', example: '[{"category":"eCommerce","technologies":[...]}]' },
  { field: 'techByType', type: 'object', description: 'Technologies bucketed by detection surface: html, headers, script_src, cookies, css, js_content', example: '{"html":[...],"headers":[...]}' },
  { field: 'canonicalTechs', type: 'array', description: 'De-duplicated canonical technology names across the whole report', example: '["Shopify","Algolia","Cloudflare"]' },
  { field: 'impliedTechs', type: 'array', description: 'Technologies inferred from co-occurring stack signals', example: '[{"name":"PayPal","reason":"payment gateways"}]' },
  { field: 'company', type: 'object', description: 'Company signals parsed from the page when present', example: '{"name":"Shopify Inc."}' },
  { field: 'pageMetadata', type: 'object', description: 'Title, description, and meta tags extracted from HTML', example: '{"title":"Shopify - Commerce"}' },
  { field: 'responseHeaders', type: 'object', description: 'Server, x-powered-by, and generator headers', example: '{"server":"nginx","generator":"Shopify"}' },
  { field: 'industry', type: 'string | null', description: 'Industry classification from page content', example: '"Ecommerce"' },
  { field: 'aiBuilders', type: 'array', description: 'AI agent / builder fingerprints found in the stack', example: '["OpenAI"]' },
  { field: 'healthScore', type: 'object', description: 'Composite site health scoring', example: '{"score":82}' },
  { field: 'dnsTls', type: 'object | null', description: 'DNS, TLS, and HTTP version checks (httpVersion, security)', example: '{"httpVersion":"HTTP/2"}' },
  { field: 'cveSummary', type: 'object | null', description: 'CVE lookup for detected versions with severity', example: '{"critical":1,"high":2}' },
  { field: 'versionScores', type: 'object | null', description: 'Version-level security scores per technology', example: '{"jQuery":"8.9/10"}' },
  { field: 'seo', type: 'object', description: 'SEO analysis: tags, robots, sitemaps, heading structure', example: '{"title":"ok","metaDescription":"ok"}' },
  { field: 'performance', type: 'object', description: 'Performance insights: resource weight, caching headers, compression', example: '{"compression":"gzip"}' },
  { field: 'security', type: 'object', description: 'Security header and configuration checks', example: '{"hsts":true,"csp":null}' },
  { field: 'a11y', type: 'object', description: 'Accessibility audit of the fetched page', example: '{"lang":"en"}' },
  { field: 'adsTxt', type: 'object | null', description: 'ads.txt record if present', example: '{"present":true}' },
  { field: 'gdpr', type: 'object | null', description: 'Consent / cookie-banner signals for GDPR audits', example: '{"consentBanner":true}' },
  { field: 'jobInference', type: 'object | null', description: 'Inferred hiring / headcount signals', example: '{"teamEstimate":"10-50"}' },
  { field: 'stackInference', type: 'object | null', description: 'Inferred stack maturity and build style', example: '{"age":"5+"}' },
  { field: 'costEstimate', type: 'object | null', description: 'Estimated monthly infrastructure cost range', example: '{"monthly":{"low":1200,"high":3000}}' },
  { field: 'lifecycle', type: 'object | null', description: 'Estimated technology lifecycle stage', example: '{"stage":"growing"}' },
  { field: 'complexity', type: 'object | null', description: 'Stack complexity estimate', example: '{"level":"high"}' },
  { field: 'openSourceAlts', type: 'array', description: 'Open-source alternatives for detected commercial tools', example: '["Keycloak","Nginx"]' },
  { field: 'teamEstimate', type: 'object | null', description: 'Estimated team size behind the site', example: '{"range":"10-50"}' },
  { field: 'techDebt', type: 'object | null', description: 'Deprecated or end-of-life technology flags', example: '{"outdated":["jQuery 1.x"]}' },
  { field: 'migrationData', type: 'object | null', description: 'Historical migration signals between platforms', example: '{"from":"Wix","to":"Shopify"}' },
  { field: 'competitorRadar', type: 'object | null', description: 'Competitor overlap analysis for the scanned domain', example: '{"overlap":["Vercel","Cloudflare"]}' },
  { field: 'fingerprint', type: 'object', description: 'Stable hash fingerprint of the detected stack for change tracking', example: '{"hash":"a1b2c3"}' },
  { field: 'insights', type: 'array<string>', description: 'Plain-language observations about the stack', example: '["Uses Cloudflare CDN"]' },
  { field: 'partialResults', type: 'boolean', description: 'True when the site blocked fetch and results are partial', example: 'false' },
  { field: 'cached', type: 'boolean', description: 'Response served from the 10-minute in-memory cache', example: 'false' },
  { field: 'rateLimit', type: 'object', description: 'Tier, remaining, and limit for the requesting key', example: '{"tier":"free","remaining":42,"limit":50}' },
];

const TECH_LEVEL = [
  { field: 'name', type: 'string', description: 'Canonical technology name', example: '"Shopify"' },
  { field: 'category', type: 'string', description: 'Category this technology belongs to', example: '"eCommerce"' },
  { field: 'confidence', type: 'string', description: '"high" | "medium" | "low" — signal strength', example: '"high"' },
  { field: 'version', type: 'string | null', description: 'Extracted version when determinable', example: '"2024.3"' },
  { field: 'detectedVia', type: 'string', description: 'Pattern surface that matched: html, script_src, cookie, css_class…', example: '"html"' },
];

export default function ExportableFieldsPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Exportable Fields"
          lede="Every field in a TechStack Finder report can be exported to CSV or pulled through the API. This is the exact schema the scan endpoint returns — documented with types and live examples."
          cta={{ href: '/api/scan', label: 'Try the scan API' }}
          secondary={{ href: '/datasets', label: 'Download datasets' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              { label: 'Top-level fields', value: TOP_LEVEL.length },
              { label: 'Technology fields', value: TECH_LEVEL.length },
              { label: 'Export formats', value: 'CSV · JSON · API' },
            ].map((s) => (
              <div key={s.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Top-level report fields</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Field</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Type</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Description</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Example</th>
                </tr>
              </thead>
              <tbody>
                {TOP_LEVEL.map((f) => (
                  <tr key={f.field} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-accent">{f.field}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-faint">{f.type}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-muted">{f.description}</td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-[10px] text-fg/70">{f.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-14 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Technology object fields</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Field</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Type</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Description</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Example</th>
                </tr>
              </thead>
              <tbody>
                {TECH_LEVEL.map((f) => (
                  <tr key={f.field} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-accent">{f.field}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-faint">{f.type}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-muted">{f.description}</td>
                    <td className="max-w-xs truncate px-4 py-3 font-mono text-[10px] text-fg/70">{f.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
