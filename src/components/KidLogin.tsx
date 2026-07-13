import React, { useState } from 'react';
import { Mail, Check, AlertCircle, ChevronRight, ArrowLeft, Star, Sparkles, Brain, Gamepad2, Paintbrush, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KidLoginProps {
  onComplete: (gmail: string, category: 'education' | 'gaming' | 'creativity' | 'science', avatar: string) => void;
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

export const KidLogin: React.FC<KidLoginProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [gmail, setGmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].emoji);
  const [selectedCategory, setSelectedCategory] = useState<'education' | 'gaming' | 'creativity' | 'science'>('education');
  const [error, setError] = useState('');

  const handleNextStep = () => {
    if (!gmail.trim()) {
      setError('Lütfen Gmail adresini yaz tatlı kâşif! 😊');
      return;
    }

    // Append @gmail.com if they haven't typed an domain
    let fullEmail = gmail.trim();
    if (!fullEmail.includes('@')) {
      fullEmail += '@gmail.com';
      setGmail(fullEmail);
    }

    // Gmail validation format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fullEmail)) {
      setError('Hımm, bu geçerli bir e-posta adresine benzemiyor. Kontrol eder misin?');
      return;
    }

    if (!fullEmail.endsWith('@gmail.com')) {
      setError('Lütfen bir Google (Gmail) hesabı kullan tatlı kâşif! (örn: kaşif@gmail.com)');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleFinish = () => {
    onComplete(gmail, selectedCategory, selectedAvatar);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070714] text-white flex items-center justify-center p-4 relative overflow-y-auto select-none font-sans">
      {/* Background Ambient Bubbles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-yellow-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* STEP 1: GMAIL & AVATAR PICKER */
          <motion.div 
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative space-y-6"
          >
            {/* Playful Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider shadow-lg flex items-center gap-1">
              <Sparkles size={12} className="animate-spin" />
              <span>ÇOCUK MODU</span>
            </div>

            {/* Header Greeting */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <span>Merhaba Minik Kahraman!</span>
                <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-xs text-white/60">İşletim sistemine girmek için profilini oluştur ve Gmail adresini yaz!</p>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-mono tracking-wider text-yellow-300 font-bold block text-center">Bir Karakter Seç</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map(item => (
                  <button 
                    key={item.emoji}
                    onClick={() => setSelectedAvatar(item.emoji)}
                    className={`aspect-square rounded-2xl text-2xl flex items-center justify-center bg-white/5 border transition-all hover:bg-white/10 hover:scale-105 active:scale-95 ${selectedAvatar === item.emoji ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/30' : 'border-white/10'}`}
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Gmail Input Card */}
            <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                  {/* Mock Google Logo 'G' */}
                  <span className="text-[10px] font-black text-blue-600">G</span>
                </div>
                <span className="text-[10px] font-bold font-mono tracking-wider text-white/50">GOOGLE HESABI İLE GİRİŞ</span>
              </div>

              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={gmail}
                  onChange={(e) => {
                    setGmail(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  placeholder="E-posta veya kullanıcı adı"
                  className="w-full bg-black/40 border border-white/10 focus:border-yellow-400 outline-none rounded-xl px-4 py-3 text-sm text-white pr-28 transition-all font-sans"
                  autoFocus
                />
                
                {/* Auto complete helper button */}
                {!gmail.includes('@') && (
                  <button 
                    onClick={() => setGmail(prev => prev + '@gmail.com')}
                    className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/30 text-yellow-300 text-[10px] font-bold hover:bg-yellow-400 hover:text-black transition-all"
                  >
                    + @gmail.com
                  </button>
                )}
              </div>

              <p className="text-[10px] text-white/40 leading-relaxed">
                * Eğer bir Gmail hesabın yoksa, dilediğin ismi yazıp sağdaki butona tıklayarak hızlıca oluşturabilirsin!
              </p>
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-95 text-black font-extrabold text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-500/10 active:scale-95 cursor-pointer"
            >
              <span>Devam Et</span>
              <ChevronRight size={16} />
            </button>
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
    </div>
  );
};
