import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TechDirectory from '../../components/TechDirectory';
import { DIRECTORY_TECHS } from '../../lib/site-directory';
import browseData from '../../lib/browse-data.json';

export const metadata = {
  title: 'eCommerce Product Lists — TechStack Finder',
  description:
    'Every online store running a specific eCommerce platform or theme, with live technology data and one-click scanning.',
};

export default function EcommercePage() {
  const storeTechs = DIRECTORY_TECHS.filter((t) =>
    ['shopify', 'magento', 'stripe', 'react', 'next', 'vue', 'svelte', 'angular'].includes(t.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Products</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
            eCommerce Product Lists
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            Every store running a specific platform, theme, or feature — updated daily from a live crawl
            of the web. Filter below, then scan any storefront to verify its exact stack.
          </p>
        </div>

        <TechDirectory
          category="E-Commerce"
          techs={storeTechs}
          hint="Pick a commerce technology, or search below."
          searchPlaceholder="Search stores (e.g. gymshark, shopify, fashion)…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Filter by platform, theme, country, and traffic band',
              'Export clean CSV or JSON with storefront metadata',
              'New stores and platform switches tracked every day',
            ].map((b) => (
              <div key={b} className="bg-bg px-6 py-8">
                <p className="text-sm leading-relaxed text-muted">{b}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {Object.keys(browseData.categories).length} technology categories in the detection engine
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
