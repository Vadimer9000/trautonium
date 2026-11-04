import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { PRESETS } from '../audio/presets';
import { trautonium } from '../audio/TrautoniumEngine';

export default function PresetBar({
  activePresetId,
  setActivePresetId,
  setSubharmonics,
  setFormants,
  setDrive,
  setReverb,
  setExpression,
}) {
  const applyPreset = (preset) => {
    setActivePresetId(preset.id);
    setSubharmonics(preset.subharmonics);
    setFormants(preset.formants);
    setDrive(preset.drive);
    setReverb(preset.reverb);
    setExpression(preset.expression);

    // Apply to engine
    preset.subharmonics.forEach((s, idx) => {
      trautonium.setSubharmonic(idx, s.divisor, s.volume, s.wave, s.active);
    });
    trautonium.setFormants(preset.formants);
    trautonium.setDrive(preset.drive);
    trautonium.setReverb(preset.reverb);
    trautonium.setExpression(preset.expression);
  };

  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div className="bg-[#181a1d] rounded-xl p-2.5 border-2 border-zinc-700 shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
            ИСТОРИЧЕСКИЕ ПРЕСЕТЫ ТРАУТОНИУМА
          </span>
        </div>
        {activePreset && (
          <span className="text-[10px] font-mono text-emerald-400 truncate max-w-[280px]">
            {activePreset.description}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-all border ${
              activePresetId === p.id
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
