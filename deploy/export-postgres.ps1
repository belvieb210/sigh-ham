# Export PostgreSQL SIGH (Windows PowerShell)
# Usage :
#   cd c:\xampp\htdocs\ham-projet
#   powershell -ExecutionPolicy Bypass -File deploy\export-postgres.ps1

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not (Test-Path (Join-Path $AppDir "package.json"))) {
  $AppDir = Get-Location
}

$BackupDir = Join-Path $AppDir "prisma\backups"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$EnvFile = Join-Path $AppDir ".env"
if (-not (Test-Path $EnvFile)) {
  Write-Error ".env introuvable dans $AppDir"
}

$DatabaseUrl = (Get-Content $EnvFile | Where-Object { $_ -match '^DATABASE_URL=' } | Select-Object -First 1)
if (-not $DatabaseUrl) {
  Write-Error "DATABASE_URL absent dans .env"
}
$DatabaseUrl = $DatabaseUrl -replace '^DATABASE_URL=', '' -replace '^"', '' -replace '"$', '' -replace "^'", '' -replace "'$", ''
# pg_dump n'accepte pas ?schema=public (paramètre Prisma)
$PgUrl = ($DatabaseUrl -split '\?')[0]

$PgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $PgDump) {
  $candidates = @(
    "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe"
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) {
      $PgDump = Get-Item $c
      break
    }
  }
}

if (-not $PgDump) {
  Write-Error "pg_dump introuvable. Ajoutez PostgreSQL\bin au PATH (ex: C:\Program Files\PostgreSQL\17\bin)"
}

$Stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$OutSql = Join-Path $BackupDir "sigh_ham_$Stamp.sql"
$OutGz = "$OutSql.gz"

Write-Host "==> Export PostgreSQL -> $OutSql"
& $PgDump.Source $PgUrl --no-owner --no-acl --clean --if-exists --format=plain --file=$OutSql

# Compression (si gzip/Git disponibles, sinon .sql seul)
$Gzip = Get-Command gzip -ErrorAction SilentlyContinue
if ($Gzip) {
  & gzip -f $OutSql
  $Final = $OutGz
} else {
  # Compress-Archive produit .zip
  $OutZip = "$OutSql.zip"
  Compress-Archive -Path $OutSql -DestinationPath $OutZip -Force
  Remove-Item $OutSql -Force
  $Final = $OutZip
}

$Size = (Get-Item $Final).Length
Write-Host ""
Write-Host "Export termine : $Final ($([math]::Round($Size/1KB,1)) KB)"
Write-Host ""
Write-Host "Envoyer vers le VPS :"
Write-Host "  scp `"$Final`" root@185.202.236.210:/var/www/sigh-ham/prisma/backups/"
