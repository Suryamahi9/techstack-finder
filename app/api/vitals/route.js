import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
  }

  let finalUrl = url.trim();
  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = 'https://' + finalUrl;
  }

  let browser = null;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const result = { lcp: null, cls: null, tbt: null };

        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) result.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch {}

        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) clsValue += entry.value;
            }
            result.cls = clsValue;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch {}

        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            let tbt = 0;
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) tbt += entry.duration - 50;
            }
            result.tbt = tbt;
          });
          longTaskObserver.observe({ type: 'longtask', buffered: true });
        } catch {}

        setTimeout(() => {
          try {
            const perfEntries = performance.getEntriesByType('navigation');
            if (perfEntries.length > 0 && !result.tbt) {
              result.tbt = Math.max(0, perfEntries[0].domContentLoadedEventEnd - perfEntries[0].domContentLoadedEventStart - 50);
            }
          } catch {}
          resolve(result);
        }, 3000);
      });
    });

    await browser.close();
    browser = null;

    return NextResponse.json({ success: true, vitals });
  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to measure vitals' },
      { status: 500 }
    );
  }
}
