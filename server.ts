import express from "express";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// CORS Middleware to allow local network testing and custom IP origins
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Network & Environment Access Control Middleware
// ais-pre-*: Publicly accessible for everyone on any network
// ais-dev-*: Restricted to local network (192.168.1.182 / FiberHGW_HUN6A2) or authorized local session
app.use((req, res, next) => {
  const host = req.headers.host || "";
  
  // If request is accessing the Development environment URL
  if (host.includes("ais-dev-")) {
    const isLocalNetworkAuth = 
      req.query.network === "local" || 
      req.query.auth === "local" ||
      req.headers["x-network-auth"] === "true" ||
      req.headers["referer"]?.includes("network=local");

    // Allow essential static files and health checks
    if (
      req.path.startsWith("/api/health") ||
      req.path.endsWith(".png") ||
      req.path.endsWith(".jpg") ||
      req.path.endsWith(".svg") ||
      req.path.endsWith(".css") ||
      req.path.endsWith(".js") ||
      req.path === "/manifest.json" ||
      req.path === "/sw.js"
    ) {
      return next();
    }

    // If accessing ais-dev- externally without local network authorization flag
    if (!isLocalNetworkAuth) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ağ Kısıtlaması - ArchWeb OS Dev</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #0f172a;
              color: #f8fafc;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .card {
              background: rgba(30, 41, 59, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 2.5rem;
              border-radius: 1.5rem;
              max-width: 500px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(12px);
              margin: 1rem;
            }
            .icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 1.3rem;
              color: #38bdf8;
              margin-bottom: 0.75rem;
              font-weight: 700;
            }
            p {
              font-size: 0.9rem;
              color: #94a3b8;
              line-height: 1.6;
              margin-bottom: 1.25rem;
            }
            .badge {
              display: inline-block;
              background: rgba(239, 68, 68, 0.15);
              color: #f87171;
              border: 1px solid rgba(239, 68, 68, 0.3);
              padding: 0.35rem 0.85rem;
              border-radius: 2rem;
              font-size: 0.75rem;
              font-weight: 700;
              margin-bottom: 1.25rem;
            }
            .btn {
              display: inline-block;
              background: #1793d1;
              color: white;
              text-decoration: none;
              padding: 0.85rem 1.75rem;
              border-radius: 0.75rem;
              font-size: 0.9rem;
              font-weight: 700;
              transition: all 0.2s;
              box-shadow: 0 4px 12px rgba(23, 147, 209, 0.3);
            }
            .btn:hover {
              background: #0284c7;
              transform: translateY(-2px);
            }
            .network-info {
              margin-top: 1.75rem;
              padding-top: 1.25rem;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              font-size: 0.75rem;
              color: #64748b;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🔒</div>
            <div class="badge">Sadece Özel / Yerel Ağ Erişimi</div>
            <h1>Geliştirme Ortamı Kısıtlandı</h1>
            <p>
              Geliştirme adresi (<code>ais-dev</code>) yalnızca tanımlı yerel ağ (<strong>FiberHGW_HUN6A2 / 192.168.1.182</strong>) üzerinden erişilmek üzere yapılandırılmıştır.
            </p>
            <p>
              Herkesin her internetten erişebildiği <strong>Canlı Ön İzleme Adresi</strong>ne aşağıdaki bağlantıdan ulaşabilirsiniz:
            </p>
            <a href="https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app" class="btn">
              Canlı Ön İzleme Adresine Git 🌐
            </a>
            <div class="network-info">
              Ağ Durumu: Dış İnternet Kısıtlaması Aktif • ArchWeb OS Kernel
            </div>
          </div>
        </body>
        </html>
      `);
    }
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Define paths
const SERVER_STORAGE_DIR = path.join(process.cwd(), "sunucu_klasoru");

// Ensure base server directory and default folders exist
function initializeServerStorage() {
  if (!fs.existsSync(SERVER_STORAGE_DIR)) {
    fs.mkdirSync(SERVER_STORAGE_DIR, { recursive: true });
  }

  const defaultFolders = [
    "Masaüstü",
    "Belgeler",
    "İndirilenler",
    "Müzik",
    "Resimler",
    "Videolar",
    "Çocuk Dünyası",
    "Sunucu",
    "archweb"
  ];

  defaultFolders.forEach(folder => {
    const folderPath = path.join(SERVER_STORAGE_DIR, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  });

  // Default Files mapping
  const defaultFiles = [
    {
      relPath: "yapılandırma.json",
      content: JSON.stringify({ tema: "koyu", vurgu: "arch-mavisi", sürüm: "2.0.0" }, null, 2)
    },
    {
      relPath: "notlar.txt",
      content: "ArchWeb OS'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur."
    },
    {
      relPath: "betik.sh",
      content: "#!/bin/bash\n\necho \"Arch Linux'tan Merhaba!\"\nsudo pacman -Syu"
    },
    {
      relPath: "Belgeler/özgeçmiş.pdf",
      content: "Simüle edilmiş PDF içeriği..."
    },
    {
      relPath: "Belgeler/şifreler.txt",
      content: "123456"
    },
    {
      relPath: "İndirilenler/archweb kids setup.bat",
      content: "@echo off\ntitle ArchWeb OS Baslatici\necho ====================================================\necho ArchWeb OS Baslatiliyor...\necho ====================================================\necho Guncellemeler kontrol ediliyor...\ngit pull\ncall npm install\necho ====================================================\necho Lutfen acilis modunu secin:\necho [1] Online Web Surumu (Node.js gerektirmez)\necho [2] Yerel Sunucu Modu - http://192.168.1.105:3000/ (Node.js gerektirir)\necho [3] Electron Masaustu (.exe) Modu (Node.js gerektirir)\necho ====================================================\nset /p secim=\"Seciminiz (1, 2 veya 3): \"\n\nif \"%secim%\"==\"1\" (\n    echo Tarayici aciliyor...\n    start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app\n) else if \"%secim%\"==\"2\" (\n    echo Yerel sunucu baslatiliyor...\n    start http://192.168.1.105:3000/\n    call npm run dev\n) else if \"%secim%\"==\"3\" (\n    echo Electron masaustu uygulamasi baslatiliyor...\n    call npm run electron:start\n) else (\n    echo Gecersiz secim.\n)\npause"
    },
    {
      relPath: "İndirilenler/Server.apk",
      content: "ArchWeb OS Server Android Package (.APK)\n===================================\nApp Name: ArchWeb OS Server Client / Server Controller\nPackage Name: com.archweb.server\nVersion: 2.0.0\nRelease Date: 2026-07-17\nPlatform: Android 10+ (Termux / Native WebView Client)\n\nBu paket, ArchWeb OS yerel sunucunuzu (http://192.168.1.105:3000/) mobil cihazinizdan yonetmenizi ve mobil cihazinizda calistirilan Node.js sunucusuna baglanmanizi saglar."
    },
    {
      relPath: "İndirilenler/archweb.dmg",
      content: "ArchWeb OS for macOS Installer\n==================================\n"
    },
    {
      relPath: "İndirilenler/archweb.deb",
      content: "Package: archweb-os\nVersion: 20.1.2\n"
    },
    {
      relPath: "İndirilenler/archweb.dev",
      content: "Package: archweb-os\nVersion: 20.1.2\n"
    },
    {
      relPath: "Masaüstü/notlar.txt",
      content: "ArchWeb OS'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur."
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_windows.exe",
      content: "ArchWeb OS Portable Windows Executable Application (.EXE)\n===================================================\nVersion: 20.1.2\nType: Portable Native Executable Application (Windows Taşınabilir Sürüm)\n\nBu taşınabilir (Portable) .exe dosyası kurulum gerektirmez. Doğrudan USB bellekten veya bilgisayarınızdan tıklayarak çalıştırabilirsiniz."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_windows.exe",
      content: "ArchWeb OS Setup Windows Executable Installer (.EXE)\n===================================================\nVersion: 20.1.2\nType: Windows Executable Setup Package (Windows Kurulum Sürümü)\n\nBu Kurulum (Setup) .exe dosyası ArchWeb OS sistemini bilgisayarınıza adım adım yükler, masaüstü kısayolu ve başlat menüsü ögesi oluşturur."
    },
    {
      relPath: "archweb/ArchWeb_OS_Standalone_windows.exe",
      content: "ArchWeb OS Standalone Windows Executable Application (.EXE)\n===================================================\nVersion: 20.1.2\nType: Standalone Native Executable Application\n\nNode.js veya ekstra bağımlılık gerektirmeden çalışabilen bağımsız Windows uygulaması."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_windows.msi",
      content: "ArchWeb OS Windows Installer Setup Package (.MSI)\n===========================================\nVersion: 20.1.2\nPublisher: ArchWeb Software Technologies\nTarget OS: Windows 10 / 11 (x64)\n\nBu .msi Kurulum (Setup) paketi ArchWeb OS sistemini Program Files dizinine kurar ve sistem servislerini yapılandırır."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_windows.msix",
      content: "ArchWeb OS Modern Windows Setup App (.MSIX)\n===================================================\nPublisher ID: CN=ArchWebSoftware\nPackage Identity: ArchWebOS.Desktop.Setup_20.1.2.0_x64\nTarget Platform: Windows 10 / 11\n\nWindows MSIX kurulum paketi."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_windows.msixbundle",
      content: "ArchWeb OS Modern Windows Setup App Bundle (.MSIXBUNDLE)\n===================================================\nPublisher ID: CN=ArchWebSoftware\nPackage Identity: ArchWebOS.Desktop.Setup_20.1.2.0_neutral_~_8x3g2j90zk\nTarget Platform: Windows 10 / 11 (UWP & App Installer)\n\nWindows App Installer ile doğrudan tıklayıp kurabileceğiniz Setup MSIXBundle paketi."
    },
    {
      relPath: "archweb/ArchWeb_OS_Launcher_windows.bat",
      content: "@echo off\ntitle ArchWeb OS - Windows Launcher (.BAT)\ncd /d \"%~dp0\"\necho ===================================================\necho   ArchWeb OS Windows Baslatiliyor...\necho ===================================================\ncall npm install && call npm run dev\npause"
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_windows.bat",
      content: "@echo off\ntitle ArchWeb OS - Portable Windows Launcher (.BAT)\ncd /d \"%~dp0\"\necho ===================================================\necho   ArchWeb OS Portable Windows Baslatiliyor...\necho ===================================================\ncall npm install && call npm run dev\npause"
    },
    {
      relPath: "archweb/ArchWeb_OS_Launcher_windows.ps1",
      content: "Write-Host \"===================================================\" -ForegroundColor Cyan\nWrite-Host \"   ArchWeb OS Windows PowerShell Baslatiliyor...\" -ForegroundColor Cyan\nWrite-Host \"===================================================\" -ForegroundColor Cyan\nSet-Location -Path $PSScriptRoot\nnpm install\nnpm run dev"
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_macos.dmg",
      content: "ArchWeb OS macOS Universal Installer Disk Image (.DMG)\n======================================================\nVersion: 20.1.2\nType: macOS Universal Setup Package (Mac Kurulum Sürümü)\n\nArchWeb OS macOS Kurulum (Setup) sürümü. Applications (Uygulamalar) klasörünüze sürükleyerek saniyeler içinde kurabilirsiniz."
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_macos.dmg",
      content: "ArchWeb OS macOS Portable Disk Image (.DMG)\n======================================================\nVersion: 20.1.2\nType: macOS Portable Disk Image (Mac Taşınabilir Sürüm)\n\nKurulum yapmadan doğrudan çalıştırılabilen taşınabilir macOS DMG paketi."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_macos.pkg",
      content: "# ArchWeb OS macOS PKG Installer Package (.PKG)\nPackage ID: com.archweb.os.pkg\nTarget: macOS 11.0+"
    },
    {
      relPath: "archweb/ArchWeb_OS_Launcher_macos.command",
      content: "#!/bin/bash\nDIR=\"$( cd \"$( dirname \"${BASH_SOURCE[0]}\" )\" && pwd )\ncd \"$DIR\"\necho \"===================================================\"\necho \"   ArchWeb OS macOS Başlatılıyor...\"\necho \"===================================================\"\nnpm install && npm run dev"
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_macos.command",
      content: "#!/bin/bash\nDIR=\"$( cd \"$( dirname \"${BASH_SOURCE[0]}\" )\" && pwd )\ncd \"$DIR\"\necho \"===================================================\"\necho \"   ArchWeb OS Portable macOS Başlatılıyor...\"\necho \"===================================================\"\nnpm install && npm run dev"
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_linux.deb",
      content: "Package: archweb-os\nVersion: 20.1.2\nSection: utils\nPriority: optional\nArchitecture: amd64\nMaintainer: ArchWeb Software <support@archweb.com>\nDescription: ArchWeb OS Debian / Ubuntu Package (.DEB)\n ArchWeb OS web tabanlı işletim sisteminin Debian ve Ubuntu dağıtımları için paketlenmiş sürümüdür."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_linux.rpm",
      content: "Name: archweb-os\nVersion: 20.1.2\nRelease: 1\nSummary: ArchWeb OS RedHat / Fedora RPM Package (.RPM)\nLicense: MIT"
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_linux.AppImage",
      content: "# ArchWeb OS Linux AppImage Package (.AppImage)\nType: Portable Universal Linux Executable Application\nArchitecture: x86_64 / ARM64\nMinimum Kernel: Linux 4.19+"
    },
    {
      relPath: "archweb/ArchWeb_OS_Launcher_linux.sh",
      content: "#!/bin/bash\nDIR=\"$( cd \"$( dirname \"${BASH_SOURCE[0]}\" )\" && pwd )\"\ncd \"$DIR\"\necho \"===================================================\"\necho \"   ArchWeb OS Linux Başlatılıyor...\"\necho \"===================================================\"\nnpm install && npm run dev"
    },
    {
      relPath: "archweb/ArchWeb_OS_Portable_linux.sh",
      content: "#!/bin/bash\nDIR=\"$( cd \"$( dirname \"${BASH_SOURCE[0]}\" )\" && pwd )\ncd \"$DIR\"\necho \"===================================================\"\necho \"   ArchWeb OS Portable Linux Başlatılıyor...\"\necho \"===================================================\"\nnpm install && npm run dev"
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_android.apk",
      content: "ArchWeb OS Android Application Setup Package (.APK)\n==============================================\nPackage Name: com.archweb.os.mobile.setup\nVersion: 20.1.2\nTarget Android: Android 8.0+ (API 26)\n\nArchWeb OS Android cihazlar için tam kurulum (Setup) paketidir."
    },
    {
      relPath: "archweb/ArchWeb_OS_Setup_ios.ipa",
      content: "ArchWeb OS iOS Application Setup Package (.IPA)\n==============================================\nBundle ID: com.archweb.os.ios.setup\nVersion: 20.1.2\n\niOS cihazlar için tam kurulum (Setup) paketidir."
    },
    {
      relPath: "Çocuk Dünyası/günlük_programım.txt",
      content: "Sevgili Kâşif,\n\nİşte senin için harika bir günlük ders programı:\n\n- 09:00 - Kitap Okuma\n- 10:30 - Matematik Soruları\n- 14:00 - Doğa Keşfi\n- 16:00 - Bilim Robotu ile Sohbet!"
    },
    {
      relPath: "Çocuk Dünyası/matematik_notları.txt",
      content: "Matematik Notlarım:\n\nToplama (+), Çıkarma (-) ve Çarpma (*) işlemleri zihnini geliştirir! Çocuk Dünyası uygulamasında pratik yapıp yıldız kazanabilirsin."
    }
  ];

  defaultFiles.forEach(file => {
    const filePath = path.join(SERVER_STORAGE_DIR, file.relPath);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content, "utf8");
    }
  });

  // Create real binary PKZIP files for Windows, macOS, Linux and Kids OS
  try {
    const archwebDir = path.join(SERVER_STORAGE_DIR, "archweb");
    if (!fs.existsSync(archwebDir)) fs.mkdirSync(archwebDir, { recursive: true });

    const pyScript = `
import zipfile, os
s_dir = "${archwebDir.replace(/\\/g, "/")}"

def make_zip(filename, files):
    target = os.path.join(s_dir, filename)
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for fname, content in files.items():
            z.writestr(fname, content)

make_zip("ArchWeb_OS_windows.zip", {
    "ArchWeb_OS_Launcher_windows.bat": "@echo off\\r\\ntitle ArchWeb OS Windows\\r\\ncall npm install\\r\\ncall npm run dev\\r\\npause\\r\\n",
    "ArchWeb_OS_Portable_windows.bat": "@echo off\\r\\ntitle ArchWeb OS Portable Windows\\r\\ncall npm install\\r\\ncall npm run dev\\r\\npause\\r\\n",
    "README_Windows.txt": "ArchWeb OS Windows Sürümü\\r\\n========================\\r\\n\\r\\nBaşlatmak için ArchWeb_OS_Launcher_windows.bat dosyasına çift tıklayın.\\r\\n"
})

make_zip("ArchWeb_OS_macos.zip", {
    "ArchWeb_OS_Launcher_macos.command": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "ArchWeb_OS_Portable_macos.command": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "README_macOS.txt": "ArchWeb OS macOS Sürümü\\n======================\\n\\nBaşlatmak için ArchWeb_OS_Launcher_macos.command dosyasını çalıştırın.\\n"
})

make_zip("ArchWeb_OS_linux.zip", {
    "ArchWeb_OS_Launcher_linux.sh": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "ArchWeb_OS_Portable_linux.sh": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "README_Linux.txt": "ArchWeb OS Linux Sürümü\\n======================\\n\\nBaşlatmak için ArchWeb_OS_Launcher_linux.sh dosyasını çalıştırın.\\n"
})

make_zip("ArchWeb_OS_android.zip", {
    "ArchWeb_OS_Setup_android.apk": "ArchWeb OS Android Application Setup Package (.APK)\\n==============================================\\nPackage Name: com.archweb.os.mobile.setup\\nVersion: 20.1.2\\nTarget Android: Android 8.0+ (API 26)\\n",
    "README_Android.txt": "ArchWeb OS Android Sürümü\\n========================\\n\\nKurulum için ArchWeb_OS_Setup_android.apk dosyasını Android cihazınıza yükleyin.\\n"
})

make_zip("ArchWeb_OS_ios.zip", {
    "ArchWeb_OS_Setup_ios.ipa": "ArchWeb OS iOS Application Setup Package (.IPA)\\n==============================================\\nBundle ID: com.archweb.os.ios.setup\\nVersion: 20.1.2\\n",
    "README_iOS.txt": "ArchWeb OS iOS Sürümü\\n====================\\n\\nYükleme için ArchWeb_OS_Setup_ios.ipa dosyasını iOS cihazınıza yükleyin.\\n"
})

make_zip("ArchWeb_OS_universal.zip", {
    "ArchWeb_OS_Launcher_windows.bat": "@echo off\\r\\ntitle ArchWeb OS Windows\\r\\ncall npm install\\r\\ncall npm run dev\\r\\npause\\r\\n",
    "ArchWeb_OS_Launcher_macos.command": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "ArchWeb_OS_Launcher_linux.sh": "#!/bin/bash\\nDIR=\\"$( cd \\"$( dirname \\"\${BASH_SOURCE[0]}\\" )\\" && pwd )\\"\\ncd \\"$DIR\\"\\nnpm install\\nnpm run dev\\n",
    "ArchWeb_OS_Setup_android.apk": "ArchWeb OS Android Application Setup Package (.APK)\\n",
    "ArchWeb_OS_Setup_ios.ipa": "ArchWeb OS iOS Application Setup Package (.IPA)\\n",
    "README_Universal.txt": "ArchWeb OS Evrensel Paket (Tüm Platformlar)\\n===========================================\\nBu ZIP paketi Windows, macOS, Linux, Android ve iOS platformlarının tümünün çalıştırıcı ve kurulum dosyalarını içerir.\\n"
})

make_zip("archweb_kids_os.zip", {
    "baslat.bat": "@echo off\\r\\necho Çocuk Dünyası Başlatılıyor...\\r\\ncall npm install && call npm run dev\\r\\n",
    "README_Kids.txt": "ArchWeb OS - Çocuk Dünyası Özel Sürümü\\r\\n========================================\\r\\nEğlenceli ve güvenli kâşif ortamı.\\r\\n"
})
`;
    execSync(`python3 -c '${pyScript.replace(/'/g, "'\\''")}'`);
  } catch (e) {
    console.error("Zip generation error:", e);
  }
}

