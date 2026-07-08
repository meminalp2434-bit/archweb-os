import React from 'react';
import { X, Trash2, RotateCcw, Trash } from 'lucide-react';

interface TrashProps {
  onClose: () => void;
}

export const TrashBin: React.FC<TrashProps> = ({ onClose }) => {
  const deletedItems = [
    { name: 'old_config.bak', size: '2.4 KB', date: '2026-03-08' },
    { name: 'temp_log.log', size: '12 KB', date: '2026-03-07' },
    { name: 'deleted_photo.png', size: '1.5 MB', date: '2026-03-06' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-white/10 text-white/80 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-2">
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 mx-4 flex items-center gap-2 bg-black/20 rounded-md px-3 py-1 border border-white/5 text-xs">
          <Trash size={12} className="text-white/40" />
          <span className="truncate">Çöp Kutusu</span>
        </div>
        <button className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded text-xs hover:bg-red-500/30 transition-colors">
          <Trash2 size={12} />
          Boşalt
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {deletedItems.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash size={18} className="text-white/40" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-[10px] text-white/20">{item.size} • {item.date} tarihinde silindi</span>
              </div>
            </div>
            <button className="p-2 rounded-md hover:bg-white/10 text-white/40 hover:text-[var(--accent)] transition-colors opacity-0 group-hover:opacity-100">
              <RotateCcw size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-1 bg-white/5 border-t border-white/10 text-[10px] text-white/30 flex justify-between">
        <span>3 öğe</span>
        <span>Toplam boyut: 1.5 MB</span>
      </div>
    </div>
  );
};
