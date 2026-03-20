# Cara Buku Memori SillyTavern (STMB) Berfungsi — Panduan Ringkas untuk Bukan Pengaturcara

Panduan ini menerangkan cara STMB berfungsi dalam istilah yang jelas dan ringkas untuk pengguna yang tidak menulis kod SillyTavar tetapi ingin memahami cara gesaan dibina.

## Perkara yang STMB Hantar kepada AI (Penjanaan Memori)

Apabila anda menjalankan "Jana Memori," STMB menghantar gesaan dua bahagian:

A) Arahan Sistem (daripada pratetap seperti "ringkasan," "sinopsis," dsb.)
- Blok arahan pendek yang:
  - Memberitahu model untuk menganalisis adegan
  - Mengarahkannya untuk mengembalikan JSON SAHAJA
  - Mentakrifkan medan JSON yang diperlukan
- Makro seperti {{user}} dan {{char}} digantikan dengan nama sembang anda.
- Ini BUKAN pratetap anda! Gesaan ini berdiri sendiri dan boleh diuruskan daripada 🧩Pengurus Gesaan Ringkasan.

B) Adegan, diformatkan untuk analisis
- STMB memformatkan mesej terbaharu anda seperti skrip:
  - Blok konteks pilihan memori sebelumnya (ditandakan dengan jelas JANGAN RINGKASKAN).
  - Transkrip adegan semasa, satu baris setiap mesej:
    Alice: …
    Bob: …

Rangka bentuk gesaan
```
— Arahan Sistem (daripada pratetap pilihan anda) —
Analisis adegan sembang berikut dan kembalikan memori sebagai JSON.

Anda mesti membalas dengan JSON yang sah SAHAJA dalam format yang tepat ini:
{
  "title": "Tajuk adegan pendek (1-3 perkataan)",
  "content": "…",
  "keywords": ["…","…"]
}

…(panduan pratetap bersambung; makro seperti {{user}} dan {{char}} telah digantikan)…

— Data Adegan —
=== KONTEKS ADEGAN SEBELUMNYA (JANGAN RINGKASKAN) ===
Konteks 1 - [Tajuk]:
[Teks memori sebelumnya]
Kata kunci: alfa, beta, …
…(sifar atau lebih memori sebelumnya)…
=== TAMAT KONTEKS ADEGAN SEBELUMNYA - RINGKASKAN ADEGAN DI BAWAH SAHAJA ===

=== TRANSKRIP ADEGAN ===
{{user}}: …
{{char}}: …
… (setiap mesej pada barisnya sendiri)
=== TAMAT ADEGAN ===
```

Nota
- Keselamatan token: STMB menganggarkan penggunaan token dan memberi amaran jika anda melebihi ambang.
- Jika anda mendayakan regex keluar dalam Tetapan, STMB menggunakan skrip regex pilihan anda pada teks gesaan sejurus sebelum menghantar.

## Perkara yang Mesti Dikembalikan oleh AI (Kontrak JSON)

AI mesti mengembalikan satu objek JSON dengan medan ini:
- title: rentetan (pendek)
- content: rentetan (teks ringkasan/memori)
- keywords: tatasusunan rentetan (10–30 istilah khusus yang disyorkan oleh pratetap)

Ketegasan dan keserasian
- Kembalikan objek JSON SAHAJA — tiada prosa, tiada penjelasan.
- Kunci hendaklah betul-betul: "title", "content", "keywords".
  - STMB bertolak ansur dengan "summary" atau "memory_content" untuk kandungan, tetapi "content" ialah amalan terbaik.
- keywords mestilah tatasusunan rentetan (bukan rentetan dipisahkan koma).

Contoh minimum (sah)
```json
{
  "title": "Pengakuan Senyap",
  "content": "Lewat petang, Alice mengaku penggodaman itu bersifat peribadi. Bob mencabar etika; mereka bersetuju dengan sempadan dan merancang langkah seterusnya yang teliti.",
  "keywords": ["Alice", "Bob", "pengakuan", "sempadan", "godam", "etika", "petang", "langkah seterusnya"]
}
```

