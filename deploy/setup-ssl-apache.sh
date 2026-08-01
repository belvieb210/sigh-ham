#!/usr/bin/env bash
# Active HTTPS pour hamlab5.duckdns.org (Apache + Let's Encrypt)
set -euo pipefail

DOMAIN="hamlab5.duckdns.org"
EMAIL="${CERTBOT_EMAIL:-bokulubelvie@gmail.com}"

echo "==> Certbot Apache pour ${DOMAIN}"
apt-get update -qq
apt-get install -y certbot python3-certbot-apache

certbot --apache -d "${DOMAIN}" \
  --email "${EMAIL}" \
  --agree-tos \
  --non-interactive \
  --redirect

echo "==> Vérification Apache"
apache2ctl configtest
systemctl reload apache2

echo "✅ HTTPS actif : https://${DOMAIN}/connexion"
