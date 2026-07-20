import React, { useState, useEffect, useRef } from 'react';
import { HelpDialog } from './components/HelpDialog';
import { playWindows11StartupSound } from './utils/audio';
import { getApiUrl } from './utils/api';
import { getOfflineSettings, saveOfflineSettings, saveOfflineFile } from './utils/localFileSystem';
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
import { PlayStore, playStoreApps, Minecraft2D, PianoKids, SpaceExplorer, ColoringBook, YTKids, BunnyPet } from './components/PlayStore';
import { ApkInstaller } from './components/ApkInstaller';
import { IsoInstaller } from './components/IsoInstaller';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Settings as SettingsIcon, Folder, Trash2, Globe, FileText, RotateCcw, Clock, Mail, Sparkles, Play, Cpu, ShoppingBag, Smartphone, Download, Package, X, ShieldCheck } from 'lucide-react';

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

const LockScreenClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center mt-12 gap-2 text-white">
      <Clock className="w-8 h-8 opacity-60" />
      <h1 className="text-5xl font-sans tracking-tight font-light">
        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </h1>
      <p className="text-sm font-mono opacity-60">
        {currentTime.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
};

export default function App() {
  // Kid OS states
  const [isKidAppOpen, setIsKidAppOpen] = useState(false);
  const [activePlayApps, setActivePlayApps] = useState<Record<string, boolean>>({});
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    return localStorage.getItem('archweb_kid_setup_complete') === 'true';
  });
  const [gmailUser, setGmailUser] = useState<string>(() => {
    return localStorage.getItem('archweb_gmail_user') || '';
  });
  const [gmailPassword, setGmailPassword] = useState<string>(() => {
    return localStorage.getItem('archweb_gmail_password') || '';
  });
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | 'microsoft' | 'apple'>(() => {
    return (localStorage.getItem('archweb_login_method') as any) || 'email';
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
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isApkInstallerOpen, setIsApkInstallerOpen] = useState(false);
  const [isIsoInstallerOpen, setIsIsoInstallerOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPowerDialogOpen, setIsPowerDialogOpen] = useState(false);
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
  const [launchedProgramName, setLaunchedProgramName] = useState('');
  const [launcherStep, setLauncherStep] = useState<'bootstrap' | 'menu'>('bootstrap');
  const [launcherLogs, setLauncherLogs] = useState<string[]>([]);
  const [isShutDown, setIsShutDown] = useState(true);
  const [isSystemBooting, setIsSystemBooting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSafeMode, setIsSafeMode] = useState<boolean>(() => {
    return localStorage.getItem('archweb_safe_mode') === 'true' || (import.meta as any).env.VITE_SAFE_MODE === 'true';
  });
  const [accentColor, setAccentColor] = useState('#1793d1');
  const [editingFile, setEditingFile] = useState({ name: 'notlar.txt', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.\n\nKeyfini çıkarın!', path: '/home/user/notlar.txt' });
  const [isSettingsLoadedFromServer, setIsSettingsLoadedFromServer] = useState(false);

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

  const [installedPlayStoreApps, setInstalledPlayStoreApps] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('playstore_installed_apps');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const handleAppsChanged = () => {
      const saved = localStorage.getItem('playstore_installed_apps');
      if (saved) setInstalledPlayStoreApps(JSON.parse(saved));
    };
    window.addEventListener('playstore_apps_changed', handleAppsChanged);
    return () => window.removeEventListener('playstore_apps_changed', handleAppsChanged);
  }, []);

  useEffect(() => {
    const handleLaunchApp = (e: any) => {
      const appId = e.detail;
      if (appId) {
        setActivePlayApps(prev => ({ ...prev, [appId]: true }));
      }
    };
    window.addEventListener('playstore_launch_app', handleLaunchApp);
    return () => window.removeEventListener('playstore_launch_app', handleLaunchApp);
  }, []);
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

  const handleSetupComplete = (
    gmail: string,
    category: 'education' | 'gaming' | 'creativity' | 'science',
    avatar: string,
    method: 'email' | 'google' | 'microsoft' | 'apple' = 'email',
    password?: string
  ) => {
    setGmailUser(gmail);
    setKidCategory(category);
    setKidAvatar(avatar);
    setLoginMethod(method);
    if (password) {
      setGmailPassword(password);
      localStorage.setItem('archweb_gmail_password', password);
    }
    setIsSetupComplete(true);
    localStorage.setItem('archweb_gmail_user', gmail);
    localStorage.setItem('archweb_login_method', method);
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
    setGmailPassword('');
    setLoginMethod('email');
    setKidCategory('education');
    setKidAvatar('🦊');
    localStorage.removeItem('archweb_gmail_user');
    localStorage.removeItem('archweb_gmail_password');
    localStorage.removeItem('archweb_login_method');
    localStorage.removeItem('archweb_kid_category');
    localStorage.removeItem('archweb_kid_avatar');
    localStorage.removeItem('archweb_kid_setup_complete');
    setIsKidAppOpen(false);
  };

  const [lockInput, setLockInput] = useState('');
  const [lockError, setLockError] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  const lastSavedSettings = useRef<any>(null);

  // Load settings from the server or local fallback on startup
  useEffect(() => {
    const loadSettings = async () => {
      let success = false;
      let settings = null;
      try {
        const response = await fetch(getApiUrl('/api/settings'));
        if (response.ok) {
          settings = await response.json();
          success = true;
        }
      } catch (err) {
        console.warn("Local network server connection silent handling:", err);
      }

      if (!success) {
        settings = getOfflineSettings();
      }

      if (settings) {
        lastSavedSettings.current = settings;
        if (settings.accentColor) setAccentColor(settings.accentColor);
        if (settings.wallpaper !== undefined) setWallpaper(settings.wallpaper);
        if (settings.volume !== undefined) setVolume(settings.volume);
        if (settings.isMuted !== undefined) setIsMuted(settings.isMuted);
        if (settings.startupSoundEnabled !== undefined) setStartupSoundEnabled(settings.startupSoundEnabled);
        if (settings.isSetupComplete !== undefined) setIsSetupComplete(settings.isSetupComplete);
        if (settings.gmailUser !== undefined) setGmailUser(settings.gmailUser);
        if (settings.gmailPassword !== undefined) setGmailPassword(settings.gmailPassword);
        if (settings.loginMethod !== undefined) setLoginMethod(settings.loginMethod);
        if (settings.kidCategory !== undefined) setKidCategory(settings.kidCategory);
        if (settings.kidAvatar !== undefined) setKidAvatar(settings.kidAvatar);
        if (settings.pinRequired !== undefined) setPinRequired(settings.pinRequired);
        if (settings.pinCode !== undefined) setPinCode(settings.pinCode);
        if (settings.mobileMode !== undefined) setMobileMode(settings.mobileMode);
        if (settings.brightness !== undefined) setBrightness(settings.brightness);
        if (settings.firewallActive !== undefined) setFirewallActive(settings.firewallActive);
        
        // Ensure local fallback is also in sync
        saveOfflineSettings(settings);
      }
      setIsSettingsLoadedFromServer(true);
    };
    loadSettings();
  }, []);

  // Save settings to the server and local fallback when they change
  useEffect(() => {
    if (!isSettingsLoadedFromServer) return;
    const saveSettings = async () => {
      const payload = {
        accentColor,
        wallpaper,
        volume,
        isMuted,
        startupSoundEnabled,
        isSetupComplete,
        gmailUser,
        gmailPassword,
        loginMethod,
        kidCategory,
        kidAvatar,
        pinRequired,
        pinCode,
        mobileMode,
        brightness,
        firewallActive
      };

      if (lastSavedSettings.current && JSON.stringify(lastSavedSettings.current) === JSON.stringify(payload)) {
        return; // No actual change, prevent infinite loops with server file watcher
      }
      lastSavedSettings.current = payload;

      // Always save to offline localStorage
      saveOfflineSettings(payload);

      try {
        await fetch(getApiUrl('/api/settings'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn("Local network server connection silent handling:", err);
      }
    };
    saveSettings();
  }, [
    isSettingsLoadedFromServer,
    accentColor,
    wallpaper,
    volume,
    isMuted,
    startupSoundEnabled,
    isSetupComplete,
    gmailUser,
    gmailPassword,
    loginMethod,
    kidCategory,
    kidAvatar,
    pinRequired,
    pinCode,
    mobileMode,
    brightness,
    firewallActive
  ]);

  useEffect(() => {
    if (isSystemBooting) {
      const timer = setTimeout(() => {
        setIsSystemBooting(false);
        setIsLocked(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSystemBooting]);

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
          setIsPlayStoreOpen(false);
          setIsTrashOpen(false);
          setIsEditorOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLauncherOpen, isTerminalOpen, isSettingsOpen, isBrowserOpen, isFileManagerOpen, isTrashOpen, isEditorOpen, isPlayStoreOpen, isApkInstallerOpen]);

  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleBrowser = () => {
    if (!isBrowserOpen && isSafeMode) {
      return;
    }
    setIsBrowserOpen(!isBrowserOpen);
  };
  const toggleFileManager = () => setIsFileManagerOpen(!isFileManagerOpen);
  const toggleEmail = () => {
    if (!isEmailOpen && isSafeMode) {
      return;
    }
    setIsEmailOpen(!isEmailOpen);
  };
  const togglePlayStore = () => {
    if (!isPlayStoreOpen && isSafeMode) {
      return;
    }
    setIsPlayStoreOpen(!isPlayStoreOpen);
  };
  const toggleTrash = () => setIsTrashOpen(!isTrashOpen);
  const toggleLauncher = () => setIsLauncherOpen(!isLauncherOpen);

  const handleExecuteProgram = (name: string) => {
    setLaunchedProgramName(name);
    setIsAppLauncherOpen(true);
    setLauncherStep('bootstrap');
    setLauncherLogs([]);

    if (name === 'archweb kids setup.bat') {
      playWindows11StartupSound(volume, isMuted, true);
    }

    const logMessages = [
      `$ ./${name}`,
      `[  SİSTEM  ] Sanal dosya sistemi doğrulanıyor... Başarılı.`,
      `[  SİSTEM  ] Sistem kütüphaneleri yükleniyor...`,
      `[  SİSTEM  ] Bağımlılık paketleri denetleniyor...`,
      `[  SİSTEM  ] Grafik arayüz motoru (X11/Wayland) başlatıldı.`,
      `[  BAŞARI  ] '${name}' programı başarıyla çalıştırıldı!`,
      `[  BİLGİ  ] Uygulama Yönetim Merkezi hazırlanıyor...`
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < logMessages.length) {
        setLauncherLogs(prev => [...prev, logMessages[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setLauncherStep('menu');
        }, 300);
      }
    }, 200);
  };

  const handleLaunch = (appId: string) => {
    switch (appId) {
      case 'terminal': setIsTerminalOpen(true); break;
      case 'settings': setIsSettingsOpen(true); break;
      case 'browser': 
        if (!isSafeMode) { setIsBrowserOpen(true); }
        break;
      case 'files': setIsFileManagerOpen(true); break;
      case 'email': 
        if (!isSafeMode) { setIsEmailOpen(true); }
        break;
      case 'playstore': 
        if (!isSafeMode) { setIsPlayStoreOpen(true); }
        break;
      case 'help': setIsHelpOpen(true); break;
      case 'trash': setIsTrashOpen(true); break;
    }
  };

  const handleShutdown = () => {
    setIsPowerDialogOpen(false);
    setIsShutDown(true);
    localStorage.removeItem('archweb_safe_mode');
    setIsSafeMode(false);
  };

  const handleRestart = () => {
    setIsPowerDialogOpen(false);
    setIsRestarting(true);
    localStorage.removeItem('archweb_safe_mode');
    setIsSafeMode(false);
    setTimeout(() => {
      setIsRestarting(false);
      setIsSystemBooting(true);
      // Reset all windows
      setIsTerminalOpen(false);
      setIsSettingsOpen(false);
      setIsBrowserOpen(false);
      setIsFileManagerOpen(false);
      setIsEmailOpen(false);
      setIsPlayStoreOpen(false);
      setIsTrashOpen(false);
      setIsEditorOpen(false);
      setIsApkInstallerOpen(false);
    }, 3000);
  };

  const handleSafeMode = () => {
    setIsPowerDialogOpen(false);
    setIsRestarting(true);
    localStorage.setItem('archweb_safe_mode', 'true');
    setIsSafeMode(true);
    setTimeout(() => {
      setIsRestarting(false);
      setIsSystemBooting(true);
      // Reset all windows
      setIsTerminalOpen(false);
      setIsSettingsOpen(false);
      setIsBrowserOpen(false);
      setIsFileManagerOpen(false);
      setIsEmailOpen(false);
      setIsPlayStoreOpen(false);
      setIsTrashOpen(false);
      setIsEditorOpen(false);
      setIsApkInstallerOpen(false);
    }, 3000);
  };

  if (isShutDown) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-4 animate-in fade-in duration-1000">
        <div className="text-white/20 font-mono text-sm">Sistem kapandı.</div>
        <button 
          onClick={() => {
            setIsShutDown(false);
            setIsSystemBooting(true);
          }}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs"
        >
          Sistemi Başlat
        </button>
      </div>
    );
  }

  if (isSystemBooting) {
    return (
      <div id="boot-loader-container" className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-5 font-sans select-none z-[9999]">
        <div className="w-10 h-10 rounded-full border-2 border-t-[var(--accent)] border-white/10 animate-spin" />
        <div className="text-white/40 text-xs font-mono tracking-widest uppercase animate-pulse">Sistem Başlatılıyor...</div>
      </div>
    );
  }

  if (isRestarting) {
    const isSafe = localStorage.getItem('archweb_safe_mode') === 'true';
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center gap-6 font-mono">
        <div className="flex flex-col gap-1 text-[var(--accent)] text-xs">
          {isSafe ? (
            <>
              <div>[  OK  ] Reached target Safe Graphical Interface.</div>
              <div>[  OK  ] Loaded minimal system modules.</div>
              <div>[  OK  ] Mounted recovery and diagnostic mode.</div>
              <div className="animate-pulse mt-4 text-amber-500 font-bold">Sistem GÜVENLİ MODDA başlatılıyor...</div>
            </>
          ) : (
            <>
              <div>[  OK  ] Reached target Graphical Interface.</div>
              <div>[  OK  ] Stopped Getty on tty1.</div>
              <div>[  OK  ] Stopped User Manager for UID 1000.</div>
              <div className="animate-pulse mt-4">Sistem yeniden başlatılıyor...</div>
            </>
          )}
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
    } else if (gmailPassword) {
      if (lockInput === gmailPassword) {
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

  const handleAppOpen = (appName: string, openSetter: (v: boolean) => void) => {
    if (isSafeMode && !['terminal', 'settings', 'filemanager', 'trash'].includes(appName)) {
      return;
    }
    openSetter(true);
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
        <LockScreenClock />

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
          ) : gmailPassword ? (
            <div className="w-full space-y-3">
              <input 
                type="password"
                value={lockInput}
                onChange={(e) => setLockInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="E-Posta Şifrenizi Girin"
                className={`w-full bg-black/40 border rounded px-3 py-2 text-center text-white text-xs focus:border-[var(--accent)] outline-none transition-all ${lockError ? 'border-red-500 animate-bounce' : 'border-white/10'}`}
                autoFocus
              />
              {lockError && (
                <p className="text-red-400 text-[10px] font-mono text-center">Hatalı Şifre! Lütfen tekrar deneyin.</p>
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

          {(pinRequired || gmailPassword) && (
            <button
              onClick={() => {
                if (window.confirm("Şifrenizi unuttunuz mu? Tüm kayıtlı kullanıcı hesapları ve veriler silinecektir. Devam etmek istiyor musunuz?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="mt-1 text-[10px] text-white/40 hover:text-red-400 underline cursor-pointer transition-colors font-mono"
            >
              Şifremi Unuttum / Sıfırla
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
      className={`relative ${mobileMode ? 'h-full w-full rounded-none sm:rounded-[32px]' : 'h-screen w-screen'} overflow-hidden flex flex-col selection:bg-[var(--accent)] selection:bg-opacity-30 transition-all duration-700`}
      style={{ 
        background: getWallpaperGradient(wallpaper, accentColor),
        fontSize: fontSize === 'small' ? '12px' : fontSize === 'large' ? '16px' : '14px',
        filter: `brightness(${brightness}%) ${isSafeMode ? 'grayscale(0.6) contrast(1.05)' : ''}`
      }}
    >
      {/* Safe Mode Banner & Watermarks */}
      {isSafeMode && (
        <>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[80] w-full max-w-xl px-4 pointer-events-auto">
            <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-red-200 shadow-lg select-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span><strong>Güvenli Mod Aktif:</strong> Sadece temel sistem özellikleri devrede.</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('archweb_safe_mode');
                  setIsSafeMode(false);
                }}
                className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 font-bold transition-all text-[10px] text-white whitespace-nowrap cursor-pointer"
              >
                Normal Moda Dön
              </button>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none select-none z-[10] overflow-hidden">
            <div className="absolute top-12 left-4 text-[10px] font-mono font-bold text-red-500/15 uppercase tracking-widest">Güvenli Mod</div>
            <div className="absolute top-12 right-4 text-[10px] font-mono font-bold text-red-500/15 uppercase tracking-widest">Güvenli Mod</div>
            <div className="absolute bottom-20 left-4 text-[10px] font-mono font-bold text-red-500/15 uppercase tracking-widest">Güvenli Mod</div>
            <div className="absolute bottom-20 right-4 text-[10px] font-mono font-bold text-red-500/15 uppercase tracking-widest">Güvenli Mod</div>
          </div>
        </>
      )}
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
        onHelpToggle={() => setIsHelpOpen(true)}
        onPowerToggle={() => setIsPowerDialogOpen(true)}
        onLockScreen={() => setIsLocked(true)}
        firewallActive={firewallActive}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        mobileMode={mobileMode}
        onMobileToggle={() => setMobileMode(!mobileMode)}
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
                userAvatar={kidAvatar}
                userName={gmailUser.split('@')[0]}
                userEmail={gmailUser}
                userPassword={gmailPassword}
                loginMethod={loginMethod}
                kidCategory={kidCategory}
                onLogout={handleKidLogout}
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
                onSafeMode={handleSafeMode}
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
              className={`absolute w-full h-full transition-all duration-300 z-10 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-4xl max-h-[600px] rounded-lg'}`}
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
              className={`absolute w-full h-full transition-all duration-300 z-20 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-2xl max-h-[500px] rounded-lg'}`}
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
                gmailPassword={gmailPassword}
                setGmailPassword={setGmailPassword}
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
              className={`absolute w-full h-full transition-all duration-300 z-30 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-5xl max-h-[700px] rounded-lg'}`}
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
              className={`absolute w-full h-full transition-all duration-300 z-40 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-4xl max-h-[600px] rounded-lg'}`}
            >
              <FileManager 
                onClose={() => setIsFileManagerOpen(false)} 
                onOpenFile={(name, content, path) => {
                  if (name === 'uygulamayi_ac.sh' || name === 'baslat.desktop' || name === 'archweb_launcher.exe' || name === 'archweb kids setup.bat') {
                    handleExecuteProgram(name);
                  } else if (name === 'archweb.dmg' || name === 'archweb.deb' || name === 'archweb.dev' || name === 'Server.apk' || name === 'archinstall.apk' || name.endsWith('.apk')) {
                    setIsApkInstallerOpen(true);
                  } else if (name.endsWith('.iso')) {
                    setIsIsoInstallerOpen(true);
                  } else {
                    setEditingFile({ name, content, path });
                    setIsEditorOpen(true);
                  }
                }}
                category={kidCategory}
                gmailUser={gmailUser}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAppLauncherOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute w-full max-w-xl bg-[#0d0d12] rounded-xl border border-white/10 overflow-hidden shadow-2xl z-[90] flex flex-col font-sans text-white/90"
              id="app-launcher-modal"
            >
              {/* Title Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-[var(--accent)] animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-tight">
                    ArchWeb Program Başlatıcı — {launchedProgramName}
                  </span>
                </div>
                <button 
                  onClick={() => setIsAppLauncherOpen(false)}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  id="close-launcher-btn"
                />
              </div>

              {/* Window Body */}
              <div className="p-5 flex-1 flex flex-col overflow-hidden min-h-[320px] max-h-[460px]">
                {launcherStep === 'bootstrap' ? (
                  <div className="flex-1 flex flex-col bg-black/60 rounded-lg p-4 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1.5 border border-white/5 shadow-inner">
                    {launcherLogs.map((log, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-emerald-500/40">[{index + 1}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-4 text-white/50">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                      <span>Program yükleniyor, lütfen bekleyin...</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
                    <div className="text-center space-y-1.5 pb-2 border-b border-white/5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Program Aktif
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Sistem Uygulama Yönetim Paneli</h3>
                      <p className="text-[11px] text-white/50">ArchWeb OS sanal katmanında çalıştırmak istediğiniz masaüstü uygulamasını seçin:</p>
                    </div>

                    {/* Applications Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => {
                          setIsTerminalOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-terminal"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <TerminalIcon size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Uçbirim (Terminal)</div>
                          <div className="text-[9px] text-white/40">Komut satırı simülatörü</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setIsFileManagerOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-files"
                      >
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <Folder size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Ev Dizini (Dosyalar)</div>
                          <div className="text-[9px] text-white/40">Sanal dosya yöneticisi</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setIsBrowserOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-browser"
                      >
                        <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                          <Globe size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">İnternet Tarayıcısı</div>
                          <div className="text-[9px] text-white/40">Web sörf simülasyonu</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setIsSettingsOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-settings"
                      >
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <SettingsIcon size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Sistem Ayarları</div>
                          <div className="text-[9px] text-white/40">Tema ve konfigürasyonlar</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setIsEmailOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-email"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                          <Mail size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">E-Posta İstemcisi</div>
                          <div className="text-[9px] text-white/40">Simüle posta kutusu</div>
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setIsKidAppOpen(true);
                          setIsAppLauncherOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/40 hover:bg-white/10 transition-all text-left group"
                        id="launcher-run-kids"
                      >
                        <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Çocuk Dünyası</div>
                          <div className="text-[9px] text-white/40">Eğitim ve oyun paneli</div>
                        </div>
                      </button>
                    </div>

                    {/* Bottom Options */}
                    <div className="pt-3 border-t border-white/5 flex gap-2 justify-end">
                      <button 
                        onClick={() => {
                          setIsAppLauncherOpen(false);
                          handleRestart();
                        }}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/10 font-bold font-mono transition-all flex items-center gap-1"
                        id="launcher-system-restart"
                      >
                        <RotateCcw size={12} />
                        Sistemi Yeniden Başlat
                      </button>
                      <button 
                        onClick={() => setIsAppLauncherOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-white/60 font-bold transition-all"
                        id="launcher-close"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              className={`absolute w-full h-full transition-all duration-300 z-[45] ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-4xl max-h-[600px] rounded-lg'}`}
            >
              <EmailApp onClose={() => setIsEmailOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPlayStoreOpen && (
            <PlayStore onClose={() => setIsPlayStoreOpen(false)} mobileMode={mobileMode} />
          )}
        </AnimatePresence>

        {playStoreApps.map((app) => {
          const isOpen = activePlayApps[app.id];
          if (!isOpen) return null;
          const AppContent = app.id === 'minecraft2d' ? Minecraft2D :
                             app.id === 'piano_kids' ? PianoKids :
                             app.id === 'space_explorer' ? SpaceExplorer :
                             app.id === 'coloring_book' ? ColoringBook :
                             app.id === 'yt_kids' ? YTKids :
                             BunnyPet;
          return (
            <AnimatePresence key={app.id}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`absolute w-full h-full transition-all duration-300 z-[80] ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-3xl max-h-[600px] rounded-lg border border-white/10 shadow-2xl bg-[#1e2022] overflow-hidden flex flex-col'}`}
              >
                {/* Window Title Bar */}
                <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between border-b border-white/5 select-none shrink-0 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold">{app.name}</span>
                  </div>
                  <button 
                    onClick={() => setActivePlayApps(prev => ({ ...prev, [app.id]: false }))}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors border-none outline-none cursor-pointer"
                  >
                    <X size={12} />
                    Uygulamayı Kapat
                  </button>
                </div>
                {/* Window Content */}
                <div className="flex-1 overflow-auto bg-gray-50">
                  <AppContent />
                </div>
              </motion.div>
            </AnimatePresence>
          );
        })}

        <AnimatePresence>
          {isTrashOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute w-full h-full transition-all duration-300 z-50 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-2xl max-h-[500px] rounded-lg'}`}
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
              className={`absolute w-full h-full transition-all duration-300 z-[60] ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-3xl max-h-[600px] rounded-lg'}`}
            >
              <TextEditor 
                onClose={() => setIsEditorOpen(false)} 
                fileName={editingFile.name}
                initialContent={editingFile.content}
                onSave={async (newContent) => {
                  const virtualPath = editingFile.path || `/home/user/${editingFile.name}`;
                  
                  // Always save to local virtual fallback storage
                  saveOfflineFile(virtualPath, newContent);
                  setEditingFile(prev => ({ ...prev, content: newContent }));

                  try {
                    await fetch(getApiUrl('/api/files'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        virtualPath, 
                        content: newContent 
                      })
                    });
                  } catch (err) {
                    console.warn("Local network server connection silent handling:", err);
                  }

                  // Trigger custom refresh event for FileManager
                  window.dispatchEvent(new CustomEvent('file_saved_refresh'));
                }}
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
              className={`absolute w-full h-full transition-all duration-300 z-50 ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-5xl max-h-[600px] rounded-lg'}`}
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

        <AnimatePresence>
          {isApkInstallerOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`absolute w-full h-full transition-all duration-300 z-[70] ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-3xl max-h-[580px] rounded-lg'}`}
            >
              <ApkInstaller onClose={() => setIsApkInstallerOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isIsoInstallerOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute w-full h-full transition-all duration-300 z-[75] ${mobileMode ? 'inset-0 max-w-none max-h-none rounded-none' : 'inset-0 m-auto max-w-4xl max-h-[640px] rounded-2xl overflow-hidden shadow-2xl'}`}
            >
              <IsoInstaller onClose={() => setIsIsoInstallerOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
              <HelpDialog onClose={() => setIsHelpOpen(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* Desktop Icons */}
        <div className="absolute top-8 left-8 bottom-24 flex flex-col flex-wrap content-start gap-x-6 gap-y-8">
          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('kidapp', setIsKidAppOpen)}
              className="flex flex-col items-center gap-1 group relative cursor-pointer"
            >
              <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 group-hover:border-yellow-400 transition-all shadow-[0_0_12px_rgba(234,179,8,0.2)]">
                <Sparkles size={24} className="text-yellow-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-mono text-yellow-300 group-hover:text-yellow-200 font-bold">Çocuk Dünyası</span>
              <div className="absolute -top-1.5 -right-1 px-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full border border-pink-400 text-[8px] font-bold text-white scale-90 px-1 py-0.5 animate-pulse leading-none uppercase">
                Aktif
              </div>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('terminal', setIsTerminalOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <TerminalIcon size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Uçbirim</span>
            </button>
          </motion.div>
          
          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('settings', setIsSettingsOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <SettingsIcon size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Ayarlar</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('browser', setIsBrowserOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <Globe size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Tarayıcı</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('filemanager', setIsFileManagerOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <Folder size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Ev</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('email', setIsEmailOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <Mail size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">E-posta</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('playstore', setIsPlayStoreOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[#01875f] transition-all">
                <ShoppingBag size={24} className="text-white/80 group-hover:text-[#01875f]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Play Store</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('editor', setIsEditorOpen)}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all">
                <FileText size={24} className="text-white/80 group-hover:text-[var(--accent)]" />
              </div>
              <span className="text-[10px] font-mono text-white/60 group-hover:text-white">Notlar.txt</span>
            </button>
          </motion.div>

          <motion.div drag dragMomentum={false}>
            <button 
              onClick={() => handleAppOpen('apkinstaller', setIsApkInstallerOpen)}
              className="flex flex-col items-center gap-1 group relative cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-400 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <Package size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[10px] font-mono text-emerald-300 group-hover:text-emerald-200 font-bold">Sistem Yükle</span>
              <div className="absolute -top-1.5 -right-1 px-1 bg-emerald-500 rounded-full border border-emerald-400 text-[8px] font-bold text-white scale-90 px-1 py-0.5 leading-none">
                YÜKLE
              </div>
            </button>
          </motion.div>

          {/* Installed Play Store Apps */}
          {playStoreApps
            .filter((app) => installedPlayStoreApps[app.id])
            .map((app) => {
              const Icon = app.icon;
              return (
                <motion.div key={app.id} drag dragMomentum={false}>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('playstore_launch_app', { detail: app.id }));
                    }}
                    className="flex flex-col items-center gap-1 group relative cursor-pointer"
                  >
                    <div className={`w-12 h-12 ${app.iconBg} border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-[var(--accent)] transition-all`}>
                      <Icon size={24} style={{ color: app.iconColor }} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-white/60 group-hover:text-white max-w-[64px] text-center truncate">{app.name}</span>
                  </button>
                </motion.div>
              );
            })}
        </div>
      </main>

      {/* Bottom Dock */}
      <div className="h-16 w-full flex items-center justify-center pb-4 z-[100] px-2">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2 sm:gap-4 shadow-2xl max-w-full overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none' }}>
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
            onClick={togglePlayStore}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isPlayStoreOpen ? 'bg-[#01875f]/20 border border-[#01875f]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            title="Google Play Store"
          >
            <ShoppingBag size={20} className={isPlayStoreOpen ? 'text-[#01875f]' : 'text-white/70'} />
          </button>

          <button 
            onClick={() => setIsKidAppOpen(!isKidAppOpen)}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isKidAppOpen ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            title="Çocuk Dünyası"
          >
            <Sparkles size={20} className={isKidAppOpen ? 'text-yellow-400' : 'text-white/70'} />
          </button>

          <button 
            onClick={() => setMobileMode(!mobileMode)}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${mobileMode ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            title="Telefon Modu"
          >
            <Smartphone size={20} className={mobileMode ? 'text-[var(--accent)]' : 'text-white/70'} />
          </button>

          <button 
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className={`p-2 rounded-xl transition-all hover:scale-110 ${isHelpOpen ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
            title="Yardım ve Destek"
          >
            <ShieldCheck size={20} className={isHelpOpen ? 'text-emerald-400' : 'text-white/70'} />
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
      <div className="h-[100dvh] w-screen bg-[#070707] flex items-center justify-center sm:p-4 overflow-hidden">
        {/* Outer Phone Frame - Responsive: Fullscreen on mobile, framed on desktop */}
        <div className="w-full h-full sm:w-[380px] sm:h-[780px] sm:max-h-[95dvh] sm:border-[10px] sm:border-neutral-800 bg-[#0d0d0d] rounded-none sm:rounded-[48px] overflow-hidden sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col">
          {/* Status Notches / Camera details */}
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-800 rounded-b-2xl z-[999] items-center justify-center">
            <div className="w-12 h-1 bg-black rounded-full mb-1" />
            <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full absolute right-4 top-1.5 border border-neutral-700" />
          </div>
          
          {desktopContent}

          {/* Home Indicator Bar */}
          <button 
            onClick={() => {
              setIsTerminalOpen(false);
              setIsSettingsOpen(false);
              setIsBrowserOpen(false);
              setIsFileManagerOpen(false);
              setIsEmailOpen(false);
              setIsPlayStoreOpen(false);
              setIsTrashOpen(false);
              setIsEditorOpen(false);
              setIsKidAppOpen(false);
              setIsApkInstallerOpen(false);
              setIsAppLauncherOpen(false);
              setIsLauncherOpen(false);
            }}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-2 hover:bg-white bg-white/40 rounded-full z-[999] transition-all cursor-pointer border-none outline-none"
            title="Ana Ekrana Dön"
          />
        </div>
      </div>
    );
  }

  return desktopContent;
}




