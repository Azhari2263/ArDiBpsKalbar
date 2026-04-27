/**
 * ARDI SE 2026 - Main Application Entry Point
 * Version: 1.0.0
 */

// Delete Handler
let deleteAction = null;

// Confirm Delete
function confirmDelete(type, id, link) {
    deleteAction = async () => {
        toggleLoading(true);
        try {
            const action = type === 'foto' ? 'deleteFoto' : 'deleteSurat';
            const response = await postData({
                action: action,
                rowIndex: id,
                link: link
            });

            if (response.success) {
                showToast('Data berhasil dihapus', 'success');

                // Clear cache
                CacheManager.clear(`list${type === 'foto' ? 'Foto' : 'Surat'}`);
                CacheManager.clear('dashboard_stats');

                // Refresh data
                if (type === 'foto') {
                    await loadListFoto();
                } else {
                    await loadListSurat();
                }
                await loadDashboard();
            } else {
                showToast(response.error || 'Gagal menghapus data', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Terjadi kesalahan saat menghapus', 'error');
        } finally {
            toggleLoading(false);
            closeConfirmModal();
        }
    };

    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.remove('hidden');
}

// Close Confirm Modal
function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.classList.add('hidden');
    deleteAction = null;
}

// Show Section with Data Loading
async function showSection(sectionId) {
    // Update UI
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('bg-orange-100', 'text-orange-600'));

    const targetSection = document.getElementById(`sec-${sectionId}`);
    if (targetSection) targetSection.classList.remove('hidden');

    const btn = document.getElementById(`btn-${sectionId}`);
    if (btn) btn.classList.add('bg-orange-100', 'text-orange-600');

    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.add('-translate-x-full');
        if (overlay) overlay.classList.add('hidden');
    }

    // Load data berdasarkan section
    switch (sectionId) {
        case 'dash':
            await loadDashboard();
            break;
        case 'list-foto':
            await loadListFoto();
            break;
        case 'list-surat':
            await loadListSurat();
            break;
        case 'foto':
            resetFormFoto();
            break;
        case 'surat':
            resetFormSurat();
            break;
    }
}

// Post Data with Error Handling
async function postData(payload) {
    const requestKey = JSON.stringify(payload);

    return RequestQueue.add(requestKey, (async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(CONFIG.WEB_APP_URL, {
                method: "POST",
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
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('Request timeout:', payload.action);
                return { success: false, error: 'Request timeout. Silakan coba lagi.' };
            }
            console.error('Post data error:', error);
            return { success: false, error: error.message };
        }
    })());
}

// Initialize Application
async function initApp() {
    console.log('ARDI SE 2026 - Application Started');

    // Check auto login
    if (checkAutoLogin()) {
        return;
    }

    // Setup event listeners
    setupEventListeners();

    // Add keyboard shortcuts
    setupKeyboardShortcuts();
}

// Setup Event Listeners
function setupEventListeners() {
    // Enter key on login form
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('pass');

    if (emailInput && passInput) {
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                handleLogin();
            }
        };
        emailInput.addEventListener('keypress', handleEnter);
        passInput.addEventListener('keypress', handleEnter);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeConfirmModal();
            closeZoom();
        }
    });

    // Click outside modal to close
    const modal = document.getElementById('zoom-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeZoom();
            }
        });
    }
}

// Setup Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K = Search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) searchInput.focus();
        }

        // Ctrl/Cmd + N = New foto
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            showSection('foto');
        }

        // Ctrl/Cmd + S = New surat
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            showSection('surat');
        }

        // Ctrl/Cmd + D = Dashboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            showSection('dash');
        }
    });
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator && CONFIG.ENABLE_OFFLINE_MODE) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export global functions
window.postData = postData;
window.showSection = showSection;
window.confirmDelete = confirmDelete;
window.closeConfirmModal = closeConfirmModal;
window.toggleSidebar = toggleSidebar;
window.closeZoom = closeZoom;
window.openZoomModal = openZoomModal;