Contoh lebih panjang (sah)
```json
{
  "title": "Gencatan Senjata di Atas Bumbung",
  "content": "Garis Masa: Malam selepas insiden pasar. Rentak Cerita: Alice mendedahkan dia yang menanam pengesan. Bob kecewa tetapi mendengar; mereka memainkan semula petunjuk dan mengenal pasti gudang. Interaksi Utama: Alice memohon maaf tanpa alasan; Bob menetapkan syarat untuk meneruskan. Butiran Penting: Radio rosak, label gudang \"K‑17\", siren jauh. Hasil: Mereka membentuk gencatan senjata sementara dan bersetuju untuk meninjau K‑17 pada waktu subuh.",
  "keywords": ["Alice", "Bob", "gencatan senjata", "gudang K-17", "maaf", "syarat", "siren", "rancangan peninjauan", "malam", "insiden pasar"]
}
```

### Jika Model Berkelakuan Buruk

STMB cuba menyelamatkan output yang sedikit cacat:
- Menerima JSON di dalam pagar kod dan mengekstrak blok.
- Mengalih keluar ulasan dan koma di belakang sebelum menghurai.
- Mengesan JSON yang terpotong/tidak seimbang dan menimbulkan ralat yang jelas, cth.:
  - NO_JSON_BLOCK — model membalas dengan prosa dan bukannya JSON
  - UNBALANCED / INCOMPLETE_SENTENCE — kemungkinan terpotong
  - MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS — isu skema

Tingkah laku model terbaik
- Keluarkan satu objek JSON dengan medan yang diperlukan.
- Jangan tambah teks sekeliling atau pagar Markdown.
- Pastikan "title" pendek; jadikan "keywords" khusus dan mesra pengambilan.
- Patuhi pratetap (cth., abaikan kandungan [OOC]).

### Lanjutan: Laluan Pelaksanaan (Pilihan)

- Pemasangan gesaan: buildPrompt(profile, scene) menggabungkan teks arahan pratetap yang dipilih dengan transkrip adegan dan blok memori sebelumnya pilihan.
- Hantar: sendRawCompletionRequest() menyerahkan teks kepada pembekal/model pilihan anda.
- Huraikan: parseAIJsonResponse() mengekstrak dan mengesahkan tajuk/kandungan/kata kunci, dengan pembaikan ringan jika perlu.
- Hasil: STMB menyimpan memori berstruktur, menggunakan format tajuk anda dan menyediakan kunci buku lore yang dicadangkan.

## Gesaan Sampingan (Cara-cara)

Gesaan Sampingan ialah penjana tambahan dipacu templat yang menulis nota berstruktur kembali ke dalam buku lore anda (cth., penjejak, laporan, senarai pelakon). Ia berasingan daripada laluan "penjanaan memori" dan boleh berjalan secara automatik atau atas permintaan.

Kegunaannya
- Penjejak plot/keadaan (cth., "Titik Plot")
- Papan pemuka status/hubungan (cth., "Status")
- Senarai pelakon / siapa siapa NPC (cth., "Senarai Watak")
- Nota POV atau penilaian (cth., "Nilai")

Templat terbina dalam (dihantar oleh STMB)
- Titik Plot — menjejaki benang cerita dan cangkuk
- Status — meringkaskan maklumat hubungan/pertalian
- Senarai Watak — menyimpan senarai NPC mengikut kepentingan plot
- Nilai — mencatat perkara yang telah dipelajari oleh {{char}} tentang {{user}}

Tempat untuk mengurus
- Buka Pengurus Gesaan Sampingan (dalam STMB) untuk melihat, mencipta, mengimport/mengeksport, mendayakan atau mengkonfigurasi templat. Makro ST standard seperti `{{user}}` dan `{{char}}` dikembangkan dalam `Prompt` dan `Format Respons`; makro `{{...}}` bukan standard dianggap sebagai input masa jalan.

