#!/usr/bin/env bash
# Corrige le proxy Apache Socket.IO (polling HTTP + WebSocket).
# Cause typique :
#  - ProxyPass ws:// seul → 308 Next.js puis échec wss
#  - SOCKET_PORT=3001 déjà pris par ProfilDeborah sur ce VPS
set -euo pipefail

DOMAIN="${DOMAIN:-hamlab5.duckdns.org}"
SOCKET_PORT="${SOCKET_PORT:-3003}"

echo "==> Modules Apache"
a2enmod proxy proxy_http proxy_wstunnel rewrite headers >/dev/null

echo "==> SOCKET_PORT=${SOCKET_PORT} dans .env"
if [[ -f /var/www/sigh-ham/.env ]]; then
  if grep -q '^SOCKET_PORT=' /var/www/sigh-ham/.env; then
    sed -i "s/^SOCKET_PORT=.*/SOCKET_PORT=${SOCKET_PORT}/" /var/www/sigh-ham/.env
  else
    echo "SOCKET_PORT=${SOCKET_PORT}" >> /var/www/sigh-ham/.env
  fi
fi

echo "==> Service sigh-socket"
systemctl enable --now sigh-socket 2>/dev/null || true
systemctl restart sigh-socket
sleep 1
systemctl is-active sigh-socket

echo "==> Correction des vhosts ${DOMAIN}"
mapfile -t CONFS < <(grep -rl "ServerName ${DOMAIN}" /etc/apache2/sites-enabled /etc/apache2/sites-available 2>/dev/null | sort -u || true)

if [[ ${#CONFS[@]} -eq 0 ]]; then
  echo "Aucun vhost trouvé pour ${DOMAIN}"
  exit 1
fi

for conf in "${CONFS[@]}"; do
  [[ -f "$conf" ]] || continue
  echo "  • $conf"
  cp -a "$conf" "${conf}.bak.$(date +%Y%m%d%H%M%S)"

  sed -i -E "s|ProxyPass[[:space:]]+/socket\\.io/[[:space:]]+(ws|http)://127\\.0\\.0\\.1:[0-9]+/socket\\.io/|ProxyPass        /socket.io/ http://127.0.0.1:${SOCKET_PORT}/socket.io/|g" "$conf"
  sed -i -E "s|ProxyPassReverse[[:space:]]+/socket\\.io/[[:space:]]+(ws|http)://127\\.0\\.0\\.1:[0-9]+/socket\\.io/|ProxyPassReverse /socket.io/ http://127.0.0.1:${SOCKET_PORT}/socket.io/|g" "$conf"
  sed -i -E "s|ws://127\\.0\\.0\\.1:[0-9]+/socket\\.io/|ws://127.0.0.1:${SOCKET_PORT}/socket.io/|g" "$conf"

  if ! grep -qE "ProxyPass[[:space:]]+/socket\\.io/[[:space:]]+http://127\\.0\\.0\\.1:${SOCKET_PORT}/socket\\.io/" "$conf"; then
    if grep -qE 'ProxyPass[[:space:]]+/[[:space:]]+http://127\.0\.0\.1:3000/' "$conf"; then
      sed -i "/ProxyPass[[:space:]]\\+\\/[[:space:]]\\+http:\\/\\/127\\.0\\.0\\.1:3000\\//i\\    ProxyPass        /socket.io/ http://127.0.0.1:${SOCKET_PORT}/socket.io/\\n    ProxyPassReverse /socket.io/ http://127.0.0.1:${SOCKET_PORT}/socket.io/" "$conf"
    fi
  fi

  if ! grep -qE 'RewriteRule \^/socket' "$conf"; then
    awk -v port="$SOCKET_PORT" '
      /ProxyPass[[:space:]]+\/socket\.io\// && !done {
        print "    RewriteEngine On"
        print "    RewriteCond %{HTTP:Upgrade} =websocket [NC]"
        print "    RewriteCond %{HTTP:Connection} upgrade [NC]"
        print "    RewriteRule ^/socket\\.io/(.*) ws://127.0.0.1:" port "/socket.io/\$1 [P,L]"
        print ""
        done=1
      }
      { print }
    ' "$conf" > "${conf}.tmp" && mv "${conf}.tmp" "$conf"
  fi
done

echo "==> Test Apache"
apache2ctl configtest
systemctl reload apache2

echo "==> Test local Socket.IO"
if curl -fsS "http://127.0.0.1:${SOCKET_PORT}/socket.io/?EIO=4&transport=polling" | head -c 80; then
  echo
  echo "✓ sigh-socket répond sur :${SOCKET_PORT}"
else
  echo
  echo "✗ sigh-socket ne répond pas — journal :"
  journalctl -u sigh-socket -n 30 --no-pager || true
  exit 1
fi

echo "==> Test public HTTPS"
CODE=$(curl -sS -o /tmp/sio-out.txt -w "%{http_code}" "https://${DOMAIN}/socket.io/?EIO=4&transport=polling" || true)
BODY=$(head -c 120 /tmp/sio-out.txt 2>/dev/null || true)
echo "HTTP $CODE — ${BODY}"
if [[ "$CODE" == "200" ]] || [[ "$BODY" == 0* ]]; then
  echo "✅ Proxy Socket.IO OK"
else
  echo "⚠ Vérifier le vhost SSL (souvent sites-enabled/*-le-ssl.conf)"
fi
