
export const defaultBoxSettings = [
    // ... mevcut ilk 8 adım aynı kalacak ...
    { number: 1, type: 'practice', title: 'Yeni Pasaj',       purpose: 'Notaları ve ritmi doğru çözme.',       question: 'Notaları ve ritmi doğru çözdün mü?',       color: 'bg-sky-500',    icon: '✒️' },
    { number: 2, type: 'practice', title: 'Akıcılık Geliştir', purpose: 'Duraksamadan, yavaş tempoda çalma.',  question: 'Duraksamadan, yavaş tempoda çalabildin mi?',  color: 'bg-emerald-500', icon: '🏃' },
    { number: 3, type: 'practice', title: 'Tempo Kazan',       purpose: 'Hedef tempoya yaklaşma.',             question: 'Hedef tempoya yaklaşabildin mi?',             color: 'bg-amber-500',  icon: '🚀' },
    { number: 4, type: 'practice', title: 'Farklı Ritimler',   purpose: 'Pasajı noktalı veya triole ritimleriyle çalma.', question: 'Pasajı farklı ritim kalıplarıyla hatasız çalabiliyor musun?', color: 'bg-orange-500', icon: '🥁' },
    { number: 5, type: 'practice', title: 'Müzikalite Kat',    purpose: 'İfade ve dinamikleri ekleme.',        question: 'İfade ve dinamikleri ekleyebildin mi?',        color: 'bg-pink-500',   icon: '🎨' },
    { number: 6, type: 'practice', title: 'Zihinsel Pratik',   purpose: 'Pasajı enstrümansız, zihinde canlandırma.', question: 'Enstrümana dokunmadan, pasajı zihninde net bir şekilde canlandırabildin mi?', color: 'bg-cyan-500', icon: '🧘' },
    { number: 7, type: 'practice', title: 'Kör Pratik',        purpose: 'Enstrümana veya ellerine bakmadan çalma.', question: 'Gözlerin kapalıyken pasajı baştan sona çalabiliyor musun?', color: 'bg-gray-500', icon: '🙈' },
    { number: 8, type: 'practice', title: 'Performansa Hazırla', purpose: 'Ezberden, bütünsel ve müzikal olarak çalma.',  question: 'Pasajı bir dinleyiciye çalar gibi, baştan sona ezberden çalabiliyor musun?',  color: 'bg-purple-500', icon: '✨' },
    { number: 9, type: 'performance', title: 'Prova Sahnesi', purpose: 'Eseri baştan sona, bir dinleyiciye çalar gibi prova et.', question: 'Eseri baştan sona akıcı ve müzikal bir bütün olarak çalabiliyor musun?', color: 'bg-indigo-600', icon: '🎭' }
];


export const DEFAULT_MASTERY_THRESHOLD = 5;

// Başarım rozetlerinin tanımları ve kazanma koşulları (SADELEŞTİRİLDİ)
export const BADGES = [
    {
        slug: 'first-project',
        name: 'İlk Adım',
        description: 'İlk eserini başarıyla oluşturdun.',
        icon_url: 'https://img.icons8.com/plasticine/100/000000/leaf.png',
        condition: (data) => Object.keys(data.projects || {}).length >= 1
    },
    {
        slug: 'streak-3',
        name: 'Ateşleyici',
        description: '3 günlük pratik zincirine ulaştın.',
        icon_url: 'https://img.icons8.com/plasticine/100/000000/fire-element.png',
        condition: (data, calc) => calc(data).current >= 3
    },
   // constants.js dosyasındaki ilgili bölüm

   {
    slug: 'streak-7',
    name: 'Alev Topu',
    description: '7 günlük pratik zincirine ulaştın. Harika gidiyorsun!',
    // Farklı bir stil ve adreste olan yeni bir ikon kullandık.
    icon_url: 'https://img.icons8.com/?size=100&id=67573&format=png&color=000000', 
    condition: (data, calc) => calc(data).current >= 7
},
    {
        slug: 'master-first-project',
        name: 'Ustalığa Giden Yol',
        description: 'Bir eserdeki tüm kartları tamamlayarak ilk eserinde ustalaştın.',
        icon_url: 'https://img.icons8.com/plasticine/100/000000/crown.png',
        condition: (data) => (data.masteredProjectsLog || []).length >= 1
    },
    {
        slug: 'add-50-cards',
        name: 'Kart Koleksiyoncusu',
        description: 'Toplamda 50 veya daha fazla çalışma kartı oluşturdun.',
        icon_url: 'https://img.icons8.com/plasticine/100/000000/stack-of-photos.png',
        condition: (data) => {
            const totalCards = Object.values(data.projects || {}).reduce((sum, p) => sum + (p.sections?.length || 0), 0);
            return totalCards >= 50;
        }
    }
];
// Admin kullanıcısının kimliği
export const adminUID = "tp7u9wMMn1gIVBM8mClmzWSptX43";