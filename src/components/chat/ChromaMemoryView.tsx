import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, RefreshCw } from 'lucide-react';
import { playUiClick } from '../../utils/audio';

interface MemoryEntry {
  id: string;
  category: 'project' | 'user_habit' | 'fear_of_format' | 'intel' | 'tactical';
  title: string;
  content: string;
  timestamp: string;
  importance: number;
}

export const ChromaMemoryView: React.FC = () => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryEntry['category']>('project');

  const fetchMemories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      if (data.entries) {
        setMemories(data.entries);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    playUiClick();
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          importance: 9
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        setNewContent('');
        fetchMemories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    playUiClick();
    try {
      await fetch(`/api/memory/${id}`, { method: 'DELETE' });
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-200 p-4 sm:p-6 overflow-y-auto font-sans space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-rose-400" />
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              ChromaDB • Memoria a Largo Plazo
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Vector Store local en <span className="text-zinc-300">~/.chroma_db</span> para retención persistente de directivas.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playUiClick();
            fetchMemories();
          }}
          disabled={isLoading}
          className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.08] transition-colors"
          title="Sincronizar memoria"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* New Memory Form */}
      <form onSubmit={handleAddMemory} className="bg-zinc-950/70 border border-white/[0.06] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-300 font-medium flex items-center gap-1.5">
            <Plus size={13} /> Registrar Nuevo Recuerdo en ChromaDB
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Embedding Vectorial
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            required
            placeholder="Título o directriz clave..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-2 bg-zinc-900/70 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 font-mono transition-colors"
          />

          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryEntry['category'])}
            className="px-3 py-2 bg-zinc-900/70 border border-white/[0.08] rounded-lg text-xs text-zinc-300 font-mono focus:outline-none focus:border-rose-500/60 transition-colors"
          >
            <option value="project">Proyecto</option>
            <option value="user_habit">Hábito del Jefe</option>
            <option value="fear_of_format">Pánico de Formateo</option>
            <option value="intel">Inteligencia Táctica</option>
          </select>
        </div>

        <textarea
          rows={2}
          required
          placeholder="Descripción detallada de la información a preservar..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-900/70 border border-white/[0.08] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 font-mono transition-colors resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium rounded-lg border border-white/[0.08] transition-colors flex items-center gap-1.5"
          >
            <Database size={12} />
            <span>Persistir Recuerdo</span>
          </button>
        </div>
      </form>

      {/* Memory List Cards */}
      <div className="space-y-2 flex-1">
        {memories.map((m) => (
          <div
            key={m.id}
            className="p-3.5 rounded-lg border border-white/[0.06] bg-zinc-950/60 hover:bg-zinc-900/50 hover:border-white/[0.1] transition-all flex items-start justify-between gap-3"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/[0.08]">
                  {m.category.replace('_', ' ')}
                </span>
                <span className="font-medium text-xs sm:text-sm text-zinc-200">{m.title}</span>
                <span className="text-[10px] font-mono text-zinc-500">• {m.timestamp}</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono pl-0.5">
                {m.content}
              </p>
            </div>

            <button
              onClick={() => handleDelete(m.id)}
              title="Eliminar registro"
              className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
