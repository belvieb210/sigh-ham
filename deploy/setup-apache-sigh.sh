#!/usr/bin/env bash
# Apache (port 80) + SIGH via reverse proxy — sans Nginx sur le port 80
# Usage (root) : bash /var/www/sigh-ham/deploy/setup-apache-sigh.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root"
  exit 1
fi

echo "==> Modules Apache requis"
a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl 2>/dev/null || true

echo "==> VirtualHost SIGH HAM"
cp "${APP_DIR}/deploy/apache/sigh-ham.conf" /etc/apache2/sites-available/sigh-ham.conf
a2ensite sigh-ham.conf 2>/dev/null || a2ensite sigh-ham

echo "==> Test et rechargement Apache"
apache2ctl configtest
systemctl enable apache2
systemctl restart apache2
systemctl status apache2 --no-pager

echo ""
echo "✅ Apache sert hamlab5.duckdns.org → Next.js :3000"
echo "   Vos autres sites Apache sur :80 restent inchangés."
echo ""
echo "Prochaine étape :"
echo "  sudo -u sigh bash ${APP_DIR}/deploy/deploy-app.sh --seed"
echo ""
echo "SSL : certbot --apache -d hamlab5.duckdns.org --email VOTRE@EMAIL --agree-tos"
