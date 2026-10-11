// Data jadwal mata kuliah (array of objects)
let jadwalKuliah = [
    { id_matkul: 'SI101', nama_matkul: 'Pengembangan Sistem Berbasis Web', hari: 'Senin', sks: 3, status_wajib: true },
    { id_matkul: 'SI102', nama_matkul: 'Basis Data Lanjut', hari: 'Selasa', sks: 3, status_wajib: true },
    { id_matkul: 'SI103', nama_matkul: 'Desain UI/UX', hari: 'Rabu', sks: 2, status_wajib: false },
    { id_matkul: 'SI104', nama_matkul: 'Manajemen Proyek IT', hari: 'Kamis', sks: 3, status_wajib: true },
    { id_matkul: 'SI105', nama_matkul: 'Bahasa Inggris Bisnis', hari: 'Jumat', sks: 2, status_wajib: false }
];

// State filter dan pencarian
let currentFilter = 'semua';
let currentSearchQuery = '';

// Hitung total SKS dari array
function hitungTotalSks(jadwal) {
    return jadwal.reduce((total, matkul) => total + matkul.sks, 0);
}

// Hitung total SKS mata kuliah wajib
function hitungTotalSksWajib(jadwal) {
    return jadwal
        .filter(matkul => matkul.status_wajib === true)
        .reduce((total, matkul) => total + matkul.sks, 0);
}

// Filter mata kuliah berat (>= minimalSks)
function filterMatkulBerat(jadwal, minimalSks = 3) {
    return jadwal.filter(matkul => matkul.sks >= minimalSks);
}

