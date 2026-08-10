import React, { useState, useRef } from 'react';
import { X, Save, FileText, Download, Upload } from 'lucide-react';

interface TextEditorProps {
  onClose: () => void;
  fileName?: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ onClose, fileName = 'untitled.txt', initialContent = '', onSave }) => {
  const [content, setContent] = useState(initialContent);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setContent(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] rounded-lg overflow-hidden shadow-2xl border border-white/10 font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.js,.ts,.json,.md,.html,.css,.py,.sh,.xml,.bat"
      />

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

        <div className="flex items-center gap-2">
          {/* File Import from Phone/PC Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded text-xs hover:bg-sky-500/30 transition-colors font-medium"
            title="Telefondan veya bilgisayardan dosyayı metin editörüne aktarır/indirir"
          >
            <Upload size={12} />
            <span>Dosya İndir (Telefondan)</span>
          </button>

          {/* Export to Real PC/Phone Button */}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30 transition-colors font-medium"
            title="Sistemdeki dosyayı PC veya telefonunuza indirir/yükler"
          >
            <Download size={12} />
            <span>Dosyayı Yükle (Cihaza)</span>
          </button>

          {/* Save Button */}
          <button 
            onClick={() => {
              if (onSave) {
                onSave(content);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)] text-white rounded text-xs hover:bg-[var(--accent)]/90 transition-colors font-bold shadow-sm"
          >
            <Save size={12} />
            Kaydet
          </button>
        </div>
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
