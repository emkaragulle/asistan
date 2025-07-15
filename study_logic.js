// study_logic.js

import * as funcs from './functions.js';
import * as UI from './ui_helpers.js';
import * as firebase from './firebase_service.js';
import { defaultBoxSettings, DEFAULT_MASTERY_THRESHOLD } from './constants.js';

/**
 * Verilen kartlarla bir çalışma seansı başlatır.
 * @param {Array} dueSections Çalışılacak kartlar.
 * @param {string} sessionType Seansın türü ('normal', 'blindTest', 'chaining').
 */
export function startStudySession(dueSections, sessionType = 'normal') {
    let cardsForSession;
    
    if (sessionType === 'chaining') {
        // Zincirleme modunda kartları karıştırmıyoruz, orijinal sırasında kullanıyoruz.
        cardsForSession = dueSections;
    } else {
        // Diğer modlarda akıllı karıştırma yapıyoruz.
        cardsForSession = smartShuffle(dueSections);
    }
    
    funcs.setStudySession({ 
        isActive: true, 
        cards: cardsForSession, 
        currentIndex: 0, 
        project: funcs.allData.activeProject,
        type: sessionType
    });

    renderCurrentStudyCard();
    funcs.pomodoroService.initialize();
    UI.showModal('study-modal');
}

/**
 * Çalışma seansını sonlandırır ve verileri kaydeder.
 */
export async function endStudySession() {
    funcs.metronomeService.stop();
    if (funcs.getUnsavedSeconds() > 0) {
        try {
            await firebase.saveUserData(funcs.userId, funcs.allData);
        } catch (error) {
            console.error("Çalışma süresi kaydedilirken hata oluştu:", error);
        } finally {
            funcs.resetUnsavedSeconds();
        }
    }
    funcs.setStudySession({ isActive: false, cards: [], currentIndex: 0, project: null, type: 'normal' });
    const { renderUI } = await import('./ui_render.js');
    renderUI();
}

/**
 * Çalışma ekranında mevcut kartı çizer.
 */
