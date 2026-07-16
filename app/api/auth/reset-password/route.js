import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json({ success: false, error: 'Token and password required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const reset = await prisma.passwordReset.findUnique({ where: { token } });
  if (!reset || reset.used || new Date() > reset.expires) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } });
  await prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true } });

  return NextResponse.json({ success: true, message: 'Password updated. You can now sign in.' });
}
