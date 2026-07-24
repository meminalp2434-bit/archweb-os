import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Play, 
  Search, 
  Mic, 
  Settings as SettingsIcon, 
  Gamepad2, 
  Youtube, 
  Film, 
  Sparkles, 
  Grid, 
  Volume2, 
  VolumeX, 
  Radio, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  CornerDownLeft, 
  ArrowLeft, 
  Home, 
  Maximize2, 
  Minimize2, 
  X,
  Package,
  Award,
  BookOpen,
  Brain,
  Rocket,
  Paintbrush,
  ShieldCheck,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TvLauncherProps {
  onClose: () => void;
  onOpenApp?: (appId: string) => void;
  onLaunchApp?: (appId: string) => void;
  onChangeDeviceMode?: (mode: 'desktop' | 'mobile' | 'tablet' | 'tv') => void;
  gmailUser?: string;
  kidAvatar?: string;
}

export const TvLauncher: React.FC<TvLauncherProps> = ({
  onClose,
  onOpenApp,
  onLaunchApp,
  onChangeDeviceMode,
  gmailUser = 'Çocuk Hesabı',
  kidAvatar = '🦊'
}) => {
  const handleLaunch = (appId: string) => {
    if (onLaunchApp) onLaunchApp(appId);
    else if (onOpenApp) onOpenApp(appId);
  };
  const [activeTab, setActiveTab] = useState<'home' | 'kids_tv' | 'apps' | 'games' | 'channels'>('home');
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showRemote, setShowRemote] = useState<boolean>(true);
  const [showAmbient, setShowAmbient] = useState<boolean>(false);
  const [isTclGameMaster, setIsTclGameMaster] = useState<boolean>(true);
  const [playingChannel, setPlayingChannel] = useState<{ name: string; category: string; bg: string; icon: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // TV Categories & Content Items
  const featuredBanners = [
    {
      id: 'kidapp',
      title: 'TCL Android TV Kids World',
      subtitle: 'TCL AIPQ Engine ile 4K HDR Ultra Netlikte Çocuk Eğitimi & Oyunları',
      badge: 'TCL GOOGLE TV',
      bg: 'from-red-600/80 via-rose-600/60 to-black',
      actionText: 'Çocuk Dünyasını Başlat',
      icon: Award
    },
    {
      id: 'playstore',
      title: 'TCL Game Master & Play Store',
      subtitle: 'TCL D-Pad Kumanda ile Tam Uyumlu Çocuk Oyun ve Uygulamaları',
      badge: 'GAME MASTER 2.0',
      bg: 'from-emerald-600/80 via-teal-600/60 to-black',
      actionText: 'Mağazayı Aç',
      icon: Gamepad2
    }
  ];

  const liveChannels = [
    { id: 'tcl_channel', name: 'TCL Channel 4K Kids', category: 'TCL Özel Yayın Kuşağı', bg: 'bg-gradient-to-r from-red-600 via-rose-700 to-red-900', icon: '📺' },
    { id: 'trt_cocuk', name: 'TRT Çocuk Canlı Stream', category: 'Çizgi Film Kuşağı', bg: 'bg-gradient-to-r from-red-600 to-rose-800', icon: '🎈' },
    { id: 'bilim_tv', name: 'Bilim & Uzay TV 4K', category: 'Eğitici Belgesel', bg: 'bg-gradient-to-r from-purple-600 to-indigo-800', icon: '🚀' },
    { id: 'matematik_tv', name: 'Matematik & Zeka TV', category: 'Zeka Geliştirici', bg: 'bg-gradient-to-r from-blue-600 to-cyan-800', icon: '🧠' },
    { id: 'muzik_tv', name: 'Eğlenceli Müzik & Piyano', category: 'Çocuk Şarkıları', bg: 'bg-gradient-to-r from-emerald-600 to-green-800', icon: '🎵' },
  ];

  const tvGames = [
    { id: 'snake', name: 'Yılan Oyunu TV', desc: 'D-Pad Ok Tuşları ile Oyna', icon: Gamepad2, color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
    { id: 'minecraft', name: 'Minecraft 2D TV', desc: 'Blok Dünyasını Keşfet', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    { id: 'piano', name: 'Piano Kids TV', desc: 'Renkli Piyano Notaları', icon: Volume2, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
    { id: 'space', name: 'Uzay Macerası', desc: 'Gezegenler Arası Yolculuk', icon: Rocket, color: 'text-sky-400', bg: 'bg-sky-500/20 border-sky-500/30' },
  ];

  const tvApps = [
    { id: 'kidapp', name: 'ArchWeb Kids', desc: 'Çocuk Alanı & Ödevler', icon: '🦊', color: 'from-orange-500 to-amber-600' },
    { id: 'yt_kids', name: 'YouTube Kids TV', desc: 'Güvenli Çocuk Videoları', icon: '🔴', color: 'from-red-600 to-rose-700' },
    { id: 'playstore', name: 'Play Store TV', desc: 'TV Uygulamaları', icon: '🛍️', color: 'from-emerald-500 to-teal-600' },
    { id: 'apk', name: 'APK Yükleyici TV', desc: 'Android TV .APK Yükle', icon: '📦', color: 'from-sky-500 to-blue-600' },
    { id: 'browser', name: 'TV Web Tarayıcı', desc: 'Büyük Ekran İnternet', icon: '🌐', color: 'from-indigo-500 to-purple-600' },
    { id: 'files', name: 'TV Dosya Yöneticisi', desc: 'Medya & Depolama', icon: '📁', color: 'from-yellow-500 to-amber-600' },
  ];

  // Keyboard remote D-Pad simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playingChannel || showAmbient) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          setPlayingChannel(null);
          setShowAmbient(false);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        setSelectedRow(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        setSelectedRow(prev => Math.min(3, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => Math.min(5, prev + 1));
      } else if (e.key === 'Enter') {
        handleExecuteSelection();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, selectedIndex, playingChannel, showAmbient]);

  const handleExecuteSelection = () => {
    if (selectedRow === 0) {
      handleLaunch('kidapp');
    } else if (selectedRow === 1) {
      const ch = liveChannels[selectedIndex % liveChannels.length];
      setPlayingChannel(ch);
    } else if (selectedRow === 2) {
      const g = tvGames[selectedIndex % tvGames.length];
      handleLaunch(g.id);
    } else if (selectedRow === 3) {
      const a = tvApps[selectedIndex % tvApps.length];
      handleLaunch(a.id);
    }
  };

  const handleVoiceSearch = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
      setSearchQuery('Çizgi Film & Eğitici Videolar');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#0c0f17] text-white flex flex-col font-sans overflow-hidden select-none">
      
      {/* Ambient Screen Saver Mode */}
      <AnimatePresence>
        {showAmbient && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAmbient(false)}
            className="absolute inset-0 z-[1000] bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-12 flex flex-col justify-between cursor-pointer"
          >
            <div className="flex justify-between items-center text-white/60">
              <div className="flex items-center gap-2">
                <Tv className="text-sky-400" size={24} />
                <span className="font-bold tracking-widest text-sm">GOOGLE TV AMBIENT MODE</span>
              </div>
              <div className="text-xs bg-white/10 px-3 py-1 rounded-full">Kapatmak için ekrana tıklayın veya Escape'e basın</div>
            </div>

            <div className="space-y-4">
              <div className="text-7xl font-extralight tracking-tight text-white">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xl text-sky-300 font-light">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="p-4 bg-white/10 border border-white/10 rounded-2xl max-w-md backdrop-blur-md">
                <div className="text-xs font-bold text-yellow-300">Günün Çocuk İpucu 🦊</div>
                <div className="text-sm text-white/80 mt-1">"Matematik ve Boyama oyunlarında yıldız toplayarak yeni rozetler kazanabilirsin!"</div>
              </div>
            </div>

            <div className="text-xs text-white/40 font-mono">ArchWeb OS Google TV Engine v20.1.2</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Stream Player Modal */}
      <AnimatePresence>
        {playingChannel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[1000] bg-black flex flex-col justify-between p-8"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-2xl">{playingChannel.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-white">{playingChannel.name}</h3>
                  <p className="text-xs text-red-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" /> CANLIYAYIN (4K Ultra HD)
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setPlayingChannel(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Simulated Live Video Screen */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className={`w-full max-w-4xl aspect-video rounded-3xl ${playingChannel.bg} p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden border border-white/20`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/60 pointer-events-none" />
                <span className="text-7xl mb-4 animate-bounce">{playingChannel.icon}</span>
                <h2 className="text-3xl font-extrabold text-white tracking-wide mb-2">{playingChannel.name}</h2>
                <p className="text-white/80 max-w-md text-sm mb-6">4K Kesintisiz Çocuk ve Eğitim Yayını Simülasyonu Aktif</p>
                <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-full border border-white/20 text-xs font-mono">
                  <span>Ses: %100</span>
                  <span>|</span>
                  <span>Çözünürlük: 3840x2160 @ 60fps</span>
                  <span>|</span>
                  <span className="text-emerald-400">Gecikme: 12ms</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar Info */}
            <div className="flex justify-between items-center text-xs text-white/60 z-10 font-mono bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <span>Kumanda veya ESC ile yayından çıkabilirsiniz</span>
              <span className="text-sky-400">ArchWeb Android TV Stream Engine</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Google TV Header Bar */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl shrink-0 z-20">
        
        {/* Left: Branding & Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/30">
              <span className="font-black text-xs tracking-tighter">TCL</span>
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
                TCL Android TV <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">4K HDR</span>
              </div>
              <div className="text-[10px] text-white/50 font-mono flex items-center gap-1">
                <span>Google TV</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">AIPQ Engine Gen3</span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder={isVoiceListening ? "Dinleniyor..." : "TCL TV'de içerik veya oyun arayın..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 xl:w-72 bg-white/10 border border-white/15 focus:border-red-400 text-xs text-white px-4 py-2.5 rounded-full pl-9 pr-10 focus:outline-none transition-all placeholder:text-white/40"
            />
            <Search size={14} className="absolute left-3 text-white/50" />
            <button 
              onClick={handleVoiceSearch}
              className={`absolute right-2 p-1.5 rounded-full transition-all ${isVoiceListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
              title="TCL Google Asistan Sesli Arama"
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {[
            { id: 'home', label: 'Ana Sayfa' },
            { id: 'kids_tv', label: 'Çocuk TV' },
            { id: 'apps', label: 'Uygulamalar' },
            { id: 'games', label: 'Oyunlar' },
            { id: 'channels', label: 'Canlı Yayınlar' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-sky-500 text-white font-bold shadow-lg shadow-sky-500/30' : 'text-white/60 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right: Device Mode Switcher & Profile & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Mode Switcher Dropdown */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-xl p-1 text-xs">
            <button 
              onClick={() => onChangeDeviceMode('desktop')}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              title="Masaüstü Moduna Geç"
            >
              <Monitor size={12} />
              <span className="hidden sm:inline">Masaüstü</span>
            </button>
            <button 
              onClick={() => onChangeDeviceMode('mobile')}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              title="S8 Mobil Moduna Geç"
            >
              <span className="hidden sm:inline">S8 Mobil</span>
            </button>
            <button 
              onClick={() => onChangeDeviceMode('tablet')}
              className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              title="Tablet Moduna Geç"
            >
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button 
              className="px-2.5 py-1 rounded-lg bg-sky-500 text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="TV Modundasınız"
            >
              <Tv size={12} />
              <span>Google TV</span>
            </button>
          </div>

          <button 
            onClick={() => setShowAmbient(true)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-mono text-white/80 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            title="Ekran Koruyucu (Ambient Mode)"
          >
            <Sparkles size={14} className="text-yellow-400" />
            <span className="hidden md:inline">Ambient</span>
          </button>

          <button 
            onClick={() => setShowRemote(!showRemote)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${showRemote ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white/10 border-white/10 text-white/70 hover:text-white'}`}
            title="Sanal Kumandayı Aç/Kapat"
          >
            <Tv size={16} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-xl">{kidAvatar}</span>
            <div className="hidden xl:block">
              <div className="text-xs font-bold text-white leading-tight">{gmailUser.split('@')[0]}</div>
              <div className="text-[9px] text-emerald-400 font-mono">Çocuk Modu Aktif</div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all ml-2 cursor-pointer"
            title="TV Arayüzünü Kapat"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
        
        {/* Row 0: Featured Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-red-500/30 shadow-2xl bg-gradient-to-r from-red-950 via-rose-950 to-black p-8 md:p-12 flex flex-col justify-end min-h-[260px] group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-black/80 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 font-mono font-bold text-xs">
                <Sparkles size={12} /> TCL ANDROID TV & GOOGLE TV RESMİ SÜRÜMÜ
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-bold text-xs">
                <ShieldCheck size={12} /> TCL AIPQ PRO ENGINE
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              TCL Android TV Kids & Entertainment World
            </h1>
            
            <p className="text-sm md:text-base text-white/80 leading-relaxed">
              TCL Akıllı Televizyonunuzda 4K HDR görüntü kalitesi ve D-Pad TCL uzaktan kumanda ile kesintisiz çocuk öğrenme, oyun ve eğlence deneyimi.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button 
                onClick={() => handleLaunch('kidapp')}
                className={`px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer ${selectedRow === 0 ? 'ring-4 ring-white scale-105' : ''}`}
              >
                <Play size={18} />
                <span>Çocuk Dünyasını Başlat</span>
              </button>

              <button 
                onClick={() => handleLaunch('apk')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Package size={16} />
                <span>TCL Android TV .APK İndir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 1: Canlı TV & Çocuk Kanalları */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio size={18} className="text-red-400" />
              <span>Canlı Çocuk Kanalları & Yayınlar</span>
            </h2>
            <span className="text-xs text-white/40 font-mono">Kumanda ile tıklayıp izleyebilirsiniz</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveChannels.map((ch, idx) => {
              const isSelected = selectedRow === 1 && selectedIndex === idx;
              return (
                <div 
                  key={ch.id}
                  onClick={() => setPlayingChannel(ch)}
                  className={`p-5 rounded-2xl ${ch.bg} border border-white/10 flex flex-col justify-between h-36 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected ? 'ring-4 ring-white scale-105 shadow-2xl z-10' : 'hover:scale-[1.02]'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-3xl">{ch.icon}</span>
                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-mono text-white/80 border border-white/10">4K LIVE</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider block">{ch.category}</span>
                    <h3 className="font-bold text-white text-sm mt-0.5">{ch.name}</h3>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 2: TV Oyunları (D-Pad Uyumlu) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gamepad2 size={18} className="text-emerald-400" />
              <span>TV Oyunları (Kumanda Uyumlu)</span>
            </h2>
            <span className="text-xs text-emerald-400 font-mono">D-Pad Desteği Var</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tvGames.map((g, idx) => {
              const isSelected = selectedRow === 2 && selectedIndex === idx;
              const IconComp = g.icon;
              return (
                <div 
                  key={g.id}
                  onClick={() => handleLaunch(g.id)}
                  className={`p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between h-36 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-sky-400 bg-white/10 scale-105 shadow-2xl z-10' : 'hover:bg-white/10 hover:scale-[1.02]'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl ${g.bg}`}>
                      <IconComp size={20} className={g.color} />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">D-PAD OK</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{g.name}</h3>
                    <p className="text-xs text-white/50 mt-0.5">{g.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 3: Android TV Uygulamaları */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Grid size={18} className="text-sky-400" />
              <span>Android TV & Google TV Uygulamaları</span>
            </h2>
            <span className="text-xs text-white/40 font-mono">Tüm TV Araçları</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {tvApps.map((a, idx) => {
              const isSelected = selectedRow === 3 && selectedIndex === idx;
              return (
                <div 
                  key={a.id}
                  onClick={() => handleLaunch(a.id)}
                  className={`p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center justify-center gap-2 cursor-pointer transition-all duration-200 aspect-square ${isSelected ? 'ring-4 ring-sky-400 bg-white/15 scale-105 shadow-2xl z-10' : 'hover:bg-white/10 hover:scale-105'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {a.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs leading-tight">{a.name}</h3>
                    <p className="text-[10px] text-white/40 mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Floating On-Screen Virtual TV Remote Control */}
      <AnimatePresence>
        {showRemote && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[1000] bg-slate-900/90 backdrop-blur-2xl border border-white/20 p-4 rounded-3xl shadow-2xl w-52 flex flex-col items-center gap-3 text-white"
          >
            {/* Remote Top Branding */}
            <div className="w-full flex justify-between items-center text-[10px] font-bold font-mono text-white/70 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1"><span className="px-1 py-0.2 bg-red-600 text-white rounded font-black text-[9px]">TCL</span> SMART REMOTE</span>
              <button onClick={() => setShowRemote(false)} className="hover:text-white"><X size={12} /></button>
            </div>

            {/* TCL Hotkey Buttons */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <button 
                onClick={() => {
                  const ch = liveChannels.find(c => c.id === 'tcl_channel') || liveChannels[0];
                  setPlayingChannel(ch);
                }}
                className="py-1 px-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-[9px] font-extrabold text-white flex items-center justify-center gap-1 shadow cursor-pointer"
              >
                <span>TCL CHANNEL</span>
              </button>
              <button 
                onClick={() => setIsTclGameMaster(!isTclGameMaster)}
                className={`py-1 px-1.5 rounded-lg text-[9px] font-extrabold flex items-center justify-center gap-1 shadow cursor-pointer border ${isTclGameMaster ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/10 border-white/20 text-white/60'}`}
              >
                <Gamepad2 size={10} /> GAME MASTER
              </button>
            </div>

            {/* Top Function Buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <button 
                onClick={handleVoiceSearch}
                className="py-1.5 px-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-[10px] font-bold text-red-400 flex items-center justify-center gap-1"
              >
                <Mic size={12} /> Google Assistant
              </button>
              <button 
                onClick={onClose}
                className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[10px] font-bold text-white/80 flex items-center justify-center gap-1"
              >
                <Home size={12} /> Çıkış
              </button>
            </div>

            {/* D-Pad Circle Control */}
            <div className="relative w-36 h-36 bg-black/60 rounded-full border border-white/20 flex items-center justify-center shadow-inner">
              
              {/* Up Button */}
              <button 
                onClick={() => setSelectedRow(prev => Math.max(0, prev - 1))}
                className="absolute top-1 p-2 hover:bg-red-500/30 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronUp size={20} />
              </button>

              {/* Down Button */}
              <button 
                onClick={() => setSelectedRow(prev => Math.min(3, prev + 1))}
                className="absolute bottom-1 p-2 hover:bg-red-500/30 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronDown size={20} />
              </button>

              {/* Left Button */}
              <button 
                onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-1 p-2 hover:bg-red-500/30 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Right Button */}
              <button 
                onClick={() => setSelectedIndex(prev => Math.min(5, prev + 1))}
                className="absolute right-1 p-2 hover:bg-red-500/30 rounded-full text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>

              {/* OK / Center Button */}
              <button 
                onClick={handleExecuteSelection}
                className="w-14 h-14 bg-gradient-to-br from-red-600 to-rose-700 rounded-full font-bold text-xs text-white shadow-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                OK
              </button>
            </div>

            {/* Bottom Action Controls */}
            <div className="grid grid-cols-2 gap-2 w-full pt-1 border-t border-white/10">
              <button 
                onClick={() => {
                  if (playingChannel) setPlayingChannel(null);
                  else setSelectedRow(0);
                }}
                className="py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold text-white/80 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Geri
              </button>
              <button 
                onClick={() => setShowAmbient(true)}
                className="py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-[10px] font-bold text-red-300 flex items-center justify-center gap-1"
              >
                <Sparkles size={12} /> Ambient
              </button>
            </div>

            <div className="text-[8px] text-white/30 font-mono text-center">Klavye Yön Tuşları & Enter Çalışır</div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
