/**
 * ARDI SE 2026 - Utility Functions
 * Version: 1.0.0
 */

// Loading Management
function toggleLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'flex' : 'none';
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Format File Size
function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extract Google Drive ID from URL
function extractDriveId(url) {
    if (!url) return null;
    const patterns = [
        /[-\w]{25,}/,
        /id=([-\w]+)/,
        /\/d\/([-\w]+)/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1] || match[0];
    }
    return null;
}

// Get Google Drive Thumbnail URL
function getDriveThumbUrl(url, size = CONFIG.THUMBNAIL_SIZE) {
    const id = extractDriveId(url);
    if (id) {
        return `https://drive.google.com/thumbnail?id=${id}&sz=${size}`;
    }
    return '';
}

// Get Google Drive View URL
function getDriveViewUrl(url) {
    const id = extractDriveId(url);
    if (id) {
        return `https://drive.google.com/file/d/${id}/view`;
    }
    return url;
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Deep Clone Object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Generate Unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)?bps\.go\.id$/;
    return re.test(email);
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Truncate Text
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Download File
function downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Copy to Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Teks berhasil disalin', 'success');
    } catch (err) {
        showToast('Gagal menyalin teks', 'error');
    }
}

// Export ke global
window.toggleLoading = toggleLoading;
window.showToast = showToast;
window.formatDate = formatDate;
window.formatFileSize = formatFileSize;
window.extractDriveId = extractDriveId;
window.getDriveThumbUrl = getDriveThumbUrl;
window.getDriveViewUrl = getDriveViewUrl;
window.debounce = debounce;
window.throttle = throttle;
window.deepClone = deepClone;
window.generateId = generateId;
window.validateEmail = validateEmail;
window.escapeHtml = escapeHtml;
window.truncateText = truncateText;
window.downloadFile = downloadFile;
window.copyToClipboard = copyToClipboard;