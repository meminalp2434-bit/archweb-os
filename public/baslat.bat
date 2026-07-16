@echo off
title ArchWeb OS Baslatici
echo ====================================================
20:1.2
echo ====================================================
echo Lutfen acilis modunu secin:
echo [1] Normal Mod (Web - Vite)
echo [2] Masaustu Uygulama Modu (Electron Engine)
echo [3] Guvenli Mod (Hata Ayiklama & Servisler Kapali)
echo ====================================================
set /p secim="Seciminiz (1, 2 veya 3): "

echo Bagimliliklar kontrol ediliyor...
call npm install

if "%secim%"=="3" (
    echo Guvenli Modda baslatiliyor...
    set VITE_SAFE_MODE=true
    call npm run dev
) else if "%secim%"=="2" (
    echo Masaustu modunda baslatiliyor...
    call npm run electron:dev
) else (
    echo Web modunda baslatiliyor...
    call npm run dev
)
pause
