import React, { useState } from 'react';
import { X, Folder, File, ChevronLeft, HardDrive, Home, Download, Music, Image as ImageIcon, Video, ArrowLeft, Terminal, Cpu } from 'lucide-react';

interface FileManagerProps {
  onClose: () => void;
  onOpenFile?: (name: string, content: string) => void;
  category?: 'education' | 'gaming' | 'creativity' | 'science';
  gmailUser?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose, onOpenFile, category, gmailUser }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  
  const rootFolders = [
    { name: 'Masaüstü', icon: Home },
    { name: 'Belgeler', icon: Folder },
    { name: 'İndirilenler', icon: Download },
    { name: 'Müzik', icon: Music },
    { name: 'Resimler', icon: ImageIcon },
    { name: 'Videolar', icon: Video },
  ];

  const allFiles: Record<string, { name: string, size: string, content: string }[]> = {
    '/home/user': [
      { name: 'yapılandırma.json', size: '1.2 KB', content: '{\n  "tema": "koyu",\n  "vurgu": "arch-mavisi",\n  "sürüm": "2.0.0"\n}' },
      { name: 'notlar.txt', size: '456 B', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.' },
      { name: 'betik.sh', size: '2.1 KB', content: '#!/bin/bash\n\necho "Arch Linux\'tan Merhaba!"\nsudo pacman -Syu' },
    ],
    '/home/user/Belgeler': [
      { name: 'özgeçmiş.pdf', size: '156 KB', content: 'Simüle edilmiş PDF içeriği...' },
      { name: 'şifreler.txt', size: '12 B', content: '123456' },
    ],
    '/home/user/Masaüstü': [
      { name: 'notlar.txt', size: '456 B', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.' },
    ],
    '/home/user/archweb': [
      { name: 'uygulamayi_ac.sh', size: '1.2 KB', content: '#!/bin/bash\n# ArchWeb OS Uygulama Başlatıcı\n\necho "Başlatıcı yükleniyor..."\nsleep 1\necho "Modüller yükleniyor..."\n/usr/bin/archweb-launcher --open' },
      { name: 'baslat.desktop', size: '340 B', content: '[Desktop Entry]\nType=Application\nName=ArchWeb OS Başlatıcı\nComment=Sistemi ve uygulamaları yönetir\nExec=uygulamayi_ac.sh\nIcon=utilities-terminal\nTerminal=true\nCategories=System;Utility;' },
      { name: 'archweb_launcher.exe', size: '5.4 MB', content: '[ArchWeb Windows Executable Engine]\n-- Simulated binary wrapper for launching ArchWeb OS Desktop on Windows hosts.\n-- Embedded node-webkit/electron runner.\n-- Double-click to execute and initialize environment.' },
      { name: 'system.conf', size: '2.4 KB', content: '# ArchWeb OS System Configuration\nSYS_VERSION=2.0\nKERNEL=6.12.0-arch1-1\nUI_MODE=desktop\nACCENT_COLOR=#1793d1\nFIREWALL=active\nAUTO_UPDATE=true\nSECURITY_PATCH=2026-07\nOS_ROOT_TYPE=vfs\nDEBUG_LEVEL=3' },
      { name: 'grub.cfg', size: '1.8 KB', content: '# GRUB Bootloader Configuration\nset default="0"\nset timeout=5\n\nmenuentry "ArchWeb OS v2.0 (Kernel 6.12.0-arch1-1)" --class arch {\n    load_video\n    set gfxpayload=keep\n    insmod gzio\n    insmod part_gpt\n    insmod ext2\n    search --no-floppy --fs-uuid --set=root 1410f2d4-34ad-4d08\n    linux /boot/vmlinuz-linux root=UUID=1410f2d4-34ad-4d08 rw quiet\n    initrd /boot/initramfs-linux.img\n}' },
      { name: 'fstab', size: '512 B', content: '# /etc/fstab: static file system information.\n# <file system>             <mount point>  <type>  <options>  <dump>  <pass>\nUUID=1410f2d4-34ad-4d08     /              ext4    defaults,noatime 0 1\nUUID=A8C2-F312             /boot          vfat    defaults,fmask=0077,dmask=0077 0 2\n/dev/vda3                   none           swap    defaults   0 0' }
    ],
    '/home/user/archweb/data': [
      { name: 'system.db', size: '320 KB', content: '[SQLite Database Document]\n-- Contains local settings, package configurations, system user registries and session states.' },
      { name: 'user_profiles.dat', size: '42 KB', content: '[Binary Data]\n-- User custom profiles, desktop layout, wallpaper choice and color scheme configs.' },
      { name: 'hosts', size: '210 B', content: '127.0.0.1   localhost\n::1         localhost\n127.0.1.1   archweb.localdomain archweb' },
      { name: 'sound_settings.conf', size: '150 B', content: '# ArchWeb OS Audio Configuration\nSYSTEM_VOLUME=80\nMUTE=false\nSTARTUP_SOUND=true\nAUDIO_ENGINE=WebAudioSynth' },
      { name: 'windows11_startup.mp3', size: '1.2 MB', content: '[Audio Binary Buffer]\n-- Decoded 44.1kHz Stereo buffer containing high-fidelity Windows 11 boot sequence.' }
    ],
    '/home/user/archweb/obb': [
      { name: 'main.1020.com.archweb.os.obb', size: '1.4 GB', content: '[Android Expansion File]\n-- Contains high-definition system graphics, compiled icon packages, desktop window sound effects and desktop engine cache assets.' },
      { name: 'patch.1020.com.archweb.os.obb', size: '82 MB', content: '[Android Patch Expansion File]\n-- Cumulative patches for ArchWeb Mobile v2.0 performance improvement and hotfixes.' }
    ],
    '/home/user/archweb/media': [
      { name: 'startup.wav', size: '2.3 MB', content: '[RIFF WAVE Audio File]\n-- Plays on boot. Cyberpunk / Sci-fi synth chime.' },
      { name: 'wallpaper.png', size: '4.7 MB', content: '[PNG Image File]\n-- Default High-Res background wallpaper of ArchWeb OS.' },
      { name: 'notification.ogg', size: '420 KB', content: '[Ogg Vorbis Audio File]\n-- Soft mechanical click sound for desktop notifications.' }
    ]
  };

  const subFolders: Record<string, { name: string }[]> = {
    '/home/user': [
      ...rootFolders,
      { name: 'archweb' }
    ],
    '/home/user/Belgeler': [
      { name: 'İş' },
      { name: 'Kişisel' }
    ],
    '/home/user/archweb': [
      { name: 'data' },
      { name: 'obb' },
      { name: 'media' }
    ],
    '/home/user/archweb/data': [],
    '/home/user/archweb/obb': [],
    '/home/user/archweb/media': []
  };

  // Dynamically inject custom child files if category is selected
  if (category) {
    if (!subFolders['/home/user'].some(f => f.name === 'Çocuk Dünyası')) {
      subFolders['/home/user'].push({ name: 'Çocuk Dünyası' });
    }

    let kidFiles: { name: string, size: string, content: string }[] = [];
    if (category === 'education') {
      kidFiles = [
        { name: 'günlük_programım.txt', size: '220 B', content: 'Sevgili Kâşif,\n\nİşte senin için harika bir günlük ders programı:\n\n- 09:00 - Kitap Okuma\n- 10:30 - Matematik Soruları\n- 14:00 - Doğa Keşfi\n- 16:00 - Bilim Robotu ile Sohbet!' },
        { name: 'matematik_notları.txt', size: '180 B', content: 'Matematik Notlarım:\n\nToplama (+), Çıkarma (-) ve Çarpma (*) işlemleri zihnini geliştirir! Çocuk Dünyası uygulamasında pratik yapıp yıldız kazanabilirsin.' }
      ];
    } else if (category === 'gaming') {
      kidFiles = [
        { name: 'oyun_taktikleri.txt', size: '150 B', content: 'Yılan Oyunu Taktikleri:\n\n- Yılan hızlandıkça sakin ol!\n- Elmaları toplarken duvarlara çarpmamaya dikkat et!\n- Kuyruğuna çarpmamak için geniş dönüşler yap.' },
        { name: 'skor_rekorları.txt', size: '120 B', content: 'En Yüksek Skor Listesi:\n\n1. Süper Kâşif - 350 Puan ⭐\n2. Bilim Robotu - 280 Puan\n3. Şirin Panda - 150 Puan' }
      ];
    } else if (category === 'creativity') {
      kidFiles = [
        { name: 'resim_fikirleri.txt', size: '200 B', content: 'Sihirli Tuval Fikirlerim:\n\n- Uzayda uçan pembe bir fil 🐘\n- Denizlerin altındaki sihirli şato 🏰\n- Gökkuşağında kayan sevimli bir kedi 🐱' },
        { name: 'masal_notu.txt', size: '160 B', content: 'Bir varmış bir yokmuş... Gökyüzündeki pofuduk bulutların üzerinde yaşayan küçük, sihirli bir tilki varmış. Bu tilki her gece yıldızları sayarmış...' }
      ];
    } else if (category === 'science') {
      kidFiles = [
        { name: 'uzay_bilgileri.txt', size: '280 B', content: 'Bilinmeyen Uzay Bilgileri:\n\n- Güneş Sistemi\'nin en büyük gezegeni Jüpiter\'dir.\n- Mars kızıl renktedir çünkü yüzeyi paslı demir tozlarıyla kaplıdır.\n- Satürn sudan daha hafiftir! Devasa bir su havuzu olsa üzerinde yüzerdi!' },
        { name: 'robot_notu.txt', size: '130 B', content: 'Yapay Zeka Bilim Robotu ile sohbet ederken dilediğin her şeyi sorabilirsin. Bilim ve dinozor sorularını çok sever!' }
      ];
    }
    allFiles['/home/user/Çocuk Dünyası'] = kidFiles;
    subFolders['/home/user/Çocuk Dünyası'] = [];
  }

  const currentFiles = allFiles[currentPath] || [];
  const currentFolders = subFolders[currentPath] || [];

  const handleBack = () => {
    if (currentPath === '/home/user') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-white/10 text-white/80 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <button 
            onClick={handleBack}
            disabled={currentPath === '/home/user'}
            className={`p-1 rounded-md transition-colors ${currentPath === '/home/user' ? 'text-white/10 cursor-not-allowed' : 'hover:bg-white/10 text-white/60'}`}
          >
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="flex-1 mx-4 flex items-center gap-2 bg-black/20 rounded-md px-3 py-1 border border-white/5 text-xs">
          <HardDrive size={12} className="text-white/40" />
          <span className="truncate">{currentPath}</span>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-40 bg-black/20 border-r border-white/5 p-2 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-white/30 uppercase px-2 mb-1">Yerler</div>
          {rootFolders.map((folder) => (
            <button 
              key={folder.name}
              onClick={() => setCurrentPath(`/home/user/${folder.name}`)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${currentPath.includes(folder.name) ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-white/60'}`}
            >
              <Folder size={14} className={currentPath.includes(folder.name) ? 'text-[var(--accent)]' : 'text-white/40'} />
              {folder.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start">
          {currentFolders.map((folder) => (
            <div 
              key={folder.name} 
              onClick={() => setCurrentPath(`${currentPath}/${folder.name}`)}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
            >
              <div className="w-12 h-12 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                <Folder size={40} fill="currentColor" fillOpacity={0.1} />
              </div>
              <span className="text-[11px] text-center truncate w-full">{folder.name}</span>
            </div>
          ))}
          {currentFiles.map((file) => {
            const isExecutable = file.name.endsWith('.sh') || file.name.endsWith('.desktop') || file.name.endsWith('.exe');
            const isExe = file.name.endsWith('.exe');
            return (
              <div 
                key={file.name} 
                onClick={() => onOpenFile?.(file.name, file.content)}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
              >
                <div className={`w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform ${isExecutable ? (isExe ? 'text-amber-400' : 'text-emerald-400') : 'text-white/40'}`}>
                  {isExe ? (
                    <Cpu size={36} />
                  ) : isExecutable ? (
                    <Terminal size={36} />
                  ) : (
                    <File size={36} />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] text-center truncate w-full ${isExecutable ? 'font-bold text-white' : ''}`}>{file.name}</span>
                  <span className="text-[9px] text-white/20">{file.size}</span>
                </div>
              </div>
            );
          })}
          {currentFolders.length === 0 && currentFiles.length === 0 && (
            <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 pt-12">
              <Folder size={48} />
              <span className="text-xs mt-2">Bu klasör boş</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1 bg-white/5 border-t border-white/10 text-[10px] text-white/30 flex justify-between">
        <span>{currentFolders.length + currentFiles.length} öğe</span>
        <span>Kullanılabilir alan: 124.5 GB</span>
      </div>
    </div>
  );
};

