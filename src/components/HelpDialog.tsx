import React from 'react';
import { X, HelpCircle, Book, MessageSquare, ShieldCheck, ExternalLink, Info, Terminal, Monitor, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

interface HelpDialogProps {
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ onClose }) => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={isMaximized ? "fixed inset-0 z-[100] bg-[#0f0f13] border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300" : "w-full max-w-2xl bg-[#0f0f13] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-all duration-300"}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-[8px] text-red-900 font-bold group"
              title="Kapat"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
            </button>
            <button 
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-yellow-900 font-bold group"
              title="Küçült"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3 h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-green-900 font-bold group"
              title={isMaximized ? "Küçült" : "Ekranı Kapla"}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">{isMaximized ? '❐' : '+'}</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-[var(--accent)]">
            <HelpCircle size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest font-mono">Yardım Merkezi</h2>
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Quick Start */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 border-b border-white/5 pb-2">
            <Book size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Hızlı Başlangıç</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Monitor size={14} />
                <span className="text-[11px] font-bold">Masaüstü Modu</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Bilgisayarınızda tam ekran deneyimi için "Ayarlar &gt; Yerel Kurulum" kısmından masaüstü baslatıcısını (.bat) indirebilirsiniz.
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Smartphone size={14} />
                <span className="text-[11px] font-bold">Mobil Modu</span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                ArchWeb OS'i telefonunuza PWA (Uygulamayı Yükle) olarak kurarak her yerden erişebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 border-b border-white/5 pb-2">
            <Info size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Sık Sorulan Sorular</h3>
          </div>
          <div className="space-y-3">
            {[
              { q: ".bat dosyası açılmıyor?", a: "Windows Defender uyarı verirse 'Ek Bilgi' ve 'Yine de Çalıştır' butonlarını kullanın. Node.js yüklü olduğundan emin olun." },
              { q: "Sistem çok yavaş çalışıyor?", a: "Tarayıcı önbelleğinizi temizlemeyi veya donanım hızlandırmayı açmayı deneyin." },
              { q: "Verilerim kaydediliyor mu?", a: "Tüm ayarlar ve dosyalar tarayıcınızın yerel depolama (Local Storage) birimine otomatik olarak kaydedilir." }
            ].map((item, i) => (
              <div key={i} className="p-3 bg-black/20 border border-white/5 rounded-lg space-y-1">
                <p className="text-[11px] font-bold text-white/90">Q: {item.q}</p>
                <p className="text-[10px] text-white/50 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Terminal Commands */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 border-b border-white/5 pb-2">
            <Terminal size={16} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Temel Komutlar</h3>
          </div>
          <div className="bg-black/40 p-4 rounded-xl font-mono text-[10px] space-y-2 text-[var(--accent)] border border-white/5">
            <div className="flex justify-between">
              <span>help</span>
              <span className="text-white/30">Tüm komutları listele</span>
            </div>
            <div className="flex justify-between">
              <span>neofetch</span>
              <span className="text-white/30">Sistem bilgilerini göster</span>
            </div>
            <div className="flex justify-between">
              <span>clear</span>
              <span className="text-white/30">Terminali temizle</span>
            </div>
            <div className="flex justify-between">
              <span>ls -la</span>
              <span className="text-white/30">Dosyaları listele</span>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-5 rounded-2xl border border-[var(--accent)]/20 flex items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--accent)]">
              <MessageSquare size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Destek Ekibi (Emin Alp)</h3>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed max-w-sm">
              Sorununuz hala çözülmediyse Discord topluluğumuza katılabilir veya yapımcı Emin Alp'e e-posta gönderebilirsiniz.
            </p>
          </div>
          <button className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-black text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 shrink-0">
            DESTEK AL <ExternalLink size={12} />
          </button>
        </section>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-white/30">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} />
          <span>ArchWeb OS v20.1.2 | Yapımcı: Emin Alp</span>
        </div>
        <span>© 2026 ArchWeb Project</span>
      </div>
    </motion.div>
  );
};
