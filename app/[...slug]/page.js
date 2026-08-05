import { notFound } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { MARKETING_PAGES } from '@/lib/marketing-pages';

// Catch-all marketing pages. Static routes (e.g. /pricing, /docs) win first;
// anything left over resolves against MARKETING_PAGES, everything else 404s.

export default function MarketingPage({ params }) {
  const slug = params.slug.join('/');
  const page = MARKETING_PAGES[slug];
  if (!page) notFound();
  return <PageShell {...page} />;
}
