# =============================================================================
# SIGH HAM — Push GitHub + deploiement VPS (build + restart)
#
# Double-clic : DEPLOIEMENT-VPS.bat (racine du projet)
# Ou :         .\deploy\push-and-deploy.ps1
#
# Config (une seule fois) : deploy\vps.local.env  (mot de passe VPS)
# =============================================================================
[CmdletBinding()]
param(
  [string]$Message = "",
  [switch]$SkipCommit,
  [switch]$DeployOnly
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

$EnvFile = Join-Path $PSScriptRoot "vps.local.env"
$EnvExample = Join-Path $PSScriptRoot "vps.local.env.example"

function Write-Step([string]$t) {
  Write-Host ""
  Write-Host "==> $t" -ForegroundColor Cyan
}

function Import-VpsLocalEnv {
  if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
      Copy-Item $EnvExample $EnvFile
    }
    Write-Host ""
    Write-Host "Fichier manquant : deploy\vps.local.env" -ForegroundColor Yellow
    Write-Host "1. Ouvrez deploy\vps.local.env"
    Write-Host "2. Remplacez VPS_PASSWORD=... par le mot de passe root du VPS"
    Write-Host "3. Relancez DEPLOIEMENT-VPS.bat"
    Write-Host ""
    notepad $EnvFile
    throw "Configurez deploy\vps.local.env puis relancez."
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
  return $map
}

function Invoke-VpsDeploy {
  param(
    [string]$HostName,
    [string]$User,
    [string]$Password,
    [string]$AppDir
  )

  # Askpass ecrit le mot de passe en clair dans un .cmd temporaire
  # (OpenSSH Windows n'herite pas toujours les variables d'env vers SSH_ASKPASS)
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

  $prevAsk = $env:SSH_ASKPASS
  $prevReq = $env:SSH_ASKPASS_REQUIRE
  $prevDisp = $env:DISPLAY

  $env:SSH_ASKPASS = $askpass
  $env:SSH_ASKPASS_REQUIRE = "force"
  $env:DISPLAY = "unused"

  try {
    $cmd = "cd '$AppDir' && git fetch origin main && git reset --hard origin/main && bash deploy/auto-deploy-cron.sh --force && git log -1 --oneline && systemctl is-active sigh-web sigh-socket"
    # Pas de TTY alloue : force l'utilisation de SSH_ASKPASS
    & ssh `
      -o StrictHostKeyChecking=accept-new `
      -o PreferredAuthentications=password `
      -o PubkeyAuthentication=no `
      -o NumberOfPasswordPrompts=1 `
      ("{0}@{1}" -f $User, $HostName) `
      $cmd
    if ($LASTEXITCODE -ne 0) {
      throw "Echec SSH / deploiement VPS (code $LASTEXITCODE). Verifiez VPS_PASSWORD dans deploy\vps.local.env"
    }
  } finally {
    Remove-Item -Force $askpass -ErrorAction SilentlyContinue
    if ($null -ne $prevAsk) { $env:SSH_ASKPASS = $prevAsk } else { Remove-Item Env:SSH_ASKPASS -ErrorAction SilentlyContinue }
    if ($null -ne $prevReq) { $env:SSH_ASKPASS_REQUIRE = $prevReq } else { Remove-Item Env:SSH_ASKPASS_REQUIRE -ErrorAction SilentlyContinue }
    if ($null -ne $prevDisp) { $env:DISPLAY = $prevDisp } else { Remove-Item Env:DISPLAY -ErrorAction SilentlyContinue }
  }
}

$cfg = Import-VpsLocalEnv
$VpsHost = if ($cfg["VPS_HOST"]) { $cfg["VPS_HOST"] } else { "185.202.236.210" }
$VpsUser = if ($cfg["VPS_USER"]) { $cfg["VPS_USER"] } else { "root" }
$AppDir = if ($cfg["APP_DIR"]) { $cfg["APP_DIR"] } else { "/var/www/sigh-ham" }
$SiteUrl = if ($cfg["SITE_URL"]) { $cfg["SITE_URL"] } else { "https://hamlab5.duckdns.org" }
$Password = $cfg["VPS_PASSWORD"]

if (-not $Password -or $Password -eq "votre_mot_de_passe_ici") {
  notepad $EnvFile
  throw "Indiquez le vrai mot de passe dans deploy\vps.local.env (cle VPS_PASSWORD)."
}

Write-Host "SIGH HAM - deploiement automatique" -ForegroundColor Green
Write-Host "PC  : $RepoRoot"
Write-Host ("VPS : {0}@{1}  ({2})" -f $VpsUser, $VpsHost, $AppDir)

if (-not $DeployOnly) {
  Write-Step "Git - statut"
  git status --short

  $status = git status --porcelain
  if ($status -and -not $SkipCommit) {
    Write-Step "Git - commit"
    git add -A
    if (-not $Message -or $Message.Trim().Length -eq 0) {
      $Message = "chore: deploiement $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Commit ignore (peut-etre rien de nouveau)." -ForegroundColor Yellow
    }
  }
  elseif ($status -and $SkipCommit) {
    Write-Host "Modifications locales NON committees (-SkipCommit)." -ForegroundColor Yellow
  }
  else {
    Write-Host "Rien a committer."
  }

  Write-Step "Git - push origin/main"
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw "Echec git push vers GitHub." }
  Write-Host "Push OK" -ForegroundColor Green
}

Write-Step "VPS - pull + migrate + build + restart"
Invoke-VpsDeploy -HostName $VpsHost -User $VpsUser -Password $Password -AppDir $AppDir

Write-Host ""
Write-Host ("Termine - {0}" -f $SiteUrl) -ForegroundColor Green
Write-Host "Logs VPS : tail -f /var/www/sigh-ham/logs/auto-deploy.log"
