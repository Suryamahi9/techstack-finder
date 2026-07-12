export default function SiteIdentity({ site, summary, cached }) {
  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.favicon}
                alt=""
                className="h-8 w-8 rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden h-14 w-14 items-center justify-center rounded-xl border border-border bg-bg font-mono text-lg font-bold text-muted"
                style={{ position: 'absolute', inset: 0 }}
              >
                {site.domain[0]?.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {site.title}
              </h2>
              {cached && (
                <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                  Cached
                </span>
              )}
            </div>
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="group mt-0.5 inline-flex items-center gap-1 font-mono text-sm text-muted hover:text-accent"
            >
              {site.domain}
              <svg
                className="h-3 w-3 opacity-50 group-hover:opacity-100"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17 17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-bold text-accent">{summary.total}</span>
            <span className="text-sm text-muted">techs</span>
          </div>
          {summary.frontend !== undefined && (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span className="text-faint">{summary.frontend} frontend</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-faint">{summary.backend} backend</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-faint">{summary.infra} infra</span>
              </span>
            </div>
          )}
          <div className="text-xs text-faint">
            across <span className="font-mono text-muted">{summary.categories}</span> categories
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-xs text-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Scanned {new Date(site.scannedAt).toLocaleString()}
        </span>
        <span>·</span>
        <span className="font-mono">HTTP {site.statusCode}</span>
      </div>
    </div>
  );
}
