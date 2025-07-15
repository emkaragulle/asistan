// functions.js

// Gerekli servisleri, sabitleri ve YENİ modülleri import ediyoruz
import * as firebase from './firebase_service.js';
import * as UI from './ui_helpers.js';
import { createPomodoroService } from './pomodoro_service.js';
import { createMetronomeService } from './metronome_service.js';
import { createTunerService } from './tuner_service.js';
import { createChartsService } from './charts.js';
import { defaultBoxSettings, DEFAULT_MASTERY_THRESHOLD, BADGES } from './constants.js';
import * as UIRender from './ui_render.js';
import * as StudyLogic from './study_logic.js';


// --- GLOBAL DEĞİŞKENLER ve STATE ---
export let allData = { projects: {}, activeProject: null, earnedBadges: [], stats: { weeklyPoints: 0 } }; // stats eklendi
export let currentView = 'summary';
export let userId = null;
export let currentUser = null;
export let studySession = { isActive: false, cards: [], currentIndex: 0, project: null };
export let globalTemplates = [];
export let newWorkCards = [];
export let isEditMode = false;
export let currentEditingProjectName = null;
export let cardManagementSwiper = null;
let unsavedSeconds = 0;
let saveTimeout = null;
let dataVersion = 0;
let calculationCache = {};
let editingCardIndex = null;
export let activeCommentListener = null; 

export let currentOnboardingStep = 0;
export let projectSubView = 'cards';

// --- STATE GÜNCELLEME FONKSİYONLARI (SETTERS) ---
export function setCurrentView(view) { currentView = view; if (view !== 'project') { allData.activeProject = null; } }
export function setActiveProject(projectName) { allData.activeProject = projectName; currentView = 'project'; }
export function setStudySession(session) { studySession = session; }
export function getUnsavedSeconds() { return unsavedSeconds; }
export function resetUnsavedSeconds() { unsavedSeconds = 0; }
export function incrementDataVersion() { dataVersion++; }
export function incrementStudySessionIndex() { studySession.currentIndex++; }
export function setCardManagementSwiper(swiper) { cardManagementSwiper = swiper; }
export function setIsEditMode(mode) { isEditMode = mode; }
export function setCurrentEditingProjectName(name) { currentEditingProjectName = name; }
export function setNewWorkCards(cards) { newWorkCards = cards; }
export function setEditingCardIndex(index) { editingCardIndex = index; }
export function removeCardFromNewWorkList(index) { if (index >= 0 && index < newWorkCards.length) { newWorkCards.splice(index, 1); } }
export function setProjectSubView(view) { projectSubView = view; } // YENİ



