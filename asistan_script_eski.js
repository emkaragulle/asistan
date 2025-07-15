// Servislerimizi import ediyoruz.
import * as firebase from './firebase_service.js';
import * as UI from './ui_helpers.js';
import { createPomodoroService } from './pomodoro_service.js';
import { createMetronomeService } from './metronome_service.js';
import { createTunerService } from './tuner_service.js';
import { createChartsService } from './charts.js';
import { defaultBoxSettings, DEFAULT_MASTERY_THRESHOLD, BADGES } from './constants.js';
// DOMContentLoaded sarmalayıcısı, kodun sadece HTML tamamen yüklendikten sonra çalışmasını garantiler.
document.addEventListener('DOMContentLoaded', () => {

    // DOM Elementleri
    const loginContainer = document.getElementById('login-container');
    const mainAppContainer = document.getElementById('main-app-container');
    const sidebar = document.getElementById('sidebar');
    const sidebarProjectList = document.getElementById('sidebar-project-list');
   
    const googleSigninBtn = document.getElementById('google-signin-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const userPanel = document.getElementById('user-panel');
    const userNameEl = document.getElementById('user-name');
    const userPhotoEl = document.getElementById('user-photo');
    const mainDashboardContainer = document.getElementById('main-dashboard-container');
    const projectContainer = document.getElementById('project-container');
    const activeProjectTitle = document.getElementById('active-project-title');
    const cardManagementView = document.getElementById('card-management-view');
    const openAddCardModalBtn = document.getElementById('open-add-card-modal-btn');
    const mainSettingsBtn = document.getElementById('main-settings-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const openCreateWorkModalBtn = document.getElementById('open-create-work-modal-btn');
    // "Yeni Eser Oluştur" modalındaki tempo alanlarını birbirine bağlayan akıllı mantık
    const projectBaseTempoInput = document.getElementById('new-project-base-tempo');
    const projectTargetTempoInput = document.getElementById('new-project-target-tempo');
    const cardBaseTempoInput = document.getElementById('new-work-base-tempo-input');
    const cardTargetTempoInput = document.getElementById('new-work-target-tempo-input');

    if (projectBaseTempoInput && cardBaseTempoInput) {
        projectBaseTempoInput.addEventListener('input', (e) => {
            cardBaseTempoInput.value = e.target.value;
        });
    }

    if (projectTargetTempoInput && cardTargetTempoInput) {
        projectTargetTempoInput.addEventListener('input', (e) => {
            cardTargetTempoInput.value = e.target.value;
        });
    }

    const addSectionBtn = document.getElementById('add-section-btn');
    const sectionNameInput = document.getElementById('section-name-input');
    const sectionDescInput = document.getElementById('section-desc-input');
    const sectionNotesInput = document.getElementById('section-notes-input');
    
    const saveEditCardBtn = document.getElementById('save-edit-card-btn');
    const editCardIdInput = document.getElementById('edit-card-id');
    const editCardModal = document.getElementById('edit-card-modal');
    const editCardNameInput = document.getElementById('edit-card-name');
    const editCardDescInput = document.getElementById('edit-card-desc');
    const editCardNotesInput = document.getElementById('edit-card-notes');
    const editBaseTempoInput = document.getElementById('edit-base-tempo');
const editTargetTempoInput = document.getElementById('edit-target-tempo');
    const projectSpecificSettings = document.getElementById('project-specific-settings');
    const settingsModal = document.getElementById('settings-modal');
    const settingsProjectName = document.getElementById('settings-project-name');
    const settingsForm = document.getElementById('settings-form');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const suggestAsTemplateBtn = document.getElementById('suggest-as-template-btn'); 
    const openToolsModalBtn = document.getElementById('open-tools-modal-btn');
    const createWorkModal = document.getElementById('create-work-modal');
    const createBlankTabBtn = document.getElementById('create-blank-tab-btn');
    const createFromTemplateTabBtn = document.getElementById('create-from-template-tab-btn');
    const createBlankPanel = document.getElementById('create-blank-panel');
    const createFromTemplatePanel = document.getElementById('create-from-template-panel');
    const newProjectNameInput = document.getElementById('new-project-name');
    const newCardNameInput = document.getElementById('new-card-name');
    const newCardDescInput = document.getElementById('new-card-desc');
    const addCardToListBtn = document.getElementById('add-card-to-list-btn');
    const newWorkCardCountEl = document.getElementById('new-work-card-count');
    const newWorkCardListContainer = document.getElementById('new-work-card-list-container');
    const newWorkBaseTempoInput = document.getElementById('new-work-base-tempo-input');
const newWorkTargetTempoInput = document.getElementById('new-work-target-tempo-input');
    const createWorkConfirmBtn = document.getElementById('create-work-confirm-btn');
    const metronomeTabBtn = document.getElementById('metronome-tab-btn');
    const tunerTabBtn = document.getElementById('tuner-tab-btn');
    const metronomePanel = document.getElementById('metronome-panel');
    const tunerPanel = document.getElementById('tuner-panel');
    const startTunerBtn = document.getElementById('start-tuner-btn');
    const tunerStartMessage = document.getElementById('tuner-start-message');
    const tunerDisplay = document.getElementById('tuner-display');
    const noteDisplay = document.getElementById('note-display');
    const frequencyDisplay = document.getElementById('frequency-display');
    const tunerIndicator = document.getElementById('tuner-indicator');
    const bpmDisplay = document.getElementById('bpm-display');
    const bpmSlider = document.getElementById('bpm-slider');
    const startStopMetronomeBtn = document.getElementById('start-stop-metronome-btn');
    const metronomeVisualizer = document.getElementById('metronome-visualizer');
    const goToAdminBtn = document.getElementById('go-to-admin-btn');
    const showSummaryViewBtn = document.getElementById('show-summary-view-btn');
    const persistentProgressContainer = document.getElementById('persistent-progress-container');
    const reportsAndSessionsContainer = document.getElementById('reports-and-sessions-container');
    const showReportsAndSessionsBtn = document.getElementById('show-reports-and-sessions-btn');
    const achievementsContainer = document.getElementById('achievements-container');
    const showAchievementsBtn = document.getElementById('show-achievements-btn');
    const statisticsContainer = document.getElementById('statistics-container');
    const allProjectsContainer = document.getElementById('all-projects-container');
    const showStatisticsBtn = document.getElementById('show-statistics-btn');
    const pomodoroContainer = document.getElementById('pomodoro-container');
    const pomodoroDisplay = document.getElementById('pomodoro-display');
    const pomodoroToggleBtn = document.getElementById('pomodoro-toggle-btn');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset-btn');
    const studyControls = document.getElementById('study-controls');
    const showMasteryJourneyBtn = document.getElementById('show-mastery-journey-btn');
    const openDailyGoalModalBtn = document.getElementById('open-daily-goal-modal-btn');
    const dailyGoalModal = document.getElementById('daily-goal-modal');
  
    const saveDailyGoalBtn = document.getElementById('save-daily-goal-btn');
   const dailyGoalInputHours = document.getElementById('daily-goal-input-hours');
   const startInterleavedSessionBtn = document.getElementById('start-interleaved-session-btn');
    const interleavedSessionContainer = document.getElementById('interleaved-session-container');
    const themeToggle = document.getElementById('theme-toggle');

    const baseTempoInput = document.getElementById('base-tempo-input');
const targetTempoInput = document.getElementById('target-tempo-input');
const mobileBottomNav = document.getElementById('mobile-bottom-nav');
const moreViewContainer = document.getElementById('more-view-container');
// asistan_script.js - Global değişkenlerin yanına ekleyin

const onboardingModal = document.getElementById('onboarding-modal');
const onboardingStepContent = document.getElementById('onboarding-step-content');
const onboardingDotsContainer = document.getElementById('onboarding-dots');
const onboardingBackBtn = document.getElementById('onboarding-back-btn');
const onboardingNextBtn = document.getElementById('onboarding-next-btn');
const onboardingFinishBtn = document.getElementById('onboarding-finish-btn');
const onboardingSkipBtn = document.getElementById('onboarding-skip-btn');

let currentOnboardingStep = 0;
const ONBOARDING_STEPS = [
    {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`,
        title: 'Çalışma Asistanı\'na Hoş Geldin!',
        text: 'Bu asistan, pratik yapmak istediğin eserleri küçük ve yönetilebilir parçalara ayırarak öğrenme sürecini kolaylaştırmak için tasarlandı.'
    },
    {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>`,
        title: '1. Eserlerini ve Kartlarını Oluştur',
        text: 'Önce "Yeni Eser Oluştur" ile bir çalışma alanı yarat. Sonra bu esere, çalışmak istediğin her bir pasaj veya bölüm için "Kartlar" ekle.'
    },
    {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 005.68 9.348v2.695m0 0h4.992" /></svg>`,
        title: '2. Akıllı Tekrarla Ustalaş',
        text: '"Tümünü Çalış" butonuyla akıllı tekrar seansları başlat. Her kart, 6 adımlık bir ustalık yolculuğundan geçerek kalıcı öğrenmeyi sağlar.'
    },
    {
        icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.953 14.953 0 00-5.84-2.56m0 0a14.927 14.927 0 01-5.84 2.56m5.84-2.56V4.72a6 6 0 0112 0v2.65a6 6 0 01-5.84 7.38z" /></svg>`,
        title: 'Hazırsın!',
        text: 'Artık potansiyelini ortaya çıkarmaya hazırsın. Unutma, düzenli ve odaklanmış pratik her şeyin anahtarıdır. Başarılar!'
    }
];

   let unsavedSeconds = 0;
   let saveTimeout = null; 
   let dataVersion = 0;
let calculationCache = {}; 
let editingCardIndex = null; // null ise yeni kart ekleniyor, sayı ise o index'teki kart düzenleniyor.


// asistan_script.js

// asistan_script.js

function handleTimeUpdate(seconds) {
    unsavedSeconds += seconds; // Sadece saniyeleri biriktir

    // --- YENİ: Tarih artık UTC'ye çevrilmeden, doğrudan yerel olarak alınıyor ---
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başlar, bu yüzden +1
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    // --- Değişiklik sonu ---

    if (!allData.practiceLog) allData.practiceLog = {};
    if (!allData.practiceLog[today]) allData.practiceLog[today] = 0;
    
    // Lokal 'allData' nesnesini anlık olarak güncelle
    allData.practiceLog[today] += seconds;
}
    // POMODORO SERVİSİ
    const pomodoroService = createPomodoroService({
        pomodoroDisplay: pomodoroDisplay,
        pomodoroToggleBtn: pomodoroToggleBtn,
        studyControls: studyControls,
        onTimeUpdate: handleTimeUpdate 
    });
      // METRONOM SERVİSİNİ OLUŞTURUYORUZ
   const metronomeService = createMetronomeService({
        bpmDisplay: bpmDisplay,
        bpmSlider: bpmSlider,
        startStopMetronomeBtn: startStopMetronomeBtn,
        metronomeVisualizer: metronomeVisualizer
   });
// TUNER SERVİSİ
   const tunerService = createTunerService({
    startTunerBtn: startTunerBtn,
    tunerStartMessage: tunerStartMessage,
    tunerDisplay: tunerDisplay,
    noteDisplay: noteDisplay,
    frequencyDisplay: frequencyDisplay,
    tunerIndicator: tunerIndicator
});

const chartsService = createChartsService();

    // Global Değişkenler
    let allData = { projects: {}, activeProject: null, earnedBadges: [] };
    let currentView = 'summary';
    let userId = null;
    let currentUser = null;
    let studySession = { isActive: false, cards: [], currentIndex: 0, project: null };
    let globalTemplates = [];
    let newWorkCards = [];
    let isEditMode = false;
let currentEditingProjectName = null;
    const adminUID = "tp7u9wMMn1gIVBM8mClmzWSptX43";

    let cardManagementSwiper = null;


    // UI Helper'ların bazı fonksiyonlarının global state'e erişmesi için window'a atama yapıyoruz.

    window.endStudySession = endStudySession;
   window.stopMetronome = metronomeService.stop;
    window.stopTuner = tunerService.stop;


async function handleUserLogin(user) {
    userId = user.uid;
    currentUser = user;

    loginContainer.classList.add('hidden');
    mainAppContainer.classList.remove('hidden');

    const userData = await firebase.loadUserData(user.uid);
    let isNewUser = false; 

    if (userData) {
        allData = userData;
        if (!allData.projects) allData.projects = {};
        if (!allData.earnedBadges) allData.earnedBadges = [];
        if (allData.dailyGoalInMinutes === undefined) {
            allData.dailyGoalInMinutes = 120;
        }
        if (!allData.practiceLog) {
            allData.practiceLog = {};
        }
        // YENİ EKLENDİ: Onboarding durumunu kontrol et
        if (allData.hasCompletedOnboarding === undefined) {
            allData.hasCompletedOnboarding = false;
        }

    } else {
        isNewUser = true; 
        allData = { 
            projects: {}, 
            activeProject: null, 
            earnedBadges: [],
            subscriptionTier: 'free',
            dailyGoalInMinutes: 120, 
            practiceLog: {},
            hasCompletedOnboarding: false // YENİ EKLENDİ
        };
        await firebase.saveUserData(user.uid, allData);
    }
    
    // ... fonksiyonun geri kalanı büyük ölçüde aynı ...
    allData.activeProject = null;
    currentView = 'summary';
    await checkAndAwardBadges();
    renderUI();
    
    firebase.listenForGlobalTemplates((templates) => {
        globalTemplates = templates;
        if (!createWorkModal.classList.contains('hidden') && !createFromTemplatePanel.classList.contains('hidden')) {
            renderTemplateListForCreateModal();
        }
    });

    // --- YENİ EKLENEN REHBER BAŞLATMA MANTIĞI ---
    if (isNewUser || !allData.hasCompletedOnboarding) {
        // Ana arayüzün yüklenmesi için küçük bir gecikme ekleyelim
        setTimeout(() => {
            startOnboarding();
        }, 500); // 0.5 saniye
    }
}
// asistan_script_eski.js dosyasının üst kısımlarına ekleyin

function getCardEffectiveTempos(card, project) {
    // Bu fonksiyon, bir kartın kendi temposu yoksa, proje genelindeki tempoyu miras almasını sağlar.
    if (!project) {
        return { 
            base: card.baseTempo || null, 
            target: card.targetTempo || null 
        };
    }
    return {
        base: card.baseTempo !== null && card.baseTempo !== undefined ? card.baseTempo : project.baseTempo,
        target: card.targetTempo !== null && card.targetTempo !== undefined ? card.targetTempo : project.targetTempo,
    };
}
    function handleUserLogout() {
        userId = null;
        currentUser = null;

        loginContainer.classList.remove('hidden');
        mainAppContainer.classList.add('hidden');
        allData = { projects: {}, activeProject: null, earnedBadges: [] };
    }

    function renderSidebar() {
        sidebarProjectList.innerHTML = '';
        const sortedProjects = Object.keys(allData.projects || {}).sort((a, b) => a.localeCompare(b));
        if (sortedProjects.length === 0) {
            sidebarProjectList.innerHTML = '<li class="px-4 text-sm text-slate-500 text-center">İlk eserini ekleyerek başla! 👇</li>';
        } else {
            sortedProjects.forEach(projectName => {
                const li = document.createElement('li');
                li.className = "list-none";
                const a = document.createElement('a');
                a.href = '#';
                a.textContent = projectName;
                a.dataset.projectName = projectName;
                a.className = 'project-link block w-full text-left p-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 truncate';
                li.appendChild(a);
                sidebarProjectList.appendChild(li);
            });
        }

        if(currentUser) {
            userPanel.classList.remove('hidden');
            userNameEl.textContent = currentUser.displayName;
            userPhotoEl.src = currentUser.photoURL;
            goToAdminBtn.classList.toggle('hidden', userId !== adminUID);
        } else {
            userPanel.classList.add('hidden');
        }
    }

    const DEFAULT_MASTERY_THRESHOLD = 5;
    const BADGES = [
        { slug: 'first_project', name: 'İlk Eserin!', description: 'İlk çalışma alanını başarıyla oluşturdun.', icon_url: 'https://cdn-icons-png.flaticon.com/128/993/993720.png', condition: (data) => Object.keys(data.projects || {}).length >= 1 },
        { slug: 'first_card', name: 'İlk Kart', description: 'İlk çalışma kartını ekledin. Başlangıç için harika!', icon_url: 'https://cdn-icons-png.flaticon.com/128/2311/2311786.png', condition: (data) => Object.values(data.projects || {}).some(p => (p.sections || []).length >= 1) },
        { slug: 'ten_cards_total', name: 'Kart Koleksiyoncusu', description: 'Tüm eserlerinde toplam 10 karta ulaştın.', icon_url: 'https://cdn-icons-png.flaticon.com/128/1598/1598431.png', condition: (data) => Object.values(data.projects || {}).reduce((sum, p) => sum + (p.sections || []).length, 0) >= 10 },
        { slug: 'three_day_streak', name: 'Ateşi Yaktın!', description: '3 gün üst üste çalıştın. Devam et!', icon_url: 'https://cdn-icons-png.flaticon.com/128/8901/8901559.png', condition: (data) => calculateStreak(data).current >= 3 },
        { slug: 'seven_day_streak', name: 'Durdurulamaz', description: 'Tam 1 haftadır aralıksız çalışıyorsun!', icon_url: 'https://cdn-icons-png.flaticon.com/128/2504/2504824.png', condition: (data) => calculateStreak(data).current >= 7 }
    ];

    function getUniquePracticeDates(data) {
        // Projeleri taramak yerine, doğrudan practiceLog'un anahtarlarını (tarihleri) al.
        const practiceDays = Object.keys(data.practiceLog || {});
        if (practiceDays.length === 0) {
            return [];
        }
        // Tarih string'lerini Date nesnelerine çevir ve en yeniden eskiye sırala.
        return practiceDays.map(dateStr => new Date(dateStr)).sort((a, b) => b - a);
    }

   // Bu yeni ve düzeltilmiş fonksiyon, zaman dilimi sorunlarını ortadan kaldırır.

// asistan_script.js

function calculateStreak(data) {
    const practiceDays = new Set(Object.keys(data.practiceLog || {}));
    if (practiceDays.size === 0) {
        return { current: 0, yesterdayWasMissed: true };
    }

    // --- YENİ: Yerel tarihi 'YYYY-MM-DD' formatına çeviren yardımcı fonksiyon ---
    const toLocalISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // --- Değişiklik sonu ---

    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayStr = toLocalISOString(today);
    const yesterdayStr = toLocalISOString(yesterday);

    let currentDate = new Date();

    // Zincirin başlangıç noktasını bulalım: Bugün mü, dün mü?
    if (practiceDays.has(todayStr)) {
        // Bugün pratik yapılmış, zincir bugünden başlıyor.
    } else if (practiceDays.has(yesterdayStr)) {
        // Bugün pratik yapılmamış ama dün yapılmış. Zincir dünden başlıyor.
        currentDate.setDate(currentDate.getDate() - 1);
    } else {
        // Ne bugün ne de dün pratik yapılmış. Zincir kırılmış.
        return { current: 0, yesterdayWasMissed: true };
    }
    
    // Bulduğumuz başlangıç noktasından geriye doğru sayalım.
    while (practiceDays.has(toLocalISOString(currentDate))) {
        streak++;
        // Bir önceki güne geç
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return { current: streak, yesterdayWasMissed: !practiceDays.has(todayStr) };
}

    function calculateLongestStreak(data) {
        const uniqueDates = getUniquePracticeDates(data);
        if (uniqueDates.length === 0) return 0;

        let longestStreak = 0;
        let currentStreak = 1;

        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const currentDate = uniqueDates[i];
            const nextDate = uniqueDates[i + 1];

            const diffTime = currentDate - nextDate;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
            } else {
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
                currentStreak = 1;
            }
        }
        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }
        return longestStreak;
    }

    async function checkAndAwardBadges() {
        if (!allData.earnedBadges) allData.earnedBadges = [];
        let newBadgeEarned = false;
        for (const badge of BADGES) {
            if (!allData.earnedBadges.includes(badge.slug) && badge.condition(allData)) {
                allData.earnedBadges.push(badge.slug);
                newBadgeEarned = true;
                UI.showInfoModal(`🎉 Yeni Rozet Kazandın: ${badge.name}`, 'success');
            }
        }
        if (newBadgeEarned) {
            await firebase.saveUserData(userId, allData);
            if(currentView === 'achievements') { renderAchievementsPage(); }
        }
    }

    function getRustyCards(days, limit, projectName = 'all') {
        let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>
            (project.sections || []).map(s => ({ ...s, projectName: projName }))
        );

        if (projectName !== 'all') {
            allCards = allCards.filter(card => card.projectName === projectName);
        }

        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);
        const rusty = allCards.filter(card => {
            if (!card.lastMoved) return true;
            return new Date(card.lastMoved) < thresholdDate;
        });
        return rusty.sort(() => 0.5 - Math.random()).slice(0, limit);
    }

    function getHardestCards(limit, projectName = 'all') {
        let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>
            (project.sections || []).map(s => ({ ...s, projectName: projName }))
        );

        if (projectName !== 'all') {
            allCards = allCards.filter(card => card.projectName === projectName);
        }

        return allCards.filter(card => (card.incorrectCount || 0) > 0)
            .sort((a, b) => (b.incorrectCount || 0) - (a.incorrectCount || 0))
            .slice(0, limit);
    }

    function getRandomCards(limit, projectName = 'all') {
        let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>
            (project.sections || []).map(s => ({ ...s, projectName: projName }))
        );

        if (projectName !== 'all') {
            allCards = allCards.filter(card => card.projectName === projectName);
        }

        return allCards.sort(() => 0.5 - Math.random()).slice(0, limit);
    }

    function getPromotionCandidateCards(limit, projectName = 'all') {
        let allCards = [];
        Object.entries(allData.projects).forEach(([projName, project]) => {
            if (projectName !== 'all' && projName !== projectName) {
                return;
            }
            const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
            const boxDefs = project.boxDefinitions || defaultBoxSettings;
            const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;


            (project.sections || []).forEach(section => {
                if (section.box < maxBoxNumber) {
                    const successCount = section.successCount || 0;
                    if (successCount >= masteryThreshold - 2 && successCount < masteryThreshold) {
                        allCards.push({ ...section, projectName: projName });
                    }
                }
            });
        });
        return allCards.sort(() => 0.5 - Math.random()).slice(0, limit);
    }
    
