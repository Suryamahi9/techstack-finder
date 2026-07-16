'use client';
import { useState, useEffect, useRef } from 'react';
import ThemePicker from './ThemePicker';

const ICONS = {
  dark: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  terminal: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  blueprint: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
    </svg>
  ),
  solarized: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  light: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState('lavender');
  const [open, setOpen] = useState(false);
  const justOpened = useRef(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme') || 'lavender';
    setTheme(current);
  }, []);

  const select = (id) => {
    setTheme(id);
    document.documentElement.setAttribute('data-theme', id);
    try {
      localStorage.setItem('tsf-theme', id);
    } catch {}
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!open) {
      justOpened.current = true;
      setTimeout(() => { justOpened.current = false; }, 100);
    }
    setOpen(!open);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        aria-label="Change theme"
        className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-elevated text-fg transition-colors hover:border-border-strong"
        title="Change theme"
      >
        {ICONS[theme] || ICONS.dark}
      </button>

      {open && (
        <ThemePicker
          currentTheme={theme}
          onSelect={select}
          onClose={() => setOpen(false)}
          justOpened={justOpened}
        />
      )}
    </>
  );
}
