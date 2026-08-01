#!/usr/bin/env bash
# Génère la config Nginx pour tous les VirtualHost Apache (port 8080)
# + SSL Let's Encrypt si certificat déjà présent ou --certificats pour en créer
#
# Usage (root) :
#   bash /var/www/sigh-ham/deploy/setup-nginx-apache-sites.sh
#   bash /var/www/sigh-ham/deploy/setup-nginx-apache-sites.sh --certificats
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
EMAIL="${CERTBOT_EMAIL:-bokulubelvie@gmail.com}"
SIGH_DOMAIN="${SIGH_DOMAIN:-hamlab5.duckdns.org}"
APACHE_DIR="/etc/apache2/sites-enabled"
OUTPUT="/etc/nginx/sites-available/apache-sites"
WEBROOT="/var/www/certbot"
EMETTRE_CERTIFICATS=false

[[ "${1:-}" == "--certificats" ]] && EMETTRE_CERTIFICATS=true

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root"
  exit 1
fi

# shellcheck source=lib/apache-443.sh
source "${APP_DIR}/deploy/lib/apache-443.sh"

echo "==> Apache : port 8080 + pas de Listen 443"
PORTS="/etc/apache2/ports.conf"
grep -q '^Listen 8080' "${PORTS}" || echo "Listen 8080" >> "${PORTS}"
sed -i 's/^Listen 80/#Listen 80/' "${PORTS}" 2>/dev/null || true
liberer_port_443_apache || true

