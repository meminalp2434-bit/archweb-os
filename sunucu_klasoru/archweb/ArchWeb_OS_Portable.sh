#!/bin/bash
# ArchWeb OS - Linux Portable Shell Launcher (.SH)
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
echo "==================================================="
echo "   ArchWeb OS Portable Linux Başlatılıyor..."
echo "==================================================="
npm install && npm run dev
