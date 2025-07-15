// event_handlers.js

import * as funcs from './functions.js';
import * as UIRender from './ui_render.js';
import * as StudyLogic from './study_logic.js';
import * as firebase from './firebase_service.js';
import * as UI from './ui_helpers.js';
import { defaultBoxSettings, DEFAULT_MASTERY_THRESHOLD } from './constants.js';

export function initEventHandlers() {
    
    // --- KİMLİK DOĞRULAMA ---
    document.getElementById('google-signin-btn').addEventListener('click', () => { 
        firebase.signInWithGoogle().catch(err => console.error("Google Sign-in Error:", err)); 
    });
    document.getElementById('sign-out-btn').addEventListener('click', (e) => {
        e.preventDefault();
        firebase.signOutUser();
    });

    // --- GENEL NAVİGASYON ---
    document.getElementById('sidebar-project-list').addEventListener('click', (e) => { 
        e.preventDefault();
        const targetLink = e.target.closest('.project-link');
        if (targetLink) {
            funcs.setActiveProject(targetLink.dataset.projectName);
            UIRender.renderUI();
            window.scrollTo(0, 0);
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        }
    });

    document.getElementById('main-settings-btn').addEventListener('click', (e) => { 
        e.stopPropagation(); 
        document.getElementById('settings-dropdown').classList.toggle('hidden'); 
    });
    window.addEventListener('click', () => { 
        const settingsDropdown = document.getElementById('settings-dropdown');
        if(settingsDropdown && !settingsDropdown.classList.contains('hidden')) {
            settingsDropdown.classList.add('hidden'); 
        }
    });
    
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.closeModal;
            if (modalId === 'create-work-modal') {
                const mobileAddBtn = document.querySelector('.mobile-nav-link[data-view="add"]');
                if (mobileAddBtn) mobileAddBtn.classList.remove('active');
            }
            UI.closeModal(modalId);
        });
    });

    // --- KENAR ÇUBUĞU (SIDEBAR) GÖRÜNÜM BUTONLARI ---
    const viewButtons = [
        { id: 'show-summary-view-btn', view: 'summary' },
        { id: 'show-mastery-journey-btn', view: 'mastery-journey' },
        { id: 'show-rehearsal-page-btn', view: 'rehearsal' },
        { id: 'show-reports-and-sessions-btn', view: 'reports-and-sessions' },
        { id: 'show-achievements-btn', view: 'achievements' },
        { id: 'show-statistics-btn', view: 'statistics' }
    ];
    viewButtons.forEach(buttonInfo => {
        const button = document.getElementById(buttonInfo.id);
        if(button) {
            button.addEventListener('click', () => {
                funcs.setCurrentView(buttonInfo.view);
                UIRender.renderUI();
            });
        }
    });

    // --- MODAL AÇMA BUTONLARI ---
 // event_handlers.js

// ... (dosyanın başındaki diğer kodlar aynı kalacak)

    // --- MODAL AÇMA BUTONLARI ---
    document.getElementById('open-create-work-modal-btn').addEventListener('click', () => {
        funcs.setIsEditMode(false);
        funcs.setCurrentEditingProjectName(null);
        funcs.setNewWorkCards([]);
        
        document.getElementById('new-project-name').value = '';
        document.getElementById('new-project-base-tempo').value = '';
        document.getElementById('new-project-target-tempo').value = '';
        
        // --- DÜZELTME BURADA: SATIRLARIN SIRASI DEĞİŞTİRİLDİ ---

        // 1. ÖNCE: Başlığı ve sayacı içeren HTML'i oluştur.
        document.getElementById('card-list-title').innerHTML = 'Eklenecek Kartlar (<span id="new-work-card-count">0</span>)';
        
        // 2. SONRA: Kart listesini ve sayacı güncelle.
        funcs.resetCardForm();
        UIRender.renderNewWorkCardList();
        
        // --- DÜZELTME SONU ---

        const createWorkModal = document.getElementById('create-work-modal');
        createWorkModal.querySelector('h3').textContent = 'Yeni Çalışma Alanı Oluştur';
        document.getElementById('create-work-confirm-btn').textContent = 'Eseri ve Kartları Oluştur';
        document.getElementById('create-from-template-tab-btn').style.display = 'inline-flex';
        document.getElementById('create-work-tabs-nav').style.display = 'flex';
        funcs.switchCreateTab('blank');
        
        const mobileAddBtn = document.querySelector('.mobile-nav-link[data-view="add"]');
        if (mobileAddBtn) mobileAddBtn.classList.add('active');
        
        UI.showModal('create-work-modal');
    });

