import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../../../../lib/email';

const prisma = new PrismaClient();

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const displayName = name || email.split('@')[0];
  const user = await prisma.user.create({
    data: { name: displayName, email, password: hashed },
  });

  sendWelcomeEmail(email, displayName).catch(() => {});

  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}
