# Cara Kerja SillyTavern Memory Books (STMB)

Ini adalah penjelasan tingkat tinggi tentang cara kerja STMB. Dokumen ini tidak dimaksudkan untuk menjelaskan kodenya. Sebaliknya, dokumen ini menjelaskan informasi apa yang STMB rangkai, dalam urutan apa informasi itu dikirim, dan seperti apa hasil yang diharapkan dari model.

Gunakan dokumen ini untuk membantu Anda menulis atau mengedit prompt untuk STMB.

## 3 Alur Prompt Utama di STMB

STMB memiliki tiga alur utama:

1. Pembuatan memori
2. Prompt sampingan
3. Konsolidasi

Ketiganya saling terkait, tetapi tidak mengharapkan jenis keluaran yang sama.

- Pembuatan memori mengharapkan JSON yang ketat.
- Prompt sampingan biasanya mengharapkan teks biasa yang rapi (boleh memakai Markdown atau format entri lorebook lain, JANGAN gunakan JSON di prompt sampingan).
- Konsolidasi mengharapkan JSON yang ketat juga, tetapi dengan skema yang berbeda dari memori.

## I. Pembuatan Memori

Saat Anda membuat memori, STMB mengirim satu prompt rakitan yang biasanya berisi bagian-bagian ini dalam urutan berikut:

1. Teks prompt memori atau teks preset yang dipilih
   - Ini adalah blok instruksi dari Manajer Prompt Ringkasan.
   - Bagian ini memberi tahu model jenis ringkasan apa yang harus ditulis dan bentuk JSON apa yang harus dikembalikan.
   - Makro seperti `{{user}}` dan `{{char}}` diselesaikan sebelum dikirim.

2. Konteks opsional dari memori sebelumnya
   - Jika proses dijalankan dengan pengaturan untuk menyertakan memori sebelumnya, memori-memori itu dimasukkan sebagai konteks baca-saja.
   - Konteks itu ditandai dengan jelas sebagai konteks, bukan sebagai hal yang harus diringkas lagi.

3. Transkrip adegan saat ini
   - Rentang chat yang dipilih diformat baris demi baris sebagai `Speaker: message`.
   - Inilah adegan sebenarnya yang harus diubah model menjadi memori.

Bentuk kasarnya seperti ini:

```text
[instruksi prompt / preset memori]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[nol atau lebih memori sebelumnya]
=== END PREVIOUS SCENE CONTEXT - PROCESS ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### Apa yang Harus Dikembalikan Model

Yang diharapkan adalah satu objek JSON:

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Praktik terbaik:

- Kembalikan hanya objek JSON itu saja.
- Gunakan kunci yang persis sama: `title`, `content`, dan `keywords`.
- Pastikan `keywords` benar-benar berupa array JSON berisi string.
- Jaga agar judul tetap pendek dan mudah dibaca.
- Buat kata kunci konkret dan mudah dipakai untuk pengambilan ulang: tempat, objek, nama khusus, tindakan khas, dan pengenal.

STMB kadang bisa menyelamatkan keluaran yang sedikit berantakan, tetapi prompt tidak seharusnya bergantung pada itu.

### Apa yang Membuat Prompt Memori Menjadi Baik

Prompt memori yang baik menjelaskan empat hal dengan jelas:

1. Memberi tahu model jenis memori apa yang harus ditulis
   - Catatan adegan yang rinci
   - Sinopsis yang ringkas
   - Rekap minimal
   - Memori naratif bergaya sastra

2. Memberi tahu model apa yang penting
   - alur cerita utama
   - keputusan
   - perubahan karakter
   - pengungkapan
   - hasil
   - detail yang penting untuk kontinuitas

3. Memberi tahu model apa yang harus diabaikan
   - biasanya OOC
   - filler
   - obrolan yang hanya bersifat suasana, jika Anda ingin memori yang lebih padat

4. Memberi tahu model secara tepat JSON apa yang harus dikembalikan

### Apa yang Membuat Prompt Memori Menjadi Lemah

Prompt yang lemah biasanya gagal dengan salah satu cara berikut:

- Menjelaskan gaya penulisan, tetapi tidak menjelaskan bentuk JSON.
- Meminta "analisis yang membantu" atau "pikiran" alih-alih objek memori final.
- Mendorong kata kunci yang abstrak alih-alih istilah konkret untuk pengambilan ulang.
- Tidak membedakan konteks sebelumnya dengan adegan saat ini.
- Meminta terlalu banyak format keluaran sekaligus.

### Saran Praktis untuk Menulis Prompt Memori

- Jelaskan dengan tegas apakah ringkasan harus sangat lengkap atau hemat token.
- Jika Anda ingin Markdown di dalam `content`, katakan secara langsung.
- Jika Anda ingin memori yang pendek, batasi isi teksnya, bukan skema JSON-nya.
- Jika Anda ingin pengambilan ulang yang kuat, gunakan ruang prompt untuk kualitas kata kunci, bukan hanya gaya ringkasannya.
- Perlakukan memori sebelumnya sebagai konteks kontinuitas, bukan sebagai bahan yang harus ditulis ulang.

## II. Prompt Sampingan

Prompt sampingan BUKAN memori. Prompt sampingan adalah prompt pelacak atau prompt pembaruan yang biasanya menulis atau menimpa entri lorebook terpisah. Ini konsep yang sangat berbeda dari memori, dan hal itu sangat penting untuk diingat.

Saat prompt sampingan berjalan, STMB biasanya merangkai bagian-bagian ini dalam urutan berikut:

1. Teks instruksi utama prompt sampingan
   - Inilah prompt tugas sebenarnya untuk pelacak tersebut.
   - Makro standar ST seperti `{{user}}` dan `{{char}}` diselesaikan.
   - Makro runtime kustom juga bisa dimasukkan untuk proses manual.

2. Entri sebelumnya yang bersifat opsional
   - Jika prompt sampingan itu sudah memiliki isi tersimpan, STMB bisa memasukkan versi saat ini terlebih dahulu.
   - Ini membuat model dapat memperbarui pelacak yang sudah ada, alih-alih menulis ulang dari nol setiap saat.

3. Konteks opsional dari memori sebelumnya
   - Jika templat meminta memori sebelumnya, STMB memasukkannya sebagai konteks baca-saja.

4. Teks adegan yang sudah dikompilasi
   - Inilah materi adegan saat ini yang harus ditanggapi oleh pelacak.

5. Panduan format respons yang opsional
   - Ini tidak dipaksakan sebagai skema parser.
   - Ini hanya instruksi tambahan tentang format keluaran yang Anda inginkan.

Bentuk kasarnya seperti ini:

```text
[instruksi prompt sampingan]

