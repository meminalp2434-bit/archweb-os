import React, { useState } from 'react';
import { X, Download, Smartphone, CheckCircle2, AlertTriangle, Chrome, Share2, ArrowDownToLine, SmartphoneCharging } from 'lucide-react';

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
          <Smartphone size={16} className="text-[var(--accent)]" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-white/90">
            ArchWeb Mobil Kurulum ve APK Yöneticisi
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
        <div className="bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <SmartphoneCharging size={24} className="text-[var(--accent)]" />
          </div>
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-sm font-bold text-white tracking-tight">ArchWeb OS Artık Cebinizde!</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              ArchWeb OS'i mobil telefonunuzda yerel (native) bir uygulama olarak çalıştırabilir veya tarayıcınız üzerinden ana ekrana ekleyerek her an erişebilirsiniz.
            </p>
          </div>
        </div>

        {/* APK Download Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-wider text-[var(--accent)] uppercase">Android Kurulum Paketi (.APK)</h4>
              <p className="text-xs text-white/80 font-bold">archinstall.apk — v1.0.0</p>
              <p className="text-[11px] text-white/50">Capacitor Native Android derlemesi, tüm telefon ekranları ile %100 uyumludur.</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] text-emerald-400 font-mono font-bold uppercase shrink-0">
              Uyumlu
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

        {/* Installation Steps */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono text-white/50 uppercase tracking-wider">
            Android APK Kurulum Adımları
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-lg p-3.5 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono font-bold flex items-center justify-center">
                1
              </div>
              <h5 className="text-xs font-bold text-white">APK'yı İndirin</h5>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Yukarıdaki butona tıklayarak <strong>archinstall.apk</strong> dosyasını akıllı cihazınıza indirin.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-lg p-3.5 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono font-bold flex items-center justify-center">
                2
              </div>
              <h5 className="text-xs font-bold text-white">İzinleri Verin</h5>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Ayarlar &gt; Güvenlik menüsünden <strong>"Bilinmeyen Kaynaklardan Yükleme"</strong> seçeneğini aktif hale getirin.
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-lg p-3.5 space-y-2">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono font-bold flex items-center justify-center">
                3
              </div>
              <h5 className="text-xs font-bold text-white">Kurulumu Başlatın</h5>
              <p className="text-[11px] text-white/50 leading-relaxed">
                İndirdiğiniz dosyaya dokunarak <strong>"Yükle"</strong> butonuna basın ve kurulumu saniyeler içinde tamamlayın.
              </p>
            </div>
          </div>
        </div>

        {/* Progressive Web App Alternative */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <h4 className="text-xs font-bold text-amber-300">Alternatif: Kurulumsuz PWA (Web Uygulaması)</h4>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            APK indirmek istemiyorsanız veya iOS (iPhone) kullanıyorsanız, tarayıcınızın <strong>"Ana Ekrana Ekle"</strong> özelliğini kullanarak uygulamayı tam ekran ve sıfır gecikme ile yükleyebilirsiniz:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-2.5 bg-black/20 p-2.5 rounded-lg">
              <Chrome size={14} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-white block">Android (Chrome)</span>
                <span className="text-[10px] text-white/50">Sağ üstteki <strong>3 noktaya</strong> dokunun ve <strong>"Uygulamayı yükle"</strong> seçeneğini seçin.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-black/20 p-2.5 rounded-lg">
              <Share2 size={14} className="text-pink-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-white block">iOS / iPhone (Safari)</span>
                <span className="text-[10px] text-white/50">Alt taraftaki <strong>Paylaş</strong> butonuna dokunun ve <strong>"Ana Ekrana Ekle"</strong>yi seçin.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
