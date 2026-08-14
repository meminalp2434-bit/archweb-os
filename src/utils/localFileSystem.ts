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
      { name: "archwebapp.apk", size: "3.2 MB", content: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    package=\"com.archweb.app\"\n    android:versionCode=\"20102\"\n    android:versionName=\"20.1.2\">\n\n    <uses-permission android:name=\"android.permission.INTERNET\" />\n    <uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />\n    <uses-permission android:name=\"android.permission.ACCESS_WIFI_STATE\" />\n\n    <application\n        android:label=\"archwebapp\"\n        android:icon=\"@mipmap/ic_launcher\"\n        android:theme=\"@style/Theme.ArchWeb.NoActionBar\">\n        <activity android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n\npackage com.archweb.app;\nimport com.getcapacitor.BridgeActivity;\npublic class MainActivity extends BridgeActivity {}" },
      { name: "archinstall.apk", size: "2.4 MB", content: "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"\n    package=\"com.archweb.os\"\n    android:versionCode=\"20102\"\n    android:versionName=\"20.1.2\">\n\n    <uses-permission android:name=\"android.permission.INTERNET\" />\n    <uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />\n\n    <application\n        android:label=\"ArchWeb OS\"\n        android:icon=\"@mipmap/ic_launcher\"\n        android:theme=\"@style/Theme.ArchWeb.NoActionBar\">\n        <activity android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>" },
      { name: "archweb.ipa", size: "3.8 MB", content: "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n    <key>CFBundleIdentifier</key>\n    <string>com.archweb.os.ios</string>\n    <key>CFBundleDisplayName</key>\n    <string>ArchWeb OS</string>\n    <key>CFBundleShortVersionString</key>\n    <string>20.1.2</string>\n    <key>CodeSigningIdentity</key>\n    <string>Apple Development: Signed Distribution (ArchWeb OS Team)</string>\n</dict>\n</plist>" },
      { name: "ArchWeb_Desktop.exe", size: "4.2 KB", content: "#include <iostream>\n#include <windows.h>\n#include <string>\n\nint main() {\n    SetConsoleTitleA(\"ArchWeb OS - Desktop Core v20.1.2\");\n    \n    std::cout << \"========================================\" << std::endl;\n    std::cout << \"       ARCHWEB OS - DESKTOP CORE        \" << std::endl;\n    std::cout << \"       Yapimci: Emin Alp                \" << std::endl;\n    std::cout << \"========================================\" << std::endl;\n    std::cout << \"[SYSTEM] C++ Native Kernel baslatiliyor...\" << std::endl;\n    \n    // Sunucu kontrolu ve baslatma simülasyonu\n    std::cout << \"[INFO] Port 3000 kontrol ediliyor...\" << std::endl;\n    Sleep(1000);\n    \n    std::cout << \"[INFO] Yerel sunucu adresi: http://localhost:3000\" << std::endl;\n    std::cout << \"[SYSTEM] Arayuz motoru yukleniyor...\" << std::endl;\n    \n    // Node.js uzerinden sistemi baslat\n    system(\"npm run dev\");\n\n    return 0;\n}" },
      { name: "ArchWeb_OS_Launcher.bat", size: "1.2 KB", content: "@echo off\n:: ArchWeb Native Bridge\nif exist \"ArchWeb_Desktop.exe\" (\n    echo [BILGI] C++ Native Core baslatiliyor...\n    start ArchWeb_Desktop.exe\n) else (\n    color 0C\n    echo [HATA] Native Core bulunamadi! Manuel baslatiliyor...\n    call npm run dev\n)" },
      { name: "archweb_system.zip", size: "15 MB", content: "ARCHWEB_SYSTEM_RECOVERY_PACKAGE_V20_1_2\n\nBu dosya bagimsiz sistem kurtarma ve cevrimdisi destek varliklarini iceren bir pakettir." },
      { name: "archweb_system.rar", size: "14 MB", content: "ARCHWEB_SYSTEM_RECOVERY_PACKAGE_V20_1_2\n\nBu dosya RAR formatinda bagimsiz sistem kurtarma paketidir." },
      { name: "archweb_system.7z", size: "11 MB", content: "ARCHWEB_SYSTEM_RECOVERY_PACKAGE_V20_1_2\n\nBu dosya 7-Zip (7z) formatinda yüksek sıkıştırmalı sistem kurtarma paketidir." },
      { name: "archweb_v20_chromebook.iso", size: "2.4 GB", content: "ARCHWEB OS ISO IMAGE\nVersion: 20.1.2\nEdition: Chromebook Edition\nBuild: Beta Test Stage" },
      { name: "Server.apk", size: "1.2 KB", content: "package com.archweb.server;\n\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        // ArchWeb Server Native Kernel Initialization\n        this.getBridge().getWebView().getSettings().setDomStorageEnabled(true);\n    }\n}" },
      { name: "archweb.dmg", size: "45 B", content: "ArchWeb OS for macOS Installer\n==================================\n" },
      { name: "archweb.deb", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" },
      { name: "archweb.dev", size: "38 B", content: "Package: archweb-os\nVersion: 20.1.2\n" }
    ],
    "/archweb": [
      { name: "ArchWeb_OS_Portable_windows.exe", size: "4.2 MB", content: "ArchWeb OS Portable Windows Executable Application (.EXE)\n===================================================\nVersion: 20.1.2\nType: Portable Native Executable Application (Windows Taşınabilir Sürüm)\n\nBu taşınabilir (Portable) .exe dosyası kurulum gerektirmez. Doğrudan USB bellekten veya bilgisayarınızdan tıklayarak çalıştırabilirsiniz." },
      { name: "ArchWeb_OS_Setup_windows.exe", size: "4.8 MB", content: "ArchWeb OS Setup Windows Executable Installer (.EXE)\n===================================================\nVersion: 20.1.2\nType: Windows Executable Setup Package (Windows Kurulum Sürümü)\n\nBu Kurulum (Setup) .exe dosyası ArchWeb OS sistemini bilgisayarınıza yükler." },
      { name: "ArchWeb_OS_Standalone_windows.exe", size: "4.2 MB", content: "ArchWeb OS Standalone Windows Executable Application (.EXE)" },
      { name: "ArchWeb_OS_Setup_windows.msi", size: "8.5 MB", content: "ArchWeb OS Windows Installer Setup Package (.MSI)\n===========================================\nVersion: 20.1.2\nPublisher: ArchWeb Software Technologies" },
      { name: "ArchWeb_OS_Setup_windows.msix", size: "7.9 MB", content: "ArchWeb OS Windows App Package (.MSIX)" },
      { name: "ArchWeb_OS_Setup_windows.msixbundle", size: "9.2 MB", content: "ArchWeb OS Modern Windows Setup App Bundle (.MSIXBUNDLE)" },
      { name: "ArchWeb_OS_Launcher_windows.bat", size: "1.2 KB", content: "ArchWeb OS Windows Launcher Script (.BAT)" },
      { name: "ArchWeb_OS_Portable_windows.bat", size: "1.2 KB", content: "ArchWeb OS Portable Windows Launcher Script (.BAT)" },
      { name: "ArchWeb_OS_Launcher_windows.ps1", size: "1.4 KB", content: "ArchWeb OS Windows PowerShell Script (.PS1)" },
      { name: "ArchWeb_OS_Setup_macos.dmg", size: "12.4 MB", content: "ArchWeb OS macOS Universal Installer Disk Image (.DMG)" },
      { name: "ArchWeb_OS_Portable_macos.dmg", size: "11.8 MB", content: "ArchWeb OS macOS Portable Disk Image (.DMG)" },
      { name: "ArchWeb_OS_Setup_macos.pkg", size: "12.8 MB", content: "ArchWeb OS macOS PKG Installer Package (.PKG)" },
      { name: "ArchWeb_OS_Launcher_macos.command", size: "1.5 KB", content: "ArchWeb OS macOS Script (.COMMAND)" },
      { name: "ArchWeb_OS_Portable_macos.command", size: "1.5 KB", content: "ArchWeb OS Portable macOS Script (.COMMAND)" },
      { name: "ArchWeb_OS_Setup_linux.deb", size: "5.4 MB", content: "ArchWeb OS Debian / Ubuntu Package (.DEB)" },
      { name: "ArchWeb_OS_Setup_linux.rpm", size: "5.8 MB", content: "ArchWeb OS RedHat / Fedora RPM Package (.RPM)" },
      { name: "ArchWeb_OS_Portable_linux.AppImage", size: "14.2 MB", content: "ArchWeb OS Linux AppImage Package (.AppImage)" },
      { name: "ArchWeb_OS_Launcher_linux.sh", size: "1.1 KB", content: "ArchWeb OS Linux Launcher Shell Script (.SH)" },
      { name: "ArchWeb_OS_Portable_linux.sh", size: "1.1 KB", content: "ArchWeb OS Portable Linux Shell Script (.SH)" },
      { name: "ArchWeb_OS_Setup_android.apk", size: "6.8 MB", content: "ArchWeb OS Android Application Setup Package (.APK)" },
      { name: "ArchWeb_OS_Setup_ios.ipa", size: "10.2 MB", content: "ArchWeb OS iOS Application Setup Package (.IPA)" },
      { name: "ArchWeb_OS_windows.zip", size: "12.4 MB", content: "ArchWeb OS Windows Complete Zip Package (.ZIP)" },
      { name: "ArchWeb_OS_macos.zip", size: "11.2 MB", content: "ArchWeb OS macOS Complete Zip Package (.ZIP)" },
      { name: "ArchWeb_OS_linux.zip", size: "10.8 MB", content: "ArchWeb OS Linux Complete Zip Package (.ZIP)" },
      { name: "ArchWeb_OS_android.zip", size: "7.2 MB", content: "ArchWeb OS Android Complete Zip Package (.ZIP)" },
      { name: "ArchWeb_OS_ios.zip", size: "10.5 MB", content: "ArchWeb OS iOS Complete Zip Package (.ZIP)" },
      { name: "ArchWeb_OS_universal.zip", size: "28.5 MB", content: "ArchWeb OS Universal Zip Package for All Platforms (Windows, macOS, Linux, Android, iOS)" },
      { name: "archweb_kids_os.zip", size: "15.0 MB", content: "ArchWeb for Kids OS Source Code & Package ZIP" }
    ],
    "/archweb/com.archwebos.tr": [
      {
        name: "base.apk",
        size: "12.8 MB",
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.archwebos.tr"
    android:versionCode="20102"
    android:versionName="20.1.2">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:label="ArchWeb OS (Base APK)"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.ArchWeb.NoActionBar">
        <activity android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`
      },
      {
        name: "AndroidManifest.xml",
        size: "1.2 KB",
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.archwebos.tr"
    android:versionCode="20102"
    android:versionName="20.1.2">
    <application android:label="ArchWeb Operatif System" android:icon="@mipmap/ic_launcher" />
</manifest>`
      },
      {
        name: "config.json",
        size: "340 B",
        content: JSON.stringify({
          app_id: "com.archwebos.tr",
          app_name: "ArchWeb Operatif System",
          base_apk: "base.apk",
          version: "20.1.2",
          author: "Emin Alp",
          target_sdk: 34
        }, null, 2)
      }
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
    "/home/user/Çocuk Dünyası": [],
    "/archweb": [
      { name: "com.archwebos.tr" }
    ],
    "/archweb/com.archwebos.tr": []
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

// Helper to trim state if localStorage quota is reached
const trimStateForStorage = (state: VirtualFilesState, maxContentLength: number): VirtualFilesState => {
  const trimmedFiles: Record<string, FileItem[]> = {};
  for (const dir in state.allFiles) {
    trimmedFiles[dir] = state.allFiles[dir].map(file => {
      if (file.content && file.content.length > maxContentLength) {
        if (file.content.startsWith('data:')) {
          const header = file.content.substring(0, file.content.indexOf(',') + 1);
          return {
            ...file,
            content: `${header}[İçerik Sunucuda / Cihazda Kayıtlı - Boyut: ${file.size}]`
          };
        } else {
          return {
            ...file,
            content: file.content.substring(0, maxContentLength) + `\n\n...[İçerik kısaltıldı - Boyut: ${file.size}]`
          };
        }
      }
      return file;
    });
  }
  return {
    allFiles: trimmedFiles,
    subFolders: state.subFolders
  };
};

// 2. Save entire offline files state safely without exceeding localStorage quota
export const saveOfflineFilesState = (state: VirtualFilesState): void => {
  try {
    localStorage.setItem("archweb_virtual_files", JSON.stringify(state));
  } catch {
    try {
      // First fallback: trim file content over 15KB for localStorage cache
      const trimmed = trimStateForStorage(state, 15000);
      localStorage.setItem("archweb_virtual_files", JSON.stringify(trimmed));
    } catch {
      try {
        // Second fallback: trim file content over 1KB
        const trimmedAggressively = trimStateForStorage(state, 1000);
        localStorage.setItem("archweb_virtual_files", JSON.stringify(trimmedAggressively));
      } catch {
        try {
          // Third fallback: store minimal file metadata only
          const metadataOnly = trimStateForStorage(state, 100);
          localStorage.setItem("archweb_virtual_files", JSON.stringify(metadataOnly));
        } catch {
          // Ignored if browser storage quota is completely full or restricted
        }
      }
    }
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

// Move offline file or folder to new directory
export const moveOfflineItem = (sourceVirtualPath: string, destDirVirtualPath: string): boolean => {
  const state = getOfflineFilesState();
  
  if (sourceVirtualPath === destDirVirtualPath || sourceVirtualPath.startsWith(destDirVirtualPath + "/")) {
    return false; // Cannot move directory into itself
  }

  const lastIndex = sourceVirtualPath.lastIndexOf("/");
  if (lastIndex === -1) return false;

  const oldParentDir = sourceVirtualPath.substring(0, lastIndex);
  const itemName = sourceVirtualPath.substring(lastIndex + 1);

  if (!state.allFiles[destDirVirtualPath]) state.allFiles[destDirVirtualPath] = [];
  if (!state.subFolders[destDirVirtualPath]) state.subFolders[destDirVirtualPath] = [];

  // Is it a file?
  const fileIndex = state.allFiles[oldParentDir]?.findIndex(f => f.name === itemName);
  if (fileIndex !== undefined && fileIndex > -1) {
    const fileObj = state.allFiles[oldParentDir][fileIndex];
    state.allFiles[oldParentDir].splice(fileIndex, 1);
    
    const existingInDest = state.allFiles[destDirVirtualPath].findIndex(f => f.name === itemName);
    if (existingInDest > -1) {
      state.allFiles[destDirVirtualPath][existingInDest] = fileObj;
    } else {
      state.allFiles[destDirVirtualPath].push(fileObj);
    }

    saveOfflineFilesState(state);
    return true;
  }

  // Is it a folder?
  const folderIndex = state.subFolders[oldParentDir]?.findIndex(f => f.name === itemName);
  if (folderIndex !== undefined && folderIndex > -1) {
    const folderObj = state.subFolders[oldParentDir][folderIndex];
    state.subFolders[oldParentDir].splice(folderIndex, 1);

    const existingInDestFolder = state.subFolders[destDirVirtualPath].some(f => f.name === itemName);
    if (!existingInDestFolder) {
      state.subFolders[destDirVirtualPath].push(folderObj);
    }

    const newVirtualPath = `${destDirVirtualPath}/${itemName}`;

    const updateKeys = (oldPrefix: string, newPrefix: string) => {
      Object.keys(state.allFiles).forEach(key => {
        if (key === oldPrefix || key.startsWith(oldPrefix + "/")) {
          const suffix = key.substring(oldPrefix.length);
          const newKey = newPrefix + suffix;
          state.allFiles[newKey] = state.allFiles[key];
          if (key !== newKey) delete state.allFiles[key];
        }
      });
      Object.keys(state.subFolders).forEach(key => {
        if (key === oldPrefix || key.startsWith(oldPrefix + "/")) {
          const suffix = key.substring(oldPrefix.length);
          const newKey = newPrefix + suffix;
          state.subFolders[newKey] = state.subFolders[key];
          if (key !== newKey) delete state.subFolders[key];
        }
      });
    };

    updateKeys(sourceVirtualPath, newVirtualPath);

    saveOfflineFilesState(state);
    return true;
  }

  return false;
};

// Get list of all available virtual directories
export const getAllOfflineDirectories = (): string[] => {
  const state = getOfflineFilesState();
  const dirs = new Set<string>([
    '/home/user', 
    '/home/user/Masaüstü', 
    '/home/user/Belgeler', 
    '/home/user/İndirilenler', 
    '/home/user/Müzik', 
    '/home/user/Resimler', 
    '/home/user/Videolar', 
    '/home/user/Çocuk Dünyası', 
    '/archweb',
    '/archweb/com.archwebos.tr'
  ]);
  
  Object.keys(state.subFolders).forEach(path => {
    if (path) dirs.add(path);
  });
  Object.keys(state.allFiles).forEach(path => {
    if (path) dirs.add(path);
  });

  return Array.from(dirs).sort();
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
  } catch {
    // Ignored if storage quota exceeded or restricted
  }
};
