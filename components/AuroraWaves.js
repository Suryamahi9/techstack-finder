'use client';
import { useRef, useEffect } from 'react';

export default function AuroraWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    let t = 0;

    const getAccent = () => {
      const s = getComputedStyle(document.documentElement);
      return s.getPropertyValue('--accent').trim() || '#c5fb45';
    };

    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const mixRgb = (a, b, t) => ({
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    });

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    // --- Curtain layers (vertical aurora at top) ---
    const CURTAINS = [
      { xPct: 0.15, width: 0.12, drift: 0.3, ampX: 40, freq: 0.008, speed: 0.5, alpha: 0.045 },
      { xPct: 0.35, width: 0.10, drift: -0.2, ampX: 35, freq: 0.010, speed: 0.65, alpha: 0.035 },
      { xPct: 0.55, width: 0.14, drift: 0.25, ampX: 45, freq: 0.007, speed: 0.4, alpha: 0.05 },
      { xPct: 0.75, width: 0.11, drift: -0.35, ampX: 30, freq: 0.009, speed: 0.55, alpha: 0.03 },
    ];

    const drawCurtain = (c, accent, secondary) => {
      const curtainW = w * c.width;
      const cx = w * c.xPct + Math.sin(t * c.drift) * c.ampX;
      const curtainH = h * 0.65;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Glow layer
      const glow = ctx.createRadialGradient(cx, h * 0.1, 0, cx, h * 0.1, curtainW * 1.5);
      glow.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${c.alpha * 1.5})`);
      glow.addColorStop(0.5, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${c.alpha * 0.5})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - curtainW * 1.5, 0, curtainW * 3, curtainH);

      // Main curtain body — vertical wavy shape
      ctx.beginPath();
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const y = (i / steps) * curtainH;
        const waveX = Math.sin(y * c.freq + t * c.speed) * 15
                    + Math.sin(y * c.freq * 0.4 + t * c.speed * 0.6) * 10;
        const fadeAlpha = 1 - (i / steps);
        ctx.globalAlpha = c.alpha * fadeAlpha * 2;
        const x = cx + waveX;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = steps; i >= 0; i--) {
        const y = (i / steps) * curtainH;
        const waveX = Math.sin(y * c.freq + t * c.speed + 2) * 15
                    + Math.sin(y * c.freq * 0.5 + t * c.speed * 0.8) * 8;
        const fadeAlpha = 1 - (i / steps);
        ctx.globalAlpha = c.alpha * fadeAlpha * 2;
        ctx.lineTo(cx + curtainW * 0.3 + waveX, y);
      }
      ctx.closePath();

      const bodyGrad = ctx.createLinearGradient(cx, 0, cx, curtainH);
      bodyGrad.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.12)`);
      bodyGrad.addColorStop(0.4, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.06)`);
      bodyGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bodyGrad;
      ctx.globalAlpha = 1;
      ctx.fill();

      ctx.restore();
    };

    // --- Horizontal wave layers (bottom) ---
    const WAVE_LAYERS = [
      { yPct: 0.78, amp: 35, freq: 0.0025, speed: 0.35, alpha: 0.055, harmonic: 0.4, hSpeed: 0.25, breathAmp: 0.3, breathSpeed: 0.08 },
      { yPct: 0.80, amp: 28, freq: 0.0035, speed: 0.5, alpha: 0.045, harmonic: 0.6, hSpeed: 0.35, breathAmp: 0.25, breathSpeed: 0.12 },
      { yPct: 0.83, amp: 22, freq: 0.004, speed: 0.65, alpha: 0.04, harmonic: 0.5, hSpeed: 0.4, breathAmp: 0.2, breathSpeed: 0.15 },
      { yPct: 0.86, amp: 18, freq: 0.005, speed: 0.8, alpha: 0.035, harmonic: 0.7, hSpeed: 0.5, breathAmp: 0.15, breathSpeed: 0.1 },
      { yPct: 0.89, amp: 14, freq: 0.006, speed: 0.95, alpha: 0.025, harmonic: 0.3, hSpeed: 0.6, breathAmp: 0.1, breathSpeed: 0.18 },
    ];

    const drawWave = (layer, accent, secondary) => {
      const yBase = h * layer.yPct;
      const breath = 1 + Math.sin(t * layer.breathSpeed) * layer.breathAmp;
      const amp = layer.amp * breath;

      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = yBase
          + Math.sin(x * layer.freq + t * layer.speed) * amp
          + Math.sin(x * layer.freq * layer.harmonic + t * layer.hSpeed) * amp * 0.4
          + Math.cos(x * layer.freq * 0.3 + t * layer.speed * 0.5) * amp * 0.2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, yBase - amp * 2, 0, h);
      grad.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${layer.alpha})`);
      grad.addColorStop(0.3, `rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, ${layer.alpha * 0.5})`);
      grad.addColorStop(0.7, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${layer.alpha * 0.1})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();
    };

    // --- Horizontal drift offset ---
    let drift = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const accent = getAccent();
      const c = hexToRgb(accent);
      const secondary = mixRgb(c, { r: 255, g: 255, b: 255 }, 0.3);

      drift += 0.15;

      // Draw curtains behind
      ctx.save();
      ctx.translate(Math.sin(drift * 0.01) * 20, 0);
      for (const curtain of CURTAINS) {
        drawCurtain(curtain, c, secondary);
      }
      ctx.restore();

      // Draw horizontal waves
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const layer of WAVE_LAYERS) {
        drawWave(layer, c, secondary);
      }
      ctx.restore();

      // Subtle top glow
      const topGlow = ctx.createRadialGradient(w * 0.5, 0, 0, w * 0.5, 0, w * 0.4);
      topGlow.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.025)`);
      topGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, w, h * 0.3);

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
