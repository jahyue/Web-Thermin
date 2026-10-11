
const thereminCanvas = document.getElementById('thereminCanvas');
const canvasContext = thereminCanvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();


const gainNode = audioCtx.createGain();

let is_playing = false;
let oscillator = null;
thereminCanvas.addEventListener('pointermove', async (event) => {
  const rect = thereminCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const isTouchingCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
  if (isTouchingCanvas) {
    canvasContext.clearRect(0, 0, rect.width, rect.height);

    const frequency = 440 + (y / rect.height) * 880;

    const volume = 1 - (x / rect.width);
    if (!is_playing) {
      await audioCtx.resume();
      is_playing = true;
      oscillator = audioCtx.createOscillator();
      
      oscillator.connect(gainNode);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.start(); 
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    
  }else {
    if (is_playing) {
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
      oscillator.disconnect();
      oscillator = null;
      is_playing = false;
      is_touchingCanvas = false;
    }
    
  }
});
