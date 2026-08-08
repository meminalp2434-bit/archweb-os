import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, X, Terminal, Trash2, RefreshCw, Shield, Lock, Unlock, Crown, Plus, FolderPlus, Hash } from 'lucide-react';
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
  currentUser = 'Misafir', 
  avatar = '👤',
  userRole = 'user'
}) => {
  const [chatMode, setChatMode] = useState<'group' | 'dm'>('group');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([
    { id: 'genel', name: 'Genel', icon: '💬' },
    { id: 'duyurular', name: 'Duyurular', icon: '📢' },
    { id: 'destek', name: 'Teknik Destek', icon: '🛠️' },
    { id: 'yonetim', name: 'Yönetici Grubu', icon: '👑' }
  ]);
  const [activeGroup, setActiveGroup] = useState<string>('genel');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  // DM State
  const [activeDmUser, setActiveDmUser] = useState<string | null>(null);
  const [customDmUsername, setCustomDmUsername] = useState('');
  const [showAddDmUserModal, setShowAddDmUserModal] = useState(false);

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
        url = `/api/chat?group=${activeGroup}&currentUser=${encodeURIComponent(currentUser)}&userAvatar=${encodeURIComponent(avatar)}&userRole=${userRole}`;
      } else {
        if (!activeDmUser) {
          setIsLoading(false);
          return;
        }
        url = `/api/chat?dmWith=${encodeURIComponent(activeDmUser)}&currentUser=${encodeURIComponent(currentUser)}&userAvatar=${encodeURIComponent(avatar)}&userRole=${userRole}`;
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
      setError('Bağlantı Hatası: Canlı sohbet sunucusu şu an aktif değil.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatMode, activeGroup, activeDmUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (chatMode === 'group' && isChatLocked && userRole !== 'admin') {
      setError('Sohbet şu an yöneticiler tarafından dondurulmuştur.');
      return;
    }
    if (chatMode === 'dm' && !activeDmUser) {
      setError('Lütfen önce mesaj göndermek istediğiniz bir kişiyi seçin.');
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
          user: currentUser,
          message: tempMsg,
          avatar: avatar,
          role: userRole,
          group: isDm ? undefined : activeGroup,
          isDm: isDm,
          recipient: isDm ? activeDmUser : undefined
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

  const handleStartDmWith = (targetUser: string) => {
    setActiveDmUser(targetUser);
    setChatMode('dm');
    setShowAddDmUserModal(false);
    setCustomDmUsername('');
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
  const otherOnlineUsers = onlineUsers.filter(u => u.username !== currentUser);

  return (
    <div className="flex flex-col h-full bg-[#0f111a] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center">
            <MessageCircle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold">ArchWeb Canlı Sohbet</h2>
              {userRole === 'admin' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                  <Crown size={10} /> YÖNETİCİ
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isChatLocked ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider">
                {chatMode === 'group' ? `${currentGroupObj?.icon} ${currentGroupObj?.name}` : `🔒 Özel Mesaj: ${activeDmUser || 'Kişi Seçin'}`}
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
                title="Yeni Grup / Kanal Oluştur (Yönetici)"
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
                title={isChatLocked ? 'Sohbet Kilidini Aç' : 'Sohbeti Kullanıcılara Kilitle'}
              >
                {isChatLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span className="hidden sm:inline">{isChatLocked ? 'Kilitli' : 'Açık'}</span>
              </button>

              <button
                onClick={handleAdminClearAll}
                className="p-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors"
                title="Sohbet Geçmişini Temizle"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          <button 
            onClick={fetchMessages}
            className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded-md transition-colors"
            title="Mesajları Yenile"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
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

      {/* Main Mode Switcher: Gruplar vs Özel Mesajlar */}
      <div className="flex bg-[#0b0d14] border-b border-white/5 p-1 gap-1">
        <button
          onClick={() => {
            setChatMode('group');
            playClickSound(40, false);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
            chatMode === 'group'
              ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>👥 GRUP SOHBETLERİ</span>
        </button>

        <button
          onClick={() => {
            setChatMode('dm');
            if (!activeDmUser && otherOnlineUsers.length > 0) {
              setActiveDmUser(otherOnlineUsers[0].username);
            }
            playClickSound(40, false);
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border relative ${
            chatMode === 'dm'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
              : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>💬 ÖZEL MESAJLAR (DM)</span>
          {otherOnlineUsers.length > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-full">
              {otherOnlineUsers.length} Aktif
            </span>
          )}
        </button>
      </div>

      {/* Mode Sub-navigation */}
      {chatMode === 'group' ? (
        /* Group Bar */
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121520] border-b border-white/5 overflow-x-auto custom-scrollbar">
          <span className="text-[9px] uppercase font-bold text-white/30 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Hash size={10} /> GRUPLAR:
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
                    title="Grubu Sil (Yönetici)"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

          {userRole === 'admin' && (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-all shrink-0 flex items-center gap-1 ml-auto"
            >
              <Plus size={12} />
              <span>Yeni Grup</span>
            </button>
          )}
        </div>
      ) : (
        /* DM Contacts Bar */
        <div className="flex items-center gap-1.5 px-3 py-2 bg-[#121520] border-b border-white/5 overflow-x-auto custom-scrollbar">
          <span className="text-[9px] uppercase font-bold text-emerald-400/80 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <User size={10} /> KİŞİLER:
          </span>

          {otherOnlineUsers.map((u) => {
            const isActive = activeDmUser === u.username;
            return (
              <button
                key={u.username}
                onClick={() => {
                  setActiveDmUser(u.username);
                  playClickSound(40, false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{u.avatar}</span>
                <span>{u.username}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </button>
            );
          })}

          {/* Currently selected offline or custom target */}
          {activeDmUser && !otherOnlineUsers.some(u => u.username === activeDmUser) && (
            <button
              onClick={() => setActiveDmUser(activeDmUser)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 shrink-0 flex items-center gap-1.5"
            >
              <span>👤</span>
              <span>{activeDmUser}</span>
              <span className="text-[9px] text-white/40">(Çevrimdışı)</span>
            </button>
          )}

          <button
            onClick={() => setShowAddDmUserModal(true)}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-all shrink-0 flex items-center gap-1 ml-auto"
          >
            <Plus size={12} />
            <span>Kişi Ara / Ekle</span>
          </button>
        </div>
      )}

      {/* Admin Notice Banner (for Group Chat) */}
      {chatMode === 'group' && isChatLocked && (
        <div className="px-4 py-1.5 bg-rose-500/15 border-b border-rose-500/30 flex items-center justify-between text-[11px] text-rose-300 font-mono">
          <div className="flex items-center gap-2">
            <Lock size={12} className="animate-bounce" />
            <span>Sohbet Yöneticiler Tarafından Kilitlenmiştir.</span>
          </div>
          {userRole === 'admin' && <span className="text-[9px] text-rose-400 uppercase font-bold">(Yönetici Modu)</span>}
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-gradient-to-b from-[#0f111a] to-[#0a0b12]"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <RefreshCw size={24} className="animate-spin" />
            <span className="text-xs font-mono">Mesajlar yükleniyor...</span>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 text-xs">
              {error}
            </div>
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-white rounded-lg border border-white/10 transition-colors"
            >
              Yeniden Dene
            </button>
          </div>
        ) : chatMode === 'dm' && !activeDmUser ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center text-white/40">
            <User size={36} className="text-emerald-400/50" />
            <div className="text-xs font-bold text-white/80">Birebir Özel Mesajlaşma</div>
            <p className="text-[11px] max-w-xs text-white/40">
              İstediğiniz kişi ile 1-e-1 özel sohbet başlatmak için yukarıdaki kişilerden birini seçin veya "Kişi Ara / Ekle"ye tıklayın.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="text-center py-20 text-white/20 text-[11px] italic flex flex-col items-center justify-center gap-2">
                <span className="text-2xl">{chatMode === 'group' ? currentGroupObj?.icon : '🔒'}</span>
                <span>
                  {chatMode === 'group' 
                    ? `[${currentGroupObj?.name}] grubunda henüz mesaj yok. Katılan herkes konuşabilir!`
                    : `[${activeDmUser}] ile henüz özel sohbet geçmişiniz yok. İlk mesajı siz atın!`}
                </span>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdminMsg = msg.role === 'admin';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex gap-3 group relative ${msg.user === currentUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 select-none relative">
                      {msg.avatar}
                      {isAdminMsg && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-black shadow-md">
                          👑
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.user === currentUser ? 'items-end' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isAdminMsg ? 'text-amber-400' : 'text-sky-400'}`}>
                          {msg.user}
                          {isAdminMsg && (
                            <span className="px-1 py-0.2 rounded bg-amber-500/20 text-[8px] text-amber-300 font-mono font-bold">
                              ADMIN
                            </span>
                          )}
                        </span>
                        <span className="text-[8px] text-white/20 font-mono">{msg.time}</span>
                      </div>
                      <div className="relative group/bubble">
                        <div className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed break-words ${
                          isAdminMsg
                            ? 'bg-amber-500/10 text-amber-100 rounded-tr-none border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                            : msg.user === currentUser 
                              ? 'bg-sky-600/20 text-sky-100 rounded-tr-none border border-sky-500/20' 
                              : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10'
                        }`}>
                          {msg.message}
                        </div>

                        {/* Admin Delete Action for Individual Messages */}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleAdminDeleteMessage(msg.id)}
                            disabled={deletingId === msg.id}
                            className={`absolute -top-2 ${msg.user === currentUser ? '-left-6' : '-right-6'} opacity-0 group-hover/bubble:opacity-100 transition-opacity p-1 bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500 rounded-md cursor-pointer hover:text-white`}
                            title="Mesajı Sil (Yönetici)"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#161b22] border-t border-white/5">
        {chatMode === 'group' && isChatLocked && userRole !== 'admin' ? (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs text-rose-300 font-bold flex items-center justify-center gap-2">
            <Lock size={14} />
            Sohbet şu an yöneticiler tarafından kilitlidir.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                chatMode === 'dm'
                  ? (activeDmUser ? `${activeDmUser} kişisine özel mesaj...` : "Önce bir kişi seçin...")
                  : (userRole === 'admin' ? `[${currentGroupObj?.name}] grubunda yönetici mesajı...` : `[${currentGroupObj?.name}] grubunda herkese açık mesaj...`)
              }
              disabled={chatMode === 'dm' && !activeDmUser}
              className={`flex-1 bg-black/40 border rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none transition-all ${
                chatMode === 'dm'
                  ? 'border-emerald-500/40 focus:border-emerald-400'
                  : userRole === 'admin' ? 'border-amber-500/40 focus:border-amber-400' : 'border-white/10 focus:border-sky-500/50'
              }`}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || (chatMode === 'dm' && !activeDmUser)}
              className={`p-2.5 text-white rounded-xl disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center ${
                chatMode === 'dm'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : userRole === 'admin' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-sky-600 hover:bg-sky-500'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
        )}

        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${chatMode === 'group' && isChatLocked ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            <span className="text-[9px] text-white/40 uppercase tracking-tighter">
              {chatMode === 'group' ? `Grup: ${currentGroupObj?.name}` : `Özel Mesaj: ${activeDmUser || 'Seçilmedi'}`}
            </span>
          </div>
          <div className="text-[9px] text-white/30 font-mono">
            Mod: {userRole === 'admin' ? '👑 Yönetici' : '👤 Kullanıcı'}
          </div>
        </div>
      </div>

      {/* Admin Create Group Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#161b26] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <FolderPlus size={18} />
                  <span>Yeni Sohbet Grubu Oluştur</span>
                </div>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {createGroupError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
                  {createGroupError}
                </div>
              )}

              <form onSubmit={handleAdminCreateGroup} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-white/60 mb-1 block">
                    Grup İkonu (Emoji)
                  </label>
                  <div className="flex gap-2">
                    {['💬', '📢', '🚀', '⚽', '🎮', '💡', '🔥', '👥', '🔐'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCreateGroupIcon(emoji)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-all ${
                          createGroupIcon === emoji
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white/60 mb-1 block">
                    Grup Adı
                  </label>
                  <input
                    type="text"
                    value={createGroupName}
                    onChange={(e) => setCreateGroupName(e.target.value)}
                    placeholder="Örn: Oyun Kulübü, Proje Takımı..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={!createGroupName.trim()}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all"
                  >
                    Grubu Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Search DM User Modal */}
      <AnimatePresence>
        {showAddDmUserModal && (
          <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#161b26] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <User size={18} />
                  <span>Özel Mesaj Başlat (1-e-1)</span>
                </div>
                <button
                  onClick={() => setShowAddDmUserModal(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {otherOnlineUsers.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold text-white/60 mb-1.5 block">
                    Çevrimiçi Kullanıcılar:
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {otherOnlineUsers.map(u => (
                      <button
                        key={u.username}
                        onClick={() => handleStartDmWith(u.username)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{u.avatar}</span>
                          <span className="text-xs font-bold text-white group-hover:text-emerald-300">{u.username}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Çevrimiçi
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-white/60 mb-1 block">
                  Kullanıcı Adı ile Ara veya Yaz:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customDmUsername}
                    onChange={(e) => setCustomDmUsername(e.target.value)}
                    placeholder="Örn: Ahmet, Zeynep..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => {
                      if (customDmUsername.trim()) {
                        handleStartDmWith(customDmUsername.trim());
                      }
                    }}
                    disabled={!customDmUsername.trim()}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Başlat
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddDmUserModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white/60 hover:bg-white/5"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

