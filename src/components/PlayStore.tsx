import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Search, Star, Download, ArrowLeft, Check, Play, Trash2, 
  Gamepad2, Palette, Music, Youtube, Heart, Cpu, Menu, Compass, Sparkles, BookOpen,
  MessageCircle, Camera, Facebook, Video, Globe, Briefcase, ShoppingBag, Map, Cloud, Shield, 
  Linkedin, Twitter, Instagram, Smartphone, Languages, MessageSquare, Ghost
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeStorage } from '../utils/safeStorage';

interface PlayStoreProps {
  onClose: () => void;
  mobileMode?: boolean;
}

export interface AppItem {
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

export const playStoreApps: AppItem[] = [
  {
    id: 'archweb_kids',
    name: 'ArchWeb for Kids OS',
    developer: 'ArchWeb Software',
    category: 'kids',
    icon: Cpu,
    iconColor: '#38bdf8',
    iconBg: 'bg-sky-500/20',
    rating: 5.0,
    reviews: '2.4M',
    downloads: '10M+',
    size: '18 MB',
    description: 'Çocuklar ve öğrenciler için özel olarak tasarlanmış güvenli, hızlı, reklamsız web tabanlı işletim sistemi. Ebeveyn kontrolü, dahili eğitici oyunlar, çevrimdışı HTML sürümü ve yüksek performanslı masaüstü deneyimi sunar.',
    screenshots: ['#0f172a', '#0284c7', '#38bdf8']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Messenger',
    developer: 'Meta',
    category: 'apps',
    icon: MessageCircle,
    iconColor: '#25D366',
    iconBg: 'bg-green-500/10',
    rating: 4.8,
    reviews: '173M',
    downloads: '5B+',
    size: '32 MB',
    description: 'Dünyanın her yerindeki arkadaşlarınızla ve ailenizle ücretsiz olarak mesajlaşın ve sesli/görüntülü arama yapın.',
    screenshots: ['#25D366', '#128C7E', '#075E54']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    developer: 'Meta',
    category: 'apps',
    icon: Instagram,
    iconColor: '#E1306C',
    iconBg: 'bg-pink-500/10',
    rating: 4.7,
    reviews: '142M',
    downloads: '1B+',
    size: '45 MB',
    description: 'Fotoğraf ve video paylaşın, arkadaşlarınızla bağlantı kurun ve dünyadaki yenilikleri keşfedin.',
    screenshots: ['#833AB4', '#E1306C', '#F77737']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    developer: 'Meta',
    category: 'apps',
    icon: Facebook,
    iconColor: '#1877F2',
    iconBg: 'bg-blue-600/10',
    rating: 4.3,
    reviews: '130M',
    downloads: '5B+',
    size: '58 MB',
    description: 'Arkadaşlarınızla, ailenizle ve ilgi alanlarınızı paylaşan insanlarla bağlantı kurun.',
    screenshots: ['#1877F2', '#3b5998', '#8b9dc3']
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    developer: 'TikTok Pte. Ltd.',
    category: 'apps',
    icon: Video,
    iconColor: '#000000',
    iconBg: 'bg-gray-900/10',
    rating: 4.4,
    reviews: '55M',
    downloads: '1B+',
    size: '82 MB',
    description: 'Yaratıcı videolar keşfedin, kendi videolarınızı çekin ve küresel bir topluluğun parçası olun.',
    screenshots: ['#ee1d52', '#69c9d0', '#000000']
  },
  {
    id: 'netflix',
    name: 'Netflix',
    developer: 'Netflix, Inc.',
    category: 'apps',
    icon: Play,
    iconColor: '#E50914',
    iconBg: 'bg-red-600/10',
    rating: 4.5,
    reviews: '12M',
    downloads: '1B+',
    size: '22 MB',
    description: 'En sevdiğiniz dizileri, filmleri ve belgeselleri her yerden izleyin.',
    screenshots: ['#E50914', '#221f1f', '#f5f5f1']
  },
  {
    id: 'spotify',
    name: 'Spotify',
    developer: 'Spotify AB',
    category: 'apps',
    icon: Music,
    iconColor: '#1DB954',
    iconBg: 'bg-green-600/10',
    rating: 4.6,
    reviews: '28M',
    downloads: '1B+',
    size: '28 MB',
    description: 'Milyonlarca şarkıya ve podcast\'e anında erişin. Kendi çalma listelerinizi oluşturun.',
    screenshots: ['#1DB954', '#191414', '#ffffff']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    developer: 'Google LLC',
    category: 'apps',
    icon: Youtube,
    iconColor: '#FF0000',
    iconBg: 'bg-red-500/10',
    rating: 4.7,
    reviews: '150M',
    downloads: '10B+',
    size: '35 MB',
    description: 'Dünyanın en büyük video paylaşım platformu. Müzik, eğlence, haber ve çok daha fazlası.',
    screenshots: ['#FF0000', '#282828', '#ffffff']
  },
  {
    id: 'roblox',
    name: 'Roblox',
    developer: 'Roblox Corporation',
    category: 'games',
    icon: Gamepad2,
    iconColor: '#000000',
    iconBg: 'bg-gray-800/10',
    rating: 4.4,
    reviews: '32M',
    downloads: '500M+',
    size: '120 MB',
    description: 'Hayal edebileceğiniz her şeyi yaratın, paylaşın ve milyonlarca kişiyle birlikte oynayın.',
    screenshots: ['#000000', '#ffffff', '#757575']
  },
  {
    id: 'pubg_mobile',
    name: 'PUBG MOBILE',
    developer: 'Level Infinite',
    category: 'games',
    icon: Shield,
    iconColor: '#FBC02D',
    iconBg: 'bg-yellow-600/10',
    rating: 4.2,
    reviews: '43M',
    downloads: '500M+',
    size: '800 MB',
    description: 'Efsanevi Battle Royale deneyimi. 100 kişilik haritalarda hayatta kalan son kişi olun.',
    screenshots: ['#1c1c1c', '#fbc02d', '#ffffff']
  },
  {
    id: 'among_us',
    name: 'Among Us',
    developer: 'Innersloth LLC',
    category: 'games',
    icon: Ghost,
    iconColor: '#FF0000',
    iconBg: 'bg-red-500/10',
    rating: 4.1,
    reviews: '13M',
    downloads: '500M+',
    size: '150 MB',
    description: 'Uzay geminizde mürettebat olarak görevleri tamamlayın veya haini bulun!',
    screenshots: ['#c51111', '#111c25', '#ffffff']
  },
  {
    id: 'clash_royale',
    name: 'Clash Royale',
    developer: 'Supercell',
    category: 'games',
    icon: Star,
    iconColor: '#546E7A',
    iconBg: 'bg-blue-gray-500/10',
    rating: 4.3,
    reviews: '35M',
    downloads: '100M+',
    size: '200 MB',
    description: 'Efsanevi kartlarınızı toplayın, arenaya çıkın ve rakiplerinizi yenin!',
    screenshots: ['#546e7a', '#ffffff', '#ffcc00']
  },
  {
    id: 'zoom',
    name: 'Zoom Cloud Meetings',
    developer: 'zoom.us',
    category: 'apps',
    icon: Video,
    iconColor: '#2D8CFF',
    iconBg: 'bg-blue-500/10',
    rating: 4.1,
    reviews: '4M',
    downloads: '500M+',
    size: '42 MB',
    description: 'Nerede olursanız olun yüksek kaliteli video konferans ve mesajlaşma ile bağlantıda kalın.',
    screenshots: ['#2d8cff', '#ffffff', '#232333']
  },
  {
    id: 'slack',
    name: 'Slack',
    developer: 'Slack Technologies',
    category: 'apps',
    icon: MessageSquare,
    iconColor: '#4A154B',
    iconBg: 'bg-purple-900/10',
    rating: 4.2,
    reviews: '1M',
    downloads: '10M+',
    size: '38 MB',
    description: 'Ekipler için profesyonel iletişim ve işbirliği platformu.',
    screenshots: ['#4a154b', '#36c5f0', '#2eb67d']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    developer: 'LinkedIn',
    category: 'apps',
    icon: Linkedin,
    iconColor: '#0A66C2',
    iconBg: 'bg-blue-700/10',
    rating: 4.1,
    reviews: '2M',
    downloads: '1B+',
    size: '45 MB',
    description: 'Profesyonel ağınızı kurun, kariyerinizi geliştirin ve iş ilanlarını keşfedin.',
    screenshots: ['#0a66c2', '#ffffff', '#f3f2ef']
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    developer: 'X Corp.',
    category: 'apps',
    icon: Twitter,
    iconColor: '#000000',
    iconBg: 'bg-gray-900/10',
    rating: 4.0,
    reviews: '20M',
    downloads: '1B+',
    size: '30 MB',
    description: 'Dünyada neler olup bittiğini anında öğrenin ve tartışmalara katılın.',
    screenshots: ['#000000', '#ffffff', '#1da1f2']
  },
  {
    id: 'amazon',
    name: 'Amazon Shopping',
    developer: 'Amazon Mobile LLC',
    category: 'apps',
    icon: ShoppingBag,
    iconColor: '#FF9900',
    iconBg: 'bg-orange-500/10',
    rating: 4.5,
    reviews: '4M',
    downloads: '500M+',
    size: '65 MB',
    description: 'Milyonlarca ürüne göz atın, alışveriş yapın ve hızlı teslimat avantajından yararlanın.',
    screenshots: ['#ff9900', '#232f3e', '#ffffff']
  },
  {
    id: 'google_maps',
    name: 'Google Haritalar',
    developer: 'Google LLC',
    category: 'apps',
    icon: Map,
    iconColor: '#4285F4',
    iconBg: 'bg-blue-500/10',
    rating: 4.6,
    reviews: '15M',
    downloads: '10B+',
    size: '48 MB',
    description: 'Dünyayı keşfedin, gerçek zamanlı trafik bilgisi ve navigasyon ile hedefinize ulaşın.',
    screenshots: ['#4285f4', '#34a853', '#fbbc05']
  },
  {
    id: 'duolingo',
    name: 'Duolingo: Dil Öğrenin',
    developer: 'Duolingo',
    category: 'education',
    icon: Languages,
    iconColor: '#58CC02',
    iconBg: 'bg-green-500/10',
    rating: 4.8,
    reviews: '16M',
    downloads: '500M+',
    size: '40 MB',
    description: 'Eğlenceli ve ücretsiz derslerle yeni bir dil öğrenmeye hemen başlayın.',
    screenshots: ['#58cc02', '#ffffff', '#1cb0f6']
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    developer: 'Pinterest',
    category: 'apps',
    icon: Globe,
    iconColor: '#E60023',
    iconBg: 'bg-red-700/10',
    rating: 4.6,
    reviews: '10M',
    downloads: '500M+',
    size: '35 MB',
    description: 'Yeni fikirler keşfedin, projeleriniz için ilham alın ve görsellerinizi kaydedin.',
    screenshots: ['#e60023', '#ffffff', '#bd081c']
  },
  {
    id: 'uber',
    name: 'Uber',
    developer: 'Uber Technologies, Inc.',
    category: 'apps',
    icon: Smartphone,
    iconColor: '#000000',
    iconBg: 'bg-gray-900/10',
    rating: 4.3,
    reviews: '5M',
    downloads: '500M+',
    size: '72 MB',
    description: 'Dakikalar içinde güvenilir yolculuk bulun. Tek dokunuşla araç çağırın.',
    screenshots: ['#000000', '#ffffff', '#276ef1']
  },
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
  }
];

