import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: 'Sign in required.', status: 401 };
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== 'admin') return { error: 'Admin access required.', status: 403 };
  return { user, session };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search') || '';
  const skip = (page - 1) * limit;

  const where = search
    ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, tier: true, role: true,
        scansThisMonth: true, createdAt: true, updatedAt: true,
        _count: { select: { scanHistory: true, bookmarks: true, apiKeys: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { userId, tier, role } = body;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId required.' }, { status: 400 });
  }

  const update = {};
  if (tier) update.tier = tier;
  if (role) update.role = role;

  const user = await prisma.user.update({
    where: { id: userId },
    data: update,
    select: { id: true, name: true, email: true, tier: true, role: true },
  });

  return NextResponse.json({ success: true, user });
}
