# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000
npm run build    # Runs `prisma generate && next build` — schema changes auto-generate client
npm run start    # Production server
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

## Setup prerequisites
- Copy `.env` → set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **`DATABASE_URL` contains `[YOUR-PASSWORD]` placeholder** — must be replaced before first build or migration
- OAuth: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` (optional)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`, `STRIPE_ENTERPRISE_PRICE_ID` (optional for billing)
- Email: `RESEND_API_KEY`, `EMAIL_FROM` (optional for password reset/welcome emails)
- Browser: `BROWSERLESS_API_KEY` (optional for remote Playwright on Vercel)
- Run `npx prisma migrate dev --name init` (or `prisma db push` for local) before first build — schema requires PostgreSQL
- Build command is `prisma generate && next build` (defined in `package.json` scripts.build)

## Architecture
- **Next.js 14.2.35 App Router** (no TypeScript) — 24 pages, 22 API routes, 64 components
- **1,870 hand-crafted detection rules** in `lib/detect.js` (7,179 lines) + **8,384 generated rules** loaded at runtime from `scripts/_generated_rules.json` (3.3MB JSON, lazy-loaded via `readFileSync` + `process.cwd()`)
- **270 category-to-type mappings** in `CATEGORY_TYPES` (frontend/backend/infra)
- **Deep scan** in `lib/deep-scan.js` — fetches CSS/JS files, probes 150+ common paths, uses Playwright headless browser when DOM < 50 elements. Browser default timeout: 20s. **Runs for ALL sites** (no e-commerce skip).
- **Remote browser fallback** — `browserScanRemote()` in `deep-scan.js` uses Browserless.io when local Playwright unavailable (Vercel). Requires `BROWSERLESS_API_KEY` env var.
- **Vercel-aware** — `detectTechnologies()` in `detect.js` detects `process.env.VERCEL` to skip local browser scan, CSS/JS deep fetch, and path probes on serverless (Playwright binaries not available there). Fetch timeout reduced to 25s on Vercel.
- **Proxy support** — `undici.ProxyAgent` dynamically imported in `detect.js` and `deep-scan.js` when `proxy` option passed. `undici` is not a listed dependency (used via dynamic import only).
- **CSS variables** in `globals.css` (`:root` dark, `[data-theme='light']` light) referenced in `tailwind.config.js` via `var(--*)`. Never hardcode hex colors.
- **jsconfig.json** maps `@/*` → `./*`

## Pages (24 routes)
| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.js` | Homepage — hero, search, animated stats, use cases, terminal scanner |
| `/login` | `app/login/page.js` | Email + OAuth (Google/GitHub) login |
| `/signup` | `app/signup/page.js` | Email + OAuth signup |
| `/forgot-password` | `app/forgot-password/page.js` | Request password reset email |
| `/reset-password` | `app/reset-password/page.js` | Set new password with token (requires `?token=`) |
| `/pricing` | `app/pricing/page.js` | 3-tier pricing (Free/Pro/Enterprise) with FAQ |
| `/settings` | `app/settings/page.js` | Account settings, subscription, password change, delete account |
| `/results` | `app/results/page.js` | 5-tab results (Overview, Technologies, Analysis, Code, Tools) |
| `/browse` | `app/browse/page.js` | Browse technologies by category (static data from `lib/browse-data.json`) |
| `/site/[domain]` | `app/site/[domain]/page.js` | Public tech profile |
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
| `/backlinks` | `app/backlinks/page.js` | Backlink checker with tool integration |
| `/docs` | `app/docs/page.js` | API documentation with code examples |
| `/admin` | `app/admin/page.js` | Admin dashboard (role-gated: `role === 'admin'`) |

## API Routes (22 routes)
| Route | Methods | Description |
|-------|---------|-------------|
| `/api/scan` | POST/GET | Scan a website. POST body: `{ url, headers?, cookies?, timeout?, proxy? }` |
| `/api/badge` | GET | SVG badge for a domain. Params: `?domain=&theme=&format=` |
| `/api/screenshot` | GET | Screenshot proxy. Params: `?url=&viewport=` |
| `/api/api-keys` | GET/POST/DELETE | Server-side API key CRUD (DB-backed) |
| `/api/bookmarks` | GET/POST/DELETE | Bookmark CRUD (DB-backed) |
| `/api/history` | GET/POST/DELETE | Scan history CRUD (DB-backed) |
| `/api/monitors` | GET/POST/DELETE | Monitor CRUD (DB-backed) |
| `/api/custom-rules` | GET/POST/DELETE | Custom detection rules CRUD (DB-backed) |
| `/api/backlinks` | GET/POST/DELETE | Backlink entries CRUD (DB-backed) |
| `/api/user/profile` | PUT | Update user name |
| `/api/user/password` | PUT | Change password (bcrypt-verified) |
| `/api/user/delete` | DELETE | Delete account + cancel Stripe subscriptions |
| `/api/auth/[...nextauth]` | * | NextAuth catch-all |
| `/api/auth/signup` | POST | Email/password signup (sends welcome email) |
| `/api/auth/forgot-password` | POST | Send password reset email (1hr token) |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/portal` | POST | Open Stripe billing portal |
| `/api/admin/users` | GET/PUT | User list + role/tier management (admin-only) |
| `/api/admin/stats` | GET | System stats: users, scans, tiers, daily breakdown (admin-only) |
| `/api/admin/scans` | GET | Scan logs with user info (admin-only) |

