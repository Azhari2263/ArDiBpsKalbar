/**
 * ARDI SE 2026 - Authentication Module
 * Version: 1.0.0
 */

// Session Management
const SessionManager = {
    /**
     * Set session data
     * @param {Object} userData - User data to store
     */
    setSession(userData) {
        const session = {
            user: userData,
            timestamp: Date.now(),
            expires: Date.now() + CONFIG.SESSION_DURATION
        };
        sessionStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(session));
    },

    /**
     * Get session data
     * @returns {Object|null} Session data or null
     */
    getSession() {
        const sessionStr = sessionStorage.getItem(CONFIG.SESSION_KEY);
        if (!sessionStr) return null;

        const session = JSON.parse(sessionStr);
        if (session.expires < Date.now()) {
            this.clearSession();
            return null;
        }
        return session;
    },

    /**
     * Clear session
     */
    clearSession() {
        sessionStorage.removeItem(CONFIG.SESSION_KEY);
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.getSession() !== null;
    }
};

// Login Handler
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pass').value;

    // Validasi input
    if (!email || !password) {
        showToast('Mohon isi email dan password!', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showToast('Email harus menggunakan domain @bps.go.id', 'error');
        return;
    }

    toggleLoading(true);

    try {
        const response = await postData({
            action: "login",
            email: email,
            password: password
        });

        if (response.success) {
            // Simpan session
            SessionManager.setSession({
                email: email,
                name: response.name || email,
                loginTime: new Date().toISOString()
            });

            // Tampilkan UI utama
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');

            showToast(`Selamat datang, ${response.name || 'Pengelola Arsip'}!`, 'success');

            // Load dashboard
            showSection('dash');
        } else {
            showToast(response.error || 'Login gagal. Periksa email dan password Anda.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Logout Handler
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        // Clear session
        SessionManager.clearSession();

        // Clear cache
        CacheManager.clear();

        // Reset form
        document.getElementById('email').value = '';
        document.getElementById('pass').value = '';

        // Show login page
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');

        showToast('Anda telah keluar dari sistem', 'info');
    }
}

// Check Auto Login
function checkAutoLogin() {
    if (SessionManager.isLoggedIn()) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        showSection('dash');
        return true;
    }
    return false;
}

// Export ke global
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.checkAutoLogin = checkAutoLogin;
window.SessionManager = SessionManager;