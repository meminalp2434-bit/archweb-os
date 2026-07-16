import React, { useState } from 'react';
import { X, Palette, Monitor, Shield, Info, Smartphone, AppWindow, ShieldAlert, ShieldCheck, Lock, RefreshCw, AlertCircle, QrCode, Download, ExternalLink, Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  onClose: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  
  // Appearance (Görünüm)
  wallpaper: number;
  setWallpaper: (val: number) => void;
  
  // Display (Ekran)
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (val: 'small' | 'medium' | 'large') => void;
  windowOpacity: number;
  setWindowOpacity: (val: number) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  
  // Security (Güvenlik)
  firewallActive: boolean;
  setFirewallActive: (val: boolean) => void;
  pinRequired: boolean;
  setPinRequired: (val: boolean) => void;
  pinCode: string;
  setPinCode: (val: string) => void;
  onLockScreen: () => void;
  gmailPassword: string;
  setGmailPassword: (val: string) => void;
  
  // Mobile / APK
  mobileMode: boolean;
  setMobileMode: (val: boolean) => void;

  // Audio (Ses)
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  startupSoundEnabled: boolean;
  setStartupSoundEnabled: (val: boolean) => void;
}

type TabType = 'appearance' | 'display' | 'security' | 'mobile' | 'about';

export const Settings: React.FC<SettingsProps> = ({
  onClose,
  accentColor,
  setAccentColor,
  wallpaper,
  setWallpaper,
  fontSize,
  setFontSize,
  windowOpacity,
  setWindowOpacity,
  brightness,
  setBrightness,
  firewallActive,
  setFirewallActive,
  pinRequired,
  setPinRequired,
  pinCode,
  setPinCode,
  onLockScreen,
  gmailPassword,
  setGmailPassword,
  mobileMode,
  setMobileMode,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  startupSoundEnabled,
  setStartupSoundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('appearance');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const colors = [
    { name: 'Arch Mavisi', value: '#1793d1' },
    { name: 'Plazma Kırmızısı', value: '#f44336' },
    { name: 'Nane Yeşili', value: '#4caf50' },
    { name: 'Solarize Turuncu', value: '#ff9800' },
    { name: 'Kraliyet Moru', value: '#9c27b0' },
  ];

  const handleCheckUpdate = () => {
    setIsUpdating(true);
    setUpdateStatus('pacman -Syu çalıştırılıyor...');
    setTimeout(() => {
      setUpdateStatus('Veritabanları senkronize ediliyor...');
      setTimeout(() => {
        setUpdateStatus('Paket listesi kontrol ediliyor...');
        setTimeout(() => {
          setIsUpdating(false);
          setUpdateStatus('Sistem güncel! ArchWeb for Kids v3.0 en son kararlı sürümdür.');
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'appearance': return 'Görünüm Ayarları';
      case 'display': return 'Ekran & Ses Ayarları';
      case 'security': return 'Sistem Güvenliği';
      case 'mobile': return 'Mobil & Masaüstü Kurulumu';
      case 'about': return 'Sistem Hakkında';
      default: return 'Sistem Ayarları';
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full border border-white/10 rounded-lg overflow-hidden shadow-2xl transition-all"
      style={{ 
        backgroundColor: `rgba(18, 18, 18, ${windowOpacity / 100})`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-bold text-white/90">{getTabTitle()}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/50 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-48 bg-black/20 border-r border-white/5 p-2 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === 'appearance' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Palette size={14} />
            Görünüm
          </button>
          <button 
            onClick={() => setActiveTab('display')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === 'display' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Monitor size={14} />
            Ekran & Ses
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === 'security' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Shield size={14} />
            Güvenlik
          </button>
          <button 
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === 'mobile' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Smartphone size={14} />
            Mobil & Masaüstü
          </button>
          <div className="mt-auto">
            <button 
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${activeTab === 'about' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
            >
              <Info size={14} />
              Hakkında
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
          {activeTab === 'appearance' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section>
                <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <Palette size={14} className="text-[var(--accent)]" />
                  Vurgu Rengi
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`group flex flex-col items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all`}
                    >
                      <div 
                        className={`w-9 h-9 rounded-full border-2 transition-all ${accentColor === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: color.value }}
                      />
                      <span className={`text-[9px] font-medium ${accentColor === color.value ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-white mb-3 uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <Monitor size={14} className="text-[var(--accent)]" />
                  Masaüstü Duvar Kağıdı
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 0, name: 'Arch Klasik', style: 'from-[#0d0d0d] to-[#1793d1]/20' },
                    { id: 1, name: 'Kozmik Gece', style: 'from-[#050515] to-[#120a2a]' },
                    { id: 2, name: 'Plazma Günbatımı', style: 'from-[#100303] to-[#f44336]/10' },
                    { id: 3, name: 'Siberpunk Aurora', style: 'from-[#030d0d] to-[#9c27b0]/20' }
                  ].map((bg) => (
                    <div 
                      key={bg.id}
                      onClick={() => setWallpaper(bg.id)}
                      className={`group relative aspect-video rounded-xl bg-gradient-to-br ${bg.style} border-2 overflow-hidden cursor-pointer p-3 flex flex-col justify-end transition-all ${wallpaper === bg.id ? 'border-[var(--accent)] scale-[1.02] shadow-xl' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all pointer-events-none" />
                      <span className="relative text-xs font-bold text-white/90 z-10 group-hover:text-white">{bg.name}</span>
                      {wallpaper === bg.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'display' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <Monitor size={14} className="text-[var(--accent)]" />
                  Görsel Ayarlar
                </h3>

                {/* Brightness Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium">Ekran Parlaklığı</span>
                    <span className="text-[var(--accent)] font-bold">{brightness}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="40" 
                    max="100" 
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-[var(--accent)] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Transparency Slider */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium">Pencere Arka Plan Matlığı (Glassmorphism)</span>
                    <span className="text-[var(--accent)] font-bold">{windowOpacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={windowOpacity}
                    onChange={(e) => setWindowOpacity(parseInt(e.target.value))}
                    className="w-full accent-[var(--accent)] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </section>

              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <Palette size={14} className="text-[var(--accent)]" />
                  Sistem Yazı Boyutu
                </h3>
                <p className="text-[10px] text-white/40">Sistem pencereleri, terminal ve metin boyutu seçilen ölçeğe göre ayarlanır.</p>
                <div className="flex gap-2">
                  {[
                    { id: 'small', label: 'Küçük (A%)' },
                    { id: 'medium', label: 'Orta (AA%)' },
                    { id: 'large', label: 'Büyük (AAA%)' }
                  ].map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setFontSize(size.id as any)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${fontSize === size.id ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-white' : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'}`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Ses Ayarları (Audio Settings) */}
              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <Volume2 size={14} className="text-[var(--accent)]" />
                  Sistem Ses Ayarları
                </h3>

                {/* System Volume Control */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60 font-medium">Sistem Ses Seviyesi</span>
                    <span className="text-[var(--accent)] font-bold">{isMuted ? 'Sessiz' : `${volume}%`}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-lg transition-all ${isMuted ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/60 hover:text-white'}`}
                      title={isMuted ? "Sesi Aç" : "Sessiz Yap"}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        if (val > 0 && isMuted) {
                          setIsMuted(false);
                        }
                      }}
                      className="flex-1 accent-[var(--accent)] h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Windows 11 Startup Sound Toggle */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                      <Music size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Windows 11 Açılış Sesi</h4>
                      <p className="text-[10px] text-white/40 font-normal">Sistem her açıldığında veya kilit açıldığında Windows 11 açılış sesini çalar.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setStartupSoundEnabled(!startupSoundEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${startupSoundEnabled ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${startupSoundEnabled ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${firewallActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {firewallActive ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Arch Linux Güvenlik Duvarı (UFW)</h4>
                      <p className="text-[10px] text-white/40">Sistemi internet üzerinden gelebilecek tehditlere karşı korur.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFirewallActive(!firewallActive)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${firewallActive ? 'bg-emerald-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${firewallActive ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </section>

              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Kilit Ekranı ve PIN Şifresi</h4>
                    <p className="text-[10px] text-white/40">Sistem kilitlendiğinde veya açılışta PIN kodu talep eder.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">PIN Kodu Sorsun</span>
                    <button 
                      onClick={() => setPinRequired(!pinRequired)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${pinRequired ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${pinRequired ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>

                  {pinRequired && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-white/60">Güvenlik PIN Kodu</span>
                      <input 
                        type="password" 
                        maxLength={4}
                        placeholder="PIN girin" 
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-center text-white font-mono w-20 focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                  )}

                  <button 
                    onClick={onLockScreen}
                    className="w-full mt-2 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 text-[var(--accent)] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock size={12} />
                    Sistemi Şimdi Kilitle
                  </button>
                  
                  {gmailPassword && (
                    <button 
                      onClick={() => {
                        if (window.confirm("Şifreyi kaldırmak istediğinize emin misiniz? Artık kilit ekranında şifre sorulmayacak.")) {
                          setGmailPassword('');
                          localStorage.removeItem('archweb_gmail_password');
                        }
                      }}
                      className="w-full mt-2 py-2 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Lock size={12} />
                      Şifreyi Kaldır
                    </button>
                  )}
                </div>
              </section>

              <section className="bg-white/5 rounded-lg p-4 border border-white/5 flex flex-col gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50 mb-1">
                  Klavye Kısayolları
                </h3>
                {[
                  { keys: 'Alt + T', desc: 'Uçbirim\'i Aç/Kapat' },
                  { keys: 'Alt + F', desc: 'Dosya Yöneticisi\'ni Aç/Kapat' },
                  { keys: 'Alt + B', desc: 'Tarayıcı\'yı Aç/Kapat' },
                  { keys: 'Alt + S', desc: 'Ayarlar\'ı Aç/Kapat' },
                  { keys: 'Alt + L / Space', desc: 'Başlatıcı\'yı Aç/Kapat' },
                  { keys: 'Alt + N', desc: 'Notlar\'ı Aç/Kapat' },
                  { keys: 'Alt + P', desc: 'Güç Menüsü\'nü Aç/Kapat' },
                  { keys: 'Alt + R', desc: 'Çöp Kutusu\'nu Aç/Kapat' },
                  { keys: 'Esc', desc: 'Pencereleri Kapat' },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex justify-between items-center text-[11px]">
                    <span className="text-white/40">{shortcut.desc}</span>
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 font-mono text-[10px]">{shortcut.keys}</span>
                  </div>
                ))}
              </section>
            </motion.div>
          )}

          {activeTab === 'mobile' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Mobile Mode Simulation */}
              <section className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${mobileMode ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-white/5 text-white/40'}`}>
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Mobil Cihaz Simülasyonu</h4>
                      <p className="text-[10px] text-white/40">ArchWeb OS'i şık bir Android/iOS çerçevesinde test edin!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMode(!mobileMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${mobileMode ? 'bg-[var(--accent)]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${mobileMode ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </section>

              {/* QR Code and Quick Phone Access */}
              <section className="bg-gradient-to-br from-[var(--accent)]/5 to-transparent p-4 rounded-xl border border-[var(--accent)]/10 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <QrCode size={14} className="text-[var(--accent)]" />
                  Telefonda Anında Başlat (PWA)
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="bg-white p-2.5 rounded-lg shrink-0 shadow-lg border border-white/10">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=0d0d0d&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-xjjumj5lom3t4danhihlde-579357512949.europe-west2.run.app')}`} 
                      alt="Telefon QR Kodu" 
                      className="w-[120px] h-[120px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-center sm:text-left">
                    <h4 className="font-bold text-white">Telefonunuzun Kamerasından QR Kodu Taratın!</h4>
                    <p className="text-white/60 text-[10px] leading-relaxed">
                      Bu uygulamayı mobil tarayıcınızda açtığınızda, adres çubuğundaki menüden <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> diyerek telefonunuza yerel bir uygulama gibi kurabilirsiniz.
                    </p>
                    <div className="pt-1 flex justify-center sm:justify-start gap-2">
                      <a 
                        href={typeof window !== 'undefined' ? window.location.href : '#'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 rounded text-[10px] font-bold transition-all"
                      >
                        <ExternalLink size={10} />
                        Telefona Gönder / Aç
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* APK Compilation Instructions */}
              <section className="mb-8">
                <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-white/50">
                  <Smartphone size={14} className="text-[var(--accent)]" />
                  Android (.APK) Derleme ve Kurulum Kılavuzu
                </h3>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex flex-col gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                      <span>⚠️</span>
                      <p className="leading-normal">
                        <strong>Neden doğrudan indirilemiyor?</strong> Uzak bulut sunucusunda Java JDK ve Android SDK yüklü olmadığı için APK dosyası doğrudan burada derlenemez. Ancak projede tüm Android ve <strong>Capacitor</strong> yapılandırmaları hazır durumdadır!
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <h4 className="font-bold text-white/80 mb-2 flex items-center gap-1.5 text-xs">
                      <Download size={13} className="text-[var(--accent)]" />
                      Kendi Bilgisayarınızda .APK Dosyası Oluşturma Adımları:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-white/40 pl-1 leading-relaxed">
                      <li>Üst menüdeki ayarlar / dışa aktarma panelinden bu projeyi <span className="text-white/70">ZIP</span> dosyası olarak indirin ve arşivden çıkarın.</li>
                      <li>Bilgisayarınıza <span className="text-white/70">Android Studio</span> ve <span className="text-white/70">Node.js</span> yüklü olduğundan emin olun.</li>
                      <li>Proje klasörünün kök dizininde bir terminal açıp şu komutları çalıştırın:</li>
                    </ol>
                    <div className="bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-[var(--accent)] mt-3 space-y-1">
                      <div className="text-white/40"># 1. Gerekli kütüphaneleri yükleyin</div>
                      <div>npm install</div>
                      <div className="text-white/40 mt-1"># 2. Web projesini derleyin</div>
                      <div>npm run build</div>
                      <div className="text-white/40 mt-1"># 3. Android platformunu güncelleyin ve eşitleyin</div>
                      <div>npx cap sync</div>
                      <div className="text-white/40 mt-1"># 4. Projeyi Android Studio'da açıp APK derleyin</div>
                      <div>npx cap open android</div>
                    </div>
                    <div className="mt-3 text-white/50 space-y-1 bg-white/5 p-2.5 rounded border border-white/5">
                      <p className="font-bold text-white/80">Android Studio açıldığında:</p>
                      <p className="text-[10px]">
                        Menüden <strong>Build &rarr; Build Bundle(s) / APK(s) &rarr; Build APK(s)</strong> seçeneğine tıklayın. Birkaç saniye içinde bilgisayarınızda yüklenmeye hazır <strong>app-debug.apk</strong> dosyanız oluşacaktır!
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Desktop Runner Packages Section */}
              <section className="mb-8">
                <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider text-white/50">
                  <Monitor size={14} className="text-[var(--accent)]" />
                  Masaüstü Yerel Paketleri (Windows, macOS, Linux)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Windows .bat Download */}
                  <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-blue-400">Windows</span>
                        <span className="text-[9px] font-mono text-white/30">.bat</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">Windows Başlatıcı</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">Sistemi yapılandırıp Electron masaüstü motorunu tek tıkla çalıştırır.</p>
                    </div>
                    <a 
                      href="/baslat.bat" 
                      download="baslat.bat"
                      className="w-full text-center py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 hover:text-blue-200 border border-blue-500/30 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download size={11} /> baslat.bat İndir
                    </a>
                  </div>

                  {/* macOS .dmg Download */}
                  <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-purple-400">macOS</span>
                        <span className="text-[9px] font-mono text-white/30">.dmg</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">macOS Disk Image</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">Apple Intel ve M1/M2/M3 işlemcilerle tam uyumlu dmg yükleyici paketi.</p>
                    </div>
                    <a 
                      href="/archweb.dmg" 
                      download="archweb.dmg"
                      className="w-full text-center py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-[10px] font-bold rounded-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download size={11} /> archweb.dmg İndir
                    </a>
                  </div>

                  {/* Linux .deb/.dev Download */}
                  <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-orange-400">Debian / Linux</span>
                        <span className="text-[9px] font-mono text-white/30">.deb / .dev</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">Linux Debian Paketi</h4>
                      <p className="text-[10px] text-white/50 leading-relaxed">Debian ve Ubuntu tabanlı dağıtımlarda çalışan yerel sistem paketi.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <a 
                        href="/archweb.deb" 
                        download="archweb.deb"
                        className="text-center py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 hover:text-orange-200 border border-orange-500/30 text-[9px] font-bold rounded-md transition-all flex items-center justify-center gap-1"
                      >
                        <Download size={10} /> .deb İndir
                      </a>
                      <a 
                        href="/archweb.dev" 
                        download="archweb.dev"
                        className="text-center py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 hover:text-orange-200 border border-orange-500/30 text-[9px] font-bold rounded-md transition-all flex items-center justify-center gap-1"
                      >
                        <Download size={10} /> .dev İndir
                      </a>
                    </div>
                  </div>

                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <section className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-white/50">Sistem Bilgileri</h3>
                  <button 
                    onClick={handleCheckUpdate}
                    disabled={isUpdating}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-all text-[11px] rounded-lg disabled:opacity-50 font-bold"
                  >
                    <RefreshCw size={11} className={isUpdating ? 'animate-spin' : ''} />
                    {isUpdating ? 'Güncelleniyor...' : 'Sistemi Güncelle'}
                  </button>
                </div>

                {updateStatus && (
                  <div className="bg-black/20 p-2 border border-white/5 rounded text-[11px] font-mono flex items-start gap-1.5 text-white/80">
                    <AlertCircle size={13} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{updateStatus}</span>
                  </div>
                )}

                <div className="divide-y divide-white/5 space-y-2 pt-1">
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">İşletim Sistemi</span>
                    <span className="text-white/80 font-bold">ArchWeb for Kids</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">Sistem Sürümü</span>
                    <span className="text-white/80 font-mono font-bold text-[var(--accent)]">v3.0</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">Çekirdek Sürümü</span>
                    <span className="text-white/80 font-mono">6.12.0-arch1-1</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">Kabuk</span>
                    <span className="text-white/80 font-mono">zsh 5.9</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">Kullanıcı Sınıfı</span>
                    <span className="text-white/80 font-mono">arch-user @ localhost</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span className="text-white/40">Arayüz Altyapısı</span>
                    <span className="text-white/80">React 18 + Vite + Tailwind</span>
                  </div>
                </div>
              </section>

              <div className="text-center text-[10px] text-white/30 space-y-1">
                <p>ArchWeb for Kids &bull; Bir Arch Linux Çocuk Simülasyon Projesidir</p>
                <p>&copy; 2026. Tüm hakları simüle edilmiştir.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
