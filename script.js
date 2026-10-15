const thereminCanvas = document.getElementById('thereminCanvas');
const canvasContext = thereminCanvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Fixed: Properly declared your text display variables matching your HTML elements
const noteDisplay = document.getElementById('noteDisplay');
const note = document.getElementById('note');
const frequencyDisplay = document.getElementById('frequencyDisplay');
const frequencyText = document.getElementById('frequencyText');
const volumeText = document.getElementById('volumeText');
const waveformSelect = document.getElementById('waveformSelect');

const gainNode = audioCtx.createGain();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

gainNode.connect(analyser);
gainNode.connect(audioCtx.destination);

let stopTimeout = null;
let is_playing = false;
let oscillator = null;
let scrolloffset = 0;

function animate() {
  requestAnimationFrame(animate);
  canvasContext.clearRect(0, 0, thereminCanvas.width, thereminCanvas.height);
  
  if (analyser && is_playing) {
    analyser.getByteTimeDomainData(dataArray);
    scrolloffset = (scrolloffset + 1) % bufferLength;
  } else {
    dataArray.fill(128);
  }

  canvasContext.beginPath();
  canvasContext.lineWidth = 2;
  canvasContext.strokeStyle = 'black';
  let startIndex = 0;
   
  for (let i = 0; i < bufferLength / 2; i++) {
    if (dataArray[i] < 128 && dataArray[i + 1] >= 128) {
      startIndex = i; 
      break;
    }
  }
  
  const drawLength = bufferLength / 2;
  for (let i = 0; i < drawLength; i++) {
    const dataIndex = (startIndex + i - Math.floor(scrolloffset) + bufferLength) % bufferLength;
    const x = (i / drawLength) * thereminCanvas.width;
    const y = (dataArray[dataIndex] / 128) * thereminCanvas.height / 2;
    if (i === 0) {
      canvasContext.moveTo(x, y);
    } else {
      canvasContext.lineTo(x, y);
    }
  }
  canvasContext.stroke();
}

animate();

waveformSelect.addEventListener('change', () => {
  if (oscillator) {
    oscillator.type = waveformSelect.value;
  }
});

const getnote = (frequency) => {
  const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const midiNumber = 69 + 12 * Math.log2(frequency / 440);
  const noteName = notes[Math.round(midiNumber) % 12];
  const octave = Math.floor(Math.round(midiNumber) / 12) - 1;
  return noteName + octave;
};

thereminCanvas.addEventListener('pointermove', async (event) => {
  const rect = thereminCanvas.getBoundingClientRect();
  const clampedY = Math.max(0, Math.min(thereminCanvas.height, event.clientY - rect.top));
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const isTouchingCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }

  if (isTouchingCanvas) {
    const minFrequency = 65.41; // C2
    const maxFrequency = 1046.50; // C6
    const frequency = minFrequency * Math.pow(maxFrequency / minFrequency, 1 - clampedY / thereminCanvas.height);
    const volume = 1 - (x / rect.width);

    if (!is_playing) {
      await audioCtx.resume();
      is_playing = true;
      oscillator = audioCtx.createOscillator();
      oscillator.connect(gainNode);
      oscillator.type = waveformSelect.value;
      oscillator.frequency.setTargetAtTime(440, audioCtx.currentTime, 0.1);
      oscillator.start(); 
    }
    
    oscillator.frequency.setTargetAtTime(frequency, audioCtx.currentTime, 0.1);
    gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.1);
    
    frequencyText.textContent = frequency.toFixed(2) + " Hz";
    volumeText.textContent = (volume * 100).toFixed(2) + "%";
    note.textContent = getnote(frequency);
  }
});

thereminCanvas.addEventListener('pointerleave', () => {
  if (is_playing) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    stopTimeout = setTimeout(() => {
      if (oscillator) {
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.error("Error stopping oscillator:", e);
        }
        oscillator = null;
      }
      is_playing = false;
      if (note) note.textContent = "None";
      if (frequencyText) frequencyText.textContent = "None"; 
      if (volumeText) volumeText.textContent = "0%";
    }, 50);
  }
});