export function createMetronomeService({ bpmDisplay, bpmSlider, startStopMetronomeBtn, metronomeVisualizer }) {
    let audioContext = null;
    let isRunning = false;
    let bpm = 120;
    let timerId = null;

    function getAudioContext() {
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error("Web Audio API is not supported in this browser.");
            }
        }
        return audioContext;
    }

    function playTick() {
        const context = getAudioContext();
        if (!context) return;
        
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
        oscillator.connect(gain);
        gain.connect(context.destination);

        gain.gain.setValueAtTime(1, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.05);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.05);
        
        // Görsel geri bildirim
        if (metronomeVisualizer) {
            metronomeVisualizer.classList.add('beat');
            setTimeout(() => metronomeVisualizer.classList.remove('beat'), 100);
        }
    }

    function scheduler() {
        if (isRunning) {
            playTick();
            const interval = 60000 / bpm;
            timerId = setTimeout(scheduler, interval);
        }
    }

    function start() {
        if (isRunning) return;
        const context = getAudioContext();
        if (context.state === 'suspended') {
            context.resume();
        }
        isRunning = true;
        scheduler();
        startStopMetronomeBtn.textContent = "Durdur";
    }

    function stop() {
        if (!isRunning) return;
        isRunning = false;
        clearTimeout(timerId);
        timerId = null;
        startStopMetronomeBtn.textContent = "Başlat";
    }
    
    function toggle() {
        if (isRunning) {
            stop();
        } else {
            start();
        }
    }

    function updateBpm(newBpm) {
        bpm = newBpm;
        if (bpmDisplay) bpmDisplay.textContent = bpm;
        if (bpmSlider) bpmSlider.value = bpm;

        if (isRunning) {
            clearTimeout(timerId);
            scheduler();
        }
    }

    if (bpmSlider) {
        bpmSlider.addEventListener('input', (e) => {
            updateBpm(parseInt(e.target.value, 10));
        });
    }

    return {
        start,
        stop,
        toggle,
        setBpm: updateBpm
    };
}
