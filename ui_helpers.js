// ui_helpers.js

/**
 * Belirtilen ID'ye sahip modal pencereyi gösterir.
 * @param {string} id Gösterilecek modal'ın ID'si.
 */
export function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Belirtilen ID'ye sahip modal pencereyi kapatır.
 * @param {string} id Kapatılacak modal'ın ID'si.
 */
export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        // YENİ EKLENEN BÖLÜM: Yorumlar modalı kapanıyorsa ve aktif bir dinleyici varsa,
        // Firebase ile olan bağlantıyı keserek kaynak sızıntısını önler.
        if (id === 'template-comments-modal' && window.activeCommentListener) {
            window.activeCommentListener(); // Firebase'den gelen unsubscribe fonksiyonunu çağırır.
            window.activeCommentListener = null; // Referansı temizler.
        }

        // Modal kapanırken yapılacak diğer temizlik işlemleri.
        if (id === 'study-modal' && window.endStudySession) {
            window.endStudySession();
        }
        if (id === 'tools-modal' && window.stopMetronome && window.stopTuner) {
            window.stopMetronome();
            window.stopTuner();
        }
        modal.classList.add('hidden');
    }
}

/**
 * Bilgilendirme amaçlı bir modal gösterir (Başarı, Hata, Bilgi).
 * @param {string} message Gösterilecek mesaj.
 * @param {'success'|'error'|'info'} type Mesajın türü (ikonu belirler).
 */
export function showInfoModal(message, type = 'info') {
    const modalText = document.getElementById('info-modal-text');
    const modalButtons = document.getElementById('info-modal-buttons');
    const iconContainer = document.getElementById('info-modal-icon-container');

    if (!modalText || !modalButtons || !iconContainer) return;

    modalText.innerHTML = message;
    modalButtons.innerHTML = `<button class="btn btn-primary w-full">Tamam</button>`;
    
    const icons = {
       success: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
       error: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
       info: `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };
    iconContainer.innerHTML = icons[type] || icons['info'];
    
    modalButtons.firstElementChild.onclick = () => closeModal('info-modal');
    showModal('info-modal');
}

/**
 * Onay gerektiren bir işlem için modal gösterir (Evet/Hayır).
 * @param {string} message Onay mesajı.
 * @param {string} confirmText Onay butonunun metni.
 * @returns {Promise<boolean>} Kullanıcının onay verip vermediğini döner.
 */
export function createConfirmationModal(message, confirmText = "Onayla", confirmClass = "btn-primary") {
    return new Promise((resolve) => {
        const modalText = document.getElementById('info-modal-text');
        const modalButtons = document.getElementById('info-modal-buttons');
        const iconContainer = document.getElementById('info-modal-icon-container');

        if (!modalText || !modalButtons || !iconContainer) {
            resolve(false);
            return;
        }

        modalText.textContent = message;
        iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
        
        modalButtons.innerHTML = `
            <button id="confirm-cancel" class="btn btn-secondary w-full">İptal</button>
            <button id="confirm-ok" class="btn ${confirmClass} w-full">${confirmText}</button>
        `;

        document.getElementById('confirm-ok').onclick = () => { closeModal('info-modal'); resolve(true); };
        document.getElementById('confirm-cancel').onclick = () => { closeModal('info-modal'); resolve(false); };
        showModal('info-modal');
    });
}