Cipta atau dayakan Gesaan Sampingan
1) Buka Pengurus Gesaan Sampingan.
2) Cipta templat baharu atau dayakan templat terbina dalam.
3) Konfigurasikan:
   - Nama: Tajuk paparan (entri buku lore yang disimpan akan bertajuk "Nama (Gesaan Sampingan STMB)").
   - Gesaan: Teks arahan yang akan diikuti oleh model. Makro ST standard dikembangkan di sini.
   - Format Respons: Blok panduan pilihan yang dilampirkan pada gesaan (bukan skema, hanya arahan). Makro ST standard juga dikembangkan di sini.
   - Makro masa jalan: Token bukan standard `{{...}}` menjadi input wajib untuk `/sideprompt`, contohnya `{{npc name}}="Jane Doe"`.
   - Pencetus:
     • Selepas Memori — jalankan selepas setiap penjanaan memori yang berjaya untuk adegan semasa.
     • Pada Selang Masa — jalankan apabila ambang mesej pengguna/pembantu yang boleh dilihat sejak larian terakhir dipenuhi (visibleMessages).
     • Perintah manual — benarkan larian dengan /sideprompt.
   - Konteks pilihan: previousMemoriesCount (0–7) untuk memasukkan memori terbaharu sebagai konteks baca sahaja.
   - Model/profil: secara pilihan mengatasi model/profil (overrideProfileEnabled + overrideProfileIndex). Jika tidak, ia menggunakan profil lalai STMB (yang boleh mencerminkan tetapan UI ST semasa jika dikonfigurasikan).
   - Tetapan suntikan buku lore:
     • constVectMode: pautan (vektor, lalai), hijau (biasa), biru (malar)
     • kedudukan: strategi pemasukan
     • orderMode/orderValue: pesanan manual apabila diperlukan
     • preventRecursion/delayUntilRecursion: bendera boolean

Larian manual dengan /sideprompt
- Sintaks: /sideprompt "Nama" {{macro}}="value" [X‑Y]
  - Contoh:
    • /sideprompt "Status"
    • /sideprompt "NPC Directory" {{npc name}}="Jane Doe"
    • /sideprompt "Location Notes" {{place name}}="Black Harbor" 100‑120
- Jika anda meninggalkan julat, STMB menyusun mesej sejak pusat pemeriksaan terakhir (terhad kepada tetingkap terbaharu).
- Larian manual memerlukan templat untuk membenarkan perintah sideprompt (dayakan "Benarkan larian manual melalui /sideprompt" dalam tetapan templat). Jika dilumpuhkan, perintah itu akan ditolak.
- Nama templat mesti berada dalam tanda petik, dan nilai makro juga mesti dipetik.
- Selepas anda memilih side prompt dalam autolengkap perintah, STMB mencadangkan makro wajib yang masih belum diisi untuk templat itu.

Larian automatik
- Selepas Memori: Semua templat yang didayakan dengan pencetus onAfterMemory berjalan menggunakan adegan yang telah disusun. STMB menjalankan larian secara berkelompok dengan had serentak yang kecil dan boleh menunjukkan roti bakar kejayaan/kegagalan setiap templat.
- Penjejak selang masa: Templat yang didayakan dengan onInterval berjalan sebaik sahaja bilangan mesej yang boleh dilihat (bukan sistem) sejak larian terakhir memenuhi visibleMessages. STMB menyimpan pusat pemeriksaan setiap templat (cth., STMB_sp_<key>_lastMsgId) dan menyahlecit larian (~10s). Penyusunan adegan dihadkan kepada tetingkap terbaharu untuk keselamatan.
- Templat dengan makro masa jalan tersuai hanya boleh dijalankan secara manual. STMB mengalih keluar `onInterval` dan `onAfterMemory` daripada templat sedemikian semasa simpan/import dan memaparkan amaran.

Pratonton dan simpanan
- Jika "tunjukkan pratonton memori" didayakan dalam tetapan STMB, tetingkap timbul pratonton akan muncul. Anda boleh menerima, mengedit, mencuba semula atau membatalkan. Kandungan yang diterima ditulis ke buku lore terikat anda di bawah "Nama (Gesaan Sampingan STMB)".
- Gesaan Sampingan memerlukan buku lore memori untuk diikat pada sembang (atau dipilih dalam Mod Manual). Jika tiada yang terikat, STMB akan menunjukkan pemberitahuan dan melangkau larian.
- Jika templat mempunyai makro masa jalan tersuai, STMB mengalih keluar pencetus automatik semasa simpan/import dan memaparkan amaran.

