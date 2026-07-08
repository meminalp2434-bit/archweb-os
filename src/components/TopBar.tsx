import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Battery, Clock, Search, LayoutGrid, Terminal as TerminalIcon, Shield } from 'lucide-react';

interface TopBarProps {
  onLauncherToggle: () => void;
  onPowerToggle?: () => void;
  firewallActive?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onLauncherToggle, onPowerToggle, firewallActive }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 w-full bg-black/40 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 text-[11px] font-mono text-white/60 z-50">
      <div className="flex items-center gap-4">
        <div 
          onClick={onLauncherToggle}
          className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors group"
        >
          <LayoutGrid size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-white/80">Arch</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:text-white cursor-pointer">Etkinlikler</span>
          <span className="hover:text-white cursor-pointer">Uçbirim</span>
          <span className="hover:text-white cursor-pointer">Tarayıcı</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/5 px-3 py-0.5 rounded-full border border-white/10">
        <Clock size={12} />
        <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Cpu size={12} />
            <span>12%</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive size={12} />
            <span>45GB</span>
          </div>
          <Wifi size={14} />
          <Battery size={14} />
          {firewallActive && (
            <span title="UFW Güvenlik Duvarı Aktif" className="flex items-center">
              <Shield size={12} className="text-emerald-500 fill-emerald-500/15" />
            </span>
          )}
        </div>
        <div className="w-px h-3 bg-white/10" />
        <div className="flex items-center gap-2">
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
