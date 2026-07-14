#!/bin/bash
echo "==================================="
echo "ArchWeb OS'e Hos Geldiniz!"
echo "==================================="
echo "Lutfen acilis modunu secin:"
echo "1 - Web Tarayicisi Modu (npm run dev)"
echo "2 - Masaustu Uygulamasi Modu (Electron)"
echo "==================================="
read -p "Seciminiz (1 veya 2): " secim

echo "Bagimliliklar kontrol ediliyor (npm install)..."
npm install

if [ "$secim" = "2" ]; then
    echo "Masaustu modunda baslatiliyor..."
    npm run electron:dev
else
    echo "Web modunda baslatiliyor..."
    npm run dev
fi

