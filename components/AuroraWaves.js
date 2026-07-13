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

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const drawWave = (yBase, amplitude, frequency, speed, alpha, color) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) {
        const y = yBase + Math.sin(x * frequency + t * speed) * amplitude
                      + Math.sin(x * frequency * 0.5 + t * speed * 0.7) * amplitude * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, yBase - amplitude, 0, h);
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      grad.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.3})`);
      grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const accent = getAccent();
      const c = hexToRgb(accent);

      drawWave(h * 0.82, 30, 0.003, 0.4, 0.06, c);
      drawWave(h * 0.85, 25, 0.004, 0.55, 0.04, c);
      drawWave(h * 0.88, 20, 0.005, 0.7, 0.03, c);

      t += 0.02;
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
      style={{ zIndex: 0, opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