// asistan_script.js içinde getActiveLearningCards fonksiyonunu bununla değiştirin

function getActiveLearningCards() {
    // Eğer önbellekteki versiyon mevcut versiyonla aynıysa, eski sonucu dön
    if (calculationCache.activeCards && calculationCache.version === dataVersion) {
        return calculationCache.activeCards;
    }

    console.log("Aktif kartlar yeniden hesaplanıyor...");
    const activeCards = [];
    // ... mevcut hesaplama mantığı ...
    Object.entries(allData.projects || {}).forEach(([projectName, project]) => {
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
        (project.sections || []).forEach(section => {
            const isMastered = section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold;
            if (!isMastered) {
                activeCards.push({ ...section, projectName: projectName });
            }
        });
    });

    // Yeni sonucu ve mevcut versiyonu önbelleğe al
    calculationCache.activeCards = activeCards;
    calculationCache.version = dataVersion;

    return activeCards;
}


    function switchCreateTab(tab) {
        const isBlank = tab === 'blank';
        createBlankPanel.classList.toggle('hidden', !isBlank);
        createFromTemplatePanel.classList.toggle('hidden', isBlank);
        createBlankTabBtn.classList.toggle('border-indigo-500', isBlank);
        createBlankTabBtn.classList.toggle('text-indigo-600', isBlank);
        createBlankTabBtn.classList.toggle('border-transparent', !isBlank);
        createBlankTabBtn.classList.toggle('text-gray-500', !isBlank);
        createFromTemplateTabBtn.classList.toggle('border-indigo-500', !isBlank);
        createFromTemplateTabBtn.classList.toggle('text-indigo-600', !isBlank);
        createFromTemplateTabBtn.classList.toggle('border-transparent', isBlank);
        createFromTemplateTabBtn.classList.toggle('text-gray-500', isBlank);
    }

// YENİ FONKSİYON: Ustalık Yolculuğu Sayfasını Çizer
// asistan_script_eski.js

// YENİ VE GELİŞTİRİLMİŞ FONKSİYON
// asistan_script_eski.js

