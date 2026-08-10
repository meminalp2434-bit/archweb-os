import React, { useState, useEffect, useRef } from 'react';
import { X, Folder, File, ChevronLeft, HardDrive, Home, Download, Music, Image as ImageIcon, Video, ArrowLeft, Terminal, Cpu, Trash2, Plus, FolderPlus, RefreshCw, Upload, FolderInput, Check, Smartphone, Laptop, FileUp, Move } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { initAuth, googleSignIn, logout, syncToDrive } from "../utils/driveFileSystem";
import { getOfflineFilesState, saveOfflineFilesState, saveOfflineFile, createOfflineFolder, deleteOfflineItem, moveOfflineItem, getAllOfflineDirectories } from '../utils/localFileSystem';

interface FileManagerProps {
  onClose: () => void;
  onOpenFile?: (name: string, content: string, path: string) => void;
  onOpenMediaPlayer?: (name: string, content: string) => void;
  onOpenExecutable?: (name: string, content: string) => void;
  category?: 'education' | 'gaming' | 'creativity' | 'science';
  gmailUser?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose, onOpenFile, onOpenMediaPlayer, onOpenExecutable, category, gmailUser }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [isMaximized, setIsMaximized] = useState(false);
  const [allFiles, setAllFiles] = useState<Record<string, { name: string, size: string, content: string }[]>>({});
  const [subFolders, setSubFolders] = useState<Record<string, { name: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [driveSyncSuccess, setDriveSyncSuccess] = useState(false);
  useEffect(() => {
    const unsubscribe = initAuth((user, token) => setDriveToken(token), () => setDriveToken(null));
    return () => unsubscribe();
  }, []);

  
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // Move Modal State
  const [itemToMove, setItemToMove] = useState<{ name: string; isFolder: boolean; virtualPath: string } | null>(null);
  const [selectedDestDir, setSelectedDestDir] = useState<string>('/home/user/Masaüstü');

  // Drag & Drop / Upload State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rootFolders = [
    { name: 'Masaüstü', icon: Home, path: '/home/user/Masaüstü' },
    { name: 'Belgeler', icon: Folder, path: '/home/user/Belgeler' },
    { name: 'İndirilenler', icon: Download, path: '/home/user/İndirilenler' },
    { name: 'Müzik', icon: Music, path: '/home/user/Müzik' },
    { name: 'Resimler', icon: ImageIcon, path: '/home/user/Resimler' },
    { name: 'Videolar', icon: Video, path: '/home/user/Videolar' },
    { name: 'Çocuk Dünyası', icon: Folder, path: '/home/user/Çocuk Dünyası' }
  ];

  // Fetch files and folders
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
    setCurrentPath(parts.join('/') || '/home/user');
  };

  const notifyRefresh = () => {
    window.dispatchEvent(new Event('file_saved_refresh'));
  };

  // Create text file
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    let fileName = newItemName.trim();
    if (!fileName.includes('.')) {
      fileName += '.txt';
    }

    const virtualPath = `${currentPath}/${fileName}`;
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
    notifyRefresh();
    fetchFiles();
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const virtualPath = `${currentPath}/${newItemName.trim()}`;
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
    notifyRefresh();
    fetchFiles();
  };

  // Delete Item
  const handleDelete = async (virtualPath: string) => {
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

    notifyRefresh();
    fetchFiles();
  };

  // Move Item to Target Folder
  const handleMoveItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToMove || !selectedDestDir) return;

    const success = moveOfflineItem(itemToMove.virtualPath, selectedDestDir);

    try {
      await fetch(getApiUrl('/api/files/move'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePath: itemToMove.virtualPath,
          destDirPath: selectedDestDir
        })
      });
    } catch (err) {
      console.warn("Server move API silent fallback:", err);
    }

    if (success) {
      setUploadToast(`"${itemToMove.name}" ${selectedDestDir === '/home/user/Masaüstü' ? 'Masaüstüne' : selectedDestDir} klasörüne taşındı.`);
      setTimeout(() => setUploadToast(null), 3000);
    }

    setItemToMove(null);
    notifyRefresh();
    fetchFiles();
  };

  // Export / Download file to user's real PC or phone
  const handleDownloadToRealDevice = (fileName: string, content: string) => {
    let downloadUrl = '';
    let shouldRevoke = false;

    if (content.startsWith('data:')) {
      downloadUrl = content;
    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      downloadUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

    setUploadToast(`"${fileName}" gerçek cihazınıza indiriliyor...`);
    setTimeout(() => setUploadToast(null), 3000);
  };

  // Process uploaded files from PC or Mobile device
  const processUploadedFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    let completedCount = 0;

    fileList.forEach((file) => {
      const reader = new FileReader();

      // Determine size string
      let sizeStr = `${file.size} B`;
      if (file.size >= 1024 * 1024) {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      } else if (file.size >= 1024) {
        sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      }

      const isText = file.type.startsWith('text/') || 
                     file.name.endsWith('.txt') || 
                     file.name.endsWith('.json') || 
                     file.name.endsWith('.sh') || 
                     file.name.endsWith('.bat') || 
                     file.name.endsWith('.md') || 
                     file.name.endsWith('.js') || 
                     file.name.endsWith('.ts') || 
                     file.name.endsWith('.html') || 
                     file.name.endsWith('.css') ||
                     file.name.endsWith('.xml') ||
                     file.name.endsWith('.py');

      reader.onload = async (event) => {
        const fileContent = (event.target?.result as string) || '';
        const virtualPath = `${currentPath}/${file.name}`;

        // Save locally in offline state
        saveOfflineFile(virtualPath, fileContent);

        // Save to backend server if online
        try {
          await fetch(getApiUrl('/api/files'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ virtualPath, content: fileContent })
          });
        } catch (err) {
          console.warn("Server file upload silent fallback:", err);
        }

        completedCount++;
        if (completedCount === fileList.length) {
          setUploadToast(`${fileList.length} dosya ArchWeb OS sistemine yüklendi!`);
          setTimeout(() => setUploadToast(null), 3500);
          notifyRefresh();
          fetchFiles();
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const currentFiles = allFiles[currentPath] || [];
  const currentFolders = subFolders[currentPath] || [];
  const availableDirs = getAllOfflineDirectories();

  return (
    <div className={`flex flex-col bg-[#1a1a1a] overflow-hidden shadow-2xl border border-white/10 text-white/80 font-sans select-none transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-[100] rounded-none' : 'h-full w-full rounded-lg'}`}>
      {/* Hidden File Input for uploading from PC or Phone */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        className="hidden" 
      />

      {/* Header / Title Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center text-[8px] text-red-900 font-bold group"
              title="Kapat"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
            </button>
            <button 
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-yellow-900 font-bold group"
              title="Küçült"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">−</span>
            </button>
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-3 h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors cursor-pointer flex items-center justify-center text-[8px] text-green-900 font-bold group"
              title={isMaximized ? "Küçült" : "Ekranı Kapla"}
            >
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">{isMaximized ? '❐' : '+'}</span>
            </button>
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
        <div className="flex-1 mx-2 sm:mx-4 flex items-center gap-2 bg-black/20 rounded-md px-3 py-1 border border-white/5 text-xs overflow-hidden">
          <HardDrive size={12} className="text-white/40 shrink-0" />
          <span className="truncate font-mono text-[11px] sm:text-xs">{currentPath}</span>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Transfer File from Phone/PC Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs border border-sky-500/30 font-semibold transition-all shadow-[0_0_10px_rgba(14,165,233,0.15)]"
            title="Telefondan veya bilgisayardan dosyayı sisteme indirir/aktarır"
          >
            <Smartphone size={13} className="text-sky-400" />
            <span className="hidden sm:inline">Dosya İndir (Telefondan)</span>
          </button>

          {/* Export System File to PC/Phone Button */}
          <button 
            onClick={() => {
              if (currentFiles.length === 0) {
                setUploadToast("Sistemde yüklenecek/indirilecek dosya bulunamadı.");
                setTimeout(() => setUploadToast(null), 3000);
                return;
              }
              const firstFile = currentFiles[0];
              handleDownloadToRealDevice(firstFile.name, firstFile.content);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs border border-emerald-500/30 font-semibold transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            title="Sistemdeki dosyayı PC veya telefonunuza yükler/indirir"
          >
            <Download size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">Dosyayı Yükle (Cihaza)</span>
          </button>

          {/* Google Drive Sync Button */}
          <button
            onClick={async () => {
              if (!driveToken) {
                try {
                  await googleSignIn();
                } catch (e) {
                  console.error(e);
                }
                return;
              }
              setIsSyncingDrive(true);
              try {
                await syncToDrive();
                setDriveSyncSuccess(true);
                setTimeout(() => setDriveSyncSuccess(false), 3000);
              } catch(e) {
                console.error(e);
              } finally {
                setIsSyncingDrive(false);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold transition-all shadow-[0_0_10px_rgba(255,255,255,0.15)] ${
              !driveToken ? "bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border-gray-500/30" :
              driveSyncSuccess ? "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30" :
              "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30"
            }`}
            title="Google Drive ile Eşitle (archweb operating system)"
          >
            {isSyncingDrive ? <RefreshCw size={13} className="animate-spin" /> : <HardDrive size={13} />}
            <span className="hidden sm:inline">{driveSyncSuccess ? "Eşitlendi!" : !driveToken ? "Drive Bağlan" : "Drive Eşitle"}</span>
          </button>

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
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/5 transition-colors"
            title="Yeni Metin Dosyası"
          >
            <Plus size={12} />
            <span className="hidden md:inline">Yeni Dosya</span>
          </button>

          <button 
            onClick={() => {
              setShowNewFileInput(false);
              setShowNewFolderInput(prev => !prev);
              setNewItemName('');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/5 transition-colors"
            title="Yeni Klasör"
          >
            <FolderPlus size={12} />
            <span className="hidden md:inline">Yeni Klasör</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {uploadToast && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 px-4 py-1.5 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-emerald-400" />
            <span>{uploadToast}</span>
          </div>
          <button onClick={() => setUploadToast(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Inline Forms for Creating Items */}
      {showNewFileInput && (
        <form onSubmit={handleCreateFile} className="flex gap-2 p-2 bg-black/30 border-b border-white/5 items-center">
          <File size={14} className="text-[var(--accent)] shrink-0" />
          <input 
            type="text" 
            placeholder="Dosya adı yazın (örn: notlar.txt)..." 
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
          <Folder size={14} className="text-[var(--accent)] shrink-0" />
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
      <div 
        className="flex flex-1 overflow-hidden relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 bg-sky-900/80 backdrop-blur-sm border-2 border-dashed border-sky-400 flex flex-col items-center justify-center gap-3 text-white">
            <FileUp size={48} className="text-sky-300 animate-bounce" />
            <span className="font-bold text-lg">Dosyaları Buraya Bırakın</span>
            <span className="text-xs text-sky-200">{currentPath} klasörüne aktarılacak</span>
          </div>
        )}

        {/* Left Sidebar (Quick Access Places) */}
        <div className="w-36 sm:w-44 bg-black/20 border-r border-white/5 p-2 flex flex-col gap-1 shrink-0 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/30 uppercase px-2 mb-1">Hızlı Erişim</div>
          {rootFolders.map((folder) => {
            const isSelected = currentPath === folder.path;
            return (
              <button 
                key={folder.name}
                onClick={() => setCurrentPath(folder.path)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${isSelected ? 'bg-[var(--accent)]/20 text-[var(--accent)] font-medium' : 'hover:bg-white/5 text-white/60'}`}
              >
                <folder.icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'text-white/40'} />
                <span className="truncate">{folder.name}</span>
              </button>
            );
          })}

          <div className="mt-auto pt-3 border-t border-white/5 flex flex-col gap-1.5 text-[10px] text-white/40 px-1">
            <div className="flex items-center gap-1 text-sky-400 font-semibold">
              <Laptop size={12} />
              <span>Cihaz Senkronizasyonu</span>
            </div>
            <p className="leading-tight text-[9px] text-white/30">
              Telefon ve PC'den dosya sürükleyip bırakabilir veya indirebilirsiniz.
            </p>
          </div>
        </div>

        {/* Content Explorer Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 content-start">
          {loading ? (
            <div className="col-span-full h-full flex flex-col items-center justify-center py-20 gap-3 opacity-55">
              <RefreshCw size={24} className="animate-spin text-[var(--accent)]" />
              <span className="text-xs">Dosyalar yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* Folders */}
              {currentFolders.map((folder) => {
                const folderVirtualPath = `${currentPath}/${folder.name}`;
                return (
                  <div 
                    key={folder.name} 
                    onClick={() => setCurrentPath(folderVirtualPath)}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group relative border border-transparent hover:border-white/10 transition-all"
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform">
                      <Folder size={40} fill="currentColor" fillOpacity={0.15} />
                    </div>
                    <span className="text-[11px] text-center truncate w-full" title={folder.name}>{folder.name}</span>

                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToMove({ name: folder.name, isFolder: true, virtualPath: folderVirtualPath });
                          setSelectedDestDir('/home/user/Masaüstü');
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-amber-600 text-white"
                        title="Klasörü Taşı (Masaüstü / Başka Klasör)"
                      >
                        <Move size={10} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(folderVirtualPath);
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-red-600 text-white"
                        title="Klasörü Sil"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Files */}
              {currentFiles.map((file) => {
                const fileVirtualPath = `${currentPath}/${file.name}`;
                const isExecutable = file.name.endsWith('.sh') || file.name.endsWith('.desktop') || file.name.endsWith('.exe') || file.name.endsWith('.bat') || file.name.endsWith('.deb') || file.name.endsWith('.rpm');
                const isExe = file.name.endsWith('.exe');
                const isBat = file.name.endsWith('.bat');
                
                const handleFileClick = () => {
                  const ext = file.name.split('.').pop()?.toLowerCase() || '';
                  if (['png', 'jpg', 'jpeg', 'ico', 'webp', 'gif', 'mp4', 'webm', 'ogg', 'mov', 'mp3', 'm4r', 'wav', 'aac'].includes(ext)) {
                    onOpenMediaPlayer?.(file.name, file.content);
                  } else if (['bat', 'exe', 'deb', 'rpm', 'sh', 'desktop'].includes(ext)) {
                    onOpenExecutable?.(file.name, file.content);
                  } else {
                    onOpenFile?.(file.name, file.content, fileVirtualPath);
                  }
                };

                return (
                  <div 
                    key={file.name} 
                    onClick={handleFileClick}
                    className="flex flex-col items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group relative border border-transparent hover:border-white/10 transition-all"
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

                    {/* Action buttons on hover */}
                    <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Save to real device (Dosyayı Yükle) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadToRealDevice(file.name, file.content);
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-emerald-600 text-white"
                        title="Dosyayı Yükle (PC veya Telefonunuza Kaydeder)"
                      >
                        <Download size={10} />
                      </button>

                      {/* Import from device (Dosya İndir) */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-sky-600 text-white"
                        title="Dosya İndir (Telefondan/Cihazdan Sisteme Aktarır)"
                      >
                        <Upload size={10} />
                      </button>
                      
                      {/* Move to desktop / another folder */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToMove({ name: file.name, isFolder: false, virtualPath: fileVirtualPath });
                          setSelectedDestDir('/home/user/Masaüstü');
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-amber-600 text-white"
                        title="Masaüstüne veya Başka Klasöre Taşı"
                      >
                        <Move size={10} />
                      </button>

                      {/* Delete file */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(fileVirtualPath);
                        }}
                        className="p-1 rounded bg-black/80 hover:bg-red-600 text-white"
                        title="Dosyayı Sil"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentFolders.length === 0 && currentFiles.length === 0 && (
                <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 py-16 gap-2">
                  <Folder size={48} className="text-white/40" />
                  <span className="text-xs">Bu klasör boş</span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Upload size={12} />
                    <span>Bilgisayar veya telefondan dosya yükleyin</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Move Modal */}
      {itemToMove && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form onSubmit={handleMoveItemSubmit} className="bg-[#222] border border-white/10 rounded-xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <FolderInput size={18} />
                <span>Öğeyi Taşı</span>
              </div>
              <button 
                type="button" 
                onClick={() => setItemToMove(null)} 
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-white/70">
              <span className="text-white font-bold">{itemToMove.name}</span> öğesini hangi klasöre taşımak istiyorsunuz?
            </div>

            {/* Quick Destination Buttons */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-white/40 uppercase">Hızlı Hedef Seçin:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDestDir('/home/user/Masaüstü')}
                  className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${selectedDestDir === '/home/user/Masaüstü' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  <Home size={14} className="text-amber-400" />
                  <span>📌 Masaüstü</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedDestDir('/home/user/Belgeler')}
                  className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${selectedDestDir === '/home/user/Belgeler' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  <Folder size={14} className="text-blue-400" />
                  <span>📄 Belgeler</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDestDir('/home/user/İndirilenler')}
                  className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${selectedDestDir === '/home/user/İndirilenler' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  <Download size={14} className="text-emerald-400" />
                  <span>📥 İndirilenler</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDestDir('/home/user')}
                  className={`px-3 py-2 rounded-lg border text-left flex items-center gap-2 transition-all ${selectedDestDir === '/home/user' ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  <HardDrive size={14} className="text-purple-400" />
                  <span>🏠 Ev Klasörü</span>
                </button>
              </div>
            </div>

            {/* Custom Path Select Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-white/40 uppercase">Tüm Klasörler:</label>
              <select
                value={selectedDestDir}
                onChange={(e) => setSelectedDestDir(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-amber-500"
              >
                {availableDirs.map(dir => (
                  <option key={dir} value={dir} className="bg-[#222] text-white">
                    {dir === '/home/user/Masaüstü' ? '📌 Masaüstü (/home/user/Masaüstü)' : dir}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button 
                type="button" 
                onClick={() => setItemToMove(null)} 
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white/80"
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-xs text-black transition-all shadow-lg shadow-amber-500/20"
              >
                Buraya Taşı
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-1.5 bg-white/5 border-t border-white/10 text-[10px] text-white/40 flex justify-between items-center shrink-0">
        <span>{currentFolders.length + currentFiles.length} öğe listeleniyor</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isServerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isServerOnline ? 'Yerel Sunucu Aktif' : 'Tarayıcı Çevrimdışı Depolama'}</span>
        </div>
      </div>
    </div>
  );
};
