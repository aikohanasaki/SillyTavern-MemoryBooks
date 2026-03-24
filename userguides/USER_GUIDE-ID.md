# 📕 ST Memory Books - Asisten Memori Obrolan AI Anda

**Ubah percakapan obrolan tanpa akhir Anda menjadi memori yang terorganisir dan dapat dicari!**

Butuh bot untuk mengingat banyak hal, tetapi obrolannya terlalu panjang untuk konteks? Ingin melacak poin plot penting secara otomatis tanpa mencatat secara manual? ST Memory Books melakukan hal itu—ekstensi ini memantau obrolan Anda dan membuat ringkasan cerdas sehingga Anda tidak akan pernah kehilangan jejak cerita Anda lagi.

(Mencari detail teknis di balik layar? Mungkin Anda menginginkan [Cara Kerja STMB](howSTMBworks-id.md).)

## 📑 Daftar Isi

- [Mulai Cepat](#-mulai-cepat-5-menit-menuju-memori-pertama-anda)
- [Apa yang Sebenarnya Dilakukan ST Memory Books](#-apa-yang-sebenarnya-dilakukan-st-memory-books)
- [Pilih Gaya Anda](#-pilih-gaya-anda)
- [Penghematan token](#-penghematan-token-sembunyikan--tampilkan-pesan)
- [Ringkasan Konsolidasi](#-ringkasan-konsolidasi)
- [Pelacak, Side Prompts, & Templat](#-pelacak-side-prompts--templat-fitur-lanjutan)
- [Kontrol Teks Lanjutan dengan Ekstensi Regex](#-kontrol-teks-lanjutan-dengan-ekstensi-regex)
- [Pengaturan yang Benar-benar Penting](#-pengaturan-yang-benar-benar-penting)
- [Pemecahan Masalah](#-pemecahan-masalah-saat-ada-masalah)
- [Apa yang Tidak Dilakukan ST Memory Books](#-apa-yang-tidak-dilakukan-st-memory-books)
- [Mendapatkan Bantuan & Info Lanjut](#-mendapatkan-bantuan--info-lanjut)

---

## 🚀 Mulai Cepat (5 Menit Menuju Memori Pertama Anda!)

**Baru menggunakan ST Memory Books?** Mari kita siapkan memori otomatis pertama Anda hanya dalam beberapa klik:

### Langkah 1: Temukan Ekstensinya

* Cari ikon tongkat ajaib (🪄) di sebelah kotak input obrolan Anda.
* Klik ikon tersebut, lalu klik **"Memory Books"**.
* Anda akan melihat panel kontrol ST Memory Books.

### Langkah 2: Aktifkan "Auto-Magic"

* Di panel kontrol, cari **"Buat ringkasan memori secara otomatis"**.
* Ubah menjadi **ON** (Hidup).
* Atur **Interval Ringkasan Otomatis** ke **20-30 pesan** (titik awal yang baik).
* Biarkan **Penyangga Ringkasan Otomatis** rendah pada awalnya (`0-2` adalah rentang pemula yang bagus).
* Buat satu memori manual terlebih dahulu agar chat diprime.
* Selesai! 🎉

### Langkah 3: Mengobrol Seperti Biasa

* Terus mengobrol seperti biasa.
* Setelah 20-30 pesan baru, ST Memory Books akan secara otomatis:
  - Menggunakan pesan baru sejak checkpoint terakhir.
* Meminta AI Anda untuk menulis ringkasan.
* Menyimpannya ke koleksi memori Anda.
* Menampilkan notifikasi saat selesai.



**Selamat!** Anda sekarang memiliki manajemen memori otomatis. Tidak ada lagi lupa apa yang terjadi beberapa bab yang lalu!

---

## 💡 Apa yang Sebenarnya Dilakukan ST Memory Books

Anggaplah ST Memory Books sebagai **pustakawan AI pribadi** Anda untuk percakapan obrolan:

### 🤖 **Ringkasan Otomatis (Automatic Summaries)**

*"Saya tidak ingin memikirkannya, buat saja ini bekerja"*

* Memantau obrolan Anda di latar belakang.
* Secara otomatis membuat memori setiap X pesan.
* Sempurna untuk roleplay panjang, penulisan kreatif, atau cerita yang berkelanjutan.

### ✋ **Pembuatan Memori Manual**

*"Saya ingin kendali atas apa yang disimpan"*

* Tandai adegan penting dengan tombol panah sederhana (► ◄).
* Buat memori sesuai permintaan untuk momen-momen spesial.
* Bagus untuk menangkap poin plot utama atau perkembangan karakter.

### 📊 **Side Prompts & Pelacak Cerdas**

*"Saya ingin melacak hubungan, alur plot, atau statistik"*

* Cuplikan prompt yang dapat digunakan kembali untuk meningkatkan pembuatan memori.
* Pustaka templat dengan pelacak siap pakai.
* Prompt AI khusus yang melacak apa pun yang Anda inginkan.
* Secara otomatis memperbarui papan skor, status hubungan, ringkasan plot.
* Contoh: "Siapa menyukai siapa?", "Status quest saat ini", "Pelacak suasana hati karakter".

### 📚 **Koleksi Memori (Memory Collections)**

*Tempat semua memori Anda tinggal*

* Terorganisir secara otomatis dan dapat dicari.
* Bekerja dengan sistem lorebook bawaan SillyTavern.
* AI Anda dapat merujuk memori masa lalu dalam percakapan baru.

---

## 🎯 Pilih Gaya Anda

<details>
<summary><strong>🔄 "Atur dan Lupakan" (Direkomendasikan untuk Pemula)</strong></summary>

**Sempurna jika Anda menginginkan:** Otomatisasi lepas tangan yang langsung bekerja.

**Cara kerjanya:**

1. Aktifkan `Buat ringkasan memori secara otomatis`.
2. Atur `Interval Ringkasan Otomatis` sesuai kecepatan chat Anda.
3. Opsional, gunakan `Penyangga Ringkasan Otomatis` kecil jika Anda ingin generasi tertunda.
4. Lanjutkan mengobrol secara normal setelah membuat satu memori manual pertama.

**Apa yang Anda dapatkan:**

* Tidak ada pekerjaan manual yang diperlukan.
* Pembuatan memori yang konsisten.
* Tidak pernah melewatkan momen cerita penting.
* Bekerja baik dalam obrolan tunggal maupun grup.

**Tips Pro:** Mulailah dengan 30 pesan, lalu sesuaikan berdasarkan gaya obrolan Anda. Obrolan cepat mungkin membutuhkan 50+, obrolan mendetail yang lambat mungkin lebih suka 20.

</details>

<details>
<summary><strong>✋ "Kontrol Manual" (Untuk Pembuatan Memori Selektif)</strong></summary>

**Sempurna jika Anda menginginkan:** Memutuskan dengan tepat apa yang menjadi memori.

**Cara kerjanya:**

1. Cari tombol panah kecil (► ◄) pada pesan obrolan Anda.
2. Klik ► pada pesan pertama dari adegan penting.
3. Klik ◄ pada pesan terakhir dari adegan itu.
4. Buka Memory Books (🪄) dan klik "Create Memory".

**Apa yang Anda dapatkan:**

* Kendali penuh atas konten memori.
* Sempurna untuk menangkap momen tertentu.
* Bagus untuk adegan kompleks yang membutuhkan batasan yang cermat.

**Tips Pro:** Tombol panah muncul beberapa detik setelah memuat obrolan. Jika Anda tidak melihatnya, tunggu sebentar atau refresh halaman.

</details>

<details>
<summary><strong>⚡ "Pengguna Mahir" (Perintah Slash)</strong></summary>

**Sempurna jika Anda menginginkan:** Pintasan keyboard dan fitur lanjutan.

**Perintah penting:**

* `/scenememory 10-25` - Buat memori dari pesan 10 hingga 25.
* `/creatememory` - Buat memori dari adegan yang saat ini ditandai.
* `/nextmemory` - Ringkas semuanya sejak memori terakhir.
* `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - Jalankan side prompt, dengan makro runtime opsional dan rentang pesan opsional.
* `/sideprompt-on "Name"` atau `/sideprompt-off "Name"` - Mengaktifkan atau menonaktifkan side prompt secara manual.
* `/stmb-set-highest <N|none>` - Menyesuaikan baseline auto-summary untuk chat saat ini.

**Apa yang Anda dapatkan:**

* Pembuatan memori secepat kilat.
* Operasi batch (kelompok).
* Integrasi dengan alur kerja kustom.

</details>

---

## 🙈 Penghematan token: sembunyikan / tampilkan pesan

Salah satu cara termudah untuk mengurangi kekacauan dan menghemat token di chat panjang adalah menyembunyikan pesan setelah Anda sudah mengubahnya menjadi memori.

### Apa arti “sembunyikan”?

Menyembunyikan pesan **tidak** menghapus apa pun. Pesan tetap ada di chat dan memori tetap ada di lorebook; pesan itu hanya tidak lagi dikirim langsung ke AI.

### Kapan ini berguna?

* chat Anda sudah menjadi sangat panjang
* Anda sudah membuat memori dari pesan-pesan itu
* Anda ingin tampilan chat lebih rapi

### Auto-hide setelah pembuatan memori

STMB dapat otomatis menyembunyikan pesan setelah memori dibuat:

* **Jangan sembunyikan secara otomatis**: tidak menyembunyikan apa pun secara otomatis
* **Sembunyikan semua pesan secara otomatis hingga memori terakhir**: menyembunyikan semua yang sudah tercakup
* **Sembunyikan hanya pesan di memori terakhir secara otomatis**: menyembunyikan hanya rentang terakhir yang diproses

Anda juga bisa menentukan berapa banyak pesan terbaru yang tetap terlihat dengan **Pesan untuk dibiarkan tidak tersembunyi**.

### Tampilkan lagi sebelum pembuatan memori

**Tampilkan kembali pesan tersembunyi untuk pembuatan memori (menjalankan /unhide X-Y)** membuat STMB sementara menjalankan `/unhide X-Y` sebelum membuat memori.

### Pengaturan awal yang disarankan

* **Sembunyikan hanya pesan di memori terakhir secara otomatis**
* biarkan **2** pesan tetap terlihat
* aktifkan **Tampilkan kembali pesan tersembunyi untuk pembuatan memori (menjalankan /unhide X-Y)**

## 🌈 Ringkasan Konsolidasi

Ringkasan konsolidasi membantu menjaga cerita panjang tetap terkelola dengan memadatkan memori STMB yang lama menjadi ringkasan tingkat lebih tinggi.

### T: Apa itu Ringkasan Konsolidasi?

**J:** Alih-alih hanya membuat memori tingkat adegan terus-menerus, STMB dapat menggabungkan memori atau ringkasan yang sudah ada menjadi rekap yang lebih ringkas. Tier pertama adalah **Arc**, dan tier rekap yang lebih tinggi juga tersedia untuk cerita yang lebih panjang:

* Arc
* Chapter
* Book
* Legend
* Series

### T: Mengapa menggunakannya?

**J:** Konsolidasi berguna ketika:

* Daftar memori Anda menjadi panjang
* Entri lama tidak lagi memerlukan detail adegan demi adegan
* Anda ingin mengurangi penggunaan token tanpa kehilangan kesinambungan
* Anda ingin rekap naratif yang lebih bersih dan lebih tinggi tingkatnya

### T: Apakah ini berjalan otomatis?

**J:** Tidak. Konsolidasi tetap memerlukan konfirmasi.

* Anda selalu bisa membuka **Gabungkan Ingatan** secara manual dari popup utama
* Anda juga bisa mengaktifkan **Tampilkan prompt konsolidasi saat tier siap**
* Saat tier target yang dipilih mencapai minimum entri sumber yang memenuhi syarat, STMB menampilkan konfirmasi **yes/later**
* Memilih **Yes** membuka popup konsolidasi dengan tier itu sudah dipilih; ini tidak berjalan sendiri secara diam-diam

### T: Bagaimana cara menggunakannya?

**J:** Untuk membuat ringkasan konsolidasi:

1. Klik **Gabungkan Ingatan** di popup utama STMB
2. Pilih tier ringkasan tujuan
3. Pilih entri sumber yang ingin disertakan
4. Opsional, nonaktifkan entri sumber setelah ringkasan baru dibuat
5. Klik **Run**

Jika AI memberikan respons konsolidasi yang buruk, STMB dapat menampilkan alur perbaikan/tinjau sebelum Anda mencoba menyimpan lagi.

### Apa yang dikonsolidasi, dan apa yang tidak?

Konsolidasi bekerja pada **memori STMB dan ringkasan STMB**.

Artinya:

* memori biasa dapat dikonsolidasi menjadi ringkasan tingkat lebih tinggi
* ringkasan tingkat lebih tinggi kemudian dapat dikonsolidasi lagi menjadi rekap yang lebih besar

Side prompt berbeda.

**Side prompt adalah entri pelacak**, bukan entri ringkasan memori. Side prompt dimaksudkan untuk menjaga informasi berkelanjutan tetap mutakhir, seperti:

* status hubungan
* tujuan saat ini
* papan skor
* keadaan dunia
* pelacak alur cerita

Dengan kata lain:

* **Memori** = "apa yang terjadi di adegan ini?"
* **Side Prompt** = "apa keadaan saat ini dari hal ini?"
* **Konsolidasi** = "ringkas banyak memori menjadi rekap yang lebih besar"

### Mengapa ini penting?

Ini penting karena pengguna kadang mengira entri pelacak akan ikut naik ke ringkasan Arc atau Chapter.

Itu **tidak** terjadi.

Jika Anda ingin sesuatu menjadi bagian dari Konsolidasi, item itu harus ada sebagai entri memori/ringkasan STMB biasa, bukan hanya sebagai side prompt.

### Aturan praktis

Gunakan:

* **Memori** untuk rekap adegan
* **Side Prompt** untuk pelacak yang terus berjalan
* **Konsolidasi** untuk memadatkan memori lama menjadi rekap yang lebih besar

---

## 🎨 Pelacak, Side Prompts, & Templat (Fitur Lanjutan)

**Side Prompts** adalah pelacak latar belakang yang membantu memelihara informasi cerita yang sedang berlangsung.
Mereka mencipta entri Side Prompt yang berasingan di lorebook dan berjalan bersamaan dengan pembuatan memori. Anggap saja sebagai **asisten yang mengawasi cerita Anda dan menjaga detail tertentu tetap mutakhir**.
Makro ST standard seperti `{{user}}` dan `{{char}}` dikembangkan di `Prompt` dan `Response Format`. Makro bukan standard `{{...}}` menjadi input wajib untuk dijalankan secara manual.

### 🚀 **Mulai Cepat dengan Templat**

1. Buka pengaturan Memory Books.
2. Klik **Side Prompts**.
3. Jelajahi **pustaka templat** dan pilih yang sesuai dengan cerita Anda:
* **Character Development Tracker** – Melacak perubahan kepribadian dan pertumbuhan.
* **Relationship Dynamics** – Melacak hubungan antar karakter.
* **Plot Thread Tracker** – Melacak alur cerita yang sedang berlangsung.
* **Mood & Atmosphere** – Melacak nada emosional.
* **World Building Notes** – Melacak detail latar dan pengetahuan dunia (lore).


4. Aktifkan templat yang Anda inginkan (Anda dapat menyesuaikannya nanti).
5. Jika templat mengandungi makro runtime tersuai, ia tidak akan berjalan secara automatik dan mesti dimulakan secara manual dengan `/sideprompt`.

### ⚙️ **Cara Kerja Side Prompts**

* **Pelacak Latar Belakang**: Mereka berjalan dengan tenang dan memperbarui informasi dari waktu ke waktu.
* **Tidak Mengganggu**: Mereka tidak mengubah pengaturan AI utama atau prompt karakter Anda.
* **Kontrol Per-Obrolan**: Obrolan yang berbeda dapat menggunakan pelacak yang berbeda.
* **Berbasis Templat**: Gunakan templat bawaan atau buat sendiri.
* **Otomatis atau Manual**: Templat standard boleh berjalan secara automatik; templat dengan makro runtime tersuai hanya boleh dijalankan secara manual.
* **Sokongan Makro**: `Prompt` dan `Response Format` mengembangkan makro ST standard seperti `{{user}}` dan `{{char}}`.
* **Pemeriksaan Keselamatan**: Jika templat mengandungi makro runtime tersuai, STMB membuang `onInterval` dan `onAfterMemory` semasa simpan/import dan memaparkan amaran.

Ini membuat perilaku pemicu dapat dimengerti tanpa istilah teknis.

### 🛠️ **Mengelola Side Prompts**

* **Side Prompts Manager**: Buat, edit, duplikasi, dan atur pelacak.
* **Enable / Disable**: Aktifkan atau nonaktifkan pelacak kapan saja.
* **Import / Export**: Bagikan templat atau cadangkan.
* **Status View**: Lihat pelacak mana yang aktif dalam obrolan saat ini.

"Status View" lebih jelas daripada "Live Preview" untuk pembaca non-penutur asli bahasa Inggris.

### 💡 **Contoh Templat**

* Pustaka Templat Side Prompt (impor JSON ini):
[SidePromptTemplateLibrary.json](../resources/SidePromptTemplateLibrary.json)

Ide prompt contoh:

* "Lacak dialog penting dan interaksi karakter"
* "Jaga status quest saat ini tetap mutakhir"
* "Catat detail pembangunan dunia (world-building) baru saat muncul"
* "Lacak hubungan antara Karakter A dan Karakter B"

### 🔧 **Membuat Side Prompts Kustom**

1. Buka Side Prompts Manager.
2. Klik **Create New**.
3. Tulis instruksi yang singkat dan jelas
*(contoh: "Selalu catat bagaimana cuaca di setiap adegan")*
4. Tambahkan jika perlu makro ST standard atau makro runtime dalam format `{{macro}}="value"`.
5. Simpan dan aktifkan.
6. Pelacak sekarang akan memperbarui informasi ini dari waktu ke waktu jika pencetus automatik kekal diaktifkan.

### 💬 **Tips Pro**

Side Prompts bekerja paling baik jika **kecil dan terfokus**.
Daripada "lacak segalanya," cobalah "lacak ketegangan romantis antara karakter utama."

---

### 🧠 Kontrol Teks Lanjutan dengan Ekstensi Regex

ST Memory Books dapat menjalankan skrip Regex yang dipilih sebelum generasi dan sebelum penyimpanan.

* Aktifkan **Gunakan ekspresi reguler (lanjutan)** di STMB
* Klik **📐 Konfigurasi ekspresi reguler…**
* Pilih secara terpisah skrip mana yang harus berjalan sebelum mengirim teks ke AI dan sebelum menyimpan
* Pilihan di dalam STMB tetap berlaku meskipun skrip itu dinonaktifkan di ekstensi Regex

---

## ⚙️ Pengaturan yang Benar-benar Penting

Untuk referensi lengkap, lihat [readme.md](readme.md).

Kontrol dasar yang paling penting:

* **Pengaturan SillyTavern Saat Ini** memakai koneksi ST aktif Anda secara langsung
* **Buat ringkasan memori secara otomatis** menyalakan pembuatan memori otomatis
* **Interval Ringkasan Otomatis** dan **Penyangga Ringkasan Otomatis** mengatur kapan proses otomatis berjalan
* **Auto-hide/unhide memories** membantu penghematan token
* **Aktifkan Mode Buku Latar Manual** dan **Buat buku latar secara otomatis jika tidak ada** mengatur tempat penyimpanan memori
* **Tampilkan prompt konsolidasi saat tier siap** hanya menampilkan konfirmasi konsolidasi

---

## 🔧 Pemecahan Masalah (Saat Ada Masalah)

Untuk daftar lengkap, lihat [readme.md](readme.md).

Pemeriksaan cepat:

* Pastikan STMB aktif dan menu **Memory Books** muncul di menu ekstensi
* Jika auto-summary tidak berjalan, pastikan Anda membuat satu memori manual terlebih dahulu dan interval/buffer masuk akal
* Jika memori tidak bisa disimpan, pastikan lorebook terikat ke chat atau **Buat buku latar secara otomatis jika tidak ada** aktif
* Jika perilaku Regex terasa salah, periksa pilihan di **📐 Konfigurasi ekspresi reguler…**
* Jika konsolidasi tidak muncul, periksa tier target dan opsi konfirmasi konsolidasi

---

## 🚫 Apa yang Tidak Dilakukan ST Memory Books

* **Bukan editor lorebook umum:** Panduan ini berfokus pada entri yang dibuat oleh STMB. Untuk pengeditan lorebook umum, gunakan editor lorebook bawaan SillyTavern.

---

## 💡 Bantuan & Info Lebih Lanjut

* **Info lebih mendetail:** [readme.md](readme.md)
* **Pembaruan terbaru:** [changelog.md](changelog.md)
* **Konversi lorebook lama:** [lorebookconverter.html](../resources/lorebookconverter.html)
* **Dukungan komunitas:** Bergabunglah dengan komunitas SillyTavern di Discord! (Cari thread 📕ST Memory Books atau DM @tokyoapple untuk bantuan langsung.)
* **Bug/fitur:** Menemukan bug atau punya ide bagus? Buka GitHub issue di repositori ini.

---

### 📚 Tingkatkan Kekuatan dengan Pengurutan Lorebook (STLO)

Untuk organisasi memori tingkat lanjut dan integrasi cerita yang lebih dalam, kami sangat menyarankan penggunaan STMB bersama dengan [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). Lihat panduan untuk praktik terbaik, instruksi pengaturan, dan tips!
