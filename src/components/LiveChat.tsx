import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, X, Terminal, Trash2, RefreshCw, Shield, Lock, Unlock, Crown, Plus, Hash, Wifi, Globe, Search, Cpu, Server, Activity, CheckCircle2, Mail, Radio, Laptop, Smartphone } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { playClickSound, playNotificationSound } from '../utils/audio';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  avatar: string;
  time: string;
  role?: 'admin' | 'user';
  group?: string;
}

interface ChatGroup {
  id: string;
  name: string;
  icon: string;
}

interface OnlineUser {
  username: string;
  avatar: string;
  role: string;
  lastSeen: number;
}

interface LiveChatProps {
  onClose: () => void;
  currentUser?: string;
  avatar?: string;
  userRole?: 'admin' | 'user';
}

export const LiveChat: React.FC<LiveChatProps> = ({ 
  onClose, 
  currentUser = 'meminalp2434@gmail.com', 
  avatar = '👤',
  userRole = 'user'
}) => {
  // Ensure currentUser is a Gmail format
  const myGmail = currentUser.includes('@') ? currentUser : `${currentUser.toLowerCase().replace(/\s+/g, '')}@gmail.com`;

  const [chatMode, setChatMode] = useState<'group' | 'dm' | 'scan'>('group');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([
    { id: 'genel', name: 'Genel', icon: '💬' },
    { id: 'duyurular', name: 'Duyurular', icon: '📢' },
    { id: 'destek', name: 'Teknik Destek', icon: '🛠️' },
    { id: 'yonetim', name: 'Yönetici Grubu', icon: '👑' }
  ]);
  const [activeGroup, setActiveGroup] = useState<string>('genel');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  // DM State (Strictly Gmail based)
  const [activeDmGmail, setActiveDmGmail] = useState<string | null>('destek.archweb@gmail.com');
  const [targetGmailInput, setTargetGmailInput] = useState('');
  const [showAddDmModal, setShowAddDmModal] = useState(false);
  const [gmailSearchQuery, setGmailSearchQuery] = useState('');

  // Network Scanner State (3 Modes)
  const [scanMode, setScanMode] = useState<'subnet' | 'global' | 'deep'>('subnet');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanFilterQuery, setScanFilterQuery] = useState('');

  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatLocked, setIsChatLocked] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // New Group Modal State (Admin)
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [createGroupName, setCreateGroupName] = useState('');
  const [createGroupIcon, setCreateGroupIcon] = useState('💬');
  const [createGroupError, setCreateGroupError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      let url = '';
      if (chatMode === 'group') {
        url = `/api/chat?group=${activeGroup}&currentUser=${encodeURIComponent(myGmail)}&userAvatar=${encodeURIComponent(avatar)}&userRole=${userRole}`;
      } else if (chatMode === 'dm') {
        if (!activeDmGmail) {
          setIsLoading(false);
          return;
        }
        url = `/api/chat?dmWith=${encodeURIComponent(activeDmGmail)}&currentUser=${encodeURIComponent(myGmail)}&userAvatar=${encodeURIComponent(avatar)}&userRole=${userRole}`;
      } else {
        setIsLoading(false);
        return;
      }

      const response = await fetch(getApiUrl(url));
      if (!response.ok) throw new Error('Sunucuya bağlanılamadı');
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      } else if (data && typeof data === 'object') {
        setMessages(data.messages || []);
        setIsChatLocked(!!data.isLocked);
        if (Array.isArray(data.groups) && data.groups.length > 0) {
          setGroups(data.groups);
        }
        if (Array.isArray(data.onlineUsers)) {
          setOnlineUsers(data.onlineUsers);
        }
      }
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Chat fetch error:', err);
      setError('Bağlantı Hatası: Canlı sohbet sunucusu yanıt vermiyor.');
      setIsLoading(false);
    }
  };

  // Run Network Scanner API for selected mode
  const runNetworkScan = async (mode = scanMode, query = scanFilterQuery) => {
    setIsScanning(true);
    try {
      const response = await fetch(getApiUrl(`/api/chat/network-scan?mode=${mode}&q=${encodeURIComponent(query)}`));
      if (response.ok) {
        const data = await response.json();
        setScanResults(data);
      }
    } catch (err) {
      console.error("Network scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (chatMode !== 'scan') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    } else {
      runNetworkScan(scanMode, scanFilterQuery);
    }
  }, [chatMode, activeGroup, activeDmGmail, scanMode]);

  useEffect(() => {
    if (scrollRef.current && chatMode !== 'scan') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMode]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (chatMode === 'group' && isChatLocked && userRole !== 'admin') {
      setError('Sohbet şu an yöneticiler tarafından dondurulmuştur.');
      return;
    }
    if (chatMode === 'dm' && !activeDmGmail) {
      setError('Lütfen mesaj yazmak için geçerli bir Gmail adresi seçin.');
      return;
    }

    const tempMsg = newMessage;
    setNewMessage('');
    playClickSound(50, false);

    try {
      const isDm = chatMode === 'dm';
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: myGmail,
          message: tempMsg,
          avatar: avatar,
          role: userRole,
          group: isDm ? undefined : activeGroup,
          isDm: isDm,
          recipient: isDm ? activeDmGmail : undefined
        })
      });

      if (response.ok) {
        fetchMessages();
      } else {
        const resData = await response.json();
        throw new Error(resData.error || 'Mesaj gönderilemedi');
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'Mesaj gönderilemedi. Sunucu bağlantısını kontrol edin.');
    }
  };

  const handleStartDmWithGmail = (rawGmail: string) => {
    if (!rawGmail.trim()) return;
    let formatted = rawGmail.trim().toLowerCase();
    if (!formatted.includes('@')) {
      formatted += '@gmail.com';
    }
    setActiveDmGmail(formatted);
    setChatMode('dm');
    setShowAddDmModal(false);
    setTargetGmailInput('');
    playClickSound(60, true);
  };

  const handleAdminCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGroupName.trim()) return;
    setCreateGroupError('');

    try {
      const response = await fetch(getApiUrl('/api/chat/groups'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createGroupName.trim(),
          icon: createGroupIcon || '💬',
          role: userRole
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setGroups(resData.groups);
        setActiveGroup(resData.group.id);
        setShowCreateGroup(false);
        setCreateGroupName('');
        playClickSound(100, true);
      } else {
        setCreateGroupError(resData.error || 'Grup oluşturulamadı.');
      }
    } catch (err: any) {
      setCreateGroupError(err.message || 'Grup oluşturulurken hata oluştu.');
    }
  };

  const handleAdminDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (userRole !== 'admin') return;
    if (groupId === 'genel') {
      alert("Genel grubu silinemez.");
      return;
    }
    if (!window.confirm("Bu grubu silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(getApiUrl('/api/chat/groups'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, role: userRole })
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setGroups(resData.groups);
        if (activeGroup === groupId) {
          setActiveGroup('genel');
        }
      }
    } catch (err) {
      console.error('Delete group error:', err);
    }
  };

  const handleAdminClearAll = async () => {
    if (userRole !== 'admin') return;
    if (!window.confirm('Tüm sohbet geçmişini silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(getApiUrl('/api/chat?clearAll=true'), { method: 'DELETE' });
      if (response.ok) {
        setMessages([]);
        fetchMessages();
      }
    } catch (err) {
      console.error('Clear chat error:', err);
    }
  };

  const handleAdminDeleteMessage = async (msgId: number) => {
    if (userRole !== 'admin') return;
    setDeletingId(msgId);
    try {
      const response = await fetch(getApiUrl(`/api/chat?id=${msgId}`), { method: 'DELETE' });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      }
    } catch (err) {
      console.error('Delete message error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleChatLock = async () => {
    if (userRole !== 'admin') return;
    const nextLock = !isChatLocked;
    try {
      const response = await fetch(getApiUrl('/api/chat/lock'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: nextLock })
      });
      if (response.ok) {
        setIsChatLocked(nextLock);
      }
    } catch (err) {
      console.error('Lock chat error:', err);
    }
  };

  const currentGroupObj = groups.find(g => g.id === activeGroup) || groups[0];
  const otherOnlineUsers = onlineUsers.filter(u => u.username !== myGmail);

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl relative font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#151926] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <MessageCircle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-wide">ArchWeb Ağ ve Sohbet Merkezi</h2>
              {userRole === 'admin' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  <Crown size={10} /> YÖNETİCİ
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isChatLocked ? 'bg-rose-500' : 'bg-emerald-400'} animate-pulse`}></span>
              <span className="text-[10px] text-emerald-300/80 font-mono font-medium">
                Siz: {myGmail}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {userRole === 'admin' && chatMode === 'group' && (
            <>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-md transition-all flex items-center gap-1 text-[10px] font-bold"
                title="Yeni Grup Oluştur"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Grup Ekle</span>
              </button>

              <button
                onClick={handleToggleChatLock}
                className={`p-1.5 rounded-md transition-all flex items-center gap-1 text-[10px] font-bold ${
                  isChatLocked 
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30' 
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                }`}
                title={isChatLocked ? 'Sohbet Kilidini Aç' : 'Sohbeti Kilitle'}
              >
                {isChatLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span className="hidden sm:inline">{isChatLocked ? 'Kilitli' : 'Açık'}</span>
              </button>

              <button
                onClick={handleAdminClearAll}
                className="p-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors"
                title="Sohbeti Temizle"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          <button 
            onClick={() => {
              if (chatMode === 'scan') runNetworkScan();
              else fetchMessages();
            }}
            className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded-md transition-colors"
            title="Yenile"
          >
            <RefreshCw size={14} className={isLoading || isScanning ? 'animate-spin' : ''} />
          </button>
          
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-md transition-colors"
            title="Kapat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Navigation Mode Switcher: Gruplar | Gmail DM | 3 Mod Ağ Taraması */}
      <div className="grid grid-cols-3 bg-[#0a0c13] border-b border-white/5 p-1 gap-1 shrink-0">
        <button
          onClick={() => {
            setChatMode('group');
            playClickSound(40, false);
          }}
          className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
            chatMode === 'group'
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Hash size={13} />
          <span className="truncate">GRUP SOHBETLERİ</span>
        </button>

        <button
          onClick={() => {
            setChatMode('dm');
            playClickSound(40, false);
          }}
          className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border relative ${
            chatMode === 'dm'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail size={13} />
          <span className="truncate">GMAIL İLE DM</span>
        </button>

        <button
          onClick={() => {
            setChatMode('scan');
            playClickSound(40, false);
          }}
          className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
            chatMode === 'scan'
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe size={13} />
          <span className="truncate">AĞ TARAMASI (3 MOD)</span>
        </button>
      </div>

      {/* Mode Sub-navigation */}
      {chatMode === 'group' && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121522] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[9px] uppercase font-bold text-sky-400/80 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            KANALLAR:
          </span>
          {groups.map((grp) => {
            const isActive = grp.id === activeGroup;
            return (
              <div key={grp.id} className="relative group/grptab shrink-0">
                <button
                  onClick={() => {
                    setActiveGroup(grp.id);
                    playClickSound(40, false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.15)]'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{grp.icon}</span>
                  <span>{grp.name}</span>
                </button>

                {userRole === 'admin' && grp.id !== 'genel' && (
                  <button
                    onClick={(e) => handleAdminDeleteGroup(grp.id, e)}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500/80 hover:bg-rose-600 rounded-full flex items-center justify-center text-white text-[9px] opacity-0 group-hover/grptab:opacity-100 transition-opacity"
                    title="Sil"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {chatMode === 'dm' && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121522] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[9px] uppercase font-bold text-emerald-400/80 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            GMAIL KİŞİLERİ:
          </span>

          {/* Quick preset Gmail contacts */}
          {['destek.archweb@gmail.com', 'admin.kernel@gmail.com', 'ahmet.dev@gmail.com'].map((g) => {
            const isActive = activeDmGmail === g;
            return (
              <button
                key={g}
                onClick={() => {
                  setActiveDmGmail(g);
                  playClickSound(40, false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 border shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Mail size={11} className="text-emerald-400" />
                <span>{g}</span>
              </button>
            );
          })}

          {/* Active target if custom */}
          {activeDmGmail && !['destek.archweb@gmail.com', 'admin.kernel@gmail.com', 'ahmet.dev@gmail.com'].includes(activeDmGmail) && (
            <button
              onClick={() => setActiveDmGmail(activeDmGmail)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shrink-0 flex items-center gap-1.5"
            >
              <Mail size={11} className="text-emerald-400" />
              <span>{activeDmGmail}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddDmModal(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all shrink-0 flex items-center gap-1 ml-auto"
          >
            <Plus size={12} />
            <span>Gmail Ekle / Ara</span>
          </button>
        </div>
      )}

      {/* 3 Mode Network Scanner Bar */}
      {chatMode === 'scan' && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121522] border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[9px] uppercase font-bold text-purple-400/80 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            TARAMA MODLARI:
          </span>

          <button
            onClick={() => {
              setScanMode('subnet');
              runNetworkScan('subnet');
              playClickSound(40, false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
              scanMode === 'subnet'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Wifi size={12} />
            <span>1. Yerel Subnet Taraması</span>
          </button>

          <button
            onClick={() => {
              setScanMode('global');
              runNetworkScan('global');
              playClickSound(40, false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
              scanMode === 'global'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Globe size={12} />
            <span>2. Global Gmail Dizini</span>
          </button>

          <button
            onClick={() => {
              setScanMode('deep');
              runNetworkScan('deep');
              playClickSound(40, false);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
              scanMode === 'deep'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Cpu size={12} />
            <span>3. Derin Cihaz & Port Taraması</span>
          </button>
        </div>
      )}

      {/* Content Body Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0d0f17] to-[#07080d] flex flex-col">
        {chatMode === 'scan' ? (
          /* NETWORK SCANNER VIEW (3 MODES) */
          <div className="p-4 space-y-4 flex-1">
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  {scanMode === 'subnet' && <Wifi className="animate-pulse text-purple-400" size={18} />}
                  {scanMode === 'global' && <Globe className="animate-pulse text-purple-400" size={18} />}
                  {scanMode === 'deep' && <Cpu className="animate-pulse text-purple-400" size={18} />}
                  <span>
                    {scanMode === 'subnet' && 'Mod 1: Yerel Ağ / Subnet Taraması (192.168.1.0/24)'}
                    {scanMode === 'global' && 'Mod 2: Global Gmail Dizin Taraması (ArchWeb Network)'}
                    {scanMode === 'deep' && 'Mod 3: Derin Cihaz, Socket & Port Taraması'}
                  </span>
                </div>
                <p className="text-[11px] text-white/50 mt-1">
                  {scanMode === 'subnet' && 'Ağınızdaki aktif cihazları, IP adreslerini ve Gmail hesaplarını otomatik tespit eder.'}
                  {scanMode === 'global' && 'ArchWeb OS sunucularında kayıtlı ve çevrimiçi tüm Gmail hesaplarını sorgular.'}
                  {scanMode === 'deep' && '3000, 8080 ve 443 portlarındaki aktif socket oturumlarını ve Gmail tokenlerini analiz eder.'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-48">
                  <Search size={14} className="absolute left-3 top-2.5 text-white/30" />
                  <input
                    type="text"
                    value={scanFilterQuery}
                    onChange={(e) => {
                      setScanFilterQuery(e.target.value);
                      runNetworkScan(scanMode, e.target.value);
                    }}
                    placeholder="Gmail veya IP Ara..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  onClick={() => runNetworkScan(scanMode, scanFilterQuery)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                >
                  <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
                  <span>Taramayı Yenile</span>
                </button>
              </div>
            </div>

            {/* Scanning Status Header */}
            {isScanning ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-purple-300">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-400 animate-spin"></div>
                  <Radio size={20} className="absolute text-purple-400 animate-ping" />
                </div>
                <span className="text-xs font-mono font-bold">Ağ Sinyalleri & Gmail Dizinleri Taranıyor...</span>
              </div>
            ) : scanResults ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-white/40 px-1 font-mono">
                  <span>
                    {scanMode === 'subnet' && `Toplam ${scanResults.totalScanned} IP Tarandı • ${scanResults.activeNodes} Aktif Cihaz`}
                    {scanMode === 'global' && `Toplam ${scanResults.totalRegistered} Kayıtlı Gmail • ${scanResults.activeUsers} Çevrimiçi Hesap`}
                    {scanMode === 'deep' && `Toplam ${scanResults.totalPortsScanned} Port Analiz Edildi • ${scanResults.openSessions} Açık Socket`}
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Ağ Durumu: Stabil
                  </span>
                </div>

                {/* MODE 1 RESULTS: SUBNET SCAN */}
                {scanMode === 'subnet' && scanResults.nodes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scanResults.nodes.map((node: any) => (
                      <div key={node.ip} className="bg-black/40 border border-white/10 hover:border-purple-500/40 rounded-2xl p-3.5 transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{node.avatar}</span>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{node.device}</span>
                                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] rounded font-mono">
                                  {node.ping}
                                </span>
                              </div>
                              <div className="text-[10px] text-white/40 font-mono">
                                IP: {node.ip} | Port: {node.port}
                              </div>
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>

                        <div className="p-2 bg-purple-950/20 rounded-xl border border-purple-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-purple-400" />
                            <span className="text-xs font-mono font-bold text-purple-200">{node.gmail}</span>
                          </div>
                          <button
                            onClick={() => handleStartDmWithGmail(node.gmail)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md"
                          >
                            Mesaj At
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MODE 2 RESULTS: GLOBAL GMAIL DIRECTORY */}
                {scanMode === 'global' && scanResults.users && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scanResults.users.map((usr: any) => (
                      <div key={usr.gmail} className="bg-black/40 border border-white/10 hover:border-purple-500/40 rounded-2xl p-3.5 transition-all space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-base">
                              {usr.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{usr.name}</span>
                                {usr.verified && (
                                  <span className="text-[9px] px-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded font-bold">✓ Onaylı</span>
                                )}
                              </div>
                              <div className="text-[10px] text-white/40 font-mono">{usr.location} • {usr.role}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 bg-purple-950/20 rounded-xl border border-purple-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate">
                            <Mail size={13} className="text-purple-400 shrink-0" />
                            <span className="text-xs font-mono font-bold text-purple-200 truncate">{usr.gmail}</span>
                          </div>
                          <button
                            onClick={() => handleStartDmWithGmail(usr.gmail)}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all shrink-0 ml-2 shadow-md"
                          >
                            Gmail'e Yaz
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MODE 3 RESULTS: DEEP PORT & DEVICE SCAN */}
                {scanMode === 'deep' && scanResults.sessions && (
                  <div className="space-y-2">
                    {scanResults.sessions.map((sess: any, idx: number) => (
                      <div key={idx} className="bg-black/40 border border-white/10 hover:border-purple-500/40 rounded-2xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 text-purple-300 rounded-xl border border-purple-500/20">
                            <Server size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{sess.service}</span>
                              <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] rounded font-mono">
                                Port {sess.port} ({sess.protocol})
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-white/40 flex items-center gap-2 mt-0.5">
                              <span>IP: {sess.ip}</span>
                              <span>•</span>
                              <span>Gmail: <strong className="text-purple-300">{sess.gmail}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartDmWithGmail(sess.gmail)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md"
                        >
                          Kanal Kur
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          /* CHAT MESSAGES VIEW (GROUP OR DM) */
          <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
            {/* Header Lock Notice */}
            {chatMode === 'group' && isChatLocked && (
              <div className="px-3 py-1.5 mb-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center justify-between text-[11px] text-rose-300 font-mono">
                <div className="flex items-center gap-2">
                  <Lock size={12} className="animate-bounce" />
                  <span>Sohbet Yöneticiler Tarafından Kilitlenmiştir.</span>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1"
            >
              {isLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40 py-20">
                  <RefreshCw size={24} className="animate-spin text-emerald-400" />
                  <span className="text-xs font-mono">Mesajlar yükleniyor...</span>
                </div>
              ) : chatMode === 'dm' && !activeDmGmail ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center text-white/40">
                  <Mail size={36} className="text-emerald-400/50" />
                  <div className="text-xs font-bold text-white/80">Gmail İle 1-e-1 Özel Mesajlaşma</div>
                  <p className="text-[11px] max-w-xs text-white/40">
                    Ağdaki herhangi biriyle doğrudan konuşmak için yukardaki "Gmail Ekle / Ara" butonuna basın veya bir Gmail adresi yazın.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-white/20 text-[11px] italic flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">{chatMode === 'group' ? currentGroupObj?.icon : '✉️'}</span>
                  <span>
                    {chatMode === 'group' 
                      ? `[${currentGroupObj?.name}] kanalında henüz mesaj yok. İlk mesajı yazın!`
                      : `[${activeDmGmail}] adresi ile henüz sohbetiniz yok. İlk mesajı siz atın!`}
                  </span>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isAdminMsg = msg.role === 'admin';
                    const isMe = msg.user === myGmail;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex gap-3 group relative ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base shrink-0 select-none relative">
                          {msg.avatar}
                          {isAdminMsg && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black">
                              👑
                            </div>
                          )}
                        </div>
                        <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold font-mono flex items-center gap-1 ${isAdminMsg ? 'text-amber-400' : isMe ? 'text-emerald-400' : 'text-sky-400'}`}>
                              {msg.user}
                            </span>
                            <span className="text-[8px] text-white/20 font-mono">{msg.time}</span>
                          </div>
                          <div className="relative group/bubble">
                            <div className={`px-3.5 py-2 rounded-2xl text-[11px] leading-relaxed break-words ${
                              isAdminMsg
                                ? 'bg-amber-500/10 text-amber-100 rounded-tr-none border border-amber-500/30'
                                : isMe 
                                  ? 'bg-emerald-600/20 text-emerald-100 rounded-tr-none border border-emerald-500/30' 
                                  : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10'
                            }`}>
                              {msg.message}
                            </div>

                            {/* Admin Delete Action for Individual Messages */}
                            {userRole === 'admin' && (
                              <button
                                onClick={() => handleAdminDeleteMessage(msg.id)}
                                disabled={deletingId === msg.id}
                                className={`absolute -top-2 ${isMe ? '-left-6' : '-right-6'} opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500 rounded-md cursor-pointer hover:text-white`}
                                title="Sil"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Input Send Area */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/5 flex gap-2 shrink-0">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  chatMode === 'group'
                    ? `#${currentGroupObj?.name} grubuna yaz...`
                    : activeDmGmail
                      ? `${activeDmGmail} adresine mesaj gönder...`
                      : "Mesaj yazmak için bir Gmail seçin..."
                }
                disabled={chatMode === 'group' && isChatLocked && userRole !== 'admin'}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || (chatMode === 'group' && isChatLocked && userRole !== 'admin')}
                className="px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold transition-all flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add / Search Gmail Modal */}
      <AnimatePresence>
        {showAddDmModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-[#151926] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Mail size={18} />
                  <span>Ağdaki Gmail İle Sohbet Başlat</span>
                </div>
                <button
                  onClick={() => setShowAddDmModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/80 block">
                  Konuşmak İstediğiniz Kişinin Gmail Adresini Yazın:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetGmailInput}
                    onChange={(e) => setTargetGmailInput(e.target.value)}
                    placeholder="Örn: ornek.kullanici@gmail.com"
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    onClick={() => handleStartDmWithGmail(targetGmailInput)}
                    disabled={!targetGmailInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                  >
                    Başlat
                  </button>
                </div>

                {/* Quick Network Discovery Shortcut Buttons */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 block">
                    Veya 3 Ağ Taraması Modundan Seçin:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setShowAddDmModal(false);
                        setChatMode('scan');
                        setScanMode('subnet');
                        runNetworkScan('subnet');
                      }}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-bold transition-all text-center flex flex-col items-center gap-1"
                    >
                      <Wifi size={14} />
                      <span>1. Yerel Ağ</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDmModal(false);
                        setChatMode('scan');
                        setScanMode('global');
                        runNetworkScan('global');
                      }}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-bold transition-all text-center flex flex-col items-center gap-1"
                    >
                      <Globe size={14} />
                      <span>2. Global Dizin</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddDmModal(false);
                        setChatMode('scan');
                        setScanMode('deep');
                        runNetworkScan('deep');
                      }}
                      className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-[10px] font-bold transition-all text-center flex flex-col items-center gap-1"
                    >
                      <Cpu size={14} />
                      <span>3. Derin Tarama</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddDmModal(false)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#151926] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Crown size={18} />
                  <span>Yeni Sohbet Grubu Oluştur</span>
                </div>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdminCreateGroup} className="space-y-3">
                {createGroupError && (
                  <div className="p-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
                    {createGroupError}
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">Grup Adı:</label>
                  <input
                    type="text"
                    value={createGroupName}
                    onChange={(e) => setCreateGroupName(e.target.value)}
                    placeholder="Örn: Yazılım Ekibi"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">Grup İkonu / Emoji:</label>
                  <input
                    type="text"
                    value={createGroupIcon}
                    onChange={(e) => setCreateGroupIcon(e.target.value)}
                    placeholder="💬"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all"
                  >
                    Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
