@echo off
setlocal enabledelayedexpansion
title ArchWeb OS - Ultimate Launcher & Updater
mode con: cols=100 lines=30
color 0B

:: Header
echo ======================================================================
echo    ___                _ __      __     _      ____   _____ 
echo   / _ \              | |\ \    / /    | |    / __ \ / ____|
echo  | |_| | _ __  ___  | | \ \  / /  ___ | |__ | |  | | (___  
echo  |  _  || '__|/ __| | |  \ \/ /  / _ \| '_ \| |  | |\___ \ 
echo  | | | || |  | (__  | |   \  /  |  __/| |_) | |__| |____) |
echo  \_| |_/|_|   \___| |_|    \/    \___||_.__/ \____/|_____/ 
echo ======================================================================
echo           GELISTIRILMIS SISTEM BASLATICI v20.1.2
echo ======================================================================
echo.
echo [SUNUCU ADRESLERI]
echo  - Genel Canlı Ön İzleme (Herkes İçin): https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app
echo  - Geliştirme Sunucusu (Özel Ağ):    https://ais-dev-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app
echo  - Yerel Ağ (Wi-Fi):                 http://192.168.1.182:3000
echo  - Yerel Bilgisayar:                 http://localhost:3000
echo ======================================================================
echo.

:: Path Check
cd /d "%~dp0"

:: 1. Environment Validation
echo [1/4] Sistem gereksinimleri kontrol ediliyor...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [HATA] Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden LTS surumunu yukleyin.
    echo.
    pause
    exit /b
)

if not exist "package.json" (
    color 0C
    echo [HATA] package.json bulunamadi! 
    echo Lutfen bu dosyayi projenin ana dizininde (root) calistirin.
    echo.
    pause
    exit /b
)
echo [TAMAM] Calisma ortami dogrulandi.
echo.

:: 2. Update / Install Check
if not exist "node_modules" (
    color 0E
    echo [BILGI] node_modules klasoru bulunamadi. Ilk kurulum yapiliyor...
    call npm install
)

echo [2/4] Guncelleme Kontrolu
echo --------------------------------------------------
echo [1] Sistemi Guncelle (npm install)
echo [2] Guncellemeden Devam Et
echo --------------------------------------------------
set /p choice="Seciminizi yapin (Varsayilan 2): "

if "%choice%"=="1" (
    echo.
    echo [GUNCELLEME] Paketler guncelleniyor, lutfen bekleyin...
    call npm install
    if %errorlevel% neq 0 (
        echo [UYARI] Guncelleme sirasinda bazi hatalar olustu.
    ) else (
        echo [TAMAM] Guncelleme basarili.
    )
)
echo.

:: 3. Execution Mode
echo [3/4] Sistem Modu Seciliyor...
:: Priority: Electron -> Dev Mode
if exist "node_modules\electron" (
    echo [MOD] Electron (Masaustu Uygulamasi) baslatiliyor...
    echo [NOT] Bu pencereyi kapatmayin, sistem arka planda calisiyor.
    echo.
    call npm run electron
    if %errorlevel% neq 0 (
        color 0E
        echo [UYARI] Electron baslatilamadi. Tarayici moduna geciliyor...
        call npm run dev
    )
) else (
    echo [MOD] Web (Gelistirici) modu baslatiliyor...
    call npm run dev
)

:: 4. Error Handling & Exit
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ======================================================================
    echo [KRITIK HATA] Sistem beklenmedik bir sekilde durdu.
    echo Olasi nedenler:
    echo 1. Port 3000 baska bir uygulama tarafindan kullaniliyor.
    echo 2. Eksik veya hatali paketler mevcut (npm install deneyin).
    echo 3. İnternet baglantisi gerektiren bilesenler yuklenemedi.
    echo ======================================================================
    pause
) else (
    echo.
    echo [BILGI] Oturum guvenli bir sekilde sonlandirildi.
    echo Kapatmak icin bir tusa basin.
    pause
)
