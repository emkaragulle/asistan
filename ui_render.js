// ui_render.js

import * as funcs from './functions.js';
import * as UI from './ui_helpers.js';
import { defaultBoxSettings, DEFAULT_MASTERY_THRESHOLD, BADGES } from './constants.js';

/**
 * Mevcut duruma göre ilgili arayüzü çizen ana render fonksiyonu.
 */
export function renderUI() {
    renderSidebar();
    updateSidebarActiveState();
    updateBottomNavActiveState();

    const mobileUserPhoto = document.getElementById('mobile-nav-user-photo');
    if (mobileUserPhoto && funcs.currentUser) {
        mobileUserPhoto.src = funcs.currentUser.photoURL;
    }

    const containerMapping = {
        'main-dashboard-container': document.getElementById('main-dashboard-container'),
        'project-container': document.getElementById('project-container'),
        'reports-and-sessions-container': document.getElementById('reports-and-sessions-container'),
        'achievements-container': document.getElementById('achievements-container'),
        'statistics-container': document.getElementById('statistics-container'),
        'all-projects-container': document.getElementById('all-projects-container'),
        'more-view-container': document.getElementById('more-view-container'),
        'rehearsal-page-container': document.getElementById('rehearsal-page-container')
    };

    Object.values(containerMapping).forEach(c => {
        if (c) {
            c.classList.add('hidden');
            c.classList.remove('fade-in');
        }
    });

    let viewToRender = funcs.currentView;
    if (funcs.currentView === 'project' && !funcs.allData.activeProject) {
        viewToRender = 'summary';
    }

    const showAndAnimate = (container, renderFunc) => {
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('fade-in');
            if (renderFunc) {
                renderFunc();
            }
        }
    };
    
    const renderFunctionMapping = {
        'summary': () => showAndAnimate(containerMapping['main-dashboard-container'], renderMainDashboard),
        'mastery-journey': () => showAndAnimate(containerMapping['main-dashboard-container'], renderMasteryJourneyPage),
        'project': () => showAndAnimate(containerMapping['project-container'], renderProjectView),
        'reports-and-sessions': () => showAndAnimate(containerMapping['reports-and-sessions-container'], renderReportsAndSessionsPage),
        'achievements': () => showAndAnimate(containerMapping['achievements-container'], renderAchievementsPage),
        'statistics': () => showAndAnimate(containerMapping['statistics-container'], () => funcs.chartsService.renderStatisticsPage(containerMapping['statistics-container'], funcs.allData, defaultBoxSettings)),
        'more': () => showAndAnimate(containerMapping['more-view-container'], renderMoreView),
        'all-projects': () => showAndAnimate(containerMapping['all-projects-container'], renderAllProjectsPage),
        'rehearsal': () => showAndAnimate(containerMapping['rehearsal-page-container'], renderRehearsalPage)
    };

    if (renderFunctionMapping[viewToRender]) {
        renderFunctionMapping[viewToRender]();
    } else {
        funcs.setCurrentView('summary');
        renderUI();
    }
}

/**
 * Kenar çubuğunu (sidebar) ve proje listesini çizer.
 */
export function renderSidebar() {
    const sidebarProjectList = document.getElementById('sidebar-project-list');
    sidebarProjectList.innerHTML = '';
    const sortedProjects = Object.keys(funcs.allData.projects || {}).sort((a, b) => a.localeCompare(b));
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

    if(funcs.currentUser) {
        const adminUID = "tp7u9wMMn1gIVBM8mClmzWSptX43";
        document.getElementById('user-panel').classList.remove('hidden');
        document.getElementById('user-name').textContent = funcs.currentUser.displayName;
        document.getElementById('user-photo').src = funcs.currentUser.photoURL;
        document.getElementById('go-to-admin-btn').classList.toggle('hidden', funcs.userId !== adminUID);
    } else {
        document.getElementById('user-panel').classList.add('hidden');
    }
}

/**
 * Kenar çubuğundaki aktif görünümün linkini günceller.
 */
export function updateSidebarActiveState() {
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.project-link').forEach(link => {
        link.classList.remove('active'); link.classList.remove('opacity-60');
    });
    const linkMapping = {
        summary: document.getElementById('show-summary-view-btn'),
        'mastery-journey': document.getElementById('show-mastery-journey-btn'),
        'reports-and-sessions': document.getElementById('show-reports-and-sessions-btn'),
        achievements: document.getElementById('show-achievements-btn'),
        statistics: document.getElementById('show-statistics-btn')
    };
    if (linkMapping[funcs.currentView]) {
        linkMapping[funcs.currentView].classList.add('active');
        document.querySelectorAll('.project-link').forEach(link => link.classList.add('opacity-60'));
    } else if (funcs.currentView === 'project' && funcs.allData.activeProject) {
        const activeLink = document.querySelector(`.project-link[data-project-name="${funcs.allData.activeProject}"]`);
        if(activeLink) activeLink.classList.add('active');
    }
}

/**
 * Mobil alt navigasyon menüsündeki aktif ikonun durumunu günceller.
 */
