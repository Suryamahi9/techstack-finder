export default function PartialResultsBanner({ data }) {
  if (!data || !data.partialResults) return null;

  return (
    <div className="mb-6 rounded-2xl border border-border-strong bg-tag-yellow-bg p-5 animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-strong bg-tag-yellow-bg">
          <svg className="h-4 w-4 text-tag-yellow-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4.5c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-tag-yellow-fg">Partial Results</h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            This site appears to be behind a challenge page (Cloudflare, bot protection, etc.).
            We collected partial results from whatever was accessible.
            Some detections may be incomplete or missing.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.site?.statusCode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-tag-yellow-bg px-2.5 py-0.5 text-[10px] font-mono text-tag-yellow-fg">
                HTTP {data.site.statusCode}
              </span>
            )}
            {data.summary && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-tag-yellow-bg px-2.5 py-0.5 text-[10px] font-mono text-tag-yellow-fg">
                {data.summary.total} tech{data.summary.total !== 1 ? 's' : ''} found
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-border-strong bg-tag-yellow-bg px-2.5 py-0.5 text-[10px] font-mono text-tag-yellow-fg">
              Try with a proxy or VPN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
