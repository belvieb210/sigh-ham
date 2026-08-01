#!/usr/bin/env bash
# Import PostgreSQL SIGH (dump .sql ou .sql.gz)
# Usage : bash deploy/import-postgres.sh prisma/backups/sigh_ham_YYYYMMDD_HHMMSS.sql.gz
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
DUMP="${1:-}"

if [[ -z "$DUMP" ]]; then
  echo "Usage : bash deploy/import-postgres.sh prisma/backups/sigh_ham_XXXXXX.sql.gz"
  echo ""
  echo "Dumps disponibles :"
  ls -lh "${APP_DIR}/prisma/backups/"*.sql* 2>/dev/null || echo "(aucun)"
  exit 1
fi

if [[ ! -f "$DUMP" ]]; then
  echo "❌ Fichier introuvable : $DUMP"
  exit 1
fi

# shellcheck source=lib/database-url.sh
source "${APP_DIR}/deploy/lib/database-url.sh"
charger_database_url "${APP_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL absent dans .env"
  exit 1
fi

PG_URL=$(url_pour_pg_tools "${DATABASE_URL}")

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql introuvable — installez postgresql-client"
  exit 1
fi

echo "==> Migrations Prisma (structure à jour)"
cd "${APP_DIR}"
npx prisma migrate deploy

echo "==> Import des données : ${DUMP}"
export PGCLIENTENCODING=UTF8
# Retire les SET spécifiques PostgreSQL 17 incompatibles avec PG 15/16
filtrer_sql() {
  sed -E \
    -e '/^SET transaction_timeout/d' \
    -e '/^SET idle_session_timeout/d' \
    -e '/^SET idle_in_transaction_session_timeout/d' \
    -e '/^SET client_encoding/d'
}

{
  echo "SET client_encoding TO 'UTF8';"
  if [[ "$DUMP" == *.gz ]]; then
    gunzip -c "$DUMP" | filtrer_sql
  else
    filtrer_sql < "$DUMP"
  fi
} | psql "${PG_URL}" -v ON_ERROR_STOP=1

echo ""
echo "✅ Import terminé"
echo "   npx prisma generate"
echo "   npm run dev"
