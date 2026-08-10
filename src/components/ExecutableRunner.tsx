import React, { useState, useEffect } from 'react';
import { X, Terminal, Cpu, CheckCircle2, Play, Download, Shield } from 'lucide-react';

interface ExecutableRunnerProps {
  fileName: string;
  fileContent: string;
  onClose: () => void;
}

export const ExecutableRunner: React.FC<ExecutableRunnerProps> = ({ fileName, fileContent, onClose }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'running' | 'success' | 'ready'>('ready');
  const [progress, setProgress] = useState(0);

  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  const runExecution = () => {
    setStatus('running');
    setProgress(0);
    setLogs([
      `[ArchWeb OS Executable Runner] Başlatılıyor: ${fileName}...`,
      `İzinler kontrol ediliyor: [Root / User Executor]`,
      `Dosya türü: .${extension.toUpperCase()} (Yürütülebilir paket)`
    ]);

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p === 20) {
        setLogs(prev => [...prev, `[1/4] Paket doğrulama ve checksum kontrolü tamamlandı.`]);
      } else if (p === 40) {
        setLogs(prev => [...prev, `[2/4] Sanal ortam bağımlılıkları yükleniyor...`]);
      } else if (p === 60) {
        setLogs(prev => [...prev, `[3/4] Kod ayrıştırılıyor ve yürütme dizinine bağlanıyor: ${fileContent ? fileContent.substring(0, 40) + '...' : 'Script çalıştırılıyor'}`]);
      } else if (p === 80) {
        setLogs(prev => [...prev, `[4/4] Sistem servisleri yapılandırılıyor ve başlatılıyor.`]);
      } else if (p >= 100) {
        clearInterval(interval);
        setStatus('success');
        setLogs(prev => [...prev, `✓ Başarılı! ${fileName} sorunsuz bir şekilde çalıştırıldı/kuruldu.`]);
      }
    }, 400);
  };

  useEffect(() => {
    runExecution();
  }, []);

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu size={20} />
            </div>
            <div>
              <div className="font-bold text-sm">ArchWeb Paket & Yürütücü ({fileName})</div>
              <div className="text-[10px] text-white/40">Desteklenen uzantılar: .bat, .exe, .deb, .rpm, .sh</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/5 h-1.5 overflow-hidden">
          <div 
            className="h-full bg-amber-400 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Terminal Log View */}
        <div className="p-5 flex flex-col gap-4">
          <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-emerald-400 h-64 overflow-y-auto flex flex-col gap-1.5">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-white/30 select-none">&gt;</span>
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
            {status === 'running' && (
              <div className="flex items-center gap-2 text-amber-400 animate-pulse mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Çalıştırılıyor / Kuruluyor... (%{progress})</span>
              </div>
            )}
            {status === 'success' && (
              <div className="flex items-center gap-2 text-emerald-300 font-bold mt-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>İşlem başarıyla tamamlandı!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-t border-white/10">
          <div className="text-[11px] text-white/40">
            {status === 'success' ? 'Dosya başarıyla çalıştırıldı ve sisteme entegre edildi.' : 'Çalıştırma devam ediyor...'}
          </div>
          <div className="flex items-center gap-2">
            {status !== 'running' && (
              <button 
                onClick={runExecution}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Play size={14} />
                <span>Tekrar Çalıştır</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
