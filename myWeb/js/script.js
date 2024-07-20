document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause');
    const stopBtn = document.getElementById('stop');
    const volumeSlider = document.getElementById('volume');

    playPauseBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            audio.pause();
            playPauseBtn.textContent = 'Play';
        }
    });

    stopBtn.addEventListener('click', function() {
        audio.pause();
        audio.currentTime = 0;
        playPauseBtn.textContent = 'Play';
    });

    volumeSlider.addEventListener('input', function() {
        audio.volume = volumeSlider.value;
    });
});