export function updateBottomNavActiveState() {
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    if (!mobileBottomNav) return;
    mobileBottomNav.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });

    const mobileUserPhoto = document.getElementById('mobile-nav-user-photo');
    if(mobileUserPhoto) mobileUserPhoto.classList.remove('active-nav-photo');

    const activeLink = mobileBottomNav.querySelector(`.mobile-nav-link[data-view="${funcs.currentView}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        if(funcs.currentView === 'more' && mobileUserPhoto) {
            mobileUserPhoto.classList.add('active-nav-photo');
        }
    }
}

/**
 * Ana gösterge panelini (dashboard) çizer.
 */
export function renderMainDashboard() {
    // YENİ: UI çizilmeden önce haftalık durumu kontrol et
    funcs.checkAndResetWeeklyStats();

    const mainDashboardContainer = document.getElementById('main-dashboard-container');
    if (!mainDashboardContainer) return;

    const newDashboardHTML = `
        <div class="max-w-7xl mx-auto w-full space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div id="dashboard-welcome-card" class="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"></div>
                <div id="daily-summary-card" class="bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"></div>
            </div>
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Eserlerim</h3>
                    <a href="#" id="view-all-projects-btn" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">Tümünü Gör &rarr;</a>
                </div>
                <div id="dashboard-projects-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
            </div>
        </div>`;
    mainDashboardContainer.innerHTML = newDashboardHTML;

    const welcomeCard = document.getElementById('dashboard-welcome-card');
    const summaryCard = document.getElementById('daily-summary-card');
    const userName = funcs.currentUser ? funcs.currentUser.displayName.split(' ')[0] : 'Müzisyen';
    const suggestion = funcs.getSmartSuggestion();

    welcomeCard.innerHTML = `
        <div>
            <h2 class="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">Merhaba ${userName},</h2>
            <p class="mt-1 text-base md:text-lg text-slate-600 dark:text-slate-400">${suggestion.text}</p>
        </div>
        <div class="mt-4 lg:mt-6">
            <button id="welcome-action-btn" class="btn btn-primary w-full sm:w-auto">${suggestion.buttonText}</button>
        </div>`;
    document.getElementById('welcome-action-btn').onclick = suggestion.action;
    
    const streakData = funcs.calculateStreak(funcs.allData);
    const dailyGoal = funcs.allData.dailyGoalInMinutes || 120;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const secondsPracticed = funcs.allData.practiceLog ? (funcs.allData.practiceLog[todayStr] || 0) : 0;
    const minutesPracticed = Math.floor(secondsPracticed / 60);
    const timePercentage = dailyGoal > 0 ? Math.min((minutesPracticed / dailyGoal) * 100, 100) : 0;
    
    // YENİ: Haftalık puanı al
    const weeklyPoints = funcs.allData.stats?.weeklyPoints || 0;
    
    // GÜNCELLENMİŞ ÖZET KARTI HTML'i
    summaryCard.innerHTML = `
        <h3 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Haftalık Özet</h3>
        <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-3"><span class="text-3xl">🔥</span><div><div class="text-lg font-bold text-slate-800 dark:text-slate-100">${streakData.current} Gün</div><div class="text-xs md:text-sm text-slate-500 dark:text-slate-400">Pratik Zinciri</div></div></div>
                <div class="flex items-center gap-3"><span class="text-3xl">🏆</span><div><div class="text-lg font-bold text-slate-800 dark:text-slate-100">${weeklyPoints} Puan</div><div class="text-xs md:text-sm text-slate-500 dark:text-slate-400">Bu Haftaki Puan</div></div></div>
            </div>
            <div>
                <div class="flex justify-between text-xs md:text-sm font-medium mb-1">
                    <span class="text-slate-600 dark:text-slate-300">Günlük Pratik Hedefi</span>
                    <span class="text-slate-800 dark:text-slate-100">${minutesPracticed} / ${dailyGoal} dk</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div class="bg-indigo-500 h-2.5 rounded-full" style="width: ${timePercentage}%;"></div>
                </div>
            </div>
        </div>`;

    const projectsListEl = document.getElementById('dashboard-projects-list');
    const projectsWithDates = Object.entries(funcs.allData.projects || {}).map(([projectName, project]) => ({ projectName, project, lastMoved: Math.max(0, ...(project.sections || []).map(s => s.lastMoved ? new Date(s.lastMoved).getTime() : 0)) }));
    const sortedProjects = projectsWithDates.sort((a, b) => b.lastMoved - a.lastMoved);
    const limitedProjects = sortedProjects.slice(0, 6);

    if (limitedProjects.length > 0) {
        projectsListEl.innerHTML = limitedProjects.map(({ projectName, project }) => createProjectCardHTML(projectName, project)).join('');
        projectsListEl.querySelectorAll('.project-card').forEach(card => { 
            card.onclick = () => { 
                funcs.setActiveProject(card.dataset.projectName);
                renderUI(); 
            }; 
        });
    } else {
        projectsListEl.innerHTML = `
            <div class="col-span-full text-center bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8">
                <div class="mx-auto w-16 h-16 text-indigo-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></div>
                <h4 class="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">İlk Çalışma Alanını Oluştur</h4>
                <p class="mt-2 text-slate-500 dark:text-slate-400">Pratiğe başlamak için ilk eserini ekle.</p>
                <button id="dashboard-add-project-btn" class="btn btn-primary mt-6">Yeni Eser Oluştur</button>
            </div>`;
        document.getElementById('dashboard-add-project-btn').onclick = () => document.getElementById('open-create-work-modal-btn').click();
    }
    document.getElementById('view-all-projects-btn').onclick = (e) => { e.preventDefault(); funcs.setCurrentView('all-projects'); renderUI(); };
}

/**
 * Bir proje kartının HTML içeriğini oluşturur.
 */
export function createProjectCardHTML(projectName, project) {
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
            if (currentBox >= totalBoxes && successCount >= masteryThreshold) return 1.0;
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
        </div>`;
}




// ui_render.js

// ... (dosyanın başındaki importlar ve diğer fonksiyonlar aynı)

