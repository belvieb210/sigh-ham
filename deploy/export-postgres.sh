#!/usr/bin/env bash
# Export PostgreSQL SIGH (structure + toutes les données)
# Usage :
#   VPS  : bash deploy/export-postgres.sh
#   Local: bash deploy/export-postgres.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-${APP_DIR}/prisma/backups}"
STAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT="${BACKUP_DIR}/sigh_ham_${STAMP}.sql"

mkdir -p "${BACKUP_DIR}"

# shellcheck source=lib/database-url.sh
source "${APP_DIR}/deploy/lib/database-url.sh"
charger_database_url "${APP_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL absent — définissez-le dans .env"
  exit 1
fi

PG_URL=$(url_pour_pg_tools "${DATABASE_URL}")

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "❌ pg_dump introuvable — installez postgresql-client"
  exit 1
fi

echo "==> Export PostgreSQL → ${OUTPUT}"
pg_dump "${PG_URL}" \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --format=plain \
  --file="${OUTPUT}"

gzip -f "${OUTPUT}"
FINAL="${OUTPUT}.gz"
SIZE=$(du -h "${FINAL}" | cut -f1)

echo ""
echo "✅ Export terminé : ${FINAL} (${SIZE})"
echo ""
echo "Migrations (déjà sur GitHub) : prisma/migrations/"
echo ""
echo "Copier vers votre PC (depuis Windows PowerShell) :"
echo "  scp root@185.202.236.210:${FINAL} .\\prisma\\backups\\"
echo ""
echo "⚠️  Données sensibles — ne poussez pas sur GitHub public sans repo privé."
