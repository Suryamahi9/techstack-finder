import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 15;

function escapeXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const theme = searchParams.get('theme') || 'dark';
  const format = searchParams.get('format') || 'svg';

  if (!url || typeof url !== 'string') {
    return new NextResponse('url query param required', { status: 400 });
  }

  let hostname;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    hostname = parsed.hostname;
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  const isDark = theme === 'dark';
  const bg = isDark ? '#0f172a' : '#ffffff';
  const bg2 = isDark ? '#1e293b' : '#f8fafc';
  const fg = isDark ? '#f1f5f9' : '#111827';
  const muted = isDark ? '#94a3b8' : '#6b7280';
  const border = isDark ? '#334155' : '#e5e7eb';
  const accent = '#c9fb45';

  const initial = hostname.charAt(0).toUpperCase();

  const badgeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="68" viewBox="0 0 340 68">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="340" height="68" rx="12" fill="url(#g)" stroke="${border}" stroke-width="1"/>
  <rect x="10" y="10" width="48" height="48" rx="10" fill="${isDark ? '#c9fb45' : '#111827'}" opacity="0.12"/>
  <text x="34" y="40" font-family="system-ui,-apple-system,sans-serif" font-size="22" font-weight="800" fill="${isDark ? '#c9fb45' : '#111827'}" text-anchor="middle">${escapeXml(initial)}</text>
  <text x="68" y="28" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="700" fill="${fg}">TechStack Finder</text>
  <text x="68" y="46" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="${muted}">Detected on ${escapeXml(hostname)}</text>
  <rect x="270" y="20" width="56" height="28" rx="14" fill="${accent}" opacity="0.15"/>
  <text x="298" y="39" font-family="monospace" font-size="10" font-weight="700" fill="${accent}" text-anchor="middle">Scan</text>
</svg>`;

  if (format === 'json') {
    return NextResponse.json({
      badge: {
        svg: badgeSvg,
        embed: `<a href="https://${hostname}" target="_blank" rel="noopener"><img src="https://techstack-finder.vercel.app/api/badge?url=${encodeURIComponent(hostname)}&theme=${theme}" alt="Built with tech detected by TechStack Finder" /></a>`,
        markdown: `[![TechStack Finder](https://techstack-finder.vercel.app/api/badge?url=${encodeURIComponent(hostname)}&theme=${theme})](https://${hostname})`,
        html: `<a href="https://${hostname}" target="_blank" rel="noopener"><img src="https://techstack-finder.vercel.app/api/badge?url=${encodeURIComponent(hostname)}&theme=${theme}" alt="Built with tech detected by TechStack Finder" /></a>`,
      },
    });
  }

  return new NextResponse(badgeSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
