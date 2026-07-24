import React, { useState, useEffect, useRef } from 'react';
import { X, Award, CheckCircle, Gamepad2, Paintbrush, Rocket, Brain, Send, RefreshCw, Trash2, BookOpen, Star, Sparkles, ChevronRight, Play, Square, Trophy, Plus, Check, Undo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KidAppProps {
  onClose: () => void;
  category: 'education' | 'gaming' | 'creativity' | 'science';
  gmailUser: string;
  avatar: string;
  onLogout?: () => void;
}

export const KidApp: React.FC<KidAppProps> = ({ onClose, category, gmailUser, avatar, onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('main');

  // --- 1. EDUCATION (EĞİTİM & ÖDEV) STATE & LOGIC ---
  const [mathNum1, setMathNum1] = useState(0);
  const [mathNum2, setMathNum2] = useState(0);
  const [mathOp, setMathOp] = useState<'+' | '-' | '*'>('+');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathScore, setMathScore] = useState(0);
  const [mathFeedback, setMathFeedback] = useState<{ type: 'success' | 'error' | null; msg: string }>({ type: null, msg: '' });
  
  const [homeworks, setHomeworks] = useState<{ id: string; text: string; done: boolean; points: number }[]>(() => {
    const saved = localStorage.getItem('kid_homeworks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: '1', text: 'Matematik ödevini tamamla', done: false, points: 20 },
      { id: '2', text: 'Günde 20 sayfa kitap oku', done: false, points: 15 },
      { id: '3', text: 'Gezegenler hakkında bilgi edin', done: false, points: 10 },
      { id: '4', text: 'Resim çiz ve boya', done: false, points: 10 },
    ];
  });
  const [newHomeworkText, setNewHomeworkText] = useState('');

  useEffect(() => {
    localStorage.setItem('kid_homeworks', JSON.stringify(homeworks));
  }, [homeworks]);

  const generateMathQuestion = () => {
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * (category === 'education' ? 3 : 2))]; // No multiplication for non-edu
    let n1 = 0;
    let n2 = 0;

    if (op === '+') {
      n1 = Math.floor(Math.random() * 20) + 1;
      n2 = Math.floor(Math.random() * 20) + 1;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 20) + 10;
      n2 = Math.floor(Math.random() * n1);
    } else {
      n1 = Math.floor(Math.random() * 10) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
    }

    setMathNum1(n1);
    setMathNum2(n2);
    setMathOp(op);
    setMathAnswer('');
    setMathFeedback({ type: null, msg: '' });
  };

  useEffect(() => {
    generateMathQuestion();
  }, []);

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let correctAnswer = 0;
    if (mathOp === '+') correctAnswer = mathNum1 + mathNum2;
    else if (mathOp === '-') correctAnswer = mathNum1 - mathNum2;
    else if (mathOp === '*') correctAnswer = mathNum1 * mathNum2;

    if (parseInt(mathAnswer) === correctAnswer) {
      setMathScore(prev => prev + 10);
      setMathFeedback({ type: 'success', msg: 'Harika! Doğru Cevap! 🎉 (+10 Yıldız)' });
      setTimeout(() => {
        generateMathQuestion();
      }, 1500);
    } else {
      setMathFeedback({ type: 'error', msg: 'Tekrar dene bakalım, yapabilirsin! 💪' });
    }
  };

  const toggleHomework = (id: string) => {
    setHomeworks(prev => prev.map(hw => {
      if (hw.id === id) {
        if (!hw.done) {
          // Gained stars!
          setMathScore(prevScore => prevScore + hw.points);
        }
        return { ...hw, done: !hw.done };
      }
      return hw;
    }));
  };

  const addHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomeworkText.trim()) return;
    setHomeworks(prev => [
      ...prev,
      { id: Date.now().toString(), text: newHomeworkText.trim(), done: false, points: 15 }
    ]);
    setNewHomeworkText('');
  };

  // --- 2. GAMING (RETRO SNAKE OYUNU) STATE & LOGIC ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('kid_highscore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);

  const snakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ]);
  const directionRef = useRef<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const foodRef = useRef<{ x: number; y: number }>({ x: 5, y: 5 });
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const spawnFood = () => {
    const maxX = 20;
    const maxY = 20;
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY)
      };
      // Check if food on snake
      const onSnake = snakeRef.current.some(part => part.x === newFood.x && part.y === newFood.y);
      if (!onSnake) break;
    }
    foodRef.current = newFood;
  };

  const resetSnakeGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    directionRef.current = 'UP';
    setGameScore(0);
    setGameOver(false);
    spawnFood();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!gameActive) return;
    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current !== 'DOWN') directionRef.current = 'UP';
        break;
      case 'ArrowDown':
        if (directionRef.current !== 'UP') directionRef.current = 'DOWN';
        break;
      case 'ArrowLeft':
        if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT';
        break;
      case 'ArrowRight':
        if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT';
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameActive]);

  const updateGame = () => {
    const head = { ...snakeRef.current[0] };
    const dir = directionRef.current;

    if (dir === 'UP') head.y -= 1;
    else if (dir === 'DOWN') head.y += 1;
    else if (dir === 'LEFT') head.x -= 1;
    else if (dir === 'RIGHT') head.x += 1;

    // Collide borders
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
      setGameOver(true);
      setGameActive(false);
      return;
    }

    // Collide self
    const collideSelf = snakeRef.current.some(part => part.x === head.x && part.y === head.y);
    if (collideSelf) {
      setGameOver(true);
      setGameActive(false);
      return;
    }

    // Insert head
    const newSnake = [head, ...snakeRef.current];

    // Eat food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setGameScore(prev => {
        const next = prev + 10;
        if (next > highScore) {
          setHighScore(next);
          localStorage.setItem('kid_highscore', next.toString());
        }
        return next;
      });
      spawnFood();
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    drawGame();
  };

  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle)
    ctx.strokeStyle = '#242444';
    ctx.lineWidth = 0.5;
    const cellSize = canvas.width / 20;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw food (apple)
    ctx.fillStyle = '#ff2a6d';
    ctx.beginPath();
    const rx = foodRef.current.x * cellSize + cellSize / 2;
    const ry = foodRef.current.y * cellSize + cellSize / 2;
    ctx.arc(rx, ry, cellSize / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    // cute green leaf
    ctx.fillStyle = '#05d9e8';
    ctx.fillRect(rx + 1, ry - cellSize / 2, 2, 4);

    // Draw Snake
    snakeRef.current.forEach((part, index) => {
      ctx.fillStyle = index === 0 ? '#01f187' : '#01b86c';
      // Rounded snake corners
      ctx.beginPath();
      ctx.roundRect(
        part.x * cellSize + 1,
        part.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
        index === 0 ? 6 : 4
      );
      ctx.fill();

      // Eyes on snake head
      if (index === 0) {
        ctx.fillStyle = '#000';
        ctx.fillRect(part.x * cellSize + 4, part.y * cellSize + 4, 3, 3);
        ctx.fillRect(part.x * cellSize + cellSize - 7, part.y * cellSize + 4, 3, 3);
      }
    });
  };

  useEffect(() => {
    if (gameActive && !gameOver) {
      gameIntervalRef.current = setInterval(updateGame, 160);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }
    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [gameActive, gameOver]);

  useEffect(() => {
    if (activeTab === 'snake') {
      setTimeout(() => {
        drawGame();
      }, 100);
    }
  }, [activeTab]);

  // --- 3. CREATIVITY (SİHİRLİ RESİM TUVALİ) STATE & LOGIC ---
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [paintColor, setPaintColor] = useState('#00ffcc');
  const [brushSize, setBrushSize] = useState(8);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);

  const startPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedStamp) {
      // Draw stamp
      ctx.font = `${brushSize * 4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsPainting(true);
    }
  };

  const drawPaint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting || selectedStamp) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopPaint = () => {
    setIsPainting(false);
  };

  const clearPaint = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#101018';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (activeTab === 'paint') {
      setTimeout(() => {
        const canvas = paintCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#101018';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }, 100);
    }
  }, [activeTab]);


  // --- 4. SCIENCE (UZAY VE BİLİM KEŞFİ) STATE & LOGIC ---
  const [selectedPlanet, setSelectedPlanet] = useState<string>('earth');
  const [aiMessage, setAiMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'kid' | 'robot'; text: string }[]>([
    { sender: 'robot', text: 'Selam kâşif! Ben senin Bilim Robotu arkadaşınım. Bana uzay, dinozorlar, bilim veya doğa hakkında istediğin her soruyu sorabilirsin!' }
  ]);

  const planets: Record<string, { name: string; emoji: string; color: string; desc: string; temp: string; weight: string; funFact: string }> = {
    mercury: {
      name: 'Merkür',
      emoji: '🪙',
      color: '#8c8c8c',
      desc: 'Güneş Sistemi\'ndeki en küçük ve Güneş\'e en yakın gezegendir.',
      temp: 'Gündüz 430°C, Gece -180°C',
      weight: 'Dünya\'dakinden çok daha hafif hissedersin!',
      funFact: 'Güneş\'e en yakın olmasına rağmen, en sıcak gezegen değildir (en sıcağı Venüs\'tür) çünkü ısısını tutacak bir atmosferi yoktur!'
    },
    venus: {
      name: 'Venüs',
      emoji: '🟡',
      color: '#e3bb76',
      desc: 'Kalın ve zehirli atmosferi nedeniyle Güneş Sistemi\'ndeki en sıcak gezegendir.',
      temp: 'Sabit 465°C (Fırın gibi!)',
      weight: 'Dünya ile neredeyse aynıdır.',
      funFact: 'Venüs, kendi etrafında diğer gezegenlerin tersi yönünde döner ve gökyüzünde Güneş ve Ay\'dan sonra en parlak görünen cisimdir.'
    },
    earth: {
      name: 'Dünya',
      emoji: '🌍',
      color: '#4287f5',
      desc: 'Üzerinde yaşadığımız, su ve nefes alınabilir havayla dolu tek yaşam barındıran mavi gezegen.',
      temp: 'Ortalama 15°C',
      weight: 'Tam senin ağırlığın!',
      funFact: 'Dünya\'mızın yaklaşık %71\'i sularla kaplıdır, bu yüzden uzaydan bakıldığında masmavi parıldayan bir bilye gibi görünür!'
    },
    mars: {
      name: 'Mars (Kızıl Gezegen)',
      emoji: '🔴',
      color: '#e35f44',
      desc: 'Demir oksit (pas) tozlarıyla kaplı olduğu için kırmızı görünen kayalık komşumuz.',
      temp: 'Ortalama -62°C (Oldukça soğuk!)',
      weight: 'Dünya\'dakinin üçte biri kadar (Yüksek zıplayabilirsin!)',
      funFact: 'Mars\'ta Güneş Sistemi\'nin en yüksek dağı olan "Olimpos Dağı" bulunur. Bu yanardağ, Everest\'ten tam 3 kat daha yüksektir!'
    },
    jupiter: {
      name: 'Jüpiter',
      emoji: '🟤',
      color: '#cca07a',
      desc: 'Güneş Sistemi\'nin en büyük dev gaz gezegenidir. İçine 1300 tane Dünya sığabilir!',
      temp: '-108°C',
      weight: 'Çok ağır hissedersin, çünkü yerçekimi devasadır!',
      funFact: 'Üzerindeki meşhur "Büyük Kırmızı Leke" aslında yüzyıllardır devam eden, Dünya\'dan bile daha büyük devasa bir fırtınadır!'
    },
    saturn: {
      name: 'Satürn',
      emoji: '🪐',
      color: '#f0dfaa',
      desc: 'Buz, kaya ve toz parçacıklarından oluşan muhteşem halkalarıyla tanınan gaz devi.',
      temp: '-139°C',
      weight: 'Dünya\'ya yakındır.',
      funFact: 'Satürn o kadar hafiftir ve yoğunluğu o kadar düşüktür ki, eğer onu içine alabilecek büyüklükte bir su havuzuna koysaydık, suyun üzerinde yüzerdi!'
    }
  };

  const scienceRiddles = [
    { q: 'Biz olmasak nefes alamazdınız, yeşiliz ve Güneş\'i çok severiz. Biz kimiz?', a: 'Ağaçlar / Bitkiler 🌳' },
    { q: 'Geceleri gökyüzünde parıldarım, Dünya\'nın etrafında dönerim. Bazen yarım, bazen tam yuvarlağım. Ben neyim?', a: 'Ay 🌙' },
    { q: 'Gökkuşağında kaç renk vardır?', a: '7 renk vardır! 🌈 (Kırmızı, Turuncu, Sarı, Yeşil, Mavi, Lacivert, Mor)' },
    { q: 'Isı ve ışık kaynağımız olan devasa, sıcak gaz topu nedir?', a: 'Güneş ☀️' },
    { q: 'Yerçekimini keşfeden ünlü bilim insanı kimdir?', a: 'Sir Isaac Newton (Kafasına elma düşen bilim insanı!) 🍎' }
  ];

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage.trim();
    const newLogs = [...chatLog, { sender: 'kid' as const, text: userText }];
    setChatLog(newLogs);
    setAiMessage('');

    // Generate responsive response
    setTimeout(() => {
      let botResponse = 'Harika bir soru! Bilim dünyası çok eğlencelidir. Bilim insanları bunu her zaman araştırıyor! Başka neyi merak ediyorsun?';
      const cleanText = userText.toLowerCase();

      if (cleanText.includes('selam') || cleanText.includes('merhaba')) {
        botResponse = 'Sana da kocaman bir merhaba küçük kaşif! Bugün hangi bilimsel gizemi birlikte çözeceğiz? 🚀';
      } else if (cleanText.includes('uzay') || cleanText.includes('gezegen')) {
        botResponse = 'Uzay muhteşem bir yer! Güneş Sistemi\'mizde 8 gezegen bulunur. Onların altında sekmelerden Gezegen Gezgini\'ne tıklayıp hepsini sesli veya görsel olarak inceleyebilirsin! En çok hangi gezegeni seviyorsun?';
      } else if (cleanText.includes('dinozor')) {
        botResponse = 'Dinozorlar milyonlarca yıl önce Dünya\'mızda yaşadı! En büyüklerinden biri Brachiosaurus iken, en ünlü ve güçlü olanı T-Rex (Tyrannosaurus Rex)\'tir. Fosil bilimine Paleontoloji denir! 🦖';
      } else if (cleanText.includes('su') || cleanText.includes('yağmur')) {
        botResponse = 'Yağmur, su döngüsü sayesinde yağar! Güneş denizleri ve gölleri ısıtır, su buharlaşarak gökyüzüne yükselir, bulut olur ve soğuk havayla karşılaşınca tekrar damla damla yere iner! 💧';
      } else if (cleanText.includes('bilmece') || cleanText.includes('riddle') || cleanText.includes('soru sor')) {
        const riddle = scienceRiddles[Math.floor(Math.random() * scienceRiddles.length)];
        botResponse = `İşte sana harika bir bilim bilmecesi! 🤔\n\nSoru: "${riddle.q}"\n\n(Cevabı merak ediyorsan: ${riddle.a})`;
      } else if (cleanText.includes('yapay zeka') || cleanText.includes('ai')) {
        botResponse = 'Ben senin çocuklara özel Bilim Yapay Zeka arkadaşınım! Güvenli, eğlenceli ve öğretici bilgiler vermek için tasarlandım. 🤖';
      }

      setChatLog(prev => [...prev, { sender: 'robot' as const, text: botResponse }]);
    }, 800);
  };


  // --- MAIN RENDER LOGIC BASED ON ACTIVE TAB & CATEGORY ---
  return (
    <div className="flex flex-col h-full w-full bg-[#111122] rounded-2xl overflow-hidden shadow-2xl border border-white/15 text-white font-sans">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
            {category === 'education' && <Brain size={18} className="text-yellow-400" />}
            {category === 'gaming' && <Gamepad2 size={18} className="text-pink-400" />}
            {category === 'creativity' && <Paintbrush size={18} className="text-teal-400" />}
            {category === 'science' && <Rocket size={18} className="text-purple-400" />}
          </div>
          <div>
            <span className="text-xs font-bold font-mono tracking-wider text-yellow-400">ÇOCUK DÜNYASI</span>
            <div className="text-[10px] text-white/50 font-sans flex items-center gap-1.5">
              <span>{gmailUser}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-14 sm:w-48 bg-black/30 border-r border-white/10 p-1.5 sm:p-3 flex flex-col justify-between shrink-0">
          <div className="space-y-1.5">
            <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-white/40 hidden sm:block">Menü</div>
            
            <button 
              onClick={() => setActiveTab('main')}
              className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'main' ? 'bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
              title="Ana Sayfa"
            >
              <Award size={16} className="shrink-0" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </button>

            {/* Category Custom Sidebar Items */}
            {category === 'education' && (
              <>
                <button 
                  onClick={() => setActiveTab('math')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'math' ? 'bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Matematik Dehası"
                >
                  <Brain size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Matematik Dehası</span>
                </button>
                <button 
                  onClick={() => setActiveTab('homework')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'homework' ? 'bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Ödev & Görev Takibi"
                >
                  <BookOpen size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Ödev & Görev Takibi</span>
                </button>
              </>
            )}

            {category === 'gaming' && (
              <>
                <button 
                  onClick={() => setActiveTab('snake')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'snake' ? 'bg-pink-400/20 border border-pink-400/30 text-pink-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Yılan Oyunu"
                >
                  <Gamepad2 size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Yılan Oyunu</span>
                </button>
                <button 
                  onClick={() => setActiveTab('math')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'math' ? 'bg-pink-400/20 border border-pink-400/30 text-pink-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Mini Matematik"
                >
                  <Brain size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Mini Matematik</span>
                </button>
              </>
            )}

            {category === 'creativity' && (
              <>
                <button 
                  onClick={() => setActiveTab('paint')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'paint' ? 'bg-teal-400/20 border border-teal-400/30 text-teal-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Sihirli Tuval"
                >
                  <Paintbrush size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Sihirli Tuval</span>
                </button>
                <button 
                  onClick={() => setActiveTab('homework')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'homework' ? 'bg-teal-400/20 border border-teal-400/30 text-teal-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Hikaye Defterim"
                >
                  <Sparkles size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Hikaye Defterim</span>
                </button>
              </>
            )}

            {category === 'science' && (
              <>
                <button 
                  onClick={() => setActiveTab('planet')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'planet' ? 'bg-purple-400/20 border border-purple-400/30 text-purple-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Gezegen Gezgini"
                >
                  <Rocket size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Gezegen Gezgini</span>
                </button>
                <button 
                  onClick={() => setActiveTab('ai_robot')}
                  className={`w-full text-left px-2 sm:px-3 py-2 rounded-xl text-xs flex items-center justify-center sm:justify-start gap-2 transition-all ${activeTab === 'ai_robot' ? 'bg-purple-400/20 border border-purple-400/30 text-purple-300 font-bold' : 'hover:bg-white/5 text-white/70'}`}
                  title="Bilim Robotu (AI)"
                >
                  <Brain size={16} className="shrink-0" />
                  <span className="hidden sm:inline">Bilim Robotu (AI)</span>
                </button>
              </>
            )}
          </div>

          {/* Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 sm:p-2.5 flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl sm:text-2xl leading-none">{avatar}</span>
              <div className="overflow-hidden flex-1 hidden sm:block">
                <div className="text-[10px] font-bold font-mono text-yellow-300 truncate">{gmailUser.split('@')[0]}</div>
                <div className="text-[9px] text-white/40 truncate">Çocuk Hesabı</div>
              </div>
            </div>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full py-1 text-[9px] font-mono text-center text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-all"
              >
                Kategori Değiştir
              </button>
            )}
          </div>
        </div>

        {/* Workspace Display */}
        <div className="flex-1 bg-[#15152a] p-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* TAB: MAIN (ANA SAYFA) */}
            {activeTab === 'main' && (
              <motion.div 
                key="main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Greeting Banner */}
                <div className="relative rounded-2xl bg-gradient-to-r from-yellow-400/10 via-amber-400/10 to-orange-400/10 border border-yellow-400/20 p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles size={120} className="text-yellow-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-yellow-300 flex items-center gap-2 font-sans">
                    <span>Hoş Geldin, Kâşif!</span>
                    <span className="animate-bounce inline-block">{avatar}</span>
                  </h2>
                  <p className="text-xs text-white/75 mt-2 max-w-md leading-relaxed">
                    Senin için özel hazırlanmış çocuk dostu işletim sistemindesin. Gmail hesabını bağladın ve harika bir macera seni bekliyor!
                  </p>
                  
                  {/* Category Banner detail */}
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono">
                    <span className="text-yellow-400">Seçtiğin Kategori:</span>
                    <span className="font-bold text-white capitalize">
                      {category === 'education' && '📚 Eğitim & Ödev'}
                      {category === 'gaming' && '🎮 Oyun & Eğlence'}
                      {category === 'creativity' && '🎨 Resim & Yaratıcılık'}
                      {category === 'science' && '🧪 Bilim & Uzay'}
                    </span>
                  </div>
                </div>

                {/* Score Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-2xl text-yellow-400">
                      ⭐
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">Toplam Yıldızım</div>
                      <div className="text-2xl font-bold font-mono text-yellow-300">{mathScore} Yıldız</div>
                    </div>
                  </div>

                  <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-400/10 border border-pink-400/30 flex items-center justify-center text-2xl text-pink-400">
                      🏆
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono tracking-wider text-white/40">En Yüksek Skor (Oyun)</div>
                      <div className="text-2xl font-bold font-mono text-pink-300">{highScore} Puan</div>
                    </div>
                  </div>
                </div>

                {/* Suggestion / Shortcut Cards */}
                <div>
                  <h3 className="text-xs uppercase font-mono text-white/40 tracking-wider mb-3">Aktif Keşif Araçları</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {category === 'education' && (
                      <>
                        <button 
                          onClick={() => setActiveTab('math')}
                          className="bg-white/5 border border-white/10 hover:border-yellow-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Brain className="text-yellow-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Matematik Soruları</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Çöz ve 10 yıldız kazan!</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('homework')}
                          className="bg-white/5 border border-white/10 hover:border-yellow-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <BookOpen className="text-yellow-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Ödevlerim</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Görevlerini tamamla.</div>
                        </button>
                      </>
                    )}

                    {category === 'gaming' && (
                      <>
                        <button 
                          onClick={() => setActiveTab('snake')}
                          className="bg-white/5 border border-white/10 hover:border-pink-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Gamepad2 className="text-pink-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Retro Yılan Oyunu</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">En yüksek skoru kır!</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('math')}
                          className="bg-white/5 border border-white/10 hover:border-pink-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Brain className="text-pink-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Matematik Bulmacası</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Zihnini çalıştır!</div>
                        </button>
                      </>
                    )}

                    {category === 'creativity' && (
                      <>
                        <button 
                          onClick={() => setActiveTab('paint')}
                          className="bg-white/5 border border-white/10 hover:border-teal-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Paintbrush className="text-teal-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Sihirli Tuval</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Özgürce resim çiz ve boya!</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('homework')}
                          className="bg-white/5 border border-white/10 hover:border-teal-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Sparkles className="text-teal-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Masal Kitabım</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Kendi hikayeni oluştur.</div>
                        </button>
                      </>
                    )}

                    {category === 'science' && (
                      <>
                        <button 
                          onClick={() => setActiveTab('planet')}
                          className="bg-white/5 border border-white/10 hover:border-purple-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Rocket className="text-purple-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Gezegen Gezgini</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Gezegenlerin gizemini çöz!</div>
                        </button>
                        <button 
                          onClick={() => setActiveTab('ai_robot')}
                          className="bg-white/5 border border-white/10 hover:border-purple-400/40 p-4 rounded-xl text-left transition-all hover:bg-white/10 space-y-1"
                        >
                          <Brain className="text-purple-400 w-5 h-5" />
                          <div className="text-xs font-bold font-sans">Bilim Robotu (AI)</div>
                          <div className="text-[10px] text-white/50 leading-relaxed">Soru sor, cevaplasın!</div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: MATHEMATICS (MATEMATİK DEHASI) */}
            {activeTab === 'math' && (
              <motion.div 
                key="math"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="text-4xl">🧮</span>
                  <h3 className="text-lg font-bold text-yellow-300">Süper Matematik Dehası</h3>
                  <p className="text-xs text-white/60">Doğru cevapla, her soruda +10 yıldız kazan!</p>
                </div>

                <div className="bg-black/30 border border-white/10 p-6 rounded-2xl text-center space-y-6">
                  <div className="flex items-center justify-center gap-4 text-3xl font-mono font-bold text-white">
                    <span className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">{mathNum1}</span>
                    <span className="text-yellow-400">{mathOp}</span>
                    <span className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl">{mathNum2}</span>
                    <span className="text-yellow-400">=</span>
                    <span className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-yellow-300">?</span>
                  </div>

                  <form onSubmit={handleMathSubmit} className="space-y-4">
                    <input 
                      type="number"
                      value={mathAnswer}
                      onChange={(e) => setMathAnswer(e.target.value)}
                      placeholder="Cevabını buraya yaz..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-lg font-mono outline-none focus:border-yellow-400"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={16} />
                      <span>Cevabı Kontrol Et!</span>
                    </button>
                  </form>

                  <AnimatePresence mode="wait">
                    {mathFeedback.type && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`p-3 rounded-xl text-xs font-bold ${mathFeedback.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
                      >
                        {mathFeedback.msg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* TAB: HOMEWORK (ÖDEV TAKİBİ / HİKAYE DEFTERİM) */}
            {activeTab === 'homework' && (
              <motion.div 
                key="homework"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-lg mx-auto space-y-6"
              >
                {category === 'creativity' ? (
                  // Creative Story Editor
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-4xl">📖</span>
                      <h3 className="text-lg font-bold text-teal-300">Sihirli Masal Defteri</h3>
                      <p className="text-xs text-white/60">Kendi hayali masalını yaz ve kitaplığını doldur!</p>
                    </div>

                    <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/50 uppercase">Masal Başlığı</label>
                        <input 
                          type="text"
                          placeholder="Örn: Ormandaki Sihirli Sincap"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-white/50 uppercase">Masal İçeriği</label>
                        <textarea 
                          rows={6}
                          placeholder="Bir varmış, bir yokmuş... Uzak diyarlarda..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-400 resize-none font-sans"
                        />
                      </div>
                      <button 
                        onClick={() => {
                          setMathScore(prev => prev + 15);
                          alert('Hikayen sihirli kütüphanene kaydedildi! 🎉 (+15 Yıldız kazandın!)');
                        }}
                        className="w-full py-2.5 rounded-xl bg-teal-500 text-black font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Masalı Kütüphaneye Kaydet</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // School Homework Tracker
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="text-4xl">📝</span>
                      <h3 className="text-lg font-bold text-yellow-300">Ödev & Görev Listem</h3>
                      <p className="text-xs text-white/60">Tamamladığın her ödev için belirtilen yıldızları kazan!</p>
                    </div>

                    <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-4">
                      {/* Add Form */}
                      <form onSubmit={addHomework} className="flex gap-2">
                        <input 
                          type="text"
                          value={newHomeworkText}
                          onChange={(e) => setNewHomeworkText(e.target.value)}
                          placeholder="Yeni bir ödev/görev yaz..."
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-yellow-400"
                        />
                        <button 
                          type="submit"
                          className="px-4 rounded-xl bg-yellow-400 text-black font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={14} />
                          <span>Ekle</span>
                        </button>
                      </form>

                      {/* Homework list */}
                      <div className="space-y-2">
                        {homeworks.map(hw => (
                          <div 
                            key={hw.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${hw.done ? 'bg-emerald-500/5 border-emerald-500/20 text-white/40 line-through' : 'bg-white/5 border-white/10 text-white hover:border-white/20'}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <button 
                                onClick={() => toggleHomework(hw.id)}
                                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${hw.done ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/30 hover:border-yellow-400'}`}
                              >
                                {hw.done && <Check size={14} />}
                              </button>
                              <span className="text-xs font-medium">{hw.text}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-300">
                              <Star size={10} className="fill-yellow-300" />
                              <span>+{hw.points}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: RETRO SNAKE GAME (YILAN OYUNU) */}
            {activeTab === 'snake' && (
              <motion.div 
                key="snake"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 max-w-md mx-auto"
              >
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <Gamepad2 size={18} className="text-pink-400" />
                    <h3 className="text-base font-bold text-pink-300">Klasik Arcade Yılanı</h3>
                  </div>
                  <p className="text-[10px] text-white/50">Klavye Yön Tuşları ile yılanı hareket ettirebilirsin.</p>
                </div>

                <div className="flex justify-between w-full px-2 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-pink-400 fill-pink-400" />
                    <span>Skor: {gameScore}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Trophy size={12} className="fill-yellow-400" />
                    <span>En Yüksek: {highScore}</span>
                  </div>
                </div>

                <div className="relative border-4 border-pink-500/30 rounded-2xl overflow-hidden shadow-2xl">
                  <canvas 
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="block bg-[#1a1a2e]"
                  />

                  {/* Overlays */}
                  {!gameActive && !gameOver && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                      <Gamepad2 className="text-pink-400 w-12 h-12 animate-pulse" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">Oynanmaya Hazır!</h4>
                        <p className="text-[10px] text-white/50">Elmaları yiyerek uzamaya çalış. Kendine veya sınıra çarpma!</p>
                      </div>
                      <button 
                        onClick={() => {
                          resetSnakeGame();
                          setGameActive(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-all flex items-center gap-1.5 shadow-lg shadow-pink-500/20"
                      >
                        <Play size={12} />
                        <span>Oyunu Başlat</span>
                      </button>
                    </div>
                  )}

                  {gameOver && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center gap-4">
                      <div className="text-red-400 text-3xl">👾</div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">Oyun Bitti!</h4>
                        <p className="text-xs text-white/60">Harika oynadın! Topladığın Skor: <span className="text-pink-400 font-bold">{gameScore}</span></p>
                      </div>
                      <button 
                        onClick={() => {
                          resetSnakeGame();
                          setGameActive(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw size={12} />
                        <span>Yeniden Başlat</span>
                      </button>
                    </div>
                  )}
                </div>

                {gameActive && (
                  <button 
                    onClick={() => setGameActive(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/60 hover:text-white transition-all flex items-center gap-1"
                  >
                    <Square size={10} />
                    <span>Durdur</span>
                  </button>
                )}
              </motion.div>
            )}

            {/* TAB: Sihirli Tuval Paint */}
            {activeTab === 'paint' && (
              <motion.div 
                key="paint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 max-w-xl mx-auto"
              >
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <Paintbrush size={18} className="text-teal-400" />
                    <h3 className="text-base font-bold text-teal-300">Sihirli Tuval</h3>
                  </div>
                  <p className="text-[10px] text-white/50">İstediğin renkleri, çıkartmaları seçip harika resimler oluştur!</p>
                </div>

                {/* Paint Toolbox */}
                <div className="bg-black/30 border border-white/10 p-3.5 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
                  {/* Colors */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-mono text-white/40 uppercase">Renk Seç</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {['#ff2a6d', '#ff9f1c', '#ffd166', '#01f187', '#05d9e8', '#af40ff', '#ffffff'].map(color => (
                        <button 
                          key={color}
                          onClick={() => { setPaintColor(color); setSelectedStamp(null); }}
                          className={`w-6 h-6 rounded-full border transition-all ${paintColor === color && !selectedStamp ? 'scale-110 border-white ring-2 ring-teal-400' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stamp Stickers */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-mono text-white/40 uppercase">Çıkartma Yapıştır</div>
                    <div className="flex gap-1">
                      {['⭐', '🌸', '🎈', '🐱', '🚀', '🍕'].map(stamp => (
                        <button 
                          key={stamp}
                          onClick={() => setSelectedStamp(stamp)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm bg-white/5 border transition-all hover:bg-white/10 ${selectedStamp === stamp ? 'border-teal-400 bg-teal-400/10 scale-110' : 'border-white/10'}`}
                        >
                          {stamp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size and Clear */}
                  <div className="flex gap-3 items-end shrink-0">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono text-white/40 uppercase">Boyut: {brushSize}</div>
                      <input 
                        type="range"
                        min={3}
                        max={30}
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        className="w-20 accent-teal-400"
                      />
                    </div>

                    <button 
                      onClick={clearPaint}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      <span>Temizle</span>
                    </button>
                  </div>
                </div>

                {/* Paint Canvas */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#101018] shadow-inner">
                  <canvas 
                    ref={paintCanvasRef}
                    width={480}
                    height={300}
                    className="block cursor-crosshair max-w-full w-full"
                    onMouseDown={startPaint}
                    onMouseMove={drawPaint}
                    onMouseUp={stopPaint}
                    onMouseLeave={stopPaint}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB: PLANET GEZGİNİ (GEZEGEN KAŞİFİ) */}
            {activeTab === 'planet' && (
              <motion.div 
                key="planet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <span className="text-4xl">🚀</span>
                  <h3 className="text-lg font-bold text-purple-300">Güneş Sistemi Gezgini</h3>
                  <p className="text-xs text-white/60">Gezegenleri keşfetmek için bir tanesine tıkla!</p>
                </div>

                {/* Planets Selection bar */}
                <div className="flex gap-2 pb-2 overflow-x-auto justify-start sm:justify-center border-b border-white/5">
                  {Object.entries(planets).map(([key, value]) => (
                    <button 
                      key={key}
                      onClick={() => setSelectedPlanet(key)}
                      className={`px-3.5 py-2.5 rounded-2xl flex flex-col items-center gap-1 shrink-0 transition-all border ${selectedPlanet === key ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold scale-105' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'}`}
                    >
                      <span className="text-2xl">{value.emoji}</span>
                      <span className="text-[10px] font-mono">{value.name}</span>
                    </button>
                  ))}
                </div>

                {/* Planet Facts Card */}
                {planets[selectedPlanet] && (
                  <motion.div 
                    key={selectedPlanet}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/30 border border-purple-500/15 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center"
                  >
                    {/* Planet Emoji representation */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-6xl sm:text-7xl shadow-2xl relative" style={{ backgroundColor: `${planets[selectedPlanet].color}15`, border: `2px solid ${planets[selectedPlanet].color}40` }}>
                      <span className="animate-pulse">{planets[selectedPlanet].emoji}</span>
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(transparent_50%,rgba(0,0,0,0.4))] pointer-events-none" />
                    </div>

                    {/* Facts info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                          <span>{planets[selectedPlanet].name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/10">Keşif Bilgisi</span>
                        </h4>
                        <p className="text-xs text-white/80 leading-relaxed mt-1">{planets[selectedPlanet].desc}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <div className="text-[9px] text-white/40 uppercase">Gezegen Sıcaklığı</div>
                          <div className="text-purple-300 font-bold">{planets[selectedPlanet].temp}</div>
                        </div>
                        <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                          <div className="text-[9px] text-white/40 uppercase">Oradaki Ağırlığın</div>
                          <div className="text-purple-300 font-bold">{planets[selectedPlanet].weight}</div>
                        </div>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl">
                        <div className="text-[10px] uppercase font-bold text-yellow-300 flex items-center gap-1 font-mono">
                          <Sparkles size={11} className="fill-yellow-300 text-yellow-300" />
                          <span>Eğlenceli Çocuk Bilgisi:</span>
                        </div>
                        <p className="text-xs text-purple-200 mt-1 leading-relaxed italic">"{planets[selectedPlanet].funFact}"</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* TAB: BİLİM ROBOTU (AI CHAT SIMULATOR) */}
            {activeTab === 'ai_robot' && (
              <motion.div 
                key="ai_robot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-[380px] border border-white/10 rounded-2xl overflow-hidden bg-black/40"
              >
                {/* Chat header */}
                <div className="bg-purple-900/10 border-b border-white/10 px-4 py-2 flex items-center gap-2 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold font-mono text-purple-300">Yapay Zeka Bilim Robotu Dostum</span>
                </div>

                {/* Chat window */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3 flex flex-col">
                  {chatLog.map((log, index) => (
                    <div 
                      key={index}
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${log.sender === 'kid' ? 'bg-purple-600 text-white self-end rounded-br-none' : 'bg-white/5 border border-white/10 text-white/90 self-start rounded-bl-none whitespace-pre-wrap'}`}
                    >
                      {log.text}
                    </div>
                  ))}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendAiMessage} className="p-2 border-t border-white/10 bg-black/20 flex gap-2 shrink-0">
                  <input 
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Dinozorları, uzayı, kara delikleri sor..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all text-white flex items-center justify-center shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
