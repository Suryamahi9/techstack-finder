# TechStack Finder

> What is any website built with?

Enter a URL and instantly see the technologies powering it — frameworks, CMS, analytics, hosting, and more. Detect 10,000+ technologies across frontend, backend, and infrastructure layers.

## Features

- **Deep Detection Engine** — 1,870 hand-crafted rules + 8,384 generated rules covering 270 technology categories
- **Headless Browser Scan** — Playwright-powered scanning for JavaScript-rendered sites; falls back to Browserless.io on Vercel
- **5-Tab Analysis** — Overview, Technologies (Main/Rare split), Analysis, Code Snippets, Tools
- **PDF Export** — One-click A4 report generation via html2canvas + jsPDF
- **Tech Radar** — Interactive radar visualization of detected technologies
- **Site Monitor** — Track technology changes over time with diff detection
- **Bulk Scan** — Scan multiple URLs in parallel
- **Backlink Checker** — Integrates with Ahrefs, Moz, SEMrush, Ubersuggest, SmallSEOTools
- **Custom Rules** — Define your own detection patterns (regex or text match)
- **API Access** — RESTful API with tier-based rate limits and API key management
- **15 Themes** — Dark, light, terminal, blueprint, sakura, and more via CSS variables
- **SaaS Ready** — Stripe billing (Free/Pro/Enterprise tiers), admin panel, email service

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, no TypeScript) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 (Google, GitHub, Email/Password) |
| Payments | Stripe (Checkout, Webhooks, Billing Portal) |
| Email | Resend |
| Styling | Tailwind CSS + CSS variables |
| Scanning | Cheerio + Playwright (headless Chromium) |
| Fonts | Space Grotesk (UI) + JetBrains Mono (code) |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Suryamahi9/techstack-finder.git
cd techstack-finder
npm install
```

### 2. Configure environment

```bash
cp .env .env.local
```

Edit `.env.local` with your credentials:

```env
# Required
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Optional — Google OAuth (for Google login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional — GitHub OAuth (for GitHub login)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Optional — Stripe (for paid plans)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_ENTERPRISE_PRICE_ID=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Optional — Email (for password reset/welcome emails)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# Optional — Remote browser (for Vercel deployment)
BROWSERLESS_API_KEY=
```

### 3. Set up database

```bash
npx prisma migrate dev --name init
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## OAuth Setup

### Google

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

### GitHub

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret in `.env.local`

## Production Build

```bash
npx prisma generate
npm run build
npm start
```

Or use the combined command:

```bash
npm run build   # runs: prisma generate && next build
```

## API

### Scan a Website

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "example.com"}'
```

Response includes detected technologies organized by category, summary stats, security analysis, and SEO data.

### With API Key

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -H "x-api-key: tsf_your_key_here" \
  -d '{"url": "example.com"}'
```

### Rate Limits

| Tier | Requests/min | Scans/month |
|------|-------------|-------------|
| Anonymous | 10 | — |
| Free | 10 | 50 |
| Pro ($19/mo) | 100 | 2,000 |
| Enterprise ($79/mo) | 500 | 20,000 |

### All API Routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/scan` | POST, GET | Scan a website |
| `/api/badge` | GET | SVG badge for a domain |
| `/api/screenshot` | GET | Screenshot proxy |
| `/api/api-keys` | GET, POST, DELETE | API key management |
| `/api/bookmarks` | GET, POST, DELETE | Bookmark CRUD |
| `/api/history` | GET, POST, DELETE | Scan history CRUD |
| `/api/monitors` | GET, POST, DELETE | Monitor CRUD |
| `/api/custom-rules` | GET, POST, DELETE | Custom detection rules |
| `/api/backlinks` | GET, POST, DELETE | Backlink entries |
| `/api/user/profile` | PUT | Update user name |
| `/api/user/password` | PUT | Change password |
| `/api/user/delete` | DELETE | Delete account |
| `/api/auth/signup` | POST | Email/password signup |
| `/api/auth/forgot-password` | POST | Send password reset |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/stripe/checkout` | POST | Create Stripe Checkout session |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/portal` | POST | Open Stripe billing portal |
| `/api/admin/users` | GET, PUT | User management (admin) |
| `/api/admin/stats` | GET | System stats (admin) |
| `/api/admin/scans` | GET | Scan logs (admin) |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with search and animated terminal scanner |
| `/results` | 5-tab scan results (Overview, Technologies, Analysis, Code, Tools) |
| `/browse` | Browse technologies by category |
| `/radar` | Interactive tech radar visualization |
| `/leaderboard` | Top technologies, sites, and categories |
| `/compare` | Side-by-side technology comparison |
| `/history` | Scan history with diff detection |
| `/monitor` | Track technology changes over time |
| `/bookmarks` | Saved scan reports |
| `/bulk` | Bulk URL scanning |
| `/backlinks` | Backlink checker with tool integration |
| `/rules` | Custom detection rule builder |
| `/trends` | Scan trends and analytics |
| `/digest` | Weekly digest summary |
| `/pricing` | 3-tier pricing (Free, Pro, Enterprise) |
| `/settings` | Account settings and subscription |
| `/api-keys` | API key management |
| `/admin` | Admin dashboard (role-gated) |
| `/login` | Email + OAuth login |
| `/signup` | Email + OAuth signup |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password with token |
| `/docs` | API documentation |
| `/site/[domain]` | Public tech profile for any domain |