// --- ONBOARDING (REHBER) İÇERİĞİ ---
export const ONBOARDING_STEPS = [
    { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`, title: 'Çalışma Asistanı\'na Hoş Geldin!', text: 'Bu asistan, pratik yapmak istediğin eserleri küçük ve yönetilebilir parçalara ayırarak öğrenme sürecini kolaylaştırmak için tasarlandı.' },
    { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>`, title: '1. Eserlerini ve Kartlarını Oluştur', text: 'Önce "Yeni Eser Oluştur" ile bir çalışma alanı yarat. Sonra bu esere, çalışmak istediğin her bir pasaj veya bölüm için "Kartlar" ekle.' },
    { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695v-2.695A8.25 8.25 0 005.68 9.348v2.695m0 0h4.992" /></svg>`, title: '2. Akıllı Tekrarla Ustalaş', text: '"Tümünü Çalış" butonuyla akıllı tekrar seansları başlat. Her kart, 6 adımlık bir ustalık yolculuğundan geçerek kalıcı öğrenmeyi sağlar.' },
    { icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.953 14.953 0 00-5.84-2.56m0 0a14.927 14.927 0 01-5.84 2.56m5.84-2.56V4.72a6 6 0 0112 0v2.65a6 6 0 01-5.84 7.38z" /></svg>`, title: 'Hazırsın!', text: 'Artık potansiyelini ortaya çıkarmaya hazırsın. Unutma, düzenli ve odaklanmış pratik her şeyin anahtarıdır. Başarılar!' }
];

// --- SERVİSLER ---
export let pomodoroService, metronomeService, tunerService, chartsService;

export function initializeServices(elements) {
    pomodoroService = createPomodoroService({
        pomodoroDisplay: elements.pomodoroDisplay,
        pomodoroToggleBtn: elements.pomodoroToggleBtn,
        studyControls: elements.studyControls,
        onTimeUpdate: handleTimeUpdate
    });
    metronomeService = createMetronomeService({
        bpmDisplay: elements.bpmDisplay,
        bpmSlider: elements.bpmSlider,
        startStopMetronomeBtn: elements.startStopMetronomeBtn,
        metronomeVisualizer: elements.metronomeVisualizer
    });
    tunerService = createTunerService({
        startTunerBtn: elements.startTunerBtn,
        tunerStartMessage: elements.tunerStartMessage,
        tunerDisplay: elements.tunerDisplay,
        noteDisplay: elements.noteDisplay,
        frequencyDisplay: elements.frequencyDisplay,
        tunerIndicator: elements.tunerIndicator
    });
    chartsService = createChartsService();

    window.endStudySession = StudyLogic.endStudySession;
    window.stopMetronome = metronomeService.stop;
    window.stopTuner = tunerService.stop;
}

// --- ANA KONTROL FONKSİYONLARI ---

export async function handleUserLogin(user) {
    userId = user.uid;
    currentUser = user;

    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-app-container').classList.remove('hidden');

    const userData = await firebase.loadUserData(user.uid);
    let isNewUser = false;

    if (userData) {
        allData = userData;
        if (!allData.projects) allData.projects = {};
        if (!allData.earnedBadges) allData.earnedBadges = [];
        if (allData.dailyGoalInMinutes === undefined) allData.dailyGoalInMinutes = 120;
        if (!allData.practiceLog) allData.practiceLog = {};
        if (allData.hasCompletedOnboarding === undefined) allData.hasCompletedOnboarding = false;
        // YENİ: Stats verisi yoksa başlat
        if (!allData.stats) allData.stats = { weeklyPoints: 0 };

    } else {
        isNewUser = true;
        allData = {
            projects: {}, activeProject: null, earnedBadges: [],
            subscriptionTier: 'free', dailyGoalInMinutes: 120,
            practiceLog: {}, hasCompletedOnboarding: false,
            stats: { weeklyPoints: 0, currentWeek: getWeekId(new Date()) } // YENİ: Stats verisi eklendi
        };
        await firebase.saveUserData(user.uid, allData);
    }
    
    // YENİ: Uygulama her açıldığında haftalık durumu kontrol et
    checkAndResetWeeklyStats();

    setCurrentView('summary');
    
    await checkAndAwardBadges();
    UIRender.renderUI();

    firebase.listenForGlobalTemplates((templates) => {
        globalTemplates = templates;
        const createWorkModal = document.getElementById('create-work-modal');
        if (createWorkModal && !createWorkModal.classList.contains('hidden')) {
             const createFromTemplatePanel = document.getElementById('create-from-template-panel');
            if (createFromTemplatePanel && !createFromTemplatePanel.classList.contains('hidden')) {
                 UIRender.renderTemplateListForCreateModal();
            }
        }
    });

    if (isNewUser || !allData.hasCompletedOnboarding) {
        setTimeout(() => { startOnboarding(); }, 500);
    }
}

export function handleUserLogout() {
    userId = null;
    currentUser = null;
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('main-app-container').classList.add('hidden');
    allData = { projects: {}, activeProject: null, earnedBadges: [], stats: { weeklyPoints: 0 } };
    setCurrentView('summary');
}

export function requestSaveData() {
    if (saveTimeout) { clearTimeout(saveTimeout); }
    saveTimeout = setTimeout(async () => {
        if (!userId) return;
        try {
            console.log("Değişiklikler kaydediliyor...");
            await firebase.saveUserData(userId, allData);
            console.log("Değişiklikler başarıyla kaydedildi.");
        } catch (error) {
            console.error("Otomatik kaydetme sırasında hata:", error);
        }
    }, 2500);
}


// functions.js

// ... (requestSaveData fonksiyonundan sonra)

/**
 * Belirli bir projenin zaman içindeki ilerleme geçmişini hesaplar ve grafik için veri döndürür.
 * @param {object} project - İlerleme geçmişi hesaplanacak proje nesnesi.
 * @returns {Array<{x: Date, y: number}>} Chart.js için formatlanmış veri dizisi.
 */
export function getProjectProgressHistory(project) {
    const sections = (project.sections || []).filter(s => s.lastMoved);
    if (sections.length === 0) {
        return [];
    }

    // Kartları son hareket tarihine göre sırala
    sections.sort((a, b) => new Date(a.lastMoved) - new Date(b.lastMoved));

    const dataPoints = [];
    const tempProject = JSON.parse(JSON.stringify(project));
    tempProject.sections = []; // Başlangıçta boş

    // Bu fonksiyon sadece bu kapsamda kullanılacak bir yardımcıdır.
    const calculateProgress = (proj) => {
        const secs = proj.sections || [];
        const totalCards = secs.length;
        if (totalCards === 0) return 0;

        const boxDefs = proj.boxDefinitions || defaultBoxSettings;
        const masteryThreshold = proj.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const totalBoxes = boxDefs.length;

        const totalProgressScore = secs.reduce((sum, card) => {
            const currentBox = card.box || 1;
            const successCount = card.successCount || 0;
            if (currentBox >= totalBoxes && successCount >= masteryThreshold) return sum + 1.0;
            const boxBaseProgress = (currentBox - 1) / totalBoxes;
            const inBoxProgress = (successCount / masteryThreshold) / totalBoxes;
            return sum + Math.min(boxBaseProgress + inBoxProgress, 1.0);
        }, 0);
        
        return (totalProgressScore / totalCards) * 100;
    };

    // Her kartın durumuna göre ilerlemeyi zaman içinde yeniden hesapla
    for (const section of sections) {
        const existingIndex = tempProject.sections.findIndex(s => s.id === section.id);
        if (existingIndex > -1) {
            tempProject.sections[existingIndex] = section;
        } else {
            tempProject.sections.push(section);
        }
        
        dataPoints.push({
            x: new Date(section.lastMoved),
            y: calculateProgress(tempProject)
        });
    }

    return dataPoints;
}


// --- (YENİ EKLENEN PUAN SİSTEMİ FONKSİYONLARI ve dosyanın geri kalanı aynı kalacak) ---
export function calculateProjectProgress(project) {
    const sections = project.sections || [];
    const totalCards = sections.length;
    if (totalCards === 0) return 0;

    let totalProgressScore = 0;
    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const totalBoxes = boxDefs.length;

    const progressPerCard = sections.map(card => {
        const currentBox = card.box || 1;
        const successCount = card.successCount || 0;
        if (currentBox >= totalBoxes && successCount >= masteryThreshold) return 1.0;
        const boxBaseProgress = (currentBox - 1) / totalBoxes;
        const inBoxProgress = (successCount / masteryThreshold) / totalBoxes;
        return Math.min(boxBaseProgress + inBoxProgress, 1.0); // %100'ü geçmesin
    });
    totalProgressScore = progressPerCard.reduce((sum, current) => sum + current, 0);

    return (totalProgressScore / totalCards) * 100;
}
// --- YENİ EKLENEN PUAN SİSTEMİ FONKSİYONLARI ---

/**
 * Verilen bir tarihin hangi haftaya ait olduğunu belirten bir kimlik string'i döndürür.
 * @param {Date} date - Tarih nesnesi.
 * @returns {string} "YIL-WHAFTA_NUMARASI" formatında bir string (örn: "2025-W29").
 */
function getWeekId(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Haftanın ilk gününü Pazartesi olarak ayarla
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Yılın ilk gününü bul
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Haftanın numarasını hesapla
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Haftalık istatistikleri kontrol eder ve gerekirse sıfırlar.
 */
export function checkAndResetWeeklyStats() {
    if (!allData.stats) {
        allData.stats = { weeklyPoints: 0, currentWeek: getWeekId(new Date()) };
        return;
    }
    
    const currentWeekId = getWeekId(new Date());
    if (allData.stats.currentWeek !== currentWeekId) {
        console.log(`Yeni hafta başladı! Önceki hafta (${allData.stats.currentWeek}) puanı: ${allData.stats.weeklyPoints}`);
        allData.stats.lastWeekPoints = allData.stats.weeklyPoints; // Eski puanı sakla (isteğe bağlı)
        allData.stats.weeklyPoints = 0; // Puanı sıfırla
        allData.stats.currentWeek = currentWeekId; // Yeni haftayı kaydet
        UI.showInfoModal("🎉 Yeni Hafta Başladı!", "Yeni haftalık puan hedefine ulaşmak için harika bir başlangıç yap.");
    }
}

/**
 * Kullanıcıya belirtilen miktarda puan verir.
 * @param {number} points - Kazanılan puan.
 * @param {string} reason - Puanın kazanılma sebebi (loglama için).
 */
export function awardPoints(points, reason) {
    checkAndResetWeeklyStats(); // Puan vermeden önce haftanın güncel olduğundan emin ol
    if (!allData.stats.weeklyPoints) {
        allData.stats.weeklyPoints = 0;
    }
    allData.stats.weeklyPoints += points;
    console.log(`Puan kazanıldı: +${points} (${reason}) | Toplam: ${allData.stats.weeklyPoints}`);
}

// --- YARDIMCI VE HESAPLAMA FONKSİYONLARI ---

export function getCardEffectiveTempos(card, project) {
    if (!project) { return { base: card.baseTempo || null, target: card.targetTempo || null }; }
    return {
        base: card.baseTempo !== null && card.baseTempo !== undefined ? card.baseTempo : project.baseTempo,
        target: card.targetTempo !== null && card.targetTempo !== undefined ? card.targetTempo : project.targetTempo,
    };
}

export function handleTimeUpdate(seconds) {
    unsavedSeconds += seconds;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (!allData.practiceLog) allData.practiceLog = {};
    if (!allData.practiceLog[today]) allData.practiceLog[today] = 0;
    allData.practiceLog[today] += seconds;
}

export function calculateStreak(data) {
    const practiceDays = new Set(Object.keys(data.practiceLog || {}));
    if (practiceDays.size === 0) return { current: 0, yesterdayWasMissed: true };
    const toLocalISOString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const todayStr = toLocalISOString(today);
    const yesterdayStr = toLocalISOString(yesterday);
    let currentDate = new Date();
    if (!practiceDays.has(todayStr) && practiceDays.has(yesterdayStr)) {
        currentDate.setDate(currentDate.getDate() - 1);
    } else if (!practiceDays.has(todayStr) && !practiceDays.has(yesterdayStr)) {
        return { current: 0, yesterdayWasMissed: true };
    }
    while (practiceDays.has(toLocalISOString(currentDate))) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return { current: streak, yesterdayWasMissed: !practiceDays.has(todayStr) };
}

export async function checkAndAwardBadges() {
    if (!allData.earnedBadges) allData.earnedBadges = [];
    let newBadgeEarned = false;
    for (const badge of BADGES) {
        if (!allData.earnedBadges.includes(badge.slug) && badge.condition(allData, calculateStreak)) {
            allData.earnedBadges.push(badge.slug);
            newBadgeEarned = true;
            UI.showInfoModal(`🎉 Yeni Rozet Kazandın: ${badge.name}`, 'success');
        }
    }
    if (newBadgeEarned) {
        await firebase.saveUserData(userId, allData);
        if(currentView === 'achievements') { UIRender.renderAchievementsPage(); }
    }
}

export function getActiveLearningCards() {
    if (calculationCache.activeCards && calculationCache.version === dataVersion) { return calculationCache.activeCards; }
    const activeCards = [];
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
    calculationCache.activeCards = activeCards;
    calculationCache.version = dataVersion;
    return activeCards;
}

// functions.js dosyasında bu fonksiyonu bulun ve değiştirin

export function getSmartSuggestion() {
    const promotionCandidates = getPromotionCandidateCards(10);
    const rustyCards = getRustyCards(7, 10);
    const activeLearningCards = getActiveLearningCards(); 
    const hardestCards = getHardestCards(10);
    const availableSuggestions = [];

    const performanceCards = [];
    Object.entries(allData.projects || {}).forEach(([projectName, project]) => {
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
        (project.sections || []).forEach(section => {
            if (section.box === 9 && !(section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold)) {
                performanceCards.push({ ...section, projectName: projectName });
            }
        });
    });

    if (performanceCards.length > 0) {
        const uniqueProjectsInRehearsal = new Set(performanceCards.map(c => c.projectName));
        availableSuggestions.push({
            text: `🏆 <strong class="text-indigo-500">Genel Prova</strong> zamanı! Final aşamasındaki <strong class="text-indigo-500">${uniqueProjectsInRehearsal.size} eserini</strong> çalarak konser pratiği yap.`,
            action: () => StudyLogic.startStudySession(performanceCards),
            buttonText: "Provayı Başlat"
        });
    }

    if (promotionCandidates.length > 0) availableSuggestions.push({ text: `🚀 Yükselmeye çok yakın <strong class="text-indigo-500">${promotionCandidates.length} kartın</strong> var. Onları tamamlamaya ne dersin?`, action: () => StudyLogic.startStudySession(promotionCandidates), buttonText: "Hemen Çalış" });
    if (rustyCards.length > 0) availableSuggestions.push({ text: `🧠 Tekrar zamanı gelmiş <strong class="text-indigo-500">${rustyCards.length} paslanmış kartını</strong> hatırlayalım mı?`, action: () => StudyLogic.startStudySession(rustyCards), buttonText: "Tekrar Et" });
    if (activeLearningCards.length > 0) availableSuggestions.push({ text: `🗺️ <strong class="text-indigo-500">Ustalık Yolculuğu</strong>'na çıkarak farklı eserlerdeki benzer becerileri pekiştir.`, action: () => { setCurrentView('mastery-journey'); UIRender.renderUI(); }, buttonText: "Yolculuğa Başla" });
    if (hardestCards.length > 0) availableSuggestions.push({ text: `💪 En çok zorlandığın <strong class="text-indigo-500">${hardestCards.length} kartın</strong> üzerine gitmeye ne dersin?`, action: () => StudyLogic.startStudySession(hardestCards), buttonText: "Zorluklarla Yüzleş" });

    // --- YENİ EKLENEN BLOK BAŞLANGICI ---
    // Etikete dayalı akıllı öneri ekleme
    const allTags = getAllUniqueTags();
    if (allTags.length > 0) {
        // Rastgele bir etiket seç
        const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
        const cardsForTag = getCardsByTags([randomTag]);
        
        // Eğer bu etikete sahip kartlar varsa, öneriyi oluştur
        if (cardsForTag.length > 0) {
            availableSuggestions.push({
                text: `💪 Bugün <strong class="text-indigo-500">${randomTag}</strong> becerini geliştirmeye ne dersin? Haydi başlayalım!`,
                action: () => StudyLogic.startStudySession(cardsForTag),
                buttonText: "Beceriyi Geliştir"
            });
        }
    }
    // --- YENİ EKLENEN BLOK SONU ---


    if (availableSuggestions.length > 0) { return availableSuggestions[Math.floor(Math.random() * availableSuggestions.length)]; }
    
    return { text: "Bugün ne üzerinde çalışmak istersin?", action: () => { document.getElementById('open-create-work-modal-btn').click(); }, buttonText: "Yeni Eser Oluştur" };
}

export async function checkAndLogMastery(projectName) {
    const project = allData.projects[projectName];
    if (!project) return;
    const sections = project.sections || [];
    if (sections.length === 0) return;

    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
    const allCardsLearned = sections.every(s => s.box === maxBoxNumber && (s.successCount || 0) >= masteryThreshold);

    if (allCardsLearned) {
        if (!allData.masteredProjectsLog) allData.masteredProjectsLog = [];
        const isAlreadyLogged = allData.masteredProjectsLog.some(log => log.name === projectName);
        if (!isAlreadyLogged) {
            allData.masteredProjectsLog.push({ name: projectName, date: new Date().toISOString() });
            // YENİ: Eser ustalaşılınca puan ver
            awardPoints(50, `${projectName} eserinde ustalaşıldı`);
            UI.showInfoModal(`🏆 Tebrikler! '${projectName}' eseri artık kalıcı Ustalaşılan Eserler Kütüphanenize eklendi. (+50 Puan)`, 'success');
        }
    }
}

// --- ONBOARDING (REHBER) FONKSİYONLARI ---

export function startOnboarding() {
    currentOnboardingStep = 0;
    UIRender.renderOnboardingStep();
    UI.showModal('onboarding-modal');
}

export function goToNextOnboardingStep() {
    if (currentOnboardingStep < ONBOARDING_STEPS.length - 1) {
        currentOnboardingStep++;
        UIRender.renderOnboardingStep();
    }
}

export function goToPreviousOnboardingStep() {
    if (currentOnboardingStep > 0) {
        currentOnboardingStep--;
        UIRender.renderOnboardingStep();
    }
}

export async function completeOnboarding() {
    UI.closeModal('onboarding-modal');
    if (allData) {
        allData.hasCompletedOnboarding = true;
        await firebase.saveUserData(userId, allData);
    }
}

// --- MODAL VE FORM YÖNETİMİ ---

export function switchCreateTab(tab) {
    const isBlank = tab === 'blank';
    document.getElementById('create-blank-panel').classList.toggle('hidden', !isBlank);
    document.getElementById('create-from-template-panel').classList.toggle('hidden', isBlank);
    document.getElementById('create-blank-tab-btn').classList.toggle('border-indigo-500', isBlank);
    document.getElementById('create-blank-tab-btn').classList.toggle('text-indigo-600', isBlank);
    document.getElementById('create-from-template-tab-btn').classList.toggle('border-indigo-500', !isBlank);
    document.getElementById('create-from-template-tab-btn').classList.toggle('text-indigo-600', !isBlank);
}

export function resetCardForm() {
    document.getElementById('new-card-name').value = '';
    document.getElementById('new-card-desc').value = '';
    document.getElementById('new-work-base-tempo-input').value = '';
    document.getElementById('new-work-target-tempo-input').value = '';
    document.getElementById('new-work-tags-input').value = ''; // Bu satır etiketi de sıfırlar
    setEditingCardIndex(null);
    document.getElementById('add-card-to-list-btn').textContent = 'Kartı Listeye Ekle';
    const existingCancelBtn = document.getElementById('cancel-card-edit-btn');
    if (existingCancelBtn) existingCancelBtn.remove();
    document.getElementById('new-card-name').focus();
}

// --- ÖZEL SEANS KART GETİRME FONKSİYONLARI ---
export function getRustyCards(days, limit, projectName = 'all') {
    let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>(project.sections || []).map(s => ({ ...s, projectName: projName })));
    if (projectName !== 'all') allCards = allCards.filter(card => card.projectName === projectName);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);
    return allCards.filter(card => !card.lastMoved || new Date(card.lastMoved) < thresholdDate).sort(() => 0.5 - Math.random()).slice(0, limit);
}

export function getHardestCards(limit, projectName = 'all') {
    let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>(project.sections || []).map(s => ({ ...s, projectName: projName })));
    if (projectName !== 'all') allCards = allCards.filter(card => card.projectName === projectName);
    return allCards.filter(card => (card.incorrectCount || 0) > 0).sort((a, b) => (b.incorrectCount || 0) - (a.incorrectCount || 0)).slice(0, limit);
}

