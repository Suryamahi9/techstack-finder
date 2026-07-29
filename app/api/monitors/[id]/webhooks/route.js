import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  const { url, events } = body;

  if (!url) {
    return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
  }

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      monitorId: id,
      userId: session.user.id,
      url,
      events: events || ['stack_change', 'health_drop'],
      active: true,
    },
  });

  return NextResponse.json({ success: true, webhook });
}

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  const monitor = await prisma.monitor.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { monitorId: id, userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, webhooks });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get('webhookId');

  if (!webhookId) {
    return NextResponse.json({ error: 'Webhook ID is required' }, { status: 400 });
  }

  const deleted = await prisma.webhook.deleteMany({
    where: { id: webhookId, monitorId: id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
