const fs = require('fs');

const file = 'src/utils/localFileSystem.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /{ name: "archweb kids setup.bat", size: "241 KB", content: "ArchWeb OS Installer Executable \(Windows x64\)\. Lutfen bu dosyayi Windows ortaminda cift tiklayarak calistirin." },/,
  '{ name: "archweb kids setup.bat", size: "1 KB", content: "@echo off\\ntitle ArchWeb OS Baslatici\\necho ====================================================\\necho ArchWeb OS Baslatiliyor...\\necho ====================================================\\necho Guncellemeler kontrol ediliyor...\\ngit pull\\ncall npm install\\necho ====================================================\\necho Lutfen acilis modunu secin:\\necho [1] Online Web Surumu (Node.js gerektirmez)\\necho [2] Yerel Sunucu Modu - http://localhost:3000/ (Node.js gerektirir)\\necho [3] Electron Masaustu Modu (Node.js gerektirir)\\necho ====================================================\\nset /p secim=\\"Seciminiz (1, 2 veya 3): \\"\\n\\nif \\"%secim%\\"==\\"1\\" (\\n    echo Tarayici aciliyor...\\n    start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app\\n) else if \\"%secim%\\"==\\"2\\" (\\n    echo Yerel sunucu baslatiliyor...\\n    start http://localhost:3000/\\n    call npm run dev\\n) else if \\"%secim%\\"==\\"3\\" (\\n    echo Electron masaustu uygulamasi baslatiliyor...\\n    call npm run electron:start\\n) else (\\n    echo Gecersiz secim.\\n)\\npause" },'
);

fs.writeFileSync(file, code);