export function getRandomCards(limit, projectName = 'all') {
    let allCards = Object.entries(allData.projects).flatMap(([projName, project]) =>(project.sections || []).map(s => ({ ...s, projectName: projName })));
    if (projectName !== 'all') allCards = allCards.filter(card => card.projectName === projectName);
    return allCards.sort(() => 0.5 - Math.random()).slice(0, limit);
}

export function getPromotionCandidateCards(limit, projectName = 'all') {
    let allCards = [];
    Object.entries(allData.projects).forEach(([projName, project]) => {
        if (projectName !== 'all' && projName !== projectName) return;
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

// functions.js dosyasının sonuna ekleyin

/**
 * Tüm projelerdeki tüm kartlardan benzersiz (unique) etiketlerin bir listesini oluşturur.
 * @returns {Array<string>} Sıralanmış etiket dizisi.
 */
export function getAllUniqueTags() {
    const allTags = new Set();
    Object.values(allData.projects || {}).forEach(project => {
        (project.sections || []).forEach(section => {
            (section.tags || []).forEach(tag => {
                allTags.add(tag);
            });
        });
    });
    return Array.from(allTags).sort();
}

/**
 * Verilen etiketlerin TÜMÜNÜ içeren kartları bulur.
 * @param {Array<string>} selectedTags Filtrelenecek etiketler.
 * @returns {Array<object>} Eşleşen kartların bir dizisi.
 */
export function getCardsByTags(selectedTags) {
    if (!selectedTags || selectedTags.length === 0) return [];
    
    const matchingCards = [];
    Object.entries(allData.projects || {}).forEach(([projectName, project]) => {
        (project.sections || []).forEach(section => {
            const cardTags = new Set(section.tags || []);
            // Seçilen her etiketin, kartın etiketleri arasında olup olmadığını kontrol et
            const hasAllTags = selectedTags.every(tag => cardTags.has(tag));
            if (hasAllTags) {
                matchingCards.push({ ...section, projectName: projectName });
            }
        });
    });
    return matchingCards;
}