function renderMasteryJourneyPage() {
    const container = mainDashboardContainer; // Ana paneli kullanacağız
    const practiceBoxes = defaultBoxSettings.filter(b => b.type === 'practice');
    const activeCards = getActiveLearningCards(); // Tüm projelerdeki aktif kartları al

    // Her bir istasyon kartını oluşturacak HTML'i hazırlayalım
    const stationCardsHTML = practiceBoxes.map(box => {
        const cardsInStation = activeCards.filter(c => c.box === box.number);
        const stationHasCards = cardsInStation.length > 0;

        // Bu istasyondaki kartların kaç farklı esere ait olduğunu bulalım
        const uniqueProjects = new Set(cardsInStation.map(card => card.projectName));
        const projectCount = uniqueProjects.size;
        
        let counterText = `${cardsInStation.length} Kart`;
        // Eğer kart varsa ve birden fazla projeden geliyorsa, proje sayısını da belirtelim
        if (stationHasCards && projectCount > 0) {
            counterText += ` <span class="font-normal text-xs text-slate-500">/ ${projectCount} Eser</span>`;
        }

        return `
            <div class="station-card">
                <div class="station-header ${box.color}">
                    ${box.icon} ${box.title}
                </div>
                <div class="station-body">
                    <p class="station-description">${box.purpose}</p>
                    <div class="text-center my-4">
                        <span class="station-counter" data-action="show-level-detail" data-box-number="${box.number}" title="Detayları gör">
                            ${counterText}
                        </span>
                    </div>
                    <button class="btn btn-secondary w-full" data-action="study-level" data-box-number="${box.number}" ${!stationHasCards ? 'disabled' : ''}>
                        Bu Adımı Çalış
                    </button>
                </div>
            </div>`;
    }).join('');

    // Sayfanın genel HTML iskeletini oluşturalım
    container.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-slate-800 mb-2">🗺️ Ustalık Yolculuğu</h2>
            <p class="text-slate-600 mb-6">
                Bu görünüm, farklı eserlerdeki pasajları ustalık seviyelerine göre gruplar. Belirli bir beceriye odaklanarak (örn: tempo kazanma), bu beceriyi farklı bağlamlarda tekrar eder ve öğrenmeyi kalıcı hale getirirsin.
            </p>
            
            <div class="grid gap-5" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                ${stationCardsHTML}
            </div>
            </div>
    `;

    // Butonlara ve sayaçlara tıklama olaylarını ekleyelim (Event Delegation ile)
    container.addEventListener('click', (e) => {
        const studyBtn = e.target.closest('[data-action="study-level"]');
        const detailCounter = e.target.closest('[data-action="show-level-detail"]');

        if (studyBtn) {
            const boxNumber = parseInt(studyBtn.dataset.boxNumber, 10);
            const cardsToStudy = activeCards.filter(c => c.box === boxNumber);
            if (cardsToStudy.length > 0) {
                startStudySession(cardsToStudy);
            }
        }

        if (detailCounter) {
            const boxNumber = parseInt(detailCounter.dataset.boxNumber, 10);
            const cardsInStation = activeCards.filter(c => c.box === boxNumber);
            const boxInfo = defaultBoxSettings.find(b => b.number === boxNumber);

            document.getElementById('level-detail-title').textContent = `'${boxInfo.title}' Aşamasındaki Kartlar`;
            const detailBody = document.getElementById('level-detail-body');
            const studyBtnInModal = document.getElementById('level-detail-study-btn');

            if (cardsInStation.length > 0) {
                const cardsByProject = cardsInStation.reduce((acc, card) => {
                    if (!acc[card.projectName]) acc[card.projectName] = 0;
                    acc[card.projectName]++;
                    return acc;
                }, {});

                detailBody.innerHTML = Object.entries(cardsByProject).map(([proj, count]) => `
                    <div class="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                        <span class="font-medium text-slate-700">${proj}</span>
                        <span class="font-semibold text-slate-500">${count} kart</span>
                    </div>
                `).join('');
                
                studyBtnInModal.onclick = () => { UI.closeModal('level-detail-modal'); startStudySession(cardsInStation); };
                studyBtnInModal.disabled = false;
            } else {
                detailBody.innerHTML = '<p class="text-center text-slate-500">Bu aşamada hiç kart bulunmuyor.</p>';
                studyBtnInModal.onclick = null;
                studyBtnInModal.disabled = true;
            }
            UI.showModal('level-detail-modal');
        }
    });
}
// asistan_script_eski.js içinde bu kodun varlığından emin ol

showMasteryJourneyBtn.addEventListener('click', () => { 
    currentView = 'mastery-journey'; // Görünümü 'mastery-journey' olarak ayarla
    allData.activeProject = null;    // Aktif bir proje olmadığını belirt
    renderUI();                      // Arayüzü yeniden çiz
});
    // --- EKSİK OLAN KENAR ÇUBUĞU BUTON OLAY DİNLEYİCİLERİ ---

showSummaryViewBtn.addEventListener('click', () => {
    currentView = 'summary'; // Görünümü 'özet' olarak ayarla
    allData.activeProject = null; // Aktif bir proje olmadığını belirt
    renderUI(); // Arayüzü yeniden çiz
});

showReportsAndSessionsBtn.addEventListener('click', () => {
    currentView = 'reports-and-sessions';
    allData.activeProject = null;
    renderUI();
});

showAchievementsBtn.addEventListener('click', () => {
    currentView = 'achievements';
    allData.activeProject = null;
    renderUI();
});

showStatisticsBtn.addEventListener('click', () => {
    currentView = 'statistics';
    allData.activeProject = null;
    renderUI();
});

// Bu fonksiyonu asistan_script.js dosyasında uygun bir yere ekleyin

function requestSaveData() {
    // Eğer zaten bekleyen bir kaydetme işlemi varsa, onu iptal et
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // 2.5 saniye sonra veriyi kaydedecek yeni bir zamanlayıcı başlat
    saveTimeout = setTimeout(async () => {
        if (!userId) return; // Kullanıcı yoksa kaydetme
        try {
            console.log("Değişiklikler kaydediliyor...");
            await firebase.saveUserData(userId, allData);
            console.log("Değişiklikler başarıyla kaydedildi.");
        } catch (error) {
            console.error("Otomatik kaydetme sırasında hata:", error);
        }
    }, 2500); // 2.5 saniye bekleme süresi
}

// asistan_script_eski.js

function renderUI() {
    renderSidebar();
    updateSidebarActiveState();
    updateBottomNavActiveState();

    // Tüm ana konteynerları gizle
    mainDashboardContainer.classList.add('hidden');
    projectContainer.classList.add('hidden');
    reportsAndSessionsContainer.classList.add('hidden');
    achievementsContainer.classList.add('hidden');
    statisticsContainer.classList.add('hidden');
    allProjectsContainer.classList.add('hidden');
    moreViewContainer.classList.add('hidden');

    // Sadece aktif olan görünümü göster
    if (currentView === 'summary') {
        mainDashboardContainer.classList.remove('hidden');
        mainDashboardContainer.classList.add('fade-in');
        renderMainDashboard();
    } else if (currentView === 'mastery-journey') {
        // DÜZELTİLDİ: Bu blok sadeleştirildi ve doğru fonksiyonu çağırıyor.
        mainDashboardContainer.classList.remove('hidden');
        mainDashboardContainer.classList.add('fade-in');
        renderMasteryJourneyPage(); // "Ustalık Yolculuğu" sayfasını çizen doğru fonksiyon.
    } else if (currentView === 'project' && allData.activeProject) {
        // DOĞRU YER: Tempo gösterme kodu artık doğru yerde!
        projectContainer.classList.remove('hidden');
        projectContainer.classList.add('fade-in');

        // 1. Gerekli elementleri ve verileri al
        activeProjectTitle.textContent = allData.activeProject;
        const project = allData.projects[allData.activeProject];
        const tempoInfoEl = document.getElementById('active-project-tempo-info');

        // 2. Tempo bilgisinin varlığını kontrol et
        if (project && (project.baseTempo !== null && project.baseTempo !== undefined) && (project.targetTempo !== null && project.targetTempo !== undefined)) {
            // Eğer tempo değerleri varsa, onları göster
            tempoInfoEl.innerHTML = `
                <span class="text-xs sm:text-sm font-semibold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full whitespace-nowrap">
                    🎵 B: ${project.baseTempo} &rarr; H: ${project.targetTempo} BPM
                </span>
            `;
            tempoInfoEl.onclick = null; // Varsa eski onclick olayını temizle
        } else {
            // Eğer tempo değerleri yoksa, bir uyarı göster ve tıklanabilir yap
            tempoInfoEl.innerHTML = `
                <span class="text-xs sm:text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-200" title="Proje için başlangıç ve hedef tempo belirlemek için tıkla">
                    ⚠️ Tempo Belirtilmemiş
                </span>
            `;
            // Uyarıya tıklandığında ayarlar modalını aç
            tempoInfoEl.onclick = () => {
                document.getElementById('repetition-settings-btn').click();
            };
        }

        const projectActionIcons = document.getElementById('project-action-icons');
        if (projectActionIcons) projectActionIcons.classList.remove('hidden');
      
        cardManagementView.classList.remove('hidden');
        renderCardManagementView();
    } else if (currentView === 'reports-and-sessions') {
        reportsAndSessionsContainer.classList.remove('hidden');
        reportsAndSessionsContainer.classList.add('fade-in');
        renderReportsAndSessionsPage();
    } else if (currentView === 'achievements') {
        achievementsContainer.classList.remove('hidden');
        achievementsContainer.classList.add('fade-in');
        renderAchievementsPage();
    } else if (currentView === 'statistics') {
        statisticsContainer.classList.remove('hidden');
        statisticsContainer.classList.add('fade-in');
        chartsService.renderStatisticsPage(statisticsContainer, allData, defaultBoxSettings);
    } else if (currentView === 'more') {
        moreViewContainer.classList.remove('hidden');
        moreViewContainer.classList.add('fade-in');
        renderMoreView();
    } else if (currentView === 'all-projects') { // Bu satırı da ekleyelim
        allProjectsContainer.classList.remove('hidden');
        allProjectsContainer.classList.add('fade-in');
        renderAllProjectsPage();
    } else {
        // Eğer hiçbir koşul eşleşmezse, varsayılan olarak ana paneli göster
        currentView = 'summary';
        renderUI();
    }
}

 function updateSidebarActiveState() {
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.project-link').forEach(link => {
        link.classList.remove('active'); link.classList.remove('opacity-60');
    });
    const linkMapping = {
        summary: showSummaryViewBtn,
        'mastery-journey': showMasteryJourneyBtn, // Yeni satır
        'reports-and-sessions': showReportsAndSessionsBtn,
        achievements: showAchievementsBtn,
        statistics: showStatisticsBtn
    };
    if(linkMapping[currentView]) {
        linkMapping[currentView].classList.add('active');
        sidebarProjectList.querySelectorAll('.project-link').forEach(link => link.classList.add('opacity-60'));
    } else if (currentView === 'project' && allData.activeProject) {
        const activeLink = document.querySelector(`.project-link[data-project-name="${allData.activeProject}"]`);
        if(activeLink) activeLink.classList.add('active');
    }
}
// updateSidebarActiveState fonksiyonunun altına ekleyin

function updateBottomNavActiveState() {
    if (!mobileBottomNav) return;

    // Önce tüm linklerden 'active' class'ını kaldır
    mobileBottomNav.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Mevcut görünümle eşleşen linki bul ve 'active' class'ını ekle
    const activeLink = mobileBottomNav.querySelector(`.mobile-nav-link[data-view="${currentView}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// YENİ YARDIMCI FONKSİYON
function createProjectCardHTML(projectName, project) {
    const sections = project.sections || [];
    const totalCards = sections.length;
    let totalProgressScore = 0;

    if (totalCards > 0) {
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const totalBoxes = boxDefs.length;
        const progressPerCard = sections.map(card => {
            const currentBox = card.box || 1;
            const successCount = card.successCount || 0;
            if (currentBox >= totalBoxes && successCount >= masteryThreshold) {
                return 1.0;
            }
            const boxBaseProgress = (currentBox - 1) / totalBoxes;
            const inBoxProgress = (successCount / masteryThreshold) / totalBoxes;
            return boxBaseProgress + inBoxProgress;
        });
        totalProgressScore = progressPerCard.reduce((sum, current) => sum + current, 0);
    }

    const progress = totalCards > 0 ? (totalProgressScore / totalCards) * 100 : 0;
    const isMastered = progress >= 100;

    const cardDates = sections.map(s => s.lastMoved).filter(Boolean).map(isoString => new Date(isoString));
    let lastPracticeHTML = '';
    if (cardDates.length > 0) {
        const maxDate = new Date(Math.max.apply(null, cardDates));
        const formattedDate = maxDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        lastPracticeHTML = `<div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700"><p class="text-sm text-slate-500 dark:text-slate-400">Son Pratik: ${formattedDate}</p></div>`;
    } else {
        lastPracticeHTML = `<div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700"><p class="text-sm text-slate-400 dark:text-slate-500 italic">Başlamak için harika bir gün ✨</p></div>`;
    }

    return `
        <div class="project-card p-5 cursor-pointer" data-project-name="${projectName}">
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-lg text-slate-800 dark:text-slate-100 truncate pr-2">${projectName}</h4>
                <span class="text-xs font-semibold ${isMastered ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full flex-shrink-0">${isMastered ? 'Usta' : 'Çalışılıyor'}</span>
            </div>
            <div class="flex justify-between items-baseline mt-3">
                <p class="text-sm text-slate-500 dark:text-slate-400">${totalCards} Kart</p>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-300">%${progress.toFixed(0)} Tamamlandı</p>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mt-2">
                <div class="h-2 rounded-full ${isMastered ? 'bg-green-500' : 'bg-indigo-500'}" style="width: ${progress}%"></div>
            </div>
            ${lastPracticeHTML}
        </div>
    `;
}
// asistan_script_eski.js

function renderMainDashboard() {
    const mainDashboardContainer = document.getElementById('main-dashboard-container');
    if (!mainDashboardContainer) return;

    // HTML iskeleti, mobil ve masaüstü için farklı yerleşimleri destekler.
    const newDashboardHTML = `
        <div class="max-w-7xl mx-auto w-full space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="dashboard-welcome-card" class="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                </div>
                <div id="daily-summary-card" class="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Eserlerim</h3>
                    <a href="#" id="view-all-projects-btn" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Tümünü Gör &rarr;
                    </a>
                </div>
                <div id="dashboard-projects-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        </div>
    `;
    mainDashboardContainer.innerHTML = newDashboardHTML;

    // --- Elementleri Seçme ---
    const welcomeCard = document.getElementById('dashboard-welcome-card');
    const summaryCard = document.getElementById('daily-summary-card');
    const userName = currentUser ? currentUser.displayName.split(' ')[0] : 'Müzisyen';
    const suggestion = getSmartSuggestion();

    // --- Karşılama Kartını Doldurma (Mobil için metin boyutu ve boşluklar ayarlandı) ---
    welcomeCard.innerHTML = `
        <div>
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Merhaba ${userName},</h2>
            <p class="mt-1 text-base md:text-lg text-slate-600 dark:text-slate-400">${suggestion.text}</p>
        </div>
        <div class="mt-4 lg:mt-6">
            <button id="welcome-action-btn" class="btn btn-primary w-full sm:w-auto">${suggestion.buttonText}</button>
        </div>
    `;

    // --- Özet Kartı İçin Hesaplamalar ---
    const streakData = calculateStreak(allData);
    const dailyGoal = allData.dailyGoalInMinutes || 120;
    
    // --- DÜZELTİLMİŞ SATIR BAŞLANGICI ---
    // Hatalı olan toISOString() yerine yerel tarihi manuel olarak oluşturuyoruz.
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    // --- DÜZELTİLMİŞ SATIR SONU ---

    const secondsPracticed = allData.practiceLog ? (allData.practiceLog[todayStr] || 0) : 0;
    const minutesPracticed = Math.floor(secondsPracticed / 60);
    const timePercentage = dailyGoal > 0 ? Math.min((minutesPracticed / dailyGoal) * 100, 100) : 0;

   // --- YENİ VE DOĞRU HESAPLAMA BLOĞU ---
   let activeCardCount = 0;
   let completedTodayCardCount = 0;
   const todayDateString = new Date().toDateString();

   Object.values(allData.projects || {}).forEach(project => {
       const boxDefs = project.boxDefinitions || defaultBoxSettings;
       const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
       const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;

       (project.sections || []).forEach(section => {
           const isMastered = section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold;
           const wasMovedToday = section.lastMoved && new Date(section.lastMoved).toDateString() === todayDateString;

           // Bir kart ya hala aktifse YA DA bugün ustalaşmışsa, günün toplam kart havuzuna dahildir.
           if (!isMastered || (isMastered && wasMovedToday)) {
               activeCardCount++;
           }
           
           // Sadece bugün üzerinde çalışılan kartları tamamlanmış say.
           if (wasMovedToday) {
               completedTodayCardCount++;
           }
       });
   });

   // İlerleme yüzdesini hesapla
   const cardPercentage = activeCardCount > 0 ? (completedTodayCardCount / activeCardCount) * 100 : 0;
    // --- Güncellenmiş Özet Kartı (Mobil için boşluklar azaltıldı: space-y-4, mb-4) ---
    summaryCard.innerHTML = `
        <h3 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Bugünkü Özet</h3>
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <span class="text-3xl">🔥</span>
                <div>
                    <div class="text-lg font-bold text-slate-800 dark:text-slate-100">${streakData.current} Gün</div>
                    <div class="text-xs md:text-sm text-slate-500 dark:text-slate-400">Pratik Zinciri</div>
                </div>
            </div>
            <div>
                <div class="flex justify-between text-xs md:text-sm font-medium mb-1">
                    <span class="text-slate-600 dark:text-slate-300">Bugünkü Kart İlerlemesi</span>
                    <span class="text-slate-800 dark:text-slate-100">${completedTodayCardCount} / ${activeCardCount} kart</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div class="bg-sky-500 h-2 rounded-full" style="width: ${cardPercentage}%; transition: width 0.5s ease-out;"></div>
                </div>
            </div>
            <div>
                <div class="flex justify-between text-xs md:text-sm font-medium mb-1">
                    <span class="text-slate-600 dark:text-slate-300">Günlük Pratik Hedefi</span>
                    <span class="text-slate-800 dark:text-slate-100">${minutesPracticed} / ${dailyGoal} dk</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div class="bg-indigo-500 h-2 rounded-full" style="width: ${timePercentage}%; transition: width 0.5s ease-out;"></div>
                </div>
            </div>
        </div>
    `;
    
    // --- Olay Dinleyicileri ve Eser Listesi (Değişiklik yok) ---
    document.getElementById('welcome-action-btn').onclick = suggestion.action;
    const projectsListEl = document.getElementById('dashboard-projects-list');
    const projectsWithDates = Object.entries(allData.projects || {}).map(([projectName, project]) => ({ projectName, project, lastMoved: Math.max(0, ...(project.sections || []).map(s => s.lastMoved ? new Date(s.lastMoved).getTime() : 0)) }));
    const sortedProjects = projectsWithDates.sort((a, b) => b.lastMoved - a.lastMoved);
   const limitedProjects = sortedProjects.slice(0, 6);

if (limitedProjects.length > 0) {
    projectsListEl.innerHTML = limitedProjects.map(({ projectName, project }) => 
        createProjectCardHTML(projectName, project)
    ).join('');
    
    projectsListEl.querySelectorAll('.project-card').forEach(card => { 
        card.onclick = () => { 
            const projectName = card.dataset.projectName; 
            if (projectName) { 
                allData.activeProject = projectName; 
                currentView = 'project'; 
                renderUI(); 
            } 
        }; 
    });

} else {
    projectsListEl.innerHTML = `
        <div class="col-span-full text-center bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8">
            <div class="mx-auto w-16 h-16 text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
            </div>
            <h4 class="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">İlk Çalışma Alanını Oluştur</h4>
            <p class="mt-2 text-slate-500 dark:text-slate-400">Pratik yapmaya başlamak için ilk eserini ekle. <br> Bu, bir şarkı, bir etüt veya bir egzersiz olabilir.</p>
            <button id="dashboard-add-project-btn" class="btn btn-primary mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>Yeni Eser Oluştur</span>
            </button>
        </div>
    `;
    document.getElementById('dashboard-add-project-btn').onclick = () => {
        openCreateWorkModalBtn.click();
    };
}
    document.getElementById('view-all-projects-btn').onclick = (e) => { e.preventDefault(); currentView = 'all-projects'; renderUI(); };
}

function renderAllProjectsPage() {
    const sortedProjects = Object.entries(allData.projects || {}).sort((a, b) => a[0].localeCompare(b[0]));
    
    let content = `
        <div class="flex items-center gap-4 mb-8">
            <button id="back-to-dashboard-btn" class="btn btn-secondary !p-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Tüm Eserlerim (${sortedProjects.length})</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    `;

   if (sortedProjects.length > 0) {
    // Burada da aynı şekilde yeni fonksiyonu çağırıyoruz.
    content += sortedProjects.map(([projectName, project]) => 
        createProjectCardHTML(projectName, project)
    ).join('');
    } else {
        content += `<p class="text-center text-slate-500 col-span-full py-10">Henüz hiç eser eklemedin.</p>`;
    }

    content += `</div>`;
    allProjectsContainer.innerHTML = content;

    // Yeni eklenen "Geri Dön" ve proje kartlarına olay dinleyicileri ekle
    document.getElementById('back-to-dashboard-btn').onclick = () => {
        currentView = 'summary';
        renderUI();
    };
    allProjectsContainer.querySelectorAll('.project-card').forEach(card => {
        card.onclick = () => {
            const projectName = card.dataset.projectName;
            if (projectName) { allData.activeProject = projectName; currentView = 'project'; renderUI(); }
        };
    });
}


function getSmartSuggestion() {
    // 1. Olası tüm öneri türleri için verileri alalım.
    const promotionCandidates = getPromotionCandidateCards(10);
    const rustyCards = getRustyCards(7, 10);
    const activeLearningCards = getActiveLearningCards(); 
    // --> YENİ EKLENEN VERİ FONKSİYONU ÇAĞRISI
    const hardestCards = getHardestCards(10); 

    // 2. Öneri havuzumuzu oluşturalım.
    const availableSuggestions = [];

    // 3. Mevcut önerileri havuza ekleyelim.
    if (promotionCandidates.length > 0) {
        availableSuggestions.push({
            text: `🚀 Yükselmeye çok yakın <strong class="text-indigo-500">${promotionCandidates.length} kartın</strong> var. Onları tamamlamaya ne dersin?`,
            action: () => startStudySession(promotionCandidates),
            buttonText: "Hemen Çalış"
        });
    }

    if (rustyCards.length > 0) {
        availableSuggestions.push({
            text: `🧠 Tekrar zamanı gelmiş <strong class="text-indigo-500">${rustyCards.length} paslanmış kartını</strong> hatırlayalım mı?`,
            action: () => startStudySession(rustyCards),
            buttonText: "Tekrar Et"
        });
    }
    
    if (activeLearningCards.length > 0) {
        availableSuggestions.push({
            text: `🗺️ <strong class="text-indigo-500">Ustalık Yolculuğu</strong>'na çıkarak farklı eserlerdeki benzer becerileri pekiştir.`,
            action: () => {
                currentView = 'mastery-journey';
                allData.activeProject = null; 
                renderUI();
            },
            buttonText: "Yolculuğa Başla"
        });
    }

    // --> YENİ EKLENEN 'EN ZORLU KARTLAR' ÖNERİSİ
    if (hardestCards.length > 0) {
        availableSuggestions.push({
            text: `💪 En çok zorlandığın <strong class="text-indigo-500">${hardestCards.length} kartın</strong> üzerine gitmeye ne dersin?`,
            action: () => startStudySession(hardestCards),
            buttonText: "Zorluklarla Yüzleş"
        });
    }

    // 4. Rastgele seçim ve varsayılan durum mantığı aynı kalır.
    if (availableSuggestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSuggestions.length);
        return availableSuggestions[randomIndex];
    } else {
        return {
            text: "Bugün ne üzerinde çalışmak istersin?",
            action: () => { openCreateWorkModalBtn.click(); },
            buttonText: "Yeni Eser Oluştur"
        };
    }
}

function resetCardForm() {
    newCardNameInput.value = '';
    newCardDescInput.value = '';
    newWorkBaseTempoInput.value = '';
    newWorkTargetTempoInput.value = '';

    editingCardIndex = null;
    
    addCardToListBtn.textContent = 'Kartı Listeye Ekle';
    const existingCancelBtn = document.getElementById('cancel-card-edit-btn');
    if (existingCancelBtn) existingCancelBtn.remove();

    newCardNameInput.focus();
}
function renderAchievementsPage() {
    const earnedBadges = new Set(allData.earnedBadges || []);
    let badgesHtml = `
        <div class="bg-white border border-slate-200 rounded-lg p-6 mt-8">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">🏆 Kazanılan Rozetler</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    `;

    BADGES.forEach(badge => {
        const isEarned = earnedBadges.has(badge.slug);
        badgesHtml += `
            <div class="badge-card ${isEarned ? 'earned' : 'not-earned'}">
                <img src="${badge.icon_url}" alt="${badge.name}">
                <h3 class="font-bold text-lg">${badge.name}</h3>
                <p>${badge.description}</p>
            </div>
        `;
    });

    badgesHtml += `</div></div>`;

    let masteryLogHtml = `
        <div class="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-md">
            <div class="flex items-center gap-3 mb-4">
                <h2 class="text-2xl font-bold text-green-700">📚 Ustalaşılan Eserler</h2>
                <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">${allData.masteredProjectsLog ? allData.masteredProjectsLog.length : 0} Eser</span>
            </div>
            <p class="text-sm text-slate-500 -mt-2 mb-4">Tebrikler! İşte ustalaştığınız eserlerin kalıcı listesi.</p>
    `;

    if (allData.masteredProjectsLog && allData.masteredProjectsLog.length > 0) {
        masteryLogHtml += '<ul class="space-y-2">';
        const sortedLog = [...allData.masteredProjectsLog].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedLog.forEach(log => {
            const formattedDate = new Date(log.date).toLocaleDateString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            // --- SİLME BUTONUNUN YERİ DEĞİŞTİRİLDİ ---
          // YUKARIDAKİ KODU BUNUNLA DEĞİŞTİRİN:
masteryLogHtml += `
<li class="flex justify-between items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
    <span class="font-semibold text-green-700 flex-grow min-w-0 truncate" title="${log.name}">${log.name}</span>
    <div class="flex items-center gap-2 flex-shrink-0">
        <span class="hidden sm:inline text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">Tamamlandı: ${formattedDate}</span>
        <span class="inline sm:hidden text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">${new Date(log.date).toLocaleDateString('tr-TR')}</span>
        <button data-project-name="${log.name}" class="delete-mastery-log-btn text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-100 transition-colors" title="Bu kaydı sil">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    </div>
</li>
`;
        });
        masteryLogHtml += '</ul>';
    //...
} else {
    masteryLogHtml += `
        <div class="text-center py-8">
             <div class="mx-auto w-16 h-16 text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 class="mt-4 text-xl font-bold text-slate-700">Ustalık Kütüphanen Henüz Boş</h4>
            <p class="mt-2 text-slate-500">Bir eserdeki tüm kartları tamamladığında burada listelenecek. <br>Pratiğe devam et, başarı çok yakın!</p>
        </div>
    `;
}
//...

    masteryLogHtml += '</div>';
    
    achievementsContainer.innerHTML = masteryLogHtml + badgesHtml;
}

function renderCardManagementView() {
    if(!allData.activeProject) return;
    const project = allData.projects[allData.activeProject];
    if (!project) {
        currentView = 'summary';
        renderUI();
        return;
    }

    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const sections = project.sections || [];
    
    const accordionContainer = document.getElementById('leitner-boxes-mobile-accordion');
    if (!accordionContainer) return;
    
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
    
    // --- YENİ EKLENEN BÖLÜM BAŞLANGICI ---

    // 1. Çalışılabilecek tüm kartları bulalım (ustalaşılmamış olanlar)
    const studiableCards = sections.filter(s => {
        const isMastered = s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold;
        return !isMastered;
    });

    // 2. Butonun durumunu ve metnini güncelleyelim
    if (studiableCards.length > 0) {
        interleavedSessionContainer.classList.remove('hidden');
        startInterleavedSessionBtn.textContent = `Tümünü Çalış (${studiableCards.length} Kart)`;
        startInterleavedSessionBtn.disabled = false;
    } else {
        // Eğer çalışılacak kart yoksa (proje ya boş ya da ustalaşılmışsa), butonu gizle
        interleavedSessionContainer.classList.add('hidden');
    }
    
    // --- YENİ EKLENEN BÖLÜM SONU ---
    
    const isProjectMastered = sections.length > 0 && sections.every(s => s.box === maxBoxNumber && (s.successCount || 0) >= masteryThreshold);

    const addCardButton = document.getElementById('open-add-card-modal-btn');

    if (isProjectMastered) {
        // ... fonksiyonun geri kalanı aynı ...
        const completionDate = new Date(Math.max(...sections.map(s => new Date(s.lastMoved))));
        const formattedDate = completionDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        accordionContainer.innerHTML = `
            <div class="bg-green-50 border border-green-200 text-center p-8 rounded-xl shadow-sm">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-2xl font-bold text-green-800">Tebrikler, bu eserde ustalaştınız!</h3>
                <p class="text-green-700 mt-2">Toplam ${sections.length} kartın tamamı öğrenildi.</p>
                <p class="text-sm text-slate-500 mt-4 font-medium">Tamamlanma Tarihi: ${formattedDate}</p>
            </div>
        `;
        if(addCardButton) addCardButton.style.display = 'none';
        interleavedSessionContainer.classList.add('hidden'); // Ustalaşılmışsa harmanla butonunu da gizle

    } else {
        if(addCardButton) addCardButton.style.display = '';

        if (cardManagementSwiper) {
            cardManagementSwiper.destroy(true, true);
            cardManagementSwiper = null;
        }
        
        accordionContainer.innerHTML = '';

        boxDefs.forEach(boxDef => {
            const cardsInBox = sections.filter(s => {
                if (s.box !== boxDef.number) return false;
                if (s.box === maxBoxNumber && (s.successCount || 0) >= masteryThreshold) {
                    return false;
                }
                return true;
            });

          // asistan_script.js -> renderCardManagementView fonksiyonu içinde
let cardsHtml;
if (cardsInBox.length > 0) {
    cardsHtml = cardsInBox.map(card => createCardElementForManagement(card, project).outerHTML).join('');
} else {
    // Kutu boşsa gösterilecek zenginleştirilmiş içerik
    cardsHtml = `
        <div class="text-center p-4 border border-dashed rounded-md">
            <p class="text-slate-500 font-medium">Bu aşamada hiç kartın yok.</p>
            <p class="text-sm text-slate-400 mt-1">Eserine yeni bir kart ekleyerek başlayabilirsin.</p>
            <button data-action="add-card-in-empty-box" class="btn btn-secondary btn-sm mt-3 !py-1 !px-3">
                Yeni Kart Ekle
            </button>
        </div>
    `;
}

    const studyBoxButtonHtml = cardsInBox.length > 0
    ? `<div class="p-3 mb-3 bg-white border border-slate-200 rounded-md shadow-sm">
           <button data-box-number="${boxDef.number}" class="study-box-btn btn btn-primary w-full">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                   <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                   <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
               </svg>
               <span>Bu Kutuyu Çalış</span>
           </button>
       </div>`
    : '';
            
            const accordionItem = document.createElement('div');
accordionItem.className = `bg-white rounded-lg overflow-hidden border border-slate-200 shadow-md`;

            
accordionItem.innerHTML = `
    <div class="accordion-header flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50">
        
        <div class="flex-grow">
            <h4 class="font-bold text-slate-700 flex items-center">
                <span class="text-xl mr-3">${boxDef.icon}</span>
                <span>${boxDef.title}</span>
            </h4>
            <p class="text-sm text-slate-500 ml-9">${boxDef.purpose}</p>
        </div>
        <div class="flex items-center gap-4">
            <span class="font-semibold text-slate-600">${cardsInBox.length}</span>
            <svg class="w-6 h-6 text-slate-400 transition-transform accordion-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
        </div>
    <div class="accordion-content">
        <div class="p-4 border-t border-slate-200 bg-slate-50">
            ${studyBoxButtonHtml}
            <div class="space-y-3">
                ${cardsHtml}
            </div>
        </div>
    </div>`;
            accordionContainer.appendChild(accordionItem);
        });

        document.querySelectorAll('.study-box-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const boxNumber = parseInt(e.target.closest('[data-box-number]').dataset.boxNumber, 10);
                const cardsToStudy = sections
                    .filter(s => s.box === boxNumber && !((s.box === maxBoxNumber) && (s.successCount||0) >= masteryThreshold) )
                    .map(s => ({...s, projectName: allData.activeProject}));
                if (cardsToStudy.length > 0) {
                    startStudySession(cardsToStudy);
                }
            });
        });
    }
    // asistan_script.js -> renderCardManagementView fonksiyonunun sonuna ekleyin

