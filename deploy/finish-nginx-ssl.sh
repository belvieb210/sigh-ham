#!/usr/bin/env bash
# Finalise HTTPS Nginx après certbot certonly (certificat déjà obtenu)
# Usage (root) : bash /var/www/sigh-ham/deploy/finish-nginx-ssl.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
DOMAIN="${DOMAIN:-hamlab5.duckdns.org}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root"
  exit 1
fi

if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  echo "❌ Certificat absent. Lancez d'abord : bash deploy/migrate-nginx-apache.sh"
  exit 1
fi

echo "==> Config Nginx HTTPS"
cp "${APP_DIR}/deploy/nginx/sigh-ham-coexist-ssl.conf" /etc/nginx/sites-available/sigh-ham
ln -sf /etc/nginx/sites-available/sigh-ham /etc/nginx/sites-enabled/sigh-ham

nginx -t
systemctl reload nginx

echo ""
echo "✅ HTTPS actif : https://${DOMAIN}/connexion"
curl -sI "https://${DOMAIN}/connexion" | head -5
