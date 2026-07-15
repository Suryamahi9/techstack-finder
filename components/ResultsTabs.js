'use client';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '◎' },
  { id: 'tech', label: 'Technologies', icon: '◆' },
  { id: 'analysis', label: 'Analysis', icon: '◈' },
  { id: 'code', label: 'Code', icon: '◇' },
  { id: 'tools', label: 'Tools', icon: '▣' },
];

export default function ResultsTabs({ active, onChange, summary }) {
  return (
    <div className="sticky top-16 z-30 mb-6 sm:top-20">
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-elevated/80 p-1 backdrop-blur-xl sm:justify-center" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent shadow-sm shadow-accent/5'
                  : 'text-muted hover:text-fg hover:bg-white/[0.03]'
              }`}
            >
              <span className="text-[10px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'tech' && summary?.total > 0 && (
                <span className="ml-0.5 rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">{summary.total}</span>
              )}
              {isActive && (
                <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
