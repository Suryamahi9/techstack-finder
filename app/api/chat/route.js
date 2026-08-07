import { NextResponse } from 'next/server';
import { runChatAgent } from '../../../lib/chat-agent';

export const maxDuration = 60;

const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const buckets = new Map();

function clientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req) {
  const key = clientIp(req);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.resetAt > WINDOW_MS) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again in a moment.' }, { status: 429 });
    }
  }
  if (buckets.size > 2000) {
    for (const [k, v] of buckets) {
      if (now > v.resetAt) buckets.delete(k);
    }
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const messages = body && body.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return NextResponse.json({ error: 'messages must be a non-empty array (max 30).' }, { status: 400 });
  }
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return NextResponse.json({ error: 'Invalid message shape.' }, { status: 400 });
    }
  }
  const totalChars = messages.reduce((n, m) => n + m.content.length, 0);
  if (totalChars > 20000) {
    return NextResponse.json({ error: 'Message too long.' }, { status: 400 });
  }

  try {
    const result = await runChatAgent(messages);
    return NextResponse.json({ reply: result.reply, setupRequired: !!result.disabled });
  } catch (e) {
    console.error('[chat]', e);
    if (e && (e.message === 'LLM_TIMEOUT' || e.name === 'AbortError')) {
      return NextResponse.json({ reply: 'The AI model took too long to respond. Please try again in a moment.' });
    }
    return NextResponse.json({ error: 'Sorry, something went wrong on my end. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/chat', method: 'POST' });
}