export const PlayStore: React.FC<PlayStoreProps> = ({ onClose, mobileMode = false }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'apps' | 'kids'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>(() => {
    const saved = safeStorage.getItem('playstore_installed_apps');
    return saved ? JSON.parse(saved) : {};
  });
  const [installProgress, setInstallProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    safeStorage.setItem('playstore_installed_apps', JSON.stringify(installedApps));
    window.dispatchEvent(new Event('playstore_apps_changed'));
  }, [installedApps]);

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

  const filteredApps = playStoreApps.filter(app => {
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectedApp ? (
            <button onClick={() => setSelectedApp(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
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
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!selectedApp && (
          <div className="w-16 md:w-48 bg-white border-r border-gray-200 flex flex-col py-4 gap-1">
            {(['home', 'games', 'apps', 'kids'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col md:flex-row items-center gap-2 px-3 py-3 mx-2 rounded-xl text-left transition-colors ${activeTab === tab ? 'bg-[#e6f4ea] text-[#01875f]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab === 'home' && <Compass size={18} />}
                {tab === 'games' && <Gamepad2 size={18} />}
                {tab === 'apps' && <Cpu size={18} />}
                {tab === 'kids' && <Sparkles size={18} />}
                <span className="text-[10px] md:text-xs font-semibold hidden md:inline capitalize">{tab === 'kids' ? 'Çocuk Dünyası' : tab}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8f9fa]">
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
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
                  <div className="grid grid-cols-4 gap-2 border-y border-gray-100 py-3.5 text-center">
                    <div className="border-r border-gray-100">
                      <div className="flex items-center justify-center gap-0.5 text-xs font-bold text-gray-800">{selectedApp.rating} <Star size={12} className="fill-amber-400 text-amber-400" /></div>
                      <div className="text-[9px] text-gray-400 font-medium">{selectedApp.reviews} yorum</div>
                    </div>
                    <div className="border-r border-gray-100"><div className="text-xs font-bold text-gray-800">{selectedApp.size}</div><div className="text-[9px] text-gray-400 font-medium">Dosya Boyutu</div></div>
                    <div className="border-r border-gray-100"><div className="text-xs font-bold text-gray-800">PEGI 3</div><div className="text-[9px] text-gray-400 font-medium">Her Yaşa Uygun</div></div>
                    <div><div className="text-xs font-bold text-gray-800">{selectedApp.downloads}</div><div className="text-[9px] text-gray-400 font-medium">İndirme</div></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {installedApps[selectedApp.id] ? (
                      <>
                        <button onClick={() => window.dispatchEvent(new CustomEvent('playstore_launch_app', { detail: selectedApp.id }))} className="flex-1 py-2.5 rounded-full bg-[#01875f] hover:bg-[#00704e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"><Play size={14} /> Uygulamayı Çalıştır</button>
                        <button onClick={() => handleUninstall(selectedApp.id)} className="px-4 py-2.5 rounded-full border border-red-200 hover:bg-red-50 text-red-500 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"><Trash2 size={13} /> Kaldır</button>
                      </>
                    ) : installProgress[selectedApp.id] !== undefined ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-[11px] font-bold text-gray-600"><span>Yükleniyor...</span><span>%{installProgress[selectedApp.id]}</span></div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#01875f] transition-all duration-150" style={{ width: `${installProgress[selectedApp.id]}%` }} /></div>
                      </div>
                    ) : (
                      <button onClick={() => handleInstall(selectedApp.id)} className="flex-1 py-2.5 rounded-full bg-[#01875f] hover:bg-[#00704e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"><Download size={14} /> Yükle</button>
                    )}
                  </div>
                  <div className="space-y-2"><h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Uygulama Hakkında</h4><p className="text-xs text-gray-600 leading-relaxed">{selectedApp.description}</p></div>
                </div>
                <div className="w-full md:w-64 space-y-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ekran Görüntüleri</h4>
                  <div className="flex md:flex-col gap-3 overflow-x-auto pb-2">
                    {selectedApp.screenshots.map((color, idx) => (
                      <div key={idx} className="w-40 md:w-full h-24 rounded-xl shadow-inner border border-black/5 flex items-center justify-center text-white/10 font-bold font-mono text-[10px]" style={{ backgroundColor: color }}>Screenshot {idx + 1}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="store-front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none select-none flex items-center justify-center"><Sparkles size={120} /></div>
                  <div className="max-w-md space-y-2 relative z-10">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/25 text-[9px] uppercase font-bold tracking-wider">Haftanın Seçimi</span>
                    <h3 className="text-lg font-extrabold tracking-tight">Eğitici ve Güvenli Çocuk Oyunları</h3>
                    <p className="text-[11px] text-white/80 leading-relaxed">Play Store'da yer alan oyun ve araçlarla çocuklar eğlenirken kendilerini geliştiriyor. Tamamen reklamsız ve güvenli simülatörleri hemen yükleyin.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5"><Compass size={14} className="text-[#01875f]" /> Önerilen Uygulamalar ({filteredApps.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApps.map((app) => {
                      const isInstalled = installedApps[app.id];
                      const progress = installProgress[app.id];
                      return (
                        <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white border border-gray-200/80 hover:border-gray-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex gap-4 relative overflow-hidden group">
                          <div className={`w-14 h-14 rounded-xl ${app.iconBg} flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0`}><app.icon size={30} style={{ color: app.iconColor }} /></div>
                          <div className="flex-1 space-y-1 overflow-hidden">
                            <h4 className="text-xs font-bold text-gray-800 truncate">{app.name}</h4>
                            <p className="text-[10px] text-gray-400 truncate">{app.developer}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500"><span className="flex items-center font-bold text-gray-700">{app.rating} <Star size={10} className="fill-amber-400 text-amber-400 inline ml-0.5" /></span><span>•</span><span>{app.size}</span></div>
                          </div>
                          <div className="absolute right-3 top-3">{isInstalled ? <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[8px] font-bold text-emerald-600 flex items-center gap-0.5"><Check size={8} /> Yüklü</span> : progress !== undefined ? <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[8px] font-bold text-blue-600 animate-pulse">%{progress}</span> : null}</div>
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

export const Minecraft2D: React.FC = () => {
  const [tool, setTool] = useState<'dig' | 'dirt' | 'brick' | 'wood' | 'leaf' | 'diamond'>('dig');
  const [grid, setGrid] = useState<string[][]>(() => {
    const saved = safeStorage.getItem('minecraft2d_grid');
    if (saved) return JSON.parse(saved);
    const rows = 12;
    const cols = 20;
    const initial: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        if (r < 5) row.push('sky');
        else if (r === 5) row.push('grass');
        else if (r < 9) row.push('dirt');
        else {
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

  useEffect(() => {
    safeStorage.setItem('minecraft2d_grid', JSON.stringify(grid));
  }, [grid]);

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
      if (grid[r][c] !== 'sky') updated[r][c] = 'sky';
    } else {
      if (grid[r][c] === 'sky') updated[r][c] = tool;
    }
    setGrid(updated);
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-[#1e2022] h-full text-white">
      <div className="flex items-center justify-between w-full max-w-xl pb-2 border-b border-white/10">
        <span className="text-xs font-mono font-bold text-emerald-400">Yaratıcı Mod: 2D Dünya İnşaat</span>
        <button onClick={() => {
          const rows = 12; const cols = 20; const initial: string[][] = [];
          for (let r = 0; r < rows; r++) {
            const row: string[] = [];
            for (let c = 0; c < cols; c++) {
              if (r < 5) row.push('sky'); else if (r === 5) row.push('grass'); else if (r < 9) row.push('dirt'); else row.push(Math.random() < 0.15 ? 'diamond' : 'stone');
            }
            initial.push(row);
          }
          setGrid(initial);
        }} className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] font-bold">Dünyayı Sıfırla</button>
      </div>
      <div className="grid grid-cols-20 gap-0.5 w-full max-w-2xl bg-black/40 p-2 rounded-xl border border-white/5 select-none aspect-video">
        {grid.map((row, r) => row.map((cell, c) => (
          <div key={`${r}-${c}`} onClick={() => handleBlockClick(r, c)} className={`aspect-square cursor-pointer transition-all ${getBlockStyles(cell)}`} title={cell}>
            {cell === 'diamond' && <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 animate-ping" />}
            {cell === 'coal' && <div className="w-1.5 h-1.5 bg-black rounded mx-auto mt-1" />}
          </div>
        )))}
      </div>
      <div className="flex gap-2 flex-wrap justify-center p-3 bg-black/20 rounded-xl border border-white/5 w-full max-w-xl">
        <button onClick={() => setTool('dig')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${tool === 'dig' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>⛏️ Kazma (Kır)</button>
        <button onClick={() => setTool('dirt')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'dirt' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>🟫 Toprak Koy</button>
        <button onClick={() => setTool('brick')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'brick' ? 'bg-red-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>🧱 Tuğla Koy</button>
        <button onClick={() => setTool('wood')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'wood' ? 'bg-amber-700 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>🪵 Ahşap Koy</button>
        <button onClick={() => setTool('leaf')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'leaf' ? 'bg-green-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>🍃 Yaprak Koy</button>
        <button onClick={() => setTool('diamond')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tool === 'diamond' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>💎 Elmas Koy</button>
      </div>
    </div>
  );
};

export const PianoKids: React.FC = () => {
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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext; if (!AudioCtx) return;
      const ctx = new AudioCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.8);
    } catch (e) { console.warn(e); }
  };
  return (
    <div className="p-6 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-purple-900 to-indigo-950 h-full text-white">
      <div className="text-center space-y-1">
        <h3 className="text-sm font-extrabold tracking-wide uppercase text-pink-300">🎵 Sihirli Çocuk Piyanosu 🎵</h3>
        <p className="text-[10px] text-purple-200">Rengarenk tuşlara dokunarak kendi ezgilerini çalmaya başla!</p>
      </div>
      <div className="flex gap-2 p-4 bg-black/30 rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full aspect-[2/1]">
        {notes.map((note) => (
          <button key={note.name} onClick={() => playSound(note.freq)} className={`flex-1 rounded-xl border-b-8 flex flex-col justify-end items-center pb-4 transition-all duration-75 active:translate-y-1.5 active:border-b-2 hover:brightness-110 active:brightness-95 cursor-pointer shadow-lg select-none ${note.color}`}>
            <span className="text-xs font-bold font-mono uppercase">{note.name}</span>
            <span className="text-[10px] font-semibold opacity-80">{note.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SpaceExplorer: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(safeStorage.getItem('space_high_score') || '0'));
  const [rocketX, setRocketX] = useState(50);
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [stars, setStars] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextItemId = useRef(0);
  const requestRef = useRef<number | null>(null);

  const startGame = () => { setGameState('playing'); setScore(0); setRocketX(50); setAsteroids([]); setStars([]); };

  useEffect(() => {
    if (gameState !== 'playing') return;
    let localAsteroids = [...asteroids]; let localStars = [...stars]; let frameScore = 0;
    const gameLoop = () => {
      if (Math.random() < 0.04) localAsteroids.push({ id: nextItemId.current++, x: Math.random() * 90 + 5, y: -10, size: Math.random() * 15 + 10 });
      if (Math.random() < 0.03) localStars.push({ id: nextItemId.current++, x: Math.random() * 90 + 5, y: -10 });
      localAsteroids = localAsteroids.map(ast => ({ ...ast, y: ast.y + 1.8 })).filter(ast => ast.y < 110);
      localStars = localStars.map(star => ({ ...star, y: star.y + 1.2 })).filter(star => star.y < 110);
      if (localAsteroids.some(ast => Math.abs(ast.x - rocketX) < 10 && ast.y > 80 && ast.y < 95)) {
        setGameState('gameover'); if (score + frameScore > highScore) { setHighScore(score + frameScore); safeStorage.setItem('space_high_score', String(score + frameScore)); } return;
      }
      const initialStarCount = localStars.length;
      localStars = localStars.filter(star => !(Math.abs(star.x - rocketX) < 10 && star.y > 80 && star.y < 95));
      frameScore += (initialStarCount - localStars.length) * 10;
      setScore(s => s + (initialStarCount - localStars.length) * 10);
      setAsteroids(localAsteroids); setStars(localStars);
      requestRef.current = requestAnimationFrame(gameLoop);
    };
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState, rocketX]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') setRocketX(x => Math.max(5, x - 5)); if (e.key === 'ArrowRight') setRocketX(x => Math.min(95, x + 5)); };
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="h-full bg-[#050b18] text-white flex flex-col overflow-hidden relative font-sans">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-sky-400">Skor: {score}</span>
        <span className="text-[9px] text-white/40">En Yüksek: {highScore}</span>
      </div>
      {gameState === 'idle' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30 text-4xl">🚀</div>
          <div className="space-y-2"><h2 className="text-lg font-bold">Uzay Serüveni</h2><p className="text-xs text-white/50">Meteorlardan kaç ve yıldızları topla! Roketi ok tuşlarıyla hareket ettir.</p></div>
          <button onClick={startGame} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-sm font-bold shadow-lg transition-all">Oyunu Başlat</button>
        </div>
      ) : gameState === 'gameover' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center bg-red-950/20">
          <div className="text-4xl">💥</div>
          <div className="space-y-2"><h2 className="text-lg font-bold text-red-400">Görev Başarısız!</h2><p className="text-xs text-white/50">Roketin bir meteora çarptı. Topladığın puan: {score}</p></div>
          <button onClick={startGame} className="px-8 py-3 bg-white text-slate-900 rounded-full text-sm font-bold shadow-lg transition-all">Tekrar Dene</button>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          {asteroids.map(ast => <div key={ast.id} className="absolute text-2xl" style={{ left: `${ast.x}%`, top: `${ast.y}%` }}>☄️</div>)}
          {stars.map(star => <div key={star.id} className="absolute text-xl animate-pulse" style={{ left: `${star.x}%`, top: `${star.y}%` }}>⭐</div>)}
          <div className="absolute bottom-10 transition-all duration-75 text-4xl" style={{ left: `${rocketX}%`, transform: 'translateX(-50%)' }}>🚀</div>
        </div>
      )}
    </div>
  );
};

export const ColoringBook: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [color, setColor] = useState('#ff0000');
  const images = ['🐱', '🦖', '🚀', '🏠', '🌻', '🍎'];
  return (
    <div className="h-full bg-white flex flex-col p-4 gap-4 text-gray-800 font-sans">
      <div className="flex justify-between items-center border-b pb-2">
        <h3 className="text-sm font-bold text-indigo-600">🎨 Sanal Boyama Dünyası</h3>
        <div className="flex gap-2">
          {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#000000'].map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full border border-gray-200 transition-transform ${color === c ? 'scale-125 shadow-md' : 'hover:scale-110'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className="w-16 flex flex-col gap-2 overflow-y-auto pr-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setSelectedImage(i)} className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl border-2 transition-all ${selectedImage === i ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50'}`}>{img}</button>
          ))}
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-200 flex items-center justify-center text-9xl relative overflow-hidden select-none">
          <span style={{ color }}>{images[selectedImage]}</span>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">Fırça Modu Aktif</div>
        </div>
      </div>
      <div className="text-[10px] text-gray-400 text-center font-medium">İpucu: Resme tıklayarak rengini değiştirebilirsin (Simülasyon).</div>
    </div>
  );
};

export const YTKids: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const videos = [
    { id: 1, title: 'Sevimli Dostlar: Alfabe Şarkısı', duration: '3:45', category: 'Eğitim', color: 'from-red-500 to-orange-500' },
    { id: 2, title: 'Niloya: Piknik Zamanı', duration: '11:20', category: 'Çizgi Film', color: 'from-blue-500 to-sky-500' },
    { id: 3, title: 'Kral Şakir: Uzay Macerası', duration: '15:10', category: 'Eğlence', color: 'from-purple-500 to-pink-500' },
    { id: 4, title: 'Uzay Hakkında İlginç Bilgiler', duration: '8:30', category: 'Bilim', color: 'from-emerald-500 to-teal-500' }
  ];
  return (
    <div className="h-full bg-white flex flex-col overflow-hidden font-sans">
      <div className="bg-red-600 text-white p-3 flex items-center gap-2">
        <Youtube size={20} /> <span className="font-bold text-sm tracking-tight">YouTube Kids</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {selectedVideo ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setSelectedVideo(null)} className="text-[10px] font-bold text-red-600 flex items-center gap-1">← Videolara Dön</button>
            <div className={`w-full aspect-video rounded-2xl bg-gradient-to-tr ${selectedVideo.color} flex items-center justify-center text-white text-4xl shadow-xl shadow-gray-200`}>▶</div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800">{selectedVideo.title}</h3>
              <p className="text-[10px] text-gray-400">{selectedVideo.category} • 1.2M Görüntüleme</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {videos.map(v => (
              <div key={v.id} onClick={() => setSelectedVideo(v)} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg cursor-pointer flex flex-col transition-all active:scale-95">
                <div className={`w-full h-24 bg-gradient-to-tr ${v.color} flex items-center justify-center text-white/50 text-2xl font-bold`}>▶</div>
                <div className="p-2.5 space-y-1">
                  <span className="text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-red-500">{v.category}</span>
                  <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1">{v.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
