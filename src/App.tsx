import React, { useState, useEffect } from 'react';
import { playWindows11StartupSound } from './utils/audio';
import { TopBar } from './components/TopBar';
import { Terminal } from './components/Terminal';
import { Settings } from './components/Settings';
import { Browser } from './components/Browser';
import { FileManager } from './components/FileManager';
import { Launcher } from './components/Launcher';
import { TrashBin } from './components/TrashBin';
import { TextEditor } from './components/TextEditor';
import { PowerDialog } from './components/PowerDialog';
import { EmailApp } from './components/EmailApp';
import { KidLogin } from './components/KidLogin';
import { KidApp } from './components/KidApp';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Settings as SettingsIcon, Folder, Trash2, Globe, FileText, RotateCcw, Clock, Mail, Sparkles } from 'lucide-react';

const getWallpaperGradient = (wallpaper: number, accentColor: string) => {
  switch (wallpaper) {
    case 1: // Kozmik Gece
      return 'linear-gradient(135deg, #050515 0%, #120a2a 100%)';
    case 2: // Plazma Günbatımı
      return 'linear-gradient(135deg, #100303 0%, #301010 100%)';
    case 3: // Siberpunk Aurora
      return 'linear-gradient(135deg, #030d0d 0%, #20052d 100%)';
    case 0: // Arch Klasik
    default:
      return 'linear-gradient(135deg, #070707 0%, #0d0d0d 100%)';
  }
};

