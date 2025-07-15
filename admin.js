import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, runTransaction } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyArUctUJhte-hxPeqCQIXJR9f5x-3W18F0",
    authDomain: "leitner-calisma-asistani-bc2b0.firebaseapp.com",
    projectId: "leitner-calisma-asistani-bc2b0",
    storageBucket: "leitner-calisma-asistani-bc2b0.appspot.com",
    messagingSenderId: "690172130029",
    appId: "1:690172130029:web:78d94652bf097128d392e4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const adminUID = "tp7u9wMMn1gIVBM8mClmzWSptX43";

//--- FIREBASE FUNCTIONS ---
async function getPendingSubmissions() {
    const submissionsRef = collection(db, "template_submissions");
    const q = query(submissionsRef, where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const submissions = [];
    querySnapshot.forEach((doc) => { submissions.push({ id: doc.id, ...doc.data() }); });
    return submissions;
}

async function rejectSubmission(submissionId) {
    const submissionRef = doc(db, "template_submissions", submissionId);
    await updateDoc(submissionRef, { status: 'rejected' });
}

// admin.js

async function approveSubmission(submissionId, submissionData, categoryName) {
    const submissionRef = doc(db, "template_submissions", submissionId);
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");

    await runTransaction(db, async (transaction) => {
        const globalTemplatesDoc = await transaction.get(globalTemplatesRef);
        if (!globalTemplatesDoc.exists()) {
            throw new Error("Global şablon dokümanı bulunamadı!");
        }

        const data = globalTemplatesDoc.data();
        const allTemplates = data.templates || [];

        let category = allTemplates.find(c => c.category === categoryName);
        if (!category) {
            category = { category: categoryName, works: [] };
            allTemplates.push(category);
        }

        // --- YENİ VE DOĞRU KOD BURADA BAŞLIYOR ---
        // Onaylanan eseri oluştururken, her bir kartın verisini tek tek alıp,
        // tempo bilgileri de dahil olmak üzere temiz bir nesne oluşturuyoruz.
        const newWork = {
            name: submissionData.name,
            approved: true,
            cards: submissionData.cards.map(card => ({
                name: card.name || '',
                description: card.description || '',
                notes: card.notes || null,
                baseTempo: card.baseTempo || null,
                targetTempo: card.targetTempo || null
            }))
        };
        // --- YENİ KOD BİTİYOR ---

        if (!category.works) {
            category.works = [];
        }
        category.works.push(newWork); // Yeni oluşturduğumuz "temiz" eseri ekliyoruz

        transaction.update(globalTemplatesRef, { templates: allTemplates });
        transaction.update(submissionRef, { status: 'approved', seenByUser: false });
    });
}

async function getGlobalTemplates() {
    const docRef = doc(db, "leitnerGlobalTemplates", "all");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data().templates || []) : [];
}

async function addCategory(categoryName) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        const allTemplates = docSnap.data().templates || [];
        const categoryExists = allTemplates.some(c => c.category.toLowerCase() === categoryName.toLowerCase());
        if (categoryExists) {
            throw new Error(`'${categoryName}' adında bir kategori zaten mevcut.`);
        }
        allTemplates.push({ category: categoryName, works: [] });
        transaction.update(globalTemplatesRef, { templates: allTemplates });
    });
}

async function deleteCategory(categoryName) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        let allTemplates = docSnap.data().templates || [];
        const categoryToDelete = allTemplates.find(c => c.category === categoryName);
        if (!categoryToDelete) throw new Error("Silinecek kategori bulunamadı.");
        if (categoryToDelete.works && categoryToDelete.works.length > 0) {
            throw new Error("İçinde şablon bulunan bir kategoriyi silemezsiniz. Lütfen önce içindeki tüm şablonları silin veya başka bir kategoriye taşıyın.");
        }
        allTemplates = allTemplates.filter(c => c.category !== categoryName);
        transaction.update(globalTemplatesRef, { templates: allTemplates });
    });
}

async function addWorkTemplate(categoryName, workData) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        const allTemplates = docSnap.data().templates || [];
        const category = allTemplates.find(c => c.category === categoryName);
        if (!category) {
            throw new Error(`'${categoryName}' kategorisi bulunamadı.`);
        }
        if (!category.works) category.works = [];
        const workExists = category.works.some(w => w.name.toLowerCase() === workData.name.toLowerCase());
        if (workExists) {
            throw new Error(`'${categoryName}' kategorisinde '${workData.name}' adında bir şablon zaten mevcut.`);
        }
        category.works.push(workData);
        transaction.update(globalTemplatesRef, { templates: allTemplates });
    });
}

