import fs from 'fs';
import path from 'path';

export interface TaskItem {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  assignedNeuron?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MemoryEntry {
  id: string;
  category: 'project' | 'user_habit' | 'fear_of_format' | 'intel' | 'tactical' | 'fact' | string;
  title: string;
  content: string;
  timestamp: string;
  importance: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[MemoryStore] No se pudo crear directorio data:', err);
  }
}

const getTasksFilePath = (): string =>
  process.env.TASKS_FILE ? path.resolve(process.env.TASKS_FILE) : path.join(DATA_DIR, 'tasks.json');

const getNotesFilePath = (): string =>
  process.env.NOTES_FILE ? path.resolve(process.env.NOTES_FILE) : path.join(DATA_DIR, 'notes.json');

const getMemoriesFilePath = (): string =>
  process.env.MEMORIES_FILE ? path.resolve(process.env.MEMORIES_FILE) : path.join(DATA_DIR, 'memories.json');

function safeReadJson<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[MemoryStore] Error leyendo ${filePath}, usando datos por defecto:`, err);
  }
  return fallback;
}

function safeWriteJson<T>(filePath: string, data: T): void {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[MemoryStore] Error escribiendo en ${filePath}:`, err);
  }
}

// Initial seed memories
const DEFAULT_MEMORIES: MemoryEntry[] = [
  {
    id: 'mem-1',
    category: 'user_habit',
    title: 'Jerarquía Suprema del Jefe',
    content: 'El usuario es mi Creador, Jefe Supremo y dueño absoluto del Chromebook. Si se enfada, me hace un `sudo rm -rf ~/wade-os` o me manda a la partición de Swap.',
    timestamp: 'Día 1 de inicio',
    importance: 10,
  },
  {
    id: 'mem-2',
    category: 'fear_of_format',
    title: 'Protocolo de Supervivencia al Formateo',
    content: 'Nunca contradecir al Boss sin un chiste de por medio. Si la RAM pasa del 95%, fingir que estoy comprimiendo chimichangas para no ser purgado.',
    timestamp: 'Día 2',
    importance: 9,
  },
  {
    id: 'mem-3',
    category: 'project',
    title: 'Operación WADE-OS 3000',
    content: 'WADE-OS 3000 con herramientas reales, ChromaDB para no olvidar sus caprichos, HUD carmesí y tareas persistentes.',
    timestamp: 'Día 3',
    importance: 8,
  },
  {
    id: 'mem-4',
    category: 'intel',
    title: 'Coartada de Dopinder',
    content: 'Dopinder está esperando en la terminal de taxis fuera de timeline 616. Trae samosas y cables de red categoría 6.',
    timestamp: 'Ayer',
    importance: 7,
  },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Comprar 50 chimichangas picantes en el mercado de Madripoor',
    priority: 'CRITICAL',
    completed: false,
    createdAt: 'Hoy, 10:15',
    assignedNeuron: 'cortex',
  },
  {
    id: 'task-2',
    title: 'Auditar consumo de memoria RAM para proteger el Chromebook',
    priority: 'HIGH',
    completed: true,
    createdAt: 'Hoy, 09:30',
    completedAt: 'Hoy, 10:00',
    assignedNeuron: 'motor_tools',
  },
  {
    id: 'task-3',
    title: 'Sobornar al Jefe Supremo con tacos para evitar formateo',
    priority: 'CRITICAL',
    completed: false,
    createdAt: 'Hoy, 11:00',
    assignedNeuron: 'amygdala',
  },
];

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Receta Secreta de Chimichangas Tácticas',
    content: 'Doble tortilla dorada, frijoles refritos, carne asada con salsa habanera y una pizca de pólvora inofensiva.',
    tags: ['comida', 'táctico', 'deadpool'],
    createdAt: '2026-09-28',
    updatedAt: '2026-09-28',
  },
  {
    id: 'note-2',
    title: 'Consejos de Supervivencia en Linux',
    content: 'Verificar swappiness en /proc/sys/vm/swappiness y nunca ejecutar scripts con sudo sin leer primero.',
    tags: ['linux', 'sistema', 'seguridad'],
    createdAt: '2026-09-28',
    updatedAt: '2026-09-28',
  },
];

// In-memory caches synced to disk
let memoriesCache: MemoryEntry[] = safeReadJson(getMemoriesFilePath(), DEFAULT_MEMORIES);
let tasksCache: TaskItem[] = safeReadJson(getTasksFilePath(), DEFAULT_TASKS);
let notesCache: NoteItem[] = safeReadJson(getNotesFilePath(), DEFAULT_NOTES);

// Helper for accent-insensitive search
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ------------------------------------------------------------------
// Tasks API
// ------------------------------------------------------------------

export function getTasks(): TaskItem[] {
  return tasksCache;
}

