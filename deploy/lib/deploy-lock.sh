#!/usr/bin/env bash
# Verrou unique pour cron + deploy-app + fix-node-modules.
# Un seul npm ci / build à la fois. Le cron saute s'il est déjà pris ;
# les scripts manuels attendent (pas de course).
#
# Usage :
#   source "${APP_DIR}/deploy/lib/deploy-lock.sh"
#   acquire_deploy_lock skip || exit 0   # cron
#   acquire_deploy_lock wait            # manuel
#
# Si le parent tient déjà le verrou : SIGH_DEPLOY_LOCK_HELD=1

SIGH_DEPLOY_LOCK_FILE="${SIGH_DEPLOY_LOCK_FILE:-/tmp/sigh-ham-auto-deploy.lock}"

acquire_deploy_lock() {
  local mode="${1:-wait}"

  if [[ "${SIGH_DEPLOY_LOCK_HELD:-}" == "1" ]]; then
    return 0
  fi

  exec 9>"${SIGH_DEPLOY_LOCK_FILE}"
  chmod 666 "${SIGH_DEPLOY_LOCK_FILE}" 2>/dev/null || true

  if [[ "${mode}" == "skip" ]]; then
    if ! flock -n 9; then
      return 1
    fi
  else
    echo "==> Attente du verrou déploiement (un seul npm/build à la fois)..."
    flock 9
  fi

  export SIGH_DEPLOY_LOCK_HELD=1
  return 0
}
