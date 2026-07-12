function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(data) {
  const rows = [['Category', 'Technology', 'Version', 'Type', 'Confidence', 'Detected Via']];
  for (const cat of data.categories || []) {
    for (const t of cat.technologies || []) {
      rows.push([
        cat.category,
        t.name,
        t.version || '',
        t.type,
        t.confidence,
        t.detectedVia,
      ]);
    }
  }
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function toJson(data) {
  const report = {
    generatedAt: new Date().toISOString(),
    site: data.site,
    summary: data.summary,
    categories: data.categories,
    company: data.company,
    seo: data.seo,
    performance: data.performance,
    security: data.security,
    pageMetadata: data.pageMetadata,
    responseHeaders: data.responseHeaders,
  };
  return JSON.stringify(report, null, 2);
}

export default function ExportButtons({ data, fileName = 'report' }) {
  if (!data) return null;

  const base = (fileName || 'report').replace(/[^a-z0-9]/gi, '-');
  const date = formatDate(data.site?.scannedAt);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => downloadFile(toJson(data), `${base}-${date}.json`, 'application/json')}
        className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 font-mono text-xs text-muted hover:border-border-strong hover:text-fg transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        JSON
      </button>
      <button
        onClick={() => downloadFile(toCsv(data), `${base}-${date}.csv`, 'text/csv')}
        className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 font-mono text-xs text-muted hover:border-border-strong hover:text-fg transition-colors"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        CSV
      </button>
    </div>
  );
}
