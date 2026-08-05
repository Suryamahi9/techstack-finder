import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageHead from '../../components/PageHead';
import { BLOG_POSTS } from '../../lib/blog-posts';

export const metadata = {
  title: 'Blog — TechStack Finder',
  description:
    'Notes on website technology adoption, market trends, security audits, and building an early-warning system from stack fingerprints.',
};

export default function BlogPage() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <PageHead
          eyebrow="Resources"
          title="Blog"
          lede="Notes on website technology adoption, security, and turning public stack signals into market decisions. Every post is grounded in live engine data."
          cta={{ href: '/trends', label: 'Explore live trends' }}
          secondary={{ href: '/exportable-fields', label: 'See exportable fields' }}
        />

        <section className="mx-auto max-w-6xl px-6 pb-24 pt-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {BLOG_POSTS.map((post) => (
              <article key={post.slug} className="flex flex-col border border-border bg-bg px-6 py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {post.category} · {post.date}
                </p>
                <h2 className="mt-3 font-serif text-2xl leading-snug text-fg">
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-faint">{post.readTime} read</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent underline decoration-border-strong underline-offset-4"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