function renderProjectReportsView(project) {
    const container = document.getElementById('project-reports-view');
    if (!container) return;

    const projectName = Object.keys(funcs.allData.projects).find(name => funcs.allData.projects[name] === project);
    const hardestCards = funcs.getHardestCards(5, projectName);

    const hardestCardsHTML = hardestCards.length > 0
        ? hardestCards.map(card => `
            <div class="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span class="font-semibold text-slate-700 dark:text-slate-200">${card.name}</span>
                <span class="text-sm font-bold text-rose-500">${card.incorrectCount || 0} Hata</span>
            </div>
        `).join('')
        : '<p class="text-center text-slate-500 dark:text-slate-400 p-4">Bu eserde hiç hatalı tekrarınız yok. Harika!</p>';

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">En Zorlu 5 Kart</h3>
                <div class="space-y-3">${hardestCardsHTML}</div>
            </div>
            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Eser İlerleme Grafiği</h3>
                <div class="relative h-64 w-full" id="project-progress-chart-container">
                    <canvas id="project-progress-chart"></canvas>
                </div>
            </div>
        </div>
    `;

    // --- GÜNCELLENMİŞ BÖLÜM ---
    // 1. Önce veriyi hesapla
    const historyData = funcs.getProjectProgressHistory(project);
    // 2. Hesaplanan veriyi grafik fonksiyonuna gönder
    funcs.chartsService.renderProjectProgressChart('project-progress-chart', historyData);
    // --- GÜNCELLEME SONU ---
}



// ui_render.js

// ... (dosyanın başındaki importlar ve diğer fonksiyonlar aynı kalacak) ...

// SADECE BU FONKSİYONU GÜNCELLEYİN
export function renderProjectView() {
    const activeProjectName = funcs.allData.activeProject;
    if (!activeProjectName) return;

    const project = funcs.allData.projects[activeProjectName];
    if (!project) return;

    // --- YENİDEN EKLENEN VE DÜZELTİLEN BÖLÜM BAŞLANGICI ---
    // Başlık, tempo ve aksiyon ikonlarını render et
    const activeProjectTitle = document.getElementById('active-project-title');
    activeProjectTitle.textContent = activeProjectName;

    const tempoInfoEl = document.getElementById('active-project-tempo-info');
    if (project && (project.baseTempo !== null && project.baseTempo !== undefined) && (project.targetTempo !== null && project.targetTempo !== undefined)) {
        tempoInfoEl.innerHTML = `<span class="text-xs sm:text-sm font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 px-3 py-1.5 rounded-full whitespace-nowrap">🎵 B: ${project.baseTempo} &rarr; H: ${project.targetTempo} BPM</span>`;
        tempoInfoEl.onclick = null;
    } else {
        tempoInfoEl.innerHTML = `<span class="text-xs sm:text-sm font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-200" title="Proje için başlangıç ve hedef tempo belirlemek için tıkla">⚠️ Tempo Belirtilmemiş</span>`;
        tempoInfoEl.onclick = () => document.getElementById('repetition-settings-btn').click();
    }
    
    document.getElementById('project-action-icons').classList.remove('hidden');

    const isTemplate = funcs.globalTemplates.some(category =>
        (category.works || []).some(work => work.name === activeProjectName && work.approved)
    );

    const actionIconsContainer = document.getElementById('project-action-icons');
    let commentsButtonHTML = '';
    if (isTemplate) {
        commentsButtonHTML = `
            <button id="view-template-comments-btn" class="btn-icon text-slate-500 hover:text-indigo-600" title="Topluluk İpuçlarını ve Yorumları Gör">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        `;
    }
    
    actionIconsContainer.innerHTML = `
        ${commentsButtonHTML}
        <button id="rename-project-btn" class="btn-icon text-slate-500 hover:text-indigo-600" title="Yeniden Adlandır">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
        </button>
        <button id="suggest-as-template-btn" class="btn-icon text-slate-500 hover:text-indigo-600" title="Şablon Olarak Öner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
        </button>
        <button id="repetition-settings-btn" class="btn-icon text-slate-500 hover:text-indigo-600" title="Tekrar Periyotları">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        <button id="delete-project-btn" class="btn-icon text-slate-500 hover:text-rose-600" title="Alanı Sil">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
    `;
    // --- DÜZELTME SONU ---


    // Sekme navigasyonunu render et
    const tabsNavContainer = document.getElementById('project-tabs-nav');
    const isCardsView = funcs.projectSubView === 'cards';
    const isReportsView = funcs.projectSubView === 'reports';

    tabsNavContainer.innerHTML = `
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button data-view="cards" class="project-tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isCardsView ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                Çalışma Kartları
            </button>
            <button data-view="reports" class="project-tab-btn whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${isReportsView ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
                Detaylı Raporlar
            </button>
        </nav>
    `;

    // Aktif sekmeye göre ilgili görünümü göster
    const cardsView = document.getElementById('card-management-view');
    const reportsView = document.getElementById('project-reports-view');

    if (isCardsView) {
        cardsView.classList.remove('hidden');
        reportsView.classList.add('hidden');
        renderCardManagementView();
    } else {
        cardsView.classList.add('hidden');
        reportsView.classList.remove('hidden');
        renderProjectReportsView(project);
    }
}


/**
 * Proje detay sayfasındaki kart yönetim arayüzünü (akordiyon menü) çizer.
 */
export function renderCardManagementView() {
    if(!funcs.allData.activeProject) return;
    const project = funcs.allData.projects[funcs.allData.activeProject];
    if (!project) {
        funcs.setCurrentView('summary');
        renderUI();
        return;
    }

    const accordionContainer = document.getElementById('leitner-boxes-mobile-accordion');
    if (!accordionContainer) return;
    
    const sections = project.sections || [];
    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;

    const studiableCards = sections.filter(s => {
        const isMastered = s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold;
        return !isMastered;
    });

    const interleavedSessionContainer = document.getElementById('interleaved-session-container');
    if (studiableCards.length > 0) {
        interleavedSessionContainer.classList.remove('hidden');
        
        interleavedSessionContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="text-center md:text-left">
                    <button id="start-interleaved-session-btn" class="btn btn-primary w-full">
                        <span>Harmanla Çalış</span>
                        <span class="text-xs opacity-80 ml-1.5">(${studiableCards.length} Kart)</span>
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">(Farklı seviyedeki kartlar karıştırılır)</p>
                </div>
                <div class="text-center md:text-left">
                    <button id="start-chaining-session-btn" class="btn btn-secondary w-full" ${sections.length < 2 ? 'disabled' : ''}>
                        <span>Geçişleri Çalış</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">(İki kart arasındaki bağlantıyı güçlendirir)</p>
                </div>
                <div class="text-center md:text-left">
                    <button id="start-sequential-session-btn" class="btn btn-secondary w-full">
                        <span>Sırayla Çalış</span>
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                         </svg>
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">(Eseri baştan sona akıcı bir şekilde çal)</p>
                </div>
            </div>`;
    } else {
        interleavedSessionContainer.classList.add('hidden');
    }
    
    const isProjectMastered = sections.length > 0 && sections.every(s => s.box === maxBoxNumber && (s.successCount || 0) >= masteryThreshold);
    const addCardButton = document.getElementById('open-add-card-modal-btn');

    if (isProjectMastered) {
        const completionDate = new Date(Math.max(...sections.map(s => s.lastMoved ? new Date(s.lastMoved).getTime() : 0)));
        const formattedDate = completionDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        accordionContainer.innerHTML = `
            <div class="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-center p-8 rounded-xl shadow-sm">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-2xl font-bold text-green-800 dark:text-green-200">Tebrikler, bu eserde ustalaştınız!</h3>
                <p class="text-green-700 dark:text-green-300 mt-2">Toplam ${sections.length} kartın tamamı öğrenildi.</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">Tamamlanma Tarihi: ${formattedDate}</p>
            </div>`;
        if(addCardButton) addCardButton.style.display = 'none';
        interleavedSessionContainer.classList.add('hidden');
    } else {
        if(addCardButton) addCardButton.style.display = '';

        if (funcs.cardManagementSwiper) {
            funcs.cardManagementSwiper.destroy(true, true);
            funcs.setCardManagementSwiper(null);
        }
        
        accordionContainer.innerHTML = '';
        boxDefs.forEach(boxDef => {
            const latestBoxDef = defaultBoxSettings.find(b => b.number === boxDef.number);
            const displayIcon = latestBoxDef ? latestBoxDef.icon : boxDef.icon;
            
            const cardsInBox = sections.filter(s => {
                if ((s.box || 1) !== boxDef.number) return false;
                if (s.box === maxBoxNumber && (s.successCount || 0) >= masteryThreshold) return false;
                return true;
            });

            let cardsHtml;
            let studyBoxButtonHtml = '';

            if (boxDef.number === 9) {
                const allCardsInRehearsalBox = sections.every(s => (s.box || 1) === 9);

                if (cardsInBox.length > 0) {
                     cardsHtml = `<div class="text-center p-4 border border-dashed rounded-md bg-slate-100 dark:bg-slate-700/50">
                                     <p class="font-semibold text-slate-700 dark:text-slate-200">Tüm Eser Tek Bir Parça</p>
                                     <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Bu aşama, öğrendiğin tüm pasajları birleştirerek eseri baştan sona, kesintisiz bir şekilde çalmaya odaklanır.</p>
                                  </div>`;

                    if (allCardsInRehearsalBox) {
                        studyBoxButtonHtml = `<div class="p-3 mb-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm"><button data-box-number="${boxDef.number}" class="study-box-btn btn btn-success w-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg><span>Performans Pratiği Başlat</span></button></div>`;
                    } else {
                        cardsHtml += `<div class="mt-3 text-center p-3 bg-amber-50 dark:bg-amber-500/10 rounded-md text-sm text-amber-700 dark:text-amber-300">Bu eserdeki tüm kartlar "Prova Sahnesi" (Kutu 9) aşamasına geldiğinde, performans pratiği burada aktif olacaktır.</div>`;
                    }
                } else {
                    cardsHtml = `<div class="text-center p-4 border border-dashed rounded-md"><p class="text-slate-500 dark:text-slate-400 font-medium">Bu aşamada hiç kartın yok.</p></div>`;
                }

            } else {
                 if (cardsInBox.length > 0) {
                    cardsHtml = cardsInBox.map(card => createCardElementForManagement(card, project).outerHTML).join('');
                    studyBoxButtonHtml = `<div class="p-3 mb-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm"><button data-box-number="${boxDef.number}" class="study-box-btn btn btn-primary w-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg><span>Bu Kutuyu Çalış</span></button></div>`;
                } else {
                    cardsHtml = `<div class="text-center p-4 border border-dashed rounded-md"><p class="text-slate-500 dark:text-slate-400 font-medium">Bu aşamada hiç kartın yok.</p><p class="text-sm text-slate-400 mt-1">Eserine yeni bir kart ekleyerek başlayabilirsin.</p><button data-action="add-card-in-empty-box" class="btn btn-secondary btn-sm mt-3 !py-1 !px-3">Yeni Kart Ekle</button></div>`;
                }
            }
            
            const accordionItem = document.createElement('div');
            accordionItem.className = `bg-white dark:bg-slate-800/60 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-md`;
            accordionItem.innerHTML = `
                <div class="accordion-header flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div class="flex-grow">
                        <h4 class="font-bold text-slate-700 dark:text-slate-200 flex items-center"><span class="text-xl mr-3">${displayIcon}</span><span>${boxDef.title}</span></h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400 ml-9">${boxDef.purpose}</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-semibold text-slate-600 dark:text-slate-300">${cardsInBox.length}</span>
                        <svg class="w-6 h-6 text-slate-400 transition-transform accordion-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                </div>
                <div class="accordion-content"><div class="p-4 border-t border-slate-200 bg-slate-50 dark:bg-slate-800/80">${studyBoxButtonHtml}<div class="space-y-3">${cardsHtml}</div></div></div>`;
            accordionContainer.appendChild(accordionItem);
        });
    }

    document.querySelectorAll('[data-action="add-card-in-empty-box"]').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('open-add-card-modal-btn').click();
        };
    });
}



