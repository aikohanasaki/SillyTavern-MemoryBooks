# 📕 Memory Books (Ekstensi SillyTavern)

Ekstensi SillyTavern generasi berikutnya untuk pembuatan memori otomatis, terstruktur, dan andal. Tandai adegan dalam obrolan, buat ringkasan berbasis JSON dengan AI, dan simpan sebagai entri "[ter-vektorisasi](#vectorized)" di lorebook Anda. Mendukung obrolan grup, manajemen profil tingkat lanjut, dan penanganan API/model yang sangat handal.

### ❓ Kosakata
- Scene (Adegan) → Memori
- Many Scenes (Banyak Adegan) → Ringkasan Alur (Arc Summary)
- Always-On (Selalu Aktif) → Prompt Sampingan (Pelacak)

## ❗ Baca Ini Dulu!

Mulai di sini:
* ⚠️‼️ Harap baca [prasyarat](#-prerequisites) untuk catatan instalasi (terutama jika Anda menjalankan Text Completion API)
* ❓ [Tanya Jawab (FAQ)](#FAQ)
* 🛠️ [Pemecahan Masalah](#Troubleshooting)

Tautan lain:
* 📘 [Panduan Pengguna (EN)](USER_GUIDE.md)
* 📋 [Riwayat Versi & Log Perubahan](changelog.md)
* 💡 [Menggunakan 📕 Memory Books dengan 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Tingkatkan Kemampuan dengan Lorebook Ordering (STLO)

Untuk pengorganisasian memori tingkat lanjut dan integrasi cerita yang lebih dalam, kami sangat menyarankan penggunaan STMB bersama dengan [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk praktik terbaik, instruksi penyiapan, dan tips!

> Catatan: Mendukung berbagai bahasa: lihat folder [`/locales`](locales) untuk daftarnya. Readme dan Panduan Pengguna Internasional/lokal dapat ditemukan di folder [`/userguides`](userguides).
> Konverter Lorebook dan pustaka templat prompt sampingan ada di folder [`/resources`](resources).

---

## 📋 Prasyarat (Prerequisites)

- **SillyTavern:** 1.14.0+ (disarankan yang terbaru)
- **Pemilihan Adegan:** Penanda awal dan akhir (mulai < akhir) harus diatur.
- **Dukungan Chat Completion:** Dukungan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API chat completion lainnya.
- **Dukungan Text Completion:** API text completion (Kobold, TextGen, dll.) didukung saat terhubung melalui endpoint Chat Completion API (kompatibel dengan OpenAI). Saya menyarankan untuk menyiapkan koneksi Chat Completion API sesuai dengan tips KoboldCpp di bawah ini (ubah sesuai kebutuhan jika Anda menggunakan Ollama atau perangkat lunak lain). Setelah itu, siapkan profil STMB dan gunakan konfigurasi Custom (disarankan) atau manual penuh (hanya jika Custom gagal atau Anda memiliki lebih dari satu koneksi custom).
**CATATAN**: Harap diperhatikan bahwa jika Anda menggunakan Text Completion, Anda harus...

### Tips KoboldCpp untuk menggunakan 📕 ST Memory Books
Siapkan ini di ST (Anda dapat mengubah kembali ke Text Completion SETELAH Anda membuat STMB berfungsi)
- Chat Completion API
- Sumber chat completion: Custom
- Endpoint `http://localhost:5001/v1` (Anda juga bisa menggunakan `127.0.0.1:5000/v1`)
- Masukkan apa saja di "custom API key" (tidak masalah, tetapi ST memerlukannya)
- ID model harus `koboldcpp/namamodel` (jangan cantumkan .gguf di nama model!)
- Unduh preset chat completion dan impor (apa saja boleh) hanya agar Anda MEMILIKI preset chat completion. Ini menghindari kesalahan "not supported" (tidak didukung).
- Ubah panjang respons maksimum pada preset chat completion menjadi setidaknya 2048; disarankan 4096. (Lebih kecil berarti Anda berisiko terpotong).

### Tips Llama.cpp untuk menggunakan 📕 ST Memory Books
Sama seperti Kobold, atur hal berikut sebagai _Chat Completion API_ di ST (Anda dapat mengubah kembali ke Chat Completion setelah memverifikasi STMB berfungsi):
- Buat profil koneksi baru untuk Chat Completion API
- Sumber Completion: `Custom (Open-AI Compatible)`
- URL Endpoint: `http://host.docker.internal:8080/v1` jika menjalankan ST di docker, jika tidak gunakan `http://localhost:8080/v1`
- Custom API key: masukkan apa saja (ST memerlukannya)
- ID Model: `llama2-7b-chat.gguf` (atau model Anda, tidak masalah jika Anda tidak menjalankan lebih dari satu di llama.cpp)
- Prompt post-processing: none (tidak ada)

Untuk memulai Llama.cpp, saya sarankan menempatkan sesuatu yang mirip dengan berikut ini dalam skrip shell atau file bat, agar startup lebih mudah:
```sh
llama-server -m <path-model> -c <ukuran-konteks> --port 8080

```

## 💡 Pengaturan Aktivasi World Info/Lorebook Global yang Disarankan

* **Match Whole Words (Cocokkan Seluruh Kata):** biarkan tidak dicentang (false)
* **Scan Depth (Kedalaman Pindai):** semakin tinggi semakin baik (milik saya diatur ke 8)
* **Max Recursion Steps (Langkah Rekursi Maks):** 2 (rekomendasi umum, tidak wajib)
* **Context % (Persentase Konteks):** 80% (berdasarkan jendela konteks 100.000 token) - dengan asumsi Anda tidak memiliki riwayat obrolan atau bot yang sangat berat.

---

## 🚀 Memulai

### 1. **Instal & Muat**

* Muat SillyTavern dan pilih karakter atau obrolan grup.
* Tunggu hingga tombol chevron (► ◄) muncul di pesan obrolan (mungkin memakan waktu hingga 10 detik).

### 2. **Tandai Adegan**

* Klik ► pada pesan pertama adegan Anda.
* Klik ◄ pada pesan terakhir.

### 3. **Buat Memori**

* Buka menu Ekstensi (tongkat ajaib 🪄) dan klik "Memory Books", atau gunakan perintah slash `/creatememory`.
* Konfirmasikan pengaturan (profil, konteks, API/model) jika diminta.
* Tunggu pembuatan AI dan entri lorebook otomatis.

---

## 🆕 Pintasan Perintah Slash

* `/creatememory` akan menggunakan penanda awal/akhir chevron yang ada untuk membuat memori.
* `/scenememory x-y` akan membuat memori yang dimulai dengan pesan x dan diakhiri dengan pesan y.
* `/nextmemory` akan membuat memori dengan semua pesan sejak memori terakhir.

## 👥 Dukungan Obrolan Grup

* Semua fitur berfungsi dengan obrolan grup.
* Penanda adegan, pembuatan memori, dan integrasi lorebook disimpan dalam metadata grup.
* Tidak diperlukan pengaturan khusus—cukup pilih obrolan grup dan gunakan seperti biasa.

---

## 🧭 Mode Operasi

### **Mode Otomatis (Default)**

* **Cara kerjanya:** Secara otomatis menggunakan lorebook yang terikat pada obrolan Anda saat ini.
* **Terbaik untuk:** Kesederhanaan dan kecepatan. Sebagian besar pengguna harus mulai di sini.
* **Cara menggunakan:** Pastikan lorebook dipilih di dropdown "Chat Lorebooks" untuk karakter atau obrolan grup Anda.

### **Mode Buat Lorebook Otomatis** ⭐ *Baru di v4.2.0*

* **Cara kerjanya:** Secara otomatis membuat dan mengikat lorebook baru jika tidak ada, menggunakan templat penamaan kustom Anda.
* **Terbaik untuk:** Pengguna baru dan pengaturan cepat. Sempurna untuk pembuatan lorebook sekali klik.
* **Cara menggunakan:**
1. Aktifkan "Auto-create lorebook if none exists" di pengaturan ekstensi.
2. Konfigurasikan templat penamaan Anda (default: "LTM - {{char}} - {{chat}}").
3. Saat Anda membuat memori tanpa lorebook yang terikat, satu akan dibuat dan diikat secara otomatis.


* **Placeholder templat:** {{char}} (nama karakter), {{user}} (nama Anda), {{chat}} (ID obrolan)
* **Penomoran cerdas:** Secara otomatis menambahkan angka (2, 3, 4...) jika ada nama duplikat.
* **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Lorebook Manual.

### **Mode Lorebook Manual**

* **Cara kerjanya:** Memungkinkan Anda memilih lorebook yang berbeda untuk memori per obrolan, mengabaikan lorebook utama yang terikat pada obrolan.
* **Terbaik untuk:** Pengguna tingkat lanjut yang ingin mengarahkan memori ke lorebook tertentu yang terpisah.
* **Cara menggunakan:**
1. Aktifkan "Enable Manual Lorebook Mode" di pengaturan ekstensi.
2. Saat pertama kali Anda membuat memori dalam obrolan, Anda akan diminta untuk memilih lorebook.
3. Pilihan ini disimpan untuk obrolan khusus tersebut hingga Anda menghapusnya atau beralih kembali ke Mode Otomatis.


* **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Buat Lorebook Otomatis.

---

## 🧩 Jenis Memori: Adegan vs Alur (Arcs)

📕 Memory Books mendukung **dua tingkat memori naratif**, masing-masing dirancang untuk jenis kontinuitas yang berbeda.

### 🎬 Memori Adegan (Default)

Memori adegan menangkap **apa yang terjadi** dalam rentang pesan tertentu.

* Berdasarkan pemilihan adegan eksplisit (► ◄)
* Ideal untuk ingatan momen-ke-momen
* Mempertahankan dialog, tindakan, dan hasil langsung
* Paling baik digunakan secara sering

Ini adalah jenis memori standar dan yang paling umum digunakan.

---

### 🧭 Ringkasan Alur / Arc Summaries *(Beta)*

Ringkasan alur menangkap **apa yang berubah seiring waktu** di berbagai adegan.

Daripada meringkas peristiwa, ringkasan alur berfokus pada:

* Pengembangan karakter dan perubahan hubungan
* Tujuan jangka panjang, ketegangan, dan resolusi
* Lintasan emosional dan arah narasi
* Perubahan keadaan persisten yang harus tetap stabil

Ringkasan alur adalah **memori tingkat tinggi dengan frekuensi rendah** yang dirancang untuk mencegah penyimpangan karakter dan kehilangan narasi dalam obrolan yang berjalan lama.

> 💡 Anggap ringkasan alur sebagai *rekap musim*, bukan log adegan.

#### Kapan menggunakan Ringkasan Alur

* Setelah perubahan hubungan besar
* Di akhir bab cerita atau alur
* Ketika motivasi, kepercayaan, atau dinamika kekuasaan berubah
* Sebelum memulai fase baru cerita

#### Catatan Beta

* Ringkasan alur sensitif terhadap prompt dan sengaja dibuat konservatif
* Disarankan untuk meninjau sebelum memasukkan ke lorebook
* Paling baik dipasangkan dengan entri lorebook prioritas rendah atau gaya meta

Ringkasan alur dibuat **dari memori adegan yang ada**, bukan langsung dari obrolan mentah.

Ini memberi Anda:

* pengurangan penggunaan token
* AI memiliki pemahaman yang lebih baik tentang aliran narasi

---

## 📝 Pembuatan Memori

### **Output Hanya JSON**

Semua prompt dan preset **harus** menginstruksikan AI untuk hanya mengembalikan JSON yang valid, contoh:

```json
{
  "title": "Judul adegan pendek",
  "content": "Ringkasan rinci adegan...",
  "keywords": ["katakunci1", "katakunci2"]
}

```

**Tidak ada teks lain yang diizinkan dalam respons.**

### **Preset Bawaan**

1. **Summary:** Ringkasan rinci beat-by-beat.
2. **Summarize:** Header markdown untuk timeline, beat, interaksi, hasil.
3. **Synopsis:** Markdown komprehensif dan terstruktur.
4. **Sum Up:** Ringkasan beat ringkas dengan timeline.
5. **Minimal:** Ringkasan 1-2 kalimat.

### **Prompt Kustom**

* Buat milik Anda sendiri, tetapi **harus** mengembalikan JSON yang valid seperti di atas.

---

## 📚 Integrasi Lorebook

* **Pembuatan Entri Otomatis:** Memori baru disimpan sebagai entri dengan semua metadata.
* **Deteksi Berbasis Penanda (Flag):** Hanya entri dengan flag `stmemorybooks` yang dikenali sebagai memori.
* **Penomoran Otomatis:** Penomoran berurutan, dengan padding nol dengan berbagai format yang didukung (`[000]`, `(000)`, `{000}`, `#000`).
* **Urutan Manual/Otomatis:** Pengaturan urutan penyisipan per profil.
* **Penyegaran Editor:** Secara opsional menyegarkan editor lorebook secara otomatis setelah menambahkan memori.

> **Memori yang sudah ada harus dikonversi!**
> Gunakan [Lorebook Converter](https://www.google.com/search?q=/resources/lorebookconverter.html) untuk menambahkan flag `stmemorybooks` dan bidang yang diperlukan.

---

### 🎡 Pelacak & Prompt Sampingan (Side Prompts)

Prompt Sampingan dapat digunakan seperti pelacak dan akan membuat entri di lorebook memori Anda. Prompt Sampingan memungkinkan Anda melacak **keadaan yang sedang berlangsung**, bukan hanya peristiwa masa lalu. Contohnya:

* 💰 Inventaris & Sumber Daya ("Barang apa yang dimiliki pengguna?")
* ❤️ Status Hubungan ("Bagaimana perasaan X tentang Y?")
* 📊 Statistik Karakter ("Kesehatan, keterampilan, reputasi saat ini")
* 🎯 Kemajuan Quest ("Tujuan apa yang aktif?")
* 🌍 Keadaan Dunia ("Apa yang berubah di latar tempat?")

#### **Akses:** Dari pengaturan Memory Books, klik “🎡 Side Prompt Manager”.

#### **Fitur:**

```
- Lihat semua prompt sampingan.
- Buat prompt baru atau duplikat untuk bereksperimen dengan gaya prompt yang berbeda.
- Edit atau hapus preset apa pun (termasuk bawaan).
- Ekspor dan impor preset sebagai file JSON untuk cadangan atau berbagi.
- Jalankan secara manual atau otomatis dengan pembuatan memori.

```

#### **Tips Penggunaan:**

```
- Saat membuat prompt baru, Anda dapat menyalin dari bawaan untuk kompatibilitas terbaik.
- Pustaka Templat Prompt Sampingan Tambahan [file JSON](resources/SidePromptTemplateLibrary.json) - cukup impor untuk digunakan.

```

---

### 🧠 Integrasi Regex untuk Kustomisasi Tingkat Lanjut

* **Kontrol Penuh Atas Pemrosesan Teks**: Memory Books sekarang terintegrasi dengan ekstensi **Regex** SillyTavern, memungkinkan Anda menerapkan transformasi teks yang kuat pada dua tahap utama:
1. **Pembuatan Prompt**: Secara otomatis memodifikasi prompt yang dikirim ke AI dengan membuat skrip regex yang menargetkan penempatan **User Input**.
2. **Parsing Respons**: Membersihkan, memformat ulang, atau menstandarkan respons mentah AI sebelum disimpan dengan menargetkan penempatan **AI Output**.


* **Dukungan Multi-Pilih**: Anda sekarang dapat memilih banyak skrip regex (multi-select). Semua skrip yang diaktifkan akan diterapkan secara berurutan pada setiap tahap (Pembuatan Prompt dan Parsing Respons), memungkinkan transformasi yang canggih dan fleksibel.
* **Cara Kerjanya**: Integrasinya mulus. Cukup buat dan aktifkan (multi-pilih) skrip yang Anda inginkan di ekstensi Regex, dan Memory Books akan menerapkannya secara otomatis selama pembuatan memori dan prompt sampingan.

---

## 👤 Manajemen Profil

* **Profil:** Setiap profil mencakup API, model, suhu (temperature), prompt/preset, format judul, dan pengaturan lorebook.
* **Impor/Ekspor:** Bagikan profil sebagai JSON.
* **Pembuatan Profil:** Gunakan popup opsi lanjutan untuk menyimpan profil baru.
* **Penimpaan Per-Profil:** Beralih API/model/suhu sementara untuk pembuatan memori, lalu pulihkan pengaturan asli Anda.

---

## ⚙️ Pengaturan & Konfigurasi

### **Pengaturan Global**

[Video singkat gambaran umum di Youtube](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode:** Aktifkan untuk memilih lorebook per obrolan.
* **Auto-create lorebook if none exists:** ⭐ *Baru di v4.2.0* - Secara otomatis membuat dan mengikat lorebook menggunakan templat penamaan Anda.
* **Lorebook Name Template:** ⭐ *Baru di v4.2.0* - Kustomisasi nama lorebook yang dibuat otomatis dengan placeholder {{char}}, {{user}}, {{chat}}.
* **Allow Scene Overlap:** Izinkan atau cegah rentang memori yang tumpang tindih.
* **Always Use Default Profile:** Lewati popup konfirmasi.
* **Show memory previews:** Aktifkan popup pratinjau untuk meninjau dan mengedit memori sebelum ditambahkan ke lorebook.
* **Show Notifications:** Beralih pesan toast (notifikasi).
* **Refresh Editor:** Segarkan editor lorebook secara otomatis setelah pembuatan memori.
* **Token Warning Threshold:** Tetapkan tingkat peringatan untuk adegan besar (default: 30.000).
* **Default Previous Memories:** Jumlah memori sebelumnya yang disertakan sebagai konteks (0-7).
* **Auto-create memory summaries:** Aktifkan pembuatan memori otomatis pada interval tertentu.
* **Auto-Summary Interval:** Jumlah pesan yang memicu pembuatan ringkasan memori secara otomatis (10-200, default: 100).
* **Memory Title Format:** Pilih atau kustomisasi (lihat di bawah).

### **Bidang Profil**

* **Name:** Nama tampilan.
* **API/Provider:** openai, claude, custom, dll.
* **Model:** Nama model (mis., gpt-4, claude-3-opus).
* **Temperature:** 0.0–2.0.
* **Prompt or Preset:** Kustom atau bawaan.
* **Title Format:** Templat per-profil.
* **Activation Mode:** Vectorized, Constant, Normal.
* **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (dan nama bidang).
* **Order Mode:** Auto/manual.
* **Recursion:** Mencegah/menunda rekursi.

---

## 🏷️ Pemformatan Judul

Kustomisasi judul entri lorebook Anda menggunakan sistem templat yang kuat.

* **Placeholder:**
* `{{title}}` - Judul yang dihasilkan oleh AI (mis., "Pertemuan yang Menentukan").
* `{{scene}}` - Rentang pesan (mis., "Scene 15-23").
* `{{char}}` - Nama karakter.
* `{{user}}` - Nama pengguna Anda.
* `{{messages}}` - Jumlah pesan dalam adegan.
* `{{profile}}` - Nama profil yang digunakan untuk pembuatan.
* Placeholder tanggal/waktu saat ini dalam berbagai format (mis., `August 13, 2025` untuk tanggal, `11:08 PM` untuk waktu).


* **Penomoran Otomatis:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan sekarang juga bentuk terbungkus seperti `#[000]`, `([000])`, `{[000]}` untuk penomoran berurutan dengan padding nol.
* **Format Kustom:** Anda dapat membuat format Anda sendiri. Mulai v4.5.1, semua karakter Unicode yang dapat dicetak (termasuk emoji, CJK, huruf beraksen, simbol, dll.) diizinkan dalam judul; hanya karakter kontrol Unicode yang diblokir.

---

## 🧵 Memori Konteks

* **Sertakan hingga 7 memori sebelumnya** sebagai konteks untuk kontinuitas yang lebih baik.
* **Estimasi token** mencakup memori konteks untuk akurasi.

---

## 🎨 Umpan Balik Visual & Aksesibilitas

* **Status Tombol:**
* Tidak aktif, aktif, pilihan valid, dalam adegan, memproses.


* **Aksesibilitas:**
* Navigasi keyboard, indikator fokus, atribut ARIA, pengurangan gerakan (reduced motion), ramah seluler.



---

# FAQ

### Saya tidak dapat menemukan Memory Books di menu Ekstensi!

Pengaturan terletak di menu Ekstensi (tongkat ajaib 🪄 di sebelah kiri kotak input Anda). Cari "Memory Books".

### Apakah saya perlu menjalankan vektor?

Entri 🔗 di world info diberi nama "vectorized" di UI ST. Inilah sebabnya saya menggunakan istilah dunia "vectorized". Jika Anda tidak menggunakan ekstensi vektor (saya tidak), ini bekerja melalui kata kunci (keywords). Ini semua otomatis sehingga Anda tidak perlu memikirkan kata kunci apa yang akan digunakan.

### Haruskah saya membuat lorebook terpisah untuk memori, atau bisakah saya menggunakan lorebook yang sama yang sudah saya gunakan untuk hal lain?

Saya menyarankan agar lorebook memori Anda menjadi buku terpisah. Ini memudahkan untuk mengatur memori (vs entri lain). Misalnya, menambahkannya ke obrolan grup, menggunakannya dalam obrolan lain, atau menetapkan anggaran lorebook individual (menggunakan STLO).

### Haruskah saya menggunakan 'Delay until recursion' jika Memory Books adalah satu-satunya lorebook?

Tidak. Jika tidak ada world info atau lorebook lain, memilih 'Delay until recursion' dapat mencegah loop pertama memicu, menyebabkan tidak ada yang aktif. Jika Memory Books adalah satu-satunya lorebook, nonaktifkan 'Delay until recursion' atau pastikan setidaknya satu world info/lorebook tambahan dikonfigurasi.

---

# Pemecahan Masalah (Troubleshooting)

* **Tidak ada lorebook yang tersedia atau dipilih:**
* Dalam Mode Manual, pilih lorebook saat diminta.
* Dalam Mode Otomatis, ikat lorebook ke obrolan Anda.
* Atau aktifkan "Auto-create lorebook if none exists" untuk pembuatan otomatis.


* **Tidak ada adegan yang dipilih:**
* Tandai kedua titik mulai (►) dan akhir (◄).


* **Adegan tumpang tindih dengan memori yang ada:**
* Pilih rentang yang berbeda, atau aktifkan "Allow scene overlap" di pengaturan.


* **AI gagal membuat memori yang valid:**
* Gunakan model yang mendukung output JSON.
* Periksa pengaturan prompt dan model Anda.


* **Batas peringatan token terlampaui:**
* Gunakan adegan yang lebih kecil, atau tingkatkan ambang batasnya.


* **Tombol chevron hilang:**
* Tunggu ekstensi dimuat, atau segarkan (refresh).


* **Data karakter tidak tersedia:**
* Tunggu obrolan/grup dimuat sepenuhnya.



---

## 📝 Kebijakan Karakter (v4.5.1+)

* **Diizinkan dalam judul:** Semua karakter Unicode yang dapat dicetak diizinkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
* **Diblokir:** Hanya karakter kontrol Unicode (U+0000–U+001F, U+007F–U+009F) yang diblokir; ini dihapus secara otomatis.

## Lihat [Detail Kebijakan Karakter](https://www.google.com/search?q=charset.md) untuk contoh dan catatan migrasi.

*Dikembangkan dengan penuh kasih sayang menggunakan VS Code/Cline, pengujian ekstensif, dan umpan balik komunitas.* 🤖💕
