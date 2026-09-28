@echo off
title Optica Vision Urbana
cd /d "%~dp0"

echo ==============================================================
echo       OPTICA VISION URBANA - SISTEMA DE GESTION
echo ==============================================================
echo.
echo  [1/3] Iniciando servidor y base de datos...
taskkill /FI "WINDOWTITLE eq Optica_Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Optica_Frontend*" /T /F >nul 2>&1
start "Optica_Backend" /min cmd /c "cd /d %~dp0backend && npm run dev"

echo  [2/3] Iniciando interfaz web...
start "Optica_Frontend" /min cmd /c "cd /d %~dp0frontend && npm run dev"

echo  [3/3] Esperando que inicien los servicios...
ping -n 5 127.0.0.1 >nul

echo.
echo  Abriendo el sistema en el navegador...
start http://localhost:5173

echo.
echo ==============================================================
echo   ESTADO: Sistema iniciado correctamente.
echo   ACCESO: http://localhost:5173
echo ==============================================================
echo.
echo   IMPORTANTE: Deje esta ventana abierta mientras use el sistema.
echo   Para finalizar y CERRAR el sistema por completo,
echo   presione cualquier tecla en esta ventana.
echo.
pause
echo.
echo   Cerrando el sistema...
taskkill /FI "WINDOWTITLE eq Optica_Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Optica_Frontend*" /T /F >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo   Listo. Hasta luego!
ping -n 2 127.0.0.1 >nul
exit