export default function App() {
  // Kid OS states
  const [isKidAppOpen, setIsKidAppOpen] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem('archweb_kid_setup_complete') === 'true';
  });
  const [gmailUser, setGmailUser] = useState<string>(() => {
    return localStorage.getItem('archweb_gmail_user') || '';
  });
  const [kidCategory, setKidCategory] = useState<'education' | 'gaming' | 'creativity' | 'science'>(() => {
    return (localStorage.getItem('archweb_kid_category') as any) || 'education';
  });
  const [kidAvatar, setKidAvatar] = useState<string>(() => {
    return localStorage.getItem('archweb_kid_avatar') || '🦊';
  });

  const [isTerminalOpen, setIsTerminalOpen] = useState(false); // Default to false for kids
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPowerDialogOpen, setIsPowerDialogOpen] = useState(false);
  const [isShutDown, setIsShutDown] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  const [accentColor, setAccentColor] = useState('#1793d1');
  const [editingFile, setEditingFile] = useState({ name: 'notlar.txt', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.\n\nKeyfini çıkarın!' });

  // System settings state variables
  const [wallpaper, setWallpaper] = useState(0);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [windowOpacity, setWindowOpacity] = useState(90);
  const [brightness, setBrightness] = useState(100);
  const [firewallActive, setFirewallActive] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);
  const [pinCode, setPinCode] = useState('1234');
  const [mobileMode, setMobileMode] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Sound and Volume Settings
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('archweb_volume');
    return saved !== null ? parseInt(saved) : 80;
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('archweb_muted');
    return saved !== null ? saved === 'true' : false;
  });
  const [startupSoundEnabled, setStartupSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('archweb_startup_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Sync sound settings with localStorage
  useEffect(() => {
    localStorage.setItem('archweb_volume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('archweb_muted', isMuted.toString());
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('archweb_startup_sound', startupSoundEnabled.toString());
  }, [startupSoundEnabled]);

  const handleSetupComplete = (gmail: string, category: 'education' | 'gaming' | 'creativity' | 'science', avatar: string) => {
    setGmailUser(gmail);
    setKidCategory(category);
    setKidAvatar(avatar);
    setIsSetupComplete(true);
    localStorage.setItem('archweb_gmail_user', gmail);
    localStorage.setItem('archweb_kid_category', category);
    localStorage.setItem('archweb_kid_avatar', avatar);
    localStorage.setItem('archweb_kid_setup_complete', 'true');

    // Automatically theme the system based on selected category!
    if (category === 'education') {
      setWallpaper(1);
      setAccentColor('#f59e0b'); // amber
      setFirewallActive(true);
    } else if (category === 'gaming') {
      setWallpaper(3);
      setAccentColor('#ec4899'); // pink
    } else if (category === 'creativity') {
      setWallpaper(1);
      setAccentColor('#14b8a6'); // teal
    } else if (category === 'science') {
      setWallpaper(3);
      setAccentColor('#a855f7'); // purple
      setFirewallActive(true);
    }

    setIsKidAppOpen(true); // Open the Kids App Hub immediately!
    setIsTerminalOpen(false); // Close terminal
  };

  const handleKidLogout = () => {
    setIsSetupComplete(false);
    setGmailUser('');
    setKidCategory('education');
    setKidAvatar('🦊');
    localStorage.removeItem('archweb_gmail_user');
    localStorage.removeItem('archweb_kid_category');
    localStorage.removeItem('archweb_kid_avatar');
    localStorage.removeItem('archweb_kid_setup_complete');
    setIsKidAppOpen(false);
  };

  const [lockInput, setLockInput] = useState('');
  const [lockError, setLockError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + Key shortcuts
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault();
            toggleTerminal();
            break;
          case 's':
            e.preventDefault();
            toggleSettings();
            break;
          case 'b':
            e.preventDefault();
            toggleBrowser();
            break;
          case 'f':
            e.preventDefault();
            toggleFileManager();
            break;
          case 'r':
            e.preventDefault();
            toggleTrash();
            break;
          case 'l':
            e.preventDefault();
            toggleLauncher();
            break;
          case 'n':
            e.preventDefault();
            setIsEditorOpen(!isEditorOpen);
            break;
          case 'e':
            e.preventDefault();
            toggleEmail();
            break;
          case 'p':
            e.preventDefault();
            setIsPowerDialogOpen(!isPowerDialogOpen);
            break;
          case ' ':
            e.preventDefault();
            toggleLauncher();
            break;
        }
      }

      // Escape to close launcher or all windows
      if (e.key === 'Escape') {
        if (isLauncherOpen) {
          setIsLauncherOpen(false);
        } else {
          setIsTerminalOpen(false);
          setIsSettingsOpen(false);
          setIsBrowserOpen(false);
          setIsFileManagerOpen(false);
          setIsEmailOpen(false);
          setIsTrashOpen(false);
          setIsEditorOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLauncherOpen, isTerminalOpen, isSettingsOpen, isBrowserOpen, isFileManagerOpen, isTrashOpen, isEditorOpen]);

  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleBrowser = () => setIsBrowserOpen(!isBrowserOpen);
  const toggleFileManager = () => setIsFileManagerOpen(!isFileManagerOpen);
  const toggleEmail = () => setIsEmailOpen(!isEmailOpen);
  const toggleTrash = () => setIsTrashOpen(!isTrashOpen);
  const toggleLauncher = () => setIsLauncherOpen(!isLauncherOpen);

  const handleLaunch = (appId: string) => {
    switch (appId) {
      case 'terminal': setIsTerminalOpen(true); break;
      case 'settings': setIsSettingsOpen(true); break;
      case 'browser': setIsBrowserOpen(true); break;
      case 'files': setIsFileManagerOpen(true); break;
      case 'email': setIsEmailOpen(true); break;
      case 'trash': setIsTrashOpen(true); break;
    }
  };

  const handleShutdown = () => {
    setIsPowerDialogOpen(false);
    setIsShutDown(true);
  };

  const handleRestart = () => {
    setIsPowerDialogOpen(false);
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      // Reset all windows
      setIsTerminalOpen(false);
      setIsSettingsOpen(false);
      setIsBrowserOpen(false);
      setIsFileManagerOpen(false);
      setIsEmailOpen(false);
      setIsTrashOpen(false);
      setIsEditorOpen(false);
      if (startupSoundEnabled) {
        playWindows11StartupSound(volume, isMuted, true);
      }
    }, 3000);
  };

  if (isShutDown) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-4 animate-in fade-in duration-1000">
        <div className="text-white/20 font-mono text-sm">Sistem kapandı.</div>
        <button 
          onClick={() => {
            setIsShutDown(false);
            if (startupSoundEnabled) {
              playWindows11StartupSound(volume, isMuted, true);
            }
          }}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs"
        >
          Sistemi Başlat
        </button>
      </div>
    );
  }

  if (isRestarting) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 font-mono">
        <div className="flex flex-col gap-1 text-[var(--accent)] text-xs">
          <div>[  OK  ] Reached target Graphical Interface.</div>
          <div>[  OK  ] Stopped Getty on tty1.</div>
          <div>[  OK  ] Stopped User Manager for UID 1000.</div>
          <div className="animate-pulse mt-4">Sistem yeniden başlatılıyor...</div>
        </div>
        <RotateCcw size={32} className="text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  // Inject KidLogin if kid is not configured or gmail setup is missing
  if (!isSetupComplete) {
    return <KidLogin onComplete={handleSetupComplete} />;
  }

  const handleUnlock = () => {
    if (pinRequired) {
      if (lockInput === pinCode) {
        setIsLocked(false);
        setLockInput('');
        setLockError(false);
        if (startupSoundEnabled) {
          playWindows11StartupSound(volume, isMuted);
        }
      } else {
        setLockError(true);
        setLockInput('');
        setTimeout(() => setLockError(false), 800);
      }
    } else {
      setIsLocked(false);
      if (startupSoundEnabled) {
        playWindows11StartupSound(volume, isMuted);
      }
    }
  };

  if (isLocked) {
    return (
      <div 
        className="h-screen w-screen relative flex flex-col items-center justify-between p-12 bg-cover bg-center select-none transition-all duration-700"
        style={{ 
          background: getWallpaperGradient(wallpaper, accentColor),
          fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px',
          filter: `brightness(${brightness}%)`
        }}
      >
        {/* Top Lock Info */}
        <div className="flex flex-col items-center mt-12 gap-2 text-white">
          <Clock className="w-8 h-8 opacity-60" />
          <h1 className="text-5xl font-sans tracking-tight font-light">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-sm font-mono opacity-60">
            {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Center Password Form */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-80 shadow-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 flex items-center justify-center text-2xl">
            {isSetupComplete ? kidAvatar : '🦊'}
          </div>
          <div className="text-center">
            <span className="text-xs font-bold text-white font-mono block">{isSetupComplete ? gmailUser.split('@')[0] : 'arch-user'}</span>
            <span className="text-[10px] text-white/40 font-mono">{isSetupComplete ? `${kidCategory} modu` : 'localhost'}</span>
          </div>

          {pinRequired ? (
            <div className="w-full space-y-3">
              <input 
                type="password"
                maxLength={4}
                value={lockInput}
                onChange={(e) => setLockInput(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="PIN Kodu"
                className={`w-full bg-black/40 border rounded px-3 py-2 text-center text-white text-xs font-mono tracking-widest focus:border-[var(--accent)] outline-none transition-all ${lockError ? 'border-red-500 animate-bounce' : 'border-white/10'}`}
                autoFocus
              />
              {lockError && (
                <p className="text-red-400 text-[10px] font-mono text-center">Hatalı PIN! Lütfen tekrar deneyin.</p>
              )}
              <button 
                onClick={handleUnlock}
                className="w-full py-2 rounded-lg bg-[var(--accent)] text-white font-bold text-xs hover:opacity-90 transition-opacity"
              >
                Giriş Yap
              </button>
            </div>
          ) : (
            <button 
              onClick={handleUnlock}
              className="w-full py-2 rounded-lg bg-[var(--accent)] text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              Kilidi Aç
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="text-[10px] font-mono text-white/30 text-center">
          Arch Linux &bull; {firewallActive ? 'Güvenlik Duvarı Aktif' : 'Güvenlik Duvarı Devre Dışı'}
        </div>
      </div>
    );
  }

  const desktopContent = (
    <div 
      className={`relative ${mobileMode ? 'h-full w-full rounded-[32px]' : 'h-screen w-screen'} overflow-y-auto overflow-x-hidden flex flex-col selection:bg-[var(--accent)] selection:bg-opacity-30 transition-all duration-700`}
      style={{ 
        background: getWallpaperGradient(wallpaper, accentColor),
        fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px',
        filter: `brightness(${brightness}%)`
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0 bg-[radial-gradient(var(--accent)_1px,transparent_1px)] [background-size:40px_40px]" 
          style={{ backgroundImage: `radial-gradient(${accentColor}33 1px, transparent 1px)` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] [background-size:100px_100px]" />
      </div>

      {/* Top Status Bar */}
      <TopBar 
        onLauncherToggle={toggleLauncher} 
        onPowerToggle={() => setIsPowerDialogOpen(true)}
        firewallActive={firewallActive}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Workspace */}
      <main className="flex-1 relative p-4 md:p-8 flex items-center justify-center">
        {/* Launcher Overlay */}
        <AnimatePresence>
          {isLauncherOpen && (
            <div className="absolute top-0 left-4 z-[100]">
              <Launcher 
                onClose={() => setIsLauncherOpen(false)} 
                onLaunch={handleLaunch} 
                onPowerClick={() => setIsPowerDialogOpen(true)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Power Dialog Overlay */}
        <AnimatePresence>
          {isPowerDialogOpen && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <PowerDialog 
                onClose={() => setIsPowerDialogOpen(false)}
                onShutdown={handleShutdown}
                onRestart={handleRestart}
              />
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTerminalOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-4xl h-full max-h-[600px] z-10"
            >
              <Terminal onClose={() => setIsTerminalOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-2xl h-full max-h-[500px] z-20"
            >
              <Settings 
                onClose={() => setIsSettingsOpen(false)} 
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                wallpaper={wallpaper}
                setWallpaper={setWallpaper}
                fontSize={fontSize}
                setFontSize={setFontSize}
                windowOpacity={windowOpacity}
                setWindowOpacity={setWindowOpacity}
                brightness={brightness}
                setBrightness={setBrightness}
                firewallActive={firewallActive}
                setFirewallActive={setFirewallActive}
                pinRequired={pinRequired}
                setPinRequired={setPinRequired}
                pinCode={pinCode}
                setPinCode={setPinCode}
                onLockScreen={() => {
                  setIsSettingsOpen(false);
                  setIsLocked(true);
                }}
                mobileMode={mobileMode}
                setMobileMode={setMobileMode}
                volume={volume}
                setVolume={setVolume}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                startupSoundEnabled={startupSoundEnabled}
                setStartupSoundEnabled={setStartupSoundEnabled}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isBrowserOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-5xl h-full max-h-[700px] z-30"
            >
              <Browser onClose={() => setIsBrowserOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFileManagerOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-4xl h-full max-h-[600px] z-40"
            >
              <FileManager 
                onClose={() => setIsFileManagerOpen(false)} 
                onOpenFile={(name, content) => {
                  setEditingFile({ name, content });
                  setIsEditorOpen(true);
                }}
                category={kidCategory}
                gmailUser={gmailUser}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isEmailOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-4xl h-full max-h-[600px] z-[45]"
            >
              <EmailApp onClose={() => setIsEmailOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTrashOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-2xl h-full max-h-[500px] z-50"
            >
              <TrashBin onClose={() => setIsTrashOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isEditorOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-3xl h-full max-h-[600px] z-[60]"
            >
              <TextEditor 
                onClose={() => setIsEditorOpen(false)} 
                fileName={editingFile.name}
                initialContent={editingFile.content}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isKidAppOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute w-full max-w-5xl h-full max-h-[600px] z-50"
            >
              <KidApp 
                onClose={() => setIsKidAppOpen(false)}
                category={kidCategory}
                gmailUser={gmailUser}
                avatar={kidAvatar}
                onLogout={handleKidLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Icons */}
        <div className="absolute top-8 left-8 flex flex-col gap-8">
          <button 
            onClick={() => setIsKidAppOpen(true)}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 group-hover:border-yellow-400 transition-all shadow-[0_0_12px_rgba(234,179,8,0.2)]">
              <Sparkles size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-mono text-yellow-300 group-hover:text-yellow-200 font-bold">Çocuk Dünyası</span>
            <div className="absolute -top-1.5 -right-1 px-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border border-pink-400 text-[8px] font-bold text-white scale-90 px-1 py-0.5 animate-pulse leading-none uppercase">
              Aktif
            </div>
          </button>

          <button 
            onClick={() => setIsTerminalOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <TerminalIcon size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Uçbirim</span>
          </button>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <SettingsIcon size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Ayarlar</span>
          </button>

          <button 
            onClick={() => setIsBrowserOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <Globe size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Tarayıcı</span>
          </button>

          <button 
            onClick={() => setIsFileManagerOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <Folder size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Ev</span>
          </button>

          <button 
            onClick={() => setIsEmailOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <Mail size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">E-posta</span>
          </button>

          <button 
            onClick={() => setIsEditorOpen(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
              <FileText size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Notlar.txt</span>
          </button>
        </div>
      </main>

      {/* Bottom Dock */}
      <div className="h-16 w-full flex items-center justify-center pb-4 z-50">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-4 shadow-2xl">
          <button 
            onClick={toggleTerminal}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isTerminalOpen ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <TerminalIcon size={20} className={isTerminalOpen ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>
          
          <button 
            onClick={toggleSettings}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isSettingsOpen ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <SettingsIcon size={20} className={isSettingsOpen ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>

          <button 
            onClick={toggleBrowser}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isBrowserOpen ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <Globe size={20} className={isBrowserOpen ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>

          <button 
            onClick={toggleFileManager}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isFileManagerOpen ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <Folder size={20} className={isFileManagerOpen ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>

          <button 
            onClick={toggleEmail}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isEmailOpen ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <Mail size={20} className={isEmailOpen ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>

          <button 
            onClick={() => setIsKidAppOpen(!isKidAppOpen)}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isKidAppOpen ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            title="Çocuk Dünyası"
          >
            <Sparkles size={20} className={isKidAppOpen ? 'text-yellow-400' : 'text-white/70'} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-1" />
          
          <button 
            onClick={toggleTrash}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isTrashOpen ? 'bg-red-500/20 border border-red-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
          >
            <Trash2 size={20} className={isTrashOpen ? 'text-red-500' : 'text-white/70'} />
          </button>
        </div>
      </div>
    </div>
  );

  if (mobileMode) {
    return (
      <div className="h-screen w-screen bg-[#070707] flex items-center justify-center p-4">
        {/* Outer Phone Frame */}
        <div className="w-[380px] h-[780px] border-[10px] border-neutral-800 bg-[#0d0d0d] rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col">
          {/* Status Notches / Camera details */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-[999] flex items-center justify-center">
            <div className="w-12 h-1 bg-black rounded-full mb-1" />
            <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full absolute right-4 top-1.5 border border-neutral-700" />
          </div>
          
          {desktopContent}

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-[999]" />
        </div>
      </div>
    );
  }

  return desktopContent;
}




