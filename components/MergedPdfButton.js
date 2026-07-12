'use client';
import { useState } from 'react';

function escapeXml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TYPE_COLORS = {
  frontend: { bg: '#dbeafe', text: '#1d4ed8' },
  backend: { bg: '#d1fae5', text: '#047857' },
  infra: { bg: '#fef3c7', text: '#b45309' },
};

function buildSideHtml(data, label) {
  const total = data.summary?.total || 0;
  const fe = data.summary?.frontend || 0;
  const be = data.summary?.backend || 0;
  const inf = data.summary?.infra || 0;
  const fePct = total ? Math.round((fe / total) * 100) : 0;
  const bePct = total ? Math.round((be / total) * 100) : 0;
  const infPct = total ? Math.round((inf / total) * 100) : 0;

  const techCards = (data.categories || []).flatMap((cat) =>
    (cat.technologies || []).map((t) => {
      const tc = TYPE_COLORS[t.type] || TYPE_COLORS.frontend;
      return `<div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px 12px;page-break-inside:avoid">
        <div style="font-size:12px;font-weight:700;color:#f1f5f9;margin-bottom:4px">${escapeXml(t.name)}${t.version ? ` <span style="font-size:10px;font-weight:400;color:#64748b">v${escapeXml(t.version)}</span>` : ''}</div>
        <span style="display:inline-block;background:${tc.bg};color:${tc.text};font-size:8px;font-weight:600;text-transform:uppercase;padding:2px 6px;border-radius:3px">${t.type}</span>
      </div>`;
    })
  ).join('');

  return `
    <div style="width:48%;display:inline-block;vertical-align:top">
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:24px;border-radius:12px;color:#fff;margin-bottom:16px">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin-bottom:8px;font-weight:600">${escapeXml(label)}</div>
        <div style="font-size:18px;font-weight:800;letter-spacing:-0.5px">${escapeXml(data.site?.domain || '')}</div>
        <div style="display:flex;gap:12px;margin-top:12px;font-size:20px;font-weight:800">
          <div><span style="color:#c9fb45">${total}</span><span style="font-size:10px;color:#64748b;font-weight:400;margin-left:4px">techs</span></div>
          <div><span style="color:#3b82f6">${fePct}%</span><span style="font-size:10px;color:#64748b;font-weight:400;margin-left:4px">FE</span></div>
          <div><span style="color:#10b981">${bePct}%</span><span style="font-size:10px;color:#64748b;font-weight:400;margin-left:4px">BE</span></div>
        </div>
        <div style="display:flex;height:6px;border-radius:3px;overflow:hidden;background:#334155;margin-top:10px">
          ${fePct > 0 ? `<div style="width:${fePct}%;background:#3b82f6"></div>` : ''}
          ${bePct > 0 ? `<div style="width:${bePct}%;background:#10b981"></div>` : ''}
          ${infPct > 0 ? `<div style="width:${infPct}%;background:#f59e0b"></div>` : ''}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        ${techCards || '<div style="grid-column:1/-1;text-align:center;color:#64748b;font-size:11px;padding:16px">No technologies</div>'}
      </div>
    </div>`;
}

function buildMergedHtml(dataA, dataB) {
  const allTechsA = new Set();
  const allTechsB = new Set();
  (dataA?.categories || []).forEach((c) => c.technologies.forEach((t) => allTechsA.add(t.name.toLowerCase())));
  (dataB?.categories || []).forEach((c) => c.technologies.forEach((t) => allTechsB.add(t.name.toLowerCase())));
  const shared = [...allTechsA].filter((t) => allTechsB.has(t));
  const uniqueA = allTechsA.size - shared.length;
  const uniqueB = allTechsB.size - shared.length;
  const total = allTechsA.size + allTechsB.size - shared.length;
  const similarity = total > 0 ? Math.round((shared.length / total) * 100) : 0;

  return `
  <div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#f1f5f9;line-height:1.6;background:#0f172a">
    <div style="background:linear-gradient(135deg,#020617,#0f172a,#1e293b);padding:40px 36px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;width:150px;height:150px;border-radius:50%;background:rgba(59,130,246,0.12)"></div>
      <div style="position:relative;z-index:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <div style="width:3px;height:28px;background:#c9fb45;border-radius:2px"></div>
          <span style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600">TechStack Finder — Comparison</span>
        </div>
        <h1 style="font-size:28px;font-weight:800;letter-spacing:-1px;margin:0 0 4px">Stack Comparison</h1>
        <p style="font-size:13px;color:#cbd5e1;margin:0">${escapeXml(dataA?.site?.domain || '')} vs ${escapeXml(dataB?.site?.domain || '')}</p>
      </div>
    </div>

    <div style="padding:0 36px;margin-top:-20px;position:relative;z-index:2">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#c9fb45">${similarity}%</div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Similarity</div>
        </div>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#60a5fa">${uniqueA}</div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Unique to A</div>
        </div>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#f1f5f9">${shared.length}</div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Shared</div>
        </div>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:10px;padding:14px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#34d399">${uniqueB}</div>
          <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Unique to B</div>
        </div>
      </div>
    </div>

    <div style="padding:28px 36px;display:flex;gap:20px;justify-content:space-between">
      ${buildSideHtml(dataA, 'Site A')}
      <div style="width:4%;display:flex;align-items:center;justify-content:center">
        <div style="width:1px;height:100%;background:#334155"></div>
      </div>
      ${buildSideHtml(dataB, 'Site B')}
    </div>

    <div style="padding:24px 36px 36px">
      <div style="border-top:1px solid #334155;padding-top:16px;display:flex;justify-content:space-between;font-size:10px;color:#64748b">
        <span>TechStack Finder — Comparison Report</span>
        <span>techstack-finder.vercel.app</span>
      </div>
    </div>
  </div>`;
}

export default function MergedPdfButton({ dataA, dataB }) {
  const [generating, setGenerating] = useState(false);

  if (!dataA || !dataB) return null;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;background:#0f172a;padding:0;font-family:Segoe UI,system-ui,-apple-system,sans-serif;color:#f1f5f9;line-height:1.6;z-index:99999;';
      container.innerHTML = buildMergedHtml(dataA, dataB);
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2, useCORS: true, backgroundColor: '#0f172a', logging: false, width: 800,
      });
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfH;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfW, pdfH);
        heightLeft -= pageH;
      }

      pdf.save(`comparison-${dataA.site?.domain || 'A'}-vs-${dataB.site?.domain || 'B'}.pdf`);
    } catch (err) {
      console.error('Merged PDF failed:', err);
    }
    setGenerating(false);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-1.5 font-mono text-xs text-muted hover:border-border-strong hover:text-fg transition-colors disabled:opacity-40"
    >
      {generating ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      )}
      Comparison PDF
    </button>
  );
}
