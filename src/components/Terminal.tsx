import React, { useState, useEffect, useRef } from 'react';
import { Neofetch } from './Neofetch';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogEntry {
  type: 'input' | 'output' | 'error' | 'component' | 'system';
  content: string | React.ReactNode;
}

interface TerminalProps {
  onClose?: () => void;
}

interface FSNode {
  type: 'file' | 'dir';
  content?: string;
}

const defaultFS: Record<string, FSNode> = {
  '/': { type: 'dir' },
  '/home': { type: 'dir' },
  '/home/user': { type: 'dir' },
  '/home/user/Masaüstü': { type: 'dir' },
  '/home/user/Belgeler': { type: 'dir' },
  '/home/user/Belgeler/notlar.txt': { type: 'file', content: 'ArchWeb OS\'e Hoş Geldiniz!\nBu tamamen simüle edilmiş bir bash terminalidir.\n\n"help" yazarak komut listesini görebilirsiniz.' },
  '/home/user/İndirilenler': { type: 'dir' },
  '/home/user/Müzik': { type: 'dir' },
  '/home/user/Resimler': { type: 'dir' },
  '/etc': { type: 'dir' },
  '/etc/hostname': { type: 'file', content: 'archlinux' },
  '/etc/issue': { type: 'file', content: 'Arch Linux \\r (\\l)\n' },
  '/var': { type: 'dir' },
  '/var/log': { type: 'dir' },
  '/var/log/pacman.log': { type: 'file', content: '[2026-07-14 00:12] [PACMAN] Synchronizing package databases...\n[2026-07-14 00:13] [PACMAN] System is up to date.' },
};

