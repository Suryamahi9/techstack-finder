'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/* Homepage scroll-scrub background: 130 pre-rendered frames played as a flip
   book driven by the page scroll. A fixed fullscreen canvas at z-index -1 sits
   behind the whole homepage; scrolling down advances frames, reverse-scrolling
   replays them. The page's own content provides the scroll length.

   Two frame sets live in /public/frames/:
     - landscape/ (960x540) for landscape/desktop screens
     - portrait/  (480x854) for portrait/mobile screens
   The set is picked from the live screen orientation and swapped dynamically
   on rotate/resize, so the film always fills the viewport with full coverage. */

const FRAME_COUNT = 130;
const PAD = (n) => String(n).padStart(3, '0');

export default function ScrollScrubCinematic() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const canvasRef = useRef(null);
  const [orientation, setOrientation] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const update = () => setOrientation(mq.matches ? 'portrait' : 'landscape');
    update();
    mq.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    if (!isHome) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const frameSrc = (i) => `/frames/${orientation}/frame-${PAD(i + 1)}.jpg`;
    const imgs = [];
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const img = new Image();
      img.src = frameSrc(i);
      img.decoding = 'async';
      if (i < 3) img.fetchPriority = 'high';
      imgs.push(img);
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let queued = false;
    let current = -1;
    let p = 0;

    const fitCover = (img, w, h) => {
      const ir = img.naturalWidth / img.naturalHeight;
      const r = w / h;
      if (ir > r) {
        const dh = h;
        return { dw: dh * ir, dh, dx: (w - dh * ir) / 2, dy: 0 };
      }
      const dw = w;
      return { dw, dh: w / ir, dx: 0, dy: (h - w / ir) / 2 };
    };

    const draw = () => {
      queued = false;
      const img = imgs[current];
      if (!img || !img.complete || img.naturalWidth === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Size against the canvas's actual CSS box (the fixed full-screen layer),
      // not window.innerHeight — on mobile the URL-bar/toolbar changes can leave
      // innerHeight different from the box, which would distort or gap the film.
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { dw, dh, dy } = fitCover(img, w, h);
      // Static centered cover with a guaranteed overscan band: the zoom never
      // drops below 1.05, so the image always extends past every screen edge.
      // No lateral pan — the framing stays rock-steady while the film plays.
      const zoom = 1.1 - p * 0.05;
      const scw = dw * zoom;
      const sch = dh * zoom;
      const scx = (w - scw) / 2;
      const scy = (h - sch) / 2 + dy * zoom;
      ctx.drawImage(img, scx, scy, scw, sch);
    };

    const request = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(draw);
      }
    };

    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      p = Math.min(Math.max(window.scrollY / max, 0), 1);
      const idx = Math.round(p * (FRAME_COUNT - 1));
      if (idx !== current) {
        current = idx;
        request();
      }
    };

    const onScroll = () => update();
    const onResize = () => request();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    update();
    const boot = setInterval(() => {
      if (imgs[current] && imgs[current].complete) {
        request();
        clearInterval(boot);
      }
    }, 100);

    if (reduceMotion) {
      window.removeEventListener('scroll', onScroll);
      current = FRAME_COUNT - 1;
      p = 1;
      const still = setInterval(() => {
        if (imgs[current] && imgs[current].complete) {
          request();
          clearInterval(still);
          clearInterval(boot);
        }
      }, 100);
      return () => {
        cancelAnimationFrame(raf);
        clearInterval(still);
        window.removeEventListener('resize', onResize);
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(boot);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [orientation, isHome]);

  if (!isHome) return null;

  return (
    <div className="swcin-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="swcin-canvas" />
    </div>
  );
}
