@echo off
title Cerrar Optica Vision Urbana
echo ==============================================================
echo       CERRANDO OPTICA VISION URBANA
echo ==============================================================
echo.
echo Apagando servidores y servicios en ejecucion...
taskkill /FI "WINDOWTITLE eq Optica_Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Optica_Frontend*" /T /F >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo.
echo Sistema cerrado correctamente.
ping -n 3 127.0.0.1 >nul
exit