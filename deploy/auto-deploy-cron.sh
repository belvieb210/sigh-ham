#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Auto-déploiement VPS (à lancer chaque minute via crontab)
#
# Ne fait RIEN s'il n'y a pas de changement (évite un build toutes les minutes).
# Se déclenche si :
#   - nouveaux commits sur GitHub (main), OU
#   - un dump .sql.gz déposé dans prisma/backups/inbox/
#
# Actions automatiques :
#   1. git pull
#   2. npm ci / install si besoin
#   3. prisma generate + migrate deploy
#   4. import dumps inbox (UTF-8) + correction encodage
#   5. build Next.js
#   6. restart sigh-web + sigh-socket
#
# Usage manuel :
#   bash /var/www/sigh-ham/deploy/auto-deploy-cron.sh
#   bash /var/www/sigh-ham/deploy/auto-deploy-cron.sh --force   # toujours déployer
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
LOG_DIR="${APP_DIR}/logs"
LOG_FILE="${LOG_DIR}/auto-deploy.log"
STATE_FILE="${LOG_DIR}/.last-deployed-commit"
INBOX_DIR="${APP_DIR}/prisma/backups/inbox"
IMPORTED_DIR="${APP_DIR}/prisma/backups/imported"
LOCK_FILE="/tmp/sigh-ham-auto-deploy.lock"
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
  esac
done

mkdir -p "${LOG_DIR}" "${INBOX_DIR}" "${IMPORTED_DIR}"

# Empêche deux exécutions simultanées
exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "$(date -Iseconds) — déjà en cours, skip" >> "${LOG_FILE}"
  exit 0
fi

exec >> "${LOG_FILE}" 2>&1

log() { echo "$(date -Iseconds) $*"; }

cd "${APP_DIR}"

# shellcheck source=lib/npm-deps.sh
source "${APP_DIR}/deploy/lib/npm-deps.sh"

if [[ ! -f .env || ! -f package.json ]]; then
  log "❌ Projet invalide dans ${APP_DIR}"
  exit 1
fi

if [[ "${EUID:-0}" -ne 0 ]]; then
  log "❌ Ce script doit tourner en root (crontab root)"
  exit 1
fi

chown -R sigh:sigh "${LOG_DIR}" "${INBOX_DIR}" "${IMPORTED_DIR}" 2>/dev/null || true

run_as_sigh() {
  sudo -u sigh -H bash -lc "cd '${APP_DIR}' && $*"
}

# ── Détecter changements Git ────────────────────────────────────────────────
log "==> fetch origin"
sudo -u sigh git -C "${APP_DIR}" fetch origin main --quiet 2>/dev/null \
  || sudo -u sigh git -C "${APP_DIR}" fetch origin master --quiet 2>/dev/null \
  || true

LOCAL_HEAD=$(sudo -u sigh git -C "${APP_DIR}" rev-parse HEAD 2>/dev/null || echo "")
REMOTE_HEAD=$(sudo -u sigh git -C "${APP_DIR}" rev-parse origin/main 2>/dev/null \
  || sudo -u sigh git -C "${APP_DIR}" rev-parse origin/master 2>/dev/null \
  || echo "")
LAST_DEPLOYED=$(cat "${STATE_FILE}" 2>/dev/null || echo "")

GIT_CHANGED=false
if [[ -n "$REMOTE_HEAD" && "$LOCAL_HEAD" != "$REMOTE_HEAD" ]]; then
  GIT_CHANGED=true
  log "   Git : nouveau commit ${REMOTE_HEAD:0:8} (local ${LOCAL_HEAD:0:8})"
elif [[ -n "$REMOTE_HEAD" && "$LAST_DEPLOYED" != "$REMOTE_HEAD" && "$FORCE" == "true" ]]; then
  GIT_CHANGED=true
fi

# ── Détecter dumps à importer ───────────────────────────────────────────────
shopt -s nullglob
DUMPS=( "${INBOX_DIR}"/*.sql.gz "${INBOX_DIR}"/*.sql )
shopt -u nullglob
HAS_DUMP=false
if [[ ${#DUMPS[@]} -gt 0 ]]; then
  HAS_DUMP=true
  log "   Inbox : ${#DUMPS[@]} dump(s) à importer"
fi

if [[ "$FORCE" != "true" && "$GIT_CHANGED" != "true" && "$HAS_DUMP" != "true" ]]; then
  # Silence : pas de log à chaque minute pour ne pas grossir le fichier
  exit 0
fi

log "═══════════════════════════════════════════════════════════"
log "  AUTO-DEPLOY démarré (force=${FORCE} git=${GIT_CHANGED} dump=${HAS_DUMP})"
log "═══════════════════════════════════════════════════════════"

# ── 1. Git pull ─────────────────────────────────────────────────────────────
if [[ "$GIT_CHANGED" == "true" || "$FORCE" == "true" ]]; then
  log "==> git pull"
  sudo -u sigh git -C "${APP_DIR}" stash push -u -m "auto-deploy $(date +%s)" 2>/dev/null || true
  sudo -u sigh git -C "${APP_DIR}" pull --ff-only origin main \
    || sudo -u sigh git -C "${APP_DIR}" pull --ff-only origin master \
    || sudo -u sigh git -C "${APP_DIR}" reset --hard origin/main \
    || true
  chmod +x "${APP_DIR}/deploy/"*.sh 2>/dev/null || true
fi

# ── 2. Dépendances + migrations ─────────────────────────────────────────────
log "==> npm + migrations"
chown -R sigh:sigh "${APP_DIR}" 2>/dev/null || true
npm_install_robust "${APP_DIR}" run_as_sigh
run_as_sigh "npm run db:generate"
run_as_sigh "npm run db:migrate:deploy"

# ── 3. Import dumps inbox ───────────────────────────────────────────────────
if [[ "$HAS_DUMP" == "true" ]]; then
  for dump in "${DUMPS[@]}"; do
    [[ -f "$dump" ]] || continue
    log "==> Import ${dump}"
    chown sigh:sigh "$dump"
    if sudo -u sigh bash "${APP_DIR}/deploy/import-postgres.sh" "$dump"; then
      mv -f "$dump" "${IMPORTED_DIR}/$(basename "$dump").$(date +%Y%m%d_%H%M%S)"
      log "   ✓ importé → imported/"
    else
      log "   ✗ échec import $(basename "$dump")"
    fi
  done
  if [[ -x "${APP_DIR}/deploy/fix-encodage-utf8.sh" ]]; then
    log "==> Correction encodage UTF-8"
    bash "${APP_DIR}/deploy/fix-encodage-utf8.sh" || true
  fi
fi

# ── 4. Build + restart ──────────────────────────────────────────────────────
log "==> build Next.js"
systemctl stop sigh-web 2>/dev/null || true
rm -rf "${APP_DIR}/.next"
chown -R sigh:sigh "${APP_DIR}"
run_as_sigh "npm run build"

log "==> restart services"
systemctl restart sigh-web sigh-socket
sleep 2
systemctl is-active sigh-web >/dev/null && log "   ✓ sigh-web" || log "   ✗ sigh-web"
systemctl is-active sigh-socket >/dev/null && log "   ✓ sigh-socket" || log "   ✗ sigh-socket"

NEW_HEAD=$(sudo -u sigh git -C "${APP_DIR}" rev-parse HEAD 2>/dev/null || echo "")
echo "${NEW_HEAD}" > "${STATE_FILE}"

log "✅ AUTO-DEPLOY terminé — commit ${NEW_HEAD:0:8}"
log ""
