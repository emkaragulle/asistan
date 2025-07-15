// asistan_script_yeni.js

import * as funcs from './functions.js';
import { initEventHandlers } from './event_handlers.js';
import * as firebase from './firebase_service.js';

document.addEventListener('DOMContentLoaded', () => {
    // Servislerin ihtiyaç duyduğu DOM elementlerini bir nesnede toplayalım.
    const serviceElements = {
        pomodoroDisplay: document.getElementById('pomodoro-display'),
        pomodoroToggleBtn: document.getElementById('pomodoro-toggle-btn'),
        studyControls: document.getElementById('study-controls'),
        bpmDisplay: document.getElementById('bpm-display'),
        bpmSlider: document.getElementById('bpm-slider'),
        startStopMetronomeBtn: document.getElementById('start-stop-metronome-btn'),
        metronomeVisualizer: document.getElementById('metronome-visualizer'),
        startTunerBtn: document.getElementById('start-tuner-btn'),
        tunerStartMessage: document.getElementById('tuner-start-message'),
        tunerDisplay: document.getElementById('tuner-display'),
        noteDisplay: document.getElementById('note-display'),
        frequencyDisplay: document.getElementById('frequency-display'),
        tunerIndicator: document.getElementById('tuner-indicator')
    };

    // Servisleri başlat.
    funcs.initializeServices(serviceElements);

    // Tüm olay dinleyicilerini (event listeners) bağla.
    initEventHandlers();
    
    // Firebase kimlik doğrulama sürecini başlat.
    // handleUserLogin ve handleUserLogout fonksiyonları artık ana state yöneticisi olan funcs modülünden geliyor.
    firebase.initAuth(funcs.handleUserLogin, funcs.handleUserLogout);

    console.log("Uygulama başarıyla yüklendi ve yeni yapıya geçirildi!");
});

// app.js veya script etiketinin içi