## Database Schema

13 models powered by Prisma + PostgreSQL:

- **User** — accounts, tiers (free/pro/enterprise), roles (user/admin)
- **Account** — OAuth provider links
- **Session** — active sessions
- **VerificationToken** — email verification tokens
- **Subscription** — Stripe subscription records
- **ApiKey** — API keys with usage tracking
- **UsageLog** — per-request logging (userId, keyId, IP, duration, status)
- **ScanHistory** — scan results with full technology breakdown
- **Bookmark** — saved scan reports
- **Monitor** — site monitoring configs with history
- **CustomRule** — user-defined detection patterns
- **BacklinkEntry** — manual backlink tracking
- **PasswordReset** — time-limited reset tokens

After schema changes:

```bash
npx prisma migrate dev --name description
```

## Deployment

### Hetzner Cloud (Recommended)

One-command setup on a fresh Ubuntu server (CAX11 arm64, 4 vCPU, 8GB, €5.29/mo):

```bash
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```

This installs Node 20, nginx, PM2, clones the repo, builds, and configures everything.

After first deploy, edit `.env` with real credentials and run:

```bash
npx prisma migrate deploy
pm2 restart techstack-finder
```

### Vercel

The app is Vercel-aware — it detects `process.env.VERCEL` and disables local Playwright, CSS/JS deep fetch, and path probes (not available on serverless). Uses Browserless.io as remote browser fallback.

### Redeploy (Hetzner)

```bash
bash /var/www/techstack-finder/deploy/redeploy.sh
```

Or manually:

```bash
cd /var/www/techstack-finder && git pull && npm run build && pm2 restart techstack-finder
```

## Project Structure

```
techstack-finder/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (22 routes)
│   ├── admin/              # Admin dashboard
│   ├── browse/             # Technology browser
│   ├── results/            # Scan results (5 tabs)
│   └── ...                 # 24 total pages
├── components/             # React components (64 files)
│   ├── Header.js           # Navigation with spotlight effects
│   ├── TechTab.js          # Main/Rare technology split
│   ├── DownloadPdfButton.js # PDF export
│   └── ...
├── lib/                    # Core logic
│   ├── detect.js           # Detection engine (7,179 lines, 1,870 rules)
│   ├── deep-scan.js        # CSS/JS fetching, path probes, Playwright
│   ├── auth.js             # NextAuth configuration
│   ├── stripe.js           # Stripe client + plan config
│   ├── email.js            # Resend email service
│   ├── scan-history.js     # Dual-mode persistence (localStorage + server)
│   └── scan-history.js     # localStorage history
├── scripts/                # Rule generation
│   ├── generate.js         # Template-based rule generator (1,070 lines)
│   ├── data-fe.js          # Frontend technology data
│   ├── data-be.js          # Backend technology data
│   ├── data-infra.js       # Infrastructure data
│   ├── data-content.js     # Content management data
│   └── _generated_rules.json # Generated rules (8,384 rules, 3.3MB)
├── prisma/
│   └── schema.prisma       # Database schema (13 models)
├── deploy/                 # Deployment scripts
│   ├── hetzner-setup.sh    # One-command Hetzner setup
│   ├── ecosystem.config.js # PM2 config
│   └── redeploy.sh         # Update script
├── public/                 # Static assets
├── globals.css             # Theme variables + base styles
├── tailwind.config.js      # Tailwind config + custom animations
└── middleware.js           # Route protection (9 routes)
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | Yes | PostgreSQL direct connection (for migrations) |
| `NEXTAUTH_SECRET` | Yes | Random string for JWT signing |
| `NEXTAUTH_URL` | Yes | App URL (`http://localhost:3000` for dev) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | No | Stripe price ID for Pro plan |
| `STRIPE_ENTERPRISE_PRICE_ID` | No | Stripe price ID for Enterprise plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key (client-side) |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `EMAIL_FROM` | No | Sender email address |
| `BROWSERLESS_API_KEY` | No | Browserless.io key (for Vercel deployment) |

## License

Private — All rights reserved.
