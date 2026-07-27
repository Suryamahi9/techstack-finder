'use client';

export default function StackFingerprint({ fingerprint }) {
  if (!fingerprint) return null;

  const { dna, barcodes, uniqueId, techCount, dominantType } = fingerprint;

  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-bg">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2z" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Stack DNA Fingerprint</h3>
          <p className="text-xs text-faint">Unique identifier for this tech stack</p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 p-4 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-faint mb-1">Fingerprint ID</div>
        <div className="font-mono text-lg font-bold text-accent tracking-widest">#{uniqueId}</div>
        <div className="text-[10px] text-faint mt-1">{techCount} technologies</div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">DNA Sequence</div>
        <div className="font-mono text-[10px] text-muted break-all leading-relaxed bg-bg/50 rounded-lg p-3 border border-border">
          {dna.split('').map((c, i) => (
            <span key={i} className={
              c === 'A' ? 'text-emerald-400' :
              c === 'T' ? 'text-blue-400' :
              c === 'G' ? 'text-yellow-400' :
              'text-red-400'
            }>{c}</span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-faint">Visual Barcode</div>
        <div className="flex items-end gap-px h-12 bg-bg/50 rounded-lg p-3 border border-border">
          {barcodes.map((bar, i) => (
            <div key={i} className="flex-1 rounded-sm transition-all" style={{
              height: `${bar.height * 100}%`,
              backgroundColor: bar.color,
              opacity: bar.opacity,
              minWidth: '2px',
            }} title={bar.name} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">Stack Composition</div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(dominantType).map(([type, count]) => (
            <span key={type} className="inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-1 text-[10px] font-medium text-muted">
              {type}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
