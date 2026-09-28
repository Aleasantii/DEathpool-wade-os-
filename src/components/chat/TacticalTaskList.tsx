import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Check, 
  ListFilter,
  Flame,
  Shield,
  Code2,
  Compass
} from 'lucide-react';
import { playUiClick, playChimichangaCrunch, playSwordClash, playTvaZap } from '../../utils/audio';

interface TacticalTask {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'mercenary' | 'code' | 'survival' | 'recon';
  completed: boolean;
  timestamp: string;
  assignedNeuron: string;
}

interface TacticalTaskListProps {
  onTaskCountChange?: (count: number) => void;
}

export const TacticalTaskList: React.FC<TacticalTaskListProps> = ({ onTaskCountChange }) => {
  const [tasks, setTasks] = useState<TacticalTask[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newCategory, setNewCategory] = useState<'mercenary' | 'code' | 'survival' | 'recon'>('mercenary');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks
  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
        if (onTaskCountChange) onTaskCountChange(data.pending);
      }
    } catch {}
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    playUiClick();
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle('');
        if (onTaskCountChange) onTaskCountChange(tasks.filter(t => !t.completed).length + 1);
      }
    } catch {}
  };

  const handleToggleTask = async (id: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      playChimichangaCrunch();
    } else {
      playUiClick();
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
        );
      }
    } catch {}
  };

  const handleDeleteTask = async (id: string) => {
    playSwordClash();
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {}
  };

  const handleAiSuggest = async () => {
    setIsLoading(true);
    playTvaZap();
    try {
      const res = await fetch('/api/tasks/ai-suggest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex flex-col h-full space-y-3 font-mono text-xs text-zinc-200">
      {/* Top Header & Actions */}
      <div className="p-3 bg-zinc-900/60 rounded-xl border border-white/[0.06] space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-['Bangers'] text-base tracking-wider text-rose-400">
              MISIONES TÁCTICAS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-500/40">
              {pendingCount} Pendientes
            </span>
          </div>

          <button
            onClick={handleAiSuggest}
            disabled={isLoading}
            title="Sugerir misión automática con Wade"
            className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <Sparkles size={11} className="text-amber-400" />
            <span>{isLoading ? 'Ideando...' : 'Misión IA'}</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-1.5 pt-1">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nueva misión táctica (ej: 'Revisar puertos con Logan')..."
            className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />

          <div className="flex gap-1.5 shrink-0">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="px-2 py-1.5 bg-zinc-900 border border-white/[0.08] rounded-lg text-xs text-zinc-300"
            >
              <option value="CRITICAL">🔥 Crítica</option>
              <option value="HIGH">⚡ Alta</option>
              <option value="MEDIUM">🟢 Media</option>
            </select>

            <button
              type="submit"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Añadir</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-between items-center px-1 shrink-0">
        <div className="flex gap-1">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { playUiClick(); setFilter(f); }}
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                filter === f
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendientes' : 'Completadas'}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-zinc-500 font-mono">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'misión' : 'misiones'}
        </span>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 space-y-1">
            <CheckCircle2 size={24} className="mx-auto text-zinc-600" />
            <p className="text-xs">No hay misiones en esta vista.</p>
            <p className="text-[10px]">¡Wade puede descansar y comer chimichangas!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                task.completed
                  ? 'bg-black/30 border-white/[0.03] opacity-60'
                  : 'bg-zinc-900/80 border-white/[0.06] hover:border-rose-500/30'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleTask(task.id, task.completed)}
                className="mt-0.5 shrink-0 text-zinc-400 hover:text-rose-400 transition-colors"
              >
                {task.completed ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Circle size={16} />
                )}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-xs font-medium leading-snug break-words ${
                      task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-zinc-500">
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      task.priority === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span>{task.timestamp}</span>
                  <span className="text-zinc-600">• Neurona: {task.assignedNeuron}</span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                title="Eliminar tarea"
                className="p-1 text-zinc-600 hover:text-rose-400 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
