// Historical and expressive presets for Trautonium

export const PRESETS = [
  {
    id: 'oskar-sala',
    name: 'Oskar Sala Solo',
    description: 'Классическая комбинация субгармоник f/1, f/2, f/3, f/5 с формантным вокальным резонансом',
    subharmonics: [
      { divisor: 1, volume: 1.0, wave: 'sawtooth', active: true },
      { divisor: 2, volume: 0.75, wave: 'sawtooth', active: true },
      { divisor: 3, volume: 0.60, wave: 'sawtooth', active: true },
      { divisor: 5, volume: 0.45, wave: 'sawtooth', active: true },
    ],
    formants: {
      f1: 850,
      q1: 7,
      gain1: 9,
      f2: 2300,
      q2: 8,
      gain2: 11,
      cutoff: 8500,
      resonance: 2.2
    },
    drive: 0.35,
    reverb: 0.30,
    expression: 0.85
  },
  {
    id: 'hitchcock-birds',
    name: 'Птицы (The Birds 1963)',
    description: 'Оригинальный пугающий тембр Альфреда Хичкока — резкие негармонические субгармоники и резонанс',
    subharmonics: [
      { divisor: 1, volume: 1.0, wave: 'sawtooth', active: true },
      { divisor: 3, volume: 0.9, wave: 'sawtooth', active: true },
      { divisor: 7, volume: 0.75, wave: 'square', active: true },
      { divisor: 11, volume: 0.65, wave: 'sawtooth', active: true },
    ],
    formants: {
      f1: 1750,
      q1: 14,
      gain1: 15,
      f2: 3800,
      q2: 12,
      gain2: 14,
      cutoff: 12000,
      resonance: 5.5
    },
    drive: 0.65,
    reverb: 0.45,
    expression: 0.90
  },
  {
    id: 'subharmonic-cello',
    name: 'Виолончель Оскара Сала',
    description: 'Глубокий деревянный бас с октавными субгармониками f/1, f/2, f/4, f/8',
    subharmonics: [
      { divisor: 1, volume: 0.9, wave: 'sawtooth', active: true },
      { divisor: 2, volume: 1.0, wave: 'sawtooth', active: true },
      { divisor: 4, volume: 0.7, wave: 'triangle', active: true },
      { divisor: 8, volume: 0.5, wave: 'triangle', active: true },
    ],
    formants: {
      f1: 420,
      q1: 5,
      gain1: 10,
      f2: 1450,
      q2: 4,
      gain2: 6,
      cutoff: 4200,
      resonance: 1.8
    },
    drive: 0.25,
    reverb: 0.35,
    expression: 0.80
  },
  {
    id: 'cathedral-organ',
    name: 'Кафедральный микстур-орган',
    description: 'Мощный субгармонический аккорд, звучащий синхронно с движением пальца',
    subharmonics: [
      { divisor: 1, volume: 0.95, wave: 'sawtooth', active: true },
      { divisor: 2, volume: 0.85, wave: 'square', active: true },
      { divisor: 3, volume: 0.75, wave: 'sawtooth', active: true },
      { divisor: 4, volume: 0.70, wave: 'square', active: true },
    ],
    formants: {
      f1: 650,
      q1: 4,
      gain1: 6,
      f2: 1950,
      q2: 5,
      gain2: 7,
      cutoff: 9500,
      resonance: 2.0
    },
    drive: 0.20,
    reverb: 0.60,
    expression: 0.90
  },
  {
    id: 'sci-fi-theremin',
    name: 'Ретро Терменвокс',
    description: 'Чистое экспрессивное глиссандо для плавных фантастических мелодий',
    subharmonics: [
      { divisor: 1, volume: 1.0, wave: 'sine', active: true },
      { divisor: 2, volume: 0.2, wave: 'triangle', active: true },
      { divisor: 3, volume: 0.0, wave: 'sine', active: false },
      { divisor: 4, volume: 0.0, wave: 'sine', active: false },
    ],
    formants: {
      f1: 900,
      q1: 2,
      gain1: 3,
      f2: 2400,
      q2: 3,
      gain2: 4,
      cutoff: 7000,
      resonance: 1.2
    },
    drive: 0.15,
    reverb: 0.50,
    expression: 0.85
  },
  {
    id: 'vocal-choir',
    name: 'Электронный хор (A-O-U)',
    description: 'Вокальные форманты гласных с мягким аналоговым телом',
    subharmonics: [
      { divisor: 1, volume: 0.85, wave: 'sawtooth', active: true },
      { divisor: 2, volume: 0.65, wave: 'sawtooth', active: true },
      { divisor: 4, volume: 0.50, wave: 'triangle', active: true },
      { divisor: 6, volume: 0.35, wave: 'sine', active: true },
    ],
    formants: {
      f1: 720,
      q1: 10,
      gain1: 14,
      f2: 1300,
      q2: 12,
      gain2: 12,
      cutoff: 5500,
      resonance: 3.0
    },
    drive: 0.28,
    reverb: 0.40,
    expression: 0.85
  }
];
