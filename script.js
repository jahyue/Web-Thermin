const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const thereminCanvas = document.getElementById('thereminCanvas');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
oscillator.connect(audioCtx.destination);
oscillator.connect(gainNode);
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
thereminCanvas.addEventListener('mousemove', (event) => {
  const rect = thereminCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const isTouchingCanvas = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
  if (isTouchingCanvas) {
    const frequency = 440 + (y / rect.height) * 880;
    const volume = 1 - (x / rect.width);
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    oscillator.start();
  }else {
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    oscillator.stop();
  }
});
