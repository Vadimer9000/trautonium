import React, { useState } from 'react';
import { Mic, Square, Play, Download, Bird, Gauge } from 'lucide-react';
import { trautonium } from '../audio/TrautoniumEngine';

export default function DynamicsSection({ expression, setExpression }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isBirdFluttering, setIsBirdFluttering] = useState(false);

  const handleExpressionChange = (val) => {
    setExpression(val);
    trautonium.setExpression(val);
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      trautonium.startRecording();
      setIsRecording(true);
      setRecordedAudioUrl(null);
    } else {
      const blob = await trautonium.stopRecording();
      setIsRecording(false);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
      }
    }
  };

  const triggerBirdStart = (e) => {
    e.preventDefault();
    setIsBirdFluttering(true);
    trautonium.triggerBirdFlutter(true);
  };

  const triggerBirdEnd = (e) => {
    e.preventDefault();
    setIsBirdFluttering(false);
    trautonium.triggerBirdFlutter(false);
  };

  return (
    <div className="bg-[#181a1d] rounded-xl p-3 border-2 border-zinc-700 shadow-xl flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-700/80 pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-amber-500" />
          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider uppercase">
            ДИНАМИЧЕСКАЯ ПЕДАЛЬ & РЕКОРДЕР
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Expression Pedal Slider */}
        <div className="w-full sm:flex-1 bg-[#212428] p-2.5 rounded-lg border border-zinc-700 flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300 mb-1">
            <span className="font-bold text-amber-300">ЖИДКОСТНАЯ ПЕДАЛЬ (EXPRESSION)</span>
            <span className="text-amber-400 font-bold">{Math.round(expression * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={expression}
            onChange={(e) => handleExpressionChange(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[9px] font-mono text-zinc-400 mt-1">
            Регулирует общую динамику и яркость нажима проволоки
          </span>
        </div>

        {/* Hitchcock "The Birds" Trigger Button */}
        <button
          onPointerDown={triggerBirdStart}
          onPointerUp={triggerBirdEnd}
          onPointerLeave={triggerBirdEnd}
          className={`h-14 px-4 rounded-lg font-mono text-xs font-bold flex flex-col items-center justify-center border transition-all ${
            isBirdFluttering
              ? 'bg-red-600 text-white border-red-400 scale-95 shadow-[0_0_15px_#ef4444]'
              : 'bg-gradient-to-b from-zinc-800 to-zinc-900 text-red-400 border-zinc-700 hover:border-red-500'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Bird className={`w-4 h-4 ${isBirdFluttering ? 'animate-bounce' : ''}`} />
            <span>ВЗМАХ КРЫЛЬЕВ ХИЧКОКА</span>
          </div>
          <span className="text-[9px] text-zinc-400 font-normal">Удерживать для шума крыльев</span>
        </button>

        {/* Audio Recording Unit */}
        <div className="bg-[#212428] p-2 rounded-lg border border-zinc-700 flex items-center space-x-2">
          <button
            onClick={toggleRecording}
            className={`px-3 py-2 rounded-lg font-mono text-xs font-bold flex items-center space-x-1.5 border transition-all ${
              isRecording
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-zinc-800 text-zinc-200 border-zinc-600 hover:bg-zinc-700'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>СТОП ЗАПИСЬ</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>ЗАПИСЬ</span>
              </>
            )}
          </button>

          {recordedAudioUrl && (
            <div className="flex items-center space-x-1.5">
              <audio src={recordedAudioUrl} controls className="h-8 w-40" />
              <a
                href={recordedAudioUrl}
                download="trautonium-performance.webm"
                className="p-2 rounded bg-amber-600 text-black font-mono text-xs font-bold hover:bg-amber-500 flex items-center"
                title="Скачать запись"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
