import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event, data) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const steps = [
        { id: 'resolve', label: 'Resolving domain' },
        { id: 'fetch', label: 'Fetching page HTML' },
        { id: 'headers', label: 'Analyzing headers & meta tags' },
        { id: 'challenge', label: 'Checking for challenge pages' },
        { id: 'css', label: 'Deep scanning CSS & JS assets' },
        { id: 'probes', label: 'Probing common paths' },
        { id: 'browser', label: 'Running browser engine' },
        { id: 'rules', label: 'Matching tech rules' },
        { id: 'results', label: 'Building results' },
      ];

      (async () => {
        for (const step of steps) {
          send('progress', step);
          await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
        }
        send('done', { message: 'Scan complete' });
        controller.close();
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
