/**
 * Beautiful Web Audio API synthesizer and MP3 playback for the Windows 11 Startup Sound.
 * Fully responsive, offline-ready, clean, and highly authentic.
 */

let hasPlayed = false;

export const playWindows11StartupSound = (volume: number, isMuted: boolean, force = false) => {
  if (isMuted || volume === 0) return;
  if (hasPlayed && !force) return;
  hasPlayed = true;

  // Try playing the official Windows 11 startup MP3 first
  const audio = new Audio("https://win11.blueedge.me/audio/startup.mp3");
  audio.volume = volume / 100;
  audio.muted = isMuted;

  audio.play()
    .then(() => {
      console.log("Played official Windows 11 startup sound successfully.");
    })
    .catch((err) => {
      console.warn("Direct MP3 playback blocked or failed, falling back to synthesizer:", err);
      playSynthesizedWindows11StartupSound(volume, isMuted);
    });
};

export const playSynthesizedWindows11StartupSound = (volume: number, isMuted: boolean) => {
  if (isMuted || volume === 0) return;
  
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  try {
    const ctx = new AudioContext();
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Scale target volume to a pleasant maximum level
    const targetVol = (volume / 100) * 0.35;
    mainGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.2);
    mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6.0);
    
    mainGain.connect(ctx.destination);
    
    // 1. WARM AMBIENT SYNTH PAD LAYER (Beautiful chords that build the rich Win11 background)
    // F# major 7th / 9th chords: F#2, C#3, F#3, A#3, C#4, F#4, G#4
    const baseFreqs = [92.50, 138.59, 185.00, 233.08, 277.18, 369.99, 415.30];
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      // Alternate waveforms for high analog texture
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slight detuning for chorus/ensemble effect
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);
      
      // Staggered pad fade-in
      oscGain.gain.setValueAtTime(0, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.4 + Math.random() * 0.4);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5 + Math.random() * 1.0);
      
      osc.connect(oscGain);
      oscGain.connect(mainGain);
      osc.start();
      osc.stop(ctx.currentTime + 6.0);
    });
    
    // 2. SPARKLING BELL CHIME LAYER (Four note crystalline bell scale)
    // Notes: C#5 (554.37 Hz), F#5 (698.46 Hz), G#5 (830.61 Hz), C#6 (1108.73 Hz)
    const chimeNotes = [
      { freq: 554.37, delay: 1.0 },
      { freq: 698.46, delay: 1.15 },
      { freq: 830.61, delay: 1.30 },
      { freq: 1108.73, delay: 1.50 }
    ];
    
    chimeNotes.forEach((note) => {
      const tStart = ctx.currentTime + note.delay;
      
      // Build a multi-harmonic realistic physical bell tone for each note
      createBellTone(ctx, note.freq, tStart, 1.0, mainGain);
      createBellTone(ctx, note.freq * 2.0, tStart, 0.45, mainGain);
      createBellTone(ctx, note.freq * 3.0, tStart, 0.25, mainGain);
      createBellTone(ctx, note.freq * 4.1, tStart, 0.15, mainGain); // slight inharmonicity
    });
    
  } catch (err) {
    console.warn("Audio Context playback failed:", err);
  }
};

const createBellTone = (
  ctx: AudioContext, 
  freq: number, 
  startTime: number, 
  intensity: number, 
  destination: AudioNode
) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.setValueAtTime(0, startTime);
  // Instant crystalline hit
  gain.gain.linearRampToValueAtTime(0.07 * intensity, startTime + 0.02);
  // Sweet ringing decay tail
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8);
  
  // Natural frequency vibrato
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  vibrato.frequency.value = 5.2; // 5.2 Hz rate
  vibratoGain.gain.value = 4; // vibrato depth
  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.detune);
  vibrato.start(startTime);
  vibrato.stop(startTime + 3.0);
  
  osc.connect(gain);
  gain.connect(destination);
  
  osc.start(startTime);
  osc.stop(startTime + 3.2);
};

