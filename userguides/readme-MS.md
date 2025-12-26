# 📕 Buku Memori (Sebuah Ekstensi SillyTavern)

Ekstensi SillyTavern generasi seterusnya untuk penciptaan memori automatik, berstruktur, dan boleh dipercayai. Tandakan babak dalam sembang, jana ringkasan berasaskan JSON dengan AI, dan simpannya sebagai entri "[vectorized](#vectorized)" (bervektor) dalam lorebook anda. Menyokong sembang kumpulan, pengurusan profil lanjutan, dan pengendalian API/model yang kukuh.

Mula di sini:

- ⚠️‼️Sila baca [prasyarat](#-prerequisites) untuk nota pemasangan (terutamanya jika anda menjalankan API Text Completion)
- ❓ [Soalan Lazim (FAQ)](#FAQ)
- 🛠️ [Penyelesaian Masalah](#Troubleshooting)

Pautan lain:

- 📘 [Panduan Pengguna (EN)](USER_GUIDE.md)
- 📋 [Sejarah Versi & Log Perubahan](changelog.md)
- 💡 [Menggunakan 📕 Buku Memori dengan 📚 Penyusunan Lorebook](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 Tingkatkan Kuasa dengan Penyusunan Lorebook (STLO)

Untuk organisasi memori lanjutan dan integrasi cerita yang lebih mendalam, kami sangat mengesyorkan penggunaan STMB bersama-sama dengan [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk amalan terbaik, arahan persediaan, dan petua!

> Nota: Menyokong pelbagai bahasa: lihat folder [`/locales`](locales) untuk senarai. Readme dan Panduan Pengguna Antarabangsa/tempatan boleh didapati dalam folder [`/userguides`](userguides).
> Penukar lorebook dan pustaka templat prom sampingan terdapat dalam folder [`/resources`](resources).

---

## 📋 Prasyarat

- **SillyTavern:** 1.13.5+ (terkini disyorkan)
- ⚠️‼️**PASANG UNTUK SEMUA PENGGUNA:**‼️⚠️ Oleh kerana STMB menggunakan semula banyak fungsi daripada kod asas ST, sila pastikan ekstensi dipasang untuk semua pengguna supaya lokasinya adalah `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`. Jika tidak, import fungsi akan gagal.
- **Pemilihan Babak:** Penanda mula dan tamat (mula < tamat) mesti ditetapkan.
- **Sokongan Chat Completion:** Sokongan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API chat completion lain.
- **Sokongan Text Completion:** API text completion (Kobold, TextGen, dll.) disokong apabila disambungkan melalui titik akhir API Chat Completion (serasi OpenAI). Saya syorkan menetapkan sambungan API Chat Completion mengikut petua KoboldCpp di bawah (ubah mengikut keperluan jika anda menggunakan Ollama atau perisian lain). Selepas itu, sediakan profil STMB dan gunakan konfigurasi Tersuai (disyorkan) atau manual penuh (hanya jika Tersuai gagal atau anda mempunyai lebih daripada satu sambungan tersuai).

### Petua KoboldCpp untuk menggunakan 📕 ST Memory Books

Sediakan ini dalam ST (anda boleh tukar kembali ke Text Completion SELEPAS anda berjaya menggunakan STMB)

- API Chat Completion
- Sumber chat completion tersuai
- Titik akhir `http://localhost:5001/v1` (anda juga boleh guna `127.0.0.1:5000/v1`)
- Masukkan apa sahaja dalam "kunci API tersuai" (tidak penting, tetapi ST memerlukannya)
- ID model mesti `koboldcpp/modelname` (jangan letak .gguf dalam nama model!)
- Muat turun pratetap chat completion dan import (mana-mana pun boleh) semata-mata supaya anda MEMPUNYAI pratetap chat completion. Ini mengelakkan ralat "tidak disokong".

## 💡 Tetapan Pengaktifan Maklumat Dunia/Lorebook Global yang Disyorkan

- **Match Whole Words (Padankan Keseluruhan Perkataan):** biarkan tidak bertanda (false)
- **Scan Depth (Kedalaman Imbasan):** lebih tinggi lebih baik (saya tetapkan pada 8)
- **Max Recursion Steps (Langkah Rekursi Maks):** 2 (cadangan umum, tidak wajib)
- **Context % (Peratus Konteks):** 80% (berdasarkan tetingkap konteks 100,000 token) - dengan andaian anda tidak mempunyai sejarah sembang atau bot yang sangat berat.

---

## 🚀 Bermula

### 1. **Pasang & Muat**

- Muat SillyTavern dan pilih watak atau sembang kumpulan.
- Tunggu butang chevron (► ◄) muncul pada mesej sembang (mungkin mengambil masa sehingga 10 saat).

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandakan Babak**

- Klik ► pada mesej pertama babak anda.
- Klik ◄ pada mesej terakhir.

![Visual feedback showing scene selection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Cipta Memori**

- Buka menu Ekstensi (tongkat sakti 🪄) dan klik "Memory Books", atau gunakan perintah slash `/creatememory`.
- Sahkan tetapan (profil, konteks, API/model) jika diminta.
- Tunggu penjanaan AI dan entri lorebook automatik.

---

## 🆕 Pintasan Perintah Slash

- `/creatememory` akan menggunakan penanda mula/tamat chevron sedia ada untuk mencipta memori.
- `/scenememory x-y` akan membuat memori bermula dengan mesej x dan berakhir dengan mesej y.
- `/nextmemory` akan membuat memori dengan semua mesej sejak memori terakhir.

## 👥 Sokongan Sembang Kumpulan

- Semua ciri berfungsi dengan sembang kumpulan.
- Penanda babak, penciptaan memori, dan integrasi lorebook disimpan dalam metadata kumpulan.
- Tiada persediaan khas diperlukan—hanya pilih sembang kumpulan dan gunakan seperti biasa.

---

## 🧭 Mod Operasi

### **Mod Automatik (Lalai)**

- **Cara ia berfungsi:** Secara automatik menggunakan lorebook yang terikat dengan sembang semasa anda.
- **Terbaik untuk:** Kesederhanaan dan kepantasan. Kebanyakan pengguna harus bermula di sini.
- **Untuk menggunakan:** Pastikan lorebook dipilih dalam menu lungsur "Chat Lorebooks" untuk watak atau sembang kumpulan anda.

![Chat lorebook binding example](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mod Cipta Lorebook Automatik** ⭐ _Baharu dalam v4.2.0_

- **Cara ia berfungsi:** Secara automatik mencipta dan mengikat lorebook baharu apabila tiada yang wujud, menggunakan templat penamaan tersuai anda.
- **Terbaik untuk:** Pengguna baharu dan persediaan pantas. Sempurna untuk penciptaan lorebook satu klik.
- **Untuk menggunakan:**
  1. Dayakan "Auto-create lorebook if none exists" dalam tetapan ekstensi.
  2. Konfigurasikan templat penamaan anda (lalai: "LTM - {{char}} - {{chat}}").
  3. Apabila anda mencipta memori tanpa lorebook terikat, satu akan dicipta dan diikat secara automatik.
- **Pemegang tempat templat:** {{char}} (nama watak), {{user}} (nama anda), {{chat}} (ID sembang)
- **Penomboran pintar:** Menambah nombor secara automatik (2, 3, 4...) jika nama pendua wujud.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Lorebook Manual.

### **Mod Lorebook Manual**

- **Cara ia berfungsi:** Membolehkan anda memilih lorebook yang berbeza untuk memori berdasarkan setiap sembang, mengabaikan lorebook utama yang terikat dengan sembang.
- **Terbaik untuk:** Pengguna lanjutan yang ingin mengarahkan memori ke lorebook tertentu yang berasingan.
- **Untuk menggunakan:**
  1. Dayakan "Enable Manual Lorebook Mode" dalam tetapan ekstensi.
  2. Kali pertama anda mencipta memori dalam sembang, anda akan diminta untuk memilih lorebook.
  3. Pilihan ini disimpan untuk sembang khusus tersebut sehingga anda mengosongkannya atau beralih kembali ke Mod Automatik.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Cipta Lorebook Automatik.

---

## 📝 Penjanaan Memori

### **Output JSON Sahaja**

Semua prom dan pratetap **mesti** mengarahkan AI untuk memulangkan hanya JSON yang sah, cth:

```json
{
  "title": "Tajuk babak pendek",
  "content": "Ringkasan terperinci babak...",
  "keywords": ["kata kunci1", "kata kunci2"]
}
```

**Tiada teks lain dibenarkan dalam respons.**

### **Pratetap Terbina Dalam**

1. **Summary:** Ringkasan terperinci babak demi babak.
2. **Summarize:** Pengepala Markdown untuk garis masa, rentak, interaksi, hasil.
3. **Synopsis:** Markdown berstruktur yang komprehensif.
4. **Sum Up:** Ringkasan rentak ringkas dengan garis masa.
5. **Minimal:** Ringkasan 1-2 ayat.

### **Prom Tersuai**

- Cipta sendiri, tetapi **mesti** memulangkan JSON yang sah seperti di atas.

---

## 📚 Integrasi Lorebook

- **Penciptaan Entri Automatik:** Memori baharu disimpan sebagai entri dengan semua metadata.
- **Pengesanan Berasaskan Bendera:** Hanya entri dengan bendera (flag) `stmemorybooks` diiktiraf sebagai memori.
- **Penomboran Automatik:** Penomboran berurutan, pad sifar dengan pelbagai format yang disokong (`[000]`, `(000)`, `{000}`, `#000`).
- **Urutan Manual/Automatik:** Tetapan urutan sisipan mengikut profil.
- **Muat Semula Editor:** Secara pilihan memuat semula editor lorebook selepas menambah memori.

> **Memori sedia ada mesti ditukar!**
> Gunakan [Penukar Lorebook](https://www.google.com/search?q=/resources/lorebookconverter.html) untuk menambah bendera `stmemorybooks` dan medan yang diperlukan.

---

### 🎡 Prom Sampingan

Prom Sampingan boleh digunakan seperti penjejak dan akan mencipta entri dalam lorebook memori anda.

- **Akses:** Dari tetapan Buku Memori, klik “🎡 Side Prompt Manager”.
- **Ciri-ciri:**
- Lihat semua prom sampingan.
- Cipta prom baharu atau pendua untuk bereksperimen dengan gaya prom yang berbeza.
- Edit atau padam mana-mana pratetap (termasuk yang terbina dalam).
- Eksport dan import pratetap sebagai fail JSON untuk sandaran atau perkongsian.
- Jalankannya secara manual atau automatik dengan penciptaan memori.

- **Petua Penggunaan:**
- Apabila mencipta prom baharu, anda boleh menyalin daripada yang terbina dalam untuk keserasian terbaik.
- Pustaka Templat Prom Sampingan tambahan [fail JSON](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - hanya import untuk guna.

---

### 🧠 Integrasi Regex untuk Penyesuaian Lanjutan

- **Kawalan Penuh Terhadap Pemprosesan Teks**: Buku Memori kini berintegrasi dengan ekstensi **Regex** SillyTavern, membolehkan anda menggunakan transformasi teks yang berkuasa pada dua peringkat utama:

1. **Penjanaan Prom**: Ubah suai prom yang dihantar ke AI secara automatik dengan mencipta skrip regex yang menyasarkan penempatan **User Input**.
2. **Penghuraian Respons**: Bersihkan, format semula, atau seragamkan respons mentah AI sebelum ia disimpan dengan menyasarkan penempatan **AI Output**.

- **Sokongan Pelbagai Pilihan**: Anda kini boleh memilih berbilang skrip regex. Semua skrip yang didayakan akan digunakan secara berurutan pada setiap peringkat (Penjanaan Prom dan Penghuraian Respons), membolehkan transformasi lanjutan dan fleksibel.
- **Cara Ia Berfungsi**: Integrasi adalah lancar. Hanya cipta dan dayakan (pilih berbilang) skrip yang anda inginkan dalam ekstensi Regex, dan Buku Memori akan menggunakannya secara automatik semasa penciptaan memori dan prom sampingan.

---

## 👤 Pengurusan Profil

- **Profil:** Setiap profil termasuk API, model, suhu, prom/pratetap, format tajuk, dan tetapan lorebook.
- **Import/Eksport:** Kongsi profil sebagai JSON.
- **Penciptaan Profil:** Gunakan tetingkap pilihan lanjutan untuk menyimpan profil baharu.
- **Penggantian Mengikut Profil:** Tukar API/model/suhu buat sementara waktu untuk penciptaan memori, kemudian pulihkan tetapan asal anda.

---

## ⚙️ Tetapan & Konfigurasi

### **Tetapan Global**

[Gambaran keseluruhan video pendek di Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** Dayakan untuk memilih lorebook bagi setiap sembang.
- **Auto-create lorebook if none exists:** ⭐ _Baharu dalam v4.2.0_ - Cipta dan ikat lorebook secara automatik menggunakan templat penamaan anda.
- **Lorebook Name Template:** ⭐ _Baharu dalam v4.2.0_ - Sesuaikan nama lorebook ciptaan automatik dengan pemegang tempat {{char}}, {{user}}, {{chat}}.
- **Allow Scene Overlap:** Benarkan atau halang julat memori bertindih.
- **Always Use Default Profile:** Langkau tetingkap pengesahan.
- **Show memory previews:** Dayakan tetingkap pratonton untuk menyemak dan mengedit memori sebelum menambah ke lorebook.
- **Show Notifications:** Togol mesej pemberitahuan (toast).
- **Refresh Editor:** Muat semula editor lorebook secara automatik selepas penciptaan memori.
- **Token Warning Threshold:** Tetapkan tahap amaran untuk babak besar (lalai: 30,000).
- **Default Previous Memories:** Bilangan memori terdahulu untuk disertakan sebagai konteks (0-7).
- **Auto-create memory summaries:** Dayakan penciptaan memori automatik pada selang masa tertentu.
- **Auto-Summary Interval:** Bilangan mesej yang mana selepas itu ringkasan memori dicipta secara automatik (10-200, lalai: 100).
- **Memory Title Format:** Pilih atau sesuaikan (lihat di bawah).

### **Medan Profil**

- **Name:** Nama paparan.
- **API/Provider:** openai, claude, custom, dsb.
- **Model:** Nama model (cth., gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Tersuai atau terbina dalam.
- **Title Format:** Templat mengikut profil.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (dan nama medan).
- **Order Mode:** Auto/manual.
- **Recursion:** Halang/tangguhkan rekursi.

---

## 🏷️ Format Tajuk

Sesuaikan tajuk entri lorebook anda menggunakan sistem templat yang berkuasa.

- **Pemegang Tempat (Placeholders):**
- `{{title}}` - Tajuk yang dijana oleh AI (cth., "Pertemuan yang Menentukan").
- `{{scene}}` - Julat mesej (cth., "Babak 15-23").
- `{{char}}` - Nama watak.
- `{{user}}` - Nama pengguna anda.
- `{{messages}}` - Bilangan mesej dalam babak.
- `{{profile}}` - Nama profil yang digunakan untuk penjanaan.
- Pemegang tempat tarikh/masa semasa dalam pelbagai format (cth., `August 13, 2025` untuk tarikh, `11:08 PM` untuk masa).

- **Penomboran automatik:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan kini juga bentuk terbungkus seperti `#[000]`, `([000])`, `{[000]}` untuk penomboran berurutan, pad sifar.
- **Format Tersuai:** Anda boleh mencipta format anda sendiri. Bermula v4.5.1, semua aksara Unicode yang boleh dicetak (termasuk emoji, CJK, aksen, simbol, dll.) dibenarkan dalam tajuk; hanya aksara kawalan Unicode disekat.

---

## 🧵 Memori Konteks

- **Sertakan sehingga 7 memori terdahulu** sebagai konteks untuk kesinambungan yang lebih baik.
- **Anggaran token** termasuk memori konteks untuk ketepatan.

---

## 🎨 Maklum Balas Visual & Kebolehcapaian

- **Keadaan Butang:**
- Tidak aktif, aktif, pemilihan sah, dalam babak, memproses.

- **Kebolehcapaian:**
- Navigasi papan kekunci, penunjuk fokus, atribut ARIA, gerakan dikurangkan, mesra mudah alih.

---

# Soalan Lazim (FAQ)

### Saya tidak menjumpai Buku Memori dalam menu Ekstensi!

Tetapan terletak dalam menu Ekstensi (tongkat sakti 🪄 di sebelah kiri kotak input anda). Cari "Memory Books".

### Adakah saya perlu menjalankan vektor?

Entri 🔗 dalam maklumat dunia dinamakan "vectorized" (bervektor) dalam UI ST. Inilah sebabnya saya menggunakan perkataan bervektor. Jika anda tidak menggunakan ekstensi vektor (saya tidak), ia berfungsi melalui kata kunci. Semua ini diautomasikan supaya anda tidak perlu memikirkan kata kunci apa yang perlu digunakan.

### Patutkah saya membuat lorebook berasingan untuk memori, atau bolehkah saya menggunakan lorebook yang sama yang saya gunakan untuk perkara lain?

Saya syorkan supaya lorebook memori anda menjadi buku yang berasingan. Ini memudahkan untuk mengatur memori (berbanding entri lain). Contohnya, menambahkannya ke sembang kumpulan, menggunakannya dalam sembang lain, atau menetapkan bajet lorebook individu (menggunakan STLO).

### Patutkah saya menggunakan 'Delay until recursion' jika Buku Memori adalah satu-satunya lorebook?

Tidak. Jika tiada maklumat dunia atau lorebook lain, memilih 'Delay until recursion' mungkin menghalang gelung pertama daripada mencetuskan, menyebabkan tiada apa-apa yang diaktifkan. Jika Buku Memori adalah satu-satunya lorebook, sama ada lumpuhkan 'Delay until recursion' atau pastikan sekurang-kurangnya satu maklumat dunia/lorebook tambahan dikonfigurasikan.

---

# Penyelesaian Masalah

- **Tiada lorebook tersedia atau dipilih:**
- Dalam Mod Manual, pilih lorebook apabila diminta.
- Dalam Mod Automatik, ikat lorebook ke sembang anda.
- Atau dayakan "Auto-create lorebook if none exists" untuk penciptaan automatik.

- **Tiada babak dipilih:**
- Tandakan kedua-dua titik mula (►) dan tamat (◄).

- **Babak bertindih dengan memori sedia ada:**
- Pilih julat yang berbeza, atau dayakan "Allow scene overlap" dalam tetapan.

- **AI gagal menjana memori yang sah:**
- Gunakan model yang menyokong output JSON.
- Semak prom dan tetapan model anda.

- **Ambang amaran token dilebihi:**
- Gunakan babak yang lebih kecil, atau tingkatkan ambang.

- **Butang chevron hilang:**
- Tunggu ekstensi dimuatkan, atau muat semula (refresh).

- **Data watak tidak tersedia:**
- Tunggu sembang/kumpulan dimuatkan sepenuhnya.

---

## 📝 Polisi Aksara (v4.5.1+)

- **Dibenarkan dalam tajuk:** Semua aksara Unicode yang boleh dicetak dibenarkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
- **Disekat:** Hanya aksara kawalan Unicode (U+0000–U+001F, U+007F–U+009F) disekat; ini dibuang secara automatik.

## Lihat [Butiran Polisi Aksara](https://www.google.com/search?q=charset.md) untuk contoh dan nota migrasi.

_Dibangunkan dengan kasih sayang menggunakan VS Code/Cline, ujian meluas, dan maklum balas komuniti._ 🤖💕
