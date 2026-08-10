import React, { useState, useEffect } from 'react';
import { ShieldCheck, Camera, Mic, Bell, Download, Upload, Check, AlertCircle, MapPin } from 'lucide-react';

interface SystemPermissionsModalProps {
  onClose: () => void;
}

export const SystemPermissionsModal: React.FC<SystemPermissionsModalProps> = ({ onClose }) => {
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
    notifications: false,
    location: false,
    storage: true
  });
  const [grantedToast, setGrantedToast] = useState<string | null>(null);

  useEffect(() => {
    // Check Notification permission
    const localNotif = localStorage.getItem('archweb_notifications_enabled') === 'true';
    const isGranted = typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
    if (localNotif || isGranted) {
      setPermissions(prev => ({ ...prev, notifications: true }));
    }
    
    // Note: We can't synchronously check location permissions in all browsers without the API prompting or using the Permissions API, which we'll handle upon request.
  }, []);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setPermissions(prev => ({ ...prev, camera: true }));
      setGrantedToast("Kamera izni başarıyla verildi.");
      setTimeout(() => setGrantedToast(null), 3000);
    } catch {
      alert("Kamera izni reddedildi.");
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setPermissions(prev => ({ ...prev, microphone: true }));
      setGrantedToast("Mikrofon izni başarıyla verildi.");
      setTimeout(() => setGrantedToast(null), 3000);
    } catch {
      alert("Mikrofon izni reddedildi.");
    }
  };

  const requestNotifications = async () => {
    setPermissions(prev => ({ ...prev, notifications: true }));
    localStorage.setItem('archweb_notifications_enabled', 'true');
    setGrantedToast("Bildirim izni ve sistem bildirimleri etkinleştirildi.");
    setTimeout(() => setGrantedToast(null), 3000);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        if (res === 'granted') {
          new Notification("ArchWeb OS", { body: "Bildirimler başarıyla etkinleştirildi!" });
        }
      } catch (e) {
        console.warn("Native Notification API request failed or blocked in iframe:", e);
      }
    }
  };

  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissions(prev => ({ ...prev, location: true }));
          setGrantedToast("Konum izni başarıyla verildi.");
          setTimeout(() => setGrantedToast(null), 3000);
        },
        (error) => {
          alert("Konum izni reddedildi veya alınamadı.");
        }
      );
    } else {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="font-bold text-base">ArchWeb Sistem İzinleri</div>
              <div className="text-xs text-white/50">Kamera, mikrofon, bildirim ve dosya yönetim izinleri</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✕</button>
        </div>

        {grantedToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-5 py-2 text-xs flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            <span>{grantedToast}</span>
          </div>
        )}

        <div className="p-5 flex flex-col gap-4">
          <p className="text-xs text-white/70 leading-relaxed">
            ArchWeb OS’in tam fonksiyonel çalışabilmesi için aşağıdaki sistem izinlerini yönetebilirsiniz. İzinler güvenli tarayıcı API'leri üzerinden korunur.
          </p>

          <div className="flex flex-col gap-3">
            {/* Camera */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Camera size={20} className="text-sky-400" />
                <div>
                  <div className="text-xs font-bold">Kamera İzni</div>
                  <div className="text-[10px] text-white/40">Fotoğraf çekme ve video kayıt uygulamaları için</div>
                </div>
              </div>
              {permissions.camera ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Check size={12} /> Verildi
                </span>
              ) : (
                <button 
                  onClick={requestCamera}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs rounded-lg transition-all"
                >
                  İzin Ver
                </button>
              )}
            </div>

            {/* Microphone */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Mic size={20} className="text-emerald-400" />
                <div>
                  <div className="text-xs font-bold">Mikrofon İzni</div>
                  <div className="text-[10px] text-white/40">Ses kaydedici ve sesli komutlar için</div>
                </div>
              </div>
              {permissions.microphone ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Check size={12} /> Verildi
                </span>
              ) : (
                <button 
                  onClick={requestMic}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-lg transition-all"
                >
                  İzin Ver
                </button>
              )}
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-amber-400" />
                <div>
                  <div className="text-xs font-bold">Bildirim İzni</div>
                  <div className="text-[10px] text-white/40">Sistem uyarıları ve hatırlatıcılar için</div>
                </div>
              </div>
              {permissions.notifications ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Check size={12} /> Verildi
                </span>
              ) : (
                <button 
                  onClick={requestNotifications}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-all"
                >
                  İzin Ver
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-red-400" />
                <div>
                  <div className="text-xs font-bold">Konum İzni</div>
                  <div className="text-[10px] text-white/40">Harita ve konum tabanlı servisler için</div>
                </div>
              </div>
              {permissions.location ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Check size={12} /> Verildi
                </span>
              ) : (
                <button 
                  onClick={requestLocation}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition-all"
                >
                  İzin Ver
                </button>
              )}
            </div>

            {/* Storage / File Upload & Download */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Upload size={20} className="text-purple-400" />
                <div>
                  <div className="text-xs font-bold">Dosya Yükleme ve İndirme</div>
                  <div className="text-[10px] text-white/40">Cihazınızla ArchWeb arasında dosya aktarımı</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1">
                <Check size={12} /> Aktif (Destekleniyor)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end px-5 py-3 bg-white/5 border-t border-white/10">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs rounded-xl transition-all"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
