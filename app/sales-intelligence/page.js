import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import TechDirectory from '../../components/TechDirectory';
import { SITE_DIRECTORY } from '../../lib/site-directory';
import { getMarketShareTrends } from '../../lib/market-share';

export const metadata = {
  title: 'Sales Intelligence — TechStack Finder',
  description:
    'Enrich accounts with the technology they run: platforms, frameworks, analytics, hosting, and security — the context that wins deals.',
};

export default function SalesIntelligencePage() {
  const topStack = getMarketShareTrends(8).map((t) => t.name);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Sales Intelligence"
          lede="Enrich any account with the technology it runs — platform, frameworks, analytics, hosting, security. Walk into every conversation knowing what the prospect built with and why it matters."
          cta={{ href: '/results?site=example.com', label: 'Scan a prospect now' }}
          secondary={{ href: '/ecommerce', label: 'Browse store lists' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Accounts enriched', value: SITE_DIRECTORY.length, note: 'curated and ready to scan' },
              { label: 'Stack signals', value: '270+', note: 'technology categories' },
              { label: 'Top technologies', value: topStack.slice(0, 3).join(' · '), note: 'by market share today' },
            ].map((s) => (
              <div key={s.label} className="border border-border bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-2xl text-fg">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <TechDirectory
          techs={topStack}
          hint="Every account below carries its stack as enrichment fields — scan to verify."
          searchPlaceholder="Search accounts to enrich…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Two-way sync for accounts and custom fields',
              'Automated list-to-CRM workflows',
              'Webhooks for anything your sales stack connects to',
            ].map((b) => (
              <div key={b} className="bg-bg px-6 py-8">
                <p className="text-sm leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
