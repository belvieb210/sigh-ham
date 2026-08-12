#!/usr/bin/env bash
# Nettoyage node_modules + installation npm robuste (VPS Linux)
# Source :  source "${APP_DIR}/deploy/lib/npm-deps.sh"

clean_node_modules() {
  local app_dir="${1:-${APP_DIR:-/var/www/sigh-ham}}"

  if command -v systemctl >/dev/null 2>&1 && [[ "${EUID:-0}" -eq 0 ]]; then
    systemctl stop sigh-web sigh-socket 2>/dev/null || true
  fi

  if [[ ! -d "${app_dir}/node_modules" ]]; then
    return 0
  fi

  echo "==> Nettoyage node_modules (mv + rm en arrière-plan)"

  local trash="${app_dir}/node_modules.trash.$(date +%s)"
  chmod -R u+w "${app_dir}/node_modules" 2>/dev/null || true

  if mv "${app_dir}/node_modules" "${trash}" 2>/dev/null; then
    nohup rm -rf "${trash}" >/dev/null 2>&1 &
  else
    echo "⚠️  mv impossible — suppression directe"
    rm -rf "${app_dir}/node_modules" 2>/dev/null || true
  fi

  # Supprimer les vieux dossiers .trash laissés par des déploiements précédents
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

  if ! $run_fn 'npm ci'; then
    echo "⚠️  npm ci échoué — réinstallation propre de node_modules"
    clean_node_modules "${app_dir}"
    $run_fn 'npm ci' || $run_fn 'npm install'
  fi
}
