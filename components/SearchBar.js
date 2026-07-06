'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initialValue = '', size = 'large' }) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [authHeaders, setAuthHeaders] = useState('');
  const [cookies, setCookies] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    const params = new URLSearchParams({ site: trimmed });
    if (authHeaders.trim()) params.set('headers', authHeaders.trim());
    if (cookies.trim()) params.set('cookies', cookies.trim());
    router.push(`/results?${params.toString()}`);
  };

  const isLarge = size === 'large';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`group relative flex items-center gap-2 rounded-2xl border bg-elevated transition-all duration-300 ${
          focused
            ? 'border-accent/50 shadow-[0_0_0_4px_var(--accent-soft)]'
            : 'border-border hover:border-border-strong'
        } ${isLarge ? 'p-2 pl-5' : 'p-1.5 pl-4'}`}
      >
        <svg
          className={`shrink-0 text-muted ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter a website URL (e.g. amazon.com)"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          className={`flex-1 bg-transparent font-mono outline-none placeholder:font-sans placeholder:text-faint ${
            isLarge ? 'text-base sm:text-lg' : 'text-sm'
          }`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-xl bg-accent font-medium text-black transition-all hover:brightness-110 active:scale-[0.98] ${
            isLarge ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-xs'
          }`}
        >
          Scan
          <span className="ml-1.5 opacity-60">↵</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setAdvanced(!advanced)}
        className="mt-2 flex items-center gap-1.5 text-xs text-faint hover:text-muted"
      >
        <svg
          className={`h-3 w-3 transition-transform ${advanced ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18 15 12 9 6" />
        </svg>
        Advanced
      </button>

      {advanced && (
        <div className="mt-3 space-y-3 rounded-xl border border-border bg-elevated/50 p-4">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-faint">
              Custom Headers (JSON)
            </label>
            <textarea
              value={authHeaders}
              onChange={(e) => setAuthHeaders(e.target.value)}
              placeholder='{"Authorization": "Bearer xxx", "X-API-Key": "yyy"}'
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs outline-none placeholder:text-faint focus:border-accent/50"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-faint">
              Cookies
            </label>
            <textarea
              value={cookies}
              onChange={(e) => setCookies(e.target.value)}
              placeholder="session=abc123; token=xyz"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs outline-none placeholder:text-faint focus:border-accent/50"
            />
          </div>
        </div>
      )}
    </form>
  );
}
