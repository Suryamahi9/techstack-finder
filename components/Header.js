'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/bookmarks', label: 'Bookmarks', icon: 'M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z' },
  { href: '/compare', label: 'Compare', icon: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3' },
  { href: '/trends', label: 'Trends', icon: 'M3 3v18h18M7 16l4-8 4 4 4-10' },
  { href: '/rules', label: 'Rules', icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  { href: '/api-keys', label: 'API', icon: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
  { href: '/bulk', label: 'Bulk', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { href: '/history', label: 'History', icon: 'M12 7v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { href: '/digest', label: 'Digest', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15' },
  { href: '/monitor', label: 'Monitor', icon: 'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'M12 15l-2 5-4-6h8l-2 1zM16 3l-4 8-2-4-4 6h16l-6-10z' },
  { href: '/radar', label: 'Radar', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 lg:left-1/2 lg:top-6 lg:w-auto lg:-translate-x-1/2">
        {/* Desktop nav — pill bar (lg+ only) */}
        <nav className="hidden lg:flex w-max max-w-[calc(100vw-2rem)] items-center gap-2 overflow-x-auto rounded-full border border-white/10 bg-bg/70 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl xl:gap-3 xl:px-5">
          <Link href="/" className="group mr-1 flex shrink-0 items-center gap-2">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-md bg-accent/15" />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7l8-4 8 4-8 4-8-4z" />
                <path d="M4 12l8 4 8-4M4 17l8 4 8-4" opacity="0.5" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              TechStack<span className="text-accent">Finder</span>
            </span>
          </Link>

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
            >
              {item.label}
            </Link>
          ))}

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
          >
            Source
          </a>
          <ThemeToggle />
        </nav>

        {/* Mobile + tablet nav — slim bar with hamburger */}
        <div className="flex lg:hidden items-center justify-between border-b border-white/[0.06] bg-bg/80 px-4 py-2.5 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-md bg-accent/15" />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7l8-4 8 4-8 4-8-4z" />
                <path d="M4 12l8 4 8-4M4 17l8 4 8-4" opacity="0.5" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              TechStack<span className="text-accent">Finder</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition-colors hover:text-fg"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-[52px] max-h-[calc(100vh-52px)] overflow-y-auto border-b border-white/[0.06] bg-bg/95 px-4 py-4 backdrop-blur-2xl">
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-muted transition-all hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-fg"
                >
                  <svg className="h-4 w-4 shrink-0 text-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm font-medium text-muted transition-all hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-fg"
              >
                <svg className="h-4 w-4 shrink-0 text-faint" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                Source
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