## Scan API (`/api/scan`)
- **Tier-based rate limits**: free=10/min, pro=100/min, enterprise=500/min
- **Monthly quotas**: free=50, pro=2,000, enterprise=20,000 scans
- **Authentication**: `x-api-key` header (server-validated against DB) or browser session
- **Response includes**: `rateLimit: { tier, remaining, limit }`
- Returns `429` (rate/quote limit), `401` (invalid API key), `400` (bad input), `500` (scan failure)
- In-memory TTL cache: 10 min, max 2000 entries
- `maxDuration = 60` (Vercel serverless timeout)
- Every request is logged to `UsageLog` with userId, keyId, IP, duration, status

## Scan flow
1. Client reads `?site=`, optional `?headers=`, `?cookies=`, `?proxy=` via `useSearchParams`. POSTs `/api/scan`.
2. Server: validate API key (if provided) → check rate limit → check monthly quota → check cache → fetch HTML (Cheerio) → detect challenge/blocked pages → auto-fallback to Playwright browser if blocked (skipped on Vercel) → deep scan (CSS/JS fetch, path probes — skipped on Vercel) → rule engine → log usage → return results.
3. **Fetch-failure fallback**: If `fetch()` throws a network error, `detectTechnologies()` tries `tryBrowserScan()` (local Playwright → remote Browserless) before giving up.
4. Client saves to both localStorage (`tsf-scan-history`) and server (`/api/history` if logged in). `lib/scan-history.js` `saveScanSnapshot()` handles both writes.
5. Technologies tab uses `TechTab.js` to split into **Main** (popular/high-confidence) vs **Rare** (niche/low-confidence) sub-tabs.

## Detection system
- Rules stored as `RULES` array in `lib/detect.js` (1,870 inline) + generated rules merged at module load via `getGenRules()`
- Generated rules in `scripts/_generated_rules.json` use `{p: "pattern", f: "flags"}` format — reconstructed to `new RegExp(p, f)` at load time
- `scripts/generate.js` (1,070 lines) has 100 template functions that expand `[name, category, typeKey]` entries from `scripts/data-fe.js`, `data-be.js`, `data-infra.js`, `data-content.js`
- Generated rules filtered at load: only high-confidence signal types kept (`script_src`, `meta_generator`, `header`, `css_content`, `js_content`, `link_tag`, `cookie`). Broad types (`html`, `browser_var`, `path_probe`) excluded.
- **Regex uses `new RegExp("...","i")` not `/regex/i` literals** — intentional to avoid `/` conflicts in names like `@headlessui/react`
- Pattern types: `html`, `header`, `script_src`, `meta_generator`, `cookie`, `css_class`, `link_tag`, `css_content`, `js_content`, `path_probe`, `browser_var`, `browser_network`, `browser_cookie`
- `path_probe` confidence is `medium` (not `high`) — catch-all routes return 200 for any path, causing false positives

## Database (Prisma + PostgreSQL)
13 models: `User`, `Account`, `Session`, `VerificationToken`, `Subscription`, `ApiKey`, `UsageLog`, `ScanHistory`, `Bookmark`, `Monitor`, `CustomRule`, `BacklinkEntry`, `PasswordReset`

Key fields on User: `tier` (free/pro/enterprise), `role` (user/admin), `stripeCustomerId`, `scansThisMonth`, `scansResetAt`

Schema file: `prisma/schema.prisma`. After changes: `npx prisma migrate dev --name <description>` then `npm run build` (which runs `prisma generate`).

## Middleware (`middleware.js`)
Uses `next-auth/middleware` (`withAuth`). Redirects unauthenticated users to `/login`. Protects 9 routes:
`/settings`, `/api-keys`, `/history`, `/bookmarks`, `/monitor`, `/bulk`, `/digest`, `/backlinks`, `/admin`

Admin role check is done in-page (not middleware) — `app/admin/page.js` fetches `/api/admin/stats` which returns 403 if user is not admin.

## Data persistence (dual-mode)
Protected pages (bookmarks, history, monitor, api-keys, rules, backlinks, leaderboard) use **dual-mode**: server API when logged in, localStorage fallback when not. `lib/scan-history.js` exports both local and server functions (`fetchServerHistory`, `saveServerHistory`, etc.). `saveScanSnapshot()` auto-writes to both localStorage and server.

**Two localStorage history keys still coexist**: `tsf-history` (legacy, written by `results/page.js`, max 20) and `tsf-scan-history` (written by `lib/scan-history.js`, max 50). The newer pages all use `tsf-scan-history`; `tsf-history` is legacy.

