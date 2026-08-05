'use client';
import { useState, useRef, useEffect } from 'react';

export default function SectionGroup({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
  className = '',
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(defaultOpen ? 'auto' : 0);

  useEffect(() => {
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      setHeight(open ? h : 0);
    }
  }, [open, children]);

  const handleToggle = () => setOpen((prev) => !prev);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-border-strong ${className}`}
    >
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-border/40"
        aria-expanded={open}
      >
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-border/40 text-muted transition-colors group-hover:border-accent/20 group-hover:text-accent">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
          </span>
        )}

        <span className="flex-1 text-sm font-semibold text-fg/90">{title}</span>

        {badge != null && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-medium text-accent">{badge}</span>
        )}

        <svg
          className={`h-4 w-4 shrink-0 text-faint transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ height: height === 'auto' ? 'auto' : `${height}px` }}
      >
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