export function createCardElementForManagement(section, project) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700';
    card.dataset.id = section.id;

    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const successCount = section.successCount || 0;
    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
    
    let masteryHtml = `<div class="text-xs font-semibold text-slate-500 dark:text-slate-400" title="Üst kutuya geçmek için gereken başarı sayısı">${successCount}/${masteryThreshold}</div>`;
    
    if (section.box >= maxBoxNumber && successCount >= masteryThreshold) {
        masteryHtml = `<div class="flex items-center gap-1 text-green-600 dark:text-green-300 font-semibold" title="Bu pasajda ustalaşıldı!"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg><span>Usta</span></div>`;
    }

    const tagsHTML = (section.tags && section.tags.length > 0)
        ? `<div class="mt-2 flex flex-wrap gap-1.5">
              ${section.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
           </div>`
        : '';

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-grow pr-2">
                <h5 class="font-bold text-slate-800 dark:text-slate-100">${section.name || 'Başlıksız Kart'}</h5>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">${section.description || ''}</p>
                ${tagsHTML}
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

/**
 * Raporlar ve Seanslar sayfasını çizer.
 */
export function renderReportsAndSessionsPage() {
    const reportsAndSessionsContainer = document.getElementById('reports-and-sessions-container');
    if (!reportsAndSessionsContainer) return;

    const projectNames = Object.keys(funcs.allData.projects || {});
    const allTags = funcs.getAllUniqueTags();

    const createRecipeCard = (id, icon, title, description) => `
        <div class="recipe-card p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex flex-col justify-between">
            <div class="flex-grow">
                <div class="flex items-center gap-3 mb-2"><span class="text-2xl">${icon}</span><h4 class="font-bold text-slate-800 dark:text-slate-100 text-lg">${title}</h4></div>
                <p class="text-slate-500 dark:text-slate-400 mt-1 text-sm leading-relaxed">${description}</p>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-2 items-center">
                <select class="form-select !py-2 text-sm w-full sm:w-auto flex-grow" id="filter-${id}-project" ${projectNames.length === 0 ? 'disabled' : ''}>
                    <option value="all">Tüm Eserler</option>
                    ${projectNames.map(name => `<option value="${name}">${name}</option>`).join('')}
                </select>
                <button id="start-${id}-session" class="btn btn-primary flex-shrink-0 w-full sm:w-auto">Başlat</button>
            </div>
        </div>`;

    const playlistBuilderHTML = `
        <div class="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <div class="flex items-center gap-3 mb-2"><span class="text-2xl">🎶</span><h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">Akıllı Çalma Listesi</h3></div>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Aşağıdaki etiketlerden bir veya daha fazlasını seçerek belirli becerilere odaklanmış kişisel bir çalışma seansı oluştur.</p>
            
            ${allTags.length > 0 ? `
                <div id="playlist-tags-container" class="flex flex-wrap gap-2 py-4 border-t border-b dark:border-slate-700">
                    ${allTags.map(tag => `<button class="tag-filter-btn tag">#${tag}</button>`).join('')}
                </div>
                <div class="mt-4 flex justify-start">
                    <button id="start-playlist-session-btn" class="btn btn-primary" disabled>Seçili Etiketlerle Çalış</button>
                </div>
            ` : `
                <div class="text-center py-8 border-t border-b dark:border-slate-700">
                    <p class="text-slate-500 dark:text-slate-400">Çalma listesi oluşturmak için önce kartlarınıza etiketler eklemelisiniz.</p>
                </div>
            `}
        </div>
    `;

    reportsAndSessionsContainer.innerHTML = `
        <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Seans Paneli</h2>
        <div class="space-y-8">
            ${playlistBuilderHTML}
            <div>
                <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Hazır Seanslar</h3>
                <div class="grid gap-5 grid-cols-1 md:grid-cols-2">
                    ${createRecipeCard('promotion-candidates', '🚀', 'Yükselme Adayları', 'Bir üst seviyeye geçmeye çok yakın olan kartlarla odaklanmış bir seans yap.')}
                    ${createRecipeCard('rusty-cards', '🧠', 'Paslanmış Kartlar', 'Uzun süredir tekrar etmediğin kartları hatırlayarak bilgilerini taze tut.')}
                    ${createRecipeCard('hardest-cards', '💪', 'En Zorlu Kartlar', 'En çok hata yaptığın kartların üzerine giderek zayıf noktalarını güçlendir.')}
                    ${createRecipeCard('random-cards', '🎲', 'Rastgele Tekrar', 'Tüm kartlar arasından rastgele 15 tanesiyle hafızanı sına.')}
                </div>
            </div>
        </div>`;
}

