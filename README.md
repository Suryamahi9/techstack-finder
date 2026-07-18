# TechStack Finder

> What is any website built with?

Enter a URL and instantly see the technologies powering it — frameworks, CMS, analytics, hosting, and more. Detect 10,000+ technologies across frontend, backend, and infrastructure layers.

## Features

- **Deep Detection Engine** — 1,870 hand-crafted rules + 8,384 generated rules covering 270 technology categories
- **Headless Browser Scan** — Playwright-powered scanning for JavaScript-rendered sites; falls back to Browserless.io on Vercel
- **5-Tab Analysis** — Overview, Technologies (Main/Rare split), Analysis, Code Snippets, Tools
- **PDF Export** — One-click A4 report generation
- **Tech Radar** — Interactive radar visualization of detected technologies
- **Site Monitor** — Track technology changes over time with diff detection
- **Bulk Scan** — Scan multiple URLs in parallel
- **Backlink Checker** — Integrates with Ahrefs, Moz, SEMrush, Ubersuggest, SmallSEOTools
- **Custom Rules** — Define your own detection patterns (regex or text match)
- **API Access** — RESTful API with tier-based rate limits and API key management
- **15 Themes** — Dark, light, terminal, blueprint, sakura, and more
- **SaaS Ready** — Stripe billing (Free/Pro/Enterprise tiers), admin panel, email service

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 (Google, GitHub, Email/Password) |
| Payments | Stripe |
| Email | Resend |
| Styling | Tailwind CSS + CSS variables |
| Scanning | Cheerio + Playwright (headless Chromium) |
| Fonts | Space Grotesk + JetBrains Mono |

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Suryamahi9/techstack-finder.git
cd techstack-finder
npm install
```

### 2. Configure environment

Copy `.env` to `.env.local` and fill in your credentials:

```env
# Required
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

See `.env` for the full list of optional variables (OAuth, Stripe, Email, Browserless).

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

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret in `.env.local`

## API

### Scan a Website

```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "example.com"}'
```

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

## Deployment

### Hetzner Cloud (Recommended)

One-command setup on a fresh Ubuntu server (CAX11 arm64, 4 vCPU, 8GB, ~€5/mo):

```bash
REPO_URL="https://github.com/Suryamahi9/techstack-finder.git" \
DOMAIN="yourdomain.com" \
EMAIL="you@email.com" \
bash <(curl -fsSL https://raw.githubusercontent.com/Suryamahi9/techstack-finder/main/deploy/hetzner-setup.sh)
```

After first deploy, edit `.env` with real credentials:

```bash
npx prisma migrate deploy
pm2 restart techstack-finder
```

### Redeploy

```bash
bash /var/www/techstack-finder/deploy/redeploy.sh
```

Or manually:

```bash
cd /var/www/techstack-finder && git pull && npm run build && pm2 restart techstack-finder
```

### Vercel

Deploy to Vercel with zero config. The app detects Vercel and uses Browserless.io for remote browser scanning (local Playwright is not available on serverless).

## License

Private — All rights reserved.
