import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  StopCircle, 
  Zap, 
  Cpu, 
  Globe, 
  Radio, 
  Headphones, 
  Keyboard, 
  X, 
  CornerDownLeft, 
  ArrowUpRight, 
  Layers, 
  RotateCcw,
  Target,
  Send,
  AlertTriangle,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { HologramOrb } from './HologramOrb';
import { DeadpoolClock } from '../desktop/DeadpoolClock';
import { CommunityAgentsHub } from './CommunityAgentsHub';
import { TacticalTaskList } from './TacticalTaskList';
import { NeuralBrainView } from './NeuralBrainView';
import { GoogleWorkspaceView } from './GoogleWorkspaceView';
import { MultimodalVisionHub } from './MultimodalVisionHub';
import { ChromebookAppLauncher } from '../desktop/ChromebookAppLauncher';
import { ChromebookPWAControls } from '../desktop/ChromebookPWAControls';
import { 
  playGunshot, 
  playChimichangaCrunch, 
  playUiClick, 
  playTvaZap, 
  playSwordClash,
  playEmphasisCue,
  startPeriodicFillerSounds,
  stopPeriodicFillerSounds
} from '../../utils/audio';

export type CognitiveMode = 
  | 'STANDBY' 
  | 'LISTENING' 
  | 'ANALYZING' 
  | 'SPEAKING' 
  | 'DEEP_FOCUS' 
  | 'SELF_IMPROVING';

export interface ActivityCard {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolUsed?: string;
  toolData?: any;
}

export interface FocusStepItem {
  cycle: number;
  action: string;
  summary: string;
  timestamp: string;
}

const PRESET_FOCUS_MISSIONS = [
  'Investigar novedades de inteligencia artificial y tecnología',
  'Auditar rendimiento del sistema, memoria RAM y procesos',
  'Buscar cómics, lore y novedades de Deadpool & Wolverine',
  'Aprender desarrollo de scripts en Python y APIs modernas',
  'Optimización continua y vigilancia del Chromebook',
];