// Dinamik olarak oluşturulan "Yeni Kart Ekle" butonlarına olay dinleyicisi ekle
document.querySelectorAll('[data-action="add-card-in-empty-box"]').forEach(btn => {
    btn.onclick = (e) => {
        e.stopPropagation(); // Akordiyonun açılıp kapanmasını engelle
        openAddCardModalBtn.click(); // Var olan modal açma butonunu tetikle
    };
});
}

 function createCardElementForManagement(section, project) {
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-lg shadow-sm border border-slate-200';
    card.dataset.id = section.id;

    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const successCount = section.successCount || 0;
    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
    
    let masteryHtml = `
        <div class="text-xs font-semibold text-slate-500" title="Üst kutuya geçmek için gereken başarı sayısı">
            ${successCount}/${masteryThreshold}
        </div>
    `;
    
    // --- DEĞİŞİKLİK BURADA ---
    // "Usta" etiketi artık hem son kutuda olma hem de başarı eşiğini geçme şartına bağlı.
    if (section.box >= maxBoxNumber && successCount >= masteryThreshold) {
        masteryHtml = `
            <div class="flex items-center gap-1 text-green-600 font-semibold" title="Bu pasajda ustalaşıldı!">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                   <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Usta</span>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-grow pr-2">
                <h5 class="font-bold text-slate-800">${section.name || 'Başlıksız Kart'}</h5>
                <p class="text-sm text-slate-500 mt-1">${section.description || ''}</p>
            </div>
            <div class="flex-shrink-0 flex flex-col items-end gap-2">
                <div class="flex -mt-1 -mr-1">
                    <button data-action="edit" class="btn-icon text-slate-400 hover:text-indigo-600 p-1" title="Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                    <button data-action="delete" class="btn-icon text-slate-400 hover:text-rose-600 p-1" title="Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
                ${masteryHtml}
            </div>
        </div>`;
    return card;
}

// asistan_script_eski.js

// asistan_script_eski.js

function renderReportsAndSessionsPage() {
    reportsAndSessionsContainer.innerHTML = `<h2 class="text-2xl font-bold text-slate-800 mb-4">Seans Paneli</h2>`;

    const projectNames = Object.keys(allData.projects || {});

    // createRecipeCard fonksiyonu burada, ana fonksiyonun İÇİNDE tanımlanmalı
    const createRecipeCard = (id, icon, title, description) => `
        <div class="recipe-card p-5">
            <div class="recipe-content">
                <div class="recipe-icon-wrapper">
                    <span class="recipe-icon">${icon}</span>
                </div>
                <div class="flex-grow">
                    <h4 class="font-bold text-slate-800 text-lg">${title}</h4>
                    <p class="text-slate-500 mt-1 text-sm">${description}</p>
                </div>
            </div>
            <div class="recipe-actions">
                <select class="form-select !py-2 text-sm" id="filter-${id}-project" ${projectNames.length === 0 ? 'disabled' : ''}>
                    <option value="all">Tüm Projeler</option>
                    ${projectNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
                <button id="start-${id}-session" class="btn btn-primary flex-shrink-0">Başlat</button>
            </div>
        </div>
    `;

    // Fonksiyonun geri kalanı...
    let finalHtml = `
        <div class="mb-8">
            <div class="grid gap-4 grid-auto-fit-sessions">
                ${createRecipeCard('promotion-candidates', '🚀', 'Yükselme Adayları', 'Bir üst seviyeye geçmeye çok yakın olan 10 kartla çalış.')}
                ${createRecipeCard('rusty-cards', '🧠', 'Paslanmış Kartlar', 'Son 1 haftadır hiç çalışmadığın 10 kartı tekrar et.')}
                ${createRecipeCard('hardest-cards', '💪', 'En Zorlu Kartlar', 'En çok hata yaptığın 10 kartın üzerine git.')}
                ${createRecipeCard('random-cards', '🎲', 'Rastgele Tekrar', 'Seçilen alandaki kartlardan rastgele 15 tanesiyle hafızanı sına.')}
            </div>
            </div>
    `;

    reportsAndSessionsContainer.innerHTML += finalHtml;

    document.getElementById('start-promotion-candidates-session').addEventListener('click', () => {
        const project = document.getElementById('filter-promotion-candidates-project').value;
        const cards = getPromotionCandidateCards(10, project);
        if (cards.length > 0) { startStudySession(cards); } else { UI.showInfoModal('Bu kriterlere uygun hiç kartınız bulunmuyor.', 'info'); }
    });
    document.getElementById('start-rusty-cards-session').addEventListener('click', () => {
        const project = document.getElementById('filter-rusty-cards-project').value;
        const cards = getRustyCards(7, 10, project);
        if (cards.length > 0) { startStudySession(cards); } else { UI.showInfoModal('Bu kriterlere uygun hiç kartınız bulunmuyor.', 'info'); }
    });
    document.getElementById('start-hardest-cards-session').addEventListener('click', () => {
        const project = document.getElementById('filter-hardest-cards-project').value;
        const cards = getHardestCards(10, project);
        if (cards.length > 0) { startStudySession(cards); } else { UI.showInfoModal('Bu kriterlere uygun hiç kartınız bulunmuyor.', 'info'); }
    });
    document.getElementById('start-random-cards-session').addEventListener('click', () => {
        const project = document.getElementById('filter-random-cards-project').value;
        const cards = getRandomCards(15, project);
        if (cards.length > 0) { startStudySession(cards); } else { UI.showInfoModal('Bu kriterlere uygun hiç kartınız bulunmuyor.', 'info'); }
    });
}

    function smartShuffle(cards) {
        if (!cards || cards.length === 0) return [];
        const groupedByBox = cards.reduce((acc, card) => {
            const box = card.box;
            if (!acc[box]) acc[box] = [];
            acc[box].push(card);
            return acc;
        }, {});

        for(const box in groupedByBox){
            groupedByBox[box].sort(() => 0.5 - Math.random());
        }

        const interleavedDeck = [];
        const boxKeys = Object.keys(groupedByBox).sort((a,b) => a - b);
        let active = true;
        while(active) {
            active = false;
            for (const key of boxKeys) {
                if (groupedByBox[key].length > 0) {
                    interleavedDeck.push(groupedByBox[key].shift());
                    active = true;
                }
            }
        }
        return interleavedDeck;
    }

function startStudySession(dueSections) {
    const shuffled = smartShuffle(dueSections);
    // HATA BURADAYDI: "project" alanı, o anki aktif projeden alınmalı.
    // ESKİ HALİ: project: studySession.project 
    studySession = { isActive: true, cards: shuffled, currentIndex: 0, project: allData.activeProject };
    renderCurrentStudyCard();
    pomodoroService.initialize();
    UI.showModal('study-modal');
}


 // asistan_script.js

// Fonksiyonu async olarak işaretliyoruz ki await kullanabilelim.
async function endStudySession() {
  metronomeService.stop();
    // --- YENİ EKLENEN BÖLÜM BAŞLANGICI ---
    // Eğer kaydedilmemiş pratik süresi varsa (unsavedSeconds > 0), şimdi kaydet.
    if (unsavedSeconds > 0) {
        try {
            // Veriyi Firebase'e kaydet ve işlemin bitmesini bekle.
            await firebase.saveUserData(userId, allData);
        } catch (error) {
            console.error("Çalışma süresi kaydedilirken hata oluştu:", error);
        } finally {
            // Kayıt işlemi başarılı da olsa, başarısız da olsa, biriken saniyeleri sıfırla.
            unsavedSeconds = 0; 
        }
    }
    // --- YENİ EKLENEN BÖLÜM SONU ---

    const wasGlobalSession = studySession.project === null;
    studySession = { isActive: false, cards: [], currentIndex: 0, project: null };

    // Seans bittikten sonra ana paneli her zaman yeniden çizerek
    // güncellenmiş pratik zincirini ve diğer istatistikleri gösterelim.
    renderUI(); 
}


// MEVCUT renderCurrentStudyCard FONKSİYONUNU SİLİP, BUNU YAPIŞTIRIN

// asistan_script_eski.js

function renderCurrentStudyCard() {
    const card = studySession.cards[studySession.currentIndex];
    const cardContainer = document.getElementById('study-card-container');
    const project = allData.projects[card.projectName];

    cardContainer.classList.remove('is-flipped');
    document.getElementById('study-progress').textContent = `Kart ${studySession.currentIndex + 1} / ${studySession.cards.length}`;

    // 1. Yeni akıllı fonksiyonumuzu kullanarak kartın geçerli tempolarını alalım.
    const effectiveTempos = getCardEffectiveTempos(card, project);

    // 2. Karar mekanizması artık bu "geçerli" tempo değerlerine göre çalışır.
    if (card.box === 3 && effectiveTempos.base && effectiveTempos.target) {
        
        const currentTempo = card.currentTempo || effectiveTempos.base;
        metronomeService.setBpm(currentTempo);
        metronomeService.start();

        setTimeout(() => {
            cardContainer.querySelector('.flip-card-front').innerHTML = `
                <div class="text-center flex flex-col justify-center h-full">
                    <p class="text-lg text-amber-600 font-semibold">Odak: Tempo Kazan</p>
                    <h3 class="text-4xl font-bold my-2">${card.name}</h3>
                    <div class="my-6">
                        <p class="text-xl text-slate-500">Şu Anki Tempo</p>
                        <p class="text-8xl font-bold text-slate-800 tracking-tighter">${currentTempo}</p>
                        <p class="text-lg text-slate-400 font-semibold">Hedef: ${effectiveTempos.target} BPM</p>
                    </div>
                    <p class="text-sm text-slate-500">${card.projectName}</p>
                </div>
            `;
            
            cardContainer.querySelector('.flip-card-back').innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-6">
                    <p class="text-3xl text-white text-center font-semibold">Bu tempoda hatasız ve akıcı çalabildin mi?</p>
                </div>
            `;
        }, 150);

    } else {
        // Diğer tüm kutular için normal arayüzü göster
        metronomeService.stop(); 
        const boxInfo = defaultBoxSettings.find(b => b.number === card.box);
        let frontFaceContextHTML = '';
        if (boxInfo) {
            frontFaceContextHTML = `
                <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg shadow-sm flex items-start gap-3 max-w-xs w-11/12 justify-center">
                    <span class="text-xl mt-1">${boxInfo.icon || ''}</span>
                    <div>
                        <span class="font-bold block">Odak: ${boxInfo.title}</span>
                        <p class="text-xs text-indigo-700 font-normal">${boxInfo.purpose || ''}</p>
                    </div>
                </div>
            `;
        }
        let questionText = 'Bu aşamayı başarıyla tamamladın mı?';
        if (boxInfo && boxInfo.question) {
            questionText = boxInfo.question;
        }
        setTimeout(() => {
            cardContainer.querySelector('.flip-card-front').innerHTML = `
                ${frontFaceContextHTML}
                <div class="text-center">
                    <h3 class="text-3xl lg:text-4xl font-bold">${card.name}</h3>
                    <p class="text-slate-500 text-lg mt-2">${card.description}</p>
                    <p class="text-sm text-indigo-400 mt-4 font-semibold">${card.projectName}</p>
                </div>`;
            cardContainer.querySelector('.flip-card-back').innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-6">
                    <p class="text-3xl text-white text-center font-semibold">${questionText}</p>
                </div>
            `;
        }, 150);
    }
    
    document.getElementById('study-controls').innerHTML = `<button id="show-answer-btn" class="btn btn-secondary"><span>Nasıldı ?</span><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></button>`;
    document.getElementById('show-answer-btn').onclick = showStudyCardAnswer;
}

function showStudyCardAnswer() {
    metronomeService.stop(); // <-- YENİ EKLENEN SATIR
    document.getElementById('study-card-container').classList.add('is-flipped');
    document.getElementById('study-controls').innerHTML = `
        <div class="flex justify-center gap-4 mt-8">
            <button id="study-incorrect-btn" class="btn btn-danger">Tekrar Gerekli</button>
            <button id="study-correct-btn" class="btn btn-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a2 2 0 00-.266 1.4z" />
                </svg>
                <span>Gayet İyi</span>
            </button>
        </div>`;
    document.getElementById('study-correct-btn').onclick = () => handleStudyAnswer(true);
    document.getElementById('study-incorrect-btn').onclick = () => handleStudyAnswer(false);
}
/**
 * Bir projenin ustalaşılıp ustalaşılmadığını kontrol eder ve eğer öyleyse,
 * kalıcı ustalık kütüphanesine kaydeder.
 * @param {string} projectName Kontrol edilecek projenin adı.
 */
async function checkAndLogMastery(projectName) {
    const project = allData.projects[projectName];
    if (!project) return;
    const sections = project.sections || [];
    if (sections.length === 0) return;

    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;

    const allCardsLearned = sections.every(section =>
        section.box === maxBoxNumber && (section.successCount || 0) >= masteryThreshold
    );

    if (allCardsLearned) {
        if (!allData.masteredProjectsLog) {
            allData.masteredProjectsLog = [];
        }
        const isAlreadyLogged = allData.masteredProjectsLog.some(log => log.name === projectName);
        
        if (!isAlreadyLogged) {
            const completionDate = new Date().toISOString();
            allData.masteredProjectsLog.push({ name: projectName, date: completionDate });
            // Değişikliği hemen kaydetmeye gerek yok, handleStudyAnswer zaten kaydedecek.
            UI.showInfoModal(`🏆 Tebrikler! '${projectName}' eseri artık kalıcı Ustalaşılan Eserler Kütüphanenize eklendi.`, 'success');
        }
    }
}


// asistan_script.js dosyasındaki bu fonksiyonu bulun ve tamamını değiştirin.

// asistan_script.js dosyasındaki bu fonksiyonu bulun ve tamamını değiştirin.

// asistan_script_eski.js

async function handleStudyAnswer(wasCorrect) {
    const card = studySession.cards[studySession.currentIndex];
    if (!card || !card.projectName) { return; }
    const project = allData.projects[card.projectName];
    if (!project) { return; }
    const sectionToUpdate = project.sections.find(s => s.id === card.id);
    if (!sectionToUpdate) { return; }

    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;

    // Yeni akıllı fonksiyonumuzu burada da kullanıyoruz!
    const effectiveTempos = getCardEffectiveTempos(sectionToUpdate, project);

    if (wasCorrect) {
        sectionToUpdate.successCount = (sectionToUpdate.successCount || 0) + 1;
        let canMoveToNextBox = false;

        // Kart "Tempo Kazan" kutusunda mı ve GEÇERLİ bir hedef temposu var mı?
        if (sectionToUpdate.box === 3 && effectiveTempos.target) {
            
            const currentTempo = sectionToUpdate.currentTempo || effectiveTempos.base;

            if (currentTempo >= effectiveTempos.target) {
                if (sectionToUpdate.successCount >= masteryThreshold) {
                    canMoveToNextBox = true;
                }
            } else {
                const newTempo = currentTempo + 5;
                sectionToUpdate.currentTempo = Math.min(newTempo, effectiveTempos.target);
                sectionToUpdate.successCount = 0;
            }
        } else {
            if (sectionToUpdate.successCount >= masteryThreshold) {
                canMoveToNextBox = true;
            }
        }

        if (sectionToUpdate.box < maxBoxNumber && canMoveToNextBox) {
            sectionToUpdate.box++;
            sectionToUpdate.successCount = 0;
            if (sectionToUpdate.baseTempo) {
                sectionToUpdate.currentTempo = sectionToUpdate.baseTempo;
            }
        }
        
        await checkAndLogMastery(card.projectName);
        
    } else {
        sectionToUpdate.incorrectCount = (sectionToUpdate.incorrectCount || 0) + 1;
        sectionToUpdate.successCount = 0;
        
        if (sectionToUpdate.box === 3 && effectiveTempos.base) {
            const newTempo = (sectionToUpdate.currentTempo || effectiveTempos.base) - 5;
            sectionToUpdate.currentTempo = Math.max(newTempo, effectiveTempos.base);
        }
    }
    
    sectionToUpdate.lastMoved = new Date().toString();
    requestSaveData();
    dataVersion++; 
    await checkAndAwardBadges();

    if (studySession.currentIndex < studySession.cards.length - 1) {
        studySession.currentIndex++;
        renderCurrentStudyCard();
    } else {
        metronomeService.stop(); 
        UI.closeModal('study-modal');
        UI.showInfoModal('Tekrar seansını başarıyla tamamladın!', 'success');
    }
}

    function isDueForReview(section, project) {
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const boxInfo = boxDefs.find(b => b.number === section.box);

        if (!boxInfo) return false;

        if (boxInfo.type === 'practice') {
            return true;
        }

        return false;
    }

    // asistan_script_eski.js

function renderNewWorkCardList() {
    newWorkCardListContainer.innerHTML = '';
    if (newWorkCards.length === 0) {
        newWorkCardListContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Henüz kart eklenmedi.</p>';
    } else {
        newWorkCards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            // --- DEĞİŞİKLİK: Kartın tamamını tıklanabilir bir grup yaptık ---
            cardEl.className = 'bg-white p-2.5 rounded-md border flex justify-between items-center group';
            cardEl.innerHTML = `
                <div class="flex-grow truncate pr-2 cursor-pointer" data-action="edit-card-in-list" data-index="${index}">
                    <p class="font-semibold text-slate-700 truncate group-hover:text-indigo-600">${card.name}</p>
                    <p class="text-xs text-slate-500 truncate">${card.description || 'Açıklama yok'}</p>
                </div>
                <button data-index="${index}" class="remove-card-from-list-btn btn-icon text-slate-400 hover:text-rose-500 flex-shrink-0 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>`;
            newWorkCardListContainer.appendChild(cardEl);
        });
    }
    newWorkCardCountEl.textContent = newWorkCards.length;
}

    function renderTemplateListForCreateModal() {
        createFromTemplatePanel.innerHTML = '';
        const categories = {};
        (globalTemplates || []).forEach(cat => {
            if (cat.works && cat.works.length > 0) {
                const approvedWorks = cat.works.filter(w => w.approved);
                if (approvedWorks.length > 0) categories[cat.category] = approvedWorks;
            }
        });

        if (Object.keys(categories).length > 0) {
            Object.entries(categories).forEach(([categoryName, works], index) => {
                const catDiv = document.createElement('div');
                catDiv.className = 'bg-slate-50 rounded-lg border';
                const worksHtml = works.map(work => `
                    <div class="flex justify-between items-center bg-white p-3 rounded-md border-b last:border-b-0">
                        <div>
                            <h5 class="font-semibold text-slate-800">${work.name}</h5>
                            <p class="text-sm text-slate-500">${work.cards.length} kart</p>
                        </div>
                        <button data-work-name="${work.name}" class="add-work-template-btn btn btn-secondary btn-sm !py-1 !px-3">Ekle</button>
                    </div>`).join('');

                catDiv.innerHTML = `<div class="flex justify-between items-center p-3 cursor-pointer" data-action="toggle-category" data-target="#create-tpl-cat-${index}"><h4 class="font-semibold text-slate-700">${categoryName}</h4><svg class="w-5 h-5 transition-transform toggle-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></div><div id="create-tpl-cat-${index}" class="collapsible-content"><div class="space-y-px p-2 pt-0">${worksHtml}</div></div>`;
                createFromTemplatePanel.appendChild(catDiv);
            });
        } else {
            createFromTemplatePanel.innerHTML = '<p class="text-center text-gray-500">Eklenecek onaylanmış şablon bulunmuyor.</p>';
        }
    }

   // asistan_script_eski.js dosyasındaki renderMoreView fonksiyonunu bununla değiştirin.

