import React, { useState, useEffect } from 'react';
import { Mail, Check, AlertCircle, ChevronRight, ArrowLeft, Star, Sparkles, Brain, Gamepad2, Paintbrush, Rocket, Eye, EyeOff, Lock, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KidLoginProps {
  onBack?: () => void;
  onComplete: (
    gmail: string,
    category: 'education' | 'gaming' | 'creativity' | 'science',
    avatar: string,
    loginMethod: 'email' | 'google' | 'microsoft' | 'apple',
    password?: string,
    role?: 'admin' | 'user'
  ) => void;
}

const AVATARS = [
  { emoji: '🦊', label: 'Tatlı Tilki' },
  { emoji: '🐼', label: 'Sevimli Panda' },
  { emoji: '🤖', label: 'Bilim Robotu' },
  { emoji: '🦁', label: 'Cesur Aslan' },
  { emoji: '🦄', label: 'Sihirli Tekboynuz' },
  { emoji: '🚀', label: 'Roket Kâşifi' },
];

const CATEGORIES = [
  {
    id: 'education' as const,
    title: 'Eğitim & Dersler',
    icon: Brain,
    color: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-400',
    bgLight: 'bg-amber-400/10',
    desc: 'Eğlenceli matematik soruları çöz, ödevlerini takip et ve parlak yıldızlar topla! 🎓',
  },
  {
    id: 'gaming' as const,
    title: 'Oyun & Eğlence',
    icon: Gamepad2,
    color: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-400',
    bgLight: 'bg-pink-400/10',
    desc: 'Retro arcade yılan oyunu oyna, en yüksek rekorunu kır ve eğlencenin tadını çıkar! 🎮',
  },
  {
    id: 'creativity' as const,
    title: 'Resim & Yaratıcılık',
    icon: Paintbrush,
    color: 'from-teal-400 to-emerald-500',
    borderColor: 'border-teal-400',
    bgLight: 'bg-teal-400/10',
    desc: 'Sihirli tuvalde neon renklerle resim çiz, harika masallar yaz ve kütüphaneni doldur! 🎨',
  },
  {
    id: 'science' as const,
    title: 'Bilim & Keşif',
    icon: Rocket,
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400',
    bgLight: 'bg-purple-400/10',
    desc: 'Yapay Zeka Bilim Robotu ile sohbet et, gezegenlerin gizemini çöz ve uzayı keşfet! 🧪',
  },
];

export const KidLogin: React.FC<KidLoginProps> = ({ onComplete, onBack }) => {
  // Always default to step 1 (Yeni Hesap Ekle / Oluştur) on initial site access
  const [step, setStep] = useState<0 | 1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].emoji);
  const [selectedCategory, setSelectedCategory] = useState<'education' | 'gaming' | 'creativity' | 'science'>('education');
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | 'microsoft' | 'apple'>('email');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [savedUsers, setSavedUsers] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    try {
      const savedUsersRaw = localStorage.getItem('archweb_registered_users');
      const parsed = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
      setSavedUsers(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setSavedUsers([]);
    }
  }, []);

  const handleSystemReset = () => {
    setIsResetting(true);
    setShowResetConfirm(false);
    
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear specific keys just in case
      const keys = [
        'archweb_kid_setup_complete', 'archweb_gmail_user', 'archweb_gmail_password',
        'archweb_login_method', 'archweb_kid_category', 'archweb_kid_avatar',
        'archweb_registered_users', 'archweb_safe_mode', 'archweb_wallpaper',
        'archweb_accent_color', 'archweb_brightness', 'archweb_font_size',
        'archweb_firewall_active', 'archweb_is_locked', 'archweb_pin_code',
        'archweb_pin_required', 'archweb_launcher_first_run'
      ];
      keys.forEach(k => localStorage.removeItem(k));
      window.location.assign('/');
    }, 1500);
  };

  const handleAccountSelect = (user: any) => {
    // Log in directly! We load their saved preferences
    onComplete(user.email, user.category || 'education', user.avatar || '🦊', user.loginMethod || 'email', user.password);
  };

  // Interactive SSO simulation popup state
  const [ssoPopup, setSsoPopup] = useState<{
    provider: 'google' | 'microsoft' | 'apple';
    inputEmail: string;
    inputPassword: string;
    showPass: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    error: string;
  } | null>(null);

  const handleNextStep = () => {
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin! 😊');
      return;
    }

    let fullEmail = email.trim();
    // Auto-append domain if they just typed a username
    if (!fullEmail.includes('@')) {
      fullEmail += '@archweb.com';
      setEmail(fullEmail);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fullEmail)) {
      setError('Hımm, bu geçerli bir e-posta adresine benzemiyor. Kontrol eder misin?');
      return;
    }

    if (!password.trim()) {
      setError('Lütfen e-posta şifrenizi girin! 🔑');
      return;
    }

    if (password.length < 4) {
      setError('Şifre en az 4 karakter olmalıdır!');
      return;
    }

    // Read saved accounts to enforce "no entrance without real/saved account"
    const savedUsersRaw = localStorage.getItem('archweb_registered_users');
    const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

    if (isRegistering) {
      // Check if user already exists
      const exists = savedUsers.some((u: any) => u.email.toLowerCase() === fullEmail.toLowerCase());
      if (exists) {
        setError('Bu e-posta adresiyle zaten kayıtlı bir hesap bulunuyor! Lütfen Giriş Yap sekmesini kullanın.');
        return;
      }
      setLoginMethod('email');
      setError('');
      setStep(2);
    } else {
      // Login mode - find the registered account
      const foundUser = savedUsers.find((u: any) => u.email.toLowerCase() === fullEmail.toLowerCase() && u.password === password);
      if (!foundUser) {
        setError('Hesap bulunamadı veya şifre yanlış! Lütfen kayıt olun veya şifrenizi kontrol edin.');
        return;
      }
      // Log in directly! We load their saved preferences
      setSelectedAvatar(foundUser.avatar || '🦊');
      setSelectedCategory(foundUser.category || 'education');
      setLoginMethod(foundUser.loginMethod || 'email');
      setError('');
      
      // Let's set it up! We can immediately complete the login!
      const isSpecialAdmin = (fullEmail.toLowerCase() === 'meminalp2434@gmail.com' && password === '2434ytact');
      const finalRole = isSpecialAdmin ? 'admin' : (foundUser.role || 'user');
      onComplete(fullEmail, foundUser.category || 'education', foundUser.avatar || '🦊', foundUser.loginMethod || 'email', password, finalRole);
    }
  };

  const handleSsoClick = (provider: 'google' | 'microsoft' | 'apple') => {
    let defaultEmail = '';
    if (provider === 'google') defaultEmail = 'kullanici@gmail.com';
    if (provider === 'microsoft') defaultEmail = 'kullanici@outlook.com';
    if (provider === 'apple') defaultEmail = 'kullanici@icloud.com';

    setSsoPopup({
      provider,
      inputEmail: defaultEmail,
      inputPassword: '••••••••',
      showPass: false,
      isLoading: false,
      isSuccess: false,
      error: '',
    });
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoPopup) return;

    if (!ssoPopup.inputEmail.trim()) {
      setSsoPopup(p => p ? { ...p, error: 'E-posta alanı boş bırakılamaz!' } : null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ssoPopup.inputEmail.trim())) {
      setSsoPopup(p => p ? { ...p, error: 'Geçersiz e-posta formatı!' } : null);
      return;
    }

    if (!ssoPopup.inputPassword.trim()) {
      setSsoPopup(p => p ? { ...p, error: 'Şifre alanı boş bırakılamaz!' } : null);
      return;
    }

    // Start loading simulation
    setSsoPopup(p => p ? { ...p, isLoading: true, error: '' } : null);

    setTimeout(() => {
      // Simulate success after 1.5s
      setSsoPopup(p => p ? { ...p, isLoading: false, isSuccess: true } : null);

      setTimeout(() => {
        // Complete the step, copy SSO details, and go to Step 2
        setEmail(ssoPopup.inputEmail);
        setPassword(ssoPopup.inputPassword);
        setLoginMethod(ssoPopup.provider);
        setSsoPopup(null);
        setError('');
        setStep(2);
      }, 1000);
    }, 1500);
  };

  const handleFinish = () => {
    // Save account to list
    const savedUsersRaw = localStorage.getItem('archweb_registered_users');
    const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    
    // Check if already registered to avoid duplicates
    const index = savedUsers.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    const newUser = {
      email,
      password,
      avatar: selectedAvatar,
      category: selectedCategory,
      loginMethod,
      role: (email.toLowerCase() === 'meminalp2434@gmail.com' && password === '2434ytact') ? 'admin' : 'user' as 'admin' | 'user',
    };
    if (index > -1) {
      savedUsers[index] = newUser;
    } else {
      savedUsers.push(newUser);
    }
    localStorage.setItem('archweb_registered_users', JSON.stringify(savedUsers));

    onComplete(email, selectedCategory, selectedAvatar, loginMethod, password, newUser.role);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070714] text-white flex items-center justify-center p-4 relative overflow-y-auto select-none font-sans">
      {/* Background Ambient Bubbles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 ? (
          /* STEP 0: ACCOUNT SELECTOR */
          <motion.div 
            key="step0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative space-y-5"
          >
            {onBack && (
              <button 
                onClick={onBack}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer z-10"
                title="Geri Dön"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">Hesabını Seç</h1>
              <p className="text-xs text-white/60">Giriş yapmak için kayıtlı bir hesap seç:</p>
            </div>
            <div className="space-y-3">
              {savedUsers.map((user: any) => (
                <button
                  key={user.email}
                  onClick={() => handleAccountSelect(user)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-black/60 transition-all active:scale-[0.98]"
                >
                  <span className="text-3xl">{user.avatar}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{user.email.split('@')[0]}</div>
                    <div className="text-[10px] text-white/50">{user.email}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setStep(1);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-extrabold text-xs hover:opacity-95 transition-all shadow-lg active:scale-95"
              >
                Yeni Hesap Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full text-center text-[10px] text-white/40 hover:text-red-400 mt-2 underline transition-colors cursor-pointer"
              >
                Hesap Kayıtlarını ve Tüm Verileri Sıfırla
              </button>
            </div>
          </motion.div>
        ) : step === 1 ? (
          /* STEP 1: LOGIN DETAILS */
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative space-y-5"
          >
            {savedUsers.length > 0 ? (
              <button 
                onClick={() => setStep(0)}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer z-10"
                title="Hesap Seçimine Geri Dön"
              >
                <ArrowLeft size={16} />
              </button>
            ) : onBack ? (
              <button 
                onClick={onBack}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer z-10"
                title="Geri Dön"
              >
                <ArrowLeft size={16} />
              </button>
            ) : null}

            {/* Playful Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider shadow-lg flex items-center gap-1">
              <Sparkles size={12} className="animate-spin" />
              <span>GİRİŞ PANELİ</span>
            </div>

            {/* Header Greeting */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span>{isRegistering ? 'Hesap Oluşturun!' : 'Hoş Geldiniz!'}</span>
                <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-xs text-white/60">
                {isRegistering 
                  ? 'Sisteme güvenli erişim için e-posta ve şifre ile bir hesap oluşturun.' 
                  : 'Sisteme giriş yapmak için kayıtlı e-posta ve şifrenizi girin.'}
              </p>
            </div>

            {/* Register / Login Switcher */}
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-center text-[10px] font-extrabold rounded-lg transition-all uppercase tracking-wider ${isRegistering ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Kayıt Ol (Yeni Hesap)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError('');
                }}
                className={`flex-1 py-1.5 text-center text-[10px] font-extrabold rounded-lg transition-all uppercase tracking-wider ${!isRegistering ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg' : 'text-white/60 hover:text-white'}`}
              >
                Giriş Yap
              </button>
            </div>

            {/* Avatar Selection - only show on registration */}
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono tracking-wider text-yellow-300 font-bold block text-center">Bir Profil Karakteri Seç</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map(item => (
                    <button 
                      key={item.emoji}
                      onClick={() => setSelectedAvatar(item.emoji)}
                      type="button"
                      className={`aspect-square rounded-2xl text-2xl flex items-center justify-center bg-white/5 border transition-all hover:bg-white/10 hover:scale-105 active:scale-95 ${selectedAvatar === item.emoji ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/30' : 'border-white/10'}`}
                      title={item.label}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Login/Register Form Card */}
            <div className="space-y-3.5 bg-black/40 border border-white/5 p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Mail size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold font-mono tracking-wider text-white/70">
                  {isRegistering ? 'E-POSTA İLE KAYIT OL (KAYDET)' : 'E-POSTA İLE GİRİŞ YAP'}
                </span>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 block">E-Posta Adresi</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3.5 text-white/30" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="ornek@eposta.com"
                    className="w-full bg-black/50 border border-white/10 focus:border-yellow-400 outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition-all font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-white/50">E-Posta Şifresi</label>
                </div>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3.5 text-white/30" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 focus:border-yellow-400 outline-none rounded-xl pl-10 pr-10 py-2.5 text-xs text-white transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-center gap-2 text-xs text-red-400"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next Button */}
            <button 
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-95 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/10 active:scale-95 cursor-pointer"
            >
              <span>{isRegistering ? 'Kaydol & Devam Et' : 'Giriş Yap'}</span>
              <ChevronRight size={16} />
            </button>
            
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full text-center text-[10px] text-white/40 hover:text-red-400 mt-2 underline transition-colors"
            >
              Şifremi Unuttum / Tüm Verileri Sıfırla
            </button>

            {/* Social Logins Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-white/10 flex-1" />
                <span className="text-[9px] font-mono font-bold text-white/30 tracking-wider">VEYA BUNLARLA GİRİŞ YAP</span>
                <div className="h-[1px] bg-white/10 flex-1" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Google SSO Button */}
                <button
                  type="button"
                  onClick={() => handleSsoClick('google')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black hover:bg-gray-100 transition-all font-bold text-[10px] active:scale-95 border border-white"
                  title="Google ile Giriş Yap"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                {/* Microsoft SSO Button */}
                <button
                  type="button"
                  onClick={() => handleSsoClick('microsoft')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2f2f2f] hover:bg-[#3d3d3d] text-white transition-all font-bold text-[10px] active:scale-95 border border-white/5"
                  title="Microsoft ile Giriş Yap"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 23 23">
                    <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
                    <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
                    <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
                    <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                  </svg>
                  <span>Microsoft</span>
                </button>

                {/* Apple SSO Button */}
                <button
                  type="button"
                  onClick={() => handleSsoClick('apple')}
                  className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-black hover:bg-zinc-900 text-white transition-all font-bold text-[10px] active:scale-95 border border-white/10"
                  title="Apple ile Giriş Yap"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.12-3.57-2.83-7.44-7.48-11.62-13.96-6.12-9.61-10.91-20.15-14.34-31.62-3.44-11.48-5.16-22.18-5.16-32.1 0-14.03 3.39-25.33 10.16-33.9 6.78-8.57 15.15-12.92 25.1-13.05 4.34 0 9.17 1.25 14.47 3.75 5.3 2.5 8.91 3.75 10.82 3.75 1.7 0 5.43-1.32 11.19-3.96 5.76-2.64 10.25-3.85 13.48-3.63 9.77.44 17.51 3.93 23.23 10.45 5.73 6.53 9.07 14.51 10.02 23.95-10.14 4.89-16.89 11.75-20.25 20.57-3.36 8.82-3.32 18.06.12 27.71 3.23 8.92 8.71 15.86 16.42 20.81-.85 2.5-1.91 5.11-3.17 7.84zM119.22 32.4c0-7.72 2.76-14.88 8.27-21.49 1.32-1.6 2.77-3.1 4.34-4.5 1.57-1.4 3.09-2.4 4.54-3 1.45-.6 2.6-.9 3.44-.9 1.02 0 1.94.31 2.77.92.83.61 1.4 1.45 1.72 2.53-.76 4.34-2.58 8.78-5.46 13.32-2.88 4.54-6.4 8.4-10.55 11.58-4.15 3.18-8.15 5.16-12 5.94-.85.17-1.57.25-2.15.25-.68 0-1.28-.21-1.8-.64-.52-.43-.88-1.04-1.08-1.83-.17-.76-.25-1.48-.25-2.15z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* STEP 2: CATEGORY CHOICE */
          <motion.div 
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative space-y-6"
          >
            {/* Back button */}
            <button 
              onClick={() => setStep(1)}
              className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={14} />
              <span>Geri Dön</span>
            </button>

            {/* Header Greeting */}
            <div className="text-center space-y-1 pt-4">
              <span className="text-2xl">{selectedAvatar}</span>
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-1.5">
                <span>Hesabını Ne İçin Kullanacaksın?</span>
              </h2>
              <p className="text-xs text-white/60">Seçtiğin kategoriye göre çocuk dünyan ve uygulamaların sihirli bir şekilde değişecek!</p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-95 flex gap-3.5 relative overflow-hidden ${isSelected ? `border-white bg-white/5 shadow-xl` : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                  >
                    {/* Glowing Accent strip */}
                    {isSelected && (
                      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${cat.color}`} />
                    )}

                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shrink-0 shadow-lg text-black`}>
                      <Icon size={18} />
                    </div>

                    <div className="space-y-1">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <span className={isSelected ? 'text-white' : 'text-white/80'}>{cat.title}</span>
                        {isSelected && <Check size={12} className="text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Launch Button */}
            <button 
              onClick={handleFinish}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
            >
              <Star size={16} className="animate-spin" />
              <span>Sihirli Dünyayı Başlat! 🚀</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <Trash2 size={32} className="text-red-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-white">Sistemi Sıfırla?</h2>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Şifrenizi unuttuysanız sistemi tamamen sıfırlayabilirsiniz. <br />
                    <span className="text-red-400 font-bold">TÜM KAYITLI HESAPLAR VE VERİLER SİLİNECEKTİR.</span>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all"
                >
                  Vazgeç
                </button>
                <button 
                  onClick={handleSystemReset}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Sıfırla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SSO POPUP MODAL SIMULATOR */}
      <AnimatePresence>
        {ssoPopup && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border p-6 flex flex-col space-y-4 ${
                ssoPopup.provider === 'google' ? 'bg-white text-gray-800 border-gray-200' :
                ssoPopup.provider === 'microsoft' ? 'bg-[#1f1f1f] text-white border-white/10' :
                'bg-black text-white border-zinc-800'
              }`}
            >
              {/* Provider Logo Header */}
              <div className="flex flex-col items-center text-center space-y-2">
                {ssoPopup.provider === 'google' && (
                  <>
                    <svg className="w-10 h-10" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <h3 className="text-sm font-bold text-gray-900 font-sans">Google Hesabı ile Oturum Açın</h3>
                    <p className="text-[10px] text-gray-500">ArchWeb OS bağlantısı için devam edin</p>
                  </>
                )}

                {ssoPopup.provider === 'microsoft' && (
                  <>
                    <svg className="w-10 h-10" viewBox="0 0 23 23">
                      <rect x="0" y="0" width="10" height="10" fill="#F25022"/>
                      <rect x="11" y="0" width="10" height="10" fill="#7FBA00"/>
                      <rect x="0" y="11" width="10" height="10" fill="#00A4EF"/>
                      <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
                    </svg>
                    <h3 className="text-sm font-bold text-white font-sans">Microsoft Hesabı</h3>
                    <p className="text-[10px] text-white/50">ArchWeb OS uygulamasına erişin</p>
                  </>
                )}

                {ssoPopup.provider === 'apple' && (
                  <>
                    <svg className="w-10 h-10 fill-current text-white" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.12-3.57-2.83-7.44-7.48-11.62-13.96-6.12-9.61-10.91-20.15-14.34-31.62-3.44-11.48-5.16-22.18-5.16-32.1 0-14.03 3.39-25.33 10.16-33.9 6.78-8.57 15.15-12.92 25.1-13.05 4.34 0 9.17 1.25 14.47 3.75 5.3 2.5 8.91 3.75 10.82 3.75 1.7 0 5.43-1.32 11.19-3.96 5.76-2.64 10.25-3.85 13.48-3.63 9.77.44 17.51 3.93 23.23 10.45 5.73 6.53 9.07 14.51 10.02 23.95-10.14 4.89-16.89 11.75-20.25 20.57-3.36 8.82-3.32 18.06.12 27.71 3.23 8.92 8.71 15.86 16.42 20.81-.85 2.5-1.91 5.11-3.17 7.84zM119.22 32.4c0-7.72 2.76-14.88 8.27-21.49 1.32-1.6 2.77-3.1 4.34-4.5 1.57-1.4 3.09-2.4 4.54-3 1.45-.6 2.6-.9 3.44-.9 1.02 0 1.94.31 2.77.92.83.61 1.4 1.45 1.72 2.53-.76 4.34-2.58 8.78-5.46 13.32-2.88 4.54-6.4 8.4-10.55 11.58-4.15 3.18-8.15 5.16-12 5.94-.85.17-1.57.25-2.15.25-.68 0-1.28-.21-1.8-.64-.52-.43-.88-1.04-1.08-1.83-.17-.76-.25-1.48-.25-2.15z"/>
                    </svg>
                    <h3 className="text-sm font-bold text-white font-sans">Apple ID ile Giriş</h3>
                    <p className="text-[10px] text-zinc-500">Apple ID\'niz ile güvenle giriş yapın</p>
                  </>
                )}
              </div>

              {ssoPopup.isSuccess ? (
                /* Success Animation */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-6 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl shadow-lg">
                    ✓
                  </div>
                  <span className={`text-xs font-bold ${ssoPopup.provider === 'google' ? 'text-gray-900' : 'text-white'}`}>Giriş Başarılı!</span>
                  <span className="text-[10px] text-gray-400">Yönlendiriliyorsunuz...</span>
                </motion.div>
              ) : ssoPopup.isLoading ? (
                /* Loading Animation */
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span className={`text-xs ${ssoPopup.provider === 'google' ? 'text-gray-600' : 'text-white/70'}`}>Kimlik doğrulanıyor...</span>
                </div>
              ) : (
                /* SSO Form */
                <form onSubmit={handleSsoSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold ${ssoPopup.provider === 'google' ? 'text-gray-500' : 'text-white/45'}`}>E-Posta veya Telefon</label>
                    <input
                      type="text"
                      value={ssoPopup.inputEmail}
                      onChange={(e) => setSsoPopup(p => p ? { ...p, inputEmail: e.target.value, error: '' } : null)}
                      className={`w-full rounded-lg px-3 py-2 text-xs outline-none border font-sans ${
                        ssoPopup.provider === 'google' ? 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500' :
                        ssoPopup.provider === 'microsoft' ? 'bg-[#2d2d2d] text-white border-white/15 focus:border-blue-400' :
                        'bg-zinc-900 text-white border-zinc-800 focus:border-zinc-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold ${ssoPopup.provider === 'google' ? 'text-gray-500' : 'text-white/45'}`}>Şifre</label>
                    <div className="relative flex items-center">
                      <input
                        type={ssoPopup.showPass ? 'text' : 'password'}
                        value={ssoPopup.inputPassword}
                        onChange={(e) => setSsoPopup(p => p ? { ...p, inputPassword: e.target.value, error: '' } : null)}
                        className={`w-full rounded-lg pl-3 pr-9 py-2 text-xs outline-none border font-sans ${
                          ssoPopup.provider === 'google' ? 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500' :
                          ssoPopup.provider === 'microsoft' ? 'bg-[#2d2d2d] text-white border-white/15 focus:border-blue-400' :
                          'bg-zinc-900 text-white border-zinc-800 focus:border-zinc-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setSsoPopup(p => p ? { ...p, showPass: !p.showPass } : null)}
                        className={`absolute right-2.5 ${ssoPopup.provider === 'google' ? 'text-gray-400 hover:text-gray-600' : 'text-white/30 hover:text-white'}`}
                      >
                        {ssoPopup.showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {ssoPopup.error && (
                    <div className="text-[10px] text-red-500 flex items-center gap-1 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                      <AlertCircle size={12} />
                      <span>{ssoPopup.error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSsoPopup(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-colors ${
                        ssoPopup.provider === 'google' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600' :
                        'bg-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold font-sans transition-all text-white ${
                        ssoPopup.provider === 'google' ? 'bg-[#1a73e8] hover:bg-[#1557b0] shadow-md shadow-blue-500/10' :
                        ssoPopup.provider === 'microsoft' ? 'bg-[#0067b8] hover:bg-[#005da6] shadow-md shadow-blue-600/10' :
                        'bg-zinc-100 hover:bg-zinc-200 text-black shadow-md'
                      }`}
                    >
                      Giriş Yap
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResetting && (
          <div className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full"
            />
            <div className="text-center space-y-2">
              <h2 className="text-white text-lg font-bold uppercase tracking-widest">Sistem Sıfırlanıyor</h2>
              <p className="text-white/40 text-xs font-mono">Tüm veriler temizleniyor ve yeniden başlatılıyor...</p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