Import/eksport dan tetapan semula terbina dalam
- Eksport: Simpan dokumen Gesaan Sampingan anda sebagai JSON.
- Import: Menggabungkan entri secara tambahan; pendua dinamakan semula dengan selamat (tiada tulis ganti). Jika templat yang diimport mempunyai makro masa jalan tersuai, STMB secara automatik mengalih keluar `onInterval` dan `onAfterMemory` dan memaparkan amaran.
- Cipta Semula Terbina Dalam: Tetapkan semula templat terbina dalam kepada lalai tempatan semasa (templat ciptaan pengguna tidak disentuh).

## Gesaan Sampingan lwn Laluan Memori: Perbezaan Utama

- Tujuan
  - Laluan Memori: Menghasilkan memori adegan kanonik sebagai JSON yang ketat (tajuk, kandungan, kata kunci) untuk pengambilan.
  - Gesaan Sampingan: Menghasilkan laporan/penjejak sampingan sebagai teks bentuk bebas yang disimpan ke dalam buku lore anda.

- Bila ia berjalan
  - Laluan Memori: Berjalan hanya apabila anda menekan Jana Memori (atau melalui aliran kerjanya).
  - Gesaan Sampingan: Boleh berjalan Selepas Memori, pada ambang Selang Masa, atau secara manual dengan /sideprompt. Templat dengan makro masa jalan tersuai hanya boleh dijalankan secara manual.

- Bentuk gesaan
  - Laluan Memori: Menggunakan pratetap "Pengurus Gesaan Ringkasan" yang berdedikasi dengan kontrak JSON yang ketat; STMB mengesahkan/membaiki JSON.
  - Gesaan Sampingan: Menggunakan teks arahan templat + entri terdahulu pilihan + memori sebelumnya pilihan + teks adegan yang disusun; tiada skema JSON diperlukan (Format Respons pilihan adalah panduan sahaja). Makro ST standard dikembangkan dalam Prompt dan Format Respons.

- Output dan storan
  - Laluan Memori: Satu objek JSON: { title, content, keywords } → disimpan sebagai entri memori yang digunakan untuk pengambilan.
  - Gesaan Sampingan: Kandungan teks biasa → disimpan sebagai entri buku lore bertajuk "Nama (Gesaan Sampingan STMB)" (nama lama diiktiraf untuk kemas kini). Kata kunci tidak diperlukan. Token bukan standard `{{...}}` ialah input wajib untuk perintah manual.

- Kemasukan ke dalam gesaan sembang
  - Laluan Memori: Entri dipilih melalui teg/kata kunci, keutamaan, skop dan belanjawan token.
  - Gesaan Sampingan: Kemasukan dikawal oleh tetapan suntikan buku lore setiap templat (malar lwn vektor, kedudukan, susunan).

- Pemilihan model/profil
  - Laluan Memori: Menggunakan profil memori yang ditakrifkan dalam Pengurus Gesaan Ringkasan STMB.
  - Gesaan Sampingan: Menggunakan profil lalai STMB (yang mungkin mencerminkan UI ST semasa) melainkan penggantian peringkat templat didayakan.

- Keserentakan dan pengumpulan
  - Laluan Memori: Larian tunggal setiap penjanaan.
  - Gesaan Sampingan: Larian Selepas Memori dikumpulkan dengan keserentakan terhad; hasil boleh dipratonton dan disimpan secara berperingkat.

- Kawalan token/saiz
  - Laluan Memori: STMB menganggarkan penggunaan token dan menguatkuasakan kontrak JSON.
  - Gesaan Sampingan: Menyusun tetingkap adegan terikat dan secara pilihan menambah beberapa memori terbaharu; tiada penguatkuasaan JSON yang ketat.

## Nota Gaya Soalan Lazim

- "Adakah ini akan mengubah cara saya menulis mesej?"
  Tidak banyak. Anda terutamanya menyusun entri dan membiarkan STMB memasukkan yang betul secara automatik.

- "Bolehkah saya melihat apa yang sebenarnya dihantar kepada AI?"
  Ya—semak Terminal anda untuk memeriksa apa yang disuntik.