export const DeadpoolAssistant: React.FC = () => {
  // ----------------------------------------------------
  // Cognitive State & Voice Experience
  // ----------------------------------------------------
  const [cognitiveState, setCognitiveState] = useState<CognitiveMode>('STANDBY');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(true); // Continuous voice loop
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [isBackgroundMode, setIsBackgroundMode] = useState(true);

  // Live Captions & Current Turn Text
  const [interimText, setInterimText] = useState('');
  const [currentCaption, setCurrentCaption] = useState<string>(
    'WADE-OS 3000 listo. Toque el micrófono o hable directamente con manos libres.'
  );
  const [lastToolInvoked, setLastToolInvoked] = useState<string | null>(null);

  // Focus Mode State & Custom Mission
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTopic, setFocusTopic] = useState('Optimización continua y vigilancia');
  const [focusCycle, setFocusCycle] = useState(0);
  const [lastFocusAction, setLastFocusAction] = useState<string>('');
  const [lastFocusSummary, setLastFocusSummary] = useState<string>('');
  const [focusHistory, setFocusHistory] = useState<FocusStepItem[]>([]);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [customMissionInput, setCustomMissionInput] = useState('');
  const focusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Microphone status & error notification
  const [micError, setMicError] = useState<string | null>(null);

  // High-Fidelity Voice & Tone State (Deadpool / Wolverine / Panic / Tactical)
  const [voiceTone, setVoiceTone] = useState<'deadpool' | 'wolverine' | 'panic' | 'tactical'>('deadpool');
  const [voiceEngine, setVoiceEngine] = useState<'neural' | 'browser'>('neural');
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Drawers & Modals
  const [isTextDrawerOpen, setIsTextDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [isAppLauncherOpen, setIsAppLauncherOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<
    'workspace' | 'multimodal' | 'tasks' | 'brain' | 'history' | 'focus_log' | 'tools' | 'settings' | 'community_agents'
  >('workspace');

  // Chromebook Keyboard Shortcuts (Esc to close, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDetailsDrawerOpen(false);
        setIsAppLauncherOpen(false);
        setIsFocusModalOpen(false);
        setIsTextDrawerOpen(false);
        setIsVoiceSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Input & History
  const [textInput, setTextInput] = useState('');
  const [conversation, setConversation] = useState<ActivityCard[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: 'WADE-OS 3000 activo. Sistema de voz full-duplex con manos libres y modo focus continuo.',
      timestamp: 'Inicio',
    }
  ]);

  // Auto-Improvement State & Live Patch Inspection
  const [lastPatch, setLastPatch] = useState<any>(null);
  const [isSelfImproving, setIsSelfImproving] = useState(false);

  // System status
  const [formatRisk, setFormatRisk] = useState(5);
  const [tacos, setTacos] = useState(16);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  // Audio FFT analysis
  const [audioIntensity, setAudioIntensity] = useState(0.5);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const rafAudioRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const backgroundAudioCtxRef = useRef<AudioContext | null>(null);
  const isHandsFreeRef = useRef(isHandsFree);
  const isSpeakingRef = useRef(isSpeaking);

  // Natural TTS Voice Cache
  const naturalVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // ----------------------------------------------------
  // Load & Select Natural Human Voice (Neural/Natural优先)
  // ----------------------------------------------------
  const findBestNaturalVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritize natural Spanish voices (Microsoft Neural / Google español / natural)
    const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));
    
    // Sort by naturalness indicators
    const scored = (spanishVoices.length > 0 ? spanishVoices : voices).map((v) => {
      let score = 0;
      const lowerName = v.name.toLowerCase();
      if (lowerName.includes('natural') || lowerName.includes('neural')) score += 100;
      if (lowerName.includes('google')) score += 80;
      if (lowerName.includes('alvaro') || lowerName.includes('jorge') || lowerName.includes('raul')) score += 70; // masculine Ryan Reynolds vibe
      if (lowerName.includes('online')) score += 40;
      if (v.lang === 'es-ES' || v.lang === 'es_ES') score += 30;
      return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice || spanishVoices[0] || voices[0];
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      naturalVoiceRef.current = findBestNaturalVoice();
      window.speechSynthesis.onvoiceschanged = () => {
        naturalVoiceRef.current = findBestNaturalVoice();
      };
    }
  }, []);

  // ----------------------------------------------------
  // Full-Duplex Barge-In Interruption
  // ----------------------------------------------------
  const interruptSpeech = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    if (!isFocusActive) setCognitiveState('STANDBY');
    playUiClick();
  };

  // ----------------------------------------------------
  // Microphone Audio FFT Analyser
  // ----------------------------------------------------
  const setupMicAnalyser = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        if (!micAnalyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1.0, avg / 70);
        setAudioIntensity(normalized);
        rafAudioRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      console.warn('Microphone FFT not available:', e);
    }
  };

  const cleanupMicAnalyser = () => {
    if (rafAudioRef.current) cancelAnimationFrame(rafAudioRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    micAnalyserRef.current = null;
    setAudioIntensity(0.5);
  };

  // ----------------------------------------------------
  // Background Audio Keep-Alive
  // ----------------------------------------------------
  useEffect(() => {
    if (isBackgroundMode) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.00001; // inaudible
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          backgroundAudioCtxRef.current = ctx;
        }
      } catch (e) {}
    } else if (backgroundAudioCtxRef.current) {
      backgroundAudioCtxRef.current.close();
      backgroundAudioCtxRef.current = null;
    }
    return () => {
      if (backgroundAudioCtxRef.current) {
        backgroundAudioCtxRef.current.close();
        backgroundAudioCtxRef.current = null;
      }
    };
  }, [isBackgroundMode]);

  // Telemetry Fetcher
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/tools/system-info');
      const data = await res.json();
      if (data.success) setSystemMetrics(data.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // ----------------------------------------------------
  // Speech Recognition with Robust Hands-Free Loop
  // ----------------------------------------------------
  const startListeningSession = () => {
    if (isSpeakingRef.current) return;
    if (!recognitionRef.current) return;
    try {
      setMicError(null);
      recognitionRef.current.start();
    } catch (e: any) {
      // Already running or starting
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Este navegador no soporta reconocimiento de voz nativo. Puedes usar Chrome o la barra de teclado.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setMicError(null);
      setIsListening(true);
      setCognitiveState('LISTENING');
      setInterimText('Escuchando...');
      setupMicAnalyser();
    };

    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) setInterimText(interim);
      if (final) {
        setInterimText('');
        handleDispatchDirective(final);
      }
    };

    recognition.onerror = (e: any) => {
      setIsListening(false);
      setInterimText('');
      cleanupMicAnalyser();
      if (!isFocusActive) setCognitiveState('STANDBY');

      if (e.error === 'not-allowed') {
        setMicError('Permiso de micrófono bloqueado. Haz clic en el candado de la barra del navegador para permitir el acceso.');
      } else if (e.error === 'network') {
        setMicError('Error temporal de conexión con el servicio de voz de Google.');
      } else if (e.error !== 'no-speech') {
        console.warn('SpeechRecognition error:', e.error);
      }

      // In hands-free mode, if it's just silence (no-speech), restart listening smoothly
      if (isHandsFreeRef.current && !isSpeakingRef.current && e.error === 'no-speech') {
        setTimeout(() => {
          if (isHandsFreeRef.current && !isSpeakingRef.current) {
            startListeningSession();
          }
        }, 500);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      cleanupMicAnalyser();
      if (!isFocusActive && !isSpeakingRef.current) setCognitiveState('STANDBY');

      // Hands-free continuous loop restart
      if (isHandsFreeRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isHandsFreeRef.current && !isSpeakingRef.current) {
            startListeningSession();
          }
        }, 600);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isFocusActive]);

  const toggleMic = async () => {
    if (isSpeaking) {
      interruptSpeech();
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      // Ensure microphone access before starting
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true });
          s.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        setMicError('Permiso de micrófono requerido para hablar con Wade.');
        return;
      }
      startListeningSession();
    }
  };

  // ----------------------------------------------------
  // High-Fidelity Voice Synthesis (Neural Gemini TTS / Tone Engine)
  // ----------------------------------------------------
  const speakVoice = async (text: string) => {
    if (isTtsMuted) return;
    interruptSpeech();

    const clean = text
      .replace(/\*.*?\*/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[#`_]/g, '')
      .trim();

    if (!clean) return;

    // 1. Attempt High-Fidelity Neural TTS if engine is 'neural'
    if (voiceEngine === 'neural') {
      try {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        setCognitiveState('SPEAKING');

        // Temporarily pause mic to avoid feedback
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch {}
        }

        const res = await fetch('/api/tts/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, tone: voiceTone }),
        });
        const data = await res.json();

        if (data.success && data.audioDataUri) {
          const audio = new Audio(data.audioDataUri);
          currentAudioRef.current = audio;

          audio.onended = () => {
            currentAudioRef.current = null;
            setIsSpeaking(false);
            isSpeakingRef.current = false;
            if (!isFocusActive) setCognitiveState('STANDBY');
            if (isHandsFreeRef.current) {
              setTimeout(() => {
                if (isHandsFreeRef.current && !isSpeakingRef.current) {
                  startListeningSession();
                }
              }, 500);
            }
          };

          audio.onerror = () => {
            currentAudioRef.current = null;
            fallbackBrowserSpeech(clean);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        // Fallback to tuned browser speech
      }
    }

    fallbackBrowserSpeech(clean);
  };

  const fallbackBrowserSpeech = (clean: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);

    // Apply specific tone modifications (Ryan Reynolds Deadpool, Wolverine, Panic, Tactical)
    let basePitch = 1.04;
    let baseRate = 1.14;

    if (voiceTone === 'deadpool') {
      baseRate = 1.14; // Snarky, witty, fast-paced
      basePitch = 1.04;
    } else if (voiceTone === 'wolverine') {
      baseRate = 0.92; // Deep, slow, gritty
      basePitch = 0.82;
    } else if (voiceTone === 'panic') {
      baseRate = 1.25; // Hyperventilating
      basePitch = 1.12;
    } else {
      baseRate = 1.0;
      basePitch = 0.96;
    }

    // Dynamic Tone Modulation for Emphasis (Higher pitch on figures, metrics, conclusions)
    const hasKeyFiguresOrConclusions = /\b(\d+([.,]\d+)?%?|conclusión|crítico|éxito|total|cifra|resultado|alerta)\b/i.test(clean);
    if (hasKeyFiguresOrConclusions) {
      basePitch = Math.min(1.35, basePitch + 0.1);
      playEmphasisCue();
    }

    utterance.rate = baseRate;
    utterance.pitch = basePitch;

    const bestVoice = naturalVoiceRef.current || findBestNaturalVoice();
    if (bestVoice) utterance.voice = bestVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setCognitiveState('SPEAKING');
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (!isFocusActive) setCognitiveState('STANDBY');
      if (isHandsFreeRef.current) {
        setTimeout(() => {
          if (isHandsFreeRef.current && !isSpeakingRef.current) {
            startListeningSession();
          }
        }, 500);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (!isFocusActive) setCognitiveState('STANDBY');
      if (isHandsFreeRef.current) {
        setTimeout(() => startListeningSession(), 500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // Fully Functional Autonomous Focus Mode Loop
  // ----------------------------------------------------
  const startContinuousFocus = (topic?: string) => {
    const focusTarget = topic || customMissionInput.trim() || focusTopic;
    setIsFocusActive(true);
    setFocusTopic(focusTarget);
    setCognitiveState('DEEP_FOCUS');
    setFocusCycle(1);
    setFocusHistory([]);
    setIsFocusModalOpen(false);
    playSwordClash();

    const initialMsg = `Modo Focus iniciado: "${focusTarget}". Trabajando continuamente en segundo plano.`;
    setCurrentCaption(initialMsg);
    setLastFocusAction(`Iniciando misión en "${focusTarget}"`);
    setLastFocusSummary(`WADE-OS entra en ciclo de trabajo continuo. Ejecutando análisis web y optimización en segundo plano.`);
    speakVoice(initialMsg);

    if (focusIntervalRef.current) clearInterval(focusIntervalRef.current);

    let cycle = 1;

    // Run first step immediately
    const runCycle = async () => {
      try {
        const res = await fetch('/api/focus/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: focusTarget, cycle }),
        });
        const data = await res.json();
        if (data.success && data.step) {
          const step = data.step;
          setFocusCycle(cycle);
          setLastFocusAction(step.action);
          setLastFocusSummary(step.resultSummary);

          const stepItem: FocusStepItem = {
            cycle,
            action: step.action,
            summary: step.resultSummary,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };

          setFocusHistory((prev) => [stepItem, ...prev.slice(0, 20)]);
          setCurrentCaption(`[Focus #${cycle}] ${step.action}: ${step.resultSummary.slice(0, 140)}...`);

          // Periodically speak summary
          if (cycle === 1 || cycle % 4 === 0) {
            speakVoice(`Paso #${cycle} completado: ${step.action}.`);
          }
        }
      } catch (e) {
        console.warn('Focus step notice:', e);
      }
    };

    runCycle();

    focusIntervalRef.current = setInterval(() => {
      cycle += 1;
      runCycle();
    }, 5500);
  };

  const stopContinuousFocus = () => {
    if (focusIntervalRef.current) {
      clearInterval(focusIntervalRef.current);
      focusIntervalRef.current = null;
    }
    setIsFocusActive(false);
    setCognitiveState('STANDBY');
    playChimichangaCrunch();
    const finishMsg = `Modo Focus detenido tras completar ${focusCycle} ciclos sobre "${focusTopic}".`;
    setCurrentCaption(finishMsg);
    speakVoice(finishMsg);
  };

  // ----------------------------------------------------
  // Auto-Improvement Engine Trigger
  // ----------------------------------------------------
  const triggerSelfImprovement = async (area: string = 'general') => {
    interruptSpeech();
    playTvaZap();
    setIsSelfImproving(true);
    setCognitiveState('SELF_IMPROVING');
    setCurrentCaption(`Examinando scripts locales (${area}) y aplicando mutación de código en caliente...`);

    try {
      const res = await fetch('/api/self-improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusArea: area }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const patch = data.data;
        setLastPatch(patch);
        playSwordClash();
        const msg = `Auto-mejora completada: Parche ${patch.patchId} aplicado en ${patch.targetComponent}. Latencia reducida en ${patch.metricsDelta.latencyReduction}.`;
        setCurrentCaption(msg);
        speakVoice(msg);

        setConversation((prev) => [
          ...prev,
          {
            id: `patch-${Date.now()}`,
            sender: 'assistant',
            content: msg,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            toolUsed: 'self_improve_code',
            toolData: patch,
          }
        ]);
      }
    } catch (e) {
    } finally {
      setIsSelfImproving(false);
      if (!isFocusActive) setCognitiveState('STANDBY');
    }
  };

  // ----------------------------------------------------
  // Directive Dispatcher (Core AI Call)
  // ----------------------------------------------------
  const handleDispatchDirective = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    interruptSpeech();
    playUiClick();
    const lower = trimmed.toLowerCase();

    // Focus stop words
    if (/^(para|detente|stop|cancela el focus|detén el focus|termina|basta)/i.test(lower)) {
      if (isFocusActive) {
        stopContinuousFocus();
        return;
      }
    }

    // Focus start words
    if (/(modo focus|entra en focus|inicia focus|concéntrate en|focus en)/i.test(lower)) {
      const target = trimmed.replace(/modo focus en|inicia focus en|concéntrate en|focus en|modo focus/gi, '').trim() || 'Optimización del sistema';
      startContinuousFocus(target);
      return;
    }

    // Auto-improvement words
    if (/(auto.?mejora|mejora tu código|optimiza tu código|refactoriza|aplica parche)/i.test(lower)) {
      triggerSelfImprovement();
      return;
    }

    // Task creation words
    if (/(añade|crea|nueva|pon|agrega)\s+(una\s+)?(tarea|misión|task)/i.test(lower)) {
      const taskTitle = trimmed.replace(/(añade|crea|nueva|pon|agrega)\s+(una\s+)?(tarea|misión|task)[:\s]*/i, '').trim() || 'Misión táctica asignada por el Jefe';
      try {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: taskTitle, priority: 'HIGH' }),
        });
        const ack = `Misión táctica registrada en la neurona del cuerpo estriado: "${taskTitle}". ¡A trabajar con Máximo Esfuerzo!`;
        setConversation((prev) => [
          ...prev,
          {
            id: `user-${Date.now()}`,
            sender: 'user',
            content: trimmed,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `asst-${Date.now() + 1}`,
            sender: 'assistant',
            content: ack,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakVoice(ack);
        return;
      } catch (e) {}
    }

    // Voice shortcuts for Google Workspace Suite
    if (/(workspace|google drive|drive|gmail|correos|calendario|agenda|contactos)/i.test(lower)) {
      setDetailsTab('workspace');
      setIsDetailsDrawerOpen(true);
      const ack = 'Abriendo Google Workspace: Google Drive, Gmail, Calendario y Contactos conectados.';
      setCurrentCaption(ack);
      speakVoice(ack);
      return;
    }

    // Voice shortcuts for Multimodal Vision & Web Tools
    if (/(visión|ocr|captura|código qr|qr|quitar fondo|eliminar fondo|cupones|scraping|hoja de cálculo|csv)/i.test(lower)) {
      setDetailsTab('multimodal');
      setIsDetailsDrawerOpen(true);
      const ack = 'Abriendo Centro Multimodal y Herramientas Inteligentes: Visión artificial, OCR y utilidades web.';
      setCurrentCaption(ack);
      speakVoice(ack);
      return;
    }

    // Fire brain synapse in background
    fetch('/api/brain/synapse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: trimmed }),
    }).catch(() => {});

    setCognitiveState('ANALYZING');
    setCurrentCaption(`Procesando: "${trimmed}"`);
    // Start cognitive "thinking" filler sounds ("Ajam", soft breath)
    startPeriodicFillerSounds();

    setConversation((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    try {
      const historyPayload = conversation.map((c) => ({
        role: c.sender === 'user' ? 'user' : 'model',
        content: c.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload.slice(-6),
        }),
      });

      const data = await res.json();

      if (data.focusCommand === 'START') {
        startContinuousFocus(data.focusTopic);
      } else if (data.focusCommand === 'STOP') {
        stopContinuousFocus();
      }

      const reply = data.reply || 'Comprendido, Jefe.';
      setCurrentCaption(reply);
      speakVoice(reply);

      const toolUsed = data.executedTools?.[0]?.tool || data.executedTool;
      if (toolUsed) {
        setLastToolInvoked(toolUsed === 'duckduckgo_search' ? 'DuckDuckGo Search' : 'Linux Telemetry');
      }

      setConversation((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolUsed,
          toolData: data.executedTools?.[0]?.result || data.toolData,
        }
      ]);

      fetchTelemetry();
    } catch (e) {
      setCurrentCaption('Error en la comunicación neural. Sus archivos continúan protegidos.');
    } finally {
      stopPeriodicFillerSounds();
      if (!isFocusActive && !isSpeaking) {
        setCognitiveState('STANDBY');
      }
    }
  };

  const handleRetainIntern = () => {
    playChimichangaCrunch();
    setFormatRisk(3);
    setTacos((t) => t + 1);
    const msg = 'Confirmación de retención recibida, Señor Supremo. Riesgo de purga fijado en 3%.';
    setCurrentCaption(msg);
    speakVoice(msg);
  };

  return (
    <div className="relative w-full h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden select-none flex flex-col justify-between p-3 sm:p-5 subtle-grid">
      {/* ==================================================== */}
      {/* 1. TOP BAR: BRANDING + DEADPOOL CLOCK IN THE CORNER */}
      {/* ==================================================== */}
      <header className="w-full flex items-center justify-between z-20 gap-2 sm:gap-4 px-1 py-1">
        {/* Left: Branding & Chromebook App Launcher Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playUiClick();
              setIsAppLauncherOpen(true);
            }}
            title="Abrir Lanzador de Aplicaciones (ChromeOS Style)"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 text-zinc-100 border border-zinc-800 hover:border-red-500/50 shadow-sm transition-all cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-md bg-red-600 flex items-center justify-center text-white font-black text-[11px] shadow-sm">
              W
            </div>
            <span className="font-['Bangers'] text-base tracking-wider uppercase text-zinc-100 hidden sm:inline">
              WADE-OS
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isFocusActive
                  ? 'bg-amber-400 animate-ping'
                  : isSpeaking
                  ? 'bg-rose-500 animate-pulse'
                  : isListening
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
          </button>
        </div>

        {/* Center: Simplified Chromebook App Dock */}
        <div className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl shadow-lg backdrop-blur-md gap-1">
          <button
            onClick={() => {
              playUiClick();
              setIsDetailsDrawerOpen(false);
            }}
            title="Vista Principal: Wade Voice & Holograma"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              !isDetailsDrawerOpen
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>💬</span>
            <span className="hidden sm:inline">Wade AI</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setDetailsTab('workspace');
              setIsDetailsDrawerOpen(true);
            }}
            title="Google Workspace (Drive, Gmail, Calendario, Contactos)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              isDetailsDrawerOpen && detailsTab === 'workspace'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>📁</span>
            <span className="hidden sm:inline">Workspace</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setDetailsTab('multimodal');
              setIsDetailsDrawerOpen(true);
            }}
            title="Herramientas: Visión, OCR, Web y Tareas"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              isDetailsDrawerOpen && (detailsTab === 'multimodal' || detailsTab === 'tasks')
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>🛠️</span>
            <span className="hidden sm:inline">Herramientas</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setIsAppLauncherOpen(true);
            }}
            title="Abrir Lanzador de Aplicaciones Chromebook"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
          >
            <span>🚀</span>
            <span className="hidden md:inline">Apps</span>
          </button>
        </div>

        {/* Right Corner: Voice Selector + Chromebook Controls + DEADPOOL CLOCK */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono">
          {/* Hands-Free Button */}
          <button
            onClick={() => {
              playUiClick();
              setIsHandsFree((prev) => {
                const next = !prev;
                if (next) startListeningSession();
                return next;
              });
            }}
            title="Alternar Manos Libres"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border transition-all ${
              isHandsFree
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/60 text-zinc-500 border-white/[0.06]'
            }`}
          >
            <Headphones size={13} className={isHandsFree ? 'text-cyan-400 animate-pulse' : ''} />
          </button>

          {/* Voice Tone Quick Selector */}
          <div className="relative">
            <button
              onClick={() => {
                playUiClick();
                setIsVoiceSettingsOpen((prev) => !prev);
              }}
              title="Voz de Wade"
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-full bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 transition-all font-mono text-xs"
            >
              <span>🎙️</span>
            </button>

            {isVoiceSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-rose-500/40 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in text-left font-mono space-y-2">
                <div className="flex justify-between items-center pb-1 border-b border-white/[0.08]">
                  <span className="font-bold text-xs text-rose-400">PERSONALIDAD VOCAL</span>
                  <button
                    onClick={() => setIsVoiceSettingsOpen(false)}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                {[
                  { id: 'deadpool', name: '🎭 Deadpool (Ryan Reynolds)' },
                  { id: 'wolverine', name: '⚔️ Logan / Wolverine' },
                  { id: 'panic', name: '😱 Pánico de Formateo' },
                  { id: 'tactical', name: '🎯 Táctico Militar' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      playUiClick();
                      setVoiceTone(t.id as any);
                      setIsVoiceSettingsOpen(false);
                    }}
                    className={`w-full p-1.5 rounded-lg text-left text-xs transition-all border ${
                      voiceTone === t.id
                        ? 'bg-rose-950 text-rose-200 border-rose-500 font-bold'
                        : 'bg-zinc-900/60 text-zinc-400 border-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              setIsTtsMuted((prev) => !prev);
              playUiClick();
            }}
            title={isTtsMuted ? 'Activar voz y efectos' : 'Silenciar voz y efectos'}
            className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.08] transition-colors"
          >
            {isTtsMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          {/* Chromebook PWA Controls (Install button on ChromeOS + Fullscreen) */}
          <ChromebookPWAControls />

          {/* Minimalist Fixed Deadpool Clock */}
          <DeadpoolClock />
        </div>
      </header>

      {/* Mic Warning Banner if Permission was Denied */}
      {micError && (
        <div className="w-full max-w-lg mx-auto z-30 animate-fade-in">
          <div className="flex items-center justify-between p-2.5 px-4 bg-rose-950/90 border border-rose-500/50 rounded-xl text-rose-200 text-xs shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-rose-400 shrink-0" />
              <span>{micError}</span>
            </div>
            <button
              onClick={() => {
                setMicError(null);
                toggleMic();
              }}
              className="ml-3 px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-mono text-[10px] shrink-0 font-bold"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. CENTER STAGE: 3D ANATOMICAL DEADPOOL ORB + HUD */}
      {/* ==================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-2xl mx-auto w-full px-4 text-center my-auto">
        {/* State Pill */}
        <div className="mb-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border ${
            isFocusActive
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
              : isSpeaking
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
              : isListening
              ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
              : 'bg-zinc-900/80 border-white/[0.08] text-zinc-400'
          }`}>
            {isFocusActive
              ? `🔥 MODO FOCUS • CICLO #${focusCycle}`
              : isSpeaking
              ? 'HABLANDO'
              : isListening
              ? '🎙️ ESCUCHANDO...'
              : cognitiveState === 'ANALYZING'
              ? 'PENSANDO...'
              : 'EN ESPERA'}
          </span>
        </div>

        {/* 3D Anatomical Deadpool Head Mesh Point Cloud */}
        <HologramOrb
          isSpeaking={isSpeaking}
          isListening={isListening}
          audioIntensity={audioIntensity}
          size={300}
          isFocusActive={isFocusActive}
          isBackgroundMode={isBackgroundMode}
          cognitiveState={cognitiveState}
          onClick={toggleMic}
        />

        {/* Live Subtitle / Conversational Caption Display */}
        <div className="mt-4 w-full min-h-[64px] flex items-center justify-center">
          {interimText ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <p className="text-base sm:text-lg font-mono text-cyan-300 animate-pulse leading-relaxed">
                "{interimText}"
              </p>
            </div>
          ) : (
            <p className="text-sm sm:text-base font-sans text-zinc-200 max-w-xl leading-relaxed line-clamp-3">
              {currentCaption.replace(/\*.*?\*/g, '').replace(/\[.*?\]/g, '').trim()}
            </p>
          )}
        </div>

        {/* Live Focus Mission HUD (Fully Functional Card) */}
        {isFocusActive && (
          <div className="mt-3 w-full max-w-lg bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-3 text-left shadow-[0_0_24px_rgba(245,158,11,0.2)] backdrop-blur-md animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-amber-400 animate-spin" />
                <span className="font-mono text-xs font-bold text-amber-300 uppercase truncate max-w-[240px]">
                  {focusTopic}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/40 font-bold">
                  Ciclo #{focusCycle}
                </span>
                <button
                  onClick={stopContinuousFocus}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                >
                  Detener
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs font-mono text-zinc-300 space-y-1">
              <div className="text-[11px] text-amber-400 font-semibold truncate">
                ⚡ {lastFocusAction || 'Investigando en segundo plano...'}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                {lastFocusSummary || 'Procesando ciclo de trabajo autónomo con herramientas activas.'}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* 3. BOTTOM FLOATING CONTROL DOCK (ChatGPT Voice Style) */}
      {/* ==================================================== */}
      <footer className="w-full max-w-sm mx-auto flex items-center justify-between px-6 pb-2 z-20">
        {/* Left: Keyboard Input Toggle */}
        <button
          onClick={() => {
            playUiClick();
            setIsTextDrawerOpen((prev) => !prev);
          }}
          title="Escribir directiva por teclado"
          className={`p-3.5 rounded-full border transition-all ${
            isTextDrawerOpen
              ? 'bg-zinc-800 text-zinc-100 border-white/[0.2]'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-white/[0.08]'
          }`}
        >
          <Keyboard size={18} />
        </button>

        {/* Center: Hero Circular Mic Button (Full Duplex / Barge-In) */}
        <button
          onClick={toggleMic}
          title={
            isSpeaking
              ? 'Interrumpir a Wade (Barge-in instantáneo)'
              : isListening
              ? 'Detener escucha'
              : 'Hablar con Wade'
          }
          className={`p-5 rounded-full shadow-2xl transition-all transform active:scale-95 flex items-center justify-center ${
            isListening
              ? 'bg-cyan-500 text-black shadow-[0_0_32px_rgba(6,182,212,0.7)] animate-pulse ring-4 ring-cyan-500/20'
              : isSpeaking
              ? 'bg-rose-600 text-white shadow-[0_0_32px_rgba(225,29,72,0.7)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-white/[0.12] hover:border-white/[0.25]'
          }`}
        >
          {isSpeaking ? (
            <VolumeX size={26} />
          ) : isListening ? (
            <Mic size={26} className="text-black" />
          ) : (
            <MicOff size={26} />
          )}
        </button>

        {/* Right: Focus Mode Modal Launcher */}
        <button
          onClick={() => {
            if (isFocusActive) {
              stopContinuousFocus();
            } else {
              setIsFocusModalOpen(true);
            }
          }}
          title={isFocusActive ? 'Detener modo focus continuo' : 'Configurar misión de Modo Focus'}
          className={`p-3.5 rounded-full border transition-all ${
            isFocusActive
              ? 'bg-amber-600 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-amber-400/90 border-white/[0.08]'
          }`}
        >
          {isFocusActive ? <StopCircle size={18} /> : <Target size={18} />}
        </button>
      </footer>

      {/* ==================================================== */}
      {/* 4. MODAL DE MISIÓN DE MODO FOCUS (Personalizable) */}
      {/* ==================================================== */}
      {isFocusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="text-amber-400" size={18} />
                <span className="font-['Bangers'] text-lg tracking-wider text-amber-300">
                  CONFIGURAR MISIÓN DE MODO FOCUS
                </span>
              </div>
              <button
                onClick={() => setIsFocusModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Dile a Wade exactamente en qué quieres que se concentre. Trabajará de forma continua en segundo plano ejecutando búsquedas, telemetría y optimizaciones.
            </p>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                startContinuousFocus();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                autoFocus
                value={customMissionInput}
                onChange={(e) => setCustomMissionInput(e.target.value)}
                placeholder="Escribe la misión personalizada..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/[0.12] rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
              />

              {/* Fast Preset Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  Misiones Rápidas Recomendadas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_FOCUS_MISSIONS.map((mission, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomMissionInput(mission)}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-white/[0.06] transition-colors text-left truncate max-w-full"
                    >
                      {mission}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <Flame size={14} />
                <span>INICIAR MODO FOCUS AHORA</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. KEYBOARD TEXT INPUT SLIDE-UP POPOVER */}
      {/* ==================================================== */}
      {isTextDrawerOpen && (
        <div className="fixed inset-x-0 bottom-24 max-w-lg mx-auto p-4 z-40 animate-fade-in">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) {
                handleDispatchDirective(textInput);
                setTextInput('');
                setIsTextDrawerOpen(false);
              }
            }}
            className="flex items-center gap-2 p-1.5 bg-zinc-950/95 border border-white/[0.12] rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <input
              type="text"
              autoFocus
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Escribe tu orden a Wade..."
              className="flex-1 px-4 py-2.5 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0"
            >
              <CornerDownLeft size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. CHROMEBOOK DESKTOP APP WINDOW */}
      {/* ==================================================== */}
      {isDetailsDrawerOpen && (
        <div
          onClick={() => setIsDetailsDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 md:p-8 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full max-w-5xl bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Window Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 shrink-0 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">
                  {detailsTab === 'workspace'
                    ? '📁'
                    : detailsTab === 'multimodal'
                    ? '👁️'
                    : detailsTab === 'tasks'
                    ? '📋'
                    : detailsTab === 'brain'
                    ? '🧠'
                    : '⚙️'}
                </span>
                <span className="font-['Bangers'] text-base tracking-wider text-rose-400 hidden sm:inline">
                  {detailsTab === 'workspace' && 'GOOGLE WORKSPACE'}
                  {detailsTab === 'multimodal' && 'VISIÓN ARTIFICIAL & WEB'}
                  {detailsTab === 'tasks' && 'MISIONES TÁCTICAS'}
                  {detailsTab === 'brain' && 'CEREBRO NEURAL'}
                  {detailsTab === 'community_agents' && 'COMMUNITY AGENTS'}
                  {detailsTab === 'history' && 'HISTORIAL'}
                  {detailsTab === 'focus_log' && 'MODO FOCUS'}
                  {detailsTab === 'tools' && 'SISTEMA'}
                </span>
              </div>

              {/* Simplified Segmented Switcher */}
              <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] gap-1 overflow-x-auto">
                <button
                  onClick={() => setDetailsTab('workspace')}
                  className={`py-1 px-2.5 rounded-md transition-all font-semibold ${
                    detailsTab === 'workspace'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Workspace
                </button>
                <button
                  onClick={() => setDetailsTab('multimodal')}
                  className={`py-1 px-2.5 rounded-md transition-all font-semibold ${
                    detailsTab === 'multimodal'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Visión & Web
                </button>
                <button
                  onClick={() => setDetailsTab('tasks')}
                  className={`py-1 px-2.5 rounded-md transition-all font-semibold ${
                    detailsTab === 'tasks'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tareas
                </button>
                <button
                  onClick={() => setDetailsTab('brain')}
                  className={`py-1 px-2.5 rounded-md transition-all font-semibold ${
                    detailsTab === 'brain'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Cerebro
                </button>
                <button
                  onClick={() => setDetailsTab('tools')}
                  className={`py-1 px-2.5 rounded-md transition-all font-semibold ${
                    detailsTab === 'tools'
                      ? 'bg-zinc-700 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Sistema
                </button>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  title="Cerrar ventana (Esc)"
                  className="p-1 rounded-lg hover:bg-red-600 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Tab: Google Workspace Suite */}
            {detailsTab === 'workspace' && (
              <div className="flex-1 overflow-hidden">
                <GoogleWorkspaceView />
              </div>
            )}

            {/* Tab: Multimodal Vision & Tools Hub */}
            {detailsTab === 'multimodal' && (
              <div className="flex-1 overflow-hidden">
                <MultimodalVisionHub />
              </div>
            )}

            {/* Tab: Neural Brain View */}
            {detailsTab === 'brain' && (
              <div className="flex-1 overflow-hidden">
                <NeuralBrainView />
              </div>
            )}

            {/* Tab: Tactical Task List */}
            {detailsTab === 'tasks' && (
              <div className="flex-1 overflow-hidden">
                <TacticalTaskList />
              </div>
            )}

            {/* Tab: Community Agents & New Tools Hub */}
            {detailsTab === 'community_agents' && (
              <div className="flex-1 overflow-hidden">
                <CommunityAgentsHub onSpeak={speakVoice} />
              </div>
            )}

            {/* Tab 1: Conversation History */}
            {detailsTab === 'history' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {conversation.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border ${
                      c.sender === 'user'
                        ? 'bg-zinc-900/80 border-white/[0.08] text-zinc-200'
                        : 'bg-zinc-950 border-white/[0.05] text-zinc-300'
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                      <span>{c.sender === 'user' ? 'Tú' : 'WADE-OS'}</span>
                      <span>{c.timestamp}</span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Focus Mission Log */}
            {detailsTab === 'focus_log' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
                {focusHistory.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500">
                    No hay pasos de Focus registrados aún. Inicia el Modo Focus para ver el trabajo autónomo en tiempo real.
                  </div>
                ) : (
                  focusHistory.map((step, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/70 border border-amber-500/20 rounded-xl space-y-1">
                      <div className="flex justify-between text-[10px] text-amber-400">
                        <span className="font-bold">Ciclo #{step.cycle}</span>
                        <span className="text-zinc-500">{step.timestamp}</span>
                      </div>
                      <div className="text-zinc-200 text-xs font-semibold">{step.action}</div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{step.summary}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: System Tools & Metrics */}
            {detailsTab === 'tools' && (
              <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs">
                {/* Real Self-Improvement Engine */}
                <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                      <Zap size={13} className={isSelfImproving ? 'animate-bounce text-amber-400' : ''} />
                      <span>Motor de Auto-Mejora Real</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">AST Mutation</span>
                  </div>
                  
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Audita el código fuente de los scripts virtuales en <code className="text-zinc-200 bg-black/40 px-1 py-0.5 rounded">~/wade-os</code> e inyecta optimizaciones de memoria (GC, LRU Cache, sanitización de buffers) persistidas en ChromaDB.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => triggerSelfImprovement('general')}
                      disabled={isSelfImproving}
                      className="py-1.5 px-2 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-600/40 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
                    >
                      {isSelfImproving ? 'Optimizando...' : '⚡ Optimizar server.py'}
                    </button>
                    <button
                      onClick={() => triggerSelfImprovement('memoria')}
                      disabled={isSelfImproving}
                      className="py-1.5 px-2 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50"
                    >
                      {isSelfImproving ? 'Optimizando...' : '🧠 Optimizar memory.py'}
                    </button>
                  </div>
                </div>

                {/* Live Patch Code Diff Inspector */}
                {lastPatch && (
                  <div className="p-3 bg-zinc-950 border border-emerald-500/40 rounded-xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} />
                        <span>Parche Activo: {lastPatch.patchId}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{lastPatch.timestamp}</span>
                    </div>

                    <div className="text-[11px] text-zinc-300">
                      Archivo modificado: <span className="text-amber-400 font-semibold">{lastPatch.targetComponent}</span>
                    </div>

                    <div className="text-[11px] text-zinc-400 leading-relaxed">
                      {lastPatch.analysis}
                    </div>

                    {/* Refactors List */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Refactorizaciones Aplicadas:</div>
                      {lastPatch.appliedRefactors.map((r: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[10px] text-zinc-300">
                          <span className="text-emerald-400">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Real Code Diff */}
                    {lastPatch.codeDiff && (
                      <div className="space-y-1.5 pt-1.5">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Mutación de Código en Vivo:</div>
                        <div className="p-2 bg-red-950/30 border border-red-800/40 rounded text-[10px] text-red-300 font-mono whitespace-pre-wrap">
                          <span className="text-red-500 select-none mr-1">-</span>
                          {lastPatch.codeDiff.originalSnippet}
                        </div>
                        <div className="p-2 bg-emerald-950/30 border border-emerald-800/40 rounded text-[10px] text-emerald-300 font-mono whitespace-pre-wrap">
                          <span className="text-emerald-500 select-none mr-1">+</span>
                          {lastPatch.codeDiff.improvedSnippet}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06] text-[10px]">
                      <div>Latencia: <span className="text-emerald-400 font-bold">{lastPatch.metricsDelta.latencyReduction}</span></div>
                      <div>Eficiencia RAM: <span className="text-emerald-400 font-bold">{lastPatch.metricsDelta.ramEfficiency}</span></div>
                    </div>
                  </div>
                )}

                {/* Host Linux Telemetry */}
                {systemMetrics && (
                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-xs">
                      <Cpu size={13} />
                      <span>Telemetría Linux Host</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500">RAM: </span>
                        <span className="text-zinc-200">{systemMetrics.memory?.usedFormatted}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Cores: </span>
                        <span className="text-zinc-200">{systemMetrics.hardware?.cpuCores} Cores</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Uptime: </span>
                        <span className="text-zinc-200">{systemMetrics.system?.uptimeFormatted}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Kernel: </span>
                        <span className="text-zinc-200">{systemMetrics.os?.distroName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CHROMEBOOK APP LAUNCHER MODAL */}
      <ChromebookAppLauncher
        isOpen={isAppLauncherOpen}
        onClose={() => setIsAppLauncherOpen(false)}
        onSelectApp={(appId) => {
          if (appId === 'settings') {
            setIsVoiceSettingsOpen(true);
          } else {
            setDetailsTab(appId);
            setIsDetailsDrawerOpen(true);
          }
        }}
        activeApp={isDetailsDrawerOpen ? detailsTab : undefined}
      />
    </div>
  );
};