// Render tabel jadwal ke DOM dari array
function renderJadwal() {
    const tableBody = document.getElementById('tabel-jadwal-body');
    if (!tableBody) return;

    // Filter berdasarkan kategori dan pencarian
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

    // Tampilkan pesan kosong atau data tabel
    if (dataTerfilter.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted fw-bold">
                    Tidak ada mata kuliah yang cocok dengan kata kunci atau filter ini.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = dataTerfilter.map(matkul => {
            const badgeStatus = matkul.status_wajib
                ? `<span class="neo-grade-badge grade-ab" style="font-size:0.8rem;">Wajib</span>`
                : `<span class="neo-grade-badge grade-a" style="font-size:0.8rem;">Pilihan</span>`;

            return `
                <tr>
                    <td class="fw-bold">${matkul.id_matkul}</td>
                    <td>${matkul.nama_matkul}</td>
                    <td class="text-center">${matkul.hari}</td>
                    <td class="text-center fw-bold">${matkul.sks}</td>
                    <td class="text-center">${badgeStatus}</td>
                    <td class="text-center">
                        <button class="neo-action-btn-sm btn-delete btn-delete-matkul" data-id="${matkul.id_matkul}" title="Hapus Matkul">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStatistikJadwal();
    renderLiveTerminalOutput();
}

// Update angka statistik pada UI
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

// Setup semua event listener (vanilla JS)
function setupEventListeners() {
    // Event: pencarian real-time
    const searchInput = document.getElementById('input-cari-jadwal');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            currentSearchQuery = e.target.value;
            renderJadwal();
        });
    }

    // Event: filter tombol kategori
    const filterButtons = document.querySelectorAll('.btn-filter-jadwal');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderJadwal();
        });
    });

    // Event: validasi dan submit form tambah matkul
    const formJadwal = document.getElementById('form-tambah-jadwal');
    if (formJadwal) {
        formJadwal.addEventListener('submit', function(e) {
            e.preventDefault();

            const inputKode = document.getElementById('input-kode');
            const inputNama = document.getElementById('input-nama');
            const inputHari = document.getElementById('input-hari');
            const inputSks = document.getElementById('input-sks');
            const inputStatus = document.getElementById('input-status');

            const errorKode = document.getElementById('error-kode');
            const errorNama = document.getElementById('error-nama');
            const errorSks = document.getElementById('error-sks');

            // Reset error state
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

            // Validasi kode matkul
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

            // Validasi nama matkul
            if (!valNama || valNama.length < 3) {
                inputNama.classList.add('input-error');
                errorNama.textContent = 'Nama mata kuliah minimal 3 karakter!';
                errorNama.classList.remove('d-none');
                isValid = false;
            }

            // Validasi SKS
            if (isNaN(valSks) || valSks < 1 || valSks > 6) {
                inputSks.classList.add('input-error');
                errorSks.textContent = 'SKS harus berupa angka antara 1 sampai 6!';
                errorSks.classList.remove('d-none');
                isValid = false;
            }

            // Jika valid, tambahkan ke array lalu render ulang
            if (isValid) {
                const matkulBaru = {
                    id_matkul: valKode,
                    nama_matkul: valNama,
                    hari: valHari,
                    sks: valSks,
                    status_wajib: valStatus
                };

                jadwalKuliah.push(matkulBaru);
                renderJadwal();

                showToast(`Mata Kuliah "${valNama}" berhasil ditambahkan!`);

                resetForm();
                // Tutup form via jQuery slideUp
                $('#wrapper-form-jadwal').slideUp(300);
                $('#btn-toggle-icon').text('➕');
                $('#btn-toggle-text').text('Tambah Matkul');
            }
        });
    }

    // Event: hapus matkul (event delegation)
    const tableBody = document.getElementById('tabel-jadwal-body');
    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const btnDelete = e.target.closest('.btn-delete-matkul');
            if (btnDelete) {
                const idHapus = btnDelete.getAttribute('data-id');
                const matkulDihapus = jadwalKuliah.find(m => m.id_matkul === idHapus);

                if (confirm(`Apakah Anda yakin ingin menghapus mata kuliah "${matkulDihapus ? matkulDihapus.nama_matkul : idHapus}"?`)) {
                    // jQuery: animasi baris sebelum dihapus
                    const $row = $(btnDelete).closest('tr');
                    $row.addClass('row-removing');
                    setTimeout(() => {
                        jadwalKuliah = jadwalKuliah.filter(m => m.id_matkul !== idHapus);
                        renderJadwal();
                        showToast(`Mata kuliah "${idHapus}" berhasil dihapus.`);
                    }, 400);
                }
            }
        });
    }

    // Event: tab semester
    const semesterTabs = document.querySelectorAll('.btn-smt-tab');
    semesterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            semesterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const smtType = this.getAttribute('data-smt');
            // jQuery: slideToggle animasi semester sections
            if (smtType === 'all') {
                $('#section-smt1').slideDown(300);
                $('#section-smt2').slideDown(300);
            } else if (smtType === 'smt1') {
                $('#section-smt1').slideDown(300);
                $('#section-smt2').slideUp(300);
            } else if (smtType === 'smt2') {
                $('#section-smt1').slideUp(300);
                $('#section-smt2').slideDown(300);
            }
        });
    });
}

// jQuery: toggle form dengan slideToggle animasi
function setupjQueryFeatures() {
    // jQuery: slideToggle untuk form tambah matkul
    $('#btn-toggle-form').on('click', function() {
        const $form = $('#wrapper-form-jadwal');
        $form.slideToggle(350, function() {
            const isVisible = $form.is(':visible');
            if (isVisible) {
                $('#btn-toggle-icon').text('✖️');
                $('#btn-toggle-text').text('Tutup Form');
                $('#input-kode').focus();
            } else {
                $('#btn-toggle-icon').text('➕');
                $('#btn-toggle-text').text('Tambah Matkul');
            }
        });
    });

    // jQuery: tombol batal form
    $('#btn-batal-form').on('click', function() {
        $('#wrapper-form-jadwal').slideUp(300, function() {
            $('#btn-toggle-icon').text('➕');
            $('#btn-toggle-text').text('Tambah Matkul');
            resetForm();
        });
    });

    // jQuery: animasi hover pada stat-pill
    $('.stat-pill').on('mouseenter', function() {
        $(this).stop().animate({ 'margin-top': '-4px' }, 200);
    }).on('mouseleave', function() {
        $(this).stop().animate({ 'margin-top': '0px' }, 200);
    });

    // jQuery: scroll animasi saat klik card sections
    $('.neo-card').each(function(index) {
        $(this).css('opacity', '0').delay(index * 120).animate({ opacity: 1 }, 500);
    });
}

// Reset semua input form
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

// Salin teks ke clipboard
function copyText(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} berhasil disalin!`);
    }).catch(() => {
        showToast(`Salin: ${text}`);
    });
}

