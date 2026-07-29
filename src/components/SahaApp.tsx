import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wifi, Signal, Globe, Cpu, Server, Activity, ShieldCheck, Database, Search, HardDrive, Terminal } from 'lucide-react';
import { playClickSound, playNotificationSound } from '../utils/audio';

interface SahaAppProps {
  onClose: () => void;
}

export const SahaApp: React.FC<SahaAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'details' | 'logs'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const networkData = {
    ssid: 'FiberHGW_HUN6A2',
    protocol: 'Wi-Fi 4 (802.11n)',
    security: 'WPA2-Kişisel',
    manufacturer: 'Intel Corporation',
    description: 'Intel(R) Dual Band Wireless-AC 7265',
    driver: '23.40.0.4',
    band: '2.4 GHz (Kanal 11)',
    speed: '18/18 Mbps',
    ipv6: '2a00:1d34:28c5:ca00:73f6:7b33:6912:dcdd',
    ipv4: '192.168.1.182',
    dns: ['195.46.39.39', '195.46.39.40'],
    mac: '34-F6-4B-07-8C-85'
  };

  const handleScan = () => {
    setIsScanning(true);
    setProgress(0);
    playNotificationSound(80, false);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          playClickSound(80, false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* App Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold">ArchWeb Saha Analizörü</h2>
            <p className="text-[9px] text-white/40 uppercase tracking-tighter">Saha Veri Takip & Network Kontrol</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={onClose} className="p-1.5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-md transition-colors">
            <Terminal size={14} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex px-2 bg-[#0f172a] border-b border-white/5">
        <button 
          onClick={() => setActiveTab('scan')}
          className={`px-4 py-2 text-[10px] font-bold border-b-2 transition-all ${activeTab === 'scan' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/60'}`}
        >
          AĞ TARAMASI
        </button>
        <button 
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-[10px] font-bold border-b-2 transition-all ${activeTab === 'details' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/60'}`}
        >
          TEKNİK DETAYLAR
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-[10px] font-bold border-b-2 transition-all ${activeTab === 'logs' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-white/40 hover:text-white/60'}`}
        >
          SAHA KAYITLARI
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activeTab === 'scan' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-white mb-1">Fiber Saha Bağlantısı</h3>
                    <p className="text-[10px] text-emerald-400/70 font-mono">{networkData.ssid}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">AKTİF</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase mb-1">Sinyal</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Signal size={12} /> %98
                    </div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase mb-1">Kanal</div>
                    <div className="text-xs font-bold text-sky-400">11 (2.4GHz)</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase mb-1">Hız</div>
                    <div className="text-xs font-bold text-amber-400">18 Mbps</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[9px] text-white/40 mb-1">
                    <span>Saha Veri Akışı</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Search size={14} />
                  {isScanning ? 'Veri Paketi Toplanıyor...' : 'Yeni Saha Taraması Başlat'}
                </button>
              </div>
              <div className="absolute top-0 right-0 p-4 text-emerald-500/10 pointer-events-none">
                <Wifi size={120} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sky-400">
                  <Globe size={14} />
                  <span className="text-[10px] font-bold uppercase">IPv4 Adresi</span>
                </div>
                <div className="text-xs font-mono text-white/80">{networkData.ipv4}</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase">Güvenlik</span>
                </div>
                <div className="text-xs font-mono text-white/80">{networkData.security}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white/50 flex items-center gap-2">
                <Cpu size={14} className="text-sky-400" />
                DONANIM ÖZELLİKLERİ
              </h3>
              <div className="space-y-2">
                <DetailRow label="Cihaz Adı" value={networkData.description} />
                <DetailRow label="Üretici" value={networkData.manufacturer} />
                <DetailRow label="Sürücü Sürümü" value={networkData.driver} />
                <DetailRow label="Fiziksel Adres" value={networkData.mac} />
              </div>
            </div>

            <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
              <h3 className="text-xs font-bold text-white/50 flex items-center gap-2">
                <Server size={14} className="text-purple-400" />
                AĞ KONFİGÜRASYONU
              </h3>
              <div className="space-y-2">
                <DetailRow label="IPv6 Adresi" value={networkData.ipv6} mono />
                <DetailRow label="DNS Sunucu 1" value={networkData.dns[0]} />
                <DetailRow label="DNS Sunucu 2" value={networkData.dns[1]} />
                <DetailRow label="Bağlantı Türü" value={networkData.protocol} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] space-y-2 h-[280px] overflow-y-auto">
            <div className="text-emerald-400">[SYSTEM] Saha uygulaması başlatıldı.</div>
            <div className="text-white/30">[07:25:01] Intel AC-7265 sürücüsü denetleniyor... OK</div>
            <div className="text-white/30">[07:25:02] Wi-Fi 4 (802.11n) protokolü aktif edildi.</div>
            <div className="text-sky-400">[07:25:04] FiberHGW_HUN6A2 ağına WPA2 ile bağlanıldı.</div>
            <div className="text-white/30">[07:25:05] IPv4 ataması başarılı: 192.168.1.182</div>
            <div className="text-amber-400">[WARNING] Bağlantı hızı sınırlı: 18/18 Mbps</div>
            <div className="text-white/30">[07:25:08] Saha verileri yerel depolamaya (ArchWeb) senkronize ediliyor...</div>
            <div className="text-white/30">[07:25:10] Dinleme kanalı 11 (2.4GHz) üzerinden veri paketleri alınıyor.</div>
            <div className="animate-pulse text-emerald-400">_</div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={10} className="text-emerald-500" />
          <span className="text-[9px] text-white/30 uppercase">Saha İstasyon No: #34F6-8C85</span>
        </div>
        <span className="text-[9px] text-white/30">ArchWeb OS Kernel 23.40</span>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
    <span className="text-[10px] text-white/40">{label}:</span>
    <span className={`text-[10px] font-bold text-white/80 ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);
