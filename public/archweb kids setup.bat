@echo off
title ArchWeb OS Baslatici
echo ====================================================
echo ArchWeb OS Baslatiliyor...
echo ====================================================
echo Lutfen acilis modunu secin:
echo [1] Online Web Surumu (Node.js gerektirmez)
echo [2] Yerel Sunucu Modu - http://192.168.1.105:3000/ (Node.js gerektirir)
echo [3] Electron Masaustu Modu (Node.js gerektirir)
echo ====================================================
set /p secim="Seciminiz (1, 2 veya 3): "

if "%secim%"=="1" (
    echo Tarayici aciliyor...
    start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app
) else if "%secim%"=="2" (
    echo Bagimliliklar yukleniyor...
    call npm install
    echo Yerel sunucu baslatiliyor...
    start http://192.168.1.105:3000/
    call npm run dev
) else if "%secim%"=="3" (
    echo Bagimliliklar yukleniyor...
    call npm install
    echo Electron masaustu uygulamasi baslatiliyor...
    call npm run electron:start
) else (
    echo Gecersiz secim.
)
pause
