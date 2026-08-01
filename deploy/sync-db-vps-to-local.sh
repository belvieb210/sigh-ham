#!/usr/bin/env bash
# Export VPS + instructions sync PC (PostgreSQL SIGH uniquement)
# Usage (root ou sigh sur VPS) : bash deploy/sync-db-vps-to-local.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"

echo "══════════════════════════════════════════════════════════"
echo "  Export base SIGH (PostgreSQL) — VPS → PC local"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "Note : SIGH utilise PostgreSQL, pas MySQL."
echo "       Les migrations sont dans prisma/migrations/ (GitHub)."
echo "       Ce script exporte les DONNÉES en plus des migrations."
echo ""

cd "${APP_DIR}"
sudo -u sigh bash deploy/export-postgres.sh

LATEST=$(ls -t "${APP_DIR}/prisma/backups/"sigh_ham_*.sql.gz 2>/dev/null | head -1)
if [[ -z "$LATEST" ]]; then
  echo "❌ Export échoué"
  exit 1
fi

chmod 644 "$LATEST" 2>/dev/null || true

echo ""
echo "── Sur votre PC Windows (PowerShell) ──"
echo ""
echo "  mkdir prisma\\backups -Force"
echo "  scp root@185.202.236.210:${LATEST} prisma\\backups\\"
echo ""
echo "  cd c:\\xampp\\htdocs\\ham-projet"
echo "  git pull"
echo "  bash deploy/import-postgres.sh prisma/backups/$(basename "$LATEST")"
echo ""
echo "── Pousser sur GitHub (repo PRIVÉ uniquement) ──"
echo ""
echo "  ⚠️ Contient patients + mots de passe hashés"
echo "  git add prisma/backups/$(basename "$LATEST")"
echo "  git commit -m \"backup: dump production $(date +%Y-%m-%d)\""
echo "  git push"
echo ""
echo "  Préférez GitHub Releases pour les gros fichiers."
echo "══════════════════════════════════════════════════════════"
