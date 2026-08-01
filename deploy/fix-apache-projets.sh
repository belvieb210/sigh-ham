#!/usr/bin/env bash
# Diagnostique et répare les VirtualHost Apache (404 après migration Nginx)
# Usage (root) : bash /var/www/sigh-ham/deploy/fix-apache-projets.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
LISTE="${APP_DIR}/deploy/projets-apache.list"
SITES_AV="/etc/apache2/sites-available"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root"
  exit 1
fi

echo "═══════════════════════════════════════════════════════════"
echo "  Diagnostic Apache"
echo "═══════════════════════════════════════════════════════════"
echo ""
apache2ctl -S 2>&1 || true
echo ""
echo "── Sites activés ──"
ls -la /etc/apache2/sites-enabled/ 2>/dev/null || true
echo ""
echo "── Contenu /var/www ──"
ls -la /var/www/ 2>/dev/null || true

detecter_racine() {
  local base="$1"
  if [[ -f "${base}/public/index.php" ]] || [[ -f "${base}/public/index.html" ]]; then
    echo "${base}/public"
  elif [[ -f "${base}/index.php" ]] || [[ -f "${base}/index.html" ]]; then
    echo "${base}"
  else
    echo "${base}/public"
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Réparation VirtualHost"
echo "═══════════════════════════════════════════════════════════"

a2enmod rewrite ssl headers 2>/dev/null || true

while IFS='|' read -r domaine base aliases; do
  [[ -z "$domaine" || "$domaine" =~ ^# ]] && continue

  docroot=$(detecter_racine "$base")

  if [[ ! -d "$docroot" ]]; then
    echo "⚠ ${domaine} — dossier introuvable : ${docroot} (base: ${base})"
    continue
  fi

  if [[ ! -f "${docroot}/index.php" && ! -f "${docroot}/index.html" ]]; then
    echo "⚠ ${domaine} — pas d'index dans ${docroot}"
    ls -la "$docroot" | head -5
  fi

  conf="${SITES_AV}/${domaine}.conf"
  safe_name=$(echo "$domaine" | tr '.' '-')

  cat > "$conf" <<EOF
# Généré par fix-apache-projets.sh — $(date -Iseconds)
<VirtualHost *:80>
    ServerName ${domaine}
$( [[ -n "$aliases" ]] && echo "    ServerAlias ${aliases}" )
    DocumentRoot ${docroot}

    <Directory ${docroot}>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/${safe_name}-error.log
    CustomLog \${APACHE_LOG_DIR}/${safe_name}-access.log combined
</VirtualHost>
EOF

  a2ensite "$(basename "$conf")" 2>/dev/null || true
  echo "✓ ${domaine} → ${docroot}"

  # Certificat SSL existant ?
  if [[ -f "/etc/letsencrypt/live/${domaine}/fullchain.pem" ]]; then
    ssl_conf="${SITES_AV}/${domaine}-le-ssl.conf"
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
    SSLCertificateFile /etc/letsencrypt/live/${domaine}/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/${domaine}/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf

    ErrorLog \${APACHE_LOG_DIR}/${safe_name}-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/${safe_name}-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF
    a2ensite "$(basename "$ssl_conf")" 2>/dev/null || true
    echo "  ✓ HTTPS (${domaine})"
  else
    echo "  ⚠ Pas de certificat SSL — lancez : certbot --apache -d ${domaine}"
  fi
done < "$LISTE"

# SIGH (proxy Next.js) — ne pas écraser si déjà OK
if [[ -f "${APP_DIR}/deploy/apache/sigh-ham.conf" ]]; then
  cp "${APP_DIR}/deploy/apache/sigh-ham.conf" "${SITES_AV}/sigh-ham.conf"
  a2ensite sigh-ham.conf 2>/dev/null || true
fi

# Désactiver le site default s'il prend le dessus
a2dissite 000-default.conf 2>/dev/null || true
a2dissite default-ssl.conf 2>/dev/null || true

apache2ctl configtest
systemctl reload apache2

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ VirtualHost recréés"
echo ""
echo "Tests :"
echo "  curl -I http://hamlabor.org"
echo "  curl -I https://hamlabor.org"
echo ""
echo "Si 404 persiste, vérifiez le DocumentRoot :"
echo "  ls -la /var/www/ham_project/public/"
echo "  grep -r DocumentRoot /etc/apache2/sites-enabled/"
echo "═══════════════════════════════════════════════════════════"
