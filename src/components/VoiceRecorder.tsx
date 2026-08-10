import React, { useState, useRef } from 'react';
import { X, Mic, Square, Play, Download, Check, Music } from 'lucide-react';
import { saveOfflineFile } from '../utils/localFileSystem';

interface VoiceRecorderProps {
  onClose: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const startRecording = async () => {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Microphone access error:", err);
      alert("Mikrofon izni alınamadı veya cihazda mikrofon bulunamadı.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const saveRecordingToSystem = async () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = (e.target?.result as string) || '';
      const fileName = `ses_kaydi_${Date.now()}.mp3`;
      const virtualPath = `/home/user/Müzik/${fileName}`;
      saveOfflineFile(virtualPath, base64Data);
      setSuccessToast(`Ses kaydı sisteme kaydedildi: ${virtualPath}`);
      setTimeout(() => setSuccessToast(null), 3000);
    };
    reader.readAsDataURL(audioBlob);
  };

  const downloadRecording = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `archweb_ses_${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Mic size={18} className="text-emerald-400" />
            <span>Ses Kaydedici & Müzik</span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {successToast && (
          <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 text-xs flex items-center gap-2 border-b border-emerald-500/30">
            <Check size={14} className="text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="p-6 flex flex-col items-center justify-center gap-6">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'}`}>
            <Mic size={48} />
          </div>

          <div className="text-2xl font-mono font-bold text-white tracking-widest">
            {formatTime(recordingTime)}
          </div>

          <div className="flex items-center gap-3 w-full">
            {!isRecording ? (
              <button 
                onClick={startRecording}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
              >
                <Mic size={16} />
                <span>Kayda Başla</span>
              </button>
            ) : (
              <button 
                onClick={stopRecording}
                className="flex-1 py-3 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Square size={16} className="text-red-400 fill-current" />
                <span>Kaydı Durdur</span>
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="flex flex-col gap-3 w-full pt-4 border-t border-white/10">
              <audio src={audioUrl} controls className="w-full" />
              <div className="flex gap-2">
                <button 
                  onClick={saveRecordingToSystem}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Music size={14} />
                  <span>Sisteme Kaydet (/Müzik)</span>
                </button>
                <button 
                  onClick={downloadRecording}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  title="Cihaza İndir"
                >
                  <Download size={14} />
                  <span>İndir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
