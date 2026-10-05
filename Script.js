/**
 * ====================================================================
 * PORTFOLIO JAVASCRIPT ENGINE — TUGAS INDIVIDU BAGIAN 2
 * Nama  : Farrel Rafi Dwi Baskoro
 * NBI   : 1482500047
 * Prodi : S1 Sistem Informasi - Universitas 17 Agustus 1945 Surabaya
 * ====================================================================
 * Kriteria Tugas Individu 2:
 * 1. Tampilkan data array of object ke halaman menggunakan template literal / createElement.
 * 2. Minimal 2 interaksi dengan addEventListener (Search, Filter, Tambah Item, Hapus Item, Toggle Tampilan).
 * 3. Minimal 1 form dengan validasi input dan preventDefault().
 * 4. Gunakan classList untuk mengubah tampilan (tanpa style inline).
 * ====================================================================
 */

// ====================================================================
// 1. DATA ARRAY OF OBJECTS (JADWAL MATA KULIAH)
// ====================================================================
let jadwalKuliah = [
    { id_matkul: 'SI101', nama_matkul: 'Pengembangan Sistem Berbasis Web', hari: 'Senin', sks: 3, status_wajib: true },
    { id_matkul: 'SI102', nama_matkul: 'Basis Data Lanjut', hari: 'Selasa', sks: 3, status_wajib: true },
    { id_matkul: 'SI103', nama_matkul: 'Desain UI/UX', hari: 'Rabu', sks: 2, status_wajib: false },
    { id_matkul: 'SI104', nama_matkul: 'Manajemen Proyek IT', hari: 'Kamis', sks: 3, status_wajib: true },
    { id_matkul: 'SI105', nama_matkul: 'Bahasa Inggris Bisnis', hari: 'Jumat', sks: 2, status_wajib: false }
];

// State Filter Saat Ini
let currentFilter = 'semua';
let currentSearchQuery = '';

// ====================================================================
// 2. FUNGSI PERHITUNGAN ALGORITMA (SKS & FILTER)
// ====================================================================
function hitungTotalSks(jadwal) {
    return jadwal.reduce((total, matkul) => total + matkul.sks, 0);
}

function hitungTotalSksWajib(jadwal) {
    return jadwal
        .filter(matkul => matkul.status_wajib === true)
        .reduce((total, matkul) => total + matkul.sks, 0);
}

function filterMatkulBerat(jadwal, minimalSks = 3) {
    return jadwal.filter(matkul => matkul.sks >= minimalSks);
}

