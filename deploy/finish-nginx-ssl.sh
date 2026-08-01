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

# shellcheck source=lib/apache-443.sh
source "${APP_DIR}/deploy/lib/apache-443.sh"

echo "==> Apache : libérer le port 443 (Nginx sert le SSL)"
liberer_port_443_apache

echo "==> Nginx : site SIGH (ne pas supprimer apache-sites)"
mkdir -p /etc/nginx/sites-enabled
cp "${APP_DIR}/deploy/nginx/sigh-ham-coexist-ssl.conf" /etc/nginx/sites-available/sigh-ham
ln -sf /etc/nginx/sites-available/sigh-ham /etc/nginx/sites-enabled/sigh-ham

nginx -t
systemctl restart nginx

echo ""
echo "==> Diagnostic port 443"
ss -tlnp | grep ':443' || echo "(rien sur 443 ?)"
echo ""
echo "==> Certificat servi pour ${DOMAIN}"
echo | openssl s_client -connect "127.0.0.1:443" -servername "${DOMAIN}" 2>/dev/null \
  | openssl x509 -noout -subject -dates 2>/dev/null || echo "Échec openssl"

echo ""
if curl -sfI "https://${DOMAIN}/connexion" | head -3; then
  echo ""
  echo "✅ HTTPS actif : https://${DOMAIN}/connexion"
else
  echo ""
  echo "❌ HTTPS encore incorrect. Envoyez la sortie de :"
  echo "   nginx -T | grep -E 'listen|ssl_certificate|server_name'"
  echo "   ls -la /etc/nginx/sites-enabled/"
  exit 1
fi
