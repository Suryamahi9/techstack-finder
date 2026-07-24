export default function JobInference({ jobInference, stackInference }) {
  const hasJob = jobInference && jobInference.inferredTechs && jobInference.inferredTechs.length > 0;
  const hasStack = stackInference && stackInference.length > 0;

  if (!hasJob && !hasStack) return null;

  const confidenceColor = {
    high: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-blue-500/10 text-blue-400',
    low: 'bg-faint/10 text-faint',
    confirmed: 'bg-accent/10 text-accent',
    inferred: 'bg-blue-500/10 text-blue-400',
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a4 4 0 00-8 0v2" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Hiring &amp; Team Signals</h3>
          <p className="text-xs text-faint">
            {hasJob
              ? `Career page found at ${jobInference.careerUrl ? new URL(jobInference.careerUrl).pathname : '/'}`
              : 'No career page found'}
            {hasStack && ` &middot; ${stackInference.length} techs inferred from stack`}
          </p>
        </div>
      </div>

      {jobInference && jobInference.careerPageFound === false && (
        <div className="mb-4 rounded-xl border border-border bg-bg/50 px-4 py-3 text-xs text-muted">
          No public career page detected. Stack-based inference below uses framework requirements and common pairings to infer likely team skills.
        </div>
      )}

      {hasJob && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">From Career Pages</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${confidenceColor[jobInference.confidence] || confidenceColor.low}`}>
              {jobInference.confidence} confidence
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {jobInference.inferredTechs.map((t, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${confidenceColor[t.confidence] || confidenceColor.inferred}`}
              >
                {t.name}
                {t.confidence === 'confirmed' && (
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {t.source === 'job postings' && (
                  <span className="text-[8px] opacity-60">via jobs</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasStack && (
        <div>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">From Tech Stack</div>
          <div className="flex flex-wrap gap-1.5">
            {stackInference.map((t, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${confidenceColor[t.confidence] || confidenceColor.inferred}`}
              >
                {t.name}
                {t.confidence === 'high' && (
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="text-[8px] opacity-60">{t.source}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