// ====================================================================
// 3. RENDER DATA KE DOM MENGGUNAKAN TEMPLATE LITERAL (Kriteria 1)
// ====================================================================
function renderJadwal() {
    const tableBody = document.getElementById('tabel-jadwal-body');
    if (!tableBody) return;

    // Filter berdasarkan kategori tombol & input pencarian
    let dataTerfilter = jadwalKuliah.filter(matkul => {
        const cocokKategori = 
            currentFilter === 'semua' || 
            (currentFilter === 'wajib' && matkul.status_wajib) || 
            (currentFilter === 'pilihan' && !matkul.status_wajib);

        const query = currentSearchQuery.toLowerCase().trim();
        const cocokPencarian = 
            matkul.nama_matkul.toLowerCase().includes(query) ||
            matkul.id_matkul.toLowerCase().includes(query) ||
            matkul.hari.toLowerCase().includes(query);

        return cocokKategori && cocokPencarian;
    });

    // Jika data kosong
    if (dataTerfilter.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted fw-bold">
                    ⚠️ Tidak ada mata kuliah yang cocok dengan kata kunci atau filter ini.
                </td>
            </tr>
        `;
    } else {
        // Render baris tabel menggunakan template literal
        tableBody.innerHTML = dataTerfilter.map(matkul => {
            const badgeStatus = matkul.status_wajib
                ? `<span class="neo-grade-badge grade-a" style="font-size:0.8rem;">Wajib</span>`
                : `<span class="neo-grade-badge grade-ab" style="font-size:0.8rem;">Pilihan</span>`;

            return `
                <tr>
                    <td class="fw-bold">${matkul.id_matkul}</td>
                    <td>${matkul.nama_matkul}</td>
                    <td class="text-center">${matkul.hari}</td>
                    <td class="text-center fw-bold">${matkul.sks}</td>
                    <td class="text-center">${badgeStatus}</td>
                    <td class="text-center">
                        <button class="neo-action-btn-sm btn-delete btn-delete-matkul" data-id="${matkul.id_matkul}" title="Hapus Matkul">
                            🗑️ Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Update Badge Counter & Statistik
    updateStatistikJadwal();
    renderLiveTerminalOutput();
}

// Update Metrik Ringkasan di Bawah Tabel
function updateStatistikJadwal() {
    const elTotalMatkul = document.getElementById('stat-total-matkul');
    const elTotalSks = document.getElementById('stat-total-sks');
    const elSksWajib = document.getElementById('stat-sks-wajib');

    const elCountSemua = document.getElementById('count-semua');
    const elCountWajib = document.getElementById('count-wajib');
    const elCountPilihan = document.getElementById('count-pilihan');

    const totalMatkul = jadwalKuliah.length;
    const totalSks = hitungTotalSks(jadwalKuliah);
    const totalSksWajib = hitungTotalSksWajib(jadwalKuliah);
    const countWajib = jadwalKuliah.filter(m => m.status_wajib).length;
    const countPilihan = totalMatkul - countWajib;

    if (elTotalMatkul) elTotalMatkul.textContent = totalMatkul;
    if (elTotalSks) elTotalSks.textContent = `${totalSks} SKS`;
    if (elSksWajib) elSksWajib.textContent = `${totalSksWajib} SKS`;

    if (elCountSemua) elCountSemua.textContent = totalMatkul;
    if (elCountWajib) elCountWajib.textContent = countWajib;
    if (elCountPilihan) elCountPilihan.textContent = countPilihan;
}

// ====================================================================
// 4. EVENT LISTENERS & INTERAKTIVITAS DOM (Kriteria 2, 3, 4)
// ====================================================================
function setupEventListeners() {
    
    // --- INTERAKSI 1: Pencarian Live Data (Search Input) ---
    const searchInput = document.getElementById('input-cari-jadwal');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearchQuery = e.target.value;
            renderJadwal();
        });
    }

    // --- INTERAKSI 2: Filter Kategori (Semua / Wajib / Pilihan) via classList ---
    const filterButtons = document.querySelectorAll('.btn-filter-jadwal');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active'); // Menggunakan classList (Kriteria 4)

            currentFilter = this.getAttribute('data-filter');
            renderJadwal();
        });
    });

    // --- INTERAKSI 3: Toggle Tampilan Form Tambah Matkul via classList ---
    const btnToggleForm = document.getElementById('btn-toggle-form');
    const formWrapper = document.getElementById('wrapper-form-jadwal');
    const btnToggleIcon = document.getElementById('btn-toggle-icon');
    const btnToggleText = document.getElementById('btn-toggle-text');
    const btnBatalForm = document.getElementById('btn-batal-form');

    if (btnToggleForm && formWrapper) {
        btnToggleForm.addEventListener('click', function() {
            const isHidden = formWrapper.classList.toggle('d-none'); // Menggunakan classList
            if (isHidden) {
                btnToggleIcon.textContent = '➕';
                btnToggleText.textContent = 'Tambah Matkul';
            } else {
                btnToggleIcon.textContent = '✖️';
                btnToggleText.textContent = 'Tutup Form';
                document.getElementById('input-kode').focus();
            }
        });
    }

    if (btnBatalForm && formWrapper) {
        btnBatalForm.addEventListener('click', function() {
            formWrapper.classList.add('d-none');
            if (btnToggleIcon) btnToggleIcon.textContent = '➕';
            if (btnToggleText) btnToggleText.textContent = 'Tambah Matkul';
            resetForm();
        });
    }

    // --- INTERAKSI 4: Form Submit dengan Validasi & preventDefault() (Kriteria 3) ---
    const formJadwal = document.getElementById('form-tambah-jadwal');
    if (formJadwal) {
        formJadwal.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah reload halaman browser (Kriteria 3)

            const inputKode = document.getElementById('input-kode');
            const inputNama = document.getElementById('input-nama');
            const inputHari = document.getElementById('input-hari');
            const inputSks = document.getElementById('input-sks');
            const inputStatus = document.getElementById('input-status');

            const errorKode = document.getElementById('error-kode');
            const errorNama = document.getElementById('error-nama');
            const errorSks = document.getElementById('error-sks');

            // Reset status error classList
            inputKode.classList.remove('input-error');
            inputNama.classList.remove('input-error');
            inputSks.classList.remove('input-error');
            errorKode.classList.add('d-none');
            errorNama.classList.add('d-none');
            errorSks.classList.add('d-none');

            let isValid = true;

            const valKode = inputKode.value.trim().toUpperCase();
            const valNama = inputNama.value.trim();
            const valHari = inputHari.value;
            const valSks = parseInt(inputSks.value, 10);
            const valStatus = inputStatus.value === 'true';

            // Validasi 1: Kode Matkul
            if (!valKode) {
                inputKode.classList.add('input-error');
                errorKode.textContent = 'Kode mata kuliah tidak boleh kosong!';
                errorKode.classList.remove('d-none');
                isValid = false;
            } else if (jadwalKuliah.some(m => m.id_matkul === valKode)) {
                inputKode.classList.add('input-error');
                errorKode.textContent = `Kode "${valKode}" sudah terdaftar! Gunakan kode lain.`;
                errorKode.classList.remove('d-none');
                isValid = false;
            }

            // Validasi 2: Nama Matkul
            if (!valNama || valNama.length < 3) {
                inputNama.classList.add('input-error');
                errorNama.textContent = 'Nama mata kuliah minimal 3 karakter!';
                errorNama.classList.remove('d-none');
                isValid = false;
            }

            // Validasi 3: SKS (1 sampai 6)
            if (isNaN(valSks) || valSks < 1 || valSks > 6) {
                inputSks.classList.add('input-error');
                errorSks.textContent = 'SKS harus berupa angka antara 1 sampai 6!';
                errorSks.classList.remove('d-none');
                isValid = false;
            }

            // Jika valid, masukkan ke Array dan Re-render
            if (isValid) {
                const matkulBaru = {
                    id_matkul: valKode,
                    nama_matkul: valNama,
                    hari: valHari,
                    sks: valSks,
                    status_wajib: valStatus
                };

                jadwalKuliah.push(matkulBaru); // Tambah item ke array
                renderJadwal(); // Re-render DOM

                // Feedback Toast
                showToast(`✓ Mata Kuliah "${valNama}" berhasil ditambahkan!`);
                console.log(`%c[TAMBAH ITEM] Berhasil menambahkan:`, "color: #10B981; font-weight: bold;", matkulBaru);

                // Reset & Sembunyikan Form via classList
                resetForm();
                formWrapper.classList.add('d-none');
                if (btnToggleIcon) btnToggleIcon.textContent = '➕';
                if (btnToggleText) btnToggleText.textContent = 'Tambah Matkul';
            }
        });
    }

    // --- INTERAKSI 5: Hapus Item dari Array & DOM (Event Delegation) ---
    const tableBody = document.getElementById('tabel-jadwal-body');
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const btnDelete = e.target.closest('.btn-delete-matkul');
            if (btnDelete) {
                const idHapus = btnDelete.getAttribute('data-id');
                const matkulDihapus = jadwalKuliah.find(m => m.id_matkul === idHapus);

                if (confirm(`Apakah Anda yakin ingin menghapus mata kuliah "${matkulDihapus ? matkulDihapus.nama_matkul : idHapus}"?`)) {
                    jadwalKuliah = jadwalKuliah.filter(m => m.id_matkul !== idHapus);
                    renderJadwal();
                    showToast(`🗑️ Mata kuliah "${idHapus}" berhasil dihapus.`);
                    console.log(`%c[HAPUS ITEM] Berhasil menghapus: ${idHapus}`, "color: #EF4444; font-weight: bold;");
                }
            }
        });
    }

    // --- INTERAKSI 6: Filter Tab Semester Transkrip via classList ---
    const semesterTabs = document.querySelectorAll('.btn-smt-tab');
    const smt1Section = document.getElementById('section-smt1');
    const smt2Section = document.getElementById('section-smt2');

    semesterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            semesterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const smtType = this.getAttribute('data-smt');
            if (smtType === 'all') {
                smt1Section.classList.remove('d-none');
                smt2Section.classList.remove('d-none');
            } else if (smtType === 'smt1') {
                smt1Section.classList.remove('d-none');
                smt2Section.classList.add('d-none');
            } else if (smtType === 'smt2') {
                smt1Section.classList.add('d-none');
                smt2Section.classList.remove('d-none');
            }
        });
    });
}

