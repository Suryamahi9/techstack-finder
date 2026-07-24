export default function AiBuilderBadge({ builders }) {
  if (!builders || builders.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10">
          <svg className="h-4 w-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-violet-300">AI Site Builder Detected</h3>
          <p className="text-xs text-violet-200/60">This site was generated using an AI coding tool</p>
        </div>
      </div>

      <div className="space-y-2">
        {builders.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-sm font-bold text-violet-300">
              {b.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-violet-200">{b.name}</span>
                <span className="text-[10px] text-violet-300/50">by {b.vendor}</span>
              </div>
              <p className="text-[11px] text-violet-200/60 truncate">{b.description}</p>
            </div>
            <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
              b.confidence === 'high'
                ? 'bg-violet-500/20 text-violet-300'
                : 'bg-violet-500/10 text-violet-400/60'
            }`}>
              {b.confidence === 'high' ? 'DETECTED' : 'INFERRED'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
