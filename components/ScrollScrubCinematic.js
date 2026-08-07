'use client';
import { useEffect, useRef } from 'react';

/* Homepage scroll-scrub background: 65 pre-rendered frames (public/frames/)
   played as a flip book driven by the page scroll. A fixed fullscreen canvas at
   z-index -1 sits behind the whole homepage; scrolling down advances frames,
   reverse-scrolling replays them. The page's own content provides the scroll
   length (no spacer track), so the film paces across the full homepage. */

const FRAME_COUNT = 65;
const PAD = (n) => String(n).padStart(3, '0');
const frameSrc = (i) => `/frames/frame-${PAD(i + 1)}.jpg`;

export default function ScrollScrubCinematic() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const imgs = [];
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const img = new Image();
      img.src = frameSrc(i);
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
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { dw, dh, dx, dy } = fitCover(img, w, h);
      const zoom = 1.1 - p * 0.08; // subtle pull-back, always >= 1 so cover is never broken
      const scw = dw * zoom;
      const sch = dh * zoom;
      const scx = (w - w * zoom) / 2 + dx * zoom;
      const scy = (h - h * zoom) / 2 + dy * zoom;
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
  }, []);

  return (
    <div className="swcin-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="swcin-canvas" />
    </div>
  );
}