export const Terminal: React.FC<TerminalProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  
  // Simulated State Filesystem
  const [fs, setFs] = useState<Record<string, FSNode>>(() => {
    const saved = localStorage.getItem('archweb_sim_fs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultFS;
      }
    }
    return defaultFS;
  });

  const [currentDir, setCurrentDir] = useState<string>(() => {
    return localStorage.getItem('archweb_sim_pwd') || '/home/user';
  });

  const [history, setHistory] = useState<LogEntry[]>(() => {
    const isSafeModeActive = localStorage.getItem('archweb_safe_mode') === 'true';
    if (isSafeModeActive) {
      return [
        { type: 'output', content: 'ArchWeb Bash Shell v3.2 [GÜVENLİ MOD]' },
        { type: 'output', content: 'Etkin durum: Teşhis & Kurtarma Modu. Yardım için "help" yazın.' },
        { type: 'component', content: <Neofetch /> },
      ];
    }
    return [
      { type: 'output', content: 'ArchWeb GNU/Linux (bash terminal) v3.2' },
      { type: 'output', content: 'Simüle edilmiş bash shell ortamına hoş geldiniz. Yardım için "help" yazın.' },
      { type: 'component', content: <Neofetch /> },
    ];
  });

  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // GNU Nano Editor States
  const [nanoMode, setNanoMode] = useState(false);
  const [nanoFile, setNanoFile] = useState('');
  const [nanoContent, setNanoContent] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, nanoMode]);

  useEffect(() => {
    localStorage.setItem('archweb_sim_pwd', currentDir);
  }, [currentDir]);

  // Handle Ctrl+O and Ctrl+X inside Nano
  useEffect(() => {
    if (!nanoMode) return;

    const handleNanoKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        // Save
        setFs(prev => {
          const updated = { ...prev, [nanoFile]: { type: 'file' as const, content: nanoContent } };
          localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
          return updated;
        });
        setHistory(prev => [...prev, { type: 'system', content: `[nano] '${nanoFile}' kaydedildi.` }]);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        // Exit
        setNanoMode(false);
        setNanoFile('');
        setNanoContent('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener('keydown', handleNanoKeys);
    return () => window.removeEventListener('keydown', handleNanoKeys);
  }, [nanoMode, nanoFile, nanoContent]);

  // Path resolver helper
  const resolvePath = (curDir: string, targetPath: string): string => {
    if (!targetPath) return curDir;
    let resolved = targetPath.startsWith('/') ? targetPath : `${curDir}/${targetPath}`;
    
    // Resolve home directory tilde shortcut
    if (targetPath === '~') return '/home/user';
    if (targetPath.startsWith('~/')) {
      resolved = `/home/user/${targetPath.slice(2)}`;
    }

    const parts = resolved.split('/');
    const stack: string[] = [];
    for (const part of parts) {
      if (part === '' || part === '.') continue;
      if (part === '..') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return '/' + stack.join('/');
  };

  // Get relative folder structure contents
  const listDirectory = (target: string): string[] => {
    const targetNormalized = target === '/' ? '/' : target;
    const prefix = targetNormalized === '/' ? '/' : `${targetNormalized}/`;
    const items = new Set<string>();
    
    Object.keys(fs).forEach(key => {
      if (key.startsWith(prefix) && key !== targetNormalized) {
        const relative = key.slice(prefix.length);
        const firstPart = relative.split('/')[0];
        // append indicator if directory
        const fullChildPath = targetNormalized === '/' ? `/${firstPart}` : `${targetNormalized}/${firstPart}`;
        const isDir = fs[fullChildPath]?.type === 'dir';
        items.add(firstPart + (isDir ? '/' : ''));
      }
    });
    
    return Array.from(items);
  };

  const getPromptLabel = (dir: string) => {
    if (dir === '/home/user') return '~';
    if (dir.startsWith('/home/user/')) return dir.replace('/home/user/', '~/');
    return dir;
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Output command prompt line first
    const promptPrefix = localStorage.getItem('archweb_safe_mode') === 'true' 
      ? `[güvenli-mod] user@archlinux ${getPromptLabel(currentDir)} $ ` 
      : `[user@archlinux ${getPromptLabel(currentDir)}]$ `;
    setHistory(prev => [...prev, { type: 'input', content: `${promptPrefix}${rawCmd}` }]);
    setCommandHistory(prev => [rawCmd, ...prev]);
    setHistoryIndex(-1);

    // Shell Redirection Parser (e.g. command > file.txt or command >> file.txt)
    let redirectType: 'overwrite' | 'append' | null = null;
    let commandToRun = trimmed;
    let redirectFile = '';

    if (trimmed.includes(' >> ')) {
      redirectType = 'append';
      const parts = trimmed.split(' >> ');
      commandToRun = parts[0].trim();
      redirectFile = parts[1].trim();
    } else if (trimmed.includes(' > ')) {
      redirectType = 'overwrite';
      const parts = trimmed.split(' > ');
      commandToRun = parts[0].trim();
      redirectFile = parts[1].trim();
    }

    const args = commandToRun.split(/\s+/);
    const mainCommand = args[0].toLowerCase();

    // Actual command execution returning output string or rendering a custom UI log
    let output: string | React.ReactNode = '';
    let isError = false;

    switch (mainCommand) {
      case 'help':
        output = `ArchWeb Bash v3.2 - Kullanılabilir komutlar:\n` +
                 `  pwd                 Mevcut çalışma dizinini gösterir\n` +
                 `  ls [yol]            Dizindeki dosya ve klasörleri listeler\n` +
                 `  cd <yol>            Çalışma dizinini değiştirir\n` +
                 `  mkdir <klasör>      Yeni bir klasör oluşturur\n` +
                 `  touch <dosya>       Yeni bir boş dosya oluşturur\n` +
                 `  cat <dosya>         Dosya içeriğini ekrana yazdırır\n` +
                 `  rm <dosya>          Bir dosyayı siler\n` +
                 `  rmdir <klasör>      Boş bir klasörü siler\n` +
                 `  echo [metin]        Metni ekrana yazdırır veya dosyaya yönlendirir (> veya >>)\n` +
                 `  nano <dosya>        Terminal içi metin editörünü başlatır\n` +
                 `  neofetch            Sistem bilgilerini gösterir\n` +
                 `  whoami              Aktif kullanıcı adını gösterir\n` +
                 `  date                Sistem tarih ve saatini gösterir\n` +
                 `  uname -a            Kernel versiyonunu gösterir\n` +
                 `  ping <sunucu>       Belirtilen sunucuya ping atar (Ctrl+C gerektirmez)\n` +
                 `  df -h               Disk alanını listeler\n` +
                 `  free -m             Bellek kullanımını görüntüler\n` +
                 `  uptime              Çalışma süresini gösterir\n` +
                 `  pacman -Syu         Sistemi günceller\n` +
                 `  pacman -S <paket>   Simüle paket yükler (Örn: pacman -S sl, pacman -S cmatrix)\n` +
                 `  clear               Ekranı temizler\n` +
                 `  history             Komut geçmişini gösterir`;
        break;

      case 'pwd':
        output = currentDir;
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return;

      case 'neofetch':
        setHistory(prev => [...prev, { type: 'component', content: <Neofetch /> }]);
        setInput('');
        return;

      case 'whoami':
        output = 'user';
        break;

      case 'date':
        output = new Date().toLocaleString('tr-TR');
        break;

      case 'uname':
        output = args[1] === '-a' 
          ? 'Linux archlinux 6.12.0-arch1-1 #1 SMP PREEMPT_DYNAMIC Mon, 09 Mar 2026 15:30:00 +0000 x86_64 GNU/Linux'
          : 'Linux';
        break;

      case 'uptime':
        output = ' 13:37:42 up 4:20,  1 user,  load average: 0.12, 0.08, 0.05';
        break;

      case 'free':
        output = args[1] === '-m'
          ? '               total        used        free      shared  buff/cache   available\n' +
            'Mem:            8192        3421        2814         120        1957        4521\n' +
            'Swap:           2048         512        1536'
          : '               total        used        free      shared  buff/cache   available\n' +
            'Mem:         8388608     3503104     2881536      122880     2003968     4629504\n' +
            'Swap:        2097152      524288     1572864';
        break;

      case 'df':
        output = args[1] === '-h'
          ? 'Filesystem      Size  Used Avail Use% Mounted on\n' +
            '/dev/vda1        64G   19G   45G  30% /\n' +
            'tmpfs           4.0G     0  4.0G   0% /dev/shm\n' +
            '/dev/vda2       512M   42M  470M   9% /boot'
          : 'Filesystem     1K-blocks     Used  Available Use% Mounted on\n' +
            '/dev/vda1       67108864 19922944   47185920  30% /\n' +
            'tmpfs            4194304        0    4194304   0% /dev/shm\n' +
            '/dev/vda2         524288    43008     481280   9% /boot';
        break;

      case 'history':
        output = commandHistory.map((h, idx) => `  ${commandHistory.length - idx}  ${h}`).reverse().join('\n');
        break;

      case 'ls': {
        const targetPath = args[1] ? resolvePath(currentDir, args[1]) : currentDir;
        if (!fs[targetPath]) {
          output = `ls: '${args[1]}' dosyasına veya dizinine erişilemedi: Böyle bir dosya veya dizin yok`;
          isError = true;
        } else if (fs[targetPath].type === 'file') {
          output = args[1];
        } else {
          const contents = listDirectory(targetPath);
          output = contents.join('   ');
        }
        break;
      }

      case 'cd': {
        const dest = args[1] ? args[1] : '/home/user';
        const resolved = resolvePath(currentDir, dest);
        if (fs[resolved] && fs[resolved].type === 'dir') {
          setCurrentDir(resolved);
          output = '';
        } else {
          output = `bash: cd: ${dest}: Böyle bir dizin yok`;
          isError = true;
        }
        break;
      }

      case 'mkdir': {
        const folderName = args[1];
        if (!folderName) {
          output = 'mkdir: eksik işlenen (operand)\nDaha fazla bilgi için "help" yazın.';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, folderName);
          const parent = resolved.slice(0, resolved.lastIndexOf('/')) || '/';
          if (!fs[parent] || fs[parent].type !== 'dir') {
            output = `mkdir: '${folderName}' klasörü oluşturulamıyor: Üst dizin mevcut değil`;
            isError = true;
          } else if (fs[resolved]) {
            output = `mkdir: '${folderName}' klasörü oluşturulamıyor: Dosya veya klasör zaten var`;
            isError = true;
          } else {
            setFs(prev => {
              const updated = { ...prev, [resolved]: { type: 'dir' as const } };
              localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
              return updated;
            });
            output = '';
          }
        }
        break;
      }

      case 'touch': {
        const fileName = args[1];
        if (!fileName) {
          output = 'touch: eksik dosya işleneni';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, fileName);
          const parent = resolved.slice(0, resolved.lastIndexOf('/')) || '/';
          if (!fs[parent] || fs[parent].type !== 'dir') {
            output = `touch: '${fileName}' oluşturulamıyor: Üst dizin mevcut değil`;
            isError = true;
          } else {
            setFs(prev => {
              const updated = { ...prev, [resolved]: { type: 'file' as const, content: prev[resolved]?.content || '' } };
              localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
              return updated;
            });
            output = '';
          }
        }
        break;
      }

      case 'rm': {
        const target = args[1];
        if (!target) {
          output = 'rm: eksik işlenen';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, target);
          if (!fs[resolved]) {
            output = `rm: '${target}' silinemedi: Böyle bir dosya veya dizin yok`;
            isError = true;
          } else if (fs[resolved].type === 'dir') {
            output = `rm: '${target}' silinemedi: Bir dizin (klasörleri silmek için 'rmdir' kullanın)`;
            isError = true;
          } else {
            setFs(prev => {
              const updated = { ...prev };
              delete updated[resolved];
              localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
              return updated;
            });
            output = '';
          }
        }
        break;
      }

      case 'rmdir': {
        const target = args[1];
        if (!target) {
          output = 'rmdir: eksik işlenen';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, target);
          if (!fs[resolved]) {
            output = `rmdir: '${target}' silinemedi: Böyle bir dizin yok`;
            isError = true;
          } else if (fs[resolved].type !== 'dir') {
            output = `rmdir: '${target}' silinemedi: Bir dizin değil`;
            isError = true;
          } else {
            // Check if directory is empty
            const children = listDirectory(resolved);
            if (children.length > 0) {
              output = `rmdir: '${target}' silinemedi: Dizin boş değil`;
              isError = true;
            } else {
              setFs(prev => {
                const updated = { ...prev };
                delete updated[resolved];
                localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
                return updated;
              });
              output = '';
            }
          }
        }
        break;
      }

      case 'cat': {
        const target = args[1];
        if (!target) {
          output = 'cat: eksik dosya işleneni';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, target);
          if (!fs[resolved]) {
            output = `cat: ${target}: Böyle bir dosya veya dizin yok`;
            isError = true;
          } else if (fs[resolved].type === 'dir') {
            output = `cat: ${target}: Bir dizin`;
            isError = true;
          } else {
            output = fs[resolved].content || '';
          }
        }
        break;
      }

      case 'echo': {
        // Grab everything after 'echo '
        const rawEcho = commandToRun.slice(5).trim();
        // Remove enclosing quotes if any
        let cleanEcho = rawEcho;
        if (
          (cleanEcho.startsWith('"') && cleanEcho.endsWith('"')) ||
          (cleanEcho.startsWith("'") && cleanEcho.endsWith("'"))
        ) {
          cleanEcho = cleanEcho.slice(1, -1);
        }
        output = cleanEcho;
        break;
      }

      case 'sudo': {
        const subCmd = args.slice(1).join(' ');
        if (!subCmd) {
          output = '[sudo] user için şifre: \nÖrnek: sudo pacman -Syu';
        } else {
          output = 'Erişim izni verildi. Komut root olarak çalıştırılıyor...\n';
          // run subcommand by recursing
          handleCommand(subCmd);
          return;
        }
        break;
      }

      case 'ping': {
        const host = args[1] || 'google.com';
        output = `PING ${host} (142.250.187.206) 56(84) bytes of data.\n` +
                 `64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n` +
                 `64 bytes from ${host}: icmp_seq=2 ttl=118 time=12.9 ms\n` +
                 `64 bytes from ${host}: icmp_seq=3 ttl=118 time=15.1 ms\n\n` +
                 `--- ${host} ping istatistikleri ---\n` +
                 `3 paket iletildi, 3 paket alındı, 0% paket kaybı, süre 2004ms\n` +
                 `rtt min/avg/max/mdev = 12.9/14.0/15.1/0.91 ms`;
        break;
      }

      case 'pacman': {
        if (args[1] === '-syu') {
          output = ':: Paket veritabanları senkronize ediliyor...\n' +
                   ' core güncelleştiriliyor... [100%] (1.2 MB/sn)\n' +
                   ' extra güncelleştiriliyor... [100%] (4.5 MB/sn)\n' +
                   ' community güncelleştiriliyor... [100%] (5.1 MB/sn)\n' +
                   ':: Tam sistem yükseltmesi başlatılıyor...\n' +
                   '  güncellenecek bir şey yok (sisteminiz güncel!)';
        } else if (args[1] === '-s' || args[1] === '-S') {
          const pkg = args[2];
          if (!pkg) {
            output = 'Hata: paket ismi belirtilmedi!';
            isError = true;
          } else if (pkg.toLowerCase() === 'sl') {
            output = 'sl paketi kuruluyor...\n' +
                     'İndiriliyor: sl-5.02-3-x86_64.pkg.tar.zst (15.2 KB) [100%]\n' +
                     'Paket doğrulanıyor...\n' +
                     'Kuruluyor...\n' +
                     'Tamamlandı! Çalıştırmak için "sl" yazın.';
          } else if (pkg.toLowerCase() === 'cmatrix') {
            output = 'cmatrix paketi kuruluyor...\n' +
                     'İndiriliyor: cmatrix-2.0-1-x86_64.pkg.tar.zst (85.4 KB) [100%]\n' +
                     'Kuruluyor...\n' +
                     'Tamamlandı! Matrix yağmurunu başlatmak için "cmatrix" yazın.';
          } else {
            output = `Paket yükleniyor: ${pkg}...\n` +
                     `Hata: Paket depolarında bulunamadı. Lütfen paket ismini kontrol edin.`;
            isError = true;
          }
        } else {
          output = 'Kullanım: pacman -Syu  veya  pacman -S <paket_adi>';
          isError = true;
        }
        break;
      }

      case 'sl':
        output = '   ====        ___________  ___ ___  _____\n' +
                 '  _D _|  __   |_  _  _  _  ||  |  | |     |\n' +
                 '  [__]  |__]    | |  |  |  ||  |  | |     |\n' +
                 '  |oo|  |  |  _ | |  |  |  ||__|__| |_____|\n' +
                 ' _|__|_ |__| |_||_|  |_|  |_|                 (Simüle Tren Geçti!)';
        break;

      case 'cmatrix':
        output = '0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1\n' +
                 '1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0\n' +
                 '0 1 0 1 0  M  A  T  R  I  X  0 1 0 1 0 1\n' +
                 '1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0\n' +
                 '0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1';
        break;

      case 'nano': {
        const file = args[1];
        if (!file) {
          output = 'nano: dosya ismi belirtilmedi!';
          isError = true;
        } else {
          const resolved = resolvePath(currentDir, file);
          if (fs[resolved] && fs[resolved].type === 'dir') {
            output = `nano: '${file}' bir dizindir`;
            isError = true;
          } else {
            // Enter Nano Mode!
            setNanoFile(resolved);
            setNanoContent(fs[resolved]?.content || '');
            setNanoMode(true);
            setInput('');
            return;
          }
        }
        break;
      }

      default:
        output = `bash: komut bulunamadı: ${mainCommand}`;
        isError = true;
    }

    // Handle redirection writing if output is valid
    if (redirectType && typeof output === 'string' && !isError) {
      const resolvedFile = resolvePath(currentDir, redirectFile);
      const parent = resolvedFile.slice(0, resolvedFile.lastIndexOf('/')) || '/';
      
      if (!fs[parent] || fs[parent].type !== 'dir') {
        setHistory(prev => [...prev, { type: 'error', content: `bash: ${redirectFile}: Üst dizin bulunamadı` }]);
      } else {
        const currentFileContent = fs[resolvedFile]?.content || '';
        const newContent = redirectType === 'overwrite' 
          ? output 
          : (currentFileContent ? `${currentFileContent}\n${output}` : output);

        setFs(prev => {
          const updated = { ...prev, [resolvedFile]: { type: 'file' as const, content: newContent } };
          localStorage.setItem('archweb_sim_fs', JSON.stringify(updated));
          return updated;
        });
        // Silent redirect write on actual bash (does not print to terminal)
      }
    } else {
      // Append standard output to screen
      setHistory(prev => [...prev, { 
        type: isError ? 'error' : 'output', 
        content: output 
      }]);
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

  if (nanoMode) {
    return (
      <div className="flex flex-col h-full w-full bg-[#0d0d0d] font-mono text-xs text-white selection:bg-white/20 select-none border border-white/10 rounded-lg overflow-hidden">
        {/* Nano Top Bar */}
        <div className="bg-white/10 px-4 py-1.5 flex justify-between border-b border-white/5 select-none">
          <span className="font-bold">GNU nano 7.2</span>
          <span className="font-bold text-yellow-400">{getPromptLabel(nanoFile)}</span>
          <span className="text-white/40">Ctrl+X: Çıkış | Ctrl+O: Kaydet</span>
        </div>
        {/* Nano Content area */}
        <textarea
          ref={textareaRef}
          value={nanoContent}
          onChange={(e) => setNanoContent(e.target.value)}
          className="flex-1 bg-transparent p-4 outline-none border-none resize-none text-emerald-400 caret-white leading-relaxed font-mono font-medium text-xs h-full"
          placeholder="Metin girmeye başlayın..."
          autoFocus
        />
        {/* Help indicators at the bottom */}
        <div className="bg-white/5 border-t border-white/10 px-4 py-2 grid grid-cols-4 gap-x-4 gap-y-1 text-[10px] text-white/70 select-none">
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + G</kbd> Yardım</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + O</kbd> Yaz (Kaydet)</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + R</kbd> Dosya Oku</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + Y</kbd> Ön Sayfa</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + X</kbd> Çık (Exit)</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + J</kbd> Hizala</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + W</kbd> Ara</div>
          <div><kbd className="bg-white/10 px-1 py-0.5 rounded mr-1 font-bold">Ctrl + V</kbd> Sonraki Syf</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col h-full w-full bg-[#0d0d0d]/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden terminal-glow"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10 select-none">
        <div className="flex gap-2">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors cursor-pointer" 
            title="Kapat"
          />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="text-[10px] text-white/50 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>user@archlinux: {getPromptLabel(currentDir)}</span>
        </div>
        <div className="w-12" />
      </div>

      {/* Terminal Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-xs sm:text-sm scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {history.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "mb-1 whitespace-pre-wrap break-all leading-relaxed",
                entry.type === 'error' && "text-rose-400 font-semibold",
                entry.type === 'input' && "text-[var(--accent)] font-bold",
                entry.type === 'output' && "text-white/85",
                entry.type === 'system' && "text-amber-400 font-bold font-mono"
              )}
            >
              {entry.content}
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[var(--accent)] font-bold shrink-0">
            {localStorage.getItem('archweb_safe_mode') === 'true' 
              ? `[güvenli-mod] user@archlinux ${getPromptLabel(currentDir)} $` 
              : `[user@archlinux ${getPromptLabel(currentDir)}]$`}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white caret-[var(--accent)] font-mono text-xs sm:text-sm"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