// ... (dosyanın geri kalan tüm fonksiyonları aynı kalacak)

    document.getElementById('open-add-card-modal-btn').addEventListener('click', () => {
        const project = funcs.allData.projects[funcs.allData.activeProject];
        document.getElementById('section-name-input').value = '';
        document.getElementById('section-desc-input').value = '';
        document.getElementById('section-notes-input').value = '';
        document.getElementById('section-tags-input').value = '';
        document.getElementById('base-tempo-input').value = project ? (project.baseTempo || '') : '';
        document.getElementById('target-tempo-input').value = project ? (project.targetTempo || '') : '';
        UI.showModal('add-card-modal');
    });

    document.getElementById('open-tools-modal-btn').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('settings-dropdown').classList.add('hidden'); UI.showModal('tools-modal'); });
    document.getElementById('open-methodology-modal-btn').addEventListener('click', (e) => { e.preventDefault(); UI.showModal('methodology-modal'); document.getElementById('settings-dropdown').classList.add('hidden'); });
    document.getElementById('open-daily-goal-modal-btn').addEventListener('click', (e) => {
        e.preventDefault();
        const currentGoalInHours = (funcs.allData.dailyGoalInMinutes || 120) / 60;
        document.getElementById('daily-goal-input-hours').value = currentGoalInHours;
        UI.showModal('daily-goal-modal');
        document.getElementById('settings-dropdown').classList.add('hidden');
    });
    
    document.getElementById('main-dashboard-container').addEventListener('click', (e) => {
        const studyBtn = e.target.closest('[data-action="study-level"]');
        const detailCounter = e.target.closest('[data-action="show-level-detail"]');
        const activeCards = funcs.getActiveLearningCards();

        if (studyBtn) {
            const boxNumber = parseInt(studyBtn.dataset.boxNumber, 10);
            const cardsToStudy = activeCards.filter(c => c.box === boxNumber);
            if (cardsToStudy.length > 0) { StudyLogic.startStudySession(cardsToStudy); }
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
                detailBody.innerHTML = Object.entries(cardsByProject).map(([proj, count]) => `<div class="flex justify-between items-center p-2 bg-slate-50 rounded-md"><span class="font-medium text-slate-700">${proj}</span><span class="font-semibold text-slate-500">${count} kart</span></div>`).join('');
                studyBtnInModal.onclick = () => { UI.closeModal('level-detail-modal'); StudyLogic.startStudySession(cardsInStation); };
                studyBtnInModal.disabled = false;
            } else {
                detailBody.innerHTML = '<p class="text-center text-slate-500">Bu aşamada hiç kart bulunmuyor.</p>';
                studyBtnInModal.onclick = null;
                studyBtnInModal.disabled = true;
            }
            UI.showModal('level-detail-modal');
        }
    });

    // --- PROJE OLUŞTURMA/DÜZENLEME MODALI ---
    const projectBaseTempoInput = document.getElementById('new-project-base-tempo');
    const projectTargetTempoInput = document.getElementById('new-project-target-tempo');
    const cardBaseTempoInput = document.getElementById('new-work-base-tempo-input');
    const cardTargetTempoInput = document.getElementById('new-work-target-tempo-input');
    
    if(projectBaseTempoInput) projectBaseTempoInput.addEventListener('input', (e) => { if(cardBaseTempoInput) cardBaseTempoInput.value = e.target.value; });
    if(projectTargetTempoInput) projectTargetTempoInput.addEventListener('input', (e) => { if(cardTargetTempoInput) cardTargetTempoInput.value = e.target.value; });

    document.getElementById('add-card-to-list-btn').addEventListener('click', () => {
        const name = document.getElementById('new-card-name').value.trim();
        if (!name) { UI.showInfoModal("Lütfen bir kart başlığı girin.", "error"); return; }
        const baseTempo = parseInt(document.getElementById('new-work-base-tempo-input').value, 10);
        const targetTempo = parseInt(document.getElementById('new-work-target-tempo-input').value, 10);
        const tagsInput = document.getElementById('new-work-tags-input').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
        const editingCard = funcs.editingCardIndex !== null ? funcs.newWorkCards[funcs.editingCardIndex] : null;
        
        const cardData = {
            name, 
            description: document.getElementById('new-card-desc').value.trim(),
            tags: tags,
            box: 1, 
            lastMoved: null, 
            successCount: 0,
            baseTempo: isNaN(baseTempo) ? null : baseTempo, 
            targetTempo: isNaN(targetTempo) ? null : targetTempo,
            currentTempo: isNaN(baseTempo) ? null : baseTempo,
            id: editingCard ? editingCard.id : 'section-' + Date.now() + Math.random().toString(36).substr(2, 9)
        };

        if (editingCard) { 
            funcs.newWorkCards[funcs.editingCardIndex] = cardData; 
        } else { 
            funcs.newWorkCards.push(cardData); 
        }
        
        UIRender.renderNewWorkCardList();
        funcs.resetCardForm();
    });

    // ========== YENİ EKLENEN HIZLI KART EKLEME OLAY DİNLEYİCİSİ BAŞLANGICI ==========
    document.getElementById('quick-add-btn').addEventListener('click', () => {
        const prefixInput = document.getElementById('quick-add-prefix');
        const rangesInput = document.getElementById('quick-add-ranges');
        
        const prefix = prefixInput.value.trim();
        const rangesStr = rangesInput.value.trim();

        if (!rangesStr) {
            UI.showInfoModal("Lütfen eklenecek aralıkları girin.", "error");
            return;
        }

        const ranges = rangesStr.split(',').map(r => r.trim()).filter(r => r);
        let addedCount = 0;

        ranges.forEach(range => {
            const cardName = prefix ? `${prefix} ${range}` : range;
            const newCard = {
                id: 'section-' + Date.now() + Math.random().toString(36).substr(2, 9),
                name: cardName,
                description: '',
                notes: '',
                tags: [],
                box: 1,
                lastMoved: null,
                successCount: 0,
                baseTempo: null,
                targetTempo: null,
                currentTempo: null
            };
            funcs.newWorkCards.push(newCard);
            addedCount++;
        });

        if (addedCount > 0) {
            UIRender.renderNewWorkCardList();
            // Input'ları temizle
            rangesInput.value = '';
            rangesInput.focus();
            UI.showInfoModal(`${addedCount} adet kart başarıyla listeye eklendi.`, "success");
        }
    });
    // ========== YENİ EKLENEN HIZLI KART EKLEME OLAY DİNLEYİCİSİ SONU ==========


    document.getElementById('new-work-card-list-container').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-card-from-list-btn');
        const editTrigger = e.target.closest('[data-action="edit-card-in-list"]');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index, 10);
            funcs.removeCardFromNewWorkList(index);
            UIRender.renderNewWorkCardList();
        }
        if (editTrigger) {
            const index = parseInt(editTrigger.dataset.index, 10);
            const cardToEdit = funcs.newWorkCards[index];
            funcs.setEditingCardIndex(index);
            document.getElementById('new-card-name').value = cardToEdit.name || '';
            document.getElementById('new-card-desc').value = cardToEdit.description || '';
            document.getElementById('new-work-base-tempo-input').value = cardToEdit.baseTempo || '';
            document.getElementById('new-work-target-tempo-input').value = cardToEdit.targetTempo || '';
            document.getElementById('new-work-tags-input').value = (cardToEdit.tags || []).join(', ');
            document.getElementById('add-card-to-list-btn').textContent = 'Değişiklikleri Kaydet';
            
            const existingCancelBtn = document.getElementById('cancel-card-edit-btn');
            if (existingCancelBtn) existingCancelBtn.remove();
            
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancel-card-edit-btn';
            cancelBtn.textContent = 'İptal';
            cancelBtn.className = 'btn btn-secondary w-full mt-2';
            document.getElementById('add-card-to-list-btn').parentNode.appendChild(cancelBtn);
            cancelBtn.onclick = () => funcs.resetCardForm();
        }
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('.create-work-cancel-btn')) {
            funcs.setIsEditMode(false);
            funcs.setCurrentEditingProjectName(null);
            document.getElementById('create-work-modal').querySelector('h3').textContent = 'Yeni Çalışma Alanı Oluştur';
            document.getElementById('create-work-confirm-btn').textContent = 'Eseri ve Kartları Oluştur';
            document.getElementById('card-list-title').innerHTML = 'Eklenecek Kartlar (<span id="new-work-card-count">0</span>)';
            document.getElementById('create-from-template-tab-btn').style.display = 'inline-flex'; 
            document.getElementById('create-work-tabs-nav').style.display = 'flex';
        }
    });

    document.getElementById('create-work-confirm-btn').addEventListener('click', async () => {
        if (funcs.isEditMode && funcs.currentEditingProjectName) {
            const projectToUpdate = funcs.allData.projects[funcs.currentEditingProjectName];
            if (!projectToUpdate) { UI.showInfoModal('Düzenlenecek eser bulunamadı.', 'error'); return; }
            const newName = document.getElementById('new-project-name').value.trim();
            if (!newName) { UI.showInfoModal('Lütfen bir eser adı girin.', 'error'); return; }
            if (newName !== funcs.currentEditingProjectName && funcs.allData.projects[newName]) { UI.showInfoModal(`'${newName}' adında bir eser zaten mevcut.`, 'error'); return; }
            const baseTempo = parseInt(document.getElementById('new-project-base-tempo').value, 10);
            const targetTempo = parseInt(document.getElementById('new-project-target-tempo').value, 10);
            projectToUpdate.baseTempo = isNaN(baseTempo) ? null : baseTempo;
            projectToUpdate.targetTempo = isNaN(targetTempo) ? null : targetTempo;
            projectToUpdate.sections = funcs.newWorkCards;
            if (newName !== funcs.currentEditingProjectName) {
                funcs.allData.projects[newName] = projectToUpdate;
                delete funcs.allData.projects[funcs.currentEditingProjectName];
                funcs.setActiveProject(newName);
            }
            await firebase.saveUserData(funcs.userId, funcs.allData);
            UI.closeModal('create-work-modal');
            UI.showInfoModal(`'${newName}' başarıyla güncellendi!`, 'success');
            funcs.setIsEditMode(false);
            funcs.setCurrentEditingProjectName(null);
            UIRender.renderUI();
        } else {
            const projectName = document.getElementById('new-project-name').value.trim();
            if (!projectName) { UI.showInfoModal('Lütfen bir eser adı girin.', 'error'); return; }
            if (projectName.includes('.') || projectName.includes('/')) { UI.showInfoModal('Eser adı "." veya "/" karakterlerini içeremez.', 'error'); return; }
            if (funcs.allData.projects[projectName]) { UI.showInfoModal('Bu isimde bir eser zaten mevcut.', 'error'); return; }
            if (funcs.newWorkCards.length === 0) { UI.showInfoModal('Lütfen esere en az bir çalışma kartı ekleyin.', 'error'); return; }
            const baseTempo = parseInt(document.getElementById('new-project-base-tempo').value, 10);
            const targetTempo = parseInt(document.getElementById('new-project-target-tempo').value, 10);
            const newProject = {
                sections: funcs.newWorkCards,
                boxDefinitions: JSON.parse(JSON.stringify(defaultBoxSettings)),
                masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
                baseTempo: isNaN(baseTempo) ? null : baseTempo,
                targetTempo: isNaN(targetTempo) ? null : targetTempo
            };
            funcs.allData.projects[projectName] = newProject;
            try {
                await firebase.saveUserData(funcs.userId, funcs.allData);
                funcs.setActiveProject(projectName);
                await funcs.checkAndAwardBadges();
                UIRender.renderUI();
                UI.closeModal('create-work-modal');
                const mobileAddBtn = document.querySelector('.mobile-nav-link[data-view="add"]');
                if (mobileAddBtn) mobileAddBtn.classList.remove('active');
                UI.showInfoModal(`'${projectName}' eseri ve ${funcs.newWorkCards.length} kart başarıyla oluşturuldu!`, 'success');
            } catch (error) {
                console.error("Yeni proje kaydedilirken hata:", error);
                UI.showInfoModal("Proje kaydedilirken bir hata oluştu.", "error");
                delete funcs.allData.projects[projectName];
            }
        }
    });

    document.getElementById('create-blank-tab-btn').addEventListener('click', () => funcs.switchCreateTab('blank'));
    document.getElementById('create-from-template-tab-btn').addEventListener('click', () => { UIRender.renderTemplateListForCreateModal(); funcs.switchCreateTab('template'); });
    
    document.getElementById('create-from-template-panel').addEventListener('click', async (e) => {
        const categoryToggle = e.target.closest('[data-action="toggle-category"]');
        if (categoryToggle) {
            const targetElement = document.querySelector(categoryToggle.dataset.target);
            const arrowIcon = categoryToggle.querySelector('.toggle-arrow');
            if(targetElement) targetElement.classList.toggle('open');
            if(arrowIcon) arrowIcon.classList.toggle('open');
            return;
        }

        const targetButton = e.target.closest('.add-work-template-btn');
        if (!targetButton) return;
        const workName = targetButton.dataset.workName;
        if (funcs.allData.projects[workName]) { UI.showInfoModal(`"${workName}" adında bir eser zaten mevcut.`, 'error'); return; }
        
        const work = funcs.globalTemplates.flatMap(cat => cat.works || []).find(w => w.name === workName && w.approved);
        if (!work) { UI.showInfoModal("Onaylı şablon bulunamadı.", "error"); return; }
        
        document.getElementById('template-settings-info').textContent = `'${work.name}' eserini kendi tempolarınızla oluşturun. Önerilen değerler aşağıda doldurulmuştur.`;
        document.getElementById('template-name-to-create').value = work.name;
        document.getElementById('template-base-tempo').value = work.baseTempo || '';
        document.getElementById('template-target-tempo').value = work.targetTempo || '';
        UI.showModal('template-settings-modal');
    });

    document.getElementById('confirm-template-creation-btn').addEventListener('click', async () => {
        const workName = document.getElementById('template-name-to-create').value;
        const baseTempo = parseInt(document.getElementById('template-base-tempo').value, 10);
        const targetTempo = parseInt(document.getElementById('template-target-tempo').value, 10);

        if (!workName) { UI.showInfoModal("Bir hata oluştu. Lütfen işlemi tekrar başlatın.", "error"); return; }
        
        const work = funcs.globalTemplates.flatMap(cat => cat.works || []).find(w => w.name === workName && w.approved);
        if (!work) { UI.showInfoModal("Şablon verisi bulunamadı, işlem iptal edildi.", "error"); return; }
        
        const newProject = {
            sections: work.cards.map(card => ({ ...card, id: 'section-' + Date.now() + Math.random().toString(36).substr(2, 9), box: 1, lastMoved: null, successCount: 0, baseTempo: card.baseTempo || (isNaN(baseTempo) ? null : baseTempo), targetTempo: card.targetTempo || (isNaN(targetTempo) ? null : targetTempo), currentTempo: card.baseTempo || (isNaN(baseTempo) ? null : baseTempo) })),
            boxDefinitions: JSON.parse(JSON.stringify(defaultBoxSettings)),
            masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
            baseTempo: isNaN(baseTempo) ? null : baseTempo,
            targetTempo: isNaN(targetTempo) ? null : targetTempo
        };
        funcs.allData.projects[work.name] = newProject;
        
        try {
            await firebase.saveUserData(funcs.userId, funcs.allData);
            funcs.setActiveProject(work.name);
            await funcs.checkAndAwardBadges();
            UIRender.renderUI();
            UI.closeModal('template-settings-modal');
            UI.closeModal('create-work-modal');
            UI.showInfoModal(`'${work.name}' eseri başarıyla oluşturuldu!`, 'success');
        } catch (error) {
            console.error("Şablondan proje kaydedilirken hata:", error);
            UI.showInfoModal("Proje kaydedilirken bir hata oluştu.", "error");
            delete funcs.allData.projects[work.name];
            funcs.setCurrentView('summary');
            UIRender.renderUI();
        }
    });

    // --- KART YÖNETİMİ ---
    document.getElementById('add-section-btn').addEventListener('click', async () => {
        const name = document.getElementById('section-name-input').value.trim();
        if (name === '') { UI.showInfoModal('Lütfen bir kart başlığı girin.', 'error'); return; }
        const baseTempo = parseInt(document.getElementById('base-tempo-input').value, 10);
        const targetTempo = parseInt(document.getElementById('target-tempo-input').value, 10);
        const tagsInput = document.getElementById('section-tags-input').value.trim();
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
        
        const newSection = {
            id: 'section-' + Date.now() + Math.random().toString(36).substr(2, 9), name,
            description: document.getElementById('section-desc-input').value.trim(),
            notes: document.getElementById('section-notes-input').value.trim(),
            tags: tags,
            box: 1, lastMoved: null, successCount: 0,
            baseTempo: isNaN(baseTempo) ? null : baseTempo, targetTempo: isNaN(targetTempo) ? null : targetTempo,
            currentTempo: isNaN(baseTempo) ? null : baseTempo
        };
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project.sections) project.sections = [];
        project.sections.push(newSection);
        await firebase.saveUserData(funcs.userId, funcs.allData);
        await funcs.checkAndAwardBadges();
        UIRender.renderCardManagementView();
        UI.closeModal('add-card-modal');
        UI.showInfoModal("Yeni kart başarıyla eklendi!", "success");
    });

    document.getElementById('save-edit-card-btn').addEventListener('click', async () => {
        const projectName = document.getElementById('edit-card-modal').dataset.project;
        const cardId = document.getElementById('edit-card-id').value;
        if (!projectName) return;
        const project = funcs.allData.projects[projectName];
        const sectionToEdit = project.sections.find(s => s.id === cardId);
        if (sectionToEdit) {
            sectionToEdit.name = document.getElementById('edit-card-name').value.trim();
            sectionToEdit.description = document.getElementById('edit-card-desc').value.trim();
            sectionToEdit.notes = document.getElementById('edit-card-notes').value.trim();
            const tagsInput = document.getElementById('edit-card-tags').value.trim();
            sectionToEdit.tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
            const baseTempo = parseInt(document.getElementById('edit-base-tempo').value, 10);
            const targetTempo = parseInt(document.getElementById('edit-target-tempo').value, 10);
            sectionToEdit.baseTempo = isNaN(baseTempo) ? null : baseTempo;
            sectionToEdit.targetTempo = isNaN(targetTempo) ? null : targetTempo;
            if (sectionToEdit.currentTempo !== baseTempo) sectionToEdit.currentTempo = sectionToEdit.baseTempo;
            await firebase.saveUserData(funcs.userId, funcs.allData);
            UI.closeModal('edit-card-modal');
            UIRender.renderCardManagementView();
        }
    });

