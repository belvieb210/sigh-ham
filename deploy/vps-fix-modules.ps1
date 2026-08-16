$ErrorActionPreference = "Stop"
$EnvFile = Join-Path $PSScriptRoot "vps.local.env"
$map = @{}
Get-Content $EnvFile -Encoding UTF8 | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $map[$line.Substring(0, $i).Trim()] = $line.Substring($i + 1).Trim()
}
$HostName = if ($map["VPS_HOST"]) { $map["VPS_HOST"] } else { "185.202.236.210" }
$User = if ($map["VPS_USER"]) { $map["VPS_USER"] } else { "root" }
$Password = $map["VPS_PASSWORD"]
$AppDir = if ($map["APP_DIR"]) { $map["APP_DIR"] } else { "/var/www/sigh-ham" }
$askpass = Join-Path $env:TEMP ("sigh-askpass-{0}.cmd" -f [guid]::NewGuid().ToString("N"))
$pwForCmd = $Password -replace '\^','^^' -replace '&','^&' -replace '<','^<' -replace '>','^>' -replace '\|','^|' -replace '%','%%'
@('@echo off', "echo $($pwForCmd)") | Set-Content -Path $askpass -Encoding ASCII
$env:SSH_ASKPASS = $askpass
$env:SSH_ASKPASS_REQUIRE = "force"
$env:DISPLAY = "unused"
$cmd = "systemctl stop sigh-web sigh-socket 2>/dev/null || true; rm -f /tmp/sigh-ham-auto-deploy.lock; pkill -u sigh -f 'npm|next|node.*sigh-ham' 2>/dev/null || true; sleep 2; rm -rf ${AppDir}/node_modules ${AppDir}/node_modules.trash.* ${AppDir}/.next ${AppDir}/.next-new ${AppDir}/.next-old; cd ${AppDir}; git fetch origin main; git reset --hard origin/main; chown -R sigh:sigh ${AppDir}; sudo -u sigh -H bash -lc 'cd ${AppDir} && npm ci'; bash ${AppDir}/deploy/deploy-app.sh; systemctl is-active sigh-web sigh-socket; git log -1 --oneline"
try {
  & ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1 ("{0}@{1}" -f $User, $HostName) $cmd
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Remove-Item -Force $askpass -ErrorAction SilentlyContinue
}
