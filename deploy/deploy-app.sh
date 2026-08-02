#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Déploiement / mise à jour application
# Sur le VPS (utilisateur sigh ou root) :
#   bash /var/www/sigh-ham/deploy/deploy-app.sh
#   bash /var/www/sigh-ham/deploy/deploy-app.sh --seed   # 1ère install + données démo
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
SEED=false

for arg in "$@"; do
  case "$arg" in
    --seed) SEED=true ;;
  esac
done

cd "${APP_DIR}"

if [[ ! -f package.json ]]; then
  echo "❌ ${APP_DIR} ne contient pas le projet. Clonez d'abord le dépôt GitHub."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "❌ Fichier .env manquant. Lancez d'abord deploy/install-vps.sh"
  exit 1
fi

# Exécuter le travail applicatif sous l'utilisateur sigh
run_as_sigh() {
  if [[ "$(id -un)" == "sigh" ]]; then
    bash -lc "cd '${APP_DIR}' && $*"
  elif [[ "${EUID:-0}" -eq 0 ]]; then
    chown -R sigh:sigh "${APP_DIR}" 2>/dev/null || true
    sudo -u sigh -H bash -lc "cd '${APP_DIR}' && $*"
  else
    bash -lc "cd '${APP_DIR}' && $*"
  fi
}

echo "==> Arrêt des services (évite ENOTEMPTY sur node_modules)"
if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
  systemctl stop sigh-web sigh-socket 2>/dev/null || true
fi

echo "==> Git pull (branche main)"
if [[ "${EUID:-0}" -eq 0 ]]; then
  sudo -u sigh git -C "${APP_DIR}" pull origin main
else
  git pull origin main
fi

echo "==> Dépendances npm"
if ! run_as_sigh 'npm ci || { echo "⚠️  package-lock désynchronisé — npm install"; npm install; }'; then
  echo "⚠️  node_modules corrompu — réinstallation propre"
  rm -rf "${APP_DIR}/node_modules"
  if [[ "${EUID:-0}" -eq 0 ]]; then
    chown -R sigh:sigh "${APP_DIR}"
  fi
  run_as_sigh 'npm ci || npm install'
fi

echo "==> Prisma generate + migrations"
run_as_sigh "npm run db:generate && npm run db:migrate:deploy"

if [[ "${SEED}" == "true" ]]; then
  echo "==> Seed initial (salles, rôles, utilisateur réception)"
  run_as_sigh "npm run db:seed"
  run_as_sigh "npm run db:seed:reception || true"
  run_as_sigh "npm run db:seed:messagerie || true"
fi

echo "==> Build Next.js"
if [[ "${EUID:-0}" -eq 0 ]]; then
  rm -rf "${APP_DIR}/.next"
fi
run_as_sigh "npm run build"

echo "==> Permissions uploads"
run_as_sigh "mkdir -p public/uploads/messagerie && chmod -R 775 public/uploads"

echo "==> Redémarrage services"
if command -v systemctl >/dev/null 2>&1; then
  if [[ "${EUID:-0}" -eq 0 ]]; then
    systemctl enable sigh-web sigh-socket 2>/dev/null || true
    systemctl restart sigh-web sigh-socket
    systemctl status sigh-web --no-pager -l || true
  else
    sudo systemctl enable sigh-web sigh-socket 2>/dev/null || true
    sudo systemctl restart sigh-web sigh-socket
    sudo systemctl status sigh-web --no-pager -l || true
  fi
else
  echo "⚠️  systemd non disponible — lancez manuellement : npm run start & npx tsx server/socket-server.ts"
fi

echo ""
echo "✅ Déploiement terminé — https://hamlab5.duckdns.org"
