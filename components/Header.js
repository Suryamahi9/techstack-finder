import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <nav className="flex w-max items-center gap-5 rounded-full border border-white/10 bg-bg/70 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:gap-6 sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-7 w-7 items-center justify-center">
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
          <Link
            href="/bookmarks"
            className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmarks
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Compare
          </Link>
          <Link
            href="/trends"
            className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-10" />
            </svg>
            Trends
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs font-medium text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:text-fg active:scale-[0.97]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.06c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.93 10.93 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.68 5.38-5.24 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.66.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            Source
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
