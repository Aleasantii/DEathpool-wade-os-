import React, { useState, useEffect } from 'react';
import { FileCode, Save, Sparkles, Check } from 'lucide-react';
import { playUiClick } from '../../utils/audio';

interface VirtualFile {
  filename: string;
  path: string;
  language: string;
  content: string;
}

export const SourceFilesView: React.FC = () => {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        if (!selectedFile && data.files.length > 0) {
          setSelectedFile(data.files[0]);
          setEditorContent(data.files[0].content);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSelectFile = (file: VirtualFile) => {
    playUiClick();
    setSelectedFile(file);
    setEditorContent(file.content);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    playUiClick();

    try {
      await fetch(`/api/files/${selectedFile.filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editorContent })
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelfImprovement = () => {
    if (!selectedFile) return;
    playUiClick();
    const comment = `\n# [WADE-OS]: Optimización de memoria y directivas aplicada para el entorno host.\n`;
    setEditorContent(prev => prev + comment);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#09090b] text-zinc-200 overflow-hidden font-sans">
      {/* File Tree Sidebar */}
      <div className="w-full md:w-60 border-r border-white/[0.06] bg-zinc-950/40 p-3 sm:p-4 flex flex-col shrink-0">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.06] text-xs font-mono text-zinc-400">
          <span>~/wade-os</span>
          <span className="text-[10px] text-zinc-500">{files.length} archivos</span>
        </div>

        <div className="space-y-1">
          {files.map((f) => {
            const isSelected = selectedFile?.filename === f.filename;
            return (
              <button
                key={f.filename}
                onClick={() => handleSelectFile(f)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 font-medium border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                }`}
              >
                <FileCode size={13} className={isSelected ? 'text-rose-400' : 'text-zinc-500'} />
                <span className="truncate">{f.filename}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto p-2.5 bg-zinc-900/30 rounded-lg border border-white/[0.04] text-[10px] font-mono text-zinc-500">
          <span className="text-zinc-400 font-medium block mb-0.5">Automejora de Código:</span>
          Permite al sistema leer y reescribir sus propios módulos en caliente.
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col h-full bg-[#09090b] min-w-0">
        {selectedFile ? (
          <>
            {/* Editor Toolbar */}
            <div className="h-11 px-4 bg-zinc-950/60 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium">{selectedFile.path}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500 uppercase text-[10px]">{selectedFile.language}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelfImprovement}
                  className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/[0.08] text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles size={11} className="text-rose-400" />
                  <span>Automejora</span>
                </button>

                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-mono font-medium rounded-md flex items-center gap-1 transition-colors"
                >
                  {savedSuccess ? <Check size={12} className="text-emerald-600" /> : <Save size={12} />}
                  <span>{savedSuccess ? 'Guardado' : 'Guardar'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 p-3 overflow-hidden">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full bg-zinc-950/70 text-zinc-300 font-mono text-xs sm:text-sm p-4 rounded-lg border border-white/[0.06] focus:outline-none focus:border-rose-500/50 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 font-mono text-xs">
            Seleccione un archivo para visualizar o editar.
          </div>
        )}
      </div>
    </div>
  );
};
