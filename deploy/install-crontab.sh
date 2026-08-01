#!/usr/bin/env bash
# =============================================================================
# Installe le crontab SIGH sur le VPS (root)
# Usage : bash /var/www/sigh-ham/deploy/install-crontab.sh
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
EXAMPLE="${APP_DIR}/deploy/crontab.example"
MARKER_BEGIN="# BEGIN SIGH-HAM"
MARKER_END="# END SIGH-HAM"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Exécutez en root : sudo bash deploy/install-crontab.sh"
  exit 1
fi

chmod +x "${APP_DIR}/deploy/"*.sh
mkdir -p "${APP_DIR}/logs" \
  "${APP_DIR}/prisma/backups/inbox" \
  "${APP_DIR}/prisma/backups/imported"
chown -R sigh:sigh "${APP_DIR}/logs" "${APP_DIR}/prisma/backups"

# Extraire les lignes utiles (hors commentaires d'en-tête trop longs)
CRON_BODY=$(awk '
  /^SHELL=/ { print; next }
  /^PATH=/ { print; next }
  /^MAILTO=/ { print; next }
  /^[0-9*]/ { print; next }
' "${EXAMPLE}")

TMP=$(mktemp)
crontab -l 2>/dev/null | sed "/${MARKER_BEGIN}/,/${MARKER_END}/d" > "${TMP}" || true

{
  echo "${MARKER_BEGIN}"
  echo "# Généré le $(date -Iseconds) — ne pas éditer à la main entre les marqueurs"
  echo "${CRON_BODY}"
  echo "${MARKER_END}"
} >> "${TMP}"

crontab "${TMP}"
rm -f "${TMP}"

echo "✅ Crontab SIGH installé"
echo ""
crontab -l | sed -n '/BEGIN SIGH-HAM/,/END SIGH-HAM/p'
echo ""
echo "Auto-deploy chaque minute :"
echo "  ${APP_DIR}/deploy/auto-deploy-cron.sh"
echo ""
echo "Dépôts dumps (import auto) :"
echo "  ${APP_DIR}/prisma/backups/inbox/"
echo ""
echo "Logs :"
echo "  ${APP_DIR}/logs/auto-deploy.log"
echo "  ${APP_DIR}/logs/cron-backup.log"
echo ""
echo "Test immédiat (force) :"
echo "  bash ${APP_DIR}/deploy/auto-deploy-cron.sh --force"
echo ""
echo "Guide : ${APP_DIR}/deploy/COMMANDES-VPS.md"
