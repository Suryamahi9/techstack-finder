import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== 'admin') return null;
  return user;
}

export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const domain = searchParams.get('domain');
  const skip = (page - 1) * limit;

  const where = domain ? { domain } : {};

  const [items, total] = await Promise.all([
    prisma.scanHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
      select: {
        id: true, domain: true, url: true, total: true, frontend: true,
        backend: true, infra: true, scannedAt: true, cached: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.scanHistory.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
