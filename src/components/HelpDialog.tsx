import React, { useState } from 'react';
import { X, HelpCircle, Book, MessageSquare, ShieldCheck, ExternalLink, Info, Terminal, Monitor, Smartphone, Code, Play, Copy, Check, Server } from 'lucide-react';
import { motion } from 'motion/react';

interface HelpDialogProps {
  onClose: () => void;
  onOpenTerminal?: () => void;
  onRunTerminalCommand?: (command: string) => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ onClose, onOpenTerminal, onRunTerminalCommand }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRun = (cmd: string) => {
    if (onRunTerminalCommand) {
      onRunTerminalCommand(cmd);
    } else if (onOpenTerminal) {
      onOpenTerminal();
    }
  };

  const apiEndpoints = [
    {
      name: "GET /api/chat",
      desc: "Canlı sohbet mesajlarını, aktif kanalları ve çevrimiçi kullanıcıları getirir.",
      cmd: "curl /api/chat"
    },
    {
      name: "POST /api/chat",
      desc: "Sohbete yeni mesaj gönderir veya kanal mesajlarını günceller.",
      cmd: `curl -X POST /api/chat -d '{"user":"Emin","message":"Terminalden Selam!"}'`
    },
    {
      name: "GET /api/chat/network-scan",
      desc: "Ağ üzerindeki aktif ArchWeb OS nodelarını ve cihazları tarar.",
      cmd: "curl /api/chat/network-scan?mode=subnet"
    },
    {
      name: "POST /api/gemini/chat",
      desc: "Gemini 3.6 Flash Yapay Zeka modeli ile doğrudan iletişim kurar.",
      cmd: `curl -X POST /api/gemini/chat -d '{"message":"Kod oluşturabilir misin?"}'`
    },
    {
      name: "GET /api/health",
      desc: "Sunucu ve sistem çalışma durumunu kontrol eder.",
      cmd: "curl /api/health"
    },
    {
      name: "GET /api/files",
      desc: "Sunucudaki sanal dosya sistemini listeler.",
      cmd: "curl /api/files"
    }
  ];

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

        {/* REST API & Webhook Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-white/80">
              <Server size={16} className="text-[var(--accent)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">REST API & Webhook Kataloğu</h3>
            </div>
            <span className="text-[10px] text-white/40 font-mono">/api/* Rotaları</span>
          </div>

          <p className="text-[10px] text-white/60 leading-relaxed">
            Aşağıdaki REST API rotalarını ArchWeb Terminali üzerinden <code className="bg-black/50 px-1 py-0.5 rounded text-[var(--accent)] font-mono">curl</code> veya <code className="bg-black/50 px-1 py-0.5 rounded text-[var(--accent)] font-mono">fetch</code> komutuyla doğrudan çalıştırabilirsiniz.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {apiEndpoints.map((ep, idx) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-2 hover:border-[var(--accent)]/30 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${ep.name.startsWith('POST') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {ep.name.split(' ')[0]}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-white/90">
                      {ep.name.split(' ')[1]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(ep.cmd)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded text-[9px] font-mono flex items-center gap-1 transition-colors border border-white/10"
                      title="Kodu Kopyala"
                    >
                      {copiedCmd === ep.cmd ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedCmd === ep.cmd ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => handleRun(ep.cmd)}
                      className="px-2.5 py-1 bg-[var(--accent)]/20 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-black rounded text-[9px] font-bold flex items-center gap-1 transition-all border border-[var(--accent)]/40"
                      title="Terminal'de Çalıştır"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Terminal'de Çalıştır</span>
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-white/50">{ep.desc}</p>

                <div className="bg-black/60 p-2 rounded-lg font-mono text-[10px] text-[var(--accent)] border border-white/5 overflow-x-auto select-all">
                  <code>{ep.cmd}</code>
                </div>
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
              <span>curl /api/chat</span>
              <span className="text-white/30">Canlı sohbet API verisini getir</span>
            </div>
            <div className="flex justify-between">
              <span>apis</span>
              <span className="text-white/30">Tüm REST API rotalarını listele</span>
            </div>
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
