import React, { useState, useEffect } from 'react';
import { playChimichangaCrunch } from '../../utils/audio';

interface DeadpoolClockProps {
  className?: string;
}

export const DeadpoolClock: React.FC<DeadpoolClockProps> = ({ className = '' }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState(true);

  // Accurate 1000ms clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = is24Hour
    ? time.getHours().toString().padStart(2, '0')
    : ((time.getHours() % 12) || 12).toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

  const handleClick = () => {
    playChimichangaCrunch();
    setIs24Hour((prev) => !prev);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title="Reloj Minimalista Deadpool (Fijo) • Clic para alternar formato 12h/24h"
      className={`group cursor-pointer select-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_14px_rgba(225,29,72,0.2)] backdrop-blur-md transition-all transform hover:scale-[1.03] active:scale-95 ${className}`}
    >
      {/* Subtle pulsing status dot */}
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />

      {/* Minimalist Bangers Comic Digits */}
      <div className="flex items-baseline font-['Bangers'] text-sm tracking-wider text-zinc-100">
        <span className="text-zinc-100">{hours}</span>
        <span className="text-rose-500 px-0.5 animate-pulse font-sans font-bold">:</span>
        <span className="text-zinc-100">{minutes}</span>
        <span className="text-rose-500 px-0.5 animate-pulse font-sans font-bold">:</span>
        <span className="text-amber-400 font-bold">{seconds}</span>
        {!is24Hour && (
          <span className="text-[10px] text-rose-400 font-mono ml-1 uppercase">
            {ampm}
          </span>
        )}
      </div>

      <span className="text-[9px] font-mono font-semibold text-rose-400/80 tracking-widest pl-0.5 hidden sm:inline">
        CHRONO
      </span>
    </div>
  );
};
