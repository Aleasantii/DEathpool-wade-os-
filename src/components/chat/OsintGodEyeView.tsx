import React, { useState } from 'react';
import { Eye, MapPin, Upload, Crosshair } from 'lucide-react';
import { playUiClick } from '../../utils/audio';

interface TargetLocation {
  label: string;
  lat: number;
  lng: number;
  region: string;
  intel: string;
  danger: string;
  imageNote: string;
}

export const OsintGodEyeView: React.FC = () => {
  const [selectedTarget, setSelectedTarget] = useState<TargetLocation>({
    label: 'Coordenadas de Logan (Wolverine)',
    lat: 53.7267,
    lng: -127.6476,
    region: 'British Columbia, Canadá',
    intel: 'Firma metálica de alta densidad detectada en sector forestal. Probabilidad de adamantium 98.4%.',
    danger: 'Clasificado / Alto',
    imageNote: 'Metadatos EXIF indican captura analógica digitalizada.'
  });

  const [isScanning, setIsScanning] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const targets: TargetLocation[] = [
    {
      label: 'Coordenadas de Logan (Wolverine)',
      lat: 53.7267,
      lng: -127.6476,
      region: 'British Columbia, Canadá',
      intel: 'Firma metálica de alta densidad detectada en sector forestal. Probabilidad de adamantium 98.4%.',
      danger: 'Clasificado / Alto',
      imageNote: 'Metadatos EXIF indican captura analógica digitalizada.'
    },
    {
      label: 'Punto de Enlace Blind Al',
      lat: 40.7128,
      lng: -74.0060,
      region: 'Manhattan, New York',
      intel: 'Residencia clandestina. Suministros y comunicaciones seguras.',
      danger: 'Bajo / Seguro',
      imageNote: 'Geolocalización por patrón de sombra en ladrillo.'
    },
    {
      label: 'Punto de Disrupción TVA (Sucursal 616)',
      lat: 34.0522,
      lng: -118.2437,
      region: 'Los Angeles, Timeline 616',
      intel: 'Variación cronal localizada. Residuos de portal temporal.',
      danger: 'Anomalía Temporal',
      imageNote: 'Frecuencia cronal 42.8 GHz.'
    },
    {
      label: 'Estación de Apoyo Dopinder',
      lat: 28.6139,
      lng: 77.2090,
      region: 'Delhi / Transbordo',
      intel: 'Vehículo táctico y abastecimiento de provisiones.',
      danger: 'Aliado',
      imageNote: 'Fotograma satelital de alta resolución.'
    }
  ];

  const handleSimulateExif = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsScanning(true);
    playUiClick();

    setTimeout(() => {
      setIsScanning(false);
      setSelectedTarget({
        label: `Fotografía: ${file.name}`,
        lat: 45.5017 + (Math.random() - 0.5) * 4,
        lng: -73.5673 + (Math.random() - 0.5) * 4,
        region: 'Sector Geográfico Triangulado',
        intel: `Metadatos extraídos con éxito: Coordenadas GPS y sensor ISO 400. Patrón visual analizado.`,
        danger: 'Monitorizado',
        imageNote: 'Firma EXIF verificada mediante modelo de visión.'
      });
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#09090b] text-zinc-200 overflow-hidden font-sans">
      {/* Tactical Radar Display */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-rose-400" />
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Ojo de Dios • Radar OSINT y Geolocalización
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Triangulación satelital y análisis de metadatos de imágenes.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 border border-white/[0.08] px-2 py-0.5 rounded">
            ENCRYPTED LINK
          </span>
        </div>

        {/* Minimalist Tactical Grid */}
        <div className="relative w-full h-72 sm:h-80 bg-zinc-950/80 border border-white/[0.08] rounded-xl overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #e11d48 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Central Target Reticle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border border-cyan-400/60 border-dashed animate-spin flex items-center justify-center" style={{ animationDuration: '14s' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-zinc-900/90 border border-white/[0.08] rounded-md text-center backdrop-blur-sm">
              <span className="text-xs font-mono font-medium text-zinc-100 block">
                {selectedTarget.label}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                LAT {selectedTarget.lat.toFixed(4)} • LNG {selectedTarget.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Minimal Corner Data */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-zinc-400 bg-zinc-900/60 px-2.5 py-1.5 rounded border border-white/[0.06] backdrop-blur-sm">
            <div>RESOLUCIÓN: 0.25M / PX</div>
            <div>ESTADO: {isScanning ? 'ANALIZANDO EXIF...' : 'FIJADO'}</div>
          </div>

          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-zinc-400 bg-zinc-900/60 px-2.5 py-1.5 rounded border border-white/[0.06] text-right backdrop-blur-sm">
            <div>REGIÓN: {selectedTarget.region}</div>
            <div>RIESGO: {selectedTarget.danger}</div>
          </div>
        </div>

        {/* Selected Target Dossier */}
        <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="text-zinc-200 font-medium">Informe de Coordenadas:</span>
            <span>ID: OSINT-{Math.abs(Math.floor(selectedTarget.lat * 10))}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-mono">
            {selectedTarget.intel}
          </p>
          <div className="text-[11px] text-zinc-400 font-mono pt-1 border-t border-white/[0.05]">
            Nota de análisis: {selectedTarget.imageNote}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Target Directory & EXIF Upload */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/[0.06] bg-zinc-950/40 p-4 sm:p-6 flex flex-col shrink-0 gap-4 overflow-y-auto">
        <div className="p-3.5 bg-zinc-900/40 border border-white/[0.06] rounded-xl space-y-2">
          <span className="text-xs font-mono text-zinc-300 font-medium block">
            Extraer EXIF de Imagen
          </span>
          <p className="text-[11px] text-zinc-400 font-mono">
            Cargue una fotografía para extraer metadatos de cámara y geolocalización.
          </p>

          <label className="flex items-center justify-center gap-2 w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-white/[0.08] rounded-lg cursor-pointer text-xs font-mono text-zinc-200 transition-colors">
            <Upload size={13} />
            <span className="truncate">{uploadedFileName || 'Seleccionar Imagen'}</span>
            <input type="file" accept="image/*" onChange={handleSimulateExif} className="hidden" />
          </label>
        </div>

        <div className="space-y-1.5 flex-1">
          <span className="text-xs font-mono text-zinc-500 font-medium block mb-2">
            Puntos Tácticos Registrados
          </span>
          {targets.map((t, idx) => {
            const isSelected = selectedTarget.label === t.label;
            return (
              <button
                key={idx}
                onClick={() => {
                  playUiClick();
                  setSelectedTarget(t);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs font-mono ${
                  isSelected
                    ? 'bg-zinc-900 border-white/[0.12] text-zinc-100 shadow-sm'
                    : 'bg-zinc-950/50 border-white/[0.04] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <div className="font-medium flex items-center justify-between">
                  <span className="truncate">{t.label}</span>
                  <MapPin size={12} className={isSelected ? 'text-rose-400' : 'text-zinc-600'} />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 truncate">
                  {t.region}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