// jQuery: tampilkan toast dengan animasi
function showToast(msg) {
    const $toast = $('#neo-toast');
    const $toastMsg = $('#toast-msg');
    if (!$toast.length) return;

    $toastMsg.text(msg);
    $toast.addClass('show');

    setTimeout(() => {
        $toast.removeClass('show');
    }, 2500);
}

// Expose ke global untuk onclick HTML
window.copyText = copyText;
window.showToast = showToast;

// Output ke console browser
function tampilkanOutputConsole() {
    const styleHeader = "background: #0B4F6C; color: #01BAEF; font-weight: 900; font-size: 13px; padding: 6px 12px; border: 2px solid #040F16; border-radius: 6px;";
    const styleSuccess = "background: #01BAEF; color: #040F16; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px;";
    const stylePink = "background: #B80C09; color: #FFFFFF; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px;";

    console.log("%c S1 SISTEM INFORMASI — UNTAG SURABAYA", styleHeader);

    console.group("1. Data Jadwal Mata Kuliah");
    console.table(jadwalKuliah);
    console.groupEnd();

    const totalWajib = hitungTotalSksWajib(jadwalKuliah);
    console.group("2. Hasil Perhitungan SKS Wajib");
    console.log(`%cTotal SKS Wajib: ${totalWajib} SKS`, styleSuccess);
    console.groupEnd();

    const matkulBerat = filterMatkulBerat(jadwalKuliah, 3);
    console.group("3. Hasil Filter Mata Kuliah Berat (>= 3 SKS)");
    console.log(`%cDitemukan ${matkulBerat.length} Mata Kuliah Berat:`, stylePink);
    console.table(matkulBerat);
    console.groupEnd();
}

// Render terminal output secara dinamis dari data array
function renderLiveTerminalOutput() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    const totalWajib = hitungTotalSksWajib(jadwalKuliah);
    const matkulBerat = filterMatkulBerat(jadwalKuliah, 3);
    const namaMatkulBerat = matkulBerat.map(m => m.nama_matkul).join(', ');

    terminalBody.innerHTML = `
        <div class="terminal-line"><span class="term-cyan">=== DATA JADWAL MATA KULIAH ===</span></div>
        <div class="terminal-line text-white">Array(${jadwalKuliah.length}) [${jadwalKuliah.map(m => `${m.id_matkul} (${m.hari}, ${m.sks} SKS)`).join(', ')}]</div>
        <br>
        <div class="terminal-line"><span class="term-green">=== HASIL PERHITUNGAN TOTAL SKS WAJIB ===</span></div>
        <div class="terminal-line text-white">Total SKS untuk mata kuliah wajib Anda adalah: <span class="term-yellow">${totalWajib} SKS</span></div>
        <br>
        <div class="terminal-line"><span class="term-pink">=== HASIL FILTER MATA KULIAH BERAT (>= 3 SKS) ===</span></div>
        <div class="terminal-line text-white">Ditemukan ${matkulBerat.length} Mata Kuliah: <span class="text-white fw-bold">[${namaMatkulBerat}]</span></div>
    `;
}

// Loader animasi saat halaman pertama kali dibuka
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
                // jQuery: animasi fadeOut pada loader
                $(loaderWrapper).fadeOut(400, function() {
                    document.body.style.overflow = 'auto';
                    $(this).remove();
                });
            }, 200);
        }
    }

    window.requestAnimationFrame(animateLoading);
}

// Inisialisasi saat DOM siap
$(document).ready(function() {
    initLoader();
    renderJadwal();
    setupEventListeners();
    setupjQueryFeatures();
    tampilkanOutputConsole();

    // jQuery: sembunyikan form di awal (pakai jQuery, bukan d-none)
    $('#wrapper-form-jadwal').hide();
});