/**
 * Başarımlar sayfasını çizer.
 */
export function renderAchievementsPage() {
    const achievementsContainer = document.getElementById('achievements-container');
    const earnedBadges = new Set(funcs.allData.earnedBadges || []);
    let badgesHtml = `
        <div class="bg-white border border-slate-200 rounded-lg p-6 mt-8">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">🏆 Kazanılan Rozetler</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">`;

    BADGES.forEach(badge => {
        const isEarned = earnedBadges.has(badge.slug);
        badgesHtml += `
            <div class="badge-card ${isEarned ? 'earned' : 'not-earned'}">
                <img src="${badge.icon_url}" alt="${badge.name}">
                <h3 class="font-bold text-lg">${badge.name}</h3>
                <p>${badge.description}</p>
            </div>`;
    });
    badgesHtml += `</div></div>`;

    let masteryLogHtml = `
        <div class="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-md">
            <div class="flex items-center gap-3 mb-4">
                <h2 class="text-2xl font-bold text-green-700">📚 Ustalaşılan Eserler</h2>
                <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-500 rounded-full">${funcs.allData.masteredProjectsLog ? funcs.allData.masteredProjectsLog.length : 0} Eser</span>
            </div>
            <p class="text-sm text-slate-500 -mt-2 mb-4">Tebrikler! İşte ustalaştığınız eserlerin kalıcı listesi.</p>`;

    if (funcs.allData.masteredProjectsLog && funcs.allData.masteredProjectsLog.length > 0) {
        masteryLogHtml += '<ul class="space-y-2">';
        const sortedLog = [...funcs.allData.masteredProjectsLog].sort((a, b) => new Date(b.date) - new Date(a.date));
        sortedLog.forEach(log => {
            const formattedDate = new Date(log.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
            masteryLogHtml += `
                <li class="flex justify-between items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span class="font-semibold text-green-700 flex-grow min-w-0 truncate" title="${log.name}">${log.name}</span>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="hidden sm:inline text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">Tamamlandı: ${formattedDate}</span>
                        <span class="inline sm:hidden text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">${new Date(log.date).toLocaleDateString('tr-TR')}</span>
                        <button data-project-name="${log.name}" class="delete-mastery-log-btn text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-100 transition-colors" title="Bu kaydı sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                </li>`;
        });
        masteryLogHtml += '</ul>';
    } else {
        masteryLogHtml += `
            <div class="text-center py-8">
                <div class="mx-auto w-16 h-16 text-green-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <h4 class="mt-4 text-xl font-bold text-slate-700">Ustalık Kütüphanen Henüz Boş</h4>
                <p class="mt-2 text-slate-500">Bir eserdeki tüm kartları tamamladığında burada listelenecek. <br>Pratiğe devam et, başarı çok yakın!</p>
            </div>`;
    }
    masteryLogHtml += '</div>';
    achievementsContainer.innerHTML = masteryLogHtml + badgesHtml;
}

/**
 * Mobil cihazlardaki "Daha Fazla" sayfasını çizer.
 */
export function renderMoreView() {
    const moreViewContainer = document.getElementById('more-view-container');
    const userPanel = document.getElementById('user-panel');
    if (!moreViewContainer || !userPanel) return;

    const userPanelHTML = userPanel.innerHTML;
    moreViewContainer.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100 px-4">Daha Fazla</h2>
            <div class="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-sm p-4">${userPanelHTML}</div>
            <div class="bg-white dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <a href="#" class="more-view-link" data-action="show-all-projects"><span class="link-icon !mr-4 text-2xl">📚</span><span class="font-medium text-slate-700 dark:text-slate-200">Tüm Eserlerim</span></a>
                <a href="#" class="more-view-link" data-action="show-reports-and-sessions"><span class="link-icon !mr-4 text-2xl">🎯</span><span class="font-medium text-slate-700 dark:text-slate-200">Seans Paneli</span></a>
                <a href="#" class="more-view-link" data-action="show-achievements"><span class="link-icon !mr-4 text-2xl">🏆</span><span class="font-medium text-slate-700 dark:text-slate-200">Başarımlar</span></a>
                <a href="#" class="more-view-link" data-action="show-statistics"><span class="link-icon !mr-4 text-2xl">📊</span><span class="font-medium text-slate-700 dark:text-slate-200">İstatistikler</span></a>
                <a href="#" class="more-view-link" data-action="open-methodology-modal"><span class="link-icon !mr-4 text-2xl">🎓</span><span class="font-medium text-slate-700 dark:text-slate-200">Çalışma Yöntemi</span></a>
                <a href="#" class="more-view-link" data-action="open-tools-modal"><span class="link-icon !mr-4 text-2xl">🔧</span><span class="font-medium text-slate-700 dark:text-slate-200">Araçlar (Metronom/Tuner)</span></a>
                <a href="#" class="more-view-link" data-action="open-daily-goal-modal"><span class="link-icon !mr-4 text-2xl">🎯</span><span class="font-medium text-slate-700 dark:text-slate-200">Günlük Pratik Hedefi</span></a>
                <div class="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex items-center"><span class="link-icon !mr-4 text-2xl">🌙</span><span class="font-medium text-slate-700 dark:text-slate-200">Koyu Mod</span></div>
                    <label for="theme-toggle-mobile" class="relative inline-flex items-center cursor-pointer"><input type="checkbox" value="" id="theme-toggle-mobile" class="sr-only peer"><div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-indigo-600"></div></label>
                </div>
            </div>
        </div>`;

    const mobileThemeToggle = document.getElementById('theme-toggle-mobile');
    if (mobileThemeToggle) {
        mobileThemeToggle.checked = document.documentElement.classList.contains('dark');
    }
}

/**
 * Tüm projelerin listelendiği sayfayı çizer.
 */
export function renderAllProjectsPage() {
    const allProjectsContainer = document.getElementById('all-projects-container');
    const sortedProjects = Object.entries(funcs.allData.projects || {}).sort((a, b) => a[0].localeCompare(b[0]));
    let content = `
        <div class="flex items-center gap-4 mb-8">
            <button id="back-to-dashboard-btn" class="btn btn-secondary !p-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Tüm Eserlerim (${sortedProjects.length})</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
   if (sortedProjects.length > 0) {
    content += sortedProjects.map(([projectName, project]) => createProjectCardHTML(projectName, project)).join('');
    } else {
        content += `<p class="text-center text-slate-500 col-span-full py-10">Henüz hiç eser eklemedin.</p>`;
    }
    content += `</div>`;
    allProjectsContainer.innerHTML = content;

    document.getElementById('back-to-dashboard-btn').onclick = () => {
        funcs.setCurrentView('summary');
        renderUI();
    };

    allProjectsContainer.querySelectorAll('.project-card').forEach(card => {
        card.onclick = () => {
            funcs.setActiveProject(card.dataset.projectName);
            renderUI();
        };
    });
}

/**
 * Ustalık Yolculuğu sayfasını çizer.
 */
export function renderMasteryJourneyPage() {
    const container = document.getElementById('main-dashboard-container');
    const practiceBoxes = defaultBoxSettings.filter(b => b.type === 'practice');
    const activeCards = funcs.getActiveLearningCards();

    const stationCardsHTML = practiceBoxes.map(box => {
        const cardsInStation = activeCards.filter(c => c.box === box.number);
        const stationHasCards = cardsInStation.length > 0;
        const uniqueProjects = new Set(cardsInStation.map(card => card.projectName));
        const projectCount = uniqueProjects.size;
        let counterText = `${cardsInStation.length} Kart`;
        if (stationHasCards && projectCount > 0) {
            counterText += ` <span class="font-normal text-xs text-slate-500">/ ${projectCount} Eser</span>`;
        }
        return `
            <div class="station-card dark:bg-slate-800/60 dark:border-slate-700/80">
                <div class="station-header ${box.color} dark:bg-transparent dark:border-b dark:border-slate-700">${box.icon} ${box.title}</div>
                <div class="station-body">
                    <p class="station-description dark:text-slate-400">${box.purpose}</p>
                    <div class="text-center my-4"><span class="station-counter dark:text-slate-200 dark:hover:text-indigo-400" data-action="show-level-detail" data-box-number="${box.number}" title="Detayları gör">${counterText}</span></div>
                    <button class="btn btn-secondary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600 w-full" data-action="study-level" data-box-number="${box.number}" ${!stationHasCards ? 'disabled' : ''}>Bu Adımı Çalış</button>
                </div>
            </div>`;
    }).join('');

   container.innerHTML = `
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">🗺️ Ustalık Yolculuğu</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-6">Bu görünüm, farklı eserlerdeki pasajları ustalık seviyelerine göre gruplar. Belirli bir beceriye odaklanarak (örn: tempo kazanma), bu beceriyi farklı bağlamlarda tekrar eder ve öğrenmeyi kalıcı hale getirirsin.</p>
            <div class="grid gap-5 grid-auto-fit-cards">
                ${stationCardsHTML}
            </div>
        </div>`;
}

// ui_render.js

// ... (dosyanın başındaki diğer tüm fonksiyonlar aynı kalacak) ...

/**
 * Prova Sahnesi sayfasını çizer.
 */
export function renderRehearsalPage() {
    const container = document.getElementById('rehearsal-page-container');
    if (!container) return;

    const rehearsalProjects = [];
    Object.entries(funcs.allData.projects || {}).forEach(([projectName, project]) => {
        const sections = project.sections || [];
        if (sections.length === 0) return; // Boş projeleri atla

        // --- GÜNCELLENMİŞ MANTIK ---
        // Bir projenin provaya hazır olması için, TÜM kartlarının 9. kutuda olması gerekir.
        const allCardsInRehearsalBox = sections.every(section => (section.box || 1) >= 9);

        if (allCardsInRehearsalBox) {
            // Prova seansına, henüz tam olarak ustalaşılmamış (yani hala çalışılacak)
            // 9. kutudaki kartları ekle.
            const performanceCards = sections.filter(section => {
                const boxDefs = project.boxDefinitions || defaultBoxSettings;
                const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
                const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
                
                // Bu koşul, kartın 9. kutuda olup henüz "Usta" olarak işaretlenmediğini kontrol eder.
                return section.box === 9 && !(section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold);
            });

            // Eğer provaya alınacak en az bir kart varsa listeye ekle.
            if (performanceCards.length > 0) {
                rehearsalProjects.push({
                    name: projectName,
                    cards: performanceCards
                });
            }
        }
        // --- GÜNCELLEME SONU ---
    });

    let contentHTML = `
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">🎭 Prova Sahnesi</h2>
            <p class="text-slate-600 dark:text-slate-400 mb-6">Bu sahnede, tüm bölümlerini en son aşamaya getirdiğin eserleri baştan sona çalarak konser veya dinleti pratiği yapabilirsin.</p>
    `;

    if (rehearsalProjects.length > 0) {
        const totalCardsToRehearse = rehearsalProjects.reduce((sum, proj) => sum + proj.cards.length, 0);
        
        contentHTML += `
            <div class="mb-8 p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-lg">
                <button id="start-full-rehearsal-btn" class="btn btn-primary w-full !py-3 text-base">
                    <div class="flex flex-col items-center">
                        <span>Tüm Eserleri Provaya Al</span>
                        <span class="text-xs font-normal opacity-80">(${totalCardsToRehearse} Kart)</span>
                    </div>
                </button>
            </div>
            <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Provaya Hazır Eserler</h3>
            <div class="space-y-3">
        `;

        rehearsalProjects.forEach(proj => {
            contentHTML += `
                <div class="rehearsal-card-item flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border dark:border-slate-600">
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-100">${proj.name}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${proj.cards.length} prova kartı</p>
                    </div>
                    <button class="btn btn-secondary start-single-rehearsal-btn" data-project-name="${proj.name}">Provayı Başlat</button>
                </div>
            `;
        });
        contentHTML += `</div>`;
    } else {
        contentHTML += `
            <div class="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                <div class="mx-auto w-16 h-16 text-indigo-300 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.343-11.25a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25-2.25H6.593a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25h10.114z" /></svg>
                </div>
                <h4 class="mt-4 text-xl font-bold text-slate-700 dark:text-slate-200">Prova Sahnesi Boş</h4>
                <p class="mt-2 text-slate-500 dark:text-slate-400">Bir eserdeki tüm kartları "Prova Sahnesi" adımına<br>getirdiğinde burada görünecekler.</p>
                <button id="go-to-journey-btn" class="btn btn-primary mt-6">Ustalık Yolculuğuna Git</button>
            </div>
        `;
    }

    contentHTML += `</div>`;
    container.innerHTML = contentHTML;

    const goToJourneyBtn = document.getElementById('go-to-journey-btn');
    if(goToJourneyBtn) {
        goToJourneyBtn.onclick = () => {
            funcs.setCurrentView('mastery-journey');
            renderUI();
        };
    }
}

// ... (dosyanın geri kalan tüm fonksiyonları aynı kalacak) ...

/**
 * Yeni eser oluşturma modalındaki şablon listesini çizer.
 */
export function renderTemplateListForCreateModal() {
    const createFromTemplatePanel = document.getElementById('create-from-template-panel');
    createFromTemplatePanel.innerHTML = '';
    const categories = {};
    (funcs.globalTemplates || []).forEach(cat => {
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
                    <div><h5 class="font-semibold text-slate-800">${work.name}</h5><p class="text-sm text-slate-500">${work.cards.length} kart</p></div>
                    <button data-work-name="${work.name}" class="add-work-template-btn btn btn-secondary btn-sm !py-1 !px-3">Ekle</button>
                </div>`).join('');
            catDiv.innerHTML = `<div class="flex justify-between items-center p-3 cursor-pointer" data-action="toggle-category" data-target="#create-tpl-cat-${index}"><h4 class="font-semibold text-slate-700">${categoryName}</h4><svg class="w-5 h-5 transition-transform toggle-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></div><div id="create-tpl-cat-${index}" class="collapsible-content"><div class="space-y-px p-2 pt-0">${worksHtml}</div></div>`;
            createFromTemplatePanel.appendChild(catDiv);
        });
    } else {
        createFromTemplatePanel.innerHTML = '<p class="text-center text-gray-500">Eklenecek onaylanmış şablon bulunmuyor.</p>';
    }
}

