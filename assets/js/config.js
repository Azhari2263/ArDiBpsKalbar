// assets/js/config.js - Versi dengan Error Handling Lengkap

const CONFIG = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyzXmsEt6pDWw-8PA80nuIRwNvP-1NqXbLQ76cbydmIq-DU4P3bSGh-XsA7_uWcbLHW/exec",
    CACHE_DURATION: 5 * 60 * 1000,
    CACHE_ENABLED: true,
    PAGE_SIZE: 12,
    REQUEST_TIMEOUT: 30000,
    MAX_RETRIES: 3
};

// Enhanced postData dengan retry dan error handling
async function postData(payload, retryCount = 0) {
    // Check internet connection
    if (!navigator.onLine) {
        showToast('Tidak ada koneksi internet. Periksa jaringan Anda.', 'error');
        return { success: false, error: 'No internet connection' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
        console.log(`[Request] ${payload.action} - Attempt ${retryCount + 1}`);

        const response = await fetch(CONFIG.WEB_APP_URL, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "omit",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[Response] ${payload.action}:`, data);

        return data;

    } catch (error) {
        clearTimeout(timeoutId);

        // Handle AbortError (timeout)
        if (error.name === 'AbortError') {
            console.error('Request timeout:', payload.action);
            return { success: false, error: 'Request timeout. Server terlalu lama merespon.' };
        }

        // Handle CORS error
        if (error.message.includes('fetch')) {
            console.error('CORS or network error:', error);
            return {
                success: false,
                error: 'Gagal terhubung ke server. Periksa CORS settings di Google Apps Script.'
            };
        }

        // Retry logic
        if (retryCount < CONFIG.MAX_RETRIES) {
            console.log(`Retrying... (${retryCount + 1}/${CONFIG.MAX_RETRIES})`);
            const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            return postData(payload, retryCount + 1);
        }

        showToast(`Error: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

// Test connection function
async function testConnection() {
    toggleLoading(true);
    try {
        const result = await postData({ action: "ping" });
        if (result.success) {
            showToast('Koneksi berhasil!', 'success');
            return true;
        } else {
            showToast('Koneksi gagal: ' + (result.error || 'Unknown error'), 'error');
            return false;
        }
    } catch (error) {
        showToast('Koneksi gagal: ' + error.message, 'error');
        return false;
    } finally {
        toggleLoading(false);
    }
}

// Export
window.postData = postData;
window.testConnection = testConnection;