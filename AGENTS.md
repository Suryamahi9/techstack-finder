# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

## Architecture
- **Next.js 14 App Router** (no TypeScript) — home at `/app/page.js`, results at `/app/results/page.js`, API at `/app/api/scan/route.js`
- **1,290 detection rules** in `/lib/detect.js` across **60+ categories** (24 frontend, 18 backend, 13 infra + payment processors, e-commerce, captcha, email, comments, monitoring, etc). `CATEGORY_TYPES` map tags each as `frontend`/`backend`/`infra`. Default fetch timeout: 25s. Pattern types: `html`, `header`, `script_src`, `meta_generator`, `cookie`, `css_class`, `link_tag`, `css_content`, `js_content`, `path_probe`, `browser`, `browser_var`, `browser_network`, `browser_cookie`.
- **Deep scan** in `/lib/deep-scan.js` — fetches CSS/JS files, probes 35+ common paths, and uses Playwright headless browser when DOM is thin (<50 elements). Browser captures globals, network requests, localStorage, cookies.
- **16 client components** in `/components/`, all `'use client'`
- **CSS variables** in `globals.css` (`:root` dark, `[data-theme='light']` light) referenced in `tailwind.config.js` via `var(--*)`. Never hardcode hex colors.
- **jsconfig.json** maps `@/*` → `./*`
- **Theme** stored in localStorage key `tsf-theme`, default dark. Toggle via `ThemeToggle.js`.
- **Utility hook**: `lib/useInView.js` — IntersectionObserver wrapper used by homepage sections for scroll-triggered animations.

## API
- `POST /api/scan` — `{ url: string, headers?: string (JSON), cookies?: string, timeout?: number }` → `{ success, site, summary, categories, techByType, company?, pageMetadata?, seo?, performance?, security?, responseHeaders?, cached? }`
- Returns `429` (rate limit: 10 req/min/IP), `400` (bad input), `500` (scan failure)
- In-memory TTL cache: 10 min, max 2000 entries
- `maxDuration = 30` (Vercel serverless timeout)
- `GET /api/scan` returns usage info

## Scan flow (results page)
1. Client reads `?site=` via `useSearchParams`. Optional `?headers=` (JSON) and `?cookies=` for auth. POSTs `/api/scan`.
2. Server normalizes URL (auto-prepends `https://`), checks cache, rate-limits by IP, fetches HTML (25s default timeout, Cheerio — no browser JS), runs rule engine.
3. Returns categorized tech lists. Client saves to localStorage `tsf-history` (max 5), dispatches `tsf-history-updated` event.

## Gotchas
- **`useSearchParams` requires `<Suspense>` boundary** — results/page.js wraps `ResultsContent` in `<Suspense fallback={<Skeleton />}>`. Any new page using `useSearchParams` must follow the same pattern or build breaks.
- **No test suite** — manual verification only.
- **False positive prevention**: HTML patterns that look for JS method calls (`axios.get`, `motion.div`) or overly short keywords (`aem`, `mage`) are removed to avoid inaccurate detections.
- **Animations** defined in `tailwind.config.js`: `animate-fade-up`, `animate-fade-in`, `animate-shimmer`, `animate-pulse-glow`, etc. Components set per-item `animationDelay` via inline style.
- **Fonts**: Space Grotesk (UI, `font-sans`) + JetBrains Mono (code, `font-mono`) loaded from Google Fonts in `globals.css`.
- **`next.config.js`** has `reactStrictMode: true`.
- **`layout.js` uses `suppressHydrationWarning`** on `<html>` because an inline `<script>` sets `data-theme` from localStorage before React hydrates. The `<html>` default is `data-theme="dark"` — if you change the default, both the inline script and the ThemeToggle.js `useState('dark')` must match.
- **Decorative CSS classes** (pure visual, no functional impact): `.noise-overlay`, `.glow-orb`, `.grid-bg`, `.dot-grid-bg`, `.gradient-mesh`, `.scan-line`, `.scanner-ring`, `.scanner-sweep`, `.pulse-ring`, `.card-shimmer`, `.typewriter-cursor`, `.spotlight-card`, `.counter-number`.
- **Reusable utility class**: `.card-hover` for hover transitions on cards.
