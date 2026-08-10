import React, { useState } from 'react';
import { X, Globe, RotateCcw, ChevronLeft, ChevronRight, ExternalLink, Home, ShieldCheck, AlertCircle } from 'lucide-react';

interface BrowserProps {
  onClose: () => void;
  onInstallWebApp?: (name: string, url: string) => void;
}

export const Browser: React.FC<BrowserProps> = ({ onClose, onInstallWebApp }) => {
  const [url, setUrl] = useState('https://www.google.com/webhp?igu=1');
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputValue, setInputValue] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com/webhp?igu=1']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const quickBookmarks = [
    { name: 'Google', url: 'https://www.google.com/webhp?igu=1', display: 'https://www.google.com' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page', display: 'https://en.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com', display: 'https://github.com' },
    { name: 'Arch Linux', url: 'https://archlinux.org', display: 'https://archlinux.org' },
    { name: 'YouTube', url: 'https://www.youtube.com/embed/live_stream?channel=UCXuqSBlHAE6Xw-yeJA0Tunw', display: 'https://youtube.com' },
  ];

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
    setHasError(false);
    setIsLoading(true);

    const isUrl = formattedUrl.includes('.') && !formattedUrl.includes(' ');
    if (!isUrl) {
      formattedUrl = `https://www.google.com/search?q=${encodeURIComponent(formattedUrl)}&igu=1`;
    } else {
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
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
    setTimeout(() => setIsLoading(false), 600);
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
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleHome = () => {
    navigateTo('https://www.google.com');
  };

  const openInNewTab = () => {
    window.open(getDisplayUrl(url), '_blank');
  };

  const handleInstallAsApp = () => {
    const defaultName = getDisplayUrl(url).replace(/^https?:\/\//, '').split('/')[0] || 'Web Uygulaması';
    const appName = prompt("Bu web sitesini ArchWeb OS'e uygulama olarak yükle:", defaultName);
    if (appName && appName.trim()) {
      if (onInstallWebApp) {
        onInstallWebApp(appName.trim(), url);
      }
      alert(`"${appName.trim()}" başarıyla uygulama olarak yüklendi! Masaüstünde ve Uygulamalar menüsünde görünecektir.`);
    }
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
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Geri"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleForward} 
            disabled={historyIndex === history.length - 1}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="İleri"
          >
            <ChevronRight size={16} />
          </button>
          <button 
            onClick={handleRefresh} 
            className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="Yenile"
          >
            <RotateCcw size={14} />
          </button>
          <button 
            onClick={handleHome} 
            className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="Ana Sayfa"
          >
            <Home size={14} />
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center gap-2 bg-black/40 border border-white/10 rounded-md px-3 py-1 hover:border-white/20 focus-within:border-cyan-500 focus-within:bg-black/60 transition-all">
          <div className="flex items-center gap-1.5" title="Güvenli Bağlantı (SSL)">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
          </div>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir web adresi yazın (örn. google.com, wikipedia.org)..."
            className="bg-transparent border-none text-xs text-white/90 focus:outline-none w-full"
          />
          {inputValue && (
            <button 
              onClick={() => { setInputValue(''); }}
              className="text-white/30 hover:text-white/70 text-[10px] px-1 font-sans font-bold cursor-pointer"
              title="Temizle"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button 
            onClick={handleInstallAsApp}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all font-medium cursor-pointer"
            title="Bu web adresini uygulama olarak yükle"
          >
            <Globe size={12} />
            <span className="hidden sm:inline">Uygulama Olarak Yükle</span>
          </button>
          <button 
            onClick={openInNewTab}
            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 transition-all font-medium cursor-pointer"
            title="Yeni Sekmede Aç"
          >
            <ExternalLink size={12} />
            <span className="hidden sm:inline">Yeni Sekmede Aç</span>
          </button>
        </div>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#181818] border-b border-white/10 text-xs overflow-x-auto">
        <span className="text-white/40 text-[10px] uppercase font-mono tracking-wider shrink-0">Hızlı Erişim:</span>
        {quickBookmarks.map((b) => (
          <button
            key={b.name}
            onClick={() => navigateTo(b.url)}
            className="px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer border border-white/5"
          >
            <span>🌐</span> {b.name}
          </button>
        ))}
      </div>

      {/* Frame Sandboxing Info Bar */}
      <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-3 py-1.5 text-[11px] text-cyan-300 flex items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-cyan-400 shrink-0" />
          <span>ArchWeb Güvenli Tarayıcı aktif. Bazı web siteleri (Google, Wikipedia, GitHub vb.) güvenli şekilde yüklenir veya doğrudan yeni sekmede açılabilir.</span>
        </div>
        <button onClick={openInNewTab} className="underline hover:text-cyan-200 font-bold shrink-0 cursor-pointer">Yeni Sekmede Görüntüle &rarr;</button>
      </div>

      {/* Browser Viewport */}
      <div className="flex-1 bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-600 font-medium">Sayfa yükleniyor...</span>
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={url}
          className="w-full h-full border-none bg-white"
          title="Web Tarayıcı"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onError={() => setHasError(true)}
        />
        {hasError && (
          <div className="absolute inset-0 bg-[#1e1e1e] flex flex-col items-center justify-center p-6 text-center text-white z-10">
            <AlertCircle size={48} className="text-amber-400 mb-3" />
            <h3 className="text-lg font-bold mb-1">Bu site doğrudan çerçeve içinde görüntülenemiyor</h3>
            <p className="text-xs text-white/60 max-w-md mb-4">Güvenlik politikaları (X-Frame-Options) nedeniyle bu web sitesi iframe içinde çalıştırılamadı.</p>
            <button
              onClick={openInNewTab}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink size={14} /> Yeni Sekmede Aç ve Görüntüle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


