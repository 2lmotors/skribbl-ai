@echo off
title LaPlume - Session en Ligne
color 0A

echo ==========================================================
echo               LAPLUME - PARTIE EN LIGNE
echo ==========================================================
echo.

cd /d "%~dp0"

echo [1/2] Lancement du serveur de jeu local...
start "Serveur LaPlume" /B node server/index.js

timeout /t 2 >nul

echo [2/2] Creation du lien public securise HTTPS (Cloudflare)...
echo.
echo Le lien public va s'afficher ci-dessous.
echo Partagez ce lien avec vos amis sur smartphone ou PC !
echo.
echo ==========================================================
echo.

.\cloudflared.exe tunnel --url http://localhost:3000
pause
