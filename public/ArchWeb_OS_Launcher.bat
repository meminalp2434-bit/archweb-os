@echo off
setlocal enabledelayedexpansion
title ArchWeb OS System Launcher
cd /d "%~dp0"

:: 1. Try to launch with Python (Modern UI)
where python >nul 2>nul
if %errorlevel% equ 0 (
    if exist "ArchWeb_OS_Setup.exe" (
        echo [SYSTEM] Python algilandi. Gelismis konsol arayuzu baslatiliyor...
        python ArchWeb_OS_Setup.exe
        if %errorlevel% neq 0 (
            echo.
            echo [HATA] Python calistirilirken bir sorun olustu.
            pause
        )
        exit /b
    )
)

:: 2. Fallback to Legacy Batch UI (Theme Colors)
color 0B
echo ====================================================
echo           ARCHWEB OS - SYSTEM LAUNCHER (LEGACY)
echo ====================================================
echo.
echo BILGI: Python bulunamadigi veya Setup.exe eksik oldugu icin klasik modda baslatiliyor.
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden Node.js yukleyin.
    echo.
    pause
    exit /b
)

:: Launch
echo Sunucu baslatiliyor...
call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [HATA] Sunucu baslatilamadi. Lutfen bagimliliklarin yuklu oldugundan emin olun (npm install).
    pause
)
pause
