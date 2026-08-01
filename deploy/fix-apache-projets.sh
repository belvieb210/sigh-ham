#!/usr/bin/env bash
# Nettoie les VirtualHost en conflit + recrée hamlabor, profildeborah, SIGH
# Usage (root) : bash /var/www/sigh-ham/deploy/fix-apache-projets.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
LISTE="${APP_DIR}/deploy/projets-apache.list"
SITES_AV="/etc/apache2/sites-available"
SIGH_DOMAIN="${SIGH_DOMAIN:-hamlab5.duckdns.org}"
EMAIL="${CERTBOT_EMAIL:-bokulubelvie@gmail.com}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root"
  exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo "  1. Diagnostic Apache"
echo "═══════════════════════════════════════════════════════════"
apache2ctl -S 2>&1 || true

detecter_racine() {
  local base="$1"
  if [[ -f "${base}/index.php" || -f "${base}/index.html" ]]; then
    echo "${base}"
  elif [[ -f "${base}/public/index.php" || -f "${base}/public/index.html" ]]; then
    echo "${base}/public"
  else
    echo "${base}"
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  2. Désactivation des sites en conflit + fix 000-default-le-ssl"
echo "═══════════════════════════════════════════════════════════"

# Certbot déploie souvent sur 000-default-le-ssl avec DocumentRoot /var/www/ham (inexistant)
FIX_SSL="/etc/apache2/sites-available/000-default-le-ssl.conf"
if [[ -f "$FIX_SSL" ]]; then
  if grep -qE '/var/www/ham[^_]|DocumentRoot /var/www/ham"' "$FIX_SSL" 2>/dev/null; then
    sed -i 's|/var/www/ham|/var/www/ham_project|g' "$FIX_SSL"
    echo "   ✓ 000-default-le-ssl : /var/www/ham → /var/www/ham_project"
  fi
fi

# Corriger le même chemin erroné dans tous les vhosts
grep -rl 'DocumentRoot /var/www/ham"' /etc/apache2/sites-available/ 2>/dev/null \
  | while read -r f; do
  sed -i 's|DocumentRoot /var/www/ham"|DocumentRoot /var/www/ham_project"|g' "$f"
  sed -i 's|<Directory /var/www/ham>|<Directory /var/www/ham_project>|g' "$f"
  echo "   ✓ corrigé : $(basename "$f")"
done

CONFLITS=(
  "ham.conf"
  "le-redirect-hamlabor.org.conf"
  "ProfilDeborah-http.conf"
  "ProfilDeborah.conf"
  "ProfilDeborah-le-ssl.conf"
)
for site in "${CONFLITS[@]}"; do
  if a2dissite "$site" 2>/dev/null; then
    echo "   ✗ désactivé : $site"
  fi
done

a2enmod rewrite ssl headers proxy proxy_http proxy_wstunnel 2>/dev/null || true

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  3. VirtualHost projets PHP"
echo "═══════════════════════════════════════════════════════════"

while IFS='|' read -r domaine base aliases; do
  [[ -z "$domaine" || "$domaine" =~ ^# ]] && continue

  docroot=$(detecter_racine "$base")

  if [[ ! -d "$docroot" ]] || [[ ! -f "${docroot}/index.php" && ! -f "${docroot}/index.html" ]]; then
    # ProfilDeborah etc. : chercher index.php dans le dossier
    if [[ -f "${base}/index.php" ]]; then
      docroot="$base"
    elif [[ -f "${base}/public/index.php" ]]; then
      docroot="${base}/public"
    else
      echo "⚠ ${domaine} — index introuvable dans ${base}"
      ls -la "$base" 2>/dev/null | head -3
      continue
    fi
  fi

  safe=$(echo "$domaine" | tr '.' '-')
  conf="${SITES_AV}/${domaine}.conf"
  ssl_conf="${SITES_AV}/${domaine}-le-ssl.conf"

  cat > "$conf" <<EOF
# fix-apache-projets.sh — $(date -Iseconds)
<VirtualHost *:80>
    ServerName ${domaine}
$( [[ -n "$aliases" ]] && echo "    ServerAlias ${aliases}" )
    DocumentRoot ${docroot}

    <Directory ${docroot}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/${safe}-error.log
    CustomLog \${APACHE_LOG_DIR}/${safe}-access.log combined
</VirtualHost>
EOF

  a2ensite "$(basename "$conf")" 2>/dev/null || true
  echo "✓ HTTP  ${domaine} → ${docroot}"

  cert_dir=""
  if [[ -f "/etc/letsencrypt/live/${domaine}/fullchain.pem" ]]; then
    cert_dir="$domaine"
  elif [[ -n "$aliases" ]]; then
    for alias in $aliases; do
      if [[ -f "/etc/letsencrypt/live/${alias}/fullchain.pem" ]]; then
        cert_dir="$alias"
        break
      fi
    done
  fi

  if [[ -n "$cert_dir" ]]; then
    cat > "$ssl_conf" <<EOF
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName ${domaine}
$( [[ -n "$aliases" ]] && echo "    ServerAlias ${aliases}" )
    DocumentRoot ${docroot}

    <Directory ${docroot}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${cert_dir}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${cert_dir}/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog \${APACHE_LOG_DIR}/${safe}-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/${safe}-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF
    a2ensite "$(basename "$ssl_conf")" 2>/dev/null || true
    echo "  ✓ HTTPS ${domaine} (cert: ${cert_dir})"
  else
    a2dissite "$(basename "$ssl_conf")" 2>/dev/null || true
    echo "  ⚠ Pas de certificat — certbot --apache -d ${domaine}"
  fi

  # Désactiver l'ancien 000-default-le-ssl si doublon hamlabor (certbot y déploie parfois)
  if [[ "$domaine" == "hamlabor.org" ]]; then
    a2dissite 000-default-le-ssl.conf 2>/dev/null && echo "  ✗ 000-default-le-ssl désactivé (doublon hamlabor)" || true
  fi
done < "$LISTE"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  4. SIGH (${SIGH_DOMAIN}) → Next.js :3000"
echo "═══════════════════════════════════════════════════════════"

cp "${APP_DIR}/deploy/apache/sigh-ham.conf" "${SITES_AV}/sigh-ham.conf"
a2ensite sigh-ham.conf 2>/dev/null || true

if [[ -f "/etc/letsencrypt/live/${SIGH_DOMAIN}/fullchain.pem" ]]; then
  cat > "${SITES_AV}/sigh-ham-le-ssl.conf" <<EOF
<IfModule mod_ssl.c>
<VirtualHost *:443>
    ServerName ${SIGH_DOMAIN}

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/${SIGH_DOMAIN}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${SIGH_DOMAIN}/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ProxyPreserveHost On
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    ProxyPass        /socket.io/ ws://127.0.0.1:3001/socket.io/
    ProxyPassReverse /socket.io/ ws://127.0.0.1:3001/socket.io/

    Alias /uploads /var/www/sigh-ham/public/uploads
    <Directory /var/www/sigh-ham/public/uploads>
        Require all granted
        Options -Indexes
    </Directory>

    ProxyPass        /uploads !
    ProxyPass        / http://127.0.0.1:3000/ retry=0 timeout=300
    ProxyPassReverse / http://127.0.0.1:3000/

    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/socket.io/(.*) ws://127.0.0.1:3001/socket.io/\$1 [P,L]

    ErrorLog \${APACHE_LOG_DIR}/sigh-ham-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/sigh-ham-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF
  a2ensite sigh-ham-le-ssl.conf 2>/dev/null || true
  echo "✓ HTTPS ${SIGH_DOMAIN} → Next.js"
else
  echo "⚠ Certificat SIGH absent :"
  echo "  certbot --apache -d ${SIGH_DOMAIN} --email ${EMAIL} --agree-tos --non-interactive"
fi

apache2ctl configtest
systemctl reload apache2

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  5. Résultat"
echo "═══════════════════════════════════════════════════════════"
apache2ctl -S 2>&1 | head -40
echo ""
echo "Tests :"
echo "  curl -I https://hamlabor.org"
echo "  curl -I https://${SIGH_DOMAIN}/connexion"
echo "═══════════════════════════════════════════════════════════"
