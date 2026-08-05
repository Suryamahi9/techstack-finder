import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import AffiliateSignup from '../../components/AffiliateSignup';

export const metadata = {
  title: 'Affiliates — TechStack Finder',
  description:
    'Earn recurring commissions by recommending TechStack Finder to your audience. Apply in minutes, get paid per subscription.',
};

const TERMS = [
  { label: 'Commission', value: '25% of the first year, 10% recurring' },
  { label: 'Payout', value: 'Monthly via PayPal / bank transfer' },
  { label: 'Cookie window', value: '90 days' },
  { label: 'Minimum payout', value: '$50' },
];

export default function AffiliatesPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Affiliate Program"
          lede="Earn recurring commissions by recommending TechStack Finder to founders, marketers, and developers who need to know exactly what a website is built with."
          cta={{ href: '/contact', label: 'Questions? Contact us' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {TERMS.map((t) => (
              <div key={t.label} className="bg-bg px-6 py-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{t.label}</p>
                <p className="mt-3 font-serif text-lg leading-snug text-fg">{t.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <AffiliateSignup />
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  title: 'Who fits',
                  desc: 'Bloggers, YouTubers, newsletter writers, and tool directories with an audience of founders, eCommerce operators, marketers, or web developers.',
                },
                {
                  title: 'How it works',
                  desc: 'We give you a unique referral link. When someone signs up through it and stays on a paid plan, you earn the commission above. Tracking is automatic, payouts are monthly.',
                },
                {
                  title: 'Good content ideas',
                  desc: 'Tech stack teardowns, "what runs this site" case studies, migration-watch posts, and stack comparison videos all convert well with TechStack Finder.',
                },
              ].map((b) => (
                <div key={b.title} className="border border-border bg-bg px-6 py-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">{b.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
