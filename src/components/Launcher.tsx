import React, { useState } from 'react';
import { Terminal, Settings, Globe, Folder, Trash2, Search, Power, LogOut, User, Mail, ShoppingBag, Eye, EyeOff, ChevronLeft, ShieldCheck, Box, Sparkles, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LauncherProps {
  onClose: () => void;
  onLaunch: (app: string) => void;
  onPowerClick?: () => void;
  userAvatar?: string;
  userName?: string;
  userEmail?: string;
  userPassword?: string;
  loginMethod?: 'email' | 'google' | 'microsoft' | 'apple';
  kidCategory?: 'education' | 'gaming' | 'creativity' | 'science';
  onLogout?: () => void;
}

export const Launcher: React.FC<LauncherProps> = ({ 
  onClose, 
  onLaunch, 
  onPowerClick,
  userAvatar = '🦊',
  userName = 'arch-user',
  userEmail = 'user@archweb.com',
  userPassword = '',
  loginMethod = 'email',
  kidCategory = 'education',
  onLogout
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const apps = [
    { id: 'geminiai', name: 'Gemini AI Asistanı', icon: Sparkles, color: '#a855f7' },
    { id: 'camera', name: 'Kamera & Canlı Yayın', icon: Camera, color: '#0ea5e9' },
    { id: 'terminal', name: 'Uçbirim', icon: Terminal, color: 'var(--accent)' },
    { id: 'blender', name: 'Blender 3D Studio', icon: Box, color: '#f59e0b' },
    { id: 'settings', name: 'Ayarlar', icon: Settings, color: '#9c27b0' },
    { id: 'browser', name: 'Tarayıcı', icon: Globe, color: '#4caf50' },
    { id: 'files', name: 'Dosyalar', icon: Folder, color: '#ff9800' },
    { id: 'email', name: 'E-posta', icon: Mail, color: '#00bcd4' },
    { id: 'playstore', name: 'Play Store', icon: ShoppingBag, color: '#01875f' },
    { id: 'help', name: 'Yardım', icon: ShieldCheck, color: '#4caf50' },
    { id: 'trash', name: 'Çöp Kutusu', icon: Trash2, color: '#f44336' },
  ];

  // Filter apps based on search query
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'education': return 'Eğitim & Dersler 🎓';
      case 'gaming': return 'Oyun & Eğlence 🎮';
      case 'creativity': return 'Resim & Yaratıcılık 🎨';
      case 'science': return 'Bilim & Keşif 🧪';
      default: return 'Standart Çocuk Modu';
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'google':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-black border border-gray-200 text-[10px] font-bold">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Girişi</span>
          </div>
        );
      case 'microsoft':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2f2f2f] text-white border border-white/10 text-[10px] font-bold">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 23 23">
              <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
              <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
              <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
              <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
            </svg>
            <span>Microsoft Girişi</span>
          </div>
        );
      case 'apple':
        return (
          <div className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-black text-white border border-white/15 text-[10px] font-bold">
            <svg className="w-3 h-3 fill-current text-white shrink-0" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.12-3.57-2.83-7.44-7.48-11.62-13.96-6.12-9.61-10.91-20.15-14.34-31.62-3.44-11.48-5.16-22.18-5.16-32.1 0-14.03 3.39-25.33 10.16-33.9 6.78-8.57 15.15-12.92 25.1-13.05 4.34 0 9.17 1.25 14.47 3.75 5.3 2.5 8.91 3.75 10.82 3.75 1.7 0 5.43-1.32 11.19-3.96 5.76-2.64 10.25-3.85 13.48-3.63 9.77.44 17.51 3.93 23.23 10.45 5.73 6.53 9.07 14.51 10.02 23.95-10.14 4.89-16.89 11.75-20.25 20.57-3.36 8.82-3.32 18.06.12 27.71 3.23 8.92 8.71 15.86 16.42 20.81-.85 2.5-1.91 5.11-3.17 7.84zM119.22 32.4c0-7.72 2.76-14.88 8.27-21.49 1.32-1.6 2.77-3.1 4.34-4.5 1.57-1.4 3.09-2.4 4.54-3 1.45-.6 2.6-.9 3.44-.9 1.02 0 1.94.31 2.77.92.83.61 1.4 1.45 1.72 2.53-.76 4.34-2.58 8.78-5.46 13.32-2.88 4.54-6.4 8.4-10.55 11.58-4.15 3.18-8.15 5.16-12 5.94-.85.17-1.57.25-2.15.25-.68 0-1.28-.21-1.8-.64-.52-.43-.88-1.04-1.08-1.83-.17-.76-.25-1.48-.25-2.15z"/>
            </svg>
            <span>Apple ID Girişi</span>
          </div>
        );
      case 'email':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
            <Mail size={12} />
            <span>Standart E-posta</span>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-80 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[420px]"
    >
      <AnimatePresence mode="wait">
        {!showProfile ? (
          /* MAIN APPS SCREEN */
          <motion.div 
            key="apps_list"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 flex flex-col"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                <Search size={16} className="text-white/30" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Uygulama ara..." 
                  className="bg-transparent border-none outline-none text-sm text-white w-full font-sans"
                  autoFocus
                />
              </div>
            </div>

            {/* Apps Grid */}
            <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto max-h-[260px]">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    onLaunch(app.id);
                    onClose();
                  }}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
                    style={{ backgroundColor: `${app.color}22`, border: `1px solid ${app.color}44` }}
                  >
                    <app.icon size={24} style={{ color: app.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-white/60 group-hover:text-white">{app.name}</span>
                </button>
              ))}

              {filteredApps.length === 0 && (
                <div className="col-span-3 text-center py-6 text-xs text-white/40">
                  Uygulama bulunamadı
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* PROFILE DETAIL SCREEN */
          <motion.div 
            key="profile_details"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="p-4 sm:p-5 flex-1 flex flex-col space-y-4"
          >
            {/* Header / Back Button */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowProfile(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                title="Geri Dön"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Profil Bilgileri</span>
            </div>

            {/* Avatar Header */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-3xl shadow-md">
                {userAvatar}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{userName}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Çevrimiçi (Aktif)
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {/* Email / Username field */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block font-mono">E-Posta Adresi</span>
                <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-white truncate font-sans">
                  {userEmail}
                </div>
              </div>

              {/* Login Method Badge Field */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block font-mono">Giriş Sağlayıcı</span>
                <div className="flex">
                  {getMethodBadge(loginMethod)}
                </div>
              </div>

              {/* Password field with Reveal Toggle */}
              {userPassword && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block font-mono">Oturum Şifresi</span>
                  <div className="relative flex items-center">
                    <input 
                      type={showPass ? 'text' : 'password'}
                      value={userPassword}
                      readOnly
                      className="w-full bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-white pr-9 outline-none font-sans"
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      type="button"
                      className="absolute right-2 text-white/40 hover:text-white transition-colors"
                      title={showPass ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Kids Category Field */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider block font-mono">Çocuk Modu Dünyası</span>
                <div className="bg-black/30 border border-white/5 rounded-lg px-3 py-2 text-xs text-amber-400 font-sans font-medium">
                  {getCategoryLabel(kidCategory)}
                </div>
              </div>
            </div>

            {/* Profile Footer / Signout button */}
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-2"
              >
                <LogOut size={14} />
                <span>Oturumu Kapat</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <div className="mt-auto p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div 
          onClick={() => setShowProfile(!showProfile)}
          className="flex items-center gap-3 cursor-pointer group select-none hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform">
            {userAvatar}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-white truncate w-24 group-hover:text-[var(--accent)] transition-colors">{userName}</span>
            <span className="text-[9px] text-white/40">Profili Gör</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className={`p-2 rounded-lg transition-all ${showProfile ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
            title="Profili Göster"
          >
            <User size={16} />
          </button>
          <button 
            onClick={() => {
              onPowerClick?.();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-500 transition-all"
            title="Sistemi Kapat"
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
