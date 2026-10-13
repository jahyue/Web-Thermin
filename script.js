
const thereminCanvas = document.getElementById('thereminCanvas');
const canvasContext = thereminCanvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
noteDisplay = document.getElementById('noteDisplay');

const gainNode = audioCtx.createGain();

let is_playing = false;
let oscillator = null;
getnote = (frequency) => {
  const notes = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];
  const midiNumber = 69 + 12 * Math.log2(frequency / 440);
  const noteName = notes[Math.round(midiNumber) % 12];
  const octave = Math.floor(Math.round(midiNumber) / 12) - 1;
  
  return noteName + octave;
};
thereminCanvas.addEventListener('pointermove', async (event) => {
  const clampedY = Math.max(0, Math.min(thereminCanvas.height, event.clientY - thereminCanvas.getBoundingClientRect().top));
  const rect = thereminCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const isTouchingCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
  if (isTouchingCanvas) {
    canvasContext.clearRect(0, 0, rect.width, rect.height);

    const minFrequency = 65.41; // C2
    const maxFrequency = 1046.50; // C6
    const frequency = minFrequency * Math.pow(maxFrequency / minFrequency, 1- clampedY / thereminCanvas.height);

    const volume = 1 - (x / rect.width);
    console.log(`Frequency: ${frequency}, Volume: ${volume}`);
    if (!is_playing) {
      await audioCtx.resume();
      is_playing = true;
      oscillator = audioCtx.createOscillator();
      
      oscillator.connect(gainNode);
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.start(); 
     
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    console.log("Note:" + getnote(frequency));
    noteDisplay.textContent = getnote(frequency);
  }
});
thereminCanvas.addEventListener('pointerleave', () => {
  if (is_playing) {
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
      oscillator.disconnect();
      oscillator = null;
      is_playing = false;
      is_touchingCanvas = false;
    }});