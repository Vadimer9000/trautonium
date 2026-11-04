import React, { useEffect, useRef, useState } from 'react';
import { trautonium } from '../audio/TrautoniumEngine';

export default function Oscilloscope({ currentNote, currentFreq, isPlaying }) {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('wave'); // 'wave' | 'fft'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dataArray = new Uint8Array(1024);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      // Dark CRT phosphor glass background
      ctx.fillStyle = '#08120b';
      ctx.fillRect(0, 0, width, height);

      // CRT Graticule / Grid
      ctx.strokeStyle = 'rgba(57, 255, 20, 0.15)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let y = 0; y < height; y += height / 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Vertical grid lines
      for (let x = 0; x < width; x += width / 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (!trautonium.analyser) {
        // Idle beam line
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      if (mode === 'wave') {
        trautonium.analyser.getByteTimeDomainData(dataArray);

        // Stabilize trigger: find zero-crossing
        let triggerIndex = 0;
        for (let i = 0; i < dataArray.length - 1; i++) {
          if (dataArray[i] < 128 && dataArray[i + 1] >= 128) {
            triggerIndex = i;
            break;
          }
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#39ff14';
        ctx.strokeStyle = '#5cff3b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();

        const sliceWidth = width / (dataArray.length - triggerIndex);
        let x = 0;

        for (let i = triggerIndex; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === triggerIndex) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // FFT Spectrum
        trautonium.analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(57, 255, 20, 0.65)';
        const barWidth = (width / 64) - 1;
        let x = 0;

        for (let i = 0; i < 64; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }

      // CRT Scanline raster effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <div className="relative bg-zinc-950 rounded-xl p-2.5 border-2 border-zinc-700 shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-1 mb-1.5 text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-emerald-400 font-bold tracking-widest uppercase">
            OSZILLOSKOP CRT-1930
          </span>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setMode('wave')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              mode === 'wave' ? 'bg-emerald-600 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            WAVE
          </button>
          <button
            onClick={() => setMode('fft')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              mode === 'fft' ? 'bg-emerald-600 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            FFT
          </button>
        </div>
      </div>

      {/* Screen Canvas */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-lg overflow-hidden border border-emerald-950/80 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
        <canvas
          ref={canvasRef}
          width={640}
          height={240}
          className="w-full h-full block"
        />

        {/* Digital Readout HUD */}
        <div className="absolute top-2 left-3 font-mono text-[11px] text-emerald-400/90 pointer-events-none drop-shadow">
          <div>PITCH: <span className="font-bold text-emerald-300">{currentNote || '--'}</span></div>
          <div>FREQ: <span className="font-bold text-emerald-300">{currentFreq ? `${Math.round(currentFreq * 10) / 10} Hz` : '-- Hz'}</span></div>
        </div>

        <div className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-500/70 pointer-events-none">
          {isPlaying ? '● SIGNAL ACTIVE' : '○ STANDBY'}
        </div>
      </div>
    </div>
  );
}
