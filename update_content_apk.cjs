const fs = require('fs');
const file = 'src/components/ApkInstaller.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/exe: `@echo off[\\s\\S]*?pause\\n`,/, 'exe: `ArchWeb OS Installer Executable (Windows x64). Lutfen bu dosyayi Windows ortaminda cift tiklayarak calistirin.\\n`,');

fs.writeFileSync(file, code);
