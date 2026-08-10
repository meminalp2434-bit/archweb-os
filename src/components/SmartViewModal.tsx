import React, { useState, useEffect } from 'react';
import { Cast, X, Monitor, Smartphone, Tv, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmartViewModalProps {
  onClose: () => void;
}

export const SmartViewModal: React.FC<SmartViewModalProps> = ({ onClose }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<{id: string, name: string, type: 'tv' | 'monitor' | 'phone'}[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Simulate scanning for devices
    const timer = setTimeout(() => {
      setIsScanning(false);
      setDevices([
        { id: '1', name: 'Samsung 65" QLED TV', type: 'tv' },
        { id: '2', name: 'Living Room Apple TV', type: 'tv' },
        { id: '3', name: 'MacBook Pro Display', type: 'monitor' },
        { id: '4', name: 'Ahmet\'s iPhone', type: 'phone' }
      ]);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleConnect = (id: string) => {
    setSelectedDevice(id);
    setIsConnecting(true);
    setTimeout(() => {
      alert("Bağlantı başarılı: Seçilen cihaza ekran yansıtılıyor.");
      setIsConnecting(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-[#161b26] border border-sky-500/30 rounded-2xl p-5 shadow-2xl flex flex-col text-white"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3 text-sky-400">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Cast size={20} className={isScanning ? "animate-pulse" : ""} />
            </div>
            <div>
              <h2 className="font-bold text-sm">Smart View</h2>
              <p className="text-[10px] text-white/50">Yakındaki cihazlara ekran yansıtın</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-[250px] flex flex-col">
          {isScanning ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-sky-400/80">
              <RefreshCw size={32} className="animate-spin text-sky-500" />
              <div className="text-xs font-mono text-center">
                Yakındaki cihazlar aranıyor...<br/>
                <span className="text-[10px] text-white/40">Aynı ağa bağlı olduklarından emin olun</span>
              </div>
            </div>
          ) : devices.length > 0 ? (
            <div className="space-y-2 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
              <div className="text-[10px] font-bold text-white/40 mb-2 px-1">BULUNAN CİHAZLAR ({devices.length})</div>
              {devices.map(device => (
                <button 
                  key={device.id}
                  onClick={() => handleConnect(device.id)}
                  disabled={isConnecting}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${selectedDevice === device.id ? 'bg-sky-500/20 border-sky-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-white/70 group-hover:text-sky-400 transition-colors">
                      {device.type === 'tv' ? <Tv size={16} /> : device.type === 'monitor' ? <Monitor size={16} /> : <Smartphone size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{device.name}</div>
                      <div className="text-[10px] text-white/40 capitalize">{device.type === 'tv' ? 'Televizyon' : device.type === 'monitor' ? 'Monitör' : 'Telefon'}</div>
                    </div>
                  </div>
                  {isConnecting && selectedDevice === device.id && (
                    <RefreshCw size={14} className="animate-spin text-sky-400" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/40">
              <AlertCircle size={32} />
              <div className="text-xs text-center">
                Hiçbir cihaz bulunamadı.<br/>
                <span className="text-[10px]">Lütfen cihazların açık ve aynı ağda olduğundan emin olun.</span>
              </div>
              <button 
                onClick={() => setIsScanning(true)}
                className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all text-white"
              >
                Tekrar Ara
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
