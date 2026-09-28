import React, { useState, useEffect } from 'react';
import {
  Globe,
  Cpu,
  Search,
  RefreshCw,
  ExternalLink,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { playUiClick } from '../../utils/audio';

export const ToolsSystemView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'search' | 'system'>('search');

  // DuckDuckGo Search state
  const [searchQuery, setSearchQuery] = useState('Deadpool Wolverine comics');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Linux System Info state
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);

  const fetchSystemInfo = async () => {
    setIsLoadingSystem(true);
    try {
      const res = await fetch('/api/tools/system-info');
      const data = await res.json();
      if (data.success) {
        setSystemInfo(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/tools/duckduckgo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    handleSearch();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-200 p-4 sm:p-6 overflow-y-auto font-sans space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-3 gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Zap size={16} className="text-rose-400" />
            <span>Sistema de Herramientas del Backend</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Módulos integrados de consulta web (DuckDuckGo) y telemetría de la máquina host.
          </p>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center p-0.5 bg-zinc-900/80 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => {
              playUiClick();
              setActiveTool('search');
            }}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTool === 'search'
                ? 'bg-zinc-800 text-zinc-100 font-medium shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe size={13} />
            <span>DuckDuckGo</span>
          </button>

          <button
            onClick={() => {
              playUiClick();
              setActiveTool('system');
              fetchSystemInfo();
            }}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTool === 'system'
                ? 'bg-zinc-800 text-zinc-100 font-medium shadow-sm border border-white/[0.08]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu size={13} />
            <span>Linux Host Info</span>
          </button>
        </div>
      </div>

      {/* Tool 1: DuckDuckGo Search */}
      {activeTool === 'search' && (
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escriba una búsqueda web para ejecutar en DuckDuckGo..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/70 border border-white/[0.08] rounded-lg text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 font-mono transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-mono text-xs font-medium rounded-lg border border-white/[0.08] flex items-center gap-1.5 transition-colors shrink-0"
            >
              {isSearching ? <RefreshCw size={13} className="animate-spin" /> : <Globe size={13} />}
              <span>Consultar</span>
            </button>
          </form>

          {/* Search Telemetry Bar */}
          {searchResults && (
            <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
              <span className="flex items-center gap-1 text-zinc-400">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Resultados orgánicos DuckDuckGo</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                <span>{searchResults.executionTimeMs} ms</span>
              </span>
            </div>
          )}

          {/* Search Results List */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {searchResults?.data?.results?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 bg-zinc-950/60 hover:bg-zinc-900/60 border border-white/[0.06] hover:border-white/[0.12] rounded-lg transition-colors group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-xs sm:text-sm text-zinc-100 hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <span>{item.title}</span>
                    <ArrowUpRight size={13} className="text-zinc-500 group-hover:text-rose-400 shrink-0" />
                  </a>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                  {item.snippet}
                </p>
                <div className="text-[10px] text-zinc-600 font-mono mt-1.5 truncate">
                  {item.url}
                </div>
              </div>
            ))}

            {isSearching && (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin text-rose-500" />
                <span>Ejecutando consulta web...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 2: Linux System Info */}
      {activeTool === 'system' && (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
              <Activity size={13} className="text-rose-400" />
              <span>Métricas del Host Linux</span>
            </span>
            <button
              onClick={() => {
                playUiClick();
                fetchSystemInfo();
              }}
              disabled={isLoadingSystem}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={11} className={isLoadingSystem ? 'animate-spin' : ''} />
              <span>Actualizar</span>
            </button>
          </div>

          {systemInfo && (
            <div className="space-y-3">
              {/* Minimalist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* RAM */}
                <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>MEMORIA RAM</span>
                    <span className="text-rose-400 font-semibold">{systemInfo.memory.usedPercent}%</span>
                  </div>
                  <div className="text-xl font-mono font-semibold text-zinc-100">
                    {systemInfo.memory.usedFormatted}
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${systemInfo.memory.usedPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
                    <span>Libre: {systemInfo.memory.freeFormatted}</span>
                    <span>Total: {systemInfo.memory.totalFormatted}</span>
                  </div>
                </div>

                {/* CPU */}
                <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>PROCESADOR</span>
                    <span className="text-zinc-300 font-mono">{systemInfo.hardware.cpuCores} núcleos</span>
                  </div>
                  <div className="font-mono text-xs text-zinc-200 truncate font-semibold" title={systemInfo.hardware.cpuModel}>
                    {systemInfo.hardware.cpuModel}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-1">
                    <span>Carga (1m / 5m):</span>
                    <span className="text-zinc-300 font-mono">
                      {systemInfo.hardware.loadAverage['1m']} / {systemInfo.hardware.loadAverage['5m']}
                    </span>
                  </div>
                </div>

                {/* OS */}
                <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>SISTEMA OPERATIVO</span>
                    <span className="text-zinc-500 uppercase">{systemInfo.os.architecture}</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-zinc-100 truncate">
                    {systemInfo.os.distroName}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                    Kernel: {systemInfo.os.kernelVersion}
                  </div>
                </div>

                {/* Uptime */}
                <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>UPTIME</span>
                    <span className="text-emerald-400 text-[10px] font-mono">ACTIVO</span>
                  </div>
                  <div className="text-xl font-mono font-semibold text-zinc-100">
                    {systemInfo.system.uptimeFormatted}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                    {systemInfo.os.hostname} ({systemInfo.system.user})
                  </div>
                </div>
              </div>

              {/* Status Note Banner */}
              <div className="p-3 bg-zinc-950/60 border border-white/[0.06] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="text-zinc-300 font-medium">Diagnóstico de WADE-OS:</span>
                  <span className="text-zinc-500">Estado de purga: {systemInfo.wadeInternStatus.formatDangerLevel}</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono italic">
                  "{systemInfo.wadeInternStatus.commentary}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
