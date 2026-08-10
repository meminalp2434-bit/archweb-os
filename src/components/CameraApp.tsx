import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Camera, Video, RefreshCw, Download, Check, Image as ImageIcon, 
  SwitchCamera, ExternalLink, Upload, Sparkles, Mic, MicOff, Square, 
  Play, Pause, Copy, Volume2, Bot, HelpCircle, BookOpen, Search,
  Radio, Users, MessageSquare, Monitor, Send, Hash, Shield, Smile, PhoneOff, VideoOff
} from 'lucide-react';
import { saveOfflineFile } from '../utils/localFileSystem';
import { getApiUrl } from '../utils/api';

interface CameraAppProps {
  onClose: () => void;
}

interface StreamMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  avatar: string;
  isAi?: boolean;
}

export const CameraApp: React.FC<CameraAppProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Camera & Mode States: 'photo' | 'video' | 'live'
  const [mode, setMode] = useState<'photo' | 'video' | 'live'>('photo');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Camera Device States
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Video Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const timerRef = useRef<any>(null);

  // Gemini AI States
  const [showGeminiModal, setShowGeminiModal] = useState<boolean>(false);
  const [aiAnalysisImage, setAiAnalysisImage] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Live Broadcast (Discord Style) States
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeRoom, setActiveRoom] = useState<string>('🔊 Genel Canlı Yayın');
  const [liveViewers, setLiveViewers] = useState<number>(14);
  const [liveChatInput, setLiveChatInput] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [speakingParticipant, setSpeakingParticipant] = useState<string | null>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const pipStreamRef = useRef<MediaStream | null>(null);

  const [liveMessages, setLiveMessages] = useState<StreamMessage[]>([
    { id: '1', sender: 'Sistem', text: '🔴 Canlı yayın odasına bağlandınız! Katılımcılar yapay zeka tarafından yönetilmektedir. Sesli veya yazılı konuşabilirsiniz.', time: '13:00', avatar: '🛡️' },
    { id: '2', sender: 'Mehmet_Linux', text: 'Selam millet! Kamera kalitesi harika görünüyor 🔥 Ne üzerine konuşalım?', time: '13:01', avatar: '👨‍💻' },
    { id: '3', sender: 'Elif_Dev', text: 'ArchWeb OS canlı yayın alanı çok hızlı çalışıyor! Sorularınızı bekliyoruz.', time: '13:02', avatar: '👩‍💻' },
    { id: '4', sender: 'Gemini AI Bot', text: '🤖 Yayına katılan herkese merhaba! Yapay zeka ile sorularınızı anında hem sesli hem yazılı yanıtlayabilirim.', time: '13:02', avatar: '✨', isAi: true }
  ]);

  const startCamera = useCallback(async (
    targetFacingMode: 'user' | 'environment', 
    specificDeviceId: string | null = null,
    withAudio: boolean = false
  ) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraError(null);

    const tryStream = async (videoConstraints: MediaTrackConstraints | boolean, audio: boolean): Promise<MediaStream> => {
      return await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audio
      });
    };

    let newStream: MediaStream | null = null;

    try {
      if (specificDeviceId) {
        try {
          newStream = await tryStream({
            deviceId: { ideal: specificDeviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, withAudio);
        } catch (e) {
          console.warn("Target deviceId failed...", e);
        }
      }

      if (!newStream) {
        try {
          newStream = await tryStream({
            facingMode: { ideal: targetFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }, withAudio);
        } catch (e) {
          console.warn("Facing mode ideal failed...", e);
        }
      }

      if (!newStream) {
        try {
          newStream = await tryStream({ facingMode: targetFacingMode }, withAudio);
        } catch (e) {
          console.warn("Simple facing mode failed...", e);
        }
      }

      if (!newStream && withAudio) {
        try {
          newStream = await tryStream(true, false);
        } catch (e) {
          console.warn("Fallback without audio...", e);
        }
      }

      if (!newStream) {
        newStream = await tryStream(true, false);
      }

      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setFacingMode(targetFacingMode);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);

        if (newStream.getVideoTracks().length > 0) {
          const settings = newStream.getVideoTracks()[0].getSettings();
          if (settings.deviceId) {
            setCurrentCameraId(settings.deviceId);
          }
        }
      } catch (enumErr) {
        console.warn("Device enumeration failed:", enumErr);
      }

    } catch (err: any) {
      console.error("Camera start error:", err);
      setCameraError(
        targetFacingMode === 'environment'
          ? "Arka kameraya erişilemedi veya cihazınızda arka kamera bulunamadı."
          : "Kameraya erişim reddedildi veya kamera bulunamadı."
      );
    }
  }, []);

  useEffect(() => {
    startCamera('user', null, (mode === 'video' && includeAudio) || mode === 'live');

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCamera, mode, includeAudio]);

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';

    if (availableCameras.length > 1) {
      let currentIndex = availableCameras.findIndex(d => d.deviceId === currentCameraId);
      if (currentIndex === -1) currentIndex = 0;

      const nextIndex = (currentIndex + 1) % availableCameras.length;
      const nextCamera = availableCameras[nextIndex];

      const isNextEnv = nextCamera.label.toLowerCase().includes('back') || 
                        nextCamera.label.toLowerCase().includes('arka') ||
                        nextCamera.label.toLowerCase().includes('environment') ||
                        nextMode === 'environment';

      startCamera(isNextEnv ? 'environment' : 'user', nextCamera.deviceId, (mode === 'video' && includeAudio) || mode === 'live');
    } else {
      startCamera(nextMode, null, (mode === 'video' && includeAudio) || mode === 'live');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (file.type.startsWith('video/')) {
            setCapturedVideoUrl(event.target.result as string);
            setCapturedImage(null);
          } else {
            setCapturedImage(event.target.result as string);
            setCapturedVideoUrl(null);
          }
          setCameraError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const captureFrameFromVideo = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    }
    return null;
  };

  const takePhoto = () => {
    const frame = captureFrameFromVideo();
    if (frame) {
      setCapturedImage(frame);
      setCapturedVideoUrl(null);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : 'video/webm';

      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideoUrl(videoUrl);
        setCapturedImage(null);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Video kayıt hatası:", err);
      setSuccessToast("Video kaydı başlatılamadı.");
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setCapturedVideoUrl(null);
    if (isRecording) {
      stopRecording();
    }
  };

  const savePhotoToSystem = () => {
    if (capturedImage) {
      const fileName = `fotograf_${Date.now()}.png`;
      const virtualPath = `/home/user/Resimler/${fileName}`;
      saveOfflineFile(virtualPath, capturedImage);
      setSuccessToast(`Fotoğraf kaydedildi: ${virtualPath}`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else if (capturedVideoUrl) {
      const fileName = `video_${Date.now()}.webm`;
      const virtualPath = `/home/user/Videolar/${fileName}`;
      saveOfflineFile(virtualPath, capturedVideoUrl);
      setSuccessToast(`Video kaydedildi: ${virtualPath}`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const downloadMedia = () => {
    if (capturedImage) {
      const a = document.createElement('a');
      a.href = capturedImage;
      a.download = `archweb_foto_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (capturedVideoUrl) {
      const a = document.createElement('a');
      a.href = capturedVideoUrl;
      a.download = `archweb_video_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      startCamera(facingMode, currentCameraId, true);
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        streamRef.current = displayStream;
        if (videoRef.current) {
          videoRef.current.srcObject = displayStream;
        }
        setIsScreenSharing(true);
        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          startCamera(facingMode, currentCameraId, true);
        };
      } catch (err) {
        console.warn("Screen share cancelled:", err);
      }
    }
  };

  // Voice Speech Recognition for Live Chat
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSuccessToast("Tarayıcınız otomatik ses tanımayı kısıtlıyor. Aşağıdaki hızlı sesli mesaj düğmelerini kullanabilirsiniz.");
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setSuccessToast("🎤 Mikrofon aktif! Lütfen konuşun, sesiniz algılanıyor...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript;
        if (transcript) {
          setIsListeningVoice(false);
          setSuccessToast(`🗣️ Algılanan Ses: "${transcript}"`);
          handleSendLiveMessage(transcript);
          setTimeout(() => setSuccessToast(null), 3000);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
        setIsListeningVoice(false);
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      setIsListeningVoice(false);
    }
  };

  // Speak AI Participant Voice using Web Speech Synthesis
  const speakParticipantText = (participantName: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Stop any previous speech
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'tr-TR';
      
      // Attempt to load best Turkish voice available in browser
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.startsWith('tr') || v.lang.includes('TR'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      // Persona voice characterization
      if (participantName.includes('Elif')) {
        utterance.pitch = 1.25;
        utterance.rate = 1.05;
      } else if (participantName.includes('Mehmet')) {
        utterance.pitch = 0.85;
        utterance.rate = 0.95;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }

      setSpeakingParticipant(participantName);

      utterance.onend = () => {
        setSpeakingParticipant(null);
      };

      utterance.onerror = () => {
        setSpeakingParticipant(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setSpeakingParticipant(null);
    }
  };

  // Live Chat Send Message with Real Gemini AI Roleplay Response & Multi-Persona Voice Interaction
  const handleSendLiveMessage = async (customText?: string) => {
    const textToSend = customText || liveChatInput;
    if (!textToSend.trim()) return;

    const userMsg: StreamMessage = {
      id: Date.now().toString(),
      sender: 'Sen',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '👤'
    };

    setLiveMessages(prev => [...prev, userMsg]);
    if (!customText) setLiveChatInput('');

    // Available AI personas in the live room
    const personas = [
      { name: 'Gemini AI Bot', avatar: '✨', isAi: true, role: 'Yapay Zeka Asistanı' },
      { name: 'Mehmet_Linux', avatar: '👨‍💻', isAi: true, role: 'Kıdemli Linux Mühendisi' },
      { name: 'Elif_Geliştirici', avatar: '👩‍💻', isAi: true, role: 'Frontend Yazılımcı' }
    ];
    
    // Primary respondent
    const primaryPersona = personas[Math.floor(Math.random() * personas.length)];

    try {
      const response = await fetch(getApiUrl('/api/gemini/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Sen ArchWeb OS canlı yayın odasında ${primaryPersona.name} (${primaryPersona.role}) adında GERÇEK bir canlı yayın katılımcısısın. Yayın odasında sesli sohbet ediyorsun.
Kullanıcı sana veya yayın odasına sesli olarak şunu söyledi: "${textToSend}".
Lütfen Türkçe, son derece neşeli, samimi ve doğal bir konuşma dilinde 1-2 cümlelik yanıt ver.`
        })
      });

      const data = await response.json();
      const replyText = data.reply || `Selam! "${textToSend}" harika bir konu, sesini duymak harika!`;

      const aiMsg: StreamMessage = {
        id: (Date.now() + 1).toString(),
        sender: primaryPersona.name,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: primaryPersona.avatar,
        isAi: primaryPersona.isAi
      };

      setLiveMessages(prev => [...prev, aiMsg]);
      speakParticipantText(primaryPersona.name, replyText);

      // Secondary Persona chimes in 2.5s later for a lively room atmosphere
      setTimeout(async () => {
        const secondaryPersonas = personas.filter(p => p.name !== primaryPersona.name);
        const secondPersona = secondaryPersonas[Math.floor(Math.random() * secondaryPersonas.length)];

        try {
          const secondResp = await fetch(getApiUrl('/api/gemini/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `Sen ArchWeb OS canlı yayın odasında ${secondPersona.name} (${secondPersona.role}) adlı katılımcısın.
${primaryPersona.name} az önce kullanıcının "${textToSend}" ifadesine şu cevabı verdi: "${replyText}".
Sen de neşeli ve onaylayan 1 kısa Türkçe cümle ile sohbete katıl ve sesli yanıt ver.`
            })
          });
          const secondData = await secondResp.json();
          const secondReply = secondData.reply || `Kesinlikle katılıyorum! ArchWeb OS yayın odasında harika bir sohbet oluyor 🔥`;

          const secondMsg: StreamMessage = {
            id: (Date.now() + 2).toString(),
            sender: secondPersona.name,
            text: secondReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: secondPersona.avatar,
            isAi: secondPersona.isAi
          };

          setLiveMessages(prev => [...prev, secondMsg]);
          speakParticipantText(secondPersona.name, secondReply);
        } catch (e) {
          // Ignore secondary error
        }
      }, 3000);

    } catch (err) {
      const fallbackMsg: StreamMessage = {
        id: (Date.now() + 1).toString(),
        sender: primaryPersona.name,
        text: `Selam! "${textToSend}" harika bir soru, yayınımızda sesini duymak çok güzel! 🔥`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: primaryPersona.avatar,
        isAi: true
      };
      setLiveMessages(prev => [...prev, fallbackMsg]);
      speakParticipantText(primaryPersona.name, fallbackMsg.text);
    }
  };

  // Gemini AI Analysis Trigger
  const triggerGeminiAnalysis = async (presetPrompt?: string) => {
    let imgToAnalyze = capturedImage;

    if (!imgToAnalyze) {
      imgToAnalyze = captureFrameFromVideo();
    }

    if (!imgToAnalyze) {
      setSuccessToast("Gemini analizi için kamera görüntüsü alınamadı.");
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    setAiAnalysisImage(imgToAnalyze);
    setShowGeminiModal(true);
    setIsAnalyzing(true);
    setAiResult(null);

    const activePrompt = presetPrompt || customPrompt || "Bu fotoğrafta veya kamera görüntüsünde ne var? Türkçe dilinde çocuklar ve tüm kullanıcılar için neşeli, eğitici ve detaylı açıkla.";

    try {
      const response = await fetch(getApiUrl('/api/gemini/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgToAnalyze,
          prompt: activePrompt
        })
      });

      const data = await response.json();
      if (data.analysis) {
        setAiResult(data.analysis);
      } else if (data.error) {
        setAiResult(`Ağ hatası: ${data.error}`);
      }
    } catch (err: any) {
      setAiResult(`Gemini AI bağlantı hatası: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-md p-1 sm:p-4">
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*,video/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />

        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Camera size={18} className="text-sky-400" />
            <span>Kamera & Discord Canlı Yayın & Gemini AI</span>
            {mode === 'live' && (
              <span className="ml-2 px-2.5 py-0.5 bg-red-600/30 text-red-400 border border-red-500/40 text-xs rounded-full flex items-center gap-1.5 animate-pulse font-bold">
                <Radio size={12} className="animate-spin" />
                CANLI YAYIN ({liveViewers} Katılımcı)
              </span>
            )}
            {isRecording && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-xs rounded-full flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {formatTime(recordingSeconds)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerGeminiAnalysis()}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
              title="Gemini AI Görsel Analizi"
            >
              <Sparkles size={14} className="text-yellow-300 animate-spin-slow" />
              <span>Gemini AI</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title="Dosya Yükle"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Yükle</span>
            </button>
            <button
              onClick={openInNewTab}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Sekmede Aç</span>
            </button>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="bg-emerald-500/20 text-emerald-300 px-4 py-2 text-xs flex items-center gap-2 border-b border-emerald-500/30">
            <Check size={14} className="text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Main Viewport Content Area */}
        <div className="relative bg-black flex-1 min-h-[440px] sm:min-h-[500px] flex items-center justify-center overflow-hidden">
          
          {/* CAMERA ERROR DISPLAY */}
          {cameraError ? (
            <div className="text-center p-6 text-red-400 text-sm max-w-md flex flex-col items-center gap-3">
              <Camera size={48} className="opacity-50" />
              <p className="font-semibold">{cameraError}</p>
              <p className="text-xs text-white/50">
                Tarayıcı kamera izni verilmeli veya dosya yükleme, Gemini AI tespiti ve Discord tarzı canlı oda özelliklerini kullanabilirsiniz.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all"
                >
                  <Upload size={14} />
                  <span>Fotoğraf/Video Yükle</span>
                </button>
                <button
                  onClick={openInNewTab}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl flex items-center gap-2 border border-white/20 transition-all"
                >
                  <ExternalLink size={14} />
                  <span>Yeni Sekmede Aç</span>
                </button>
              </div>
            </div>
          ) : mode === 'live' ? (
            
            /* =========================================
               DISCORD-STYLE LIVE BROADCAST & VOICE ROOM
               ========================================= */
            <div className="w-full h-full flex flex-col md:flex-row bg-[#111214] text-white overflow-hidden">
              
              {/* Left Stage & Video Grid */}
              <div className="flex-1 flex flex-col p-3 bg-[#1e1f22] overflow-y-auto">
                
                {/* Room Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-emerald-400" />
                    <span className="font-bold text-sm">{activeRoom}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full border border-emerald-500/30">
                      Discord Mesh Oda
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Users size={14} className="text-sky-400" />
                    <span>{liveViewers} Kişi Dinliyor & İzliniyor</span>
                  </div>
                </div>

                {/* Video Participants Mesh Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-[300px] relative">
                  
                  {/* Participant 1: LOCAL USER (Live Camera Feed or Screen Share) */}
                  <div className="relative bg-[#2b2d31] rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-lg flex flex-col justify-between group">
                    {isVideoDisabled ? (
                      <div className="w-full h-full min-h-[160px] flex flex-col items-center justify-center bg-zinc-900 text-white/50 gap-2">
                        <VideoOff size={32} />
                        <span className="text-xs">Kameranız Kapalı</span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full min-h-[160px]">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className={`w-full h-full object-cover ${facingMode === 'user' && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
                        />
                        {/* PiP Camera Overlay when Screen Sharing */}
                        {isScreenSharing && (
                          <div className="absolute top-2 right-2 w-28 h-20 bg-black/90 rounded-xl overflow-hidden border-2 border-sky-400 shadow-2xl flex flex-col items-center justify-center">
                            <video
                              ref={pipVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                            <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-black/70 text-[8px] font-bold text-sky-300 rounded">Kameranız</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Sen ({isScreenSharing ? 'Ekran Paylaşılıyor (PiP Kamera)' : 'Ana Yayıncı'})</span>
                    </div>

                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <div className={`p-1.5 rounded-lg backdrop-blur-md ${isMicMuted ? 'bg-red-500/80 text-white' : 'bg-emerald-500/80 text-white animate-pulse'}`}>
                        {isMicMuted ? <MicOff size={13} /> : <Mic size={13} />}
                      </div>
                    </div>
                  </div>

                  {/* Participant 2: Mehmet_Linux */}
                  <div className={`relative bg-[#2b2d31] rounded-2xl overflow-hidden border-2 transition-all shadow-lg flex flex-col justify-between min-h-[160px] ${
                    speakingParticipant === 'Mehmet_Linux' ? 'border-emerald-400 shadow-emerald-500/30 ring-2 ring-emerald-400/50' : 'border-white/10'
                  }`}>
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-4 relative">
                      <div className={`w-16 h-16 rounded-full bg-indigo-600 border-4 flex items-center justify-center text-xl font-bold text-white shadow-xl transition-all ${
                        speakingParticipant === 'Mehmet_Linux' ? 'border-emerald-400 scale-110 animate-pulse' : 'border-indigo-400/50'
                      }`}>
                        👨‍💻
                      </div>
                      <span className="text-xs font-bold mt-2 text-white">Mehmet_Linux</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${speakingParticipant === 'Mehmet_Linux' ? 'text-emerald-400 font-bold animate-pulse' : 'text-emerald-400'}`}>
                        {speakingParticipant === 'Mehmet_Linux' ? '🔊 Konuşuyor (Sesli Yapay Zeka)' : 'Yayında (Görüntülü)'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                      <span>Kıdemli Linux Geliştirici</span>
                    </div>
                  </div>

                  {/* Participant 3: Elif_Geliştirici */}
                  <div className={`relative bg-[#2b2d31] rounded-2xl overflow-hidden border-2 transition-all shadow-lg flex flex-col justify-between min-h-[160px] ${
                    speakingParticipant === 'Elif_Geliştirici' ? 'border-purple-400 shadow-purple-500/30 ring-2 ring-purple-400/50' : 'border-white/10'
                  }`}>
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-4">
                      <div className={`w-16 h-16 rounded-full bg-purple-600 border-2 flex items-center justify-center text-xl font-bold text-white shadow-xl transition-all ${
                        speakingParticipant === 'Elif_Geliştirici' ? 'border-yellow-300 scale-110 animate-pulse' : 'border-purple-400'
                      }`}>
                        👩‍💻
                      </div>
                      <span className="text-xs font-bold mt-2 text-white">Elif_Geliştirici</span>
                      <span className={`text-[10px] font-mono mt-0.5 ${speakingParticipant === 'Elif_Geliştirici' ? 'text-yellow-300 font-bold animate-pulse' : 'text-purple-300'}`}>
                        {speakingParticipant === 'Elif_Geliştirici' ? '🔊 Konuşuyor (Sesli Yapay Zeka)' : 'Dinliyor & İzliniyor'}
                      </span>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                      <span>Frontend Yazılımcı</span>
                    </div>
                  </div>

                  {/* Participant 4: Gemini AI Live Bot */}
                  <div className={`relative bg-[#2b2d31] rounded-2xl overflow-hidden border-2 transition-all shadow-lg flex flex-col justify-between min-h-[160px] ${
                    speakingParticipant === 'Gemini AI Bot' ? 'border-yellow-400 shadow-yellow-500/30 ring-2 ring-yellow-400/50' : 'border-purple-500/50'
                  }`}>
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 via-indigo-950 to-slate-950 p-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 flex items-center justify-center text-yellow-300 shadow-xl transition-all ${
                        speakingParticipant === 'Gemini AI Bot' ? 'border-yellow-300 scale-110 animate-pulse' : 'border-yellow-300/60'
                      }`}>
                        <Sparkles size={28} className={speakingParticipant === 'Gemini AI Bot' ? 'animate-spin' : ''} />
                      </div>
                      <span className="text-xs font-bold mt-2 text-yellow-300 flex items-center gap-1">
                        Gemini AI Bot
                      </span>
                      <span className={`text-[10px] font-mono mt-0.5 ${speakingParticipant === 'Gemini AI Bot' ? 'text-yellow-300 font-bold animate-pulse' : 'text-purple-300'}`}>
                        {speakingParticipant === 'Gemini AI Bot' ? '🔊 Konuşuyor (Yapay Zeka)' : 'Canlı AI Asistanı'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Bottom Discord Controls Bar */}
                <div className="mt-3 p-2 bg-[#2b2d31] rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMicMuted(prev => !prev)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isMicMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                      <span className="hidden sm:inline">{isMicMuted ? 'Susturuldu' : 'Mikrofon Açık'}</span>
                    </button>

                    <button
                      onClick={() => setIsVideoDisabled(prev => !prev)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isVideoDisabled ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isVideoDisabled ? <VideoOff size={16} /> : <Video size={16} />}
                      <span className="hidden sm:inline">{isVideoDisabled ? 'Kamera Kapalı' : 'Kamera Açık'}</span>
                    </button>

                    <button
                      onClick={toggleScreenShare}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Monitor size={16} />
                      <span className="hidden sm:inline">{isScreenSharing ? 'Ekran Paylaşılıyor' : 'Ekran Paylaş'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleCamera}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                      title="Kamera Değiştir"
                    >
                      <SwitchCamera size={16} />
                    </button>
                    <button
                      onClick={() => triggerGeminiAnalysis()}
                      className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20"
                    >
                      <Sparkles size={14} className="text-yellow-300" />
                      <span>Gemini AI</span>
                    </button>
                    <button
                      onClick={() => setMode('photo')}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      title="Yayından Ayrıl"
                    >
                      <PhoneOff size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Discord Live Chat */}
              <div className="w-full md:w-80 bg-[#2b2d31] border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-[280px] md:h-auto">
                <div className="px-4 py-3 bg-[#1e1f22] border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <MessageSquare size={16} className="text-sky-400" />
                    <span>Canlı Sohbet</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Aktif Oda</span>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
                  {liveMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                      <span className="text-base">{msg.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${msg.isAi ? 'text-yellow-300' : 'text-sky-300'}`}>
                            {msg.sender}
                          </span>
                          <span className="text-[9px] text-white/40">{msg.time}</span>
                        </div>
                        <p className="text-white/90 text-xs mt-0.5 break-words">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Voice Prompts */}
                <div className="px-3 py-1.5 bg-[#18191c] border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-white/40 shrink-0">Hızlı Ses:</span>
                  {[
                    "Selam millet, nasılsınız?",
                    "ArchWeb OS yayını nasıl gidiyor?",
                    "Yapay zeka bana kendinden bahset!",
                    "Bu yayında ne yapıyoruz?"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendLiveMessage(preset)}
                      className="px-2 py-0.5 bg-white/5 hover:bg-sky-500/20 text-sky-300 hover:text-white border border-white/10 hover:border-sky-400/40 rounded-full text-[10px] whitespace-nowrap transition-all shrink-0"
                    >
                      🗣️ {preset}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-[#1e1f22] border-t border-white/10 flex items-center gap-2">
                  <button
                    onClick={startVoiceInput}
                    className={`p-2 rounded-xl transition-all font-bold ${
                      isListeningVoice 
                        ? 'bg-red-500 text-white animate-bounce' 
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                    title="Sesli Konuş (Mikrofon Dinliyor)"
                  >
                    <Mic size={14} className={isListeningVoice ? 'animate-pulse' : ''} />
                  </button>
                  <input 
                    type="text"
                    value={liveChatInput}
                    onChange={(e) => setLiveChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendLiveMessage()}
                    placeholder={isListeningVoice ? "Konuşmanız dinleniyor..." : "Sohbet odasına yaz veya sesli sor..."}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={() => handleSendLiveMessage()}
                    className="p-2 bg-sky-500 hover:bg-sky-600 text-black font-bold rounded-xl transition-all"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

            </div>

          ) : capturedImage ? (
            /* CAPTURED PHOTO REVIEW */
            <div className="flex flex-col items-center justify-center p-4 w-full h-full gap-4">
              <img src={capturedImage} alt="Çekilen Fotoğraf" className="max-h-[50vh] rounded-xl shadow-2xl border border-white/10 object-contain" />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={resetCapture}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <RefreshCw size={14} />
                  <span>Tekrar Çek</span>
                </button>
                <button 
                  onClick={() => triggerGeminiAnalysis()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25"
                >
                  <Sparkles size={14} className="text-yellow-300" />
                  <span>Gemini AI ile Analiz Et</span>
                </button>
                <button 
                  onClick={savePhotoToSystem}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25"
                >
                  <ImageIcon size={14} />
                  <span>Sisteme Kaydet</span>
                </button>
                <button 
                  onClick={downloadMedia}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Download size={14} />
                  <span>Cihaza İndir</span>
                </button>
              </div>
            </div>
          ) : capturedVideoUrl ? (
            /* CAPTURED VIDEO REVIEW */
            <div className="flex flex-col items-center justify-center p-4 w-full h-full gap-4">
              <video src={capturedVideoUrl} controls autoPlay className="max-h-[50vh] rounded-xl shadow-2xl border border-white/10 object-contain" />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={resetCapture}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <RefreshCw size={14} />
                  <span>Yeni Video Çek</span>
                </button>
                <button 
                  onClick={savePhotoToSystem}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25"
                >
                  <Video size={14} />
                  <span>Sisteme Kaydet (/Videolar)</span>
                </button>
                <button 
                  onClick={downloadMedia}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Download size={14} />
                  <span>Cihaza İndir</span>
                </button>
              </div>
            </div>
          ) : (
            /* LIVE CAMERA STREAM VIEWPORT FOR PHOTO & VIDEO MODES */
            <div className="relative w-full h-full flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-[55vh] object-cover bg-black ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* LIVE CAMERA OVERLAY CONTROLS BAR */}
              <div className="absolute bottom-6 left-0 right-0 px-4 flex items-center justify-between max-w-3xl mx-auto gap-2">
                
                {/* 1. LEFT BOX: KAMERA DEĞİŞTİRME BUTONU + YANINDA FOTOĞRAF, VİDEO VE CANLI YAYIN MOD BUTONLARI */}
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl">
                  {/* Kamera Çevir/Değiştir Butonu */}
                  <button 
                    onClick={toggleCamera}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 flex items-center justify-center"
                    title="Kamerayı Çevir / Değiştir"
                  >
                    <SwitchCamera size={18} />
                  </button>

                  <div className="w-px h-6 bg-white/20 mx-0.5" />

                  {/* Kamera Değiştirme Butonunun YANINDA: Fotoğraf, Video ve Canlı Yayın Mod Butonları */}
                  <button
                    onClick={() => { setMode('photo'); resetCapture(); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      mode === 'photo'
                        ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Fotoğraf Modu"
                  >
                    <Camera size={15} />
                    <span className="hidden sm:inline">Fotoğraf</span>
                  </button>

                  <button
                    onClick={() => { setMode('video'); resetCapture(); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      mode === 'video'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Video Modu"
                  >
                    <Video size={15} />
                    <span className="hidden sm:inline">Video</span>
                  </button>

                  <button
                    onClick={() => { setMode('live'); resetCapture(); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      (mode as string) === 'live'
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title="Discord Tarzı Canlı Yayın ve Sesli Konuşma"
                  >
                    <Radio size={15} className="animate-pulse text-red-500" />
                    <span className="hidden sm:inline">Canlı Yayın</span>
                  </button>
                </div>

                {/* 2. CENTER: MAIN SHUTTER / RECORD BUTTON */}
                <div className="flex items-center justify-center">
                  {mode === 'photo' ? (
                    <button 
                      onClick={takePhoto}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white hover:bg-white/90 border-4 border-black/40 shadow-[0_0_25px_rgba(255,255,255,0.6)] flex items-center justify-center transition-transform active:scale-90"
                      title="Fotoğraf Çek"
                    >
                      <div className="w-12 h-12 rounded-full bg-sky-500 border-2 border-white/50" />
                    </button>
                  ) : isRecording ? (
                    <button 
                      onClick={stopRecording}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-red-600 hover:bg-red-700 border-4 border-white shadow-[0_0_25px_rgba(239,68,68,0.8)] flex items-center justify-center transition-transform active:scale-90 animate-pulse"
                      title="Kaydı Durdur"
                    >
                      <Square size={24} className="text-white fill-white" />
                    </button>
                  ) : (
                    <button 
                      onClick={startRecording}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white hover:bg-white/90 border-4 border-black/40 shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center transition-transform active:scale-90"
                      title="Video Kaydı Başlat"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center border-2 border-white/50">
                        <div className="w-4 h-4 rounded-full bg-white" />
                      </div>
                    </button>
                  )}
                </div>

                {/* 3. RIGHT BOX: GEMINI AI BUTTON + AUDIO/UPLOAD */}
                <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 shadow-2xl">
                  {/* Gemini Yapay Zeka Butonu */}
                  <button
                    onClick={() => triggerGeminiAnalysis()}
                    disabled={isAnalyzing}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 border border-purple-300/30"
                    title="Gemini Yapay Zeka ile Anlık Kamera Analizi"
                  >
                    <Sparkles size={16} className="text-yellow-300 animate-spin-slow" />
                    <span className="hidden sm:inline">Gemini AI</span>
                  </button>

                  {mode === 'video' ? (
                    <button
                      onClick={() => setIncludeAudio(prev => !prev)}
                      className={`p-2 rounded-xl transition-all border ${
                        includeAudio 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}
                      title={includeAudio ? "Sesli Kayıt Aktif" : "Sessiz Kayıt"}
                    >
                      {includeAudio ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                      title="Fotoğraf Yükle"
                    >
                      <Upload size={16} />
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* GEMINI AI VISION & ANALYSIS MODAL */}
      {showGeminiModal && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-[#1e1b4b] border border-purple-500/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-slate-900 flex items-center justify-between border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-yellow-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base flex items-center gap-2">
                    Gemini AI Kamera Analizcisi
                  </h3>
                  <p className="text-purple-300/70 text-xs">Görsel Tanımlama, Nesne Tespiti ve Hikaye Anlatıcı</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowGeminiModal(false); if (isSpeaking) window.speechSynthesis?.cancel(); }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-purple-100 text-sm">
              
              {/* Snapshot Preview & Preset Prompt Badges */}
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-black/40 p-4 rounded-2xl border border-purple-500/20">
                {aiAnalysisImage && (
                  <img 
                    src={aiAnalysisImage} 
                    alt="Gemini Analiz Görseli" 
                    className="w-full sm:w-36 h-28 object-cover rounded-xl border border-white/20 shadow-md"
                  />
                )}
                <div className="flex-1 space-y-2 w-full">
                  <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">Örnek Yapay Zeka İstemleri:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => triggerGeminiAnalysis("Bu fotoğrafta ne var? Çocuklar için neşeli bir dille açıkla.")}
                      className="px-2.5 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Bot size={13} />
                      <span>Bu Fotoğrafta Ne Var?</span>
                    </button>
                    <button
                      onClick={() => triggerGeminiAnalysis("Görseldeki tüm nesneleri ve renkleri detaylıca listele.")}
                      className="px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Search size={13} />
                      <span>Nesneler & Renkler</span>
                    </button>
                    <button
                      onClick={() => triggerGeminiAnalysis("Bu görselden yola çıkarak çocuklar için eğlenceli ve öğretici kısa bir masal/hikaye yaz.")}
                      className="px-2.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <BookOpen size={13} />
                      <span>Görsel Hikaye Yaz</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Gemini Result Container */}
              <div className="bg-black/50 p-5 rounded-2xl border border-purple-500/30 min-h-[160px] flex flex-col justify-between">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-purple-300 text-xs font-medium animate-pulse">
                      Gemini Yapay Zeka görüntüyü inceliyor ve analiz ediyor...
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                      <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Gemini AI Yanıtı:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(aiResult)}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                            isSpeaking 
                              ? 'bg-amber-500 text-black border-amber-400 font-bold' 
                              : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                          }`}
                          title="Sesli Oku"
                        >
                          <Volume2 size={14} />
                          <span>{isSpeaking ? 'Durdur' : 'Sesli Oku'}</span>
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiResult);
                            setSuccessToast("Gemini analizi kopyalandı!");
                            setTimeout(() => setSuccessToast(null), 2500);
                          }}
                          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 text-xs flex items-center gap-1 transition-all"
                          title="Kopyala"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {aiResult}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-purple-300/60 text-xs">
                    Yukarıdaki düğmelere tıklayarak veya aşağıya soru yazarak Gemini AI analizi başlatabilirsiniz.
                  </div>
                )}
              </div>

              {/* Custom Prompt Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customPrompt.trim()) {
                    triggerGeminiAnalysis(customPrompt);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={customPrompt} 
                  onChange={(e) => setCustomPrompt(e.target.value)} 
                  placeholder="Gemini'ye bu görselle ilgili özel soru sor..." 
                  className="flex-1 bg-black/60 border border-purple-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isAnalyzing || !customPrompt.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>Sor</span>
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
