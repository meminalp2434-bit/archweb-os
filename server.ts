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
    console.log(`${BLUE}Erisim: ${YELLOW}http://localhost:${PORT}${RESET}`);
    console.log(`${BLUE}Ag:     ${YELLOW}http://192.168.1.105:${PORT}${RESET}`);
    console.log(`${MAGENTA}====================================================${RESET}\n`);
  });
}

startServer();