async function deleteTemplate(categoryName, workName) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        const allTemplates = docSnap.data().templates || [];
        const category = allTemplates.find(c => c.category === categoryName);
        if (category && category.works) {
            category.works = category.works.filter(w => w.name !== workName);
        }
        transaction.update(globalTemplatesRef, { templates: allTemplates });
    });
}

async function updateCategoryName(oldName, newName) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        const allTemplates = docSnap.data().templates || [];
        const categoryToUpdate = allTemplates.find(c => c.category === oldName);
        if (categoryToUpdate) {
            categoryToUpdate.category = newName;
            transaction.update(globalTemplatesRef, { templates: allTemplates });
        } else {
            throw new Error("Güncellenecek kategori bulunamadı.");
        }
    });
}

async function updateWork(categoryName, originalWorkName, updatedWorkData) {
    const globalTemplatesRef = doc(db, "leitnerGlobalTemplates", "all");
    await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(globalTemplatesRef);
        if (!docSnap.exists()) throw new Error("Şablon dokümanı bulunamadı!");
        const allTemplates = docSnap.data().templates || [];
        const category = allTemplates.find(c => c.category === categoryName);
        if (category && category.works) {
            const workIndex = category.works.findIndex(w => w.name === originalWorkName);
            if (workIndex > -1) {
                if (originalWorkName !== updatedWorkData.name) {
                    const workExists = category.works.some(w => w.name.toLowerCase() === updatedWorkData.name.toLowerCase());
                    if (workExists) throw new Error(`Bu kategoride '${updatedWorkData.name}' adında bir şablon zaten var.`);
                }
                category.works[workIndex] = { ...category.works[workIndex], ...updatedWorkData };
            }
        }
        transaction.update(globalTemplatesRef, { templates: allTemplates });
    });
}

// --- MAIN UI LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const loadingContainer = document.getElementById('loading-container');
    const adminPanelContainer = document.getElementById('admin-panel-container');
    const categoryModal = document.getElementById('category-modal');
    const modalTemplateName = document.getElementById('modal-template-name');
    const categorySelect = document.getElementById('category-select');
    const newCategoryInput = document.getElementById('new-category-input');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const categoryChoiceRadios = document.querySelectorAll('input[name="category_choice"]');
    const editWorkModal = document.getElementById('edit-work-modal');
    const editWorkModalCloseBtn = document.getElementById('edit-work-modal-close-btn');
    const editWorkModalCancelBtn = document.getElementById('edit-work-modal-cancel-btn');
    const editWorkModalSaveBtn = document.getElementById('edit-work-modal-save-btn');
    const editWorkNameInput = document.getElementById('edit-work-name');
    const editWorkCardsContainer = document.getElementById('edit-work-cards-container');
    const addCardToModalBtn = document.getElementById('add-card-to-modal-btn');
    const addWorkTemplateBtn = document.getElementById('add-work-template-btn');

    // YENİ: Kategori Seçim Modalı elemanları
    const categorySelectionModal = document.getElementById('category-selection-modal');
    const categorySelectionList = document.getElementById('category-selection-list');
    const categorySelectionModalCloseBtn = document.getElementById('category-selection-modal-close-btn');
    const categorySelectionModalCancelBtn = document.getElementById('category-selection-modal-cancel-btn');

    onAuthStateChanged(auth, (user) => {
        if (user && user.uid === adminUID) {
            loadingContainer.classList.add('hidden');
            adminPanelContainer.classList.remove('hidden');
            loadAllAdminData();
        } else {
            document.body.innerHTML = `<div class="flex flex-col justify-center items-center min-h-screen text-center"><h1 class="text-3xl font-bold text-red-600">Erişim Reddedildi</h1><a href="index.html" class="mt-6 btn btn-primary">Ana Sayfaya Dön</a></div>`;
        }
    });