=== PRIOR ENTRY ===
[teks pelacak saat ini, jika ada]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[memori sebelumnya yang opsional]
=== END PREVIOUS SCENE CONTEXT ===

=== SCENE TEXT ===
[teks adegan yang sudah dikompilasi]

=== RESPONSE FORMAT ===
[panduan format yang opsional]
```

### Apa yang Harus Dikembalikan Model

STMB mengharapkan teks biasa yang siap disimpan.

Inilah perbedaan utamanya dibanding memori:

- Prompt sampingan tidak menginginkan JSON.
- STMB biasanya menyimpan teks yang dikembalikan apa adanya.
- Jika Anda meminta JSON di dalam prompt sampingan, JSON itu hanya akan menjadi teks kecuali alur kerja Anda sendiri memang bergantung padanya.

Artinya, prompt sampingan harus diarahkan untuk menghasilkan keluaran akhir yang langsung berguna, bukan JSON yang ramah parser memori.

### Apa yang Membuat Prompt Sampingan Menjadi Baik

Prompt sampingan yang baik bersifat sempit, stabil, dan mudah diperbarui.

Contoh:

- Menjaga daftar karakter berdasarkan urutan kepentingan
- Melacak status hubungan saat ini
- Melacak alur plot yang belum selesai
- Melacak apa yang saat ini diyakini `{{char}}` tentang `{{user}}`

Perumusan prompt sampingan yang baik biasanya melakukan hal-hal ini:

1. Menentukan tugas dengan jelas
   - "Pertahankan pelacak pemeran"
   - "Perbarui lembar hubungan saat ini"
   - "Pertahankan laporan alur yang belum selesai"

2. Menjelaskan apakah hasil harus memperbarui, mengganti, atau menambahkan
   - Ini penting karena teks entri sebelumnya bisa ikut dimasukkan.

3. Menentukan tata letak keluarannya
   - heading
   - struktur butir
   - bagian
   - aturan urutan

4. Menjelaskan apa yang tidak boleh dimasukkan
   - spekulasi
   - item duplikat
   - informasi usang
   - narasi tentang tugas itu sendiri

### Apa yang Membuat Prompt Sampingan Menjadi Lemah

- Terlalu luas: "lacak semuanya".
- Tidak pernah menjelaskan apakah entri lama harus direvisi atau ditulis ulang.
- Meminta chain-of-thought atau penjelasan alih-alih teks pelacak final.
- Membiarkan format terlalu kabur, sehingga pelacak berubah-ubah seiring waktu.

### Saran Praktis untuk Menulis Prompt Sampingan

- Tulis prompt sampingan seperti instruksi pemeliharaan, bukan prompt ringkasan.
- Anggap model mungkin melihat pelacak saat ini terlebih dahulu, lalu adegan yang baru.
- Pastikan setiap pelacak fokus pada satu tugas saja.
- Gunakan bidang Format Respons untuk mengatur tata letak, nama bagian, dan urutan.

## III. Konsolidasi

Konsolidasi menggabungkan entri tingkat bawah menjadi ringkasan tingkat yang lebih tinggi.

Contoh:

- memori menjadi ringkasan Arc
- ringkasan Arc menjadi ringkasan Chapter
- ringkasan Chapter menjadi ringkasan Book

Saat konsolidasi berjalan, STMB biasanya merangkai bagian-bagian ini dalam urutan berikut:

1. Teks prompt konsolidasi atau preset yang dipilih
   - Bagian ini menjelaskan bagaimana model harus memadatkan entri sumber.
   - Bagian ini juga mendefinisikan skema JSON yang harus dikembalikan model.

2. Ringkasan tingkat lebih tinggi sebelumnya yang bersifat opsional
   - Jika ringkasan sebelumnya pada tier itu sedang dibawa maju, ringkasan itu dimasukkan terlebih dahulu sebagai konteks kanonis.
   - Prompt memberi tahu model agar tidak menulis ulang bagian itu.

3. Entri tingkat bawah yang dipilih dalam urutan kronologis
   - Setiap item sumber disertakan dengan pengenal, judul, dan isi.
   - Inilah materi yang seharusnya dikelompokkan, dipadatkan, dan diubah model menjadi ringkasan tingkat lebih tinggi.

Bentuk kasarnya seperti ini:

```text
[instruksi prompt / preset konsolidasi]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[ringkasan tingkat lebih tinggi sebelumnya yang opsional]
=== END PREVIOUS ... ===

