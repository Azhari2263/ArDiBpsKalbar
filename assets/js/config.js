/**
 * ARDI SE 2026 - Konfigurasi Global
 * Version: 1.0.0
 */

// Konfigurasi Aplikasi
const CONFIG = {
    // API Endpoint
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyzXmsEt6pDWw-8PA80nuIRwNvP-1NqXbLQ76cbydmIq-DU4P3bSGh-XsA7_uWcbLHW/exec",

    // Cache Configuration
    CACHE_DURATION: 5 * 60 * 1000, // 5 menit
    CACHE_ENABLED: true,

    // Pagination
    PAGE_SIZE: 12, // Data per page untuk grid foto
    TABLE_PAGE_SIZE: 20, // Data per page untuk tabel surat

    // Image Configuration
    THUMBNAIL_SIZE: 'w200',
    PREVIEW_SIZE: 'w800',
    ZOOM_SIZE: 'w1200',

    // Timeout Configuration
    REQUEST_TIMEOUT: 30000, // 30 detik

    // Feature Flags
    ENABLE_CACHE: true,
    ENABLE_LAZY_LOAD: true,
    ENABLE_OFFLINE_MODE: false,

    // Session Configuration
    SESSION_KEY: 'ardi_se_session',
    SESSION_DURATION: 8 * 60 * 60 * 1000 // 8 jam
};

// Cache Manager
const CacheManager = {
    cache: new Map(),

    /**
     * Set data ke cache
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    set(key, data) {
        if (!CONFIG.ENABLE_CACHE) return;
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    },

    /**
     * Get data dari cache
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null
     */
    get(key) {
        if (!CONFIG.ENABLE_CACHE) return null;
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    },

    /**
     * Clear cache
     * @param {string|null} key - Specific key or all if null
     */
    clear(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    },

    /**
     * Check if cache is valid
     * @param {string} key - Cache key
     * @returns {boolean}
     */
    isValid(key) {
        const cached = this.cache.get(key);
        return cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_DURATION;
    }
};

// Request Queue untuk mencegah duplicate requests
const RequestQueue = {
    pendingRequests: new Map(),

    /**
     * Add request to queue
     * @param {string} key - Request key
     * @param {Promise} promise - Request promise
     * @returns {Promise}
     */
    add(key, promise) {
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }
        this.pendingRequests.set(key, promise);
        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
        return promise;
    },

    /**
     * Clear queue
     */
    clear() {
        this.pendingRequests.clear();
    }
};

// Export ke global
window.CONFIG = CONFIG;
window.CacheManager = CacheManager;
window.RequestQueue = RequestQueue;