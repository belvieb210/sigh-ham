#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Purge données opérationnelles (MANUEL UNIQUEMENT)
#
# Ne s'exécute jamais via deploy, cron ou migrations.
# Conserve : utilisateurs, roles, permissions, salles, medicaments, catalogue examens.
#
# Usage :
#   bash deploy/purge-donnees-operationnelles.sh              # demande confirmation
#   CONFIRMER=OUI bash deploy/purge-donnees-operationnelles.sh
#
# Sur le VPS (recommandé) :
#   cd /var/www/sigh-ham
#   CONFIRMER=OUI bash deploy/purge-donnees-operationnelles.sh
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
SQL_FILE="${APP_DIR}/deploy/purge-donnees-operationnelles.sql"

cd "${APP_DIR}"

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "❌ Fichier introuvable : ${SQL_FILE}"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║  PURGE DONNÉES OPÉRATIONNELLES — SIGH HAM                        ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║  SUPPRIME : patients, dossiers, factures, transferts, ventes…    ║"
echo "║            examens_laboratoire + resultats_examen (tous résultats)║"
echo "║  CONSERVE : agents, médicaments, catalogue examens, salles       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

if [[ "${CONFIRMER:-}" != "OUI" ]]; then
  echo "⚠️  Opération IRRÉVERSIBLE (sauf restauration depuis la sauvegarde)."
  echo ""
  read -r -p "Tapez OUI pour continuer : " rep
  if [[ "${rep}" != "OUI" ]]; then
    echo "Annulé."
    exit 0
  fi
fi

echo ""
echo "==> 1/3 Sauvegarde PostgreSQL"
bash "${APP_DIR}/deploy/export-postgres.sh"

echo ""
echo "==> 2/3 Purge SQL"
# shellcheck source=lib/database-url.sh
source "${APP_DIR}/deploy/lib/database-url.sh"
charger_database_url "${APP_DIR}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL absent dans .env"
  exit 1
fi

PG_URL=$(url_pour_pg_tools "${DATABASE_URL}")
export PGCLIENTENCODING=UTF8

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ psql introuvable"
  exit 1
fi

psql "${PG_URL}" -v ON_ERROR_STOP=1 -f "${SQL_FILE}"

echo ""
echo "==> 3/3 Vérification rapide"
psql "${PG_URL}" -At -c "
SELECT 'patients=' || COUNT(*) FROM patients
UNION ALL SELECT 'factures=' || COUNT(*) FROM factures
UNION ALL SELECT 'examens_laboratoire=' || COUNT(*) FROM examens_laboratoire
UNION ALL SELECT 'resultats_examen=' || COUNT(*) FROM resultats_examen
UNION ALL SELECT 'medicaments=' || COUNT(*) FROM medicaments
UNION ALL SELECT 'types_examen=' || COUNT(*) FROM types_examen
UNION ALL SELECT 'utilisateurs=' || COUNT(*) FROM utilisateurs;
"

echo ""
echo "✅ Purge terminée."
echo "   Les agents devront se reconnecter (sessions supprimées)."
echo "   Conservez le fichier .sql.gz créé dans prisma/backups/ en cas de besoin."
