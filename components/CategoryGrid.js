'use client';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'Analytics', count: 113, icon: 'M3 3v18h18M7 16l4-8 4 4 4-10' },
  { name: 'JavaScript Library', count: 99, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'E-Commerce', count: 83, icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
  { name: 'CMS', count: 75, icon: 'M4 4h16v16H4V4zm4 4h8M8 12h8M8 16h4' },
  { name: 'Payment Processor', count: 65, icon: 'M1 1h22v18H1zM1 9h22' },
  { name: 'CSS Framework', count: 53, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'Database', count: 50, icon: 'M12 2C6.48 2 2 4.48 2 7v10c0 2.52 4.48 5 10 5s10-2.48 10-5V7c0-2.52-4.48-5-10-5zM2 12c0 2.52 4.48 5 10 5s10-2.48 10-5' },
  { name: 'CDN / Hosting', count: 50, icon: 'M12 2L2 7v10l10 5 10-5V7L12 2z' },
  { name: 'Monitoring', count: 47, icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { name: 'Frontend Framework', count: 45, icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { name: 'Authentication', count: 40, icon: 'M12 2a5 5 0 00-5 5v3H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2h-2V7a5 5 0 00-5-5zm-3 8V7a3 3 0 016 0v3H9z' },
  { name: 'Backend Framework', count: 38, icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
];

export default function CategoryGrid() {
  return (
    <section>
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-faint backdrop-blur-sm">
          Coverage
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What we <span className="text-accent">detect</span>
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          2,300+ rules across 92 categories. From frontend frameworks to infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={`/rules?category=${encodeURIComponent(cat.name)}`}
            className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3 transition-all duration-300 hover:border-accent/15 hover:bg-accent/[0.03]"
          >
            <svg
              className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={cat.icon} />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-fg/80 transition-colors group-hover:text-fg">
                {cat.name}
              </div>
              <div className="font-mono text-[10px] text-faint">
                {cat.count} rules
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/rules"
          className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-accent"
        >
          View all 92 categories
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
