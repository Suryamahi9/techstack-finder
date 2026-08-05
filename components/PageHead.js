import Link from 'next/link';

// Shared page header block used across the product/content pages.

export default function PageHead({ eyebrow, title, lede, cta, secondary }) {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 sm:pt-32">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-faint">{eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">{lede}</p>
      {(cta || secondary) && (
        <div className="mt-8 flex flex-wrap gap-3">
          {cta && (
            <Link
              href={cta.href}
              className="bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              {cta.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-border-strong hover:text-fg"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
