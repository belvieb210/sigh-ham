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

services_running=false
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet sigh-web 2>/dev/null; then
  services_running=true
fi

echo "==> Git pull (branche main) — site reste en ligne"
if [[ "${EUID:-0}" -eq 0 ]]; then
  sudo -u sigh git -C "${APP_DIR}" pull origin main
else
  git pull origin main
fi

echo "==> Dépendances npm"
# Essayer sans couper le site ; en cas de verrouillage node_modules, arrêt bref.
if ! run_as_sigh 'npm ci || { echo "⚠️  package-lock désynchronisé — npm install"; npm install; }'; then
  echo "⚠️  node_modules verrouillé — arrêt temporaire des services"
  if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
    systemctl stop sigh-web sigh-socket 2>/dev/null || true
    services_running=false
  fi
  echo "⚠️  Réinstallation propre de node_modules"
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

echo "==> Build Next.js (dossier .next-new — l'ancien .next reste servi)"
rm -rf "${APP_DIR}/.next-new"
run_as_sigh "NEXT_DIST_DIR=.next-new npm run build"

if [[ ! -f "${APP_DIR}/.next-new/BUILD_ID" ]]; then
  echo "❌ Build échoué (.next-new/BUILD_ID absent) — site inchangé"
  exit 1
fi

echo "==> Permissions uploads"
run_as_sigh "mkdir -p public/uploads/messagerie && chmod -R 775 public/uploads"

echo "==> Bascule atomique .next-new → .next (coupure ~1–3 s)"
if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
  systemctl stop sigh-web sigh-socket 2>/dev/null || true
fi

rm -rf "${APP_DIR}/.next-old"
if [[ -d "${APP_DIR}/.next" ]]; then
  mv "${APP_DIR}/.next" "${APP_DIR}/.next-old"
fi
mv "${APP_DIR}/.next-new" "${APP_DIR}/.next"
if [[ "${EUID:-0}" -eq 0 ]]; then
  chown -R sigh:sigh "${APP_DIR}/.next"
fi

if command -v systemctl >/dev/null 2>&1; then
  if [[ "${EUID:-0}" -eq 0 ]]; then
    systemctl enable sigh-web sigh-socket 2>/dev/null || true
    systemctl start sigh-web sigh-socket
    systemctl status sigh-web --no-pager -l || true
  else
    sudo systemctl enable sigh-web sigh-socket 2>/dev/null || true
    sudo systemctl restart sigh-web sigh-socket
    sudo systemctl status sigh-web --no-pager -l || true
  fi
else
  echo "⚠️  systemd non disponible — lancez manuellement : npm run start & npx tsx server/socket-server.ts"
fi

# Nettoyage après démarrage réussi
rm -rf "${APP_DIR}/.next-old"

echo ""
echo "✅ Déploiement terminé — https://hamlab5.duckdns.org"
