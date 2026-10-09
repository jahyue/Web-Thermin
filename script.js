const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();
oscillator.connect(audioCtx.destination);
oscillator.connect(gainNode);
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 

if (startButton && stopButton) {
  startButton.addEventListener('click', async  () => {
  await audioCtx.resume();
  oscillator.start();
});

stopButton.addEventListener('click', async () => {
  await audioCtx.suspend();

});}
