import React from 'react';
import { Terminal, Settings, Globe, Folder, Trash2, Search, Power, LogOut, User } from 'lucide-react';
import { motion } from 'motion/react';

interface LauncherProps {
  onClose: () => void;
  onLaunch: (app: string) => void;
  onPowerClick?: () => void;
}

export const Launcher: React.FC<LauncherProps> = ({ onClose, onLaunch, onPowerClick }) => {
  const apps = [
    { id: 'terminal', name: 'Uçbirim', icon: Terminal, color: 'var(--accent)' },
    { id: 'settings', name: 'Ayarlar', icon: Settings, color: '#9c27b0' },
    { id: 'browser', name: 'Tarayıcı', icon: Globe, color: '#4caf50' },
    { id: 'files', name: 'Dosyalar', icon: Folder, color: '#ff9800' },
    { id: 'trash', name: 'Çöp Kutusu', icon: Trash2, color: '#f44336' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-80 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Search */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
          <Search size={16} className="text-white/30" />
          <input 
            type="text" 
            placeholder="Uygulama ara..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full"
            autoFocus
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="p-4 grid grid-cols-3 gap-4">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => {
              onLaunch(app.id);
              onClose();
            }}
            className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all group"
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
              style={{ backgroundColor: `${app.color}22`, border: `1px solid ${app.color}44` }}
            >
              <app.icon size={24} style={{ color: app.color }} />
            </div>
            <span className="text-[10px] font-medium text-white/60 group-hover:text-white">{app.name}</span>
          </button>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="mt-auto p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center text-[10px] text-[var(--accent)] font-bold">
            AU
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white">arch-user</span>
            <span className="text-[9px] text-white/40">Çevrimiçi</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <User size={16} />
          </button>
          <button 
            onClick={() => {
              onPowerClick?.();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-500 transition-colors"
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
