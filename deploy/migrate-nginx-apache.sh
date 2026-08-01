#!/usr/bin/env bash
# Nginx (port 80/443) devant Apache (port 8080) — vos autres sites restent actifs
# Usage (root) : bash /var/www/sigh-ham/deploy/migrate-nginx-apache.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
DOMAIN="${DOMAIN:-hamlab5.duckdns.org}"
EMAIL="${CERTBOT_EMAIL:-bokulubelvie@gmail.com}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root : sudo bash deploy/migrate-nginx-apache.sh"
  exit 1
fi

echo "==> Sauvegarde Apache"
BACKUP="/root/apache-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "${BACKUP}"
cp -a /etc/apache2 "${BACKUP}/"

echo "==> Apache écoute sur 8080 (Nginx prend le port 80)"
PORTS="/etc/apache2/ports.conf"
if grep -q '^Listen 80' "${PORTS}"; then
  sed -i 's/^Listen 80/Listen 8080/' "${PORTS}"
fi
if ! grep -q '^Listen 8080' "${PORTS}"; then
  echo "Listen 8080" >> "${PORTS}"
fi

echo "==> VirtualHost Apache *:80 → *:8080"
for f in /etc/apache2/sites-available/*; do
  [[ -f "$f" ]] || continue
  sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/g' "$f"
  sed -i 's/<VirtualHost \*:80 /<VirtualHost *:8080 /g' "$f"
done

echo "==> Désactivation du vhost Apache SIGH (Nginx le remplace)"
a2dissite sigh-ham.conf 2>/dev/null || a2dissite sigh-ham 2>/dev/null || true

apache2ctl configtest
systemctl restart apache2
echo "   Apache actif sur :8080"

echo "==> Installation Nginx"
apt-get update -qq
apt-get install -y nginx certbot python3-certbot-nginx
mkdir -p /var/www/certbot

echo "==> Config Nginx coexistence (HTTP)"
cp "${APP_DIR}/deploy/nginx/sigh-ham-with-apache.conf" /etc/nginx/sites-available/sigh-ham
ln -sf /etc/nginx/sites-available/sigh-ham /etc/nginx/sites-enabled/sigh-ham
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx
echo "   Nginx actif sur :80"

echo "==> Certificat SSL Let's Encrypt pour ${DOMAIN}"
if [[ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]]; then
  certbot certonly --webroot \
    -w /var/www/certbot \
    -d "${DOMAIN}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive
else
  echo "   Certificat déjà présent — étape ignorée"
fi

echo "==> Config Nginx HTTPS (SIGH) + proxy Apache (autres sites)"
cp "${APP_DIR}/deploy/nginx/sigh-ham-coexist-ssl.conf" /etc/nginx/sites-available/sigh-ham
nginx -t
systemctl reload nginx

echo ""
echo "✅ Migration terminée"
echo "   SIGH      : https://${DOMAIN}/connexion"
echo "   Autres sites : http://VOTRE-AUTRE-DOMAINE (Apache via Nginx :8080)"
echo ""
echo "Vérifications :"
echo "   curl -I http://${DOMAIN}"
echo "   curl -I https://${DOMAIN}/connexion"
echo "   systemctl status nginx apache2 sigh-web sigh-socket"
