import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, Star, Download, ArrowLeft, Check, Play, Trash2, 
  Gamepad2, Palette, Music, Youtube, Heart, Cpu, Menu, Compass, Sparkles, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayStoreProps {
  onClose: () => void;
  mobileMode?: boolean;
}

interface AppItem {
  id: string;
  name: string;
  developer: string;
  category: 'games' | 'apps' | 'kids' | 'education';
  icon: React.ComponentType<{ size: number; className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  rating: number;
  reviews: string;
  downloads: string;
  size: string;
  description: string;
  screenshots: string[];
}

export const PlayStore: React.FC<PlayStoreProps> = ({ onClose, mobileMode = false }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'apps' | 'kids'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('playstore_installed_apps');
    return saved ? JSON.parse(saved) : {};
  });
  const [installProgress, setInstallProgress] = useState<Record<string, number>>({});
  const [runningApp, setRunningApp] = useState<string | null>(null);

  // Keep track of installation status in localStorage
  useEffect(() => {
    localStorage.setItem('playstore_installed_apps', JSON.stringify(installedApps));
  }, [installedApps]);

  const appList: AppItem[] = [
    {
      id: 'minecraft2d',
      name: 'Minecraft 2D Lite',
      developer: 'Mojang Sim',
      category: 'games',
      icon: Gamepad2,
      iconColor: '#4caf50',
      iconBg: 'bg-emerald-500/10',
      rating: 4.8,
      reviews: '124B',
      downloads: '10M+',
      size: '14 MB',
      description: 'Sanal blok dünyasında maden kazın, kendi evinizi ve dünyanızı inşa edin! Tamamen simüle edilmiş 2D blok kırma ve yerleştirme oyunu çocukların yaratıcılığını geliştirir.',
      screenshots: ['#1b4332', '#2d6a4f', '#40916c']
    },
    {
      id: 'piano_kids',
      name: 'Sihirli Çocuk Piyanosu',
      developer: 'Melody Labs',
      category: 'kids',
      icon: Music,
      iconColor: '#ff4081',
      iconBg: 'bg-pink-500/10',
      rating: 4.7,
      reviews: '48B',
      downloads: '5M+',
      size: '8 MB',
      description: 'Gerçek ses dalgası sentezleyici teknolojisiyle çalışan, rengarenk tuşlara sahip çocuk piyanosu. Kendi müziklerinizi besteleyin ve notaları eğlenceli bir şekilde öğrenin!',
      screenshots: ['#590d22', '#800f2f', '#a9103f']
    },
    {
      id: 'space_explorer',
      name: 'Uzay Serüveni',
      developer: 'Galaxy Games',
      category: 'games',
      icon: Compass,
      iconColor: '#2196f3',
      iconBg: 'bg-blue-500/10',
      rating: 4.5,
      reviews: '12B',
      downloads: '1M+',
      size: '12 MB',
      description: 'Roketinizi meteor yağmurlarından koruyun, uzay boşluğundaki parlayan yıldızları toplayarak rekor kırın! Klavye veya dokunmatik kontrollerle oynanan eğlenceli uzay kaçış simülatörü.',
      screenshots: ['#03045e', '#023e8a', '#0077b6']
    },
    {
      id: 'coloring_book',
      name: 'Sanal Boyama Dünyası',
      developer: 'Art Studio Kids',
      category: 'education',
      icon: Palette,
      iconColor: '#ffeb3b',
      iconBg: 'bg-yellow-500/10',
      rating: 4.6,
      reviews: '34B',
      downloads: '2M+',
      size: '10 MB',
      description: 'Birbirinden sevimli kedi, dinozor ve roket şablonlarını dilediğiniz gibi renklendirin! Gelişmiş fırça ve silgi modları içeren çocuk dostu çizim tableti uygulaması.',
      screenshots: ['#3a0ca3', '#4361ee', '#4cc9f0']
    },
    {
      id: 'yt_kids',
      name: 'YouTube Kids',
      developer: 'YouTube LLC Sim',
      category: 'apps',
      icon: Youtube,
      iconColor: '#f44336',
      iconBg: 'bg-red-500/10',
      rating: 4.9,
      reviews: '512B',
      downloads: '50M+',
      size: '18 MB',
      description: 'Telif haklarını %100 korumak için tasarlanmış, çocuk dostu, eğlenceli ve güvenli bir YouTube simülatör uygulaması. Özenle seçilmiş çizgi filmler ve animasyonlar içerir.',
      screenshots: ['#6411ad', '#8f2d56', '#d81159']
    },
    {
      id: 'bunny_pet',
      name: 'Sanal Tavşanım Bobo',
      developer: 'Pet Care Studio',
      category: 'kids',
      icon: Heart,
      iconColor: '#e040fb',
      iconBg: 'bg-purple-500/10',
      rating: 4.8,
      reviews: '89B',
      downloads: '10M+',
      size: '15 MB',
      description: 'Sevimli evcil tavşanınız Bobo\'yu besleyin, uyutun, onunla oyun oynayın! Açlık, enerji ve mutluluk barlarını doldurarak Bobo\'yu sağlıklı büyütün.',
      screenshots: ['#10002b', '#240046', '#3c096c']
    }
  ];

  const handleInstall = (appId: string) => {
    if (installedApps[appId]) return;

    setInstallProgress(prev => ({ ...prev, [appId]: 1 }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setInstalledApps(prev => ({ ...prev, [appId]: true }));
        setInstallProgress(prev => {
          const updated = { ...prev };
          delete updated[appId];
          return updated;
        });
      } else {
        setInstallProgress(prev => ({ ...prev, [appId]: progress }));
      }
    }, 150);
  };

  const handleUninstall = (appId: string) => {
    setInstalledApps(prev => {
      const updated = { ...prev };
      delete updated[appId];
      return updated;
    });
  };

  const filteredApps = appList.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.developer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'home') return matchesSearch;
    if (activeTab === 'games') return matchesSearch && app.category === 'games';
    if (activeTab === 'apps') return matchesSearch && app.category === 'apps';
    if (activeTab === 'kids') return matchesSearch && (app.category === 'kids' || app.category === 'education');
    return matchesSearch;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      className={`absolute transition-all duration-300 bg-[#f8f9fa] text-[#202124] border border-black/10 overflow-hidden shadow-2xl z-[75] flex flex-col font-sans ${mobileMode ? 'inset-x-0 top-8 bottom-0 rounded-none' : 'inset-4 md:inset-10 rounded-2xl'}`}
      id="playstore-window"
    >
      {/* Play Store Head */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedApp ? (
            <button 
              onClick={() => setSelectedApp(null)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white shadow-sm overflow-hidden">
                <svg viewBox="0 0 512 512" className="w-5 h-5 fill-current">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256.6L47 0zm425.2 225.6l-58-33.3-67.3 67.3 67.3 67.3 58-33.3c15.4-8.8 25.8-25.2 25.8-44s-10.4-35.2-25.8-44zm-147 62.1L104.6 499l220.7-126.7-60.1-60.1z"/>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-800 font-mono tracking-tight">Google Play</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!selectedApp && (
          <div className="flex-1 max-w-md mx-6">
            <div className="flex items-center gap-2 bg-[#f1f3f4] rounded-full px-4 py-1.5 border border-transparent focus-within:bg-white focus-within:border-gray-200 transition-all shadow-inner">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Uygulama ve oyun arayın" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-gray-700 w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          id="close-playstore-btn"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Tabs (Only when not in detail view) */}
        {!selectedApp && (
          <div className="w-16 md:w-48 bg-white border-r border-gray-200 flex flex-col py-4 gap-1">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col md:flex-row items-center gap-2 px-3 py-3 mx-2 rounded-xl text-left transition-colors ${activeTab === 'home' ? 'bg-[#e6f4ea] text-[#01875f]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Compass size={18} />
              <span className="text-[10px] md:text-xs font-semibold hidden md:inline">Ana Sayfa</span>
            </button>
            <button 
              onClick={() => setActiveTab('games')}
              className={`flex flex-col md:flex-row items-center gap-2 px-3 py-3 mx-2 rounded-xl text-left transition-colors ${activeTab === 'games' ? 'bg-[#e6f4ea] text-[#01875f]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Gamepad2 size={18} />
              <span className="text-[10px] md:text-xs font-semibold hidden md:inline">Oyunlar</span>
            </button>
            <button 
              onClick={() => setActiveTab('apps')}
              className={`flex flex-col md:flex-row items-center gap-2 px-3 py-3 mx-2 rounded-xl text-left transition-colors ${activeTab === 'apps' ? 'bg-[#e6f4ea] text-[#01875f]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Cpu size={18} />
              <span className="text-[10px] md:text-xs font-semibold hidden md:inline">Uygulamalar</span>
            </button>
            <button 
              onClick={() => setActiveTab('kids')}
              className={`flex flex-col md:flex-row items-center gap-2 px-3 py-3 mx-2 rounded-xl text-left transition-colors ${activeTab === 'kids' ? 'bg-[#e6f4ea] text-[#01875f]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Sparkles size={18} />
              <span className="text-[10px] md:text-xs font-semibold hidden md:inline">Çocuk Dünyası</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8f9fa]">
          <AnimatePresence mode="wait">
            {runningApp ? (
              <motion.div 
                key="running-app"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
              >
                {/* Embedded App Frame Title Bar */}
                <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold">{appList.find(a => a.id === runningApp)?.name}</span>
                  </div>
                  <button 
                    onClick={() => setRunningApp(null)}
                    className="flex items-center gap-1.5 px-3 py-1 text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors"
                  >
                    <X size={12} />
                    Uygulamayı Kapat
                  </button>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50">
                  {runningApp === 'minecraft2d' && <Minecraft2D />}
                  {runningApp === 'piano_kids' && <PianoKids />}
                  {runningApp === 'space_explorer' && <SpaceExplorer />}
                  {runningApp === 'coloring_book' && <ColoringBook />}
                  {runningApp === 'yt_kids' && <YTKids />}
                  {runningApp === 'bunny_pet' && <BunnyPet />}
                </div>
              </motion.div>
            ) : selectedApp ? (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row gap-8"
              >
                {/* Detail Left - App Header and Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex gap-4">
                    <div className={`w-24 h-24 rounded-2xl ${selectedApp.iconBg} flex items-center justify-center text-white`}>
                      <selectedApp.icon size={52} style={{ color: selectedApp.iconColor }} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{selectedApp.name}</h2>
                      <p className="text-xs font-bold text-[#01875f]">{selectedApp.developer}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{selectedApp.category} • Reklamsız</p>
                    </div>
                  </div>

                  {/* Play Store Quick Specs */}
                  <div className="grid grid-cols-4 gap-2 border-y border-gray-100 py-3.5 text-center">
                    <div className="border-r border-gray-100">
                      <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-gray-800">
                        {selectedApp.rating} <Star size={12} className="fill-amber-400 text-amber-400" />
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium">{selectedApp.reviews} yorum</div>
                    </div>
                    <div className="border-r border-gray-100">
                      <div className="text-xs font-bold text-gray-800">{selectedApp.size}</div>
                      <div className="text-[9px] text-gray-400 font-medium">Dosya Boyutu</div>
                    </div>
                    <div className="border-r border-gray-100">
                      <div className="text-xs font-bold text-gray-800">PEGI 3</div>
                      <div className="text-[9px] text-gray-400 font-medium">Her Yaşa Uygun</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{selectedApp.downloads}</div>
                      <div className="text-[9px] text-gray-400 font-medium">İndirme</div>
                    </div>
                  </div>

                  {/* Actions / Install button */}
                  <div className="flex items-center gap-3">
                    {installedApps[selectedApp.id] ? (
                      <>
                        <button 
                          onClick={() => setRunningApp(selectedApp.id)}
                          className="flex-1 py-2.5 rounded-full bg-[#01875f] hover:bg-[#00704e] text-white font-bold text-xs shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play size={14} /> Uygulamayı Çalıştır
                        </button>
                        <button 
                          onClick={() => handleUninstall(selectedApp.id)}
                          className="px-4 py-2.5 rounded-full border border-red-200 hover:bg-red-50 text-red-500 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} /> Kaldır
                        </button>
                      </>
                    ) : installProgress[selectedApp.id] !== undefined ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-gray-600">
                          <span>Yükleniyor...</span>
                          <span>%{installProgress[selectedApp.id]}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#01875f] transition-all duration-150" 
                            style={{ width: `${installProgress[selectedApp.id]}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleInstall(selectedApp.id)}
                        className="flex-1 py-2.5 rounded-full bg-[#01875f] hover:bg-[#00704e] text-white font-bold text-xs shadow-md shadow-emerald-700/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} /> Yükle
                      </button>
                    )}
                  </div>

                  {/* About App */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Uygulama Hakkında</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{selectedApp.description}</p>
                  </div>
                </div>

                {/* Detail Right - Mock Screenshots */}
                <div className="w-full md:w-64 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ekran Görüntüleri</h4>
                  <div className="flex md:flex-col gap-3 overflow-x-auto pb-2">
                    {selectedApp.screenshots.map((color, idx) => (
                      <div 
                        key={idx} 
                        className="w-40 md:w-full h-24 rounded-xl shadow-inner border border-black/5 flex items-center justify-center text-white/10 font-bold font-mono text-[10px]"
                        style={{ backgroundColor: color }}
                      >
                        Screenshot {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="store-front"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Banner Promotion */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-800/10 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none select-none flex items-center justify-center">
                    <Sparkles size={120} />
                  </div>
                  <div className="max-w-md space-y-2 relative z-10">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/25 text-[9px] uppercase font-bold tracking-wider">Haftanın Seçimi</span>
                    <h3 className="text-lg font-extrabold tracking-tight">Eğitici ve Güvenli Çocuk Oyunları</h3>
                    <p className="text-[11px] text-white/80 leading-relaxed">Play Store\'da yer alan oyun ve araçlarla çocuklar eğlenirken kendilerini geliştiriyor. Tamamen reklamsız ve güvenli simülatörleri hemen yükleyin.</p>
                  </div>
                </div>

                {/* App Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={14} className="text-[#01875f]" />
                    Önerilen Uygulamalar ({filteredApps.length})
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApps.map((app) => {
                      const isInstalled = installedApps[app.id];
                      const progress = installProgress[app.id];
                      return (
                        <div 
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex gap-4 relative overflow-hidden group"
                        >
                          <div className={`w-14 h-14 rounded-xl ${app.iconBg} flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0`}>
                            <app.icon size={30} style={{ color: app.iconColor }} />
                          </div>
                          
                          <div className="flex-1 space-y-1 overflow-hidden">
                            <h4 className="text-xs font-bold text-gray-800 truncate">{app.name}</h4>
                            <p className="text-[10px] text-gray-400 truncate">{app.developer}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span className="flex items-center font-bold text-gray-700">
                                {app.rating} <Star size={10} className="fill-amber-400 text-amber-400 inline ml-0.5" />
                              </span>
                              <span>•</span>
                              <span>{app.size}</span>
                            </div>
                          </div>

                          {/* Action badge */}
                          <div className="absolute right-3 top-3">
                            {isInstalled ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <Check size={8} /> Yüklü
                              </span>
                            ) : progress !== undefined ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[8px] font-bold text-blue-600 animate-pulse">
                                %{progress}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

/* ==========================================================================
   1. MINECRAFT 2D LITE MINI GAME
   ========================================================================== */
const Minecraft2D: React.FC = () => {
  const [tool, setTool] = useState<'dig' | 'dirt' | 'brick' | 'wood' | 'leaf' | 'diamond'>('dig');
  const [grid, setGrid] = useState<string[][]>(() => {
    // Generate a beautiful 2D Minecraft sky, grass, dirt, stone layout
    const rows = 12;
    const cols = 20;
    const initial: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        if (r < 5) {
          row.push('sky');
        } else if (r === 5) {
          row.push('grass');
        } else if (r < 9) {
          row.push('dirt');
        } else {
          // randomized stone or diamonds
          const rand = Math.random();
          if (rand < 0.12) row.push('diamond');
          else if (rand < 0.3) row.push('coal');
          else row.push('stone');
        }
      }
      initial.push(row);
    }
    return initial;
  });

  const getBlockStyles = (type: string) => {
    switch (type) {
      case 'sky': return 'bg-sky-400/20 hover:bg-sky-400/40 border border-sky-400/10';
      case 'grass': return 'bg-emerald-600 border border-emerald-700 shadow-inner';
      case 'dirt': return 'bg-amber-900 border border-amber-950';
      case 'stone': return 'bg-gray-500 border border-gray-600';
      case 'coal': return 'bg-gray-800 border border-black flex items-center justify-center';
      case 'diamond': return 'bg-cyan-500 border border-cyan-600 animate-pulse';
      case 'brick': return 'bg-red-600 border border-red-700';
      case 'wood': return 'bg-amber-700 border border-amber-800';
      case 'leaf': return 'bg-green-500 border border-green-600';
      default: return 'bg-sky-300';
    }
  };

  const handleBlockClick = (r: number, c: number) => {
    const updated = [...grid.map(row => [...row])];
    if (tool === 'dig') {
      if (grid[r][c] !== 'sky') {
        updated[r][c] = 'sky';
      }
    } else {
      if (grid[r][c] === 'sky') {
        updated[r][c] = tool;
      }
    }
    setGrid(updated);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-[#1e2022] h-full text-white">
      <div className="flex items-center justify-between w-full max-w-xl pb-2 border-b border-white/10">
        <span className="text-xs font-mono font-bold text-emerald-400">Yaratıcı Mod: 2D Dünya İnşaat</span>
        <button 
          onClick={() => {
            // reset
            const rows = 12;
            const cols = 20;
            const initial: string[][] = [];
            for (let r = 0; r < rows; r++) {
              const row: string[] = [];
              for (let c = 0; c < cols; c++) {
                if (r < 5) row.push('sky');
                else if (r === 5) row.push('grass');
                else if (r < 9) row.push('dirt');
                else row.push(Math.random() < 0.15 ? 'diamond' : 'stone');
              }
              initial.push(row);
            }
            setGrid(initial);
          }}
          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] font-bold"
        >
          Dünyayı Sıfırla
        </button>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-20 gap-0.5 w-full max-w-2xl bg-black/40 p-2 rounded-xl border border-white/5 select-none aspect-video">
        {grid.map((row, r) => 
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`}
              onClick={() => handleBlockClick(r, c)}
              className={`aspect-square cursor-pointer transition-all ${getBlockStyles(cell)}`}
              title={cell}
            >
              {cell === 'diamond' && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 animate-ping" />}
              {cell === 'coal' && <div className="w-1.5 h-1.5 bg-black rounded mx-auto mt-1" />}
            </div>
          ))
        )}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap justify-center p-3 bg-black/20 rounded-xl border border-white/5 w-full max-w-xl">
        <button 
          onClick={() => setTool('dig')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${tool === 'dig' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          ⛏️ Kazma (Kır)
        </button>
        <button 
          onClick={() => setTool('dirt')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'dirt' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🟫 Toprak Koy
        </button>
        <button 
          onClick={() => setTool('brick')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'brick' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🧱 Tuğla Koy
        </button>
        <button 
          onClick={() => setTool('wood')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'wood' ? 'bg-amber-700 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🪵 Ahşap Koy
        </button>
        <button 
          onClick={() => setTool('leaf')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'leaf' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          🍃 Yaprak Koy
        </button>
        <button 
          onClick={() => setTool('diamond')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'diamond' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
        >
          💎 Elmas Koy
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. PIANO KIDS SYNTH MINI APP
   ========================================================================== */
const PianoKids: React.FC = () => {
  const notes = [
    { name: 'C', label: 'Do', freq: 261.63, color: 'bg-red-500 border-red-600 text-white' },
    { name: 'D', label: 'Re', freq: 293.66, color: 'bg-orange-500 border-orange-600 text-white' },
    { name: 'E', label: 'Mi', freq: 329.63, color: 'bg-yellow-500 border-yellow-600 text-gray-800' },
    { name: 'F', label: 'Fa', freq: 349.23, color: 'bg-green-500 border-green-600 text-white' },
    { name: 'G', label: 'Sol', freq: 392.00, color: 'bg-blue-500 border-blue-600 text-white' },
    { name: 'A', label: 'La', freq: 440.00, color: 'bg-indigo-500 border-indigo-600 text-white' },
    { name: 'B', label: 'Si', freq: 493.88, color: 'bg-purple-500 border-purple-600 text-white' },
    { name: 'C2', label: 'Do2', freq: 523.25, color: 'bg-pink-500 border-pink-600 text-white' }
  ];

  const playSound = (freq: number) => {
    try {
      // Create actual Web Audio Context sound
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // friendly sine-like sound for children
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-purple-900 to-indigo-950 h-full text-white">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-extrabold tracking-wide uppercase text-pink-300">🎵 Sihirli Çocuk Piyanosu 🎵</h3>
        <p className="text-[10px] text-purple-200">Rengarenk tuşlara dokunarak kendi ezgilerini çalmaya başla!</p>
      </div>

      <div className="flex gap-2 p-4 bg-black/30 rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full aspect-[2/1]">
        {notes.map((note) => (
          <button 
            key={note.name}
            onClick={() => playSound(note.freq)}
            className={`flex-1 rounded-xl border-b-8 flex flex-col justify-end items-center pb-4 transition-all duration-75 active:translate-y-1.5 active:border-b-2 hover:brightness-110 active:brightness-95 cursor-pointer shadow-lg select-none ${note.color}`}
          >
            <span className="text-xs font-bold font-mono uppercase">{note.name}</span>
            <span className="text-[10px] font-semibold opacity-80">{note.label}</span>
          </button>
        ))}
      </div>

      <div className="text-[9px] text-purple-300 font-mono flex items-center gap-1.5">
        <span>Bilgi: Web Audio API kullanılarak gerçek zamanlı dalga sentezlenmektedir.</span>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. SPACE EXPLORER MINI GAME (Canvas Keyboard or Touch)
   ========================================================================== */
const SpaceExplorer: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return Number(localStorage.getItem('space_high_score') || '0');
  });
  const [rocketX, setRocketX] = useState(50); // percentage 0 to 100
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([]);
  
  const requestRef = useRef<number | null>(null);
  const nextItemId = useRef(0);

  // Restart game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setRocketX(50);
    setAsteroids([]);
    setStars([]);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let localAsteroids = [...asteroids];
    let localStars = [...stars];
    let frameScore = 0;

    const gameLoop = () => {
      // Spawning odds
      if (Math.random() < 0.04) {
        localAsteroids.push({
          id: nextItemId.current++,
          x: Math.random() * 90 + 5,
          y: -10,
          size: Math.random() * 15 + 10
        });
      }

      if (Math.random() < 0.03) {
        localStars.push({
          id: nextItemId.current++,
          x: Math.random() * 90 + 5,
          y: -10
        });
      }

      // Move Asteroids
      localAsteroids = localAsteroids
        .map(ast => ({ ...ast, y: ast.y + 1.8 }))
        .filter(ast => ast.y < 110);

      // Move Stars
      localStars = localStars
        .map(star => ({ ...star, y: star.y + 1.2 }))
        .filter(star => star.y < 110);

      // Check Collision with Rocket (X threshold 8%)
      const hitAsteroid = localAsteroids.some(ast => {
        return Math.abs(ast.x - rocketX) < 10 && ast.y > 80 && ast.y < 95;
      });

      if (hitAsteroid) {
        setGameState('gameover');
        if (score + frameScore > highScore) {
          setHighScore(score + frameScore);
          localStorage.setItem('space_high_score', String(score + frameScore));
        }
        return;
      }

      // Collect stars
      const initialStarCount = localStars.length;
      localStars = localStars.filter(star => {
        const collected = Math.abs(star.x - rocketX) < 10 && star.y > 80 && star.y < 95;
        if (collected) {
          frameScore += 10;
        }
        return !collected;
      });

      if (frameScore > 0) {
        setScore(prev => prev + frameScore);
        frameScore = 0;
      }

      // Update refs
      setAsteroids(localAsteroids);
      setStars(localStars);

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, rocketX, score, highScore]);

  return (
    <div className="p-4 flex flex-col items-center justify-center bg-gray-950 h-full text-white font-mono select-none">
      <div className="flex justify-between w-full max-w-md pb-2 border-b border-white/10 text-xs">
        <span className="text-yellow-400">Skor: {score}</span>
        <span className="text-blue-400">En Yüksek: {highScore}</span>
      </div>

      {/* Screen Box */}
      <div className="w-full max-w-md h-72 bg-slate-900 border-2 border-white/10 rounded-2xl relative overflow-hidden my-4 shadow-2xl">
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 text-center p-4">
            <span className="text-lg font-bold text-blue-400 tracking-wider">🚀 UZAY SERÜVENİ 🚀</span>
            <p className="text-[10px] text-gray-400">Yıldızları topla, meteorlardan kaç! Sol/sağ tuşlarıyla roketini yönlendir.</p>
            <button 
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 font-bold text-xs rounded-full transition-transform hover:scale-105 cursor-pointer"
            >
              Oyunu Başlat
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-3 text-center p-4">
            <span className="text-sm font-extrabold text-red-500 tracking-widest">💥 GÖREV BAŞARISIZ! 💥</span>
            <span className="text-xs text-white/80">Elde Ettiğin Skor: {score}</span>
            <button 
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 font-bold text-xs rounded-full transition-transform hover:scale-105 cursor-pointer"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {/* Space Elements */}
        {gameState === 'playing' && (
          <>
            {/* Rocket */}
            <div 
              className="absolute bottom-4 -translate-x-1/2 text-2xl transition-all duration-75 select-none"
              style={{ left: `${rocketX}%` }}
            >
              🚀
            </div>

            {/* Asteroids */}
            {asteroids.map(ast => (
              <div 
                key={ast.id}
                className="absolute select-none"
                style={{ left: `${ast.x}%`, top: `${ast.y}%`, fontSize: `${ast.size}px` }}
              >
                ☄️
              </div>
            ))}

            {/* Stars */}
            {stars.map(star => (
              <div 
                key={star.id}
                className="absolute text-yellow-300 animate-pulse select-none text-sm"
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
              >
                ⭐
              </div>
            ))}
          </>
        )}
      </div>

      {/* Controllers */}
      {gameState === 'playing' && (
        <div className="flex gap-4 w-full max-w-xs">
          <button 
            onMouseDown={() => setRocketX(prev => Math.max(5, prev - 10))}
            onTouchStart={() => setRocketX(prev => Math.max(5, prev - 10))}
            className="flex-1 py-3 bg-white/5 hover:bg-white/15 border border-white/10 active:bg-blue-500/20 active:border-blue-500/50 rounded-xl font-bold text-sm cursor-pointer select-none"
          >
            ◀ SOL
          </button>
          <button 
            onMouseDown={() => setRocketX(prev => Math.min(95, prev + 10))}
            onTouchStart={() => setRocketX(prev => Math.min(95, prev + 10))}
            className="flex-1 py-3 bg-white/5 hover:bg-white/15 border border-white/10 active:bg-blue-500/20 active:border-blue-500/50 rounded-xl font-bold text-sm cursor-pointer select-none"
          >
            SAĞ ▶
          </button>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   4. COLORING BOOK MINI APP
   ========================================================================== */
const ColoringBook: React.FC = () => {
  const [color, setColor] = useState('#ef4444');
  const [pixels, setPixels] = useState<Record<string, string>>({});
  
  const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ffffff'];

  const rows = 12;
  const cols = 12;

  const handleCellClick = (r: number, c: number) => {
    setPixels(prev => ({
      ...prev,
      [`${r}-${c}`]: color
    }));
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-gray-50 h-full text-gray-800">
      <div className="text-center space-y-1">
        <h3 className="text-xs font-extrabold text-[#01875f] uppercase tracking-wider">🎨 Çocuk Boyama Matrisi 🎨</h3>
        <p className="text-[9px] text-gray-500">Kutuları boyayarak piksel sanatı çizimleri oluştur!</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-px bg-gray-300 p-1.5 rounded-xl max-w-sm w-full aspect-square shadow-md border border-gray-200">
        {Array.from({ length: rows }).map((_, r) => 
          Array.from({ length: cols }).map((_, c) => {
            const cellColor = pixels[`${r}-${c}`] || '#ffffff';
            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className="aspect-square cursor-pointer transition-colors border-[0.5px] border-gray-100 hover:brightness-95"
                style={{ backgroundColor: cellColor }}
              />
            );
          })
        )}
      </div>

      {/* Palette Selection */}
      <div className="flex gap-2.5 p-2.5 bg-white rounded-xl shadow-sm border border-gray-200">
        {palette.map(col => (
          <button 
            key={col}
            onClick={() => setColor(col)}
            className={`w-7 h-7 rounded-full border transition-transform hover:scale-110 cursor-pointer ${color === col ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2' : 'border-gray-200'}`}
            style={{ backgroundColor: col }}
          />
        ))}
      </div>

      <button 
        onClick={() => setPixels({})}
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] font-bold text-gray-600 transition-colors"
      >
        Tuali Temizle
      </button>
    </div>
  );
};

/* ==========================================================================
   5. ARCHWEB KIDS VIDEO (YT KIDS SIMULATOR)
   ========================================================================== */
interface VideoItem {
  id: string;
  title: string;
  category: string;
  color: string;
  duration: string;
}

const YTKids: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const videos: VideoItem[] = [
    { id: '1', title: 'Rengarenk Balonlar Çocuk Şarkısı', category: 'Müzik', color: 'from-pink-500 to-purple-600', duration: '2:15' },
    { id: '2', title: 'Sevimli Köpek Bobi Ormanda', category: 'Çizgi Film', color: 'from-amber-400 to-red-500', duration: '3:40' },
    { id: '3', title: 'Neden Gökyüzü Mavidir? (Bilim Deneyi)', category: 'Bilim', color: 'from-cyan-400 to-blue-600', duration: '4:10' },
    { id: '4', title: 'Dinozorlar Çağını Öğrenelim', category: 'Tarih', color: 'from-emerald-400 to-green-600', duration: '5:20' }
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return p + 2;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="p-4 bg-gray-50 h-full text-gray-800 flex flex-col font-sans">
      <div className="pb-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Youtube size={20} className="text-red-500 fill-red-500" />
          <span className="text-xs font-extrabold tracking-tight text-gray-900">YouTube Kids</span>
        </div>
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
          🛡️ Telif Korumalı (Simülatör)
        </span>
      </div>

      {selectedVideo ? (
        <div className="flex-1 flex flex-col justify-center items-center py-4 gap-4 max-w-xl mx-auto w-full">
          {/* Mock Video Canvas */}
          <div className={`w-full aspect-video rounded-2xl bg-gradient-to-tr ${selectedVideo.color} flex flex-col items-center justify-center text-white relative overflow-hidden shadow-lg border border-black/10`}>
            {isPlaying ? (
              <div className="flex flex-col items-center gap-2 text-center p-6 animate-pulse">
                <span className="text-4xl">🍿</span>
                <span className="text-xs font-bold tracking-tight">{selectedVideo.title}</span>
                <span className="text-[10px] text-white/70">Oynatılıyor...</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsPlaying(true)}
                className="w-16 h-16 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              >
                <Play size={28} className="fill-red-500 ml-1" />
              </button>
            )}

            {/* Video Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
              <div className="h-full bg-red-500 transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">{selectedVideo.title}</h4>
              <p className="text-[10px] text-gray-500">{selectedVideo.category} • {selectedVideo.duration}</p>
            </div>
            <button 
              onClick={() => {
                setSelectedVideo(null);
                setIsPlaying(false);
                setProgress(0);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-[10px] font-bold text-gray-600 transition-colors"
            >
              Videolara Dön
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-4 grid grid-cols-2 gap-4">
          {videos.map(video => (
            <div 
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md cursor-pointer flex flex-col"
            >
              <div className={`w-full h-24 bg-gradient-to-tr ${video.color} flex items-center justify-center text-white/50 text-2xl font-bold font-mono`}>
                ▶
              </div>
              <div className="p-2.5 space-y-1">
                <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{video.category}</span>
                <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1 leading-snug">{video.title}</h4>
                <p className="text-[9px] text-gray-400 font-medium">Süre: {video.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   6. BUNNY PET LITE MINI GAME
   ========================================================================== */
const BunnyPet: React.FC = () => {
  const [bunnyState, setBunnyState] = useState<'idle' | 'eating' | 'sleeping' | 'playing'>('idle');
  const [stats, setStats] = useState({ hunger: 70, energy: 60, love: 80 });

  const feedBunny = () => {
    setBunnyState('eating');
    setStats(prev => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 15),
      love: Math.min(100, prev.love + 5)
    }));
    setTimeout(() => setBunnyState('idle'), 1500);
  };

  const sleepBunny = () => {
    setBunnyState('sleeping');
    setStats(prev => ({
      ...prev,
      energy: Math.min(100, prev.energy + 20)
    }));
    setTimeout(() => setBunnyState('idle'), 2000);
  };

  const playBunny = () => {
    setBunnyState('playing');
    setStats(prev => ({
      ...prev,
      hunger: Math.max(10, prev.hunger - 10),
      energy: Math.max(10, prev.energy - 15),
      love: Math.min(100, prev.love + 12)
    }));
    setTimeout(() => setBunnyState('idle'), 1500);
  };

  return (
    <div className="p-4 bg-pink-50/50 h-full text-gray-800 flex flex-col items-center justify-center font-sans">
      <div className="text-center space-y-1 pb-3">
        <h3 className="text-xs font-extrabold text-pink-600 uppercase tracking-wider">🐰 Sanal Tavşanım Bobo 🐰</h3>
        <p className="text-[9px] text-gray-500">Bobo\'nun mutlu olması için ona iyi bak!</p>
      </div>

      {/* Bunny Avatar Canvas */}
      <div className="w-40 h-40 rounded-full bg-white/80 border-2 border-pink-200 shadow-inner flex items-center justify-center relative select-none">
        {bunnyState === 'idle' && (
          <div className="flex flex-col items-center animate-bounce duration-[2000ms]">
            <span className="text-6xl">🐰</span>
            <span className="text-[9px] font-bold text-pink-500 mt-1">Bobo keyifli</span>
          </div>
        )}
        {bunnyState === 'eating' && (
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-6xl">🥕🐰</span>
            <span className="text-[9px] font-bold text-emerald-500 mt-1">Ham hum kıtır kıtır!</span>
          </div>
        )}
        {bunnyState === 'sleeping' && (
          <div className="flex flex-col items-center">
            <span className="text-6xl">😴🐰</span>
            <span className="text-[9px] font-bold text-blue-500 mt-1">Zzz... Mışıl mışıl</span>
          </div>
        )}
        {bunnyState === 'playing' && (
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-6xl">⚽🐰</span>
            <span className="text-[9px] font-bold text-purple-500 mt-1">Hoppa! Çok eğlenceli</span>
          </div>
        )}
      </div>

      {/* Stats indicators */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm py-4">
        <div className="bg-white border border-gray-100 p-2 rounded-xl text-center shadow-sm">
          <div className="text-[10px] font-bold text-gray-400">Tokluk</div>
          <div className="text-xs font-extrabold text-emerald-500">%{stats.hunger}</div>
        </div>
        <div className="bg-white border border-gray-100 p-2 rounded-xl text-center shadow-sm">
          <div className="text-[10px] font-bold text-gray-400">Enerji</div>
          <div className="text-xs font-extrabold text-blue-500">%{stats.energy}</div>
        </div>
        <div className="bg-white border border-gray-100 p-2 rounded-xl text-center shadow-sm">
          <div className="text-[10px] font-bold text-gray-400">Sevgi</div>
          <div className="text-xs font-extrabold text-pink-500">%{stats.love}</div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex gap-2 w-full max-w-sm">
        <button 
          onClick={feedBunny}
          disabled={bunnyState !== 'idle'}
          className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          🥕 Besle
        </button>
        <button 
          onClick={sleepBunny}
          disabled={bunnyState !== 'idle'}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          💤 Uyut
        </button>
        <button 
          onClick={playBunny}
          disabled={bunnyState !== 'idle'}
          className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-500/10 cursor-pointer"
        >
          ⚽ Oyun Oyna
        </button>
      </div>
    </div>
  );
};
