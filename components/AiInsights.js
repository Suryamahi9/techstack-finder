export default function AiInsights({ insights }) {
  if (!insights || !insights.sentences || insights.sentences.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6h-8c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z" />
            <path d="M9 21h6M10 17h4" />
            <circle cx="12" cy="9" r="1" fill="currentColor" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Stack Intelligence</h3>
          <p className="text-xs text-faint">Plain-English analysis of the technology stack</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.sentences.map((sentence, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <p className="text-sm text-muted leading-relaxed">{sentence}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border bg-bg/50 p-2.5 text-center">
          <div className="font-mono text-lg font-bold text-accent">{insights.techCount}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Technologies</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 p-2.5 text-center">
          <div className="font-mono text-lg font-bold text-emerald-400">{insights.frontendCount}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Frontend</div>
        </div>
        <div className="rounded-lg border border-border bg-bg/50 p-2.5 text-center">
          <div className="font-mono text-lg font-bold text-amber-400">{insights.infraCount}</div>
          <div className="text-[10px] text-faint uppercase tracking-wider">Infra</div>
        </div>
      </div>
    </div>
  );
}