function resetForm() {
    const formJadwal = document.getElementById('form-tambah-jadwal');
    if (formJadwal) formJadwal.reset();

    const inputKode = document.getElementById('input-kode');
    const inputNama = document.getElementById('input-nama');
    const inputSks = document.getElementById('input-sks');
    const errorKode = document.getElementById('error-kode');
    const errorNama = document.getElementById('error-nama');
    const errorSks = document.getElementById('error-sks');

    if (inputKode) inputKode.classList.remove('input-error');
    if (inputNama) inputNama.classList.remove('input-error');
    if (inputSks) inputSks.classList.remove('input-error');
    if (errorKode) errorKode.classList.add('d-none');
    if (errorNama) errorNama.classList.add('d-none');
    if (errorSks) errorSks.classList.add('d-none');
}

// ====================================================================
// 5. TOAST NOTIFIKASI & SALIN TEKS (INTERAKSI UI)
// ====================================================================
function copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${label} berhasil disalin!`);
    }).catch(() => {
        showToast(`Salin: ${text}`);
    });
}

function showToast(msg) {
    const toast = document.getElementById('neo-toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = msg;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Ekspor ke window global
window.copyText = copyText;
window.showToast = showToast;

// ====================================================================
// 6. LIVE CONSOLE & TERMINAL PREVIEW OUTPUT
// ====================================================================
function tampilkanOutputConsole() {
    const styleHeader = "background: #FFE600; color: #121212; font-weight: 900; font-size: 13px; padding: 6px 12px; border: 2px solid #121212; border-radius: 6px;";
    const styleSuccess = "background: #34D399; color: #121212; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px;";
    const stylePink = "background: #FF6B8B; color: #FFFFFF; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px;";

    console.log("%c⚡ S1 SISTEM INFORMASI — UNTAG SURABAYA", styleHeader);
    
    console.group("📅 1. Data Jadwal Mata Kuliah (Array of Objects)");
    console.table(jadwalKuliah);
    console.groupEnd();

    const totalWajib = hitungTotalSksWajib(jadwalKuliah);
    console.group("📊 2. Hasil Perhitungan SKS Wajib");
    console.log(`%c✓ Total SKS Wajib: ${totalWajib} SKS`, styleSuccess);
    console.groupEnd();

    const matkulBerat = filterMatkulBerat(jadwalKuliah, 3);
    console.group("🔥 3. Hasil Filter Mata Kuliah Berat (>= 3 SKS)");
    console.log(`%c✓ Ditemukan ${matkulBerat.length} Mata Kuliah Berat:`, stylePink);
    console.table(matkulBerat);
    console.groupEnd();
}

function renderLiveTerminalOutput() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    const totalWajib = hitungTotalSksWajib(jadwalKuliah);
    const matkulBerat = filterMatkulBerat(jadwalKuliah, 3);
    const namaMatkulBerat = matkulBerat.map(m => m.nama_matkul).join(', ');

    terminalBody.innerHTML = `
        <div class="terminal-line"><span class="term-cyan">=== DATA JADWAL MATA KULIAH ===</span></div>
        <div class="terminal-line text-white">▶ Array(${jadwalKuliah.length}) [${jadwalKuliah.map(m => `${m.id_matkul} (${m.hari}, ${m.sks} SKS)`).join(', ')}]</div>
        <br>
        <div class="terminal-line"><span class="term-green">=== HASIL PERHITUNGAN TOTAL SKS WAJIB ===</span></div>
        <div class="terminal-line text-white">Total SKS untuk mata kuliah wajib Anda adalah: <span class="term-yellow">${totalWajib} SKS</span></div>
        <br>
        <div class="terminal-line"><span class="term-pink">=== HASIL FILTER MATA KULIAH BERAT (>= 3 SKS) ===</span></div>
        <div class="terminal-line text-white">▶ Ditemukan ${matkulBerat.length} Mata Kuliah: <span class="text-white fw-bold">[${namaMatkulBerat}]</span></div>
    `;
}

// ====================================================================
// 7. PRELOADER ANIMATION
// ====================================================================
function initLoader() {
    const greetings = ["HALO", "HELLO", "HOLA", "BONJOUR", "CIAO", "KONNICHIWA"];
    const loaderText = document.getElementById('loader-text');
    const percentText = document.getElementById('percent-text');
    const progressBar = document.getElementById('progress-bar');
    const loaderWrapper = document.getElementById('loader-wrapper');
    
    if (!loaderWrapper) return;

    document.body.style.overflow = 'hidden';

    const totalDuration = 1400; 
    let startTimestamp = null;
    let currentGreetingIndex = -1;

    function animateLoading(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        
        let percent = Math.floor((elapsed / totalDuration) * 100);
        if (percent > 100) percent = 100;
        
        if (percentText) percentText.textContent = percent + '%';
        if (progressBar) progressBar.style.width = percent + '%';

        let expectedGreetingIndex = Math.floor((elapsed / totalDuration) * greetings.length);
        if (expectedGreetingIndex > currentGreetingIndex && expectedGreetingIndex < greetings.length) {
            currentGreetingIndex = expectedGreetingIndex;
            if (loaderText) loaderText.textContent = greetings[currentGreetingIndex];
        }

        if (elapsed < totalDuration) {
            window.requestAnimationFrame(animateLoading);
        } else {
            setTimeout(() => {
                loaderWrapper.classList.add('loader-hide');
                setTimeout(() => {
                    document.body.style.overflow = 'auto';
                    loaderWrapper.remove();
                }, 400); 
            }, 200);
        }
    }
    
    window.requestAnimationFrame(animateLoading);
}

// ====================================================================
// 8. INISIALISASI UTAMA
// ====================================================================
document.addEventListener("DOMContentLoaded", function() {
    initLoader();
    renderJadwal();
    setupEventListeners();
    tampilkanOutputConsole();
});
