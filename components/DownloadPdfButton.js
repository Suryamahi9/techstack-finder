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
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;background:#fff;padding:0;font-family:system-ui,-apple-system,sans-serif;color:#111;line-height:1.5;z-index:99999;';

      const techRows = (data.categories || []).flatMap((cat) =>
        (cat.technologies || []).map((t) => {
          const typeTag = t.type === 'backend' ? '⚙ Backend' : t.type === 'infra' ? '☁ Infra' : '🎨 Frontend';
          return `<tr>
            <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;color:#888;white-space:nowrap">${escapeXml(cat.category)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px;font-weight:600">${escapeXml(t.name)}${t.version ? ` <span style="color:#888;font-weight:400;font-size:11px">v${escapeXml(t.version)}</span>` : ''}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:11px;color:#888">${typeTag}</td>
          </tr>`;
        })
      ).join('');

      const seoData = data.seo;
      const perfData = data.performance;
      const secData = data.security;

      container.innerHTML = `
        <div style="padding:48px 40px 32px">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:6px">
            <div style="width:6px;height:40px;background:#111;border-radius:3px"></div>
            <div>
              <h1 style="font-size:28px;font-weight:700;letter-spacing:-0.5px;margin:0;color:#111">TechStack Report</h1>
              <p style="font-size:13px;color:#888;margin:2px 0 0">${escapeXml(data.site?.domain || '')} · ${formatDate(data.site?.scannedAt)}</p>
            </div>
          </div>
        </div>

        <div style="padding:0 40px 24px">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#111">${data.summary?.total || 0}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">Technologies</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#111">${data.summary?.categories || 0}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">Categories</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#111">${data.summary?.frontend || 0}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">Frontend</div>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;text-align:center">
              <div style="font-size:28px;font-weight:700;color:#111">${data.summary?.backend || 0}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">Backend</div>
            </div>
          </div>
        </div>

        <div style="padding:0 40px 32px">
          <div style="border:1px solid #eee;border-radius:10px;overflow:hidden">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr style="background:#f9f9f9">
                  <th style="padding:10px;font-size:11px;font-weight:600;color:#666;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Category</th>
                  <th style="padding:10px;font-size:11px;font-weight:600;color:#666;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Technology</th>
                  <th style="padding:10px;font-size:11px;font-weight:600;color:#666;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Type</th>
                </tr>
              </thead>
              <tbody>
                ${techRows || '<tr><td colspan="3" style="padding:20px;text-align:center;font-size:13px;color:#999">No technologies detected</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        ${data.company?.name ? `
        <div style="padding:0 40px 24px">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 10px;color:#111">Company</h2>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px">
            <p style="margin:0;font-size:14px;font-weight:600">${escapeXml(data.company.name)}</p>
            ${data.company.description ? `<p style="margin:4px 0 0;font-size:12px;color:#666">${escapeXml(data.company.description)}</p>` : ''}
            <div style="display:flex;flex-wrap:wrap;gap:4px 20px;margin-top:8px;font-size:11px;color:#888">
              ${data.company.industry ? `<span>Industry: ${escapeXml(data.company.industry)}</span>` : ''}
              ${data.company.foundingDate ? `<span>Founded: ${escapeXml(data.company.foundingDate)}</span>` : ''}
              ${data.company.employeeCount ? `<span>Employees: ${escapeXml(data.company.employeeCount)}</span>` : ''}
            </div>
          </div>
        </div>` : ''}

        ${seoData ? `
        <div style="padding:0 40px 24px">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 10px;color:#111">SEO Analysis</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div style="background:#f9f9f9;border-radius:8px;padding:12px">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:4px">Title</div>
              <div style="font-size:12px;color:#111">${escapeXml(seoData.title?.text) || '<span style="color:#999">Missing</span>'}</div>
            </div>
            <div style="background:#f9f9f9;border-radius:8px;padding:12px">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:4px">Description</div>
              <div style="font-size:12px;color:#111">${escapeXml(seoData.description?.text) || '<span style="color:#999">Missing</span>'}</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:10px">
            <div style="flex:1;background:#f9f9f9;border-radius:8px;padding:12px">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:4px">Score</div>
              <div style="font-size:20px;font-weight:700;color:#111">${seoData.score || 'N/A'}<span style="font-size:12px;font-weight:400;color:#888">/100</span></div>
            </div>
            <div style="flex:1;background:#f9f9f9;border-radius:8px;padding:12px">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:4px">Grade</div>
              <div style="font-size:20px;font-weight:700;color:#111">${seoData.grade || 'N/A'}</div>
            </div>
            <div style="flex:1;background:#f9f9f9;border-radius:8px;padding:12px">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:4px">Headings</div>
              <div style="font-size:12px;color:#111">H1: ${seoData.headings?.h1 || 0} · H2: ${seoData.headings?.h2 || 0} · H3: ${seoData.headings?.h3 || 0}</div>
            </div>
          </div>
        </div>` : ''}

        ${perfData ? `
        <div style="padding:0 40px 24px">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 10px;color:#111">Performance</h2>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
            ${[
              ['Compression', perfData.compression],
              ['Cache Control', perfData.cacheControl],
              ['Connection', perfData.keepAlive],
              ['HTTP Version', perfData.httpVersion],
              ['HTTPS', perfData.isHttps ? 'Enabled' : null],
              ['Alt-Svc', perfData.altSvc],
            ].filter(i => i[1]).map(([label, value]) => `
              <div style="background:#f9f9f9;border-radius:8px;padding:12px">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:2px">${escapeXml(label)}</div>
                <div style="font-size:12px;color:#111">${escapeXml(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        ${secData ? `
        <div style="padding:0 40px 24px">
          <h2 style="font-size:16px;font-weight:700;margin:0 0 10px;color:#111">Security Headers</h2>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
            ${[
              ['CSP', secData.contentSecurityPolicy],
              ['HSTS', secData.strictTransportSecurity],
              ['X-Frame-Options', secData.xFrameOptions],
              ['X-Content-Type-Options', secData.xContentTypeOptions],
              ['Referrer-Policy', secData.referrerPolicy],
              ['Permissions-Policy', secData.permissionsPolicy],
              ['X-XSS-Protection', secData.xssProtection],
              ['CORS', secData.cors?.allowOrigin],
            ].filter(i => i[1]).map(([label, value]) => `
              <div style="background:#f9f9f9;border-radius:8px;padding:12px">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:2px">${escapeXml(label)}</div>
                <div style="font-size:11px;color:#111;word-break:break-all">${escapeXml(value)}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <div style="padding:0 40px 48px">
          <div style="border-top:1px solid #eee;padding-top:16px;font-size:11px;color:#aaa;text-align:center">
            Generated by TechStack Finder · ${formatDate(new Date().toISOString())}
          </div>
        </div>
      `;

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