echo "==> VirtualHost Apache → *:8080 (y compris anciens *:443 SSL)"
for f in /etc/apache2/sites-available/*; do
  [[ -f "$f" ]] || continue
  sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/g' "$f"
  sed -i 's/<VirtualHost \*:80 /<VirtualHost *:8080 /g' "$f"
  sed -i 's/<VirtualHost \*:443>/<VirtualHost *:8080>/g' "$f"
  sed -i 's/<VirtualHost \*:443 /<VirtualHost *:8080 /g' "$f"
done

apache2ctl configtest
systemctl restart apache2

mkdir -p "${WEBROOT}"
mkdir -p /etc/nginx/sites-available

echo "==> Analyse des VirtualHost Apache"
declare -A VU_PAR_FICHIER
declare -a FICHIERS_VHOST

while IFS= read -r lien; do
  [[ -f "$lien" ]] || continue
  FICHIERS_VHOST+=("$lien")
done < <(find -L "${APACHE_DIR}" -maxdepth 1 -type f 2>/dev/null | sort)

certificat_existe() {
  [[ -f "/etc/letsencrypt/live/$1/fullchain.pem" ]]
}

extraire_noms() {
  local fichier="$1"
  local primary="" aliases=""
  while IFS= read -r ligne; do
    if [[ "$ligne" =~ ^[[:space:]]*ServerName[[:space:]]+([^[:space:]]+) ]]; then
      primary="${BASH_REMATCH[1]}"
    elif [[ "$ligne" =~ ^[[:space:]]*ServerAlias[[:space:]]+(.+) ]]; then
      aliases="${BASH_REMATCH[1]}"
    fi
  done < "$fichier"
  [[ -z "$primary" ]] && return 1
  echo "${primary}|${aliases}"
}

{
  echo "# Généré par setup-nginx-apache-sites.sh — $(date -Iseconds)"
  echo "# Proxy Nginx → Apache :8080"
  echo ""
  echo "upstream apache_backend {"
  echo "    server 127.0.0.1:8080;"
  echo "    keepalive 32;"
  echo "}"
  echo ""

  DOMAINS_A_CERTIFIER=()

  for fichier in "${FICHIERS_VHOST[@]}"; do
    info=$(extraire_noms "$fichier") || continue
    primary="${info%%|*}"
    aliases="${info#*|}"

    [[ "$primary" == "$SIGH_DOMAIN" ]] && continue
    [[ "$primary" == "localhost" ]] && continue
    [[ "$primary" == *"127.0.0.1"* ]] && continue

    # Ignorer le vhost Apache SIGH désactivé
    [[ "$(basename "$fichier")" == *sigh-ham* ]] && continue

    server_names="$primary"
    if [[ -n "$aliases" ]]; then
      server_names="$primary $aliases"
    fi

    echo "# $(basename "$fichier") — $primary"
    echo "server {"
    echo "    listen 80;"
    echo "    listen [::]:80;"
    echo "    server_name $server_names;"
    echo ""
    echo "    location /.well-known/acme-challenge/ {"
    echo "        root ${WEBROOT};"
    echo "    }"
    echo ""
    echo "    location / {"
    echo "        proxy_pass http://apache_backend;"
    echo "        proxy_http_version 1.1;"
    echo "        proxy_set_header Host \$host;"
    echo "        proxy_set_header X-Real-IP \$remote_addr;"
    echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "        proxy_set_header Connection \"\";"
    echo "    }"
    echo "}"
    echo ""

    cert_domain="$primary"
    if certificat_existe "$primary"; then
      cert_domain="$primary"
    elif [[ -n "$aliases" ]]; then
      for alias in $aliases; do
        if certificat_existe "$alias"; then
          cert_domain="$alias"
          break
        fi
      done
    fi

    if certificat_existe "$cert_domain"; then
      echo "server {"
      echo "    listen 443 ssl http2;"
      echo "    listen [::]:443 ssl http2;"
      echo "    server_name $server_names;"
      echo ""
      echo "    ssl_certificate     /etc/letsencrypt/live/${cert_domain}/fullchain.pem;"
      echo "    ssl_certificate_key /etc/letsencrypt/live/${cert_domain}/privkey.pem;"
      echo "    ssl_protocols TLSv1.2 TLSv1.3;"
      echo "    ssl_prefer_server_ciphers off;"
      echo "    ssl_session_cache shared:SSL:10m;"
      echo "    ssl_session_timeout 1d;"
      echo ""
      echo "    client_max_body_size 50M;"
      echo ""
      echo "    location / {"
      echo "        proxy_pass http://apache_backend;"
      echo "        proxy_http_version 1.1;"
      echo "        proxy_set_header Host \$host;"
      echo "        proxy_set_header X-Real-IP \$remote_addr;"
      echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
      echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
      echo "        proxy_set_header Connection \"\";"
      echo "    }"
      echo "}"
      echo ""
      echo "   ✓ SSL : $cert_domain"
    else
      echo "# Pas de certificat pour $primary — HTTP seulement (lancez --certificats)"
      DOMAINS_A_CERTIFIER+=("$primary")
    fi
  done

  # HTTP fallback pour domaines non listés explicitement
  echo "# Fallback HTTP → Apache (autres noms de domaine)"
  echo "server {"
  echo "    listen 80 default_server;"
  echo "    listen [::]:80 default_server;"
  echo "    server_name _;"
  echo ""
  echo "    location /.well-known/acme-challenge/ {"
  echo "    root ${WEBROOT};"
  echo "    }"
  echo ""
  echo "    location / {"
  echo "        proxy_pass http://apache_backend;"
  echo "        proxy_http_version 1.1;"
  echo "        proxy_set_header Host \$host;"
  echo "        proxy_set_header X-Real-IP \$remote_addr;"
  echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
  echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
  echo "    }"
  echo "}"
} > "${OUTPUT}"

ln -sf "${OUTPUT}" /etc/nginx/sites-enabled/apache-sites

if [[ "$EMETTRE_CERTIFICATS" == true && ${#DOMAINS_A_CERTIFIER[@]} -gt 0 ]]; then
  echo "==> Certificats manquants"
  apt-get install -y certbot 2>/dev/null || true
  for domain in "${DOMAINS_A_CERTIFIER[@]}"; do
    echo "   → certbot pour $domain"
    certbot certonly --webroot -w "${WEBROOT}" -d "${domain}" \
      --email "${EMAIL}" --agree-tos --non-interactive || true
  done
  echo "==> Régénération config après certificats"
  exec "$0"
fi

echo "==> Test Nginx"
nginx -t
systemctl reload nginx

echo ""
echo "✅ Sites Apache proxifiés via Nginx"
echo "   Config : ${OUTPUT}"
echo ""
if [[ ${#DOMAINS_A_CERTIFIER[@]} -gt 0 ]]; then
  echo "⚠ Domaines sans HTTPS (certificat absent) :"
  printf '   - %s\n' "${DOMAINS_A_CERTIFIER[@]}"
  echo ""
  echo "   Obtenir les certificats :"
  echo "   bash ${APP_DIR}/deploy/setup-nginx-apache-sites.sh --certificats"
fi
echo ""
echo "Certificats Let's Encrypt présents :"
certbot certificates 2>/dev/null | grep -E "Certificate Name|Domains:" || true