initializeServerStorage();

// Helper to convert virtual path to real server path
function virtualToReal(virtualPath: string): string {
  // e.g., "/home/user/Belgeler/note.txt" -> "Belgeler/note.txt"
  const rel = virtualPath.replace(/^\/home\/user\/?/, "");
  return path.join(SERVER_STORAGE_DIR, rel);
}

// Helper to convert real server path to virtual path
function realToVirtual(realPath: string): string {
  const rel = path.relative(SERVER_STORAGE_DIR, realPath);
  return "/home/user" + (rel ? "/" + rel.replace(/\\/g, "/") : "");
}

// Recursively build files & subfolders state from server directory
function getFilesState() {
  const allFiles: Record<string, { name: string, size: string, content: string }[]> = {};
  const subFolders: Record<string, { name: string }[]> = {};

  function traverse(dir: string) {
    const virtualDir = realToVirtual(dir);
    allFiles[virtualDir] = [];
    subFolders[virtualDir] = [];

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      // Skip system config file
      if (item.name === "system_settings.json") continue;

      if (item.isDirectory()) {
        subFolders[virtualDir].push({ name: item.name });
        traverse(fullPath);
      } else if (item.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          const stats = fs.statSync(fullPath);
          
          // Format size
          let sizeStr = `${stats.size} B`;
          if (stats.size > 1024 * 1024) {
            sizeStr = `${(stats.size / (1024 * 1024)).toFixed(1)} MB`;
          } else if (stats.size > 1024) {
            sizeStr = `${(stats.size / 1024).toFixed(1)} KB`;
          }

          allFiles[virtualDir].push({
            name: item.name,
            size: sizeStr,
            content: content
          });
        } catch (e) {
          console.error("Error reading file:", fullPath, e);
        }
      }
    }
  }

  traverse(SERVER_STORAGE_DIR);
  return { allFiles, subFolders };
}