// asistan_script_eski.js dosyasındaki renderMoreView fonksiyonunu bununla değiştirin.

// asistan_script_eski.js dosyasındaki renderMoreView fonksiyonunu bununla değiştirin.

function renderMoreView() {
    if (!moreViewContainer || !userPanel) return;

    const userPanelHTML = userPanel.innerHTML;

    moreViewContainer.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100 px-4">Daha Fazla</h2>
            
            <div class="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-sm">
                ${userPanelHTML}
            </div>

            <div class="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                
                <a href="#" class="more-view-link" data-action="show-all-projects">
                    <span class="link-icon !mr-4 text-2xl">📚</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">Tüm Eserlerim</span>
                </a>
                <a href="#" class="more-view-link" data-action="show-achievements">
                    <span class="link-icon !mr-4 text-2xl">🏆</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">Başarımlar</span>
                </a>
                <a href="#" class="more-view-link" data-action="show-statistics">
                    <span class="link-icon !mr-4 text-2xl">📊</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">İstatistikler</span>
                </a>
                <a href="#" class="more-view-link" data-action="open-methodology-modal">
                    <span class="link-icon !mr-4 text-2xl">🎓</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">Çalışma Yöntemi</span>
                </a>
                 <a href="#" class="more-view-link" data-action="open-tools-modal">
                    <span class="link-icon !mr-4 text-2xl">🔧</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">Araçlar (Metronom/Tuner)</span>
                </a>
                <a href="#" class="more-view-link" data-action="open-daily-goal-modal">
                    <span class="link-icon !mr-4 text-2xl">🎯</span>
                    <span class="font-medium text-slate-700 dark:text-slate-200">Günlük Pratik Hedefi</span>
                </a>
                
                <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                     <div class="flex items-center">
                        <span class="link-icon !mr-4 text-2xl">🌙</span>
                        <span class="font-medium text-slate-700 dark:text-slate-200">Koyu Mod</span>
                    </div>
                    <label for="theme-toggle-mobile" class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" id="theme-toggle-mobile" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>
        </div>
    `;

    const mobileThemeToggle = document.getElementById('theme-toggle-mobile');
    if (mobileThemeToggle) {
        mobileThemeToggle.checked = document.documentElement.classList.contains('dark');
    }
}

    googleSigninBtn.addEventListener('click', () => { firebase.signInWithGoogle().catch(err => console.error("Google Sign-in Error:", err)); });
    // asistan_script.js dosyasının sonlarına doğru, diğer olay dinleyicilerin yanına ekleyin.

signOutBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Varsayılan eylemi engelle
    // Kullanıcıya ait state'i temizlemek iyi bir pratiktir.
    allData.activeProject = null; 
    // Firebase çıkış fonksiyonunu çağır
    firebase.signOutUser();
});

    document.addEventListener('click', (e) => { const summaryLink = e.target.closest('.summary-project-link'); if (summaryLink) { e.preventDefault(); const projectName = summaryLink.dataset.projectName; if (projectName) { allData.activeProject = projectName; currentView = 'project'; renderUI(); } } });
    document.querySelectorAll('[data-close-modal]').forEach(btn => { btn.addEventListener('click', () => UI.closeModal(btn.dataset.closeModal)); });
    sidebarProjectList.addEventListener('click', (e) => { e.preventDefault(); const targetLink = e.target.closest('.project-link'); if (targetLink) { allData.activeProject = targetLink.dataset.projectName; currentView = 'project'; renderUI(); sidebar.classList.remove('open'); sidebarOverlay.classList.add('hidden'); }});

    

// asistan_script_eski.js dosyasında bu bloğu bulun ve tamamıyla değiştirin

cardManagementView.addEventListener('click', async (e) => {
    const accordionHeader = e.target.closest('.accordion-header');
    const deleteButton = e.target.closest('button[data-action="delete"]');
    const editButton = e.target.closest('button[data-action="edit"]');

    // Akordiyon açma/kapama mantığı
    if (accordionHeader) {
        const accordionContainer = accordionHeader.closest('#leitner-boxes-mobile-accordion');
        const targetContent = accordionHeader.nextElementSibling;
        const isAlreadyOpen = targetContent.classList.contains('open');

        accordionContainer.querySelectorAll('.accordion-content').forEach(content => {
            content.classList.remove('open');
            content.previousElementSibling.querySelector('.accordion-arrow').classList.remove('open');
        });

        if (!isAlreadyOpen) {
            targetContent.classList.add('open');
            accordionHeader.querySelector('.accordion-arrow').classList.add('open');
        }
        return;
    }

    // Kart silme mantığı
    if (deleteButton) {
        const cardElement = deleteButton.closest('[data-id]');
        const sectionId = cardElement.dataset.id;
        const project = allData.projects[allData.activeProject];
        
        const confirmationMessage = `Bu kartı kalıcı olarak silmek istediğinizden emin misiniz?`;
        
        if (await UI.createConfirmationModal(confirmationMessage, "Evet, Kalıcı Olarak Sil", "btn-danger")) {                
            project.sections = project.sections.filter(s => s.id !== sectionId);
            requestSaveData();
            
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.transform = 'scale(0.9)';
            cardElement.style.opacity = '0';
            
            setTimeout(() => {
                cardElement.remove();
                renderCardManagementView(); 
            }, 300);

            await checkAndAwardBadges();
        }
    }

    // Kart düzenleme mantığı (Doğru yerde ve doğru şekilde)
    if (editButton) {
        const cardElement = editButton.closest('[data-id]');
        const sectionId = cardElement.dataset.id;
        const project = allData.projects[allData.activeProject];
        const section = project.sections.find(s => s.id === sectionId);
        
        // Dinamik placeholder mantığı
        const projectBaseTempo = project.baseTempo;
        const projectTargetTempo = project.targetTempo;
        editBaseTempoInput.placeholder = projectBaseTempo ? `Varsayılan: ${projectBaseTempo}` : 'Başlangıç';
        editTargetTempoInput.placeholder = projectTargetTempo ? `Varsayılan: ${projectTargetTempo}` : 'Hedef';

        // Modal'ı doldurma
        editCardIdInput.value = section.id;
        editCardModal.dataset.project = allData.activeProject;
        editCardNameInput.value = section.name;
        editCardDescInput.value = section.description;
        editCardNotesInput.value = section.notes || '';
        editBaseTempoInput.value = section.baseTempo || '';
        editTargetTempoInput.value = section.targetTempo || '';

        UI.showModal('edit-card-modal');
    }
});
    
    openAddCardModalBtn.addEventListener('click', () => { sectionNameInput.value = ''; sectionDescInput.value = ''; sectionNotesInput.value = '';  const project = allData.projects[allData.activeProject];
        if (project) {
            // Modal'daki tempo inputlarını projenin varsayılan değerleri ile doldur
            baseTempoInput.value = project.baseTempo || '';
            targetTempoInput.value = project.targetTempo || '';
        } else {
            // Proje bulunamazsa (teorik olarak olmamalı) alanları boş bırak
            baseTempoInput.value = '';
            targetTempoInput.value = '';
        } UI.showModal('add-card-modal'); });
   
        
        // asistan_script_eski.js

openCreateWorkModalBtn.addEventListener('click', () => { 
    // Modalı sıfırdan oluşturma için hazırla
    isEditMode = false;
    currentEditingProjectName = null;
    newWorkCards = [];
    
    // Form alanlarını temizle
    newProjectNameInput.value = '';
    document.getElementById('new-project-base-tempo').value = '';
    document.getElementById('new-project-target-tempo').value = '';
    document.getElementById('new-work-base-tempo-input').value = '';
    document.getElementById('new-work-target-tempo-input').value = '';
    newCardNameInput.value = ''; 
    newCardDescInput.value = ''; 
    
    renderNewWorkCardList(); 
    
    // Modal metinlerini ve sekmeleri orijinal haline getir
    createWorkModal.querySelector('h3').textContent = 'Yeni Çalışma Alanı Oluştur';
    createWorkConfirmBtn.textContent = 'Eseri ve Kartları Oluştur';
    
    // --- DÜZELTME: Şablon sekmesini görünür yap ---
    createFromTemplateTabBtn.style.display = 'inline-flex';
        document.getElementById('card-list-title').innerHTML = 'Eklenecek Kartlar (<span id="new-work-card-count">0</span>)';

    document.getElementById('create-work-tabs-nav').style.display = 'flex';
    
    switchCreateTab('blank'); 
    UI.showModal('create-work-modal'); 
});
  
  
        openCreateWorkModalBtn.addEventListener('click', () => { 
        newWorkCards = []; 
        newProjectNameInput.value = '';
        document.getElementById('new-project-base-tempo').value = '';
        document.getElementById('new-project-target-tempo').value = '';
        document.getElementById('new-work-base-tempo-input').value = '';
        document.getElementById('new-work-target-tempo-input').value = '';
        newCardNameInput.value = ''; 
        newCardDescInput.value = ''; 
        renderNewWorkCardList(); 
        switchCreateTab('blank'); 
        UI.showModal('create-work-modal'); 
    });

    // asistan_script_eski.js -> Mevcut createWorkConfirmBtn olay dinleyicisini bununla değiştirin

createWorkConfirmBtn.addEventListener('click', async () => {
    // --- DÜZENLEME MODU MANTIĞI ---
    if (isEditMode && currentEditingProjectName) {
        const projectToUpdate = allData.projects[currentEditingProjectName];
        if (!projectToUpdate) {
            UI.showInfoModal('Düzenlenecek eser bulunamadı.', 'error');
            return;
        }

        const newName = newProjectNameInput.value.trim();
        if (!newName) {
            UI.showInfoModal('Lütfen bir eser adı girin.', 'error');
            return;
        }

        // İsim değişikliği varsa ve yeni isim zaten kullanımdaysa hata ver
        if (newName !== currentEditingProjectName && allData.projects[newName]) {
            UI.showInfoModal(`'${newName}' adında bir eser zaten mevcut.`, 'error');
            return;
        }

        // Proje verilerini güncelle
        const baseTempo = parseInt(document.getElementById('new-project-base-tempo').value, 10);
        const targetTempo = parseInt(document.getElementById('new-project-target-tempo').value, 10);
        projectToUpdate.baseTempo = isNaN(baseTempo) ? null : baseTempo;
        projectToUpdate.targetTempo = isNaN(targetTempo) ? null : targetTempo;
        projectToUpdate.sections = newWorkCards; // Kart listesini güncellenmiş haliyle ata

        // Eğer isim değiştiyse, eski kaydı silip yenisini oluştur
        if (newName !== currentEditingProjectName) {
            allData.projects[newName] = projectToUpdate;
            delete allData.projects[currentEditingProjectName];
            allData.activeProject = newName;
        }

        // Değişiklikleri kaydet ve arayüzü güncelle
        await firebase.saveUserData(userId, allData);
        UI.closeModal('create-work-modal');
        UI.showInfoModal(`'${newName}' başarıyla güncellendi!`, 'success');
        
        // Düzenleme modundan çık
        isEditMode = false;
        currentEditingProjectName = null;
        renderUI();

    } else {
        // --- MEVCUT YENİ ESER OLUŞTURMA MODU MANTIĞI ---
        const projectName = newProjectNameInput.value.trim();
        if (!projectName) { UI.showInfoModal('Lütfen bir eser adı girin.', 'error'); return; }
        if (projectName.includes('.') || projectName.includes('/')) { UI.showInfoModal('Eser adı "." veya "/" karakterlerini içeremez.', 'error'); return; }
        if (allData.projects[projectName]) { UI.showInfoModal('Bu isimde bir eser zaten mevcut.', 'error'); return; }
        if (newWorkCards.length === 0) { UI.showInfoModal('Lütfen esere en az bir çalışma kartı ekleyin.', 'error'); return; }
        
        const baseTempo = parseInt(document.getElementById('new-project-base-tempo').value, 10);
        const targetTempo = parseInt(document.getElementById('new-project-target-tempo').value, 10);
        
        const newProject = {
            sections: newWorkCards, // Artık ID'ler kart eklenirken verildiği için burada tekrar ID vermeye gerek yok
            boxDefinitions: JSON.parse(JSON.stringify(defaultBoxSettings)),
            masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
            baseTempo: isNaN(baseTempo) ? null : baseTempo,
            targetTempo: isNaN(targetTempo) ? null : targetTempo
        };

        allData.projects[projectName] = newProject;
        
        try {
            await firebase.saveUserData(userId, allData);
            allData.activeProject = projectName;
            await checkAndAwardBadges();
            currentView = 'project';
            renderUI();
            UI.closeModal('create-work-modal');
            UI.showInfoModal(`'${projectName}' eseri ve ${newWorkCards.length} kart başarıyla oluşturuldu!`, 'success');
        } catch (error) {
            console.error("Yeni proje kaydedilirken hata:", error);
            UI.showInfoModal("Proje kaydedilirken bir hata oluştu.", "error");
            delete allData.projects[projectName];
        }
    }
});
    
    
    addSectionBtn.addEventListener('click', async () => {
        const name = sectionNameInput.value.trim();
        if (name === '') {
            UI.showInfoModal('Lütfen bir kart başlığı girin.', 'error');
            return;
        }
    
        // YENİ TEMPO DEĞERLERİNİ OKU
        const baseTempo = parseInt(baseTempoInput.value, 10);
        const targetTempo = parseInt(targetTempoInput.value, 10);
    
        const newSection = {
            id: 'section-' + Date.now() + Math.random().toString(36).substr(2, 9),
            name,
            description: sectionDescInput.value.trim(),
            notes: sectionNotesInput.value.trim(),
            box: 1,
            lastMoved: null,
            successCount: 0,
            // YENİ ALANLARI NESNEYE EKLE
            baseTempo: isNaN(baseTempo) ? null : baseTempo,
            targetTempo: isNaN(targetTempo) ? null : targetTempo,
            currentTempo: isNaN(baseTempo) ? null : baseTempo // Başlangıçta currentTempo, baseTempo'ya eşit
        };
    
        const project = allData.projects[allData.activeProject];
        if (!project.sections) project.sections = [];
        project.sections.push(newSection);
        
        await firebase.saveUserData(userId, allData);
        await checkAndAwardBadges();
    
        // Inputları temizle
        sectionNameInput.value = '';
        sectionDescInput.value = '';
        sectionNotesInput.value = '';
        baseTempoInput.value = '';
        targetTempoInput.value = '';
    
        renderCardManagementView();
       
        UI.closeModal('add-card-modal');
        UI.showInfoModal("Yeni kart başarıyla eklendi!", "success");
    });    mainSettingsBtn.addEventListener('click', (e) => { e.stopPropagation(); settingsDropdown.classList.toggle('hidden'); });
    window.addEventListener('click', () => { if(!settingsDropdown.classList.contains('hidden')) settingsDropdown.classList.add('hidden'); });
    pomodoroToggleBtn.addEventListener('click', () => pomodoroService.toggle());
    pomodoroResetBtn.addEventListener('click', () => pomodoroService.reset());
   // MEVCUT addCardToListBtn KODUNU SİLİP, BUNU YAPIŞTIRIN

// asistan_script_eski.js

addCardToListBtn.addEventListener('click', () => {
    const name = newCardNameInput.value.trim();
    if (!name) { UI.showInfoModal("Lütfen bir kart başlığı girin.", "error"); return; }
    
    const baseTempo = parseInt(newWorkBaseTempoInput.value, 10);
    const targetTempo = parseInt(newWorkTargetTempoInput.value, 10);

    const cardData = {
        name,
        description: newCardDescInput.value.trim(),
        box: 1, lastMoved: null, successCount: 0,
        baseTempo: isNaN(baseTempo) ? null : baseTempo,
        targetTempo: isNaN(targetTempo) ? null : targetTempo,
        currentTempo: isNaN(baseTempo) ? null : baseTempo,
        // ID'yi korumak için, düzenleniyorsa mevcut ID'yi al, değilse yeni ID oluştur
        id: (editingCardIndex !== null && newWorkCards[editingCardIndex]) ? newWorkCards[editingCardIndex].id : 'section-' + Date.now()
    };

    if (editingCardIndex !== null) {
        // Düzenleme Modu: Kartı güncelle
        newWorkCards[editingCardIndex] = cardData;
    } else {
        // Ekleme Modu: Yeni kart ekle
        newWorkCards.push(cardData);
    }
    
    renderNewWorkCardList();
    resetCardForm();
});
    
   // asistan_script_eski.js

newWorkCardListContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-card-from-list-btn');
    const editTrigger = e.target.closest('[data-action="edit-card-in-list"]');

    if (removeBtn) {
        const index = parseInt(removeBtn.dataset.index, 10);
        newWorkCards.splice(index, 1);
        renderNewWorkCardList();
        return; // İşlemi bitir
    }

    if (editTrigger) {
        const index = parseInt(editTrigger.dataset.index, 10);
        const cardToEdit = newWorkCards[index];
        
        editingCardIndex = index;

        // Formu kart bilgileriyle doldur
        newCardNameInput.value = cardToEdit.name || '';
        newCardDescInput.value = cardToEdit.description || '';
        newWorkBaseTempoInput.value = cardToEdit.baseTempo || '';
        newWorkTargetTempoInput.value = cardToEdit.targetTempo || '';

        // Butonları düzenleme moduna geçir
        addCardToListBtn.textContent = 'Değişiklikleri Kaydet';
        
        // Varsa eski iptal butonunu kaldırıp yenisini ekle
        const existingCancelBtn = document.getElementById('cancel-card-edit-btn');
        if (existingCancelBtn) existingCancelBtn.remove();
        
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-card-edit-btn';
        cancelBtn.textContent = 'İptal';
        cancelBtn.className = 'btn btn-secondary w-full';
        addCardToListBtn.parentNode.appendChild(cancelBtn);
        
        cancelBtn.onclick = () => {
            resetCardForm();
        };
    }
});
    
    
    saveEditCardBtn.addEventListener('click', async () => {
        const projectName = editCardModal.dataset.project;
        const cardId = editCardIdInput.value;
        if (!projectName) return;
    
        const project = allData.projects[projectName];
        const sectionToEdit = project.sections.find(s => s.id === cardId);
    
        if (sectionToEdit) {
            // Mevcut alanları güncelle
            sectionToEdit.name = editCardNameInput.value.trim();
            sectionToEdit.description = editCardDescInput.value.trim();
            sectionToEdit.notes = editCardNotesInput.value.trim();
    
            // YENİ EKLENENLER: Tempo alanlarını güncelle
            const baseTempo = parseInt(editBaseTempoInput.value, 10);
            const targetTempo = parseInt(editTargetTempoInput.value, 10);
    
            sectionToEdit.baseTempo = isNaN(baseTempo) ? null : baseTempo;
            sectionToEdit.targetTempo = isNaN(targetTempo) ? null : targetTempo;
    
            // Eğer başlangıç temposu değiştiyse, mevcut tempoyu da ona eşitleyelim
            // ki kullanıcı tempoyu baştan çalışmaya başlasın.
            if (sectionToEdit.currentTempo !== baseTempo) {
                sectionToEdit.currentTempo = sectionToEdit.baseTempo;
            }
    
            await firebase.saveUserData(userId, allData);
            UI.closeModal('edit-card-modal');
            renderCardManagementView();
        }
    });    
    
// Bu olay dinleyiciyi bulun ve tamamını değiştirin

saveSettingsBtn.addEventListener('click', async () => {
    const project = allData.projects[allData.activeProject];
    if(!project) return;

    // Ustalık eşiğini kaydet
    const masteryInput = document.getElementById('mastery-threshold-input');
    const newMasteryThreshold = parseInt(masteryInput.value, 10);
    if (isNaN(newMasteryThreshold) || newMasteryThreshold < 1) {
        UI.showInfoModal('Lütfen geçerli bir ustalık eşiği girin.', 'error');
        return;
    }
    project.masteryThreshold = newMasteryThreshold;

    const baseTempo = parseInt(document.getElementById('settings-base-tempo').value, 10);
    const targetTempo = parseInt(document.getElementById('settings-target-tempo').value, 10);
    project.baseTempo = isNaN(baseTempo) ? null : baseTempo;
    project.targetTempo = isNaN(targetTempo) ? null : targetTempo;

    await firebase.saveUserData(userId, allData);
    
    // Proje görünümünü yeni sıralama ile yenile
    renderCardManagementView(); 
    UI.closeModal('settings-modal');
});    openToolsModalBtn.addEventListener('click', (e) => { e.preventDefault(); settingsDropdown.classList.add('hidden'); UI.showModal('tools-modal'); });
    createBlankTabBtn.addEventListener('click', () => switchCreateTab('blank'));
    createFromTemplateTabBtn.addEventListener('click', () => { renderTemplateListForCreateModal(); switchCreateTab('template'); });
 // asistan_script_eski.js

createFromTemplatePanel.addEventListener('click', async (e) => {
    const categoryToggle = e.target.closest('[data-action="toggle-category"]');
    if (categoryToggle) {
        // Kategori açma/kapama mantığı aynı kalıyor
        const targetSelector = categoryToggle.dataset.target;
        const targetElement = document.querySelector(targetSelector);
        const arrowIcon = categoryToggle.querySelector('.toggle-arrow');
        targetElement.classList.toggle('open');
        arrowIcon.classList.toggle('open');
        return;
    }

    const targetButton = e.target.closest('.add-work-template-btn');
    if (!targetButton) return;
    const workName = targetButton.dataset.workName;
    if (allData.projects[workName]) {
        UI.showInfoModal(`"${workName}" adında bir eser zaten mevcut.`, 'error');
        return;
    }

    // Şablon verisini bul
    let work;
    for (const category of globalTemplates) {
        if (category.works) {
            const foundWork = category.works.find(w => w.name === workName && w.approved);
            if (foundWork) {
                work = foundWork;
                break;
            }
        }
    }
    if (!work) {
        UI.showInfoModal("Onaylı şablon bulunamadı.", "error");
        return;
    }

    // --- YENİ MANTIK: Proje oluşturmak yerine, ayar modalını aç ---
    document.getElementById('template-settings-info').textContent = `'${work.name}' eserini kendi tempolarınızla oluşturun. Önerilen değerler aşağıda doldurulmuştur.`;
    document.getElementById('template-name-to-create').value = work.name;
    document.getElementById('template-base-tempo').value = work.baseTempo || '';
    document.getElementById('template-target-tempo').value = work.targetTempo || '';

    UI.showModal('template-settings-modal');
});
    metronomeTabBtn.addEventListener('click', () => { stopTuner(); metronomeTabBtn.classList.add('border-indigo-500', 'text-indigo-600'); metronomeTabBtn.classList.remove('border-transparent', 'text-gray-500'); tunerTabBtn.classList.add('border-transparent', 'text-gray-500'); tunerTabBtn.classList.remove('border-indigo-500', 'text-indigo-600'); metronomePanel.classList.remove('hidden'); tunerPanel.classList.add('hidden'); });
    tunerTabBtn.addEventListener('click', () => { metronomeService.stop(); tunerTabBtn.classList.add('border-indigo-500', 'text-indigo-600'); tunerTabBtn.classList.remove('border-transparent', 'text-gray-500'); metronomeTabBtn.classList.add('border-transparent', 'text-gray-500'); metronomeTabBtn.classList.remove('border-indigo-500', 'text-indigo-600'); tunerPanel.classList.remove('hidden'); metronomePanel.classList.add('hidden'); });
    projectContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button || !button.id) return;
        const activeProject = allData.activeProject;
        if (!activeProject) return;
    
        if (button.id === 'delete-project-btn') {
            if (await UI.createConfirmationModal(`"${activeProject}" eserini ve içindeki tüm kartları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                try {
                    const silinecekEserAdi = activeProject;
                    await firebase.deleteProject(userId, silinecekEserAdi);
                    delete allData.projects[silinecekEserAdi];
                    allData.activeProject = null;
                    UI.showInfoModal(`'${silinecekEserAdi}' adlı eser kalıcı olarak silindi.`, 'success');
                    currentView = 'summary';
                    renderUI();
                    await checkAndAwardBadges();
                } catch (error) {
                    console.error("Proje silinirken hata oluştu:", error);
                    UI.showInfoModal("Proje silinirken bir hata oluştu. Lütfen tekrar deneyin.", "error");
                }
            }
        }
    
       // OLMASI GEREKEN DOĞRU KOD
