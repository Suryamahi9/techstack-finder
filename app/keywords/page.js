import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TechDirectory from '../../components/TechDirectory';

export const metadata = {
  title: 'Keyword Lists — TechStack Finder',
  description:
    'Build lists of sites by keyword, enrich them with the technologies they run, and export them for outreach.',
};

const KEYWORD_CHIPS = ['Shopify', 'WordPress', 'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Magento', 'Stripe', 'Cloudflare'];

export default function KeywordsPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Products</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            Keyword Lists
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Build lists of sites that match the keywords, categories, and technologies that matter to your
            business — then enrich each one with the stack it runs and export for CRM and outreach.
          </p>
        </div>

        <TechDirectory
          techs={KEYWORD_CHIPS}
          hint="Type a keyword, pick a technology chip, or both."
          searchPlaceholder="Search by keyword, tech, or site (e.g. payments, magazine, shopify)…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Search sites by keyword or phrase across the directory',
              'Combine keyword matches with technology usage filters',
              'One-click CSV export for CRM and outreach tools',
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
