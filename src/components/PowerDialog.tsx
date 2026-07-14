import React, { useState, useRef } from 'react';
import { Power, RotateCcw, X } from 'lucide-react';
import { motion } from 'motion/react';

interface PowerDialogProps {
  onClose: () => void;
  onShutdown: () => void;
  onRestart: () => void;
  onSafeMode: () => void;
}

export const PowerDialog: React.FC<PowerDialogProps> = ({ onClose, onShutdown, onRestart, onSafeMode }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdInterval = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number>(0);
  const isTouch = useRef(false);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    setIsHolding(true);
    setHoldProgress(0);
    startTime.current = Date.now();

    const duration = 2000; // 2 seconds
    const step = 30; // Smooth progress updates

    if (holdInterval.current) clearInterval(holdInterval.current);

    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdInterval.current) {
          clearInterval(holdInterval.current);
          holdInterval.current = null;
        }
        setIsHolding(false);
        setHoldProgress(0);
        onSafeMode();
      }
    }, step);
  };

  const endHold = () => {
    if (!isHolding) return;
    
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    
    const elapsed = Date.now() - startTime.current;
    setIsHolding(false);
    setHoldProgress(0);

    // If it was a short press (less than 500ms), perform standard shutdown
    if (elapsed < 500) {
      onShutdown();
    }
  };

  const resetHold = () => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTouch.current) return;
    startHold(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isTouch.current) return;
    endHold();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouch.current = true;
    startHold(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    endHold();
    setTimeout(() => {
      isTouch.current = false;
    }, 400);
  };

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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={resetHold}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/50 transition-all group select-none cursor-pointer"
        >
          {/* Progress Overlay */}
          {isHolding && (
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-500/25 transition-all duration-75 pointer-events-none"
              style={{ width: `${holdProgress}%` }}
            />
          )}

          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform relative z-10">
            {isHolding ? (
              <Power size={24} className="animate-pulse scale-90" />
            ) : (
              <Power size={24} />
            )}
          </div>
          <span className="text-xs font-medium text-white/70 group-hover:text-white relative z-10 text-center select-none">
            {isHolding ? `Güvenli Mod (${Math.round(holdProgress)}%)` : 'Kapat'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};
