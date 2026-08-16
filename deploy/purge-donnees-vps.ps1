# Lance la purge sur le VPS (MANUEL UNIQUEMENT - jamais via deploy/cron)
[CmdletBinding()]
param(
  [switch]$Confirmer
)

$ErrorActionPreference = "Stop"
$EnvFile = Join-Path $PSScriptRoot "vps.local.env"

if (-not (Test-Path $EnvFile)) {
  throw "Configurez deploy\vps.local.env"
}

$map = @{}
Get-Content $EnvFile -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $k = $line.Substring(0, $i).Trim()
  $v = $line.Substring($i + 1).Trim()
  if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
    $v = $v.Substring(1, $v.Length - 2)
  }
  $map[$k] = $v
}

$VpsHost = if ($map["VPS_HOST"]) { $map["VPS_HOST"] } else { "185.202.236.210" }
$VpsUser = if ($map["VPS_USER"]) { $map["VPS_USER"] } else { "root" }
$AppDir = if ($map["APP_DIR"]) { $map["APP_DIR"] } else { "/var/www/sigh-ham" }
$Password = $map["VPS_PASSWORD"]

if (-not $Password -or $Password -eq "votre_mot_de_passe_ici") {
  throw "Indiquez VPS_PASSWORD dans deploy\vps.local.env"
}

Write-Host ""
Write-Host "PURGE VPS - $VpsHost ($AppDir)" -ForegroundColor Yellow
Write-Host "Conserve : agents, admin, salles, medicaments, catalogue examens" -ForegroundColor Green
Write-Host "Supprime : patients, factures, resultats, flux cliniques" -ForegroundColor Red
Write-Host ""

if (-not $Confirmer) {
  $rep = Read-Host "Tapez OUI pour lancer sur le VPS"
  if ($rep -ne "OUI") {
    Write-Host "Annule."
    exit 0
  }
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

try {
  $cmd = "cd '$AppDir' && git pull --ff-only origin main && chmod +x deploy/purge-donnees-operationnelles.sh && CONFIRMER=OUI bash deploy/purge-donnees-operationnelles.sh"
  & ssh `
    -o StrictHostKeyChecking=accept-new `
    -o PreferredAuthentications=password `
    -o PubkeyAuthentication=no `
    -o NumberOfPasswordPrompts=1 `
    ("{0}@{1}" -f $VpsUser, $VpsHost) `
    $cmd
  if ($LASTEXITCODE -ne 0) {
    throw "Echec purge VPS (code $LASTEXITCODE). Verifiez VPS_PASSWORD dans deploy\vps.local.env"
  }
} finally {
  Remove-Item -Force $askpass -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS -ErrorAction SilentlyContinue
  Remove-Item Env:SSH_ASKPASS_REQUIRE -ErrorAction SilentlyContinue
  Remove-Item Env:DISPLAY -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Purge VPS terminee. Rafraichissez la page (Ctrl+F5)." -ForegroundColor Green
