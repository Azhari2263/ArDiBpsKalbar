/**
 * ARDI SE 2026 - Foto Archive Listing Module
 * Version: 1.0.0
 */

// Global Variables
let currentFotoPage = 1;
let isLoadingFoto = false;
let hasMoreFoto = true;
let currentFotoFilter = '';

// Load List Foto with Pagination
async function loadListFoto(append = false, page = 1) {
    if (isLoadingFoto) return;
    if (!append && page === 1) {
        currentFotoPage = 1;
        hasMoreFoto = true;
    }
    if (!hasMoreFoto && append) return;

    isLoadingFoto = true;

    if (!append) {
        toggleLoading(true);
    }

    const container = document.getElementById('list-foto-container');
    if (!container) return;

    try {
        const response = await postData({
            action: "listFoto",
            page: page,
            limit: CONFIG.PAGE_SIZE,
            filter: currentFotoFilter
        });

        if (response.success) {
            const fotoList = response.data || [];
            hasMoreFoto = fotoList.length === CONFIG.PAGE_SIZE;

            if (!append) {
                container.innerHTML = '';
            }

            if (fotoList.length === 0 && !append) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-10">
                        <i class="fas fa-images text-6xl text-slate-300 mb-4"></i>
                        <p class="text-slate-400">Belum ada arsip foto</p>
                        <button onclick="showSection('foto')" class="mt-4 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
                            <i class="fas fa-plus mr-2"></i> Tambah Arsip Foto
                        </button>
                    </div>
                `;
            } else {
                fotoList.forEach(item => {
                    container.insertAdjacentHTML('beforeend', renderFotoCard(item));
                });

                // Setup infinite scroll jika masih ada data
                if (hasMoreFoto && !append) {
                    setupFotoInfiniteScroll();
                }
            }

            // Update dashboard count jika halaman pertama
            if (page === 1) {
                updateFotoCount(response.total || fotoList.length);
            }
        } else {
            showToast('Gagal memuat daftar arsip foto', 'error');
        }
    } catch (error) {
        console.error('Load list foto error:', error);
        showToast('Terjadi kesalahan saat memuat data', 'error');
    } finally {
        isLoadingFoto = false;
        if (!append) {
            toggleLoading(false);
        }
    }
}

// Render Foto Card HTML
function renderFotoCard(item) {
    const thumbUrl = getDriveThumbUrl(item.link, CONFIG.THUMBNAIL_SIZE);
    const viewUrl = getDriveViewUrl(item.link);
    const formattedDate = formatDate(item.tanggal);
    const truncatedUraian = truncateText(item.uraian || '', 80);

    return `
        <div class="foto-card" data-id="${item.id}">
            <div class="foto-card-image" onclick="openZoomModalFromLink('${item.link}')">
                <img src="${thumbUrl}" alt="${escapeHtml(item.kegiatan)}" loading="lazy">
                <div class="foto-card-overlay">
                    <i class="fas fa-search-plus text-white text-2xl"></i>
                </div>
            </div>
            <div class="foto-card-content">
                <div class="flex justify-between items-start mb-2">
                    <span class="foto-card-badge">${escapeHtml(item.kode)}</span>
                    <span class="foto-card-date">${formattedDate}</span>
                </div>
                <h3 class="foto-card-title">${escapeHtml(item.kegiatan)}</h3>
                <p class="foto-card-desc">${escapeHtml(truncatedUraian)}</p>
                <div class="foto-card-footer">
                    <span><i class="fas fa-user-camera mr-1"></i> ${escapeHtml(item.fotografer || '-')}</span>
                    <span>${item.size || '0 KB'}</span>
                </div>
            </div>
            <div class="foto-card-actions">
                <button onclick="editFoto(${item.id})" class="btn-edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <a href="${viewUrl}" target="_blank" class="btn-view">
                    <i class="fas fa-external-link-alt"></i> Lihat
                </a>
                <button onclick="confirmDelete('foto', ${item.id}, '${item.link}')" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Setup Infinite Scroll for Foto
function setupFotoInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoadingFoto && hasMoreFoto) {
            currentFotoPage++;
            loadListFoto(true, currentFotoPage);
        }
    }, { threshold: 0.1, rootMargin: '100px' });

    // Remove existing sentinel
    const existingSentinel = document.getElementById('foto-scroll-sentinel');
    if (existingSentinel) existingSentinel.remove();

    // Add new sentinel
    const container = document.getElementById('list-foto-container');
    if (container) {
        const sentinel = document.createElement('div');
        sentinel.id = 'foto-scroll-sentinel';
        sentinel.className = 'col-span-full text-center py-4 text-slate-400';
        sentinel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat lebih banyak...';
        container.appendChild(sentinel);

        observer.observe(sentinel);
    }
}

// Search/Filer Foto
function filterFoto(searchTerm) {
    currentFotoFilter = searchTerm;
    currentFotoPage = 1;
    hasMoreFoto = true;
    loadListFoto(false, 1);
}

// Update Foto Count
function updateFotoCount(count) {
    const countElement = document.getElementById('count-foto');
    if (countElement && count !== undefined) {
        countElement.textContent = count;
    }
}

// Open Zoom Modal from Link
function openZoomModalFromLink(link) {
    const id = extractDriveId(link);
    if (id) {
        const modal = document.getElementById('zoom-modal');
        const img = document.getElementById('zoom-img');
        const pdf = document.getElementById('zoom-pdf');

        if (modal && img && pdf) {
            img.classList.remove('hidden');
            pdf.classList.add('hidden');
            img.src = getDriveThumbUrl(link, CONFIG.ZOOM_SIZE);
            modal.style.display = 'block';
        }
    }
}

// Export ke global
window.loadListFoto = loadListFoto;
window.filterFoto = filterFoto;
window.openZoomModalFromLink = openZoomModalFromLink;