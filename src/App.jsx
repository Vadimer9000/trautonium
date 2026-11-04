import React, { useState, useEffect } from 'react';
import { Power, Layers, Music, SlidersHorizontal, Info, VolumeX, Volume2 } from 'lucide-react';
import { trautonium } from './audio/TrautoniumEngine';
import { PRESETS } from './audio/presets';
import Oscilloscope from './components/Oscilloscope';
import VacuumTube from './components/VacuumTube';
import WireManual from './components/WireManual';
import SubharmonicSection from './components/SubharmonicSection';
import FormantFilterSection from './components/FormantFilterSection';
import DynamicsSection from './components/DynamicsSection';
import PresetBar from './components/PresetBar';

export default function App() {
  const [isPowered, setIsPowered] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentFreq, setCurrentFreq] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manual Settings
  const [playMode, setPlayMode] = useState('free'); // 'free' (glissando) | 'snap' (chromatic)
  const [octaveOffset, setOctaveOffset] = useState(3); // C3
  const [isDualManual, setIsDualManual] = useState(false);

  // Synthesizer State initialized with Oskar Sala Solo preset
  const defaultPreset = PRESETS[0];
  const [activePresetId, setActivePresetId] = useState(defaultPreset.id);
  const [subharmonics, setSubharmonics] = useState(defaultPreset.subharmonics);
  const [formants, setFormants] = useState(defaultPreset.formants);
  const [drive, setDrive] = useState(defaultPreset.drive);
  const [reverb, setReverb] = useState(defaultPreset.reverb);
  const [expression, setExpression] = useState(defaultPreset.expression);

  // Active view tab for smaller mobile screens (SYNTH CONTROLS vs MANUAL)
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'ribbon' | 'synth'
  const [showInfo, setShowInfo] = useState(false);

  const togglePower = () => {
    if (!isPowered) {
      trautonium.ensureRunning();
      setIsPowered(true);
    } else {
      trautonium.releaseAll();
      setIsPowered(false);
      setIsPlaying(false);
    }
  };

  const handleNoteChange = (note, freq, active) => {
    setCurrentNote(note);
    setCurrentFreq(freq);
    setIsPlaying(active);
    if (active && !isPowered) {
      setIsPowered(true);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0c0d0f] text-gray-200 flex flex-col overflow-y-auto overflow-x-hidden font-sans select-none pb-4">
      {/* Vintage Header Panel */}
      <header className="bg-gradient-to-r from-[#181a1d] via-[#24272c] to-[#181a1d] border-b-2 border-zinc-700 px-3 py-2 flex items-center justify-between shadow-lg sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePower}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all shadow-md ${
              isPowered
                ? 'bg-emerald-600 text-black border-emerald-400 shadow-[0_0_12px_#10b981]'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isPowered ? 'СЕТЬ ВКЛ' : 'ВКЛЮЧИТЬ ПИТАНИЕ'}</span>
          </button>

          <div>
            <h1 className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 tracking-wider">
              ТРАУТОНИУМ <span className="text-zinc-500 font-normal">| MIXTURTRAUTONIUM</span>
            </h1>
            <p className="text-[9px] font-mono text-zinc-400 hidden sm:block">
              СИНТЕЗАТОР СУБГАРМОНИК ФРИДРИХА ТРАУТВЕЙНА И ОСКАРА САЛА (1930)
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Dual Manual Switch */}
          <button
            onClick={() => setIsDualManual(!isDualManual)}
            className={`px-2.5 py-1 text-xs font-mono rounded border flex items-center space-x-1 transition-all ${
              isDualManual
                ? 'bg-amber-600 text-black border-amber-400 font-bold'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2 МАНУАЛА</span>
          </button>

          {/* Glissando / Snap Switch */}
          <button
            onClick={() => setPlayMode(playMode === 'free' ? 'snap' : 'free')}
            className="px-2.5 py-1 text-xs font-mono rounded border border-zinc-700 bg-zinc-800 text-amber-300 hover:bg-zinc-700 font-bold"
          >
            {playMode === 'free' ? 'АНАЛОГ ГЛИССАНДО' : '12-TET ПОЛУТОНА'}
          </button>

          {/* Octave Shift */}
          <div className="flex items-center space-x-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700 font-mono text-xs">
            <span className="text-zinc-400 text-[10px]">ОКТАВА:</span>
            <button
              onClick={() => setOctaveOffset(Math.max(1, octaveOffset - 1))}
              className="px-1.5 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 font-bold"
            >
              -
            </button>
            <span className="text-amber-300 font-bold px-1">C{octaveOffset}</span>
            <button
              onClick={() => setOctaveOffset(Math.min(5, octaveOffset + 1))}
              className="px-1.5 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 font-bold"
            >
              +
            </button>
          </div>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1.5 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
            title="О Траутониуме"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 p-2 sm:p-3 max-w-7xl mx-auto w-full space-y-3">
        {/* Top Control Section: Visualizers & Tubes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3">
            <Oscilloscope
              currentNote={currentNote}
              currentFreq={currentFreq}
              isPlaying={isPlaying}
            />
          </div>

          <div className="bg-[#181a1d] rounded-xl p-3 border-2 border-zinc-700 shadow-xl flex items-center justify-around">
            <VacuumTube isPlaying={isPlaying} drive={drive} />
            <VacuumTube isPlaying={isPlaying} drive={drive} />
          </div>
        </div>

        {/* Presets Bar */}
        <PresetBar
          activePresetId={activePresetId}
          setActivePresetId={setActivePresetId}
          setSubharmonics={setSubharmonics}
          setFormants={setFormants}
          setDrive={setDrive}
          setReverb={setReverb}
          setExpression={setExpression}
        />

        {/* Synthesis Engine: Subharmonic Mixturwerk */}
        <SubharmonicSection
          subharmonics={subharmonics}
          setSubharmonics={setSubharmonics}
        />

        {/* Formant Filter Bank & Saturation */}
        <FormantFilterSection
          formants={formants}
          setFormants={setFormants}
          drive={drive}
          setDrive={setDrive}
          reverb={reverb}
          setReverb={setReverb}
        />

        {/* Dynamics & Liquid Pedal & Recorder */}
        <DynamicsSection
          expression={expression}
          setExpression={setExpression}
        />

        {/* Playing Manuals (Ribbon Wires) */}
        <div className="space-y-3 pt-1">
          {/* Upper / Main Manual */}
          <WireManual
            manualId="upper"
            title={isDualManual ? 'ВЕРХНИЙ МАНУАЛ (МЕЛОДИЯ / СОЛО)' : 'МАНУАЛ ТРАУТОНИУМА (ПРОВОЛОКА НА РЕЛЬСЕ)'}
            octaveOffset={octaveOffset}
            octaveSpan={3}
            mode={playMode}
            onNoteChange={handleNoteChange}
          />

          {/* Lower Manual (Mixturtrautonium Bass / Polyphony) */}
          {isDualManual && (
            <WireManual
              manualId="lower"
              title="НИЖНИЙ МАНУАЛ (СУБГАРМОНИЧЕСКИЙ БАС / АККОМПАНЕМЕНТ)"
              octaveOffset={Math.max(1, octaveOffset - 1)}
              octaveSpan={3}
              mode={playMode}
              onNoteChange={handleNoteChange}
            />
          )}
        </div>
      </main>

      {/* Info & Historical Context Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181a1d] border-2 border-amber-600/80 rounded-2xl max-w-lg w-full p-5 text-gray-300 font-sans shadow-2xl relative">
            <h2 className="text-amber-400 font-mono text-base font-bold mb-2">
              О ТРАУТОНИУМЕ (TRAUTONIUM)
            </h2>
            <div className="text-xs space-y-2.5 text-zinc-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <p>
                <strong>Траутониум</strong> — легендарный ранний электронный музыкальный инструмент, изобретенный в 1929 году инженером <strong>Фридрихом Траутвейном</strong> в Берлине, и усовершенствованный виртуозом и композитором <strong>Оскаром Сала</strong> в виде <em>Mixturtrautonium</em>.
              </p>
              <p>
                <strong>Как устроен инструмент:</strong>
                <br />• <strong>Струнный мануал:</strong> Вместо традиционной клавиатуры натянута нихромовая проволока над металлическим рельсом. Прижатие пальцем замыкает контакт, а скольжение дает непрерывное аналоговое глиссандо, микрохроматику и естественное пальцевое вибрато.
                <br />• <strong>Генератор субгармоник (Mixturwerk):</strong> Базовая частота делится тиратронами на целые числа (f/1, f/2, f/3, f/4, f/5... f/24), образуя уникальные субгармонические аккорды (унтертоны).
                <br />• <strong>Формантные фильтры:</strong> Набор LC-резонансных контуров имитирует голосовые форманты гласных, звуки струнных смычковых и колоколов.
                <br />• <strong>Фильм Альфреда Хичкока «Птицы» (1963):</strong> Все жуткие звуки хлопанья крыльев, атак и криков птиц были созданы Оскаром Сала исключительно на Траутониуме без привлечения настоящих птиц!
              </p>
              <p className="text-amber-300 font-mono text-[11px] pt-1 border-t border-zinc-700">
                Совет: Коснитесь струны пальцем и ведите влево-вправо для глиссандо. Вертикальное смещение регулирует силу нажима (динамику).
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs rounded-lg transition-colors"
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
