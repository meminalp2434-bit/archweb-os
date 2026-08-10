@echo off
title ArchWeb OS - Windows Launcher (.BAT)
cd /d "%~dp0"
echo ===================================================
echo   ArchWeb OS Windows Baslatiliyor...
echo ===================================================
call npm install && call npm run dev
pause