// YENİ BİRLEŞTİRİLMİŞ RENDER FONKSİYONU
function renderCombinedView(categories) {
    const container = document.getElementById('category-and-templates-container');
    if (!container) return;

    const sortedCategories = [...categories].sort((a, b) => a.category.localeCompare(b.category));
    container.innerHTML = sortedCategories.length === 0 ? `<p class="text-slate-500">Henüz kategori veya şablon yok.</p>` : '';

    sortedCategories.forEach(cat => {
        const catEl = document.createElement('div');
        catEl.className = 'border rounded-lg overflow-hidden bg-slate-50';
        const workCount = (cat.works || []).length;

        const worksHtml = (cat.works && cat.works.length > 0) 
            ? cat.works.map(work => `
                <div class="bg-white p-3 border-t flex justify-between items-center gap-2">
                    <div><p class="font-semibold text-slate-800">${work.name}</p><p class="text-xs text-slate-500">${(work.cards || []).length} kart</p></div>
                    <div class="flex-shrink-0 flex gap-2">
                        <button data-category="${cat.category}" data-work-name="${work.name}" class="edit-work-btn btn-icon text-slate-400 hover:text-indigo-600 p-1" title="Şablonu Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                        <button data-category="${cat.category}" data-work="${work.name}" class="delete-template-btn btn-icon text-slate-400 hover:text-rose-600 p-1" title="Şablonu Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                </div>`).join('')
            : '<div class="bg-white p-3 border-t text-sm text-slate-500">Bu kategoride henüz şablon yok.</div>';

        catEl.innerHTML = `
            <div class="accordion-header p-4 cursor-pointer flex justify-between items-center">
                <div class="flex-grow">
                    <h4 class="font-bold text-lg text-slate-700">${cat.category}</h4>
                    <span class="text-xs text-slate-500 ml-px">${workCount} şablon</span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button data-category-name="${cat.category}" class="edit-category-btn-alt btn-icon text-slate-400 hover:text-indigo-600 p-1" title="Kategori Adını Düzenle"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg></button>
                    <button data-category-name="${cat.category}" class="delete-category-btn btn-icon text-slate-400 hover:text-rose-600 p-1" title="Kategoriyi Sil"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    <svg class="accordion-arrow w-5 h-5 text-slate-500 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
            <div class="accordion-content"><div class="space-y-px">${worksHtml}</div></div>`;
        container.appendChild(catEl);
    });

    // --- OLAY DİNLEYİCİLERİNİ BURADA, TOPLU HALDE TANIMLIYORUZ ---
    // Kategori Düzenle/Sil Butonları
    container.querySelectorAll('.edit-category-btn-alt').forEach(btn => btn.addEventListener('click', () => handleEditCategory(btn)));
    container.querySelectorAll('.delete-category-btn').forEach(btn => btn.addEventListener('click', () => handleDeleteCategory(btn)));

    // Şablon Düzenle/Sil Butonları
    container.querySelectorAll('.edit-work-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const { category, workName } = btn.dataset;
            // Veriyi yeniden çekmek yerine fonksiyona gelen 'categories'den bulalım. Daha performanslı.
            const categoryData = categories.find(c => c.category === category);
            const workData = categoryData.works.find(w => w.name === workName);
            openWorkModal(category, workData);
        });
    });

    container.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const { category, work } = btn.dataset;
            if (confirm(`'${work}' şablonunu kalıcı olarak silmek istediğinizden emin misiniz?`)) {
                btn.disabled = true;
                try { await deleteTemplate(category, work); loadAllAdminData(); } catch (error) { alert("Hata: " + error.message); btn.disabled = false; }
            }
        });
    });

    // Akordiyon Açma/Kapatma
    container.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', (e) => { 
            // Butonlara tıklandığında akordiyonun açılıp kapanmasını engelle
            if(e.target.closest('button')) return; 

            header.classList.toggle('open'); 
            const content = header.nextElementSibling; 
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px"; 
        });
    });
}
    function loadAllAdminData() {
        loadPendingSubmissions();
        loadGlobalTemplates();
    }

    async function loadPendingSubmissions() {
        const pendingListEl = document.getElementById('pending-submissions-list');
        const pendingCountEl = document.getElementById('pending-count');
        if (!pendingListEl || !pendingCountEl) return;
        pendingListEl.innerHTML = `<p class="text-slate-500">Yükleniyor...</p>`;
        try {
            const submissions = await getPendingSubmissions();
            renderSubmissions(submissions);
        } catch (error) {
            console.error("Onay bekleyenler yüklenirken hata:", error);
            pendingListEl.innerHTML = `<p class="text-red-500 font-semibold">Hata oluştu.</p>`;
        }
    }

    function renderSubmissions(submissions) {
        const pendingCountEl = document.getElementById('pending-count');
        const pendingListEl = document.getElementById('pending-submissions-list');
        if (!pendingCountEl || !pendingListEl) return;
        pendingCountEl.textContent = submissions.length;
        pendingListEl.innerHTML = (submissions.length === 0) ? `<p class="text-slate-500">Onay bekleyen öneri yok.</p>` : '';
        submissions.forEach(sub => {
            const subEl = document.createElement('div');
            subEl.className = 'p-3 border rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3';
            const cardCount = (sub.cards || []).length;
            subEl.innerHTML = `<div><p class="font-bold text-slate-800">${sub.name}</p><p class="text-sm text-slate-600">Öneren: ${sub.submittedByName || 'Bilinmiyor'} (${cardCount} kart)</p></div><div class="flex gap-2 flex-shrink-0"><button data-id="${sub.id}" class="approve-btn btn btn-success btn-sm">Onayla</button><button data-id="${sub.id}" class="reject-btn btn btn-danger btn-sm">Reddet</button></div>`;
            pendingListEl.appendChild(subEl);
        });
        pendingListEl.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const subId = btn.dataset.id;
                const submissionData = submissions.find(s => s.id === subId);
                const existingCategories = await getGlobalTemplates();
                const categoryNames = existingCategories.map(c => c.category).sort();
                openCategoryModal(submissionData, categoryNames);
            });
        });
        pendingListEl.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const subId = btn.dataset.id;
                if (confirm("Bu öneriyi reddetmek istediğinizden emin misiniz?")) {
                    btn.disabled = true; btn.textContent = '...';
                    try {
                        await rejectSubmission(subId);
                        loadAllAdminData();
                    } catch (error) {
                        alert("Hata: " + error.message);
                        btn.disabled = false; btn.textContent = 'Reddet';
                    }
                }
            });
        });
    }

  async function loadGlobalTemplates() {
    // Artık tek bir container'ımız var.
    const container = document.getElementById('category-and-templates-container');
    if (!container) return;

    container.innerHTML = `<p class="text-slate-500">Yükleniyor...</p>`;

    try {
        const templates = await getGlobalTemplates();
        renderCombinedView(templates); // YENİ FONKSİYONU ÇAĞIRIYORUZ
    } catch (error) {
        console.error("Global şablonlar yüklenirken hata:", error);
        container.innerHTML = `<p class="text-red-500 font-semibold">Şablonlar yüklenirken bir hata oluştu.</p>`;
    }
}
  
    document.getElementById('add-category-btn').addEventListener('click', async () => {
        const newCategoryName = prompt("Lütfen yeni kategori adını girin:");
        if (newCategoryName && newCategoryName.trim() !== '') {
            try {
                await addCategory(newCategoryName.trim());
                loadAllAdminData();
            } catch(error) {
                alert("Hata: " + error.message);
            }
        }
    });

    async function handleEditCategory(btn) {
        const oldCategoryName = btn.dataset.categoryName;
        const newCategoryName = prompt(`'${oldCategoryName}' için yeni kategori adını girin:`, oldCategoryName);
        if (newCategoryName && newCategoryName.trim() !== '' && newCategoryName.trim() !== oldCategoryName) {
            btn.disabled = true;
            try { 
                await updateCategoryName(oldCategoryName, newCategoryName.trim()); 
                loadAllAdminData(); 
            } catch (error) { 
                alert("Hata: " + error.message); 
                btn.disabled = false;
            }
        }
    }

    async function handleDeleteCategory(btn) {
        const categoryName = btn.dataset.categoryName;
        if (confirm(`'${categoryName}' kategorisini silmek istediğinizden emin misiniz?\n\nUYARI: Bu işlem yalnızca kategori boşsa gerçekleştirilebilir.`)) {
            btn.disabled = true;
            try {
                await deleteCategory(categoryName);
                loadAllAdminData();
            } catch(error) {
                alert("Hata: " + error.message);
                btn.disabled = false;
            }
        }
    }

    // GÜNCELLENDİ: Yeni Şablon Ekleme butonunun olay dinleyicisi modalı kullanıyor
    addWorkTemplateBtn.addEventListener('click', async () => {
        const categories = await getGlobalTemplates();
        const categoryNames = categories.map(c => c.category).sort();

        if (categoryNames.length === 0) {
            alert("Lütfen önce bir kategori oluşturun.");
            return;
        }
        openCategorySelectionModal(categoryNames);
    });

    // YENİ: Kategori seçim modalını açan ve yöneten fonksiyonlar
    function openCategorySelectionModal(categoryNames) {
        categorySelectionList.innerHTML = ''; // Listeyi temizle
        categoryNames.forEach(name => {
            const button = document.createElement('button');
            button.className = 'w-full text-left p-3 rounded-md bg-slate-50 hover:bg-indigo-100 hover:text-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500';
            button.textContent = name;
            button.dataset.categoryName = name;
            categorySelectionList.appendChild(button);
        });
        categorySelectionModal.classList.remove('hidden');
        categorySelectionModal.classList.add('flex');
    }

    function closeCategorySelectionModal() {
        categorySelectionModal.classList.add('hidden');
        categorySelectionModal.classList.remove('flex');
    }

    // YENİ: Kategori seçim modalındaki butonların olay dinleyicileri
    categorySelectionModalCloseBtn.addEventListener('click', closeCategorySelectionModal);
    categorySelectionModalCancelBtn.addEventListener('click', closeCategorySelectionModal);
    
    categorySelectionList.addEventListener('click', (e) => {
        // Tıklanan elemanın bir buton olduğundan emin ol
        if (e.target.tagName === 'BUTTON') {
            const selectedCategory = e.target.dataset.categoryName;
            closeCategorySelectionModal();
            openWorkModal(selectedCategory); // Seçilen kategoriyle şablon ekleme modalını aç
        }
    });

    function openCategoryModal(submissionData, categoryNames) {
        categoryModal.dataset.submissionId = submissionData.id;
        categoryModal.dataset.submissionData = JSON.stringify(submissionData);
        modalTemplateName.textContent = submissionData.name;
        categorySelect.innerHTML = categoryNames.map(name => `<option value="${name}">${name}</option>`).join('') || '<option>Mevcut kategori yok</option>';
        categorySelect.disabled = false;
        newCategoryInput.value = ''; newCategoryInput.disabled = true;
        document.querySelector('input[name="category_choice"][value="existing"]').checked = true;
        categoryModal.classList.remove('hidden'); categoryModal.classList.add('flex');
    }

    function closeCategoryModal() { 
        categoryModal.classList.add('hidden'); 
        categoryModal.classList.remove('flex'); 
    }

    categoryChoiceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isExisting = radio.value === 'existing';
            categorySelect.disabled = !isExisting;
            newCategoryInput.disabled = isExisting;
        });
    });

    modalCancelBtn.addEventListener('click', closeCategoryModal);

    modalConfirmBtn.addEventListener('click', async () => {
        const choice = document.querySelector('input[name="category_choice"]:checked').value;
        let categoryName = (choice === 'existing') ? categorySelect.value : newCategoryInput.value.trim();
        if (!categoryName || categoryName === 'Mevcut kategori yok') {
            alert("Lütfen geçerli bir kategori seçin veya yeni bir tane oluşturun."); return;
        }
        const subId = categoryModal.dataset.submissionId;
        const submissionData = JSON.parse(categoryModal.dataset.submissionData);
        modalConfirmBtn.disabled = true; modalConfirmBtn.textContent = 'İşleniyor...';
        try {
            await approveSubmission(subId, submissionData, categoryName);
            closeCategoryModal();
            loadAllAdminData();
        } catch (error) {
            alert("Hata: " + error.message);
        } finally {
            modalConfirmBtn.disabled = false; modalConfirmBtn.textContent = 'Onayla';
        }
    });
    
    function openWorkModal(category, work = null) {
        const isEditMode = work !== null;

        editWorkModal.dataset.mode = isEditMode ? 'edit' : 'add';
        editWorkModal.dataset.categoryName = category;
        if (isEditMode) {
            editWorkModal.dataset.originalWorkName = work.name;
        }

        editWorkModal.querySelector('h3').textContent = isEditMode ? 'Şablonu Düzenle' : 'Yeni Şablon Ekle';
        editWorkModalSaveBtn.textContent = isEditMode ? 'Değişiklikleri Kaydet' : 'Şablonu Oluştur';

        editWorkNameInput.value = isEditMode ? work.name : '';
        editWorkCardsContainer.innerHTML = '';
        if (isEditMode) {
            (work.cards || []).forEach(card => appendCardToModal(card));
        } else {
            appendCardToModal();
        }
        
        editWorkModal.classList.remove('hidden');
        editWorkModal.classList.add('flex');
    }

    function appendCardToModal(card = {}) {
        const cardEl = document.createElement('div');
        cardEl.className = 'p-3 border rounded-md bg-slate-50 space-y-2 relative';
        cardEl.innerHTML = `
        <button class="delete-card-from-modal-btn absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">&times;</button>
        <input type="text" value="${card.name || ''}" placeholder="Kart Başlığı" class="form-input card-name-input font-semibold">
        <input type="text" value="${card.description || ''}" placeholder="Açıklama" class="form-input card-desc-input text-sm">
        <textarea placeholder="Notlar" class="form-input card-notes-input text-sm" rows="2">${card.notes || ''}</textarea>
        <div class="grid grid-cols-2 gap-2 mt-2">
            <input type="number" value="${card.baseTempo || ''}" placeholder="Başlangıç BPM" class="form-input card-base-tempo-input text-sm">
            <input type="number" value="${card.targetTempo || ''}" placeholder="Hedef BPM" class="form-input card-target-tempo-input text-sm">
        </div>
    `;        editWorkCardsContainer.appendChild(cardEl);
        cardEl.querySelector('.delete-card-from-modal-btn').addEventListener('click', () => cardEl.remove());
    }
    
    addCardToModalBtn.addEventListener('click', () => appendCardToModal());
    editWorkModalCloseBtn.addEventListener('click', () => {
    editWorkModal.classList.add('hidden');
    editWorkModal.classList.remove('flex'); // BU SATIRI EKLE
});
    editWorkModalCancelBtn.addEventListener('click', () => {
    editWorkModal.classList.add('hidden');
    editWorkModal.classList.remove('flex'); // BU SATIRI EKLE
});

    editWorkModalSaveBtn.addEventListener('click', async () => {
        const mode = editWorkModal.dataset.mode;
        const categoryName = editWorkModal.dataset.categoryName;
        const originalWorkName = editWorkModal.dataset.originalWorkName;
        
        const newWorkName = editWorkNameInput.value.trim();
        if (!newWorkName) {
            alert("Şablon adı boş bırakılamaz.");
            return;
        }
        
        const updatedCards = [];
        editWorkCardsContainer.querySelectorAll('.p-3.border').forEach(cardEl => {
            const name = cardEl.querySelector('.card-name-input').value.trim();
            const description = cardEl.querySelector('.card-desc-input').value.trim();
            const notes = cardEl.querySelector('.card-notes-input').value.trim();
            if (name) {
                // YENİ: Tempo inputlarını da oku
                const baseTempo = parseInt(cardEl.querySelector('.card-base-tempo-input').value, 10);
                const targetTempo = parseInt(cardEl.querySelector('.card-target-tempo-input').value, 10);
            
                updatedCards.push({
                    name,
                    description,
                    notes,
                    // YENİ: Tempo bilgilerini de nesneye ekle
                    baseTempo: isNaN(baseTempo) ? null : baseTempo,
                    targetTempo: isNaN(targetTempo) ? null : targetTempo
                });
            }
        });
        
        const workData = { name: newWorkName, cards: updatedCards, approved: true };
        
        editWorkModalSaveBtn.disabled = true;
        editWorkModalSaveBtn.textContent = "Kaydediliyor...";
        
        try {
            if (mode === 'edit') {
                await updateWork(categoryName, originalWorkName, workData);
            } else {
                await addWorkTemplate(categoryName, workData);
            }
            editWorkModal.classList.add('hidden');editWorkModal.classList.remove('flex');
            loadAllAdminData();
        } catch (error) {
            console.error(`Şablon ${mode === 'edit' ? 'güncellenirken' : 'eklenirken'} hata:`, error);
            alert("Hata: " + error.message);
        } finally {
            editWorkModalSaveBtn.disabled = false;
            editWorkModalSaveBtn.textContent = mode === 'edit' ? "Değişiklikleri Kaydet" : "Şablonu Oluştur";
        }
    });
});