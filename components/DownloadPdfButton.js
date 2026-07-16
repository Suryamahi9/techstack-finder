import { useState, useRef, useCallback } from 'react';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

function safeNum(v) {
  return typeof v === 'number' && isFinite(v) ? v : 0;
}

function s(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[<>&"']/g, function (c) {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function typeColor(type) {
  if (type === 'backend') return '#10b981';
  if (type === 'infra') return '#f59e0b';
  return '#3b82f6';
}

function buildHtml(data, theme) {
  var isDark = theme === 'dark';
  var bg = isDark ? '#0f172a' : '#ffffff';
  var fg = isDark ? '#f1f5f9' : '#111111';
  var muted = isDark ? '#94a3b8' : '#6b7280';
  var dim = isDark ? '#64748b' : '#9ca3af';
  var cardBg = isDark ? '#1e293b' : '#f8fafc';
  var border = isDark ? '#334155' : '#e5e7eb';
  var accent = '#c5fb45';
  var red = '#ef4444';

  var total = safeNum(data.summary?.total);
  var cats = safeNum(data.summary?.categories);
  var fe = safeNum(data.summary?.frontend);
  var be = safeNum(data.summary?.backend);
  var inf = safeNum(data.summary?.infra);

  // Gather all techs and category stats
  var allTechs = [];
  var catStats = [];
  (data.categories || []).forEach(function (cat) {
    var techs = cat.technologies || [];
    if (techs.length > 0) {
      catStats.push({ name: cat.category, count: techs.length });
      techs.forEach(function (t) {
        allTechs.push({ name: t.name, version: t.version, type: t.type, confidence: t.confidence, detectedVia: t.detectedVia, categoryName: cat.category });
      });
    }
  });
  catStats.sort(function (a, b) { return b.count - a.count; });

  var maxCatCount = catStats.length > 0 ? catStats[0].count : 1;

  // Confidence breakdown
  var highCount = 0, medCount = 0, lowCount = 0;
  allTechs.forEach(function (t) {
    if (t.confidence === 'high') highCount++;
    else if (t.confidence === 'medium') medCount++;
    else lowCount++;
  });

  var html = '';
  html += '<div style="font-family:Helvetica,Arial,sans-serif;color:' + fg + ';background:' + bg + ';padding:0;margin:0;width:794px;">';

  // ══════ PAGE 1: COVER + SUMMARY ══════
  html += '<div style="height:1122px;position:relative;overflow:hidden;background:linear-gradient(180deg,' + (isDark ? '#0f172a,#1e293b' : '#f8fafc,#e2e8f0') + ');">';

  // Accent bar + title
  html += '<div style="position:absolute;top:55px;left:30px;width:3px;height:40px;background:' + accent + ';"></div>';
  html += '<div style="position:absolute;top:58px;left:42px;font-size:10px;font-weight:bold;color:' + accent + ';letter-spacing:2px;">TECHSTACK FINDER</div>';
  html += '<div style="position:absolute;top:78px;left:42px;font-size:36px;font-weight:bold;color:' + (isDark ? '#fff' : '#111') + ';">Technology Report</div>';
  html += '<div style="position:absolute;top:120px;left:42px;font-size:18px;color:' + (isDark ? '#cbd5e1' : '#475569') + ';">' + s(data.site?.domain || 'Unknown') + '</div>';
  var metaLine = [];
  if (data.site?.scannedAt) metaLine.push(formatDate(data.site?.scannedAt));
  if (data.site?.statusCode) metaLine.push('HTTP ' + data.site.statusCode);
  metaLine.push(cats + ' categories · ' + total + ' technologies');
  html += '<div style="position:absolute;top:148px;left:42px;font-size:10px;color:' + dim + ';">' + s(metaLine.join('  ·  ')) + '</div>';

  // ─── DONUT CHART ───
  var donutX = 42, donutY = 190;
  var donutSize = 180, donutHole = 100;
  var fePct = total ? (fe / total) * 100 : 0;
  var bePct = total ? (be / total) * 100 : 0;
  var infPct = total ? (inf / total) * 100 : 0;
  // Conic gradient angles
  var feDeg = fePct * 3.6;
  var beDeg = bePct * 3.6;
  var infDeg = infPct * 3.6;

  html += '<div style="position:absolute;top:' + donutY + 'px;left:' + donutX + 'px;">';
  html += '<div style="width:' + donutSize + 'px;height:' + donutSize + 'px;border-radius:50%;background:conic-gradient(#3b82f6 0deg ' + feDeg + 'deg,#10b981 ' + feDeg + 'deg ' + (feDeg + beDeg) + 'deg,#f59e0b ' + (feDeg + beDeg) + 'deg ' + (feDeg + beDeg + infDeg) + 'deg,' + border + ' ' + (feDeg + beDeg + infDeg) + 'deg 360deg);display:flex;align-items:center;justify-content:center;">';
  html += '<div style="width:' + donutHole + 'px;height:' + donutHole + 'px;border-radius:50%;background:' + (isDark ? '#1e293b' : '#f8fafc') + ';display:flex;flex-direction:column;align-items:center;justify-content:center;">';
  html += '<div style="font-size:28px;font-weight:bold;color:' + fg + ';">' + total + '</div>';
  html += '<div style="font-size:9px;color:' + muted + ';text-transform:uppercase;">Total</div>';
  html += '</div></div></div>';

  // Legend next to donut
  var legX = donutX + donutSize + 30;
  html += '<div style="position:absolute;top:' + (donutY + 30) + 'px;left:' + legX + 'px;">';
  var legItems = [
    { label: 'Frontend', count: fe, pct: fePct, color: '#3b82f6' },
    { label: 'Backend', count: be, pct: bePct, color: '#10b981' },
    { label: 'Infrastructure', count: inf, pct: infPct, color: '#f59e0b' },
  ];
  for (var li = 0; li < legItems.length; li++) {
    var leg = legItems[li];
    html += '<div style="margin-bottom:12px;">';
    html += '<div style="display:flex;align-items:center;margin-bottom:3px;">';
    html += '<div style="width:10px;height:10px;border-radius:3px;background:' + leg.color + ';margin-right:8px;"></div>';
    html += '<span style="font-size:12px;font-weight:bold;color:' + fg + ';">' + leg.label + '</span>';
    html += '</div>';
    html += '<div style="font-size:20px;font-weight:bold;color:' + leg.color + ';margin-left:18px;">' + leg.count + ' <span style="font-size:11px;color:' + muted + ';font-weight:normal;">(' + Math.round(leg.pct) + '%)</span></div>';
    html += '</div>';
  }
  // Confidence mini-stats
  html += '<div style="margin-top:16px;padding:10px 14px;background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;">';
  html += '<div style="font-size:9px;color:' + dim + ';text-transform:uppercase;margin-bottom:6px;">Confidence</div>';
  html += '<div style="display:flex;gap:12px;font-size:11px;">';
  html += '<span style="color:#10b981;font-weight:bold;">' + highCount + ' high</span>';
  html += '<span style="color:#f59e0b;font-weight:bold;">' + medCount + ' med</span>';
  html += '<span style="color:' + red + ';">' + lowCount + ' low</span>';
  html += '</div></div>';
  html += '</div>';

  // ─── CATEGORY BAR CHART ───
  var chartY = donutY + donutSize + 40;
  html += '<div style="position:absolute;top:' + chartY + 'px;left:42px;right:30px;">';
  html += '<div style="font-size:11px;font-weight:bold;color:' + muted + ';text-transform:uppercase;margin-bottom:10px;">Categories</div>';
  var barMaxW = 480;
  for (var cbi = 0; cbi < Math.min(catStats.length, 12); cbi++) {
    var cs = catStats[cbi];
    var barPct = (cs.count / maxCatCount) * 100;
    html += '<div style="display:flex;align-items:center;margin-bottom:5px;">';
    html += '<div style="width:130px;font-size:10px;font-weight:bold;color:' + fg + ';text-align:right;padding-right:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + s(cs.name) + '</div>';
    html += '<div style="flex:1;height:12px;border-radius:6px;background:' + border + ';overflow:hidden;">';
    html += '<div style="width:' + Math.round(barPct) + '%;height:100%;background:' + accent + ';border-radius:6px;"></div>';
    html += '</div>';
    html += '<div style="width:30px;font-size:10px;color:' + muted + ';text-align:right;padding-left:6px;">' + cs.count + '</div>';
    html += '</div>';
  }
  html += '</div>';

  // Footer
  html += '<div style="position:absolute;bottom:24px;left:42px;right:42px;font-size:8px;color:' + dim + ';display:flex;justify-content:space-between;border-top:1px solid ' + border + ';padding-top:8px;">';
  html += '<span>Generated by TechStack Finder</span><span>' + s(formatDate(new Date().toISOString())) + '</span>';
  html += '</div>';
  html += '</div>';

  // ══════ PAGE 2: TECH SUMMARY ══════
  html += '<div style="page-break-before:always;padding:30px 42px;">';
  html += '<div style="font-size:18px;font-weight:bold;margin-bottom:4px;">Technology Summary</div>';
  html += '<div style="font-size:11px;color:' + muted + ';margin-bottom:20px;">Top technologies detected across ' + cats + ' categories</div>';

  // Group techs by category, sorted by count
  var grouped = {};
  allTechs.forEach(function (t) {
    if (!grouped[t.categoryName]) grouped[t.categoryName] = [];
    grouped[t.categoryName].push(t);
  });

  var catNames = Object.keys(grouped).sort(function (a, b) { return grouped[b].length - grouped[a].length; });

  for (var gi = 0; gi < catNames.length; gi++) {
    var gName = catNames[gi];
    var gTechs = grouped[gName];
    var showTechs = gTechs.slice(0, 10);
    var hasMore = gTechs.length > 10;

    html += '<div style="margin-bottom:16px;page-break-inside:avoid;">';
    html += '<div style="display:flex;align-items:center;margin-bottom:6px;">';
    html += '<div style="width:3px;height:16px;background:' + accent + ';border-radius:2px;margin-right:8px;"></div>';
    html += '<span style="font-size:13px;font-weight:bold;">' + s(gName) + '</span>';
    html += '<span style="font-size:10px;color:' + muted + ';margin-left:6px;">(' + gTechs.length + ')</span>';
    html += '</div>';

    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    for (var ti = 0; ti < showTechs.length; ti++) {
      var tech = showTechs[ti];
      var tc = typeColor(tech.type);
      var confW = tech.confidence === 'high' ? 100 : tech.confidence === 'medium' ? 60 : 30;
      html += '<div style="width:calc(25% - 5px);background:' + cardBg + ';border:1px solid ' + border + ';border-radius:6px;padding:8px 10px;">';
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
      html += '<span style="font-size:11px;font-weight:bold;color:' + fg + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px;">' + s(tech.name) + '</span>';
      html += '<span style="font-size:7px;font-weight:bold;color:#fff;background:' + tc + ';padding:1px 5px;border-radius:8px;flex-shrink:0;">' + s((tech.type || 'FE').substring(0, 2).toUpperCase()) + '</span>';
      html += '</div>';
      html += '<div style="height:3px;border-radius:2px;background:' + border + ';overflow:hidden;">';
      html += '<div style="width:' + confW + '%;height:100%;background:' + tc + ';border-radius:2px;"></div>';
      html += '</div>';
      html += '</div>';
    }
    if (hasMore) {
      html += '<div style="width:calc(25% - 5px);background:' + cardBg + ';border:1px dashed ' + border + ';border-radius:6px;padding:8px 10px;display:flex;align-items:center;justify-content:center;">';
      html += '<span style="font-size:10px;color:' + muted + ';">+' + (gTechs.length - 10) + ' more</span>';
      html += '</div>';
    }
    html += '</div></div>';
  }
  html += '</div>';

  // ══════ PAGE 3: ANALYSIS ══════
  html += '<div style="page-break-before:always;padding:30px 42px;">';

  // SEO
  if (data.seo) {
    html += '<div style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;margin-bottom:12px;"><div style="width:3px;height:18px;background:#f59e0b;border-radius:2px;margin-right:8px;"></div><span style="font-size:15px;font-weight:bold;">SEO Analysis</span></div>';
    var seoScore = safeNum(data.seo.score);
    var seoClr = seoScore >= 80 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : red;
    html += '<div style="display:flex;gap:10px;margin-bottom:12px;">';
    html += '<div style="flex:1;background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:14px;text-align:center;"><div style="font-size:32px;font-weight:bold;color:' + seoClr + ';">' + s(String(seoScore || '-')) + '</div><div style="font-size:9px;color:' + muted + ';text-transform:uppercase;">Score</div></div>';
    html += '<div style="flex:1;background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:14px;text-align:center;"><div style="font-size:32px;font-weight:bold;color:' + seoClr + ';">' + s(data.seo.grade || '-') + '</div><div style="font-size:9px;color:' + muted + ';text-transform:uppercase;">Grade</div></div>';
    html += '<div style="flex:1;background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:14px;text-align:center;"><div style="font-size:22px;font-weight:bold;color:#3b82f6;">H1: ' + safeNum(data.seo.headings?.h1) + ' &nbsp; H2: ' + safeNum(data.seo.headings?.h2) + '</div><div style="font-size:9px;color:' + muted + ';text-transform:uppercase;">Headings</div></div>';
    html += '</div>';
    if (data.seo.title?.text) html += '<div style="margin-bottom:6px;"><span style="font-size:9px;color:' + dim + ';text-transform:uppercase;">Title: </span><span style="font-size:11px;">' + s(data.seo.title.text.substring(0, 120)) + (data.seo.title.text.length > 120 ? '...' : '') + '</span></div>';
    if (data.seo.description?.text) html += '<div style="margin-bottom:6px;"><span style="font-size:9px;color:' + dim + ';text-transform:uppercase;">Desc: </span><span style="font-size:11px;color:' + muted + ';">' + s(data.seo.description.text.substring(0, 160)) + (data.seo.description.text.length > 160 ? '...' : '') + '</span></div>';
    html += '</div>';
  }

  // Performance + Security side by side
  html += '<div style="display:flex;gap:16px;margin-bottom:20px;">';

  if (data.performance) {
    html += '<div style="flex:1;">';
    html += '<div style="display:flex;align-items:center;margin-bottom:10px;"><div style="width:3px;height:16px;background:#10b981;border-radius:2px;margin-right:8px;"></div><span style="font-size:13px;font-weight:bold;">Performance</span></div>';
    var perf = data.performance;
    var perfItems = [['HTTPS', perf.isHttps ? 'Yes' : 'No'], ['Compression', perf.compression], ['Cache', perf.cacheControl], ['HTTP', perf.httpVersion], ['Keep-Alive', perf.keepAlive]];
    html += '<div style="background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:12px;">';
    for (var pi2 = 0; pi2 < perfItems.length; pi2++) {
      if (!perfItems[pi2][1]) continue;
      html += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid ' + border + ';font-size:11px;"><span style="color:' + muted + ';">' + s(perfItems[pi2][0]) + '</span><span style="font-weight:bold;">' + s(perfItems[pi2][1]) + '</span></div>';
    }
    html += '</div></div>';
  }

  if (data.security) {
    html += '<div style="flex:1;">';
    html += '<div style="display:flex;align-items:center;margin-bottom:10px;"><div style="width:3px;height:16px;background:' + red + ';border-radius:2px;margin-right:8px;"></div><span style="font-size:13px;font-weight:bold;">Security</span></div>';
    var sec = data.security;
    var secItems = [['CSP', sec.contentSecurityPolicy], ['HSTS', sec.strictTransportSecurity], ['X-Frame', sec.xFrameOptions], ['X-Content', sec.xContentTypeOptions], ['Referrer', sec.referrerPolicy], ['Permissions', sec.permissionsPolicy], ['XSS', sec.xssProtection]];
    html += '<div style="background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:12px;">';
    var anySec = false;
    for (var si2 = 0; si2 < secItems.length; si2++) {
      if (!secItems[si2][1]) continue;
      anySec = true;
      var val = secItems[si2][1];
      html += '<div style="margin-bottom:4px;font-size:10px;"><span style="color:' + muted + ';">' + s(secItems[si2][0]) + ': </span><span style="font-weight:bold;">' + s(String(val).substring(0, 40)) + '</span></div>';
    }
    if (!anySec) html += '<div style="font-size:11px;color:' + muted + ';padding:8px 0;">No security headers detected</div>';
    html += '</div></div>';
  }

  html += '</div>';

  // Metadata summary (compact)
  if (data.pageMetadata) {
    var md = data.pageMetadata;
    var mdCompact = [['Title', md.title], ['Description', md.description], ['Canonical', md.canonical], ['OG Title', md.ogTitle], ['Favicon', md.favicon]].filter(function (i) { return !!i[1]; });
    if (mdCompact.length > 0) {
      html += '<div style="margin-bottom:16px;"><div style="display:flex;align-items:center;margin-bottom:8px;"><div style="width:3px;height:16px;background:#6366f1;border-radius:2px;margin-right:8px;"></div><span style="font-size:13px;font-weight:bold;">Metadata</span></div>';
      html += '<div style="background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:10px;">';
      for (var mi2 = 0; mi2 < mdCompact.length; mi2++) {
        html += '<div style="margin-bottom:3px;font-size:10px;"><span style="color:' + dim + ';">' + s(mdCompact[mi2][0]) + ': </span>' + s(String(mdCompact[mi2][1]).substring(0, 100)) + '</div>';
      }
      html += '</div></div>';
    }
  }

  // Company (compact)
  if (data.company && data.company.name) {
    html += '<div style="margin-bottom:16px;"><div style="display:flex;align-items:center;margin-bottom:8px;"><div style="width:3px;height:16px;background:#8b5cf6;border-radius:2px;margin-right:8px;"></div><span style="font-size:13px;font-weight:bold;">' + s(data.company.name) + '</span></div>';
    html += '<div style="background:' + cardBg + ';border:1px solid ' + border + ';border-radius:8px;padding:10px;font-size:11px;">';
    if (data.company.description) html += '<div style="color:' + muted + ';margin-bottom:4px;">' + s(data.company.description.substring(0, 200)) + '</div>';
    var coLine = [];
    if (data.company.industry) coLine.push(data.company.industry);
    if (data.company.foundingDate) coLine.push('Est. ' + data.company.foundingDate);
    if (data.company.employeeCount) coLine.push(data.company.employeeCount);
    if (coLine.length > 0) html += '<div style="font-weight:bold;">' + s(coLine.join(' · ')) + '</div>';
    html += '</div></div>';
  }

  // Footer
  html += '<div style="text-align:center;padding:16px;margin-top:20px;font-size:9px;color:' + dim + ';border-top:1px solid ' + border + ';">TechStack Finder · Full-stack technology detection engine</div>';
  html += '</div>';

  html += '</div>';
  return html;
}

export default function DownloadPdfButton({ data, fileName = 'report' }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [pdfTheme, setPdfTheme] = useState('dark');
  const containerRef = useRef(null);
  const jsPDFRef = useRef(null);

  const handleDownload = useCallback(async () => {
    if (!data || generating) return;
    setGenerating(true);
    setError(null);

    try {
      if (!jsPDFRef.current) {
        var mod = await import('jspdf');
        jsPDFRef.current = mod.jsPDF;
      }
      var jsPDF = jsPDFRef.current;
      var html2canvasMod = await import('html2canvas');
      var html2canvas = html2canvasMod.default;

      var container = containerRef.current;
      if (!container) { throw new Error('PDF container not mounted'); }

      var htmlContent = buildHtml(data, pdfTheme);
      container.innerHTML = htmlContent;

      // Make visible for capture
      container.style.left = '0px';
      container.style.top = '0px';
      container.style.zIndex = '-1';
      container.style.opacity = '1';
      container.style.position = 'fixed';

      await new Promise(function (r) { setTimeout(r, 200); });

      var canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        backgroundColor: null,
      });

      // Hide again
      container.style.left = '-9999px';
      container.style.position = 'absolute';
      container.style.zIndex = '';
      container.style.opacity = '';

      var imgW = canvas.width;
      var imgH = canvas.height;
      var pdfW = 210;
      var pdfH = 297;
      var marginMm = 0;
      var usableW = pdfW - marginMm * 2;
      var pxPerMm = imgW / usableW;
      var pageHpx = (pdfH - marginMm * 2) * pxPerMm;

      var totalPages = Math.ceil(imgH / pageHpx);
      var pdf = new jsPDF('p', 'mm', 'a4');

      for (var p = 0; p < totalPages; p++) {
        if (p > 0) pdf.addPage();
        var srcY = p * pageHpx;
        var srcH = Math.min(pageHpx, imgH - srcY);

        var pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgW;
        pageCanvas.height = srcH;
        var ctx = pageCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

        var imgData = pageCanvas.toDataURL('image/jpeg', 0.92);
        var destH = srcH / pxPerMm;
        pdf.addImage(imgData, 'JPEG', marginMm, marginMm, usableW, destH);
      }

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
  }, [data, pdfTheme, fileName, generating]);

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
      <div
        ref={containerRef}
        style={{ position: 'fixed', left: '-9999px', top: 0, width: '794px', background: '#0f172a', color: '#f1f5f9', zIndex: -1 }}
        aria-hidden="true"
      />
    </div>
  );
}