/**
 * Yeni eser oluşturma modalındaki eklenecek kartlar listesini çizer.
 */
export function renderNewWorkCardList() {
    const newWorkCardListContainer = document.getElementById('new-work-card-list-container');
    const newWorkCardCountEl = document.getElementById('new-work-card-count');
    newWorkCardListContainer.innerHTML = '';
    if (funcs.newWorkCards.length === 0) {
        newWorkCardListContainer.innerHTML = '<p class="text-center text-gray-500 p-4">Henüz kart eklenmedi.</p>';
    } else {
        funcs.newWorkCards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'bg-white p-2.5 rounded-md border flex justify-between items-center group';
            cardEl.innerHTML = `
                <div class="flex-grow truncate pr-2 cursor-pointer" data-action="edit-card-in-list" data-index="${index}">
                    <p class="font-semibold text-slate-700 truncate group-hover:text-indigo-600">${card.name}</p>
                    <p class="text-xs text-slate-500 truncate">${card.description || 'Açıklama yok'}</p>
                </div>
                <button data-index="${index}" class="remove-card-from-list-btn btn-icon text-slate-400 hover:text-rose-500 flex-shrink-0 p-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>`;
            newWorkCardListContainer.appendChild(cardEl);
        });
    }
    newWorkCardCountEl.textContent = funcs.newWorkCards.length;
}

