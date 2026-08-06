#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Déploiement complet sur le VPS (à lancer APRÈS chaque modification)
#
# Usage (en root, sur le VPS) :
#   cd /var/www/sigh-ham
#   bash DEPLOIEMENT.sh
#
# Ou :
#   bash /var/www/sigh-ham/deploy/deployer.sh
#
# Fait :
#   1. git fetch + pull origin/main
#   2. npm / prisma migrate
#   3. build Next.js
#   4. restart sigh-web + sigh-socket
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Si lancé depuis la racine (DEPLOIEMENT.sh) ou depuis deploy/
if [[ -f "${SCRIPT_DIR}/deploy/auto-deploy-cron.sh" ]]; then
  APP_DIR="${SCRIPT_DIR}"
elif [[ -f "${SCRIPT_DIR}/auto-deploy-cron.sh" ]]; then
  APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

cd "${APP_DIR}"

if [[ ! -f package.json ]]; then
  echo "❌ Projet introuvable dans ${APP_DIR}"
  exit 1
fi

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "❌ Lancez en root : sudo bash DEPLOIEMENT.sh"
  exit 1
fi

echo ""
echo "============================================"
echo " SIGH HAM — Déploiement VPS"
echo " Dossier : ${APP_DIR}"
echo "============================================"
echo ""

chmod +x deploy/*.sh 2>/dev/null || true

echo "==> 1/3  Git pull (main)"
sudo -u sigh git -C "${APP_DIR}" fetch origin main
sudo -u sigh git -C "${APP_DIR}" pull origin main

echo ""
echo "==> 2/3  Build + migrations + restart (force)"
bash "${APP_DIR}/deploy/auto-deploy-cron.sh" --force

echo ""
echo "==> 3/3  Vérification services"
systemctl is-active sigh-web && echo "    ✓ sigh-web actif" || echo "    ✗ sigh-web KO"
systemctl is-active sigh-socket && echo "    ✓ sigh-socket actif" || echo "    ✗ sigh-socket KO"

echo ""
echo "Commit déployé :"
sudo -u sigh git -C "${APP_DIR}" log -1 --oneline

echo ""
echo "✅ Terminé — https://hamlab5.duckdns.org"
echo "   Logs : tail -f ${APP_DIR}/logs/auto-deploy.log"
echo ""
