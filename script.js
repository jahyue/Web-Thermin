const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const oscillator = audioCtx.createOscillator();
oscillator.connect(audioCtx.destination);
oscillator.type = 'sine';
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note

if (startButton && stopButton) {
  startButton.addEventListener('click', async  () => {
  await audioCtx.resume();
  oscillator.start();
});

stopButton.addEventListener('click', async () => {
  await audioCtx.suspend();

});}
