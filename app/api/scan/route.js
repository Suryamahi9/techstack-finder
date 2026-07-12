import { NextResponse } from 'next/server';
import { detectTechnologies } from '../../../lib/detect';

export const runtime = 'nodejs';
export const maxDuration = 30;

const ipHits = new Map();
const keyHits = new Map();
const scanCache = new Map();

const API_KEY_STORE = new Map();

function rateLimited(ip, apiKey) {
  const now = Date.now();
  const windowMs = 60_000;

  if (apiKey) {
    const max = 100;
    const hits = (keyHits.get(apiKey) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) return true;
    hits.push(now);
    keyHits.set(apiKey, hits);
    return false;
  }

  const max = 10;
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return true;
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) {
      if (v.every((t) => now - t >= windowMs)) ipHits.delete(k);
    }
  }
  return false;
}

function cacheKey(url, authHeaders) {
  return url + '|' + JSON.stringify(authHeaders || {});
}

function getCached(key) {
  const entry = scanCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    scanCache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(key, result) {
  const ttl = 10 * 60 * 1000; // 10 min
  scanCache.set(key, { result, expires: Date.now() + ttl });
  if (scanCache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of scanCache) {
      if (now > v.expires) scanCache.delete(k);
    }
  }
}

export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const apiKey = request.headers.get('x-api-key') || null;

  if (rateLimited(ip, apiKey)) {
    return NextResponse.json(
      { success: false, error: 'Too many scans. Please wait a minute and try again.', rateLimit: { limit: apiKey ? 100 : 10, window: '1m' } },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const { url, headers, cookies, timeout } = body;
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'A URL is required.' },
      { status: 400 }
    );
  }

  const authOpts = { headers: headers || null, cookies: cookies || null };
  const key = cacheKey(url, authOpts);
  const cached = getCached(key);
  if (cached) {
    return NextResponse.json({ success: true, ...cached, cached: true });
  }

  try {
    const result = await detectTechnologies(url, { timeout, ...authOpts });
    setCache(key, result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to scan site.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'TechStack Finder API',
    usage: 'POST { "url": "example.com", "headers": {}, "cookies": "a=b; c=d", "timeout": 8000 }',
    rateLimits: {
      anonymous: '10 requests/minute by IP',
      authenticated: '100 requests/minute with x-api-key header',
    },
    docs: 'Send x-api-key header for higher rate limits. Generate keys at /api-keys',
  });
}
