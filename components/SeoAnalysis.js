function StatusBadge({ status, label }) {
  const colors = {
    good: 'bg-accent/15 text-accent',
    short: 'bg-amber-500/15 text-amber-300',
    long: 'bg-amber-500/15 text-amber-300',
    missing: 'bg-red-500/15 text-red-300',
    multiple: 'bg-amber-500/15 text-amber-300',
  };
  const labels = {
    good: 'Good',
    short: 'Too short',
    long: 'Too long',
    missing: 'Missing',
    multiple: 'Multiple',
  };
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] ${colors[status] || 'text-muted'}`}>
      {labels[status] || status}
    </span>
  );
}

function ScoreRing({ score, grade, gradeColor }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={gradeColor}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-mono text-lg font-bold leading-none ${gradeColor}`}>{grade}</span>
        <span className="font-mono text-[9px] text-faint">{score}</span>
      </div>
    </div>
  );
}

export default function SeoAnalysis({ seo }) {
  if (!seo) return null;

  return (
    <section className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M2 12h2M6 12h2M14 12h2M18 12h2M12 2v2M12 6v2M12 14v2M12 18v2" opacity="0.4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-faint">SEO Analysis</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-faint">Score</span>
          <ScoreRing score={seo.score} grade={seo.grade} gradeColor={seo.gradeColor} />
        </div>
      </div>

      {/* Title */}
      <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-faint">Title</span>
          <StatusBadge status={seo.title.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-muted leading-relaxed break-all">
          {seo.title.text || <span className="italic text-faint">No title tag found</span>}
        </p>
        <p className="mt-1 font-mono text-[10px] text-faint">{seo.title.length} characters</p>
      </div>

      {/* Description */}
      <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-faint">Meta Description</span>
          <StatusBadge status={seo.description.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-muted leading-relaxed break-all">
          {seo.description.text || <span className="italic text-faint">No meta description found</span>}
        </p>
        <p className="mt-1 font-mono text-[10px] text-faint">{seo.description.length} characters</p>
      </div>

      {/* Grid: Headings / Images / Links */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-bg/50 p-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-faint">Headings</span>
            <StatusBadge status={seo.headings.status} />
          </div>
          <div className="mt-1.5 flex gap-3 font-mono text-xs">
            <span>H1 <span className="text-muted">{seo.headings.h1}</span></span>
            <span>H2 <span className="text-muted">{seo.headings.h2}</span></span>
            <span>H3 <span className="text-muted">{seo.headings.h3}</span></span>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg/50 p-3">
          <span className="font-mono text-[10px] text-faint">Images</span>
          <div className="mt-1.5 font-mono text-xs">
            <span className="text-muted">{seo.images.total}</span>{' '}
            <span className="text-faint">total</span>
            {seo.images.missingAlt > 0 && (
              <>
                <span className="mx-1 text-faint">·</span>
                <span className="text-red-300">{seo.images.missingAlt}</span>{' '}
                <span className="text-faint">missing alt</span>
              </>
            )}
            {seo.images.coverage !== null && (
              <>
                <span className="mx-1 text-faint">·</span>
                <span className="text-muted">{seo.images.coverage}%</span>{' '}
                <span className="text-faint">coverage</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg/50 p-3">
          <span className="font-mono text-[10px] text-faint">Links</span>
          <div className="mt-1.5 flex gap-3 font-mono text-xs">
            <span>{seo.links.total} <span className="text-faint">total</span></span>
            <span className="text-muted">{seo.links.internal} <span className="text-faint">int</span></span>
            <span className="text-muted">{seo.links.external} <span className="text-faint">ext</span></span>
          </div>
        </div>
      </div>

      {/* Open Graph */}
      {(seo.openGraph.title || seo.openGraph.description || seo.openGraph.image) && (
        <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3">
          <span className="font-mono text-[10px] text-faint">Open Graph Preview</span>
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-bg">
            {seo.openGraph.image && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={seo.openGraph.image} alt="" className="h-40 w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            )}
            <div className="p-3">
              <p className="font-mono text-xs font-semibold text-fg">{seo.openGraph.title || seo.title.text || 'Untitled'}</p>
              {seo.openGraph.description && (
                <p className="mt-1 text-[11px] text-muted leading-relaxed line-clamp-2">{seo.openGraph.description}</p>
              )}
              {seo.openGraph.type && <p className="mt-1 font-mono text-[10px] text-faint">{seo.openGraph.type}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Structured Data */}
      {seo.structuredData && (
        <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3">
          <span className="font-mono text-[10px] text-faint">Structured Data ({seo.structuredData.length})</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {seo.structuredData.map((type) => (
              <span key={type} className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] text-muted">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resource Hints */}
      {seo.resourceHints && (
        <div className="mb-3 rounded-lg border border-border bg-bg/50 p-3">
          <span className="font-mono text-[10px] text-faint">Resource Hints</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {seo.resourceHints.map((hint) => (
              <span key={hint} className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-[10px] text-muted">
                {hint}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Canonical / Robots / Hreflang / Compression */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {seo.canonical && (
          <span className="flex items-center gap-1.5">
            <span className="text-faint">Canonical:</span>
            <span className="truncate max-w-[200px] font-mono text-[10px]">{seo.canonical}</span>
          </span>
        )}
        {seo.robots && (
          <span className="flex items-center gap-1.5">
            <span className="text-faint">Robots:</span>
            <span className="font-mono text-[10px]">{seo.robots}</span>
          </span>
        )}
        {seo.hreflangs && seo.hreflangs.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="text-faint">Hreflangs:</span>
            <span className="font-mono text-[10px]">{seo.hreflangs.join(', ')}</span>
          </span>
        )}
        {seo.compression && (
          <span className="flex items-center gap-1.5">
            <span className="text-faint">Compression:</span>
            <span className="font-mono text-[10px]">{seo.compression}</span>
          </span>
        )}
      </div>
    </section>
  );
}