export function renderCurrentStudyCard() {
    const session = funcs.studySession;
    const cardContainer = document.getElementById('study-card-container');
    cardContainer.classList.remove('is-flipped');

    if (session.type === 'chaining') {
        const currentCard = session.cards[session.currentIndex];
        const nextCard = session.cards[session.currentIndex + 1];

        if (!nextCard) {
            funcs.metronomeService.stop();
            UI.closeModal('study-modal');
            UI.showInfoModal('Geçiş pratiği seansını başarıyla tamamladın!', 'success');
            return;
        }

        document.getElementById('study-progress').textContent = `Geçiş ${session.currentIndex + 1} / ${session.cards.length - 1}`;
        funcs.metronomeService.stop();

        setTimeout(() => {
            cardContainer.querySelector('.flip-card-front').innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center p-4">
                    <div class="absolute top-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg shadow-sm flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <div>
                            <span class="font-bold block">Odak: Geçiş Pratiği</span>
                            <p class="text-xs text-purple-700 font-normal">İki bölümü art arda, duraksamadan çal.</p>
                        </div>
                    </div>
                    <div class="w-full mt-12">
                        <div class="flex items-center justify-center gap-1">
                            <div class="flex-1 p-4 border-r border-slate-300">
                                <h3 class="text-xl lg:text-3xl font-bold text-slate-800">${currentCard.name}</h3>
                                <p class="text-slate-500 text-md mt-1">${currentCard.description || ''}</p>
                            </div>
                            <div class="px-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                            <div class="flex-1 p-4 border-l border-slate-300">
                                <h3 class="text-xl lg:text-3xl font-bold text-slate-800">${nextCard.name}</h3>
                                <p class="text-slate-500 text-md mt-1">${nextCard.description || ''}</p>
                            </div>
                        </div>
                        <p class="text-slate-400 text-sm mt-8 italic">${currentCard.projectName}</p>
                    </div>
                </div>`;
            cardContainer.querySelector('.flip-card-back').innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-6">
                    <p class="text-2xl text-white text-center font-semibold">Bu geçişi akıcı ve hatasız bir şekilde yapabildin mi?</p>
                </div>`;
        }, 150);

    } else {
        const card = session.cards[session.currentIndex];
        const project = funcs.allData.projects[card.projectName];
        document.getElementById('study-progress').textContent = `Kart ${session.currentIndex + 1} / ${session.cards.length}`;

        if (session.type === 'blindTest') {
            funcs.metronomeService.stop();
            setTimeout(() => {
                cardContainer.querySelector('.flip-card-front').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full text-center p-4">
                        <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm flex items-start gap-3">
                            <span class="text-xl mt-1">🙈</span>
                            <div>
                                <span class="font-bold block">Kör Test</span>
                                <p class="text-xs text-gray-700 font-normal">Sadece isme bakarak hatırla!</p>
                            </div>
                        </div>
                        <div class="w-full">
                            <h3 class="text-3xl lg:text-4xl font-bold text-slate-800">${card.name}</h3>
                            <p class="text-slate-500 text-lg mt-2">${card.projectName}</p>
                            <p class="text-slate-400 text-sm mt-8 italic">Pasajı enstrümanında çal, ardından cevabı görmek için aşağıdaki butona tıkla.</p>
                        </div>
                    </div>`;
                cardContainer.querySelector('.flip-card-back').innerHTML = `
                    <div class="flex flex-col items-center justify-center h-full p-6">
                        <p class="text-2xl text-white text-center font-semibold">Pasajı doğru ve eksiksiz bir şekilde hatırlayabildin mi?</p>
                    </div>`;
            }, 150);
        } else {
            const effectiveTempos = funcs.getCardEffectiveTempos(card, project);
            const boxInfo = defaultBoxSettings.find(b => b.number === card.box);
            if (card.box === 3 && effectiveTempos.base && effectiveTempos.target) {
                const currentTempo = card.currentTempo || effectiveTempos.base;
                funcs.metronomeService.setBpm(currentTempo);
                funcs.metronomeService.start();
                setTimeout(() => {
                    cardContainer.querySelector('.flip-card-front').innerHTML = `<div class="text-center flex flex-col justify-center h-full"><p class="text-lg text-amber-600 font-semibold">Odak: Tempo Kazan</p><h3 class="text-4xl font-bold my-2">${card.name}</h3><div class="my-6"><p class="text-xl text-slate-500">Şu Anki Tempo</p><p class="text-8xl font-bold text-slate-800 tracking-tighter">${currentTempo}</p><p class="text-lg text-slate-400 font-semibold">Hedef: ${effectiveTempos.target} BPM</p></div><p class="text-sm text-slate-500">${card.projectName}</p></div>`;
                    cardContainer.querySelector('.flip-card-back').innerHTML = `<div class="flex flex-col items-center justify-center h-full p-6"><p class="text-3xl text-white text-center font-semibold">Bu tempoda hatasız ve akıcı çalabildin mi?</p></div>`;
                }, 150);
            } else {
                funcs.metronomeService.stop();
                let frontFaceContextHTML = boxInfo ? `<div class="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg shadow-sm flex items-start gap-3 max-w-xs w-11/12 justify-center"><span class="text-xl mt-1">${boxInfo.icon || ''}</span><div><span class="font-bold block">Odak: ${boxInfo.title}</span><p class="text-xs text-indigo-700 font-normal">${boxInfo.purpose || ''}</p></div></div>` : '';
                let questionText = boxInfo?.question || 'Bu aşamayı başarıyla tamamladın mı?';
                let mainTitle = card.name;
                let subText = `<p class="text-slate-500 text-lg mt-2">${card.description}</p><p class="text-sm text-indigo-400 mt-4 font-semibold">${card.projectName}</p>`;
                if (card.box === 9) {
                    mainTitle = card.projectName;
                    subText = `<p class="text-slate-500 text-lg mt-2">Eseri baştan sona, bir bütün olarak çalmaya odaklan.</p>`;
                }
                setTimeout(() => {
                    cardContainer.querySelector('.flip-card-front').innerHTML = `${frontFaceContextHTML}<div class="flex items-center justify-center h-full text-center"><div class="w-full"><h3 class="text-3xl lg:text-4xl font-bold">${mainTitle}</h3>${subText}</div></div>`;
                    cardContainer.querySelector('.flip-card-back').innerHTML = `<div class="flex flex-col items-center justify-center h-full p-6"><p class="text-2xl text-white text-center font-semibold">${questionText}</p></div>`;
                }, 150);
            }
        }
    }

    const controlsHTML = `
        <div class="flex justify-center items-center gap-3 w-full max-w-xs mx-auto">
            <button id="open-recorder-from-study-btn" class="btn-icon !p-3 bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" title="Bu pasajı kaydet">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
            <button id="show-answer-btn" class="btn btn-secondary flex-grow">
                <span>Nasıldı ?</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </button>
        </div>
    `;
    document.getElementById('study-controls').innerHTML = controlsHTML;
}

/**
 * Çalışma kartının arka yüzünü gösterir ve cevap butonlarını çizer.
 */
export function showStudyCardAnswer() {
    funcs.metronomeService.stop();
    const card = funcs.studySession.cards[funcs.studySession.currentIndex];
    const notesHTML = (card.notes && card.notes.trim() !== '') ? `
        <div class="mt-4 pt-3 border-t border-slate-600 w-full text-left max-w-sm mx-auto">
            <h4 class="font-semibold text-sm text-slate-300 mb-1">Kişisel Notların</h4>
            <p class="text-sm text-white whitespace-pre-wrap">${card.notes}</p>
        </div>
    ` : '';
    
    document.getElementById('study-card-container').classList.add('is-flipped');
    
    const backFaceContainer = document.querySelector('.flip-card-back > div');
    if (backFaceContainer) {
        const questionElement = backFaceContainer.querySelector('p');
        if (questionElement) {
             questionElement.parentNode.innerHTML = questionElement.outerHTML + notesHTML;
        }
    }

    document.getElementById('study-controls').innerHTML = `
    <div class="flex justify-center items-center gap-4">
        <button id="study-incorrect-btn" class="btn btn-danger">Tekrar Gerekli</button>
        <button id="study-correct-btn" class="btn btn-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a2 2 0 00-.266 1.4z" />
            </svg>
            <span>Gayet İyi</span>
        </button>
    </div>
`;
}

/**
 * Kullanıcının çalışma cevabını işler, kartı günceller ve bir sonraki adıma geçer.
 * @param {boolean} wasCorrect Cevabın doğru olup olmadığı.
 */
export async function handleStudyAnswer(wasCorrect) {
    const session = funcs.studySession;

    // "Sıralı" ve "Zincirleme" modları için otomatik ilerleme mantığı
    if (session.type === 'chaining' || session.type === 'sequential') {
        // Bu modlarda kart verisi güncellenmez, sadece ilerlenir.
        // Zincirleme modu için son karttan bir öncekine kadar gidilir.
        const limit = session.type === 'chaining' ? session.cards.length - 2 : session.cards.length - 1;

        if (session.currentIndex < limit) {
            // Cevap verildikten sonra kısa bir bekleme ve otomatik geçiş
            document.getElementById('study-controls').innerHTML = wasCorrect
                ? '<div class="text-green-500 font-bold text-lg">Harika!</div>'
                : '<div class="text-rose-500 font-bold text-lg">Tekrar Gerekli!</div>';

            setTimeout(() => {
                funcs.incrementStudySessionIndex();
                renderCurrentStudyCard();
            }, 700); // 0.7 saniye sonra sonraki karta geç
        } else {
            funcs.metronomeService.stop();
            UI.closeModal('study-modal');
            const message = session.type === 'chaining' 
                ? 'Geçiş pratiği seansını başarıyla tamamladın!' 
                : 'Sıralı çalışma seansını başarıyla tamamladın!';
            UI.showInfoModal(message, 'success');
        }
        return; // Fonksiyonun geri kalanını çalıştırma
    }

    // "Normal" ve "Kör Test" seansları için mevcut mantık
    const card = session.cards[session.currentIndex];
    if (!card || !card.projectName) return;
    
    const project = funcs.allData.projects[card.projectName];
    if (!project) return;

    const sectionToUpdate = project.sections.find(s => s.id === card.id);
    if (!sectionToUpdate) return;

    const boxDefs = project.boxDefinitions || defaultBoxSettings;
    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
    const effectiveTempos = funcs.getCardEffectiveTempos(sectionToUpdate, project);

    if (wasCorrect) {
        funcs.awardPoints(1, "Başarılı tekrar");
        sectionToUpdate.successCount = (sectionToUpdate.successCount || 0) + 1;
        let canMoveToNextBox = false;

        if (sectionToUpdate.box === 3 && effectiveTempos.target) {
            const currentTempo = sectionToUpdate.currentTempo || effectiveTempos.base;
            if (currentTempo >= effectiveTempos.target) {
                if (sectionToUpdate.successCount >= masteryThreshold) canMoveToNextBox = true;
            } else {
                sectionToUpdate.currentTempo = Math.min(currentTempo + 5, effectiveTempos.target);
                sectionToUpdate.successCount = 0;
            }
        } else {
            if (sectionToUpdate.successCount >= masteryThreshold) canMoveToNextBox = true;
        }

        if (sectionToUpdate.box < maxBoxNumber && canMoveToNextBox) {
            sectionToUpdate.box++;
            sectionToUpdate.successCount = 0;
            if (sectionToUpdate.baseTempo) sectionToUpdate.currentTempo = sectionToUpdate.baseTempo;
            funcs.awardPoints(5, "Kart seviye atladı");
        }
        await funcs.checkAndLogMastery(card.projectName);
    } else {
        sectionToUpdate.incorrectCount = (sectionToUpdate.incorrectCount || 0) + 1;
        sectionToUpdate.successCount = 0;
        if (sectionToUpdate.box === 3 && effectiveTempos.base) {
            sectionToUpdate.currentTempo = Math.max((sectionToUpdate.currentTempo || effectiveTempos.base) - 5, effectiveTempos.base);
        }
        const cardToReAdd = { ...card };
        const reinsertIndex = Math.min(session.currentIndex + 3, session.cards.length);
        session.cards.splice(reinsertIndex, 0, cardToReAdd);
        document.getElementById('study-progress').textContent = `Kart ${session.currentIndex + 1} / ${session.cards.length}`;
    }

    sectionToUpdate.lastMoved = new Date().toString();
    funcs.requestSaveData();
    funcs.incrementDataVersion();
    await funcs.checkAndAwardBadges();

    if (session.currentIndex < session.cards.length - 1) {
        funcs.incrementStudySessionIndex();
        renderCurrentStudyCard();
    } else {
        funcs.metronomeService.stop();
        UI.closeModal('study-modal');
        UI.showInfoModal('Tekrar seansını başarıyla tamamladın!', 'success');
    }
}


export function smartShuffle(cards) {
    if (!cards || cards.length === 0) return [];
    const groupedByBox = cards.reduce((acc, card) => {
        const box = card.box;
        if (!acc[box]) acc[box] = [];
        acc[box].push(card);
        return acc;
    }, {});
    for (const box in groupedByBox) {
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