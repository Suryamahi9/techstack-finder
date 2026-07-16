import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail } from '../../../../lib/email';
import crypto from 'crypto';

const prisma = new PrismaClient();
export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const { email } = body;
  if (!email) {
    return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ success: true, message: 'If an account exists, a reset email was sent.' });
  }

  await prisma.passwordReset.deleteMany({ where: { userId: user.id, used: false } });

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data: { userId: user.id, token, expires },
  });

  await sendPasswordResetEmail(email, token);

  return NextResponse.json({ success: true, message: 'If an account exists, a reset email was sent.' });
}
