# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TechStack Finder** — a SaaS app that fingerprints any website's technology stack: enter a URL and get the frameworks, CMS, analytics, hosting, and infrastructure behind it. The repo root also holds a `chrome-extension/`, `sdks/` (python + typescript), and `deploy/` (Hetzner/Vercel) alongside the main Next.js app.

## Commands

```bash
npm run dev       # Dev server at localhost:3000
npm run build     # prisma generate && next build — run after Prisma schema changes
npm run start     # Production server
npm run lint      # next lint (eslint-config-next)
```

- **No test suite** — verification is manual plus a clean `npm run build`.
- Local PostgreSQL: `docker compose up -d db`. First setup: `npx prisma migrate dev --name init`.
- After changing `prisma/schema.prisma`: `npx prisma migrate dev --name <desc>`, then `npm run build`.
- All env config lives in `.env` (copy to `.env.local` and fill in). `.env` is **denied for reads** in `.claude/settings.json` — never print or commit its contents.

## Architecture

**Stack:** Next.js 14 App Router, React 18, **plain JavaScript (no TypeScript)**. Prisma + PostgreSQL, NextAuth v4 (JWT sessions), Stripe, Resend, Cheerio + Playwright. Tailwind colors come entirely from CSS variables. `jsconfig.json` maps `@/*` → repo root.

### Layout
- `app/` — ~24 pages (client components, `'use client'`) + ~22 API routes (`app/api/*/route.js`).
- `components/` — ~100 shared components (Header, SearchBar, TechCard, ScanProgress, ExportDashboard, ...).
- `lib/` — core logic: detection, deep scan, auth, scan history, analytics post-processors.
- `prisma/schema.prisma` — 13 models (User, Subscription, ApiKey, UsageLog, ScanHistory, Monitor, CustomRule, BacklinkEntry, ...).
- `scripts/` — rule-generation scripts; `_generated_rules.json` is a 3.3MB data artifact, not hand-edited.

### Detection engine — the core (`lib/detect.js`, ~386KB)
- ~1,870 hand-crafted rules in `RULES[]`; each is `{name, category, patterns: [{type, regex, via}], versionPattern?}` across 270 categories.
- Plus 8,384 generated rules from `scripts/_generated_rules.json`, lazy-loaded once via `readFileSync` + `process.cwd()` (`getGenRules()`). Runtime-loaded, not bundled.
- Rules match against HTML, response headers, `<script src>`/`<link>`/meta tags, cookies, CSS/JS content, and (browser scan) network requests.
- **Regexes are `new RegExp("...", "i")` strings, never `/.../i` literals** — literal `/` breaks patterns like `@headlessui/react`.
- `confidence` is a **string** (`"high"`/`"medium"`/`"low"`); the UI maps it via `CONF_MAP`. `path_probe` patterns are `medium` by design (catch-all routes cause false positives).

### Scan flow — `POST /api/scan` (`app/api/scan/route.js`)
1. Auth: `x-api-key` header (DB-validated) or NextAuth session; anonymous allowed.
2. In-memory rate limit per IP/user (free 10/min, pro 100/min, enterprise 500/min) + monthly quota (50 / 2k / 20k).
3. 10-min in-memory TTL result cache (max 2,000 entries).
4. `detectTechnologies()` (`lib/detect.js`): fetch HTML via Cheerio → detect challenge/blocked pages → **Playwright headless fallback** → deep CSS/JS fetch + path probes (`lib/deep-scan.js`) → rule engine → post-processors (tech-analysis, cve-db, gdpr-audit, company-enrichment, cost/team/lifecycle estimates) → result.
5. Logs a `UsageLog`, increments `user.scansThisMonth`.
- `app/api/scan-stream/route.js` — SSE progress feed for the results page loading UI.
- **Vercel-awareness:** `process.env.VERCEL` skips Playwright, CSS/JS deep fetch, and path probes (unavailable on serverless). Scan routes set `maxDuration = 60`. Keep new scan steps behind the same guard.

### Auth & routing
- `middleware.js` (`withAuth`) protects `/dashboard`, `/settings`, `/api-keys`, `/history`, `/bookmarks`, `/monitor`, `/bulk`, `/digest`, `/backlinks`, `/admin`.
- Admin check is **in-page**, not middleware: `app/admin/page.js` → `/api/admin/stats` (403 for non-admins).
- `lib/auth.js` — NextAuth (Google/GitHub/Credentials + bcryptjs), JWT sessions carrying `user.id` and `user.tier`.

### Data persistence (dual-mode)
- Protected pages use server APIs when logged in, localStorage fallback when not.
- localStorage keys: `tsf-scan-history` (50 max), `tsf-history` (legacy, 20 max), `tsf-bookmarks`, `tsf-monitors`, `tsf-api-keys`, `tsf-custom-rules`, `tsf-scan-trends`, `tsf-backlinks-manual`.
- `lib/scan-history.js` — shared helper: `saveScanSnapshot()`, `diffScans()`, server sync (`/api/history`).

### Theming & animations
- Single fixed dark navy theme. CSS vars in `globals.css` (`--bg`, `--elevated`, `--surface`, `--fg`, `--muted`, `--faint`, `--border`, `--accent`, `--secondary`) map to Tailwind colors. **Never hardcode hex colors.**
- 13 animations defined in `tailwind.config.js`; components stagger via inline `animationDelay`.

## Gotchas
- **`useSearchParams` requires a `<Suspense>` boundary** or the production build fails. `app/results/page.js` and `app/reset-password/page.js` wrap their content in `<Suspense fallback={<Skeleton />}>` — new pages using it must do the same.
- `next.config.js` has only `reactStrictMode: true` — no images/rewrites/experimental config.
- Fonts (Manrope, Newsreader, JetBrains Mono) load via `<link>` in `app/layout.js`.
- Keep files under 500 lines — split instead of growing.

## Project rules
- Do what has been asked; nothing more, nothing less.
- Never create files unless necessary — prefer editing existing files. No docs unless explicitly requested.
- Never save working files/tests to repo root — use `/src`, `/tests`, `/docs`, `/config`, `/scripts`.
- Never commit secrets, credentials, or `.env` files.
- Don't add a `Co-Authored-By` trailer to user commits (project `.claude/settings.json` doesn't set `attribution.commit`).
- Validate input at system boundaries.

## Agent tooling
The repo is wired for Ruflo agent coordination (hooks in `.claude/settings.json`, `.claude-flow/` state). The full coordination config is auto-generated and tool-managed (`npx ruflo init` regenerates it) — treat it as infrastructure, not code to maintain. The previous auto-generated CLAUDE.md content is preserved in git history.
