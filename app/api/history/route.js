import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const skip = (page - 1) * limit;

  const where = { userId: session.user.id };
  if (domain) where.domain = domain;

  const [items, total] = await Promise.all([
    prisma.scanHistory.findMany({
      where,
      orderBy: { scannedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.scanHistory.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { domain, url, favicon, total, frontend, backend, infra, categories, summary, company, seo, performance, security, pageMetadata, responseHeaders } = body;
  if (!domain || !url) {
    return NextResponse.json({ success: false, error: 'domain and url required.' }, { status: 400 });
  }

  const item = await prisma.scanHistory.create({
    data: {
      userId: session.user.id,
      domain,
      url,
      favicon: favicon || null,
      total: total || 0,
      frontend: frontend || 0,
      backend: backend || 0,
      infra: infra || 0,
      categories: categories || [],
      summary: summary || {},
      company: company || null,
      seo: seo || null,
      performance: performance || null,
      security: security || null,
      pageMetadata: pageMetadata || null,
      responseHeaders: responseHeaders || null,
    },
  });

  return NextResponse.json({ success: true, item });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    await prisma.scanHistory.deleteMany({ where: { id, userId: session.user.id } });
  } else {
    await prisma.scanHistory.deleteMany({ where: { userId: session.user.id } });
  }

  return NextResponse.json({ success: true });
}
