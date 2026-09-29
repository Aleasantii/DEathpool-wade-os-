import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Download,
  Laptop,
  CheckCircle2,
  WifiOff,
  Maximize,
  Minimize,
  HelpCircle,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { playUiClick } from '../../utils/audio';

export const ChromebookPWAControls: React.FC = () => {
  const { isInstallable, isInstalled, isChromeOS, install } = usePWAInstall();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', checkFullscreen);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);

  const toggleFullscreen = () => {
    playUiClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleInstallClick = async () => {
    playUiClick();
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 border border-amber-600/50 text-amber-300 rounded-full text-[10px] font-mono animate-pulse">
            <WifiOff size={11} />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        {/* Chromebook Install Button */}
        {!isInstalled ? (
          <button
            onClick={handleInstallClick}
            title="Instalar WADE-OS como aplicación nativa en tu Chromebook"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-[11px] font-mono font-bold shadow-md hover:shadow-red-500/20 transition-all cursor-pointer"
          >
            <Laptop size={13} />
            <span className="hidden md:inline">Instalar App</span>
            <Download size={11} />
          </button>
        ) : (
          <div
            title="Ejecutando en modo App Standalone de Chromebook"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-semibold"
          >
            <CheckCircle2 size={11} />
            <span className="hidden lg:inline">Chromebook App</span>
          </div>
        )}

        {/* Open in New Tab Button */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playUiClick()}
          title="Abrir en una nueva página / pestaña completa"
          className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors flex items-center justify-center"
        >
          <ExternalLink size={13} />
        </a>

        {/* Fullscreen Mode (Chromebook F11 Feel) */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa Chromebook (F11)'}
          className="p-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
        >
          {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
        </button>
      </div>

      {/* Chromebook Installation Guide Modal */}
      {showGuideModal && (
        <div
          onClick={() => setShowGuideModal(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-950 border border-red-500/50 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 font-mono text-zinc-200"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs">
                  W
                </div>
                <h3 className="text-sm font-bold text-white">Instalar en Chromebook</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <p>
                WADE-OS 3000 está preparado como <strong className="text-red-400">PWA (Progressive Web App)</strong> nativa para ChromeOS:
              </p>

              <div className="space-y-2 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <div>
                    En la barra de direcciones de Google Chrome, busca el ícono de <strong className="text-white">Instalar</strong> (🖥️ o ⬇️).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <div>
                    O haz clic en el menú <strong className="text-white">Más opciones (⋮) &gt; Guardar y compartir &gt; Instalar WADE-OS 3000</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <div>
                    Haz clic derecho en el ícono de la barra de tareas (Shelf) de tu Chromebook y selecciona <strong className="text-white">Fijar al estante</strong>.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-zinc-300 flex items-center gap-2">
                <Sparkles size={14} className="text-red-400 shrink-0" />
                <span>Se ejecutará en su propia ventana sin marcos de navegador, con soporte offline y atajos rápidos.</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold font-mono transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
