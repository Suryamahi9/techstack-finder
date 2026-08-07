# TechStack Finder — Agent Instructions

## Commands
```bash
npm run dev      # Dev server at port 3000 (hot-reloads; a running instance can be left up)
npm run build    # Runs `prisma generate && next build` — do NOT run while `npm run dev` is active (Prisma DLL lock EPERM)
npm run start    # Production server
npm run lint     # next lint (ESLint via next/core-web-vitals)
```

## Setup
- Copy `.env` → set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- PostgreSQL required. Local: `docker compose up -d db` (see `docker-compose.yml`).
- OAuth (`GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`), Stripe, Email (Resend), Browserless (`BROWSERLESS_API_KEY`), AI chat (`AI_CHAT_API_KEY`, see AI chat agent section) — all optional.
- First build: `npx prisma migrate dev --name init` (or `npx prisma db push` for local), then `npm run build`.
- **`.env` is gitignored** — deployed environments (Vercel dashboard → Settings → Environment Variables, or Hetzner `/var/www/techstack-finder/.env`) need env vars set in the platform's own config + a redeploy. A missing `AI_CHAT_API_KEY` is the usual cause of the live chat replying "not turned on yet" while working locally.

## Architecture
- **Next.js 14.2.35 App Router** (no TypeScript, React 18) — 51 pages, 28 API routes, 110 components, 35 lib files
- **`app/layout.js` has no global Header/Footer** — every page renders `Header` + `Footer` itself; omitting them is an easy silent bug
- **Nav source of truth** — `lib/site-nav.js` `NAV` array; every `href` must resolve to a real page route
- **`jsconfig.json`** maps `@/*` → `./*`
- **Single fixed dark navy theme** (`:root` CSS vars in `globals.css`). No theme switching. No `[data-theme]` selectors beyond the hardcoded `data-theme="warm"` on `<html>`.
- **CSS vars** (`--bg`, `--elevated`, `--surface`, `--fg`, `--muted`, `--faint`, `--border`, `--accent`, `--secondary`, etc.) drive all Tailwind colors via `var(--)`. Never hardcode hex colors.
- **No test suite** — manual + Playwright verification (see Verification below).

## Detection system
- **1,870 hand-crafted rules** in `lib/detect.js` (7,096 lines) + **8,384 generated rules** loaded at runtime from `scripts/_generated_rules.json` (3.3MB, lazy-loaded via `readFileSync` + `process.cwd()`, runtime-loaded not bundled)
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
- **Frosted-glass panel rule fights `position: fixed`** — `globals.css` `[class~="rounded-2xl"][class*="bg-elevated"]` used to set `position: relative` (spec (0,2,0), beats `.fixed`), which silently pushed the chat widget's `fixed` dialog into page flow at the document end. Now guarded with `:not(.fixed)` — keep that guard; add a similar `:not(.fixed)` if you style-position any new generic utility selector.

## Key components
- `lib/detect.js` — Main detection engine (7,092 lines)
- `lib/deep-scan.js` — CSS/JS fetching, path probing, Playwright scanning
- `lib/auth.js` — NextAuth config with Google/GitHub/Credentials providers
- `lib/scan-history.js` — Dual-mode (localStorage + server) scan history
- `lib/scan-trends.js` — localStorage scan-trend helpers (`saveScanTrend`, `getScanTrends`); `results/page.js` writes here (do NOT import from a page component to reuse a helper — extract to `lib/`)
- `lib/trends-data.js` — Trends hub data: 65-tech directory (live + India site counts), spotlight techs, 5 taxonomy groups, country math
- `app/api/scan/route.js` — Main scan API endpoint
- `components/ScanProgress.js` — Loading animation shown during `/api/scan` on the results page: etches a site-seeded fingerprint ring-by-ring (9 ridges, one per scan step) with a glowing active ring, then locks to `fingerprint #XXXX-XXXX`; self-driving timers (EventSource/`scan-stream` dependency removed — it was flaky under StrictMode), honors `prefers-reduced-motion`
- `app/results/page.js` — 5-tab results page (wraps in Suspense)

