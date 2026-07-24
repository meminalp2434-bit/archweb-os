import React, { useState } from 'react';
import { X, Globe, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Home } from 'lucide-react';

interface BrowserProps {
  onClose: () => void;
}

export const Browser: React.FC<BrowserProps> = ({ onClose }) => {
  const [url, setUrl] = useState('https://www.google.com/webhp?igu=1');
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputValue, setInputValue] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com/webhp?igu=1']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const getDisplayUrl = (rawUrl: string) => {
    if (rawUrl.includes('google.com/webhp?igu=1')) {
      return 'https://www.google.com';
    }
    if (rawUrl.includes('google.com/search?') && rawUrl.includes('&igu=1')) {
      return rawUrl.replace('&igu=1', '');
    }
    return rawUrl;
  };

  const navigateTo = (newUrl: string) => {
    let formattedUrl = newUrl.trim();
    if (formattedUrl === '') return;

    // Check if it is a search query or a valid URL
    const isUrl = formattedUrl.includes('.') && !formattedUrl.includes(' ');
    if (!isUrl) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedUrl)}&igu=1`;
    } else {
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      // Map Google links to iframe-compatible URLs
      if (/^(https?:\/\/)?(www\.)?google\.com(\/)?$/i.test(formattedUrl)) {
        formattedUrl = 'https://www.google.com/webhp?igu=1';
      } else if (/^(https?:\/\/)?(www\.)?google\.com\/search/i.test(formattedUrl) && !formattedUrl.includes('igu=1')) {
        formattedUrl = formattedUrl + (formattedUrl.includes('?') ? '&' : '?') + 'igu=1';
      }
    }

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(formattedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setUrl(formattedUrl);
    setInputValue(getDisplayUrl(formattedUrl));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(inputValue);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputValue(getDisplayUrl(history[newIndex]));
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setUrl(history[newIndex]);
      setInputValue(getDisplayUrl(history[newIndex]));
    }
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleHome = () => {
    navigateTo('https://www.google.com');
  };

  const openInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className={`flex flex-col bg-[#1e1e1e] overflow-hidden shadow-2xl border border-white/10 text-white font-sans transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-[100] rounded-none' : 'h-full w-full rounded-lg'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10 gap-2">
        <div className="flex gap-1.5 items-center shrink-0">
          <button 
            onClick={onClose} 
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-[8px] text-red-900 font-bold group"
            title="Kapat"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
          </button>
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-yellow-900 font-bold group"
            title="Küçült"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">−</span>
          </button>
          <button 
            onClick={() => setIsMaximized(!isMaximized)}
            className="w-3 h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-green-900 font-bold group"
            title={isMaximized ? "Küçült" : "Ekranı Kapla"}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">{isMaximized ? '❐' : '+'}</span>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 text-white/60 shrink-0">
          <button 
            onClick={handleBack} 
            disabled={historyIndex === 0}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Geri"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleForward} 
            disabled={historyIndex === history.length - 1}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="İleri"
          >
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={handleRefresh} 
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Yenile"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={handleHome} 
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Ana Sayfa"
          >
            <Home size={14} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-1 hover:border-white/20 focus-within:border-[var(--accent)] focus-within:bg-black/60 transition-all">
          <Globe size={14} className="text-white/40 shrink-0" />
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir web adresi yazın veya arama yapın..."
            className="bg-transparent border-none text-xs text-white/90 focus:outline-none w-full"
          />
          {inputValue && (
            <button 
              onClick={() => { setInputValue(''); }}
              className="text-white/30 hover:text-white/70 text-[10px] px-1 font-sans font-bold"
              title="Temizle"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={openInNewTab}
            className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded text-xs text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-all font-medium"
            title="Yeni Sekmede Aç"
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Yeni Sekmede Aç</span>
          </button>
        </div>
      </div>

      {/* Frame Sandboxing Warning Bar */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-[10px] text-amber-300 flex items-center justify-between gap-4 font-mono select-none">
        <span className="truncate">⚠️ Bazı web siteleri güvenlik politikaları (X-Frame-Options) gereği iframe içinde açılamaz. Bu durumda sağdaki butonu kullanın.</span>
        <button onClick={openInNewTab} className="underline hover:text-amber-200 font-bold shrink-0">Sekmede Aç &rarr;</button>
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 bg-white relative">
        <iframe
          key={iframeKey}
          src={url}
          className="w-full h-full border-none bg-white"
          title="Web Tarayıcı"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

