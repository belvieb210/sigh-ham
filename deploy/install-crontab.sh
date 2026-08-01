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
mkdir -p "${APP_DIR}/logs" "${APP_DIR}/prisma/backups"
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

echo "✅ Crontab installé"
echo ""
crontab -l
echo ""
echo "Logs :"
echo "  ${APP_DIR}/logs/cron-maintenance.log"
echo "  ${APP_DIR}/logs/migrate-db.log"
echo "  ${APP_DIR}/logs/cron-deploy.log"
echo ""
echo "Test immédiat :"
echo "  bash ${APP_DIR}/deploy/migrate-db.sh --pull"
echo "  bash ${APP_DIR}/deploy/cron-maintenance.sh"
