import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';

export const metadata = {
  title: 'About Us — TechStack Finder',
  description:
    'TechStack Finder builds the largest public index of website technologies — who runs what, where it is going, and what it means for your pipeline.',
};

const MILESTONES = [
  { year: '2023', event: 'First rule set: a hand-curated map of eCommerce platforms shipped as an internal prospecting tool.' },
  { year: '2024', event: 'Public scan engine launched with 270+ detection categories and confidence scoring per technology.' },
  { year: '2025', event: 'Deep scans added — CSS, JS globals, cookies, and headless-browser fallback for blocked sites.' },
  { year: '2026', event: 'API, cyber-risk audits, market-share trends, and the report filtering / CSV export suite shipped.' },
];

const STATS = [
  { label: 'Detection rules', value: '10,254' },
  { label: 'Categories', value: '270+' },
  { label: 'Detection surfaces', value: '8' },
  { label: 'Crawl cadence', value: 'Daily' },
];

export default function AboutPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="About TechStack Finder"
          lede="We believe the technology choices behind every website are public signal. Our job is to fingerprint them, index them, and turn them into decisions — faster than anyone else."
          cta={{ href: '/screencast', label: 'See how it works' }}
          secondary={{ href: '/pricing', label: 'Plans & pricing' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-2 lg:grid-cols-5">
            <div className="border border-border bg-bg px-6 py-8 lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">The problem</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Every website is built from a stack of technologies, and that stack is written into the public
                response of the site — its HTML, headers, scripts, and cookies. For years this signal was only
                usable by a handful of specialists. We rebuilt it as a product: a scan engine with 1,870
                hand-crafted rules and 8,384 generated patterns, updated daily, queryable by anyone.
              </p>
            </div>
            <div className="border border-border bg-bg px-6 py-8 lg:col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">The approach</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Deterministic fingerprints first. Every detection records the exact surface it matched so you can
                verify it. When a site blocks a plain fetch, we retry with a headless browser. When that fails,
                we tell you the report is partial. No guessed stacks, no silent gaps.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Milestones</p>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border">
            {MILESTONES.map((m) => (
              <div key={m.year} className="grid gap-2 bg-bg px-6 py-5 sm:grid-cols-[5rem_1fr]">
                <p className="font-mono text-xs text-accent">{m.year}</p>
                <p className="text-sm leading-relaxed text-muted">{m.event}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
