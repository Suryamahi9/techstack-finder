'use client';
import { useState } from 'react';

const CODE_EXAMPLES = {
  curl: {
    label: 'cURL',
    code: `curl -X POST https://yourdomain.com/api/scan \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: tsf_your_api_key_here" \\
  -d '{"url": "https://example.com"}'`,
  },
  javascript: {
    label: 'JavaScript',
    code: `const response = await fetch('/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'tsf_your_api_key_here',
  },
  body: JSON.stringify({ url: 'https://example.com' }),
});
const data = await response.json();
console.log(data.categories);`,
  },
  python: {
    label: 'Python',
    code: `import requests

response = requests.post(
    'https://yourdomain.com/api/scan',
    json={'url': 'https://example.com'},
    headers={'x-api-key': 'tsf_your_api_key_here'}
)
data = response.json()
print(data['categories'])`,
  },
};

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/scan',
    description: 'Scan a website and detect its technology stack.',
    body: [
      { name: 'url', type: 'string', required: true, desc: 'The URL to scan' },
      { name: 'headers', type: 'object', required: false, desc: 'Custom HTTP headers to send' },
      { name: 'cookies', type: 'string', required: false, desc: 'Cookie string (e.g. "a=b; c=d")' },
      { name: 'timeout', type: 'number', required: false, desc: 'Fetch timeout in milliseconds' },
      { name: 'proxy', type: 'string', required: false, desc: 'Proxy URL (e.g. "http://user:pass@host:port")' },
    ],
    response: `{ "success": true, "site": {...}, "summary": {...}, "categories": [...], "rateLimit": { "tier": "free", "remaining": 9, "limit": 10 } }`,
  },
  {
    method: 'GET',
    path: '/api/scan',
    description: 'Returns API documentation and tier information.',
    response: `{ "name": "TechStack Finder API", "tiers": {...} }`,
  },
  {
    method: 'GET',
    path: '/api/badge?domain=example.com',
    description: 'Generate an SVG badge showing a site\'s tech stack.',
    params: [
      { name: 'domain', type: 'string', required: true, desc: 'The domain to generate a badge for' },
      { name: 'theme', type: 'string', required: false, desc: '"dark" or "light"' },
      { name: 'format', type: 'string', required: false, desc: '"svg" or "json"' },
    ],
  },
];

const RATE_LIMITS = [
  { tier: 'Free', rate: '10 req/min', scans: '50/month', deepScan: 'No', badge: 'Yes' },
  { tier: 'Pro', rate: '100 req/min', scans: '2,000/month', deepScan: 'Yes', badge: 'Yes' },
  { tier: 'Enterprise', rate: '500 req/min', scans: '20,000/month', deepScan: 'Yes', badge: 'Yes' },
];

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative rounded-lg border border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-faint">{language}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] text-muted hover:text-fg transition-colors"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-fg/80 font-mono">{code}</pre>
    </div>
  );
}

function MethodBadge({ method }) {
  const colors = { GET: 'bg-blue-500/15 text-blue-400', POST: 'bg-green-500/15 text-green-400', PUT: 'bg-yellow-500/15 text-yellow-400', DELETE: 'bg-red-500/15 text-red-400' };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${colors[method] || colors.GET}`}>{method}</span>;
}

export default function DocsPage() {
  const [activeExample, setActiveExample] = useState('curl');

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-fg">API Documentation</h1>
          <p className="mt-2 text-sm text-muted">
            Detect any website&apos;s technology stack via our REST API. Get your API key at{' '}
            <a href="/api-keys" className="text-accent hover:underline">/api-keys</a>.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-fg">Quick Start</h2>
          <div className="flex gap-2 mb-3">
            {Object.entries(CODE_EXAMPLES).map(([key, ex]) => (
              <button
                key={key}
                onClick={() => setActiveExample(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  activeExample === key
                    ? 'bg-accent/10 text-accent border border-accent/25'
                    : 'border border-white/[0.06] text-muted hover:text-fg'
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <CodeBlock code={CODE_EXAMPLES[activeExample].code} language={activeExample} />
        </div>

        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-fg">Rate Limits</h2>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-4 py-3 font-medium text-muted">Tier</th>
                  <th className="px-4 py-3 font-medium text-muted">Rate Limit</th>
                  <th className="px-4 py-3 font-medium text-muted">Scans/Month</th>
                  <th className="px-4 py-3 font-medium text-muted">Deep Scan</th>
                  <th className="px-4 py-3 font-medium text-muted">Badges</th>
                </tr>
              </thead>
              <tbody>
                {RATE_LIMITS.map((r) => (
                  <tr key={r.tier} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 font-medium text-fg">{r.tier}</td>
                    <td className="px-4 py-3 text-fg/80">{r.rate}</td>
                    <td className="px-4 py-3 text-fg/80">{r.scans}</td>
                    <td className="px-4 py-3 text-fg/80">{r.deepScan}</td>
                    <td className="px-4 py-3 text-fg/80">{r.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-fg">Endpoints</h2>
          <div className="flex flex-col gap-4">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path + ep.method} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <MethodBadge method={ep.method} />
                  <code className="text-sm font-mono text-fg">{ep.path}</code>
                </div>
                <p className="mb-3 text-xs text-muted">{ep.description}</p>

                {ep.body && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Body</p>
                    <div className="overflow-x-auto rounded-lg border border-white/[0.04]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                            <th className="px-3 py-2 font-medium text-muted">Field</th>
                            <th className="px-3 py-2 font-medium text-muted">Type</th>
                            <th className="px-3 py-2 font-medium text-muted">Required</th>
                            <th className="px-3 py-2 font-medium text-muted">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.body.map((f) => (
                            <tr key={f.name} className="border-b border-white/[0.04] last:border-0">
                              <td className="px-3 py-2 font-mono text-fg">{f.name}</td>
                              <td className="px-3 py-2 text-fg/60">{f.type}</td>
                              <td className="px-3 py-2">{f.required ? <span className="text-accent">Yes</span> : <span className="text-faint">No</span>}</td>
                              <td className="px-3 py-2 text-muted">{f.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {ep.response && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-faint">Response</p>
                    <pre className="overflow-x-auto rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-xs font-mono text-fg/70">{ep.response}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-3 text-lg font-semibold text-fg">Authentication</h2>
          <p className="mb-3 text-xs text-muted">
            Include your API key in the <code className="text-fg/80">x-api-key</code> header. You can also authenticate via browser session by signing in at{' '}
            <a href="/login" className="text-accent hover:underline">/login</a>.
          </p>
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-xs font-mono text-fg/70">
            x-api-key: tsf_your_api_key_here
          </div>
          <p className="mt-3 text-xs text-muted">
            Every response includes a <code className="text-fg/80">rateLimit</code> object showing your tier, remaining requests, and limit.
          </p>
        </div>
      </div>
    </div>
  );
}
