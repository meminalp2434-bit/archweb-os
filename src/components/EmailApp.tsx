import React, { useState, useEffect } from 'react';
import { X, Mail, Send, Inbox, FileText, Trash2, Plus, Search, User, Star, Paperclip, ArrowLeft, Clock, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  starred: boolean;
  read: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
}

interface EmailAppProps {
  onClose: () => void;
}

const DEFAULT_EMAILS: Email[] = [
  {
    id: '1',
    from: 'system@archweb.org',
    to: 'arch-user@archweb.local',
    subject: 'ArchWeb OS v2.0 Kurulumu Başarılı!',
    date: '13 Tem 2026, 12:45',
    body: `Merhaba arch-user,\n\nArchWeb OS v2.0 sistem kurulumunuz başarıyla tamamlandı. Bu yeni sürümde gelişmiş bir dosya gezgini, Google ile entegre olabilen gelişmiş tarayıcı ve şimdi de tamamen işlevsel yerel E-posta istemcisi bulunuyor.\n\nYenilikleri keşfetmek için Dosyalar uygulamasında yeni oluşturulan "archweb" klasörünü inceleyebilir, sistem çekirdeği ve işletim sistemi kök dizinlerini (data, obb, media) görebilirsiniz.\n\nHerhangi bir sorunuz olursa "help" uçbirim komutuyla kılavuza erişebilirsiniz.\n\nSaygılarımızla,\nArchWeb OS Geliştirici Ekibi`,
    starred: true,
    read: false,
    folder: 'inbox'
  },
  {
    id: '2',
    from: 'github-notifier@git.archweb.org',
    to: 'arch-user@archweb.local',
    subject: '[Yeni Dağıtım] v2.0 Kararlı Sürüm Yayınlandı',
    date: '13 Tem 2026, 09:12',
    body: `Sayın Geliştirici,\n\nArchWeb projenizde yeni v2.0 kararlı sürümü başarıyla yayınlandı. \n\nDeğişiklik Günlüğü (Changelog):\n- Tarayıcı varsayılan olarak Google.com adresine yönlendirildi ve URL arama çubuğu tamamen aktifleştirildi.\n- Dosyalar uygulamasına /home/user/archweb dizini ve data, obb, media alt klasörleri eklendi.\n- E-posta (Email) uygulaması sisteme entegre edildi.\n- Telefonlar için Android Studio derleme ve APK indirme kılavuzu güncellendi.\n\nYeni sürümü test etmek için terminalden 'neofetch' komutunu çalıştırabilirsiniz.\n\nİyi kodlamalar dileriz.`,
    starred: false,
    read: true,
    folder: 'inbox'
  },
  {
    id: '3',
    from: 'security-daemon@archweb.org',
    to: 'arch-user@archweb.local',
    subject: 'Güvenlik Bildirimi: Başarılı Giriş Denemesi',
    date: '12 Tem 2026, 23:58',
    body: `Uyarı: 'arch-user' hesabı ile IP: 192.168.1.100 üzerinden tarayıcı ortamında oturum açıldı.\n\nBu siz değilseniz lütfen hemen sistem şifrenizi veya PIN kodunuzu Ayarlar uygulamasından değiştirin.\n\nDurum: Güvenli\nSistem Duvarı: Devrede`,
    starred: false,
    read: true,
    folder: 'inbox'
  }
];

