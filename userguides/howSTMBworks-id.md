# Cara Kerja Buku Memori SillyTavern (STMB) — Panduan Ringan untuk Pemrogram

Panduan ini menjelaskan cara kerja STMB dalam istilah yang jelas dan ringan bagi pengguna yang tidak menulis kode SillyTavern tetapi ingin memahami bagaimana prompt dibuat.

## Apa yang STMB Kirim ke AI (Pembuatan Memori)

Saat Anda menjalankan "Hasilkan Memori," STMB mengirimkan prompt dua bagian:

A) Instruksi Sistem (dari preset seperti "ringkasan," "sinopsis," dll.)
- Blok instruksi singkat yang:
  - Memberi tahu model untuk menganalisis adegan
  - Menginstruksikannya untuk mengembalikan HANYA JSON
  - Mendefinisikan bidang JSON yang diperlukan
- Makro seperti {{user}} dan {{char}} diganti dengan nama obrolan Anda.
- Ini BUKAN preset Anda! Prompt ini berdiri sendiri dan dapat dikelola dari 🧩Manajer Prompt Ringkasan.

B) Adegan, diformat untuk analisis
- STMB memformat pesan terbaru Anda seperti skrip:
  - Blok konteks opsional dari memori sebelumnya (ditandai dengan jelas JANGAN RINGKAS).
  - Transkrip adegan saat ini, satu baris per pesan:
    Alice: …
    Bob: …

Kerangka bentuk prompt
```
— Instruksi Sistem (dari preset yang Anda pilih) —
Analisis adegan obrolan berikut dan kembalikan memori sebagai JSON.

Anda harus merespons HANYA dengan JSON yang valid dalam format yang tepat ini:
{
  "title": "Judul adegan singkat (1-3 kata)",
  "content": "…",
  "keywords": ["…","…"]
}

…(panduan preset berlanjut; makro seperti {{user}} dan {{char}} sudah diganti)…

— Data Adegan —
=== KONTEKS ADEGAN SEBELUMNYA (JANGAN RINGKAS) ===
Konteks 1 - [Judul]:
[Teks memori sebelumnya]
Kata kunci: alfa, beta, …
…(nol atau lebih memori sebelumnya)…
=== AKHIR KONTEKS ADEGAN SEBELUMNYA - RINGKAS HANYA ADEGAN DI BAWAH INI ===

=== TRANSKRIP ADEGAN ===
{{user}}: …
{{char}}: …
… (setiap pesan di barisnya sendiri)
=== AKHIR ADEGAN ===
```

Catatan
- Keamanan token: STMB memperkirakan penggunaan token dan memperingatkan jika Anda melebihi ambang batas.
- Jika Anda mengaktifkan regex keluar di Pengaturan, STMB menerapkan skrip regex yang Anda pilih ke teks prompt tepat sebelum mengirim.

## Apa yang Harus Dikembalikan AI (Kontrak JSON)

AI harus mengembalikan satu objek JSON dengan bidang-bidang ini:
- title: string (pendek)
- content: string (teks ringkasan/memori)
- keywords: array string (10–30 istilah spesifik yang direkomendasikan oleh preset)

Keketatan dan kompatibilitas
- Kembalikan HANYA objek JSON — tanpa prosa, tanpa penjelasan.
- Kunci harus persis: "title", "content", "keywords".
  - STMB mentolerir "summary" atau "memory_content" untuk konten, tetapi "content" adalah praktik terbaik.
- keywords harus berupa array string (bukan string yang dipisahkan koma).

Contoh minimal (valid)
```json
{
  "title": "Pengakuan Diam-diam",
  "content": "Larut malam, Alice mengakui peretasan itu bersifat pribadi. Bob menantang etika; mereka menyetujui batasan dan merencanakan langkah selanjutnya dengan hati-hati.",
  "keywords": ["Alice", "Bob", "pengakuan", "batasan", "peretasan", "etika", "malam", "langkah selanjutnya"]
}
```

Contoh lebih panjang (valid)
```json
{
  "title": "Gencatan Senjata di Atap",
  "content": "Garis Waktu: Malam setelah insiden pasar. Alur Cerita: Alice mengungkapkan bahwa dia yang menanam pelacak. Bob frustrasi tetapi mendengarkan; mereka memutar ulang petunjuk dan mengidentifikasi gudang. Interaksi Kunci: Alice meminta maaf tanpa alasan; Bob menetapkan syarat untuk melanjutkan. Detail Penting: Radio rusak, label gudang \"K‑17\", sirene jauh. Hasil: Mereka membentuk gencatan senjata sementara dan setuju untuk mengintai K‑17 saat fajar.",
  "keywords": ["Alice", "Bob", "gencatan senjata", "gudang K-17", "permintaan maaf", "syarat", "sirene", "rencana pengintaian", "malam", "insiden pasar"]
}
```

### Jika Model Berperilaku Buruk

