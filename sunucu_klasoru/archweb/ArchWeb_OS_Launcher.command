#!/bin/bash
# ArchWeb OS - macOS Launcher Script (.COMMAND)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "==================================================="
echo "   ArchWeb OS macOS / Linux Başlatılıyor..."
echo "==================================================="

if ! command -v node &> /dev/null; then
    echo "[HATA] Node.js bulunamadı! Lütfen Node.js yükleyin."
    read -p "Devam etmek için Enter'a basın..."
    exit 1
fi

echo "[1/2] Bağımlılıklar kontrol ediliyor..."
npm install

echo "[2/2] ArchWeb OS başlatılıyor..."
npm run dev
