import React, { useState, useEffect } from 'react';
import { X, Globe, Monitor, Play, CheckCircle2, AlertCircle, ChevronRight, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IsoInstallerProps {
  onClose: () => void;
}

type InstallationStep = 'language' | 'choice' | 'beta-notice' | 'installing' | 'finished';

export const IsoInstaller: React.FC<IsoInstallerProps> = ({ onClose }) => {
  const [step, setStep] = useState<InstallationStep>('language');
  const [selectedLang, setSelectedLang] = useState('tr');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 'installing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('finished'), 1000);
            return 100;
          }
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  const languages = [
    { id: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div id="iso_installer_root" className="flex flex-col h-full w-full bg-[#f0f3f4] text-[#202124] font-sans overflow-hidden select-none">
      {/* Chromebook-style Header */}
      <div className="h-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <Laptop size={12} className="text-white" />
          </div>
          <span className="text-[11px] font-medium text-gray-600">ArchWeb OS Chromebook Installer</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'language' && (
            <motion.div 
              key="step-lang"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8 text-center"
            >
              <div className="space-y-3">
                <Globe size={48} className="mx-auto text-blue-600" />
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Hoş Geldiniz</h1>
                <p className="text-sm text-gray-500">Lütfen kurulum için bir dil seçin.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedLang === lang.id 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-transparent bg-white shadow-sm hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStep('choice')}
                className="mt-8 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 mx-auto group"
              >
                Başlayalım <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'choice' && (
            <motion.div 
              key="step-choice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Ne yapmak istersiniz?</h2>
                <p className="text-sm text-gray-500">ArchWeb OS'i deneyebilir veya doğrudan kurabilirsiniz.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setStep('beta-notice')}
                  className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Play size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sistemi Dene</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Bilgisayarınızda hiçbir değişiklik yapmadan ArchWeb OS'i canlı (Live) olarak test edin.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setStep('beta-notice')}
                  className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left space-y-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sistemi Kur</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">ArchWeb OS'i cihazınıza kalıcı olarak kurun ve tüm özelliklerden yararlanın.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'beta-notice' && (
            <motion.div 
              key="step-beta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl space-y-6 text-center border border-amber-200"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-gray-900">Beta Test Aşaması</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Şu anda ArchWeb OS v20.1.2 <strong>Beta</strong> aşamasındadır. Kurulum sırasında bazı özellikler kısıtlı olabilir. Lütfen önemli verilerinizi yedeklediğinizden emin olun.
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setStep('choice')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Geri Dön
                </button>
                <button 
                  onClick={() => setStep('installing')}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Anladım, Devam Et
                </button>
              </div>
            </motion.div>
          )}

          {step === 'installing' && (
            <motion.div 
              key="step-installing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-12 text-center"
            >
              <div className="space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="60"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="8"
                      strokeDasharray="376.99"
                      strokeDashoffset={376.99 - (376.99 * progress) / 100}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-blue-600">
                    %{progress}
                  </div>
                </div>
                <h3 className="text-lg font-medium">Sistem Hazırlanıyor...</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Lütfen kurulum tamamlanana kadar cihazınızı kapatmayın. Dosyalar kopyalanıyor ve sistem konfigüre ediliyor.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-left">
                <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-normal">
                  <strong>İpucu:</strong> Chromebook kullanıcıları için ArchWeb OS, Linux (Beta) desteği ile tam uyumlu çalışır.
                </p>
              </div>
            </motion.div>
          )}

          {step === 'finished' && (
            <motion.div 
              key="step-finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Kurulum Tamamlandı!</h2>
                <p className="text-sm text-gray-500">ArchWeb OS başarıyla kuruldu. Şimdi sistemi kullanmaya başlayabilirsiniz.</p>
              </div>
              <button 
                onClick={onClose}
                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full shadow-lg shadow-emerald-600/20 transition-all"
              >
                ArchWeb OS'i Başlat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="h-10 bg-white border-t border-gray-100 flex items-center justify-center shrink-0">
        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">ArchWeb OS v20.1.2 Development Preview</span>
      </div>
    </div>
  );
};
