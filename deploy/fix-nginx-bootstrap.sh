#!/usr/bin/env bash
# Remet Nginx en mode HTTP (sans SSL) — à lancer si nginx ne démarre pas
# Usage (root) : bash /var/www/sigh-ham/deploy/fix-nginx-bootstrap.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
DOMAIN="${DOMAIN:-hamlab5.duckdns.org}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root : sudo bash deploy/fix-nginx-bootstrap.sh"
  exit 1
fi

echo "==> Diagnostic"
nginx -t 2>&1 || true
echo ""
ss -tlnp | grep -E ':80|:443' || echo "(ports 80/443 libres ou ss indisponible)"
echo ""

if systemctl is-active --quiet apache2 2>/dev/null; then
  echo "==> Apache détecté — arrêt (conflit port 80)"
  systemctl stop apache2
  systemctl disable apache2
fi

echo "==> Config HTTP bootstrap (sans certificat SSL)"
cp "${APP_DIR}/deploy/nginx/sigh-ham-http.bootstrap.conf" /etc/nginx/sites-available/sigh-ham
ln -sf /etc/nginx/sites-available/sigh-ham /etc/nginx/sites-enabled/sigh-ham
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx
systemctl status nginx --no-pager

echo ""
echo "✅ Nginx démarré en HTTP pour ${DOMAIN}"
echo "   Test : curl -I http://${DOMAIN}"
echo ""
echo "Après deploy-app.sh + certbot SSL :"
echo "   certbot --nginx -d ${DOMAIN} --email VOTRE@EMAIL --agree-tos --non-interactive"
echo "   cp ${APP_DIR}/deploy/nginx/sigh-ham.conf /etc/nginx/sites-available/sigh-ham"
echo "   nginx -t && systemctl reload nginx"
