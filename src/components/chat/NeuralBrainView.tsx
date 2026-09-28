import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Brain, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Send,
  Eye,
  Volume2,
  Database,
  Users
} from 'lucide-react';
import { playUiClick, playTvaZap, playSwordClash, playChimichangaCrunch } from '../../utils/audio';

interface NeuronData {
  id: string;
  name: string;
  area: string;
  role: string;
  color: string;
  firingRateHz: number;
  activityLevel: number;
  synapses: string[];
}

interface PropagationStep {
  neuronId: string;
  neuronName: string;
  action: string;
  latencyUs: number;
}

export const NeuralBrainView: React.FC = () => {
  const [neurons, setNeurons] = useState<NeuronData[]>([]);
  const [selectedNeuron, setSelectedNeuron] = useState<NeuronData | null>(null);
  const [testIntent, setTestIntent] = useState('Revisar lista de tareas y prioridades');
  const [isFiring, setIsFiring] = useState(false);
  const [propagationPath, setPropagationPath] = useState<PropagationStep[]>([]);
  const [activeNeuronId, setActiveNeuronId] = useState<string | null>(null);
  const [synthesisText, setSynthesisText] = useState<string | null>(null);
  const [totalLatency, setTotalLatency] = useState<string | null>(null);

  // Spatial coordinates for the 8 neurons in the circular brain layout
  const neuronPositions: Record<string, { x: number; y: number; icon: any }> = {
    cortex: { x: 50, y: 35, icon: Brain },
    hippocampus: { x: 22, y: 22, icon: Database },
    perception: { x: 78, y: 22, icon: Eye },
    motor_tools: { x: 18, y: 58, icon: Cpu },
    amygdala: { x: 38, y: 78, icon: ShieldAlert },
    striatum_tasks: { x: 62, y: 78, icon: CheckCircle2 },
    swarm_social: { x: 82, y: 58, icon: Users },
    duplex_speech: { x: 50, y: 12, icon: Volume2 },
  };

  useEffect(() => {
    fetch('/api/brain/mesh')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setNeurons(d.neurons);
          setSelectedNeuron(d.neurons.find((n: NeuronData) => n.id === 'cortex') || d.neurons[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleFireSynapse = async (intentToFire?: string) => {
    const query = intentToFire || testIntent;
    if (!query.trim() || isFiring) return;

    setIsFiring(true);
    setSynthesisText(null);
    setPropagationPath([]);
    playTvaZap();

    try {
      const res = await fetch('/api/brain/synapse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: query }),
      });
      const data = await res.json();

      if (data.success) {
        setTotalLatency(data.totalLatencyMs);
        setSynthesisText(data.synthesis);

        // Step-by-step neural signal animation
        for (let i = 0; i < data.pathway.length; i++) {
          const step = data.pathway[i];
          setActiveNeuronId(step.neuronId);
          setPropagationPath((prev) => [...prev, step]);
          playUiClick();
          await new Promise((r) => setTimeout(r, 220));
        }

        playChimichangaCrunch();
        setActiveNeuronId(null);
      }
    } catch {} finally {
      setIsFiring(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-xs text-zinc-200">
      {/* Top Controller & Intent Trigger */}
      <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <Brain size={14} className="animate-pulse" />
            <span className="font-['Bangers'] text-sm tracking-wider">CEREBRO NEURONAL SINÁPTICO</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            8 Neuronas • Interconexión 100% Viva
          </span>
        </div>

        <div className="flex gap-1.5">
          <input
            type="text"
            value={testIntent}
            onChange={(e) => setTestIntent(e.target.value)}
            placeholder="Introduce una orden o pensamiento cognitivo..."
            className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
          <button
            onClick={() => handleFireSynapse()}
            disabled={isFiring}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0 shadow-[0_0_12px_rgba(225,29,72,0.3)]"
          >
            <Zap size={12} className={isFiring ? 'animate-bounce' : ''} />
            <span>{isFiring ? 'Disparando...' : 'Sinapsis'}</span>
          </button>
        </div>

        {/* Quick Intent Chips */}
        <div className="flex gap-1 overflow-x-auto pt-1 scrollbar-none">
          {[
            'Organizar tareas pendientes',
            '¡Alerta, peligro de formateo!',
            'Optimizar código en terminal',
            'Pedir inteligencia a Dopinder',
            'Recuperar memoria del Jefe',
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTestIntent(chip);
                handleFireSynapse(chip);
              }}
              className="px-2 py-0.5 rounded text-[9px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.05] whitespace-nowrap transition-colors"
            >
              ⚡ {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Neural Brain Map */}
      <div className="relative w-full h-56 bg-black/70 rounded-xl border border-white/[0.08] overflow-hidden select-none">
        {/* SVG Synaptic Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="synapseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {neurons.map((neuron) => {
            const fromPos = neuronPositions[neuron.id];
            if (!fromPos) return null;

            return neuron.synapses.map((targetId) => {
              const toPos = neuronPositions[targetId];
              if (!toPos) return null;

              const isConnectionActive = activeNeuronId === neuron.id || activeNeuronId === targetId;

              return (
                <line
                  key={`${neuron.id}->${targetId}`}
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={isConnectionActive ? '#ef4444' : 'rgba(255, 255, 255, 0.08)'}
                  strokeWidth={isConnectionActive ? 2 : 1}
                  strokeDasharray={isConnectionActive ? '4 2' : 'none'}
                  className={isConnectionActive ? 'animate-pulse' : ''}
                />
              );
            });
          })}
        </svg>

        {/* Neurons as Interactive Spatial Nodes */}
        {neurons.map((neuron) => {
          const pos = neuronPositions[neuron.id];
          if (!pos) return null;
          const IconComp = pos.icon;
          const isSelected = selectedNeuron?.id === neuron.id;
          const isActive = activeNeuronId === neuron.id;

          return (
            <div
              key={neuron.id}
              onClick={() => {
                playUiClick();
                setSelectedNeuron(neuron);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center group z-10`}
            >
              <div
                style={{ borderColor: neuron.color }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-transform ${
                  isActive
                    ? 'scale-125 shadow-[0_0_24px_rgba(239,68,68,0.9)] bg-rose-950 animate-ping'
                    : isSelected
                    ? 'scale-110 shadow-[0_0_18px_rgba(255,255,255,0.4)] bg-zinc-900'
                    : 'bg-zinc-950/90 hover:scale-105'
                }`}
              >
                <IconComp size={15} style={{ color: neuron.color }} />
              </div>

              <span className="text-[9px] font-bold text-zinc-300 mt-1 whitespace-nowrap bg-black/60 px-1 rounded border border-white/[0.04]">
                {neuron.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Synthesis & Pathway Real-Time Display */}
      {synthesisText && (
        <div className="p-3 bg-zinc-950 rounded-xl border border-rose-500/40 space-y-2 animate-fade-in shrink-0">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-rose-400">Síntesis Cognitiva del Super-Agente</span>
            <span className="text-zinc-500 font-mono">Latencia total: {totalLatency}</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">{synthesisText}</p>

          <div className="space-y-1 pt-1 border-t border-white/[0.06]">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              Cadena de Propagación Sináptica:
            </div>
            <div className="flex flex-wrap gap-1 text-[9px] font-mono">
              {propagationPath.map((step, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-300">
                    #{idx + 1} {step.neuronName} ({step.latencyUs}µs)
                  </span>
                  {idx < propagationPath.length - 1 && <span className="text-rose-500">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Neuron Inspector Card */}
      {selectedNeuron && (
        <div className="p-3 bg-zinc-900/50 rounded-xl border border-white/[0.06] space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNeuron.color }} />
              {selectedNeuron.name}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Frecuencia: {selectedNeuron.firingRateHz} Hz
            </span>
          </div>
          <div className="text-[10px] text-zinc-400">{selectedNeuron.area}</div>
          <p className="text-[11px] text-zinc-300 pt-0.5">{selectedNeuron.role}</p>

          <div className="pt-1 text-[10px] text-zinc-500 flex gap-2">
            <span>Actividad: <strong className="text-emerald-400">{Math.round(selectedNeuron.activityLevel * 100)}%</strong></span>
            <span>Sinapsis salientes: <strong className="text-zinc-300">{selectedNeuron.synapses.length} neuronas</strong></span>
          </div>
        </div>
      )}

      {/* Protocolo Autónomo V3.0 Metacognition Card */}
      <div className="p-3 bg-zinc-950 rounded-xl border border-amber-500/30 space-y-1.5 text-xs shrink-0">
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <Sparkles size={12} />
            <span>PROTOCOLO AUTÓNOMO V3.0 (METACOGNICIÓN)</span>
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
            AUTO-REFINEMENT ACTIVO
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono text-zinc-400 pt-1">
          <div className="p-1.5 bg-zinc-900 rounded border border-white/[0.04]">
            <span className="text-zinc-200 font-bold block">1. Descomposición</span>
            Submetas lógicas y restricciones de CPU/RAM
          </div>
          <div className="p-1.5 bg-zinc-900 rounded border border-white/[0.04]">
            <span className="text-zinc-200 font-bold block">2. Ejecución Modular</span>
            Código TypeScript/Python sin código basura
          </div>
          <div className="p-1.5 bg-zinc-900 rounded border border-white/[0.04]">
            <span className="text-zinc-200 font-bold block">3. Autoevaluación</span>
            Bucle de automejora y auditoría interna
          </div>
        </div>
      </div>
    </div>
  );
};
