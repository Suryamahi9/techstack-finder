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

  const items = await prisma.customRule.findMany({
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

  const { name, category, type, pattern, flags } = body;
  if (!name || !category || !type || !pattern) {
    return NextResponse.json({ success: false, error: 'name, category, type, pattern required.' }, { status: 400 });
  }

  try { new RegExp(pattern, flags || 'i'); } catch (e) {
    return NextResponse.json({ success: false, error: `Invalid regex: ${e.message}` }, { status: 400 });
  }

  const item = await prisma.customRule.create({
    data: { userId: session.user.id, name, category, type, pattern, flags: flags || 'i' },
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
  if (!id) {
    return NextResponse.json({ success: false, error: 'id required.' }, { status: 400 });
  }

  await prisma.customRule.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
