import React, { useState, useEffect } from 'react';
import { X, Folder, File, ChevronLeft, HardDrive, Home, Download, Music, Image as ImageIcon, Video, ArrowLeft, Terminal, Cpu, Trash2, Plus, FolderPlus, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { getOfflineFilesState, saveOfflineFilesState, saveOfflineFile, createOfflineFolder, deleteOfflineItem } from '../utils/localFileSystem';

interface FileManagerProps {
  onClose: () => void;
  onOpenFile?: (name: string, content: string, path: string) => void;
  category?: 'education' | 'gaming' | 'creativity' | 'science';
  gmailUser?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose, onOpenFile, category, gmailUser }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [allFiles, setAllFiles] = useState<Record<string, { name: string, size: string, content: string }[]>>({});
  const [subFolders, setSubFolders] = useState<Record<string, { name: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(true);
  
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const rootFolders = [
    { name: 'Masaüstü', icon: Home },
    { name: 'Belgeler', icon: Folder },
    { name: 'İndirilenler', icon: Download },
    { name: 'Müzik', icon: Music },
    { name: 'Resimler', icon: ImageIcon },
    { name: 'Videolar', icon: Video },
    { name: 'Çocuk Dünyası', icon: Folder }
  ];

  // Fetch files and folders from the server API with dual fallback
  const fetchFiles = async () => {
    setLoading(true);
    let success = false;
    try {
      const response = await fetch(getApiUrl('/api/files'));
      if (response.ok) {
        const data = await response.json();
        const files = data.allFiles || {};
        const folders = data.subFolders || {};
        setAllFiles(files);
        setSubFolders(folders);
        saveOfflineFilesState({ allFiles: files, subFolders: folders });
        setIsServerOnline(true);
        success = true;
      }
    } catch (err) {
      console.warn("Local network server connection silent handling:", err);
    } finally {
      if (!success) {
        // Fallback to offline local files
        const offlineState = getOfflineFilesState();
        setAllFiles(offlineState.allFiles || {});
        setSubFolders(offlineState.subFolders || {});
        setIsServerOnline(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();

    const handleRefresh = () => {
      fetchFiles();
    };
    window.addEventListener('file_saved_refresh', handleRefresh);
    return () => window.removeEventListener('file_saved_refresh', handleRefresh);
  }, []);

  const handleBack = () => {
    if (currentPath === '/home/user') return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    // Add default .txt extension if not provided
    let fileName = newItemName.trim();
    if (!fileName.includes('.')) {
      fileName += '.txt';
    }

    const virtualPath = `${currentPath}/${fileName}`;
    
    // Optimistically update offline local state
    saveOfflineFile(virtualPath, '');

    try {
      await fetch(getApiUrl('/api/files'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualPath, content: '' })
      });
    } catch (err) {
      console.warn("Local network server connection silent handling:", err);
    }

    setNewItemName('');
    setShowNewFileInput(false);
    fetchFiles();
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const virtualPath = `${currentPath}/${newItemName.trim()}`;
    
    // Optimistically update offline local state
    createOfflineFolder(virtualPath);

    try {
      await fetch(getApiUrl('/api/folders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualPath })
      });
    } catch (err) {
      console.warn("Local network server connection silent handling:", err);
    }

    setNewItemName('');
    setShowNewFolderInput(false);
    fetchFiles();
  };

  const handleDelete = async (virtualPath: string) => {
    // Optimistically update offline local state
    deleteOfflineItem(virtualPath);

    try {
      await fetch(getApiUrl('/api/files'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ virtualPath })
      });
    } catch (err) {
      console.warn("Local network server connection silent handling:", err);
    }

    fetchFiles();
  };

  const currentFiles = allFiles[currentPath] || [];
  const currentFolders = subFolders[currentPath] || [];

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] rounded-lg overflow-hidden shadow-2xl border border-white/10 text-white/80 font-sans select-none">
      {/* Header / Title Bar */}
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

        {/* Path Breadcrumb */}
        <div className="flex-1 mx-4 flex items-center gap-2 bg-black/20 rounded-md px-3 py-1 border border-white/5 text-xs">
          <HardDrive size={12} className="text-white/40" />
          <span className="truncate font-mono">{currentPath}</span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={fetchFiles}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Yenile"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
          <button 
            onClick={() => {
              setShowNewFolderInput(false);
              setShowNewFileInput(prev => !prev);
              setNewItemName('');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/5 transition-colors"
            title="Yeni Metin Dosyası"
          >
            <Plus size={12} />
            <span className="hidden sm:inline">Yeni Dosya</span>
          </button>
          <button 
            onClick={() => {
              setShowNewFileInput(false);
              setShowNewFolderInput(prev => !prev);
              setNewItemName('');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/5 transition-colors"
            title="Yeni Klasör"
          >
            <FolderPlus size={12} />
            <span className="hidden sm:inline">Yeni Klasör</span>
          </button>
        </div>
      </div>

      {/* Inline Forms for Creating Items */}
      {showNewFileInput && (
        <form onSubmit={handleCreateFile} className="flex gap-2 p-2 bg-black/30 border-b border-white/5 items-center">
          <File size={14} className="text-[var(--accent)]" />
          <input 
            type="text" 
            placeholder="Dosya adı yazın (örn: gunluk.txt)..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          <button type="submit" className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded hover:bg-[var(--accent)]/80 transition-colors">Oluştur</button>
          <button type="button" onClick={() => setShowNewFileInput(false)} className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded hover:bg-white/20 transition-colors">İptal</button>
        </form>
      )}

      {showNewFolderInput && (
        <form onSubmit={handleCreateFolder} className="flex gap-2 p-2 bg-black/30 border-b border-white/5 items-center">
          <Folder size={14} className="text-[var(--accent)]" />
          <input 
            type="text" 
            placeholder="Klasör adı yazın..." 
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 outline-none focus:border-[var(--accent)]"
            autoFocus
          />
          <button type="submit" className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded hover:bg-[var(--accent)]/80 transition-colors">Oluştur</button>
          <button type="button" onClick={() => setShowNewFolderInput(false)} className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded hover:bg-white/20 transition-colors">İptal</button>
        </form>
      )}

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Quick Access Places) */}
        <div className="w-40 bg-black/20 border-r border-white/5 p-2 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-white/30 uppercase px-2 mb-1">Hızlı Erişim</div>
          {rootFolders.map((folder) => {
            const isSelected = currentPath === `/home/user/${folder.name}`;
            return (
              <button 
                key={folder.name}
                onClick={() => setCurrentPath(`/home/user/${folder.name}`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${isSelected ? 'bg-[var(--accent)]/20 text-[var(--accent)] font-medium' : 'hover:bg-white/5 text-white/60'}`}
              >
                <folder.icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'text-white/40'} />
                <span className="truncate">{folder.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Explorer Area */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-start">
          {loading ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center py-20 gap-3 opacity-55">
              <RefreshCw size={24} className="animate-spin text-[var(--accent)]" />
              <span className="text-xs">Dosyalar sunucudan yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* Folders */}
              {currentFolders.map((folder) => (
                <div 
                  key={folder.name} 
                  onClick={() => setCurrentPath(`${currentPath}/${folder.name}`)}
                  className="flex flex-col items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group relative"
                >
                  <div className="w-12 h-12 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform">
                    <Folder size={40} fill="currentColor" fillOpacity={0.15} />
                  </div>
                  <span className="text-[11px] text-center truncate w-full" title={folder.name}>{folder.name}</span>

                  {/* Delete folder on hover */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(`${currentPath}/${folder.name}`);
                    }}
                    className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Klasörü Sil"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}

              {/* Files */}
              {currentFiles.map((file) => {
                const isExecutable = file.name.endsWith('.sh') || file.name.endsWith('.desktop') || file.name.endsWith('.exe') || file.name.endsWith('.bat');
                const isExe = file.name.endsWith('.exe');
                const isBat = file.name.endsWith('.bat');
                return (
                  <div 
                    key={file.name} 
                    onClick={() => onOpenFile?.(file.name, file.content, `${currentPath}/${file.name}`)}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group relative"
                  >
                    <div className={`w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform ${isExecutable ? (isExe ? 'text-amber-400' : isBat ? 'text-blue-400' : 'text-emerald-400') : 'text-white/40'}`}>
                      {isExe ? (
                        <Cpu size={36} />
                      ) : (isExecutable || isBat) ? (
                        <Terminal size={36} />
                      ) : (
                        <File size={36} />
                      )}
                    </div>
                    <div className="flex flex-col items-center w-full min-w-0">
                      <span className={`text-[11px] text-center truncate w-full ${isExecutable ? 'font-bold text-white' : 'text-white/80'}`} title={file.name}>{file.name}</span>
                      <span className="text-[9px] text-white/30">{file.size}</span>
                    </div>

                    {/* Delete file on hover */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(`${currentPath}/${file.name}`);
                      }}
                      className="absolute top-1 right-1 p-1 rounded bg-black/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dosyayı Sil"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}

              {currentFolders.length === 0 && currentFiles.length === 0 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center opacity-20 py-20">
                  <Folder size={48} />
                  <span className="text-xs mt-2">Bu klasör boş</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 bg-white/5 border-t border-white/10 text-[10px] text-white/40 flex justify-between items-center">
        <span>{currentFolders.length + currentFiles.length} öğe listeleniyor</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isServerOnline ? 'Yerel Sunucu Bağlantısı Aktif' : 'Tarayıcı Yerel Mod (Sunucu Çevrimdışı)'}</span>
        </div>
      </div>
    </div>
  );
};
