import { NextResponse } from 'next/server';
import { sendAffiliateApplication } from '../../../lib/email';

export const runtime = 'nodejs';

function validate(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body.';
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const website = String(body.website || '').trim();
  const audience = String(body.audience || '').trim();
  if (name.length < 2) return 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Please enter a valid email address.';
  if (website.length < 4) return 'Please enter your website or social profile.';
  if (audience.length < 10) return 'Tell us a little about your audience (at least 10 characters).';
  return { name, email, website, audience };
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
    const delivered = await sendAffiliateApplication(result);
    return NextResponse.json({
      success: true,
      delivered: Boolean(delivered?.data?.id),
      message: 'Application received. We will review it and reply within one business day.',
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit application.' },
      { status: 500 }
    );
  }
}
