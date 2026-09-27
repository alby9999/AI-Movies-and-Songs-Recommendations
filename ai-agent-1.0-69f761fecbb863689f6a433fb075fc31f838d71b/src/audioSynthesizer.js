// Web Audio API Synthesizer for procedural preview audio fallback
// Generates ambient, melodic synthesizer chords and arpeggios when preview URL is missing or fails

let audioCtx = null;
let currentSynthNodes = [];
let synthTimeout = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Chord progressions based on mood
const MOOD_CHORD_MAP = {
  feelgood: [
    [261.63, 329.63, 392.00], // C major
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F major
    [196.00, 246.94, 293.66], // G major
  ],
  latenight: [
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 293.66], // Em7
    [146.83, 174.61, 220.00, 261.63], // Dm7
  ],
  cry: [
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [261.63, 329.63, 392.00], // C
    [196.00, 246.94, 293.66], // G
  ],
  adrenaline: [
    [146.83, 174.61, 220.00], // Dm
    [130.81, 164.81, 196.00], // C
    [116.54, 146.83, 174.61], // Bb
    [130.81, 164.81, 196.00], // C
  ],
  scifi: [
    [196.00, 233.08, 293.66], // Gm
    [185.00, 220.00, 277.18], // F#m
    [164.81, 196.00, 246.94], // Em
    [174.61, 207.65, 261.63], // Fm
  ],
  noir: [
    [146.83, 174.61, 220.00, 277.18], // DmM7
    [138.59, 174.61, 207.65], // Db+
    [130.81, 164.81, 196.00], // C
    [123.47, 155.56, 185.00], // Bdim
  ],
  spooky: [
    [164.81, 196.00, 233.08], // Edim
    [146.83, 174.61, 207.65], // Ddim
    [138.59, 164.81, 196.00], // C#dim
    [130.81, 155.56, 185.00], // Cdim
  ],
  romantic: [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 392.00], // G7
  ],
  retro: [
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [146.83, 174.61, 220.00], // Dm
    [164.81, 196.00, 246.94], // Em
  ],
  adventure: [
    [146.83, 196.00, 220.00], // Dsus4
    [146.83, 185.00, 220.00], // D
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66], // G
  ]
};

export function stopSynthesizer() {
  if (synthTimeout) {
    clearTimeout(synthTimeout);
    synthTimeout = null;
  }
  currentSynthNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (e) {}
  });
  currentSynthNodes = [];
}

export function playSynthesizedPreview({ moodId = 'feelgood', onProgress, onEnded }) {
  stopSynthesizer();
  const ctx = getAudioContext();
  const startTime = ctx.currentTime;
  const duration = 30; // 30 seconds preview duration

  const chords = MOOD_CHORD_MAP[moodId] || MOOD_CHORD_MAP.feelgood;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, startTime);
  masterGain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.8);
  masterGain.gain.setValueAtTime(0.25, startTime + duration - 2);
  masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, startTime);
  filter.frequency.exponentialRampToValueAtTime(2400, startTime + 10);
  filter.frequency.exponentialRampToValueAtTime(1000, startTime + duration);

  masterGain.connect(filter);
  filter.connect(ctx.destination);
  currentSynthNodes.push(masterGain, filter);

  // Play chord progression
  const chordDuration = 3.5;
  const totalChords = Math.ceil(duration / chordDuration);

  for (let i = 0; i < totalChords; i++) {
    const chord = chords[i % chords.length];
    const chordStart = startTime + i * chordDuration;

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, chordStart);

      // Add gentle detuning for chorus effect
      osc.detune.setValueAtTime((idx - 1) * 8, chordStart);

      oscGain.gain.setValueAtTime(0.001, chordStart);
      oscGain.gain.exponentialRampToValueAtTime(0.12, chordStart + 0.2);
      oscGain.gain.exponentialRampToValueAtTime(0.001, chordStart + chordDuration);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      osc.start(chordStart);
      osc.stop(chordStart + chordDuration);
      currentSynthNodes.push(osc, oscGain);
    });

    // Add melodic arpeggio note
    const arpFreq = chord[i % chord.length] * 2;
    const arpOsc = ctx.createOscillator();
    const arpGain = ctx.createGain();
    arpOsc.type = 'sine';
    arpOsc.frequency.setValueAtTime(arpFreq, chordStart + 0.4);
    arpGain.gain.setValueAtTime(0.001, chordStart + 0.4);
    arpGain.gain.exponentialRampToValueAtTime(0.08, chordStart + 0.6);
    arpGain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.8);
    arpOsc.connect(arpGain);
    arpGain.connect(masterGain);
    arpOsc.start(chordStart + 0.4);
    arpOsc.stop(chordStart + 1.8);
    currentSynthNodes.push(arpOsc, arpGain);
  }

  // Progress updater
  const startStamp = Date.now();
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startStamp) / 1000;
    if (elapsed >= duration) {
      clearInterval(interval);
      stopSynthesizer();
      if (onEnded) onEnded();
    } else {
      if (onProgress) onProgress(elapsed, duration);
    }
  }, 250);

  synthTimeout = setTimeout(() => {
    clearInterval(interval);
    stopSynthesizer();
    if (onEnded) onEnded();
  }, duration * 1000);

  return () => {
    clearInterval(interval);
    stopSynthesizer();
  };
}
