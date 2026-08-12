$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $PSScriptRoot "vps.local.env"

$map = @{}
Get-Content $EnvFile -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $map[$line.Substring(0, $i).Trim()] = $line.Substring($i + 1).Trim()
}

$HostName = $map["VPS_HOST"]
$User = $map["VPS_USER"]
$Password = $map["VPS_PASSWORD"]
$AppDir = $map["APP_DIR"]

$askpass = Join-Path $env:TEMP ("sigh-deploy-{0}.cmd" -f [guid]::NewGuid().ToString("N"))
$pwForCmd = $Password `
  -replace '\^', '^^' `
  -replace '&', '^&' `
  -replace '<', '^<' `
  -replace '>', '^>' `
  -replace '\|', '^|' `
  -replace '%', '%%'
@("@echo off", "echo $($pwForCmd)") | Set-Content -Path $askpass -Encoding ASCII

$env:SSH_ASKPASS = $askpass
$env:SSH_ASKPASS_REQUIRE = "force"
$env:DISPLAY = "unused"

try {
  $remote = "cd '$AppDir' && bash deploy/deploy-app.sh && systemctl is-active sigh-web sigh-socket"
  ssh `
    -o StrictHostKeyChecking=accept-new `
    -o PreferredAuthentications=password `
    -o PubkeyAuthentication=no `
    -o NumberOfPasswordPrompts=1 `
    -o ServerAliveInterval=30 `
    ("{0}@{1}" -f $User, $HostName) `
    $remote
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "Deploy OK" -ForegroundColor Green
} finally {
  Remove-Item -Force $askpass -ErrorAction SilentlyContinue
}