// MEVCUT KODU SİLİP, BUNU YAPIŞTIRIN

if (button.id === 'suggest-as-template-btn') {
    const confirmation = await UI.createConfirmationModal(
        `'${activeProject}' adlı eserinizi admin onayı için bir şablon olarak göndermek istediğinizden emin misiniz?`,
        "Evet, Gönder",      // Buton metni
        "btn-primary"        // Buton stili (mavi)
    );

    if (confirmation) {
        const projectData = allData.projects[activeProject];
        
        const templateSubmission = {
            name: activeProject,
            cards: projectData.sections.map(({ name, description, notes, baseTempo, targetTempo }) => ({
                // DÜZELTME: Tanımsız (undefined) olabilecek alanları kontrol edip,
                //          onun yerine geçerli bir değere (boş string '' veya null) çeviriyoruz.
                name: name || '',
                description: description || '',
                notes: notes || null,
                baseTempo: baseTempo || null,
                targetTempo: targetTempo || null
            })),
            submittedBy: userId,
            submittedByName: currentUser.displayName,
            submittedAt: new Date().toISOString(),
            status: 'pending' 
        };

        try {
            await firebase.submitTemplate(templateSubmission);
            UI.showInfoModal("Öneriniz başarıyla gönderildi! Onaylandıktan sonra şablonlar listesinde görünecektir.", "success");
        } catch (error) {
            console.error("Şablon gönderilirken hata oluştu: ", error); // Gerçek hatayı görmek için bu satır önemli
            UI.showInfoModal("Öneriniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.", "error");
        }
    }
}
    
        if (button.id === 'repetition-settings-btn') {
            const project = allData.projects[activeProject];
            if (!project) return;
    
            settingsProjectName.textContent = `"${activeProject}" için Ayarlar`;
            
            // Sadece Ustalık Eşiğini ayarla
            const masteryInput = document.getElementById('mastery-threshold-input');
            masteryInput.value = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
            
             // YENİ EKLENEN SATIRLAR
    document.getElementById('settings-base-tempo').value = project.baseTempo || '';
    document.getElementById('settings-target-tempo').value = project.targetTempo || '';

    UI.showModal('settings-modal');
        }
        
     // asistan_script_eski.js -> projectContainer.addEventListener içinde...

        // Mevcut 'rename-project-btn' if bloğunu bununla değiştirin
        if (button.id === 'rename-project-btn') {
            const projectToEdit = allData.projects[activeProject];
            if (!projectToEdit) return;

            // 1. Düzenleme modunu aktif et
            isEditMode = true;
            currentEditingProjectName = activeProject;

            // 2. Modalı mevcut proje verileriyle doldur
            // Proje bilgilerini doldur
            newProjectNameInput.value = activeProject;
            document.getElementById('new-project-base-tempo').value = projectToEdit.baseTempo || '';
            document.getElementById('new-project-target-tempo').value = projectToEdit.targetTempo || '';

            // Kart listesini doldur (Mevcut kartları kopyala)
            // JSON.parse(JSON.stringify(...)) ile "derin kopya" oluşturarak orijinal veriyi koruyoruz.
            newWorkCards = JSON.parse(JSON.stringify(projectToEdit.sections || [])); 
            renderNewWorkCardList();

            // 3. Modalın metinlerini "Düzenleme" moduna uygun hale getir
            createWorkModal.querySelector('h3').textContent = 'Eseri Düzenle';
            createWorkConfirmBtn.textContent = 'Değişiklikleri Kaydet';

            document.getElementById('create-work-tabs-nav').style.display = 'none';
            
            // 4. Hazır şablon sekmesini gizle ve Boş Eser sekmesini aktif et
            createFromTemplateTabBtn.style.display = 'none';
            switchCreateTab('blank');
            const cardCount = (projectToEdit.sections || []).length;
    document.getElementById('card-list-title').innerHTML = `Mevcut Kartlar (${cardCount}) <br><small class="font-normal text-slate-500 text-sm">Düzenlemek için bir karta tıkla.</small>`;
    
            // 5. Modalı göster
            UI.showModal('create-work-modal');
        }
    });
    //... mevcut kodun sonu

    achievementsContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-mastery-log-btn');
        if (!deleteBtn) return;

        const projectName = deleteBtn.dataset.projectName;
        const confirmationMessage = `"${projectName}" eserini Ustalaşılan Eserler Kütüphanesi'nden kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`;

        if (await UI.createConfirmationModal(confirmationMessage, "Evet, Sil", "btn-danger"))
        {            if (allData.masteredProjectsLog) {
                allData.masteredProjectsLog = allData.masteredProjectsLog.filter(log => log.name !== projectName);
                await firebase.saveUserData(userId, allData);
                renderAchievementsPage(); // Sayfayı yenileyerek değişikliği göster
                UI.showInfoModal(`'${projectName}' kütüphaneden başarıyla silindi.`, 'success');
            }
        }
    });
