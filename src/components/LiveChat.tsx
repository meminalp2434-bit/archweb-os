import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, MessageCircle, X, Terminal, Trash2, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { playClickSound, playNotificationSound } from '../utils/audio';

interface ChatMessage {
  id: number;
  user: string;
  message: string;
  avatar: string;
  time: string;
}

interface LiveChatProps {
  onClose: () => void;
  currentUser?: string;
  avatar?: string;
}

export const LiveChat: React.FC<LiveChatProps> = ({ onClose, currentUser = 'Misafir', avatar = '👤' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(getApiUrl('/api/chat'));
      if (!response.ok) throw new Error('Sunucuya bağlanılamadı');
      const data = await response.json();
      setMessages(data);
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
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = newMessage;
    setNewMessage('');
    playClickSound(50, false);

    try {
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser,
          message: tempMsg,
          avatar: avatar
        })
      });

      if (response.ok) {
        fetchMessages();
      } else {
        throw new Error('Mesaj gönderilemedi');
      }
    } catch (err) {
      console.error('Send message error:', err);
      setError('Mesaj gönderilemedi. Sunucu bağlantısını kontrol edin.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f111a] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
            <MessageCircle size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold">ArchWeb Canlı Sohbet</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] text-white/40 uppercase tracking-wider">Global Kanal • Aktif</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMessages}
            className="p-1.5 hover:bg-white/5 text-white/40 hover:text-white rounded-md transition-colors"
            title="Yenile"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
      >
        {isLoading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <RefreshCw size={24} className="animate-spin" />
            <span className="text-xs font-mono">Sohbet yükleniyor...</span>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <Terminal size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-400">Bağlantı Kesildi</h3>
              <p className="text-[10px] text-white/40 leading-relaxed max-w-[200px]">
                {error}
              </p>
            </div>
            <button 
              onClick={fetchMessages}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
            >
              Yeniden Dene
            </button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="text-center py-20 text-white/20 text-[10px] italic">
                Henüz mesaj yok. İlk mesajı sen gönder!
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3 ${msg.user === currentUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0 select-none">
                    {msg.avatar}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[80%] ${msg.user === currentUser ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-sky-400">{msg.user}</span>
                      <span className="text-[8px] text-white/20 font-mono">{msg.time}</span>
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-[11px] leading-relaxed break-words ${
                      msg.user === currentUser 
                        ? 'bg-sky-600/20 text-sky-100 rounded-tr-none border border-sky-500/20' 
                        : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#161b22] border-t border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-sky-500/50 transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-sky-600 transition-all active:scale-95 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-2 flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] text-white/40 uppercase tracking-tighter">Sunucu: Aktif</span>
          </div>
          <div className="text-[9px] text-white/20 ml-auto font-mono">ArchWeb Chat Protocol v1.0</div>
        </div>
      </div>
    </div>
  );
};