/**
 * Rehber (onboarding) adımlarını çizer.
 */
export function renderOnboardingStep() {
    const step = funcs.ONBOARDING_STEPS[funcs.currentOnboardingStep];
    const onboardingStepContent = document.getElementById('onboarding-step-content');
    const onboardingDotsContainer = document.getElementById('onboarding-dots');
    const onboardingBackBtn = document.getElementById('onboarding-back-btn');
    const onboardingNextBtn = document.getElementById('onboarding-next-btn');
    const onboardingFinishBtn = document.getElementById('onboarding-finish-btn');
    const onboardingSkipBtn = document.getElementById('onboarding-skip-btn');

    onboardingStepContent.style.opacity = '0';
    onboardingStepContent.style.transform = 'translateY(10px)';

    setTimeout(() => {
        onboardingStepContent.innerHTML = `<div class="w-24 h-24 mx-auto text-indigo-500 mb-6">${step.icon}</div><h3 class="text-2xl font-bold text-slate-800 mb-3">${step.title}</h3><p class="text-slate-600 leading-relaxed">${step.text}</p>`;
        onboardingStepContent.style.opacity = '1';
        onboardingStepContent.style.transform = 'translateY(0)';
    }, 300);

    onboardingDotsContainer.innerHTML = funcs.ONBOARDING_STEPS.map((_, index) => `<div class="onboarding-dot ${index === funcs.currentOnboardingStep ? 'active' : ''}"></div>`).join('');
    onboardingBackBtn.classList.toggle('hidden', funcs.currentOnboardingStep === 0);
    onboardingNextBtn.classList.toggle('hidden', funcs.currentOnboardingStep === funcs.ONBOARDING_STEPS.length - 1);
    onboardingFinishBtn.classList.toggle('hidden', funcs.currentOnboardingStep !== funcs.ONBOARDING_STEPS.length - 1);
    onboardingSkipBtn.classList.toggle('hidden', funcs.currentOnboardingStep === funcs.ONBOARDING_STEPS.length - 1);
}

