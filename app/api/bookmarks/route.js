import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const items = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, items });
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

  const { domain, url, favicon, name, tags, notes } = body;
  if (!domain || !url) {
    return NextResponse.json({ success: false, error: 'domain and url required.' }, { status: 400 });
  }

  const item = await prisma.bookmark.upsert({
    where: { userId_domain: { userId: session.user.id, domain } },
    update: { url, favicon, name, tags, notes },
    create: { userId: session.user.id, domain, url, favicon, name, tags, notes },
  });

  return NextResponse.json({ success: true, item });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ success: false, error: 'domain required.' }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({ where: { userId: session.user.id, domain } });
  return NextResponse.json({ success: true });
}
