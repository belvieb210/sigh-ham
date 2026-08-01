#!/usr/bin/env bash
# Désactive tous les « Listen 443 » Apache (y compris indentés dans IfModule ssl)
liberer_port_443_apache() {
  local PORTS="/etc/apache2/ports.conf"
  if grep -qE '[[:space:]]*Listen 443' "${PORTS}" 2>/dev/null; then
    sed -i 's/^\([[:space:]]*\)Listen 443/\1#Listen 443  # Nginx gère HTTPS/' "${PORTS}"
    apache2ctl configtest
    systemctl restart apache2
  fi
  if ss -tlnp 2>/dev/null | grep ':443' | grep -q apache; then
    echo "❌ Apache occupe encore le port 443 :"
    ss -tlnp | grep ':443'
    echo "Vérifiez : grep -n Listen /etc/apache2/ports.conf"
    return 1
  fi
  echo "   Port 443 libre pour Nginx"
  return 0
}
