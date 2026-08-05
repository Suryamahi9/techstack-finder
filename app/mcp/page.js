import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';

export const metadata = {
  title: 'MCP Server - TechStack Finder',
  description:
    'Model Context Protocol server for TechStack Finder. Scan any website for its tech stack and query market trends from any AI assistant.',
};

const TOOLS = [
  {
    name: 'scan_website',
    desc: 'Scan a URL and return the detected stack — frameworks, libraries, CMS, hosting, analytics, security headers, health score, CVEs, GDPR audit, insights, and the stack fingerprint.',
  },
  {
    name: 'list_technologies',
    desc: 'List the trends directory sorted by live-site count, with optional search, category, limit, and sort filters.',
  },
  {
    name: 'get_technology',
    desc: 'Detail for one technology: live-site counts, market-share history 2018-2026, YoY direction, country breakdown, top sites, and related technologies.',
  },
  {
    name: 'get_trends_overview',
    desc: 'Spotlight technologies, top-20 market-share leaders, technology groups, and total tracked live-site instances.',
  },
  {
    name: 'compare_technologies',
    desc: 'Compare technologies by market share and trend direction, sorted by share of websites.',
  },
];

const FEATURES = [
  'Runs over stdio for Claude Desktop, Cursor, and opencode, or as a Streamable HTTP endpoint',
  'Thin client over the public /api/scan and /api/trends endpoints — no separate database',
  'Optional API key for tier-level scan limits; trends data is open and anonymous',
];

export default function McpPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="MCP Server"
          title="Bring TechStack Finder into any AI assistant"
          lede="A Model Context Protocol server that gives agents the same detection engine as the site: scan any URL for its technology stack, or query the market-share and trends directory, straight from your tools."
          secondary={{ href: '/api-keys', label: 'Get an API key' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-4 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f} className="rounded-lg border border-border bg-bg p-6">
                <p className="text-sm leading-relaxed text-muted">{f}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Tools</p>
          <h2 className="mt-4 font-serif text-2xl font-normal text-fg">What agents can do</h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            {TOOLS.map((tool, i) => (
              <div
                key={tool.name}
                className={`grid gap-2 px-6 py-5 sm:grid-cols-[220px_1fr] sm:gap-6 ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <code className="pt-0.5 font-mono text-xs text-accent">{tool.name}</code>
                <p className="text-sm leading-relaxed text-muted">{tool.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Quick start</p>
          <h2 className="mt-4 font-serif text-2xl font-normal text-fg">Run it in two commands</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">stdio (default)</p>
              <pre className="mt-3 overflow-x-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{`npm install
node src/index.js`}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">HTTP (remote)</p>
              <pre className="mt-3 overflow-x-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{`npm install
node src/index.js --transport http --port 3001`}
              </pre>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Configuration</p>
          <h2 className="mt-4 font-serif text-2xl font-normal text-fg">Point your client at it</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Claude Desktop</p>
              <pre className="mt-3 overflow-x-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{`"mcpServers": {
  "techstack-finder": {
    "command": "node",
    "args": ["C:\\\\path\\\\to\\\\mcp\\\\src\\\\index.js"],
    "env": { "TSF_API_KEY": "tsf_your_key_here" }
  }
}`}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-bg p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">opencode</p>
              <pre className="mt-3 overflow-x-auto rounded border border-border bg-elevated p-4 font-mono text-[11px] leading-relaxed text-muted">
{`"mcp": {
  "techstack-finder": {
    "type": "local",
    "command": ["node", "C:\\\\path\\\\to\\\\mcp\\\\src\\\\index.js"],
    "environment": { "TSF_API_KEY": "tsf_your_key_here" }
  }
}`}
              </pre>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
            Environment: <code className="font-mono text-xs text-fg">TSF_API_URL</code> (defaults to
            this site), <code className="font-mono text-xs text-fg">TSF_API_KEY</code> (optional, recommended for
            scans), and <code className="font-mono text-xs text-fg">TSF_TRANSPORT / TSF_PORT / TSF_HOST</code>.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
          <div className="rounded-lg border border-border bg-bg p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">How it connects</p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
              The MCP server is a standalone Node process that talks to this site&apos;s public
              <code className="mx-1 font-mono text-xs text-fg">POST /api/scan</code> and
              <code className="mx-1 font-mono text-xs text-fg">GET /api/trends</code> endpoints. It keeps no
              database, stores nothing, and never caches scans beyond the site&apos;s own in-memory TTL. Run it
              anywhere with network access — your laptop, a small VPS, or an always-on instance — and the data
              stays as fresh as the site itself.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
