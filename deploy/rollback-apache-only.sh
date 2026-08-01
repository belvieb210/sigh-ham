#!/usr/bin/env bash
# Retour à Apache seul sur les ports 80 et 443 — tous les projets PHP + SIGH en proxy
# Usage (root) : bash /var/www/sigh-ham/deploy/rollback-apache-only.sh
#
# Ce script :
#   1. Arrête Nginx (libère 80/443)
#   2. Restaure la config Apache (backup ou correction 8080 → 80/443)
#   3. Réactive hamlab5.duckdns.org → Next.js via Apache
#   4. Ne touche PAS aux bases de données MySQL/PostgreSQL
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
EMAIL="${CERTBOT_EMAIL:-bokulubelvie@gmail.com}"
SIGH_DOMAIN="${SIGH_DOMAIN:-hamlab5.duckdns.org}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root : sudo bash deploy/rollback-apache-only.sh"
  exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo "  Retour Apache seul (80/443) — bases de données intactes"
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "==> 1. Arrêt de Nginx"
systemctl stop nginx 2>/dev/null || true
systemctl disable nginx 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/sigh-ham /etc/nginx/sites-enabled/apache-sites 2>/dev/null || true
echo "   Nginx arrêté — ports 80/443 libérés"

echo ""
echo "==> 2. Restauration config Apache"
BACKUP=$(ls -td /root/apache-backup-* 2>/dev/null | head -1 || true)

if [[ -n "$BACKUP" && -d "${BACKUP}/apache2" ]]; then
  echo "   Backup trouvé : ${BACKUP}"
  cp -a "${BACKUP}/apache2/"* /etc/apache2/
  echo "   Config Apache restaurée depuis le backup"
else
  echo "   Pas de backup — correction manuelle ports + VirtualHost"
  PORTS="/etc/apache2/ports.conf"

  # Port 80
  if grep -q '^Listen 8080' "${PORTS}"; then
    sed -i 's/^Listen 8080/Listen 80/' "${PORTS}"
  elif ! grep -q '^Listen 80' "${PORTS}"; then
    sed -i '1i Listen 80' "${PORTS}"
  fi

  # Port 443 (décommenter les Listen 443 indentés)
  sed -i 's/^\([[:space:]]*\)#Listen 443/\1Listen 443/' "${PORTS}"
  if ! grep -qE '[[:space:]]*Listen 443' "${PORTS}"; then
    cat >> "${PORTS}" <<'EOF'

<IfModule ssl_module>
        Listen 443
</IfModule>
EOF
  fi

  # VirtualHost 8080 → 80 ou 443
  for f in /etc/apache2/sites-available/*; do
    [[ -f "$f" ]] || continue
    base=$(basename "$f")
    if [[ "$base" == *"-le-ssl.conf" ]] || [[ "$base" == *"ssl"* ]]; then
      sed -i 's/<VirtualHost \*:8080>/<VirtualHost *:443>/g' "$f"
      sed -i 's/<VirtualHost \*:8080 /<VirtualHost *:443 /g' "$f"
    else
      sed -i 's/<VirtualHost \*:8080>/<VirtualHost *:80>/g' "$f"
      sed -i 's/<VirtualHost \*:8080 /<VirtualHost *:80 /g' "$f"
    fi
  done
fi

echo ""
echo "==> 3. Modules et sites Apache"
a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl 2>/dev/null || true

# SIGH via Apache (reverse proxy Next.js)
cp "${APP_DIR}/deploy/apache/sigh-ham.conf" /etc/apache2/sites-available/sigh-ham.conf
a2ensite sigh-ham.conf 2>/dev/null || a2ensite sigh-ham 2>/dev/null || true

# Réactiver les sites courants (sauf conflits)
for site in $(ls /etc/apache2/sites-available/ 2>/dev/null); do
  [[ "$site" == "000-default.conf" ]] && continue
  [[ "$site" == "default-ssl.conf" ]] && continue
  a2ensite "$site" 2>/dev/null || true
done

apache2ctl configtest
systemctl enable apache2
systemctl restart apache2

echo ""
echo "==> 4. Vérification des ports"
ss -tlnp | grep -E ':80|:443' || true
apache2ctl -S 2>/dev/null | head -30

echo ""
echo "==> 5. SSL Let's Encrypt (Apache)"
echo "   Renouvellement / création certificats via Apache..."
DOMAINS=()
while IFS= read -r name; do
  [[ -z "$name" ]] && continue
  [[ "$name" == "$SIGH_DOMAIN" ]] && DOMAINS+=("$name") && continue
  DOMAINS+=("$name")
done < <(grep -rh '^\s*ServerName' /etc/apache2/sites-enabled/ 2>/dev/null | awk '{print $2}' | sort -u)

for domain in "${DOMAINS[@]}"; do
  [[ "$domain" == "localhost" ]] && continue
  [[ "$domain" == *"127.0.0.1"* ]] && continue
  echo "   → certbot --apache -d ${domain}"
  certbot --apache -d "${domain}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive \
    --redirect 2>/dev/null || \
  certbot certonly --apache -d "${domain}" \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive 2>/dev/null || \
  echo "     ⚠ Échec pour ${domain} — relancez manuellement"
done

systemctl restart apache2

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Apache seul actif sur 80/443"
echo ""
echo "   SIGH        : http://${SIGH_DOMAIN}/connexion"
echo "   Autres sites: http://hamlabor.org, profildeborah.duckdns.org, etc."
echo ""
echo "   Services Node SIGH (doivent tourner) :"
echo "     systemctl status sigh-web sigh-socket"
echo ""
echo "   Si HTTPS manque pour un domaine :"
echo "     certbot --apache -d DOMAINE --email ${EMAIL} --agree-tos"
echo "═══════════════════════════════════════════════════════════"
