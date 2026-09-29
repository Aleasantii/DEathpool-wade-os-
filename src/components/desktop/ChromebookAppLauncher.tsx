import React from 'react';
import {
  HardDrive,
  Eye,
  CheckSquare,
  Cpu,
  Settings,
  Mic,
  X,
  FileText,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Command,
} from 'lucide-react';
import { playUiClick } from '../../utils/audio';

export interface AppLauncherItem {
  id: 'workspace' | 'multimodal' | 'tasks' | 'brain' | 'settings' | 'history';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

interface ChromebookAppLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectApp: (appId: 'workspace' | 'multimodal' | 'tasks' | 'brain' | 'settings' | 'history') => void;
  activeApp?: string;
}

export const ChromebookAppLauncher: React.FC<ChromebookAppLauncherProps> = ({
  isOpen,
  onClose,
  onSelectApp,
  activeApp,
}) => {
  if (!isOpen) return null;

  const apps: AppLauncherItem[] = [
    {
      id: 'workspace',
      title: 'Google Workspace',
      subtitle: 'Drive, Gmail, Calendario y Contactos',
      icon: <HardDrive className="w-6 h-6 text-red-400" />,
      badge: 'OAuth v2',
      color: 'hover:border-red-500/50 hover:bg-red-950/20',
    },
    {
      id: 'multimodal',
      title: 'Visión & Web Tools',
      subtitle: 'OCR capturas, QR, quitar fondos y cupones',
      icon: <Eye className="w-6 h-6 text-purple-400" />,
      badge: 'AI Vision',
      color: 'hover:border-purple-500/50 hover:bg-purple-950/20',
    },
    {
      id: 'tasks',
      title: 'Misiones & Tareas',
      subtitle: 'Lista táctica con prioridad y asignación',
      icon: <CheckSquare className="w-6 h-6 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-950/20',
    },
    {
      id: 'brain',
      title: 'Cerebro & ChromaDB',
      subtitle: 'Red neuronal, sinapsis y recuerdos duraderos',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      badge: 'Vectorial',
      color: 'hover:border-cyan-500/50 hover:bg-cyan-950/20',
    },
    {
      id: 'history',
      title: 'Historial & Focus',
      subtitle: 'Bitácora de conversación y pasos autónomos',
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/20',
    },
    {
      id: 'settings',
      title: 'Voz & Sistema',
      subtitle: 'Tono Ryan Reynolds, modulación y telemetría',
      icon: <Settings className="w-6 h-6 text-zinc-300" />,
      badge: 'Deadpool HD',
      color: 'hover:border-zinc-500/50 hover:bg-zinc-800/40',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950/95 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5"
      >
        {/* Launcher Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 font-black text-sm">
              W
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 font-mono tracking-wider">
                LANZADOR DE APLICACIONES WADE-OS
              </h2>
              <p className="text-[11px] text-zinc-400">
                Selecciona la herramienta que deseas abrir en tu Chromebook
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid of Apps (Chromebook Launcher Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {apps.map((app) => {
            const isCurrent = activeApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => {
                  playUiClick();
                  onSelectApp(app.id);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 group cursor-pointer ${
                  isCurrent
                    ? 'bg-zinc-900 border-red-500 shadow-md shadow-red-950/40'
                    : 'bg-zinc-900/60 border-zinc-800/90 ' + app.color
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800 group-hover:scale-105 transition-transform">
                    {app.icon}
                  </div>
                  {app.badge && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-800 font-semibold">
                      {app.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-100 font-mono group-hover:text-red-400 transition-colors">
                    {app.title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed mt-0.5">
                    {app.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Keyboard Hint */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-300">Esc</kbd>
            <span>para cerrar</span>
          </div>
          <span>Optimizado para Chromebook & ChromeOS</span>
        </div>
      </div>
    </div>
  );
};