=== MEMORIES / ARCS / CHAPTERS ===
=== memory 001 ===
Title: ...
Contents: ...
=== end memory 001 ===

=== memory 002 ===
Title: ...
Contents: ...
=== end memory 002 ===
...
=== END ... ===
```

### Apa yang Harus Dikembalikan Model

STMB mengharapkan objek JSON dengan bentuk seperti ini:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "The consolidated recap text",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this item was left out"
    }
  ]
}
```

Gagasan pentingnya:

- Konsolidasi bisa mengembalikan satu ringkasan atau beberapa ringkasan.
- `member_ids` memberi tahu STMB entri sumber mana yang termasuk ke setiap ringkasan yang dikembalikan.
- `unassigned_items` adalah cara model mengatakan "entri ini tidak cocok dengan ringkasan yang baru saja saya buat".

### Apa yang Membuat Prompt Konsolidasi Menjadi Baik

Prompt konsolidasi yang baik melakukan tiga hal dengan baik:

1. Menentukan target pemadatannya
   - satu arc
   - satu atau beberapa arc
   - rekap yang padat tetapi lengkap
   - rekap yang dipadatkan secara agresif

2. Menentukan logika pemilihannya
   - menjaga kronologi
   - menjaga kontinuitas
   - menggabungkan item yang saling terkait
   - membiarkan item yang tidak terkait tetap tidak ditugaskan

3. Menentukan struktur JSON dengan sangat jelas

Prompt konsolidasi yang terbaik juga memberi tahu model apa yang harus dipertahankan:

- alur utama yang besar
- titik balik
- janji
- konsekuensi
- alur yang belum selesai
- perubahan hubungan
- kutipan atau pengenal yang kritis untuk kontinuitas

### Apa yang Membuat Prompt Konsolidasi Menjadi Lemah

- Meminta rekap, tetapi tidak pernah menjelaskan cara mengelompokkan entri sumber.
- Tidak memberi tahu model apa yang harus dilakukan terhadap item yang tidak cocok.
- Tidak mewajibkan `member_ids`.
- Meminta prosa bebas alih-alih objek JSON konsolidasi.
- Terlalu fokus pada gaya dan terlalu kurang dalam mendefinisikan logika seleksi serta pengelompokan.

### Saran Praktis untuk Menulis Prompt Konsolidasi

- Beri tahu model apakah Anda menginginkan satu rekap yang kohesif atau jumlah rekap kohesif yang sekecil mungkin.
- Wajibkan kronologi.
- Wajibkan penanganan yang eksplisit terhadap sisa item.
- Jaga kata kunci tetap konkret di sini juga; ringkasan tingkat lebih tinggi tetap membutuhkan nilai untuk pengambilan ulang.

## Aturan Sebenarnya dalam Menulis Prompt

Saat menulis untuk STMB, jangan hanya berpikir, "Apa yang saya ingin AI katakan?"

Pikirkan:

1. Konteks apa yang akan ditempatkan STMB sebelum adegan?
2. Apa unit materi sebenarnya yang sedang dianalisis?
3. Apakah alur ini mengharapkan JSON yang ketat atau teks biasa final?
4. Informasi apa yang harus tetap bertahan untuk pengambilan ulang nanti?
5. Apa yang harus diabaikan, dipadatkan, dipertahankan, atau dibawa maju oleh model?

Jika prompt Anda menjawab lima pertanyaan itu dengan jelas, biasanya prompt itu akan bekerja dengan baik bersama STMB.

## Catatan Bergaya FAQ

- "Apakah saya bisa melihat apa yang benar-benar dikirim ke AI?"
  Ya. Periksa keluaran terminal atau log Anda jika ingin memeriksa prompt rakitan yang dikirim.

- "Apakah STMB memaksa hasil menjadi bagus meskipun prompt saya lemah?"
  Tidak juga. STMB kadang bisa menyelamatkan JSON yang rusak, tetapi STMB tidak bisa memperbaiki prompt yang samar dan sejak awal meminta hal yang salah.

- "Apa yang sebaiknya saya optimalkan lebih dulu saat menulis ulang prompt?"
  Optimalkan dulu format keluarannya. Setelah itu, optimalkan detail apa saja yang harus dipertahankan. Gaya datang belakangan.
