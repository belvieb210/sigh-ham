@echo off
chcp 65001 >nul
title SIGH HAM — Déploiement VPS
cd /d "%~dp0"

echo.
echo  ============================================
echo   SIGH HAM — Commit + Push + Build VPS
echo  ============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy\push-and-deploy.ps1" %*
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo  ECHEC du deploiement ^(code %ERR%^).
  echo  Verifiez deploy\vps.local.env ^(mot de passe VPS^).
) else (
  echo  OK — https://hamlab5.duckdns.org
)
echo.
pause
exit /b %ERR%
