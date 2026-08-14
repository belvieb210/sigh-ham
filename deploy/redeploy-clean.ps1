# Déploiement VPS avec nettoyage synchrone node_modules (ENOTEMPTY)
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $PSScriptRoot "vps.local.env"

if (-not (Test-Path $EnvFile)) {
  throw "Manquant : deploy/vps.local.env"
}

$map = @{}
Get-Content $EnvFile -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $map[$line.Substring(0, $i).Trim()] = $line.Substring($i + 1).Trim()
}

$VpsHost = if ($map["VPS_HOST"]) { $map["VPS_HOST"] } else { "185.202.236.210" }
$VpsUser = if ($map["VPS_USER"]) { $map["VPS_USER"] } else { "root" }
$AppDir = if ($map["APP_DIR"]) { $map["APP_DIR"] } else { "/var/www/sigh-ham" }
$Password = $map["VPS_PASSWORD"]

if (-not $Password -or $Password -eq "votre_mot_de_passe_ici") {
  throw "Configurez VPS_PASSWORD dans deploy/vps.local.env"
}

$askpass = Join-Path $env:TEMP ("sigh-askpass-{0}.cmd" -f [guid]::NewGuid().ToString("N"))
$pwForCmd = $Password `
  -replace '\^', '^^' `
  -replace '&', '^&' `
  -replace '<', '^<' `
  -replace '>', '^>' `
  -replace '\|', '^|' `
  -replace '%', '%%'
@(
  '@echo off'
  "echo $($pwForCmd)"
) | Set-Content -Path $askpass -Encoding ASCII

$env:SSH_ASKPASS = $askpass
$env:SSH_ASKPASS_REQUIRE = "force"
$env:DISPLAY = "unused"

$remoteScript = @(
  "cd '$AppDir'",
  "echo '==> git pull'",
  "git fetch origin main",
  "git pull origin main --ff-only",
  "git log -1 --oneline",
  "echo '==> deploy-app.sh'",
  "bash deploy/deploy-app.sh",
  "echo '==> Verification'",
  "systemctl is-active sigh-web sigh-socket",
  "curl -sI -o /dev/null -w 'http:%{http_code}\n' http://127.0.0.1:3000/connexion"
) -join " && "

try {
  Write-Host "Deploiement VPS (nettoyage npm) -> ${VpsUser}@${VpsHost}" -ForegroundColor Cyan
  ssh `
    -o StrictHostKeyChecking=accept-new `
    -o PreferredAuthentications=password `
    -o PubkeyAuthentication=no `
    -o NumberOfPasswordPrompts=1 `
    -o ConnectTimeout=30 `
    -o ServerAliveInterval=30 `
    ("{0}@{1}" -f $VpsUser, $VpsHost) `
    $remoteScript
  if ($LASTEXITCODE -ne 0) {
    throw "Echec deploiement (code $LASTEXITCODE)"
  }
  Write-Host "Deploiement termine." -ForegroundColor Green
} finally {
  Remove-Item -Force $askpass -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS_REQUIRE -ErrorAction SilentlyContinue
  Remove-Item Env:DISPLAY -ErrorAction SilentlyContinue
}
