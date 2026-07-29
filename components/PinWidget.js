'use client';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'tsf-pinned-widgets';

function getPinned() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function savePinned(widgets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
}

export default function PinWidget({ id, title, category }) {
  const router = useRouter();
  const pinned = getPinned();
  const isPinned = pinned.some((p) => p.id === id);

  const toggle = () => {
    let list = getPinned();
    if (isPinned) {
      list = list.filter((p) => p.id !== id);
    } else {
      list.push({ id, title, category, pinnedAt: Date.now() });
    }
    savePinned(list);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all duration-300 active:scale-95 ${
        isPinned
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-white/10 bg-white/5 text-muted hover:border-accent/20 hover:text-fg'
      }`}
      title={isPinned ? 'Remove from dashboard' : 'Pin to dashboard'}
    >
      <svg className={`h-3 w-3 transition-all ${isPinned ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {isPinned ? 'Pinned' : 'Pin'}
    </button>
  );
}
