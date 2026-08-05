# KEELCODE.md

Guidance for keelcode when working in this repository. (Mirrors `CLAUDE.md`.)

## Project

**TechStack Finder** — a SaaS that fingerprints any website's technology stack: enter a URL, get the frameworks, CMS, analytics, hosting, and infrastructure behind it. Alongside the main Next.js app the root holds `chrome-extension/`, `sdks/` (python + typescript), and `deploy/` (Hetzner/Vercel).

## Commands

```bash
npm run dev       # Dev server at localhost:3000 (hot-reload; leave running)
npm run build     # prisma generate && next build — do NOT run while dev is up (Prisma EPERM lock)
npm run start     # Production server
npm run lint      # next lint (eslint-config-next)
```

- **No test suite** — verification is manual + Playwright + a clean `npm run build`.
- Local PostgreSQL: `docker compose up -d db`. First setup: `npx prisma migrate dev --name init`.
- After changing `prisma/schema.prisma`: `npx prisma migrate dev --name <desc>`, then `npm run build`.
- Env in `.env` — never print or commit it.

## Architecture

Next.js 14 App Router, React 18, **plain JavaScript (no TypeScript)**. Prisma + PostgreSQL, NextAuth v4 (JWT), Stripe, Resend, Cheerio + Playwright. Tailwind colors come entirely from CSS variables. `jsconfig.json` maps `@/*` → repo root.

- `app/` — 49 pages (mostly `'use client'`) + 26 API routes (`app/api/*/route.js`).
- `components/` — ~110 shared components (Header, SearchBar, TechCard, ScanProgress, ExportDashboard...).
- `lib/` — core logic: detection, deep scan, auth, scan history, analytics post-processors.
- `prisma/schema.prisma` — 13 models (User, Subscription, ApiKey, UsageLog, ScanHistory, Monitor, CustomRule, BacklinkEntry...).
- `scripts/_generated_rules.json` — 3.3MB data artifact, runtime-loaded, not hand-edited.

### Detection engine (`lib/detect.js`)
- ~1,870 hand-crafted rules in `RULES[]` + 8,384 generated rules lazy-loaded once via `readFileSync` + `process.cwd()`.
- **Regexes are `new RegExp("...", "i")` strings, never `/.../i` literals** — literal `/` breaks names like `@headlessui/react`.
- `confidence` is a **string** (`"high"`/`"medium"`/`"low"`); UI maps it via `CONF_MAP`. `path_probe` is `medium` by design (catch-all false positives).

### Scan flow — `POST /api/scan` (`app/api/scan/route.js`)
1. Auth: `x-api-key` header (DB-validated) or NextAuth session; anonymous allowed.
2. In-memory rate limit (free 10/min, pro 100/min, enterprise 500/min) + monthly quota (50 / 2k / 20k).
3. 10-min in-memory TTL cache (max 2,000 entries).
4. `detectTechnologies()`: Cheerio HTML fetch → blocked-page detection → **Playwright headless fallback** → deep CSS/JS fetch + path probes (`lib/deep-scan.js`) → rule engine → post-processors.
5. Logs a `UsageLog`, increments `user.scansThisMonth`.
- **Vercel-aware:** `process.env.VERCEL` skips Playwright, CSS/JS deep fetch, and path probes. Scan routes set `maxDuration = 60`. Keep new scan steps behind the same guard.

### Auth & routing
- `middleware.js` (`withAuth`) protects `/dashboard`, `/settings`, `/api-keys`, `/history`, `/bookmarks`, `/monitor`, `/bulk`, `/digest`, `/backlinks`, `/admin`.
- Admin check is **in-page**, not middleware: `app/admin/page.js` → `/api/admin/stats` (403 for non-admins).

### Data persistence (dual-mode)
- Protected pages use server APIs when logged in, localStorage fallback when not.
- localStorage keys: `tsf-scan-history` (50 max), `tsf-history` (legacy, 20 max), `tsf-bookmarks`, `tsf-monitors`, `tsf-api-keys`, `tsf-custom-rules`, `tsf-scan-trends`, `tsf-backlinks-manual`.

### Theming
- Single fixed dark navy theme. CSS vars in `globals.css` (`--bg`, `--elevated`, `--surface`, `--fg`, `--muted`, `--faint`, `--border`, `--accent`, `--secondary`) map to Tailwind colors. **Never hardcode hex colors.**
- 13 animations in `tailwind.config.js`; components stagger via inline `animationDelay`.

## Gotchas
- **`useSearchParams` requires a `<Suspense>` boundary** or the production build fails — follow `app/results/page.js` / `app/reset-password/page.js` (`<Suspense fallback={<Skeleton />}>`).
- `next.config.js` has only `reactStrictMode: true` — no images/rewrites/experimental config.
- Keep files under 500 lines — split instead of growing.

## Project rules
- Do what has been asked; nothing more, nothing less.
- Never create files unless necessary — prefer editing existing files. No docs unless explicitly requested.
- Never commit secrets or `.env` files.
- Validate input at system boundaries.