/**
 * Şablon yorumları modal penceresinin içeriğini çizer.
 */
export function renderTemplateComments(comments) {
    const listContainer = document.getElementById('template-comments-list');
    if (!listContainer) return;

    if (comments.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center text-slate-500 py-8">
                <div class="mx-auto w-16 h-16 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                </div>
                <h4 class="mt-4 text-lg font-semibold text-slate-600">Henüz İpucu Eklenmemiş</h4>
                <p class="mt-1 text-sm text-slate-400">Bu şablon için ilk ipucunu paylaşan sen ol!</p>
            </div>`;
        return;
    }

    listContainer.innerHTML = comments.map(comment => {
        const commentDate = comment.createdAt ? comment.createdAt.toDate().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
        
        const isOwnerOrAdmin = funcs.userId === comment.userId || funcs.userId === 'tp7u9wMMn1gIVBM8mClmzWSptX43';
        const actionButtonsHTML = isOwnerOrAdmin ? `
            <div class="flex-shrink-0">
                <button class="edit-comment-btn p-1 text-slate-400 hover:text-indigo-600" data-comment-id="${comment.id}" title="Düzenle">
                    <svg class="h-4 w-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                </button>
                <button class="delete-comment-btn p-1 text-slate-400 hover:text-rose-600" data-comment-id="${comment.id}" title="Sil">
                    <svg class="h-4 w-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        ` : '';

        return `
            <div class="flex items-start gap-3">
                <img src="${comment.userPhotoURL}" class="w-10 h-10 rounded-full" alt="${comment.userName}">
                <div class="flex-grow bg-white p-3 rounded-lg border">
                    <div class="flex justify-between items-start">
                        <div class="flex-grow">
                           <span class="font-semibold text-slate-800 text-sm">${comment.userName}</span>
                           <span class="text-xs text-slate-400 ml-2">${commentDate}</span>
                        </div>
                        ${actionButtonsHTML}
                    </div>
                    <p class="text-slate-600 text-sm mt-1 whitespace-pre-wrap" data-comment-text-id="${comment.id}">${comment.text}</p>
                </div>
            </div>
        `;
    }).join('');
}