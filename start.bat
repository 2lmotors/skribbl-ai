@echo off
title LaPlume - Lancement
color 0B

echo ==========================================================
echo               LAPLUME - INITIALISATION
echo ==========================================================
echo.

cd /d "%~dp0"

if not exist "server\node_modules" (
    echo [1/3] Installation des dependances du serveur...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo [2/3] Installation des dependances du client...
    cd client
    call npm install
    cd ..
)

if not exist "client\dist" (
    echo [3/3] Construction du client React...
    cd client
    call npm run build
    cd ..
)

echo.
echo ==========================================================
echo Lancement du serveur de jeu...
echo ==========================================================
echo.

start http://localhost:3000
node server\index.js
pause
