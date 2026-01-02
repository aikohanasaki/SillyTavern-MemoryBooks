# 📕 Memory Books (Sebuah Ekstensi SillyTavern)

Ekstensi SillyTavern generasi berikutnya untuk pembuatan memori yang otomatis, terstruktur, dan andal. Tandai adegan dalam obrolan, buat ringkasan berbasis JSON dengan AI, dan simpan sebagai entri "[vectorized](#vectorized)" di lorebook Anda. Mendukung obrolan grup, manajemen profil tingkat lanjut, dan penanganan API/model yang tangguh.

Mulai di sini:

- ⚠️‼️Harap baca [prasyarat](#-prasyarat) untuk catatan instalasi (terutama jika Anda menjalankan API Text Completion)
- ❓ [Pertanyaan yang Sering Diajukan (FAQ)](#faq)
- 🛠️ [Pemecahan Masalah](#pemecahan-masalah)

Tautan lain:

- 📘 [Panduan Pengguna (EN)](USER_GUIDE.md)
- 📋 [Riwayat Versi & Log Perubahan](changelog.md)
- 💡 [Menggunakan 📕 Memory Books dengan 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Tingkatkan Kekuatan dengan Lorebook Ordering (STLO)

Untuk pengorganisasian memori tingkat lanjut dan integrasi cerita yang lebih dalam, kami sangat menyarankan penggunaan STMB bersama dengan [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk praktik terbaik, instruksi penyiapan, dan tips!

> Catatan: Mendukung berbagai bahasa: lihat folder [`/locales`](locales) untuk daftarnya. Readme dan Panduan Pengguna Internasional/Lokal dapat ditemukan di folder [`/userguides`](userguides).
> Konverter Lorebook dan pustaka templat prompt sampingan (side prompt) ada di folder [`/resources`](resources).

---

## 📋 Prasyarat

- **SillyTavern:** 1.13.5+ (terbaru direkomendasikan)
- ⚠️‼️**INSTAL UNTUK SEMUA PENGGUNA:**‼️⚠️ Karena STMB menggunakan kembali banyak fungsi dari kode dasar ST, harap pastikan bahwa ekstensi diinstal untuk semua pengguna sehingga lokasinya adalah `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`. Jika tidak, impor fungsi akan gagal.
- **Pemilihan Adegan:** Penanda mulai dan akhir (mulai < akhir) harus ditetapkan.
- **Dukungan Chat Completion:** Dukungan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API chat completion lainnya.
- **Dukungan Text Completion:** API Text completion (Kobold, TextGen, dll.) didukung ketika terhubung melalui titik akhir (endpoint) API Chat Completion (kompatibel dengan OpenAI). Saya menyarankan untuk menyiapkan koneksi API Chat Completion sesuai dengan tips KoboldCpp di bawah ini (ubah sesuai kebutuhan jika Anda menggunakan Ollama atau perangkat lunak lain). Setelah itu, siapkan profil STMB dan gunakan Kustom (disarankan) atau konfigurasi manual penuh (hanya jika Kustom gagal atau Anda memiliki lebih dari satu koneksi kustom).

### Tips KoboldCpp untuk menggunakan 📕 ST Memory Books

Siapkan ini di ST (Anda dapat mengubah kembali ke Text Completion SETELAH Anda berhasil menjalankan STMB)

- API Chat Completion
- Sumber chat completion kustom
- Endpoint `http://localhost:5001/v1` (Anda juga dapat menggunakan `127.0.0.1:5000/v1`)
- masukkan apa saja di "custom API key" (tidak masalah, tetapi ST memerlukannya)
- ID model harus `koboldcpp/modelname` (jangan masukkan .gguf pada nama model!)
- unduh preset chat completion dan impor (apa saja boleh) hanya supaya Anda MEMILIKI preset chat completion. Ini menghindari kesalahan "tidak didukung"

## 💡 Pengaturan Aktivasi Info Dunia/Lorebook Global yang Disarankan

- **Match Whole Words (Cocokkan Seluruh Kata):** biarkan tidak dicentang (false)
- **Scan Depth (Kedalaman Pemindaian):** lebih tinggi lebih baik (milik saya diatur ke 8)
- **Max Recursion Steps (Langkah Rekursi Maks):** 2 (rekomendasi umum, tidak wajib)
- **Context % (Persentase Konteks):** 80% (berdasarkan jendela konteks 100.000 token) - dengan asumsi Anda tidak memiliki riwayat obrolan atau bot yang sangat berat.

---

## 🚀 Memulai

### 1. **Instal & Muat**

- Muat SillyTavern dan pilih karakter atau obrolan grup.
- Tunggu tombol chevron (► ◄) muncul di pesan obrolan (mungkin memakan waktu hingga 10 detik).

![Tunggu tombol-tombol ini](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandai Adegan**

- Klik ► pada pesan pertama adegan Anda.
- Klik ◄ pada pesan terakhir.

![Umpan balik visual yang menunjukkan pemilihan adegan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Buat Memori**

- Buka menu Ekstensi (tongkat ajaib 🪄) dan klik "Memory Books", atau gunakan perintah slash `/creatememory`.
- Konfirmasikan pengaturan (profil, konteks, API/model) jika diminta.
- Tunggu pembuatan AI dan entri lorebook otomatis.

---

## 🆕 Pintasan Perintah Slash

- `/creatememory` akan menggunakan penanda mulai/akhir chevron yang ada untuk membuat memori
- `/scenememory x-y` akan membuat memori yang dimulai dengan pesan x dan diakhiri dengan pesan y
- `/nextmemory` akan membuat memori dengan semua pesan sejak memori terakhir.

## 👥 Dukungan Obrolan Grup

- Semua fitur berfungsi dengan obrolan grup.
- Penanda adegan, pembuatan memori, dan integrasi lorebook disimpan dalam metadata grup.
- Tidak diperlukan pengaturan khusus—cukup pilih obrolan grup dan gunakan seperti biasa.

---

## 🧭 Mode Operasi

### **Mode Otomatis (Default)**

- **Cara kerjanya:** Secara otomatis menggunakan lorebook yang terikat pada obrolan Anda saat ini.
- **Terbaik untuk:** Kesederhanaan dan kecepatan. Sebagian besar pengguna harus mulai di sini.
- **Cara menggunakan:** Pastikan lorebook dipilih di menu dropdown "Chat Lorebooks" untuk karakter atau obrolan grup Anda.

![Contoh pengikatan lorebook obrolan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mode Buat Lorebook Otomatis** ⭐ _Baru di v4.2.0_

- **Cara kerjanya:** Secara otomatis membuat dan mengikat lorebook baru ketika tidak ada yang tersedia, menggunakan templat penamaan kustom Anda.
- **Terbaik untuk:** Pengguna baru dan penyiapan cepat. Sempurna untuk pembuatan lorebook satu klik.
- **Cara menggunakan:**
  1. Aktifkan "Auto-create lorebook if none exists" (Buat lorebook otomatis jika tidak ada) di pengaturan ekstensi.
  2. Konfigurasikan templat penamaan Anda (default: "LTM - {{char}} - {{chat}}").
  3. Saat Anda membuat memori tanpa lorebook yang terikat, satu lorebook akan dibuat dan diikat secara otomatis.
- **Placeholder templat:** {{char}} (nama karakter), {{user}} (nama Anda), {{chat}} (ID obrolan)
- **Penomoran cerdas:** Secara otomatis menambahkan nomor (2, 3, 4...) jika nama duplikat ada.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Lorebook Manual.

### **Mode Lorebook Manual**

- **Cara kerjanya:** Memungkinkan Anda memilih lorebook yang berbeda untuk memori berdasarkan per-obrolan, mengabaikan lorebook utama yang terikat pada obrolan.
- **Terbaik untuk:** Pengguna tingkat lanjut yang ingin mengarahkan memori ke lorebook tertentu yang terpisah.
- **Cara menggunakan:**
  1. Aktifkan "Enable Manual Lorebook Mode" (Aktifkan Mode Lorebook Manual) di pengaturan ekstensi.
  2. Saat pertama kali Anda membuat memori dalam obrolan, Anda akan diminta untuk memilih lorebook.
  3. Pilihan ini disimpan untuk obrolan spesifik tersebut sampai Anda menghapusnya atau beralih kembali ke Mode Otomatis.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Buat Lorebook Otomatis.

---

## 📝 Pembuatan Memori

### **Output Hanya-JSON**

Semua prompt dan preset **harus** menginstruksikan AI untuk mengembalikan hanya JSON yang valid, contoh:

```json
{
  "title": "Judul adegan pendek",
  "content": "Ringkasan mendetail dari adegan...",
  "keywords": ["katakunci1", "katakunci2"]
}
```

**Tidak ada teks lain yang diperbolehkan dalam respons.**

### **Preset Bawaan**

1. **Summary (Ringkasan):** Ringkasan mendetail poin-demi-poin.
2. **Summarize (Merangkum):** Header Markdown untuk garis waktu, poin penting, interaksi, hasil.
3. **Synopsis (Sinopsis):** Markdown komprehensif dan terstruktur.
4. **Sum Up (Menjumlahkan):** Ringkasan poin ringkas dengan garis waktu.
5. **Minimal:** Ringkasan 1-2 kalimat.

### **Prompt Kustom**

- Buat milik Anda sendiri, tetapi **harus** mengembalikan JSON yang valid seperti di atas.

---

## 📚 Integrasi Lorebook

- **Pembuatan Entri Otomatis:** Memori baru disimpan sebagai entri dengan semua metadata.
- **Deteksi Berbasis Bendera:** Hanya entri dengan bendera `stmemorybooks` yang dikenali sebagai memori.
- **Penomoran Otomatis:** Penomoran berurutan dengan nol di depan (zero-padded) dengan berbagai format yang didukung (`[000]`, `(000)`, `{000}`, `#000`).
- **Urutan Manual/Otomatis:** Pengaturan urutan penyisipan per profil.
- **Penyegaran Editor:** Secara opsional menyegarkan editor lorebook secara otomatis setelah menambahkan memori.

> **Memori yang sudah ada harus dikonversi!**
> Gunakan [Konverter Lorebook](https://www.google.com/search?q=/resources/lorebookconverter.html) untuk menambahkan bendera `stmemorybooks` dan bidang yang diperlukan.

---

### 🎡 Prompt Sampingan (Side Prompts)

Prompt Sampingan dapat digunakan seperti pelacak dan akan membuat entri di lorebook memori Anda.

- **Akses:** Dari pengaturan Memory Books, klik “🎡 Side Prompt Manager”.
- **Fitur:**
- Lihat semua prompt sampingan.
- Buat prompt baru atau duplikat untuk bereksperimen dengan gaya prompt yang berbeda.
- Edit atau hapus preset apa pun (termasuk bawaan).
- Ekspor dan impor preset sebagai file JSON untuk cadangan atau berbagi.
- Jalankan secara manual atau otomatis dengan pembuatan memori.

- **Tips Penggunaan:**
- Saat membuat prompt baru, Anda dapat menyalin dari bawaan untuk kompatibilitas terbaik.
- Pustaka Templat Prompt Sampingan Tambahan [File JSON](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - cukup impor untuk digunakan.

---

### 🧠 Integrasi Regex untuk Kustomisasi Tingkat Lanjut

- **Kontrol Penuh Atas Pemrosesan Teks**: Memory Books sekarang terintegrasi dengan ekstensi **Regex** SillyTavern, memungkinkan Anda menerapkan transformasi teks yang kuat pada dua tahap utama:

1. **Pembuatan Prompt**: Memodifikasi prompt yang dikirim ke AI secara otomatis dengan membuat skrip regex yang menargetkan penempatan **Input Pengguna**.
2. **Parsing Respons**: Membersihkan, memformat ulang, atau menstandarisasi respons mentah AI sebelum disimpan dengan menargetkan penempatan **Output AI**.

- **Dukungan Multi-Pilih**: Anda sekarang dapat memilih banyak skrip regex (multi-select). Semua skrip yang diaktifkan akan diterapkan secara berurutan pada setiap tahap (Pembuatan Prompt dan Parsing Respons), memungkinkan transformasi tingkat lanjut dan fleksibel.
- **Cara Kerjanya**: Integrasinya mulus. Cukup buat dan aktifkan (multi-pilih) skrip yang Anda inginkan di ekstensi Regex, dan Memory Books akan menerapkannya secara otomatis selama pembuatan memori dan prompt sampingan.

---

## 👤 Manajemen Profil

- **Profil:** Setiap profil mencakup API, model, suhu, prompt/preset, format judul, dan pengaturan lorebook.
- **Impor/Ekspor:** Bagikan profil sebagai JSON.
- **Pembuatan Profil:** Gunakan popup opsi lanjutan untuk menyimpan profil baru.
- **Override Per-Profil:** Beralih sementara API/model/suhu untuk pembuatan memori, lalu pulihkan pengaturan asli Anda.

---

## ⚙️ Pengaturan & Konfigurasi

### **Pengaturan Global**

[Ikhtisar video singkat di Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode (Mode Lorebook Manual):** Aktifkan untuk memilih lorebook per obrolan.
- **Auto-create lorebook if none exists (Buat lorebook otomatis jika tidak ada):** ⭐ _Baru di v4.2.0_ - Secara otomatis membuat dan mengikat lorebook menggunakan templat penamaan Anda.
- **Lorebook Name Template (Templat Nama Lorebook):** ⭐ _Baru di v4.2.0_ - Kustomisasi nama lorebook yang dibuat otomatis dengan placeholder {{char}}, {{user}}, {{chat}}.
- **Allow Scene Overlap (Izinkan Tumpang Tindih Adegan):** Izinkan atau cegah rentang memori yang tumpang tindih.
- **Always Use Default Profile (Selalu Gunakan Profil Default):** Lewati popup konfirmasi.
- **Show memory previews (Tampilkan pratinjau memori):** Aktifkan popup pratinjau untuk meninjau dan mengedit memori sebelum ditambahkan ke lorebook.
- **Show Notifications (Tampilkan Notifikasi):** Beralih pesan toast (notifikasi).
- **Refresh Editor (Segarkan Editor):** Segarkan editor lorebook secara otomatis setelah pembuatan memori.
- **Token Warning Threshold (Ambang Peringatan Token):** Tetapkan tingkat peringatan untuk adegan besar (default: 30.000).
- **Default Previous Memories (Memori Sebelumnya Default):** Jumlah memori sebelumnya untuk disertakan sebagai konteks (0-7).
- **Auto-create memory summaries (Buat ringkasan memori otomatis):** Aktifkan pembuatan memori otomatis pada interval tertentu.
- **Auto-Summary Interval (Interval Ringkasan Otomatis):** Jumlah pesan yang setelahnya akan membuat ringkasan memori secara otomatis (10-200, default: 100).
- **Memory Title Format (Format Judul Memori):** Pilih atau kustomisasi (lihat di bawah).

### **Bidang Profil**

- **Name:** Nama tampilan.
- **API/Provider:** openai, claude, custom, dll.
- **Model:** Nama model (mis., gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Kustom atau bawaan.
- **Title Format:** Templat per-profil.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (dan nama bidang).
- **Order Mode:** Auto/manual.
- **Recursion:** Mencegah/menunda rekursi.

---

## 🏷️ Pemformatan Judul

Kustomisasi judul entri lorebook Anda menggunakan sistem templat yang kuat.

- **Placeholder:**
- `{{title}}` - Judul yang dihasilkan oleh AI (mis., "Sebuah Pertemuan yang Menentukan").
- `{{scene}}` - Rentang pesan (mis., "Scene 15-23").
- `{{char}}` - Nama karakter.
- `{{user}}` - Nama pengguna Anda.
- `{{messages}}` - Jumlah pesan dalam adegan.
- `{{profile}}` - Nama profil yang digunakan untuk pembuatan.
- Placeholder tanggal/waktu saat ini dalam berbagai format (mis., `August 13, 2025` untuk tanggal, `11:08 PM` untuk waktu).

- **Penomoran Otomatis:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan sekarang juga bentuk terbungkus seperti `#[000]`, `([000])`, `{[000]}` untuk penomoran berurutan dengan nol di depan.
- **Format Kustom:** Anda dapat membuat format Anda sendiri. Mulai v4.5.1, semua karakter Unicode yang dapat dicetak (termasuk emoji, CJK, huruf beraksen, simbol, dll.) diperbolehkan dalam judul; hanya karakter kontrol Unicode yang diblokir.

---

## 🧵 Memori Konteks

- **Sertakan hingga 7 memori sebelumnya** sebagai konteks untuk kontinuitas yang lebih baik.
- **Estimasi token** mencakup memori konteks untuk akurasi.

---

## 🎨 Umpan Balik Visual & Aksesibilitas

- **Status Tombol:**
- Tidak aktif, aktif, pilihan valid, dalam adegan, memproses.

- **Aksesibilitas:**
- Navigasi keyboard, indikator fokus, atribut ARIA, gerakan berkurang (reduced motion), ramah seluler.

---

# FAQ

### Saya tidak dapat menemukan Memory Books di menu Ekstensi!

Pengaturan terletak di menu Ekstensi (tongkat ajaib 🪄 di sebelah kiri kotak input Anda). Cari "Memory Books".

### Apakah saya perlu menjalankan vektor (vectors)?

Entri 🔗 di info dunia (world info) dinamai "vectorized" di UI ST. Inilah sebabnya saya menggunakan kata "vectorized". Jika Anda tidak menggunakan ekstensi vektor (saya tidak), ini bekerja melalui kata kunci (keywords). Ini semua otomatis sehingga Anda tidak perlu memikirkan kata kunci apa yang akan digunakan.

### Haruskah saya membuat lorebook terpisah untuk memori, atau bisakah saya menggunakan lorebook yang sama yang sudah saya gunakan untuk hal lain?

Saya menyarankan agar lorebook memori Anda menjadi buku terpisah. Ini membuatnya lebih mudah untuk mengatur memori (vs entri lain). Misalnya, menambahkannya ke obrolan grup, menggunakannya di obrolan lain, atau menetapkan anggaran lorebook individu (menggunakan STLO).

### Haruskah saya menggunakan 'Delay until recursion' jika Memory Books adalah satu-satunya lorebook?

Tidak. Jika tidak ada info dunia atau lorebook lain, memilih 'Delay until recursion' (Tunda hingga rekursi) dapat mencegah loop pertama memicu, menyebabkan tidak ada yang aktif. Jika Memory Books adalah satu-satunya lorebook, nonaktifkan 'Delay until recursion' atau pastikan setidaknya satu info dunia/lorebook tambahan dikonfigurasi.

---

# Pemecahan Masalah

- **Tidak ada lorebook yang tersedia atau dipilih:**
- Dalam Mode Manual, pilih lorebook saat diminta.
- Dalam Mode Otomatis, ikat lorebook ke obrolan Anda.
- Atau aktifkan "Auto-create lorebook if none exists" untuk pembuatan otomatis.

- **Tidak ada adegan yang dipilih:**
- Tandai kedua titik mulai (►) dan akhir (◄).

- **Adegan tumpang tindih dengan memori yang ada:**
- Pilih rentang yang berbeda, atau aktifkan "Allow scene overlap" (Izinkan tumpang tindih adegan) di pengaturan.

- **AI gagal menghasilkan memori yang valid:**
- Gunakan model yang mendukung output JSON.
- Periksa pengaturan prompt dan model Anda.

- **Ambang batas peringatan token terlampaui:**
- Gunakan adegan yang lebih kecil, atau tingkatkan ambang batas.

- **Tombol chevron hilang:**
- Tunggu ekstensi dimuat, atau segarkan (refresh).

- **Data karakter tidak tersedia:**
- Tunggu obrolan/grup dimuat sepenuhnya.

---

## 📝 Kebijakan Karakter (v4.5.1+)

- **Diizinkan dalam judul:** Semua karakter Unicode yang dapat dicetak diperbolehkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
- **Diblokir:** Hanya karakter kontrol Unicode (U+0000–U+001F, U+007F–U+009F) yang diblokir; ini dihapus secara otomatis.

## Lihat [Rincian Kebijakan Karakter](https://www.google.com/search?q=charset.md) untuk contoh dan catatan migrasi.

_Dikembangkan dengan cinta menggunakan VS Code/Cline, pengujian ekstensif, dan umpan balik komunitas._ 🤖💕
