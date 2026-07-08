import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';

interface TextEditorProps {
  onClose: () => void;
  fileName?: string;
  initialContent?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onClose, fileName = 'untitled.txt', initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] rounded-lg overflow-hidden shadow-2xl border border-white/10 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <FileText size={14} />
            <span>{fileName}</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded text-xs hover:bg-[var(--accent)]/30 transition-colors">
          <Save size={12} />
          Kaydet
        </button>
      </div>

      {/* Editor Area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-transparent p-4 text-sm text-white/80 font-mono outline-none resize-none scrollbar-hide"
        spellCheck={false}
        placeholder="Yazmaya başlayın..."
      />

      {/* Footer */}
      <div className="px-4 py-1 bg-[#2d2d2d] border-t border-white/5 text-[10px] text-white/30 flex justify-between">
        <span>UTF-8</span>
        <span>Satır 1, Sütun {content.length + 1}</span>
      </div>
    </div>
  );
};
