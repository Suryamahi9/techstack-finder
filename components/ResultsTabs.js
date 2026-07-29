'use client';

const TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  },
  {
    id: 'tech',
    label: 'Technologies',
    icon: <><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></>,
  },
  {
    id: 'code',
    label: 'Code',
    icon: <><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></>,
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  },
];

export default function ResultsTabs({ active, onChange, summary }) {
  return (
    <div className="sticky top-16 z-30 mb-6 -mx-4 sm:top-20 sm:mx-0">
      <div className="flex items-center gap-1 overflow-x-auto rounded-none border-b border-white/[0.06] bg-bg/80 px-4 py-0 backdrop-blur-xl sm:rounded-xl sm:border sm:border-border sm:bg-elevated/80 sm:p-1 sm:px-0 sm:justify-center" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-1 sm:gap-0">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all duration-200 sm:px-3 sm:py-1.5 ${
                  isActive
                    ? 'bg-accent/10 text-accent shadow-sm shadow-accent/5'
                    : 'text-muted hover:text-fg hover:bg-white/[0.03]'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
              >
                <span className="hidden sm:inline h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.id === 'tech' && summary?.total > 0 && (
                  <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent transition-all duration-300">
                    {summary.total}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent transition-all duration-300 sm:inset-x-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