STMB mencoba menyelamatkan output yang sedikit salah format:
- Menerima JSON di dalam pagar kode dan mengekstrak bloknya.
- Menghapus komentar dan koma di akhir sebelum parsing.
- Mendeteksi JSON yang terpotong/tidak seimbang dan memberikan kesalahan yang jelas, mis.:
  - NO_JSON_BLOCK — model merespons dengan prosa, bukan JSON
  - UNBALANCED / INCOMPLETE_SENTENCE — kemungkinan terpotong
  - MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS — masalah skema

Perilaku model terbaik
- Mengeluarkan satu objek JSON dengan bidang yang diperlukan.
- Jangan menambahkan teks di sekitarnya atau pagar Markdown.
- Jaga agar "title" tetap pendek; buat "keywords" spesifik dan ramah pengambilan.
- Patuhi preset (mis., abaikan konten [OOC]).

### Lanjutan: Jalur Eksekusi (Opsional)

- Perakitan prompt: buildPrompt(profile, scene) menggabungkan teks instruksi preset yang dipilih dengan transkrip adegan dan blok memori sebelumnya yang opsional.
- Kirim: sendRawCompletionRequest() mengirimkan teks ke penyedia/model yang Anda pilih.
- Urai: parseAIJsonResponse() mengekstrak dan memvalidasi judul/konten/kata kunci, dengan perbaikan ringan jika diperlukan.
- Hasil: STMB menyimpan memori terstruktur, menerapkan format judul Anda, dan menyiapkan kunci buku lore yang disarankan.

## Prompt Sampingan (Cara Kerja)

Prompt Sampingan adalah generator tambahan yang digerakkan oleh templat yang menulis catatan terstruktur kembali ke buku lore Anda (mis., pelacak, laporan, daftar pemeran). Mereka terpisah dari jalur "pembuatan memori" dan dapat berjalan secara otomatis atau sesuai permintaan.

Kegunaannya
- Pelacak plot/status (mis., "Plotpoints")
- Dasbor status/hubungan (mis., "Status")
- Daftar pemeran / siapa siapa NPC (mis., "Pemeran Karakter")
- Catatan POV atau penilaian (mis., "Menilai")

Templat bawaan (dikirim oleh STMB)
- Plotpoints — melacak alur cerita dan kaitan
- Status — merangkum informasi hubungan/afinitas
- Pemeran Karakter — menyimpan daftar NPC dalam urutan kepentingan plot
- Menilai — mencatat apa yang telah dipelajari {{char}} tentang {{user}}

Tempat mengelola
- Buka Manajer Prompt Sampingan (di dalam STMB) untuk melihat, membuat, mengimpor/mengekspor, mengaktifkan, atau mengonfigurasi templat.

Buat atau aktifkan Prompt Sampingan
1) Buka Manajer Prompt Sampingan.
2) Buat templat baru atau aktifkan yang sudah ada.
3) Konfigurasikan:
   - Nama: Judul tampilan (entri buku lore yang disimpan akan diberi judul "Nama (STMB SidePrompt)").
   - Prompt: Teks instruksi yang akan diikuti model.
   - Format Respons: Blok panduan opsional yang ditambahkan ke prompt (bukan skema, hanya arahan).
   - Pemicu:
     • Setelah Memori — berjalan setelah setiap pembuatan memori yang berhasil untuk adegan saat ini.
     • Pada Interval — berjalan ketika ambang batas pesan pengguna/asisten yang terlihat sejak proses terakhir terpenuhi (visibleMessages).
     • Perintah manual — izinkan berjalan dengan /sideprompt.
   - Konteks opsional: previousMemoriesCount (0–7) untuk menyertakan memori terbaru sebagai konteks hanya-baca.
   - Model/profil: secara opsional menimpa model/profil (overrideProfileEnabled + overrideProfileIndex). Jika tidak, ia menggunakan profil default STMB (yang dapat mencerminkan pengaturan UI ST saat ini jika dikonfigurasi).
   - Pengaturan injeksi buku lore:
     • constVectMode: tautan (vektorisasi, default), hijau (normal), biru (konstan)
     • posisi: strategi penyisipan
     • orderMode/orderValue: pengurutan manual bila diperlukan
     • preventRecursion/delayUntilRecursion: flag boolean

Jalankan manual dengan /sideprompt
- Sintaks: /sideprompt "Nama" [X‑Y]
  - Contoh:
    • /sideprompt "Status"
    • /sideprompt Pemeran 100‑120
- Jika Anda menghilangkan rentang, STMB mengkompilasi pesan sejak pos pemeriksaan terakhir (dibatasi pada jendela terbaru).
- Proses manual mengharuskan templat untuk mengizinkan perintah sideprompt (aktifkan "Izinkan proses manual melalui /sideprompt" di pengaturan templat). Jika dinonaktifkan, perintah akan ditolak.

