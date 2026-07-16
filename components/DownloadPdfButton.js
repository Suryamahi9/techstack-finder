import { useState, useRef } from 'react';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function esc(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/[^\x20-\x7E]/g, '');
}

function safeNum(v, fallback = 0) {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
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
  const [error, setError] = useState(null);
  const [pdfTheme, setPdfTheme] = useState('dark');
  const jsPDFRef = useRef(null);

  const handleDownload = async () => {
    if (!data || generating) return;
    setGenerating(true);
    setError(null);

    try {
      if (!jsPDFRef.current) {
        const mod = await import('jspdf');
        jsPDFRef.current = mod.jsPDF;
      }
      const jsPDF = jsPDFRef.current;
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

      const sectionHeader = (title, color) => {
        color = color || ACCENT;
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

      const text = (str, x, opts) => {
        opts = opts || {};
        var size = opts.size || 10;
        var style = opts.style || 'normal';
        var color = opts.color || fg;
        var maxWidth = opts.maxWidth || CW;
        pdf.setFont('helvetica', style);
        pdf.setFontSize(size);
        pdf.setTextColor(color[0], color[1], color[2]);
        var lines = pdf.splitTextToSize(esc(str), maxWidth);
        lines.forEach(function (line) {
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

      const statCard = (val, lbl, x, w, color) => {
        color = color || fg;
        checkPage(22);
        pdf.setFillColor(card.r, card.g, card.b);
        pdf.rect(x, y, w, 20, 'F');
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.setLineWidth(0.3);
        pdf.rect(x, y, w, 20, 'S');
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
        var barH = 3;
        pdf.setFillColor(border.r, border.g, border.b);
        pdf.rect(x, y, barW, barH, 'F');
        if (pct > 0) {
          pdf.setFillColor(color.r, color.g, color.b);
          pdf.rect(x, y, Math.max(barW * (pct / 100), 3), barH, 'F');
        }
      };

      setPageBg();

      // ─── COVER ───
      for (var i = 0; i < 60; i++) {
        var t = i / 60;
        var cr = Math.round(DARK_BG.r + (DARK_CARD.r - DARK_BG.r) * t);
        var cg = Math.round(DARK_BG.g + (DARK_CARD.g - DARK_BG.g) * t);
        var cb = Math.round(DARK_BG.b + (DARK_CARD.b - DARK_BG.b) * t);
        pdf.setFillColor(cr, cg, cb);
        pdf.rect(0, i * (H / 60), W, H / 60 + 1, 'F');
      }

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
      var metaParts = [];
      if (data.site?.scannedAt) metaParts.push(formatDate(data.site.scannedAt));
      if (data.site?.statusCode) metaParts.push('HTTP ' + data.site.statusCode);
      metaParts.push((data.categories?.length || 0) + ' categories');
      metaParts.push((data.summary?.total || 0) + ' technologies');
      pdf.text(metaParts.join('  ·  '), M + 8, 104);

      // Stat cards on cover
      var total = safeNum(data.summary?.total);
      var cats = safeNum(data.summary?.categories);
      var fe = safeNum(data.summary?.frontend);
      var be = safeNum(data.summary?.backend);
      var inf = safeNum(data.summary?.infra);

      var cardW = (CW - 12) / 4;
      y = 130;
      statCard(total, 'Technologies', M, cardW, ACCENT);
      statCard(cats, 'Categories', M + cardW + 4, cardW, TYPE_COLORS.frontend);
      statCard((total ? Math.round((fe / total) * 100) : 0) + '%', 'Frontend', M + (cardW + 4) * 2, cardW, TYPE_COLORS.frontend);
      statCard((total ? Math.round(((be + inf) / total) * 100) : 0) + '%', 'Backend+Infra', M + (cardW + 4) * 3, cardW, TYPE_COLORS.backend);

      // Footer on cover
      y = H - 30;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Generated by TechStack Finder', M, y);
      pdf.text(formatDate(new Date().toISOString()), W - M, y, { align: 'right' });

      // ─── PAGE 2+: CONTENT ───
      newPage();

      // Distribution bar
      sectionHeader('Stack Distribution', ACCENT);
      var barY = y;
      var barH = 8;
      pdf.setFillColor(border.r, border.g, border.b);
      pdf.rect(M, barY, CW, barH, 'F');
      var barX = M;
      var segments = [
        { pct: total ? (fe / total) * 100 : 0, color: TYPE_COLORS.frontend },
        { pct: total ? (be / total) * 100 : 0, color: TYPE_COLORS.backend },
        { pct: total ? (inf / total) * 100 : 0, color: TYPE_COLORS.infra },
      ];
      segments.forEach(function (seg) {
        if (seg.pct > 0) {
          var sw = Math.max(CW * (seg.pct / 100), 4);
          pdf.setFillColor(seg.color.r, seg.color.g, seg.color.b);
          pdf.rect(barX, barY, sw, barH, 'F');
          barX += sw;
        }
      });
      y += 16;

      // Legend
      var legendItems = [
        { label: 'Frontend ' + (total ? Math.round((fe / total) * 100) : 0) + '% (' + fe + ')', color: TYPE_COLORS.frontend },
        { label: 'Backend ' + (total ? Math.round((be / total) * 100) : 0) + '% (' + be + ')', color: TYPE_COLORS.backend },
        { label: 'Infra ' + (total ? Math.round((inf / total) * 100) : 0) + '% (' + inf + ')', color: TYPE_COLORS.infra },
      ];
      var legendX = M;
      legendItems.forEach(function (item) {
        pdf.setFillColor(item.color.r, item.color.g, item.color.b);
        pdf.rect(legendX, y, 4, 4, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(item.label, legendX + 7, y + 3.5);
        legendX += pdf.getTextWidth(item.label) + 16;
      });
      y += 12;

      // Category breakdown
      var catStats = [];
      (data.categories || []).forEach(function (c) {
        if (c.technologies && c.technologies.length > 0) {
          catStats.push({ name: c.category, count: c.technologies.length });
        }
      });
      catStats.sort(function (a, b) { return b.count - a.count; });

      if (catStats.length > 0) {
        sectionHeader('Category Breakdown', TYPE_COLORS.frontend);
        var maxCount = catStats[0].count;
        var colW = (CW - 6) / 2;
        var colIdx = 0;

        catStats.slice(0, 16).forEach(function (cat) {
          var col = colIdx % 2;
          var cx = M + col * (colW + 6);
          checkPage(14);

          if (col === 0 && colIdx > 0) y -= 12;

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(cat.name), cx, y + 4);

          var countStr = String(cat.count);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(countStr, cx + colW - pdf.getTextWidth(countStr), y + 4);

          y += 6;
          var barPct = (cat.count / maxCount) * 100;
          confBar(barPct, cx, colW, ACCENT);
          y += 6;
          colIdx++;
        });
        y += 4;
      }

      // Technology list
      var allTechs = [];
      (data.categories || []).forEach(function (cat) {
        (cat.technologies || []).forEach(function (t) {
          var tech = {};
          for (var k in t) tech[k] = t[k];
          tech.categoryName = cat.category;
          allTechs.push(tech);
        });
      });

      if (allTechs.length > 0) {
        sectionHeader('Technology Details', TYPE_COLORS.backend);

        allTechs.forEach(function (tech) {
          checkPage(18);

          var tc = TYPE_COLORS[tech.type] || TYPE_COLORS.frontend;

          // Tech name
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(tech.name), M, y + 4);

          // Version
          if (tech.version) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
            var nameW = pdf.getTextWidth(esc(tech.name));
            pdf.text('v' + esc(tech.version), M + nameW + 3, y + 4);
          }

          // Type badge
          var badgeText = (tech.type || 'frontend').toUpperCase();
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          var badgeW = pdf.getTextWidth(badgeText) + 6;
          pdf.setFillColor(tc.r, tc.g, tc.b);
          pdf.rect(W - M - badgeW, y, badgeW, 5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text(badgeText, W - M - badgeW + 3, y + 3.8);

          y += 8;

          // Category + detection info
          var catText = esc(tech.categoryName || tech.category || '');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(catText, M, y + 3);

          if (tech.detectedVia) {
            var catW2 = pdf.getTextWidth(catText);
            pdf.text('via', M + catW2 + 4, y + 3);
            pdf.setTextColor(fg[0], fg[1], fg[2]);
            pdf.text(esc(tech.detectedVia), M + catW2 + 12, y + 3);
          }

          // Confidence bar
          var confPct = tech.confidence === 'high' ? 95 : tech.confidence === 'medium' ? 65 : 35;
          confBar(confPct, W - M - 40, 40, tc);

          y += 8;
          divider();
        });
      }

      // SEO section
      if (data.seo) {
        checkPage(50);
        sectionHeader('SEO Analysis', TYPE_COLORS.infra);

        var seo = data.seo;
        var scoreW = (CW - 8) / 3;
        var seoColor = seo.score >= 80 ? TYPE_COLORS.backend : seo.score >= 50 ? TYPE_COLORS.infra : { r: 239, g: 68, b: 68 };
        statCard(safeNum(seo.score, '—'), 'Score', M, scoreW, seoColor);
        statCard(seo.grade || '—', 'Grade', M + scoreW + 4, scoreW, seoColor);
        var h1 = seo.headings?.h1 || 0;
        var h2 = seo.headings?.h2 || 0;
        statCard('H1:' + h1 + ' H2:' + h2, 'Headings', M + (scoreW + 4) * 2, scoreW, TYPE_COLORS.frontend);
        y += 6;

        kv('Title', seo.title?.text);
        y += 2;
        kv('Description', seo.description?.text);
        y += 2;
      }

      // Performance section
      if (data.performance) {
        checkPage(40);
        sectionHeader('Performance', TYPE_COLORS.backend);

        var perf = data.performance;
        var perfItems = [
          ['HTTPS', perf.isHttps ? 'Enabled' : 'Not detected'],
          ['Compression', perf.compression],
          ['Cache Control', perf.cacheControl],
          ['HTTP Version', perf.httpVersion],
          ['Keep-Alive', perf.keepAlive],
          ['Alt-Svc', perf.altSvc],
        ].filter(function (item) { return !!item[1]; });

        var pColW = (CW - 8) / 3;
        perfItems.forEach(function (item, i) {
          var col = i % 3;
          if (col === 0 && i > 0) y += 16;
          checkPage(18);
          var px = M + col * (pColW + 4);
          label(item[0], px);
          text(item[1], px, { size: 9, maxWidth: pColW });
          y += 4;
        });
        y += 4;
      }

      // Security section
      if (data.security) {
        checkPage(40);
        sectionHeader('Security Headers', { r: 239, g: 68, b: 68 });

        var sec = data.security;
        var secItems = [
          ['Content-Security-Policy', sec.contentSecurityPolicy],
          ['Strict-Transport-Security', sec.strictTransportSecurity],
          ['X-Frame-Options', sec.xFrameOptions],
          ['X-Content-Type-Options', sec.xContentTypeOptions],
          ['Referrer-Policy', sec.referrerPolicy],
          ['Permissions-Policy', sec.permissionsPolicy],
          ['X-XSS-Protection', sec.xssProtection],
          ['CORS', sec.cors?.allowOrigin],
        ].filter(function (item) { return !!item[1]; });

        secItems.forEach(function (item) {
          checkPage(12);
          kv(item[0], item[1], M, CW);
          y += 1;
        });
      }

      // Response Headers
      if (data.responseHeaders && Object.keys(data.responseHeaders).length > 0) {
        checkPage(30);
        sectionHeader('Response Headers', { r: 139, g: 92, b: 246 });

        var rhKeys = Object.keys(data.responseHeaders).slice(0, 20);
        rhKeys.forEach(function (key) {
          checkPage(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(esc(key), M, y + 3);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          var val = data.responseHeaders[key];
          var valStr = Array.isArray(val) ? val.join(', ') : String(val);
          var valLines = pdf.splitTextToSize(esc(valStr), CW - 50);
          valLines.forEach(function (line) {
            pdf.text(line, M + 50, y + 3);
            y += 4;
          });
          y += 2;
        });
      }

      // Page Metadata
      if (data.pageMetadata) {
        checkPage(40);
        sectionHeader('Page Metadata', { r: 99, g: 102, b: 241 });

        var meta2 = data.pageMetadata;
        var metaItems = [
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
        ].filter(function (item) { return !!item[1]; });

        metaItems.forEach(function (item) {
          checkPage(12);
          kv(item[0], item[1], M, CW);
          y += 1;
        });
      }

      // Company profile
      if (data.company && data.company.name) {
        checkPage(30);
        sectionHeader('Company Profile', { r: 139, g: 92, b: 246 });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(esc(data.company.name), M, y + 5);
        y += 10;

        if (data.company.description) {
          text(data.company.description, M, { size: 9, color: fgMuted, maxWidth: CW });
          y += 4;
        }

        var coItems = [
          ['Industry', data.company.industry],
          ['Founded', data.company.foundingDate],
          ['Employees', data.company.employeeCount],
        ].filter(function (item) { return !!item[1]; });

        coItems.forEach(function (item) {
          checkPage(8);
          kv(item[0], item[1], M, CW / 3);
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
      pdf.text('Page ' + page, W - M, y + 4, { align: 'right' });
      pdf.text(formatDate(new Date().toISOString()), W - M, y + 9, { align: 'right' });

      // Save — use blob URL for reliable download after async import
      var blob = pdf.output('blob');
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (fileName.replace(/[^a-z0-9]/gi, '-') || 'report') + '-techstack-report-' + pdfTheme + '.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(err.message || 'PDF generation failed. Check the console for details.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
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
      {error && (
        <p className="max-w-xs text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