// SİLDİĞİN BLOĞUN YERİNE BU DOĞRU KODU YAPIŞTIR

// "Günlük Pratik Hedefi" menü linkine tıklandığında modalı aç
openDailyGoalModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // Mevcut hedefi SAAATE çevirerek input'a yükle
    const currentGoalInHours = (allData.dailyGoalInMinutes || 120) / 60;
    dailyGoalInputHours.value = currentGoalInHours; // DOĞRU DEĞİŞKENİ KULLANIYOR
    UI.showModal('daily-goal-modal');
    settingsDropdown.classList.add('hidden');
});

// Modal içindeki hazır SAAT butonlarına tıklandığında input'u SAAT olarak güncelle
dailyGoalModal.addEventListener('click', (e) => {
    if (e.target.matches('.goal-preset-btn')) {
        const minutes = e.target.dataset.value;
        dailyGoalInputHours.value = parseInt(minutes, 10) / 60; // DOĞRU DEĞİŞKENİ KULLANIYOR
    }
});

// "Kaydet" butonuna tıklandığında yeni hedefi (SAATİ DAKİKAYA ÇEVİREREK) kaydet
saveDailyGoalBtn.addEventListener('click', async () => {
    const newGoalInHours = parseFloat(dailyGoalInputHours.value);

    if (isNaN(newGoalInHours) || newGoalInHours <= 0) {
        UI.showInfoModal("Lütfen 0'dan büyük geçerli bir saat girin (örn: 0.5 veya 1).", "error");
        return;
    }

    // === YENİ KONTROL MEKANİZMASI ===
    if (newGoalInHours > 8) {
        const warningMessage = "<strong>Sağlıklı ve Sürdürülebilir Pratik:</strong> Günde 8 saat, bir müzisyen için tam zamanlı bir iş kadar yoğun bir pratiktir. Bu sınır, kullanıcıları aşırı ve sağlıksız hedefler koymaktan korur, uygulamanın sürdürülebilir alışkanlıkları teşvik etmesini sağlar.";
        UI.showInfoModal(warningMessage, 'info'); // 'info' tipi, bilgilendirme için daha uygun
        return; // Kaydetme işlemini durdur
    }
    // ===================================

    // Saati dakikaya çevir ve kaydet
    allData.dailyGoalInMinutes = Math.round(newGoalInHours * 60);
    
    await firebase.saveUserData(userId, allData);
    UI.closeModal('daily-goal-modal');
    UI.showInfoModal("Günlük hedefin başarıyla güncellendi!", "success");
    renderUI(); 
});


