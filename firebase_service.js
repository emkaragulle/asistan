// firebase_service.js

// Sadece Firebase kütüphanelerini ve konfigürasyonunu içerir.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// Firestore'dan 'deleteField' import edildi.
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc, deleteField, collection, addDoc, query, where, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "leitner-calisma-asistani-bc2b0.firebaseapp.com",
    projectId: "leitner-calisma-asistani-bc2b0",
    storageBucket: "leitner-calisma-asistani-bc2b0.appspot.com",
    messagingSenderId: "690172130029",
    appId: ""
};

// Firebase servislerini başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Kullanıcının kimlik doğrulama durumundaki değişiklikleri dinler.
 * @param {function} onUserLoggedIn - Kullanıcı giriş yaptığında çağrılacak fonksiyon.
 * @param {function} onUserLoggedOut - Kullanıcı çıkış yaptığında çağrılacak fonksiyon.
 */
export function initAuth(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onUserLoggedIn(user);
        } else {
            onUserLoggedOut();
        }
    });
}

/**
 * Google ile giriş yapma penceresini açar.
 */
export function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

/**
 * Mevcut kullanıcının oturumunu kapatır.
 */
export function signOutUser() {
    return signOut(auth);
}

/**
 * Belirtilen kullanıcı ID'sine ait veriyi Firestore'dan yükler.
 * @param {string} userId - Yüklenecek verinin kullanıcı ID'si.
 * @returns {Promise<object|null>} Kullanıcı verisi veya bulunamazsa null döner.
 */
export async function loadUserData(userId) {
    if (!userId) return null;
    const userDocRef = doc(db, 'leitnerUsers', userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Belirtilen kullanıcı ID'si için veriyi Firestore'a kaydeder.
 * Bu fonksiyon artık veriyi birleştirmek yerine üzerine yazar.
 * @param {string} userId - Kaydedilecek verinin kullanıcı ID'si.
 * @param {object} data - Kaydedilecek veri nesnesi.
 */
export async function saveUserData(userId, data) {
    if (!userId) return;
    const userDocRef = doc(db, 'leitnerUsers', userId);
    const dataToSave = { ...data };
    delete dataToSave.activeProject;
    
    // DÜZELTME: { merge: true } seçeneği kaldırıldı.
    // Artık belgeyi birleştirmek yerine tamamen üzerine yazacak.
    // Bu sayede lokalde silinen bir proje, veritabanından da silinecek.
    await setDoc(userDocRef, dataToSave);
}

/**
 * Bir kullanıcının belirli bir projesini Firestore'dan verimli bir şekilde siler.
 * @param {string} userId Kullanıcı ID'si
 * @param {string} projectName Silinecek projenin adı
 */
export async function deleteProject(userId, projectName) {
    if (!userId || !projectName) {
        throw new Error("Kullanıcı ID veya Proje Adı silme işlemi için eksik.");
    }
    const userDocRef = doc(db, 'leitnerUsers', userId);

    try {
        // DÜZELTME: Karmaşık okuma/yazma işlemi yerine, `deleteField` kullanarak
        // doğrudan projenin alanını siliyoruz. Bu daha verimli ve güvenlidir.
        await updateDoc(userDocRef, {
            [`projects.${projectName}`]: deleteField()
        });
    } catch (error) {
        console.error("Proje silinirken Firestore hatası:", error);
        throw error;
    }
}


/**
 * Global şablonlardaki değişiklikleri dinler.
 * @param {function} onTemplatesUpdate - Şablonlar güncellendiğinde çağrılacak fonksiyon.
 */
export function listenForGlobalTemplates(onTemplatesUpdate) {
    const templatesDocRef = doc(db, 'leitnerGlobalTemplates', 'all');
    onSnapshot(templatesDocRef, (doc) => {
        const templates = doc.exists() ? doc.data().templates || [] : [];
        onTemplatesUpdate(templates);
    }, (error) => {
        console.error("Error listening to global templates:", error);
    });
}

/**
 * Bir kullanıcının eserini şablon olarak onaya gönderir.
 * @param {object} templateData Onaya gönderilecek şablon verisi.
 * @returns {Promise<void>}
 */
export async function submitTemplate(templateData) {
    try {
        await addDoc(collection(db, 'template_submissions'), templateData);
    } catch (error) {
        console.error("Şablon gönderilirken hata oluştu: ", error);
        throw new Error("Şablon önerisi gönderilemedi.");
    }
}


/**
 * Belirli bir şablon için yeni bir yorum ekler.
 * @param {string} templateName Yorum yapılacak şablonun adı.
 * @param {object} commentData Eklenecek yorum nesnesi.
 * @returns {Promise<void>}
 */
export async function addCommentToTemplate(templateName, commentData) {
    if (!templateName || !commentData) throw new Error("Şablon adı veya yorum verisi eksik.");
    const commentsCollectionRef = collection(db, 'template_comments', templateName, 'comments');
    await addDoc(commentsCollectionRef, commentData);
}

/**
 * Belirli bir şablonun tüm yorumlarını gerçek zamanlı olarak dinler.
 * @param {string} templateName Yorumları dinlenecek şablonun adı.
 * @param {function} onCommentsUpdate Yorumlar güncellendiğinde çağrılacak callback.
 * @returns {import("firebase/firestore").Unsubscribe} Dinleyiciyi sonlandırma fonksiyonu.
 */
export function listenForTemplateComments(templateName, onCommentsUpdate) {
    const commentsCollectionRef = collection(db, 'template_comments', templateName, 'comments');
    const q = query(commentsCollectionRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (querySnapshot) => {
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() });
        });
        onCommentsUpdate(comments);
    }, (error) => {
        console.error("Yorumlar dinlenirken hata oluştu: ", error);
        onCommentsUpdate([]);
    });
}

/**
 * Bir yorum dokümanını günceller.
 * @param {string} templateName Şablonun adı.
 * @param {string} commentId Güncellenecek yorumun ID'si.
 * @param {string} newText Yorumun yeni metni.
 */
export async function updateCommentInTemplate(templateName, commentId, newText) {
    const commentDocRef = doc(db, 'template_comments', templateName, 'comments', commentId);
    await updateDoc(commentDocRef, { text: newText });
}

/**
 * Bir yorum dokümanını siler.
 * @param {string} templateName Şablonun adı.
 * @param {string} commentId Silinecek yorumun ID'si.
 */
export async function deleteCommentFromTemplate(templateName, commentId) {
    const commentDocRef = doc(db, 'template_comments', templateName, 'comments', commentId);
    await deleteDoc(commentDocRef);
}