## Theming
- **15 themes** via `data-theme` attribute, localStorage key `tsf-theme`. Default: `lavender`.
- Supported: dark, terminal, blueprint, solarized, neon, monochrome, sakura, ocean, lavender, ember, arctic, crimson, mint, amber, light.
- `ThemePicker.js` renders via `createPortal(document.body)` to escape `backdrop-blur` containers.
- `layout.js` uses `suppressHydrationWarning` on `<html>` — inline `<script>` sets `data-theme` from localStorage before React hydrates.
- `BackgroundManager.js` renders 4 animated backgrounds (Mesh, Stars, Dust, Waves) switchable via localStorage key `tsf-bg`.

## Key components
- `TechTab.js` — Technologies sub-tab with Main/Rare split. Classification: `POPULAR_TECH` set (200+ names) or `confidence === 'high'` → main, else → rare.
- `Header.js` — Client component. Desktop pill bar (`lg+`), spotlight hover, border glow, active state via `usePathname()`, scroll-aware darkening, mobile hamburger. Uses `next/image` for avatars.
- `ResultsTabs.js` — Sticky tab bar (5 tabs), positioned below header.
- `StackVisualization.js` — Canvas force-directed graph of tech stack.
- `TechCard.js` — Responsive cards with dynamic width (min 280px, max 420px).
- `CategorySection.js` — Sticky sidebar + flex-wrap grid of TechCards per category.
- `TerminalScanner.js` — Animated terminal showing scan progress on homepage.
- `MouseGlow.js` — Two-layer accent glow orb following cursor with lerp + requestAnimationFrame.
- `DownloadPdfButton.js` — html2canvas captures HTML div → jsPDF slices into A4 pages. Uses `buildHtml()` for report layout.

## Gotchas
- **`useSearchParams` requires `<Suspense>` boundary** — `results/page.js` wraps `ResultsContent` in `<Suspense fallback={<Skeleton />}>`. `reset-password/page.js` uses it too. Any new page using `useSearchParams` must follow the same pattern or build breaks.
- **No test suite** — manual verification only.
- **`confidence` from detect.js is a string** (`"high"`, `"medium"`) not a number — components must convert via `CONF_MAP` for display.
- **Animations** defined in `tailwind.config.js`: 13 animations. Components set per-item `animationDelay` via inline style.
- **Fonts**: Space Grotesk (UI, `font-sans`) + JetBrains Mono (code, `font-mono`) loaded from Google Fonts in `globals.css`.
- **`next.config.js`** has `reactStrictMode: true` only — no `images`, `rewrites`, or `experimental` config.
- **Decorative CSS classes** (pure visual): `.noise-overlay`, `.glow-orb`, `.grid-bg`, `.dot-grid-bg`, `.gradient-mesh`, `.scan-line`, `.scanner-ring`, `.scanner-sweep`, `.pulse-ring`, `.card-shim`, `.typewriter-cursor`, `.spotlight-card`, `.counter-number`.
- **Reusable utility class**: `.card-hover` for hover transitions on cards.
- **Trends**: `app/trends/page.js` exports `saveScanTrend` — called from results page after scan completes.

## localStorage keys
| Key | Files | Purpose |
|-----|-------|---------|
| `tsf-theme` | ThemeToggle, layout.js, BackgroundManager | Theme ID |
| `tsf-bg` | BackgroundManager | Active background |
| `tsf-scan-history` | lib/scan-history.js, leaderboard | Scan history (max 50, also syncs to server) |
| `tsf-history` | results, HistoryList, PopularScans, radar, trends | Legacy scan history (max 20) |
| `tsf-bookmarks` | BookmarkButton, bookmarks, PopularScans, digest | Bookmarks (also syncs to server when logged in) |
| `tsf-monitors` | monitor | Monitor configs |
| `tsf-api-keys` | api-keys | API key cache |
| `tsf-custom-rules` | rules | Custom detection rules |
| `tsf-scan-trends` | trends, StackPopularity, leaderboard, digest | Trend data |
| `tsf-backlinks-manual` | backlinks | Manual backlink entries |

## Hetzner Cloud Deployment

**Quick setup on a fresh Ubuntu 22.04/24.04 server (recommended: CAX11 arm64, 4 vCPU, 8GB, €5.29/mo):**

```bash
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```

**What the script does:** installs Node 20, nginx, PM2, clones repo, runs `prisma generate && next build`, configures nginx reverse proxy, sets up UFW firewall, optionally installs SSL via Let's Encrypt.

**After first deploy:** edit `/var/www/techstack-finder/.env` with actual credentials, then `npx prisma migrate deploy && pm2 restart techstack-finder`.

**Redeploy after updates:**
```bash
bash /var/www/techstack-finder/deploy/redeploy.sh
# Or manually:
cd /var/www/techstack-finder && git pull && npm run build && pm2 restart techstack-finder
```

**PM2 commands:**
```bash
pm2 status                    # Check status
pm2 logs techstack-finder     # View logs
pm2 restart techstack-finder  # Restart app
pm2 monit                     # Live monitoring
```
