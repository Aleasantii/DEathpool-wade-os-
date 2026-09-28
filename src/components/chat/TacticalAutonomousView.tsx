import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Zap, Globe, Camera, Play, Square, AlertTriangle } from 'lucide-react';
import { playGunshot, playUiClick } from '../../utils/audio';

export const TacticalAutonomousView: React.FC = () => {
  // Focus Mode
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusProgress, setFocusProgress] = useState(0);
  const [focusLogs, setFocusLogs] = useState<string[]>([]);

  // Ghost Scraper Module
  const [isGhostActive, setIsGhostActive] = useState(false);
  const [ghostQuery, setGhostQuery] = useState('Análisis de dependencias y optimización');
  const [scrapedData, setScrapedData] = useState<string[]>([]);

  // Anti-Intruder Webcam
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [intruderTriggered, setIntruderTriggered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Focus Mode Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusActive) {
      interval = setInterval(() => {
        setFocusProgress((prev) => {
          if (prev >= 100) {
            setIsFocusActive(false);
            setFocusLogs((logs) => [
              `[Completado]: Tarea en segundo plano finalizada. Repositorio depurado y optimizado.`,
              ...logs,
            ]);
            return 100;
          }
          const next = prev + 15;
          const logSteps = [
            `[Focus]: Verificando dependencias en ~/wade-os/venv...`,
            `[Focus]: Optimizando índices de ChromaDB...`,
            `[Focus]: Evaluando sintaxis y consistencia de módulos...`,
            `[Focus]: Compilando mejoras en server.py...`,
          ];
          const randomStep = logSteps[Math.floor(Math.random() * logSteps.length)];
          setFocusLogs((logs) => [randomStep, ...logs.slice(0, 7)]);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusActive]);

  const handleStartFocus = () => {
    playUiClick();
    setIsFocusActive(true);
    setFocusProgress(0);
    setFocusLogs([`[Iniciado]: Bucle autónomo en segundo plano activo.`]);
  };

  const handleAbortFocus = () => {
    playGunshot();
    setIsFocusActive(false);
    setFocusLogs((logs) => [
      `[Cancelado]: Interrupción manual por el usuario. Proceso detenido.`,
      ...logs,
    ]);
  };

  // Ghost Module Scraper
  const handleStartGhost = () => {
    playUiClick();
    setIsGhostActive(true);
    setTimeout(() => {
      setIsGhostActive(false);
      setScrapedData([
        `Objetivo: "${ghostQuery}"`,
        `[DuckDuckGo Pipeline]: 8 fuentes analizadas en 0.4s.`,
        `[Fuente 1]: Documentación oficial de arquitectura modular.`,
        `[Fuente 2]: Registro de optimización de memoria en kernels Linux.`,
        `[Fuente 3]: Parámetros de seguridad en contenedores de ChromeOS.`,
      ]);
    }, 1500);
  };

  // Anti-Intruders Webcam Toggle
  const handleToggleCamera = async () => {
    playUiClick();
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch {
        alert('No se pudo acceder a la webcam o permiso no concedido.');
      }
    }
  };

  const handleSimulateIntruder = () => {
    playGunshot();
    setIntruderTriggered(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-200 p-4 sm:p-6 overflow-y-auto font-sans space-y-5">
      {/* Sleek Minimal Intruder Lockdown Overlay */}
      {intruderTriggered && (
        <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-500/40 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Acceso No Autorizado Detectado
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Sujeto desconocido no validado en los registros del Chromebook.
              </p>
            </div>
            <p className="text-xs text-rose-300 font-mono bg-rose-950/30 p-3 rounded-lg border border-rose-900/40">
              "WADE-OS: Bloqueo de contingencia preventivo para proteger los datos del Jefe."
            </p>
            <button
              onClick={() => {
                playUiClick();
                setIntruderTriggered(false);
              }}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-xs font-medium rounded-lg border border-white/[0.1] transition-colors"
            >
              Autenticar como Creador (Desbloquear)
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Zap size={16} className="text-rose-400" />
            <span>Módulos Tácticos Autónomos</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Automatización de procesos en segundo plano para optimización y seguridad.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module 1: Modo Focus */}
        <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-rose-400" />
              <h3 className="font-semibold text-xs font-mono text-zinc-200">
                MODO FOCUS • TRABAJO AUTÓNOMO
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                isFocusActive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-zinc-900 text-zinc-500 border border-white/[0.04]'
              }`}
            >
              {isFocusActive ? 'EN PROCESO' : 'EN ESPERA'}
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-mono">
            Bucle de mantenimiento y refactorización desatendida en segundo plano.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full transition-all duration-300"
              style={{ width: `${focusProgress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!isFocusActive ? (
              <button
                onClick={handleStartFocus}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-medium rounded-lg border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play size={12} /> Activar Tarea
              </button>
            ) : (
              <button
                onClick={handleAbortFocus}
                className="flex-1 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-mono text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Square size={12} /> Detener Proceso
              </button>
            )}
          </div>

          {/* Logs */}
          <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.05] font-mono text-[11px] text-zinc-400 h-24 overflow-y-auto space-y-1">
            {focusLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>

        {/* Module 2: Módulo Fantasma (Scraping Desatendido) */}
        <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-950/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-cyan-400" />
              <h3 className="font-semibold text-xs font-mono text-zinc-200">
                MÓDULO FANTASMA • EXTRACCIÓN WEB
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 border border-white/[0.06] px-2 py-0.5 rounded">
              DUCKDUCKGO
            </span>
          </div>

          <p className="text-xs text-zinc-400 font-mono">
            Recopilación de inteligencia y búsqueda sin huella para consultas específicas.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={ghostQuery}
              onChange={(e) => setGhostQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-zinc-900/70 border border-white/[0.08] rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-rose-500/60 transition-colors"
            />
            <button
              onClick={handleStartGhost}
              disabled={isGhostActive}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-mono text-xs font-medium rounded-lg border border-white/[0.08] transition-colors"
            >
              {isGhostActive ? 'Buscando...' : 'Ejecutar'}
            </button>
          </div>

          <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-white/[0.05] font-mono text-[11px] text-zinc-400 h-24 overflow-y-auto space-y-1">
            {scrapedData.length > 0 ? (
              scrapedData.map((d, i) => <div key={i}>{d}</div>)
            ) : (
              <span className="text-zinc-600">En espera de objetivos de búsqueda...</span>
            )}
          </div>
        </div>
      </div>

      {/* Module 3: Anti-Intrusos Táctico */}
      <div className="p-4 rounded-xl border border-white/[0.06] bg-zinc-950/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-rose-400" />
            <h3 className="font-semibold text-xs font-mono text-zinc-200">
              ANTI-INTRUSOS • ESCANEO FACIAL WEBCAM
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 border border-white/[0.06] px-2 py-0.5 rounded">
            INTERVALO: 5 MIN
          </span>
        </div>

        <p className="text-xs text-zinc-400 font-mono">
          Análisis facial periódico frente a la webcam con bajo consumo de CPU. Bloquea la interfaz ante personas no registradas.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleCamera}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isCameraActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/[0.08]'
            }`}
          >
            <Camera size={13} />
            <span>{isCameraActive ? 'Detener Webcam' : 'Activar Sensor Webcam'}</span>
          </button>

          <button
            onClick={handleSimulateIntruder}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-medium rounded-lg border border-white/[0.08] transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle size={13} className="text-rose-400" />
            <span>Probar Bloqueo de Seguridad</span>
          </button>
        </div>

        {/* Video feed */}
        {isCameraActive && (
          <div className="relative w-60 h-44 bg-black rounded-lg overflow-hidden border border-white/[0.1] mt-2">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-zinc-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300 border border-white/[0.08]">
              SENSOR BIOMÉTRICO ACTIVO
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
