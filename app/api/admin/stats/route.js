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

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ success: false, error: 'Admin access required.' }, { status: 403 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsers30d,
    newUsers7d,
    usersByTier,
    totalScans,
    scansThisMonth,
    totalBookmarks,
    totalMonitors,
    totalApiKeys,
    recentScans,
    topDomains,
    dailyScans,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.groupBy({ by: ['tier'], _count: true }),
    prisma.scanHistory.count(),
    prisma.scanHistory.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.bookmark.count(),
    prisma.monitor.count({ where: { isActive: true } }),
    prisma.apiKey.count({ where: { isActive: true } }),
    prisma.scanHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { domain: true, total: true, scannedAt: true },
    }),
    prisma.scanHistory.groupBy({
      by: ['domain'],
      _count: true,
      orderBy: { _count: { domain: 'desc' } },
      take: 10,
    }),
    prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM "ScanHistory"
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
  ]);

  const tierMap = {};
  usersByTier.forEach((t) => { tierMap[t.tier] = t._count; });

  return NextResponse.json({
    success: true,
    stats: {
      users: { total: totalUsers, new30d: newUsers30d, new7d: newUsers7d, byTier: tierMap },
      scans: { total: totalScans, thisMonth: scansThisMonth, daily: dailyScans },
      engagement: { bookmarks: totalBookmarks, monitors: totalMonitors, apiKeys: totalApiKeys },
      recentScans,
      topDomains: topDomains.map((d) => ({ domain: d.domain, count: d._count })),
    },
  });
}
