/**
 * ARDI SE 2026 - Surat Archive Listing Module
 * Version: 1.0.0
 */

// Global Variables
let currentSuratPage = 1;
let isLoadingSurat = false;
let hasMoreSurat = true;
let currentSuratFilter = '';

// Load List Surat with Pagination
async function loadListSurat(append = false, page = 1) {
    if (isLoadingSurat) return;
    if (!append && page === 1) {
        currentSuratPage = 1;
        hasMoreSurat = true;
    }
    if (!hasMoreSurat && append) return;

    isLoadingSurat = true;

    if (!append) {
        toggleLoading(true);
    }

    const container = document.getElementById('list-surat-container');
    if (!container) return;

    try {
        const response = await postData({
            action: "listSurat",
            page: page,
            limit: CONFIG.TABLE_PAGE_SIZE,
            filter: currentSuratFilter
        });

        if (response.success) {
            const suratList = response.data || [];
            hasMoreSurat = suratList.length === CONFIG.TABLE_PAGE_SIZE;

            if (!append) {
                container.innerHTML = '';
            }

            if (suratList.length === 0 && !append) {
                container.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <i class="fas fa-folder-open"></i>
                            <p>Belum ada arsip kegiatan</p>
                            <button onclick="showSection('surat')" class="mt-4 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
                                <i class="fas fa-plus mr-2"></i> Tambah Arsip Kegiatan
                            </button>
                        </td>
                    </tr>
                `;
            } else {
                suratList.forEach(item => {
                    container.insertAdjacentHTML('beforeend', renderSuratRow(item));
                });

                // Setup infinite scroll untuk tabel
                if (hasMoreSurat && !append) {
                    setupSuratInfiniteScroll();
                }
            }

            // Update dashboard count
            if (page === 1) {
                updateSuratCount(response.total || suratList.length);
            }
        } else {
            showToast('Gagal memuat daftar arsip kegiatan', 'error');
        }
    } catch (error) {
        console.error('Load list surat error:', error);
        showToast('Terjadi kesalahan saat memuat data', 'error');
    } finally {
        isLoadingSurat = false;
        if (!append) {
            toggleLoading(false);
        }
    }
}

// Render Surat Table Row
function renderSuratRow(item) {
    const formattedDate = formatDate(item.tanggal);
    const viewUrl = getDriveViewUrl(item.link);
    const badgeClass = item.tingkat === 'Asli' ? 'badge-asli' : 'badge-copy';

    return `
        <tr class="hover:bg-slate-50 transition" data-id="${item.id}">
            <td class="p-4">
                <code class="surat-kode">${escapeHtml(item.kode)}</code>
            </td>
            <td class="p-4 text-slate-600">${formattedDate}</td>
            <td class="p-4">
                <div class="font-medium text-slate-800">${escapeHtml(item.uraian)}</div>
            </td>
            <td class="p-4">
                <span class="${badgeClass}">${escapeHtml(item.tingkat)}</span>
            </td>
            <td class="p-4 text-center">
                <div class="surat-actions">
                    <button onclick="editSurat(${item.id})" class="surat-action-btn surat-action-edit" title="Edit">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <a href="${viewUrl}" target="_blank" class="surat-action-btn surat-action-view" title="Lihat Dokumen">
                        <i class="fas fa-external-link-alt text-xs"></i>
                    </a>
                    <button onclick="confirmDelete('surat', ${item.id}, '${item.link}')" class="surat-action-btn surat-action-delete" title="Hapus">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Setup Infinite Scroll for Surat Table
function setupSuratInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoadingSurat && hasMoreSurat) {
            currentSuratPage++;
            loadListSurat(true, currentSuratPage);
        }
    }, { threshold: 0.1, rootMargin: '100px' });

    // Remove existing sentinel
    const existingSentinel = document.getElementById('surat-scroll-sentinel');
    if (existingSentinel) existingSentinel.remove();

    // Add sentinel row
    const container = document.getElementById('list-surat-container');
    if (container) {
        const sentinel = document.createElement('tr');
        sentinel.id = 'surat-scroll-sentinel';
        sentinel.innerHTML = `
            <td colspan="5" class="text-center py-4 text-slate-400">
                <i class="fas fa-spinner fa-spin"></i> Memuat lebih banyak...
            </td>
        `;
        container.appendChild(sentinel);
        observer.observe(sentinel);
    }
}

// Search/Filter Surat
function filterSurat(searchTerm) {
    currentSuratFilter = searchTerm;
    currentSuratPage = 1;
    hasMoreSurat = true;
    loadListSurat(false, 1);
}

// Export to Excel (CSV)
function exportSuratToCSV() {
    toggleLoading(true);

    postData({ action: "listSurat", page: 1, limit: 9999 })
        .then(response => {
            if (response.success && response.data) {
                const headers = ['Kode', 'Tanggal', 'Uraian', 'Tingkat', 'Link'];
                const rows = response.data.map(item => [
                    item.kode,
                    item.tanggal,
                    item.uraian,
                    item.tingkat,
                    item.link
                ]);

                const csvContent = [headers, ...rows]
                    .map(row => row.map(cell => `"${cell}"`).join(','))
                    .join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', `arsip_kegiatan_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showToast('Data berhasil diekspor', 'success');
            }
        })
        .catch(error => {
            console.error('Export error:', error);
            showToast('Gagal mengekspor data', 'error');
        })
        .finally(() => {
            toggleLoading(false);
        });
}

// Update Surat Count
function updateSuratCount(count) {
    const countElement = document.getElementById('count-surat');
    if (countElement && count !== undefined) {
        countElement.textContent = count;
    }
}

// Export ke global
window.loadListSurat = loadListSurat;
window.filterSurat = filterSurat;
window.exportSuratToCSV = exportSuratToCSV;