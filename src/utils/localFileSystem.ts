// Local Virtual File System & Settings Fallback Database

export interface FileItem {
  name: string;
  size: string;
  content: string;
}

export interface FolderItem {
  name: string;
}

export interface VirtualFilesState {
  allFiles: Record<string, FileItem[]>;
  subFolders: Record<string, FolderItem[]>;
}

const DEFAULT_SETTINGS = {
  accentColor: "#1793d1",
  wallpaper: 0,
  volume: 70,
  isMuted: false,
  startupSoundEnabled: true,
  isSetupComplete: true,
  gmailUser: "",
  gmailPassword: "",
  loginMethod: "none",
  kidCategory: "education",
  kidAvatar: "panda",
  pinRequired: false,
  pinCode: "",
  mobileMode: false,
  brightness: 100,
  firewallActive: true,
};

const getInitialFilesState = (): VirtualFilesState => {
  const allFiles: Record<string, FileItem[]> = {
    "/home/user": [
      { name: "yapılandırma.json", size: "65 B", content: JSON.stringify({ tema: "koyu", vurgu: "arch-mavisi", sürüm: "2.0.0" }, null, 2) },
      { name: "notlar.txt", size: "86 B", content: "ArchWeb OS'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur." },
      { name: "betik.sh", size: "53 B", content: "#!/bin/bash\n\necho \"Arch Linux'tan Merhaba!\"\nsudo pacman -Syu" }
    ],
    "/home/user/Masaüstü": [
      { name: "notlar.txt", size: "86 B", content: "ArchWeb OS'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur." }
    ],
    "/home/user/Belgeler": [
      { name: "özgeçmiş.pdf", size: "29 B", content: "Simüle edilmiş PDF içeriği..." },
      { name: "şifreler.txt", size: "6 B", content: "123456" }
    ],
    "/home/user/İndirilenler": [
      { name: "archweb kids setup.bat", size: "645 B", content: "@echo off\ntitle ArchWeb OS Baslatici\necho ====================================================\necho ArchWeb OS Baslatiliyor...\necho ====================================================\necho Guncellemeler kontrol ediliyor...\ngit pull\ncall npm install\necho ====================================================\necho Lutfen acilis modunu secin:\necho [1] Online Web Surumu (Node.js gerektirmez)\necho [2] Yerel Sunucu Modu - http://192.168.1.105:3000/ (Node.js gerektirir)\necho [3] Electron Masaustu (.exe) Modu (Node.js gerektirir)\necho ====================================================\nset /p secim=\"Seciminiz (1, 2 veya 3): \"\n\nif \"%secim%\"==\"1\" (\n    echo Tarayici aciliyor...\n    start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app\n) else if \"%secim%\"==\"2\" (\n    echo Yerel sunucu baslatiliyor...\n    start http://192.168.1.105:3000/\n    call npm run dev\n) else if \"%secim%\"==\"3\" (\n    echo Electron masaustu uygulamasi baslatiliyor...\n    call npm run electron:start\n) else (\n    echo Gecersiz secim.\n)\npause" },
      { name: "Server.apk", size: "435 B", content: "ArchWeb OS Server Android Package (.APK)\n===================================\nApp Name: ArchWeb OS Server Client / Server Controller\nPackage Name: com.archweb.server\nVersion: 2.0.0\nRelease Date: 2026-07-17\nPlatform: Android 10+ (Termux / Native WebView Client)\n\nBu paket, ArchWeb OS yerel sunucunuzu (http://192.168.1.105:3000/) mobil cihazinizdan yonetmenizi ve mobil cihazinizda calistirilan Node.js sunucusuna baglanmanizi saglar." },
      { name: "archweb.dmg", size: "45 B", content: "ArchWeb OS for macOS Installer\n==================================\n" },
      { name: "archweb.deb", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" },
      { name: "archweb.dev", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" }
    ],
    "/home/user/Müzik": [],
    "/home/user/Resimler": [],
    "/home/user/Videolar": [],
    "/home/user/Çocuk Dünyası": [
      { name: "günlük_programım.txt", size: "172 B", content: "Sevgili Kâşif,\n\nİşte senin için harika bir günlük ders programı:\n\n- 09:00 - Kitap Okuma\n- 10:30 - Matematik Soruları\n- 14:00 - Doğa Keşfi\n- 16:00 - Bilim Robotu ile Sohbet!" },
      { name: "matematik_notları.txt", size: "155 B", content: "Matematik Notlarım:\n\nToplama (+), Çıkarma (-) ve Çarpma (*) işlemleri zihnini geliştirir! Çocuk Dünyası uygulamasında pratik yapıp yıldız kazanabilirsin." }
    ]
  };

  const subFolders: Record<string, FolderItem[]> = {
    "/home/user": [
      { name: "Masaüstü" },
      { name: "Belgeler" },
      { name: "İndirilenler" },
      { name: "Müzik" },
      { name: "Resimler" },
      { name: "Videolar" },
      { name: "Çocuk Dünyası" }
    ],
    "/home/user/Masaüstü": [],
    "/home/user/Belgeler": [],
    "/home/user/İndirilenler": [],
    "/home/user/Müzik": [],
    "/home/user/Resimler": [],
    "/home/user/Videolar": [],
    "/home/user/Çocuk Dünyası": []
  };

  return { allFiles, subFolders };
};

// 1. Get offline files state
export const getOfflineFilesState = (): VirtualFilesState => {
  try {
    const data = localStorage.getItem("archweb_virtual_files");
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to parse virtual files from localStorage:", e);
  }
  const initialState = getInitialFilesState();
  saveOfflineFilesState(initialState);
  return initialState;
};

// 2. Save entire offline files state
export const saveOfflineFilesState = (state: VirtualFilesState): void => {
  try {
    localStorage.setItem("archweb_virtual_files", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save virtual files to localStorage:", e);
  }
};

// 3. Save / Update single offline file
export const saveOfflineFile = (virtualPath: string, content: string): void => {
  const state = getOfflineFilesState();
  const index = virtualPath.lastIndexOf("/");
  if (index === -1) return;

  const parentDir = virtualPath.substring(0, index);
  const fileName = virtualPath.substring(index + 1);

  if (!state.allFiles[parentDir]) {
    state.allFiles[parentDir] = [];
  }

  const existingFileIndex = state.allFiles[parentDir].findIndex(f => f.name === fileName);
  const sizeStr = `${content.length} B`;

  if (existingFileIndex > -1) {
    state.allFiles[parentDir][existingFileIndex].content = content;
    state.allFiles[parentDir][existingFileIndex].size = sizeStr;
  } else {
    state.allFiles[parentDir].push({
      name: fileName,
      size: sizeStr,
      content: content
    });
  }

  saveOfflineFilesState(state);
};

// 4. Create single offline folder
export const createOfflineFolder = (virtualPath: string): void => {
  const state = getOfflineFilesState();
  const index = virtualPath.lastIndexOf("/");
  if (index === -1) return;

  const parentDir = virtualPath.substring(0, index);
  const folderName = virtualPath.substring(index + 1);

  if (!state.subFolders[parentDir]) {
    state.subFolders[parentDir] = [];
  }

  const exists = state.subFolders[parentDir].some(f => f.name === folderName);
  if (!exists) {
    state.subFolders[parentDir].push({ name: folderName });
  }

  if (!state.allFiles[virtualPath]) {
    state.allFiles[virtualPath] = [];
  }
  if (!state.subFolders[virtualPath]) {
    state.subFolders[virtualPath] = [];
  }

  saveOfflineFilesState(state);
};

// 5. Delete offline file or folder
export const deleteOfflineItem = (virtualPath: string): void => {
  const state = getOfflineFilesState();
  const index = virtualPath.lastIndexOf("/");
  if (index === -1) return;

  const parentDir = virtualPath.substring(0, index);
  const itemName = virtualPath.substring(index + 1);

  // Check files
  if (state.allFiles[parentDir]) {
    state.allFiles[parentDir] = state.allFiles[parentDir].filter(f => f.name !== itemName);
  }

  // Check folders
  if (state.subFolders[parentDir]) {
    state.subFolders[parentDir] = state.subFolders[parentDir].filter(f => f.name !== itemName);
  }

  // Remove self directories recursively
  delete state.allFiles[virtualPath];
  delete state.subFolders[virtualPath];

  // Also remove nested subdirectories of deleted folder
  Object.keys(state.allFiles).forEach(key => {
    if (key.startsWith(virtualPath + "/")) {
      delete state.allFiles[key];
    }
  });
  Object.keys(state.subFolders).forEach(key => {
    if (key.startsWith(virtualPath + "/")) {
      delete state.subFolders[key];
    }
  });

  saveOfflineFilesState(state);
};

// 6. Get offline settings
export const getOfflineSettings = () => {
  try {
    const data = localStorage.getItem("archweb_virtual_settings");
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error("Failed to parse virtual settings:", e);
  }
  return DEFAULT_SETTINGS;
};

// 7. Save offline settings
export const saveOfflineSettings = (settings: any): void => {
  try {
    localStorage.setItem("archweb_virtual_settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save virtual settings:", e);
  }
};
