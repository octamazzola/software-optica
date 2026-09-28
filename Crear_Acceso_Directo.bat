@echo off
title Crear Accesos Directos - Optica
cd /d "%~dp0"
echo ==============================================================
echo   CREANDO ACCESOS DIRECTOS EN EL ESCRITORIO
echo ==============================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $d = [Environment]::GetFolderPath('Desktop'); $s1 = $ws.CreateShortcut([System.IO.Path]::Combine($d, 'Optica Vision Urbana.lnk')); $s1.TargetPath = [System.IO.Path]::Combine('%~dp0', 'Iniciar_Optica.bat'); $s1.WorkingDirectory = '%~dp0'; $s1.Description = 'Sistema de Gestion - Optica Vision Urbana'; $s1.IconLocation = 'shell32.dll,220'; $s1.Save(); $s2 = $ws.CreateShortcut([System.IO.Path]::Combine($d, 'Cerrar Optica.lnk')); $s2.TargetPath = [System.IO.Path]::Combine('%~dp0', 'Cerrar_Optica.bat'); $s2.WorkingDirectory = '%~dp0'; $s2.Description = 'Cerrar Sistema de Gestion - Optica'; $s2.IconLocation = 'shell32.dll,27'; $s2.Save()"
echo [OK] Se crearon los accesos directos en tu Escritorio:
echo      - "Optica Vision Urbana" (Para iniciar)
echo      - "Cerrar Optica" (Para apagar)
echo.
ping -n 3 127.0.0.1 >nul
exit