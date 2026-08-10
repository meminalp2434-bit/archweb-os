import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Battery, Clock, Search, LayoutGrid, Terminal as TerminalIcon, Shield, Volume2, VolumeX, Smartphone, Lock, Cast, MapPin, Bell } from 'lucide-react';

interface TopBarProps {
  onLauncherToggle: () => void;
  onHelpToggle?: () => void;
  onPowerToggle?: () => void;
  onLockScreen?: () => void;
  firewallActive?: boolean;
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  mobileMode?: boolean;
  onMobileToggle?: () => void;
  deviceMode?: 'desktop' | 'mobile' | 'tablet' | 'tv';
  onChangeDeviceMode?: (mode: 'desktop' | 'mobile' | 'tablet' | 'tv') => void;
  onSmartViewToggle?: () => void;
  isSmartViewOpen?: boolean;
  onLocationToggle?: () => void;
  isLocationOpen?: boolean;
  onQuickSettingsToggle?: () => void;
}

const TopBarClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 px-3 py-0.5 rounded-full border border-white/10">
      <Clock size={12} />
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    </div>
  );
};

export const TopBar: React.FC<TopBarProps> = ({ 
  onLauncherToggle, 
  onHelpToggle,
  onPowerToggle, 
  onLockScreen,
  firewallActive,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  mobileMode = false,
  onMobileToggle,
  deviceMode = 'desktop',
  onChangeDeviceMode,
  onSmartViewToggle,
  isSmartViewOpen,
  onLocationToggle,
  isLocationOpen,
  onQuickSettingsToggle
}) => {
  return (
    <div className="h-8 w-full bg-black/40 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 text-[11px] font-mono text-white/60 z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        {onLocationToggle && (
          <button 
            onClick={onLocationToggle}
            className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${isLocationOpen ? 'text-green-400 bg-green-400/15 border border-green-400/30 scale-110' : 'text-white/60 hover:text-white'}`}
            title="ArchWeb Yakındaki Kişiler (Radar)"
          >
            <MapPin size={14} />
          </button>
        )}
        {onSmartViewToggle && (
          <button 
            onClick={onSmartViewToggle}
            className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${isSmartViewOpen ? 'text-cyan-400 bg-cyan-400/15 border border-cyan-400/30 scale-110' : 'text-white/60 hover:text-white'}`}
            title="Smart View (Yansıt)"
          >
            <Cast size={14} />
          </button>
        )}
        <div 
          onClick={onLauncherToggle}
          className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors group shrink-0"
        >
          <LayoutGrid size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-white/80 whitespace-nowrap">ArchWeb Kids</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="hover:text-white cursor-pointer">Etkinlikler</span>
          <span className="hover:text-white cursor-pointer">Uçbirim</span>
          <span className="hover:text-white cursor-pointer">Tarayıcı</span>
          <span onClick={onHelpToggle} className="hover:text-white cursor-pointer text-[var(--accent)] font-bold">Yardım</span>
        </div>
      </div>

      <TopBarClock />

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1">
            <Cpu size={12} />
            <span>12%</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <HardDrive size={12} />
            <span>45GB</span>
          </div>
          
          <button 
            onClick={onQuickSettingsToggle}
            className="flex items-center gap-2 hover:bg-white/10 px-2 py-0.5 rounded transition-colors cursor-pointer"
            title="Hızlı Ayarlar ve Bildirimler"
          >
            <Bell size={14} className="shrink-0" />
            <Wifi size={14} className="shrink-0" />
            <Battery size={14} className="shrink-0" />
          </button>
          
          {/* Hover-expandable Volume Control */}
          <div className="relative flex items-center gap-1.5 group/vol px-1">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="hover:text-white cursor-pointer transition-colors flex items-center"
              title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
            >
              {isMuted || volume === 0 ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} />}
            </button>
            <div className="w-0 group-hover/vol:w-16 overflow-hidden transition-all duration-300 flex items-center">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setVolume(val);
                  if (val > 0 && isMuted) {
                    setIsMuted(false);
                  }
                }}
                className="w-14 accent-[var(--accent)] h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span className="text-[9px] text-white/40 min-w-[18px] text-right font-mono">
              {isMuted ? 'MUTE' : `${volume}%`}
            </span>
          </div>

          {firewallActive && (
            <span title="UFW Güvenlik Duvarı Aktif" className="flex items-center">
              <Shield size={12} className="text-emerald-500 fill-emerald-500/15" />
            </span>
          )}
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-1.5">
          {onChangeDeviceMode && (
            <div className="flex items-center bg-white/5 border border-white/10 rounded-md p-0.5 text-[10px]">
              <button
                onClick={() => onChangeDeviceMode('desktop')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${deviceMode === 'desktop' ? 'bg-[var(--accent)] text-white font-bold' : 'text-white/50 hover:text-white'}`}
                title="Masaüstü Modu"
              >
                💻
              </button>
              <button
                onClick={() => onChangeDeviceMode('mobile')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${deviceMode === 'mobile' ? 'bg-[var(--accent)] text-white font-bold' : 'text-white/50 hover:text-white'}`}
                title="Samsung S8 Mobil Modu"
              >
                📱
              </button>
              <button
                onClick={() => onChangeDeviceMode('tablet')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${deviceMode === 'tablet' ? 'bg-purple-500 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                title="Tablet Modu"
              >
                📑
              </button>
              <button
                onClick={() => onChangeDeviceMode('tv')}
                className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${deviceMode === 'tv' ? 'bg-amber-500 text-white font-bold' : 'text-white/50 hover:text-white'}`}
                title="Android TV & Google TV Modu"
              >
                📺
              </button>
            </div>
          )}
          {!onChangeDeviceMode && (
            <button 
              onClick={onMobileToggle}
              className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${mobileMode ? 'text-[var(--accent)] bg-[var(--accent)]/15 border border-[var(--accent)]/30 scale-110' : 'text-white/60 hover:text-white'}`}
              title={mobileMode ? "Masaüstü Moduna Geç" : "Telefon Moduna Geç"}
            >
              <Smartphone size={14} />
            </button>
          )}
          {onLockScreen && (
            <button 
              onClick={onLockScreen}
              className="p-1 text-white/60 hover:text-white hover:scale-110 transition-all cursor-pointer flex items-center justify-center"
              title="Sistemi Kilitle (Kilit Ekranı)"
            >
              <Lock size={13} />
            </button>
          )}
          <Search size={14} className="hover:text-white cursor-pointer" />
          <div 
            onClick={onPowerToggle}
            className="w-6 h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center text-[10px] text-[var(--accent)] font-bold hover:bg-[var(--accent)]/40 cursor-pointer transition-all"
          >
            AU
          </div>
        </div>
      </div>
    </div>
  );
};
