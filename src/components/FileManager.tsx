import React, { useState } from 'react';
import { X, Folder, File, ChevronLeft, HardDrive, Home, Download, Music, Image as ImageIcon, Video, ArrowLeft } from 'lucide-react';

interface FileManagerProps {
  onClose: () => void;
  onOpenFile?: (name: string, content: string) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose, onOpenFile }) => {
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
      { name: 'yapılandırma.json', size: '1.2 KB', content: '{\n  "tema": "koyu",\n  "vurgu": "arch-mavisi",\n  "sürüm": "1.0.0"\n}' },
      { name: 'notlar.txt', size: '456 B', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.' },
      { name: 'betik.sh', size: '2.1 KB', content: '#!/bin/bash\n\necho "Arch Linux\'tan Merhaba!"\nsudo pacman -Syu' },
    ],
    '/home/user/Belgeler': [
      { name: 'özgeçmiş.pdf', size: '156 KB', content: 'Simüle edilmiş PDF içeriği...' },
      { name: 'şifreler.txt', size: '12 B', content: '123456' },
    ],
    '/home/user/Masaüstü': [
      { name: 'notlar.txt', size: '456 B', content: 'ArchWeb OS\'e Hoş Geldiniz!\n\nBu, Arch Linux ortamının tamamen işlevsel bir web simülasyonudur.' },
    ]
  };

  const subFolders: Record<string, { name: string }[]> = {
    '/home/user': rootFolders,
    '/home/user/Belgeler': [
      { name: 'İş' },
      { name: 'Kişisel' }
    ]
  };

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
          {currentFiles.map((file) => (
            <div 
              key={file.name} 
              onClick={() => onOpenFile?.(file.name, file.content)}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group"
            >
              <div className="w-12 h-12 flex items-center justify-center text-white/40 group-hover:scale-110 transition-transform">
                <File size={36} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] text-center truncate w-full">{file.name}</span>
                <span className="text-[9px] text-white/20">{file.size}</span>
              </div>
            </div>
          ))}
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

