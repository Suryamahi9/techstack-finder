import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';

export const metadata = {
  title: 'Customers — TechStack Finder',
  description:
    'Agencies, sales teams, security firms, and analysts who use TechStack Finder every day to find leads, win deals, and audit risk.',
};

const TESTIMONIALS = [
  {
    quote:
      'We went from guessing which merchants had migrated to Shopify Plus to exporting a verified list in an afternoon. Our prospecting time dropped by about 60%.',
    name: 'Head of Partnerships',
    company: 'Payment gateway startup',
    feature: 'Future Customers',
    href: '/future-customers',
  },
  {
    quote:
      'Before a discovery call I run the account through TechStack Finder and I already know their frontend framework, eCommerce platform, CDN, and which CVE issues their libraries have. It changes how the call goes.',
    name: 'Enterprise AE',
    company: 'B2B SaaS, 400+ reps',
    feature: 'Sales Intelligence',
    href: '/sales-intelligence',
  },
  {
    quote:
      'The CSV export of every detected technology per domain feeds straight into our enrichment pipeline. It is the closest thing to a raw dataset for the entire web.',
    name: 'Data Engineering Lead',
    company: 'Market research firm',
    feature: 'Datasets',
    href: '/datasets',
  },
  {
    quote:
      'We monitor our customers’ stacks and get pinged the day their CDN or hosting provider changes. That single signal has surfaced expansion conversations we would have missed.',
    name: 'Customer Success Manager',
    company: 'Managed hosting provider',
    feature: 'Report Filtering',
    href: '/report-filtering',
  },
  {
    quote:
      'The cyber-risk audit is a built-in deliverable. One click shows us HSTS, CSP, outdated libraries with CVE severities — exactly what our security review needs.',
    name: 'Technical Founder',
    company: 'Digital agency',
    feature: 'Cyber Risk Auditing',
    href: '/cyber-risk',
  },
  {
    quote:
      'I scan a competitor once, export the full stack, and cross-reference it against adoption trends. It tells me where a market is going before the quarterly reports do.',
    name: 'Product Manager',
    company: 'Developer tools company',
    feature: 'Market Analysis',
    href: '/market-analysis',
  },
];

const USE_CASES = [
  {
    title: 'Sales & lead generation',
    desc: 'Find every site running a technology your product integrates with, then export the list with contactable context.',
    action: 'Start prospecting',
    href: '/lead-generation',
  },
  {
    title: 'Agencies & web development',
    desc: 'Audit a prospect’s current stack before pitching the rebuild. Walk into the call already knowing their platform and pain points.',
    action: 'Audit a site now',
    href: '/results?site=example.com',
  },
  {
    title: 'Security & due diligence',
    desc: 'Automated cyber-risk reports covering security headers, TLS, and CVE-flagged libraries for every website you care about.',
    action: 'Run a risk audit',
    href: '/cyber-risk',
  },
  {
    title: 'Market research & data',
    desc: 'Trend series and download-ready datasets for market share, adoption curves, and technology counts across categories.',
    action: 'Browse datasets',
    href: '/datasets',
  },
];

export default function CustomersPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Customers"
          lede="Sales teams, agencies, security analysts, and data teams use TechStack Finder every day to find leads, win deals, and audit risk. Here is how they use it — and how you can too."
          cta={{ href: '/signup', label: 'Start your first scan' }}
          secondary={{ href: '/screencast', label: 'Watch the screencast' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Who uses it</p>
          <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {['Sales & growth', 'Agencies', 'Security teams', 'Market research'].map((t) => (
              <div key={t} className="bg-bg px-6 py-6">
                <p className="font-serif text-xl text-fg">{t}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">In their own words</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col justify-between border border-border bg-bg px-6 py-6">
                <div>
                  <p className="text-sm leading-relaxed text-fg">“{t.quote}”</p>
                  <div className="mt-5">
                    <p className="text-sm font-medium text-fg">{t.name}</p>
                    <p className="text-xs text-muted">{t.company}</p>
                  </div>
                </div>
                <a
                  href={t.href}
                  className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.15em] text-accent underline decoration-border-strong underline-offset-4"
                >
                  See {t.feature} →
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">How teams use it</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <div key={u.title} className="flex flex-col border border-border bg-bg px-5 py-5">
                <p className="text-sm font-medium text-fg">{u.title}</p>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted">{u.desc}</p>
                <a
                  href={u.href}
                  className="mt-5 inline-block font-mono text-[11px] uppercase tracking-[0.15em] text-accent underline decoration-border-strong underline-offset-4"
                >
                  {u.action} →
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
