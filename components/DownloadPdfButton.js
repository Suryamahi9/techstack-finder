import { useState, useRef } from 'react';

function formatDate(iso) {
  if (!iso) return '';
  try {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[^\x20-\x7E]/g, '');
}

function safeNum(v) {
  return typeof v === 'number' && isFinite(v) ? v : 0;
}

function fin(n) {
  var v = Number(n);
  return isFinite(v) ? v : 0;
}

var TYPE_COLORS = {
  frontend: { r: 59, g: 130, b: 246 },
  backend: { r: 16, g: 185, b: 129 },
  infra: { r: 245, g: 158, b: 11 },
};

var ACCENT = { r: 197, g: 251, b: 69 };
var DARK_BG = { r: 15, g: 23, b: 42 };
var DARK_CARD = { r: 30, g: 41, b: 59 };
var DARK_BORDER = { r: 51, g: 65, b: 85 };
var LIGHT_BG = { r: 255, g: 255, b: 255 };
var LIGHT_CARD = { r: 248, g: 250, b: 252 };
var LIGHT_BORDER = { r: 229, g: 231, b: 235 };

function centerText(pdf, str, centerX, y, size) {
  pdf.setFontSize(size);
  var w = pdf.getTextWidth(str);
  var x = fin(centerX - w / 2);
  pdf.text(str, x, fin(y));
}

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
        var mod = await import('jspdf');
        jsPDFRef.current = mod.jsPDF;
      }
      var jsPDF = jsPDFRef.current;
      var pdf = new jsPDF('p', 'mm', 'a4');
      var W = pdf.internal.pageSize.getWidth();
      var H = pdf.internal.pageSize.getHeight();
      var M = 20;
      var CW = W - M * 2;
      var isDark = pdfTheme === 'dark';

      var bg = isDark ? DARK_BG : LIGHT_BG;
      var card = isDark ? DARK_CARD : LIGHT_CARD;
      var border = isDark ? DARK_BORDER : LIGHT_BORDER;
      var fg = isDark ? [241, 245, 249] : [17, 17, 17];
      var fgMuted = isDark ? [148, 163, 184] : [107, 114, 128];
      var fgDim = isDark ? [100, 116, 139] : [156, 163, 175];

      var y = 0;
      var pageNum = 1;

      function setPageBg() {
        pdf.setFillColor(bg.r, bg.g, bg.b);
        pdf.rect(0, 0, W, H, 'F');
      }

      function newPage() {
        pdf.addPage();
        pageNum++;
        setPageBg();
        y = M;
      }

      function checkPage(needed) {
        if (y + needed > H - M) { newPage(); return true; }
        return false;
      }

      function secHeader(title, color) {
        color = color || ACCENT;
        checkPage(18);
        y = fin(y + 4);
        pdf.setFillColor(color.r, color.g, color.b);
        pdf.rect(M, y, 3, 8, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(13);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(title, M + 8, fin(y + 6));
        y = fin(y + 14);
      }

      function hline() {
        checkPage(8);
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.setLineWidth(0.3);
        pdf.line(M, y, W - M, y);
        y = fin(y + 6);
      }

      function txt(str, x, opts) {
        opts = opts || {};
        var sz = opts.size || 10;
        var st = opts.style || 'normal';
        var clr = opts.color || fg;
        var mw = opts.maxWidth || CW;
        pdf.setFont('helvetica', st);
        pdf.setFontSize(sz);
        pdf.setTextColor(clr[0], clr[1], clr[2]);
        var s = esc(str);
        if (s) {
          var lines = pdf.splitTextToSize(s, fin(mw));
          for (var li = 0; li < lines.length; li++) {
            checkPage(6);
            pdf.text(lines[li], fin(x), fin(y));
            y = fin(y + sz * 0.4);
          }
        }
      }

      function lbl(str, x) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
        pdf.text(str.toUpperCase(), fin(x), fin(y));
        y = fin(y + 4);
      }

      function kv(key, val, x) {
        checkPage(10);
        lbl(key, x);
        txt(val || '-', x, { size: 10, color: val ? fg : fgDim });
        y = fin(y + 3);
      }

      function statCard(val, lblStr, x, w, color) {
        color = color || fg;
        checkPage(22);
        pdf.setFillColor(card.r, card.g, card.b);
        pdf.rect(fin(x), fin(y), fin(w), 20, 'F');
        pdf.setDrawColor(border.r, border.g, border.b);
        pdf.setLineWidth(0.3);
        pdf.rect(fin(x), fin(y), fin(w), 20, 'S');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.setTextColor(color[0], color[1], color[2]);
        centerText(pdf, String(val), fin(x + w / 2), fin(y + 10), 18);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
        centerText(pdf, lblStr.toUpperCase(), fin(x + w / 2), fin(y + 16), 7);
      }

      function confBar(pct, x, barW, color) {
        var barH = 3;
        pdf.setFillColor(border.r, border.g, border.b);
        pdf.rect(fin(x), fin(y), fin(barW), barH, 'F');
        if (pct > 0) {
          pdf.setFillColor(color.r, color.g, color.b);
          pdf.rect(fin(x), fin(y), fin(Math.max(barW * (pct / 100), 3)), barH, 'F');
        }
      }

      setPageBg();

      // ══════ COVER ══════
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
      var fe = safeNum(data.summary?.frontend);
      var be = safeNum(data.summary?.backend);
      var inf = safeNum(data.summary?.infra);

      var cardW = (CW - 12) / 4;
      y = 130;
      statCard(total, 'Technologies', M, cardW, ACCENT);
      statCard(safeNum(data.summary?.categories), 'Categories', M + cardW + 4, cardW, TYPE_COLORS.frontend);
      statCard((total ? Math.round((fe / total) * 100) : 0) + '%', 'Frontend', M + (cardW + 4) * 2, cardW, TYPE_COLORS.frontend);
      statCard((total ? Math.round(((be + inf) / total) * 100) : 0) + '%', 'Backend+Infra', M + (cardW + 4) * 3, cardW, TYPE_COLORS.backend);

      // Footer on cover
      y = H - 30;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Generated by TechStack Finder', M, y);
      pdf.text(formatDate(new Date().toISOString()), W - M - pdf.getTextWidth(formatDate(new Date().toISOString())), y);

      // ══════ PAGE 2 ══════
      newPage();

      // Distribution bar
      secHeader('Stack Distribution', ACCENT);
      var barY = y;
      pdf.setFillColor(border.r, border.g, border.b);
      pdf.rect(M, barY, CW, 8, 'F');
      var barX = M;
      var segments = [
        { pct: total ? (fe / total) * 100 : 0, color: TYPE_COLORS.frontend },
        { pct: total ? (be / total) * 100 : 0, color: TYPE_COLORS.backend },
        { pct: total ? (inf / total) * 100 : 0, color: TYPE_COLORS.infra },
      ];
      for (var si = 0; si < segments.length; si++) {
        var seg = segments[si];
        if (seg.pct > 0) {
          var sw = Math.max(CW * (seg.pct / 100), 4);
          pdf.setFillColor(seg.color.r, seg.color.g, seg.color.b);
          pdf.rect(barX, barY, sw, 8, 'F');
          barX += sw;
        }
      }
      y = fin(y + 16);

      // Legend
      var legendData = [
        { label: 'Frontend ' + (total ? Math.round((fe / total) * 100) : 0) + '%', color: TYPE_COLORS.frontend },
        { label: 'Backend ' + (total ? Math.round((be / total) * 100) : 0) + '%', color: TYPE_COLORS.backend },
        { label: 'Infra ' + (total ? Math.round((inf / total) * 100) : 0) + '%', color: TYPE_COLORS.infra },
      ];
      var legendX = M;
      for (var li = 0; li < legendData.length; li++) {
        var ld = legendData[li];
        pdf.setFillColor(ld.color.r, ld.color.g, ld.color.b);
        pdf.rect(legendX, y, 4, 4, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(ld.label, legendX + 7, fin(y + 3.5));
        legendX += pdf.getTextWidth(ld.label) + 16;
      }
      y = fin(y + 12);

      // Category breakdown
      var catStats = [];
      for (var ci = 0; ci < (data.categories || []).length; ci++) {
        var cat = data.categories[ci];
        if (cat.technologies && cat.technologies.length > 0) {
          catStats.push({ name: cat.category, count: cat.technologies.length });
        }
      }
      catStats.sort(function (a, b) { return b.count - a.count; });

      if (catStats.length > 0) {
        secHeader('Category Breakdown', TYPE_COLORS.frontend);
        var maxCount = catStats[0].count;
        var colW = (CW - 6) / 2;
        var colIdx = 0;

        for (var csi = 0; csi < Math.min(catStats.length, 16); csi++) {
          var cs = catStats[csi];
          var col = colIdx % 2;
          var cx = M + col * (colW + 6);
          checkPage(14);

          if (col === 0 && colIdx > 0) y = fin(y - 12);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          pdf.text(esc(cs.name), fin(cx), fin(y + 4));

          var countStr = String(cs.count);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(countStr, fin(cx + colW - pdf.getTextWidth(countStr)), fin(y + 4));

          y = fin(y + 6);
          confBar((cs.count / maxCount) * 100, cx, colW, ACCENT);
          y = fin(y + 6);
          colIdx++;
        }
        y = fin(y + 4);
      }

      // Technology list
      var allTechs = [];
      for (var ti = 0; ti < (data.categories || []).length; ti++) {
        var catObj = data.categories[ti];
        for (var tj = 0; tj < (catObj.technologies || []).length; tj++) {
          var t = catObj.technologies[tj];
          var techCopy = {};
          for (var tk in t) { techCopy[tk] = t[tk]; }
          techCopy.categoryName = catObj.category;
          allTechs.push(techCopy);
        }
      }

      if (allTechs.length > 0) {
        secHeader('Technology Details', TYPE_COLORS.backend);

        for (var ai = 0; ai < allTechs.length; ai++) {
          var tech = allTechs[ai];
          checkPage(18);

          var tc = TYPE_COLORS[tech.type] || TYPE_COLORS.frontend;

          // Tech name
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          var techName = esc(tech.name) || 'Unknown';
          pdf.text(techName, M, fin(y + 4));

          // Version
          if (tech.version) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
            var nameW = pdf.getTextWidth(techName);
            pdf.text('v' + esc(tech.version), fin(M + nameW + 3), fin(y + 4));
          }

          // Type badge
          var badgeText = (tech.type || 'frontend').toUpperCase();
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          var badgeW = pdf.getTextWidth(badgeText) + 6;
          pdf.setFillColor(tc.r, tc.g, tc.b);
          pdf.rect(fin(W - M - badgeW), fin(y), fin(badgeW), 5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.text(badgeText, fin(W - M - badgeW + 3), fin(y + 3.8));

          y = fin(y + 8);

          // Category + detection
          var catText = esc(tech.categoryName || tech.category || '');
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(catText, M, fin(y + 3));

          if (tech.detectedVia) {
            var catW2 = pdf.getTextWidth(catText);
            pdf.text('via', fin(M + catW2 + 4), fin(y + 3));
            pdf.setTextColor(fg[0], fg[1], fg[2]);
            pdf.text(esc(tech.detectedVia), fin(M + catW2 + 12), fin(y + 3));
          }

          // Confidence bar
          var confPct = tech.confidence === 'high' ? 95 : tech.confidence === 'medium' ? 65 : 35;
          confBar(confPct, W - M - 40, 40, tc);

          y = fin(y + 8);
          hline();
        }
      }

      // SEO section
      if (data.seo) {
        checkPage(50);
        secHeader('SEO Analysis', TYPE_COLORS.infra);

        var seo = data.seo;
        var scoreW = (CW - 8) / 3;
        var seoColor = TYPE_COLORS.infra;
        if (safeNum(seo.score) >= 80) seoColor = TYPE_COLORS.backend;
        else if (safeNum(seo.score) < 50) seoColor = { r: 239, g: 68, b: 68 };

        statCard(safeNum(seo.score) || '-', 'Score', M, scoreW, seoColor);
        statCard(seo.grade || '-', 'Grade', M + scoreW + 4, scoreW, seoColor);
        var h1 = safeNum(seo.headings?.h1);
        var h2 = safeNum(seo.headings?.h2);
        statCard('H1:' + h1 + ' H2:' + h2, 'Headings', M + (scoreW + 4) * 2, scoreW, TYPE_COLORS.frontend);
        y = fin(y + 6);

        kv('Title', seo.title?.text);
        y = fin(y + 2);
        kv('Description', seo.description?.text);
        y = fin(y + 2);
      }

      // Performance section
      if (data.performance) {
        checkPage(40);
        secHeader('Performance', TYPE_COLORS.backend);

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
        for (var pi = 0; pi < perfItems.length; pi++) {
          var perfCol = pi % 3;
          if (perfCol === 0 && pi > 0) y = fin(y + 16);
          checkPage(18);
          var px = M + perfCol * (pColW + 4);
          lbl(perfItems[pi][0], px);
          txt(perfItems[pi][1], px, { size: 9, maxWidth: pColW });
          y = fin(y + 4);
        }
        y = fin(y + 4);
      }

      // Security section
      if (data.security) {
        checkPage(40);
        secHeader('Security Headers', { r: 239, g: 68, b: 68 });

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

        for (var si2 = 0; si2 < secItems.length; si2++) {
          checkPage(12);
          kv(secItems[si2][0], secItems[si2][1], M);
          y = fin(y + 1);
        }
      }

      // Response Headers
      if (data.responseHeaders && Object.keys(data.responseHeaders).length > 0) {
        checkPage(30);
        secHeader('Response Headers', { r: 139, g: 92, b: 246 });

        var rhKeys = Object.keys(data.responseHeaders).slice(0, 20);
        for (var ri = 0; ri < rhKeys.length; ri++) {
          var rKey = rhKeys[ri];
          checkPage(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(fgMuted[0], fgMuted[1], fgMuted[2]);
          pdf.text(esc(rKey), M, fin(y + 3));

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(fg[0], fg[1], fg[2]);
          var rhVal = data.responseHeaders[rKey];
          var rhValStr = Array.isArray(rhVal) ? rhVal.join(', ') : String(rhVal);
          var rhLines = pdf.splitTextToSize(esc(rhValStr), CW - 50);
          for (var rli = 0; rli < rhLines.length; rli++) {
            pdf.text(rhLines[rli], M + 50, fin(y + 3));
            y = fin(y + 4);
          }
          y = fin(y + 2);
        }
      }

      // Page Metadata
      if (data.pageMetadata) {
        checkPage(40);
        secHeader('Page Metadata', { r: 99, g: 102, b: 241 });

        var md = data.pageMetadata;
        var mdItems = [
          ['Title', md.title],
          ['Description', md.description],
          ['Canonical', md.canonical],
          ['Robots', md.robots],
          ['Language', md.language],
          ['Author', md.author],
          ['OG Title', md.ogTitle],
          ['OG Description', md.ogDescription],
          ['OG Image', md.ogImage],
          ['Twitter Card', md.twitterCard],
          ['Twitter Site', md.twitterSite],
          ['Favicon', md.favicon],
          ['Manifest', md.manifest],
          ['Theme Color', md.themeColor],
        ].filter(function (item) { return !!item[1]; });

        for (var mdi = 0; mdi < mdItems.length; mdi++) {
          checkPage(12);
          kv(mdItems[mdi][0], mdItems[mdi][1], M);
          y = fin(y + 1);
        }
      }

      // Company profile
      if (data.company && data.company.name) {
        checkPage(30);
        secHeader('Company Profile', { r: 139, g: 92, b: 246 });

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(fg[0], fg[1], fg[2]);
        pdf.text(esc(data.company.name), M, fin(y + 5));
        y = fin(y + 10);

        if (data.company.description) {
          txt(data.company.description, M, { size: 9, color: fgMuted, maxWidth: CW });
          y = fin(y + 4);
        }

        var coItems = [
          ['Industry', data.company.industry],
          ['Founded', data.company.foundingDate],
          ['Employees', data.company.employeeCount],
        ].filter(function (item) { return !!item[1]; });

        for (var coi = 0; coi < coItems.length; coi++) {
          checkPage(8);
          kv(coItems[coi][0], coItems[coi][1], M);
        }
      }

      // Final footer
      checkPage(20);
      y = H - 25;
      hline();
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(fg[0], fg[1], fg[2]);
      pdf.text('TechStack Finder', M, fin(y + 4));
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(fgDim[0], fgDim[1], fgDim[2]);
      pdf.text('Full-stack technology detection engine', M, fin(y + 9));

      var pageStr = 'Page ' + pageNum;
      pdf.text(pageStr, fin(W - M - pdf.getTextWidth(pageStr)), fin(y + 4));
      var ts = formatDate(new Date().toISOString());
      pdf.text(ts, fin(W - M - pdf.getTextWidth(ts)), fin(y + 9));

      // Save via blob
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
      setError(err.message || 'PDF generation failed');
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
