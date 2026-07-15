import React, { useState } from 'react';
import { X, AlertTriangle, Chrome, Share2, AppWindow, Package, Download, CheckCircle2, ArrowDownToLine } from 'lucide-react';

interface ApkInstallerProps {
  onClose: () => void;
}

export const ApkInstaller: React.FC<ApkInstallerProps> = ({ onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);
    setDownloadSuccess(false);

    // Simulate download progress animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloading(false);
            setDownloadSuccess(true);
            
            // Trigger actual download of the file
            const link = document.createElement('a');
            link.href = '/archinstall.apk';
            link.download = 'archinstall.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0f13] rounded-xl overflow-hidden shadow-2xl border border-white/10 text-white font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-[var(--accent)]" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/90">
            ArchWeb OS Kurulum (Android 10+)
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-white/5 rounded-md transition-colors text-white/60 hover:text-white"
          title="Kapat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/20 rounded-xl p-4 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-black flex items-center justify-center shrink-0 border border-white/10 shadow-xl overflow-hidden p-2">
            <img src="/icon.svg" alt="ArchWeb OS Icon" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">ArchWeb OS Artık Cebinizde!</h3>
            <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
              ArchWeb OS'i cihazınızda <b>tam ekran ve yerel bir uygulama (Native PWA)</b> olarak çalıştırabilirsiniz. Uygulama, Android 10 ve üstü sürümlerle tam uyumludur.
            </p>
          </div>
        </div>

        {/* APK Download Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-wider text-[var(--accent)] uppercase flex items-center gap-2"><Package size={14} /> Kurulum Paketi (.APK)</h4>
              <p className="text-xs text-white/80 font-bold mt-1">archinstall.apk — v1.0.0</p>
              <p className="text-[11px] text-white/50">Gereksinim: Android 10 ve üstü sürümler.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono font-bold uppercase shrink-0">
              Android 10+
            </span>
          </div>

          <div className="pt-2 flex flex-col items-center justify-center">
            {downloading ? (
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs font-mono text-white/60">
                  <span>Paket indiriliyor...</span>
                  <span>%{progress}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent)] transition-all duration-150 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : downloadSuccess ? (
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 size={14} />
                  archinstall.apk başarıyla indirildi!
                </div>
                <button 
                  onClick={handleDownload}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 justify-center mx-auto"
                >
                  <ArrowDownToLine size={12} /> Tekrar İndir
                </button>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full max-w-xs py-3 px-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 hover:from-[var(--accent)]/90 hover:to-[var(--accent)]/70 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                <span>archinstall.apk İndir</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white/5 border border-red-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h4 className="text-sm font-bold text-red-300">APK Ayrıştırma Hatası Bilgilendirmesi</h4>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            Daha önce indirilen <strong>.apk</strong> dosyası "paket parçalanamadı / ayrıştırılamadı" hatası verebilir. Bu durum derleme farklılıklarından kaynaklanabilir.
          </p>
          <p className="text-xs text-white/90 font-bold border-l-2 border-[var(--accent)] pl-3">
            Eğer APK hata verirse, aşağıdaki "Ana Ekrana Ekle" (PWA) yöntemini kullanarak uygulamayı güvenli ve eksiksiz olarak Android 10+ cihazınıza yükleyin.
          </p>
        </div>

        {/* Installation Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wider flex items-center gap-2">
            <AppWindow size={14} /> Alternatif: Kurulumsuz PWA Adımları
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3 bg-black/20 border border-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Chrome size={20} className="text-blue-400 shrink-0" />
                <span className="text-sm font-bold text-white">Android 10+ (Chrome)</span>
              </div>
              <ul className="text-xs text-white/60 space-y-2 list-decimal list-inside">
                <li>Tarayıcınızdan <strong>Sağ Üstteki 3 Noktaya</strong> (⋮) dokunun.</li>
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
      </div>
    </div>
  );
};

