# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000
npm run build    # Runs `prisma generate && next build` — schema changes auto-generate client
npm run start    # Production server
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

## Setup
- Copy `.env` → set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- PostgreSQL required. Local: `docker compose up -d db` (see `docker-compose.yml`).
- OAuth (`GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`), Stripe, Email (Resend), Browserless (`BROWSERLESS_API_KEY`) — all optional.
- First build: `npx prisma migrate dev --name init` (or `npx prisma db push` for local), then `npm run build`.

## Architecture
- **Next.js 14.2.35 App Router** (no TypeScript, React 18) — ~24 pages, 22 API routes, ~64 components
- **`jsconfig.json`** maps `@/*` → `./*`
- **Single fixed dark navy theme** (`:root` CSS vars in `globals.css`). No theme switching. No `[data-theme]` selectors beyond the hardcoded `data-theme="warm"` on `<html>`.
- **CSS vars** (`--bg`, `--elevated`, `--surface`, `--fg`, `--muted`, `--faint`, `--border`, `--accent`, `--secondary`, etc.) drive all Tailwind colors via `var(--)`. Never hardcode hex colors.
- **No test suite** — manual verification only.

## Detection system
- **1,870 hand-crafted rules** in `lib/detect.js` (7,179 lines) + **8,384 generated rules** loaded at runtime from `scripts/_generated_rules.json` (3.3MB, lazy-loaded via `readFileSync` + `process.cwd()`)
- Generated rules use `{p: "pattern", f: "flags"}` → `new RegExp(p, f)` at load time
- Regex patterns use `new RegExp("...","i")`, never `/regex/i` literals (avoids `/` conflicts in names like `@headlessui/react`)
- **`confidence` is a string** (`"high"`, `"medium"`) — components convert via `CONF_MAP` for display
- Pattern types: `html`, `header`, `script_src`, `meta_generator`, `cookie`, `css_class`, `link_tag`, `css_content`, `js_content`, `path_probe`, `browser_var`, `browser_network`, `browser_cookie`
- `path_probe` confidence is `medium` — catch-all routes cause false positives

## Scan flow
1. Client POSTs `/api/scan` with `{ url, headers?, cookies?, timeout?, proxy? }`
2. Server: validate API key → rate limit → quota → cache → fetch HTML (Cheerio) → detect blocked pages → Playwright fallback if blocked (skipped on Vercel) → deep scan (CSS/JS fetch, path probes — skipped on Vercel) → rule engine → log usage → return
3. Technologies tab splits **Main** (popular/high-confidence) vs **Rare** (niche/low-confidence) via `TechTab.js`
4. Scans saved to both localStorage (`tsf-scan-history`, max 50) and server (`/api/history` if logged in). Legacy key `tsf-history` (results page, max 20) still coexists.
5. `lib/scan-history.js` — exports `saveScanSnapshot()`, `getScanHistory()`, `diffScans()`, `clearScanHistory()`, plus server-side `fetchServerHistory()`, `saveServerHistory()`, etc.

## Database (Prisma + PostgreSQL)
- 13 models in `prisma/schema.prisma` — `User`, `Account`, `Session`, `VerificationToken`, `Subscription`, `ApiKey`, `UsageLog`, `ScanHistory`, `Bookmark`, `Monitor`, `CustomRule`, `BacklinkEntry`, `PasswordReset`
- Key User fields: `tier` (free/pro/enterprise), `role` (user/admin), `scansThisMonth`, `scansResetAt`
- After schema changes: `npx prisma migrate dev --name <desc>` then `npm run build`

## Middleware
- `middleware.js` uses `next-auth/middleware` (`withAuth`). Protects: `/dashboard`, `/settings`, `/api-keys`, `/history`, `/bookmarks`, `/monitor`, `/bulk`, `/digest`, `/backlinks`, `/admin`
- Admin role check is in-page (not middleware) — `app/admin/page.js` fetches `/api/admin/stats` which returns 403 if not admin

## Data persistence (dual-mode)
- Protected pages use **server API when logged in, localStorage fallback when not**
- localStorage keys: `tsf-scan-history` (scan history, 50 max), `tsf-history` (legacy, 20 max), `tsf-bookmarks`, `tsf-monitors`, `tsf-api-keys`, `tsf-custom-rules`, `tsf-scan-trends`, `tsf-backlinks-manual`

## Gotchas
- **`useSearchParams` requires `<Suspense>` boundary** — `results/page.js` and `reset-password/page.js` wrap content in `<Suspense fallback={<Skeleton />}>`. New pages using it must follow the same pattern or build breaks.
- **`next.config.js`** has only `reactStrictMode: true` — no `images`, `rewrites`, or `experimental` config.
- **Animations** defined in `tailwind.config.js` (13 animations). Components set per-item `animationDelay` via inline style.
- **Vercel-aware** — `process.env.VERCEL` skips local Playwright, CSS/JS deep fetch, and path probes on serverless. Fetch timeout reduced to 25s.
- **No `opencode.json`** in repo root — no repo-local OpenCode config.

## Key components
- `lib/detect.js` — Main detection engine (7,494 lines)
- `lib/deep-scan.js` — CSS/JS fetching, path probing, Playwright scanning
- `lib/auth.js` — NextAuth config with Google/GitHub/Credentials providers
- `lib/scan-history.js` — Dual-mode (localStorage + server) scan history
- `app/api/scan/route.js` — Main scan API endpoint
- `app/results/page.js` — 5-tab results page (wraps in Suspense)

## API Scan endpoint (`/api/scan`)
- Tier-based rate limits: free=10/min, pro=100/min, enterprise=500/min
- Monthly quotas: free=50, pro=2,000, enterprise=20,000 scans
- Auth: `x-api-key` header (DB-validated) or browser session
- Returns `rateLimit: { tier, remaining, limit }` in response
- In-memory TTL cache: 10 min, max 2,000 entries
- `maxDuration = 60` (Vercel serverless timeout)

## Hetzner Cloud Deployment
```bash
# One-command setup on fresh Ubuntu 22.04/24.04 (CAX11 arm64, 4 vCPU, 8GB):
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```
After first deploy: edit `/var/www/techstack-finder/.env`, then `npx prisma migrate deploy && pm2 restart techstack-finder`.
