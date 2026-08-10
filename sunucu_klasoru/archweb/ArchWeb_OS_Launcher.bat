@echo off
title ArchWeb OS - Windows Launcher (.BAT)
cd /d "%~dp0"
echo ===================================================
echo   ArchWeb OS Windows Baslatilıyor...
echo ===================================================
echo [1/2] Node.js ve ortam kontrol ediliyor...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi! Lutfen https://nodejs.org adresinden indirin.
    pause
    exit /b
)
echo [2/2] Sunucu ve arayuz baslatiliyor...
call npm install
call npm run dev
pause
