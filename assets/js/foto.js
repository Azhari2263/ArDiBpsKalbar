/**
 * ARDI SE 2026 - Foto Archive CRUD Module
 * Version: 1.0.0
 */

// Global Variables
let currentFotoData = null;

// Preview Image
function previewImage() {
    const file = document.getElementById('fileFoto').files[0];
    const img = document.getElementById('preview-foto-img');
    const placeholder = document.getElementById('preview-placeholder');

    if (file) {
        if (!file.type.startsWith('image/')) {
            showToast('File harus berupa gambar', 'error');
            document.getElementById('fileFoto').value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Ukuran file maksimal 5MB', 'error');
            document.getElementById('fileFoto').value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            img.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Reset Form Foto
function resetFormFoto() {
    const form = document.getElementById('formFoto');
    if (form) form.reset();

    const img = document.getElementById('preview-foto-img');
    const placeholder = document.getElementById('preview-placeholder');

    if (img) {
        img.style.display = 'none';
        img.src = '';
    }
    if (placeholder) placeholder.style.display = 'block';

    // Reset to create mode
    document.getElementById('idFoto').value = '';
    document.getElementById('linkFoto').value = '';
    document.getElementById('bulanFoto').value = '';

    const submitBtn = document.getElementById('btnSubmitFoto');
    const cancelBtn = document.getElementById('btnCancelFoto');
    const formTitle = document.getElementById('foto-form-title');

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> SIMPAN ARSIP FOTO';
        submitBtn.classList.remove('from-blue-500', 'to-blue-600');
        submitBtn.classList.add('from-orange-500', 'to-orange-600');
    }
    if (cancelBtn) cancelBtn.classList.add('hidden');
    if (formTitle) formTitle.innerText = 'Input Arsip Foto';
}

// Edit Foto
async function editFoto(id) {
    showSection('foto');
    toggleLoading(true);

    try {
        // Get data from list cache or fetch
        const response = await postData({ action: "getFoto", id: id });

        if (response.success && response.data) {
            const item = response.data;

            // Populate form
            document.getElementById('idFoto').value = item.id;
            document.getElementById('linkFoto').value = item.link;
            document.getElementById('bulanFoto').value = item.bulan;
            document.getElementById('kodeFoto').value = item.kode;
            document.getElementById('tanggalFoto').value = item.tanggal;
            document.getElementById('kegiatanFoto').value = item.kegiatan;
            document.getElementById('uraianFoto').value = item.uraian;
            document.getElementById('fotografer').value = item.fotografer;

            // Show preview
            const img = document.getElementById('preview-foto-img');
            const placeholder = document.getElementById('preview-placeholder');
            const thumbUrl = getDriveThumbUrl(item.link, CONFIG.PREVIEW_SIZE);

            img.src = thumbUrl;
            img.style.display = 'block';
            if (placeholder) placeholder.style.display = 'none';

            // Change to edit mode
            const submitBtn = document.getElementById('btnSubmitFoto');
            const cancelBtn = document.getElementById('btnCancelFoto');
            const formTitle = document.getElementById('foto-form-title');

            submitBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> UPDATE ARSIP FOTO';
            submitBtn.classList.remove('from-orange-500', 'to-orange-600');
            submitBtn.classList.add('from-blue-500', 'to-blue-600');
            cancelBtn.classList.remove('hidden');
            formTitle.innerText = 'Edit Arsip Foto';

            // Scroll to top of form
            document.getElementById('sec-foto').scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast('Gagal mengambil data arsip', 'error');
        }
    } catch (error) {
        console.error('Edit foto error:', error);
        showToast('Terjadi kesalahan', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Submit Form Foto
async function submitFoto(e) {
    e.preventDefault();

    const id = document.getElementById('idFoto').value;
    const file = document.getElementById('fileFoto').files[0];

    // Validasi untuk create mode
    if (!id && !file) {
        showToast('Mohon pilih file foto untuk diunggah', 'error');
        return;
    }

    toggleLoading(true);

    try {
        const formData = {
            action: "saveFoto",
            id: id ? parseInt(id) : 0,
            tanggal: document.getElementById('tanggalFoto').value,
            kegiatan: document.getElementById('kegiatanFoto').value,
            uraian: document.getElementById('uraianFoto').value,
            kode: document.getElementById('kodeFoto').value,
            fotografer: document.getElementById('fotografer').value,
            link: document.getElementById('linkFoto').value,
            bulan: document.getElementById('bulanFoto').value
        };

        let response;

        if (file) {
            // With new file
            const reader = await readFileAsBase64(file);
            formData.file = reader;
            response = await postData(formData);
        } else {
            // Without new file (update only)
            response = await postData(formData);
        }

        if (response.success) {
            showToast(response.message || 'Data berhasil disimpan', 'success');
            resetFormFoto();

            // Refresh lists and dashboard
            await loadListFoto();
            await loadDashboard();

            // Go to list view
            showSection('list-foto');
        } else {
            showToast(response.error || 'Gagal menyimpan data', 'error');
        }
    } catch (error) {
        console.error('Submit foto error:', error);
        showToast('Terjadi kesalahan saat menyimpan', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Helper: Read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Zoom Preview
function zoomPreview(type) {
    const img = document.getElementById('preview-foto-img');
    if (img && img.src && img.style.display !== 'none') {
        openZoomModal(img.src);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const formFoto = document.getElementById('formFoto');
    if (formFoto) {
        formFoto.addEventListener('submit', submitFoto);
    }
});

// Export ke global
window.previewImage = previewImage;
window.resetFormFoto = resetFormFoto;
window.editFoto = editFoto;
window.submitFoto = submitFoto;
window.zoomPreview = zoomPreview;