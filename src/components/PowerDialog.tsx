import React from 'react';
import { Power, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';

interface PowerDialogProps {
  onClose: () => void;
  onShutdown: () => void;
  onRestart: () => void;
}

export const PowerDialog: React.FC<PowerDialogProps> = ({ onClose, onShutdown, onRestart }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-80 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Güç Seçenekleri</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={onRestart}
          className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--accent)]/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
            <RotateCcw size={24} />
          </div>
          <span className="text-xs font-medium text-white/70 group-hover:text-white">Yeniden Başlat</span>
        </button>

        <button 
          onClick={onShutdown}
          className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
            <Power size={24} />
          </div>
          <span className="text-xs font-medium text-white/70 group-hover:text-white">Kapat</span>
        </button>
      </div>
    </motion.div>
  );
};
