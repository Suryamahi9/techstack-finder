import { useState } from 'react';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeXml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const TYPE_COLORS = {
  frontend: { bg: '#dbeafe', text: '#1d4ed8', bar: '#3b82f6' },
  backend: { bg: '#d1fae5', text: '#047857', bar: '#10b981' },
  infra: { bg: '#fef3c7', text: '#b45309', bar: '#f59e0b' },
};

const CAT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48', '#84cc16',
];

function buildPdfHtml(data) {
  const total = data.summary?.total || 0;
  const fe = data.summary?.frontend || 0;
  const be = data.summary?.backend || 0;
  const inf = data.summary?.infra || 0;
  const cats = data.summary?.categories || 0;
  const fePct = total ? Math.round((fe / total) * 100) : 0;
  const bePct = total ? Math.round((be / total) * 100) : 0;
  const infPct = total ? Math.round((inf / total) * 100) : 0;

  const catStats = (data.categories || [])
    .map((c) => ({ name: c.category, count: c.technologies.length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCatCount = catStats.length > 0 ? catStats[0].count : 1;

  const techCards = (data.categories || []).flatMap((cat) =>
    (cat.technologies || []).map((t) => {
      const tc = TYPE_COLORS[t.type] || TYPE_COLORS.frontend;
      return `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;page-break-inside:avoid">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div style="font-size:14px;font-weight:700;color:#111">${escapeXml(t.name)}${t.version ? ` <span style="font-size:11px;font-weight:400;color:#9ca3af">v${escapeXml(t.version)}</span>` : ''}</div>
            <span style="display:inline-block;background:${tc.bg};color:${tc.text};font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;padding:3px 8px;border-radius:4px">${t.type}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#6b7280">
            <span style="background:#f3f4f6;padding:2px 6px;border-radius:3px;font-weight:500">${escapeXml(cat.category)}</span>
            <span style="color:#9ca3af">via</span>
            <span style="color:#374151">${escapeXml(t.detectedVia)}</span>
          </div>
        </div>`;
    })
  ).join('');

  const seoData = data.seo;
  const perfData = data.performance;
  const secData = data.security;

  return `
  <div style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#111;line-height:1.6;-webkit-font-smoothing:antialiased">

    <!-- COVER SECTION -->
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#334155 100%);padding:56px 48px 48px;color:#fff;position:relative;overflow:hidden">
      <div style="position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:rgba(59,130,246,0.15)"></div>
      <div style="position:absolute;bottom:-60px;left:30%;width:160px;height:160px;border-radius:50%;background:rgba(16,185,129,0.1)"></div>
      <div style="position:relative;z-index:1">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
          <div style="width:4px;height:36px;background:#3b82f6;border-radius:2px"></div>
          <span style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;font-weight:600">TechStack Finder</span>
        </div>
        <h1 style="font-size:36px;font-weight:800;letter-spacing:-1px;margin:0 0 6px;line-height:1.1">Technology Report</h1>
        <p style="font-size:16px;color:#cbd5e1;margin:0 0 4px;font-weight:500">${escapeXml(data.site?.domain || '')}</p>
        <p style="font-size:12px;color:#64748b;margin:0">${formatDate(data.site?.scannedAt)} &middot; HTTP ${data.site?.statusCode || '—'}</p>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div style="padding:0 48px;margin-top:-24px;position:relative;z-index:2">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <div style="font-size:32px;font-weight:800;color:#111">${total}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Technologies</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <div style="font-size:32px;font-weight:800;color:#111">${cats}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Categories</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <div style="font-size:32px;font-weight:800;color:#3b82f6">${fePct}%</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Frontend</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
          <div style="font-size:32px;font-weight:800;color:#10b981">${bePct + infPct}%</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Backend + Infra</div>
        </div>
      </div>
    </div>

    <!-- DISTRIBUTION BAR -->
    <div style="padding:28px 48px 0">
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;margin-bottom:12px">Stack Distribution</div>
        <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;background:#e5e7eb">
          ${fePct > 0 ? `<div style="width:${fePct}%;background:#3b82f6"></div>` : ''}
          ${bePct > 0 ? `<div style="width:${bePct}%;background:#10b981"></div>` : ''}
          ${infPct > 0 ? `<div style="width:${infPct}%;background:#f59e0b"></div>` : ''}
        </div>
        <div style="display:flex;gap:20px;margin-top:10px">
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151"><span style="width:10px;height:10px;border-radius:3px;background:#3b82f6"></span> Frontend ${fePct}% (${fe})</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151"><span style="width:10px;height:10px;border-radius:3px;background:#10b981"></span> Backend ${bePct}% (${be})</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151"><span style="width:10px;height:10px;border-radius:3px;background:#f59e0b"></span> Infra ${infPct}% (${inf})</div>
        </div>
      </div>
    </div>

    <!-- CATEGORY BREAKDOWN -->
    ${catStats.length > 0 ? `
    <div style="padding:24px 48px 0">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 14px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#3b82f6;border-radius:2px;display:inline-block"></span>
        Category Breakdown
      </h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${catStats.slice(0, 12).map((c, i) => {
          const pct = Math.round((c.count / total) * 100);
          const color = CAT_COLORS[i % CAT_COLORS.length];
          return `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-radius:8px;border:1px solid #f1f5f9">
              <div style="width:10px;height:10px;border-radius:3px;background:${color};flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
                  <span style="font-size:12px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeXml(c.name)}</span>
                  <span style="font-size:11px;color:#6b7280;font-weight:600;margin-left:8px;flex-shrink:0">${c.count}</span>
                </div>
                <div style="height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>` : ''}

    <!-- TECH GRID -->
    <div style="padding:28px 48px 0">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 14px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#10b981;border-radius:2px;display:inline-block"></span>
        All Technologies
      </h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        ${techCards || '<div style="grid-column:1/-1;text-align:center;padding:24px;color:#9ca3af;font-size:13px">No technologies detected</div>'}
      </div>
    </div>

    <!-- COMPANY -->
    ${data.company?.name ? `
    <div style="padding:28px 48px 0;page-break-inside:avoid">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#8b5cf6;border-radius:2px;display:inline-block"></span>
        Company Profile
      </h2>
      <div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e5e7eb;border-radius:12px;padding:24px">
        <div style="display:flex;align-items:flex-start;gap:16px">
          ${data.company.logo ? `<img src="${escapeXml(data.company.logo)}" style="width:56px;height:56px;border-radius:12px;border:1px solid #e5e7eb;object-fit:contain;background:#fff;padding:4px" onerror="this.style.display='none'" />` : ''}
          <div style="flex:1">
            <div style="font-size:18px;font-weight:700;color:#111;margin-bottom:4px">${escapeXml(data.company.name)}</div>
            ${data.company.description ? `<div style="font-size:12px;color:#6b7280;margin-bottom:10px;line-height:1.5">${escapeXml(data.company.description)}</div>` : ''}
            <div style="display:flex;flex-wrap:wrap;gap:6px 18px;font-size:11px;color:#6b7280">
              ${data.company.industry ? `<span><span style="color:#94a3b8">Industry:</span> ${escapeXml(data.company.industry)}</span>` : ''}
              ${data.company.foundingDate ? `<span><span style="color:#94a3b8">Founded:</span> ${escapeXml(data.company.foundingDate)}</span>` : ''}
              ${data.company.employeeCount ? `<span><span style="color:#94a3b8">Employees:</span> ${escapeXml(data.company.employeeCount)}</span>` : ''}
            </div>
          </div>
          <div style="text-align:center;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 18px;flex-shrink:0">
            <div style="font-size:28px;font-weight:800;color:#3b82f6">${total}</div>
            <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">techs</div>
          </div>
        </div>
      </div>
    </div>` : ''}

    <!-- SEO -->
    ${seoData ? `
    <div style="padding:28px 48px 0;page-break-inside:avoid">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#f59e0b;border-radius:2px;display:inline-block"></span>
        SEO Analysis
      </h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:#111">${seoData.score || '—'}<span style="font-size:14px;font-weight:400;color:#9ca3af">/100</span></div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-top:2px;font-weight:600">Score</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:${seoData.score >= 80 ? '#10b981' : seoData.score >= 50 ? '#f59e0b' : '#ef4444'}">${seoData.grade || '—'}</div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-top:2px;font-weight:600">Grade</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;text-align:center">
          <div style="font-size:14px;font-weight:700;color:#111">H1: ${seoData.headings?.h1 || 0} · H2: ${seoData.headings?.h2 || 0}</div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-top:2px;font-weight:600">Headings</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:12px">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600;margin-bottom:4px">Title</div>
          <div style="font-size:12px;color:#374151;word-break:break-word">${escapeXml(seoData.title?.text) || '<span style="color:#d1d5db">Missing</span>'}</div>
        </div>
        <div style="background:#f8fafc;border:1px solid #f1f5f9;border-radius:8px;padding:12px">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600;margin-bottom:4px">Description</div>
          <div style="font-size:12px;color:#374151;word-break:break-word">${escapeXml(seoData.description?.text) || '<span style="color:#d1d5db">Missing</span>'}</div>
        </div>
      </div>
    </div>` : ''}

    <!-- PERFORMANCE -->
    ${perfData ? `
    <div style="padding:28px 48px 0;page-break-inside:avoid">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#10b981;border-radius:2px;display:inline-block"></span>
        Performance
      </h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${[
          ['HTTPS', perfData.isHttps ? '✓ Enabled' : null, perfData.isHttps ? '#10b981' : null],
          ['Compression', perfData.compression],
          ['Cache Control', perfData.cacheControl],
          ['HTTP Version', perfData.httpVersion],
          ['Keep-Alive', perfData.keepAlive],
          ['Alt-Svc', perfData.altSvc],
        ].filter(i => i[1]).map(([label, value, color]) => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600;margin-bottom:4px">${escapeXml(label)}</div>
            <div style="font-size:13px;font-weight:600;color:${color || '#111'}">${escapeXml(value)}</div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- SECURITY -->
    ${secData ? `
    <div style="padding:28px 48px 0;page-break-inside:avoid">
      <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#111;display:flex;align-items:center;gap:8px">
        <span style="width:3px;height:18px;background:#ef4444;border-radius:2px;display:inline-block"></span>
        Security Headers
      </h2>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
        ${[
          ['Content-Security-Policy', secData.contentSecurityPolicy],
          ['Strict-Transport-Security', secData.strictTransportSecurity],
          ['X-Frame-Options', secData.xFrameOptions],
          ['X-Content-Type-Options', secData.xContentTypeOptions],
          ['Referrer-Policy', secData.referrerPolicy],
          ['Permissions-Policy', secData.permissionsPolicy],
          ['X-XSS-Protection', secData.xssProtection],
          ['CORS', secData.cors?.allowOrigin],
        ].filter(i => i[1]).map(([label, value]) => `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#94a3b8;font-weight:600;margin-bottom:4px">${escapeXml(label)}</div>
            <div style="font-size:11px;color:#374151;word-break:break-all;font-weight:500">${escapeXml(value)}</div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- FOOTER -->
    <div style="padding:40px 48px 48px;margin-top:32px">
      <div style="border-top:1px solid #e5e7eb;padding-top:20px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;font-weight:700;color:#111">TechStack Finder</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:2px">Full-stack technology detection engine</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:#94a3b8">Generated ${formatDate(new Date().toISOString())}</div>
          <div style="font-size:10px;color:#cbd5e1;margin-top:2px">techstack-finder.vercel.app</div>
        </div>
      </div>
    </div>

  </div>`;
}

export default function DownloadPdfButton({ data, fileName = 'report' }) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (!data || generating) return;
    setGenerating(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;background:#fff;padding:0;font-family:Segoe UI,system-ui,-apple-system,sans-serif;color:#111;line-height:1.6;z-index:99999;';

      container.innerHTML = buildPdfHtml(data);

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
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

      pdf.save(`${fileName.replace(/[^a-z0-9]/gi, '-')}-techstack-report.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating || !data}
      className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-6 py-3 font-mono text-sm font-semibold text-accent hover:bg-accent/20 hover:border-accent/50 transition-all duration-300 disabled:opacity-40"
    >
      {generating ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
          Generating PDF…
        </>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF Report
        </>
      )}
    </button>
  );
}
