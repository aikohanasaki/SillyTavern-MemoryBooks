# 📕 Buku Memori (Ekstensi SillyTavern)

Ekstensi SillyTavern generasi berikutnya untuk pembuatan memori yang otomatis, terstruktur, dan andal. Tandai adegan dalam obrolan, hasilkan ringkasan berbasis JSON dengan AI, dan simpan sebagai entri "[vektor](#vektor)" di buku latar Anda. Mendukung obrolan grup, manajemen profil tingkat lanjut, dan penanganan API/model yang kuat.

⚠️‼️**Harap baca [prasyarat](#-prasyarat) untuk catatan pemasangan!**‼️⚠️

**📘 [Panduan Pengguna (EN)](../USER_GUIDE.md)** | **📋 [Riwayat Versi & Log Perubahan](../changelog.md)** | [Menggunakan 📕 Memory Books dengan 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Indonesian.md)

---

### 📚 Tingkatkan dengan Lorebook Ordering (STLO)

Untuk organisasi memori yang lebih canggih dan integrasi cerita yang lebih dalam, sangat disarankan untuk menggunakan STMB bersama dengan [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Indonesian.md). Lihat panduan untuk praktik terbaik, instruksi pengaturan, dan tips!

> Catatan: Mendukung berbagai bahasa: lihat folder [`/locales`](../locales) untuk daftar. Readme dan Panduan Pengguna internasional/lokal dapat ditemukan di folder [`/userguides`](../userguides).
> Konverter buku latar dan perpustakaan templat prompt sampingan ada di folder [`/resources`](../resources).

## Pertanyaan Umum
### Di mana entri di menu Ekstensi?
Pengaturan terletak di menu Ekstensi (tongkat sihir 🪄 di sebelah kiri kotak input Anda). Cari "Buku Memori".

![Lokasi pengaturan STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

### Vektor?

Entri 🔗 di info dunia diberi nama "vektor" di UI ST. Inilah sebabnya saya menggunakan dunia vektor. Jika Anda tidak menggunakan ekstensi vektor (saya tidak), itu berfungsi melalui kata kunci. Ini semua otomatis sehingga Anda tidak perlu memikirkan kata kunci apa yang akan digunakan.

![Menu tarik-turun strategi ST](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/vectorized.png)

![Kata kunci yang dihasilkan melalui AI](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/keywords.png)

---

## 🚦 Yang Baru (v4.6.7)

### 🪲 Berbagai Perbaikan Bug
- memperbaiki pembuatan otomatis dan ringkasan otomatis

### 🌐 Internasionalisasi
- Internasionalisasi berkelanjutan (silakan periksa folder [`/locales`](../locales) untuk daftar.)

---

## 📋 Prasyarat

- **SillyTavern:** 1.13.4+ (terbaru direkomendasikan)
- ⚠️‼️**INSTAL UNTUK SEMUA PENGGUNA:**‼️⚠️ Karena STMB menggunakan kembali banyak fungsi dari kode dasar ST, pastikan ekstensi diinstal untuk semua pengguna sehingga lokasinya adalah `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`. Jika tidak, impor fungsi akan gagal.
- **Pemilihan Adegan:** Penanda awal dan akhir (awal < akhir) harus diatur.
- **Dukungan Penyelesaian Obrolan:** Dukungan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API penyelesaian obrolan lainnya.
- **Dukungan Penyelesaian Teks:** API penyelesaian teks (Kobold, TextGen, dll.) didukung saat terhubung melalui konfigurasi manual penuh atau sumber penyelesaian khusus di SillyTavern.

### Tips KoboldCpp untuk menggunakan 📕 ST Memory Books
Siapkan ini di ST (Anda dapat kembali ke Text Completion SETELAH STMB berfungsi)
- Chat Completion API
- Sumber chat completion khusus
- Endpoint `http://localhost:5001/v1` (Anda juga dapat menggunakan `127.0.0.1:5000/v1`)
- masukkan apa saja di "kunci API khusus" (tidak masalah, tetapi ST memerlukan satu)
- ID model harus `koboldcpp/namamodel` (jangan masukkan .gguf dalam nama model!)
- unduh dan impor preset chat completion (apa saja akan berfungsi) hanya agar Anda MEMILIKI preset chat completion. Ini menghindari kesalahan dari "tidak didukung"

## � Pengaturan Aktivasi Info Dunia/Buku Latar Global yang Direkomendasikan

- **Cocokkan Seluruh Kata:** biarkan tidak dicentang (salah)
- **Kedalaman Pindai:** lebih tinggi lebih baik (setidaknya 4)
- **Langkah Rekursi Maks:** 2 (rekomendasi umum, tidak wajib)
- **Konteks %:** 40% (berdasarkan jendela konteks 100.000 token) - dengan asumsi Anda tidak memiliki riwayat obrolan atau bot yang sangat berat

---

## �🚀 Memulai

### 1. **Instal & Muat**
- Muat SillyTavern dan pilih karakter atau obrolan grup.
- Tunggu tombol chevron (► ◄) muncul di pesan obrolan (mungkin memakan waktu hingga 10 detik).

![Tunggu tombol ini](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandai Adegan**
- Klik ► pada pesan pertama adegan Anda.
- Klik ◄ pada pesan terakhir.

![Umpan balik visual yang menunjukkan pemilihan adegan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Buat Memori**
- Buka menu Ekstensi (tongkat sihir 🪄) dan klik "Buku Memori", atau gunakan perintah slash `/creatememory`.
- Konfirmasikan pengaturan (profil, konteks, API/model) jika diminta.
- Tunggu pembuatan AI dan entri buku latar otomatis.

---

## 🆕 Pintasan Perintah Slash

- `/creatememory` akan menggunakan penanda awal/akhir chevron yang ada untuk membuat memori
- `/scenememory x-y` akan membuat memori yang dimulai dengan pesan x dan diakhiri dengan pesan y
- `/nextmemory` akan membuat memori dengan semua pesan sejak memori terakhir.

## 👥 Dukungan Obrolan Grup

- Semua fitur berfungsi dengan obrolan grup.
- Penanda adegan, pembuatan memori, dan integrasi buku latar disimpan dalam metadata grup.
- Tidak diperlukan pengaturan khusus—cukup pilih obrolan grup dan gunakan seperti biasa.

---

## 🧭 Mode Operasi

### **Mode Otomatis (Default)**
- **Cara kerjanya:** Secara otomatis menggunakan buku latar yang terikat pada obrolan Anda saat ini.
- **Terbaik untuk:** Kesederhanaan dan kecepatan. Sebagian besar pengguna harus mulai dari sini.
- **Cara menggunakan:** Pastikan buku latar dipilih di menu tarik-turun "Buku Latar Obrolan" untuk karakter atau obrolan grup Anda.

![Contoh pengikatan buku latar obrolan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mode Buat Buku Latar Otomatis** ⭐ *Baru di v4.2.0*
- **Cara kerjanya:** Secara otomatis membuat dan mengikat buku latar baru saat tidak ada, menggunakan templat penamaan khusus Anda.
- **Terbaik untuk:** Pengguna baru dan pengaturan cepat. Sempurna untuk pembuatan buku latar sekali klik.
- **Cara menggunakan:**
  1. Aktifkan "Buat buku latar secara otomatis jika tidak ada" di pengaturan ekstensi.
  2. Konfigurasikan templat penamaan Anda (default: "LTM - {{char}} - {{chat}}").
  3. Saat Anda membuat memori tanpa buku latar terikat, satu dibuat dan diikat secara otomatis.
- **Placeholder templat:** {{char}} (nama karakter), {{user}} (nama Anda), {{chat}} (ID obrolan)
- **Penomoran cerdas:** Secara otomatis menambahkan angka (2, 3, 4...) jika ada nama duplikat.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Buku Latar Manual.

### **Mode Buku Latar Manual**
- **Cara kerjanya:** Memungkinkan Anda memilih buku latar yang berbeda untuk memori berdasarkan per obrolan, mengabaikan buku latar utama yang terikat obrolan.
- **Terbaik untuk:** Pengguna tingkat lanjut yang ingin mengarahkan memori ke buku latar tertentu yang terpisah.
- **Cara menggunakan:**
  1. Aktifkan "Aktifkan Mode Buku Latar Manual" di pengaturan ekstensi.
  2. Pertama kali Anda membuat memori dalam obrolan, Anda akan diminta untuk memilih buku latar.
  3. Pilihan ini disimpan untuk obrolan spesifik itu sampai Anda menghapusnya atau beralih kembali ke Mode Otomatis.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Buat Buku Latar Otomatis.

---

## 📝 Pembuatan Memori

### **Hanya Output JSON**
Semua prompt dan preset **harus** menginstruksikan AI untuk mengembalikan hanya JSON yang valid, mis.:

```json
{
  "title": "Judul adegan singkat",
  "content": "Ringkasan rinci adegan...",
  "keywords": ["katakunci1", "katakunci2"]
}
```
**Tidak ada teks lain yang diizinkan dalam respons.**

### **Preset Bawaan**
1. **Ringkasan:** Ringkasan rinci adegan demi adegan.
2. **Ringkaskan:** Header penurunan harga untuk garis waktu, adegan, interaksi, hasil.
3. **Sinopsis:** Penurunan harga yang komprehensif dan terstruktur.
4. **Ringkas:** Ringkasan adegan singkat dengan garis waktu.
5. **Minimal:** Ringkasan 1-2 kalimat.

### **Prompt Kustom**
- Buat sendiri, tetapi **harus** mengembalikan JSON yang valid seperti di atas.

---

## 📚 Integrasi Buku Latar

- **Pembuatan Entri Otomatis:** Memori baru disimpan sebagai entri dengan semua metadata.
- **Deteksi Berbasis Bendera:** Hanya entri dengan bendera `stmemorybooks` yang dikenali sebagai memori.
- **Penomoran Otomatis:** Penomoran berurutan dengan bantalan nol dengan beberapa format yang didukung (`[000]`, `(000)`, `{000}`, `#000`).
- **Urutan Manual/Otomatis:** Pengaturan urutan penyisipan per profil.
- **Penyegaran Editor:** Secara opsional menyegarkan editor buku latar secara otomatis setelah menambahkan memori.

> **Memori yang ada harus dikonversi!**
> Gunakan [Konverter Buku Latar](../resources/lorebookconverter.html) untuk menambahkan bendera `stmemorybooks` dan bidang yang diperlukan.

---

### 🎡 Prompt Sampingan

Prompt Sampingan dapat digunakan seperti pelacak dan akan membuat entri di buku latar memori Anda.
- **Akses:** Dari pengaturan Buku Memori, klik “🎡 Manajer Prompt Sampingan”.
- **Fitur:**
    - Lihat semua prompt sampingan.
    - Buat prompt baru atau duplikat untuk bereksperimen dengan gaya prompt yang berbeda.
    - Edit atau hapus preset apa pun (termasuk yang bawaan).
    - Ekspor dan impor preset sebagai file JSON untuk cadangan atau berbagi.
    - Jalankan secara manual atau otomatis dengan pembuatan memori.
- **Kiat Penggunaan:**
    - Saat membuat prompt baru, Anda dapat menyalin dari yang sudah ada untuk kompatibilitas terbaik.
    - Pustaka Template Prompt Samping tambahan [file JSON](resources/SidePromptTemplateLibrary.json) - cukup impor untuk digunakan

---

### 🧠 Integrasi Regex untuk Kustomisasi Lanjutan
- **Kontrol Penuh atas Pemrosesan Teks**: Memory Books sekarang terintegrasi dengan ekstensi **Regex** SillyTanya, memungkinkan Anda menerapkan transformasi teks yang kuat pada dua tahap penting:
    1.  **Pembuatan Prompt**: Secara otomatis memodifikasi prompt yang dikirim ke AI dengan membuat skrip regex yang menargetkan penempatan **Input Pengguna**.
    2.  **Parsing Respons**: Membersihkan, memformat ulang, atau menstandarisasi respons mentah AI sebelum disimpan dengan menargetkan penempatan **Output AI**.
- **Dukungan Multi-Pilih:** Anda sekarang dapat memilih beberapa skrip regex sekaligus; semua skrip yang diaktifkan akan diterapkan secara berurutan selama pembuatan prompt dan pemrosesan respons, memungkinkan transformasi yang lebih canggih dan fleksibel.
- **Cara Kerjanya**: Integrasi ini mulus. Cukup buat dan aktifkan skrip yang Anda inginkan di ekstensi Regex, dan Memory Books akan menerapkannya secara otomatis selama pembuatan memori dan prompt samping.

---

## 👤 Manajemen Profil

- **Profil:** Setiap profil mencakup API, model, suhu, prompt/preset, format judul, dan pengaturan buku latar.
- **Impor/Ekspor:** Bagikan profil sebagai JSON.
- **Pembuatan Profil:** Gunakan popup opsi lanjutan untuk menyimpan profil baru.
- **Penggantian Per Profil:** Ganti sementara API/model/suhu untuk pembuatan memori, lalu pulihkan pengaturan asli Anda.

---

## ⚙️ Pengaturan & Konfigurasi

![Panel pengaturan utama](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Pengaturan Global**
- **Mode Buku Latar Manual:** Aktifkan untuk memilih buku latar per obrolan.
- **Buat buku latar secara otomatis jika tidak ada:** ⭐ *Baru di v4.2.0* - Secara otomatis membuat dan mengikat buku latar menggunakan templat penamaan Anda.
- **Templat Nama Buku Latar:** ⭐ *Baru di v4.2.0* - Sesuaikan nama buku latar yang dibuat secara otomatis dengan placeholder {{char}}, {{user}}, {{chat}}.
- **Izinkan Tumpang Tindih Adegan:** Izinkan atau cegah rentang memori yang tumpang tindih.
- **Selalu Gunakan Profil Default:** Lewati popup konfirmasi.
- **Tampilkan pratinjau memori:** Aktifkan popup pratinjau untuk meninjau dan mengedit memori sebelum menambahkan ke buku latar.
- **Tampilkan Notifikasi:** Alihkan pesan toast.
- **Segarkan Editor:** Segarkan editor buku latar secara otomatis setelah pembuatan memori.
- **Ambang Peringatan Token:** Atur tingkat peringatan untuk adegan besar (default: 30.000).
- **Memori Sebelumnya Default:** Jumlah memori sebelumnya yang akan disertakan sebagai konteks (0-7).
- **Buat ringkasan memori secara otomatis:** Aktifkan pembuatan memori otomatis secara berkala.
- **Interval Ringkasan Otomatis:** Jumlah pesan setelah itu untuk membuat ringkasan memori secara otomatis (10-200, default: 100).
- **Format Judul Memori:** Pilih atau sesuaikan (lihat di bawah).

![Konfigurasi profil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Bidang Profil**
- **Nama:** Nama tampilan.
- **API/Penyedia:** openai, claude, kustom, dll.
- **Model:** Nama model (mis., gpt-4, claude-3-opus).
- **Suhu:** 0.0–2.0.
- **Prompt atau Preset:** Kustom atau bawaan.
- **Format Judul:** Templat per profil.
- **Mode Aktivasi:** Vektorisasi, Konstan, Normal.
- **Posisi:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN.
- **Mode Urutan:** Otomatis/manual.
- **Rekursi:** Cegah/tunda rekursi.

---

## 🏷️ Pemformatan Judul

Sesuaikan judul entri buku latar Anda menggunakan sistem templat yang kuat.

- **Placeholder:**
  - `{{title}}` - Judul yang dihasilkan oleh AI (mis., "Pertemuan Takdir").
  - `{{scene}}` - Rentang pesan (mis., "Adegan 15-23").
  - `{{char}}` - Nama karakter.
  - `{{user}}` - Nama pengguna Anda.
  - `{{messages}}` - Jumlah pesan dalam adegan.
  - `{{profile}}` - Nama profil yang digunakan untuk pembuatan.
  - Placeholder tanggal/waktu saat ini dalam berbagai format (mis., `13 Agustus 2025` untuk tanggal, `11:08 PM` untuk waktu).
- **Penomoran otomatis:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan sekarang juga bentuk terbungkus seperti `#[000]`, `([000])`, `{[000]}` untuk penomoran berurutan dengan bantalan nol.
- **Format Kustom:** Anda dapat membuat format sendiri. Mulai v4.5.1, semua karakter Unicode yang dapat dicetak (termasuk emoji, CJK, beraksen, simbol, dll.) diizinkan dalam judul; hanya karakter kontrol Unicode yang diblokir.

---

## 🧵 Memori Konteks

- **Sertakan hingga 7 memori sebelumnya** sebagai konteks untuk kesinambungan yang lebih baik.
- **Perkiraan token** mencakup memori konteks untuk akurasi.

![Pembuatan memori dengan konteks](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Umpan Balik Visual & Aksesibilitas

- **Status Tombol:**
  - Tidak aktif, aktif, pilihan valid, dalam adegan, memproses.

![Pemilihan adegan lengkap yang menunjukkan semua status visual](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)


- **Aksesibilitas:**
  - Navigasi keyboard, indikator fokus, atribut ARIA, gerakan yang dikurangi, ramah seluler.

---

## 🛠️ Pemecahan Masalah

- **Tidak ada buku latar yang tersedia atau dipilih:**
  - Dalam Mode Manual, pilih buku latar saat diminta.
  - Dalam Mode Otomatis, ikat buku latar ke obrolan Anda.
  - Atau aktifkan "Buat buku latar secara otomatis jika tidak ada" untuk pembuatan otomatis.

- **Tidak ada adegan yang dipilih:**
  - Tandai titik awal (►) dan akhir (◄).

- **Adegan tumpang tindih dengan memori yang ada:**
  - Pilih rentang yang berbeda, atau aktifkan "Izinkan tumpang tindih adegan" di pengaturan.

![Peringatan tumpang tindih adegan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI gagal menghasilkan memori yang valid:**
  - Gunakan model yang mendukung output JSON.
  - Periksa pengaturan prompt dan model Anda.

- **Ambang peringatan token terlampaui:**
  - Gunakan adegan yang lebih kecil, atau tingkatkan ambang.

- **Tombol chevron hilang:**
  - Tunggu ekstensi dimuat, atau segarkan.

- **Data karakter tidak tersedia:**
  - Tunggu obrolan/grup dimuat sepenuhnya.

---

## 📝 Kebijakan Karakter (v4.5.1+)

- **Diizinkan dalam judul:** Semua karakter Unicode yang dapat dicetak diizinkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
- **Diblokir:** Hanya karakter kontrol Unicode (U+0000–U+001F, U+007F–U+009F) yang diblokir; ini dihapus secara otomatis.

Lihat [Detail Kebijakan Karakter](../charset.md) untuk contoh dan catatan migrasi.
---

*Dikembangkan dengan cinta menggunakan VS Code/Cline, pengujian ekstensif, dan umpan balik komunitas.* 🤖💕