// ... diğer olay dinleyicilerinin yanına ekleyin
startInterleavedSessionBtn.addEventListener('click', () => {
    if (!allData.activeProject) return;
    const project = allData.projects[allData.activeProject];
    if (!project || !project.sections) return;

    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;

    // Çalışılabilecek tüm kartları bul
    const studiableCards = project.sections.filter(s => {
        const isMastered = s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold;
        return !isMastered;
    });

    // Kartlara proje adını ekle (startStudySession fonksiyonu bu bilgiyi bekliyor)
    const cardsToStudy = studiableCards.map(card => ({...card, projectName: allData.activeProject}));
    
    if (cardsToStudy.length > 0) {
        startStudySession(cardsToStudy);
    } else {
        UI.showInfoModal('Bu eserde şu an çalışılacak hiç kart bulunmuyor.', 'info');
    }
});




// Diğer olay dinleyicilerinin bulunduğu bölümün sonuna ekleyin

// YENİ: MOBİL ALT NAVİGASYON İÇİN OLAY DİNLEYİCİ
if (mobileBottomNav) {
    mobileBottomNav.addEventListener('click', (e) => {
        e.preventDefault();

        // Linklerden birine tıklanmışsa...
        const navLink = e.target.closest('.mobile-nav-link');
        if (navLink && navLink.dataset.view) {
            const view = navLink.dataset.view;
            // Eğer zaten o sayfadaysak bir şey yapma
            if (currentView === view) return;

            currentView = view;
            allData.activeProject = null;
            renderUI();

            // Sidebar açıksa kapat
            if (sidebar.classList.contains('open')) { 
                sidebar.classList.remove('open'); 
                sidebarOverlay.classList.add('hidden'); 
            }
            return; // İşlemi bitir
        }

        // Ortadaki "Ekle" butonuna tıklanmışsa...
        const addBtn = e.target.closest('#mobile-nav-add-btn');
        if (addBtn) {
            // Mevcut "Yeni Eser Oluştur" modalını açan butonu tetikle
            openCreateWorkModalBtn.click();
        }
    });
}

// asistan_script_eski.js dosyasındaki mevcut moreViewContainer olay dinleyicisini bununla değiştirin.

moreViewContainer.addEventListener('click', (e) => {
    const link = e.target.closest('.more-view-link');
    const signOutButton = e.target.closest('#sign-out-btn');
    // YENİ: Mobil tema değiştiriciyi hedef al
    const themeToggleInput = e.target.closest('#theme-toggle-mobile');

    if (link) {
        e.preventDefault();
        const action = link.dataset.action;

        switch (action) {
            case 'show-all-projects':
                currentView = 'all-projects';
                renderUI();
                break;
            case 'show-achievements':
                currentView = 'achievements';
                renderUI();
                break;
            case 'show-statistics':
                currentView = 'statistics';
                renderUI();
                break;
            case 'open-methodology-modal':
                UI.showModal('methodology-modal');
                break;
            case 'open-tools-modal':
                UI.showModal('tools-modal');
                break;
            case 'open-daily-goal-modal':
                openDailyGoalModalBtn.click(); // Mevcut modal açma mantığını tetikle
                break;
        }
    }

    // "Daha Fazla" ekranındaki Çıkış Yap butonunu da çalıştır
    if (signOutButton) {
        e.preventDefault();
        allData.activeProject = null;
        firebase.signOutUser();
    }
    
    // YENİ: Mobil tema değiştirici için mantık
    if (themeToggleInput) {
        // Doğrudan input'un 'checked' özelliğini kullanarak temayı ayarla
        if (themeToggleInput.checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
});
startStopMetronomeBtn.addEventListener('click', () => metronomeService.toggle());


 
 const openMethodologyModalBtn = document.getElementById('open-methodology-modal-btn');
 if (openMethodologyModalBtn) {
     openMethodologyModalBtn.addEventListener('click', (e) => {
         e.preventDefault(); // Linkin varsayılan davranışını engelle
         UI.showModal('methodology-modal');
         
         // Tıkladıktan sonra "Daha Fazla" menüsünü de kapatalım
         const settingsDropdown = document.getElementById('settings-dropdown');
         if(settingsDropdown) {
             settingsDropdown.classList.add('hidden');
         }
     });
 }


 // asistan_script.js dosyasının sonlarına doğru ekleyin

function renderOnboardingStep() {
    const step = ONBOARDING_STEPS[currentOnboardingStep];

    // Fade out
    onboardingStepContent.style.opacity = '0';
    onboardingStepContent.style.transform = 'translateY(10px)';

    setTimeout(() => {
        onboardingStepContent.innerHTML = `
            <div class="w-24 h-24 mx-auto text-indigo-500 mb-6">
                ${step.icon}
            </div>
            <h3 class="text-2xl font-bold text-slate-800 mb-3">${step.title}</h3>
            <p class="text-slate-600 leading-relaxed">${step.text}</p>
        `;
        // Fade in
        onboardingStepContent.style.opacity = '1';
        onboardingStepContent.style.transform = 'translateY(0)';
    }, 300);


    // Noktaları güncelle
    onboardingDotsContainer.innerHTML = ONBOARDING_STEPS.map((_, index) =>
        `<div class="onboarding-dot ${index === currentOnboardingStep ? 'active' : ''}"></div>`
    ).join('');

    // Butonları güncelle
    onboardingBackBtn.classList.toggle('hidden', currentOnboardingStep === 0);
    onboardingNextBtn.classList.toggle('hidden', currentOnboardingStep === ONBOARDING_STEPS.length - 1);
    onboardingFinishBtn.classList.toggle('hidden', currentOnboardingStep !== ONBOARDING_STEPS.length - 1);
    onboardingSkipBtn.classList.toggle('hidden', currentOnboardingStep === ONBOARDING_STEPS.length - 1);
}

async function completeOnboarding() {
    UI.closeModal('onboarding-modal');
    if (allData) {
        allData.hasCompletedOnboarding = true;
        await firebase.saveUserData(userId, allData);
    }
}

function startOnboarding() {
    currentOnboardingStep = 0;
    renderOnboardingStep();
    UI.showModal('onboarding-modal');
}

// Onboarding olay dinleyicileri
onboardingNextBtn.addEventListener('click', () => {
    if (currentOnboardingStep < ONBOARDING_STEPS.length - 1) {
        currentOnboardingStep++;
        renderOnboardingStep();
    }
});

onboardingBackBtn.addEventListener('click', () => {
    if (currentOnboardingStep > 0) {
        currentOnboardingStep--;
        renderOnboardingStep();
    }
});

onboardingFinishBtn.addEventListener('click', completeOnboarding);
onboardingSkipBtn.addEventListener('click', completeOnboarding);

// asistan_script_eski.js dosyasının uygun bir yerine ekleyin

// asistan_script_eski.js

document.getElementById('confirm-template-creation-btn').addEventListener('click', async () => {
    const workName = document.getElementById('template-name-to-create').value;
    const baseTempo = parseInt(document.getElementById('template-base-tempo').value, 10);
    const targetTempo = parseInt(document.getElementById('template-target-tempo').value, 10);

    if (!workName) {
        UI.showInfoModal("Bir hata oluştu. Lütfen işlemi tekrar başlatın.", "error");
        return;
    }

    // Orijinal şablon verisini tekrar bul
    let work;
    for (const category of globalTemplates) {
        if (category.works) {
            const foundWork = category.works.find(w => w.name === workName && w.approved);
            if (foundWork) {
                work = foundWork;
                break;
            }
        }
    }
    if (!work) {
        UI.showInfoModal("Şablon verisi bulunamadı, işlem iptal edildi.", "error");
        return;
    }

    // Yeni projeyi, MODALDAN GELEN KİŞİSELLEŞTİRİLMİŞ tempolarla oluştur
    const newProject = {
        // --- DEĞİŞTİRİLEN VE SORUNU ÇÖZEN BÖLÜM ---
        sections: work.cards.map(card => ({
            ...card, // Şablondan gelen kart bilgilerini (isim, açıklama vb.) al
            id: 'section-' + Date.now() + Math.random().toString(36).substr(2, 9),
            box: 1,
            lastMoved: null,
            successCount: 0,
            
            // Kartın temposunu ayarla: Önce kartın kendine özel temposuna bak,
            // yoksa kullanıcının girdiği proje geneli tempoyu kullan.
            baseTempo: card.baseTempo || (isNaN(baseTempo) ? null : baseTempo),
            targetTempo: card.targetTempo || (isNaN(targetTempo) ? null : targetTempo),
            
            // Son olarak, mevcut tempoyu nihai başlangıç temposuna eşitle.
            currentTempo: card.baseTempo || (isNaN(baseTempo) ? null : baseTempo)
        })),
        // --- DEĞİŞİKLİK SONU ---
        
        boxDefinitions: JSON.parse(JSON.stringify(defaultBoxSettings)),
        masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
        
        // Projenin genel tempolarını KULLANICININ GİRDİĞİ değerlerle ayarla
        baseTempo: isNaN(baseTempo) ? null : baseTempo,
        targetTempo: isNaN(targetTempo) ? null : targetTempo
    };

    allData.projects[work.name] = newProject;
    allData.activeProject = work.name;

    try {
        await firebase.saveUserData(userId, allData);
        await checkAndAwardBadges();
        currentView = 'project';
        renderUI();
        UI.closeModal('template-settings-modal');
        UI.closeModal('create-work-modal');
        UI.showInfoModal(`'${work.name}' eseri başarıyla oluşturuldu!`, 'success');
    } catch (error) {
        console.error("Şablondan proje kaydedilirken hata:", error);
        UI.showInfoModal("Proje kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.", "error");
        delete allData.projects[work.name];
        allData.activeProject = null;
        currentView = 'summary';
        renderUI();
    }
});

// ===============================================
    // YENİ EKLENECEK TEMA DEĞİŞTİRME MANTIĞI BAŞLANGICI  
    // ===============================================

    // 1. Düğmenin mevcut durumunu, geçerli temaya göre ayarla
    if (document.documentElement.classList.contains('dark')) {
        themeToggle.checked = true;
    }

    // 2. Düğmeye tıklandığında çalışacak olay dinleyicisini ekle
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            // Düğme aktifse: Koyu modu etkinleştir
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            // Düğme pasifse: Koyu modu kaldır (Açık mod)
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
// asistan_script_eski.js

// "Yeni/Düzenle" modalı iptal edildiğinde veya kapatıldığında her şeyi sıfırla
document.body.addEventListener('click', (e) => {
    if (e.target.matches('.create-work-cancel-btn')) {
        isEditMode = false;
        currentEditingProjectName = null;
        
        // Modal metinlerini orijinal haline getir
        createWorkModal.querySelector('h3').textContent = 'Yeni Çalışma Alanı Oluştur';
        createWorkConfirmBtn.textContent = 'Eseri ve Kartları Oluştur';
                document.getElementById('card-list-title').innerHTML = 'Eklenecek Kartlar (<span id="new-work-card-count">0</span>)';

        createFromTemplateTabBtn.style.display = 'inline-flex'; 
        
        document.getElementById('create-work-tabs-nav').style.display = 'flex';// Şablon sekmesini geri getir
    }
});

    // Uygulamayı Başlatma
    firebase.initAuth(handleUserLogin, handleUserLogout);

});
