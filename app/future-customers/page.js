import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import TechDirectory from '../../components/TechDirectory';
import { getMarketShareTrends } from '../../lib/market-share';
import { SITE_DIRECTORY } from '../../lib/site-directory';

export const metadata = {
  title: 'Future Customers — TechStack Finder',
  description:
    'Accounts that are about to switch, adopt, or scale — surfaced from live adoption and churn data.',
};

export default function FutureCustomersPage() {
  const trends = getMarketShareTrends(40);
  const rising = trends.filter((t) => t.trend === 'growing');
  const signals = [
    { label: 'Adoption events', value: rising.length, note: 'technologies growing month over month' },
    { label: 'Sites indexed', value: SITE_DIRECTORY.length, note: 'curated accounts ready to scan' },
    { label: 'Detection rules', value: '1,870+', note: 'hand-crafted patterns in the engine' },
  ];

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Future Customers"
          lede="Stop prospecting the same tired lists. Future Customers surfaces accounts that are about to switch, adopt, or scale — the people who need you right now."
          cta={{ href: '/lead-generation', label: 'Start prospecting' }}
          secondary={{ href: '/pricing', label: 'See pricing' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {signals.map((s) => (
              <div key={s.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{s.label}</p>
                <p className="mt-3 font-serif text-3xl text-fg">{s.value}</p>
                <p className="mt-1 text-sm text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <TechDirectory
          techs={rising.slice(0, 12).map((t) => t.name)}
          hint="Trigger-based prospecting — accounts running technologies on the move."
          searchPlaceholder="Search future customers…"
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'Trigger-based alerts for adoption and switches',
              'Accounts scoring by fit and intent',
              'Build-a-list in seconds and export to your pipeline',
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