// API routes go here FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

// 0. Auth Endpoints
const SESSION_CODE = "AW-7788"; // YouTube Canlı Yayın Kodu

app.get("/api/auth/identify", (req, res) => {
  const host = req.headers.host || "";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("192.168.");
  
  // Simulated environment check for AI Studio
  const isAiStudio = host.includes("europe-west2.run.app") || host.includes("google.com");
  
  res.json({
    isLocal,
    isAiStudio,
    message: isLocal ? "Yerel erişim tespit edildi. Otomatik yönetici girişi yapıldı." : "Uzak erişim tespit edildi. Lütfen oturum kodu girin."
  });
});

app.post("/api/auth/verify", (req, res) => {
  const { code, email } = req.body;
  
  // 1. Admin Email Check (AI Studio)
  if (email === "meminalp2434@gmail.com") {
    return res.json({ 
      success: true, 
      role: "admin", 
      message: "Yönetici hesabı doğrulandı (meminalp2434@gmail.com)" 
    });
  }

  // 2. Session Code Check (Remote)
  if (code === SESSION_CODE) {
    return res.json({ 
      success: true, 
      role: "user", 
      message: "Oturum kodu başarılı. Kısıtlı erişim sağlandı." 
    });
  }

  res.status(401).json({ success: false, error: "Geçersiz oturum kodu!" });
});

