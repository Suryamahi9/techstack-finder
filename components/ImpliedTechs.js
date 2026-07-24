export default function ImpliedTechs({ implied }) {
  if (!implied || implied.length === 0) return null;

  const confidenceColors = {
    high: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    medium: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    low: { bg: 'bg-faint/10', text: 'text-faint', border: 'border-faint/20' },
  };

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Implied Technologies</h3>
          <p className="text-xs text-faint">Inferred from detected stack — not directly visible in source</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {implied.map((tech, i) => {
          const c = confidenceColors[tech.confidence] || confidenceColors.low;
          return (
            <div
              key={i}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${c.bg} ${c.border}`}
            >
              <span className={`text-xs font-medium ${c.text}`}>{tech.name}</span>
              <span className="text-[10px] text-faint">
                via {tech.inferredFrom}
              </span>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${c.bg} ${c.text} border ${c.border}`}>
                {tech.confidence === 'high' ? 'H' : tech.confidence === 'medium' ? 'M' : 'L'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