// event_handlers.js

// ... (dosyanın başındaki importlar ve diğer fonksiyonlar aynı kalacak)

// Bu fonksiyonu bulun ve içeriğini aşağıdaki gibi güncelleyin
document.getElementById('card-management-view')?.addEventListener('click', async (e) => {
    const chainingBtn = e.target.closest('#start-chaining-session-btn');
    const interleavedBtn = e.target.closest('#start-interleaved-session-btn');
    const sequentialBtn = e.target.closest('#start-sequential-session-btn');

    if (interleavedBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections) return;
        
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
        const studiableCards = project.sections.filter(s => !(s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold));
        const cardsToStudy = studiableCards.map(card => ({...card, projectName: funcs.allData.activeProject}));
        
        if (cardsToStudy.length > 0) {
            StudyLogic.startStudySession(cardsToStudy);
        } else {
            UI.showInfoModal('Bu eserde şu an çalışılacak hiç kart bulunmuyor.', 'info');
        }
        return;
    }

    if (chainingBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections || project.sections.length < 2) {
            UI.showInfoModal('Geçiş pratiği için en az 2 kart gereklidir.', 'info');
            return;
        }
        const cardsToChain = [...project.sections].map(card => ({...card, projectName: funcs.allData.activeProject}));
        StudyLogic.startStudySession(cardsToChain, 'chaining');
        return;
    }
    
    if (sequentialBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections || project.sections.length === 0) return;
        const cardsToStudy = [...project.sections].map(card => ({...card, projectName: funcs.allData.activeProject}));
        StudyLogic.startStudySession(cardsToStudy, 'sequential');
        return;
    }
    
    // --- AKORDİYON MANTIĞI DÜZELTMESİ BAŞLANGICI ---
    const accordionHeader = e.target.closest('.accordion-header');
    if (accordionHeader) {
        // Tıklanan başlığın hemen altındaki içerik bölümünü bul
        const content = accordionHeader.nextElementSibling;
        // Başlığın içindeki ok ikonunu bul
        const arrow = accordionHeader.querySelector('.accordion-arrow');

        // İçerik ve ok elemanlarının 'open' sınıfını değiştir (varsa kaldır, yoksa ekle)
        if (content && content.classList.contains('accordion-content')) {
            content.classList.toggle('open');
        }
        if (arrow) {
            arrow.classList.toggle('open');
        }
        // Akordiyon işlemi yapıldığı için fonksiyonun geri kalanının çalışmasını engelle
        return; 
    }
    // --- AKORDİYON MANTIĞI DÜZELTMESİ SONU ---

    const deleteButton = e.target.closest('button[data-action="delete"]');
    if (deleteButton) {
        const cardElement = deleteButton.closest('[data-id]');
        const cardId = cardElement.dataset.id;
        const projectName = funcs.allData.activeProject;
        if (await UI.createConfirmationModal("Bu kartı kalıcı olarak silmek istediğinizden emin misiniz?", "Evet, Sil", "btn-danger")) {
            const project = funcs.allData.projects[projectName];
            project.sections = project.sections.filter(s => s.id !== cardId);
            await firebase.saveUserData(funcs.userId, funcs.allData);
            UIRender.renderCardManagementView();
        }
        return;
    }

    const editButton = e.target.closest('button[data-action="edit"]');
    if (editButton) {
        const cardElement = editButton.closest('[data-id]');
        const cardId = cardElement.dataset.id;
        const projectName = funcs.allData.activeProject;
        const project = funcs.allData.projects[projectName];
        const sectionToEdit = project.sections.find(s => s.id === cardId);
        if (sectionToEdit) {
            document.getElementById('edit-card-modal').dataset.project = projectName;
            document.getElementById('edit-card-id').value = sectionToEdit.id;
            document.getElementById('edit-card-name').value = sectionToEdit.name || '';
            document.getElementById('edit-card-desc').value = sectionToEdit.description || '';
            document.getElementById('edit-card-notes').value = sectionToEdit.notes || '';
            document.getElementById('edit-card-tags').value = (sectionToEdit.tags || []).join(', ');
            const tempos = funcs.getCardEffectiveTempos(sectionToEdit, project);
            document.getElementById('edit-base-tempo').value = tempos.base || '';
            document.getElementById('edit-target-tempo').value = tempos.target || '';
            UI.showModal('edit-card-modal');
        }
        return;
    }
    
    const studyBoxBtn = e.target.closest('.study-box-btn');
    if (studyBoxBtn) {
        const boxNumber = parseInt(studyBoxBtn.dataset.boxNumber, 10);
        const project = funcs.allData.projects[funcs.allData.activeProject];
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
        const cardsInBox = project.sections
            .filter(s => (s.box || 1) === boxNumber && !(s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold))
            .map(card => ({...card, projectName: funcs.allData.activeProject}));
        if (cardsInBox.length > 0) {
            StudyLogic.startStudySession(cardsInBox);
        } else {
            UI.showInfoModal('Bu kutuda çalışılacak aktif kart bulunmuyor.', 'info');
        }
    }
});