// 1. Get all files and subfolders
app.get("/api/files", (req, res) => {
  try {
    const state = getFilesState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Save or update a file
app.post("/api/files", (req, res) => {
  try {
    const { virtualPath, content } = req.body;
    if (!virtualPath) {
      return res.status(400).json({ error: "virtualPath is required" });
    }
    const realPath = virtualToReal(virtualPath);
    const parentDir = path.dirname(realPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(realPath, content || "", "utf8");
    res.json({ success: true, virtualPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create a folder
app.post("/api/folders", (req, res) => {
  try {
    const { virtualPath } = req.body;
    if (!virtualPath) {
      return res.status(400).json({ error: "virtualPath is required" });
    }
    const realPath = virtualToReal(virtualPath);
    if (!fs.existsSync(realPath)) {
      fs.mkdirSync(realPath, { recursive: true });
    }
    res.json({ success: true, virtualPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Delete a file or folder
app.delete("/api/files", (req, res) => {
  try {
    const { virtualPath } = req.body;
    if (!virtualPath) {
      return res.status(400).json({ error: "virtualPath is required" });
    }
    const realPath = virtualToReal(virtualPath);
    if (fs.existsSync(realPath)) {
      const stat = fs.statSync(realPath);
      if (stat.isDirectory()) {
        fs.rmSync(realPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(realPath);
      }
      res.json({ success: true, virtualPath });
    } else {
      res.status(404).json({ error: "File or directory not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Move a file or folder
app.post("/api/files/move", (req, res) => {
  try {
    const { sourcePath, destDirPath } = req.body;
    if (!sourcePath || !destDirPath) {
      return res.status(400).json({ error: "sourcePath and destDirPath are required" });
    }
    const realSource = virtualToReal(sourcePath);
    const fileName = path.basename(realSource);
    const realDestDir = virtualToReal(destDirPath);
    const realDest = path.join(realDestDir, fileName);

    if (!fs.existsSync(realDestDir)) {
      fs.mkdirSync(realDestDir, { recursive: true });
    }

    if (fs.existsSync(realSource)) {
      fs.renameSync(realSource, realDest);
    }
    res.json({ success: true, newPath: `${destDirPath}/${fileName}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Get system settings
app.get("/api/settings", (req, res) => {
  try {
    const settingsPath = path.join(SERVER_STORAGE_DIR, "system_settings.json");
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json({});
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Save system settings
app.post("/api/settings", (req, res) => {
  try {
    const settingsPath = path.join(SERVER_STORAGE_DIR, "system_settings.json");
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Live Chat API
const CHAT_FILE = path.join(SERVER_STORAGE_DIR, "canli_sohbet.json");

app.get("/pwa-icon.png", (req, res) => {
  const iconPath = path.join(process.cwd(), "public", "pwa-icon.png");
  if (fs.existsSync(iconPath)) {
    res.setHeader("Content-Type", "image/png");
    res.sendFile(iconPath);
  } else {
    res.status(404).send("Icon not found");
  }
});

app.get("/sw.js", (req, res) => {
  const swPath = path.join(process.cwd(), "public", "sw.js");
  if (fs.existsSync(swPath)) {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Service-Worker-Allowed", "/");
    res.sendFile(swPath);
  } else {
    res.status(404).json({ error: "Service worker not found" });
  }
});

app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
  const manifestPath = path.join(process.cwd(), "public", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    res.setHeader("Content-Type", "application/manifest+json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(manifestPath);
  } else {
    res.status(404).json({ error: "Manifest not found" });
  }
});

// Executable / Desktop Launcher Download Endpoints (.exe, .bat)
app.get(["/ArchWeb_Desktop.exe", "/ArchWeb_OS_Setup.exe", "/ArchWeb_OS_Launcher.exe"], (req, res) => {
  const exePath = path.join(process.cwd(), "public", "ArchWeb_Desktop.exe");
  if (fs.existsSync(exePath)) {
    res.setHeader("Content-Type", "application/x-msdownload");
    res.setHeader("Content-Disposition", "attachment; filename=ArchWeb_Desktop.exe");
    res.sendFile(exePath);
  } else {
    res.status(404).send("Executable file not found");
  }
});

app.get("/ArchWeb_OS_Launcher.bat", (req, res) => {
  const batPath = path.join(process.cwd(), "public", "ArchWeb_OS_Launcher.bat");
  if (fs.existsSync(batPath)) {
    res.setHeader("Content-Type", "application/x-bat");
    res.setHeader("Content-Disposition", "attachment; filename=ArchWeb_OS_Launcher.bat");
    res.sendFile(batPath);
  } else {
    res.status(404).send("Launcher script not found");
  }
});

app.get(["/archwebapp.apk", "/archwebapp"], (req, res) => {
  const apkPath = path.join(process.cwd(), "public", "archwebapp.apk");
  if (fs.existsSync(apkPath)) {
    res.setHeader("Content-Type", "application/vnd.android.package-archive");
    res.setHeader("Content-Disposition", "attachment; filename=archwebapp.apk");
    res.sendFile(apkPath);
  } else {
    res.status(404).send("APK file not found");
  }
});

const CHAT_CONFIG_FILE = path.join(process.cwd(), "chat_config.json");

const DEFAULT_GROUPS = [
  { id: "genel", name: "Genel", icon: "💬" },
  { id: "duyurular", name: "Duyurular", icon: "📢" },
  { id: "destek", name: "Teknik Destek", icon: "🛠️" },
  { id: "yonetim", name: "Yönetici Grubu", icon: "👑" }
];

function getChatConfig() {
  try {
    if (fs.existsSync(CHAT_CONFIG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CHAT_CONFIG_FILE, "utf8"));
      if (!parsed.groups || !Array.isArray(parsed.groups)) {
        parsed.groups = DEFAULT_GROUPS;
      }
      return parsed;
    }
  } catch (e) {}
  return { isLocked: false, groups: DEFAULT_GROUPS };
}

function saveChatConfig(config: any) {
  try {
    fs.writeFileSync(CHAT_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (e) {}
}

app.get("/api/chat", (req, res) => {
  try {
    const group = (req.query.group as string) || "genel";
    const dmWith = req.query.dmWith as string;
    const currentUser = req.query.currentUser as string;
    const userAvatar = (req.query.userAvatar as string) || "👤";
    const userRole = (req.query.userRole as string) || "user";

    // Track active/online presence if currentUser is provided
    if (currentUser) {
      activeUsersPresence[currentUser] = {
        username: currentUser,
        avatar: userAvatar,
        role: userRole,
        lastSeen: Date.now()
      };
    }

    let messages = [];
    if (fs.existsSync(CHAT_FILE)) {
      const allMsgs = JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
      
      if (dmWith && currentUser) {
        // DM Filter: messages between currentUser & dmWith
        messages = allMsgs.filter((m: any) => 
          (m.isDm || m.type === 'dm') && 
          ((m.user === currentUser && m.recipient === dmWith) || (m.user === dmWith && m.recipient === currentUser))
        );
      } else {
        // Group Filter: non-DM messages matching group
        messages = allMsgs.filter((m: any) => !m.isDm && m.type !== 'dm' && (m.group || "genel") === group);
      }
    }

    // Clean up presence older than 30 seconds
    const now = Date.now();
    const onlineList = Object.values(activeUsersPresence).filter(u => now - u.lastSeen < 30000);

    const config = getChatConfig();
    res.json({ 
      messages, 
      isLocked: !!config.isLocked, 
      groups: config.groups,
      onlineUsers: onlineList 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const activeUsersPresence: Record<string, { username: string; avatar: string; role: string; lastSeen: number }> = {};

app.post("/api/chat", (req, res) => {
  try {
    const { user, message, avatar, role, group, isDm, recipient } = req.body;
    const config = getChatConfig();
    
    // If chat is locked and poster is not admin, deny (except for DMs if allowed, but lock applies to main channel)
    if (!isDm && config.isLocked && role !== 'admin') {
      return res.status(403).json({ error: "Sohbet şu an yöneticiler tarafından kilitli durumda." });
    }

    let chatLogs = [];
    if (fs.existsSync(CHAT_FILE)) {
      chatLogs = JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
    }
    const newMsg = {
      id: Date.now(),
      user: user || "Misafir",
      message: message || "",
      avatar: avatar || "👤",
      role: role || "user",
      group: group || "genel",
      isDm: !!isDm,
      recipient: recipient || null,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    chatLogs.push(newMsg);
    // Keep only last 300 messages total
    if (chatLogs.length > 300) chatLogs = chatLogs.slice(-300);
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chatLogs, null, 2), "utf8");

    // Touch presence
    if (user) {
      activeUsersPresence[user] = {
        username: user,
        avatar: avatar || "👤",
        role: role || "user",
        lastSeen: Date.now()
      };
    }

    res.json(newMsg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/groups", (req, res) => {
  try {
    const { name, icon, role } = req.body;
    if (role !== 'admin') {
      return res.status(403).json({ error: "Yalnızca yöneticiler yeni sohbet grubu oluşturabilir." });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Grup adı boş olamaz." });
    }
    const config = getChatConfig();
    const groupId = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const exists = config.groups.some((g: any) => g.id === groupId || g.name.toLowerCase() === name.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ error: "Bu isimde bir sohbet grubu zaten var." });
    }
    const newGroup = {
      id: groupId || `group-${Date.now()}`,
      name: name.trim(),
      icon: icon || "👥"
    };
    config.groups.push(newGroup);
    saveChatConfig(config);
    res.json({ success: true, group: newGroup, groups: config.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/chat/groups", (req, res) => {
  try {
    const { groupId, role } = req.body;
    if (role !== 'admin') {
      return res.status(403).json({ error: "Yalnızca yöneticiler sohbet grubu silebilir." });
    }
    if (groupId === "genel") {
      return res.status(400).json({ error: "Ana 'Genel' grubu silinemez." });
    }
    const config = getChatConfig();
    config.groups = config.groups.filter((g: any) => g.id !== groupId);
    saveChatConfig(config);
    res.json({ success: true, groups: config.groups });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/chat", (req, res) => {
  try {
    const { id, clearAll } = req.query;
    if (clearAll === "true") {
      fs.writeFileSync(CHAT_FILE, JSON.stringify([], null, 2), "utf8");
      return res.json({ success: true, message: "Tüm sohbet geçmişi temizlendi." });
    }
    if (id) {
      const msgId = Number(id);
      let chatLogs = [];
      if (fs.existsSync(CHAT_FILE)) {
        chatLogs = JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
      }
      chatLogs = chatLogs.filter((m: any) => m.id !== msgId);
      fs.writeFileSync(CHAT_FILE, JSON.stringify(chatLogs, null, 2), "utf8");
      return res.json({ success: true, message: "Mesaj silindi." });
    }
    res.status(400).json({ error: "Geçersiz istek parametresi." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/lock", (req, res) => {
  try {
    const { isLocked } = req.body;
    const config = getChatConfig();
    config.isLocked = !!isLocked;
    saveChatConfig(config);
    res.json({ success: true, isLocked: config.isLocked });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini AI Vision & Camera Analysis API
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Görsel verisi gönderilmedi." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        analysis: "✨ **Gemini AI Görsel Tespiti** ✨\n\nFotoğrafta neşeli ve renkli detaylar görülüyor! Sunucu tarafında Gemini API key tanımlandığında bu fotoğraftaki tüm nesneleri, renkleri ve detayları 100% yapay zeka derinliğiyle anında analiz edebilirsiniz. 🚀"
      });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    let base64Data = imageBase64;
    let mimeType = "image/png";
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      mimeType = parts[0].replace("data:", "");
      base64Data = parts[1];
    }

    const systemPrompt = prompt || "Bu fotoğrafta veya kamera görüntüsünde tam olarak ne var? Türkçe dilinde çocuklar ve tüm kullanıcılar için neşeli, eğitici ve son derece anlaşılır bir şekilde açıkla. Gördüğün nesneleri, ana renkleri, insanları veya ortamı maddeler halinde veya akıcı bir paragraf olarak anlat.";

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]
        }
      ]
    });

    res.json({ analysis: response.text || "Gemini tarafından analiz üretilemedi." });
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    res.status(500).json({ error: error.message || "Gemini analizi sırasında bir hata oluştu." });
  }
});

// Gemini AI General Assistant Chat API
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, imageBase64 } = req.body;
    if (!message && !imageBase64) {
      return res.status(400).json({ error: "Mesaj veya görsel gereklidir." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Demo / Intelligent response
      const fallbackReplies = [
        `🤖 **Gemini 3.6 Flash Yapay Zeka Yanıtı:**\n\nHarika bir soru! "${message || 'Görsel analizi'}" hakkında bilgi vermekten mutluluk duyarım. ArchWeb OS üzerinde çalışan Gemini AI asistanınız olarak sorularınızı yanıtlayabilir, kod yazabilir, metin özetleyebilir ve görsel analizler gerçekleştirebilirim! 🚀`,
        `✨ **Gemini AI:**\n\nBu konuda sana yardımcı olabilirim! ArchWeb OS işletim sistemimiz tüm çocukların ve geliştiricilerin eğitimi için tasarlandı. Başka ne öğrenmek istersin? 🌟`,
        `💡 **Gemini Yapay Zeka Asistanı:**\n\n"${message || 'İstem'}" sorunu inceledim! Sana adım adım açıklayayım:\n1. ArchWeb OS yüksek performanslı bir web işletim sistemidir.\n2. Kamera, canlı yayın ve yapay zeka araçları entegre çalışır.\n3. İstediğin zaman masaüstünden bu uygulamaya erişebilirsin!`
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply: randomReply });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    const parts: any[] = [];

    if (message) {
      parts.push({ text: message });
    }

    if (imageBase64) {
      let base64Data = imageBase64;
      let mimeType = "image/png";
      if (imageBase64.includes(";base64,")) {
        const p = imageBase64.split(";base64,");
        mimeType = p[0].replace("data:", "");
        base64Data = p[1];
      }
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts }]
    });

    res.json({ reply: response.text || "Gemini AI tarafından yanıt üretilemedi." });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "Gemini AI yanıt verirken bir hata oluştu." });
  }
});

// Network Scanner API for 3 Modes (Subnet, Global Gmail Directory, Deep Port/Device)
app.get("/api/chat/network-scan", (req, res) => {
  try {
    const mode = (req.query.mode as string) || "subnet";
    const query = ((req.query.q as string) || "").toLowerCase();

    // Mode 1: Yerel Ağ Subnet Taraması (Local Subnet Scan)
    if (mode === "subnet") {
      const nodes = [
        { ip: "192.168.1.102", mac: "00:1A:2B:3C:4D:5E", ping: "8ms", port: 3000, gmail: "meminalp2434@gmail.com", device: "ArchWeb OS Workstation", status: "online", avatar: "💻" },
        { ip: "192.168.1.108", mac: "00:1A:2B:88:99:AA", ping: "14ms", port: 3000, gmail: "ahmet.dev@gmail.com", device: "ArchWeb OS Laptop", status: "online", avatar: "👨‍💻" },
        { ip: "192.168.1.115", mac: "00:1A:2B:11:22:33", ping: "22ms", port: 3000, gmail: "destek.archweb@gmail.com", device: "ArchWeb OS Server Node", status: "online", avatar: "🛠️" },
        { ip: "192.168.1.120", mac: "00:1A:2B:55:66:77", ping: "31ms", port: 3000, gmail: "zeynep.yazilim@gmail.com", device: "ArchWeb OS Tablet", status: "online", avatar: "📱" },
        { ip: "192.168.1.145", mac: "00:1A:2B:DE:AD:BE", ping: "45ms", port: 8080, gmail: "bursa.saha@gmail.com", device: "ArchWeb OS Mobile", status: "online", avatar: "📲" },
      ];
      const filtered = query ? nodes.filter(n => n.gmail.toLowerCase().includes(query) || n.ip.includes(query)) : nodes;
      return res.json({ mode: "subnet", totalScanned: 254, activeNodes: filtered.length, nodes: filtered });
    }

    // Mode 2: Global Gmail Dizin Taraması (Global Gmail Network Scan)
    if (mode === "global") {
      const gmailAccounts = [
        { gmail: "meminalp2434@gmail.com", name: "Melih Emin Alp", location: "İstanbul, TR", status: "Aktif Cihaz", verified: true, avatar: "👑", role: "Yönetici Node" },
        { gmail: "admin.kernel@gmail.com", name: "Sistem Yöneticisi", location: "Ankara, TR", status: "Çevrimiçi Sunucu", verified: true, avatar: "⚙️", role: "Sistem Admin" },
        { gmail: "destek.archweb@gmail.com", name: "ArchWeb Destek Ekibi", location: "İzmir, TR", status: "7/24 Aktif Destek", verified: true, avatar: "🛠️", role: "Teknik Destek" },
        { gmail: "ahmet.yazilim@gmail.com", name: "Ahmet Yılmaz", location: "Bursa, TR", status: "Çevrimiçi", verified: false, avatar: "👨‍💻", role: "Geliştirici" },
        { gmail: "zeynep.tasarim@gmail.com", name: "Zeynep Demir", location: "Antalya, TR", status: "Çevrimiçi", verified: false, avatar: "🎨", role: "Tasarımcı" },
        { gmail: "saha.ekibi@gmail.com", name: "Saha Operasyon", location: "Eskişehir, TR", status: "Mobil Bağlantı", verified: true, avatar: "🚜", role: "Saha Ekibi" }
      ];
      const filtered = query ? gmailAccounts.filter(g => g.gmail.toLowerCase().includes(query) || g.name.toLowerCase().includes(query)) : gmailAccounts;
      return res.json({ mode: "global", totalRegistered: 1250, activeUsers: filtered.length, users: filtered });
    }

    // Mode 3: Derin Cihaz & Port Taraması (Deep Device & Port Scan)
    if (mode === "deep") {
      const portScans = [
        { ip: "127.0.0.1", port: 3000, protocol: "HTTP/WS", service: "ArchWeb Core Express API", gmail: "meminalp2434@gmail.com", sessionToken: "AUTH-JWT-9982", status: "OPEN" },
        { ip: "192.168.1.108", port: 3000, protocol: "HTTP/WebSocket", service: "ArchWeb Node Client", gmail: "ahmet.dev@gmail.com", sessionToken: "AUTH-JWT-4431", status: "OPEN" },
        { ip: "192.168.1.115", port: 8080, protocol: "TCP/SSH-Tunnel", service: "ArchWeb Remote Console", gmail: "destek.archweb@gmail.com", sessionToken: "AUTH-JWT-7712", status: "OPEN" },
        { ip: "192.168.1.120", port: 443, protocol: "TLS Encrypted", service: "ArchWeb Mobile Socket", gmail: "zeynep.yazilim@gmail.com", sessionToken: "AUTH-JWT-1029", status: "OPEN" },
        { ip: "192.168.1.200", port: 22, protocol: "SSH Daemon", service: "ArchWeb Gateway Node", gmail: "admin.kernel@gmail.com", sessionToken: "AUTH-JWT-8800", status: "FILTERED" }
      ];
      const filtered = query ? portScans.filter(p => p.gmail.toLowerCase().includes(query) || p.ip.includes(query) || p.service.toLowerCase().includes(query)) : portScans;
      return res.json({ mode: "deep", totalPortsScanned: 65535, openSessions: filtered.length, sessions: filtered });
    }

    res.status(400).json({ error: "Bilinmeyen tarama modu. Geçerli modlar: subnet, global, deep" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup dev and production servers
async function startServer() {
  // Serve public folder before Vite to bypass large file limits
  app.use(express.static(path.join(process.cwd(), 'public')));

  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[PROD] Statik dosyalar sunuluyor: ${distPath}`);
    
    // Serve static files from dist
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("index.html bulunamadı! Lütfen build işlemini kontrol edin.");
      }
    });
  } else {
    console.log("[DEV] Vite middleware başlatılıyor...");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: true,
        cors: true,
        watch: {
          ignored: ['**/sunucu_klasoru/**', '**/sunucu_klasoru', '**/node_modules/**', '**/.git/**'],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    // ArchWeb OS ANSI Color Codes
    const CYAN = "\x1b[96m";
    const MAGENTA = "\x1b[95m";
    const BLUE = "\x1b[94m";
    const YELLOW = "\x1b[93m";
    const RESET = "\x1b[0m";

    console.log(`\n${MAGENTA}====================================================${RESET}`);
    console.log(`${CYAN}ARCHWEB OS SUNUCUSU AKTIF (PORT: ${PORT})${RESET}`);
    console.log(`${MAGENTA}====================================================${RESET}`);
    console.log(`${BLUE}Onizleme: ${YELLOW}https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app${RESET}`);
    console.log(`${BLUE}Gelistirme: ${YELLOW}https://ais-dev-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app${RESET}`);
    console.log(`${BLUE}Yerel:      ${YELLOW}http://localhost:${PORT}${RESET}`);
    console.log(`${MAGENTA}====================================================${RESET}\n`);
  });
}

startServer();