const SAMPLE_TEMPLATES = [
  {
    from: 'newsletter@kernel.org',
    subject: 'Linux Kernel 6.13 Gelişmeleri Hakkında',
    body: `Selam Linux Sevdalıları,\n\nLinux çekirdeğinin yeni sürüm çalışmaları (v6.13) hızla devam ediyor. Bu sürümde bellek yönetimi, ağ sürücüleri ve dosya sistemi verimliliği konusunda inanılmaz optimizasyonlar yapıldı.\n\nDetaylı kod blokları ve incelemeler için sitemizi takip edin.`
  },
  {
    from: 'hacker-news@ycombinator.com',
    subject: 'Haftalık Teknoloji Özeti: Tarayıcı Teknolojileri',
    body: `Merhaba,\n\nBu haftanın en çok tartışılan konusu, WebAssembly ve tarayıcı içi işletim sistemi simülasyonlarıydı. Özellikle ArchWeb OS projesi, hızı ve sadeliği ile listelerde üst sıralarda yer aldı.\n\nHarika iş çıkaran geliştiricileri tebrik ederiz.`
  },
  {
    from: 'info@archlinux.org',
    subject: 'Arch Linux Yıllık Topluluk Anketi Başladı',
    body: `Değerli Arch Kullanıcısı,\n\nHer yıl düzenlediğimiz topluluk anketine katılarak gelecekteki dağıtım politikalarımızı belirlememize yardımcı olun. Ankete katılım 5 dakikanızı alacaktır.\n\nSadelik felsefemizle kalmanız dileğiyle.`
  }
];

