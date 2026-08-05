'use client';

// Client-side CSV export for a data table. Accepts headers + rows (arrays of
// strings/numbers), generates a CSV, and triggers a download.

export default function CsvDownload({ filename = 'techstack-data.csv', headers, rows, label = 'Download CSV' }) {
  const download = () => {
    const esc = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={download}
      className="shrink-0 border border-border bg-surface px-3 py-2 font-mono text-[11px] text-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      {label}
    </button>
  );
}
