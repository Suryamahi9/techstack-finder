import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import ScreencastDemo from '../../components/ScreencastDemo';

export const metadata = {
  title: 'Screencast Demo — TechStack Finder',
  description:
    'Watch TechStack Finder detect the stack of any website in real time — a live screencast you can run on any URL.',
};

export default function ScreencastPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Features"
          title="Screencast Demo"
          lede="Watch the detection engine work. This screencast runs a real scan live — DNS, HTML, CSS/JS assets, and rule matching — then shows the report, ready for you to run on any URL."
          cta={{ href: '/results', label: 'Scan a site yourself' }}
          secondary={{ href: '/docs', label: 'Read the docs' }}
        />

        <section className="mx-auto max-w-6xl px-6 pt-12">
          <ScreencastDemo url="https://example.com" />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {[
              'A real live scan, not a staged animation',
              'Full detection pipeline shown step by step',
              'Type any URL to run the screencast yourself',
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
