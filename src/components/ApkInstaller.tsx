import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Chrome, Share2, AppWindow, Package, Download, CheckCircle2, ArrowDownToLine, Monitor, Smartphone, Terminal, Cpu } from 'lucide-react';
import { playWindows11StartupSound } from '../utils/audio';

interface ApkInstallerProps {
  onClose: () => void;
}

export const ApkInstaller: React.FC<ApkInstallerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState<Record<string, boolean>>({});

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
      // Show the install prompt
      promptEvent.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await promptEvent.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, discard it
      (window as any).deferredPrompt = null;
      setCanInstallPWA(false);
    } catch (err) {
      console.error("Installation prompt failed:", err);
    }
  };

  const handleDownloadFile = (fileType: 'apk' | 'bat' | 'dmg' | 'deb' | 'dev' | 'server_apk') => {
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
            
            // Play startup sound!
            const savedVolume = localStorage.getItem('archweb_volume');
            const volume = savedVolume !== null ? parseInt(savedVolume) : 80;
            const savedMuted = localStorage.getItem('archweb_muted');
            const isMuted = savedMuted !== null ? savedMuted === 'true' : false;
            playWindows11StartupSound(volume, isMuted, true);

            // Mapping of simulated installer contents
            const fileContentsMap: Record<string, string> = {
              apk: `ArchWeb OS Android Package (.APK)\n===================================\nApp Name: ArchWeb OS for Kids / Kids World\nPackage Name: com.archweb.os\nVersion: 20.1.2\nRelease Date: 2026-07-15\nPlatform: Android 10+ (Xiaomi HyperOS, Samsung One UI vb. tam uyumlu)\n\nBu dosya, ArchWeb OS'in mobil cihazlarda yerel (native) bir uygulama olarak calismasini saglayan kurulum paketidir.\nUygulamayi Xiaomi, Samsung veya diger Android 10+ cihazlariniza yuklemek icin bu paketi kullanabilirsiniz.\nYol haritasina gore Capacitor/Android build ciktisi olarak uretilmistir.\n`,
              server_apk: `ArchWeb OS Server Android Package (.APK)\n===================================\nApp Name: ArchWeb OS Server Client / Server Controller\nPackage Name: com.archweb.server\nVersion: 2.0.0\nRelease Date: 2026-07-17\nPlatform: Android 10+ (Termux / Native WebView Client)\n\nBu paket, ArchWeb OS yerel sunucunuzu (http://192.168.1.105:3000/) mobil cihazinizdan yonetmenizi ve mobil cihazinizda calistirilan Node.js sunucusuna baglanmanizi saglar.\n\nKURULUM VE KULLANIM ADIMLARI:\n-----------------------------\n1. Bu Server.apk dosyasini telefonunuza indirin.\n2. Telefonunuzda "Bilinmeyen Kaynaklardan Yukleme" iznini aktif ederek APK'yi yukleyin.\n3. Uygulamayi actiginizda, "Local IP" alanina sunucunun kurulu oldugu bilgisayarinizin yerel IP'sini girin:\n   -> http://192.168.1.105:3000/\n4. "Baglan" butonuna basarak, bilgisayarinizda calisan yerel Node.js sunucunuza dogrudan telefonunuzdan baglanin!\n\nALTERNATIF (TELEFONDA YEREL SUNUCU CALISTIRMA - Termux ile Node.js):\n-----------------------------------------------------------------\nEger Node.js sunucusunu dogrudan telefonunuzun icinde calistirmak isterseniz:\n1. Google Play veya F-Droid uzerinden "Termux" uygulamasini indirin.\n2. Termux terminalinde su komutlari sirasiyla calistirin:\n   $ pkg update && pkg upgrade\n   $ pkg install nodejs git\n   $ git clone https://github.com/meminalp2434/archweb-os.git\n   $ cd archweb-os\n   $ npm install\n   $ npm run build\n   $ node server.js\n3. Tarayicinizdan http://localhost:3000/ adresine girerek mobil sunucunuzu kullanin!\n`,
              bat: `@echo off\ntitle ArchWeb OS Baslatici\necho ====================================================\necho ArchWeb OS Baslatiliyor...\necho ====================================================\necho Guncellemeler kontrol ediliyor...\ngit pull\ncall npm install\necho ====================================================\necho Lutfen acilis modunu secin:\necho [1] Online Web Surumu (Node.js gerektirmez)\necho [2] Yerel Sunucu Modu - http://192.168.1.105:3000/ (Node.js gerektirir)\necho [3] Electron Masaustu (.exe) Modu (Node.js gerektirir)\necho ====================================================\nset /p secim="Seciminiz (1, 2 veya 3): "\n\nif "%secim%"=="1" (\n    echo Tarayici aciliyor...\n    start https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app\n) else if "%secim%"=="2" (\n    echo Yerel sunucu baslatiliyor...\n    start http://192.168.1.105:3000/\n    call npm run dev\n) else if "%secim%"=="3" (\n    echo Electron masaustu uygulamasi baslatiliyor...\n    call npm run electron:start\n) else (\n    echo Gecersiz secim.\n)\npause\n`,
              dmg: `ArchWeb OS for macOS Installer\n==================================\nBu dosya, ArchWeb OS'in macOS sistemlerinde yerel (native) bir uygulama olarak calismasini saglayan kurulum paketidir.\nmacOS High Sierra, Mojave, Catalina, Big Sur, Monterey, Ventura, Sonoma ve Sequoia surumleri ile tam uyumludur.\nM1, M2, M3 Apple Silicon ve Intel islemcili cihazlari destekler.\n`,
              deb: `Package: archweb-os\nVersion: 20.1.2\nSection: utils\nPriority: optional\nArchitecture: amd64\nDepends: nodejs (>= 16), npm\nMaintainer: ArchWeb OS Geliştirici Ekibi <geliştirici@archweb.org>\nDescription: ArchWeb OS Debian / Ubuntu Yerel Kurulum Paketi\n Bu paket, ArchWeb OS'i Debian, Ubuntu, Linux Mint veya diger .deb tabanli Linux dagitimlarinda yerel bir uygulama olarak kurmanizi saglar.\n`,
              dev: `Package: archweb-os\nVersion: 20.1.2\nSection: devel\nPriority: optional\nArchitecture: amd64\nMaintainer: ArchWeb OS Geliştirici Ekibi <geliştirici@archweb.org>\nDescription: ArchWeb OS Arch Linux / Pacman Yerel Gelistirici Paketi\n Bu paket, ArchWeb OS sistemini Arch Linux dagitimlarinda pacman araciligiyla yuklemenizi saglar.\n`
            };

            let filename = '';
            if (fileType === 'apk') filename = 'archinstall.apk';
            else if (fileType === 'server_apk') filename = 'Server.apk';
            else if (fileType === 'bat') filename = 'archweb kids setup.bat';
            else if (fileType === 'dmg') filename = 'archweb.dmg';
            else if (fileType === 'deb') filename = 'archweb.deb';
            else if (fileType === 'dev') filename = 'archweb.dev';

            // Generate Blob locally to guarantee 100% bypass of corporate proxy or browser extensions blocking executable files
            const content = fileContentsMap[fileType] || '';
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
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
      <div id="inst_tabs" className="flex bg-white/5 border-b border-white/5 p-1 gap-1 shrink-0">
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
                  İndirdiğiniz simüle edilmiş <strong>.apk</strong> dosyaları tarayıcı sanal ortamında üretilen test dosyalarıdır. Gerçek Android telefonunuzda açtığınızda <strong>"paket ayrıştırılamadı"</strong> (parsing error) hatası almanız normaldir.
                </p>
                <p className="text-xs text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-lg leading-relaxed">
                  Bunun yerine uygulamayı gerçek telefonunuza (Android/iOS) <strong>birebir yerel, tam ekran, bağımsız bir mobil uygulama</strong> olarak kurmak için aşağıdaki yükleme seçeneğini kullanın!
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
            <div id="apk_section" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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

            {/* Info Section */}
            <div id="apk_info" className="bg-white/5 border border-red-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <h4 className="text-sm font-bold text-red-300">Güvenli APK Yükleyici & İndirme Uyarısı</h4>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Daha önce indirilen <strong>.apk</strong> dosyası "paket parçalanamadı" hatası verebilir veya tarayıcınız bu imzasız geliştirici paketini güvenli olmadığı gerekçesiyle engelleyebilir. Bu durumda uyarılı kurulum sayfamızı kullanarak korumayı atlayabilirsiniz:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a 
                  href="/archinstall.apk.html" 
                  target="_blank" 
                  className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs text-red-400 hover:text-red-300 font-bold transition-all flex items-center gap-1.5"
                >
                  🚀 archinstall.apk.html Güvenli Kurulum Sayfası
                </a>
                <a 
                  href="/Server.apk.html" 
                  target="_blank" 
                  className="px-3 py-1.5 rounded bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 hover:text-purple-300 font-bold transition-all flex items-center gap-1.5"
                >
                  ⚡ Server.apk.html Güvenli Sunucu Kurulum Sayfası
                </a>
              </div>
              <p className="text-xs text-white/90 font-bold border-l-2 border-[var(--accent)] pl-3">
                Eğer APK yine de hata verirse, aşağıdaki "Ana Ekrana Ekle" (PWA) yöntemini kullanarak uygulamayı güvenli ve eksiksiz olarak Android 10+, Xiaomi veya Samsung cihazınıza yükleyin. PWA mimarisi HyperOS ve One UI'da sorunsuz çalışır.
              </p>
            </div>

            {/* Installation Steps */}
            <div id="pwa_info" className="space-y-3">
              <h4 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wider flex items-center gap-2">
                <AppWindow size={14} /> Alternatif: Kurulumsuz PWA Adımları
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3 bg-black/20 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Chrome size={20} className="text-blue-400 shrink-0" />
                    <span className="text-sm font-bold text-white">HyperOS / One UI (Chrome)</span>
                  </div>
                  <ul className="text-xs text-white/60 space-y-2 list-decimal list-inside">
                    <li>Cihazınızdan <strong>Chrome</strong>'u açın, sağ üstteki <strong>3 Noktaya</strong> (⋮) dokunun.</li>
                    <li>Menüden <strong>"Uygulamayı yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                    <li>Kurulumu onaylayın. ArchWeb ikonu ana ekranınızda belirecektir.</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 bg-black/20 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Share2 size={20} className="text-blue-400 shrink-0" />
                    <span className="text-sm font-bold text-white">iOS / iPhone (Safari)</span>
                  </div>
                  <ul className="text-xs text-white/60 space-y-2 list-decimal list-inside">
                    <li>Safari alt menüsündeki <strong>Paylaş</strong> (Yukarı ok) butonuna dokunun.</li>
                    <li>Listeyi aşağı kaydırın ve <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                    <li><strong>"Ekle"</strong> butonuna basın. ArchWeb ikonu ana ekranınızda belirecektir.</li>
                  </ul>
                </div>
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
                  <span>💻 ArchWeb OS'i Bilgisayarınıza Kurun!</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-extrabold uppercase animate-pulse">Önerilen</span>
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  İndirilen <strong>.bat</strong>, <strong>.dmg</strong> ve <strong>.deb</strong> dosyaları tarayıcı simülasyonunun parçasıdır. Uygulamayı gerçek bilgisayarınıza (Windows, macOS, Linux) <strong>tek tıkla açılan bağımsız bir masaüstü uygulaması</strong> olarak kurmak için PWA yöntemini kullanın!
                </p>
                <p className="text-xs text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-lg leading-relaxed">
                  Bu sayede uygulama tarayıcı sekmelerinden kurtulur, bilgisayarınızda kendi penceresine ve masaüstü kısayoluna sahip olur.
                </p>
              </div>

              {/* Native PWA Desktop Install Button Box */}
              <div className="w-full max-w-md bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Masaüstü Yerel Kurulum (PWA)</p>
                    <p className="text-[10px] text-white/50">Kendi masaüstü kısayolu, bağımsız pencere ve yüksek performans.</p>
                  </div>
                </div>

                {canInstallPWA ? (
                  <button
                    onClick={handleInstallPWA}
                    className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs rounded-lg shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Download size={13} className="stroke-[2.5]" />
                    <span>BİLGİSAYARIMA KUR</span>
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

            {/* Desktop Packages Grid */}
            <div id="desktop_grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Windows Section */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] text-blue-400 font-mono font-bold uppercase">
                      Windows
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.bat</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Windows Hızlı Başlatıcı</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Sistemi otomatik yapılandıran, paketleri denetleyen ve Electron/Web sunucusunu tek tıkla başlatan bat komut dosyası.
                  </p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'bat' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[9px] text-white/40 text-center">%{downloadProgress} İndiriliyor...</div>
                    </div>
                  ) : downloadedFiles['bat'] ? (
                    <button 
                      onClick={() => handleDownloadFile('bat')}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> archweb kids setup.bat İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('bat')}
                      className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 border border-blue-500/30 hover:border-blue-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} /> archweb kids setup.bat İndir
                    </button>
                  )}
                </div>
              </div>

              {/* macOS Section */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-mono font-bold uppercase">
                      macOS
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.dmg</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Apple Disk Image</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    macOS Intel ve Apple Silicon (M1/M2/M3) mimarileriyle uyumlu, Gatekeeper korumasını destekleyen disk yansıması.
                  </p>
                </div>

                <div className="pt-2">
                  {downloadingFile === 'dmg' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[9px] text-white/40 text-center">%{downloadProgress} İndiriliyor...</div>
                    </div>
                  ) : downloadedFiles['dmg'] ? (
                    <button 
                      onClick={() => handleDownloadFile('dmg')}
                      className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={12} /> archweb.dmg İndirildi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDownloadFile('dmg')}
                      className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/35 text-purple-300 border border-purple-500/30 hover:border-purple-400 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={12} /> archweb.dmg İndir
                    </button>
                  )}
                </div>
              </div>

              {/* Linux Section */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-[9px] text-orange-400 font-mono font-bold uppercase">
                      Linux (Debian)
                    </span>
                    <span className="text-[10px] font-mono text-white/40">.deb / .dev</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">Ubuntu & Debian Paketi</h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Debian, Ubuntu, Linux Mint veya diğer deb tabanlı dağıtımlarda tek tıkla kurulan, bağımlılıkları denetleyen paket.
                  </p>
                </div>

                <div className="pt-2 space-y-1.5">
                  {downloadingFile === 'deb' || downloadingFile === 'dev' ? (
                    <div className="space-y-1">
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }} />
                      </div>
                      <div className="text-[9px] text-white/40 text-center">%{downloadProgress} İndiriliyor...</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {downloadedFiles['deb'] ? (
                        <button 
                          onClick={() => handleDownloadFile('deb')}
                          className="col-span-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={11} /> .deb İndirildi
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadFile('deb')}
                          className="py-2 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 hover:border-orange-400 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="archweb.deb indirin"
                        >
                          <Download size={11} /> .deb İndir
                        </button>
                      )}

                      {downloadedFiles['dev'] ? (
                        <button 
                          onClick={() => handleDownloadFile('dev')}
                          className="col-span-2 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={11} /> .dev İndirildi
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadFile('dev')}
                          className="py-2 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 hover:border-orange-400 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="archweb.dev indirin"
                        >
                          <Download size={11} /> .dev İndir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Setup Instructions */}
            <div id="desktop_run_guide" className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold font-mono text-[var(--accent)] uppercase flex items-center gap-2">
                <Terminal size={14} /> Bilgisayarda Manuel Çalıştırma Rehberi (Geliştirici Modu)
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Eğer Electron paketi yerine kaynak kodlar üzerinden çalıştırmak isterseniz:
              </p>
              <ol className="list-decimal list-inside text-xs text-white/50 space-y-1.5 pl-1">
                <li>Üst menüdeki ayarlar panelinden projeyi <b>ZIP</b> olarak indirin ve arşivden çıkarın.</li>
                <li>Bilgisayarınızda <span className="text-white/80">Node.js</span> yüklü olduğundan emin olun.</li>
                <li>Proje dizininde bir uçbirim açıp sırasıyla şu komutları uygulayın:</li>
              </ol>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-[var(--accent)] space-y-1">
                <div>npm install <span className="text-white/30"># Bağımlılıkları kur</span></div>
                <div>npm run build <span className="text-white/30"># Web uygulamasını derle</span></div>
                <div>npm run electron:dev <span className="text-white/30"># Electron Masaüstü uygulamasını başlat</span></div>
              </div>
              <p className="text-[11px] text-amber-400/90 leading-relaxed bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg flex items-start gap-2">
                <span>⚠️</span>
                <span>
                  <b>macOS/Linux Kullanıcıları:</b> Dosya izinleri nedeniyle çalıştırmadan önce terminalde <code>chmod +x ./baslat.sh</code> komutuyla çalıştırılabilir izinlerini vermelidir. Windows kullanıcıları doğrudan <code>archweb kids setup.bat</code> dosyasına çift tıklayabilir.
                </span>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
