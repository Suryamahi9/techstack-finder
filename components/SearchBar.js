'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const POPULAR_SITES = [
  'amazon.com', 'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
  'instagram.com', 'linkedin.com', 'reddit.com', 'wikipedia.org', 'github.com',
  'stackoverflow.com', 'netflix.com', 'twitch.tv', 'tiktok.com', 'pinterest.com',
  'microsoft.com', 'apple.com', 'zoom.us', 'slack.com', 'discord.com',
  'spotify.com', 'medium.com', 'notion.so', 'figma.com', 'canva.com',
  'shopify.com', 'wordpress.com', 'wix.com', 'squarespace.com', 'webflow.com',
  'stripe.com', 'paypal.com', 'airbnb.com', 'uber.com', 'lyft.com',
  'dropbox.com', 'adobe.com', 'salesforce.com', 'hubspot.com', 'mailchimp.com',
  'nytimes.com', 'bbc.com', 'cnn.com', 'forbes.com', 'bloomberg.com',
  'espn.com', 'imdb.com', 'etsy.com', 'ebay.com', 'aliexpress.com',
  'flipkart.com', 'booking.com', 'tripadvisor.com', 'yelp.com', 'quora.com',
  'dribbble.com', 'behance.net', 'dev.to', 'vercel.com', 'netlify.com',
  'heroku.com', 'digitalocean.com', 'aws.amazon.com', 'cloud.google.com', 'azure.microsoft.com',
  'openai.com', 'anthropic.com', 'midjourney.com', 'chat.openai.com',
  'tumblr.com', 'flickr.com', 'vimeo.com', 'dailymotion.com', 'soundcloud.com',
  'substack.com', 'ghost.org', 'hashnode.dev', 'codepen.io', 'codesandbox.io',
  'kaggle.com', 'huggingface.co', 'replit.com', 'glitch.com', 'runkit.com',
  'craigslist.org', 'zillow.com', 'redfin.com', 'glassdoor.com', 'indeed.com',
  'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'duolingo.com',
  'rumble.com', 'odysee.com', 'patreon.com', 'gumroad.com', 'tesla.com',
  'nasa.gov', 'who.int', 'un.org', 'imf.org', 'worldbank.org',
  'roblox.com', 'mojang.com', 'epicgames.com', 'steampowered.com', 'blizzard.com',
  'nike.com', 'adidas.com', 'lego.com', 'ikea.com', 'samsung.com',
  'sony.com', 'nvidia.com', 'amd.com', 'intel.com', 'ibm.com',
  'oracle.com', 'cisco.com', 'vmware.com', 'mongodb.com', 'docker.com',
];

export default function SearchBar({ initialValue = '', size = 'large' }) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [advanced, setAdvanced] = useState(false);
  const [authHeaders, setAuthHeaders] = useState('');
  const [cookies, setCookies] = useState('');
  const [proxy, setProxy] = useState('');
  const router = useRouter();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    const isExactMatch = POPULAR_SITES.includes(q);

    const matches = POPULAR_SITES
      .filter((s) => s.includes(q) && s !== q)
      .slice(0, isExactMatch ? 6 : 7);

    return matches;
  }, [value]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [value]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    const params = new URLSearchParams({ site: trimmed });
    if (authHeaders.trim()) params.set('headers', authHeaders.trim());
    if (cookies.trim()) params.set('cookies', cookies.trim());
    if (proxy.trim()) params.set('proxy', proxy.trim());
    router.push(`/results?${params.toString()}`);
  };

  const selectSuggestion = (site) => {
    setValue(site);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const isLarge = size === 'large';
  const trimmedValue = value.trim().toLowerCase();
  const isValidInput = trimmedValue.length > 0 && trimmedValue.includes('.');

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
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
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => { setFocused(true); setShowSuggestions(true); }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
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

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {isValidInput && (
            <button
              type="button"
              onMouseDown={handleSubmit}
              className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-left text-sm font-mono transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 dark:text-white">Scan <span className="font-semibold">{trimmedValue}</span></span>
            </button>
          )}

          {suggestions.map((site, i) => (
            <button
              key={site}
              type="button"
              onMouseDown={() => selectSuggestion(site)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-mono transition-colors ${
                i === selectedIndex
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="h-3.5 w-3.5 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {site}
            </button>
          ))}

          {!isValidInput && suggestions.length === 0 && (
            <div className="px-4 py-3 text-center text-xs text-gray-400 dark:text-gray-500">
              Type a website URL to scan (e.g. flipkart.com)
            </div>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className="flex items-center gap-1.5 text-xs text-faint hover:text-muted"
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
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-faint">
          <span className="text-[9px]">/</span> to scan
        </kbd>
      </div>

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
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-faint">
              Proxy URL
            </label>
            <input
              type="text"
              value={proxy}
              onChange={(e) => setProxy(e.target.value)}
              placeholder="http://user:pass@proxy-host:port"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs outline-none placeholder:text-faint focus:border-accent/50"
            />
          </div>
        </div>
      )}
    </form>
  );
}
