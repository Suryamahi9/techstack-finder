'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/compare', label: 'Compare' },
  { href: '/trends', label: 'Trends' },
  { href: '/rules', label: 'Rules' },
  { href: '/api-keys', label: 'API' },
  { href: '/bulk', label: 'Bulk' },
  { href: '/history', label: 'History' },
  { href: '/digest', label: 'Digest' },
  { href: '/monitor', label: 'Monitor' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/browse', label: 'Browse' },
  { href: '/radar', label: 'Radar' },
];

function NavLink({ item, isActive }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <Link
      ref={ref}
      href={item.href}
      onMouseMove={handleMouseMove}
      className={`nav-spotlight relative flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] ${
        isActive
          ? 'border border-accent/25 bg-accent/10 text-accent shadow-[0_0_12px_-3px_var(--accent-glow)]'
          : 'border border-white/5 bg-white/5 text-muted hover:border-accent/15 hover:text-fg'
      }`}
    >
      {isActive && (
        <span className="absolute -left-0.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-accent logo-dot" />
      )}
      {item.label}
    </Link>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      {/* Desktop nav — animated pill bar */}
      <header className="fixed left-0 right-0 top-0 z-50 hidden lg:block">
        <div className="mx-auto w-max max-w-[calc(100vw-2rem)] pt-6">
          <nav
            className={`header-pill header-border-glow nav-spotlight flex items-center gap-1.5 overflow-x-auto rounded-full border px-4 py-2 backdrop-blur-2xl transition-all duration-500 xl:gap-2 xl:px-5 ${
              scrolled
                ? 'border-white/[0.08] bg-bg/80 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'border-white/[0.06] bg-bg/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
            }`}
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const rect = el.getBoundingClientRect();
              el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
              el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
            }}
          >
            {/* Logo */}
            <Link href="/" className="group mr-2 flex shrink-0 items-center gap-2.5">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <span className="absolute inset-0 rounded-lg bg-accent/15 transition-all duration-300 group-hover:bg-accent/25 group-hover:shadow-[0_0_16px_-2px_var(--accent-glow)]" />
                <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7l8-4 8 4-8 4-8-4z" />
                  <path d="M4 12l8 4 8-4M4 17l8 4 8-4" opacity="0.5" />
                </svg>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                TechStack<span className="text-accent">Finder</span>
              </span>
            </Link>

            {/* Separator */}
            <span className="h-4 w-px shrink-0 bg-white/[0.08]" />

            {/* Nav links */}
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}

            {/* Separator */}
            <span className="h-4 w-px shrink-0 bg-white/[0.08]" />

            {/* Source */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="nav-spotlight flex shrink-0 items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted transition-all duration-300 hover:border-accent/15 hover:text-fg active:scale-[0.95]"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
              Source
            </a>

            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Mobile + tablet nav — animated bar */}
      <header className="fixed left-0 right-0 top-0 z-50 lg:hidden">
        <div className={`header-mobile-bar flex items-center justify-between border-b px-4 py-2.5 backdrop-blur-2xl transition-all duration-300 ${
          scrolled
            ? 'border-white/[0.08] bg-bg/85 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)]'
            : 'border-white/[0.04] bg-bg/60'
        }`}>
          <Link href="/" className="flex items-center gap-2.5">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition-all duration-300 hover:text-fg hover:border-accent/20 active:scale-95"
              aria-label="Toggle menu"
            >
              <span className={`absolute h-4 w-4 transition-all duration-300 ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              <span className={`absolute h-4 w-4 transition-all duration-300 ${open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay — slide down with stagger */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[52px] max-h-[calc(100vh-52px)] overflow-y-auto border-b border-white/[0.06] bg-bg/95 px-4 py-4 backdrop-blur-2xl">
            <div className="space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-white/[0.04] hover:text-fg ${
                    pathname === item.href
                      ? 'border-accent/15 bg-accent/[0.05] text-accent'
                      : 'border-transparent text-muted'
                  }`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {pathname === item.href && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent logo-dot" />
                  )}
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
