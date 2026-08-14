import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Chrome, Share2, AppWindow, Package, Download, CheckCircle2, ArrowDownToLine, Monitor, Smartphone, Terminal, Cpu, Apple, Info, HelpCircle } from 'lucide-react';
import { playWindows11StartupSound } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';

interface ApkInstallerProps {
  onClose: () => void;
}

export const ApkInstaller: React.FC<ApkInstallerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'tv' | null>(null);

  const [canInstallPWA, setCanInstallPWA] = useState(!!(window as any).deferredPrompt);

  useEffect(() => {
    const handlePromptAvailable = () => {
      setCanInstallPWA(true);
    };
    window.addEventListener('pwa-install-prompt-available', handlePromptAvailable);
    return () => {
      window.removeEventListener('pwa-install-prompt-available', handlePromptAvailable);
    };
  }, []);

  const handleInstallPWA = async () => {
    const promptEvent = (window as any).deferredPrompt;
    if (!promptEvent) {
      alert("Yerel kurulum adımları şu an aktif değil veya uygulama bu cihazda zaten yüklü durumda.\n\nEğer kurulu değilse, tarayıcınızın menüsünden (sağ üstteki üç nokta veya paylaş butonu) 'Uygulamayı yükle' ya da 'Ana ekrana ekle' seçeneğini kullanarak uygulamayı telefonunuza / bilgisayarınıza saniyeler içinde kurabilirsiniz!");
      return;
    }
    try {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      (window as any).deferredPrompt = null;
      setCanInstallPWA(false);
    } catch (err) {
      console.error("Installation prompt failed:", err);
    }
  };

  const handleDownloadFile = (fileType: 'archwebapp_apk' | 'apk' | 'ipa' | 'exe' | 'bat' | 'dmg' | 'deb' | 'dev' | 'server_apk' | 'zip' | 'rar' | '7z' | 'iso') => {
    if (downloadingFile) return;
    setDownloadingFile(fileType);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingFile(null);
            setDownloadedFiles(prev => ({ ...prev, [fileType]: true }));
            
            const savedVolume = localStorage.getItem('archweb_volume');
            const volume = savedVolume !== null ? parseInt(savedVolume) : 80;
            const savedMuted = localStorage.getItem('archweb_muted');
            const isMuted = savedMuted !== null ? savedMuted === 'true' : false;
            playWindows11StartupSound(volume, isMuted, true);

            const fileContentsMap: Record<string, string> = {
              archwebapp_apk: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.archweb.app"\n    android:versionCode="20102"\n    android:versionName="20.1.2">\n\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n\n    <application\n        android:label="archwebapp"\n        android:icon="@mipmap/ic_launcher"\n        android:theme="@style/Theme.ArchWeb.NoActionBar">\n        <activity android:name=".MainActivity"\n            android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n\npackage com.archweb.app;\nimport com.getcapacitor.BridgeActivity;\npublic class MainActivity extends BridgeActivity {}`,
              apk: `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.archwebos.tr"\n    android:versionCode="20102"\n    android:versionName="20.1.2">\n\n    <uses-permission android:name="android.permission.INTERNET" />\n    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />\n\n    <application\n        android:label="ArchWeb Operatif System"\n        android:icon="@mipmap/ic_launcher"\n        android:theme="@style/Theme.ArchWeb.NoActionBar">\n        \n        <activity android:name=".MainActivity"\n            android:exported="true"\n            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>\n\n/* ARCHWEB OPERATIF SYSTEM - BASE APK DATA PACKAGE (com.archwebos.tr) */\npackage com.archwebos.tr;\nimport com.getcapacitor.BridgeActivity;\npublic class MainActivity extends BridgeActivity {}`,
              ipa: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n    <key>CFBundleIdentifier</key>\n    <string>com.archweb.os.ios</string>\n    <key>CFBundleDisplayName</key>\n    <string>ArchWeb OS</string>\n    <key>CFBundleShortVersionString</key>\n    <string>20.1.2</string>\n    <key>CodeSigningIdentity</key>\n    <string>Apple Development: Signed Distribution (ArchWeb OS Team)</string>\n    <key>ProvisionedDevices</key>\n    <string>All Devices (Universal Ad-Hoc / Enterprise Signed)</string>\n</dict>\n</plist>`,
              server_apk: `package com.archweb.server;\n\nimport android.os.Bundle;\nimport com.getcapacitor.BridgeActivity;\n\npublic class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        super.onCreate(savedInstanceState);\n        this.getBridge().getWebView().getSettings().setDomStorageEnabled(true);\n    }\n}`,
              exe: `using System;\nusing System.Diagnostics;\nusing System.IO;\nusing System.Runtime.InteropServices;\n\nnamespace ArchWebLauncher {\n    class Program {\n        static void Main(string[] args) {\n            Console.Title = "ArchWeb OS - Desktop C# Launcher";\n            Console.ForegroundColor = ConsoleColor.Cyan;\n            Console.WriteLine("========================================");\n            Console.WriteLine("       ARCHWEB OS - DESKTOP C# CORE      ");\n            Console.WriteLine("========================================");\n            \n            if (!File.Exists("package.json")) {\n                Console.ForegroundColor = ConsoleColor.Red;\n                Console.WriteLine("[HATA] Proje kok dizininde degilsiniz!");\n                Console.ReadLine();\n                return;\n            }\n\n            Console.WriteLine("[1/2] Bagimliliklar kontrol ediliyor...");\n            if (!Directory.Exists("node_modules")) {\n                RunCommand("npm", "install");\n            }\n\n            Console.WriteLine("[2/2] Sistem baslatiliyor...");\n            RunCommand("npm", "run dev");\n        }\n\n        static void RunCommand(string cmd, string args) {\n            ProcessStartInfo psi = new ProcessStartInfo {\n                FileName = "cmd.exe",\n                Arguments = "/c " + cmd + " " + args,\n                UseShellExecute = false\n            };\n            Process.Start(psi)?.WaitForExit();\n        }\n    }\n}`,
              bat: `@echo off\ntitle ArchWeb OS - Launcher\ncd /d "%~dp0"\necho [1/2] Node.js Kontrol Ediliyor...\nwhere node >nul 2>nul\nif %errorlevel% neq 0 ( echo Node.js bulunamadi! & pause & exit )\necho [2/2] Sistem Baslatiliyor...\ncall npm install && call npm run dev\npause`,
              iso: `ARCHWEB OS ISO IMAGE\nVersion: 20.1.2\nEdition: Chromebook Edition\nBuild: Beta Test Stage\n`,
              zip: `ArchWeb OS Standalone System Package (.ZIP)\n==========================================\nVersion: 20.1.2\nType: Recovery & Offline Support\n`,
              rar: `ArchWeb OS Standalone System Package (.RAR)\n==========================================\nVersion: 20.1.2\nType: Recovery & Offline Support\n`,
              '7z': `ArchWeb OS Standalone System Package (.7Z)\n==========================================\nVersion: 20.1.2\nType: Recovery & Offline Support\n`,
              dmg: `ArchWeb OS for macOS Installer\n==================================\n`,
              deb: `Package: archweb-os\nVersion: 20.1.2\n`,
              dev: `Package: archweb-os\nVersion: 20.1.2\n`
            };

            let filename = '';
            if (fileType === 'archwebapp_apk') filename = 'archwebapp.apk';
            else if (fileType === 'apk') filename = 'base.apk';
            else if (fileType === 'ipa') filename = 'archweb.ipa';
            else if (fileType === 'server_apk') filename = 'Server.apk';
            else if (fileType === 'exe') filename = 'ArchWeb_Launcher.cs';
            else if (fileType === 'bat') filename = 'ArchWeb_OS_Launcher.bat';
            else if (fileType === 'iso') filename = 'archweb_v20_chromebook.iso';
            else if (fileType === 'zip') filename = 'archweb_system.zip';
            else if (fileType === 'rar') filename = 'archweb_system.rar';
            else if (fileType === '7z') filename = 'archweb_system.7z';
            else if (fileType === 'dmg') filename = 'archweb.dmg';
            else if (fileType === 'deb') filename = 'archweb.deb';
            else if (fileType === 'dev') filename = 'archweb.dev';

            const link = document.createElement('a');

            if (fileType === 'archwebapp_apk' || fileType === 'apk' || fileType === 'ipa' || fileType === 'server_apk' || fileType === 'zip' || fileType === 'rar' || fileType === '7z' || fileType === 'iso' || fileType === 'dmg' || fileType === 'deb') {
              link.href = '/' + filename;
            } else {
              const content = fileContentsMap[fileType] || '';
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              link.href = URL.createObjectURL(blob);
            }

            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (fileType !== 'archwebapp_apk' && fileType !== 'apk' && fileType !== 'ipa' && fileType !== 'server_apk' && fileType !== 'exe' && fileType !== 'zip' && fileType !== 'rar' && fileType !== '7z' && fileType !== 'bat' && fileType !== 'dmg' && fileType !== 'deb') {
              URL.revokeObjectURL(link.href);
            }
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 80);
  };

  return (
    <div id="installation_center" className="flex flex-col h-full w-full bg-[#0f0f13] rounded-xl overflow-hidden shadow-2xl border border-white/10 text-white font-sans select-none">
      {/* Header */}
      <div id="inst_header" className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[var(--accent)]" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/90">
            ArchWeb OS Sistem Kurulum Merkezi
          </span>
        </div>
        <button 
          id="close_inst_btn"
          onClick={onClose} 
          className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/60 hover:text-white"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {/* OS Navigation Tabs */}
      <div id="inst_tabs" className="flex items-center justify-between bg-white/5 border-b border-white/5 p-1 shrink-0">
        <div className="flex gap-1 flex-1">
          <button
            id="tab_mobile"
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mobile' 
                ? 'bg-[var(--accent)]/20 text-white border-b-2 border-[var(--accent)]' 
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Smartphone size={14} />
            Mobil (Android / iOS)
          </button>
          <button
            id="tab_desktop"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'desktop' 
                ? 'bg-[var(--accent)]/20 text-white border-b-2 border-[var(--accent)]' 
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Monitor size={14} />
            Masaüstü (Windows / macOS / Linux)
          </button>
        </div>

        <button 
          onClick={() => setShowGuide(true)}
          className="mx-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[10px] font-bold transition-all"
        >
          <HelpCircle size={14} className="text-[var(--accent)]" />
          Nasıl Kurulur?
        </button>
      </div>

      {/* Installation Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Info className="text-[var(--accent)]" />
                ArchWeb OS Kurulum Kılavuzu
              </h2>
              <button onClick={() => { setShowGuide(false); setSelectedGuide(null); }} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-8 shrink-0">
              {[
                { id: 'windows', icon: Monitor, name: 'Windows', color: 'text-blue-400' },
                { id: 'android', icon: Smartphone, name: 'Android', color: 'text-emerald-400' },
                { id: 'tv', icon: AppWindow, name: 'Google / Android TV', color: 'text-amber-400' },
                { id: 'ios', icon: Apple, name: 'iOS / iPhone', color: 'text-sky-400' },
                { id: 'mac', icon: Apple, name: 'macOS', color: 'text-white' },
                { id: 'linux', icon: Terminal, name: 'Linux', color: 'text-orange-400' },
              ].map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedGuide(plat.id as any)}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${
                    selectedGuide === plat.id 
                      ? 'bg-white/10 border-[var(--accent)] shadow-lg shadow-[var(--accent)]/20' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <plat.icon size={24} className={plat.color} />
                  <span className="text-xs font-bold text-white">{plat.name}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-white/5 border border-white/10 rounded-2xl p-6">
              {!selectedGuide ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <HelpCircle size={48} />
                  <p className="text-sm">Lütfen bilgi almak istediğiniz platformu seçin.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {selectedGuide === 'windows' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-blue-400">Windows Kurulumu</h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>ArchWeb_Launcher.cs</b> (C# Kaynak Kodu) dosyasını indirin.</p>
                        <p>2. Eğer bilgisayarınızda .NET SDK yüklüyse <code className="bg-black/50 px-2 py-1 rounded">dotnet build</code> ile derleyebilirsiniz.</p>
                        <p>3. Derleme ile uğraşmak istemiyorsanız <b>ArchWeb_OS_Launcher.bat</b> dosyasını indirin.</p>
                        <p>4. .bat dosyasını projenin ana klasörüne koyun ve çift tıklayarak çalıştırın.</p>
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[12px]">
                          <b>Not:</b> En hızlı ve sorunsuz yöntem .bat dosyasını kullanmaktır. C# sürümü profesyonel geliştiriciler için sunulmuştur.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGuide === 'tv' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-xs font-black">TCL</span>
                        <span>TCL Android TV & Google TV Kurulum Rehberi</span>
                      </h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>ArchWeb_TV_v20.apk</b> (TCL Android TV Leanback Paketi) dosyasını indirin veya USB belleğe aktarın.</p>
                        <p>2. TCL Televizyonunuzda (TCL Google TV / TCL Android TV) USB belleği takın veya TCL Safety Guard / Downloader uygulamasını açın.</p>
                        <p>3. TCL TV Ayarlar -&gt; Güvenlik & Kısıtlamalar -&gt; Bilinmeyen Kaynaklara İzin Ver seçeneğini aktifleştirip APK'yı yükleyin.</p>
                        <p>4. Kurulum sonrası TCL kumandanızdaki Home tuşuna basarak TCL Google TV ana ekranından uygulamayı çalıştırın. TCL D-Pad uzaktan kumanda ile %100 tam uyumludur.</p>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[12px] text-red-300">
                          <b>TCL İpucu:</b> Web simülasyonunda TCL TV moduna geçmek için görev çubuğundaki 📺 ikonuna tıklayabilirsiniz.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGuide === 'android' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-emerald-400">Android & Huawei (HMS) Kurulumu</h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>archinstall.apk</b> veya <b>Server.apk</b> dosyasını telefonunuza indirin.</p>
                        <p>2. Dosya yöneticisinden indirdiğiniz APK dosyasını açın.</p>
                        <p>3. "Bilinmeyen Kaynaklardan Yükle" veya "Harici Paket İzni" seçeneğini onaylayın.</p>
                        <p>4. Kurulum tamamlandığında ana ekranınızdaki ArchWeb OS ikonuna tıklayarak başlatın.</p>

                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[12px] space-y-2">
                          <b className="text-red-400 flex items-center gap-1.5">
                            <span>🔴 Huawei & AppGallery Kullanıcıları İçin:</span>
                          </b>
                          <p className="text-white/80">
                            Huawei AppGallery veya Huawei tarayıcısı (Petal / Huawei Browser) üzerinden kullanırken:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-white/70">
                            <li>Huawei tarayıcısında sağ üstteki 3 nokta veya Paylaş menüsüne dokunun.</li>
                            <li><b>"Ana Ekrana Ekle"</b> veya <b>"Uygulama Olarak Yükle"</b> butonuna basın.</li>
                            <li>AppGallery için hazırlanan <b>archinstall.apk</b> dosyasını doğrudan indirip Huawei cihazınıza güvenle kurabilirsiniz.</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[12px]">
                          <b>PWA Alternatifi:</b> Chrome, Edge veya Huawei Tarayıcı üzerinden "Uygulamayı Yükle" (PWA) butonuna basarak mağaza gerektirmeden tam ekran yerel uygulama olarak kullanabilirsiniz.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGuide === 'ios' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-sky-400">iOS (iPhone / iPad) İmzalanmış .IPA Kurulumu</h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>archweb.ipa</b> (Apple İmzalanmış iOS Paketi) dosyasını indirin.</p>
                        <p>2. AltStore, Sideloadly veya TrollStore uygulamasını açıp <b>archweb.ipa</b> dosyasını seçin.</p>
                        <p>3. iPhone Ayarlar -&gt; Genel -&gt; VPN ve Cihaz Yönetimi bölümünden geliştirici sertifikasına "Güven" seçeneğine dokunun.</p>
                        <p>4. Ana ekranınıza eklenen ArchWeb OS ikonuna tıklayarak tam ekran kullanın.</p>
                        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg text-[12px]">
                          <b>Safari PWA Yöntemi:</b> Safari'de Paylaş ikonuna dokunup "Ana Ekrana Ekle" seçeneğiyle de saniyeler içinde iPhone'unuza yerel uygulama gibi yükleyebilirsiniz.
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGuide === 'mac' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">macOS Kurulumu</h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>archweb.dmg</b> dosyasını indirin ve açın.</p>
                        <p>2. Açılan penceredeki ArchWeb OS uygulamasını <b>Applications (Uygulamalar)</b> klasörüne sürükleyin.</p>
                        <p>3. Uygulamayı Launchpad üzerinden başlatın.</p>
                        <p>4. "Geliştirici doğrulanamıyor" uyarısı alırsanız; Sistem Ayarları - Gizlilik ve Güvenlik - "Yine de Aç" butonuna basın.</p>
                      </div>
                    </div>
                  )}

                  {selectedGuide === 'linux' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-orange-400">Linux Kurulumu</h3>
                      <div className="space-y-3 text-sm text-white/80 leading-relaxed">
                        <p>1. <b>archweb.deb</b> paketini indirin (Debian/Ubuntu tabanlı sistemler için).</p>
                        <p>2. Terminali açın ve şu komutu çalıştırın: <code className="bg-black/50 px-2 py-1 rounded">sudo dpkg -i archweb.deb</code></p>
                        <p>3. Eksik bağımlılıkları gidermek için: <code className="bg-black/50 px-2 py-1 rounded">sudo apt-get install -f</code></p>
                        <p>4. Terminalden <code className="bg-black/50 px-2 py-1 rounded">archweb-os</code> yazarak veya uygulama menüsünden başlatın.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body */}
      <div id="inst_body" className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {activeTab === 'mobile' ? (
          <>
            {/* Intro Banner with Unified PWA Install Button */}
            <div id="mobile_banner" className="bg-gradient-to-r from-emerald-500/15 via-[var(--accent)]/5 to-purple-500/15 border border-emerald-500/30 rounded-xl p-5 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center shrink-0 border border-white/10 shadow-xl overflow-hidden p-2">
                <img src="/icon.svg" alt="ArchWeb OS Icon" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center gap-2">
                  <span>📱 ArchWeb OS'i Telefonunuza Kurun!</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-extrabold uppercase animate-pulse">Önerilen</span>
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  ArchWeb OS paketleri en son sürüm (v20.1.2) ile tam uyumlu ve optimize edilmiş şekilde hazırlandı.
                </p>
                <p className="text-xs text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-lg leading-relaxed">
                  Uygulamayı gerçek telefonunuza <strong>birebir yerel, tam ekran, bağımsız bir mobil uygulama</strong> olarak kurmak için aşağıdaki yükleme seçeneğini kullanın!
                </p>
              </div>

              {/* Native PWA Install Button Box */}
              <div className="w-full max-w-md bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Yerel Mobil Kurulum (PWA)</p>
                    <p className="text-[10px] text-white/50">Bağımsız ekran, yüksek hız ve tam ekran deneyimi.</p>
                  </div>
                </div>

                {canInstallPWA ? (
                  <button
                    onClick={handleInstallPWA}
                    className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Download size={13} className="stroke-[2.5]" />
                    <span>BU TELEFONA KUR</span>
                  </button>
                ) : (
                  <button
                    onClick={handleInstallPWA}
                    className="w-full sm:w-auto px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Chrome size={13} />
                    <span>Nasıl Kurulur?</span>
                  </button>
                )}
              </div>
            </div>

            {/* APK Download Section */}
            <div id="apk_section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Standalone Application APK Box - archwebapp.apk */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-4 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold font-mono tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                      <Package size={14} /> Standart Uygulama (.APK)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[8px] text-emerald-300 font-mono font-bold uppercase shrink-0">
                      SUNUCUSUZ
                    </span>
                  </div>
                  <p className="text-xs text-white font-black mt-1">archwebapp.apk</p>
                  <p className="text-[11px] text-emerald-200/70">Kurulum yok, sunucu yok. Doğrudan tek parça Android bağımsız uygulama paketi.</p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'archwebapp_apk' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-emerald-300">
                        <span>İndiriliyor...</span>
                        <span>%{downloadProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 transition-all duration-150 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : downloadedFiles['archwebapp_apk'] ? (
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold">
                        <CheckCircle2 size={12} /> İndirildi!
                      </div>
                      <button 
                        onClick={() => handleDownloadFile('archwebapp_apk')}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer font-bold"
                      >
                        <ArrowDownToLine size={10} /> Tekrar İndir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('archwebapp_apk')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Download size={13} className="stroke-[2.5]" />
                      <span>archwebapp.apk İndir</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Client APK Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold font-mono tracking-wider text-[var(--accent)] uppercase flex items-center gap-1.5">
                      <Package size={14} /> Mobil İstemci (.APK)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-mono font-bold uppercase shrink-0">
                      v20.1.2
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-bold mt-1">archinstall.apk</p>
                  <p className="text-[11px] text-white/50">Cihazınızda yerel tam ekran arayüzü çalıştırmak için indirin.</p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'apk' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-white/60">
                        <span>İndiriliyor...</span>
                        <span>%{downloadProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--accent)] transition-all duration-150 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : downloadedFiles['apk'] ? (
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 size={12} /> İndirildi!
                      </div>
                      <button 
                        onClick={() => handleDownloadFile('apk')}
                        className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer"
                      >
                        <ArrowDownToLine size={10} /> Tekrar İndir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('apk')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 hover:from-[var(--accent)]/95 hover:to-[var(--accent)]/85 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>archinstall.apk İndir</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Android TV & Google TV APK Box */}
              <div className="bg-white/5 border border-amber-500/30 rounded-xl p-5 space-y-4 flex flex-col justify-between bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold font-mono tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                      <Package size={14} /> Android TV (.APK)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-[8px] text-amber-300 font-mono font-bold uppercase shrink-0">
                      LEANBACK 4K
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-bold mt-1">ArchWeb_TV_v20.apk</p>
                  <p className="text-[11px] text-white/50">Google TV & Smart TV uzaktan kumanda (D-Pad) uyumlu televizyon paketi.</p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'apk' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-white/60">
                        <span>İndiriliyor...</span>
                        <span>%{downloadProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 transition-all duration-150 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : downloadedFiles['apk'] ? (
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 size={12} /> İndirildi!
                      </div>
                      <button 
                        onClick={() => handleDownloadFile('apk')}
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer"
                      >
                        <ArrowDownToLine size={10} /> Tekrar İndir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('apk')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-450 hover:to-orange-450 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Android TV APK İndir</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Server APK Box */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold font-mono tracking-wider text-purple-400 uppercase flex items-center gap-1.5">
                      <Cpu size={14} /> Mobil Sunucu (.APK)
                    </h4>
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[8px] text-purple-400 font-mono font-bold uppercase shrink-0">
                      v2.0.0
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-bold mt-1">Server.apk</p>
                  <p className="text-[11px] text-white/50">Telefonda sunucu açmak ve yerel sunucuyu telefondan yönetmek için indirin.</p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'server_apk' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-white/60">
                        <span>İndiriliyor...</span>
                        <span>%{downloadProgress}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 transition-all duration-150 rounded-full"
                          style={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : downloadedFiles['server_apk'] ? (
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 size={12} /> İndirildi!
                      </div>
                      <button 
                        onClick={() => handleDownloadFile('server_apk')}
                        className="text-[11px] text-purple-400 hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer"
                      >
                        <ArrowDownToLine size={10} /> Tekrar İndir
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('server_apk')}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-550 hover:to-purple-450 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} />
                      <span>Server.apk İndir</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Info Section - Cleaned */}
            <div id="apk_info" className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <h4 className="text-sm font-bold text-emerald-300">Resmi Kurulum Kanalları</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                ArchWeb OS'in mobil versiyonlarını doğrudan tarayıcı üzerinden veya aşağıdaki paketleri kullanarak saniyeler içinde kurabilirsiniz:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  onClick={handleInstallPWA}
                  className="px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-all flex items-center gap-1.5"
                >
                  🚀 Hızlı Mobil Kurulum (PWA)
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Intro Banner with PWA Option */}
            <div id="desktop_banner" className="bg-gradient-to-r from-emerald-500/15 via-[var(--accent)]/5 to-blue-500/15 border border-emerald-500/30 rounded-xl p-5 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shrink-0 border border-white/10 shadow-xl p-2 text-emerald-400">
                <Monitor size={32} />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-center gap-2">
                  <span>💻 ArchWeb OS Standalone Installer</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-black text-[9px] font-extrabold uppercase animate-pulse">Yeni</span>
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Tüm sistemi, sunucu yapılandırmasını ve çevrimdışı paketleri tek bir <strong>.exe</strong> dosyasında topladık.
                </p>
              </div>

              {/* Native PWA Desktop Install Button Box */}
              <div className="w-full max-w-md bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">C# Launcher Source (.CS)</p>
                    <p className="text-[10px] text-white/50">Derlenebilir C# kodu. Windows Defender dostu ve güvenli.</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadFile('exe')}
                  className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-lg shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <Download size={13} className="stroke-[2.5]" />
                  <span>KODU İNDİR (.CS)</span>
                </button>
              </div>
            </div>

            {/* Desktop Packages Grid */}
            <div id="desktop_grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Windows Full Package Section */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-mono font-bold uppercase">
                      Windows C# Launcher
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.cs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <img 
                        src="/exe_setup_icon.png" 
                        alt="Setup Icon" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) parent.innerHTML = '<div class="text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg></div>';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">ArchWeb_Desktop.exe</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        ArchWeb OS Masaüstü Deneyimi. Node.js denetleyicisi ve masaüstü arayüzü ile tam entegre çalışır.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'exe' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Paketleniyor...</div>
                    </div>
                  ) : downloadedFiles['exe'] ? (
                    <button 
                      onClick={() => handleDownloadFile('exe')}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> ArchWeb_Desktop.exe İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('exe')}
                      className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 border border-blue-500/30 hover:border-blue-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> ArchWeb_Desktop.exe (Full Pack)
                    </button>
                  )}
                </div>
              </div>

              {/* Windows Batch Launcher Section */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-mono font-bold uppercase">
                      Windows Batch
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.bat</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <img 
                        src="/bat_launcher_icon.png" 
                        alt="Batch Icon" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to Terminal icon if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) parent.innerHTML = '<div class="text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg></div>';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">ArchWeb_OS_Launcher.bat</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Python olmayan sistemler icin klasik Windows komut dosyasi launcher.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'bat' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazirlaniyor...</div>
                    </div>
                  ) : downloadedFiles['bat'] ? (
                    <button 
                      onClick={() => handleDownloadFile('bat')}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> ArchWeb_OS_Launcher.bat İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('bat')}
                      className="w-full py-2.5 bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 border border-blue-500/30 hover:border-blue-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> ArchWeb_OS_Launcher.bat
                    </button>
                  )}
                </div>
              </div>

              {/* Chromebook ISO Section */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-400/10 border border-blue-400/20 text-[9px] text-blue-400 font-mono font-bold uppercase">
                      Chromebook Edition
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.iso</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 shrink-0">
                      <Chrome size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">archweb_v20_chromebook.iso</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Chromebook ve x86 cihazlar icin canli kurulum imaji.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'iso' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazirlaniyor...</div>
                    </div>
                  ) : downloadedFiles['iso'] ? (
                    <button 
                      onClick={() => handleDownloadFile('iso')}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> .iso İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('iso')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
                    >
                      <Download size={14} /> archweb_v20_chromebook.iso İndir
                    </button>
                  )}
                </div>
              </div>

              {/* System Archives Section (.zip, .rar, .7z) */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-mono font-bold uppercase">
                      Yedek Paketi (Arşiv)
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">.ZIP / .RAR / .7Z</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">System Recovery Archives</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Sistem kurtarma ve çevrimdışı çalışma modülleri paketi (.zip, .rar ve .7z formatlarında).
                  </p>
                </div>

                <div className="pt-2 space-y-2">
                  {/* ZIP Option */}
                  {downloadingFile === 'zip' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazırlanıyor...</div>
                    </div>
                  ) : downloadedFiles['zip'] ? (
                    <button 
                      onClick={() => handleDownloadFile('zip')}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> archweb_system.zip İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('zip')}
                      className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/30 hover:border-amber-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} /> archweb_system.zip
                    </button>
                  )}

                  {/* RAR Option */}
                  {downloadingFile === 'rar' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazırlanıyor...</div>
                    </div>
                  ) : downloadedFiles['rar'] ? (
                    <button 
                      onClick={() => handleDownloadFile('rar')}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> archweb_system.rar İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('rar')}
                      className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 border border-purple-500/30 hover:border-purple-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} /> archweb_system.rar
                    </button>
                  )}

                  {/* 7Z Option */}
                  {downloadingFile === '7z' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazırlanıyor...</div>
                    </div>
                  ) : downloadedFiles['7z'] ? (
                    <button 
                      onClick={() => handleDownloadFile('7z')}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> archweb_system.7z İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('7z')}
                      className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={13} /> archweb_system.7z
                    </button>
                  )}
                </div>
              </div>

              {/* Linux Section */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] text-orange-400 font-mono font-bold uppercase">
                      Linux Edition
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.deb</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 shrink-0">
                      <Terminal size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">archweb.deb</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Debian, Ubuntu ve Mint sistemleri için paket.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'deb' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazirlaniyor...</div>
                    </div>
                  ) : downloadedFiles['deb'] ? (
                    <button 
                      onClick={() => handleDownloadFile('deb')}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> .deb İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('deb')}
                      className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white border border-orange-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> archweb.deb İndir
                    </button>
                  )}
                </div>
              </div>

              {/* macOS Section */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[9px] text-white font-mono font-bold uppercase">
                      macOS Edition
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.dmg</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                      <Apple size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">archweb.dmg</h4>
                      <p className="text-[11px] text-white/60 leading-relaxed">
                        Intel ve Apple Silicon Mac'ler için yükleyici.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'dmg' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/40 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[10px] text-white/40 text-center">%{downloadProgress} Hazirlaniyor...</div>
                    </div>
                  ) : downloadedFiles['dmg'] ? (
                    <button 
                      onClick={() => handleDownloadFile('dmg')}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> .dmg İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('dmg')}
                      className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} /> archweb.dmg İndir
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Setup Instructions */}
            <div id="desktop_run_guide" className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold font-mono text-[var(--accent)] uppercase flex items-center gap-2">
                <Terminal size={14} /> Kurulum ve Yapilandirma Bilgisi
              </h4>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-[var(--accent)] space-y-1">
                <div>PORT: <span className="text-white">5677</span></div>
                <div>LOCAL IP: <span className="text-white">245.578.3.57.99</span></div>
                <div>SUNUCU: <span className="text-white">Node.js v20.1.2</span></div>
              </div>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg">
                <b>Bilgi:</b> İndirdiğiniz EXE paketi tüm proje dosyalarını ve Python tabanlı sunucu başlatıcısını içeren hepsi bir arada bir kurulumdur.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
