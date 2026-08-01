#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Maintenance automatique (crontab)
# - Backup PostgreSQL quotidien
# - Migrations (si nouvelles migrations sur GitHub)
# - Rotation des vieux dumps (30 jours)
#
# Usage manuel :
#   bash /var/www/sigh-ham/deploy/cron-maintenance.sh
#   bash /var/www/sigh-ham/deploy/cron-maintenance.sh --deploy   # + build/restart
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
LOG_DIR="${APP_DIR}/logs"
LOG_FILE="${LOG_DIR}/cron-maintenance.log"
BACKUP_DIR="${APP_DIR}/prisma/backups"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DEPLOY=false

for arg in "$@"; do
  case "$arg" in
    --deploy) DEPLOY=true ;;
  esac
done

mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  cron-maintenance.sh — $(date -Iseconds)"
echo "═══════════════════════════════════════════════════════════"

cd "${APP_DIR}"

if [[ "${EUID:-0}" -eq 0 ]]; then
  chown -R sigh:sigh "${BACKUP_DIR}" "${LOG_DIR}" 2>/dev/null || true
fi

# 1) Backup
echo "==> Backup PostgreSQL"
bash "${APP_DIR}/deploy/export-postgres.sh" || {
  echo "⚠ Export échoué — suite du script"
}

# 2) Git pull + migrations
echo "==> Migrations"
bash "${APP_DIR}/deploy/migrate-db.sh" --pull || {
  echo "❌ Migrations échouées"
  exit 1
}

# 3) Déploiement complet (optionnel)
if [[ "${DEPLOY}" == "true" ]]; then
  echo "==> Déploiement complet (build + restart)"
  if [[ "${EUID:-0}" -eq 0 ]]; then
    chown -R sigh:sigh "${APP_DIR}/.next" 2>/dev/null || true
    rm -rf "${APP_DIR}/.next"
    sudo -u sigh bash "${APP_DIR}/deploy/deploy-app.sh"
  else
    bash "${APP_DIR}/deploy/deploy-app.sh"
  fi
fi

# 4) Rotation backups
echo "==> Rotation dumps > ${RETENTION_DAYS} jours"
find "${BACKUP_DIR}" -name 'sigh_ham_*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
ls -lh "${BACKUP_DIR}"/sigh_ham_*.sql.gz 2>/dev/null | tail -5 || true

# 5) Santé services
if command -v systemctl >/dev/null 2>&1; then
  echo "==> État services"
  systemctl is-active sigh-web >/dev/null && echo "  ✓ sigh-web" || echo "  ✗ sigh-web"
  systemctl is-active sigh-socket >/dev/null && echo "  ✓ sigh-socket" || echo "  ✗ sigh-socket"
fi

echo ""
echo "✅ Maintenance terminée — $(date -Iseconds)"
echo "   Log : ${LOG_FILE}"
