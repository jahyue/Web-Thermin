
const thereminCanvas = document.getElementById('thereminCanvas');
const canvasContext = thereminCanvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const noteDisplay = document.getElementById('noteDisplay');
const waveformSelect = document.getElementById('waveformSelect');
const gainNode = audioCtx.createGain();
const analyser = audioCtx.createAnalyser();
const frequencyDisplay = document.getElementById('frequencyDisplay');
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);


let is_playing = false;
let oscillator = null;
function animate() {
  canvasContext.clearRect(0, 0, thereminCanvas.width, thereminCanvas.height);
  requestAnimationFrame(animate);
  
  analyser.getByteTimeDomainData(dataArray);
  canvasContext.beginPath();
  canvasContext.moveTo(0, dataArray[0] / 128 * (thereminCanvas.height / 2));
  dataArray.forEach((value, index) => {
    const x = (index / bufferLength) * thereminCanvas.width;
    const y = (value / 128) * (thereminCanvas.height / 2);
    
    canvasContext.lineTo(x, y);
  });
  canvasContext.stroke();
  canvasContext.lineWidth = 2;
  canvasContext.strokeStyle = 'black';
    
}
waveformSelect.addEventListener('change', () => {
  if (oscillator) {
    oscillator.type = waveformSelect.value;
  }
});
const getnote = (frequency) => {
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
      gainNode.connect(analyser);
      oscillator.type = waveformSelect.value;
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.start(); 
      animate();
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    frequencyDisplay.textContent = frequency.toFixed(2) + " Hz";
    noteDisplay.textContent = getnote(frequency);
  }
});
thereminCanvas.addEventListener('pointerleave', () => {
  if (is_playing) {
      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
      timeout(() => {
        if(oscillator) {
          oscillator.stop();
          oscillator.disconnect();
          oscillator = null;
        }
      }, 100)
      is_playing = false;
      noteDisplay.textContent = "None";
      frequencyDisplay.textContent = "None";  
    }});