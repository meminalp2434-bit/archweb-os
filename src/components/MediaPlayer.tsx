import React, { useState } from 'react';
import { X, Play, Pause, Volume2, Image as ImageIcon, Video, Music, Download } from 'lucide-react';

interface MediaPlayerProps {
  fileName: string;
  fileContent: string;
  onClose: () => void;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ fileName, fileContent, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  const isImage = ['png', 'jpg', 'jpeg', 'ico', 'webp', 'gif'].includes(extension);
  const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension);
  const isAudio = ['mp3', 'm4r', 'wav', 'ogg', 'aac'].includes(extension);

  const handleDownload = () => {
    let url = fileContent;
    let shouldRevoke = false;
    if (!fileContent.startsWith('data:')) {
      const mimeType = isImage ? 'image/png' : isVideo ? 'video/mp4' : isAudio ? 'audio/mpeg' : 'text/plain';
      const blob = new Blob([fileContent], { type: mimeType });
      url = URL.createObjectURL(blob);
      shouldRevoke = true;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (shouldRevoke) setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            {isImage && <ImageIcon size={18} className="text-pink-400" />}
            {isVideo && <Video size={18} className="text-purple-400" />}
            {isAudio && <Music size={18} className="text-emerald-400" />}
            <span className="truncate max-w-md">{fileName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-xs border border-emerald-500/30 transition-all font-medium"
              title="Gerçek Cihazınıza İndir / Yükle"
            >
              <Download size={14} />
              <span>Cihaza İndir</span>
            </button>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content Viewer / Player */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto bg-black/40 min-h-[350px]">
          {isImage && (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={fileContent.startsWith('data:') || fileContent.startsWith('http') ? fileContent : `data:image/png;base64,${btoa(fileContent)}`} 
                alt={fileName}
                className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                onError={(e) => {
                  // Fallback if raw text
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-white/40 font-mono">Resim Görüntüleyici • {fileName}</span>
            </div>
          )}

          {isVideo && (
            <div className="flex flex-col items-center gap-4 w-full">
              <video 
                src={fileContent.startsWith('data:') ? fileContent : undefined}
                controls
                autoPlay
                className="max-h-[60vh] w-full rounded-xl object-contain shadow-2xl bg-black border border-white/10"
              >
                {!fileContent.startsWith('data:') && (
                  <source src={fileContent} type="video/mp4" />
                )}
                Tarayıcınız video oynatmayı desteklemiyor.
              </video>
              <span className="text-xs text-white/40 font-mono">ArchWeb Video Oynatıcı (.mp4)</span>
            </div>
          )}

          {isAudio && (
            <div className="flex flex-col items-center gap-6 w-full max-w-md bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-pulse">
                <Music size={36} />
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-base">{fileName}</div>
                <div className="text-xs text-white/40 mt-1">ArchWeb Müzik Oynatıcı ({extension.toUpperCase()})</div>
              </div>

              <audio 
                src={fileContent.startsWith('data:') ? fileContent : undefined}
                controls 
                autoPlay 
                className="w-full"
              />
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="text-center text-white/50 text-sm">
              Bu dosya formatı ({extension}) doğrudan önizlenemiyor. Cihazınıza indirebilirsiniz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