## Homepage (`app/page.js`)
- Client component, **9 sections**: split hero (left editorial / right `StackFingerprint`) → tech ticker ribbon → stats (count-up + self-drawing `stat-accent` lines) → features (6 `SpotlightCard` cursor-follow cards) → how-it-works expandable steps with progress rail (`.steps-rail`) → `FeaturedStacks` → testimonials → pricing (popular tier = `gradient-border`) → bottom CTA (`cta-glow` breathing pulse)
- **`components/FingerprintWhorl.js`** — the signature hero piece: seeded SVG whorl (9 concentric ridge rings, ~552 `.fp-seg` lines that fade in one-by-one), slow-rotating dashed orbit ring (`.fp-orbit` + traveling accent dot), pulsing rings (`.fp-pulse`), tech chips (`.fp-chip`), and a deterministic `#XXXX-XXXX` hash of the target; hovering remounts the SVG (`key` bump) to "rescan". **SSR-safe:** coordinates are rounded via `R3()` so Node and browser trig agree during hydration — do not remove the rounding (caused a `Prop y1 did not match` hydration warning). Note: `components/StackFingerprint.js` is a **different** component — the results-page Stack DNA card that takes a `fingerprint` prop
- **`RevealHeadline`** — hero headline ("Every website leaves a fingerprint.") splits into `.word-mask` / `.word-inner` masked word-by-word stagger; keep a `{' '}` text node between emphasized parts so `innerText`/screen readers get a real space
- **`SpotlightCard`** — sets `--mx`/`--my` CSS vars on `onMouseMove` for the `.spotlight-card` radial glow; content wrapper must stay `relative z-[2]` above the `::before`
- Motion CSS lives in the `HOMEPAGE — SCAN CONSOLE + MOTION SYSTEM` + `HOMEPAGE — STACK FINGERPRINT` blocks at the end of `globals.css`; marquee reuses existing `.data-ticker` / `tickerScroll`
- **WebGL/canvas is global, not per-page** — `components/ScrollWebGLBackground.js` (fullscreen 3D line field: streaming perspective grid + faint verticals that travel forward on scroll) is mounted in `app/layout.js` via `dynamic({ ssr: false })` at `position: fixed; z-index: -1`. The homepage itself has no hero WebGL canvas (HeroScene3D/TiltCard/ScrollImageReel/ScanConsole deleted when the fingerprint replaced them). A one-off `Extra attributes from the server: style` console warning during dev hot-reload on the SearchBar input is a compile artifact, not a bug

## Trends feature (market-data hub)
- `app/trends/page.js` — `'use client'` BuiltWith-style hub: Spotlight cards, Technology Groups tag filter (`TechGroupFilter`), Popular Technologies directory (`TechDirectoryList`, fixed India counts), plus the personal "Your Scan Trends" localStorage analytics
- `app/trends/[slug]/page.js` — **server component** detail pages: `generateStaticParams()` from `allTechSlugs()`, `dynamicParams = true`, `notFound()` on unknown slugs; per-tech stats, country breakdown, market-share YoY badge (`lib/market-share.js`), related techs, working CTAs
- Directory renders **sorted by `liveSites` descending** — the sort lives in `TechDirectoryList.js`, not in the data file
- `countrySites(tech, code)`: `IN` → `indianSites`; US/GB/DE/CA/AU/BR/JP → deterministic multiplier of `liveSites`; other codes → `null`
- `relatedTechs()` matches on the tech's **first tag** — keep primary tags overlapping across entries or the related section stays empty

## API Scan endpoint (`/api/scan`)
- Tier-based rate limits: free=10/min, pro=100/min, enterprise=500/min
- Monthly quotas: free=50, pro=2,000, enterprise=20,000 scans
- Auth: `x-api-key` header (DB-validated) or browser session
- Returns `rateLimit: { tier, remaining, limit }` in response
- In-memory TTL cache: 10 min, max 2,000 entries
- `maxDuration = 60` (Vercel serverless timeout)

## Trends API endpoint (`/api/trends`)
- **Read-only, public, no auth** — serves the trends/market data to the MCP server and external consumers
- Query params: `?tech=<name|slug>` (detail: market-share series + related + country breakdown), `?search=`, `?category=` (exact tag), `?sort=liveSites|name`, `?limit=` (1–100, default 50)
- Reuses `lib/trends-data.js` + `lib/market-share.js` directly — no DB
- IP rate limit: 60 req/min (in-memory)

