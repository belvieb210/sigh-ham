#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Appliquer les migrations PostgreSQL sur le VPS
# Usage (root) :
#   bash /var/www/sigh-ham/deploy/migrate-db.sh
#   bash /var/www/sigh-ham/deploy/migrate-db.sh --pull   # git pull avant
#   bash /var/www/sigh-ham/deploy/migrate-db.sh --seed   # + seeds (1ère fois)
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
PULL=false
SEED=false
LOG_DIR="${APP_DIR}/logs"
LOG_FILE="${LOG_DIR}/migrate-db.log"

for arg in "$@"; do
  case "$arg" in
    --pull) PULL=true ;;
    --seed) SEED=true ;;
  esac
done

mkdir -p "${LOG_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  migrate-db.sh — $(date -Iseconds)"
echo "═══════════════════════════════════════════════════════════"

cd "${APP_DIR}"

if [[ ! -f .env ]]; then
  echo "❌ .env manquant dans ${APP_DIR}"
  exit 1
fi

# Toujours exécuter en utilisateur sigh (évite fichiers root dans .next)
run_as_sigh() {
  if [[ "$(id -un)" == "sigh" ]]; then
    "$@"
  elif [[ "${EUID:-0}" -eq 0 ]]; then
    sudo -u sigh -H bash -lc "cd '${APP_DIR}' && $*"
  else
    echo "❌ Exécutez en root ou en utilisateur sigh"
    exit 1
  fi
}

if [[ "${EUID:-0}" -eq 0 ]]; then
  chown -R sigh:sigh "${APP_DIR}/prisma" "${LOG_DIR}" 2>/dev/null || true
fi

if [[ "${PULL}" == "true" ]]; then
  echo "==> Git pull"
  if [[ "${EUID:-0}" -eq 0 ]]; then
    sudo -u sigh git -C "${APP_DIR}" pull --ff-only origin main \
      || sudo -u sigh git -C "${APP_DIR}" pull --ff-only origin master \
      || true
  else
    git pull --ff-only origin main || git pull --ff-only origin master || true
  fi
fi

echo "==> Prisma generate"
run_as_sigh "npm run db:generate"

echo "==> Migrations (prisma migrate deploy)"
run_as_sigh "npm run db:migrate:deploy"

if [[ "${SEED}" == "true" ]]; then
  echo "==> Seeds"
  run_as_sigh "npm run db:seed" || true
  run_as_sigh "npm run db:seed:reception" || true
  run_as_sigh "npm run db:seed:messagerie" || true
fi

echo ""
echo "✅ Migrations appliquées — $(date -Iseconds)"
echo "   Log : ${LOG_FILE}"
