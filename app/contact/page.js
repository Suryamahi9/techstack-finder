import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import ContactForm from '../../components/ContactForm';

export const metadata = {
  title: 'Contact Us — TechStack Finder',
  description:
    'Talk to a human about plans, data licensing, API access, or partnerships. We answer within one business day.',
};

const TOPICS = [
  { title: 'Sales', desc: 'Plans, quotas, team accounts, and the right tier for your usage.', href: '/pricing' },
  { title: 'Data licensing', desc: 'Bulk datasets, redistribution, and commercial usage of scan data.', href: '/datasets' },
  { title: 'API access', desc: 'API keys, rate limits, and building on top of the scan endpoint.', href: '/docs' },
  { title: 'Partnerships', desc: 'Affiliates, integrations, and joint market data programs.', href: '/affiliates' },
];

export default function ContactPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Contact Us"
          lede="Talk to a human about plans, data licensing, API access, or partnerships. Send the form below and we will reply within one business day."
          cta={{ href: '/docs', label: 'Check the docs first' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <ContactForm />
            </div>
            <div className="flex flex-col gap-2">
              {TOPICS.map((t) => (
                <a
                  key={t.title}
                  href={t.href}
                  className="group border border-border bg-bg px-6 py-5 transition-colors hover:border-border-strong"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">{t.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t.desc}</p>
                </a>
              ))}
              <div className="border border-border bg-bg px-6 py-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">Direct</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  <a href="mailto:support@techstackfinder.ai" className="text-fg underline decoration-border-strong underline-offset-4">
                    support@techstackfinder.ai
                  </a>{' '}
                  — for everything else.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
