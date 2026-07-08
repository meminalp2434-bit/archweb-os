import React, { useState, useEffect, useRef } from 'react';
import { Neofetch } from './Neofetch';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogEntry {
  type: 'input' | 'output' | 'error' | 'component';
  content: string | React.ReactNode;
}

interface TerminalProps {
  onClose?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<LogEntry[]>([
    { type: 'output', content: 'ArchWeb OS v2.0\'a Hoş Geldiniz' },
    { type: 'output', content: 'Kullanılabilir komutları görmek için "help" yazın.' },
    { type: 'component', content: <Neofetch /> },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', content: `[user@archlinux ~]$ ${cmd}` }]);
    setCommandHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);

    switch (trimmedCmd) {
      case 'help':
        setHistory(prev => [...prev, { 
          type: 'output', 
          content: 'Kullanılabilir komutlar: help, clear, neofetch, whoami, date, ls, echo [metin], uname, pacman -Syu' 
        }]);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'neofetch':
        setHistory(prev => [...prev, { type: 'component', content: <Neofetch /> }]);
        break;
      case 'whoami':
        setHistory(prev => [...prev, { type: 'output', content: 'arch-user' }]);
        break;
      case 'date':
        setHistory(prev => [...prev, { type: 'output', content: new Date().toString() }]);
        break;
      case 'ls':
        setHistory(prev => [...prev, { type: 'output', content: 'Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos' }]);
        break;
      case 'uname':
        setHistory(prev => [...prev, { type: 'output', content: 'Linux archlinux 6.12.0-arch1-1 #1 SMP PREEMPT_DYNAMIC Mon, 09 Mar 2026 15:30:00 +0000 x86_64 GNU/Linux' }]);
        break;
      case 'pacman -syu':
        setHistory(prev => [...prev, { type: 'output', content: ':: Paket veritabanları senkronize ediliyor...\n core güncel\n extra güncel\n community güncel\n:: Tam sistem yükseltmesi başlatılıyor...\n yapılacak bir şey yok' }]);
        break;
      default:
        if (trimmedCmd.startsWith('echo ')) {
          setHistory(prev => [...prev, { type: 'output', content: cmd.slice(5) }]);
        } else {
          setHistory(prev => [...prev, { type: 'error', content: `zsh: komut bulunamadı: ${trimmedCmd}` }]);
        }
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full bg-[#0d0d0d]/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden terminal-glow"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors" 
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="text-xs text-white/40 font-mono">user@archlinux: ~</div>
        <div className="w-12" />
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {history.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "mb-1 whitespace-pre-wrap break-all",
                entry.type === 'error' && "text-red-400",
                entry.type === 'input' && "text-[var(--accent)] font-bold",
                entry.type === 'output' && "text-white/80"
              )}
            >
              {entry.content}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[var(--accent)] font-bold">[user@archlinux ~]$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white caret-[var(--accent)]"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
