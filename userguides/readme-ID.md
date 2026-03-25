# 📕 Memory Books (Ekstensi SillyTavern)

Ekstensi SillyTavern generasi baru untuk pembuatan memori otomatis, terstruktur, dan andal. Tandai adegan di chat, buat ringkasan berbasis JSON dengan AI, lalu simpan sebagai entri di lorebook Anda. Mendukung obrolan grup, manajemen profil tingkat lanjut, tracker/prompt sampingan, dan konsolidasi memori bertingkat.

### ❓ Kosakata
- Scene → Memori
- Many Memories → Ringkasan / Konsolidasi
- Always-On → Prompt Sampingan (Tracker)

## ❗ Baca Ini Dulu!

Mulai dari sini:
* ⚠️‼️ Harap baca [prasyarat](#-prasyarat) untuk catatan instalasi, terutama jika Anda memakai Text Completion API
* 📽️ [Video Quickstart](https://youtu.be/mG2eRH_EhHs) - hanya bahasa Inggris
* ❓ [Tanya Jawab (FAQ)](#faq)
* 🛠️ [Pemecahan Masalah](#pemecahan-masalah)

Tautan lain:
* 📘 [Panduan Pengguna (ID)](USER_GUIDE-ID.md)
* 🧠 [Cara Kerja STMB (ID)](howSTMBworks-id.md)
* 📋 [Riwayat Versi & Log Perubahan](../changelog.md)
* 💡 [Menggunakan 📕 Memory Books dengan 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Indonesian.md)

> Catatan: Mendukung berbagai bahasa. Lihat folder [`../locales`](../locales) untuk daftarnya. README dan Panduan Pengguna yang dilokalkan ada di folder `userguides`. Konverter lorebook dan pustaka template side prompt ada di folder [`../resources`](../resources).

## 📑 Daftar Isi

- [📋 Prasyarat](#-prasyarat)
  - [Tips KoboldCpp untuk menggunakan 📕 ST Memory Books](#tips-koboldcpp-untuk-menggunakan--st-memory-books)
  - [Tips Llama.cpp untuk menggunakan 📕 ST Memory Books](#tips-llamacpp-untuk-menggunakan--st-memory-books)
- [💡 Pengaturan Aktivasi World Info/Lorebook Global yang Disarankan](#-pengaturan-aktivasi-world-infolorebook-global-yang-disarankan)
- [🚀 Memulai](#-memulai)
  - [1. Instal & Muat](#1-instal--muat)
  - [2. Tandai Adegan](#2-tandai-adegan)
  - [3. Buat Memori](#3-buat-memori)
- [🧩 Jenis Memori: Adegan vs Ringkasan](#-jenis-memori-adegan-vs-ringkasan)
  - [🎬 Memori Adegan (Default)](#-memori-adegan-default)
  - [🌈 Konsolidasi Ringkasan](#-konsolidasi-ringkasan)
- [📝 Pembuatan Memori](#-pembuatan-memori)
  - [Output Hanya JSON](#output-hanya-json)
  - [Preset Bawaan](#preset-bawaan)
  - [Prompt Kustom](#prompt-kustom)
- [📚 Integrasi Lorebook](#-integrasi-lorebook)
- [🆕 Perintah Slash](#-perintah-slash)
- [👥 Dukungan Obrolan Grup](#-dukungan-obrolan-grup)
- [🧭 Mode Operasi](#-mode-operasi)
  - [Mode Otomatis (Default)](#mode-otomatis-default)
  - [Mode Buat Lorebook Otomatis](#mode-buat-lorebook-otomatis)
  - [Mode Lorebook Manual](#mode-lorebook-manual)
  - [🎡 Pelacak & Prompt Sampingan](#-pelacak--prompt-sampingan)
  - [🧠 Integrasi Regex untuk Kustomisasi Tingkat Lanjut](#-integrasi-regex-untuk-kustomisasi-tingkat-lanjut)
- [👤 Manajemen Profil](#-manajemen-profil)
- [⚙️ Pengaturan & Konfigurasi](#-pengaturan--konfigurasi)
  - [Pengaturan Global](#pengaturan-global)
  - [Bidang Profil](#bidang-profil)
- [🏷️ Pemformatan Judul](#-pemformatan-judul)
- [🧵 Memori Konteks](#-memori-konteks)
- [🎨 Umpan Balik Visual & Aksesibilitas](#-umpan-balik-visual--aksesibilitas)
  - [Haruskah saya membuat lorebook terpisah untuk memori, atau boleh memakai lorebook yang sama untuk hal lain?](#haruskah-saya-membuat-lorebook-terpisah-untuk-memori-atau-boleh-memakai-lorebook-yang-sama-untuk-hal-lain)
  - [Apakah saya perlu menjalankan vektor?](#apakah-saya-perlu-menjalankan-vektor)
  - [Haruskah saya memakai 'Tunda Hingga Rekursi' jika Memory Books satu-satunya lorebook?](#haruskah-saya-memakai-tunda-hingga-rekursi-jika-memory-books-satu-satunya-lorebook)
  - [Mengapa AI tidak melihat entri saya?](#mengapa-ai-tidak-melihat-entri-saya)
- [📚 Tingkatkan Kemampuan dengan Lorebook Ordering (STLO)](#-tingkatkan-kemampuan-dengan-lorebook-ordering-stlo)
- [📝 Kebijakan Karakter (v4.5.1+)](#-kebijakan-karakter-v451)
- [👨‍💻 Untuk Pengembang](#-untuk-pengembang)
  - [Membangun Ekstensi](#membangun-ekstensi)
  - [Git Hooks](#git-hooks)

## 📋 Prasyarat

- **SillyTavern:** 1.14.0+ (versi terbaru disarankan)
- **Pemilihan Adegan:** Penanda awal dan akhir (start < end) harus diatur.
- **Dukungan Chat Completion:** Dukungan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API chat completion lainnya.
- **Dukungan Text Completion:** API text completion (Kobold, TextGen, dll.) didukung jika dihubungkan melalui endpoint Chat Completion API yang kompatibel dengan OpenAI. Saya menyarankan menyiapkan koneksi Chat Completion API sesuai tips KoboldCpp di bawah ini (ubah sesuai kebutuhan jika Anda memakai Ollama atau perangkat lunak lain). Setelah itu, siapkan profil STMB dan gunakan konfigurasi Custom (disarankan) atau konfigurasi manual penuh jika Custom gagal atau Anda punya lebih dari satu koneksi kustom.
**CATATAN**: Jika Anda memakai Text Completion, Anda tetap harus memiliki preset chat completion!

### Tips KoboldCpp untuk menggunakan 📕 ST Memory Books
Atur ini di ST dulu (Anda bisa kembali ke Text Completion setelah STMB berjalan):
- Chat Completion API
- Sumber chat completion kustom
- Endpoint `http://localhost:5001/v1` (atau `127.0.0.1:5000/v1`)
- Masukkan apa saja pada "custom API key" (tetap diperlukan oleh ST)
- ID model harus `koboldcpp/modelname` (jangan masukkan `.gguf` di nama model)
- Unduh preset chat completion dan impor satu preset agar Anda punya preset chat completion. Ini mencegah error "not supported"
- Ubah max response length pada preset chat completion menjadi setidaknya 2048; 4096 disarankan. Nilai yang lebih kecil berisiko terpotong.

### Tips Llama.cpp untuk menggunakan 📕 ST Memory Books
Sama seperti Kobold, atur ini sebagai _Chat Completion API_ di ST (Anda bisa kembali ke Chat Completion setelah memverifikasi STMB berjalan):
- Buat profil koneksi baru untuk Chat Completion API
- Completion Source: `Custom (Open-AI Compatible)`
- Endpoint URL: `http://host.docker.internal:8080/v1` jika ST berjalan di Docker, kalau tidak gunakan `http://localhost:8080/v1`
- Custom API key: masukkan apa saja (ST memerlukannya)
- Model ID: `llama2-7b-chat.gguf` atau model Anda sendiri
- Prompt post-processing: none

Untuk memulai Llama.cpp, saya sarankan menaruh sesuatu seperti ini dalam skrip shell atau file bat agar startup lebih mudah:
```sh
llama-server -m <path-model> -c <context-size> --port 8080
```

## 💡 Pengaturan Aktivasi World Info/Lorebook Global yang Disarankan

- **Match Whole Words:** biarkan tidak dicentang (false)
- **Scan Depth:** semakin tinggi semakin baik (saya memakai 8)
- **Max Recursion Steps:** 2 (rekomendasi umum, bukan keharusan)
- **Context %:** 80% (berdasarkan jendela konteks 100.000 token) - dengan asumsi Anda tidak memiliki riwayat chat atau bot yang sangat berat.
- Jika lorebook memori adalah satu-satunya lorebook Anda, pastikan `Tunda Hingga Rekursi` dinonaktifkan di profil STMB, atau memori tidak akan terpanggil!

---

## 🚀 Memulai

### 1. **Instal & Muat**
- Muat SillyTavern dan pilih karakter atau obrolan grup.
- Tunggu tombol chevron (► ◄) muncul pada pesan chat (mungkin perlu sampai 10 detik).

![Tunggu tombol ini](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandai Adegan**
- Klik ► pada pesan pertama adegan Anda.
- Klik ◄ pada pesan terakhir.

Berikut contoh tampilan tombol chevron setelah diklik. Warna Anda bisa berbeda tergantung tema CSS!
![Umpan balik visual yang menunjukkan pemilihan adegan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Buat Memori**
- Buka menu Ekstensi (tongkat ajaib 🪄) lalu klik "Memory Books", atau gunakan perintah slash `/creatememory`.
- Konfirmasikan pengaturan (profil, konteks, API/model) jika diminta.
- Tunggu AI menghasilkan memori dan entri lorebook dibuat otomatis.

---

## 🧩 Jenis Memori: Adegan vs Ringkasan

📕 Memory Books mendukung **memori adegan** dan **konsolidasi ringkasan bertingkat**, masing-masing dirancang untuk kebutuhan kontinuitas yang berbeda.

### 🎬 Memori Adegan (Default)
Memori adegan menangkap **apa yang terjadi** dalam rentang pesan tertentu.

- Berdasarkan pemilihan adegan eksplisit (► ◄)
- Ideal untuk ingatan momen-ke-momen
- Mempertahankan dialog, tindakan, dan hasil langsung
- Paling baik dipakai secara sering

Ini adalah jenis memori standar dan yang paling umum digunakan.

---

### 🌈 Konsolidasi Ringkasan
Konsolidasi ringkasan menangkap **apa yang berubah seiring waktu** di beberapa memori atau ringkasan.

Daripada meringkas satu adegan, ringkasan konsolidasi berfokus pada:
- Perkembangan karakter dan perubahan hubungan
- Tujuan jangka panjang, ketegangan, dan resolusi
- Lintasan emosi dan arah naratif
- Perubahan keadaan persisten yang harus tetap stabil

Tier konsolidasi pertama adalah **Arc**, yang dibangun dari memori adegan. Tier yang lebih tinggi juga didukung untuk cerita yang lebih panjang:
- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 Anggap ini sebagai *rekap*, bukan log adegan.

#### Kapan memakai Ringkasan Konsolidasi
- Setelah perubahan hubungan besar
- Di akhir bab atau alur cerita
- Saat motivasi, kepercayaan, atau dinamika kekuasaan berubah
- Sebelum memulai fase baru cerita

#### Cara kerjanya
- Ringkasan konsolidasi dibuat dari **memori/ringkasan STMB yang sudah ada**, bukan langsung dari chat mentah
- Alat **Gabungkan Ingatan** memungkinkan Anda memilih tier tujuan dan memilih entri sumber
- STMB dapat memantau tier ringkasan tertentu dan menampilkan konfirmasi ya/lain waktu ketika tier itu sudah mencapai jumlah minimum entri yang memenuhi syarat
- STMB dapat menonaktifkan entri sumber setelah konsolidasi jika Anda ingin ringkasan tingkat lebih tinggi mengambil alih
- Respons ringkasan AI yang gagal dapat ditinjau dan diperbaiki dari UI sebelum mencoba simpan ulang

Ini memberi Anda:
- penggunaan token lebih rendah
- kontinuitas naratif yang lebih baik dalam chat panjang

---

## 📝 Pembuatan Memori

### **Output Hanya JSON**
Semua prompt dan preset **harus** menginstruksikan AI agar hanya mengembalikan JSON yang valid, misalnya:

```json
{
  "title": "Judul adegan singkat",
  "content": "Ringkasan rinci adegan...",
  "keywords": ["keyword1", "keyword2"]
}
```
**Tidak boleh ada teks lain dalam respons.**

### **Preset Bawaan**
1. **Summary:** Ringkasan rinci per beat.
2. **Summarize:** Header markdown untuk timeline, beat, interaksi, hasil.
3. **Synopsis:** Ringkasan markdown yang komprehensif dan terstruktur.
4. **Sum Up:** Ringkasan beat yang ringkas dengan timeline.
5. **Minimal:** Ringkasan 1-2 kalimat.
6. **Northgate:** Gaya ringkasan literer untuk penulisan kreatif.
7. **Aelemar:** Fokus pada poin plot dan ingatan karakter.
8. **Comprehensive:** Gaya synopsis dengan ekstraksi keyword yang lebih baik.

### **Prompt Kustom**
- Buat prompt Anda sendiri, tetapi **harus** tetap mengembalikan JSON yang valid seperti di atas.

---

## 📚 Integrasi Lorebook

- **Pembuatan Entri Otomatis:** Memori baru disimpan sebagai entri dengan semua metadata.
- **Deteksi Berbasis Flag:** Hanya entri dengan flag `stmemorybooks` yang dikenali sebagai memori.
- **Penomoran Otomatis:** Penomoran berurutan, nol-padded, dengan beberapa format yang didukung (`[000]`, `(000)`, `{000}`, `#000`).
- **Urutan Manual/Otomatis:** Pengaturan urutan penyisipan per profil.
- **Penyegaran Editor:** Opsional menyegarkan editor lorebook secara otomatis setelah menambahkan memori.

> **Memori yang sudah ada harus dikonversi!**
> Gunakan [Lorebook Converter](../resources/lorebookconverter.html) untuk menambahkan flag `stmemorybooks` dan field yang diperlukan.

---

## 🆕 Perintah Slash

- `/creatememory` - Membuat memori dari adegan yang ditandai.
- `/scenememory X-Y` - Mengatur rentang adegan lalu membuat memori (misalnya `/scenememory 10-15`).
- `/nextmemory` - Membuat memori dari akhir memori terakhir sampai pesan saat ini.
- `/sideprompt "Nama" {{macro}}="value" [X-Y]` - Menjalankan side prompt (macro `{{...}}` opsional).
- `/sideprompt-on "Nama" | all` - Mengaktifkan side prompt berdasarkan nama atau semuanya.
- `/sideprompt-off "Nama" | all` - Menonaktifkan side prompt berdasarkan nama atau semuanya.
- `/stmb-highest` - Mengembalikan message id tertinggi untuk memori yang sudah diproses di chat ini.
- `/stmb-set-highest <N|none>` - Mengatur manual message id tertinggi yang sudah diproses untuk chat ini.
- `/stmb-stop` - Menghentikan semua proses STMB yang sedang berjalan di mana pun (emergency halt).

## 👥 Dukungan Obrolan Grup

- Semua fitur bekerja dengan obrolan grup.
- Penanda adegan, pembuatan memori, dan integrasi lorebook disimpan di metadata grup.
- Tidak perlu pengaturan khusus - cukup pilih obrolan grup dan gunakan seperti biasa.

---

## 🧭 Mode Operasi

### **Mode Otomatis (Default)**
- **Cara kerjanya:** Secara otomatis memakai lorebook yang terikat pada chat Anda saat ini.
- **Cocok untuk:** Kesederhanaan dan kecepatan. Sebagian besar pengguna sebaiknya mulai di sini.
- **Cara memakai:** Pastikan lorebook dipilih di dropdown "Chat Lorebooks" untuk karakter atau obrolan grup Anda.

![Contoh binding lorebook chat](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mode Buat Lorebook Otomatis**
- **Cara kerjanya:** Secara otomatis membuat dan mengikat lorebook baru saat belum ada, memakai template penamaan kustom Anda.
- **Cocok untuk:** Pengguna baru dan penyiapan cepat. Sempurna untuk pembuatan lorebook sekali klik.
- **Cara memakai:**
  1. Aktifkan "Buat lorebook secara otomatis jika belum ada" di pengaturan ekstensi.
  2. Atur template penamaan Anda (default: "LTM - {{char}} - {{chat}}").
  3. Saat Anda membuat memori tanpa lorebook terikat, lorebook akan dibuat dan diikat otomatis.
- **Placeholder template:** `{{char}}` (nama karakter), `{{user}}` (nama Anda), `{{chat}}` (ID chat)
- **Penomoran cerdas:** Otomatis menambahkan angka (2, 3, 4...) jika ada nama duplikat.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Lorebook Manual.

### **Mode Lorebook Manual**
- **Cara kerjanya:** Memungkinkan Anda memilih lorebook berbeda untuk memori per chat, mengabaikan lorebook utama yang terikat pada chat.
- **Cocok untuk:** Pengguna tingkat lanjut yang ingin mengarahkan memori ke lorebook terpisah yang spesifik.
- **Cara memakai:**
  1. Aktifkan "Aktifkan Mode Lorebook Manual" di pengaturan ekstensi.
  2. Saat pertama kali Anda membuat memori di chat, Anda akan diminta memilih lorebook.
  3. Pilihan ini disimpan untuk chat tersebut sampai Anda menghapusnya atau kembali ke Mode Otomatis.
- **Catatan:** Tidak dapat digunakan bersamaan dengan Mode Buat Lorebook Otomatis.

---

### 🎡 Pelacak & Prompt Sampingan

Side Prompt dapat dipakai seperti tracker dan membuat entri side prompt terpisah di lorebook memori Anda. Side Prompt memungkinkan Anda melacak **keadaan yang sedang berlangsung**, bukan hanya kejadian masa lalu. Contohnya:
- 💰 Inventaris & Sumber Daya ("Item apa yang dimiliki pengguna?")
- ❤️ Status Hubungan ("Bagaimana perasaan X terhadap Y?")
- 📊 Statistik Karakter ("Kesehatan, keterampilan, reputasi saat ini")
- 🎯 Kemajuan Quest ("Tujuan apa yang aktif?")
- 🌍 Keadaan Dunia ("Apa yang berubah di latar?")

#### **Akses:** Dari pengaturan Memory Books, klik “🎡 Pelacak & Prompt Sampingan”.
#### **Fitur:**
- Melihat semua side prompt.
- Membuat prompt baru atau menduplikasi prompt untuk bereksperimen dengan gaya prompt yang berbeda.
- Mengedit atau menghapus preset apa pun, termasuk bawaan.
- Mengekspor dan mengimpor preset sebagai file JSON untuk cadangan atau berbagi.
- Menjalankan secara manual atau otomatis, tergantung templatenya.
- Menggunakan macro/placeholder standar SillyTavern seperti `{{user}}` dan `{{char}}` di field side prompt `Prompt`, `Response Format`, `Title`, dan `{{keyword}}`.
- Menggunakan macro/placeholder kustom seperti `{{npc name}}` (Anda harus memberikannya saat menjalankan `/sideprompt`).
#### **Tips Penggunaan:**
- Saat membuat prompt baru, Anda dapat menyalin dari bawaan untuk kompatibilitas terbaik.
- Side prompt tidak harus mengembalikan JSON. Mereka bisa mengembalikan teks biasa.
- Side prompt diperbarui/ditimpa. Ini membedakannya dari memori, yang disimpan berurutan.
- Sintaks manual: `/sideprompt "Nama" {{macro}}="value" [X-Y]`.
- Setelah Anda memilih side prompt di autocomplete perintah slash, STMB akan menyarankan macro runtime yang diperlukan untuk template itu.
- Side prompt dengan macro runtime kustom (bukan default ST) hanya bisa dipakai manual. STMB menonaktifkan `On Interval` dan `On After Memory` dari template tersebut saat simpan/impor dan akan memberi peringatan.
- Pustaka Template Side Prompt Tambahan ada di [file JSON](../resources/SidePromptTemplateLibrary.json) - cukup impor untuk digunakan.

---

### 🧠 Integrasi Regex untuk Kustomisasi Tingkat Lanjut
- **Kontrol Penuh atas Pemrosesan Teks:** Memory Books kini terintegrasi dengan ekstensi **Regex** SillyTavern, memungkinkan Anda menerapkan transformasi teks yang kuat pada dua tahap utama:
  1. **Pembuatan Prompt:** Secara otomatis memodifikasi prompt yang dikirim ke AI dengan membuat skrip regex yang menargetkan penempatan **User Input**.
  2. **Parsing Respons:** Membersihkan, memformat ulang, atau menstandarkan respons mentah AI sebelum disimpan dengan menargetkan penempatan **AI Output**.
- **Dukungan Multi-Pilih:** Anda dapat memilih beberapa skrip untuk pemrosesan keluar dan masuk.
- **Cara Kerjanya:** Aktifkan `Gunakan regex (lanjutan)` di STMB, klik `📐 Konfigurasi regex…`, lalu pilih skrip mana yang harus dijalankan STMB sebelum mengirim ke AI dan sebelum mem-parsing/menyimpan respons.
- **Penting:** Pemilihan regex dikendalikan oleh STMB. Skrip yang dipilih di sana akan dijalankan **meskipun saat ini dinonaktifkan di ekstensi Regex itu sendiri**.

---

## 👤 Manajemen Profil

- **Profil:** Setiap profil mencakup API, model, temperatur, prompt/preset, format judul, dan pengaturan lorebook.
- **Impor/Ekspor:** Bagikan profil sebagai JSON.
- **Pembuatan Profil:** Gunakan popup opsi lanjutan untuk menyimpan profil baru.
- **Override Per Profil:** Sementara ganti API/model/temp untuk pembuatan memori, lalu kembalikan pengaturan asli Anda.
- **Provider/Profil Bawaan:** STMB menyertakan opsi wajib `Pengaturan SillyTavern Saat Ini` yang memakai koneksi/pengaturan SillyTavern aktif Anda langsung.

---

## ⚙️ Pengaturan & Konfigurasi

![Panel pengaturan utama](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Pengaturan Global**
[Video singkat di YouTube](https://youtu.be/mG2eRH_EhHs)

- **Mode Lorebook Manual:** Aktifkan untuk memilih lorebook per chat.
- **Buat lorebook secara otomatis jika belum ada:** ⭐ *Baru di v4.2.0* - Secara otomatis membuat dan mengikat lorebook memakai template penamaan Anda.
- **Lorebook Name Template:** ⭐ *Baru di v4.2.0* - Kustomisasi nama lorebook yang dibuat otomatis dengan placeholder `{{char}}`, `{{user}}`, `{{chat}}`.
- **Allow Scene Overlap:** Izinkan atau cegah rentang memori yang saling tumpang tindih.
- **Lewati popup konfirmasi:** Lewati popup konfirmasi.
- **Tampilkan pratinjau memori:** Aktifkan popup pratinjau untuk meninjau dan mengedit memori sebelum ditambahkan ke lorebook.
- **Aktifkan/nonaktifkan pesan toast:** Aktifkan/nonaktifkan pesan toast.
- **Segarkan editor lorebook secara otomatis setelah pembuatan memori:** Segarkan editor lorebook secara otomatis setelah pembuatan memori.
- **Max Response Tokens:** Atur panjang generasi maksimum untuk ringkasan memori.
- **Token Warning Threshold:** Atur level peringatan untuk adegan besar.
- **Default Previous Memories:** Jumlah memori sebelumnya yang disertakan sebagai konteks (0-7).
- **Buat ringkasan memori secara otomatis:** Aktifkan pembuatan memori otomatis pada interval tertentu.
- **Interval Ringkasan Otomatis:** Jumlah pesan setelah mana ringkasan memori dibuat otomatis.
- **Penyangga Ringkasan Otomatis:** Menunda auto-summary dengan jumlah pesan yang dapat dikonfigurasi.
- **Tampilkan prompt konsolidasi saat tier siap:** Menampilkan prompt ya/tidak saat tier ringkasan yang dipilih punya cukup entri sumber yang memenuhi syarat untuk dikonsolidasi.
- **Tier Konsolidasi Otomatis:** Pilih satu atau beberapa tier ringkasan yang harus memicu prompt saat siap. Saat ini mendukung Arc sampai Series.
- **Unhide hidden messages before memory generation:** Dapat menjalankan `/unhide X-Y` sebelum membuat memori.
- **Sembunyikan pesan secara otomatis setelah menambahkan memori:** Opsional menyembunyikan semua pesan yang diproses atau hanya rentang memori terbaru.
- **Gunakan ekspresi reguler (lanjutan):** Mengaktifkan popup pemilihan regex STMB untuk pemrosesan keluar/masuk.
- **Format Judul Memori:** Pilih atau kustomisasi (lihat di bawah).

![Konfigurasi profil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Bidang Profil**
- **Name:** Nama tampilan.
- **API/Provider:** `Pengaturan SillyTavern Saat Ini`, openai, claude, custom, full manual, dan provider lain yang didukung.
- **Model:** Nama model (misalnya, gpt-4, claude-3-opus).
- **Temperature:** 0.0-2.0.
- **Prompt or Preset:** Kustom atau bawaan.
- **Title Format:** Template per profil.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, Outlet (dan nama field).
- **Order Mode:** Auto/manual.
- **Recursion:** Cegah/tunda sampai recursion.

---

## 🏷️ Pemformatan Judul

Kustomisasi judul entri lorebook Anda dengan sistem template yang kuat.

- **Placeholder:**
  - `{{title}}` - Judul yang dihasilkan AI (misalnya, "Pertemuan yang Takdir").
  - `{{scene}}` - Rentang pesan (misalnya, "Scene 15-23").
  - `{{char}}` - Nama karakter.
  - `{{user}}` - Nama pengguna Anda.
  - `{{messages}}` - Jumlah pesan dalam adegan.
  - `{{profile}}` - Nama profil yang dipakai untuk generasi.
  - Placeholder tanggal/waktu saat ini dalam berbagai format (misalnya, `August 13, 2025` untuk tanggal, `11:08 PM` untuk waktu).
- **Penomoran Otomatis:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan sekarang juga bentuk terbungkus seperti `#[000]`, `([000])`, `{[000]}` untuk penomoran berurutan dengan nol-padded.
- **Format Kustom:** Anda bisa membuat format sendiri. Sejak v4.5.1, semua karakter Unicode yang dapat dicetak (termasuk emoji, CJK, huruf beraksen, simbol, dll.) diizinkan dalam judul; hanya karakter kontrol Unicode yang diblokir.

---

## 🧵 Memori Konteks

- **Sertakan sampai 7 memori sebelumnya** sebagai konteks untuk kontinuitas yang lebih baik.
- **Estimasi token** mencakup memori konteks agar lebih akurat.
- **Opsi lanjutan** memungkinkan Anda menimpa perilaku prompt/profil sementara untuk satu kali pemakaian memori.

![Pembuatan memori dengan konteks](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Umpan Balik Visual & Aksesibilitas

- **Status Tombol:**
  - Tidak aktif, aktif, seleksi valid, di dalam adegan, memproses.

![Pemilihan adegan lengkap yang menunjukkan semua status visual](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Aksesibilitas:**
  - Navigasi keyboard, indikator fokus, atribut ARIA, reduced motion, ramah seluler.

---

# FAQ

### Haruskah saya membuat lorebook terpisah untuk memori, atau boleh memakai lorebook yang sama untuk hal lain?

Saya menyarankan lorebook memori Anda menjadi buku terpisah. Ini memudahkan pengaturan memori dibanding entri lain. Misalnya, saat menambahkannya ke obrolan grup, memakainya di chat lain, atau menetapkan anggaran lorebook individual dengan STLO.

### Apakah saya perlu menjalankan vektor?

Anda bisa, tetapi itu tidak wajib. Jika Anda tidak memakai ekstensi vektor (saya juga tidak), STMB bekerja lewat keyword. Semuanya otomatis, jadi Anda tidak perlu memikirkan keyword apa yang harus dipakai.

### Haruskah saya memakai 'Tunda Hingga Rekursi' jika Memory Books satu-satunya lorebook?

Tidak. Jika tidak ada world info atau lorebook lain, memilih 'Tunda Hingga Rekursi' bisa mencegah loop pertama terpanggil, sehingga tidak ada yang aktif. Jika Memory Books adalah satu-satunya lorebook, nonaktifkan 'Tunda Hingga Rekursi' atau pastikan setidaknya satu world info/lorebook tambahan dikonfigurasi.

### Mengapa AI tidak melihat entri saya?

Pertama-tama, pastikan entri memang terkirim. Saya suka memakai [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) untuk itu.

Jika entri sudah terpicu dan memang dikirim ke AI, mungkin Anda perlu menegur AI secara OOC. Sesuatu seperti: `[OOC: KENAPA kamu tidak memakai informasi yang sudah diberikan? Khususnya: (apa pun itu)]` 😁

---

# Pemecahan Masalah

- **Saya tidak bisa menemukan Memory Books di menu Ekstensi!**
  Pengaturan ada di menu Ekstensi (tongkat ajaib 🪄 di sebelah kiri kotak input Anda). Cari "Memory Books".
  ![Lokasi pengaturan STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **Tidak ada lorebook yang tersedia atau dipilih:**
  - Dalam Mode Manual, pilih lorebook saat diminta.
  - Dalam Mode Otomatis, ikat lorebook ke chat Anda.
  - Atau aktifkan "Buat lorebook secara otomatis jika belum ada" untuk pembuatan otomatis.

- **Kesalahan Validasi Lorebook:**
  - Mungkin Anda menghapus lorebook yang sebelumnya terikat. Cukup ikat lorebook baru (boleh kosong).

- **Tidak ada adegan yang dipilih:**
  - Tandai titik mulai (►) dan akhir (◄).

- **Adegan tumpang tindih dengan memori yang sudah ada:**
  - Pilih rentang berbeda, atau aktifkan "Allow scene overlap" di pengaturan.

  ![Peringatan tumpang tindih adegan](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI gagal membuat memori valid:**
  - Gunakan model yang mendukung output JSON.
  - Periksa prompt dan pengaturan model Anda.

- **Ambang peringatan token terlampaui:**
  - Gunakan adegan yang lebih kecil, atau naikkan ambang batas.

- **Tombol chevron hilang:**
  - Tunggu ekstensi selesai dimuat, atau refresh.

- **Data karakter tidak tersedia:**
  - Tunggu chat/grup selesai dimuat.

---

## 📚 Tingkatkan Kemampuan dengan Lorebook Ordering (STLO)

Untuk organisasi memori tingkat lanjut dan integrasi cerita yang lebih dalam, gunakan STMB bersama [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Indonesian.md). Lihat panduan untuk praktik terbaik, instruksi penyiapan, dan tips!

---

## 📝 Kebijakan Karakter (v4.5.1+)

- **Diizinkan dalam judul:** Semua karakter Unicode yang dapat dicetak diizinkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
- **Diblokir:** Hanya karakter kontrol Unicode (U+0000–U+001F, U+007F–U+009F) yang diblokir; karakter ini dihapus otomatis.

Lihat [Detail Kebijakan Karakter](../charset.md) untuk contoh dan catatan migrasi.

---

## 👨‍💻 Untuk Pengembang

### Membangun Ekstensi

Ekstensi ini memakai Bun untuk build. Proses build akan melakukan minify dan bundle pada file sumber.

```sh
# Build ekstensi
bun run build
```

### Git Hooks

Proyek ini menyertakan pre-commit hook yang otomatis membangun ekstensi dan memasukkan artefak build ke commit Anda. Ini memastikan file build selalu sinkron dengan kode sumber.

**Untuk memasang git hook:**

```sh
bun run install-hooks
```

Hook akan:
- Menjalankan `bun run build` sebelum setiap commit
- Menambahkan artefak build ke commit
- Membatalkan commit jika build gagal

---

*Dikembangkan dengan penuh perhatian menggunakan VS Code/Cline, pengujian ekstensif, dan masukan komunitas.* 🤖💕
