export default function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent/15">
              <svg viewBox="0 0 24 24" className="h-3 w-3 text-accent" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7l8-4 8 4-8 4-8-4z" />
              </svg>
            </span>
            <span>
              Built by <span className="font-medium text-fg">MAHENDRA SURYA</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted sm:gap-4">
            <span className="hidden sm:inline">Server-side scanning · No tracking</span>
            <span className="sm:hidden">v1.0.0</span>
            <span className="hidden h-1 w-1 rounded-full bg-faint sm:block" />
            <span className="font-mono">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
