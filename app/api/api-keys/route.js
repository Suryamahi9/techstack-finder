import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, key: true, lastUsed: true, isActive: true, createdAt: true,
      _count: { select: { usageLogs: true } },
    },
  });

  return NextResponse.json({ success: true, items: keys });
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

  const { name } = body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Key name required.' }, { status: 400 });
  }

  const existingCount = await prisma.apiKey.count({ where: { userId: session.user.id } });
  if (existingCount >= 10) {
    return NextResponse.json({ success: false, error: 'Maximum 10 API keys.' }, { status: 400 });
  }

  const key = 'tsf_' + crypto.randomBytes(24).toString('hex');

  const item = await prisma.apiKey.create({
    data: { userId: session.user.id, name: name.trim(), key },
  });

  return NextResponse.json({ success: true, item: { ...item, key } });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Sign in required.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });
  }

  await prisma.apiKey.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
