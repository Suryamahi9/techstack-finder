import Link from 'next/link';

// Shared shell for marketing/landing pages served by the catch-all route.
// On-brand: mono eyebrow, serif headline, muted lede, text CTA, feature grid.

export default function PageShell({
  eyebrow,
  title,
  lede,
  bullets = [],
  cta = { href: '/signup', label: 'Get started' },
  secondary = { href: '/pricing', label: 'See pricing' },
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-28 sm:pt-32">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">{lede}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href={cta.href}
          className="bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          {cta.label}
        </Link>
        <Link
          href={secondary.href}
          className="border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
        >
          {secondary.label}
        </Link>
      </div>
      {bullets.length > 0 && (
        <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {bullets.map((b) => (
            <div key={b} className="bg-bg px-6 py-8">
              <p className="text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
