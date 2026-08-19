#!/usr/bin/env bash
# Nettoyage node_modules + installation npm robuste (VPS Linux)
# Source :  source "${APP_DIR}/deploy/lib/npm-deps.sh"

node_modules_sains() {
  local app_dir="${1:-${APP_DIR:-/var/www/sigh-ham}}"
  [[ -x "${app_dir}/node_modules/.bin/next" ]] \
    && [[ -d "${app_dir}/node_modules/next/dist" ]] \
    && [[ -f "${app_dir}/node_modules/prisma/package.json" ]]
}

npm_lock_hash() {
  local app_dir="${1:-${APP_DIR:-/var/www/sigh-ham}}"
  if [[ -f "${app_dir}/package-lock.json" ]]; then
    sha256sum "${app_dir}/package-lock.json" | awk '{print $1}'
  else
    echo "none"
  fi
}

clean_node_modules() {
  local app_dir="${1:-${APP_DIR:-/var/www/sigh-ham}}"

  if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
    systemctl stop sigh-web sigh-socket 2>/dev/null || true
  fi

  rm -f "${app_dir}/.npm-ci-stamp"

  if [[ ! -d "${app_dir}/node_modules" ]]; then
    return 0
  fi

  echo "==> Nettoyage node_modules (mv + rm)"

  local trash="${app_dir}/node_modules.trash.$(date +%s)"
  chmod -R u+w "${app_dir}/node_modules" 2>/dev/null || true

  if mv "${app_dir}/node_modules" "${trash}" 2>/dev/null; then
    if [[ "${2:-}" == "sync" ]]; then
      rm -rf "${trash}"
    else
      nohup rm -rf "${trash}" >/dev/null 2>&1 &
    fi
  else
    echo "⚠️  mv impossible — suppression directe"
    rm -rf "${app_dir}/node_modules" 2>/dev/null || true
  fi

  shopt -s nullglob
  for old in "${app_dir}"/node_modules.trash.*; do
    [[ -d "$old" ]] && nohup rm -rf "$old" >/dev/null 2>&1 &
  done
  shopt -u nullglob

  if [[ -d "${app_dir}/node_modules" ]]; then
    find "${app_dir}/node_modules" -mindepth 1 -delete 2>/dev/null || true
    rmdir "${app_dir}/node_modules" 2>/dev/null || rm -rf "${app_dir}/node_modules" 2>/dev/null || true
  fi

  if [[ "${EUID:-0}" -eq 0 ]]; then
    chown -R sigh:sigh "${app_dir}" 2>/dev/null || true
  fi
}

npm_install_robust() {
  local app_dir="${1:-${APP_DIR:-/var/www/sigh-ham}}"
  local run_fn="${2:-run_as_sigh}"
  local stamp="${app_dir}/.npm-ci-stamp"
  local current
  current="$(npm_lock_hash "${app_dir}")"

  if [[ -f "${stamp}" && "$(cat "${stamp}" 2>/dev/null)" == "${current}" ]] \
    && node_modules_sains "${app_dir}"; then
    echo "==> npm ci ignoré — package-lock.json inchangé et node_modules OK"
    return 0
  fi

  echo "==> npm ci (dépendances à installer ou node_modules incomplet)"

  # Next charge node_modules : l'extract npm pendant que le site tourne
  # produit TAR_ENTRY_ERROR ENOENT / ENOTEMPTY.
  if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
    echo "   arrêt sigh-web / sigh-socket pendant npm ci"
    systemctl stop sigh-web sigh-socket 2>/dev/null || true
  fi

  if ! $run_fn 'npm ci'; then
    echo "⚠️  npm ci échoué — réinstallation propre de node_modules"
    clean_node_modules "${app_dir}" sync
    $run_fn 'npm ci' || $run_fn 'npm install'
  fi

  if ! node_modules_sains "${app_dir}"; then
    echo "❌ node_modules incomplet après npm ci"
    return 1
  fi

  echo "${current}" > "${stamp}"
  if [[ "${EUID:-0}" -eq 0 ]]; then
    chown sigh:sigh "${stamp}" 2>/dev/null || true
  fi
}