export const EmailApp: React.FC<EmailAppProps> = ({ onClose }) => {
  const [emails, setEmails] = useState<Email[]>(() => {
    const saved = localStorage.getItem('archweb_emails');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_EMAILS; }
    }
    return DEFAULT_EMAILS;
  });

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compose states
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeStatus, setComposeStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('archweb_emails', JSON.stringify(emails));
  }, [emails]);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, starred: !email.starred } : email
    ));
    if (selectedEmail && selectedEmail.id === id) {
      setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    // Mark as read
    if (!email.read) {
      setEmails(prev => prev.map(item => 
        item.id === email.id ? { ...item, read: true } : item
      ));
    }
  };

  const handleDeleteEmail = (email: Email, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (email.folder === 'trash') {
      // Permanent delete
      setEmails(prev => prev.filter(item => item.id !== email.id));
      if (selectedEmail?.id === email.id) setSelectedEmail(null);
    } else {
      // Move to trash
      setEmails(prev => prev.map(item => 
        item.id === email.id ? { ...item, folder: 'trash' } : item
      ));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail(prev => prev ? { ...prev, folder: 'trash' } : null);
      }
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      setComposeStatus('Lütfen tüm alanları doldurun!');
      return;
    }

    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'arch-user@archweb.local',
      to: composeTo,
      subject: composeSubject,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      body: composeBody,
      starred: false,
      read: true,
      folder: 'sent'
    };

    setEmails(prev => [newEmail, ...prev]);
    setComposeStatus('E-posta başarıyla gönderildi!');
    
    setTimeout(() => {
      setIsComposing(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setComposeStatus(null);
    }, 1500);
  };

  const triggerIncomingEmail = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const template = SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)];
      const newEmail: Email = {
        id: Date.now().toString(),
        from: template.from,
        to: 'arch-user@archweb.local',
        subject: template.subject,
        date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        body: template.body,
        starred: false,
        read: false,
        folder: 'inbox'
      };
      setEmails(prev => [newEmail, ...prev]);
      setIsRefreshing(false);
    }, 1200);
  };

  const filteredEmails = emails.filter(email => {
    if (email.folder !== activeFolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.from.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-white/10 text-white font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 mr-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <Mail size={14} className="text-[var(--accent)]" />
          <span className="text-xs font-bold font-mono tracking-wider">ArchWeb E-Posta</span>
        </div>
        <div className="text-[10px] text-white/40 font-mono">arch-user@archweb.local</div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-48 bg-black/25 border-r border-white/5 p-3 flex flex-col gap-1.5 select-none shrink-0">
          <button 
            onClick={() => { setIsComposing(true); setSelectedEmail(null); }}
            className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-[var(--accent)]/10 mb-4"
          >
            <Plus size={14} />
            E-posta Yaz
          </button>

          <div className="text-[9px] font-bold text-white/30 uppercase px-2 mb-1">Klasörler</div>
          
          <button 
            onClick={() => { setActiveFolder('inbox'); setIsComposing(false); }}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${activeFolder === 'inbox' && !isComposing ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold' : 'hover:bg-white/5 text-white/60'}`}
          >
            <div className="flex items-center gap-2">
              <Inbox size={14} />
              <span>Gelen Kutusu</span>
            </div>
            {emails.filter(e => e.folder === 'inbox' && !e.read).length > 0 && (
              <span className="bg-[var(--accent)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {emails.filter(e => e.folder === 'inbox' && !e.read).length}
              </span>
            )}
          </button>

          <button 
            onClick={() => { setActiveFolder('sent'); setIsComposing(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeFolder === 'sent' && !isComposing ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Send size={14} />
            <span>Gönderilenler</span>
          </button>

          <button 
            onClick={() => { setActiveFolder('drafts'); setIsComposing(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeFolder === 'drafts' && !isComposing ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold' : 'hover:bg-white/5 text-white/60'}`}
          >
            <FileText size={14} />
            <span>Taslaklar</span>
          </button>

          <button 
            onClick={() => { setActiveFolder('trash'); setIsComposing(false); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${activeFolder === 'trash' && !isComposing ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-bold' : 'hover:bg-white/5 text-white/60'}`}
          >
            <Trash2 size={14} />
            <span>Çöp Kutusu</span>
          </button>

          <div className="mt-auto border-t border-white/5 pt-3">
            <button 
              onClick={triggerIncomingEmail}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-white/60 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[var(--accent)]' : ''} />
              Yeni Posta Denetle
            </button>
          </div>
        </div>

        {/* Middle/Main Pane Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Email List Pane */}
          {(!selectedEmail && !isComposing) || (selectedEmail || isComposing) ? (
            <div className={`flex flex-col border-r border-white/5 ${selectedEmail || isComposing ? 'w-80 hidden md:flex' : 'flex-1'} bg-black/10 shrink-0 overflow-hidden`}>
              {/* Search Bar */}
              <div className="p-3 border-b border-white/5 bg-black/15 flex items-center gap-2 select-none">
                <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 focus-within:border-[var(--accent)] transition-all">
                  <Search size={13} className="text-white/30" />
                  <input 
                    type="text" 
                    placeholder="E-postaları ara..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-white/20"
                  />
                </div>
              </div>

              {/* Email List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {filteredEmails.length > 0 ? (
                  filteredEmails.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-3 cursor-pointer transition-all flex flex-col gap-1 ${!email.read ? 'bg-[var(--accent)]/5 hover:bg-[var(--accent)]/10' : 'hover:bg-white/5'} ${selectedEmail?.id === email.id ? 'bg-white/5 border-l-2 border-[var(--accent)]' : ''}`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-mono truncate max-w-[140px] ${!email.read ? 'text-[var(--accent)] font-bold' : 'text-white/70'}`}>
                          {email.from.split('@')[0]}
                        </span>
                        <span className="text-[9px] text-white/30 shrink-0">{email.date}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${!email.read ? 'font-bold text-white' : 'text-white/80'}`}>
                          {email.subject}
                        </span>
                        <button 
                          onClick={(e) => toggleStar(email.id, e)} 
                          className={`shrink-0 hover:text-yellow-500 transition-colors ${email.starred ? 'text-yellow-500' : 'text-white/20'}`}
                        >
                          <Star size={12} fill={email.starred ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <p className="text-[10px] text-white/40 truncate leading-relaxed">
                        {email.body.replace(/\n/g, ' ')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-white/20 select-none mt-12">
                    <Mail size={32} strokeWidth={1.5} />
                    <span className="text-xs mt-2">Bulunamadı</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Details / Compose Pane */}
          <div className="flex-1 bg-black/5 flex flex-col overflow-hidden">
            {isComposing ? (
              /* E-posta Yaz / Compose view */
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus size={14} className="text-[var(--accent)]" />
                    Yeni İleti
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="p-1 hover:bg-white/5 rounded text-white/40 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center border-b border-white/5 pb-1.5">
                    <span className="text-xs text-white/40 font-mono w-12 select-none">Kime:</span>
                    <input 
                      type="email" 
                      required
                      placeholder="alici@adres.com"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      className="bg-transparent border-none text-xs text-white outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center border-b border-white/5 pb-1.5">
                    <span className="text-xs text-white/40 font-mono w-12 select-none">Konu:</span>
                    <input 
                      type="text" 
                      required
                      placeholder="E-posta konusu"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="bg-transparent border-none text-xs text-white outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex-1 min-h-[150px] flex flex-col">
                  <textarea 
                    placeholder="Mesajınızı buraya yazın..."
                    required
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs text-white/80 resize-none outline-none leading-relaxed"
                  />
                </div>

                {composeStatus && (
                  <div className={`p-2.5 rounded-lg text-xs text-center border font-mono ${composeStatus.includes('başarıyla') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    {composeStatus}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white/80 transition-colors"
                      title="Dosya Ekle"
                    >
                      <Paperclip size={14} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsComposing(false)}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/70 hover:text-white transition-colors"
                    >
                      İptal
                    </button>
                    <button 
                      type="submit" 
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-[var(--accent)]/10"
                    >
                      <Send size={12} />
                      Gönder
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedEmail ? (
              /* Email Okuma / Reader View */
              <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
                {/* Actions Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 shrink-0 select-none">
                  <button 
                    onClick={() => setSelectedEmail(null)}
                    className="flex items-center gap-1 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <ArrowLeft size={13} />
                    <span>Listeye Dön</span>
                  </button>

                  <div className="flex gap-2.5">
                    <button 
                      onClick={(e) => toggleStar(selectedEmail.id, e)}
                      className={`p-1.5 hover:bg-white/5 rounded transition-all ${selectedEmail.starred ? 'text-yellow-500' : 'text-white/40 hover:text-white'}`}
                      title="Yıldızla"
                    >
                      <Star size={15} fill={selectedEmail.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmail(selectedEmail)}
                      className="p-1.5 hover:bg-white/5 hover:bg-red-500/10 rounded text-white/40 hover:text-red-400 transition-all"
                      title={selectedEmail.folder === 'trash' ? 'Kalıcı Olarak Sil' : 'Sil'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Email Metadata */}
                <div className="space-y-4 mb-6">
                  <h2 className="text-base md:text-lg font-bold text-white leading-snug">
                    {selectedEmail.subject}
                  </h2>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <User size={16} className="text-white/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono block truncate">{selectedEmail.from}</span>
                        <span className="text-[10px] text-white/30 shrink-0 font-mono flex items-center gap-1">
                          <Clock size={10} />
                          {selectedEmail.date}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-mono block truncate">Kime: {selectedEmail.to}</span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 text-xs text-white/80 whitespace-pre-line leading-relaxed border-t border-white/5 pt-5">
                  {selectedEmail.body}
                </div>

                {/* Quick Reply Trigger */}
                <div className="mt-8 pt-5 border-t border-white/5 select-none shrink-0">
                  <button 
                    onClick={() => {
                      setComposeTo(selectedEmail.from);
                      setComposeSubject(selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
                      setComposeBody(`\n\n--- ${selectedEmail.date} tarihinde ${selectedEmail.from} yazdı ---\n> ${selectedEmail.body.replace(/\n/g, '\n> ')}`);
                      setIsComposing(true);
                      setSelectedEmail(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg border border-white/5 text-white/70 hover:text-white transition-all"
                  >
                    <Send size={12} className="rotate-0 text-[var(--accent)]" />
                    <span>Yanıtla</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Boş Ekran / Empty view */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/10 select-none">
                <Mail size={48} strokeWidth={1} className="text-white/10" />
                <span className="text-xs mt-3 max-w-xs leading-relaxed">
                  Görüntülemek için soldaki listeden bir e-posta seçin veya yeni bir ileti oluşturun.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
