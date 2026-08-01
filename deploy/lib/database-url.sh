#!/usr/bin/env bash
# Retire les paramètres Prisma (?schema=public) — pg_dump/psql ne les acceptent pas
url_pour_pg_tools() {
  echo "${1%%\?*}"
}

charger_database_url() {
  local app_dir="${1:-.}"
  if [[ -f "${app_dir}/.env" ]]; then
    local ligne
    ligne=$(grep -E '^DATABASE_URL=' "${app_dir}/.env" | head -1 | sed 's/\r$//')
    if [[ -n "$ligne" ]]; then
      DATABASE_URL="${ligne#DATABASE_URL=}"
      DATABASE_URL="${DATABASE_URL#\"}"
      DATABASE_URL="${DATABASE_URL%\"}"
      DATABASE_URL="${DATABASE_URL#\'}"
      DATABASE_URL="${DATABASE_URL%\'}"
      export DATABASE_URL
    fi
  fi
}
