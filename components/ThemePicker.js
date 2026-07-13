'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const THEMES = [
  { id: 'dark', name: 'Midnight', bg: '#08080a', fg: '#f4f4ee', accent: '#c5fb45', desc: 'Default dark' },
  { id: 'terminal', name: 'Terminal', bg: '#0a0a0a', fg: '#33ff33', accent: '#33ff33', desc: 'Phosphor green' },
  { id: 'blueprint', name: 'Blueprint', bg: '#0a1628', fg: '#e8f0fe', accent: '#4da6ff', desc: 'Technical drawing' },
  { id: 'solarized', name: 'Solarized', bg: '#002b36', fg: '#839496', accent: '#b58900', desc: 'Warm dark' },
  { id: 'neon', name: 'Neon', bg: '#0a0012', fg: '#f0e6ff', accent: '#ff2d95', desc: 'Cyberpunk magenta' },
  { id: 'monochrome', name: 'Monochrome', bg: '#0a0a0a', fg: '#e8e8e8', accent: '#ffffff', desc: 'Pure black & white' },
  { id: 'sakura', name: 'Sakura', bg: '#1a0a12', fg: '#fce4ec', accent: '#ff6b9d', desc: 'Rose & pink' },
  { id: 'ocean', name: 'Ocean', bg: '#041a1a', fg: '#d4f5f0', accent: '#48d2be', desc: 'Deep teal' },
  { id: 'lavender', name: 'Lavender', bg: '#0e0a1a', fg: '#e8e0f8', accent: '#a078ff', desc: 'Soft purple' },
  { id: 'ember', name: 'Ember', bg: '#140800', fg: '#ffeedd', accent: '#ff6a1a', desc: 'Warm orange' },
  { id: 'arctic', name: 'Arctic', bg: '#e8f0f8', fg: '#0a1a2a', accent: '#2090d0', desc: 'Icy light blue' },
  { id: 'crimson', name: 'Crimson', bg: '#120408', fg: '#ffe8ec', accent: '#e03060', desc: 'Deep red' },
  { id: 'mint', name: 'Mint', bg: '#041210', fg: '#d8f8ee', accent: '#3cdca0', desc: 'Fresh green' },
  { id: 'amber', name: 'Amber', bg: '#120e04', fg: '#fff4e0', accent: '#e8b820', desc: 'Golden warm' },
  { id: 'light', name: 'Light', bg: '#faf9f4', fg: '#0a0a0b', accent: '#4d7a00', desc: 'Clean light' },
];

export default function ThemePicker({ currentTheme, onSelect, onClose, justOpened }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const onClick = (e) => {
      if (justOpened?.current) return;
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose, justOpened]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24" style={{ animation: 'fadeIn 0.15s ease' }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-72 rounded-2xl border border-white/[0.08] bg-elevated/95 p-4 shadow-2xl backdrop-blur-xl"
        style={{ animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-faint">Theme</span>
          <button onClick={onClose} className="text-faint hover:text-fg transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { onSelect(t.id); onClose(); }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                currentTheme === t.id
                  ? 'bg-accent/10 border border-accent/20'
                  : 'border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
              }`}
            >
              {/* Color preview */}
              <div className="flex gap-1">
                <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: t.bg }} />
                <span className="h-4 w-4 rounded-full border border-white/10" style={{ backgroundColor: t.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-fg">{t.name}</span>
                  {currentTheme === t.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </div>
                <span className="text-[11px] text-faint">{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
