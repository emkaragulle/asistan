export function createPomodoroService({ pomodoroDisplay, pomodoroToggleBtn, studyControls, onTimeUpdate }) {
    let timerInterval = null;
    let secondsRemaining = 25 * 60; 
    let isRunning = false;
    let isBreak = false;
    let totalTimeThisSession = 0;

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function updateDisplay() {
        if (pomodoroDisplay) {
            pomodoroDisplay.textContent = formatTime(secondsRemaining);
        }
    }
    
    function updateToggleButton() {
        if (pomodoroToggleBtn) {
            pomodoroToggleBtn.innerHTML = isRunning 
                ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" /></svg>`;
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        updateToggleButton();
        timerInterval = setInterval(() => {
            secondsRemaining--;
            totalTimeThisSession++;
            if (onTimeUpdate) {
                onTimeUpdate(1); // Her saniye 1 saniyelik pratik süresi bildir
            }
            updateDisplay();
            if (secondsRemaining <= 0) {
                handleSessionEnd();
            }
        }, 1000);
    }
    
    function stopTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        updateToggleButton();
    }

    function handleSessionEnd() {
        stopTimer();
        isBreak = !isBreak;
        
        if (isBreak) {
            secondsRemaining = 5 * 60; // 5 dakikalık kısa mola
            pomodoroDisplay.classList.add('text-green-500');
            studyControls.classList.add('on-break');
            alert("Pomodoro seansı bitti! 5 dakikalık kısa mola zamanı.");
        } else {
            secondsRemaining = 25 * 60; // Yeni 25 dakikalık seans
            pomodoroDisplay.classList.remove('text-green-500');
            studyControls.classList.remove('on-break');
            alert("Mola bitti! Yeni seansa hazır mısın?");
        }
        updateDisplay();
    }

    function toggle() {
        if (isRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    }
    
    function reset() {
        stopTimer();
        isBreak = false;
        secondsRemaining = 25 * 60;
        totalTimeThisSession = 0;
        pomodoroDisplay.classList.remove('text-green-500');
        studyControls.classList.remove('on-break');
        updateDisplay();
    }
    
    function initialize() {
        // Modal açıldığında zamanlayıcıyı sıfırla ve başlatma
        stopTimer();
        isBreak = false;
        secondsRemaining = 25 * 60;
        totalTimeThisSession = 0;
        if(pomodoroDisplay) pomodoroDisplay.classList.remove('text-green-500');
        if(studyControls) studyControls.classList.remove('on-break');
        updateDisplay();
        updateToggleButton();
    }

    return {
        toggle,
        reset,
        initialize,
        stop: stopTimer // Dışarıdan direkt durdurma için
    };
}
