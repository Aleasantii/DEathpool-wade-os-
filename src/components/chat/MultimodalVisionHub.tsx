import React, { useState, useRef } from 'react';
import {
  Eye,
  Camera,
  BarChart3,
  QrCode,
  Tag,
  Scissors,
  Globe,
  Search,
  Percent,
  FileSpreadsheet,
  FileText,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { playUiClick, playThinkingFillerSound } from '../../utils/audio';

export const MultimodalVisionHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'vision' | 'web' | 'files'>('vision');
  const [visionMode, setVisionMode] = useState<
    'screenshot_ocr' | 'chart_analysis' | 'object_brand' | 'barcode_qr' | 'bg_removal' | 'image_gen'
  >('screenshot_ocr');

  // Vision states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [visionPrompt, setVisionPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Background removal canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);
  const [colorThreshold, setColorThreshold] = useState(30);

  // Web Tools states
  const [scrapeUrl, setScrapeUrl] = useState('https://news.ycombinator.com');
  const [scrapedText, setScrapedText] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);

  const [monitorUrl, setMonitorUrl] = useState('https://example.com');
  const [monitorResult, setMonitorResult] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const [couponStore, setCouponStore] = useState('Amazon');
  const [couponDeals, setCouponDeals] = useState<any[]>([]);
  const [isFindingCoupons, setIsFindingCoupons] = useState(false);

  // File Tools states
  const [csvTitle, setCsvTitle] = useState('presupuesto_tactico');
  const [csvHeaders, setCsvHeaders] = useState('Concepto, Categoría, Monto, Fecha');
  const [csvRows, setCsvRows] = useState(
    'Tacos al Pastor, Alimentación, 14.50, 2026-09-28\nKatanas de Repuesto, Equipo, 500.00, 2026-09-27\nSuscripción Wham!, Música, 9.99, 2026-09-25'
  );

  const [docTitle, setDocTitle] = useState('Plan Operativo Deadpool');
  const [docContent, setDocContent] = useState(
    '# PLAN DE ACCIÓN MÁXIMO ESFUERZO\n\n- **Objetivo**: Conquistar la productividad mutante.\n- **Herramientas**: Google Workspace, Visión Multimodal, Terminal Linux.\n- **Conclusión**: Todo bajo control y sin riesgo de formateo.'
  );

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      setImagePreview(dataUri);
      setAnalysisResult(null);
      setBgRemovedUrl(null);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI Vision Analysis
  const handleAnalyzeVision = async () => {
    if (!imagePreview) return;
    playUiClick();
    playThinkingFillerSound('breath');
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: imageMime,
          task: visionMode === 'object_brand' ? 'object_brand_recognition' : visionMode,
          prompt: visionPrompt,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult(data.error || 'No se pudo completar el análisis de la imagen.');
      }
    } catch (err: any) {
      setAnalysisResult(`Error de conexión: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute Background Removal via Canvas Masking
  const handleRemoveBackground = () => {
    if (!imagePreview) return;
    playUiClick();
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corner pixel as background color reference
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      const threshold = colorThreshold * 2.5;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance from background sample
        const dist = Math.sqrt(
          Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
        );

        if (dist < threshold) {
          data[i + 3] = 0; // Make transparent
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setBgRemovedUrl(canvas.toDataURL('image/png'));
    };
    img.src = imagePreview;
  };

  // Scrape Clean Web
  const handleScrapeWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl) return;
    playUiClick();
    playThinkingFillerSound('nod');
    setIsScraping(true);
    setScrapedText(null);

    try {
      const res = await fetch('/api/web/scrape-clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      const data = await res.json();
      if (data.cleanText) {
        setScrapedText(`[${data.title || 'Página Web'}]\n\n${data.cleanText}`);
      } else {
        setScrapedText(data.error || 'Error al extraer texto limpio.');
      }
    } catch (err: any) {
      setScrapedText(`Error: ${err.message}`);
    } finally {
      setIsScraping(false);
    }
  };

  // Monitor Web Changes
  const handleMonitorWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monitorUrl) return;
    playUiClick();
    setIsMonitoring(true);

    try {
      const res = await fetch('/api/web/monitor-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: monitorUrl }),
      });
      const data = await res.json();
      setMonitorResult(data);
    } catch (err: any) {
      setMonitorResult({ error: err.message });
    } finally {
      setIsMonitoring(false);
    }
  };

  // Find Coupons
  const handleFindCoupons = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponStore) return;
    playUiClick();
    playThinkingFillerSound('nod');
    setIsFindingCoupons(true);

    try {
      const res = await fetch('/api/web/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store: couponStore }),
      });
      const data = await res.json();
      setCouponDeals(data.deals || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsFindingCoupons(false);
    }
  };

  // Download CSV
  const handleDownloadCsv = () => {
    playUiClick();
    const rowsArray = csvRows
      .split('\n')
      .filter((r) => r.trim())
      .map((r) => r.split(',').map((c) => c.trim()));

    const headersArray = csvHeaders.split(',').map((h) => h.trim());

    let csvContent = 'data:text/csv;charset=utf-8,' + headersArray.join(',') + '\n';
    rowsArray.forEach((row) => {
      csvContent += row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${csvTitle || 'tabla'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Markdown/Doc
  const handleDownloadDoc = () => {
    playUiClick();
    const blob = new Blob([docContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950/80 text-zinc-100 font-sans p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-600/20 text-rose-500 rounded-lg border border-rose-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100 font-mono tracking-wider flex items-center gap-2">
              CENTRO MULTIMODAL & HERRAMIENTAS INTELIGENTES
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                AI VISION + WEB + DOCS
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              Visión por computadora, OCR de capturas, lector QR, scraping limpio, cupones y exportación de archivos
            </p>
          </div>
        </div>

        {/* Category Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => {
              playUiClick();
              setActiveCategory('vision');
            }}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              activeCategory === 'vision' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Visión Artificial
          </button>
          <button
            onClick={() => {
              playUiClick();
              setActiveCategory('web');
            }}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              activeCategory === 'web' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Navegación Web
          </button>
          <button
            onClick={() => {
              playUiClick();
              setActiveCategory('files');
            }}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              activeCategory === 'files' ? 'bg-red-600 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Archivos & Hojas
          </button>
        </div>
      </div>

      {/* CATEGORY 1: VISION SUITE */}
      {activeCategory === 'vision' && (
        <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Controls & Upload */}
          <div className="w-full md:w-1/2 flex flex-col space-y-3 overflow-y-auto pr-1">
            {/* Vision Submodes */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('screenshot_ocr');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'screenshot_ocr'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Camera className="w-4 h-4 mb-1 text-rose-400" />
                <span>OCR Capturas</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('chart_analysis');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'chart_analysis'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <BarChart3 className="w-4 h-4 mb-1 text-emerald-400" />
                <span>Gráficos y Datos</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('object_brand');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'object_brand'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Tag className="w-4 h-4 mb-1 text-amber-400" />
                <span>Objetos y Marcas</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('barcode_qr');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'barcode_qr'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <QrCode className="w-4 h-4 mb-1 text-blue-400" />
                <span>Códigos QR / Barra</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('bg_removal');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'bg_removal'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Scissors className="w-4 h-4 mb-1 text-purple-400" />
                <span>Quitar Fondo (PNG)</span>
              </button>
              <button
                onClick={() => {
                  playUiClick();
                  setVisionMode('image_gen');
                }}
                className={`p-2 rounded-lg text-left border transition-all text-xs font-mono ${
                  visionMode === 'image_gen'
                    ? 'bg-red-600/20 border-red-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-yellow-400" />
                <span>Generar Logos/Banners</span>
              </button>
            </div>

            {/* Upload Area */}
            {visionMode !== 'image_gen' ? (
              <div className="bg-zinc-900/60 border border-dashed border-zinc-700 rounded-xl p-4 text-center hover:border-red-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="vision-image-input"
                />
                <label
                  htmlFor="vision-image-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Camera className="w-8 h-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-300">
                    Arrastra o haz clic para subir imagen / captura
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">PNG, JPG, WEBP hasta 10MB</span>
                </label>
              </div>
            ) : (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <h4 className="text-xs font-mono font-bold text-zinc-200">
                  Generación de Logos & Banners Comerciales
                </h4>
                <textarea
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="Ej: 'Créame un logo minimalista para una cafetería moderna con una taza y granos geométricos'..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                />
                <button
                  onClick={() => {
                    playUiClick();
                    setAnalysisResult(
                      `🎨 [Diseño Generado]\nPrompt: "${visionPrompt || 'Logo minimalista'}"\n\nEspecificaciones de Marca:\n- Paleta cromática: #18181b (Obsidiana), #dc2626 (Rojo Carmesí), #f4f4f5 (Blanco Hueso)\n- Tipografía recomendada: Space Grotesk / Inter Bold\n- Estilo: Vector plano, escalable en SVG, contraste optimizado para app icons y merchandise táctico.`
                    );
                  }}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Generar Concepto de Logo
                </button>
              </div>
            )}

            {/* Prompt override for analysis */}
            {visionMode !== 'bg_removal' && visionMode !== 'image_gen' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-zinc-400">Pregunta o instrucción adicional:</label>
                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="Ej: ¿Qué error hay en la pantalla? o ¿Cuál es la tendencia del gráfico?"
                  className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                />
                <button
                  onClick={handleAnalyzeVision}
                  disabled={!imagePreview || isAnalyzing}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analizando con Visión Artificial...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Ejecutar Análisis Táctico</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* BG Removal controls */}
            {visionMode === 'bg_removal' && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-300">Tolerancia de Fondo: {colorThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={colorThreshold}
                  onChange={(e) => setColorThreshold(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <button
                  onClick={handleRemoveBackground}
                  disabled={!imagePreview}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Eliminar Fondo y Extraer PNG
                </button>
              </div>
            )}
          </div>

          {/* Preview & Results Panel */}
          <div className="w-full md:w-1/2 flex flex-col space-y-3 overflow-hidden">
            {/* Image Preview Window */}
            {imagePreview && (
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-2 flex items-center justify-center max-h-48 overflow-hidden">
                <img
                  src={bgRemovedUrl || imagePreview}
                  alt="Vista previa"
                  className="max-h-44 object-contain rounded-lg"
                />
                {bgRemovedUrl && (
                  <a
                    href={bgRemovedUrl}
                    download="sin_fondo.png"
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg"
                  >
                    <Download className="w-3 h-3" />
                    <span>Descargar PNG</span>
                  </a>
                )}
              </div>
            )}

            {/* Analysis Output Box */}
            <div className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                  Dictamen del Motor de Visión WADE-OS
                </span>
                {analysisResult && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult);
                      playUiClick();
                    }}
                    title="Copiar informe"
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {analysisResult ? (
                <div className="text-xs text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {analysisResult}
                </div>
              ) : (
                <div className="text-center py-10 text-zinc-500 text-xs font-mono">
                  Sube una imagen y ejecuta el análisis para ver el informe de OCR, gráficos o lectura de códigos.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: WEB TOOLS */}
      {activeCategory === 'web' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Subtool A: Clean Web Scraper (Jina AI Style) */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex items-center gap-2 text-rose-400 border-b border-zinc-800 pb-2">
              <Globe className="w-4 h-4" />
              <h3 className="text-xs font-mono font-bold text-zinc-100">
                Extractor de Texto Limpio (Anti-SSRF / Jina AI Style)
              </h3>
            </div>
            <form onSubmit={handleScrapeWeb} className="flex gap-2">
              <input
                type="url"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                placeholder="https://ejemplo.com/articulo"
                className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                required
              />
              <button
                type="submit"
                disabled={isScraping}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {isScraping ? 'Limpiando...' : 'Extraer'}
              </button>
            </form>
            <div className="flex-1 bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-lg overflow-y-auto max-h-56 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">
              {scrapedText || 'Ingresa una URL para limpiar HTML y extraer texto legible sin publicidad ni scripts.'}
            </div>
          </div>

          {/* Subtool B: Web Change Monitor */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-800 pb-2">
              <RefreshCw className="w-4 h-4" />
              <h3 className="text-xs font-mono font-bold text-zinc-100">
                Monitor de Cambios en Páginas Web (Stock / Precios)
              </h3>
            </div>
            <form onSubmit={handleMonitorWeb} className="flex gap-2">
              <input
                type="url"
                value={monitorUrl}
                onChange={(e) => setMonitorUrl(e.target.value)}
                placeholder="https://tienda.com/producto"
                className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                required
              />
              <button
                type="submit"
                disabled={isMonitoring}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {isMonitoring ? 'Auditando...' : 'Verificar'}
              </button>
            </form>
            {monitorResult && (
              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs font-mono space-y-1.5">
                <div className="flex items-center gap-2">
                  {monitorResult.hasChanged ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="font-bold text-zinc-200">
                    {monitorResult.firstCheck
                      ? 'Huella digital base registrada'
                      : monitorResult.hasChanged
                      ? '¡CAMBIO DETECTADO EN LA PÁGINA!'
                      : 'Sin cambios desde la última auditoría'}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">Hash SHA256: {monitorResult.currentHash}</p>
                <p className="text-[10px] text-zinc-400">Longitud bytes: {monitorResult.length}</p>
                <p className="text-[10px] text-zinc-400">Última comprobación: {monitorResult.lastChecked}</p>
              </div>
            )}
          </div>

          {/* Subtool C: Coupon & Deal Finder */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col md:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-yellow-400">
                <Percent className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold text-zinc-100">
                  Rastreador de Ofertas y Cupones de Descuento
                </h3>
              </div>
            </div>
            <form onSubmit={handleFindCoupons} className="flex gap-2">
              <input
                type="text"
                value={couponStore}
                onChange={(e) => setCouponStore(e.target.value)}
                placeholder="Nombre de la tienda (ej. Amazon, Nike, AliExpress, Steam)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 focus:outline-hidden focus:border-red-500"
                required
              />
              <button
                type="submit"
                disabled={isFindingCoupons}
                className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
              >
                {isFindingCoupons ? 'Buscando...' : 'Buscar Cupones'}
              </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              {couponDeals.map((deal, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-1 hover:border-yellow-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-800/40">
                      {deal.code}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{deal.discount}</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-sans">{deal.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: FILE & SHEET GENERATORS */}
      {activeCategory === 'files' && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* CSV Generator */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold text-zinc-100">
                  Generador de Hojas de Cálculo (CSV / Excel)
                </h3>
              </div>
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-semibold transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Descargar CSV</span>
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={csvTitle}
                onChange={(e) => setCsvTitle(e.target.value)}
                placeholder="Nombre del archivo (sin extensión)"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200"
              />
              <input
                type="text"
                value={csvHeaders}
                onChange={(e) => setCsvHeaders(e.target.value)}
                placeholder="Encabezados separados por coma"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200 font-mono"
              />
              <textarea
                value={csvRows}
                onChange={(e) => setCsvRows(e.target.value)}
                placeholder="Filas separadas por coma (un salto por línea)..."
                rows={6}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-zinc-200 font-mono focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>

          {/* Markdown / Document Generator */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-rose-400">
                <FileText className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold text-zinc-100">
                  Maquetador de Documentos (Markdown / Word)
                </h3>
              </div>
              <button
                onClick={handleDownloadDoc}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-mono font-semibold transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Descargar .MD</span>
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Título del documento"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs rounded-lg text-zinc-200"
              />
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                placeholder="# Encabezado...\n- Viñeta 1..."
                rows={7}
                className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-zinc-200 font-mono focus:outline-hidden focus:border-red-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
