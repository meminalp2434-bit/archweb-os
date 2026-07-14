#!/bin/bash
echo "==============================================="
echo "  ArchWeb OS Masaüstü Uygulaması Başlatılıyor  "
echo "==============================================="
echo ""

# Bun kurulu mu kontrol edelim
if command -v bun &> /dev/null
then
    echo "[BİLGİ] Bun çalışma ortamı algılandı! Bun ile devam ediliyor..."
    cd "$(dirname "$0")/.." || cd ..
    if [ ! -d "node_modules" ]; then
        echo ""
        echo "[BİLGİ] İlk kurulum başlatılıyor (bun install)..."
        echo ""
        bun install
    fi
    echo ""
    echo "Geliştirici sunucusu başlatılıyor (bun)..."
    echo ""
    bun run dev
    read -p "Çıkmak için ENTER tuşuna basın..."
    exit 0
fi

# Node.js kurulu mu kontrol edelim
if ! command -v node &> /dev/null
then
    echo "[HATA] Bilgisayarınızda Node.js veya Bun kurulu değil!"
    echo "Uygulamayı çalıştırabilmek için bir çalışma ortamı yüklemeniz gerekmektedir."
    echo ""
    echo "Alternatif Seçenekler:"
    echo "1. Hiçbir şey indirmeden tarayıcıdan çalıştırın (En kolayı):"
    echo "   https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app"
    echo ""
    echo "2. Resmi web sitesinden Node.js indirin: https://nodejs.org/"
    echo ""
    echo "3. Bun indirin (Çok hafif, hızlı ve kurulumu kolay alternatif):"
    echo "   curl -fsSL https://bun.sh/install | bash"
    echo "==============================================="
    read -p "Çıkmak için ENTER tuşuna basın..."
    exit 1
fi

echo "Gerekli dizine geçiliyor..."
cd "$(dirname "$0")/.." || cd ..

# node_modules klasörü yoksa otomatik yükleme yapalım
if [ ! -d "node_modules" ]; then
    echo ""
    echo "[BİLGİ] İlk kurulum başlatılıyor (npm install)..."
    echo "Bu işlem internet hızınıza bağlı olarak birkaç dakika sürebilir, lütfen bekleyin..."
    echo ""
    npm install
fi

echo ""
echo "Geliştirici sunucusu başlatılıyor (npm)..."
echo ""
npm run dev

echo "Uygulama kapandı veya bir hata oluştu."
read -p "Çıkmak için ENTER tuşuna basın..."
