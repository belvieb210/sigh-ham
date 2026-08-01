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

echo "==> Git pull"
git pull origin main || git pull origin master || true

echo "==> Dépendances npm"
if ! npm ci 2>/dev/null; then
  echo "⚠️  package-lock.json désynchronisé — npm install"
  npm install
fi

echo "==> Prisma generate"
npm run db:generate

echo "==> Migrations base de données"
npm run db:migrate:deploy

if [[ "${SEED}" == "true" ]]; then
  echo "==> Seed initial (salles, rôles, utilisateur réception)"
  npm run db:seed
  npm run db:seed:reception || true
  npm run db:seed:messagerie || true
fi

echo "==> Build Next.js"
npm run build

echo "==> Permissions uploads"
mkdir -p public/uploads/messagerie
chmod -R 775 public/uploads 2>/dev/null || true

echo "==> Redémarrage services"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable sigh-web sigh-socket 2>/dev/null || true
  sudo systemctl restart sigh-web sigh-socket
  sudo systemctl status sigh-web --no-pager -l || true
else
  echo "⚠️  systemd non disponible — lancez manuellement : npm run start & npx tsx server/socket-server.ts"
fi

echo ""
echo "✅ Déploiement terminé — https://hamlab5.duckdns.org"