Proses otomatis
- Setelah Memori: Semua templat yang diaktifkan dengan pemicu onAfterMemory berjalan menggunakan adegan yang sudah dikompilasi. STMB memproses proses secara batch dengan batas konkurensi kecil dan dapat menampilkan toast keberhasilan/kegagalan per templat.
- Pelacak interval: Templat yang diaktifkan dengan onInterval berjalan setelah jumlah pesan yang terlihat (non-sistem) sejak proses terakhir memenuhi visibleMessages. STMB menyimpan pos pemeriksaan per templat (mis., STMB_sp_<key>_lastMsgId) dan melakukan debounce proses (~10 detik). Kompilasi adegan dibatasi pada jendela terbaru untuk keamanan.

Pratinjau dan penyimpanan
- Jika "tampilkan pratinjau memori" diaktifkan di pengaturan STMB, popup pratinjau akan muncul. Anda dapat menerima, mengedit, mencoba lagi, atau membatalkan. Konten yang diterima ditulis ke buku lore terikat Anda di bawah "Nama (STMB SidePrompt)".
- Prompt Sampingan memerlukan buku lore memori untuk diikat ke obrolan (atau dipilih dalam Mode Manual). Jika tidak ada yang terikat, STMB akan menampilkan pemberitahuan dan melewati proses.

Impor/ekspor dan reset bawaan
- Ekspor: Simpan dokumen Prompt Sampingan Anda sebagai JSON.
- Impor: Menggabungkan entri secara aditif; duplikat diganti namanya dengan aman (tidak ada penimpaan).
- Buat Ulang Bawaan: Mengatur ulang templat bawaan ke default lokal saat ini (templat buatan pengguna tidak tersentuh).

## Prompt Sampingan vs Jalur Memori: Perbedaan Utama

- Tujuan
  - Jalur Memori: Menghasilkan memori adegan kanonik sebagai JSON ketat (judul, konten, kata kunci) untuk pengambilan.
  - Prompt Sampingan: Menghasilkan laporan/pelacak tambahan sebagai teks bentuk bebas yang disimpan ke dalam buku lore Anda.

- Kapan mereka berjalan
  - Jalur Memori: Berjalan hanya saat Anda menekan Hasilkan Memori (atau melalui alur kerjanya).
  - Prompt Sampingan: Dapat berjalan Setelah Memori, pada ambang Interval, atau secara manual dengan /sideprompt.

- Bentuk prompt
  - Jalur Memori: Menggunakan preset "Manajer Prompt Ringkasan" khusus dengan kontrak JSON yang ketat; STMB memvalidasi/memperbaiki JSON.
  - Prompt Sampingan: Menggunakan teks instruksi templat + entri sebelumnya opsional + memori sebelumnya opsional + teks adegan yang dikompilasi; tidak ada skema JSON yang diperlukan (Format Respons opsional hanya panduan).

- Output dan penyimpanan
  - Jalur Memori: Satu objek JSON: { title, content, keywords } → disimpan sebagai entri memori yang digunakan untuk pengambilan.
  - Prompt Sampingan: Konten teks biasa → disimpan sebagai entri buku lore berjudul "Nama (STMB SidePrompt)" (nama lawas dikenali untuk pembaruan). Kata kunci tidak diperlukan.

- Penyertaan ke dalam prompt obrolan
  - Jalur Memori: Entri dipilih melalui tag/kata kunci, prioritas, cakupan, dan anggaran token.
  - Prompt Sampingan: Penyertaan diatur oleh pengaturan injeksi buku lore setiap templat (konstan vs vektorisasi, posisi, urutan).

- Pemilihan model/profil
  - Jalur Memori: Menggunakan profil memori yang ditentukan di Manajer Prompt Ringkasan STMB.
  - Prompt Sampingan: Menggunakan profil default STMB (yang mungkin mencerminkan UI ST saat ini) kecuali penimpaan tingkat templat diaktifkan.

- Konkurensi dan batching
  - Jalur Memori: Proses tunggal per generasi.
  - Prompt Sampingan: Proses Setelah Memori di-batch dengan konkurensi terbatas; hasilnya dapat dipratinjau dan disimpan secara bertahap.

- Kontrol token/ukuran
  - Jalur Memori: STMB memperkirakan penggunaan token dan memberlakukan kontrak JSON.
  - Prompt Sampingan: Mengkompilasi jendela adegan terbatas dan secara opsional menambahkan beberapa memori terbaru; tidak ada penegakan JSON yang ketat.

## Catatan Gaya Tanya Jawab

- "Apakah ini akan mengubah cara saya menulis pesan?"
  Tidak banyak. Anda terutama mengkurasi entri dan membiarkan STMB menyertakan yang benar secara otomatis.

- "Bisakah saya melihat apa yang sebenarnya dikirim ke AI?"
  Ya—periksa Terminal Anda untuk memeriksa apa yang disuntikkan.
