import React, { useState, useEffect } from 'react';
import { X, Cast, MonitorUp, Tv, Search, Check, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'motion/react';

interface SmartViewProps {
  onClose: () => void;
  deviceMode: 'desktop' | 'mobile' | 'tablet' | 'tv';
  onChangeDeviceMode: (mode: 'desktop' | 'mobile' | 'tablet' | 'tv') => void;
}

export const SmartView: React.FC<SmartViewProps> = ({ onClose, deviceMode, onChangeDeviceMode }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [devices, setDevices] = useState<{ id: string, name: string, type: 'tv' | 'monitor' }[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);

  useEffect(() => {
    // Simulate scanning
    const timer = setTimeout(() => {
      setIsScanning(false);
      setDevices([
        { id: 'tv-1', name: 'Living Room TV', type: 'tv' },
        { id: 'tv-2', name: 'Samsung Smart TV (55")', type: 'tv' },
        { id: 'monitor-1', name: 'ArchWeb External Display', type: 'monitor' },
      ]);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (deviceMode === 'tv') {
      setConnectedDevice('tv-1');
    }
  }, [deviceMode]);

  const handleConnect = (device: { id: string, type: 'tv' | 'monitor' }) => {
    if (connectedDevice === device.id) {
      // Disconnect
      setConnectedDevice(null);
      onChangeDeviceMode('desktop');
    } else {
      setConnectedDevice(device.id);
      if (device.type === 'tv') {
        onChangeDeviceMode('tv');
      } else {
        onChangeDeviceMode('desktop');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute left-4 top-12 w-80 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[500]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-2 text-white">
          <Cast size={18} className="text-cyan-400" />
          <h2 className="font-bold text-sm font-sans">Smart View</h2>
        </div>
        <button onClick={onClose} className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {deviceMode === 'tv' && connectedDevice && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-cyan-300 font-bold">TV Modu Aktif</span>
              <span className="text-[10px] text-white/60">Görüntü televizyona yansıtılıyor</span>
            </div>
            <MonitorUp size={24} className="text-cyan-400" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-white/70">
          <span>Kullanılabilir Cihazlar</span>
          {isScanning ? (
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Search size={12} className="animate-spin" />
              <span>Aranıyor...</span>
            </div>
          ) : (
            <button onClick={() => setIsScanning(true)} className="hover:text-white transition-colors flex items-center gap-1">
              <Search size={12} />
              <span>Yenile</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {devices.map((device) => {
            const isConnected = connectedDevice === device.id || (deviceMode === 'tv' && device.type === 'tv' && connectedDevice === null);
            return (
              <button
                key={device.id}
                onClick={() => handleConnect(device)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isConnected 
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white' 
                    : 'bg-black/20 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isConnected ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-white/50'}`}>
                    {device.type === 'tv' ? <Tv size={16} /> : <Monitor size={16} />}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold font-sans">{device.name}</span>
                    <span className="text-[10px] opacity-60">
                      {isConnected ? 'Bağlandı' : 'Bağlanmak için dokunun'}
                    </span>
                  </div>
                </div>
                {isConnected && <Check size={16} className="text-cyan-400" />}
              </button>
            );
          })}

          {!isScanning && devices.length === 0 && (
            <div className="py-6 text-center text-white/40 text-xs">
              Uyumlu cihaz bulunamadı
            </div>
          )}
        </div>
        
        <div className="mt-2 text-[10px] text-white/30 text-center leading-tight">
          Telefonunuzu veya bilgisayarınızı uyumlu bir TV veya ekrana yansıtarak ArchWeb deneyimini büyük ekranda yaşayın.
        </div>
      </div>
    </motion.div>
  );
};
