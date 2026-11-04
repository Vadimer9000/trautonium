import React from 'react';

export default function VacuumTube({ isPlaying, drive }) {
  const intensity = isPlaying ? 0.85 + Math.min(drive * 0.3, 0.4) : 0.25;

  return (
    <div className="flex flex-col items-center">
      {/* Vintage Glass Tube Shell */}
      <div className="relative w-14 h-24 rounded-t-full bg-gradient-to-b from-zinc-800/40 via-zinc-900/60 to-zinc-950 border border-zinc-600/50 shadow-inner flex flex-col items-center justify-end pb-2 overflow-hidden">
        {/* Glass reflection */}
        <div className="absolute top-2 left-2 w-1.5 h-14 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-[0.5px]"></div>
        <div className="absolute top-2 right-2 w-0.5 h-10 bg-gradient-to-b from-white/20 to-transparent rounded-full"></div>

        {/* Anode plate internal structure */}
        <div className="absolute top-6 w-8 h-10 border border-zinc-500/60 rounded bg-zinc-800/50 flex items-center justify-center">
          <div className="w-5 h-7 border-t border-b border-zinc-600"></div>
        </div>

        {/* Filament Glowing Coils (Thyratron / Triode) */}
        <div
          className="relative z-10 w-2 h-7 rounded-full transition-all duration-100"
          style={{
            backgroundColor: isPlaying ? '#ffeedd' : '#ff7700',
            boxShadow: isPlaying
              ? `0 0 16px 6px rgba(255, 120, 20, ${intensity}), 0 0 30px 12px rgba(255, 60, 0, ${intensity * 0.7})`
              : '0 0 6px 2px rgba(255, 100, 0, 0.3)',
          }}
        ></div>

        {/* Base connector pins */}
        <div className="w-10 h-2 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 rounded-sm mt-1 border-t border-amber-400"></div>
      </div>

      <span className="mt-1 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-widest">
        RE-134 VALV
      </span>
    </div>
  );
}
