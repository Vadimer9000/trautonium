import React from 'react';
import { Sliders, Flame, Sparkles } from 'lucide-react';
import { trautonium } from '../audio/TrautoniumEngine';

export default function FormantFilterSection({
  formants,
  setFormants,
  drive,
  setDrive,
  reverb,
  setReverb,
}) {
  const updateFormant = (field, value) => {
    const updated = { ...formants, [field]: value };
    setFormants(updated);
    trautonium.setFormants({ [field]: value });
  };

  const updateDrive = (val) => {
    setDrive(val);
    trautonium.setDrive(val);
  };

  const updateReverb = (val) => {
    setReverb(val);
    trautonium.setReverb(val);
  };

  return (
    <div className="bg-[#181a1d] rounded-xl p-3 border-2 border-zinc-700 shadow-xl flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider uppercase">
            ФОРМАНТНЫЙ БЛОК & ЛАМПОВЫЙ КАСКАД
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          LC-РЕЗОНАНС ТРАУТВЕЙНА
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Formant 1 */}
        <div className="bg-[#212428] p-2 rounded-lg border border-zinc-700 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300 mb-2">
            <span>ФОРМАНТА 1</span>
            <span className="text-emerald-400 text-[10px]">{Math.round(formants.f1)} Hz</span>
          </div>

          <div className="space-y-2 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Частота:</span>
                <span>{Math.round(formants.f1)} Гц</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="10"
                value={formants.f1}
                onChange={(e) => updateFormant('f1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Добротность (Q):</span>
                <span>{formants.q1}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={formants.q1}
                onChange={(e) => updateFormant('q1', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Formant 2 */}
        <div className="bg-[#212428] p-2 rounded-lg border border-zinc-700 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300 mb-2">
            <span>ФОРМАНТА 2</span>
            <span className="text-emerald-400 text-[10px]">{Math.round(formants.f2)} Hz</span>
          </div>

          <div className="space-y-2 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Частота:</span>
                <span>{Math.round(formants.f2)} Гц</span>
              </div>
              <input
                type="range"
                min="600"
                max="5000"
                step="20"
                value={formants.f2}
                onChange={(e) => updateFormant('f2', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Добротность (Q):</span>
                <span>{formants.q2}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={formants.q2}
                onChange={(e) => updateFormant('q2', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Master Tone / Lowpass */}
        <div className="bg-[#212428] p-2 rounded-lg border border-zinc-700 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300 mb-2">
            <span>МАСТЕР ТОН</span>
            <span className="text-amber-400 text-[10px]">{Math.round(formants.cutoff)} Hz</span>
          </div>

          <div className="space-y-2 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Срез НЧ:</span>
                <span>{Math.round(formants.cutoff)} Гц</span>
              </div>
              <input
                type="range"
                min="500"
                max="14000"
                step="100"
                value={formants.cutoff}
                onChange={(e) => updateFormant('cutoff', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400">
                <span>Резонанс:</span>
                <span>{formants.resonance}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.2"
                value={formants.resonance}
                onChange={(e) => updateFormant('resonance', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Tube Drive & Space Reverb */}
        <div className="bg-[#212428] p-2 rounded-lg border border-zinc-700 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300 mb-2">
            <span>АНАЛОГОВЫЙ ТРАКТ</span>
          </div>

          <div className="space-y-2 text-[10px] font-mono">
            <div>
              <div className="flex justify-between text-zinc-400 items-center">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  <span>Ламповый сатуратор:</span>
                </span>
                <span className="text-red-400 font-bold">{Math.round(drive * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={drive}
                onChange={(e) => updateDrive(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 items-center">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Пружинный реверб:</span>
                </span>
                <span className="text-cyan-400 font-bold">{Math.round(reverb * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={reverb}
                onChange={(e) => updateReverb(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
