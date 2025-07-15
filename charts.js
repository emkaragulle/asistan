// charts.js

import { BADGES, defaultBoxSettings } from './constants.js';

export function createChartsService() {
    // Grafik nesnelerini saklamak için değişkenler, böylece tekrar render edilmeden önce yok edilebilirler.
    let boxChart = null;
    let timeSeriesChart = null;
    let projectProgressChart = null; 

    /**
     * İstatistikler sayfasının tamamını render eder.
     * @param {HTMLElement} container - Sayfanın render edileceği ana element.
     * @param {object} allData - Kullanıcının tüm verileri.
     */
    function renderStatisticsPage(container, allData) {
        // Sayfanın HTML iskeletini oluştur.
        container.innerHTML = `
            <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8">İstatistikler</h2>
            <div class="space-y-8">
                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Kartların Kutu Dağılımı</h3>
                    <div class="relative h-72 w-full">
                        <canvas id="box-distribution-chart"></canvas>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Pratik Aktivitesi (Son 90 Gün)</h3>
                     <div class="relative h-72 w-full">
                        <canvas id="time-series-chart"></canvas>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Oyunlaştırma Kuralları</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h4 class="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">Puan Sistemi</h4>
                            <ul class="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                                <li>Her başarılı kart tekrarı: <strong class="font-bold text-slate-800 dark:text-slate-100">+1 Puan</strong></li>
                                <li>Seviye atlayan her kart: <strong class="font-bold text-slate-800 dark:text-slate-100">+5 Puan</strong></li>
                                <li>Ustalaşılan her eser: <strong class="font-bold text-slate-800 dark:text-slate-100">+50 Puan</strong></li>
                            </ul>
                            <p class="text-xs text-slate-400 mt-3">Puanlar her hafta Pazartesi günü sıfırlanır.</p>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-3">Kazanılabilir Rozetler</h4>
                            <div id="badge-rules-list" class="space-y-3"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // HTML iskeleti oluşturulduktan sonra grafikleri ve listeleri ilgili canvas/div'lere render et.
        renderBoxDistributionChart('box-distribution-chart', allData.projects);
        renderTimeSeriesChart('time-series-chart', allData.practiceLog);
        renderBadgeRules(allData.earnedBadges || []);
    }

    /**
     * Rozet kurallarını listeler.
     */
    function renderBadgeRules(earnedBadges) {
        const container = document.getElementById('badge-rules-list');
        if (!container) return;
        const earnedSet = new Set(earnedBadges);
        container.innerHTML = BADGES.map(badge => {
            const isEarned = earnedSet.has(badge.slug);
            return `
                <div class="flex items-center gap-4 ${isEarned ? 'opacity-100' : 'opacity-60'}">
                    <img src="${badge.icon_url}" class="w-12 h-12 flex-shrink-0 ${isEarned ? '' : 'filter grayscale'}" alt="${badge.name}">
                    <div>
                        <h5 class="font-bold text-slate-700 dark:text-slate-200">${badge.name} ${isEarned ? '<span class="text-xs text-green-500">(Kazanıldı)</span>' : ''}</h5>
                        <p class="text-sm text-slate-500 dark:text-slate-400">${badge.description}</p>
                    </div>
                </div>`;
        }).join('');
    }



    // charts.js

// ... (dosyanın başındaki diğer fonksiyonlar aynı kalacak) ...

    /**
     * Kartların kutulara göre dağılımını gösteren bir çubuk grafik oluşturur.
     */
    function renderBoxDistributionChart(canvasId, projects) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (boxChart) {
            boxChart.destroy();
        }

        const cardCounts = Array(defaultBoxSettings.length).fill(0);
        Object.values(projects || {}).forEach(project => {
            (project.sections || []).forEach(card => {
                if (card.box && card.box > 0 && card.box <= cardCounts.length) {
                    cardCounts[card.box - 1]++;
                }
            });
        });

        const labels = defaultBoxSettings.map(box => `${box.icon} ${box.title}`);
        
        boxChart = new Chart(ctx, {
            type: 'bar', // Grafik tipi hala 'bar' kalacak
            data: {
                labels: labels,
                datasets: [{
                    label: 'Kart Sayısı',
                    data: cardCounts,
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                // --- DÜZELTME: GRAFİĞİ YATAY YAPMAK İÇİN EKLENDİ ---
                indexAxis: 'y', // Bu satır grafiği yatay hale getirir.
                // --- DÜZELTME SONU ---
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    // --- DÜZELTME: x ve y eksen ayarları yer değiştirdi ---
                    x: { // Artık sayısal eksen x ekseni
                        beginAtZero: true,
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b',
                            stepSize: 1
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: { // Artık kategori ekseni y ekseni
                         ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'
                        },
                         grid: {
                            display: false
                        }
                    }
                    // --- DÜZELTME SONU ---
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

// ... (dosyanın geri kalan tüm fonksiyonları aynı kalacak) ...

    /**
     * Son 90 günlük pratik süresini gösteren bir çizgi grafik oluşturur.
     */
    function renderTimeSeriesChart(canvasId, practiceLog) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (timeSeriesChart) {
            timeSeriesChart.destroy();
        }

        const data = [];
        const labels = [];
        for (let i = 89; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            labels.push(date);
            const minutes = Math.round((practiceLog[dateString] || 0) / 60);
            data.push(minutes);
        }
        
        timeSeriesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pratik (dakika)',
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)', // Violet-400
                    borderColor: 'rgba(139, 92, 246, 1)',
                    tension: 0.3,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Dakika',
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'
                        },
                        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b' },
                        grid: { color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
                    },
                    x: {
                        type: 'time',
                        time: {
                            unit: 'week',
                            tooltipFormat: 'PP', // Örn: Jul 14, 2025
                            displayFormats: {
                                week: 'MMM d' // Örn: Jul 14
                            }
                        },
                        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        intersect: false,
                        mode: 'index',
                    }
                }
            }
        });
    }
  // charts.js

// ... (dosyanın başındaki importlar ve diğer fonksiyonlar aynı)


    /**
     * Belirli bir projenin zaman içindeki ilerlemesini gösteren bir çizgi grafik oluşturur.
     * @param {string} canvasId - Canvas elementinin ID'si.
     * @param {Array} dataPoints - {x: Date, y: number} formatında hazırlanmış veri dizisi.
     */
    function renderProjectProgressChart(canvasId, dataPoints) {
        const ctx = document.getElementById(canvasId);
        const container = document.getElementById('project-progress-chart-container');
        if (!ctx || !container) return;

        if (projectProgressChart) {
            projectProgressChart.destroy();
        }

        // Eğer veri yoksa, canvas'ı gizle ve mesaj göster
        if (!dataPoints || dataPoints.length === 0) {
            container.innerHTML = '<div class="flex items-center justify-center h-full"><p class="text-center text-slate-400">Bu eser için henüz bir ilerleme verisi yok.</p></div>';
            return;
        }

        // Veri varsa, canvas'ın görünür olduğundan emin ol
        if (!document.getElementById(canvasId)) {
             container.innerHTML = `<canvas id="${canvasId}"></canvas>`;
        }
        const newCtx = document.getElementById(canvasId).getContext('2d');

        projectProgressChart = new Chart(newCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'İlerleme (%)',
                    data: dataPoints,
                    borderColor: 'rgba(34, 197, 94, 1)', // Green-500
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b' },
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: value => value + '%',
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#64748b'
                        }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }


    
// ... (dosyanın geri kalanı aynı)
    // Servisin dışarıya açtığı fonksiyonlar
    return {
        renderStatisticsPage,   
        renderProjectProgressChart
    };
}