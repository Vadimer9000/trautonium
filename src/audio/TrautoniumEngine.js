// Trautonium & Mixturtrautonium Synthesis Engine
// Emulates the 1930s-1950s Friedrich Trautwein & Oskar Sala electronic instrument.

class TrautoniumEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    // Master nodes
    this.masterGain = null;
    this.expressionGain = null;
    this.analyser = null;
    this.driveNode = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.destNode = null;

    // Formant filters
    this.formant1 = null;
    this.formant2 = null;
    this.lowpass = null;

    // Engine settings
    this.subharmonics = [
      { divisor: 1, volume: 1.0, wave: 'sawtooth', active: true },
      { divisor: 2, volume: 0.8, wave: 'sawtooth', active: true },
      { divisor: 3, volume: 0.6, wave: 'sawtooth', active: true },
      { divisor: 5, volume: 0.5, wave: 'sawtooth', active: true },
    ];

    this.formantParams = {
      f1: 750,
      q1: 6,
      gain1: 8,
      f2: 2100,
      q2: 8,
      gain2: 10,
      cutoff: 9000,
      resonance: 2.5
    };

    this.expression = 0.85; // Master expression (foot pedal emulation)
    this.drive = 0.35;      // Vacuum tube saturation
    this.reverbAmount = 0.25;
    this.vibratoSpeed = 5.5; // Hz
    this.vibratoDepth = 0.0; // Semitones

    // Noise generator (for Hitchcock "The Birds" flutter effect)
    this.noiseGain = null;
    this.noiseFilter = null;
    this.noiseFlutter = false;

    // Active manual voices (mapped by touchId or manualIndex)
    // Structure: id -> { oscs: [OscillatorNode], gains: [GainNode], baseFreq, touchY, envelopeGain }
    this.voices = new Map();

    // Media recorder
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
  }

  init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass({ latencyHint: 'interactive' });

    // 1. Master chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.expressionGain = this.ctx.createGain();
    this.expressionGain.gain.setValueAtTime(this.expression, this.ctx.currentTime);

    // 2. Tube Saturation (WaveShaper)
    this.driveNode = this.ctx.createWaveShaper();
    this.updateDriveCurve(this.drive);

    // 3. Formant Filter Bank (Sala Resonant LC Filters)
    this.formant1 = this.ctx.createBiquadFilter();
    this.formant1.type = 'peaking';
    this.formant1.frequency.setValueAtTime(this.formantParams.f1, this.ctx.currentTime);
    this.formant1.Q.setValueAtTime(this.formantParams.q1, this.ctx.currentTime);
    this.formant1.gain.setValueAtTime(this.formantParams.gain1, this.ctx.currentTime);

    this.formant2 = this.ctx.createBiquadFilter();
    this.formant2.type = 'peaking';
    this.formant2.frequency.setValueAtTime(this.formantParams.f2, this.ctx.currentTime);
    this.formant2.Q.setValueAtTime(this.formantParams.q2, this.ctx.currentTime);
    this.formant2.gain.setValueAtTime(this.formantParams.gain2, this.ctx.currentTime);

    this.lowpass = this.ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.setValueAtTime(this.formantParams.cutoff, this.ctx.currentTime);
    this.lowpass.Q.setValueAtTime(this.formantParams.resonance, this.ctx.currentTime);

    // 4. Spring / Hall Reverb
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createSyntheticReverbBuffer(2.2, 2.8);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbAmount, this.ctx.currentTime);
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0 - this.reverbAmount * 0.5, this.ctx.currentTime);

    // 5. Analyser (CRT Oscilloscope)
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.75;

    // 6. Audio Destination & Recording Stream
    this.destNode = this.ctx.createMediaStreamDestination();

    // Wiring up the filter bank
    // Voices -> Drive -> Formant1 -> Formant2 -> Lowpass -> ExpressionGain -> Dry/Wet -> MasterGain -> Analyser -> Speakers & Dest
    this.driveNode.connect(this.formant1);
    this.formant1.connect(this.formant2);
    this.formant2.connect(this.lowpass);
    this.lowpass.connect(this.expressionGain);

    // Dry path
    this.expressionGain.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    // Reverb path
    this.expressionGain.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.masterGain);

    // Master to output & visualizer
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.analyser.connect(this.destNode);

    // 7. Setup Noise Generator for Hitchcock's Birds flutter
    this.setupNoiseGenerator();

    this.isInitialized = true;
  }

  ensureRunning() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateDriveCurve(amount) {
    const k = amount * 35;
    const n = 512;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
    }
    this.driveNode.curve = curve;
  }

  createSyntheticReverbBuffer(duration, decay) {
    const rate = this.ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / rate;
      const envelope = Math.exp(-t * decay);
      // Diffuse reflections with small metallic comb delay echoes
      const noiseL = (Math.random() * 2 - 1) * envelope;
      const noiseR = (Math.random() * 2 - 1) * envelope;
      left[i] = noiseL;
      right[i] = noiseR;
    }
    return impulse;
  }

  setupNoiseGenerator() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pinkish/brownish filtered noise for natural wing flap / hiss
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.04 * white) / 1.04;
      data[i] = lastOut * 3.5;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

    noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.driveNode);

    noiseSource.start();
  }

  // Touch down on manual wire
  // id: unique touch identifier (string/number)
  // freq: fundamental frequency in Hz (calculated from ribbon position)
  // pressure: 0..1 (vertical touch position or touch force, emulating rail pressure)
  touchStart(id, freq, pressure = 0.7) {
    this.ensureRunning();

    if (this.voices.has(id)) {
      this.touchMove(id, freq, pressure);
      return;
    }

    const now = this.ctx.currentTime;
    const voiceEnvelope = this.ctx.createGain();
    // Quick, responsive attack (0.012s) to avoid click while keeping sharp wire contact
    voiceEnvelope.gain.setValueAtTime(0.001, now);
    const targetGain = Math.min(1.0, Math.max(0.1, pressure * 1.1));
    voiceEnvelope.gain.exponentialRampToValueAtTime(targetGain, now + 0.015);

    const oscs = [];
    const gains = [];

    // Create 4 subharmonic dividers
    this.subharmonics.forEach((sub, index) => {
      if (!sub.active || sub.volume <= 0.001) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const subFreq = Math.max(16, freq / sub.divisor);
      osc.type = sub.wave || 'sawtooth';
      osc.frequency.setValueAtTime(subFreq, now);

      gain.gain.setValueAtTime(sub.volume * 0.35, now);

      osc.connect(gain);
      gain.connect(voiceEnvelope);
      osc.start(now);

      oscs.push({ osc, divisor: sub.divisor });
      gains.push(gain);
    });

    voiceEnvelope.connect(this.driveNode);

    this.voices.set(id, {
      oscs,
      gains,
      voiceEnvelope,
      baseFreq: freq,
      pressure
    });
  }

  // Sliding finger along the wire (continuous glissando + vibrato)
  touchMove(id, freq, pressure = 0.7) {
    if (!this.voices.has(id)) return;
    const voice = this.voices.get(id);
    const now = this.ctx.currentTime;

    voice.baseFreq = freq;
    voice.pressure = pressure;

    // Update subharmonics instantaneously without zipper noise
    voice.oscs.forEach(({ osc, divisor }) => {
      const subFreq = Math.max(16, freq / divisor);
      osc.frequency.setTargetAtTime(subFreq, now, 0.008);
    });

    // Vertical pressure modulates dynamic level & filter
    const targetGain = Math.min(1.0, Math.max(0.1, pressure * 1.1));
    voice.voiceEnvelope.gain.setTargetAtTime(targetGain, now, 0.02);
  }

  // Release finger from wire
  touchEnd(id) {
    if (!this.voices.has(id)) return;
    const voice = this.voices.get(id);
    const now = this.ctx.currentTime;

    // Organic release envelope (0.04s decay)
    voice.voiceEnvelope.gain.setTargetAtTime(0.0001, now, 0.02);

    setTimeout(() => {
      voice.oscs.forEach(({ osc }) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      try {
        voice.voiceEnvelope.disconnect();
      } catch (e) {}
      this.voices.delete(id);
    }, 70);
  }

  // Release all active notes
  releaseAll() {
    for (const id of this.voices.keys()) {
      this.touchEnd(id);
    }
  }

  // Set subharmonic configuration
  setSubharmonic(index, divisor, volume, wave, active = true) {
    if (index < 0 || index >= this.subharmonics.length) return;
    this.subharmonics[index] = { divisor, volume, wave, active };

    // Update active voices
    const now = this.ctx ? this.ctx.currentTime : 0;
    for (const voice of this.voices.values()) {
      if (voice.oscs[index]) {
        voice.oscs[index].divisor = divisor;
        voice.oscs[index].osc.type = wave;
        const subFreq = Math.max(16, voice.baseFreq / divisor);
        voice.oscs[index].osc.frequency.setTargetAtTime(subFreq, now, 0.01);
      }
      if (voice.gains[index]) {
        const vol = active ? volume * 0.35 : 0;
        voice.gains[index].gain.setTargetAtTime(vol, now, 0.01);
      }
    }
  }

  // Set Formant Filter parameters
  setFormants({ f1, q1, gain1, f2, q2, gain2, cutoff, resonance }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (f1 !== undefined) {
      this.formantParams.f1 = f1;
      this.formant1.frequency.setTargetAtTime(f1, now, 0.02);
    }
    if (q1 !== undefined) {
      this.formantParams.q1 = q1;
      this.formant1.Q.setTargetAtTime(q1, now, 0.02);
    }
    if (gain1 !== undefined) {
      this.formantParams.gain1 = gain1;
      this.formant1.gain.setTargetAtTime(gain1, now, 0.02);
    }

    if (f2 !== undefined) {
      this.formantParams.f2 = f2;
      this.formant2.frequency.setTargetAtTime(f2, now, 0.02);
    }
    if (q2 !== undefined) {
      this.formantParams.q2 = q2;
      this.formant2.Q.setTargetAtTime(q2, now, 0.02);
    }
    if (gain2 !== undefined) {
      this.formantParams.gain2 = gain2;
      this.formant2.gain.setTargetAtTime(gain2, now, 0.02);
    }

    if (cutoff !== undefined) {
      this.formantParams.cutoff = cutoff;
      this.lowpass.frequency.setTargetAtTime(cutoff, now, 0.02);
    }
    if (resonance !== undefined) {
      this.formantParams.resonance = resonance;
      this.lowpass.Q.setTargetAtTime(resonance, now, 0.02);
    }
  }

  // Set Expression (Pedal)
  setExpression(val) {
    this.expression = Math.max(0, Math.min(1.0, val));
    if (this.expressionGain && this.ctx) {
      this.expressionGain.gain.setTargetAtTime(this.expression, this.ctx.currentTime, 0.015);
    }
  }

  // Set Tube Drive Saturation
  setDrive(val) {
    this.drive = Math.max(0, Math.min(1.0, val));
    if (this.driveNode) {
      this.updateDriveCurve(this.drive);
    }
  }

  // Set Spring Reverb
  setReverb(val) {
    this.reverbAmount = Math.max(0, Math.min(1.0, val));
    if (this.ctx && this.reverbGain && this.dryGain) {
      const now = this.ctx.currentTime;
      this.reverbGain.gain.setTargetAtTime(this.reverbAmount, now, 0.02);
      this.dryGain.gain.setTargetAtTime(1.0 - this.reverbAmount * 0.4, now, 0.02);
    }
  }

  // Trigger Hitchcock "The Birds" flutter effect
  triggerBirdFlutter(enable) {
    if (!this.ctx || !this.noiseGain) return;
    this.noiseFlutter = enable;
    const now = this.ctx.currentTime;
    if (enable) {
      this.noiseGain.gain.setTargetAtTime(0.55, now, 0.02);
      this.noiseFilter.frequency.setTargetAtTime(2600, now, 0.05);
    } else {
      this.noiseGain.gain.setTargetAtTime(0.0001, now, 0.06);
    }
  }

  // Audio Recording (WAV / WebM)
  startRecording() {
    this.ensureRunning();
    if (this.isRecording) return;
    this.recordedChunks = [];

    const stream = this.destNode.stream;
    let mimeType = 'audio/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = '';
    }

    try {
      this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
    this.isRecording = true;
  }

  stopRecording() {
    return new Promise((resolve) => {
      if (!this.isRecording || !this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
        this.isRecording = false;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}

export const trautonium = new TrautoniumEngine();
