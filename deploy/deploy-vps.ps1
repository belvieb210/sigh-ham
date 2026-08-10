# =============================================================================
# SIGH HAM — Déploiement distant (PowerShell / Windows)
#
# Usage (une seule fois par session) :
#   $env:SIGH_VPS_PASSWORD = 'votre-mot-de-passe'
#   .\deploy\deploy-vps.ps1
#
# Options :
#   .\deploy\deploy-vps.ps1 -Host 185.202.236.210 -User root
# =============================================================================
param(
  [string]$Host = "185.202.236.210",
  [string]$User = "root",
  [string]$AppDir = "/var/www/sigh-ham"
)

$ErrorActionPreference = "Stop"

if (-not $env:SIGH_VPS_PASSWORD) {
  Write-Error "Définissez d'abord le mot de passe : `$env:SIGH_VPS_PASSWORD = '...'"
  exit 1
}

$askpass = Join-Path $env:TEMP "sigh-askpass.cmd"
@("@echo off", "echo $env:SIGH_VPS_PASSWORD") | Set-Content $askpass -Encoding ASCII

$env:SSH_ASKPASS = $askpass
$env:SSH_ASKPASS_REQUIRE = "force"
$env:DISPLAY = "unused"

# Tout passe par deploy-app.sh (git pull, npm, migrate, build, restart).
# Ne pas lancer npm ci / rm node_modules ici — cela provoquait ENOTEMPTY.
$remoteScript = @"
set -euo pipefail
cd '$AppDir'
echo '==> Commit déployé'
git log -1 --oneline
echo '==> deploy-app.sh'
bash deploy/deploy-app.sh
echo '==> Vérification'
systemctl is-active sigh-web sigh-socket
curl -sI -o /dev/null -w 'http:%{http_code}\n' http://127.0.0.1:3000/connexion
"@

try {
  ssh `
    -o ConnectTimeout=30 `
    -o StrictHostKeyChecking=accept-new `
    -o PreferredAuthentications=password `
    -o PubkeyAuthentication=no `
    -o ServerAliveInterval=30 `
    "${User}@${Host}" `
    $remoteScript
} finally {
  Remove-Item $askpass -Force -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS_REQUIRE -ErrorAction SilentlyContinue
  Remove-Item Env:DISPLAY -ErrorAction SilentlyContinue
}
