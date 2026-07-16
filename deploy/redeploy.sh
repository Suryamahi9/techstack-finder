#!/bin/bash
# ══════════════════════════════════════════════════════════════
# Quick redeploy — pull latest, rebuild, restart
# ══════════════════════════════════════════════════════════════
set -euo pipefail

APP_DIR="/var/www/techstack-finder"
APP_NAME="techstack-finder"

echo "→ Pulling latest changes..."
cd "$APP_DIR"
git pull origin main

echo "→ Installing dependencies..."
npm ci --omit=dev

echo "→ Rebuilding..."
npx prisma generate
npm run build

echo "→ Restarting PM2..."
pm2 restart "$APP_NAME"

echo "✓  Redeployed successfully!"
pm2 status "$APP_NAME"
