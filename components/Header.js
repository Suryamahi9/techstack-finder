'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { NAV } from '../lib/site-nav';

function Caret({ open }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function DropdownPanel({ item, onNavigate }) {
  // The outer absolutely-positioned wrapper sits at `top-full` with no margin,
  // so the whole area between the trigger and the panel (including the visual
  // gap) is covered by a descendant — moving the cursor down into the panel
  // never leaves the hover region and the menu stays open.
  if (item.panel === 'mega') {
    return (
      <div className="absolute left-0 top-full z-50 pt-2">
        <div className="w-[620px] rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="grid grid-cols-3 gap-8">
            {item.columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">{col.heading}</p>
                <ul className="space-y-3">
                  {col.items.map((it) => (
                    <li key={`${it.href}-${it.label}`}>
                      <Link href={it.href} onClick={onNavigate} className="group block">
                        <span className="text-[12px] font-medium text-fg transition-colors group-hover:text-accent">{it.label}</span>
                        {it.desc && (
                          <span className="mt-0.5 block text-[11px] leading-snug text-muted">{it.desc}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 pt-2">
      <div className="w-60 rounded-lg border border-border bg-surface py-2 shadow-sm">
        {item.items.map((it) => (
          <Link
            key={`${it.href}-${it.label}`}
            href={it.href}
            onClick={onNavigate}
            className="block px-4 py-2 text-[12px] text-muted transition-colors hover:bg-border/40 hover:text-fg"
          >
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-[5px] border border-border-strong">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-fg" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7l8-4 8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4M4 17l8 4 8-4" opacity="0.5" />
        </svg>
      </span>
      <span className="text-[14px] font-semibold tracking-tight text-fg">
        TechStack<span className="text-muted">Finder</span>
      </span>
    </Link>
  );
}

function GitHubLink() {
  return (
    <a
      href="https://github.com"
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-fg"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.694.801.576C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
      </svg>
      Source
    </a>
  );
}

function UserMenu({ session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-[12px] font-medium text-fg transition-colors hover:border-border-strong"
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt="" width={20} height={20} className="h-5 w-5 rounded-full" unoptimized />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border-strong text-[10px] font-semibold">
            {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
          </span>
        )}
        <span className="hidden xl:inline">{session.user?.name || session.user?.email?.split('@')[0]}</span>
        <Caret open={open} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface py-1.5 shadow-sm">
          <div className="mb-1.5 border-b border-border px-3 pb-2">
            <div className="truncate text-[12px] font-medium text-fg">{session.user?.name || 'User'}</div>
            <div className="truncate text-[11px] text-faint">{session.user?.email}</div>
            {session.user?.tier && session.user.tier !== 'free' && (
              <span className="mt-1 inline-block rounded-full border border-border-strong px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted">{session.user.tier}</span>
            )}
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-border/40 hover:text-fg">Settings</Link>
          <Link href="/api-keys" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-border/40 hover:text-fg">API Keys</Link>
          <Link href="/history" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-border/40 hover:text-fg">Scan History</Link>
          <Link href="/dashboard" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-border/40 hover:text-fg">Dashboard</Link>
          {session.user?.tier === 'free' && (
            <Link href="/pricing" onClick={() => setOpen(false)} className="block px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border/40">Upgrade Plan</Link>
          )}
          <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }} className="w-full px-3 py-1.5 text-left text-[12px] text-tag-red-fg transition-colors hover:bg-border/40">Sign out</button>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordion, setAccordion] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setActiveMenu(null); setMobileOpen(false); } };
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setActiveMenu(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const closeAll = () => setActiveMenu(null);

  return (
    <>
      {/* Desktop nav — mega menus */}
      <header className={`fixed left-0 right-0 top-0 z-50 hidden border-b transition-colors duration-300 lg:block ${
        scrolled ? 'border-border bg-bg/95' : 'border-border/60 bg-bg/85'
      }`}>
        <nav ref={navRef} aria-label="Main navigation" className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-6">
          <Logo />

          <div className="flex items-center gap-0.5">
            {NAV.map((item) =>
              item.href ? (
                <Link
                  key={item.key}
                  href={item.href}
                  className="relative shrink-0 px-2.5 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item.key)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button
                    type="button"
                    aria-expanded={activeMenu === item.key}
                    aria-haspopup="true"
                    onClick={() => setActiveMenu(activeMenu === item.key ? null : item.key)}
                    onFocus={() => setActiveMenu(item.key)}
                    className={`relative flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                      activeMenu === item.key ? 'text-fg' : 'text-muted hover:text-fg'
                    }`}
                  >
                    {item.label}
                    <Caret open={activeMenu === item.key} />
                  </button>
                  {activeMenu === item.key && <DropdownPanel item={item} onNavigate={closeAll} />}
                </div>
              )
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <GitHubLink />
            {session ? (
              <UserMenu session={session} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:border-border-strong hover:text-fg">
                  Sign in
                </Link>
                <Link href="/signup" className="rounded-md bg-accent px-3 py-1.5 text-[12px] font-medium text-bg transition-opacity hover:opacity-90">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile + tablet nav */}
      <header className={`fixed left-0 right-0 top-0 z-50 border-b lg:hidden ${
        scrolled ? 'border-border bg-bg/95' : 'border-border/60 bg-bg/85'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            {session ? (
              <Link href="/settings" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-[12px] font-semibold text-fg">
                {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
              </Link>
            ) : (
              <Link href="/login" className="rounded-md border border-border px-3 py-1.5 text-[12px] font-medium text-fg">
                Sign in
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg transition-colors hover:border-border-strong"
              aria-label="Toggle menu"
            >
              <span className={`relative h-4 w-4 transition-all duration-300 ${mobileOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
              <span className={`absolute h-4 w-4 transition-all duration-300 ${mobileOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-fg/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 right-0 top-[49px] max-h-[calc(100vh-49px)] overflow-y-auto border-b border-border bg-bg px-4 py-4">
            <div className="flex flex-col">
              {NAV.map((item, i) =>
                item.href ? (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between border-b border-border/50 px-1 py-3 text-sm font-medium transition-colors ${
                      pathname === item.href ? 'text-fg' : 'text-muted hover:text-fg'
                    }`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      onClick={() => setAccordion(accordion === item.key ? null : item.key)}
                      className="flex w-full items-center justify-between px-1 py-3 text-sm font-medium text-muted hover:text-fg"
                      aria-expanded={accordion === item.key}
                    >
                      {item.label}
                      <Caret open={accordion === item.key} />
                    </button>
                    {accordion === item.key && (
                      <div className="pb-3 pl-3">
                        {(item.panel === 'mega' ? item.columns.flatMap((c) => c.items) : item.items).map((it) => (
                          <Link
                            key={`${it.href}-${it.label}`}
                            href={it.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 text-[13px] text-muted transition-colors hover:text-fg"
                          >
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-1 py-3 text-sm font-medium text-muted hover:text-fg"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.694.801.576C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                </svg>
                Source
              </a>
              {session ? (
                <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
                  <div className="px-1 pb-1 text-xs text-faint">{session.user?.name || session.user?.email}</div>
                  <button onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }} className="px-1 py-2 text-left text-sm font-medium text-tag-red-fg">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-2 border-t border-border pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-md border border-border py-2 text-center text-sm font-medium text-fg">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 rounded-md bg-accent py-2 text-center text-sm font-medium text-bg">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
