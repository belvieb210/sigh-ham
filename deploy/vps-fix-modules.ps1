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
$cmd = "bash ${AppDir}/deploy/fix-node-modules.sh; systemctl is-active sigh-web sigh-socket; git -C ${AppDir} log -1 --oneline"
try {
  & ssh -o StrictHostKeyChecking=accept-new -o PreferredAuthentications=password -o PubkeyAuthentication=no -o NumberOfPasswordPrompts=1 ("{0}@{1}" -f $User, $HostName) $cmd
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Remove-Item -Force $askpass -ErrorAction SilentlyContinue
}
