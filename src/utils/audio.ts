// Web Audio API synthesizer for Wade OS
let audioCtx: AudioContext | null = null;
let masterVolume = 0.8;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume));
}

export function getSoundVolume(): number {
  return masterVolume;
}

export function toggleSoundMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

export function isSoundMuted(): boolean {
  return isMuted;
}

// Gunshot effect
export function playGunshot() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.35);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(masterVolume * 0.9, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.4);
}

// Sword clash / SNIKT!
export function playSwordClash() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(2400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.28);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(3600, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);

  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 8;

  gain.gain.setValueAtTime(masterVolume * 0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc2.start();
  osc.stop(ctx.currentTime + 0.32);
  osc2.stop(ctx.currentTime + 0.32);
}

// Chimichanga crunch
export function playChimichangaCrunch() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (i % 8 === 0 ? 1.5 : 0.4);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(masterVolume * 0.7, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.26);
}

// Comedic airhorn / buzzer
export function playComedicHorn() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const frequencies = [293.66, 329.63, 440.0, 587.33];
  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.setValueAtTime(freq * 1.05, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(freq, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(masterVolume * 0.18, ctx.currentTime);
    gain.gain.setValueAtTime(masterVolume * 0.22, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  });
}

// TVA timeline zap / prune
export function playTvaZap() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);

  gain.gain.setValueAtTime(masterVolume * 0.6, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.42);
}

// Fourth wall pop
export function playFourthWallPop() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(masterVolume * 0.8, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.22);
}

// Aliases for Deadpool sound FX
export const playAirhorn = playComedicHorn;
export const playFourthWallGlitch = playFourthWallPop;

// UI Click
export function playUiClick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(masterVolume * 0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

// Cassette synthesizer melody player (Wham! / 80s synth chords)
let synthLoopId: number | null = null;
let currentTrackPlaying: string | null = null;

const TRACK_NOTES: Record<string, number[][]> = {
  careless: [
    // [note, duration, timeOffset]
    [587.33, 0.3], [523.25, 0.15], [440.0, 0.4], [392.0, 0.3], [349.23, 0.5],
    [392.0, 0.3], [440.0, 0.4], [523.25, 0.3], [440.0, 0.6]
  ],
  maxeffort: [
    [440.0, 0.15], [440.0, 0.15], [659.25, 0.25], [587.33, 0.2],
    [523.25, 0.2], [493.88, 0.2], [440.0, 0.3], [329.63, 0.3]
  ],
  chimiparty: [
    [523.25, 0.18], [659.25, 0.18], [783.99, 0.25], [659.25, 0.18],
    [880.0, 0.3], [783.99, 0.2], [659.25, 0.2], [523.25, 0.4]
  ],
  tva_glitch: [
    [220.0, 0.2], [329.63, 0.2], [311.13, 0.2], [220.0, 0.4],
    [196.0, 0.3], [220.0, 0.2], [293.66, 0.3], [220.0, 0.5]
  ]
};

export function startAwesomeTrack(trackKey: string, onNotePlayed?: (note: number) => void) {
  stopAwesomeTrack();
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  currentTrackPlaying = trackKey;
  const notes = TRACK_NOTES[trackKey] || TRACK_NOTES.careless;
  let step = 0;

  const playStep = () => {
    if (!currentTrackPlaying) return;
    const [freq, duration] = notes[step];
    
    // Play dual oscillator synth lead
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.value = freq;
    osc2.type = 'square';
    osc2.frequency.value = freq * 0.5; // Sub-octave for fat synth sound

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + duration);

    gain.gain.setValueAtTime(masterVolume * 0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);

    if (onNotePlayed) {
      onNotePlayed(freq);
    }

    step = (step + 1) % notes.length;
    synthLoopId = window.setTimeout(playStep, (duration + 0.12) * 1000);
  };

  playStep();
}

export function stopAwesomeTrack() {
  if (synthLoopId) {
    clearTimeout(synthLoopId);
    synthLoopId = null;
  }
  currentTrackPlaying = null;
}

export function isAwesomeTrackPlaying(): boolean {
  return currentTrackPlaying !== null;
}
