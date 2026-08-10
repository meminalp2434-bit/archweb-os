#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
echo "==================================================="
echo "   ArchWeb OS Portable macOS Başlatılıyor..."
echo "==================================================="
npm install && npm run dev
