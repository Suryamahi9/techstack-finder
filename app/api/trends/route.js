import { NextResponse } from 'next/server';
import {
  TECH_DIRECTORY,
  SPOTLIGHT_TECHNOLOGIES,
  TECH_GROUPS,
  getTechBySlug,
  relatedTechs,
  countrySites,
  totalLiveSites,
} from '../../../lib/trends-data';
import {
  getMarketShare,
  getMarketShareTrends,
  getTrendDirection,
} from '../../../lib/market-share';

export const runtime = 'nodejs';

const ipHits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 60;
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

function searchTechnologies(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return TECH_DIRECTORY;
  return TECH_DIRECTORY.filter((t) =>
    [t.name, t.slug, t.description, ...(t.tags || [])]
      .join(' ')
      .toLowerCase()
      .includes(q)
  );
}

function techSummary(tech) {
  const share = getMarketShare(tech.name);
  return {
    slug: tech.slug,
    name: tech.name,
    description: tech.description,
    tags: tech.tags,
    liveSites: tech.liveSites,
    indianSites: tech.indianSites,
    currentShare: share?.currentShare ?? null,
    trend: share?.trend ?? null,
    yoy: getTrendDirection(tech.name)?.label ?? null,
  };
}

function countryBreakdown(tech) {
  const out = {};
  for (const code of ['WW', 'IN', 'US', 'GB', 'DE', 'CA', 'AU', 'BR', 'JP']) {
    out[code] = countrySites(tech, code);
  }
  return out;
}

function techDetail(tech) {
  const share = getMarketShare(tech.name);
  return {
    ...techSummary(tech),
    marketShare: share
      ? {
          category: share.category,
          trend: share.trend,
          currentShare: share.currentShare,
          data: share.data,
          topSites: share.topSites,
          usageCount: share.usageCount,
          yoy: getTrendDirection(tech.name),
        }
      : null,
    countries: countryBreakdown(tech),
    relatedTechs: relatedTechs(tech).map(techSummary),
  };
}

export async function GET(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (rateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Please try again shortly.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const techQuery = searchParams.get('tech');
  const search = searchParams.get('search');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  const limitParam = Number.parseInt(searchParams.get('limit') || '50', 10);
  const limit = Number.isNaN(limitParam) ? 50 : Math.min(Math.max(limitParam, 1), 100);

  if (techQuery) {
    const q = String(techQuery).trim();
    const tech =
      getTechBySlug(q) ||
      TECH_DIRECTORY.find((t) => t.name.toLowerCase() === q.toLowerCase()) ||
      SPOTLIGHT_TECHNOLOGIES.find((t) => t.name.toLowerCase() === q.toLowerCase()) ||
      null;
    if (!tech) {
      return NextResponse.json(
        { success: false, error: `No technology found for "${q}".` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, technology: techDetail(tech) });
  }

  let list = searchTechnologies(search);
  if (category) {
    const cat = String(category).toLowerCase();
    list = list.filter((t) => (t.tags || []).some((tag) => tag.toLowerCase() === cat));
  }
  list = list
    .slice()
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : b.liveSites - a.liveSites))
    .slice(0, limit);

  return NextResponse.json({
    success: true,
    name: 'TechStack Finder Trends API',
    version: '1.0',
    updated: 'August 2026',
    query: { search: search || null, category: category || null, sort: sort || 'liveSites', limit },
    totalLiveSites: totalLiveSites(),
    count: list.length,
    technologies: list.map(techSummary),
    spotlight: SPOTLIGHT_TECHNOLOGIES.map(techSummary),
    groups: TECH_GROUPS.map((g) => ({ id: g.id, name: g.name, description: g.description, tags: g.tags })),
    marketShare: getMarketShareTrends(20),
  });
}
