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
      { name: "archinstall.apk", size: "2.4 MB", content: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    package=\"com.archweb.os\"\n    android:versionCode=\"20102\"\n    android:versionName=\"20.1.2\">\n\n    <uses-permission android:name=\"android.permission.INTERNET\" />\n    <uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />\n\n    <application\n        android:label=\"ArchWeb OS\"\n        android:icon=\"@mipmap/ic_launcher\"\n        android:theme=\"@style/Theme.ArchWeb.NoActionBar\">\n        <activity android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>" },
      { name: "archweb.ipa", size: "3.8 MB", content: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n    <key>CFBundleIdentifier</key>\n    <string>com.archweb.os.ios</string>\n    <key>CFBundleDisplayName</key>\n    <string>ArchWeb OS</string>\n    <key>CFBundleShortVersionString</key>\n    <string>20.1.2</string>\n    <key>CodeSigningIdentity</key>\n    <string>Apple Development: Signed Distribution (ArchWeb OS Team)</string>\n</dict>\n</plist>" },
      { name: "ArchWeb_Desktop.exe", size: "4.2 KB", content: "#include <iostream>\n#include <windows.h>\n#include <string>\n\nint main() {\n    SetConsoleTitleA(\"ArchWeb OS - Desktop Core v20.1.2\");\n    \n    std::cout << \"========================================\" << std::endl;\n    std::cout << \"       ARCHWEB OS - DESKTOP CORE        \" << std::endl;\n    std::cout << \"========================================\" << std::endl;\n    std::cout << \"[SYSTEM] C++ Native Kernel baslatiliyor...\" << std::endl;\n    \n    // Sunucu kontrolu ve baslatma simülasyonu\n    std::cout << \"[INFO] Port 3000 kontrol ediliyor...\" << std::endl;\n    Sleep(1000);\n    \n    std::cout << \"[INFO] Yerel sunucu adresi: http://localhost:3000\" << std::endl;\n    std::cout << \"[SYSTEM] Arayuz motoru yukleniyor...\" << std::endl;\n    \n    // Node.js uzerinden sistemi baslat\n    system(\"npm run dev\");\n\n    return 0;\n}" },
      { name: "ArchWeb_OS_Launcher.bat", size: "1.2 KB", content: "@echo off\n:: ArchWeb Native Bridge\nif exist \"ArchWeb_Desktop.exe\" (\n    echo [BILGI] C++ Native Core baslatiliyor...\n    start ArchWeb_Desktop.exe\n) else (\n    color 0C\n    echo [HATA] Native Core bulunamadi! Manuel baslatiliyor...\n    call npm run dev\n)" },
      { name: "archweb_system.zip", size: "15 MB", content: "ARCHWEB_SYSTEM_RECOVERY_PACKAGE_V20_1_2\n\nBu dosya bagimsiz sistem kurtarma ve cevrimdisi destek varliklarini iceren bir pakettir." },
      { name: "archweb_v20_chromebook.iso", size: "2.4 GB", content: "ARCHWEB OS ISO IMAGE\nVersion: 20.1.2\nEdition: Chromebook Edition\nBuild: Beta Test Stage" },
      { name: "Server.apk", size: "1.2 KB", content: "package com.archweb.server;\n\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        // ArchWeb Server Native Kernel Initialization\n        this.getBridge().getWebView().getSettings().setDomStorageEnabled(true);\n    }\n}" },
      { name: "archweb.dmg", size: "45 B", content: "ArchWeb OS for macOS Installer\n==================================\n" },
      { name: "archweb.deb", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" },
      { name: "archweb.dev", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" }
    ],
    "/archweb": [
      { name: "archweb_v20_chromebook.iso", size: "2.4 GB", content: "ARCHWEB OS ISO IMAGE\nEdition: Chromebook Edition" }
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
