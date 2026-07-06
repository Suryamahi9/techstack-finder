function formatBytes(bytes) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PageMetadata({ metadata }) {
  if (!metadata) return null;

  const items = [
    { label: 'Language', value: metadata.lang, icon: 'A' },
    { label: 'Charset', value: metadata.charset, icon: '#' },
    { label: 'Viewport', value: metadata.viewport, icon: '◐' },
    { label: 'Robots', value: metadata.robots, icon: '⚙' },
    { label: 'Author', value: metadata.author, icon: '✎' },
    { label: 'Theme Color', value: metadata.themeColor, icon: '◉' },
    { label: 'Content Type', value: metadata.contentType, icon: '📄' },
    { label: 'Content Size', value: formatBytes(metadata.contentLength), icon: '📦' },
  ].filter((i) => i.value);

  if (items.length === 0 && !metadata.canonical && !metadata.hreflangs) return null;

  return (
    <section className="animate-fade-up rounded-2xl border border-border bg-elevated p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-wider text-faint">Page Metadata</span>
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

      {metadata.canonical && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-border bg-bg/50 px-3 py-2.5">
          <span className="mt-0.5 shrink-0 font-mono text-[10px] text-faint">↗</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider text-faint">Canonical URL</div>
            <a href={metadata.canonical} target="_blank" rel="noreferrer" className="mt-0.5 block truncate font-mono text-xs text-muted hover:text-accent">
              {metadata.canonical}
            </a>
          </div>
        </div>
      )}

      {metadata.hreflangs && metadata.hreflangs.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-faint">Languages ({metadata.hreflangs.length})</div>
          <div className="flex flex-wrap gap-1.5">
            {metadata.hreflangs.map((h) => (
              <a
                key={h.hreflang + h.href}
                href={h.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-bg/50 px-2 py-1 font-mono text-[10px] text-muted hover:border-border-strong hover:text-accent"
              >
                {h.hreflang}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
