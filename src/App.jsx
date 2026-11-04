import React, { useState, useRef } from 'react';
import {
  Power,
  Layers,
  Music,
  Sliders,
  Sparkles,
  Info,
  Radio,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { trautonium } from './audio/TrautoniumEngine';
import { PRESETS } from './audio/presets';
import Oscilloscope from './components/Oscilloscope';
import VacuumTube from './components/VacuumTube';
import WireManual from './components/WireManual';
import SubharmonicSection from './components/SubharmonicSection';
import FormantFilterSection from './components/FormantFilterSection';
import DynamicsSection from './components/DynamicsSection';
import PresetBar from './components/PresetBar';

const TABS = [
  { id: 'play', label: 'ИГРА', icon: Music },
  { id: 'mixtur', label: 'СУБГАРМОНИКИ', icon: Sliders },
  { id: 'filter', label: 'ФОРМАНТЫ & FX', icon: Sparkles },
  { id: 'all', label: 'ВСЯ ПАНЕЛЬ', icon: Radio },
];

export default function App() {
  const [isPowered, setIsPowered] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [currentFreq, setCurrentFreq] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Manual Settings
  const [playMode, setPlayMode] = useState('free'); // 'free' (glissando) | 'snap' (chromatic)
  const [octaveOffset, setOctaveOffset] = useState(3); // C3
  const [octaveSpan, setOctaveSpan] = useState(2);     // 2 octaves default (optimal for phone screen width)
  const [isDualManual, setIsDualManual] = useState(false);

  // Synthesizer State initialized with Oskar Sala Solo preset
  const defaultPreset = PRESETS[0];
  const [activePresetId, setActivePresetId] = useState(defaultPreset.id);
  const [subharmonics, setSubharmonics] = useState(defaultPreset.subharmonics);
  const [formants, setFormants] = useState(defaultPreset.formants);
  const [drive, setDrive] = useState(defaultPreset.drive);
  const [reverb, setReverb] = useState(defaultPreset.reverb);
  const [expression, setExpression] = useState(defaultPreset.expression);

  // Active view tab
  const [activeTab, setActiveTab] = useState('play'); // 'play' | 'mixtur' | 'filter' | 'all'
  const [showInfo, setShowInfo] = useState(false);

  // Swipe detection for switching tabs
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    // If touch starts on a playable wire, do not handle tab swipe
    if (e.target.closest('.playable-wire') || e.target.closest('input[type="range"]')) {
      touchStartRef.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Detect horizontal swipe (at least 50px, fast, mostly horizontal)
    if (deltaTime < 500 && Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.6) {
      const tabIds = TABS.map((t) => t.id);
      const currentIndex = tabIds.indexOf(activeTab);
      if (deltaX < 0 && currentIndex < tabIds.length - 1) {
        // Swiped left -> next tab
        setActiveTab(tabIds[currentIndex + 1]);
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swiped right -> prev tab
        setActiveTab(tabIds[currentIndex - 1]);
      }
    }
  };

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
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full bg-[#0c0d0f] text-gray-200 flex flex-col font-sans select-none overflow-hidden"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
        paddingLeft: 'max(env(safe-area-inset-left, 0px), 6px)',
        paddingRight: 'max(env(safe-area-inset-right, 0px), 6px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)',
      }}
    >
      {/* Vintage Header Panel */}
      <header className="bg-gradient-to-r from-[#181a1d] via-[#24272c] to-[#181a1d] border-b border-zinc-700/80 px-2 sm:px-3 py-1.5 flex items-center justify-between shadow-md flex-shrink-0 z-30">
        <div className="flex items-center space-x-2">
          {/* Power Switch */}
          <button
            onClick={togglePower}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-bold transition-all shadow-sm ${
              isPowered
                ? 'bg-emerald-600 text-black border-emerald-400 shadow-[0_0_10px_#10b981]'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
          >
            <Power className="w-3 h-3" />
            <span>{isPowered ? 'ВКЛ' : 'ПИТАНИЕ'}</span>
          </button>

          <div>
            <h1 className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 tracking-wider">
              ТРАУТОНИУМ
            </h1>
            <p className="text-[8px] font-mono text-zinc-400 leading-tight hidden xs:block">
              MIXTURTRAUTONIUM
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center space-x-1.5">
          {/* Glissando / Snap Switch */}
          <button
            onClick={() => setPlayMode(playMode === 'free' ? 'snap' : 'free')}
            className="px-2 py-1 text-[10px] font-mono rounded border border-zinc-700 bg-zinc-800 text-amber-300 font-bold hover:bg-zinc-700"
          >
            {playMode === 'free' ? 'ГЛИСС' : '12-TET'}
          </button>

          {/* Octave Shift */}
          <div className="flex items-center space-x-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-xs">
            <button
              onClick={() => setOctaveOffset(Math.max(1, octaveOffset - 1))}
              className="px-1.5 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 font-bold text-[11px]"
            >
              -
            </button>
            <span className="text-amber-300 font-bold px-0.5 text-[11px]">C{octaveOffset}</span>
            <button
              onClick={() => setOctaveOffset(Math.min(5, octaveOffset + 1))}
              className="px-1.5 py-0.5 bg-zinc-800 rounded hover:bg-zinc-700 text-amber-400 font-bold text-[11px]"
            >
              +
            </button>
          </div>

          {/* Dual Manual Toggle */}
          <button
            onClick={() => setIsDualManual(!isDualManual)}
            className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
              isDualManual
                ? 'bg-amber-600 text-black border-amber-400 font-bold'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title="Включить 2 мануала"
          >
            <Layers className="w-3 h-3" />
          </button>

          {/* Info Modal Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
            title="О Траутониуме"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Tab Navigation Bar (Swipeable / Touch buttons) */}
      <nav className="flex items-center justify-around bg-[#131518] border-b border-zinc-800 px-1 py-1 flex-shrink-0 z-20">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-1 mx-0.5 rounded flex items-center justify-center space-x-1 font-mono text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Dynamic Content Views */}
      <div className="flex-1 min-h-0 relative flex flex-col">
        {/* VIEW 1: PLAY MODE (Focused Performance on Samsung S23) */}
        {activeTab === 'play' && (
          <div className="flex-1 flex flex-col justify-between p-2 space-y-2 overflow-y-auto scrollable-panel">
            {/* Compact Oscilloscope HUD & Tubes */}
            <div className="grid grid-cols-4 gap-2 flex-shrink-0">
              <div className="col-span-3">
                <Oscilloscope
                  currentNote={currentNote}
                  currentFreq={currentFreq}
                  isPlaying={isPlaying}
                />
              </div>
              <div className="bg-[#181a1d] rounded-xl p-1.5 border border-zinc-700 shadow-md flex items-center justify-center">
                <VacuumTube isPlaying={isPlaying} drive={drive} />
              </div>
            </div>

            {/* Quick Horizontal Presets */}
            <div className="flex-shrink-0">
              <PresetBar
                activePresetId={activePresetId}
                setActivePresetId={setActivePresetId}
                setSubharmonics={setSubharmonics}
                setFormants={setFormants}
                setDrive={setDrive}
                setReverb={setReverb}
                setExpression={setExpression}
              />
            </div>

            {/* Expression Swell Slider */}
            <div className="bg-[#181a1d] px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center space-x-2 flex-shrink-0">
              <span className="font-mono text-[10px] text-zinc-400 whitespace-nowrap">ПЕДАЛЬ:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={expression}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setExpression(val);
                  trautonium.setExpression(val);
                }}
                className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="font-mono text-[10px] text-amber-400 font-bold whitespace-nowrap">
                {Math.round(expression * 100)}%
              </span>
            </div>

            {/* Playable Wire Manuals (Takes prominent screen area) */}
            <div className="space-y-2 flex-1 flex flex-col justify-end">
              <WireManual
                manualId="upper"
                title={isDualManual ? 'ВЕРХНИЙ МАНУАЛ (МЕЛОДИЯ)' : 'МАНУАЛ ТРАУТОНИУМА'}
                octaveOffset={octaveOffset}
                octaveSpan={octaveSpan}
                onOctaveSpanChange={setOctaveSpan}
                mode={playMode}
                onNoteChange={handleNoteChange}
              />

              {isDualManual && (
                <WireManual
                  manualId="lower"
                  title="НИЖНИЙ МАНУАЛ (СУБГАРМОНИЧЕСКИЙ БАС)"
                  octaveOffset={Math.max(1, octaveOffset - 1)}
                  octaveSpan={octaveSpan}
                  onOctaveSpanChange={setOctaveSpan}
                  mode={playMode}
                  onNoteChange={handleNoteChange}
                />
              )}
            </div>

            {/* Hint for swipes */}
            <div className="text-center text-[9px] font-mono text-zinc-500 pt-0.5">
              ← Свайпните влево для настройки субгармоник и фильтров →
            </div>
          </div>
        )}

        {/* VIEW 2: SUBHARMONIC MIXTURWERK */}
        {activeTab === 'mixtur' && (
          <div className="flex-1 flex flex-col p-2 space-y-2 overflow-y-auto scrollable-panel">
            <SubharmonicSection
              subharmonics={subharmonics}
              setSubharmonics={setSubharmonics}
            />

            {/* Sticky Mini Manual for instant previewing while adjusting */}
            <div className="mt-auto pt-2">
              <WireManual
                manualId="upper"
                title="ТЕСТОВЫЙ МАНУАЛ"
                octaveOffset={octaveOffset}
                octaveSpan={octaveSpan}
                onOctaveSpanChange={setOctaveSpan}
                mode={playMode}
                onNoteChange={handleNoteChange}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: FORMANT FILTERS & FX */}
        {activeTab === 'filter' && (
          <div className="flex-1 flex flex-col p-2 space-y-2 overflow-y-auto scrollable-panel">
            <FormantFilterSection
              formants={formants}
              setFormants={setFormants}
              drive={drive}
              setDrive={setDrive}
              reverb={reverb}
              setReverb={setReverb}
            />

            <DynamicsSection
              expression={expression}
              setExpression={setExpression}
            />

            {/* Sticky Mini Manual for previewing */}
            <div className="mt-auto pt-2">
              <WireManual
                manualId="upper"
                title="ТЕСТОВЫЙ МАНУАЛ"
                octaveOffset={octaveOffset}
                octaveSpan={octaveSpan}
                onOctaveSpanChange={setOctaveSpan}
                mode={playMode}
                onNoteChange={handleNoteChange}
              />
            </div>
          </div>
        )}

        {/* VIEW 4: ALL CONSOLE (Traditional view for tablet/landscape) */}
        {activeTab === 'all' && (
          <div className="flex-1 overflow-y-auto scrollable-panel p-2 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="md:col-span-3">
                <Oscilloscope
                  currentNote={currentNote}
                  currentFreq={currentFreq}
                  isPlaying={isPlaying}
                />
              </div>
              <div className="bg-[#181a1d] rounded-xl p-2 border border-zinc-700 shadow-md flex items-center justify-around">
                <VacuumTube isPlaying={isPlaying} drive={drive} />
                <VacuumTube isPlaying={isPlaying} drive={drive} />
              </div>
            </div>

            <PresetBar
              activePresetId={activePresetId}
              setActivePresetId={setActivePresetId}
              setSubharmonics={setSubharmonics}
              setFormants={setFormants}
              setDrive={setDrive}
              setReverb={setReverb}
              setExpression={setExpression}
            />

            <SubharmonicSection
              subharmonics={subharmonics}
              setSubharmonics={setSubharmonics}
            />

            <FormantFilterSection
              formants={formants}
              setFormants={setFormants}
              drive={drive}
              setDrive={setDrive}
              reverb={reverb}
              setReverb={setReverb}
            />

            <DynamicsSection
              expression={expression}
              setExpression={setExpression}
            />

            <WireManual
              manualId="upper"
              title={isDualManual ? 'ВЕРХНИЙ МАНУАЛ' : 'МАНУАЛ ТРАУТОНИУМА'}
              octaveOffset={octaveOffset}
              octaveSpan={octaveSpan}
              onOctaveSpanChange={setOctaveSpan}
              mode={playMode}
              onNoteChange={handleNoteChange}
            />

            {isDualManual && (
              <WireManual
                manualId="lower"
                title="НИЖНИЙ МАНУАЛ"
                octaveOffset={Math.max(1, octaveOffset - 1)}
                octaveSpan={octaveSpan}
                onOctaveSpanChange={setOctaveSpan}
                mode={playMode}
                onNoteChange={handleNoteChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Info & Historical Context Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-[#181a1d] border border-amber-600/80 rounded-2xl max-w-lg w-full p-4 text-gray-300 font-sans shadow-2xl relative">
            <h2 className="text-amber-400 font-mono text-sm font-bold mb-2">
              О ТРАУТОНИУМЕ (TRAUTONIUM)
            </h2>
            <div className="text-[11px] space-y-2 text-zinc-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              <p>
                <strong>Траутониум</strong> — легендарный электронный инструмент 1929–1952 гг. конструкции <strong>Фридриха Траутвейна</strong> и <strong>Оскара Сала</strong>.
              </p>
              <p>
                <strong>Как играть:</strong>
                <br />• <strong>Струна на рельсе:</strong> Касайтесь проволоки пальцем и ведите влево/вправо для глиссандо.
                <br />• <strong>Сила нажима:</strong> Смещайте палец ниже к рельсу для громкого, яркого звука и выше для мягкого.
                <br />• <strong>Свайпы:</strong> Свайпайте экран влево и вправо для переключения между экранами игры, субгармоник и формантных фильтров.
                <br />• <strong>Масштаб 1.5x / 2x:</strong> Нажмите на масштабирование над струной, чтобы сделать клавиши крупнее для пальцев на экране телефона.
              </p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-3 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-mono font-bold text-xs rounded transition-colors"
            >
              ЗАКРЫТЬ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
