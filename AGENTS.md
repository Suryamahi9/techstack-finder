# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000
npm run build    # Runs `prisma generate && next build` — schema changes auto-generate client
npm run start    # Production server
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

## Setup prerequisites
- Copy `.env` → set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and OAuth credentials (`GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`)
- Run `npx prisma migrate deploy` (or `prisma db push` for local) before first build — schema requires PostgreSQL
- Auth uses NextAuth v4 with Google/GitHub OAuth + custom credentials provider (`lib/auth.js` → `bcryptjs` hashing, Prisma User model)

## Architecture
- **Next.js 14.2.35 App Router** (no TypeScript) — home at `app/page.js`, results at `app/results/page.js`, API at `app/api/scan/route.js`
- **1,867 hand-crafted detection rules** in `lib/detect.js` (7,500+ lines) + **8,384 generated rules** loaded at runtime from `scripts/_generated_rules.json` (3.3MB JSON, lazy-loaded via `readFileSync` + `process.cwd()`)
- **269 category-to-type mappings** in `CATEGORY_TYPES` (frontend/backend/infra). ~100 unique category names across rules.
- **Deep scan** in `lib/deep-scan.js` (539 lines) — fetches CSS/JS files, probes 150+ common paths, uses Playwright headless browser when DOM < 50 elements. Browser default timeout: 20s. **Runs for ALL sites** (no e-commerce skip).
- **Remote browser fallback** — `browserScanRemote()` in `deep-scan.js` uses Browserless.io when local Playwright unavailable (Vercel). Requires `BROWSERLESS_API_KEY` env var.
- **Vercel-aware** — detects `process.env.VERCEL` to skip local browser scan, CSS/JS deep fetch, and path probes on serverless (Playwright binaries not available there). Fetch timeout reduced to 25s on Vercel.
- **Proxy support** — `undici.ProxyAgent` dynamically imported in `detect.js` and `deep-scan.js` when `proxy` option passed. `undici` is not a listed dependency (used via dynamic import only).
- **~67 client components** in `components/`, all `'use client'`
- **CSS variables** in `globals.css` (`:root` dark, `[data-theme='light']` light) referenced in `tailwind.config.js` via `var(--*)`. Never hardcode hex colors.
- **jsconfig.json** maps `@/*` → `./*`

