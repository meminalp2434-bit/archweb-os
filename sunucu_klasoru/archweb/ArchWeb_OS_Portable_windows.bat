@echo off
title ArchWeb OS - Portable Windows Launcher (.BAT)
cd /d "%~dp0"
echo ===================================================
echo   ArchWeb OS Portable Windows Baslatiliyor...
echo ===================================================
call npm install && call npm run dev
pause
