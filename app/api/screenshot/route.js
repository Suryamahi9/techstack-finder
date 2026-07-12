import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 15;

const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

const THUM_BASE = 'https://image.thum.io/get/width/';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const viewport = searchParams.get('viewport') || 'desktop';
  const width = parseInt(searchParams.get('width')) || null;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url query param required' }, { status: 400 });
  }

  let parsed;
  try {
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!parsed.hostname.includes('.')) {
    return NextResponse.json({ error: 'Invalid hostname' }, { status: 400 });
  }

  const vp = VIEWPORTS[viewport] || VIEWPORTS.desktop;
  const w = width || vp.width;
  const crop = Math.round(w * 0.625);
  const screenshotUrl = `${THUM_BASE}${w}/crop/${crop}/noanimate/${parsed.href}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(screenshotUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechStackFinder/1.0)' },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ error: 'Screenshot service returned ' + res.status }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'X-Proxy': 'techstack-finder',
        'X-Viewport': viewport,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return NextResponse.json({ error: 'Screenshot service timed out' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to fetch screenshot' }, { status: 502 });
  }
}