## Pages (20 routes)
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.js` | Homepage — SearchBar, LiveScanPreview, FloatingLogos, CategoryGrid, TerminalScanner, ComparePreview |
| `/login` | `app/login/page.js` | Email + OAuth (Google/GitHub) login |
| `/signup` | `app/signup/page.js` | Email + OAuth signup (validates password length, POSTs `/api/auth/signup`) |
| `/browse` | `app/browse/page.js` | Browse technologies by category (static data from `lib/browse-data.json`) |
| `/results` | `app/results/page.js` | 5-tab results (Overview, Technologies, Analysis, Code, Tools) |
| `/site/[domain]` | `app/site/[domain]/page.js` | Public profile |
| `/radar` | `app/radar/page.js` | Full-page Tech Radar |
| `/leaderboard` | `app/leaderboard/page.js` | Top techs/sites/categories |
| `/monitor` | `app/monitor/page.js` | Site monitoring |
| `/compare` | `app/compare/page.js` | Side-by-side compare |
| `/history` | `app/history/page.js` | Scan history with diff |
| `/bookmarks` | `app/bookmarks/page.js` | Bookmarks |
| `/bulk` | `app/bulk/page.js` | Bulk scan |
| `/api-keys` | `app/api-keys/page.js` | API key management |
| `/trends` | `app/trends/page.js` | Scan trends (exports `saveScanTrend`) |
| `/rules` | `app/rules/page.js` | Rule browser |
| `/digest` | `app/digest/page.js` | Weekly digest |
| `/api/scan` | `app/api/scan/route.js` | POST scan endpoint |
| `/api/badge` | `app/api/badge/route.js` | Badge SVG endpoint |
| `/api/screenshot` | `app/api/screenshot/route.js` | Screenshot proxy |

## API
- `POST /api/scan` — `{ url: string, headers?: string (JSON), cookies?: string, timeout?: number, proxy?: string }` → `{ success, site, summary, categories, techByType, company?, pageMetadata?, seo?, performance?, security?, a11y?, responseHeaders?, cached? }`
- Returns `429` (rate limit: 10 anon/min/IP, 100 with `x-api-key`), `400` (bad input), `500` (scan failure)
- In-memory TTL cache: 10 min, max 2000 entries
- `maxDuration = 60` (Vercel serverless timeout)
- `GET /api/scan` returns usage info

## Scan flow
1. Client reads `?site=`, optional `?headers=`, `?cookies=`, `?proxy=` via `useSearchParams`. POSTs `/api/scan`.
2. Server: normalize URL → check cache → rate-limit by IP → fetch HTML (Cheerio, no JS execution) → detect challenge/blocked pages (5xx, Cloudflare markers) → auto-fallback to Playwright browser if blocked (skipped on Vercel) → run deep scan (CSS/JS fetch, path probes — skipped on Vercel) → run rule engine → return results.
3. **Fetch-failure fallback**: If `fetch()` throws a network error (not timeout), `detectTechnologies()` now tries `tryBrowserScan()` (local Playwright → remote Browserless) before giving up. This handles sites that aggressively block non-browser requests.
4. Client saves to localStorage `tsf-scan-history` (max 50), dispatches `tsf-scan-history-updated` event.
5. Technologies tab uses `TechTab.js` to split into **Main** (popular/high-confidence) vs **Rare** (niche/low-confidence) sub-tabs.

## Detection system
- Rules stored as `RULES` array in `lib/detect.js` (1,867 inline) + generated rules merged at module load via `getGenRules()`
- Generated rules in `scripts/_generated_rules.json` use `{p: "pattern", f: "flags"}` format — reconstructed to `new RegExp(p, f)` at load time
- `scripts/generate.js` (1,070 lines) has 204 template functions that expand `[name, category, typeKey]` entries from `scripts/data-fe.js`, `data-be.js`, `data-infra.js`, `data-content.js`
- Generated rules filtered at load: only high-confidence signal types kept (`script_src`, `meta_generator`, `header`, `css_content`, `js_content`, `link_tag`, `cookie`). Broad types (`html`, `browser_var`, `path_probe`) excluded.
- **Regex uses `new RegExp("...","i")` not `/regex/i` literals** — this is intentional to avoid `/` conflicts in names like `@headlessui/react`
- Pattern types: `html`, `header`, `script_src`, `meta_generator`, `cookie`, `css_class`, `link_tag`, `css_content`, `js_content`, `path_probe`, `browser_var`, `browser_network`, `browser_cookie`
- `path_probe` confidence is `medium` (not `high`) — catch-all routes return 200 for any path, causing false positives

## Theming
- **15 themes** stored in localStorage key `tsf-theme`, default dark. Supported: dark, terminal, blueprint, solarized, neon, monochrome, sakura, ocean, lavender, ember, arctic, crimson, mint, amber, light.
- `ThemePicker.js` renders via `createPortal(document.body)` to escape `backdrop-blur` containers
- `ThemeToggle.js` cycles themes. Both read/write localStorage and `data-theme` attribute.
- `BackgroundManager.js` renders 4 animated backgrounds (Mesh, Stars, Dust, Waves) switchable via localStorage key `tsf-bg`.
- `layout.js` uses `suppressHydrationWarning` on `<html>` — inline `<script>` sets `data-theme` from localStorage before React hydrates. The `<html>` default is `data-theme="dark"` — if you change it, both the inline script and ThemeToggle.js `useState('dark')` must match.

## Key components
- `TechTab.js` — Technologies sub-tab with Main/Rare split. Classification: `POPULAR_TECH` set (200+ names) or `confidence === 'high'` → main, else → rare.
- `Header.js` — Client component. Desktop pill bar (`lg+` breakpoint), spotlight hover, border glow, active state via `usePathname()`, scroll-aware darkening, mobile hamburger menu.
- `ResultsTabs.js` — Sticky tab bar (5 tabs), positioned below header.
- `StackVisualization.js` — Canvas force-directed graph of tech stack.
- `TechCard.js` — Responsive cards with dynamic width (min 280px, max 420px).
- `CategorySection.js` — Sticky sidebar + flex-wrap grid of TechCards per category.
- `TerminalScanner.js` — Animated terminal showing scan progress on homepage.
- `MouseGlow.js` — Two-layer accent glow orb following cursor with lerp + requestAnimationFrame.

## Gotchas
- **`useSearchParams` requires `<Suspense>` boundary** — results/page.js wraps `ResultsContent` in `<Suspense fallback={<Skeleton />}>`. Any new page using `useSearchParams` must follow the same pattern or build breaks.
- **No test suite** — manual verification only.
- **`confidence` from detect.js is a string** (`"high"`, `"medium"`) not a number — components must convert via `CONF_MAP` for display.
- **Animations** defined in `tailwind.config.js`: 13 animations including `animate-fade-up`, `animate-fade-in`, `animate-shimmer`, `animate-pulse-glow`, `animate-fade-in-view`, `animate-live-pulse`, `animate-fade-scale`, `animate-ping-slow`, `animate-float-subtle`, `animate-ticker-scroll`. Components set per-item `animationDelay` via inline style.
- **Fonts**: Space Grotesk (UI, `font-sans`) + JetBrains Mono (code, `font-mono`) loaded from Google Fonts in `globals.css`.
- **`next.config.js`** has `reactStrictMode: true`.
- **Decorative CSS classes** (pure visual, no functional impact): `.noise-overlay`, `.glow-orb`, `.grid-bg`, `.dot-grid-bg`, `.gradient-mesh`, `.scan-line`, `.scanner-ring`, `.scanner-sweep`, `.pulse-ring`, `.card-shimmer`, `.typewriter-cursor`, `.spotlight-card`, `.counter-number`.
- **Reusable utility class**: `.card-hover` for hover transitions on cards.
- **Scan history localStorage**: key is `tsf-scan-history` (NOT `tsf-history`), max 50 entries, dispatches `tsf-scan-history-updated`. `lib/scan-history.js` exports `getScanHistory`, `saveScanSnapshot`, `getHistoryForDomain`, `diffScans`, `clearScanHistory`.
- **Trends**: `app/trends/page.js` exports `saveScanTrend` — called from results page after scan completes.

## Hetzner Cloud Deployment

**Quick setup on a fresh Ubuntu 22.04/24.04 server (recommended: CAX11 arm64, 4 vCPU, 8GB, €5.29/mo):**

```bash
# SSH into your Hetzner server, then:
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```

**What the script does:** installs Node 20, nginx, PM2, clones repo, runs `prisma generate && next build`, configures nginx reverse proxy, sets up UFW firewall, optionally installs SSL via Let's Encrypt.

**After first deploy:** edit `/var/www/techstack-finder/.env` with your actual `DATABASE_URL`, `NEXTAUTH_SECRET`, OAuth credentials, then `pm2 restart techstack-finder`.

**Redeploy after updates:**
```bash
bash /var/www/techstack-finder/deploy/redeploy.sh
# Or manually:
cd /var/www/techstack-finder && git pull && npm run build && pm2 restart techstack-finder
```

**Key paths:**
| Path | Description |
|------|-------------|
| `/var/www/techstack-finder` | App directory |
| `/etc/nginx/sites-available/techstack-finder` | Nginx config |
| `/var/log/techstack-finder-*.log` | PM2 logs |
| `deploy/hetzner-setup.sh` | Full server setup script |
| `deploy/redeploy.sh` | Quick redeploy script |
| `deploy/ecosystem.config.js` | PM2 cluster config |

**PM2 commands:**
```bash
pm2 status                    # Check status
pm2 logs techstack-finder     # View logs
pm2 restart techstack-finder  # Restart app
pm2 monit                     # Live monitoring
```
