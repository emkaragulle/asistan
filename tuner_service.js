export function createTunerService({ startTunerBtn, tunerStartMessage, tunerDisplay, noteDisplay, frequencyDisplay, tunerIndicator }) {
    let audioContext = null;
    let analyser = null;
    let stream = null;
    let rafId = null;
    const buflen = 2048;
    const buf = new Float32Array(buflen);

    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    function noteFromPitch(frequency) {
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        return Math.round(noteNum) + 69;
    }

    function frequencyFromNoteNumber(note) {
        return 440 * Math.pow(2, (note - 69) / 12);
    }
    
    function centsOffFromPitch(frequency, note) {
        return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
    }

    function autoCorrelate(buf, sampleRate) {
        const SIZE = buf.length;
        const rms = Math.sqrt(buf.reduce((acc, val) => acc + val * val, 0) / SIZE);
        if (rms < 0.01) return -1; // Yeterli sinyal yok

        let r1 = 0;
        let r2 = SIZE - 1;
        const thres = 0.2;
        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buf[i]) < thres) { r1 = i; break; }
        }
        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
        }

        const newBuf = buf.slice(r1, r2);
        const newSize = newBuf.length;
        const c = new Float32Array(newSize).fill(0);

        for (let i = 0; i < newSize; i++) {
            for (let j = 0; j < newSize - i; j++) {
                c[i] = c[i] + newBuf[j] * newBuf[j + i];
            }
        }

        let d = 0;
        while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < newSize; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;

        const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
        const a = (x1 + x3 - 2 * x2) / 2;
        const b = (x3 - x1) / 2;
        if (a) T0 = T0 - b / (2 * a);

        return sampleRate / T0;
    }
    
    function updatePitch() {
        analyser.getFloatTimeDomainData(buf);
        const ac = autoCorrelate(buf, audioContext.sampleRate);

        if (ac === -1) {
            noteDisplay.textContent = '-';
            frequencyDisplay.textContent = '- Hz';
            tunerIndicator.style.transform = 'translateX(-50%) scaleX(0)';
        } else {
            const pitch = ac;
            frequencyDisplay.textContent = `${Math.round(pitch)} Hz`;
            const note = noteFromPitch(pitch);
            noteDisplay.textContent = noteStrings[note % 12];
            
            const detune = centsOffFromPitch(pitch, note);
            if (detune === 0) {
                 tunerIndicator.style.transform = `translateX(-50%) scaleX(1)`;
                 tunerIndicator.style.backgroundColor = '#4ade80'; // green-400
            } else {
                const maxDetune = 50; // 50 cent
                const transformValue = (detune / maxDetune) * 50;
                tunerIndicator.style.transform = `translateX(calc(-50% + ${transformValue}%)) scaleX(1)`;
                 tunerIndicator.style.backgroundColor = '#f87171'; // red-400
            }
        }
        rafId = requestAnimationFrame(updatePitch);
    }
    
    async function start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Bu tarayıcı mikrofon erişimini desteklemiyor.');
            return;
        }

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);
            
            tunerStartMessage.classList.add('hidden');
            tunerDisplay.classList.remove('hidden');
            
            updatePitch();
        } catch (err) {
            console.error(err);
            alert('Mikrofon erişimi reddedildi veya bir hata oluştu.');
        }
    }

    function stop() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
         if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
            audioContext = null;
        }
        
        tunerStartMessage.classList.remove('hidden');
        tunerDisplay.classList.add('hidden');
    }

    if (startTunerBtn) {
        startTunerBtn.addEventListener('click', start);
    }

    return {
        start,
        stop
    };
}
