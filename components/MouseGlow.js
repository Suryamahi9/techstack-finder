'use client';
import { useEffect, useRef, useState } from 'react';

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const raf = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      current.current.x = lerp(current.current.x, target.current.x, 0.08);
      current.current.y = lerp(current.current.y, target.current.y, 0.08);
      setPos({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, [visible]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[5] transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="absolute h-[500px] w-[500px] rounded-full"
        style={{
          left: pos.x - 250,
          top: pos.y - 250,
          background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          opacity: 0.07,
          filter: 'blur(40px)',
          willChange: 'transform',
        }}
      />
      <div
        className="absolute h-[200px] w-[200px] rounded-full"
        style={{
          left: pos.x - 100,
          top: pos.y - 100,
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
          opacity: 0.04,
          filter: 'blur(20px)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
