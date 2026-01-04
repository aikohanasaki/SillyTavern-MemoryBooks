# 📕 Memory Books (Sambungan SillyTavern)

Sambungan SillyTavern generasi seterusnya untuk penciptaan memori yang automatik, berstruktur, dan boleh dipercayai. Tandakan babak dalam sembang, jana ringkasan berasaskan JSON dengan AI, dan simpannya sebagai entri "[bervektor](#vectorized)" (vectorized) di dalam lorebook anda. Menyokong sembang kumpulan, pengurusan profil lanjutan, dan pengendalian API/model yang kukuh.

### ❓ Kosa Kata
- Scene (Babak) → Memori
- Many Scenes (Banyak Babak) → Ringkasan Arka (Arc Summary)
- Always-On (Sentiasa Hidup) → Prom Sampingan / Penjejak (Side Prompt)

## ❗ Baca Saya Dahulu!

Mula di sini:
* ⚠️‼️ Sila baca [prasyarat](#-prerequisites) untuk nota pemasangan (terutamanya jika anda menggunakan API Pelengkap Teks)
* ❓ [Soalan Lazim (FAQ)](#FAQ)
* 🛠️ [Penyelesaian Masalah](#Troubleshooting)

Pautan lain:
* 📘 [Panduan Pengguna (EN)](USER_GUIDE.md)
* 📋 [Sejarah Versi & Log Perubahan](changelog.md)
* 💡 [Menggunakan 📕 Memory Books dengan 📚 Penyusunan Lorebook](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Tingkatkan Kuasa dengan Penyusunan Lorebook (STLO)

Untuk penyusunan memori lanjutan dan integrasi cerita yang lebih mendalam, kami sangat mengesyorkan penggunaan STMB bersama [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk amalan terbaik, arahan persediaan, dan tip!

> Nota: Menyokong pelbagai bahasa: lihat folder [`/locales`](locales) untuk senarai. Readme dan Panduan Pengguna Antarabangsa/tempatan boleh didapati di folder [`/userguides`](userguides).
> Penukar lorebook dan pustaka templat prom sampingan berada dalam folder [`/resources`](resources).

---

## 📋 Prasyarat

- **SillyTavern:** 1.14.0+ (terkini disyorkan)
- **Pemilihan Babak:** Penanda mula dan tamat (mula < tamat) mesti ditetapkan.
- **Sokongan Pelengkap Sembang (Chat Completion):** Sokongan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API pelengkap sembang lain.
- **Sokongan Pelengkap Teks (Text Completion):** API pelengkap teks (Kobold, TextGen, dll.) disokong apabila disambungkan melalui titik akhir (endpoint) API Pelengkap Sembang (serasi OpenAI). Saya syorkan menetapkan sambungan API Pelengkap Sembang mengikut tip KoboldCpp di bawah (ubah mengikut keperluan jika anda menggunakan Ollama atau perisian lain). Selepas itu, sediakan profil STMB dan gunakan konfigurasi Tersuai (disyorkan) atau manual penuh (hanya jika Tersuai gagal atau anda mempunyai lebih daripada satu sambungan tersuai).
**NOTA**: Sila ambil perhatian bahawa jika anda menggunakan Pelengkap Teks, anda mesti...

### Tip KoboldCpp untuk menggunakan 📕 ST Memory Books
Tetapkan ini dalam ST (anda boleh tukar kembali ke Pelengkap Teks SELEPAS anda berjaya mengaktifkan STMB)
- API Pelengkap Sembang (Chat Completion API)
- Sumber pelengkap sembang tersuai (Custom chat completion source)
- Titik akhir `http://localhost:5001/v1` (anda juga boleh guna `127.0.0.1:5000/v1`)
- Masukkan apa sahaja dalam "custom API key" (tidak penting, tetapi ST memerlukannya)
- ID Model mestilah `koboldcpp/namamodel` (jangan letak .gguf dalam nama model!)
- Muat turun pratetap (preset) pelengkap sembang dan import (mana-mana pun boleh) supaya anda MEMPUNYAI pratetap pelengkap sembang. Ini mengelakkan ralat "tidak disokong".
- Ubah panjang respons maksimum pada pratetap pelengkap sembang supaya sekurang-kurangnya 2048; 4096 disyorkan. (Lebih kecil bermakna anda berisiko terpotong.)

### Tip Llama.cpp untuk menggunakan 📕 ST Memory Books
Sama seperti Kobold, tetapkan berikut sebagai _Chat Completion API_ dalam ST (anda boleh tukar kembali ke Pelengkap Sembang selepas anda mengesahkan STMB berfungsi):
- Cipta profil sambungan baharu untuk API Pelengkap Sembang
- Sumber Pelengkap: `Custom (Open-AI Compatible)`
- URL Titik Akhir: `http://host.docker.internal:8080/v1` jika menjalankan ST dalam docker, jika tidak `http://localhost:8080/v1`
- Kunci API Tersuai: masukkan apa sahaja (ST memerlukannya)
- ID Model: `llama2-7b-chat.gguf` (atau model anda, tidak penting jika anda tidak menjalankan lebih daripada satu dalam llama.cpp)
- Pemprosesan pasca prom: tiada (none)

Untuk memulakan Llama.cpp, saya syorkan meletakkan sesuatu yang serupa dengan berikut dalam skrip shell atau fail bat, supaya permulaan lebih mudah:
```sh
llama-server -m <laluan-model> -c <saiz-konteks> --port 8080

```

## 💡 Tetapan Pengaktifan Info Dunia/Lorebook Global Disyorkan

* **Match Whole Words (Padankan Keseluruhan Perkataan):** biarkan tidak bertanda (false)
* **Scan Depth (Kedalaman Imbasan):** lebih tinggi lebih baik (saya tetapkan pada 8)
* **Max Recursion Steps (Langkah Rekursi Maks):** 2 (saranan umum, tidak wajib)
* **Context % (Peratusan Konteks):** 80% (berdasarkan tetingkap konteks 100,000 token) - dengan andaian anda tidak mempunyai sejarah sembang atau bot yang sangat berat.

---

## 🚀 Mula Pantas

### 1. **Pasang & Muat**

* Muat SillyTavern dan pilih watak atau sembang kumpulan.
* Tunggu butang chevron (► ◄) muncul pada mesej sembang (mungkin mengambil masa sehingga 10 saat).

### 2. **Tandakan Babak**

* Klik ► pada mesej pertama babak anda.
* Klik ◄ pada mesej terakhir.

### 3. **Cipta Memori**

* Buka menu Sambungan (tongkat sakti 🪄) dan klik "Memory Books", atau gunakan perintah slash `/creatememory`.
* Sahkan tetapan (profil, konteks, API/model) jika diminta.
* Tunggu penjanaan AI dan entri lorebook automatik.

---

## 🆕 Pintasan Perintah Slash

* `/creatememory` akan menggunakan penanda mula/tamat chevron sedia ada untuk mencipta memori.
* `/scenememory x-y` akan membuat memori bermula dengan mesej x dan berakhir dengan mesej y.
* `/nextmemory` akan membuat memori dengan semua mesej sejak memori terakhir.

## 👥 Sokongan Sembang Kumpulan

* Semua ciri berfungsi dengan sembang kumpulan.
* Penanda babak, penciptaan memori, dan integrasi lorebook disimpan dalam metadata kumpulan.
* Tiada persediaan khas diperlukan—pilih sahaja sembang kumpulan dan guna seperti biasa.

---

## 🧭 Mod Operasi

### **Mod Automatik (Lalai)**

* **Cara ia berfungsi:** Menggunakan lorebook secara automatik yang terikat pada sembang semasa anda.
* **Terbaik untuk:** Kesederhanaan dan kelajuan. Kebanyakan pengguna harus bermula di sini.
* **Cara guna:** Pastikan lorebook dipilih dalam menu lungsur "Chat Lorebooks" untuk watak atau sembang kumpulan anda.

### **Mod Cipta Lorebook Automatik** ⭐ *Baharu dalam v4.2.0*

* **Cara ia berfungsi:** Mencipta dan mengikat lorebook baharu secara automatik apabila tiada lorebook wujud, menggunakan templat penamaan tersuai anda.
* **Terbaik untuk:** Pengguna baharu dan persediaan pantas. Sempurna untuk penciptaan lorebook satu klik.
* **Cara guna:**
1. Dayakan "Auto-create lorebook if none exists" dalam tetapan sambungan.
2. Konfigurasikan templat penamaan anda (lalai: "LTM - {{char}} - {{chat}}").
3. Apabila anda mencipta memori tanpa lorebook yang terikat, satu akan dicipta dan diikat secara automatik.


* **Pemegang tempat templat:** {{char}} (nama watak), {{user}} (nama anda), {{chat}} (ID sembang)
* **Penomboran pintar:** Menambah nombor secara automatik (2, 3, 4...) jika nama pendua wujud.
* **Nota:** Tidak boleh digunakan serentak dengan Mod Lorebook Manual.

### **Mod Lorebook Manual**

* **Cara ia berfungsi:** Membenarkan anda memilih lorebook yang berbeza untuk memori berdasarkan setiap sembang, mengabaikan lorebook utama yang terikat pada sembang.
* **Terbaik untuk:** Pengguna lanjutan yang ingin mengarahkan memori ke lorebook tertentu yang berasingan.
* **Cara guna:**
1. Dayakan "Enable Manual Lorebook Mode" dalam tetapan sambungan.
2. Kali pertama anda mencipta memori dalam sembang, anda akan diminta untuk memilih lorebook.
3. Pilihan ini disimpan untuk sembang khusus tersebut sehingga anda mengosongkannya atau bertukar kembali ke Mod Automatik.


* **Nota:** Tidak boleh digunakan serentak dengan Mod Cipta Lorebook Automatik.

---

## 🧩 Jenis Memori: Babak vs Arka

📕 Memory Books menyokong **dua tahap memori naratif**, masing-masing direka untuk kesinambungan yang berbeza.

### 🎬 Memori Babak (Scene Memories - Lalai)

Memori babak menangkap **apa yang berlaku** dalam julat mesej tertentu.

* Berdasarkan pemilihan babak yang jelas (► ◄)
* Ideal untuk ingatan momen-ke-momen
* Memelihara dialog, tindakan, dan hasil serta-merta
* Paling baik digunakan dengan kerap

Ini adalah jenis memori standard dan paling biasa digunakan.

---

### 🧭 Ringkasan Arka (Arc Summaries) *(Beta)*

Ringkasan Arka menangkap **apa yang berubah dari masa ke masa** merentasi pelbagai babak.

Daripada meringkaskan peristiwa, ringkasan arka memfokuskan kepada:

* Pembangunan watak dan perubahan hubungan
* Matlamat jangka panjang, ketegangan, dan resolusi
* Trajektori emosi dan arah naratif
* Perubahan keadaan kekal yang harus kekal stabil

Ringkasan Arka adalah **memori peringkat lebih tinggi, berfrekuensi rendah** yang direka untuk mencegah watak daripada menyimpang dan kehilangan naratif dalam sembang jangka panjang.

> 💡 Fikirkan ringkasan arka sebagai *rekap musim*, bukan log babak.

#### Bila perlu guna Ringkasan Arka

* Selepas perubahan hubungan yang besar
* Di akhir bab atau arka cerita
* Apabila motivasi, kepercayaan, atau dinamik kuasa berubah
* Sebelum memulakan fasa baharu cerita

#### Nota Beta

* Ringkasan Arka sensitif terhadap prom dan sengaja bersifat konservatif
* Disyorkan untuk menyemak sebelum melakukan (commit) ke lorebook
* Paling baik dipadankan dengan entri lorebook berprioriti rendah atau gaya meta

Ringkasan Arka dijana **daripada memori babak sedia ada**, bukan terus daripada sembang mentah.

Ini memberikan anda:

* pengurangan penggunaan token
* AI mempunyai pemahaman yang lebih baik tentang aliran naratif

---

## 📝 Penjanaan Memori

### **Output JSON Sahaja**

Semua prom dan pratetap **mesti** mengarahkan AI untuk memulangkan hanya JSON yang sah, cth.:

```json
{
  "title": "Tajuk babak pendek",
  "content": "Ringkasan terperinci babak...",
  "keywords": ["kata kunci1", "kata kunci2"]
}

```

**Tiada teks lain dibenarkan dalam respons.**

### **Pratetap Terbina Dalam**

1. **Summary:** Ringkasan terperinci rentak-demi-rentak.
2. **Summarize:** Pengepala Markdown untuk garis masa, rentak, interaksi, hasil.
3. **Synopsis:** Markdown yang komprehensif dan berstruktur.
4. **Sum Up:** Ringkasan rentak ringkas dengan garis masa.
5. **Minimal:** Ringkasan 1-2 ayat.

### **Prom Tersuai**

* Cipta sendiri, tetapi **mesti** memulangkan JSON yang sah seperti di atas.

---

## 📚 Integrasi Lorebook

* **Penciptaan Entri Automatik:** Memori baharu disimpan sebagai entri dengan semua metadata.
* **Pengesanan Berasaskan Bendera:** Hanya entri dengan bendera `stmemorybooks` diiktiraf sebagai memori.
* **Penomboran Automatik:** Penomboran berurutan, berlapik sifar (zero-padded) dengan pelbagai format yang disokong (`[000]`, `(000)`, `{000}`, `#000`).
* **Susunan Manual/Automatik:** Tetapan susunan penyisipan per-profil.
* **Muat Semula Editor:** Opsyenal untuk memuat semula editor lorebook secara automatik selepas menambah memori.

> **Memori sedia ada mesti ditukar!**
> Gunakan [Penukar Lorebook](https://www.google.com/search?q=/resources/lorebookconverter.html) untuk menambah bendera `stmemorybooks` dan medan yang diperlukan.

---

### 🎡 Penjejak & Prom Sampingan

Prom Sampingan boleh digunakan seperti penjejak dan akan mencipta entri dalam lorebook memori anda. Prom Sampingan membolehkan anda menjejak **keadaan semasa**, bukan hanya peristiwa lalu. Contohnya:

* 💰 Inventori & Sumber ("Apa item yang pengguna miliki?")
* ❤️ Status Hubungan ("Apa perasaan X terhadap Y?")
* 📊 Statistik Watak ("Kesihatan semasa, kemahiran, reputasi")
* 🎯 Kemajuan Misi ("Apa matlamat yang aktif?")
* 🌍 Keadaan Dunia ("Apa yang berubah dalam latar tempat?")

#### **Akses:** Dari tetapan Memory Books, klik “🎡 Penjejak & Prom Sampingan”.

#### **Ciri-ciri:**

```
- Lihat semua prom sampingan.
- Cipta prom baharu atau pendua untuk bereksperimen dengan gaya prom berbeza.
- Edit atau padam mana-mana pratetap (termasuk terbina dalam).
- Eksport dan import pratetap sebagai fail JSON untuk sandaran atau perkongsian.
- Jalankan secara manual atau automatik dengan penciptaan memori.

```

#### **Tip Penggunaan:**

```
- Apabila mencipta prom baharu, anda boleh menyalin dari terbina dalam untuk keserasian terbaik.
- Pustaka Templat Prom Sampingan Tambahan [fail JSON](resources/SidePromptTemplateLibrary.json) - hanya import untuk guna

```

---

### 🧠 Integrasi Regex untuk Penyesuaian Lanjutan

* **Kawalan Penuh Terhadap Pemprosesan Teks**: Memory Books kini berintegrasi dengan sambungan **Regex** SillyTavern, membolehkan anda menggunakan transformasi teks yang berkuasa pada dua peringkat utama:
1. **Penjanaan Prom**: Ubah suai prom yang dihantar ke AI secara automatik dengan mencipta skrip regex yang menyasarkan penempatan **User Input**.
2. **Penghuraian Respons**: Bersihkan, format semula, atau piawaikan respons mentah AI sebelum ia disimpan dengan menyasarkan penempatan **AI Output**.


* **Sokongan Pelbagai Pilihan**: Anda kini boleh memilih pelbagai skrip regex (multi-select). Semua skrip yang diaktifkan akan digunakan secara berurutan pada setiap peringkat (Penjanaan Prom dan Penghuraian Respons), membolehkan transformasi yang maju dan fleksibel.
* **Cara Ia Berfungsi**: Integrasinya lancar. Hanya cipta dan aktifkan (pilih pelbagai) skrip yang anda inginkan dalam sambungan Regex, dan Memory Books akan menggunakannya secara automatik semasa penciptaan memori dan prom sampingan.

---

## 👤 Pengurusan Profil

* **Profil:** Setiap profil termasuk API, model, suhu, prom/pratetap, format tajuk, dan tetapan lorebook.
* **Import/Eksport:** Kongsi profil sebagai JSON.
* **Penciptaan Profil:** Gunakan pop timbul pilihan lanjutan untuk menyimpan profil baharu.
* **Penggantian Per-Profil:** Tukar sementara API/model/suhu untuk penciptaan memori, kemudian pulihkan tetapan asal anda.

---

## ⚙️ Tetapan & Konfigurasi

### **Tetapan Global**

[Gambaran keseluruhan video pendek di Youtube](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode:** Dayakan untuk memilih lorebook bagi setiap sembang.
* **Auto-create lorebook if none exists:** ⭐ *Baharu dalam v4.2.0* - Cipta dan ikat lorebook secara automatik menggunakan templat penamaan anda.
* **Lorebook Name Template:** ⭐ *Baharu dalam v4.2.0* - Sesuaikan nama lorebook ciptaan automatik dengan pemegang tempat {{char}}, {{user}}, {{chat}}.
* **Allow Scene Overlap:** Benarkan atau halang julat memori yang bertindih.
* **Always Use Default Profile:** Langkau pop timbul pengesahan.
* **Show memory previews:** Dayakan pop timbul pratonton untuk menyemak dan mengedit memori sebelum menambah ke lorebook.
* **Show Notifications:** Togol mesej pemberitahuan (toast).
* **Refresh Editor:** Muat semula editor lorebook secara automatik selepas penciptaan memori.
* **Token Warning Threshold:** Tetapkan tahap amaran untuk babak besar (lalai: 30,000).
* **Default Previous Memories:** Bilangan memori terdahulu untuk dimasukkan sebagai konteks (0-7).
* **Auto-create memory summaries:** Dayakan penciptaan memori automatik pada selang masa tertentu.
* **Auto-Summary Interval:** Bilangan mesej selepas mana ringkasan memori dicipta secara automatik (10-200, lalai: 100).
* **Memory Title Format:** Pilih atau sesuaikan (lihat di bawah).

### **Medan Profil**

* **Name:** Nama paparan.
* **API/Provider:** openai, claude, custom, dll.
* **Model:** Nama model (cth., gpt-4, claude-3-opus).
* **Temperature:** 0.0–2.0.
* **Prompt or Preset:** Tersuai atau terbina dalam.
* **Title Format:** Templat per-profil.
* **Activation Mode:** Vectorized, Constant, Normal.
* **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (dan nama medan).
* **Order Mode:** Auto/manual.
* **Recursion:** Halang/tangguhkan rekursi.

---

## 🏷️ Pemformatan Tajuk

Sesuaikan tajuk entri lorebook anda menggunakan sistem templat yang berkuasa.

* **Pemegang Tempat (Placeholders):**
* `{{title}}` - Tajuk yang dijana oleh AI (cth., "Pertemuan Takdir").
* `{{scene}}` - Julat mesej (cth., "Babak 15-23").
* `{{char}}` - Nama watak.
* `{{user}}` - Nama pengguna anda.
* `{{messages}}` - Bilangan mesej dalam babak.
* `{{profile}}` - Nama profil yang digunakan untuk penjanaan.
* Pemegang tempat tarikh/masa semasa dalam pelbagai format (cth., `August 13, 2025` untuk tarikh, `11:08 PM` untuk masa).


* **Penomboran automatik:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan kini juga bentuk berbalut seperti `#[000]`, `([000])`, `{[000]}` untuk penomboran berurutan, berlapik sifar.
* **Format Tersuai:** Anda boleh mencipta format anda sendiri. Sehingga v4.5.1, semua aksara Unicode yang boleh dicetak (termasuk emoji, CJK, beraksen, simbol, dll.) dibenarkan dalam tajuk; hanya aksara kawalan Unicode disekat.

---

## 🧵 Memori Konteks

* **Sertakan sehingga 7 memori terdahulu** sebagai konteks untuk kesinambungan yang lebih baik.
* **Anggaran token** termasuk memori konteks untuk ketepatan.

---

## 🎨 Maklum Balas Visual & Kebolehcapaian

* **Keadaan Butang:**
* Tidak aktif, aktif, pemilihan sah, dalam babak, memproses.


* **Kebolehcapaian:**
* Navigasi papan kekunci, penunjuk fokus, atribut ARIA, pergerakan dikurangkan, mesra mudah alih.



---

# Soalan Lazim (FAQ)

### Saya tidak dapat mencari Memory Books dalam menu Sambungan!

Tetapan terletak dalam menu Sambungan (tongkat sakti 🪄 di sebelah kiri kotak input anda). Cari "Memory Books".

### Adakah saya perlu menjalankan vektor?

Entri 🔗 dalam info dunia dinamakan "vectorized" dalam UI ST. Inilah sebabnya saya menggunakan perkataan vectorized. Jika anda tidak menggunakan sambungan vektor (saya tidak gunakannya), ia berfungsi melalui kata kunci. Ini semua diautomasikan supaya anda tidak perlu memikirkan kata kunci apa yang perlu digunakan.

### Patutkah saya membuat lorebook berasingan untuk memori, atau bolehkah saya menggunakan lorebook yang sama yang sudah saya gunakan untuk perkara lain?

Saya syorkan supaya lorebook memori anda menjadi buku yang berasingan. Ini memudahkan untuk menyusun memori (berbanding entri lain). Contohnya, menambahnya ke sembang kumpulan, menggunakannya dalam sembang lain, atau menetapkan bajet lorebook individu (menggunakan STLO).

### Patutkah saya menggunakan 'Delay until recursion' jika Memory Books adalah satu-satunya lorebook?

Tidak. Jika tiada info dunia atau lorebook lain, memilih 'Delay until recursion' mungkin menghalang gelung pertama daripada mencetus, menyebabkan tiada apa yang diaktifkan. Jika Memory Books adalah satu-satunya lorebook, sama ada lumpuhkan 'Delay until recursion' atau pastikan sekurang-kurangnya satu info dunia/lorebook tambahan dikonfigurasi.

---

# Penyelesaian Masalah

* **Tiada lorebook tersedia atau dipilih:**
* Dalam Mod Manual, pilih lorebook apabila diminta.
* Dalam Mod Automatik, ikat lorebook ke sembang anda.
* Atau dayakan "Auto-create lorebook if none exists" untuk penciptaan automatik.


* **Tiada babak dipilih:**
* Tandakan kedua-dua titik mula (►) dan tamat (◄).


* **Babak bertindih dengan memori sedia ada:**
* Pilih julat yang berbeza, atau dayakan "Allow scene overlap" dalam tetapan.


* **AI gagal menjana memori yang sah:**
* Gunakan model yang menyokong output JSON.
* Semak prom dan tetapan model anda.


* **Ambang amaran token dilebihi:**
* Gunakan babak yang lebih kecil, atau tingkatkan ambang.


* **Butang chevron hilang:**
* Tunggu sambungan dimuatkan, atau muat semula (refresh).


* **Data watak tidak tersedia:**
* Tunggu sembang/kumpulan dimuat sepenuhnya.



---

## 📝 Polisi Karakter (v4.5.1+)

* **Dibenarkan dalam tajuk:** Semua aksara Unicode yang boleh dicetak adalah dibenarkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
* **Disekat:** Hanya aksara kawalan Unicode (U+0000–U+001F, U+007F–U+009F) disekat; ini dibuang secara automatik.

## Lihat [Butiran Polisi Karakter](https://www.google.com/search?q=charset.md) untuk contoh dan nota migrasi.

*Dibangunkan dengan kasih sayang menggunakan VS Code/Cline, ujian menyeluruh, dan maklum balas komuniti.* 🤖💕