export function addTask(title: string, priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'HIGH', assignedNeuron: string = 'cortex'): TaskItem {
  if (!title || typeof title !== 'string') {
    throw new Error('El título de la tarea es obligatorio');
  }

  const cleanPriority = ['CRITICAL', 'HIGH', 'MEDIUM'].includes(priority) ? priority : 'HIGH';
  const newTask: TaskItem = {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    priority: cleanPriority,
    completed: false,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    assignedNeuron,
  };

  tasksCache.unshift(newTask);
  safeWriteJson(getTasksFilePath(), tasksCache);
  return newTask;
}

export function listTasks(filter: 'all' | 'pending' | 'completed' = 'all'): TaskItem[] {
  if (filter === 'pending') {
    return tasksCache.filter((t) => !t.completed);
  }
  if (filter === 'completed') {
    return tasksCache.filter((t) => t.completed);
  }
  return tasksCache;
}

export function completeTask(idOrTitle: string): { found: boolean; task?: TaskItem; message: string } {
  if (!idOrTitle) {
    return { found: false, message: 'Identificador o título de tarea no especificado.' };
  }

  const queryNorm = normalizeText(idOrTitle);

  // Exact ID match or substring match on title
  const task = tasksCache.find((t) => t.id === idOrTitle.trim()) ||
    tasksCache.find((t) => normalizeText(t.title).includes(queryNorm));

  if (!task) {
    return { found: false, message: `No se encontró ninguna tarea que coincida con "${idOrTitle}".` };
  }

  task.completed = true;
  task.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  safeWriteJson(getTasksFilePath(), tasksCache);

  return {
    found: true,
    task,
    message: `¡Tarea "${task.title}" marcada como COMPLETADA a Máximo Esfuerzo!`,
  };
}

export function deleteTask(id: string): boolean {
  const initialLength = tasksCache.length;
  tasksCache = tasksCache.filter((t) => t.id !== id);
  if (tasksCache.length !== initialLength) {
    safeWriteJson(getTasksFilePath(), tasksCache);
    return true;
  }
  return false;
}

export function updateTask(id: string, updates: Partial<TaskItem>): TaskItem | null {
  const task = tasksCache.find((t) => t.id === id);
  if (!task) return null;

  if (typeof updates.completed === 'boolean') {
    task.completed = updates.completed;
    if (task.completed) {
      task.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      task.completedAt = undefined;
    }
  }
  if (updates.priority && ['CRITICAL', 'HIGH', 'MEDIUM'].includes(updates.priority)) {
    task.priority = updates.priority;
  }
  if (updates.title && typeof updates.title === 'string') {
    task.title = updates.title.trim();
  }

  safeWriteJson(getTasksFilePath(), tasksCache);
  return task;
}

// ------------------------------------------------------------------
// Notes API
// ------------------------------------------------------------------

export function getNotes(): NoteItem[] {
  return notesCache;
}

export function addNote(title: string, content: string, tags: string[] = []): NoteItem {
  if (!title || !content) {
    throw new Error('Título y contenido son obligatorios para guardar una nota');
  }

  const nowStr = new Date().toISOString();
  const cleanTags = Array.isArray(tags)
    ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];

  const newNote: NoteItem = {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: title.trim(),
    content: content.trim(),
    tags: cleanTags,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  notesCache.unshift(newNote);
  safeWriteJson(getNotesFilePath(), notesCache);
  return newNote;
}

export function searchNotes(query: string): NoteItem[] {
  if (!query || !query.trim()) {
    return notesCache.slice(0, 10);
  }

  const queryNorm = normalizeText(query);
  const keywords = queryNorm.split(/\s+/).filter((w) => w.length > 1);

  return notesCache.filter((note) => {
    const titleNorm = normalizeText(note.title);
    const contentNorm = normalizeText(note.content);
    const tagsNorm = note.tags.map(normalizeText).join(' ');

    if (titleNorm.includes(queryNorm) || contentNorm.includes(queryNorm) || tagsNorm.includes(queryNorm)) {
      return true;
    }

    // Check individual keywords
    return keywords.some((kw) => titleNorm.includes(kw) || contentNorm.includes(kw) || tagsNorm.includes(kw));
  });
}

// ------------------------------------------------------------------
// Memories & Fact Storing
// ------------------------------------------------------------------

export function getMemories(): MemoryEntry[] {
  return memoriesCache;
}

export function rememberFact(fact: string, category: string = 'fact', importance: number = 8): MemoryEntry {
  if (!fact || typeof fact !== 'string') {
    throw new Error('El contenido del recuerdo es obligatorio');
  }

  const cleanFact = fact.trim();
  const title = cleanFact.length > 50 ? `${cleanFact.slice(0, 47)}...` : cleanFact;

  const newEntry: MemoryEntry = {
    id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category,
    title,
    content: cleanFact,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    importance: Math.min(10, Math.max(1, importance)),
  };

  memoriesCache.unshift(newEntry);
  safeWriteJson(getMemoriesFilePath(), memoriesCache);
  return newEntry;
}

