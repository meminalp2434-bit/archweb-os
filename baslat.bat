@echo off
title ArchWeb OS Baslatici
echo ===================================
echo ArchWeb OS'e Hos Geldiniz!
echo ===================================
echo Lutfen acilis modunu secin:
echo 1 - Web Tarayicisi Modu (npm run dev)
echo 2 - Masaustu Uygulamasi Modu (Electron)
echo ===================================
set /p secim="Seciminiz (1 veya 2): "

echo Bagimliliklar kontrol ediliyor (npm install)...
call npm install

if "%secim%"=="2" (
    echo Masaustu modunda baslatiliyor...
    call npm run electron:dev
) else (
    echo Web modunda baslatiliyor...
    call npm run dev
)

pause

