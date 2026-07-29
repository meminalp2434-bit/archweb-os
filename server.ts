import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.get("/api/chat", (req, res) => {
  try {
    if (fs.existsSync(CHAT_FILE)) {
      const data = fs.readFileSync(CHAT_FILE, "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", (req, res) => {
  try {
    const { user, message, avatar } = req.body;
    let chatLogs = [];
    if (fs.existsSync(CHAT_FILE)) {
      chatLogs = JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
    }
    const newMsg = {
      id: Date.now(),
      user: user || "Misafir",
      message: message || "",
      avatar: avatar || "👤",
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    chatLogs.push(newMsg);
    // Keep only last 100 messages
    if (chatLogs.length > 100) chatLogs = chatLogs.slice(-100);
    fs.writeFileSync(CHAT_FILE, JSON.stringify(chatLogs, null, 2), "utf8");
    res.json(newMsg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
      server: { middlewareMode: true, host: true, cors: true },
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
