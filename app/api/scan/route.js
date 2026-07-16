import { NextResponse } from 'next/server';
import { detectTechnologies } from '../../../lib/detect';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { getPlanForTier } from '../../../lib/stripe';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const maxDuration = 60;

const ipHits = new Map();
const keyHits = new Map();
const userHits = new Map();
const scanCache = new Map();

const TIER_LIMITS = {
  free: { rateLimit: 10, scansPerMonth: 50 },
  pro: { rateLimit: 100, scansPerMonth: 2000 },
  enterprise: { rateLimit: 500, scansPerMonth: 20000 },
};

function rateLimited(ip, tier, userId) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = TIER_LIMITS[tier]?.rateLimit || 10;

  const key = userId || ip;
  const store = userId ? userHits : ipHits;
  const hits = (store.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return { limited: true, limit: max, remaining: 0, resetMs: windowMs - (now - hits[0]) };
  hits.push(now);
  store.set(key, hits);

  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) {
      if (v.every((t) => now - t >= windowMs)) ipHits.delete(k);
    }
  }
  return { limited: false, limit: max, remaining: max - hits.length, resetMs: windowMs };
}

async function validateApiKey(key) {
  if (!key) return null;
  const apiKey = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKey || !apiKey.isActive) return null;
  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {});
  const user = await prisma.user.findUnique({ where: { id: apiKey.userId } });
  return user || null;
}

async function checkMonthlyLimit(userId, tier) {
  if (!userId) return { ok: true };
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: true };

  if (user.scansResetAt && user.scansResetAt < startOfMonth) {
    await prisma.user.update({ where: { id: userId }, data: { scansThisMonth: 0, scansResetAt: startOfMonth } });
    user.scansThisMonth = 0;
  }

  const limit = TIER_LIMITS[tier]?.scansPerMonth || 50;
  if (user.scansThisMonth >= limit) {
    return { ok: false, used: user.scansThisMonth, limit };
  }
  return { ok: true, used: user.scansThisMonth, limit };
}

async function incrementUsage(userId) {
  if (!userId) return;
  await prisma.user.update({
    where: { id: userId },
    data: { scansThisMonth: { increment: 1 } },
  }).catch(() => {});
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
  const ttl = 10 * 60 * 1000;
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

  const apiKeyStr = request.headers.get('x-api-key') || null;
  const startTime = Date.now();
  let userId = null;
  let tier = 'free';

  if (apiKeyStr) {
    const apiKeyUser = await validateApiKey(apiKeyStr);
    if (!apiKeyUser) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key.' },
        { status: 401 }
      );
    }
    userId = apiKeyUser.id;
    tier = apiKeyUser.tier || 'free';
  } else {
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        tier = session.user.tier || 'free';
      }
    } catch {}
  }

  const rateResult = rateLimited(ip, tier, userId);
  if (rateResult.limited) {
    return NextResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded. Please wait and try again.',
        rateLimit: {
          tier,
          limit: rateResult.limit,
          window: '1m',
          resetMs: rateResult.resetMs,
        },
      },
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

  const { url, headers, cookies, timeout, proxy } = body;
  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: 'A URL is required.' },
      { status: 400 }
    );
  }

  const monthlyCheck = await checkMonthlyLimit(userId, tier);
  if (!monthlyCheck.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `Monthly scan limit reached (${monthlyCheck.used}/${monthlyCheck.limit}). Upgrade at /pricing`,
        limit: { used: monthlyCheck.used, limit: monthlyCheck.limit, tier },
      },
      { status: 429 }
    );
  }

  const authOpts = { headers: headers || null, cookies: cookies || null };
  const cacheKeyStr = cacheKey(url, authOpts);
  const cached = getCached(cacheKeyStr);

  if (cached) {
    await logUsage(userId, apiKeyStr, ip, '/api/scan', url, 200, true, Date.now() - startTime, tier);
    return NextResponse.json({
      success: true,
      ...cached,
      cached: true,
      rateLimit: { tier, remaining: rateResult.remaining, limit: rateResult.limit },
    });
  }

  try {
    const result = await detectTechnologies(url, { timeout, proxy, ...authOpts });
    setCache(cacheKeyStr, result);

    await incrementUsage(userId);
    await logUsage(userId, apiKeyStr, ip, '/api/scan', url, 200, false, Date.now() - startTime, tier);

    return NextResponse.json({
      success: true,
      ...result,
      rateLimit: { tier, remaining: rateResult.remaining, limit: rateResult.limit },
    });
  } catch (err) {
    await logUsage(userId, apiKeyStr, ip, '/api/scan', url, 500, false, Date.now() - startTime, tier);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to scan site.' },
      { status: 500 }
    );
  }
}

async function logUsage(userId, apiKeyStr, ip, endpoint, url, status, cached, duration, tier) {
  const logData = {
    userId: userId || null,
    ip,
    endpoint,
    url: url || null,
    status,
    cached,
    duration,
  };

  if (apiKeyStr && userId) {
    const apiKey = await prisma.apiKey.findFirst({ where: { key: apiKeyStr } }).catch(() => null);
    if (apiKey) logData.apiKeyId = apiKey.id;
  }

  prisma.usageLog.create({ data: logData }).catch(() => {});
}

export async function GET() {
  return NextResponse.json({
    name: 'TechStack Finder API',
    version: '2.0',
    usage: {
      method: 'POST',
      body: { url: 'string (required)', headers: 'object (optional)', cookies: 'string (optional)', timeout: 'number (optional, ms)', proxy: 'string (optional)' },
      example: '{ "url": "example.com" }',
    },
    authentication: {
      anonymous: '10 requests/minute, 50 scans/month',
      apiKey: 'Send x-api-key header. Tier-based limits apply.',
      session: 'Sign in via web for session-based auth.',
    },
    tiers: {
      free: '10 req/min, 50 scans/month',
      pro: '100 req/min, 2,000 scans/month ($19/mo)',
      enterprise: '500 req/min, 20,000 scans/month ($79/mo)',
    },
    docs: 'Generate API keys at /api-keys. View pricing at /pricing.',
    rateLimit: 'Response includes rateLimit object with tier, remaining, and limit.',
  });
}
