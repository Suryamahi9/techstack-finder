# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint (Next.js config)
```

## Architecture
- **Next.js 14 App Router** — `/app/page.js` (home), `/app/results/page.js` (results), `/app/api/scan/route.js` (POST endpoint)
- **Detection engine** — `/lib/detect.js`: 400+ regex rules across 55 categories. Each rule tagged as `frontend`, `backend`, or `infra` via `CATEGORY_TYPES` map. Also extracts company info (JSON-LD, OG, schema.org, social links), page metadata, SEO analysis (title, desc, headings, images, links, OG, structured data, scoring), performance headers (compression, cache, keep-alive, HTTP version), and security headers (CSP, HSTS, XFO, etc.).
- **15 client components** in `/components`, all `'use client'`
- **CSS theme**: CSS variables in `globals.css` (`:root` for dark, `[data-theme='light']` for light) mapped in `tailwind.config.js` via `var(--*)`. Never hardcode hex colors in components.

## Categories (55 total)
Types: `frontend` (24 categories), `backend` (18), `infra` (13). See `CATEGORY_TYPES` map in `lib/detect.js:1967`.

## Detection rule counts (~630 total)
See section comments in `lib/detect.js`. Major additions by category:
- **CSS Framework** (18 rules) — Bulma, Foundation, Materialize, Spectre, Tachyons, Chakra UI, MUI, Ant Design, Semantic UI, Radix UI, Headless UI, NextUI, Prime UI, UnoCSS, Windi CSS, Open Props + Bootstrap & Tailwind CSS moved here from JS Library
- **Analytics** (+3) — Microsoft Clarity, Pirsch, Countly
- **Frontend Framework** (+3) — SvelteKit, Riot.js, Aurelia
- **JavaScript Library** (+9) — Day.js, date-fns, Redux, NProgress, TanStack Query, tRPC, React Hook Form, TanStack Table, Sonner
- **Backend Framework** (+7) — Hono, Elysia, Fastify, Hapi.js, RedwoodJS, Blitz.js, Wasp
- **CMS** (+4) — Payload CMS, Wagtail, Apostrophe CMS, PocketBase
- **Email** (+3) — Resend, Loops, Buttondown
- **Developer Tools** (+5) — Vite, Appwrite, Coolify, Ngrok, OpenNext
- **Marketing** (+2) — Beehiiv, Usermaven

## Scan flow (results page)
1. Client reads `?site=` via `useSearchParams`. Optional `?headers=` (JSON) and `?cookies=` for auth. POSTs `/api/scan`.
2. Server normalizes URL, checks in-memory TTL cache (10 min), rate-limits (10 req/min/IP), fetches HTML (8s default timeout), parses with Cheerio, runs rule engine.
3. Returns categorized tech list + `techByType` (frontend/backend/infra) + company + SEO + metadata + performance + security + `cached` flag.
4. Client saves to localStorage `tsf-history` (max 5), dispatches `tsf-history-updated` event.

## Gotchas
- **`useSearchParams` requires `<Suspense>` boundary** — results/page.js wraps `ResultsContent` in `<Suspense fallback={<Skeleton />}>`. Adding another page that calls `useSearchParams` must follow the same pattern or it will break at build time.
- **CSS variables are the single source of truth** for theme colors. They're defined in `globals.css` under `:root` (dark) and `[data-theme='light']`, then referenced in `tailwind.config.js` via `var(--*)`. Never hardcode hex colors in components.
- **Decorative CSS** — `.noise-overlay`, `.glow-orb`, `.grid-bg` are purely decorative; `.card-hover` is a reusable utility class for hover transitions.
- **Custom animations** defined in `tailwind.config.js`: `animate-fade-up`, `animate-fade-in`, `animate-shimmer`, `animate-pulse-glow`. Components set per-item `animationDelay` via inline `style={{ animationDelay: ... }}`.
- **Fonts**: Space Grotesk (UI, via `font-sans`) + JetBrains Mono (code, via `font-mono`) — loaded from Google Fonts in `globals.css`.
- **No TypeScript** — `jsconfig.json` maps `@/*` → `./*`.
- **No test suite** — manual verification only.
- **False positive prevention**: HTML patterns that look for JS method calls (axios.get, motion.div, etc.) or overly short keywords (aem, mage, etc.) are removed to avoid inaccurate detections.

## Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
# 1. Push to GitHub
# 2. Import repo to Vercel
# 3. Framework preset: Next.js
# 4. Environment variables: none required

# Or manual zip deploy:
# 1. Run: npm run build
# 2. Exclude: .next, node_modules, .git
# 3. Zip and deploy to Node host
```

## API
- **POST /api/scan** — `{ url: string, headers?: string (JSON), cookies?: string, timeout?: number }`
- Returns: `{ success, site, summary (includes frontend/backend/infra counts), categories, techByType: { frontend, backend, infra }, company?, pageMetadata?, seo?, performance?, security?, responseHeaders?, cached? }`
