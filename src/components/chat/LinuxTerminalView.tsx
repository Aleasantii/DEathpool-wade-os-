import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { playGunshot, playUiClick } from '../../utils/audio';

interface TerminalLine {
  id: string;
  command: string;
  output: string;
  isPanic?: boolean;
}

export const LinuxTerminalView: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      command: 'uname -a && pwd',
      output: `Linux chromebook-wade-os 6.1.0-merc-x86_64 #1 SMP PREEMPT GNU/Linux\n/home/boss/wade-os\n\nWADE-OS 3000 Shell v3.0 activo. Escriba "tools", "ls" o "free -h" para telemetría.`
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    setInputVal('');
    setIsRunning(true);
    playUiClick();

    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();

      const isPanic = cmd.toLowerCase().includes('rm -rf') || cmd.toLowerCase().includes('format');
      if (isPanic) {
        playGunshot();
      }

      setHistory(prev => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          command: cmd,
          output: data.output || 'Sin salida.',
          isPanic
        }
      ]);
    } catch (err: unknown) {
      setHistory(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          command: cmd,
          output: `Error ejecutando comando: ${err instanceof Error ? err.message : 'Error desconocido'}`,
          isPanic: true
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    playUiClick();
    setHistory([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-300 font-mono text-xs sm:text-sm p-4 sm:p-6 overflow-hidden select-text space-y-2">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-rose-400" />
          <span className="font-semibold text-zinc-200">
            boss@chromebook:~/wade-os (bash)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] text-zinc-500 border border-white/[0.06] px-2 py-0.5 rounded">
            SANDBOX LINUX
          </span>
          <button
            onClick={handleClear}
            className="hover:text-zinc-100 text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Output Buffer */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {history.map((h) => (
          <div key={h.id} className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-rose-400 font-medium">wade@chromebook</span>
              <span className="text-zinc-600">:</span>
              <span className="text-zinc-400">~/wade-os</span>
              <span className="text-zinc-100">$ {h.command}</span>
            </div>
            <pre
              className={`whitespace-pre-wrap leading-relaxed pl-2 font-mono text-xs ${
                h.isPanic
                  ? 'text-rose-400 bg-rose-950/20 p-2.5 rounded border border-rose-800/40 font-medium'
                  : 'text-zinc-300'
              }`}
            >
              {h.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <span className="text-rose-400 text-xs font-medium">wade@chromebook</span>
        <span className="text-zinc-400 text-xs">~/wade-os$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isRunning}
          placeholder="Comandos disponibles: 'tools', 'ls', 'free -h', 'cat server.py'..."
          className="flex-1 bg-transparent text-zinc-100 outline-none border-none font-mono text-xs sm:text-sm placeholder-zinc-600 caret-rose-400"
        />
      </form>
    </div>
  );
};
