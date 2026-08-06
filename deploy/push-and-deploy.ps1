# =============================================================================
# SIGH HAM — Push GitHub + déploiement VPS (depuis votre PC Windows)
#
# Usage (PowerShell, à la racine du projet) :
#   .\deploy\push-and-deploy.ps1
#   .\deploy\push-and-deploy.ps1 -Message "fix pdf medecins"
#   .\deploy\push-and-deploy.ps1 -SkipCommit          # push seulement si déjà commité
#   .\deploy\push-and-deploy.ps1 -DeployOnly           # pas de git : force deploy VPS
#
# Mot de passe VPS (ne pas committer) :
#   $env:SIGH_VPS_PASSWORD = "votre_mot_de_passe"
#   sinon le script le demande une fois (saisie masquée).
#
# Équivalent de ce que fait l'agent : push main → auto-deploy-cron.sh --force
# =============================================================================
[CmdletBinding()]
param(
  [string]$Message = "",
  [switch]$SkipCommit,
  [switch]$DeployOnly,
  [string]$VpsHost = "185.202.236.210",
  [string]$VpsUser = "root",
  [string]$AppDir = "/var/www/sigh-ham"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Write-Step([string]$t) {
  Write-Host ""
  Write-Host "==> $t" -ForegroundColor Cyan
}

function Get-VpsPassword {
  if ($env:SIGH_VPS_PASSWORD -and $env:SIGH_VPS_PASSWORD.Trim().Length -gt 0) {
    return $env:SIGH_VPS_PASSWORD.Trim()
  }
  $sec = Read-Host "Mot de passe VPS ($VpsUser@$VpsHost)" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

function Invoke-VpsDeploy([string]$Password) {
  $askpass = Join-Path $env:TEMP ("sigh-askpass-{0}.cmd" -f [guid]::NewGuid().ToString("N"))
  # Échappe % pour cmd et écrit le mot de passe
  $pwEsc = $Password -replace '%', '%%'
  Set-Content -Path $askpass -Value ("@echo {0}" -f $pwEsc) -Encoding ASCII
  $prevAsk = $env:SSH_ASKPASS
  $prevReq = $env:SSH_ASKPASS_REQUIRE
  $prevDisp = $env:DISPLAY
  $env:SSH_ASKPASS = $askpass
  $env:SSH_ASKPASS_REQUIRE = "force"
  $env:DISPLAY = "unused"
  try {
    $remote = @"
set -euo pipefail
cd '$AppDir'
git fetch origin main
git pull origin main
bash deploy/auto-deploy-cron.sh --force
git -C '$AppDir' log -1 --oneline
systemctl is-active sigh-web sigh-socket
"@
    $remoteOneLine = ($remote -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }) -join "; "
    & ssh `
      -o StrictHostKeyChecking=accept-new `
      -o PreferredAuthentications=password `
      -o PubkeyAuthentication=no `
      ("{0}@{1}" -f $VpsUser, $VpsHost) `
      $remoteOneLine
    if ($LASTEXITCODE -ne 0) {
      throw "Échec SSH / déploiement VPS (code $LASTEXITCODE)."
    }
  } finally {
    Remove-Item -Force $askpass -ErrorAction SilentlyContinue
    if ($null -ne $prevAsk) { $env:SSH_ASKPASS = $prevAsk } else { Remove-Item Env:SSH_ASKPASS -ErrorAction SilentlyContinue }
    if ($null -ne $prevReq) { $env:SSH_ASKPASS_REQUIRE = $prevReq } else { Remove-Item Env:SSH_ASKPASS_REQUIRE -ErrorAction SilentlyContinue }
    if ($null -ne $prevDisp) { $env:DISPLAY = $prevDisp } else { Remove-Item Env:DISPLAY -ErrorAction SilentlyContinue }
  }
}

Write-Host "SIGH HAM — push + déploiement VPS" -ForegroundColor Green
Write-Host "Dépôt : $RepoRoot"
Write-Host "VPS   : $VpsUser@$VpsHost → $AppDir"

if (-not $DeployOnly) {
  Write-Step "État Git"
  git status --short

  $status = git status --porcelain
  if ($status -and -not $SkipCommit) {
    Write-Step "Commit des changements locaux"
    git add -A
    if (-not $Message -or $Message.Trim().Length -eq 0) {
      $Message = "chore: mise a jour $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $Message
  } elseif ($status -and $SkipCommit) {
    Write-Host "⚠️  Des fichiers modifiés ne seront PAS commités (-SkipCommit)." -ForegroundColor Yellow
  } else {
    Write-Host "Rien à committer (working tree clean)."
  }

  Write-Step "Push vers origin/main"
  git push origin main
  if ($LASTEXITCODE -ne 0) {
    throw "Échec git push."
  }
  Write-Host "✓ Push GitHub OK" -ForegroundColor Green
}

Write-Step "Déploiement VPS (auto-deploy --force)"
$pwdVps = Get-VpsPassword
if (-not $pwdVps) { throw "Mot de passe VPS vide." }
Invoke-VpsDeploy -Password $pwdVps

Write-Host ""
Write-Host "✅ Terminé — site : https://hamlab5.duckdns.org" -ForegroundColor Green
Write-Host "   Logs VPS : tail -f /var/www/sigh-ham/logs/auto-deploy.log"
