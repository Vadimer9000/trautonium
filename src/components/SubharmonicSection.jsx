import React from 'react';
import { Volume2, Power, Waves } from 'lucide-react';
import { trautonium } from '../audio/TrautoniumEngine';

const AVAILABLE_DIVISORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 16, 20, 24];

const INTERVAL_LABELS = {
  1: 'Унисон (f0)',
  2: 'Октава вниз (f0/2)',
  3: 'Дуодецима (f0/3)',
  4: '2 октавы вниз (f0/4)',
  5: '2 октавы + терция (f0/5)',
  6: '2 октавы + квинта (f0/6)',
  7: 'Натуральная септима (f0/7)',
  8: '3 октавы вниз (f0/8)',
  9: '3 октавы + нона (f0/9)',
  10: '3 октавы + терция (f0/10)',
  11: 'Негармонич. тритон (f0/11)',
  12: '3 октавы + квинта (f0/12)',
  16: '4 октавы вниз (f0/16)',
  20: '4 октавы + терция (f0/20)',
  24: '4 октавы + квинта (f0/24)'
};

const WAVE_OPTIONS = [
  { id: 'sawtooth', label: 'ПИЛА' },
  { id: 'square', label: 'МЕАНДР' },
  { id: 'triangle', label: 'ТРЕУГОЛ' },
  { id: 'sine', label: 'СИНУС' },
];

export default function SubharmonicSection({ subharmonics, setSubharmonics }) {
  const updateSub = (index, field, value) => {
    const updated = [...subharmonics];
    updated[index] = { ...updated[index], [field]: value };
    setSubharmonics(updated);

    const s = updated[index];
    trautonium.setSubharmonic(index, s.divisor, s.volume, s.wave, s.active);
  };

  return (
    <div className="bg-[#181a1d] rounded-xl p-3 border-2 border-zinc-700 shadow-xl flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Waves className="w-4 h-4 text-amber-500" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
            MIXTURWERK: ДЕЛИТЕЛИ СУБГАРМОНИК (f / N)
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          ОСКАР САЛА СИНТЕЗ
        </span>
      </div>

      {/* 4 Subharmonic Channels Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {subharmonics.map((sub, idx) => (
          <div
            key={idx}
            className={`flex flex-col p-2.5 rounded-lg border transition-all ${
              sub.active
                ? 'bg-[#212428] border-zinc-600 shadow-md'
                : 'bg-[#151618] border-zinc-800 opacity-60'
            }`}
          >
            {/* Header / Active button */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[11px] font-bold text-amber-300">
                СУБГАРМОНИКА {idx + 1}
              </span>
              <button
                onClick={() => updateSub(idx, 'active', !sub.active)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  sub.active
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                <Power className="w-3 h-3" />
              </button>
            </div>

            {/* Divisor Selector */}
            <div className="flex flex-col mb-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
                <span>ДЕЛИТЕЛЬ:</span>
                <span className="text-amber-400 font-bold text-xs">f / {sub.divisor}</span>
              </div>
              <select
                value={sub.divisor}
                onChange={(e) => updateSub(idx, 'divisor', parseInt(e.target.value, 10))}
                className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded p-1 font-mono focus:border-amber-500 outline-none"
              >
                {AVAILABLE_DIVISORS.map((d) => (
                  <option key={d} value={d}>
                    ÷ {d} — {INTERVAL_LABELS[d] || `f / ${d}`}
                  </option>
                ))}
              </select>
              <div className="text-[9px] font-mono text-emerald-400/90 truncate mt-0.5">
                {INTERVAL_LABELS[sub.divisor] || `f / ${sub.divisor}`}
              </div>
            </div>

            {/* Waveform Selector */}
            <div className="flex flex-col mb-2">
              <span className="text-[10px] font-mono text-zinc-400 mb-1">ФОРМА ВОЛНЫ:</span>
              <div className="grid grid-cols-2 gap-1">
                {WAVE_OPTIONS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => updateSub(idx, 'wave', w.id)}
                    className={`py-0.5 text-[9px] font-mono rounded transition-colors ${
                      sub.wave === w.id
                        ? 'bg-amber-600 text-black font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Level Fader */}
            <div className="flex flex-col mt-auto">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span className="flex items-center space-x-1">
                  <Volume2 className="w-3 h-3" />
                  <span>УРОВЕНЬ:</span>
                </span>
                <span className="text-zinc-200 font-bold">{Math.round(sub.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={sub.volume}
                onChange={(e) => updateSub(idx, 'volume', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
