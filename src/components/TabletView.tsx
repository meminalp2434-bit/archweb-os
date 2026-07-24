import React, { useState } from 'react';
import { 
  Tablet, 
  Award, 
  Brain, 
  BookOpen, 
  Gamepad2, 
  Paintbrush, 
  Rocket, 
  Sparkles, 
  Calendar, 
  CloudSun, 
  FileText, 
  Folder, 
  Settings as SettingsIcon, 
  Search, 
  Monitor, 
  Tv, 
  Smartphone, 
  X, 
  Home, 
  ChevronLeft, 
  Grid, 
  Maximize2,
  CheckCircle2,
  Cpu,
  Wifi,
  Battery
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TabletViewProps {
  onClose: () => void;
  onOpenApp?: (appId: string) => void;
  onLaunchApp?: (appId: string) => void;
  onChangeDeviceMode?: (mode: 'desktop' | 'mobile' | 'tablet' | 'tv') => void;
  gmailUser?: string;
  kidAvatar?: string;
}

export const TabletView: React.FC<TabletViewProps> = ({
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
  const [activeWidgetTab, setActiveWidgetTab] = useState<'all' | 'kids' | 'games' | 'tools'>('all');
  const [quickNote, setQuickNote] = useState<string>('Bugünkü Ödevlerim:\n1. Matematik testi çöz\n2. 20 sayfa kitap oku');

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="fixed inset-0 z-[990] bg-[#0f172a] text-white flex flex-col font-sans select-none overflow-hidden">
      
      {/* Tablet Status & Header Bar */}
      <header className="h-10 px-6 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <Tablet size={16} className="text-purple-400" />
          <span className="font-bold text-white">ArchWeb Tablet OS</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px]">10.5" HD Touch</span>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Device Mode Switcher */}
          <div className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-lg p-0.5 text-[11px]">
            <button 
              onClick={() => onChangeDeviceMode('desktop')}
              className="px-2 py-0.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Monitor size={10} />
              <span>Masaüstü</span>
            </button>
            <button 
              onClick={() => onChangeDeviceMode('mobile')}
              className="px-2 py-0.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Smartphone size={10} />
              <span>S8 Mobil</span>
            </button>
            <button 
              className="px-2 py-0.5 rounded bg-purple-500 text-white font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Tablet size={10} />
              <span>Tablet</span>
            </button>
            <button 
              onClick={() => onChangeDeviceMode('tv')}
              className="px-2 py-0.5 rounded hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
            >
              <Tv size={10} />
              <span>Google TV</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Wifi size={12} />
            <Battery size={12} />
            <span className="text-white font-bold">{currentTime}</span>
          </div>

          <button onClick={onClose} className="hover:text-white p-1 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Tablet Screen Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 scrollbar-hide">
        
        {/* Tablet Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 p-6 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-4xl shadow-inner">
              {kidAvatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Hoş Geldin, {gmailUser.split('@')[0]} 👋
              </h1>
              <p className="text-xs text-purple-200/80 mt-1">Tablet Modu: Dokunmatik Ekran & Widget Düzeni Aktif</p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-yellow-300 font-bold">
              <Award size={16} />
              <span>1,250 Puan</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 size={16} />
              <span>4/5 Görev</span>
            </div>
          </div>
        </div>

        {/* Tablet Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Widget 1: Kids World Main Tile */}
          <div 
            onClick={() => handleLaunch('kidapp')}
            className="md:col-span-2 bg-gradient-to-br from-amber-500/20 via-orange-600/20 to-purple-900/40 border border-amber-500/30 rounded-3xl p-6 cursor-pointer hover:scale-[1.01] transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity" />
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                <Sparkles size={14} /> ÇOCUK DÜNYASI TABLET
              </div>
              <span className="text-3xl">🦊</span>
            </div>

            <div className="my-4 space-y-1">
              <h2 className="text-2xl font-bold text-white">ArchWeb Kids Tablet Edition</h2>
              <p className="text-xs text-white/70 max-w-md">Eğlenceli oyunlar, matematik soruları, çizim tuvali ve yapay zeka ödev asistanı.</p>
            </div>

            <button className="self-start px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2">
              <span>Uygulamaya Git</span>
              <ChevronLeft size={14} className="rotate-180" />
            </button>
          </div>

          {/* Widget 2: Weather & Clock Tablet Tile */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-sky-400 font-mono">HAVA DURUMU</span>
              <CloudSun size={24} className="text-amber-400" />
            </div>

            <div className="my-2">
              <div className="text-4xl font-extrabold text-white">24°C</div>
              <div className="text-xs text-white/60 mt-1">Güneşli • İstanbul</div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-white/50 font-mono">
              <span>{currentDate}</span>
              <span>{currentTime}</span>
            </div>
          </div>

        </div>

        {/* Tablet Apps & Games Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Grid size={18} className="text-purple-400" />
              <span>Tablet Uygulamaları</span>
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {['all', 'kids', 'games', 'tools'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveWidgetTab(tab as any)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${activeWidgetTab === tab ? 'bg-purple-500 text-white font-bold' : 'text-white/50 hover:text-white bg-white/5'}`}
                >
                  {tab === 'all' ? 'Tümü' : tab === 'kids' ? 'Çocuk' : tab === 'games' ? 'Oyunlar' : 'Araçlar'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'kidapp', name: 'Kids World', category: 'kids', icon: '🦊', color: 'from-amber-500 to-orange-600' },
              { id: 'snake', name: 'Yılan Oyunu', category: 'games', icon: '🐍', color: 'from-emerald-500 to-teal-600' },
              { id: 'paint', name: 'Sihirli Tuval', category: 'kids', icon: '🎨', color: 'from-pink-500 to-rose-600' },
              { id: 'playstore', name: 'Play Store', category: 'tools', icon: '🛍️', color: 'from-blue-500 to-indigo-600' },
              { id: 'browser', name: 'Web Tarayıcı', category: 'tools', icon: '🌐', color: 'from-purple-500 to-violet-600' },
              { id: 'files', name: 'Dosyalarım', category: 'tools', icon: '📁', color: 'from-yellow-500 to-amber-600' },
            ]
              .filter(a => activeWidgetTab === 'all' || a.category === activeWidgetTab)
              .map(app => (
                <div 
                  key={app.id}
                  onClick={() => handleLaunch(app.id)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-white/10 hover:scale-105 transition-all aspect-square"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {app.icon}
                  </div>
                  <span className="text-xs font-bold text-white">{app.name}</span>
                </div>
            ))}
          </div>
        </section>

        {/* Quick Notes Tablet Widget */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-yellow-300 font-mono uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} /> Tablet Hızlı Not Defteri
            </h3>
            <span className="text-[10px] text-white/40">Otomatik Kaydedilir</span>
          </div>

          <textarea 
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white/90 focus:outline-none focus:border-yellow-400 font-mono resize-none h-24"
          />
        </div>

      </div>

      {/* Tablet Bottom Gesture Navigation Bar */}
      <footer className="h-14 bg-black/60 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-12 shrink-0">
        <button 
          onClick={onClose}
          className="p-3 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all cursor-pointer"
          title="Geri"
        >
          <ChevronLeft size={22} />
        </button>

        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white transition-all cursor-pointer"
          title="Ana Sayfa"
        >
          <Home size={20} />
        </button>

        <button 
          onClick={() => handleLaunch('kidapp')}
          className="p-3 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all cursor-pointer"
          title="Son Uygulamalar"
        >
          <Grid size={20} />
        </button>
      </footer>

    </div>
  );
};
