import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { BLOG_POSTS, getPostBySlug } from '../../../lib/blog-posts';

export const metadata = {
  title: 'Blog — TechStack Finder',
};

export default async function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  metadata.title = `${post.title} — TechStack Finder`;

  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="relative z-10">
        <article className="mx-auto max-w-3xl px-6 pb-24 pt-28 sm:pt-32">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            {post.category} · {post.date} · {post.readTime} read
          </p>
          <h1 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-tight text-fg sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-8 space-y-5 border-t border-border pt-8">
            {post.body.map((para, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-muted">
                {para}
              </p>
            ))}
          </div>
          <p className="mt-10 text-xs text-faint">
            Want to verify the claims yourself?{' '}
            <Link href="/results?site=example.com" className="text-accent underline decoration-border-strong underline-offset-4">
              Run a scan
            </Link>{' '}
            or{' '}
            <Link href="/trends" className="text-accent underline decoration-border-strong underline-offset-4">
              browse live trends
            </Link>
            .
          </p>
        </article>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Continue reading</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="border border-border bg-bg px-5 py-4 transition-colors hover:border-border-strong"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">{other.category}</p>
                <p className="mt-2 text-sm font-medium leading-snug text-fg">{other.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
