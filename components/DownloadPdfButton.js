import { useState } from 'react';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/[^\x20-\x7E]/g, '');
}

const TYPE_COLORS = {
  frontend: { r: 59, g: 130, b: 246 },
  backend: { r: 16, g: 185, b: 129 },
  infra: { r: 245, g: 158, b: 11 },
};

const ACCENT = { r: 197, g: 251, b: 69 };
const DARK_BG = { r: 15, g: 23, b: 42 };
const DARK_CARD = { r: 30, g: 41, b: 59 };
const DARK_BORDER = { r: 51, g: 65, b: 85 };
const LIGHT_BG = { r: 255, g: 255, b: 255 };
const LIGHT_CARD = { r: 248, g: 250, b: 252 };
const LIGHT_BORDER = { r: 229, g: 231, b: 235 };

export default function DownloadPdfButton({ data, fileName = 'report' }) {
  const [generating, setGenerating] = useState(false);
  const [pdfTheme, setPdfTheme] = useState('dark');

  const handleDownload = async () => {
    if (!data || generating) return;
    setGenerating(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const M = 20;
      const CW = W - M * 2;
      const isDark = pdfTheme === 'dark';

      const bg = isDark ? DARK_BG : LIGHT_BG;
      const card = isDark ? DARK_CARD : LIGHT_CARD;
      const border = isDark ? DARK_BORDER : LIGHT_BORDER;
      const fg = isDark ? [241, 245, 249] : [17, 17, 17];
      const fgMuted = isDark ? [148, 163, 184] : [107, 114, 128];
      const fgDim = isDark ? [100, 116, 139] : [156, 163, 175];

      let y = 0;
      let page = 1;

      const setPageBg = () => {
        pdf.setFillColor(bg.r, bg.g, bg.b);
        pdf.rect(0, 0, W, H, 'F');
      };

      const newPage = () => {
        pdf.addPage();
        page++;
        setPageBg();
        y = M;
      };

      const checkPage = (needed) => {
        if (y + needed > H - M) {
          newPage();
          return true;
        }
        return false;
      };

      const sectionHeader = (title, color = ACCENT) => {
        checkPage(18);
        y += 4;
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.rect(M, y, 3, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(title, M + 8, y + 6);
        y += 14;
      };

      const divider = () => {
        checkPage(8);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.setLineWidth(0.3);
        pdf.line(M, y, W - M, y);
        y += 6;
      };

      const text = (str, x, opts = {}) => {
        const size = opts.size || 10;
        const style = opts.style || 'normal';
        const color = opts.color || fg;
        const maxWidth = opts.maxWidth || CW;
        pdf.setFont('helvetica', style);
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        const lines = pdf.splitTextToSize(esc(str), maxWidth);
        lines.forEach((line) => {
          checkPage(6);
          pdf.text(line, x, y);
          y += size * 0.4;
        });
        return lines.length;
      };

      const label = (str, x) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
        pdf.text(str.toUpperCase(), x, y);
        y += 4;
      };

      const kv = (key, val, x, maxW) => {
        checkPage(10);
        label(key, x);
        text(val || '—', x, { size: 10, color: val ? fg : fgDim, maxWidth: maxW || CW / 2 - 4 });
        y += 3;
      };

      const statCard = (val, lbl, x, w, color = fg) => {
        checkPage(22);
        pdf.setFillColor(card.r, card.g, card.b);
        pdf.roundedRect(x, y, w, 20, 2, 2, 'FD');
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.roundedRect(x, y, w, 20, 2, 2, 'S');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.text(String(val), x + w / 2, y + 10, { align: 'center' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
        pdf.text(lbl.toUpperCase(), x + w / 2, y + 16, { align: 'center' });
      };

      const confBar = (pct, x, barW, color) => {
        const barH = 3;
        pdf.setFillColor(border.r, border.g, border.b);
        pdf.roundedRect(x, y, barW, barH, 1.5, 1.5, 'F');
        if (pct > 0) {
          pdf.setFillColor(color.r, color.g, color.b);
          pdf.roundedRect(x, y, Math.max(barW * (pct / 100), 3), barH, 1.5, 1.5, 'F');
        }
      };

      setPageBg();

      // ─── COVER ───
      // Gradient background using rects
      for (let i = 0; i < 60; i++) {
        const t = i / 60;
        const r = Math.round(DARK_BG.r + (DARK_CARD.r - DARK_BG.r) * t);
        const g = Math.round(DARK_BG.g + (DARK_CARD.g - DARK_BG.g) * t);
        const b = Math.round(DARK_BG.b + (DARK_CARD.b - DARK_BG.b) * t);
        pdf.setFillColor(r, g, b);
        pdf.rect(0, i * (H / 60), W, H / 60 + 1, 'F');
      }

      // Decorative circles
      pdf.setFillColor(ACCENT.r, ACCENT.g, ACCENT.b);
      pdf.setGState(new pdf.GState({ opacity: 0.08 }));
      pdf.circle(W - 30, 40, 50, 'F');
      pdf.setGState(new pdf.GState({ opacity: 0.05 }));
      pdf.circle(40, H - 60, 40, 'F');
      pdf.setGState(new pdf.GState({ opacity: 1 }));

      // Accent bar
      pdf.setFillColor(ACCENT.r, ACCENT.g, ACCENT.b);
      pdf.rect(M, 55, 3, 16, 'F');

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(ACCENT.r, ACCENT.g, ACCENT.b);
      pdf.text('TECHSTACK FINDER', M + 8, 61);

      pdf.setFontSize(32);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Technology Report', M + 8, 80);

      // Domain
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      pdf.setTextColor(203, 213, 225);
      pdf.text(esc(data.site?.domain || 'Unknown'), M + 8, 94);

      // Meta line
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      const meta = [
        formatDate(data.site?.scannedAt),
        data.site?.statusCode ? `HTTP ${data.site.statusCode}` : null,
        `${data.categories?.length || 0} categories`,
        `${data.summary?.total || 0} technologies`,
      ].filter(Boolean).join('  ·  ');
      pdf.text(meta, M + 8, 104);

      // Stat cards on cover
      const total = data.summary?.total || 0;
      const cats = data.summary?.categories || 0;
      const fe = data.summary?.frontend || 0;
      const be = data.summary?.backend || 0;
      const inf = data.summary?.infra || 0;

      const cardW = (CW - 12) / 4;
      y = 130;
      statCard(total, 'Technologies', M, cardW, ACCENT);
      statCard(cats, 'Categories', M + cardW + 4, cardW, [59, 130, 246]);
      statCard(`${total ? Math.round((fe / total) * 100) : 0}%`, 'Frontend', M + (cardW + 4) * 2, cardW, [59, 130, 246]);
      statCard(`${total ? Math.round(((be + inf) / total) * 100) : 0}%`, 'Backend+Infra', M + (cardW + 4) * 3, cardW, [16, 185, 129]);

      // Footer on cover
      y = H - 30;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Generated by TechStack Finder  ·  techstack-finder.vercel.app', M, y);
      pdf.text(`${pdfTheme === 'dark' ? 'Dark' : 'Light'} theme  ·  ${formatDate(new Date().toISOString())}`, W - M, y, { align: 'right' });

      // ─── PAGE 2+: CONTENT ───
      newPage();

      // Distribution bar
      sectionHeader('Stack Distribution', ACCENT);
      const barY = y;
      const barH = 8;
      pdf.setFillColor(border.r, border.g, border.b);
      pdf.roundedRect(M, barY, CW, barH, 4, 4, 'F');
      let barX = M;
      const segments = [
        { pct: total ? (fe / total) * 100 : 0, color: TYPE_COLORS.frontend },
        { pct: total ? (be / total) * 100 : 0, color: TYPE_COLORS.backend },
        { pct: total ? (inf / total) * 100 : 0, color: TYPE_COLORS.infra },
      ];
      segments.forEach((seg) => {
        if (seg.pct > 0) {
          const w = Math.max(CW * (seg.pct / 100), 4);
          pdf.setFillColor(seg.color.r, seg.color.g, seg.color.b);
          pdf.roundedRect(barX, barY, w, barH, 4, 4, 'F');
          barX += w;
        }
      });
      y += 16;

      // Legend
      const legendItems = [
        { label: `Frontend ${total ? Math.round((fe / total) * 100) : 0}% (${fe})`, color: TYPE_COLORS.frontend },
        { label: `Backend ${total ? Math.round((be / total) * 100) : 0}% (${be})`, color: TYPE_COLORS.backend },
        { label: `Infra ${total ? Math.round((inf / total) * 100) : 0}% (${inf})`, color: TYPE_COLORS.infra },
      ];
      let legendX = M;
      legendItems.forEach((item) => {
        pdf.setFillColor(item.color.r, item.color.g, item.color.b);
        pdf.roundedRect(legendX, y, 4, 4, 1, 1, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(item.label, legendX + 7, y + 3.5);
        legendX += pdf.getTextWidth(item.label) + 16;
      });
      y += 12;

      // Category breakdown
      const catStats = (data.categories || [])
        .map((c) => ({ name: c.category, count: c.technologies.length }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);

      if (catStats.length > 0) {
        sectionHeader('Category Breakdown', [59, 130, 246]);
        const maxCount = catStats[0].count;
        const colW = (CW - 6) / 2;

        catStats.slice(0, 16).forEach((cat, i) => {
          const col = i % 2;
          const cx = M + col * (colW + 6);
          checkPage(14);

          if (col === 0 && i > 0) y -= 12;

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(cat.name), cx, y + 4);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(String(cat.count), cx + colW - pdf.getTextWidth(String(cat.count)), y + 4);

          y += 6;
          const barPct = (cat.count / maxCount) * 100;
          confBar(barPct, cx, colW, ACCENT);
          y += 6;
        });
        y += 4;
      }

      // Technology list
      const allTechs = (data.categories || []).flatMap((cat) =>
        (cat.technologies || []).map((t) => ({ ...t, categoryName: cat.category }))
      );

      if (allTechs.length > 0) {
        sectionHeader('Technology Details', [16, 185, 129]);

        allTechs.forEach((tech, i) => {
          checkPage(18);

          // Tech name + type badge
          const tc = TYPE_COLORS[tech.type] || TYPE_COLORS.frontend;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(tech.name), M, y + 4);

          if (tech.version) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
            pdf.text(`v${esc(tech.version)}`, M + pdf.getTextWidth(esc(tech.name)) + 3, y + 4);
          }

          // Type badge
          const badgeText = (tech.type || 'frontend').toUpperCase();
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          const badgeW = pdf.getTextWidth(badgeText) + 6;
          pdf.setFillColor(tc.r, tc.g, tc.b);
          pdf.roundedRect(W - M - badgeW, y, badgeW, 5, 1.5, 1.5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text(badgeText, W - M - badgeW + 3, y + 3.8);

          y += 8;

          // Category + confidence
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(esc(tech.categoryName || tech.category), M, y + 3);

          pdf.text('via', M + pdf.getTextWidth(esc(tech.categoryName || tech.category)) + 4, y + 3);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(tech.detectedVia), M + pdf.getTextWidth(esc(tech.categoryName || tech.category)) + 12, y + 3);

          // Confidence bar
          const confPct = tech.confidence === 'high' ? 95 : tech.confidence === 'medium' ? 65 : 35;
          confBar(confPct, W - M - 40, 40, tc);

          y += 8;
          divider();
        });
      }

      // SEO section
      const seo = data.seo;
      if (seo) {
        checkPage(60);
        sectionHeader('SEO Analysis', [245, 158, 11]);

        // Score + Grade
        const scoreW = (CW - 8) / 3;
        statCard(seo.score || '—', 'Score', M, scoreW, seo.score >= 80 ? [16, 185, 129] : seo.score >= 50 ? [245, 158, 11] : [239, 68, 68]);
        statCard(seo.grade || '—', 'Grade', M + scoreW + 4, scoreW, seo.score >= 80 ? [16, 185, 129] : seo.score >= 50 ? [245, 158, 11] : [239, 68, 68]);
        statCard(`H1:${seo.headings?.h1 || 0} H2:${seo.headings?.h2 || 0}`, 'Headings', M + (scoreW + 4) * 2, scoreW, [59, 130, 246]);
        y += 6;

        kv('Title', seo.title?.text);
        y += 2;
        kv('Description', seo.description?.text);
        y += 2;
      }

      // Performance section
      const perf = data.performance;
      if (perf) {
        checkPage(40);
        sectionHeader('Performance', [16, 185, 129]);

        const perfItems = [
          ['HTTPS', perf.isHttps ? 'Enabled' : 'Not detected'],
          ['Compression', perf.compression],
          ['Cache Control', perf.cacheControl],
          ['HTTP Version', perf.httpVersion],
          ['Keep-Alive', perf.keepAlive],
          ['Alt-Svc', perf.altSvc],
        ].filter(([, v]) => v);

        const pColW = (CW - 8) / 3;
        perfItems.forEach(([, val], i) => {
          const col = i % 3;
          if (col === 0 && i > 0) y += 16;
          checkPage(18);
          const px = M + col * (pColW + 4);
          label(perfItems[i][0], px);
          text(perfItems[i][1], px, { size: 9, maxWidth: pColW });
          y += 4;
        });
        y += 4;
      }

      // Security section
      const sec = data.security;
      if (sec) {
        checkPage(40);
        sectionHeader('Security Headers', [239, 68, 68]);

        const secItems = [
          ['Content-Security-Policy', sec.contentSecurityPolicy],
          ['Strict-Transport-Security', sec.strictTransportSecurity],
          ['X-Frame-Options', sec.xFrameOptions],
          ['X-Content-Type-Options', sec.xContentTypeOptions],
          ['Referrer-Policy', sec.referrerPolicy],
          ['Permissions-Policy', sec.permissionsPolicy],
          ['X-XSS-Protection', sec.xssProtection],
          ['CORS', sec.cors?.allowOrigin],
        ].filter(([, v]) => v);

        secItems.forEach(([, val], i) => {
          checkPage(12);
          kv(secItems[i][0], secItems[i][1], M, CW);
          y += 1;
        });
      }

      // Response Headers
      const rh = data.responseHeaders;
      if (rh && Object.keys(rh).length > 0) {
        checkPage(30);
        sectionHeader('Response Headers', [139, 92, 246]);

        Object.entries(rh).slice(0, 20).forEach(([key, val]) => {
          checkPage(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(esc(key), M, y + 3);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          const valStr = Array.isArray(val) ? val.join(', ') : String(val);
          const valLines = pdf.splitTextToSize(esc(valStr), CW - 50);
          valLines.forEach((line) => {
            pdf.text(line, M + 50, y + 3);
            y += 4;
          });
          y += 2;
        });
      }

      // Page Metadata
      const meta2 = data.pageMetadata;
      if (meta2) {
        checkPage(40);
        sectionHeader('Page Metadata', [99, 102, 241]);

        const metaItems = [
          ['Title', meta2.title],
          ['Description', meta2.description],
          ['Canonical', meta2.canonical],
          ['Robots', meta2.robots],
          ['Language', meta2.language],
          ['Author', meta2.author],
          ['OG Title', meta2.ogTitle],
          ['OG Description', meta2.ogDescription],
          ['OG Image', meta2.ogImage],
          ['Twitter Card', meta2.twitterCard],
          ['Twitter Site', meta2.twitterSite],
          ['Favicon', meta2.favicon],
          ['Manifest', meta2.manifest],
          ['Theme Color', meta2.themeColor],
        ].filter(([, v]) => v);

        metaItems.forEach(([, val], i) => {
          checkPage(12);
          kv(metaItems[i][0], metaItems[i][1], M, CW);
          y += 1;
        });
      }

      // Company profile
      const co = data.company;
      if (co?.name) {
        checkPage(30);
        sectionHeader('Company Profile', [139, 92, 246]);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(esc(co.name), M, y + 5);
        y += 10;

        if (co.description) {
          text(co.description, M, { size: 9, color: fgMuted, maxWidth: CW });
          y += 4;
        }

        const coItems = [
          ['Industry', co.industry],
          ['Founded', co.foundingDate],
          ['Employees', co.employeeCount],
        ].filter(([, v]) => v);

        coItems.forEach(([key, val]) => {
          checkPage(8);
          kv(key, val, M, CW / 3);
        });
      }

      // Final footer
      checkPage(20);
      y = H - 25;
      divider();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(fg[0], fg[1], fg[2]);
      pdf.text('TechStack Finder', M, y + 4);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
      pdf.text('Full-stack technology detection engine', M, y + 9);
      pdf.text(`Page ${page}`, W - M, y + 4, { align: 'right' });
      pdf.text(formatDate(new Date().toISOString()), W - M, y + 9, { align: 'right' });

      pdf.save(`${fileName.replace(/[^a-z0-9]/gi, '-')}-techstack-report-${pdfTheme}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
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
            Download PDF
          </>
        )}
      </button>
      <button
        onClick={() => setPdfTheme(pdfTheme === 'dark' ? 'light' : 'dark')}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-elevated px-3 py-3 text-xs text-muted hover:border-border-strong hover:text-fg transition-colors"
        title={`Switch to ${pdfTheme === 'dark' ? 'light' : 'dark'} theme PDF`}
      >
        {pdfTheme === 'dark' ? (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
}
