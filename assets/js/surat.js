/**
 * ARDI SE 2026 - Surat/Document Archive CRUD Module
 * Version: 1.0.0
 */

// Reset Form Surat
function resetFormSurat() {
    const form = document.getElementById('formSurat');
    if (form) form.reset();

    // Reset to create mode
    document.getElementById('idSurat').value = '';
    document.getElementById('linkSurat').value = '';
    document.getElementById('bulanSurat').value = '';

    const submitBtn = document.getElementById('btnSubmitSurat');
    const cancelBtn = document.getElementById('btnCancelSurat');
    const formTitle = document.getElementById('surat-form-title');

    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> SIMPAN ARSIP KEGIATAN';
        submitBtn.classList.remove('from-blue-500', 'to-blue-600');
        submitBtn.classList.add('from-amber-500', 'to-amber-600');
    }
    if (cancelBtn) cancelBtn.classList.add('hidden');
    if (formTitle) formTitle.innerText = 'Input Arsip Kegiatan';
}

// Edit Surat
async function editSurat(id) {
    showSection('surat');
    toggleLoading(true);

    try {
        const response = await postData({ action: "getSurat", id: id });

        if (response.success && response.data) {
            const item = response.data;

            // Populate form
            document.getElementById('idSurat').value = item.id;
            document.getElementById('linkSurat').value = item.link;
            document.getElementById('bulanSurat').value = item.bulan;
            document.getElementById('kodeSurat').value = item.kode;
            document.getElementById('tanggalSurat').value = item.tanggal;
            document.getElementById('uraianSurat').value = item.uraian;
            document.getElementById('tingkat').value = item.tingkat;

            // Change to edit mode
            const submitBtn = document.getElementById('btnSubmitSurat');
            const cancelBtn = document.getElementById('btnCancelSurat');
            const formTitle = document.getElementById('surat-form-title');

            submitBtn.innerHTML = '<i class="fas fa-edit mr-2"></i> UPDATE ARSIP KEGIATAN';
            submitBtn.classList.remove('from-amber-500', 'to-amber-600');
            submitBtn.classList.add('from-blue-500', 'to-blue-600');
            cancelBtn.classList.remove('hidden');
            formTitle.innerText = 'Edit Arsip Kegiatan';

            // Scroll to top
            document.getElementById('sec-surat').scrollIntoView({ behavior: 'smooth' });
        } else {
            showToast('Gagal mengambil data arsip', 'error');
        }
    } catch (error) {
        console.error('Edit surat error:', error);
        showToast('Terjadi kesalahan', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Submit Form Surat
async function submitSurat(e) {
    e.preventDefault();

    const id = document.getElementById('idSurat').value;
    const file = document.getElementById('fileSurat').files[0];

    // Validasi file untuk create mode
    if (!id && !file) {
        showToast('Mohon pilih file dokumen untuk diunggah', 'error');
        return;
    }

    // Validasi file type
    if (file && !file.type.match(/application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/)) {
        showToast('File harus berformat PDF, DOC, atau DOCX', 'error');
        return;
    }

    // Validasi file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
        showToast('Ukuran file maksimal 10MB', 'error');
        return;
    }

    toggleLoading(true);

    try {
        const formData = {
            action: "saveSurat",
            id: id ? parseInt(id) : 0,
            tanggal: document.getElementById('tanggalSurat').value,
            uraian: document.getElementById('uraianSurat').value,
            kode: document.getElementById('kodeSurat').value,
            tingkat: document.getElementById('tingkat').value,
            link: document.getElementById('linkSurat').value,
            bulan: document.getElementById('bulanSurat').value
        };

        let response;

        if (file) {
            const reader = await readFileAsBase64(file);
            formData.file = reader;
            response = await postData(formData);
        } else {
            response = await postData(formData);
        }

        if (response.success) {
            showToast(response.message || 'Data berhasil disimpan', 'success');
            resetFormSurat();

            // Refresh data
            await loadListSurat();
            await loadDashboard();

            showSection('list-surat');
        } else {
            showToast(response.error || 'Gagal menyimpan data', 'error');
        }
    } catch (error) {
        console.error('Submit surat error:', error);
        showToast('Terjadi kesalahan saat menyimpan', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Preview Surat (Open in new tab)
function previewSurat(link) {
    if (link) {
        window.open(getDriveViewUrl(link), '_blank');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const formSurat = document.getElementById('formSurat');
    if (formSurat) {
        formSurat.addEventListener('submit', submitSurat);
    }
});

// Export ke global
window.resetFormSurat = resetFormSurat;
window.editSurat = editSurat;
window.submitSurat = submitSurat;
window.previewSurat = previewSurat;