document.getElementById('card-management-view')?.addEventListener('click', async (e) => {
    const chainingBtn = e.target.closest('#start-chaining-session-btn');
    const interleavedBtn = e.target.closest('#start-interleaved-session-btn');
    const sequentialBtn = e.target.closest('#start-sequential-session-btn'); // YENİ EKLENDİ

    if (interleavedBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections) return;
        
        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
        const boxDefs = project.boxDefinitions || defaultBoxSettings;
        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
        const studiableCards = project.sections.filter(s => !(s.box >= maxBoxNumber && (s.successCount || 0) >= masteryThreshold));
        const cardsToStudy = studiableCards.map(card => ({...card, projectName: funcs.allData.activeProject}));
        
        if (cardsToStudy.length > 0) {
            StudyLogic.startStudySession(cardsToStudy); // Bu mod varsayılan olarak 'normal' (harmanlanmış) başlar
        } else {
            UI.showInfoModal('Bu eserde şu an çalışılacak hiç kart bulunmuyor.', 'info');
        }
        return;
    }

    if (chainingBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections || project.sections.length < 2) {
            UI.showInfoModal('Geçiş pratiği için en az 2 kart gereklidir.', 'info');
            return;
        }
        const cardsToChain = [...project.sections].map(card => ({...card, projectName: funcs.allData.activeProject}));
        StudyLogic.startStudySession(cardsToChain, 'chaining');
        return;
    }
    
    // --- YENİ EKLENEN BLOK ---
    if (sequentialBtn) {
        if (!funcs.allData.activeProject) return;
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if (!project || !project.sections || project.sections.length === 0) return;

        // Kartları karıştırmadan, olduğu gibi alıyoruz.
        const cardsToStudy = [...project.sections].map(card => ({...card, projectName: funcs.allData.activeProject}));
        StudyLogic.startStudySession(cardsToStudy, 'sequential');
        return;
    }
    // --- YENİ BLOK SONU ---

    const accordionHeader = e.target.closest('.accordion-header');
    if (accordionHeader) {
        // ... (accordion mantığı aynı kalacak)
    }

    const deleteButton = e.target.closest('button[data-action="delete"]');
    if (deleteButton) {
        // ... (delete butonu mantığı aynı kalacak)
    }

    const editButton = e.target.closest('button[data-action="edit"]');
    if (editButton) {
        // ... (edit butonu mantığı aynı kalacak)
    }
    
    const studyBoxBtn = e.target.closest('.study-box-btn');
    if (studyBoxBtn) {
        // ... (study box butonu mantığı aynı kalacak)
    }
});

