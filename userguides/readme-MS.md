# 📕 Buku Memori (Sambungan SillyTavern)

Sambungan SillyTavern generasi akan datang untuk penciptaan memori yang automatik, berstruktur dan boleh dipercayai. Tandakan babak dalam sembang, jana ringkasan berasaskan JSON dengan AI, dan simpannya sebagai entri "[vektor](#vektor)" dalam buku legenda anda. Menyokong sembang kumpulan, pengurusan profil lanjutan dan pengendalian API/model yang kukuh.

**📘 [Panduan Pengguna (EN)](../USER_GUIDE.md)** | **📋 [Sejarah Versi & Log Perubahan](../changelog.md)**

> Nota: Menyokong pelbagai bahasa: lihat folder [`/locales`](../locales) untuk senarai. Readme dan Panduan Pengguna antarabangsa/setempat boleh didapati dalam folder [`/userguides`](../userguides).
> Penukar buku legenda dan perpustakaan templat gesaan sampingan berada dalam folder [`/resources`](../resources).

## Soalan Lazim
### Di manakah entri dalam menu Sambungan?
Tetapan terletak dalam menu Sambungan (tongkat sihir 🪄 di sebelah kiri kotak input anda). Cari "Buku Memori".

![Lokasi tetapan STMB](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

### Vektor?

Entri 🔗 dalam maklumat dunia dinamakan "vektor" dalam UI ST. Inilah sebabnya saya menggunakan dunia vektor. Jika anda tidak menggunakan sambungan vektor (saya tidak), ia berfungsi melalui kata kunci. Ini semua diautomasikan supaya anda tidak perlu memikirkan kata kunci yang hendak digunakan.

![Menu lungsur strategi ST](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/vectorized.png)

![Kata kunci yang dijana melalui AI](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/keywords.png)

---

## 🚦 Perkara Baharu (v4.6.7)

### 🪲 Pelbagai Pembetulan Pepijat
- membetulkan ciptaan automatik dan ringkasan automatik

### 🌐 Pengantarabangsaan
- Pengantarabangsaan berterusan (sila semak folder [`/locales`](../locales) untuk senarai.)

---

## 📋 Prasyarat

- **SillyTavern:** 1.13.4+ (terkini disyorkan)
- **Pemilihan Babak:** Penanda mula dan tamat (mula < tamat) mesti ditetapkan.
- **Sokongan Pelengkapan Sembang:** Sokongan penuh untuk OpenAI, Claude, Anthropic, OpenRouter atau API pelengkapan sembang lain.
- **Sokongan Pelengkapan Teks:** API pelengkapan teks (Kobold, TextGen, dll.) disokong apabila disambungkan melalui konfigurasi manual penuh atau sumber pelengkapan tersuai dalam SillyTavern.

## 💡 Tetapan Pengaktifan Maklumat Dunia/Buku Legenda Global yang Disyorkan

- **Padankan Perkataan Penuh:** biarkan tidak ditandai (palsu)
- **Kedalaman Imbasan:** lebih tinggi lebih baik (sekurang-kurangnya 4)
- **Langkah Rekursi Maksimum:** 2 (saranan umum, tidak diperlukan)
- **Konteks %:** 40% (berdasarkan tetingkap konteks 100,000 token) - menganggap anda tidak mempunyai sejarah sembang atau bot yang sangat berat

---

## 🚀 Bermula

### 1. **Pasang & Muatkan**
- Muatkan SillyTavern dan pilih watak atau sembang kumpulan.
- Tunggu butang chevron (► ◄) muncul pada mesej sembang (mungkin mengambil masa sehingga 10 saat).

![Tunggu butang ini](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Tandakan Babak**
- Klik ► pada mesej pertama babak anda.
- Klik ◄ pada mesej terakhir.

![Maklum balas visual menunjukkan pemilihan babak](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Cipta Memori**
- Buka menu Sambungan (tongkat sihir 🪄) dan klik "Buku Memori", atau gunakan perintah slash `/creatememory`.
- Sahkan tetapan (profil, konteks, API/model) jika digesa.
- Tunggu penjanaan AI dan entri buku legenda automatik.

---

## 🆕 Pintasan Perintah Slash

- `/creatememory` akan menggunakan penanda mula/tamat chevron sedia ada untuk mencipta memori
- `/scenememory x-y` akan membuat memori bermula dengan mesej x dan berakhir dengan mesej y
- `/nextmemory` akan membuat memori dengan semua mesej sejak memori terakhir.

## 👥 Sokongan Sembang Kumpulan

- Semua ciri berfungsi dengan sembang kumpulan.
- Penanda babak, penciptaan memori dan penyepaduan buku legenda disimpan dalam metadata kumpulan.
- Tiada persediaan khas diperlukan—hanya pilih sembang kumpulan dan gunakan seperti biasa.

---

## 🧭 Mod Operasi

### **Mod Automatik (Lalai)**
- **Cara ia berfungsi:** Menggunakan buku legenda yang terikat pada sembang semasa anda secara automatik.
- **Terbaik untuk:** Kesederhanaan dan kelajuan. Kebanyakan pengguna harus bermula di sini.
- **Untuk menggunakan:** Pastikan buku legenda dipilih dalam menu lungsur "Buku Legenda Sembang" untuk watak atau sembang kumpulan anda.

![Contoh pengikatan buku legenda sembang](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Mod Cipta Buku Legenda Auto** ⭐ *Baharu dalam v4.2.0*
- **Cara ia berfungsi:** Mencipta dan mengikat buku legenda baharu secara automatik apabila tiada, menggunakan templat penamaan tersuai anda.
- **Terbaik untuk:** Pengguna baharu dan persediaan pantas. Sempurna untuk penciptaan buku legenda satu klik.
- **Untuk menggunakan:**
  1. Dayakan "Cipta buku legenda secara automatik jika tiada" dalam tetapan sambungan.
  2. Konfigurasikan templat penamaan anda (lalai: "LTM - {{char}} - {{chat}}").
  3. Apabila anda mencipta memori tanpa buku legenda terikat, satu dicipta dan diikat secara automatik.
- **Pemegang tempat templat:** {{char}} (nama watak), {{user}} (nama anda), {{chat}} (ID sembang)
- **Penomboran pintar:** Menambah nombor secara automatik (2, 3, 4...) jika nama pendua wujud.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Buku Legenda Manual.

### **Mod Buku Legenda Manual**
- **Cara ia berfungsi:** Membolehkan anda memilih buku legenda yang berbeza untuk memori pada setiap sembang, mengabaikan buku legenda utama yang terikat pada sembang.
- **Terbaik untuk:** Pengguna lanjutan yang ingin mengarahkan memori ke buku legenda yang spesifik dan berasingan.
- **Untuk menggunakan:**
  1. Dayakan "Dayakan Mod Buku Legenda Manual" dalam tetapan sambungan.
  2. Kali pertama anda mencipta memori dalam sembang, anda akan digesa untuk memilih buku legenda.
  3. Pilihan ini disimpan untuk sembang khusus itu sehingga anda mengosongkannya atau bertukar kembali ke Mod Automatik.
- **Nota:** Tidak boleh digunakan serentak dengan Mod Cipta Buku Legenda Auto.

---

## 📝 Penjanaan Memori

### **Output JSON Sahaja**
Semua gesaan dan pratetap **mesti** mengarahkan AI untuk mengembalikan hanya JSON yang sah, cth.:

```json
{
  "title": "Tajuk babak ringkas",
  "content": "Ringkasan terperinci babak...",
  "keywords": ["katakunci1", "katakunci2"]
}
```
**Tiada teks lain dibenarkan dalam respons.**

### **Pratetap Terbina Dalam**
1. **Ringkasan:** Ringkasan demi rentak yang terperinci.
2. **Ringkaskan:** Pengepala Markdown untuk garis masa, rentak, interaksi, hasil.
3. **Sinopsis:** Markdown yang komprehensif dan berstruktur.
4. **Rumusan:** Ringkasan rentak ringkas dengan garis masa.
5. **Minimum:** Ringkasan 1-2 ayat.

### **Gesaan Tersuai**
- Cipta sendiri, tetapi **mesti** mengembalikan JSON yang sah seperti di atas.

---

## 📚 Penyepaduan Buku Legenda

- **Penciptaan Entri Automatik:** Memori baharu disimpan sebagai entri dengan semua metadata.
- **Pengesanan Berasaskan Bendera:** Hanya entri dengan bendera `stmemorybooks` diiktiraf sebagai memori.
- **Penomboran Auto:** Penomboran berurutan, berlapik sifar dengan pelbagai format yang disokong (`[000]`, `(000)`, `{000}`, `#000`).
- **Pesanan Manual/Automatik:** Tetapan pesanan sisipan setiap profil.
- **Penyegaran Semula Editor:** Secara pilihan menyegarkan semula editor buku legenda secara automatik selepas menambah memori.

> **Memori sedia ada mesti ditukar!**
> Gunakan [Penukar Buku Legenda](../resources/lorebookconverter.html) untuk menambah bendera `stmemorybooks` dan medan yang diperlukan.

---

### 🎡 Gesaan Sampingan

Gesaan Sampingan boleh digunakan seperti penjejak dan akan mencipta entri dalam buku legenda memori anda.
- **Akses:** Dari tetapan Buku Memori, klik “🎡 Pengurus Gesaan Sampingan”.
- **Ciri-ciri:**
    - Lihat semua gesaan sampingan.
    - Cipta gesaan baharu atau duplikasi untuk bereksperimen dengan gaya gesaan yang berbeza.
    - Edit atau padam mana-mana pratetap (termasuk yang terbina dalam).
    - Eksport dan import pratetap sebagai fail JSON untuk sandaran atau perkongsian.
    - Jalankannya secara manual atau automatik dengan penciptaan memori.
- **Petua Penggunaan:**
    - Apabila mencipta gesaan baharu, anda boleh menyalin daripada yang terbina dalam untuk keserasian terbaik.
    - Perpustakaan Templat Gesaan Sampingan Tambahan [fail JSON](../resources/SidePromptTemplateLibrary.json) - hanya import untuk digunakan

---

## 👤 Pengurusan Profil

- **Profil:** Setiap profil termasuk API, model, suhu, gesaan/pratetap, format tajuk dan tetapan buku legenda.
- **Import/Eksport:** Kongsi profil sebagai JSON.
- **Penciptaan Profil:** Gunakan tetingkap timbul pilihan lanjutan untuk menyimpan profil baharu.
- **Penggantian Setiap Profil:** Tukar API/model/suhu buat sementara waktu untuk penciptaan memori, kemudian pulihkan tetapan asal anda.

---

## ⚙️ Tetapan & Konfigurasi

![Panel tetapan utama](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Tetapan Global**
- **Mod Buku Legenda Manual:** Dayakan untuk memilih buku legenda setiap sembang.
- **Cipta buku legenda secara automatik jika tiada:** ⭐ *Baharu dalam v4.2.0* - Mencipta dan mengikat buku legenda secara automatik menggunakan templat penamaan anda.
- **Templat Nama Buku Legenda:** ⭐ *Baharu dalam v4.2.0* - Sesuaikan nama buku legenda yang dicipta secara automatik dengan pemegang tempat {{char}}, {{user}}, {{chat}}.
- **Benarkan Pertindihan Babak:** Benarkan atau cegah julat memori yang bertindih.
- **Sentiasa Gunakan Profil Lalai:** Langkau tetingkap timbul pengesahan.
- **Tunjukkan pratonton memori:** Dayakan tetingkap timbul pratonton untuk menyemak dan mengedit memori sebelum menambah ke buku legenda.
- **Tunjukkan Pemberitahuan:** Togol mesej roti bakar.
- **Segarkan Semula Editor:** Segarkan semula editor buku legenda secara automatik selepas penciptaan memori.
- **Ambang Amaran Token:** Tetapkan tahap amaran untuk babak besar (lalai: 30,000).
- **Memori Terdahulu Lalai:** Bilangan memori terdahulu untuk disertakan sebagai konteks (0-7).
- **Cipta ringkasan memori secara automatik:** Dayakan penciptaan memori automatik pada selang masa.
- **Selang Ringkasan Auto:** Bilangan mesej selepas itu untuk mencipta ringkasan memori secara automatik (10-200, lalai: 100).
- **Format Tajuk Memori:** Pilih atau sesuaikan (lihat di bawah).

![Konfigurasi profil](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Medan Profil**
- **Nama:** Nama paparan.
- **API/Penyedia:** openai, claude, tersuai, dll.
- **Model:** Nama model (cth., gpt-4, claude-3-opus).
- **Suhu:** 0.0–2.0.
- **Gesaan atau Pratetap:** Tersuai atau terbina dalam.
- **Format Tajuk:** Templat setiap profil.
- **Mod Pengaktifan:** Vektor, Malar, Normal.
- **Kedudukan:** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN.
- **Mod Pesanan:** Auto/manual.
- **Rekursi:** Cegah/tangguhkan rekursi.

---

## 🏷️ Pemformatan Tajuk

Sesuaikan tajuk entri buku legenda anda menggunakan sistem templat yang berkuasa.

- **Pemegang tempat:**
  - `{{title}}` - Tajuk yang dijana oleh AI (cth., "Pertemuan Takdir").
  - `{{scene}}` - Julat mesej (cth., "Babak 15-23").
  - `{{char}}` - Nama watak.
  - `{{user}}` - Nama pengguna anda.
  - `{{messages}}` - Bilangan mesej dalam babak.
  - `{{profile}}` - Nama profil yang digunakan untuk penjanaan.
  - Pemegang tempat tarikh/masa semasa dalam pelbagai format (cth., `13 Ogos 2025` untuk tarikh, `11:08 PM` untuk masa).
- **Penomboran auto:** Gunakan `[0]`, `[00]`, `(0)`, `{0}`, `#0`, dan kini juga bentuk berbalut seperti `#[000]`, `([000])`, `{[000]}` untuk penomboran berurutan, berlapik sifar.
- **Format Tersuai:** Anda boleh mencipta format anda sendiri. Setakat v4.5.1, semua aksara Unicode yang boleh dicetak (termasuk emoji, CJK, beraksen, simbol, dll.) dibenarkan dalam tajuk; hanya aksara kawalan Unicode disekat.

---

## 🧵 Memori Konteks

- **Sertakan sehingga 7 memori sebelumnya** sebagai konteks untuk kesinambungan yang lebih baik.
- **Anggaran token** termasuk memori konteks untuk ketepatan.

![Penjanaan memori dengan konteks](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Maklum Balas Visual & Kebolehcapaian

- **Keadaan Butang:**
  - Tidak aktif, aktif, pemilihan sah, dalam babak, memproses.

![Pemilihan babak lengkap menunjukkan semua keadaan visual](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)


- **Kebolehcapaian:**
  - Navigasi papan kekunci, penunjuk fokus, atribut ARIA, gerakan dikurangkan, mesra mudah alih.

---

## 🛠️ Penyelesaian Masalah

- **Tiada buku legenda tersedia atau dipilih:**
  - Dalam Mod Manual, pilih buku legenda apabila digesa.
  - Dalam Mod Automatik, ikat buku legenda pada sembang anda.
  - Atau dayakan "Cipta buku legenda secara automatik jika tiada" untuk penciptaan automatik.

- **Tiada babak dipilih:**
  - Tandakan kedua-dua titik mula (►) dan tamat (◄).

- **Babak bertindih dengan memori sedia ada:**
  - Pilih julat yang berbeza, atau dayakan "Benarkan pertindihan babak" dalam tetapan.

![Amaran pertindihan babak](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI gagal menjana memori yang sah:**
  - Gunakan model yang menyokong output JSON.
  - Semak tetapan gesaan dan model anda.

- **Ambang amaran token melebihi:**
  - Gunakan babak yang lebih kecil, atau tingkatkan ambang.

- **Butang chevron hilang:**
  - Tunggu sambungan dimuatkan, atau segarkan semula.

- **Data watak tidak tersedia:**
  - Tunggu sembang/kumpulan dimuatkan sepenuhnya.

---

## 📝 Polisi Aksara (v4.5.1+)

- **Dibenarkan dalam tajuk:** Semua aksara Unicode yang boleh dicetak dibenarkan, termasuk huruf beraksen, emoji, CJK dan simbol.
- **Disekat:** Hanya aksara kawalan Unicode (U+0000–U+001F, U+007F–U+009F) disekat; ini dialih keluar secara automatik.

Lihat [Butiran Polisi Aksara](../charset.md) untuk contoh dan nota pemindahan.
---

*Dibangunkan dengan penuh kasih sayang menggunakan VS Code/Cline, ujian meluas dan maklum balas komuniti.* 🤖💕
