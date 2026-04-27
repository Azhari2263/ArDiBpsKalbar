/**
 * ARDI SE 2026 - Dashboard Module
 * Version: 1.0.0
 */

// Load Dashboard Data
async function loadDashboard() {
    const cacheKey = 'dashboard_stats';
    const cached = CacheManager.get(cacheKey);

    if (cached) {
        updateDashboardUI(cached);
        return;
    }

    toggleLoading(true);

    try {
        const response = await postData({ action: "dashboard" });

        if (response.success) {
            CacheManager.set(cacheKey, response);
            updateDashboardUI(response);
        } else {
            showToast('Gagal memuat data dashboard', 'error');
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('Terjadi kesalahan saat memuat dashboard', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Update Dashboard UI
function updateDashboardUI(data) {
    // Update counter
    const countFoto = document.getElementById('count-foto');
    const countSurat = document.getElementById('count-surat');

    if (countFoto) {
        animateNumber(countFoto, 0, data.totalFoto || 0);
    }
    if (countSurat) {
        animateNumber(countSurat, 0, data.totalSurat || 0);
    }

    // Update welcome message with time-based greeting
    updateWelcomeGreeting();
}

// Animate Number Counter
function animateNumber(element, start, end) {
    if (!element) return;

    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    let current = start;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current += increment;
        if (step >= steps) {
            element.textContent = end;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, stepTime);
}

// Update Welcome Greeting Based on Time
function updateWelcomeGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) {
        greeting = 'Selamat Pagi';
    } else if (hour < 15) {
        greeting = 'Selamat Siang';
    } else if (hour < 18) {
        greeting = 'Selamat Sore';
    } else {
        greeting = 'Selamat Malam';
    }

    const welcomeElement = document.querySelector('#sec-dash h2');
    if (welcomeElement) {
        const currentText = welcomeElement.innerHTML;
        if (!currentText.includes(greeting)) {
            welcomeElement.innerHTML = `${greeting}, <span class="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">Pengelola Arsip!</span>`;
        }
    }
}

// Refresh Dashboard (dipanggil setelah CRUD operations)
function refreshDashboard() {
    CacheManager.clear('dashboard_stats');
    loadDashboard();
}

// Export ke global
window.loadDashboard = loadDashboard;
window.refreshDashboard = refreshDashboard;