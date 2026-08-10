import React, { useState, useEffect } from 'react';
import { X, MapPin, Wifi, Globe, User, Send, ChevronLeft, Signal, Mail, Cpu, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NearbyChatProps {
  onClose: () => void;
}

interface ChatUser {
  id: string;
  gmail: string;
  name: string;
  status: 'online' | 'offline';
  distance?: string;
  avatar: string;
  type: 'subnet' | 'global' | 'deep';
  ip?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export const NearbyChat: React.FC<NearbyChatProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'subnet' | 'global' | 'deep'>('subnet');
  const [isScanning, setIsScanning] = useState(true);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => {
      setUsers([
        // Mode 1: Subnet Scan
        { id: '1', gmail: 'meminalp2434@gmail.com', name: 'Melih Emin Alp', status: 'online', distance: '12m (192.168.1.102)', avatar: '😎', type: 'subnet', ip: '192.168.1.102' },
        { id: '2', gmail: 'ahmet.dev@gmail.com', name: 'Ahmet Dev', status: 'online', distance: '45m (192.168.1.108)', avatar: '💻', type: 'subnet', ip: '192.168.1.108' },
        
        // Mode 2: Global Gmail Scan
        { id: '3', gmail: 'destek.archweb@gmail.com', name: 'ArchWeb Destek', status: 'online', avatar: '🛠️', type: 'global' },
        { id: '4', gmail: 'admin.kernel@gmail.com', name: 'Kernel Admin', status: 'online', avatar: '🔧', type: 'global' },
        
        // Mode 3: Deep Scan
        { id: '5', gmail: 'zeynep.yazilim@gmail.com', name: 'Zeynep Socket Node', status: 'online', avatar: '⚡', type: 'deep', ip: '127.0.0.1:3000' },
        { id: '6', gmail: 'bursa.saha@gmail.com', name: 'Saha Mobil Gateway', status: 'online', avatar: '📲', type: 'deep', ip: '192.168.1.145:8080' },
      ]);
      setIsScanning(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const filteredUsers = users
    .filter(u => u.type === activeTab)
    .filter(u => searchQuery ? (u.gmail.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase())) : true);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: messageInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage]
    }));
    setMessageInput('');

    // Simulate response
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUser.id,
        text: `Merhaba! ${selectedUser.gmail} adresi üzerinden ArchWeb OS ağında bağlandım. 👍`,
        timestamp: new Date()
      };
      setMessages(prev => ({
        ...prev,
        [selectedUser.id]: [...(prev[selectedUser.id] || []), replyMessage]
      }));
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute left-4 top-12 w-[360px] h-[520px] bg-[#121522]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[500] flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Mail size={18} className="text-emerald-400" />
          <h2 className="font-bold text-xs tracking-wide">Ağ Taraması & Gmail Sohbeti</h2>
        </div>
        <button onClick={onClose} className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* 3 Scanning Modes Tabs */}
            <div className="grid grid-cols-3 p-1.5 gap-1 border-b border-white/5 shrink-0 bg-black/20">
              <button 
                onClick={() => setActiveTab('subnet')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'subnet' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:bg-white/5'}`}
              >
                <Wifi size={12} /> 1. Subnet
              </button>
              <button 
                onClick={() => setActiveTab('global')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'global' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/50 hover:bg-white/5'}`}
              >
                <Globe size={12} /> 2. Global
              </button>
              <button 
                onClick={() => setActiveTab('deep')}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${activeTab === 'deep' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/50 hover:bg-white/5'}`}
              >
                <Cpu size={12} /> 3. Derin
              </button>
            </div>

            {/* Search filter */}
            <div className="p-2 border-b border-white/5 bg-black/10">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gmail adresi ara..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-7 pr-3 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40 gap-3 py-12">
                  <div className="relative">
                    <Mail size={24} className="text-emerald-400 relative z-10" />
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-xs font-mono">Gmail düğümleri taranıyor...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 hover:border-emerald-500/40 hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-base border border-white/5 relative shrink-0">
                      {user.avatar}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#121522]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-emerald-400/90 font-mono truncate flex items-center gap-1">
                        <Mail size={10} /> {user.gmail}
                      </div>
                      {user.distance && (
                        <div className="text-[9px] text-white/30 font-mono mt-0.5">{user.distance}</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-white/40 p-6 text-center">
                  Bu modda eşleşen Gmail kullanıcısı bulunamadı.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* DM Chat View */
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-2.5 border-b border-white/10 flex items-center gap-2 bg-black/30 shrink-0">
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-sm border border-white/5 relative shrink-0">
                {selectedUser.avatar}
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full border border-[#121522]"></div>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">{selectedUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono truncate">{selectedUser.gmail}</div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
              <div className="text-center text-[10px] text-white/30 my-1 bg-black/20 p-2 rounded-lg font-mono">
                🔒 ArchWeb Şifreli Gmail Kanalı ({selectedUser.gmail})
              </div>
              
              {(messages[selectedUser.id] || []).map((msg) => (
                <div 
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl p-2.5 text-xs ${
                    msg.senderId === 'me' 
                      ? 'bg-emerald-600/30 border border-emerald-500/30 text-white self-end rounded-tr-none' 
                      : 'bg-white/10 border border-white/5 text-white/90 self-start rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[8px] mt-1 opacity-40 font-mono ${msg.senderId === 'me' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-white/10 bg-black/30 shrink-0 flex gap-2">
              <input 
                type="text" 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={`${selectedUser.gmail} adresine yaz...`}
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors disabled:opacity-40 shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
