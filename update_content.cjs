const fs = require('fs');

const file = 'src/utils/localFileSystem.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/content: "@echo off[\\s\\S]*?pause"/, 'content: "ArchWeb OS Installer Executable (Windows x64). Lutfen bu dosyayi Windows ortaminda cift tiklayarak calistirin."');

fs.writeFileSync(file, code);

const serverFile = 'server.ts';
let serverCode = fs.readFileSync(serverFile, 'utf8');

serverCode = serverCode.replace(/content: "@echo off[\\s\\S]*?pause"/, 'content: "ArchWeb OS Installer Executable (Windows x64). Lutfen bu dosyayi Windows ortaminda cift tiklayarak calistirin."');

fs.writeFileSync(serverFile, serverCode);
