@echo off
title ArchWeb OS Baslatici
echo ===================================
echo ArchWeb OS'e Hos Geldiniz!
echo ===================================
echo Lutfen acilis modunu secin:
echo 1 - Normal Mod (Web)
echo 2 - Masaustu Uygulamasi Modu (Electron)
echo 3 - Guvenli Mod (Hizmetler kapali)
echo ===================================
set /p secim="Seciminiz (1, 2 veya 3): "

echo Bagimliliklar kontrol ediliyor (npm install)...
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
