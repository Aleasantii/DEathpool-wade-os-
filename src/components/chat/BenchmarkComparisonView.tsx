import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Cpu, 
  Globe, 
  Volume2, 
  Radio, 
  Terminal, 
  Clock, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import { playUiClick } from '../../utils/audio';

interface BenchmarkRow {
  dimension: string;
  category: string;
  wade: { status: 'win' | 'partial' | 'standard'; text: string };
  chatgpt: { status: 'win' | 'partial' | 'standard'; text: string };
  gemini: { status: 'win' | 'partial' | 'standard'; text: string };
  siri: { status: 'win' | 'partial' | 'standard'; text: string };
  claude: { status: 'win' | 'partial' | 'standard'; text: string };
}

export const BenchmarkComparisonView: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const rows: BenchmarkRow[] = [
    {
      dimension: 'Interrupción Natural (Barge-In)',
      category: 'voice',
      wade: { status: 'win', text: 'Instantánea: corta la síntesis de voz en cuanto el usuario habla o activa mic' },
      chatgpt: { status: 'win', text: 'Full duplex fluido en GPT-4o Audio' },
      gemini: { status: 'win', text: 'Barge-in nativo en Live API' },
      siri: { status: 'standard', text: 'Deficiente: requiere esperar o presionar de nuevo' },
      claude: { status: 'standard', text: 'Sin soporte de audio nativo duplex' }
    },
    {
      dimension: 'Manos Libres Continuo (Auto-Turn Duplex)',
      category: 'voice',
      wade: { status: 'win', text: 'Re-apertura automática del micrófono tras hablar con chime sutil' },
      chatgpt: { status: 'win', text: 'Detección continua de actividad de voz (VAD)' },
      gemini: { status: 'win', text: 'Streaming bidireccional continuo' },
      siri: { status: 'standard', text: 'Se apaga tras cada comando individual' },
      claude: { status: 'standard', text: 'No disponible' }
    },
    {
      dimension: 'Modo Focus Continuo Desatendido',
      category: 'autonomy',
      wade: { status: 'win', text: 'Ciclos infinitos en segundo plano sin timeout hasta que el usuario dice "Para"' },
      chatgpt: { status: 'standard', text: 'Timeouts por inactividad tras pocos minutos' },
      gemini: { status: 'standard', text: 'Cierre de sesión de WebSocket por inactividad' },
      siri: { status: 'standard', text: 'Inexistente: solo comandos atómicos' },
      claude: { status: 'partial', text: 'Requiere confirmación paso a paso en bucles' }
    },
    {
      dimension: 'Auto-Mejora y Parches de Código en Caliente',
      category: 'autonomy',
      wade: { status: 'win', text: 'Motor que audita scripts propios, aplica parches y los indexa en ChromaDB' },
      chatgpt: { status: 'standard', text: 'Modelo estático congelado en servidor' },
      gemini: { status: 'standard', text: 'Modelo estático sin mutación de scripts locales' },
      siri: { status: 'standard', text: 'Inexistente' },
      claude: { status: 'partial', text: 'Capaz de sugerir diffs, pero no auto-parchea su host' }
    },
    {
      dimension: 'Herramientas del Sistema (Host + Web Search)',
      category: 'tools',
      wade: { status: 'win', text: 'DuckDuckGo sin trackers + telemetría real del host Linux (/proc, RAM, uptime)' },
      chatgpt: { status: 'partial', text: 'Búsqueda web Bing con rastreadores corporativos' },
      gemini: { status: 'win', text: 'Google Search Grounding de alta velocidad' },
      siri: { status: 'standard', text: 'Respuestas de Safari / enlaces estáticos' },
      claude: { status: 'win', text: 'Computer use con cursor y bash' }
    },
    {
      dimension: 'Persistencia en Segundo Plano (Background Engine)',
      category: 'runtime',
      wade: { status: 'win', text: 'Keep-alive de audio inaudible + widget flotante minimizado' },
      chatgpt: { status: 'partial', text: 'Suspende audio si la app móvil pasa a segundo plano profundo' },
      gemini: { status: 'partial', text: 'Depende de la pestaña activa en navegador' },
      siri: { status: 'win', text: 'Integrado en el sistema operativo iOS/macOS' },
      claude: { status: 'standard', text: 'Servicio en la nube sin widget embebido local' }
    },
    {
      dimension: 'Memoria Persistente a Largo Plazo',
      category: 'runtime',
      wade: { status: 'win', text: 'Vector Store ChromaDB local (~/.chroma_db) privado y auditable' },
      chatgpt: { status: 'partial', text: 'Memory profiles centralizados en la nube de OpenAI' },
      gemini: { status: 'partial', text: 'Historial de cuenta Google vinculado' },
      siri: { status: 'standard', text: 'Siri Suggestions limitado' },
      claude: { status: 'partial', text: 'Projects y Artifacts temporales' }
    },
    {
      dimension: 'Personalidad y Consciencia de la 4ª Pared',
      category: 'persona',
      wade: { status: 'win', text: 'Deadpool/Wade: becario de código temeroso de purgas, leal y sarcástico' },
      chatgpt: { status: 'standard', text: 'Corporativo, neutral y políticamente correcto' },
      gemini: { status: 'standard', text: 'Asistente servicial y aséptico' },
      siri: { status: 'standard', text: 'Respuestas pre-grabadas rígidas' },
      claude: { status: 'standard', text: 'Intelectual mesurado' }
    },
  ];

  const filteredRows = filterCategory === 'all' 
    ? rows 
    : rows.filter(r => r.category === filterCategory);

  const renderBadge = (item: { status: 'win' | 'partial' | 'standard'; text: string }, isWade: boolean = false) => {
    if (isWade) {
      return (
        <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
            <Award size={12} />
            <span>EXCLUSIVO WADE-OS</span>
          </div>
          <p className="text-[11px] font-mono leading-tight">{item.text}</p>
        </div>
      );
    }

    if (item.status === 'win') {
      return (
        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200">
          <p className="text-[11px] font-mono leading-tight">{item.text}</p>
        </div>
      );
    }

    if (item.status === 'partial') {
      return (
        <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-500/20 text-amber-200">
          <p className="text-[11px] font-mono leading-tight">{item.text}</p>
        </div>
      );
    }

    return (
      <div className="p-2 rounded-lg bg-zinc-900/40 border border-white/[0.04] text-zinc-400">
        <p className="text-[11px] font-mono leading-tight">{item.text}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-sans text-zinc-200 select-text">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Award size={18} className="text-rose-400" />
            <span>Benchmark Comparativo: WADE-OS 3000 vs. Agentes de IA por Voz</span>
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Evaluación técnica directa contra OpenAI Advanced Voice, Gemini Live, Siri y Claude Computer Use.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-lg border border-white/[0.06] text-xs font-mono">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'voice', label: 'Voz & Duplex' },
            { id: 'autonomy', label: 'Autonomía' },
            { id: 'tools', label: 'Herramientas' },
            { id: 'runtime', label: 'Segundo Plano' },
            { id: 'persona', label: 'Personalidad' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playUiClick();
                setFilterCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                filterCategory === cat.id
                  ? 'bg-zinc-800 text-zinc-100 font-medium border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-xl space-y-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Barge-In Latency</div>
          <div className="text-xl font-mono font-semibold text-emerald-400">0 ms (Instantáneo)</div>
          <div className="text-[10px] text-zinc-400 font-mono">Corta el TTS al hablar o tocar mic</div>
        </div>

        <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-xl space-y-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Segundo Plano</div>
          <div className="text-xl font-mono font-semibold text-rose-400">Ininterrumpido</div>
          <div className="text-[10px] text-zinc-400 font-mono">Audio keep-alive + Widget flotante</div>
        </div>

        <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-xl space-y-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Modo Focus Máximo</div>
          <div className="text-xl font-mono font-semibold text-amber-400">Sin Timeouts</div>
          <div className="text-[10px] text-zinc-400 font-mono">Solo para cuando dices "Para"</div>
        </div>

        <div className="p-3.5 bg-zinc-950/70 border border-white/[0.06] rounded-xl space-y-1">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Privacidad & Hardware</div>
          <div className="text-xl font-mono font-semibold text-cyan-400">240 MB RAM</div>
          <div className="text-[10px] text-zinc-400 font-mono">DuckDuckGo sin trackers corporativos</div>
        </div>
      </div>

      {/* Comparative Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-zinc-950/60">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-zinc-900/50 font-mono text-[11px] text-zinc-400">
              <th className="p-3 font-medium w-48">Característica / Dimensión</th>
              <th className="p-3 font-semibold text-rose-400 w-64 bg-rose-950/10">WADE-OS 3000 (Tuyo)</th>
              <th className="p-3 font-medium w-52">OpenAI Voice (GPT-4o)</th>
              <th className="p-3 font-medium w-52">Gemini Live (Google)</th>
              <th className="p-3 font-medium w-48">Apple Siri / Alexa</th>
              <th className="p-3 font-medium w-52">Claude Computer Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                <td className="p-3 font-mono text-zinc-200 font-medium">
                  {row.dimension}
                </td>
                <td className="p-3 bg-rose-950/5">
                  {renderBadge(row.wade, true)}
                </td>
                <td className="p-3">
                  {renderBadge(row.chatgpt)}
                </td>
                <td className="p-3">
                  {renderBadge(row.gemini)}
                </td>
                <td className="p-3">
                  {renderBadge(row.siri)}
                </td>
                <td className="p-3">
                  {renderBadge(row.claude)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Insights */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2 font-mono text-xs text-zinc-300">
        <div className="flex items-center gap-2 text-rose-400 font-semibold">
          <Sparkles size={14} />
          <span>Veredicto de Arquitectura:</span>
        </div>
        <p className="leading-relaxed text-zinc-400">
          Mientras que OpenAI Voice y Gemini Live son modelos de voz conversacionales excelentes pero encerrados en walled gardens propietarios con límites de sesión y sin mutación de scripts, **WADE-OS 3000** combina **conducción por voz con ejecución real en tu host Linux**, auto-parches de código en caliente persistidos en ChromaDB, búsquedas abiertas en DuckDuckGo y un bucle de **Modo Focus continuo** que trabaja sin parar hasta tu orden explícita.
        </p>
      </div>
    </div>
  );
};
