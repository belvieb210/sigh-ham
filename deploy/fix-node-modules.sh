#!/usr/bin/env bash
# Réparation node_modules corrompu sur le VPS (ENOTEMPTY, npm ci en échec)
# Usage root : bash /var/www/sigh-ham/deploy/fix-node-modules.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
cd "${APP_DIR}"

# shellcheck source=lib/npm-deps.sh
source "${APP_DIR}/deploy/lib/npm-deps.sh"
# shellcheck source=lib/deploy-lock.sh
source "${APP_DIR}/deploy/lib/deploy-lock.sh"

acquire_deploy_lock wait

echo "==> Arrêt services"
systemctl stop sigh-web sigh-socket 2>/dev/null || true

clean_node_modules "${APP_DIR}" sync

shopt -s nullglob
for old in "${APP_DIR}"/node_modules.trash.*; do
  [[ -d "$old" ]] && rm -rf "$old"
done
shopt -u nullglob

chown -R sigh:sigh "${APP_DIR}" 2>/dev/null || true

echo "==> Relance déploiement complet (npm ci + build)"
SIGH_DEPLOY_LOCK_HELD=1 bash "${APP_DIR}/deploy/deploy-app.sh"

echo "✅ Terminé"
