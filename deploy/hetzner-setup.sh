#!/bin/bash
# ══════════════════════════════════════════════════════════════
# TechStack Finder — Hetzner Cloud Server Setup
# ══════════════════════════════════════════════════════════════
# Run this on a fresh Ubuntu 22.04/24.04 Hetzner Cloud server
# Recommended: CAX11 (arm64, 4 vCPU, 8GB RAM, €5.29/mo)
#
# Usage:
#   ssh root@YOUR_SERVER_IP
#   bash <(curl -fsSL https://raw.githubusercontent.com/USER/REPO/main/deploy/hetzner-setup.sh)
#
# Or copy the file and run manually:
#   scp deploy/hetzner-setup.sh root@YOUR_SERVER_IP:/root/
#   ssh root@YOUR_SERVER_IP "bash /root/hetzner-setup.sh"
# ══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ──
APP_NAME="techstack-finder"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="20"
REPO_URL="${REPO_URL:-https://github.com/Suryamahi9/techstack-finder.git}"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║  TechStack Finder — Hetzner Cloud Setup   ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

# ── 1. System updates ──
echo "→ Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js ──
echo "→ Installing Node.js $NODE_VERSION..."
if ! command -v node &>/dev/null || [[ "$(node -v)" != "v$NODE_VERSION"* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash -
  apt-get install -y -qq nodejs
fi
echo "  Node $(node -v) | npm $(npm -v)"

# ── 3. PM2 ──
echo "→ Installing PM2 globally..."
npm install -g pm2 2>/dev/null
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# ── 4. App directory + clone ──
echo "→ Setting up application..."
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR" && git pull origin main
fi

# ── 5. Install dependencies ──
echo "→ Installing npm dependencies..."
cd "$APP_DIR"
npm ci --omit=dev

# ── 6. Environment file ──
if [ ! -f "$APP_DIR/.env" ]; then
  echo ""
  echo "  ⚠  No .env file found. Creating template..."
  cat > "$APP_DIR/.env" <<'ENVEOF'
# ═══ Database ═══
DATABASE_URL="postgresql://user:password@localhost:5432/techstack?schema=public"

# ═══ Auth ═══
NEXTAUTH_SECRET="GENERATE_WITH: openssl rand -base64 32"
NEXTAUTH_URL="https://YOUR_DOMAIN"

# ═══ Google OAuth ═══
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ═══ GitHub OAuth ═══
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ═══ Browserless (optional, for remote browser scan) ═══
BROWSERLESS_API_KEY=""
ENVEOF
  echo "  ✓  Template created at $APP_DIR/.env"
  echo "  ✏  Edit it with your actual values before starting the app."
  echo ""
fi

# ── 7. Prisma + Build ──
echo "→ Running Prisma generate + Next.js build..."
cd "$APP_DIR"
npx prisma generate
npm run build

# ── 8. PM2 start ──
echo "→ Starting app with PM2..."
cd "$APP_DIR"
pm2 delete "$APP_NAME" 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save

# ── 9. Nginx config ──
echo "→ Configuring Nginx..."
if [ -n "$DOMAIN" ]; then
  SERVER_NAME="$DOMAIN www.$DOMAIN"
else
  SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/"$APP_NAME" <<NGINX_EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_NAME;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 65s;
        proxy_send_timeout 65s;
    }

    # Static assets cache
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Favicon
    location /favicon.ico {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/"$APP_NAME" /etc/nginx/sites-enabled/"$APP_NAME"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ── 10. Firewall ──
echo "→ Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ── 11. SSL (if domain provided) ──
if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
  echo "→ Setting up SSL with Let's Encrypt..."
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || true
  echo "  SSL certificate installed."
else
  echo ""
  echo "  ℹ  No domain/email provided — skipping SSL."
  echo "  To add SSL later:"
  echo "    certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN --non-interactive --agree-tos -m YOUR_EMAIL"
fi

# ── 12. Auto-renew cron ──
echo "→ Setting up SSL auto-renew..."
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sort -u | crontab -

echo ""
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║  ✓  Deployment complete!                         ║"
echo "  ╠═══════════════════════════════════════════════════╣"
echo "  ║                                                   ║"
if [ -n "$DOMAIN" ]; then
echo "  ║  🌐  https://$DOMAIN                             ║"
fi
echo "  ║  📁  App:  $APP_DIR                              ║"
echo "  ║  📊  PM2:  pm2 status / pm2 logs                 ║"
echo "  ║  🔧  Nginx: /etc/nginx/sites-available/$APP_NAME ║"
echo "  ║                                                   ║"
echo "  ║  Useful commands:                                 ║"
echo "  ║    pm2 restart $APP_NAME                          ║"
echo "  ║    pm2 logs $APP_NAME                             ║"
echo "  ║    cd $APP_DIR && git pull && npm run build       ║"
echo "  ║    pm2 restart $APP_NAME                          ║"
echo "  ║                                                   ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo ""
