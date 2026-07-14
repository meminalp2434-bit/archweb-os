@echo off
title ArchWeb OS Baslatici
echo ===============================================
echo   ArchWeb OS Masaustu Uygulamasi Baslatiliyor
echo ===============================================
echo.

:: Bun kurulu mu kontrol edelim
where bun >nul 2>nul
if %errorlevel% eq 0 (
    echo [BILGI] Bun calisma ortami algilandi! Bun ile devam ediliyor...
    echo Gerekli dizine geciliyor...
    cd ..
    if not exist node_modules (
        echo.
        echo [BILGI] Ilk kurulum baslatiliyor (bun install)...
        echo.
        call bun install
    )
    echo.
    echo Gelistirici sunucusu baslatiliyor (bun)...
    echo.
    call bun run dev
    pause
    exit /b
)

:: Node.js kurulu mu kontrol edelim
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Bilgisayarinizda Node.js veya Bun yuklu degil!
    echo Uygulamayi calistirabilmek icin bir calisma ortami yuklemeniz gerekmektedir.
    echo.
    echo Alternatif Secenekler:
    echo 1. Hicbir sey indirmeden tarayicinizdan calistirin (En kolayi):
    echo    https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app
    echo.
    echo 2. Node.js indirin (Windows 64-bit):
    echo    https://nodejs.org/dist/v22.14.0/node-v22.14.0-x64.msi
    echo.
    echo 3. Bun indirin (Cok hafif ve hizli alternatif - PowerShell'e yapistirin):
    echo    powershell -c "irm bun.sh/install.ps1 | iex"
    echo.
    echo Kurulum bittikten sonra bu pencereyi kapatip tekrar acin.
    echo ===============================================
    pause
    exit /b
)

echo Gerekli dizine geciliyor...
cd ..

:: node_modules klasoru yoksa otomatik yukleme yapalim
if not exist node_modules (
    echo.
    echo [BILGI] Ilk kurulum baslatiliyor (npm install)...
    echo Bu islem internet hizina bagli olarak birkac dakika surebilir, lutfen bekleyin...
    echo.
    call npm install
)

echo.
echo Gelistirici sunucusu baslatiliyor (npm)...
echo.
call npm run dev
pause
