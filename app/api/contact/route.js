import { NextResponse } from 'next/server';
import { sendContactMessage } from '../../../lib/email';

export const runtime = 'nodejs';

const VALID_SUBJECTS = [
  'General enquiry',
  'Sales',
  'Data licensing',
  'Partnerships',
  'Support',
  'Billing',
];

function validate(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body.';
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();
  if (name.length < 2) return 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Please enter a valid email address.';
  if (message.length < 10) return 'Your message must be at least 10 characters.';
  const subject = String(body.subject || 'General enquiry');
  if (!VALID_SUBJECTS.includes(subject)) return 'Please choose a valid subject.';
  return { name, email, message, subject };
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const result = validate(body);
  if (typeof result === 'string') {
    return NextResponse.json({ success: false, error: result }, { status: 400 });
  }

  try {
    const delivered = await sendContactMessage(result);
    return NextResponse.json({
      success: true,
      delivered: Boolean(delivered?.data?.id),
      message:
        delivered?.data?.id
          ? 'Message sent. We will reply within one business day.'
          : 'Message received. We will reply within one business day.',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}
