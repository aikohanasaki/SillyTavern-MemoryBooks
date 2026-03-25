# 📕 Memory Books (Sambungan SillyTavern)

Sambungan SillyTavern generasi baharu untuk penciptaan memori yang automatik, berstruktur, dan boleh dipercayai. Tandakan babak dalam sembang, jana ringkasan berasaskan JSON dengan AI, dan simpan sebagai entri dalam lorebook anda. Menyokong sembang kumpulan, pengurusan profil lanjutan, prom sampingan/penjejak, dan konsolidasi memori berbilang tahap.

### ❓ Kosa Kata
- Scene → Memori
- Many Memories → Ringkasan / Konsolidasi
- Always-On → Prom Sampingan (Penjejak)

## ❗ Baca Saya Dahulu!

Mula di sini:
* ⚠️‼️ Sila baca [prasyarat](#prasyarat) untuk nota pemasangan, terutama jika anda menggunakan API Pelengkap Teks
* 📽️ [Video Permulaan Pantas](https://youtu.be/mG2eRH_EhHs) - hanya dalam bahasa Inggeris
* ❓ [Soalan Lazim](#soalan-lazim)
* 🛠️ [Penyelesaian Masalah](#penyelesaian-masalah)

Pautan lain:
* 📘 [Panduan Pengguna (MS)](USER_GUIDE-MS.md)
* 📋 [Sejarah Versi & Log Perubahan](../changelog.md)
* 🧠 [Bagaimana STMB Berfungsi (MS)](howSTMBworks-ms.md)
* 💡 [Menggunakan 📕 Memory Books dengan 📚 Penyusunan Lorebook](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Malay.md)

> Nota: Menyokong pelbagai bahasa. Lihat folder [`/locales`](../locales) untuk senarai. Readme dan Panduan Pengguna yang diterjemahkan boleh didapati dalam folder [`/userguides`](./).
> Penukar lorebook dan pustaka templat prom sampingan berada dalam folder [`/resources`](../resources).

## 📑 Jadual Kandungan

- [📋 Prasyarat](#-prasyarat)
  - [Tip KoboldCpp untuk menggunakan 📕 ST Memory Books](#tip-koboldcpp-untuk-menggunakan--st-memory-books)
  - [Tip Llama.cpp untuk menggunakan 📕 ST Memory Books](#tip-llamacpp-untuk-menggunakan--st-memory-books)
- [💡 Tetapan Pengaktifan Info Dunia/Lorebook Global Disyorkan](#-tetapan-pengaktifan-info-dunialorebook-global-disyorkan)
- [🚀 Mula Pantas](#-mula-pantas)
  - [1. Pasang & Muat](#1-pasang--muat)
  - [2. Tandakan Babak](#2-tandakan-babak)
  - [3. Cipta Memori](#3-cipta-memori)
- [🧩 Jenis Memori: Babak vs Ringkasan](#-jenis-memori-babak-vs-ringkasan)
  - [🎬 Memori Babak (Lalai)](#-memori-babak-lalai)
  - [🌈 Konsolidasi Ringkasan](#-konsolidasi-ringkasan)
- [📝 Penjanaan Memori](#-penjanaan-memori)
  - [Output JSON Sahaja](#output-json-sahaja)
  - [Pratetap Terbina Dalam](#pratetap-terbina-dalam)
  - [Prom Tersuai](#prom-tersuai)
- [📚 Integrasi Lorebook](#-integrasi-lorebook)
- [🆕 Pintasan Perintah Slash](#-pintasan-perintah-slash)
- [👥 Sokongan Sembang Kumpulan](#-sokongan-sembang-kumpulan)
- [🧭 Mod Operasi](#-mod-operasi)
  - [Mod Automatik (Lalai)](#mod-automatik-lalai)
  - [Mod Cipta Lorebook Automatik](#mod-cipta-lorebook-automatik)
  - [Mod Lorebook Manual](#mod-lorebook-manual)
  - [🎡 Penjejak & Prom Sampingan](#-penjejak--prom-sampingan)
  - [🧠 Integrasi Regex untuk Penyesuaian Lanjutan](#-integrasi-regex-untuk-penyesuaian-lanjutan)
- [👤 Pengurusan Profil](#-pengurusan-profil)
- [⚙️ Tetapan & Konfigurasi](#-tetapan--konfigurasi)
  - [Tetapan Global](#tetapan-global)
  - [Medan Profil](#medan-profil)
- [🏷️ Pemformatan Tajuk](#-pemformatan-tajuk)
- [🧵 Memori Konteks](#-memori-konteks)
- [🎨 Maklum Balas Visual & Kebolehcapaian](#-maklum-balas-visual--kebolehcapaian)
  - [Patutkah saya menggunakan lorebook berasingan untuk memori?](#patutkah-saya-menggunakan-lorebook-berasingan-untuk-memori)
  - [Adakah saya perlu menjalankan vektor?](#adakah-saya-perlu-menjalankan-vektor)
  - [Patutkah saya menggunakan 'Tangguhkan Sehingga Rekursi' jika Memory Books ialah satu-satunya lorebook?](#patutkah-saya-menggunakan-tangguhkan-sehingga-rekursi-jika-memory-books-ialah-satu-satunya-lorebook)
  - [Mengapa AI tidak nampak entri saya?](#mengapa-ai-tidak-nampak-entri-saya)
- [📚 Tingkatkan Kuasa dengan Penyusunan Lorebook (STLO)](#-tingkatkan-kuasa-dengan-penyusunan-lorebook-stlo)
- [📝 Polisi Karakter (v4.5.1+)](#-polisi-karakter-v451)
- [👨‍💻 Untuk Pembangun](#-untuk-pembangun)
  - [Membina Sambungan](#membina-sambungan)
  - [Git Hooks](#git-hooks)

## 📋 Prasyarat

- **SillyTavern:** 1.14.0+ (disyorkan versi terkini)
- **Pemilihan Babak:** Penanda mula dan tamat mesti ditetapkan, dengan `mula < tamat`
- **Sokongan Chat Completion:** Sokongan penuh untuk OpenAI, Claude, Anthropic, OpenRouter, atau API chat completion lain
- **Sokongan Text Completion:** API text completion (Kobold, TextGen, dll.) disokong apabila disambungkan melalui titik akhir API Chat Completion yang serasi OpenAI. Saya syorkan menyediakan sambungan API Chat Completion mengikut tip KoboldCpp di bawah, kemudian sediakan profil STMB dan gunakan konfigurasi Tersuai (disyorkan) atau manual penuh jika perlu.

**NOTA:** Jika anda menggunakan Text Completion, anda mesti mempunyai pratetap chat completion.

### Tip KoboldCpp untuk menggunakan 📕 ST Memory Books

Sediakan ini dalam ST terlebih dahulu. Anda boleh kembali ke Text Completion selepas STMB berfungsi.

- API Chat Completion
- Sumber chat completion tersuai
- Titik akhir `http://localhost:5001/v1` (atau `127.0.0.1:5000/v1`)
- Masukkan apa-apa dalam "custom API key" (ST memerlukan satu)
- ID model mesti `koboldcpp/modelname` (jangan masukkan `.gguf` dalam nama model)
- Muat turun dan import mana-mana pratetap chat completion supaya anda mempunyai pratetap chat completion
- Tetapkan panjang respons maksimum pada pratetap chat completion kepada sekurang-kurangnya 2048; 4096 disyorkan

### Tip Llama.cpp untuk menggunakan 📕 ST Memory Books

Sama seperti Kobold, sediakan ini sebagai _Chat Completion API_ dalam ST. Anda boleh kembali ke Chat Completion selepas anda mengesahkan STMB berfungsi.

- Cipta profil sambungan baharu untuk Chat Completion API
- Sumber Pelengkap: `Custom (Open-AI Compatible)`
- URL Titik Akhir: `http://host.docker.internal:8080/v1` jika ST berjalan dalam Docker, jika tidak `http://localhost:8080/v1`
- Kunci API Tersuai: masukkan apa sahaja (ST memerlukan satu)
- ID Model: `llama2-7b-chat.gguf` atau model anda sendiri
- Pemprosesan pasca prom: tiada

Untuk memulakan Llama.cpp, saya syorkan meletakkan sesuatu seperti berikut dalam skrip shell atau fail bat supaya permulaan lebih mudah:

```sh
llama-server -m <laluan-model> -c <saiz-konteks> --port 8080
```

## 💡 Tetapan Pengaktifan Info Dunia/Lorebook Global Disyorkan

- **Match Whole Words:** biarkan tidak ditanda (`false`)
- **Scan Depth:** lebih tinggi lebih baik
- **Max Recursion Steps:** 2
- **Context %:** 80% berdasarkan tetingkap konteks 100,000 token
- Jika lorebook memori ialah satu-satunya lorebook, pastikan `Tangguhkan Sehingga Rekursi` dimatikan dalam profil STMB atau memori mungkin tidak mencetus

---

## 🚀 Mula Pantas

### 1. **Pasang & Muat**

- Muat SillyTavern dan pilih watak atau sembang kumpulan.
- Tunggu butang chevron (► ◄) muncul pada mesej sembang.

![Tunggu butang ini](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandakan Babak**

- Klik ► pada mesej pertama babak anda.
- Klik ◄ pada mesej terakhir.

Butang yang ditekan akan kelihatan seperti contoh di bawah. Warna anda mungkin berbeza mengikut tema CSS.

![Maklum balas visual pemilihan babak](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Cipta Memori**

- Buka menu Extensions (ikon tongkat sihir 🪄) dan klik "Memory Books", atau gunakan perintah `/creatememory`.
- Sahkan tetapan (profil, konteks, API/model) jika diminta.
- Tunggu penjanaan AI dan entri lorebook automatik.

---

## 🧩 Jenis Memori: Babak vs Ringkasan

📕 Memory Books menyokong **memori babak** dan **konsolidasi ringkasan berbilang tahap**, masing-masing untuk kesinambungan yang berbeza.

### 🎬 Memori Babak (Lalai)

Memori babak menangkap **apa yang berlaku** dalam julat mesej tertentu.

- Berdasarkan pemilihan babak yang jelas (► ◄)
- Ideal untuk ingatan momen-ke-momen
- Memelihara dialog, tindakan, dan hasil serta-merta
- Terbaik digunakan dengan kerap

Ini ialah jenis memori standard yang paling biasa digunakan.

### 🌈 Konsolidasi Ringkasan

Konsolidasi ringkasan menangkap **apa yang berubah dari masa ke masa** merentasi beberapa memori atau ringkasan.

Daripada meringkaskan satu babak, ringkasan konsolidasi memfokuskan kepada:

- Perkembangan watak dan perubahan hubungan
- Matlamat jangka panjang, ketegangan, dan penyelesaian
- Trajektori emosi dan arah naratif
- Perubahan keadaan berterusan yang perlu kekal stabil

Tahap konsolidasi pertama ialah **Arc**, dibina daripada memori babak. Tahap yang lebih tinggi juga disokong untuk cerita yang lebih panjang:

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 Anggap ini sebagai *rekap*, bukan log babak.

#### Bila perlu guna Ringkasan Konsolidasi

- Selepas perubahan hubungan yang besar
- Di akhir bab atau arka cerita
- Apabila motivasi, kepercayaan, atau dinamik kuasa berubah
- Sebelum memulakan fasa baharu cerita

#### Cara ia berfungsi

- Ringkasan konsolidasi dijana daripada memori/ringkasan STMB yang sedia ada, bukan terus daripada sembang mentah
- Alat **Gabungkan Ingatan** membolehkan anda memilih tahap sasaran dan memilih entri sumber
- STMB boleh memantau tahap ringkasan yang dipilih dan memaparkan prompt ya/later apabila tahap itu mencapai jumlah minimum entri sumber yang layak
- STMB boleh menyahaktifkan entri sumber selepas konsolidasi jika anda mahu ringkasan tahap lebih tinggi mengambil alih
- Respons ringkasan AI yang gagal boleh disemak dan diperbetulkan daripada UI sebelum mencuba simpanan sekali lagi

Ini memberikan anda:

- penggunaan token yang lebih rendah
- kesinambungan naratif yang lebih baik dalam sembang panjang

---

## 📝 Penjanaan Memori

### **Output JSON Sahaja**

Semua prom dan pratetap **mesti** mengarahkan AI untuk memulangkan hanya JSON yang sah, contohnya:

```json
{
  "title": "Tajuk babak pendek",
  "content": "Ringkasan terperinci babak...",
  "keywords": ["kata kunci1", "kata kunci2"]
}
```

**Tiada teks lain dibenarkan dalam respons.**

### **Pratetap Terbina Dalam**

1. **Summary:** Ringkasan terperinci beat demi beat.
2. **Summarize:** Pengepala Markdown untuk garis masa, beat, interaksi, dan hasil.
3. **Synopsis:** Markdown yang komprehensif dan berstruktur.
4. **Sum Up:** Ringkasan beat yang padat dengan garis masa.
5. **Minimal:** Ringkasan 1-2 ayat.
6. **Northgate:** Gaya ringkasan sastera untuk penulisan kreatif.
7. **Aelemar:** Fokus pada titik plot dan memori watak.
8. **Comprehensive:** Gaya sinopsis dengan pengekstrakan kata kunci yang dipertingkatkan.

### **Prom Tersuai**

- Cipta prom anda sendiri, tetapi **mesti** memulangkan JSON yang sah seperti di atas.

---

## 📚 Integrasi Lorebook

- **Penciptaan Entri Automatik:** Memori baharu disimpan sebagai entri bersama semua metadata.
- **Pengesanan Berasaskan Bendera:** Hanya entri dengan bendera `stmemorybooks` diiktiraf sebagai memori.
- **Penomboran Automatik:** Penomboran berurutan, berlapik sifar, dengan beberapa format yang disokong (`[000]`, `(000)`, `{000}`, `#000`).
- **Susunan Manual/Automatik:** Tetapan susunan penyisipan per-profil.
- **Muat Semula Editor:** Opsyenal untuk memuat semula editor lorebook secara automatik selepas menambah memori.

> **Memori sedia ada mesti ditukar!**
> Gunakan [Penukar Lorebook](/resources/lorebookconverter.html) untuk menambah bendera `stmemorybooks` dan medan yang diperlukan.

---

## 🆕 Pintasan Perintah Slash

- `/creatememory` - Cipta memori daripada babak yang ditandakan.
- `/scenememory X-Y` - Tetapkan julat babak dan cipta memori, contohnya `/scenememory 10-15`.
- `/nextmemory` - Cipta memori dari akhir memori terakhir hingga mesej semasa.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` - Jalankan side prompt (`{{macro}}` adalah pilihan).
- `/sideprompt-on "Name" | all` - Hidupkan side prompt mengikut nama atau semua.
- `/sideprompt-off "Name" | all` - Matikan side prompt mengikut nama atau semua.
- `/stmb-highest` - Kembalikan message id tertinggi bagi memori yang telah diproses dalam sembang ini.
- `/stmb-set-highest <N|none>` - Tetapkan secara manual message id tertinggi yang telah diproses untuk sembang ini.
- `/stmb-stop` - Hentikan semua penjanaan STMB yang sedang berjalan di mana-mana (henti kecemasan).

## 👥 Sokongan Sembang Kumpulan

- Semua ciri berfungsi dengan sembang kumpulan.
- Penanda babak, penciptaan memori, dan integrasi lorebook disimpan dalam metadata kumpulan.
- Tiada persediaan khas diperlukan. Pilih sahaja sembang kumpulan dan gunakannya seperti biasa.

---

## 🧭 Mod Operasi

### **Mod Automatik (Lalai)**

- **Cara ia berfungsi:** Menggunakan lorebook yang terikat pada sembang semasa anda secara automatik.
- **Terbaik untuk:** Kesederhanaan dan kelajuan. Kebanyakan pengguna harus bermula di sini.
- **Cara guna:** Pastikan lorebook dipilih dalam menu lungsur "Chat Lorebooks" untuk watak atau sembang kumpulan anda.

![Contoh pengikatan lorebook sembang](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mod Cipta Lorebook Automatik**

- **Cara ia berfungsi:** Mencipta dan mengikat lorebook baharu secara automatik apabila tiada lorebook wujud, menggunakan templat penamaan tersuai anda.
- **Terbaik untuk:** Pengguna baharu dan persediaan pantas. Sesuai untuk penciptaan lorebook satu klik.
- **Cara guna:**
  1. Dayakan "Cipta buku legenda secara automatik jika tiada" dalam tetapan sambungan.
  2. Konfigurasikan templat penamaan anda (lalai: "LTM - {{char}} - {{chat}}").
  3. Apabila anda mencipta memori tanpa lorebook yang terikat, satu akan dicipta dan diikat secara automatik.
- **Pemegang tempat templat:** {{char}} (nama watak), {{user}} (nama anda), {{chat}} (ID sembang)
- **Penomboran pintar:** Menambah nombor secara automatik (2, 3, 4...) jika nama pendua wujud.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Lorebook Manual.

### **Mod Lorebook Manual**

- **Cara ia berfungsi:** Membolehkan anda memilih lorebook yang berbeza untuk memori bagi setiap sembang, mengabaikan lorebook utama yang terikat pada sembang.
- **Terbaik untuk:** Pengguna lanjutan yang mahu mengarahkan memori ke lorebook tertentu yang berasingan.
- **Cara guna:**
  1. Dayakan "Dayakan Mod Buku Legenda Manual" dalam tetapan sambungan.
  2. Kali pertama anda mencipta memori dalam sembang, anda akan diminta memilih lorebook.
  3. Pilihan ini disimpan untuk sembang tersebut sehingga anda mengosongkannya atau bertukar kembali ke Mod Automatik.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Cipta Lorebook Automatik.

---

### 🎡 Penjejak & Prom Sampingan

Prom Sampingan boleh digunakan seperti penjejak dan akan mencipta entri side prompt yang berasingan dalam lorebook memori anda. Prom Sampingan membolehkan anda menjejak **keadaan semasa**, bukan hanya peristiwa lalu. Contohnya:

- 💰 Inventori & Sumber ("Apa item yang pengguna miliki?")
- ❤️ Status Hubungan ("Apa perasaan X terhadap Y?")
- 📊 Statistik Watak ("Kesihatan semasa, kemahiran, reputasi")
- 🎯 Kemajuan Misi ("Apa matlamat yang aktif?")
- 🌍 Keadaan Dunia ("Apa yang berubah dalam latar?")

#### **Akses**
Daripada tetapan Memory Books, klik `🎡 Penjejak & Prom Sampingan`.

#### **Ciri-ciri**

- Lihat semua prom sampingan.
- Cipta prom baharu atau gandakan prom sedia ada untuk bereksperimen dengan gaya yang berbeza.
- Edit atau padam mana-mana pratetap, termasuk yang terbina dalam.
- Eksport dan import pratetap sebagai fail JSON untuk sandaran atau perkongsian.
- Jalankan secara manual atau automatik, bergantung pada templat.
- Gunakan makro/placeholder SillyTavern standard seperti `{{user}}` dan `{{char}}` dalam medan `Prompt`, `Response Format`, `Title`, dan `{{keyword}}` bagi side prompt.
- Gunakan makro tersuai seperti `{{npc name}}` yang anda bekalkan apabila menjalankan `/sideprompt`.

#### **Tip Penggunaan**

- Apabila mencipta prom baharu, anda boleh menyalin daripada terbina dalam untuk keserasian terbaik.
- Side prompt tidak perlu mengembalikan JSON. Ia boleh mengembalikan teks biasa.
- Side prompt dikemas kini/ditindih. Ini membezakannya daripada memori yang disimpan secara berurutan.
- Sintaks manual ialah `/sideprompt "Nama" {{macro}}="value" [X-Y]`.
- Selepas anda memilih side prompt dalam autolengkap perintah, STMB akan mencadangkan makro runtime yang diperlukan untuk templat tersebut.
- Side prompt dengan makro runtime tersuai (bukan ST default) adalah manual sahaja. STMB mematikan `On Interval` dan `On After Memory` daripada templat itu semasa simpan/import dan memaparkan amaran apabila itu berlaku.
- Pustaka templat Side Prompts tambahan terdapat dalam [fail JSON](resources/SidePromptTemplateLibrary.json). Hanya import untuk digunakan.

### 🧠 Integrasi Regex untuk Penyesuaian Lanjutan

- **Kawalan penuh terhadap pemprosesan teks:** Memory Books kini berintegrasi dengan sambungan **Regex** SillyTavern, membolehkan anda menggunakan transformasi teks yang berkuasa pada dua peringkat utama:
  1. **Penjanaan Prom:** Ubah suai prom yang dihantar ke AI secara automatik dengan mencipta skrip regex yang menyasarkan penempatan **User Input**.
  2. **Penghuraian Respons:** Bersihkan, format semula, atau piawaikan respons mentah AI sebelum ia disimpan dengan menyasarkan penempatan **AI Output**.
- **Sokongan pelbagai pilihan:** Anda boleh memilih beberapa skrip regex untuk pemprosesan keluar dan masuk.
- **Cara ia berfungsi:** Hidupkan `Gunakan regex (lanjutan)` dalam STMB, klik `📐 Konfigurasi regex…`, kemudian pilih skrip mana yang patut dijalankan STMB sebelum menghantar ke AI dan sebelum respons dihuraikan/disimpan.
- **Penting:** Pilihan regex dikawal oleh STMB. Skrip yang dipilih di sana akan dijalankan **walaupun ia sedang dilumpuhkan** dalam sambungan Regex itu sendiri.

---

## 👤 Pengurusan Profil

- **Profil:** Setiap profil termasuk API, model, suhu, prom/pratetap, format tajuk, dan tetapan lorebook.
- **Import/Eksport:** Kongsi profil sebagai JSON.
- **Penciptaan Profil:** Gunakan pop timbul pilihan lanjutan untuk menyimpan profil baharu.
- **Penggantian Per-Profil:** Tukar sementara API/model/suhu untuk penciptaan memori, kemudian pulihkan tetapan asal anda.
- **Profil/Pembekal Binaan Dalam:** STMB menyertakan pilihan `Tetapan SillyTavern Semasa` yang wajib, yang menggunakan sambungan/tetapan SillyTavern aktif anda secara terus.

---

## ⚙️ Tetapan & Konfigurasi

![Panel tetapan utama](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Tetapan Global**

[Gambaran keseluruhan video pendek di Youtube](https://youtu.be/mG2eRH_EhHs)

- **Dayakan Mod Buku Legenda Manual:** Dayakan untuk memilih lorebook bagi setiap sembang.
- **Cipta buku legenda secara automatik jika tiada:** ⭐ *Baharu dalam v4.2.0* - Cipta dan ikat lorebook secara automatik menggunakan templat penamaan anda.
- **Templat Nama Buku Legenda:** ⭐ *Baharu dalam v4.2.0* - Sesuaikan nama lorebook ciptaan automatik dengan pemegang tempat `{{char}}`, `{{user}}`, `{{chat}}`.
- **Benarkan Pertindihan Babak:** Benarkan atau halang julat memori yang bertindih.
- **Sentiasa Guna Profil Lalai:** Langkau pop timbul pengesahan.
- **Tunjukkan pratonton memori:** Dayakan pop timbul pratonton untuk menyemak dan mengedit memori sebelum menambah ke lorebook.
- **Tunjukkan Pemberitahuan:** Togol mesej toast.
- **Muat Semula Editor:** Muat semula editor lorebook secara automatik selepas penciptaan memori.
- **Token Respons Maksimum:** Tetapkan panjang penjanaan maksimum untuk ringkasan memori.
- **Ambang Amaran Token:** Tetapkan tahap amaran untuk babak besar.
- **Memori Terdahulu Lalai:** Bilangan memori sebelumnya untuk dimasukkan sebagai konteks (0-7).
- **Cipta ringkasan memori secara automatik:** Dayakan penciptaan memori automatik pada selang masa tertentu.
- **Selang Ringkasan Automatik:** Bilangan mesej selepas mana ringkasan memori dicipta secara automatik.
- **Penimbal Ringkasan Automatik:** Tangguhkan auto-summary dengan bilangan mesej yang boleh dikonfigurasikan.
- **Minta pengesahan konsolidasi apabila tier sedia:** Tunjukkan prompt ya/tidak apabila tier ringkasan yang dipilih sudah mempunyai cukup entri sumber yang layak untuk dikonsolidasikan.
- **Tier Konsolidasi Automatik:** Pilih satu atau lebih tier ringkasan yang akan mencetuskan prompt tersebut. Kini menyokong Arc hingga Series.
- **Tunjukkan semula mesej tersembunyi sebelum penjanaan memori:** Boleh menjalankan `/unhide X-Y` sebelum mencipta memori.
- **Sembunyikan mesej secara automatik selepas menambah memori:** Pilihan untuk menyembunyikan semua mesej yang diproses atau hanya julat memori terakhir.
- **Gunakan regex (lanjutan):** Mendayakan pop timbul pemilihan regex STMB untuk pemprosesan keluar/masuk.
- **Format Tajuk Memori:** Pilih atau sesuaikan format tajuk (lihat di bawah).

![Konfigurasi profil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Medan Profil**

- **Nama:** Nama paparan.
- **API/Pembekal:** `Tetapan SillyTavern Semasa`, openai, claude, custom, full manual, dan pembekal lain yang disokong.
- **Model:** Nama model, contohnya `gpt-4`, `claude-3-opus`.
- **Temperature:** 0.0–2.0.
- **Prompt atau Pratetap:** Tersuai atau terbina dalam.
- **Format Tajuk:** Templat per-profil.
- **Mod Pengaktifan:** Vectorized, Constant, Normal.
- **Posisi:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, Outlet, dan nama medan.
- **Mod Susunan:** Auto/manual.
- **Rekursi:** Halang/tangguhkan hingga rekursi.

---

## 🏷️ Pemformatan Tajuk

Sesuaikan tajuk entri lorebook anda menggunakan sistem templat yang berkuasa.

- **Pemegang tempat:**
  - `{{title}}` - Tajuk yang dijana AI, contohnya "Pertemuan Takdir".
  - `{{scene}}` - Julat mesej, contohnya "Babak 15-23".
  - `{{char}}` - Nama watak.
  - `{{user}}` - Nama pengguna anda.
  - `{{messages}}` - Bilangan mesej dalam babak.
  - `{{profile}}` - Nama profil yang digunakan untuk penjanaan.
  - Pemegang tempat tarikh/masa semasa dalam pelbagai format, contohnya `August 13, 2025` untuk tarikh dan `11:08 PM` untuk masa.
- **Penomboran automatik:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan juga bentuk berbalut seperti `#[000]`, `([000])`, `{[000]}` untuk penomboran berurutan berlapik sifar.
- **Format Tersuai:** Anda boleh mencipta format anda sendiri. Sejak v4.5.1, semua aksara Unicode yang boleh dicetak, termasuk emoji, CJK, aksen, dan simbol, dibenarkan dalam tajuk. Hanya aksara kawalan Unicode disekat.

---

## 🧵 Memori Konteks

- **Sertakan sehingga 7 memori terdahulu** sebagai konteks untuk kesinambungan yang lebih baik.
- **Anggaran token** termasuk memori konteks untuk ketepatan.
- **Pilihan lanjutan** membolehkan anda mengatasi sementara tingkah laku prom/profil untuk satu kali penjanaan memori.

![Penjanaan memori dengan konteks](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Maklum Balas Visual & Kebolehcapaian

- **Keadaan Butang:** tidak aktif, aktif, pemilihan sah, dalam babak, memproses.

![Pemilihan babak lengkap menunjukkan semua keadaan visual](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **Kebolehcapaian:** navigasi papan kekunci, penunjuk fokus, atribut ARIA, pergerakan dikurangkan, mesra mudah alih.

---

# Soalan Lazim

### Patutkah saya menggunakan lorebook berasingan untuk memori?

Saya syorkan lorebook memori anda menjadi buku yang berasingan. Ini memudahkan pengurusan memori berbanding entri lain. Contohnya, ia lebih mudah untuk dipasang pada sembang kumpulan, digunakan dalam sembang lain, atau diberi bajet lorebook individu menggunakan STLO.

### Adakah saya perlu menjalankan vektor?

Boleh, tetapi ia tidak wajib. Jika anda tidak menggunakan sambungan vektor, ia masih berfungsi melalui kata kunci. Semuanya diautomasikan supaya anda tidak perlu memikirkan kata kunci apa yang perlu digunakan.

### Patutkah saya menggunakan 'Tangguhkan Sehingga Rekursi' jika Memory Books ialah satu-satunya lorebook?

Tidak. Jika tiada info dunia atau lorebook lain, memilih `Tangguhkan Sehingga Rekursi` boleh menghalang gelung pertama daripada mencetus, menyebabkan tiada apa yang diaktifkan. Jika Memory Books ialah satu-satunya lorebook, sama ada matikan `Tangguhkan Sehingga Rekursi` atau pastikan sekurang-kurangnya satu lagi info dunia/lorebook dikonfigurasikan.

### Mengapa AI tidak nampak entri saya?

Pertama, pastikan entri itu benar-benar dihantar. Saya suka menggunakan [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) untuk itu.

Jika entri memang dicetuskan dan dihantar ke AI, kemungkinan anda perlu menegur AI dalam OOC. Contohnya: `[OOC: WHY are you not using the information you were given? Specifically: (whatever it was)]` 😁

---

# Penyelesaian Masalah

- **Saya tidak dapat mencari Memory Books dalam menu Extensions!**
  Tetapan berada dalam menu Extensions, iaitu ikon tongkat sihir 🪄 di sebelah kiri kotak input anda. Cari "Memory Books".

  ![Lokasi tetapan STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **Tiada lorebook tersedia atau dipilih:**
  - Dalam Mod Manual, pilih lorebook apabila diminta.
  - Dalam Mod Automatik, ikat lorebook pada sembang anda.
  - Atau dayakan "Cipta buku legenda secara automatik jika tiada" untuk penciptaan automatik.

- **Ralat Pengesahan Lorebook:**
  - Anda mungkin telah memadam lorebook yang sebelum ini diikat. Hanya ikat lorebook baharu, walaupun ia kosong.

- **Tiada babak dipilih:**
  - Tandakan kedua-dua titik mula (►) dan tamat (◄).

- **Babak bertindih dengan memori sedia ada:**
  - Pilih julat yang berbeza, atau dayakan "Allow Scene Overlap" dalam tetapan.

  ![Amaran pertindihan babak](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI gagal menjana memori yang sah:**
  - Gunakan model yang menyokong output JSON.
  - Semak prom dan tetapan model anda.

- **Ambang amaran token melebihi had:**
  - Gunakan babak yang lebih kecil, atau tingkatkan ambang.

- **Butang chevron hilang:**
  - Tunggu sambungan dimuatkan, atau muat semula.

- **Data watak tidak tersedia:**
  - Tunggu sembang/kumpulan dimuat sepenuhnya.

---

## 📚 Tingkatkan Kuasa dengan Penyusunan Lorebook (STLO)

Untuk organisasi memori lanjutan dan integrasi cerita yang lebih mendalam, gunakan STMB bersama [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Malay.md). Lihat panduan untuk amalan terbaik, arahan persediaan, dan tip.

---

## 📝 Polisi Karakter (v4.5.1+)

- **Dibenarkan dalam tajuk:** Semua aksara Unicode yang boleh dicetak dibenarkan, termasuk huruf beraksen, emoji, CJK, dan simbol.
- **Disekat:** Hanya aksara kawalan Unicode (U+0000–U+001F, U+007F–U+009F) disekat; ini dibuang secara automatik.

Lihat [Butiran Polisi Karakter](charset.md) untuk contoh dan nota migrasi.

---

## 👨‍💻 Untuk Pembangun

### Membina Sambungan

Sambungan ini menggunakan Bun untuk binaan. Proses binaan akan meminimumkan dan menggabungkan fail sumber.

```sh
# Bina sambungan
bun run build
```

### Git Hooks

Projek ini menyertakan pre-commit hook yang secara automatik membina sambungan dan memasukkan artifak binaan ke dalam commit anda. Ini memastikan fail binaan sentiasa sepadan dengan kod sumber.

**Untuk memasang git hook:**

```sh
bun run install-hooks
```

Hook tersebut akan:
- Menjalankan `bun run build` sebelum setiap commit
- Menambah artifak binaan ke dalam commit
- Membatalkan commit jika binaan gagal

---

*Dibangunkan dengan kasih sayang menggunakan VS Code/Cline, ujian menyeluruh, dan maklum balas komuniti.* 🤖💕
