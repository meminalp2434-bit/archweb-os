import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'motion/react';
import { Wifi, Bluetooth, MapPin, Cast, Smartphone, Settings, Bell, Mail, MessageSquare, X, Volume2, SunMedium, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: 'gmail' | 'chat' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface QuickSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  volume: number;
  setVolume: (val: number) => void;
  deviceMode: 'desktop' | 'mobile' | 'tablet' | 'tv';
  onChangeDeviceMode: (mode: 'desktop' | 'mobile' | 'tablet' | 'tv') => void;
}

export const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
  isOpen,
  onClose,
  onOpen,
  volume,
  setVolume,
  deviceMode,
  onChangeDeviceMode
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'gmail',
      title: 'Google Güvenlik',
      message: 'Hesabınıza yeni bir cihazdan giriş yapıldı.',
      time: '10:45',
      isRead: false
    },
    {
      id: '2',
      type: 'chat',
      title: 'Canlı Sohbet',
      message: 'Melih size bir mesaj gönderdi.',
      time: '11:20',
      isRead: false
    }
  ]);

  const [toggles, setToggles] = useState({
    wifi: true,
    bluetooth: false,
    location: true,
    airplane: false,
    donotdisturb: false,
    flashlight: false
  });

  const [brightness, setBrightness] = useState(80);

  const dragControls = useDragControls();

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      onClose();
    } else if (info.offset.y > 50 && !isOpen) {
      onOpen();
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const ToggleButton = ({ icon: Icon, label, isActive, onClick, colorClass = "bg-blue-500" }: any) => (
    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={onClick}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isActive ? colorClass + ' text-white' : 'bg-white/10 text-white/50'}`}>
        <Icon size={20} />
      </div>
      <span className="text-[10px] text-white/70 font-medium font-sans">{label}</span>
    </div>
  );

  return (
    <>
      {/* Invisible drag trigger area at the top edge */}
      {!isOpen && (
        <motion.div 
          className="absolute top-0 left-0 right-0 h-4 z-[999] cursor-grab active:cursor-grabbing"
          drag="y"
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        />
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-[999] backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#1e1e1e]/95 backdrop-blur-3xl border-b border-x border-white/10 rounded-b-3xl shadow-2xl z-[1000] overflow-hidden"
          >
            {/* Handle */}
            <div className="w-full flex justify-center py-2 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            <div className="p-4 pt-0">
              {/* Quick Settings Grid */}
              <div className="grid grid-cols-4 gap-4 mb-6 mt-2">
                <ToggleButton 
                  icon={Wifi} 
                  label="Wi-Fi" 
                  isActive={toggles.wifi} 
                  onClick={() => setToggles(p => ({ ...p, wifi: !p.wifi }))} 
                />
                <ToggleButton 
                  icon={Bluetooth} 
                  label="Bluetooth" 
                  isActive={toggles.bluetooth} 
                  onClick={() => setToggles(p => ({ ...p, bluetooth: !p.bluetooth }))} 
                />
                <ToggleButton 
                  icon={MapPin} 
                  label="Konum" 
                  isActive={toggles.location} 
                  onClick={() => setToggles(p => ({ ...p, location: !p.location }))} 
                  colorClass="bg-green-500"
                />
                <ToggleButton 
                  icon={Smartphone} 
                  label="Mobil Veri" 
                  isActive={deviceMode === 'mobile'} 
                  onClick={() => onChangeDeviceMode(deviceMode === 'mobile' ? 'desktop' : 'mobile')} 
                />
              </div>

              {/* Sliders */}
              <div className="space-y-4 mb-6 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <SunMedium size={18} className="text-white/50 shrink-0" />
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Volume2 size={18} className="text-white/50 shrink-0" />
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Notifications Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-white/70" />
                  <span className="text-sm font-semibold text-white/90 font-sans">Bildirimler</span>
                </div>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Temizle
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-white/40 text-sm font-sans">
                    Bildiriminiz yok
                  </div>
                ) : (
                  notifications.map(notif => (
                    <motion.div 
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-black/30 border border-white/10 rounded-xl p-3 flex gap-3 group relative overflow-hidden"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        notif.type === 'gmail' ? 'bg-red-500/20 text-red-400' : 
                        notif.type === 'chat' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {notif.type === 'gmail' ? <Mail size={14} /> : 
                         notif.type === 'chat' ? <MessageSquare size={14} /> : <Bell size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white/90 font-sans truncate">{notif.title}</span>
                          <span className="text-[10px] text-white/40">{notif.time}</span>
                        </div>
                        <p className="text-xs text-white/60 font-sans leading-tight line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      <button 
                        onClick={() => removeNotification(notif.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            <div className="bg-black/40 border-t border-white/10 p-3 flex justify-between items-center px-6">
              <span className="text-xs font-bold text-white/50">ArchWeb OS</span>
              <button className="text-white/50 hover:text-white">
                <Settings size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
