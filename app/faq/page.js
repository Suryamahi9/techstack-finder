import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import FaqAccordion from '../../components/FaqAccordion';

export const metadata = {
  title: 'FAQ — TechStack Finder',
  description:
    'Answers to the questions we get most — about detection accuracy, data freshness, API access, coverage, and plans.',
};

const FAQS = [
  {
    q: 'How does TechStack Finder detect a website’s technology stack?',
    a: 'Each scan fetches the page HTML and then runs 1,870 hand-crafted rules plus 8,384 generated regex patterns against 8 detection surfaces: HTML markup, response headers, script sources, meta generator tags, cookies, CSS content, JS globals, and network requests. When a site blocks plain fetches we fall back to a headless browser scan. Every hit records the exact pattern surface it matched, so a detection is reproducible, not guessed.',
  },
  {
    q: 'How accurate are the detections?',
    a: 'Confidence is reported per technology as high, medium, or low. High-confidence hits come from deterministic fingerprints (meta generator tags, script paths, cookies). Medium and low hits are included so you can spot signals early, and the results page always shows which surface each technology was detected via so you can audit it yourself.',
  },
  {
    q: 'How fresh is the data?',
    a: 'The detection rules ship with the product and are updated with every release. Scan results are cached in memory for 10 minutes per URL to stay fast and avoid hammering target sites. Market-share trends and the site directory are rebuilt from the live database on an ongoing crawl.',
  },
  {
    q: 'What happens when a site blocks our scan?',
    a: 'If the plain fetch is blocked (403, captcha, WAF), the scan automatically retries with a headless browser. If that also fails, the report is returned with partialResults: true so you know exactly which signals are missing — you never get a silently incomplete report.',
  },
  {
    q: 'How do I scan a site without logging in?',
    a: 'Enter any URL on the results page (e.g. /results?site=example.com) and the scan runs immediately. Free accounts get 50 scans per month; rate limits are 10 scans per minute for free, 100 for pro, and 500 for enterprise.',
  },
  {
    q: 'Can I scan sites programmatically?',
    a: 'Yes. POST a URL to /api/scan with your API key in the x-api-key header. Every response includes the full report plus a rateLimit object with your tier, remaining, and limit. API keys are created in the dashboard under API Keys.',
  },
  {
    q: 'What fields can I export?',
    a: 'Every report field is exportable — see the Exportable Fields page for the complete schema. Technology name, category, confidence, version, detectedVia, summary totals, security, SEO, and health scores all export to CSV or JSON directly from the report filtering page.',
  },
  {
    q: 'What counts against my monthly scan quota?',
    a: 'Every unique URL scanned through the API or the website counts as one scan. Cached results served within 10 minutes do not consume additional quota. Re-scanning the same URL after the cache expires counts again.',
  },
  {
    q: 'How big is the data coverage?',
    a: 'The engine ships with detection rules across 270 categories covering thousands of technologies, backed by curated data for 100 categories in the browse directory, 50 market-share trend series, and per-country coverage stats. See the Global Data Coverage page for exact numbers.',
  },
  {
    q: 'Can I track a competitor and get notified of changes?',
    a: 'Yes — monitors watch a site’s stack fingerprint and email you when the fingerprint hash changes, so you know the moment a competitor adds or drops a technology. Set up a monitor from the Monitor page under your account.',
  },
];

export default function FaqPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Frequently Asked Questions"
          lede="Straight answers about detection, accuracy, data freshness, API access, coverage, and plans. If your question is not here, contact us — we reply within one business day."
          cta={{ href: '/contact', label: 'Ask a question' }}
          secondary={{ href: '/docs', label: 'Browse the knowledge base' }}
        />

        <section className="mx-auto max-w-3xl px-6 pb-24 pt-10">
          <FaqAccordion items={FAQS} />
          <p className="mt-8 text-center text-xs text-faint">
            Still stuck? Email{' '}
            <a href="mailto:support@techstackfinder.ai" className="text-accent underline decoration-border-strong underline-offset-4">
              support@techstackfinder.ai
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