// ... (dosyanın geri kalan tüm kodları aynı)


    // --- PROJE AYARLARI ---
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        const project = funcs.allData.projects[funcs.allData.activeProject];
        if(!project) return;
        const newMasteryThreshold = parseInt(document.getElementById('mastery-threshold-input').value, 10);
        if (isNaN(newMasteryThreshold) || newMasteryThreshold < 1) { UI.showInfoModal('Lütfen geçerli bir ustalık eşiği girin.', 'error'); return; }
        project.masteryThreshold = newMasteryThreshold;
        const baseTempo = parseInt(document.getElementById('settings-base-tempo').value, 10);
        const targetTempo = parseInt(document.getElementById('settings-target-tempo').value, 10);
        project.baseTempo = isNaN(baseTempo) ? null : baseTempo;
        project.targetTempo = isNaN(targetTempo) ? null : targetTempo;
        await firebase.saveUserData(funcs.userId, funcs.allData);
        UIRender.renderCardManagementView(); 
        UI.closeModal('settings-modal');
    });

    document.getElementById('project-container').addEventListener('click', async (e) => {
        const tabButton = e.target.closest('.project-tab-btn');
        if (tabButton) {
            const view = tabButton.dataset.view;
            funcs.setProjectSubView(view);
            UIRender.renderUI();
            return; // Diğer tıklama olaylarıyla çakışmasın
        }
        const button = e.target.closest('button');
        if (!button || !button.id) return;
        const activeProject = funcs.allData.activeProject;
        if (!activeProject) return;
    
        if (button.id === 'delete-project-btn') {
            if (await UI.createConfirmationModal(`"${activeProject}" eserini ve içindeki tüm kartları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                try {
                    await firebase.deleteProject(funcs.userId, activeProject);
                    delete funcs.allData.projects[activeProject];
                    funcs.setCurrentView('summary');
                    UI.showInfoModal(`'${activeProject}' adlı eser kalıcı olarak silindi.`, 'success');
                    UIRender.renderUI();
                    await funcs.checkAndAwardBadges();
                } catch (error) {
                    console.error("Proje silinirken hata oluştu:", error);
                    UI.showInfoModal("Proje silinirken bir hata oluştu. Lütfen tekrar deneyin.", "error");
                }
            }
        }
    
        if (button.id === 'suggest-as-template-btn') {
            const confirmation = await UI.createConfirmationModal(`'${activeProject}' adlı eserinizi admin onayı için bir şablon olarak göndermek istediğinizden emin misiniz?`, "Evet, Gönder", "btn-primary");
            if (confirmation) {
                const projectData = funcs.allData.projects[activeProject];
                const templateSubmission = {
                    name: activeProject,
                    cards: projectData.sections.map(({ name, description, notes, baseTempo, targetTempo }) => ({ name: name || '', description: description || '', notes: notes || null, baseTempo: baseTempo || null, targetTempo: targetTempo || null })),
                    submittedBy: funcs.userId, submittedByName: funcs.currentUser.displayName, submittedAt: new Date().toISOString(), status: 'pending' 
                };
                try {
                    await firebase.submitTemplate(templateSubmission);
                    UI.showInfoModal("Öneriniz başarıyla gönderildi! Onaylandıktan sonra şablonlar listesinde görünecektir.", "success");
                } catch (error) {
                    UI.showInfoModal("Öneriniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.", "error");
                }
            }
        }
    
        if (button.id === 'repetition-settings-btn') {
            const project = funcs.allData.projects[activeProject];
            if (!project) return;
            document.getElementById('settings-project-name').textContent = `"${activeProject}" için Ayarlar`;
            document.getElementById('mastery-threshold-input').value = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
            document.getElementById('settings-base-tempo').value = project.baseTempo || '';
            document.getElementById('settings-target-tempo').value = project.targetTempo || '';
            UI.showModal('settings-modal');
        }
        
        if (button.id === 'rename-project-btn') {
            const projectToEdit = funcs.allData.projects[activeProject];
            if (!projectToEdit) return;
            funcs.setIsEditMode(true);
            funcs.setCurrentEditingProjectName(activeProject);
            document.getElementById('new-project-name').value = activeProject;
            document.getElementById('new-project-base-tempo').value = projectToEdit.baseTempo || '';
            document.getElementById('new-project-target-tempo').value = projectToEdit.targetTempo || '';
            funcs.setNewWorkCards(JSON.parse(JSON.stringify(projectToEdit.sections || [])));
            UIRender.renderNewWorkCardList();
            document.getElementById('create-work-modal').querySelector('h3').textContent = 'Eseri Düzenle';
            document.getElementById('create-work-confirm-btn').textContent = 'Değişiklikleri Kaydet';
            document.getElementById('create-work-tabs-nav').style.display = 'none';
            document.getElementById('create-from-template-tab-btn').style.display = 'none';
            funcs.switchCreateTab('blank');
            const cardCount = (projectToEdit.sections || []).length;
            document.getElementById('card-list-title').innerHTML = `Mevcut Kartlar (${cardCount}) <br><small class="font-normal text-slate-500 text-sm">Düzenlemek için bir karta tıkla.</small>`;
            UI.showModal('create-work-modal');
        }
    });

    const reportsAndSessionsContainer = document.getElementById('reports-and-sessions-container');
    if (reportsAndSessionsContainer) {
        reportsAndSessionsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('tag-filter-btn')) {
                button.classList.toggle('active');
                const anyActive = reportsAndSessionsContainer.querySelector('.tag-filter-btn.active');
                document.getElementById('start-playlist-session-btn').disabled = !anyActive;
                return;
            }

            if (button.id === 'start-playlist-session-btn') {
                const activeTagButtons = reportsAndSessionsContainer.querySelectorAll('.tag-filter-btn.active');
                const selectedTags = Array.from(activeTagButtons).map(btn => btn.textContent.substring(1));
                
                if (selectedTags.length > 0) {
                    const cards = funcs.getCardsByTags(selectedTags);
                    if (cards.length > 0) {
                        StudyLogic.startStudySession(cards);
                    } else {
                        UI.showInfoModal('Seçtiğiniz etiketlerin tümünü içeren bir kart bulunamadı.', 'info');
                    }
                }
                return;
            }

            if (button.id.startsWith('start-') && button.id !== 'start-playlist-session-btn') {
                const type = button.id.substring(button.id.indexOf('-') + 1, button.id.lastIndexOf('-'));
                const project = document.getElementById(`filter-${type}-project`)?.value;
                let cards;
                switch(type) {
                    case 'promotion-candidates': cards = funcs.getPromotionCandidateCards(10, project); break;
                    case 'rusty-cards': cards = funcs.getRustyCards(7, 10, project); break;
                    case 'hardest-cards': cards = funcs.getHardestCards(10, project); break;
                    case 'random-cards': cards = funcs.getRandomCards(15, project); break;

                }
                if (cards && cards.length > 0) {
                    StudyLogic.startStudySession(cards);
                } else {
                    UI.showInfoModal('Bu kriterlere uygun hiç kartınız bulunmuyor.', 'info');
                }
            }
        });
    }

    document.getElementById('achievements-container').addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-mastery-log-btn');
        if (!deleteBtn) return;
        const projectName = deleteBtn.dataset.projectName;
        if (await UI.createConfirmationModal(`"${projectName}" eserini Ustalaşılan Eserler Kütüphanesi'nden kalıcı olarak silmek istediğinizden emin misiniz?`, "Evet, Sil", "btn-danger")) {
            if (funcs.allData.masteredProjectsLog) {
                funcs.allData.masteredProjectsLog = funcs.allData.masteredProjectsLog.filter(log => log.name !== projectName);
                await firebase.saveUserData(funcs.userId, funcs.allData);
                UIRender.renderAchievementsPage();
                UI.showInfoModal(`'${projectName}' kütüphaneden başarıyla silindi.`, 'success');
            }
        }
    });

    document.getElementById('study-controls').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if(!target) return;
        const targetId = target.id;
        if (targetId === 'show-answer-btn') StudyLogic.showStudyCardAnswer();
        else if (targetId === 'study-correct-btn') StudyLogic.handleStudyAnswer(true);
        else if (targetId === 'study-incorrect-btn') StudyLogic.handleStudyAnswer(false);
    });

    document.getElementById('pomodoro-toggle-btn').addEventListener('click', () => funcs.pomodoroService.toggle());
    document.getElementById('pomodoro-reset-btn').addEventListener('click', () => funcs.pomodoroService.reset());
    document.getElementById('start-stop-metronome-btn').addEventListener('click', () => funcs.metronomeService.toggle());
    document.getElementById('metronome-tab-btn').addEventListener('click', () => { funcs.tunerService.stop(); document.getElementById('metronome-tab-btn').classList.add('border-indigo-500', 'text-indigo-600'); document.getElementById('metronome-tab-btn').classList.remove('border-transparent', 'text-gray-500'); document.getElementById('tuner-tab-btn').classList.add('border-transparent', 'text-gray-500'); document.getElementById('tuner-tab-btn').classList.remove('border-indigo-500', 'text-indigo-600'); document.getElementById('metronome-panel').classList.remove('hidden'); document.getElementById('tuner-panel').classList.add('hidden'); });
    document.getElementById('tuner-tab-btn').addEventListener('click', () => { funcs.metronomeService.stop(); document.getElementById('tuner-tab-btn').classList.add('border-indigo-500', 'text-indigo-600'); document.getElementById('tuner-tab-btn').classList.remove('border-transparent', 'text-gray-500'); document.getElementById('metronome-tab-btn').classList.add('border-transparent', 'text-gray-500'); document.getElementById('metronome-tab-btn').classList.remove('border-indigo-500', 'text-indigo-600'); document.getElementById('tuner-panel').classList.remove('hidden'); document.getElementById('metronome-panel').classList.add('hidden'); });

    document.getElementById('daily-goal-modal').addEventListener('click', (e) => { if (e.target.matches('.goal-preset-btn')) { document.getElementById('daily-goal-input-hours').value = parseInt(e.target.dataset.value, 10) / 60; } });
    document.getElementById('save-daily-goal-btn').addEventListener('click', async () => {
        const newGoalInHours = parseFloat(document.getElementById('daily-goal-input-hours').value);
        if (isNaN(newGoalInHours) || newGoalInHours <= 0) { UI.showInfoModal("Lütfen 0'dan büyük geçerli bir saat girin (örn: 0.5 veya 1).", "error"); return; }
        if (newGoalInHours > 8) { UI.showInfoModal("<strong>Sağlıklı ve Sürdürülebilir Pratik:</strong> Günde 8 saat, bir müzisyen için tam zamanlı bir iş kadar yoğun bir pratiktir. Bu sınır, kullanıcıları aşırı ve sağlıksız hedefler koymaktan korur.", 'info'); return; }
        funcs.allData.dailyGoalInMinutes = Math.round(newGoalInHours * 60);
        await firebase.saveUserData(funcs.userId, funcs.allData);
        UI.closeModal('daily-goal-modal');
        UI.showInfoModal("Günlük hedefin başarıyla güncellendi!", "success");
        UIRender.renderUI(); 
    });

    document.getElementById('mobile-bottom-nav')?.addEventListener('click', (e) => {
        e.preventDefault();
        const navLink = e.target.closest('.mobile-nav-link');
        if (navLink && navLink.dataset.view) {
            funcs.setCurrentView(navLink.dataset.view);
            UIRender.renderUI();
        }
        const addBtn = e.target.closest('#mobile-nav-add-btn');
        if (addBtn) { document.getElementById('open-create-work-modal-btn').click(); }
    });

    document.getElementById('more-view-container')?.addEventListener('click', (e) => {
        const link = e.target.closest('.more-view-link');
        const signOutButton = e.target.closest('#sign-out-btn');
        const themeToggleInput = e.target.closest('#theme-toggle-mobile');

        if (link) {
            e.preventDefault();
            const action = link.dataset.action;
            const actionMap = { 'show-all-projects': 'all-projects', 'show-achievements': 'achievements', 'show-statistics': 'statistics', 'show-reports-and-sessions': 'reports-and-sessions' };
            if (actionMap[action]) { funcs.setCurrentView(actionMap[action]); UIRender.renderUI(); }
            else if (action === 'open-methodology-modal') UI.showModal('methodology-modal');
            else if (action === 'open-tools-modal') UI.showModal('tools-modal');
            else if (action === 'open-daily-goal-modal') document.getElementById('open-daily-goal-modal-btn').click();
        }
        if (signOutButton) { e.preventDefault(); firebase.signOutUser(); }
        if (themeToggleInput) {
            if (themeToggleInput.checked) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
            else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (document.documentElement.classList.contains('dark')) themeToggle.checked = true;
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    });
    
    document.getElementById('onboarding-next-btn').addEventListener('click', funcs.goToNextOnboardingStep);
    document.getElementById('onboarding-back-btn').addEventListener('click', funcs.goToPreviousOnboardingStep);
    document.getElementById('onboarding-finish-btn').addEventListener('click', funcs.completeOnboarding);
    document.getElementById('onboarding-skip-btn').addEventListener('click', funcs.completeOnboarding);

    const rehearsalContainer = document.getElementById('rehearsal-page-container');
    if (rehearsalContainer) {
        rehearsalContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.id === 'start-full-rehearsal-btn') {
                const allRehearsalCards = [];
                Object.entries(funcs.allData.projects || {}).forEach(([projectName, project]) => {
                    const performanceCards = (project.sections || []).filter(section => {
                        const boxDefs = project.boxDefinitions || defaultBoxSettings;
                        const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
                        const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
                        return section.box === 9 && !(section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold);
                    }).map(card => ({ ...card, projectName }));
                    if (performanceCards.length > 0) {
                        allRehearsalCards.push(...performanceCards);
                    }
                });
                if (allRehearsalCards.length > 0) {
                    StudyLogic.startStudySession(allRehearsalCards);
                } else {
                    UI.showInfoModal('Provaya alınacak hiç eseriniz bulunmuyor.', 'info');
                }
            }
            if (button.classList.contains('start-single-rehearsal-btn')) {
                const projectName = button.dataset.projectName;
                const project = funcs.allData.projects[projectName];
                if (!project) return;
                const singleRehearsalCards = (project.sections || []).filter(section => {
                    const boxDefs = project.boxDefinitions || defaultBoxSettings;
                    const masteryThreshold = project.masteryThreshold || DEFAULT_MASTERY_THRESHOLD;
                    const maxBoxNumber = boxDefs.length > 0 ? Math.max(...boxDefs.map(b => b.number)) : 0;
                    return section.box === 9 && !(section.box >= maxBoxNumber && (section.successCount || 0) >= masteryThreshold);
                }).map(card => ({ ...card, projectName }));
                if (singleRehearsalCards.length > 0) {
                    StudyLogic.startStudySession(singleRehearsalCards);
                }
            }
            if (button.id === 'go-to-journey-btn') {
                funcs.setCurrentView('mastery-journey');
                UIRender.renderUI();
            }
        });
    }
    
    let editingCommentId = null;
    const resetCommentForm = () => {
        editingCommentId = null;
        document.getElementById('new-comment-textarea').value = '';
        document.getElementById('submit-comment-btn').textContent = 'Gönder';
        const existingCancelBtn = document.getElementById('cancel-comment-edit-btn');
        if (existingCancelBtn) existingCancelBtn.remove();
    };
    document.body.addEventListener('click', async (e) => {
        if (e.target.closest('#view-template-comments-btn')) {
            const activeProjectName = funcs.allData.activeProject;
            if (!activeProjectName) return;
            document.getElementById('comments-modal-title').textContent = `'${activeProjectName}' için İpuçları`;
            document.getElementById('new-comment-user-photo').src = funcs.currentUser.photoURL;
            resetCommentForm();
            window.activeCommentListener = firebase.listenForTemplateComments(activeProjectName, (comments) => {
                UIRender.renderTemplateComments(comments);
            });
            UI.showModal('template-comments-modal');
        }
        if (e.target.closest('#submit-comment-btn')) {
            const commentText = document.getElementById('new-comment-textarea').value.trim();
            if (commentText === '') return;
            const activeProjectName = funcs.allData.activeProject;
            const submitBtn = e.target.closest('#submit-comment-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Kaydediliyor...';
            try {
                if (editingCommentId) {
                    await firebase.updateCommentInTemplate(activeProjectName, editingCommentId, commentText);
                } else {
                    const commentData = {
                        text: commentText,
                        userId: funcs.userId,
                        userName: funcs.currentUser.displayName,
                        userPhotoURL: funcs.currentUser.photoURL,
                        createdAt: new Date()
                    };
                    await firebase.addCommentToTemplate(activeProjectName, commentData);
                }
                resetCommentForm();
            } catch (error) {
                UI.showInfoModal('İşlem sırasında bir hata oluştu.', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        }
        if (e.target.closest('.edit-comment-btn')) {
            const button = e.target.closest('.edit-comment-btn');
            editingCommentId = button.dataset.commentId;
            const textToEdit = document.querySelector(`[data-comment-text-id="${editingCommentId}"]`).textContent;
            const textarea = document.getElementById('new-comment-textarea');
textarea.value = textToEdit;
            textarea.focus();
            document.getElementById('submit-comment-btn').textContent = 'Değişikliği Kaydet';
            const existingCancelBtn = document.getElementById('cancel-comment-edit-btn');
            if (!existingCancelBtn) {
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancel-comment-edit-btn';
                cancelBtn.textContent = 'İptal';
                cancelBtn.className = 'btn btn-secondary';
                cancelBtn.onclick = resetCommentForm;
                document.getElementById('submit-comment-btn').parentNode.prepend(cancelBtn);
            }
        }
        if (e.target.closest('.delete-comment-btn')) {
            const button = e.target.closest('.delete-comment-btn');
            const commentIdToDelete = button.dataset.commentId;
            if (await UI.createConfirmationModal("Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?", "Evet, Sil", "btn-danger")) {
                const activeProjectName = funcs.allData.activeProject;
                try {
                    await firebase.deleteCommentFromTemplate(activeProjectName, commentIdToDelete);
                } catch (error) {
                    UI.showInfoModal('Yorum silinirken bir hata oluştu.', 'error');
                }
            }
        }
    });
    
    let mediaRecorder;
    let audioChunks = [];
    document.getElementById('study-modal').addEventListener('click', (e) => {
        if (e.target.closest('#open-recorder-from-study-btn')) {
            const card = funcs.studySession.cards[funcs.studySession.currentIndex];
            document.getElementById('recorder-modal-title').textContent = `${card.name} | Kayıt Stüdyosu`;
            document.getElementById('audio-playback').classList.add('hidden');
            document.getElementById('download-link').classList.add('hidden');
            document.getElementById('recorder-status').textContent = 'Kayıt yapmak için butona basın';
            UI.showModal('recorder-modal');
        }
    });
    document.getElementById('record-button').addEventListener('click', async () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            document.getElementById('record-button').classList.remove('is-recording');
            document.getElementById('stop-icon').classList.add('hidden');
            document.getElementById('record-icon').classList.remove('hidden');
            document.getElementById('recorder-status').textContent = 'Kayıt işleniyor...';
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const playback = document.getElementById('audio-playback');
                    playback.src = audioUrl;
                    playback.classList.remove('hidden');
                    const downloadLink = document.getElementById('download-link');
                    downloadLink.href = audioUrl;
                    const card = funcs.studySession.cards[funcs.studySession.currentIndex];
                    downloadLink.download = `${card.projectName.replace(/ /g, '_')}-${card.name.replace(/ /g, '_')}.wav`;
                    downloadLink.classList.remove('hidden');
                    document.getElementById('recorder-status').textContent = 'Kayıt tamamlandı. Dinleyebilir veya indirebilirsiniz.';
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorder.start();
                document.getElementById('record-button').classList.add('is-recording');
                document.getElementById('record-icon').classList.add('hidden');
                document.getElementById('stop-icon').classList.remove('hidden');
                document.getElementById('recorder-status').textContent = 'Kayıt yapılıyor...';
            } catch (err) {
                console.error("Mikrofon hatası:", err);
                UI.showInfoModal("Mikrofon erişimi reddedildi veya bir hata oluştu. Lütfen tarayıcı ayarlarınızı kontrol edin.", "error");
            }
        }
    });

    
}