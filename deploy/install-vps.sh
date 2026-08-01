#!/usr/bin/env bash
# =============================================================================
# SIGH HAM — Installation initiale VPS (Contabo / Ubuntu 22.04+)
# Exécuter en root sur le VPS :
#   curl -fsSL ... | bash
#   ou : bash deploy/install-vps.sh
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-hamlab5.duckdns.org}"
APP_USER="${APP_USER:-sigh}"
APP_DIR="${APP_DIR:-/var/www/sigh-ham}"
DB_NAME="${DB_NAME:-sigh_ham}"
DB_USER="${DB_USER:-sigh_app}"
GITHUB_REPO="${GITHUB_REPO:-https://github.com/belvieb210/sigh-ham.git}"
NODE_MAJOR="${NODE_MAJOR:-22}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@ham-laboratoire.cd}"

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "❌ Exécutez ce script en root (sudo bash deploy/install-vps.sh)"
  exit 1
fi

echo "==> Mise à jour du système"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx \
  postgresql postgresql-contrib redis-server \
  build-essential ufw fail2ban

echo "==> Node.js ${NODE_MAJOR}"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
echo "Node $(node -v) | npm $(npm -v)"

echo "==> Utilisateur applicatif ${APP_USER}"
if ! id "${APP_USER}" &>/dev/null; then
  useradd --system --home "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi
mkdir -p "${APP_DIR}" /var/www/certbot "${APP_DIR}/public/uploads/messagerie"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "==> PostgreSQL — base ${DB_NAME}"
DB_PASS="${DB_PASS:-$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)}"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
  || sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

echo "==> Redis"
systemctl enable redis-server
systemctl start redis-server

echo "==> Pare-feu UFW"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Clone du dépôt GitHub"
if [[ ! -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git clone "${GITHUB_REPO}" "${APP_DIR}" || {
    echo "⚠️  Clone impossible (repo vide ?). Créez d'abord le dépôt GitHub puis relancez."
    mkdir -p "${APP_DIR}"
  }
else
  echo "Dépôt déjà présent dans ${APP_DIR}"
fi

echo "==> Fichier .env production"
if [[ ! -f "${APP_DIR}/.env" ]]; then
  if [[ -f "${APP_DIR}/deploy/env.production.template" ]]; then
    cp "${APP_DIR}/deploy/env.production.template" "${APP_DIR}/.env"
  else
    cp deploy/env.production.template "${APP_DIR}/.env" 2>/dev/null || true
  fi
  sed -i "s|CHANGE_ME_DB_PASSWORD|${DB_PASS}|g" "${APP_DIR}/.env"
  chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
  chmod 600 "${APP_DIR}/.env"
fi

echo "==> Nginx (bootstrap HTTP)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "${SCRIPT_DIR}/nginx/sigh-ham-http.bootstrap.conf" /etc/nginx/sites-available/sigh-ham
ln -sf /etc/nginx/sites-available/sigh-ham /etc/nginx/sites-enabled/sigh-ham
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
if systemctl is-active --quiet nginx; then
  systemctl reload nginx
else
  systemctl start nginx
fi

echo "==> Systemd"
cp "${SCRIPT_DIR}/systemd/sigh-web.service" /etc/systemd/system/
cp "${SCRIPT_DIR}/systemd/sigh-socket.service" /etc/systemd/system/
systemctl daemon-reload

echo ""
echo "=============================================="
echo "✅ Infrastructure VPS installée"
echo "=============================================="
echo "Domaine      : ${DOMAIN}"
echo "App          : ${APP_DIR}"
echo "PostgreSQL   : ${DB_NAME} / user ${DB_USER}"
echo "Mot de passe : ${DB_PASS}  ( aussi dans ${APP_DIR}/.env )"
echo ""
echo "Prochaines étapes :"
echo "  1. Poussez le code sur GitHub : ${GITHUB_REPO}"
echo "  2. Sur le VPS : sudo -u ${APP_USER} bash ${APP_DIR}/deploy/deploy-app.sh --seed"
echo "  3. SSL       : certbot --nginx -d ${DOMAIN} --email ${CERTBOT_EMAIL} --agree-tos --non-interactive"
echo "  4. Puis      : cp ${APP_DIR}/deploy/nginx/sigh-ham.conf /etc/nginx/sites-available/sigh-ham && nginx -t && systemctl reload nginx"
echo "=============================================="
