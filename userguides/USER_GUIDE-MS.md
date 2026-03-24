# 📕 ST Memory Books - Pembantu Memori Sembang AI Anda

**Tukarkan perbualan sembang anda yang panjang kepada memori yang tersusun dan boleh dicari!**

Perlukan bot untuk mengingat perkara penting, tetapi sejarah sembang terlalu panjang untuk konteks? Mahu menjejaki titik plot penting secara automatik tanpa perlu mencatat nota secara manual? ST Memory Books melakukan semua itu - ia memantau sembang anda dan mencipta ringkasan pintar supaya anda tidak akan kehilangan jejak cerita anda lagi.

(Mencari perincian teknikal di sebalik tabir? Mungkin anda mahukan [Bagaimana STMB Berfungsi](howSTMBworks-ms.md).)

## 📑 Kandungan

- [Mula Pantas](#-mula-pantas-5-minit-untuk-memori-pertama-anda)
- [Apa Sebenarnya Yang ST Memory Books Lakukan](#-apa-sebenarnya-st-memory-books-lakukan)
- [Pilih Gaya Anda](#-pilih-gaya-anda)
- [Penjimatan token](#-penjimatan-token-sembunyikan--tunjukkan-mesej)
- [Ringkasan Konsolidasi](#-ringkasan-konsolidasi)
- [Penjejak, Prom Sampingan, & Templat](#-penjejak-prom-sampingan--templat-ciri-termaju)
- [Kawalan Teks Termaju dengan Sambungan Regex](#-kawalan-teks-termaju-dengan-sambungan-regex)
- [Tetapan Yang Benar-benar Penting](#-tetapan-yang-benar-benar-penting)
- [Penyelesaian Masalah](#-penyelesaian-masalah-apabila-perkara-tidak-menjadi)
- [Apa Yang ST Memory Books Tidak Lakukan](#-apa-yang-st-memory-books-tidak-lakukan)
- [Dapatkan Bantuan & Info Lanjut](#-dapatkan-bantuan--info-lanjut)

---

## 🚀 Mula Pantas (5 Minit untuk Memori Pertama Anda!)

**Baru menggunakan ST Memory Books?** Mari kita siapkan memori automatik pertama anda dengan beberapa klik sahaja:

### Langkah 1: Cari Sambungan (Extension)
- Cari ikon tongkat ajaib (🪄) di sebelah kotak input sembang anda
- Klik ikon tersebut, kemudian klik **"Memory Books"**
- Anda akan melihat panel kawalan ST Memory Books

### Langkah 2: Hidupkan Auto-Magic
- Di panel kawalan, cari **"Cipta ringkasan memori secara automatik"**
- Hidupkannya (Turn ON)
- Tetapkan **Selang Ringkasan Auto** untuk mencipta memori setiap **20-30 mesej** (titik permulaan yang baik)
- Biarkan **Penimbal Ringkasan Auto** rendah pada awalnya (`0-2` ialah julat pemula yang baik)
- Cipta satu memori manual dahulu supaya sembang diprime
- Itu sahaja! 🎉

### Langkah 3: Sembang Seperti Biasa
- Teruskan bersembang seperti biasa
- Selepas 20-30 mesej baharu, ST Memory Books akan secara automatik:
  - Menggunakan mesej baharu sejak checkpoint terakhir
  - Meminta AI anda menulis ringkasan
  - Menyimpannya ke koleksi memori anda
  - Menunjukkan pemberitahuan apabila selesai

**Tahniah!** Anda kini mempunyai pengurusan memori automatik. Tiada lagi masalah terlupa apa yang berlaku beberapa bab yang lalu!

---

## 💡 Apa Sebenarnya ST Memory Books Lakukan

Anggaplah ST Memory Books sebagai **pustakawan AI peribadi** anda untuk perbualan sembang:

### 🤖 **Ringkasan Automatik**
*"Saya tidak mahu memikirkannya, cuma pastikan ia berfungsi"*
- Memantau sembang anda di latar belakang
- Mencipta memori secara automatik setiap X mesej
- Sesuai untuk *roleplay* panjang, penulisan kreatif, atau cerita yang berterusan

### ✋ **Penciptaan Memori Manual**
*"Saya mahu kawalan ke atas apa yang disimpan"*
- Tandakan babak penting dengan butang anak panah mudah (► ◄)
- Cipta memori atas permintaan untuk saat-saat istimewa
- Bagus untuk menangkap titik plot utama atau perkembangan watak

### 📊 **Prom Sampingan & Penjejak Pintar**
*"Saya mahu menjejaki hubungan, urutan plot, atau statistik"*
- Coretan prom boleh guna semula yang meningkatkan penjanaan memori
- Pustaka templat dengan penjejak sedia ada
- Prom AI tersuai yang menjejaki apa sahaja yang anda mahu
- Kemas kini papan skor, status perhubungan, dan ringkasan plot secara automatik
- Contoh: "Siapa suka siapa?", "Status misi semasa", "Penjejak mood watak"

### 📚 **Koleksi Memori**
*Tempat semua memori anda tinggal*
- Disusun dan boleh dicari secara automatik
- Berfungsi dengan sistem *lorebook* (buku lore) bawaan SillyTavern
- AI anda boleh merujuk memori lalu dalam perbualan baharu

---

## 🎯 Pilih Gaya Anda

<details>
<summary><strong>🔄 "Tetapkan dan Lupa" (Disyorkan untuk Pemula)</strong></summary>

**Sesuai jika anda mahu:** Automasi tanpa tangan yang terus berfungsi

**Cara ia berfungsi:**
1. Hidupkan `Cipta ringkasan memori secara automatik`
2. Tetapkan `Selang Ringkasan Auto` mengikut kelajuan sembang anda
3. Secara pilihan, gunakan `Penimbal Ringkasan Auto` kecil jika anda mahu penjanaan tertunda
4. Teruskan bersembang seperti biasa selepas mencipta satu memori manual pertama

**Apa yang anda dapat:**
- Tiada kerja manual diperlukan
- Penciptaan memori yang konsisten
- Tidak pernah terlepas detik cerita penting
- Berfungsi dalam sembang tunggal dan kumpulan

**Tip pro:** Mula dengan 30 mesej, kemudian sesuaikan berdasarkan gaya sembang anda. Sembang pantas mungkin memerlukan 50+, sembang terperinci yang perlahan mungkin lebih suka 20.

</details>

<details>
<summary><strong>✋ "Kawalan Manual" (Untuk Pembuatan Memori Terpilih)</strong></summary>

**Sesuai jika anda mahu:** Memutuskan dengan tepat apa yang menjadi memori

**Cara ia berfungsi:**
1. Cari butang anak panah kecil (► ◄) pada mesej sembang anda
2. Klik ► pada mesej pertama babak penting
3. Klik ◄ pada mesej terakhir babak tersebut
4. Buka Memory Books (🪄) dan klik "Create Memory"

**Apa yang anda dapat:**
- Kawalan penuh ke atas kandungan memori
- Sesuai untuk menangkap detik tertentu
- Bagus untuk babak kompleks yang memerlukan sempadan yang teliti

**Tip pro:** Butang anak panah muncul beberapa saat selepas memuatkan sembang. Jika anda tidak melihatnya, tunggu sebentar atau muat semula halaman (refresh).

</details>

<details>
<summary><strong>⚡ "Pengguna Kuasa" (Perintah Slash)</strong></summary>

**Sesuai jika anda mahu:** Pintasan papan kekunci dan ciri termaju

**Perintah penting:**
- `/scenememory 10-25` - Cipta memori dari mesej 10 hingga 25
- `/creatememory` - Buat memori dari babak yang ditandakan sekarang
- `/nextmemory` - Ringkaskan semua perkara sejak memori terakhir
- `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - Jalankan side prompt dengan makro runtime pilihan dan julat mesej pilihan
- `/sideprompt-on "Name"` atau `/sideprompt-off "Name"` - Hidupkan atau matikan side prompt secara manual
- `/stmb-set-highest <N|none>` - Laraskan baseline auto-summary untuk sembang semasa

**Apa yang anda dapat:**
- Penciptaan memori sepantas kilat
- Operasi berkelompok (batch)
- Integrasi dengan aliran kerja tersuai

</details>

---

## 🙈 Penjimatan token: sembunyikan / tunjukkan mesej

Salah satu cara paling mudah untuk mengurangkan kekusutan dan menjimatkan token dalam sembang panjang ialah menyembunyikan mesej selepas anda menukarkannya kepada memori.

### Apa maksud “sembunyikan”?

Menyembunyikan mesej **tidak** memadam apa-apa. Mesej masih ada dalam sembang dan memori masih kekal dalam lorebook; mesej itu cuma tidak lagi dihantar terus kepada AI.

### Bilakah ini berguna?

* sembang anda sudah menjadi sangat panjang
* anda sudah membuat memori untuk mesej tersebut
* anda mahu paparan sembang lebih kemas

### Auto-hide selepas penciptaan memori

STMB boleh menyembunyikan mesej secara automatik selepas memori dicipta:

* **Jangan sembunyikan secara automatik**: tidak menyembunyikan apa-apa secara automatik
* **Sembunyikan semua mesej secara automatik sehingga memori terakhir**: menyembunyikan semua mesej yang sudah diliputi
* **Sembunyikan hanya mesej dalam memori terakhir secara automatik**: menyembunyikan hanya julat terakhir yang diproses

Anda juga boleh menetapkan berapa banyak mesej terbaharu yang kekal kelihatan dengan **Mesej untuk dibiarkan tidak tersembunyi**.

### Tunjukkan semula sebelum penjanaan memori

**Nyahsembunyikan mesej tersembunyi untuk penjanaan memori (menjalankan /unhide X-Y)** membuatkan STMB menjalankan `/unhide X-Y` secara sementara sebelum menjana memori.

### Tetapan permulaan yang disyorkan

* **Sembunyikan hanya mesej dalam memori terakhir secara automatik**
* biarkan **2** mesej kekal kelihatan
* hidupkan **Nyahsembunyikan mesej tersembunyi untuk penjanaan memori (menjalankan /unhide X-Y)**

## 🌈 Ringkasan Konsolidasi

Ringkasan konsolidasi membantu memastikan cerita panjang kekal mudah diurus dengan memampatkan memori STMB lama menjadi ringkasan peringkat lebih tinggi.

### S: Apakah itu Ringkasan Konsolidasi?

**J:** Daripada hanya mencipta memori peringkat babak selama-lamanya, STMB boleh menggabungkan memori atau ringkasan sedia ada menjadi rekap yang lebih padat. Peringkat pertama ialah **Arc**, dan peringkat rekap lebih tinggi juga tersedia untuk cerita yang lebih panjang:

* Arc
* Chapter
* Book
* Legend
* Series

### S: Mengapa menggunakannya?

**J:** Konsolidasi berguna apabila:

* senarai memori anda semakin panjang
* entri lama tidak lagi memerlukan butiran babak demi babak
* anda mahu mengurangkan penggunaan token tanpa kehilangan kesinambungan
* anda mahu rekap naratif yang lebih bersih dan lebih tinggi arasnya

### S: Adakah ia berjalan secara automatik?

**J:** Tidak. Konsolidasi masih memerlukan pengesahan.

* Anda sentiasa boleh membuka **Gabungkan Ingatan** secara manual dari popup utama
* Anda juga boleh menghidupkan **Paparkan prompt konsolidasi apabila tier sedia**
* Apabila peringkat sasaran terpilih mencapai minimum entri sumber yang layak, STMB akan memaparkan pengesahan **yes/later**
* Memilih **Yes** hanya membuka popup konsolidasi dengan peringkat itu sudah dipilih; ia tidak berjalan sendiri secara senyap

### S: Bagaimana cara menggunakannya?

**J:** Untuk mencipta ringkasan konsolidasi:

1. Klik **Gabungkan Ingatan** dalam popup utama STMB
2. Pilih peringkat ringkasan sasaran
3. Pilih entri sumber yang mahu disertakan
4. Secara pilihan, nyahaktifkan entri sumber selepas ringkasan baharu dicipta
5. Klik **Run**

Jika AI memberikan respons konsolidasi yang lemah, STMB boleh memaparkan aliran semak/baiki sebelum anda cuba menyimpan semula.

### Apa yang dikonsolidasikan, dan apa yang tidak?

Konsolidasi berfungsi pada **memori STMB dan ringkasan STMB**.

Ini bermaksud:

* memori biasa boleh dikonsolidasikan menjadi ringkasan peringkat lebih tinggi
* ringkasan peringkat lebih tinggi boleh dikonsolidasikan semula menjadi rekap yang lebih besar

Prom sampingan adalah berbeza.

**Prom sampingan ialah entri penjejak**, bukan entri ringkasan memori. Ia bertujuan memastikan maklumat berterusan sentiasa dikemas kini, seperti:

* status hubungan
* matlamat semasa
* papan skor
* keadaan dunia
* penjejak plot

Ringkasnya:

* **Memori** = "apa yang berlaku dalam babak ini?"
* **Prom Sampingan** = "apakah keadaan semasa bagi perkara ini?"
* **Konsolidasi** = "ringkaskan banyak memori menjadi rekap yang lebih besar"

---

## 🎨 Penjejak, Prom Sampingan, & Templat (Ciri Termaju)

**Prom Sampingan** (Side Prompts) adalah penjejak latar belakang yang membantu mengekalkan maklumat cerita yang sedang berjalan.
Mereka mencipta entri Side Prompt yang berasingan dalam lorebook dan berjalan seiring dengan penciptaan memori. Anggaplah mereka sebagai **pembantu yang memerhati cerita anda dan memastikan butiran tertentu sentiasa dikemas kini**.
Makro ST standard seperti `{{user}}` dan `{{char}}` dikembangkan dalam `Prompt` dan `Response Format`. Makro bukan standard `{{...}}` menjadi input wajib untuk dijalankan secara manual.

### 🚀 **Mula Pantas dengan Templat**

1. Buka tetapan Memory Books
2. Klik **Side Prompts**
3. Layari **pustaka templat** dan pilih apa yang sesuai dengan cerita anda:

   * **Character Development Tracker** – Menjejak perubahan personaliti dan pertumbuhan
   * **Relationship Dynamics** – Menjejak hubungan antara watak
   * **Plot Thread Tracker** – Menjejak jalan cerita yang sedang berlangsung
   * **Mood & Atmosphere** – Menjejak nada emosi
   * **World Building Notes** – Menjejak butiran latar tempat dan lore
4. Aktifkan templat yang anda mahu (anda boleh mengubah suainya kemudian)
5. Jika templat mengandungi makro runtime tersuai, ia tidak akan berjalan secara automatik dan mesti dimulakan secara manual dengan `/sideprompt`.

### ⚙️ **Bagaimana Prom Sampingan Berfungsi**

* **Penjejak Latar Belakang**: Mereka berjalan secara senyap dan mengemas kini maklumat dari semasa ke semasa
* **Tidak Mengganggu**: Mereka tidak mengubah tetapan AI utama atau prom watak anda
* **Kawalan Setiap Sembang**: Sembang yang berbeza boleh menggunakan penjejak yang berbeza
* **Berasaskan Templat**: Gunakan templat terbina dalam atau cipta sendiri
* **Automatik atau Manual**: Templat standard boleh berjalan secara automatik; templat dengan makro runtime tersuai hanya boleh dijalankan secara manual.
* **Sokongan Makro**: `Prompt` dan `Response Format` mengembangkan makro ST standard seperti `{{user}}` dan `{{char}}`.
* **Pemeriksaan Keselamatan**: Jika templat mengandungi makro runtime tersuai, STMB membuang `onInterval` dan `onAfterMemory` semasa simpan/import dan memaparkan amaran.

Ini menjadikan tingkah laku pencetus mudah difahami tanpa istilah teknikal.

### 🛠️ **Mengurus Prom Sampingan**

* **Side Prompts Manager**: Cipta, sunting, duplikasi, dan susun penjejak
* **Enable / Disable**: Hidupkan atau matikan penjejak pada bila-bila masa
* **Import / Export**: Kongsi templat atau buat sandaran
* **Status View**: Lihat penjejak mana yang aktif dalam sembang semasa

"Status View" lebih jelas daripada "Live Preview" untuk pembaca.

### 💡 **Contoh Templat**

* Pustaka Templat Prom Sampingan (import JSON ini):
  [SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Contoh idea prom:

* "Jejak dialog penting dan interaksi watak"
* "Pastikan status misi semasa sentiasa dikemas kini"
* "Catat butiran pembinaan dunia baharu apabila ia muncul"
* "Jejak hubungan antara Watak A dan Watak B"

### 🔧 **Mencipta Prom Sampingan Tersuai**

1. Buka Pengurus Prom Sampingan (Side Prompts Manager)
2. Klik **Create New**
3. Tulis arahan ringkas dan jelas
   *(contoh: "Sentiasa catat bagaimana keadaan cuaca dalam setiap babak")*
4. Tambahkan jika perlu makro ST standard atau makro runtime dalam format `{{macro}}="value"`.
5. Simpan dan aktifkannya
6. Penjejak kini akan mengemas kini maklumat ini dari semasa ke semasa jika pencetus automatik kekal diaktifkan

### 💬 **Tip Pro**

Prom Sampingan berfungsi paling baik apabila ia **kecil dan fokus**.
Daripada "jejak segalanya," cuba "jejak ketegangan romantik antara watak utama."

---

### 🧠 Kawalan Teks Termaju dengan Sambungan Regex

ST Memory Books boleh menjalankan skrip Regex terpilih sebelum penjanaan dan sebelum penyimpanan.

* Hidupkan **Gunakan regex (lanjutan)** dalam STMB
* Klik **📐 Konfigurasi regex…**
* Pilih secara berasingan skrip yang perlu berjalan sebelum menghantar teks kepada AI dan sebelum menyimpan
* Pilihan dalam STMB tetap berkuat kuasa walaupun skrip itu dimatikan dalam sambungan Regex

---

## ⚙️ Tetapan Yang Sebenarnya Penting

Untuk rujukan penuh, lihat [readme.md](readme.md).

Kawalan asas yang paling penting:

* **Tetapan SillyTavern Semasa** menggunakan sambungan ST aktif anda secara langsung
* **Cipta ringkasan memori secara automatik** menghidupkan penciptaan memori automatik
* **Selang Ringkasan Auto** dan **Penimbal Ringkasan Auto** mengawal bila proses automatik berjalan
* **Auto-hide/unhide memories** membantu penjimatan token
* **Dayakan Mod Buku Legenda Manual** dan **Cipta buku legenda secara automatik jika tiada** menentukan tempat memori disimpan
* **Paparkan prompt konsolidasi apabila tier sedia** hanya memaparkan pengesahan konsolidasi

---

## 🔧 Penyelesaian Masalah (Apabila Perkara Tidak Menjadi)

Untuk senarai penuh, lihat [readme.md](readme.md).

Semakan pantas:

* Pastikan STMB diaktifkan dan menu **Memory Books** muncul dalam menu sambungan
* Jika auto-summary tidak berjalan, pastikan anda mencipta satu memori manual terlebih dahulu dan tetapan interval/buffer munasabah
* Jika memori tidak boleh disimpan, pastikan lorebook diikat pada sembang atau **Cipta buku legenda secara automatik jika tiada** dihidupkan
* Jika tingkah laku Regex kelihatan salah, semak pilihan dalam **📐 Konfigurasi regex…**
* Jika konsolidasi tidak muncul, semak peringkat sasaran dan pilihan pengesahan konsolidasi

---

## 🚫 Apa Yang ST Memory Books Tidak Lakukan

- **Bukan penyunting lorebook umum:** Panduan ini memfokuskan pada entri yang dicipta oleh STMB. Untuk penyuntingan lorebook umum, gunakan penyunting lorebook bawaan SillyTavern.

---

## 💡 Dapatkan Bantuan & Info Lanjut

- **Info lebih terperinci:** [readme.md](readme.md)
- **Kemas kini terkini:** [changelog.md](changelog.md)
- **Tukar lorebook lama:** [lorebookconverter.html](../resources/lorebookconverter.html)
- **Sokongan komuniti:** Sertai komuniti SillyTavern di Discord! (Cari thread 📕ST Memory Books atau DM @tokyoapple untuk bantuan terus.)
- **Pepijat/ciri:** Menui pepijat atau ada idea hebat? Buka isu GitHub di repositori ini.

---

### 📚 Kuasakan dengan Penyusunan Lorebook (STLO)

Untuk organisasi memori termaju dan integrasi cerita yang lebih mendalam, kami sangat mengesyorkan penggunaan STMB bersama [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk amalan terbaik, arahan persediaan, dan tip!