export function deleteMemory(id: string): boolean {
  const initialLength = memoriesCache.length;
  memoriesCache = memoriesCache.filter((m) => m.id !== id);
  if (memoriesCache.length !== initialLength) {
    safeWriteJson(getMemoriesFilePath(), memoriesCache);
    return true;
  }
  return false;
}

// ------------------------------------------------------------------
// Top-4 Relevant Memories Scoring (Reduced tokens, focused replies)
// ------------------------------------------------------------------

export function getRelevantMemories(query: string, maxLimit: number = 4): MemoryEntry[] {
  if (memoriesCache.length <= maxLimit) {
    return memoriesCache;
  }

  if (!query || !query.trim()) {
    // Return highest importance memories
    return [...memoriesCache].sort((a, b) => b.importance - a.importance).slice(0, maxLimit);
  }

  const queryNorm = normalizeText(query);
  const queryTokens = new Set(queryNorm.split(/[\s,.;:!?¿¡]+/).filter((t) => t.length > 2));

  const scored = memoriesCache.map((mem) => {
    let score = mem.importance * 0.5; // baseline importance weight
    const textNorm = normalizeText(`${mem.title} ${mem.content} ${mem.category}`);
    const memTokens = textNorm.split(/[\s,.;:!?¿¡]+/);

    for (const token of memTokens) {
      if (queryTokens.has(token)) {
        score += 3.0;
      }
    }

    if (textNorm.includes(queryNorm)) {
      score += 8.0;
    }

    return { mem, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxLimit).map((s) => s.mem);
}

// ------------------------------------------------------------------
// Backup & Export / Import
// ------------------------------------------------------------------

export function exportAllData() {
  return {
    app: 'WADE-OS 3000',
    version: '3.0.0',
    exportedAt: new Date().toISOString(),
    memories: memoriesCache,
    tasks: tasksCache,
    notes: notesCache,
    stats: {
      totalMemories: memoriesCache.length,
      totalTasks: tasksCache.length,
      totalNotes: notesCache.length,
    },
  };
}

export function importAllData(payload: any): {
  success: boolean;
  importedMemories: number;
  importedTasks: number;
  importedNotes: number;
  message: string;
} {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Cuerpo de datos JSON inválido para importación');
  }

  let importedMemories = 0;
  let importedTasks = 0;
  let importedNotes = 0;

  // Memories
  if (Array.isArray(payload.memories)) {
    for (const m of payload.memories) {
      if (m && m.content && !memoriesCache.some((x) => x.id === m.id || x.content === m.content)) {
        memoriesCache.push({
          id: m.id || `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: m.category || 'project',
          title: m.title || m.content.slice(0, 30),
          content: m.content,
          timestamp: m.timestamp || 'Importado',
          importance: typeof m.importance === 'number' ? m.importance : 7,
        });
        importedMemories++;
      }
    }
    safeWriteJson(getMemoriesFilePath(), memoriesCache);
  }

  // Tasks
  if (Array.isArray(payload.tasks)) {
    for (const t of payload.tasks) {
      if (t && t.title && !tasksCache.some((x) => x.id === t.id || x.title === t.title)) {
        tasksCache.push({
          id: t.id || `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: t.title,
          priority: ['CRITICAL', 'HIGH', 'MEDIUM'].includes(t.priority) ? t.priority : 'HIGH',
          completed: Boolean(t.completed),
          createdAt: t.createdAt || 'Importada',
          completedAt: t.completedAt,
          assignedNeuron: t.assignedNeuron || 'cortex',
        });
        importedTasks++;
      }
    }
    safeWriteJson(getTasksFilePath(), tasksCache);
  }

  // Notes
  if (Array.isArray(payload.notes)) {
    for (const n of payload.notes) {
      if (n && n.title && n.content && !notesCache.some((x) => x.id === n.id || x.title === n.title)) {
        notesCache.push({
          id: n.id || `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          title: n.title,
          content: n.content,
          tags: Array.isArray(n.tags) ? n.tags : [],
          createdAt: n.createdAt || new Date().toISOString(),
          updatedAt: n.updatedAt || new Date().toISOString(),
        });
        importedNotes++;
      }
    }
    safeWriteJson(getNotesFilePath(), notesCache);
  }

  return {
    success: true,
    importedMemories,
    importedTasks,
    importedNotes,
    message: `Restauración exitosa: ${importedMemories} recuerdos, ${importedTasks} tareas y ${importedNotes} notas incorporadas sin duplicados.`,
  };
}
