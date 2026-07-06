export default function PerformanceInsights({ performance }) {
  if (!performance) return null;

  const items = [
    { label: 'Compression', value: performance.compression, icon: '🗜' },
    { label: 'Cache Control', value: performance.cacheControl, icon: '⏳' },
    { label: 'Connection', value: performance.keepAlive, icon: '🔗' },
    { label: 'HTTP Version', value: performance.httpVersion, icon: '⚡' },
    { label: 'HTTPS', value: performance.isHttps ? 'Enabled (HSTS)' : null, icon: '🔒' },
    { label: 'Alt-Svc', value: performance.altSvc, icon: '🔄' },
    { label: 'Via', value: performance.via, icon: '📡' },
  ].filter((i) => i.value);

  if (items.length === 0) return null;

  return (
    <section className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-faint">Performance</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5 rounded-lg border border-border bg-bg/50 px-3 py-2.5">
            <span className="mt-0.5 shrink-0 font-mono text-[10px] text-faint">{item.icon}</span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-faint">{item.label}</div>
              <div className="mt-0.5 truncate font-mono text-xs text-muted">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
