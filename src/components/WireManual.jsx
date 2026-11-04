import React, { useRef, useState } from 'react';
import { trautonium } from '../audio/TrautoniumEngine';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export default function WireManual({
  manualId = 'upper',
  title = 'МАНУАЛ (ПРОВОЛОКА НА РЕЛЬСЕ)',
  octaveOffset = 3, // C3
  octaveSpan = 2,   // 2 octaves default on phones for easy thumb/finger playing
  onOctaveSpanChange,
  mode = 'free',    // 'free' (glissando) | 'snap' (chromatic snap)
  onNoteChange,
}) {
  const containerRef = useRef(null);
  const [activeTouches, setActiveTouches] = useState([]);

  // Calculate base frequency from C
  const baseMidi = (octaveOffset + 1) * 12; // C3 is MIDI 48
  const totalSemitones = Math.round(octaveSpan * 12);

  // Convert normalized X position (0..1) to Frequency
  const xToFreq = (normX) => {
    let semitone = normX * totalSemitones;
    if (mode === 'snap') {
      semitone = Math.round(semitone);
    }
    const midi = baseMidi + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  };

  // Convert frequency to Note Name
  const freqToNote = (freq) => {
    const midi = Math.round(69 + 12 * Math.log2(freq / 440));
    const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${noteName}${octave}`;
  };

  // Handle pointer down (touch/mouse)
  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const normX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const pressure = 0.4 + normY * 0.6; // Pressure: deeper on wire = more expression

    const freq = xToFreq(normX);
    const noteStr = freqToNote(freq);
    const touchId = `${manualId}-${e.pointerId ?? 'mouse'}`;

    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch (err) {}

    trautonium.touchStart(touchId, freq, pressure);

    const touchObj = { id: touchId, pointerId: e.pointerId, x: normX * 100, y: normY * 100, note: noteStr, freq };
    setActiveTouches((prev) => [...prev.filter((t) => t.id !== touchId), touchObj]);
    onNoteChange?.(noteStr, freq, true);
  };

  // Handle pointer move (glissando / vibrato)
  const handlePointerMove = (e) => {
    const touchId = `${manualId}-${e.pointerId ?? 'mouse'}`;
    const exists = activeTouches.some(t => t.id === touchId);
    if (!exists) return;

    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();

    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const pressure = 0.4 + normY * 0.6;

    const freq = xToFreq(normX);
    const noteStr = freqToNote(freq);

    trautonium.touchMove(touchId, freq, pressure);

    setActiveTouches((prev) =>
      prev.map((t) => (t.id === touchId ? { ...t, x: normX * 100, y: normY * 100, note: noteStr, freq } : t))
    );
    onNoteChange?.(noteStr, freq, true);
  };

  // Handle pointer up
  const handlePointerUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const touchId = `${manualId}-${e.pointerId ?? 'mouse'}`;
    trautonium.touchEnd(touchId);

    try {
      containerRef.current.releasePointerCapture(e.pointerId);
    } catch (err) {}

    setActiveTouches((prev) => {
      const filtered = prev.filter((t) => t.id !== touchId);
      if (filtered.length === 0) {
        onNoteChange?.(null, null, false);
      }
      return filtered;
    });
  };

  // Generate claviatur key markers for the ribbon
  const markers = [];
  for (let i = 0; i <= totalSemitones; i++) {
    const semitoneOffset = i;
    const noteIndex = (baseMidi + semitoneOffset) % 12;
    const isNatural = !NOTE_NAMES[noteIndex].includes('#');
    const isC = noteIndex === 0;
    const leftPercent = (i / totalSemitones) * 100;

    markers.push({
      semitoneOffset,
      leftPercent,
      name: NOTE_NAMES[noteIndex],
      isNatural,
      isC,
    });
  }

  return (
    <div className="relative w-full flex flex-col bg-gradient-to-b from-[#181a1d] to-[#0f1012] p-2 sm:p-2.5 rounded-xl border border-zinc-700 shadow-xl select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1 mb-1.5 flex-wrap gap-1">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">
            {title}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700">
            {mode === 'free' ? 'АНАЛОГ ГЛИССАНДО' : '12-TET ПОЛУТОНА'}
          </span>
        </div>

        {/* Zoom & Range controls */}
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-amber-400">
            C{octaveOffset} – C{octaveOffset + Math.ceil(octaveSpan)}
          </span>

          {onOctaveSpanChange && (
            <div className="flex items-center space-x-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
              <span className="text-zinc-400 text-[9px]">МАСШТАБ:</span>
              <button
                onClick={() => onOctaveSpanChange(1.5)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  octaveSpan === 1.5 ? 'bg-amber-600 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
                title="1.5 октавы - самые крупные клавиши для смартфона"
              >
                1.5x
              </button>
              <button
                onClick={() => onOctaveSpanChange(2)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  octaveSpan === 2 ? 'bg-amber-600 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
                title="2 октавы - оптимально для игры пальцами"
              >
                2x
              </button>
              <button
                onClick={() => onOctaveSpanChange(3)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  octaveSpan === 3 ? 'bg-amber-600 text-black' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
                title="3 октавы - широкий охват"
              >
                3x
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ribbon Manual Area (Dedicated touch-action none for fluid gliding) */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="playable-wire relative w-full h-36 sm:h-44 rounded-lg overflow-hidden bg-gradient-to-b from-[#26282c] via-[#1a1b1e] to-[#0d0e10] border-2 border-[#544a38] shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)] cursor-crosshair touch-none"
      >
        {/* Brass Ground Rail Base (Нижний контактный рельс) */}
        <div className="absolute top-[48%] left-0 right-0 h-5 bg-gradient-to-b from-[#8f7d54] via-[#cca964] to-[#6b5833] shadow-md border-t border-amber-300/40"></div>

        {/* Resistance Wire (Нихромовая натянутая проволока) */}
        <div className="absolute top-[52%] left-0 right-0 h-1.5 bg-gradient-to-r from-zinc-200 via-white to-zinc-200 shadow-[0_1px_4px_rgba(0,0,0,0.9),0_0_10px_rgba(255,255,255,0.9)] pointer-events-none"></div>

        {/* Claviatur Markers (Язычки и метки клавиш) */}
        <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none flex">
          {markers.map((m, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${m.leftPercent}%` }}
            >
              {/* Marker pin / fret line */}
              <div
                className={`w-[1px] ${
                  m.isC
                    ? 'h-full bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                    : m.isNatural
                    ? 'h-10 bg-zinc-300/80'
                    : 'h-6 bg-zinc-500/60'
                }`}
              ></div>

              {/* Note Label */}
              {m.isNatural && (
                <span
                  className={`mt-auto mb-1.5 font-mono text-[10px] sm:text-xs font-bold ${
                    m.isC ? 'text-amber-300 font-extrabold text-[11px] sm:text-sm' : 'text-zinc-400'
                  }`}
                >
                  {m.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Upper Guide Scale Markers */}
        <div className="absolute top-0 left-0 right-0 h-5 pointer-events-none">
          {markers.filter((m) => m.isC).map((m, idx) => (
            <div
              key={idx}
              className="absolute top-1 -translate-x-1/2 font-mono text-[11px] text-amber-400 font-bold"
              style={{ left: `${m.leftPercent}%` }}
            >
              ▼ C{octaveOffset + idx}
            </div>
          ))}
        </div>

        {/* Dynamic Pressure / Instruction watermark */}
        <div className="absolute top-6 left-3 font-mono text-[9px] text-zinc-600 pointer-events-none select-none">
          ▲ ТИШЕ / СМЯГЧЕНИЕ &nbsp;&nbsp;&nbsp;&nbsp; ▼ ГРОМЧЕ / ЯРЧЕ (НАЖИМ)
        </div>

        {/* Touch Sparks / Active contact glow indicators */}
        {activeTouches.map((touch) => (
          <div
            key={touch.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${touch.x}%`, top: `${touch.y}%` }}
          >
            {/* Electric contact glow */}
            <div className="w-12 h-12 rounded-full bg-amber-400/35 blur-md animate-ping"></div>
            <div className="absolute inset-0 m-auto w-5 h-5 rounded-full bg-white shadow-[0_0_16px_#fbbf24]"></div>

            {/* Floating Pitch Badge */}
            <div className="absolute -top-11 -translate-x-1/2 left-1/2 px-2.5 py-0.5 rounded bg-zinc-950/95 border border-amber-500 text-amber-300 font-mono text-xs font-bold whitespace-nowrap shadow-xl z-20">
              {touch.note} ({Math.round(touch.freq)} Hz)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
