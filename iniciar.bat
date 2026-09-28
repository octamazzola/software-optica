@echo off
title Iniciar Optica - Backend y Frontend
echo ==============================================
echo   Iniciando Software Optica (Back + Front)
echo ==============================================
echo.
echo Abriendo Backend en puerto 3000...
start "Backend - Optica" cmd /k "cd /d %~dp0backend && npm run dev"

echo Abriendo Frontend en puerto 5173...
start "Frontend - Optica" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Listo! Ambas consolas estan activas.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo.
pause