## AI chat agent (`/api/chat` + `components/ChatWidget.js`)
- Global floating chat widget (`layout.js`, lazy `ssr:false`) wired to `POST /api/chat`
- `lib/chat-agent.js` = thin OpenAI-compatible chat-completions wrapper + in-process tools (`scan_website`, `get_tech_trends`, `list_technologies`, `compare_stacks`) that call `lib/detect.js` + `lib/trends-data.js` + `lib/market-share.js` directly
- Env: `AI_CHAT_API_KEY` (required to enable), `AI_CHAT_PROVIDER` (`groq` default — free tier; `openrouter` free models, `openai`, `deepseek`, `nvidia`), `AI_CHAT_MODEL`, `AI_CHAT_BASE_URL`
- **NVIDIA provider** (`nvidia` → `minimaxai/minimax-m3`): minimax-m3 "thinks" by default (adds 20-90s latency). The agent sends `chat_template_kwargs: { thinking_mode: 'disabled' }` for this provider only
- **Resilience (never 500s):** free-tier LLM latency is wildly variable (measured 3.5s–84s per round). `callLLM` aborts each round (12s first for URL/tech/category queries, 20s + one retry for general chat, 10s follow-up); on timeout or transient `429/5xx`, the agent falls back to a **templated factual reply** built from tool results (`templateToolOutput`), or a local-data answer when the very first round fails (`fallbackForUser`: scans URLs directly, answers tech trends from `findTechInText`, lists top tools by category via `categoryFromText`, and handles greetings/capability questions — so only truly unanswerable queries get the "model busy" message). Follow-up LLM rounds are skipped once >15s have elapsed. Vercel `maxDuration = 60` + 50s budget
- `lib/detect.js` `detectTechnologies` accepts `{ fast: true }` for the chat tools: skips browser fallbacks, CSS/JS deep fetch, path probes, DNS+TLS and ads.txt scans (~7-9s instead of 20s+)
- With no key the endpoint returns a graceful `setupRequired` reply (no LLM call)
- IP rate limit 20 req/min in-memory; non-streaming replies (client shows typing dots)
- **ChatWidget auto-opens 3s after mount and plays a two-tone Web Audio chime** (`playChime`, no audio file). Browser autoplay policy: on a fresh visit the context stays suspended until the first `pointerdown`/`keydown` (it's primed on first interaction, then the chime plays); the FAB open click always chimes. Playwright's `--autoplay-policy=no-user-gesture-required` hides the block — headless tests can't reproduce the real-browser first-visit silence.

## MCP server (`mcp/`)
- Standalone Node MCP package (own `package.json`; `node_modules/` gitignored). Thin client over the site's HTTP API — **it cannot run as a Vercel function**, run the process anywhere (local, Hetzner VPS, pm2, Render/Fly)
- Tools: `scan_website`, `list_technologies`, `get_technology`, `get_trends_overview`, `compare_technologies` — see `mcp/README.md`
- Transports: **stdio** (default; Claude Desktop/Cursor/opencode) and **Streamable HTTP** (`--transport http --port 3001`, stateless, JSON responses)
- Env: `TSF_API_URL` (default `https://techstack-finder.vercel.app`), `TSF_API_KEY` (recommended for scans), `TSF_TRANSPORT/PORT/HOST`
- SDK gotchas: `McpServer.registerTool` requires **zod** schemas (plain JSON Schema throws); stateless HTTP needs a **fresh server + transport per request** (`Protocol.connect` throws on a second connect); enable `enableJsonResponse: true` for plain-JSON POST responses
- `next lint` does not traverse `mcp/` (only app/components/lib/...), so mcp code is lint-checked manually with `node --check`

## Verification (Playwright)
- `playwright` / `playwright-core` are installed in project `node_modules`; `chromium.launch()` works headless
- Scripts outside the repo (e.g. temp files) can't `require('playwright')` — run with `$env:NODE_PATH = "<repo>\node_modules"` or put the script inside the repo
- **First request to a route while the dev server is compiling** makes `text=`/`:has-text` locators transiently return 0 — prefer `waitForSelector` with a timeout over instant `.count()`
- `a.href` inside `evaluateAll` resolves to an absolute URL while the DOM attribute stays relative — use `getAttribute('href')` when building click selectors
- `console` errors like `[next-auth][error][CLIENT_FETCH_ERROR] ... /api/auth/session` during Playwright runs are navigation-abort test artifacts, not real bugs
- Playwright reads the running dev server at `http://localhost:3000`; don't run `npm run build` concurrently (Prisma `EPERM` lock)

## Hetzner Cloud Deployment
```bash
# One-command setup on fresh Ubuntu 22.04/24.04 (CAX11 arm64, 4 vCPU, 8GB):
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```
After first deploy: edit `/var/www/techstack-finder/.env`, then `npx prisma migrate deploy && pm2 restart techstack-finder`.
