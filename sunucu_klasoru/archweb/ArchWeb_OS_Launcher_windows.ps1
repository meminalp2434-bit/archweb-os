Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   ArchWeb OS Windows PowerShell Baslatiliyor..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot
npm install
npm run dev
