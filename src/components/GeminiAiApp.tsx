import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Sparkles, Send, Bot, User, Volume2, Copy, Image as ImageIcon, 
  Trash2, RefreshCw, Camera, Upload, Check, Zap, MessageSquare, 
  Code, BookOpen, Lightbulb, Smile, Mic, MicOff, Maximize2, Minimize2
} from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface GeminiAiAppProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  image?: string | null;
  timestamp: string;
}

export const GeminiAiApp: React.FC<GeminiAiAppProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'gemini',
      text: 'Merhaba! Ben **Gemini 2.5 Flash Yapay Zeka Asistanı**. 🚀\n\nSana kod yazma, ödevler, görsel analiz, hikaye anlatımı veya ArchWeb OS hakkında nasıl yardımcı olabilirim?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isListening, setIsListening] = useState(false);
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking === id) {
        setIsSpeaking(null);
        return;
      }
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'tr-TR';
      
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.startsWith('tr') || v.lang.includes('TR'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      setIsSpeaking(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tarayıcınız ses tanımayı desteklemiyor veya kısıtlanmış.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript;
        if (transcript) {
          setIsListening(false);
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() && !selectedImage) return;

    const userMsgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      image: selectedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    const attachedImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/gemini/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          imageBase64: attachedImg
        })
      });

      const data = await response.json();
      const aiResponseText = data.reply || data.analysis || 'Gemini yanıt veremedi.';
      const aiMsgId = `gemini-${Date.now()}`;

      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'gemini',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);

      // Speak automatically if autoVoiceReply is on
      if (autoVoiceReply) {
        speakText(aiMsgId, aiResponseText);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'gemini',
          text: `⚠️ Sunucu Bağlantı Hatası: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const presets = [
    { icon: <Code size={14} className="text-sky-400" />, label: 'Kod Yardımı', prompt: 'Bana React ve TypeScript ile eğlenceli bir sayaç bileşeni örneği yaz.' },
    { icon: <BookOpen size={14} className="text-amber-400" />, label: 'Masal Anlat', prompt: 'Çocuklar için dostluk ve bilgisayar bilimi temalı 2 dakikalık neşeli bir masal yaz.' },
    { icon: <Lightbulb size={14} className="text-purple-400" />, label: 'Ödev Açıkla', prompt: 'Yapay zeka nasıl çalışır? 10 yaşındaki bir çocuğun anlayacağı şekilde eğlenceli örneklerle anlat.' },
    { icon: <Smile size={14} className="text-emerald-400" />, label: 'Nasılsın Gemini?', prompt: 'ArchWeb OS masaüstündeki Gemini AI hakkında bana neler yapabileceğini özetle!' }
  ];

  return (
    <div className={`fixed z-[160] flex items-center justify-center p-2 sm:p-4 transition-all duration-200 ${
      isMaximized ? 'inset-0' : 'inset-2 sm:inset-10'
    }`}>
      {/* Background Dim */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md -z-10 rounded-2xl" onClick={onClose} />

      {/* Main Window */}
      <div className="bg-[#0f0d23] border border-purple-500/30 rounded-2xl w-full h-full max-w-5xl shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col overflow-hidden">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload} 
        />

        {/* Window Title Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950 flex items-center justify-between border-b border-purple-500/20 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-yellow-300 shadow-md shadow-purple-500/30 border border-purple-400/40">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-sm tracking-wide">Gemini AI Asistanı</h2>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold rounded-full">
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-purple-300/60 text-[11px]">ArchWeb OS Masaüstü Yapay Zeka Ortamı</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setMessages([messages[0]])}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Sohbeti Temizle"
            >
              <Trash2 size={15} />
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors hidden sm:flex"
              title={isMaximized ? "Küçült" : "Büyüt"}
            >
              {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preset Cards Banner */}
        <div className="p-3 bg-purple-950/30 border-b border-purple-500/10 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-semibold text-purple-300/70 whitespace-nowrap hidden md:inline">Hızlı İstemler:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="px-3 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500/20 text-white/90 hover:text-white text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-all shadow-sm"
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans bg-[#0a081a]">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === 'user' 
                  ? 'bg-sky-500/20 border border-sky-400/30 text-sky-300' 
                  : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-yellow-300 border border-purple-400/40'
              }`}>
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-2 group max-w-[85%]`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-sky-600/30 border border-sky-500/30 text-white rounded-tr-none'
                    : 'bg-[#161233] border border-purple-500/20 text-purple-100 rounded-tl-none shadow-lg'
                }`}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Ekteki Görsel" 
                      className="max-h-48 rounded-xl border border-white/20 mb-2 object-cover"
                    />
                  )}
                  <div>{msg.text}</div>
                </div>

                {/* Footer Controls */}
                <div className={`flex items-center gap-2 text-[10px] text-white/40 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'gemini' && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => speakText(msg.id, msg.text)}
                        className={`hover:text-yellow-300 flex items-center gap-1 transition-colors ${
                          isSpeaking === msg.id ? 'text-amber-400 font-bold' : ''
                        }`}
                      >
                        <Volume2 size={12} />
                        <span>{isSpeaking === msg.id ? 'Dinleniyor...' : 'Oku'}</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:text-purple-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-yellow-300 border border-purple-400/40 flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={18} />
              </div>
              <div className="p-4 rounded-2xl bg-[#161233] border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2.5 rounded-tl-none">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span>Gemini Yapay Zeka düşüncelerini hazırlıyor...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Attached Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-purple-950/40 border-t border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Seçilen Görsel" className="w-10 h-10 object-cover rounded-lg border border-purple-400/40" />
              <span className="text-xs text-purple-200">Görsel Gemini'ye analiz için hazırlandı</span>
            </div>
            <button 
              onClick={() => setSelectedImage(null)}
              className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#120f2b] border-t border-purple-500/20">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-white/5 hover:bg-purple-600/30 border border-purple-500/20 text-purple-200 rounded-xl transition-all"
              title="Fotoğraf / Görsel Yükle"
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-2.5 rounded-xl transition-all border ${
                isListening 
                  ? 'bg-red-500 text-white animate-bounce border-red-400' 
                  : 'bg-white/5 hover:bg-purple-600/30 border-purple-500/20 text-purple-200'
              }`}
              title="Sesli Konuş (Yapay Zeka Dinliyor)"
            >
              <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
            </button>

            <button
              type="button"
              onClick={() => setAutoVoiceReply(prev => !prev)}
              className={`px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all border hidden sm:flex items-center gap-1.5 ${
                autoVoiceReply 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-white/5 text-white/50 border-white/10'
              }`}
              title="Otomatik Sesli Yanıt (TTS)"
            >
              <Volume2 size={15} />
              <span>{autoVoiceReply ? 'Sesli Yanıt Açık' : 'Sesli Kapalı'}</span>
            </button>

            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Sesiniz dinleniyor... Konuşun!" : "Gemini'ye sesli veya yazılı sor..."}
              className="flex-1 bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Gönder</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
