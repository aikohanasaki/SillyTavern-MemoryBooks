<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Manual Referensi AI Lengkap

**Produk:** SillyTavern Memory Books (STMB)  
**Versi referensi:** v8.5.0, 1 Agustus 2026  
**Tujuan:** Satu sumber kebenaran yang padat untuk asisten AI yang mengajar, menjelaskan, dan memecahkan masalah Memory Books.

---

## Daftar Isi

- [1. Cara Asisten AI Menggunakan Manual Ini](#1-cara-asisten-ai-menggunakan-manual-ini)
- [2. Definisi Produk dan Model Mental](#2-definisi-produk-dan-model-mental)
- [3. Kosakata Inti dan Pemilihan Fitur](#3-kosakata-inti-dan-pemilihan-fitur)
- [4. Persyaratan, Instalasi, dan Verifikasi Awal](#4-persyaratan-instalasi-dan-verifikasi-awal)
- [5. Membuka Memory Books dan Memahami Panel Utama](#5-membuka-memory-books-dan-memahami-panel-utama)
- [6. Mode Penyimpanan Memory Book](#6-mode-penyimpanan-memory-book)
- [7. Profil, Koneksi, dan Perutean Generasi](#7-profil-koneksi-dan-perutean-generasi)
- [8. Adegan, Memori Manual, Memori Otomatis, dan Catch-Up](#8-adegan-memori-manual-memori-otomatis-dan-catch-up)
- [9. Penghematan Token, Pesan Tersembunyi, dan Batas Memori](#9-penghematan-token-pesan-tersembunyi-dan-batas-memori)
- [10. Aktivasi dan Pengambilan Lorebook](#10-aktivasi-dan-pengambilan-lorebook)
- [11. Mode Group Chat Nyata](#11-mode-group-chat-nyata)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Percabangan Chat](#13-percabangan-chat)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Prompt Sampingan](#16-prompt-sampingan)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Context untuk Generasi](#20-context-untuk-generasi)
- [21. Arsitektur Prompt, Summary Prompt Bawaan, dan Aturan Penulisan](#21-arsitektur-prompt-summary-prompt-bawaan-dan-aturan-penulisan)
- [22. Summary Prompt Manager dan Consolidation Prompt Manager](#22-summary-prompt-manager-dan-consolidation-prompt-manager)
- [23. STMB dan Ekstensi Lain](#23-stmb-dan-ekstensi-lain)
- [24. Judul Entri Lorebook dan Kebijakan Karakter](#24-judul-entri-lorebook-dan-kebijakan-karakter)
- [25. Job Queue dan Kontrol Retry](#25-job-queue-dan-kontrol-retry)
- [26. Umpan Balik Visual dan Aksesibilitas](#26-umpan-balik-visual-dan-aksesibilitas)
- [27. Peta Pengaturan dan Referensi Pengaturan Saat Ini](#27-peta-pengaturan-dan-referensi-pengaturan-saat-ini)
- [28. Referensi Slash Command](#28-referensi-slash-command)
- [29. Pemecahan Masalah Berdasarkan Tahap](#29-pemecahan-masalah-berdasarkan-tahap)
- [30. FAQ](#30-faq)
- [31. Kompatibilitas, Migrasi, dan Catatan Historis Saat Ini](#31-kompatibilitas-migrasi-dan-catatan-historis-saat-ini)
- [32. Catatan Pengembang dan Lisensi](#32-catatan-pengembang-dan-lisensi)
- [33. Pohon Keputusan Diagnostik Ringkas](#33-pohon-keputusan-diagnostik-ringkas)
- [34. Urutan Pengajaran Minimum yang Direkomendasikan](#34-urutan-pengajaran-minimum-yang-direkomendasikan)
- [35. Ringkasan Konsep Akhir](#35-ringkasan-konsep-akhir)

---

## 1. Cara Asisten AI Menggunakan Manual Ini

Perlakukan dokumen ini sebagai referensi operasional Memory Books saat ini. Dokumen ini menggantikan kebutuhan untuk memuat panduan Start Here, README, User Guide, panduan Side Prompts, panduan How STMB Works, dan changelog historis sebagai berkas pengetahuan terpisah.

Istilah:

- STMB = SillyTavern=MemoryBooks (ekstensi ini)
- ST = SillyTavern (kode dasar yang diperluas STMB)

Saat menjawab pengguna:

1. Pertahankan terminologi Memory Books secara konsisten. **Memory Book** adalah lorebook SillyTavern yang digunakan STMB; bukan format basis data terpisah.
2. Bedakan perilaku saat ini dari perilaku historis. Jangan mengajarkan workflow yang sudah dihapus atau digantikan hanya karena pernah muncul di changelog lama.
3. Bedakan **Group Chat Mode** dari **Narrator Mode**. Keduanya memecahkan masalah yang berbeda.
4. Bedakan **generation** memori, **storage/configuration** lorebook, dan **retrieval oleh SillyTavern** setelahnya. Aktivasi/retrieval merupakan bagian dari kode dasar ST.
5. Jangan menciptakan kontrol, label menu, perilaku provider, atau setting yang tidak dijelaskan di sini.
6. Jika pengguna memberi screenshot, identifikasi hanya kontrol yang terlihat. Berikan tindakan berikutnya yang langsung, bukan mengasumsikan kontrol yang tidak tampak.
7. Saat troubleshooting, cari tahap pertama yang gagal dan uji tahap itu sebelum menyarankan penulisan ulang prompt.
8. Utamakan konfigurasi sederhana yang berfungsi sebelum routing lanjutan, banyak book, custom prompts, Regex, atau automasi Side Prompt.
9. Jelaskan bahwa character filters dan Memory Book terpisah meningkatkan routing dan relevansi; keduanya bukan batas keamanan.
10. Nyatakan ketidakpastian bila versi STMB, versi SillyTavern, provider, atau custom prompt pengguna mungkin berbeda.

### Catatan dokumen saat ini

Narrator Mode sudah diimplementasikan di v8.5.0.

Beberapa dokumen pemula lama menyatakan bahwa memori manual secara teknis wajib sebelum memori otomatis dapat dimulai. STMB saat ini dapat membuat memori otomatis pertama mulai message 0 jika belum ada processed-message baseline. Memori manual pertama tetap direkomendasikan karena memverifikasi koneksi, Memory Book, format output, dan batas awal yang diinginkan sebelum automasi dipercaya.

---

## 2. Definisi Produk dan Model Mental

Memory Books adalah ekstensi SillyTavern yang mengubah rentang chat yang dipilih atau dipilih otomatis menjadi entri memori terstruktur yang disimpan di lorebook SillyTavern.

Proses dasarnya:

```text
Chat messages
    ↓
STMB selects or receives a message range
    ↓
STMB assembles an AI request
    ↓
The model returns a structured memory
    ↓
STMB saves a lorebook entry
    ↓
Old processed chat messages may be hidden from active context
    ↓
SillyTavern later activates relevant lorebook entries
    ↓
The chat model receives those entries as context
```

STMB tidak memberi model memori internal permanen. STMB memelihara sistem referensi eksternal berupa entri lorebook. Model chat “mengingat” ketika SillyTavern memasukkan entri lorebook yang relevan ke prompt untuk AI.

### Tiga tahap terpisah

1. **Kualitas generation** — Apakah model pembuat memori menghasilkan hasil yang akurat dan berguna?
2. **Penyimpanan dan konfigurasi** — Apakah hasil disimpan ke Memory Book yang benar dengan setting aktivasi yang tepat?
3. **Retrieval dan penggunaan model** — Apakah SillyTavern mengaktifkan dan mengirim entri tersebut, dan apakah model chat menggunakannya dengan benar?

Troubleshoot ketiga tahap ini secara terpisah.

### Lorebook dan Memory Book

**Lorebook**, yang juga disebut **World Info** di beberapa bagian SillyTavern, adalah kumpulan entri yang dapat ditambahkan SillyTavern secara kondisional ke request model. Entri lorebook biasanya memiliki:

- title/comment;
- content;
- activation keywords atau mode aktivasi lain;
- insertion position dan order;
- recursion dan budget controls;
- optional character filters dan metadata lain.

**Memory Book** adalah lorebook SillyTavern biasa yang digunakan STMB. Ia dapat dibuka, diedit, diurutkan ulang, diekspor, diimpor, atau dihapus dengan alat lorebook biasa. Bergantung pada fitur yang digunakan, isinya dapat mencakup:

- scene Memories;
- ringkasan Arc, Chapter, Book, Legend, Series, atau Epic;
- entri Clip dan Topical Clip;
- entri tracker Side Prompt;
- entri lain yang dikelola STMB.

### Entri Memory adalah context terkompresi

Scene Memory bukan transcript asli. Ia adalah representasi terkompresi untuk mempertahankan informasi penting bagi continuity, seperti:

- events dan consequences;
- decisions dan plans;
- discoveries dan reveals;
- perubahan relationship atau emotional state;
- knowledge, beliefs, atau misunderstandings individual;
- objects, locations, identities, promises, dan constraints yang penting.

Menyembunyikan processed messages tidak menghapusnya. Ini mencegah pesan tersebut dikirim ke AI sehingga tidak terus mengonsumsi active chat-history context.

---

## 3. Kosakata Inti dan Pemilihan Fitur

| Kebutuhan | Fitur | Arti |
|---|---|---|
| Meringkas satu rentang chat yang dipilih atau otomatis | **Memory** | “Ingat apa yang terjadi dalam adegan ini.” |
| Menyimpan wording chat atau satu fakta tertentu | **Clip** | “Simpan catatan ini.” |
| Mengumpulkan fakta tentang satu subjek dari Memories yang sudah disimpan | **Topical Clip** | “Kumpulkan semua yang dikatakan Memories saya tentang ini.” |
| Memelihara informasi yang berubah melalui run berulang | **Side Prompt / Prompt Sampingan** | “Terus perbarui tracker ini.” |
| Menggabungkan beberapa Memory atau summary tier lebih rendah | **Consolidation** | “Gabungkan entri-entri ini menjadi recap tingkat lebih tinggi.” |
| Memendekkan satu entri yang dikelola STMB | **Compaction** | “Ringkas entri ini tanpa kehilangan fakta.” |
| Mengganti entri yang ada menggunakan sumber aslinya | **Regeneration** | “Bangun ulang entri ini dan tinjau penggantinya.” |

### Perbedaan fitur yang sering membingungkan

- **Clip vs Topical Clip:** Clip dimulai dari teks yang disorot dalam chat saat ini. Topical Clip dimulai dari STMB Memories yang sudah dikonfirmasi.
- **Topical Clip vs Side Prompt:** Topical Clip dijalankan manual untuk mengumpulkan satu topik. Side Prompt dapat memelihara tracker yang berubah secara berulang.
- **Compaction vs Consolidation:** Compaction menulis ulang satu entri. Consolidation membuat summary tier lebih tinggi dari beberapa entri.
- **Memory vs Side Prompt:** Memories biasanya merupakan catatan scene berurutan. Side Prompts biasanya memperbarui atau menimpa satu dokumen pendukung yang berlanjut.
- **Generation vs retrieval:** Membuat entri tidak menjamin SillyTavern akan mengaktifkannya kemudian.

---

## 4. Persyaratan, Instalasi, dan Verifikasi Awal

### Persyaratan

- SillyTavern 1.18.0 atau lebih baru; versi kompatibel terbaru direkomendasikan.
- Koneksi AI yang berfungsi.
- Model yang dapat mengikuti instruksi dan, untuk workflow Memory dan Consolidation, mengembalikan JSON valid.
- Izin memasang ekstensi pihak ketiga SillyTavern.
- Preset Chat Completion tersedia di SillyTavern bila memakai backend lokal atau Text Completion melalui endpoint Chat Completion yang kompatibel dengan OpenAI.

### Pengguna Chat Completion normal

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google, dan koneksi Chat Completion lain biasanya dapat memakai profil bawaan **Current SillyTavern Settings**.

### Pengguna lokal dan Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama, dan backend serupa biasanya paling andal jika diekspos melalui endpoint Chat Completion kompatibel OpenAI. Bahkan jika roleplay normal memakai Text Completion, SillyTavern harus memiliki preset Chat Completion untuk STMB.

Setup KoboldCpp tipikal:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint seperti `http://localhost:5001/v1` atau `http://127.0.0.1:5000/v1`;
- custom API key nonblank jika SillyTavern memerlukannya;
- model ID dalam format yang diharapkan endpoint, umumnya `koboldcpp/modelname`, tanpa suffix `.gguf` yang tidak perlu;
- Chat Completion preset sudah diimpor;
- response length sekurangnya 2048 token, dan 4096 sering lebih aman.

Setup llama.cpp tipikal:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`, atau `http://host.docker.internal:8080/v1` bila SillyTavern berjalan dalam Docker;
- API key nonblank jika diwajibkan SillyTavern;
- served model ID;
- tanpa prompt post-processing kecuali endpoint memerlukannya.

Contoh server command:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Chat Top Bar opsional

STMB berfungsi tanpa Chat Top Bar / Chat Top Info Bar. Memasangnya menambahkan interface queue **Memory Books Jobs** untuk work active, completed, failed, canceled, blocked, dan review-needed.

### Instalasi

1. Buka SillyTavern.
2. Buka panel utama **Extensions**.
3. Pilih **Install Extension**.
4. Instal repository resmi Memory Books.
5. Reload SillyTavern jika diminta.
6. Buka character chat atau group chat.
7. Tunggu beberapa detik sampai kontrol STMB terinisialisasi.

SillyTavern Extras tidak diperlukan.

### Pastikan STMB sudah dimuat

Setidaknya salah satu ini harus muncul:

- **Memory Books** di menu Extensions bergambar magic wand di samping input chat;
- chevron scene **►** dan **◄** pada expanded message actions.

Jika keduanya tidak muncul:

1. tunggu hingga sepuluh detik;
2. refresh halaman;
3. pastikan extension terpasang dan enabled;
4. buka kembali character atau group chat;
5. periksa browser console hanya setelah pemeriksaan dasar gagal.

---

## 5. Membuka Memory Books dan Memahami Panel Utama

Buka menu Extensions bergambar magic wand dekat input chat, lalu pilih **Memory Books**.

Panel dapat mencakup:

- Current Scene;
- Memory Status / highest processed message;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- kontrol group-character atau Narrator bila relevan.

Untuk Memory pertama, hanya tiga keputusan yang diperlukan:

1. Memory Book mana yang menerima entri?
2. Profile/connection mana yang membuatnya?
3. Pesan chat mana yang membentuk scene?

---

## 6. Mode Penyimpanan Memory Book

### 6.1 Automatic Mode: Memory Book terikat chat

Automatic Mode adalah default normal. STMB memakai lorebook yang terikat ke chat saat ini melalui SillyTavern.

Gunakan ketika:

- satu chat memiliki satu Memory Book utama;
- konfigurasi minimal diinginkan;
- karakter group tidak memerlukan Memory Book terpisah.

Jika tidak ada lorebook yang terikat, bind satu di SillyTavern atau gunakan Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Aktifkan **Auto-create lorebook if none exists** agar STMB membuat dan mengikat lorebook saat Memory pertama disimpan.

Template nama default dapat memakai:

- `{{char}}` — nama karakter atau group;
- `{{user}}` — nama pengguna;
- `{{chat}}` — ID/nama chat.

STMB menambahkan suffix angka bila perlu agar nama tidak duplikat.

Auto-Create dan Manual Lorebook Mode saling eksklusif.

### 6.3 Manual Lorebook Mode

Aktifkan **Manual Lorebook Mode** untuk memilih Memory Book secara independen dari lorebook yang terikat ke chat.

Gunakan ketika:

- memories harus berada di lorebook khusus;
- beberapa chat sengaja berbagi satu Memory Book;
- anggota group memerlukan book terpisah;
- Narrator Mode digunakan;
- pengguna memahami rencana aktivasi yang dihasilkan.

Pilihan main manual Memory Book disimpan untuk chat saat ini kecuali persistent character lock menimpanya dalam solo chat yang kompatibel.

### 6.4 Memory Book terpisah biasanya lebih jelas

Memory Book khusus memudahkan:

- memisahkan memories dari character definitions dan setting lore;
- menetapkan lorebook budget dan order sendiri;
- memakai kembali atau mengekspor riwayat memori;
- memeriksa entri yang dikelola STMB tanpa lore lain;
- mendiagnosis aktivasi.

Ini rekomendasi, bukan kewajiban.

### 6.5 Character Memory Book locks

Character Memory Book lock adalah assignment Manual Mode persisten yang terikat pada character card.

Dalam solo chat:

- manual book yang unlocked hanya milik chat saat ini;
- locked book mengikuti character card ke kompatibel Manual Mode chats;
- manual book tidak dapat diganti sampai lock dilepas.

Dalam real group chat:

- per-character assignment yang unlocked hanya milik group chat saat ini;
- per-character assignment yang locked mengikuti character card ke kompatibel Manual Mode groups;
- locked book yang hilang menghasilkan broken-lock state yang harus di-unlock atau diperbaiki.

Gunakan lock hanya jika karakter yang sama memang harus berbagi satu Memory Book berkelanjutan di beberapa cerita. Lock berbahaya untuk alternate universe atau timeline yang tidak terkait.

### 6.6 Tata letak awal yang direkomendasikan

- Solo chat: satu chat-bound atau auto-created Memory Book.
- Real group chat: satu group Memory Book.
- Narrator chat: satu omniscient Memory Book plus satu unique book untuk setiap declared character sesuai kebutuhan Narrator Mode.

---

## 7. Profil, Koneksi, dan Perutean Generasi

Profil Memory Books mengontrol generation sekaligus setting entri lorebook yang dihasilkan.

### 7.1 Profil pertama yang direkomendasikan

Gunakan **Current SillyTavern Settings** terlebih dahulu. Profil ini memakai provider, model, dan temperature yang sedang aktif di SillyTavern.

Jangan mulai dengan menulis ulang prompt atau menyiapkan Full Manual endpoint. Pertama buktikan bahwa satu Memory dapat dibuat dan disimpan.

### 7.2 Mengapa membuat profil STMB tersimpan

Buat profil terpisah bila perlu:

- model yang lebih murah atau lebih andal untuk memories;
- provider berbeda dari roleplay;
- bind named Custom connection;
- memilih custom summary prompt;
- temperature atau maximum output behavior berbeda;
- mengubah title formatting;
- mengubah activation, insertion, order, atau recursion settings;
- menggunakan prompt group/omniscient dan character-focused yang berbeda.

### 7.3 Field profil

Profil dapat mencakup:

- display name;
- API/provider;
- model ID;
- temperature;
- Summary Prompt preset;
- optional separate multi-character prompts;
- structured-output behavior;
- optional SillyTavern ChatCompletionService routing;
- optional Chat Completion preset;
- reverse-proxy behavior;
- title format;
- activation mode: Normal, Constant, atau Vectorized;
- insertion position, termasuk character, example-message, author’s-note, dan Outlet positions;
- Outlet name bila relevan;
- automatic atau manual order value;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Named Custom OpenAI-compatible connections

Profil Custom OpenAI-compatible dapat:

- memakai koneksi Custom SillyTavern yang sedang aktif; atau
- bind satu named Custom connection dari Connection Manager SillyTavern.

Named connection menyediakan URL dan secret tersimpan. Field model pada profil STMB tetap menjadi model override. Jika named connection dihapus atau bukan lagi Custom Chat Completion connection, STMB memblokir request, bukan diam-diam mengarahkannya ke tempat lain.

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** mencegah STMB mengirim structured-output schema ke provider yang menolaknya. Model tetap harus mengembalikan JSON valid yang diminta prompt Memory atau Consolidation terpilih.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** mengarahkan request profil yang didukung melalui helper request SillyTavern dan dapat menerapkan preset Chat Completion SillyTavern terpilih. Request OpenRouter juga mewarisi provider order, quantization filters, fallback controls, dan setting middle-out routing SillyTavern. Kontrol OpenRouter ini tetap berlaku jika ChatCompletionService gagal dan STMB mencoba kembali melalui fallback request path. Jika fallback itu juga gagal, STMB mempertahankan dan melaporkan error ChatCompletionService awal serta response provider fallback. Full Manual profiles tidak memakai route ini.

### 7.7 Reverse proxy dan Full Manual Configuration

**Use reverse proxy** meneruskan detail reverse-proxy SillyTavern yang dikonfigurasi untuk provider yang didukung.

**Full Manual Configuration** menyimpan endpoint dan key terpisah di dalam profil STMB. Ini jalur pengecualian. Sebisa mungkin gunakan provider atau Custom connection yang sudah dikonfigurasi dan diuji di SillyTavern.

### 7.8 Panjang output

Setting global maximum response-token STMB dapat menimpa panjang output Chat Completion normal untuk pekerjaan Memory Books. JSON yang terpotong adalah penyebab umum generation gagal. Tingkatkan output length sebelum melemahkan schema atau prompt.

---

## 8. Adegan, Memori Manual, Memori Otomatis, dan Catch-Up

### 8.1 Apa itu scene

**Scene** adalah rentang message inklusif yang diproses STMB menjadi satu Memory.

Boundary yang berguna biasanya mencakup satu unit koheren:

- satu event;
- satu conversation;
- satu investigation step;
- satu emotional atau relationship development;
- perubahan location atau goal;
- rangkaian action yang saling terkait.

Rentang terlalu kecil dan sepele mungkin menghasilkan nilai rendah. Rentang terlalu besar lebih mahal, lebih sulit diringkas, dapat melebihi context, dan sering mencampurkan event yang tidak terkait.

### 8.2 Menandai scene secara manual

1. Expand message actions, biasanya melalui tombol tiga titik atau serupa.
2. Klik **►** pada message pertama yang disertakan.
3. Klik **◄** pada message terakhir yang disertakan.
4. Buka Memory Books dan verifikasi start, end, speakers, message count, dan token estimate yang ditampilkan.

Kedua boundary messages termasuk.

Gunakan **Clear Scene** untuk menghapus selection, atau pilih marker start/end lain untuk mengganti salah satu boundary.

### 8.3 Membuat Memory manual

1. Verifikasi scene.
2. Verifikasi effective Memory Book.
3. Verifikasi selected profile.
4. Klik **Create Memory**, atau gunakan `/creatememory`.
5. Tinjau confirmation, token warning, participant confirmation, atau preview windows jika muncul.
6. Setujui hasil.
7. Pastikan entri lorebook baru ada dan Memory Status maju ke akhir scene.

Hasil Memory valid biasanya memiliki:

- title;
- content;
- keywords;
- metadata STMB, termasuk source range dan chat identity.

### 8.4 Memory previews

Saat **Show memory previews** aktif, tinjau dan bila perlu edit:

- title;
- memory content;
- keywords.

Periksa names, attribution, facts, consequences yang hilang, dan commentary yang tidak terkait. Tanpa previews, hasil valid disimpan otomatis.

### 8.5 Automatic Memories

Aktifkan **Auto-create memory summaries** dan atur:

- **Auto-Summary Interval** — jumlah new messages yang diproses per automatic Memory;
- **Auto-Summary Buffer** — jumlah newest messages yang ditinggalkan agar scene yang masih berkembang tidak diringkas terlalu dini.

Contoh:

```text
Interval: 30
Buffer: 2
```

STMB menunggu sampai setidaknya ada 32 messages setelah processed boundary, lalu membuat Memory yang berakhir dua messages sebelum newest message.

Jika belum ada processed baseline, STMB saat ini menganggap baseline `-1` dan dapat mulai dari message 0. Manual first Memory tetap direkomendasikan untuk memvalidasi setup dan memilih titik awal yang disengaja.

Interval lebih rendah menghasilkan Memories lebih fokus dan lebih banyak requests. Interval lebih tinggi menghasilkan lebih sedikit Memories yang lebih besar, dengan risiko lebih tinggi mencampur material tidak terkait. Titik awal praktis sekitar 20–40 messages untuk roleplay detail dan 40–60 untuk percakapan lebih pendek/cepat.

Automatic generation dapat ditunda jika required Memory Book belum di-assignment.

### 8.6 Processed-message baseline

STMB menyimpan highest processed message untuk setiap chat. Ini menentukan:

- dari mana `/nextmemory` dimulai;
- dari mana automatic Memories dimulai;
- memory-boundary indicator;
- messages mana yang dianggap sudah diproses.

Gunakan:

- `/stmb-highest` untuk menampilkannya;
- `/stmb-set-highest <N>` untuk menetapkan manual;
- `/stmb-set-highest none` untuk menghapusnya.

Perubahan manual harus disengaja karena dapat menyebabkan rentang terlewat atau terulang.

### 8.7 Catch-up untuk chat panjang yang sudah ada

Gunakan:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Contoh:

```text
/stmb-catchup interval=40 start=0 end=245
```

Rentang inklusif. Chunks diproses berurutan; chunk terakhir dapat lebih kecil.

Catch-up sengaja non-interaktif. Sebelum menjalankannya:

- pilih dan uji profile yang benar;
- aktifkan **Always use default profile**;
- nonaktifkan **Show memory previews**;
- pastikan effective Memory Book tersedia, atau izinkan Auto-Create dalam Automatic Mode;
- perbaiki semua assignment multi-character yang wajib;
- pilih chunk size di bawah token-warning threshold.

STMB melakukan preflight pada setiap chunk, memproses berurutan, dan berhenti pada failure pertama atau `/stmb-stop`. Chunk sebelumnya yang sudah selesai tetap tersimpan. Lanjutkan dari first unfinished message, bukan mengulang seluruh rentang.

Gunakan catch-up untuk konversi luas. Manual scene boundaries tetap lebih baik jika batas sastra atau event penting.

---

## 9. Penghematan Token, Pesan Tersembunyi, dan Batas Memori

### 9.1 Menyembunyikan bukan menghapus

Hidden messages tetap berada di chat file. Mereka hanya dikeluarkan dari active chat context sampai ditampilkan kembali.

### 9.2 Mode auto-hide

**Auto-hide messages after adding memory** dapat berupa:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** mempertahankan sedikit overlap terbaru dekat boundary.

> **Saat menggunakan ekstensi Presence:** Presence dapat menampilkan kembali pesan yang disembunyikan STMB karena kedua ekstensi mengubah status visibilitas pesan bersama milik SillyTavern. Lihat [STMB dan Ekstensi Lain](#23-stmb-dan-ekstensi-lain) untuk panduan konfigurasi.

### 9.3 Unhide sebelum generation

**Unhide hidden messages for memory generation** menampilkan selected range sebelum STMB mengompilasinya. Gunakan saat regenerating atau reprocessing range yang sebelumnya hidden. Mode auto-hide terpilih menentukan apa yang disembunyikan kembali setelah save berhasil.

### 9.4 Memory-boundary indicator

Indicator memakai highest processed message untuk menunjukkan di mana processed history berakhir dan unprocessed chat dimulai.

Mode:

- Off;
- Memory boundary divider;
- draggable jump button;
- divider plus jump button.

Jump button scroll ke arah first unprocessed message dan mengingat posisi hasil drag.

### 9.5 Konfigurasi belajar yang baik

Setup awal praktis:

- tampilkan boundary divider dan jump button;
- biarkan dua messages tidak tersembunyi;
- aktifkan temporary unhide untuk generation;
- jangan gunakan auto-hide sampai pengguna memastikan satu Memory tersimpan dengan benar;
- lalu beralih ke hide all processed messages untuk manfaat penghematan token utama.

---

## 10. Aktivasi dan Pengambilan Lorebook

### 10.1 Keywords

Normal Memories umumnya keyword-triggered. Keyword yang baik konkret dan khas:

- nama karakter dan alias;
- named locations atau organizations;
- objects penting;
- event names;
- identifiers;
- discoveries atau actions spesifik.

Keyword lemah seperti `important event`, `conversation`, atau `secret` terlalu luas.

Memory content menentukan apa yang dipelajari model. Keywords membantu menentukan kapan SillyTavern mengambilnya.

### 10.2 Activation modes

- **Normal:** aktivasi berbasis keyword/rule.
- **Constant:** selalu aktif, tunduk pada budget dan entry controls yang berlaku.
- **Vectorized:** menggunakan retrieval berbasis vector bila setup pengguna mendukungnya.

Vectors opsional. STMB bekerja melalui keywords tanpa extension Vectors.

### 10.3 Recommended global World Info settings

Rekomendasi awal umum:

- Match Whole Words: off;
- Scan Depth: relatif tinggi, misalnya 8;
- Max Recursion Steps: sekitar 2;
- Context percentage: disesuaikan dengan total context dan prompt material lain.

Ini rekomendasi, bukan syarat keras.

### 10.4 Delay Until Recursion

Jika Memory Book adalah satu-satunya lorebook/World Info source yang aktif, biarkan **Delay Until Recursion** disabled. Jika tidak, tidak ada entry yang memulai recursion cycle pertama dan Memory mungkin tidak pernah aktif.

### 10.5 Mendiagnosis retrieval

Jika AI “tidak mengingat”:

1. Pastikan entry ada.
2. Pastikan Memory Book yang benar aktif untuk chat.
3. Pastikan entry enabled.
4. Pastikan keywords atau activation mode cocok dengan conversation saat ini.
5. Pastikan lorebook budget cukup.
6. Periksa recursion settings.
7. Gunakan World Info inspection tool atau request log untuk memastikan apakah entry benar-benar dikirim.
8. Jika sudah dikirim tetapi diabaikan, masalah tersisa adalah model behavior atau competing context, bukan penyimpanan STMB.

---

## 11. Mode Group Chat Nyata

### 11.1 Definisi

Group Chat Mode berlaku untuk group SillyTavern nyata yang berisi dua atau lebih character cards terpisah.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern mencatat card mana yang menulis setiap message, sehingga STMB dapat mempertahankan speaker attribution dan mendeteksi anggota group yang berpartisipasi.

Tidak diperlukan switch Group Chat Mode terpisah. Buka group chat dan gunakan STMB seperti biasa.

### 11.2 Participant detection

Detected participant biasanya adalah character card yang menulis setidaknya satu message di dalam selected scene.

STMB tidak menyimpulkan semua orang yang secara naratif hadir dari prose. Karena itu:

- silent observer mungkin tidak terdeteksi;
- karakter yang hanya disebut bukan participant;
- karakter absen yang dibicarakan group tidak dipilih;
- user tidak dianggap sebagai target Memory Book group-character terpisah;
- identitas speaker yang duplikat atau tidak biasa mungkin perlu dikoreksi.

Jika automatic participant detection tidak menemukan group characters, STMB membuka participant confirmation bahkan saat automatic acceptance enabled. Warning menjelaskan detection gagal dan meminta pengguna meninjau group characters mana yang hadir sebelum melanjutkan.

Participant prompt berarti: **Group character mana yang harus diasosiasikan dengan Memory ini?** Itu tidak membuktikan siapa yang mengetahui setiap fakta atau siapa yang hadir secara fisik.

### 11.3 Satu group Memory Book

Ini tata letak awal yang direkomendasikan.

Gunakan Automatic Mode, Auto-Create, atau main Manual Mode book. Setiap scene menghasilkan satu canonical entry di group Memory Book. Jika participant names tersedia, entry dapat menerima inclusive SillyTavern character filter.

Inclusive filter untuk Alice dan Bob berarti entry dapat aktif saat Alice **atau** Bob aktif. Ini tidak membuat karakter sintetis “Alice and Bob” atau subset book terpisah.

Satu group book paling cocok bila:

- cast umumnya berbagi satu cerita;
- satu summary omniscient/group-oriented cukup;
- setup minimal dan lebih sedikit duplicate entries diinginkan;
- STLO tidak diperlukan.

Satu group Memory tetap dapat menyimpan asymmetric knowledge:

> Alice menemukan transmitter dan menyembunyikannya. Bob percaya ruangan itu kosong.

### 11.4 Satu group book plus per-character books

Layout real-group lanjutan memakai:

- satu canonical group Memory Book;
- satu assigned character Memory Book untuk setiap anggota group.

Persyaratan:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) terpasang dan enabled;
- assignment valid untuk setiap group member yang diwajibkan.

Canonical group book tidak boleh sekaligus menjadi character book. Lebih dari satu karakter boleh berbagi character book yang sama; STMB menulis satu copy ke shared book tersebut, bukan duplikat per karakter.

Saat Memory disimpan:

1. canonical version ditulis ke group book;
2. participant selection dikonfirmasi kecuali automatic acceptance aktif;
3. linked copies ditulis ke selected participant books;
4. STMB melakukan rollback partial writes jika memungkinkan bila salah satu required save gagal.

Memilih no participants di real-group participant confirmation menerapkan Memory ke semua current group members.

### 11.5 Separate group and character prompts

Secara default, group-oriented Memory yang sama disalin ke participant books.

Profile dapat mengaktifkan **Use separate group and character prompts in group chats**. Kemudian:

- Group Summary Prompt menulis canonical group version;
- Character Summary Prompt menulis individualized version untuk setiap single-character target book.

Character-focused version dapat mempertahankan:

- private knowledge;
- mistaken beliefs;
- personal emotional reactions;
- relationship-specific priorities;
- hal yang penting bagi satu participant.

Ini memerlukan AI requests tambahan. Shared character book menerima satu shared copy, bukan duplicate untuk setiap assigned character.

### 11.6 Tanggung jawab STLO

Memory Books menentukan:

- scene range;
- participants;
- summary content;
- books mana yang menerima copies;
- apakah individualized prompts digunakan.

STLO menentukan:

- kapan lorebook aktif;
- character mana yang dapat mengaktifkannya;
- priority, position, budget, dan ordering.

Saat STMB menetapkan character book, ia menambahkan avatar basename karakter ke `stlo.characterOverrides` dan mengaktifkan `stlo.onlyWhenSpeaking`, sambil mempertahankan STLO priorities, budgets, dan overrides yang sudah ada.

STMB memakai merge-only behavior. Menghapus atau mengganti assignment tidak otomatis menghapus STLO character override lama. Hapus obsolete overrides secara manual di STLO.

### 11.7 Filters dan books bukan privacy controls

Separate books dan filters meningkatkan relevansi. Mereka tidak menjamin bahwa:

- satu karakter tidak pernah menerima informasi karakter lain;
- model tidak pernah melihat canonical group version;
- previous-memory context terpartisi sempurna berdasarkan knowledge;
- character book hanya mewakili conscious knowledge.

Gunakan sebagai alat context routing, bukan security boundary.

### 11.8 Linked copies tidak live-synchronized

Linked entries berbagi metadata yang memungkinkan STMB mengenali event asli yang sama, tetapi edit berikutnya independen.

Mengedit, menghapus, atau compact satu copy tidak otomatis mengubah copy lain. Regenerating character copy juga hanya mengubah copy tersebut. Namun ketika regenerating canonical group entry, STMB bertanya apakah hanya entry itu atau entry tersebut bersama semua linked character entries harus diregenerate. Setiap selected entry mendapat generation dan approval review sendiri, sehingga character-focused prompts tetap character-focused.

### 11.9 Menambah, menghapus, atau mengassign ulang group member

Menambah karakter:

- assign book valid sebelum distributed Memory berikutnya;
- old Memories tidak disalin retroaktif;
- old filters tidak ditulis ulang;
- berikan historical context manual jika diperlukan.

Menghapus karakter:

- existing entries tetap ada;
- old filters dan STLO overrides tetap ada;
- linked copies tidak otomatis dihapus.

Mengubah book karakter:

- mengubah routing berikutnya;
- belum tentu menghapus karakter dari STLO overrides book lama.

### 11.10 Group consolidation

Canonical group book memakai automatic group-chat consolidation analysis prompt yang mengejar omniscient chronology sambil membedakan objective events dari individual knowledge.

Character books memakai consolidation preset yang dipilih di popup. Books dapat memiliki jumlah eligible sources berbeda. Book tanpa material cukup dapat dilewati dengan warning sementara book yang siap tetap berlanjut.

Scene yang hilang dari character book adalah chronology gap. Itu tidak membuktikan absence, ignorance, atau unconsciousness. Shared character book menerima satu consolidated entry.

---

## 12. Narrator Mode

### 12.1 Definisi

Narrator Mode digunakan untuk chat one-on-one SillyTavern biasa saat satu Narrator character card menulis beberapa fictional characters.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Tanpa Narrator Mode, SillyTavern melihat semua AI responses sebagai ditulis Narrator card. Narrator Mode menyediakan cast model manual sehingga STMB dapat mengasosiasikan scenes dan Memory Books dengan fictional characters di dalam prose Narrator.

Narrator Mode tidak tersedia di real SillyTavern group chat.

### 12.2 Required storage layout

Narrator Mode membutuhkan:

- Manual Lorebook Mode;
- satu **omniscient/canonical Memory Book** terpilih;
- satu unique Memory Book untuk setiap declared cast member.

Aturan:

- cast member tidak boleh memakai omniscient book;
- dua cast members tidak boleh berbagi book yang sama;
- setiap declared member harus memiliki available book;
- retired members mempertahankan identity dan reserved book assignment sampai direstore atau ditangani lain oleh implementasi;
- Auto-Create tidak kompatibel karena Narrator Mode bergantung pada Manual Lorebook Mode.

Berbeda dari advanced real-group layout, Narrator Mode tidak memerlukan STLO untuk active-character retrieval. STMB menyuntikkan books milik selected cast members ke active lorebook context selama generation.

### 12.3 Setup

1. Buka normal chat milik Narrator card.
2. Aktifkan Manual Lorebook Mode.
3. Pilih main manual book; ini omniscient Memory Book.
4. Aktifkan **Narrator Mode**.
5. Buka **Manage Narrator Cast**.
6. Tambahkan setiap fictional character berdasarkan nama dan assign unique Memory Book.
7. Gunakan floating **Active Cast** drawer untuk memilih karakter yang hadir dalam pertukaran berikutnya.

Narrator Mode harus dinonaktifkan sebelum Manual Lorebook Mode dapat dinonaktifkan.

### 12.4 Active Cast drawer dan timeline metadata

Floating Active Cast drawer dapat diexpand, dicollapse, dipindah, dan dipakai memilih current cast members.

Saat generation, STMB mengambil snapshot active cast dan menyimpannya di message metadata:

- user message menerima active-cast snapshot;
- Narrator response menerima generation snapshot;
- continuation menggabungkan cast dengan existing cast metadata;
- swipe metadata disimpan terpisah untuk setiap swipe;
- memilih swipe dapat memulihkan active cast dari titik timeline tersebut;
- menghapus recent messages dapat memulihkan cast state dari latest remaining tagged Narrator message.

Cast marker mencatat asosiasi, bukan semantic analysis terhadap prose.

### 12.5 Retrieval selama normal Narrator generation

Saat Narrator generation dimulai, STMB memuat Memory Books milik active cast dan menggabungkan entri mereka ke character-lore collection yang dipakai request tersebut, menghindari duplicate world/UID pairs.

Akibatnya:

- hanya active-cast books yang ditambahkan oleh workflow Narrator ini;
- omniscient book tetap mengikuti normal Manual Mode activation/configuration;
- per-character STLO filters tidak diwajibkan untuk Narrator Mode;
- cast selection harus benar sebelum generation jika character books yang benar diharapkan masuk context.

### 12.6 Scene participant detection

Untuk selected scene, tagged Narrator responses bersifat authoritative. STMB menggabungkan cast IDs yang ditempelkan pada Narrator-authored messages.

Jika scene mengandung untagged legacy Narrator messages, STMB fallback ke continuity information dari semua messages dan meminta pengguna mengonfirmasi scene cast. Current active cast members dipilih sebelumnya. Empty selection berarti tidak ada individual cast members yang hadir.

Confirmation ini khusus untuk legacy atau incomplete cast metadata; fully tagged scenes tidak memerlukannya.

### 12.7 Memory distribution

Narrator scene Memory ditulis sebagai:

- satu canonical omniscient entry di main Memory Book;
- satu linked copy di unique Memory Book milik setiap selected participant.

Narrator copies tidak memakai native SillyTavern character filters. Sebaliknya, STMB menyimpan Narrator participant dan owner IDs di entry metadata.

Jika separate multi-character prompts disabled, participant books menerima copies dari omniscient summary. Jika enabled, setiap single-character book dapat menerima character-focused generation.

### 12.8 Narrator consolidation dan regeneration

Narrator ownership dan participant metadata dibawa melalui consolidation sources. Dengan demikian higher-tier entries mempertahankan character book mana yang memiliki copy dan cast members mana yang berpartisipasi dalam material sumber.

Regeneration memakai metadata ini untuk menentukan apakah replacement prompt target omniscient/group-oriented atau character-focused.

Seperti real-group copies, linked Narrator entries tidak live-synchronized setelah dibuat.

### 12.9 Retiring cast members

Cast manager dapat menandai member sebagai retired dan memulihkannya kemudian. Retired members:

- dihapus dari active-cast choices;
- dihapus dari active-cast ID set;
- mempertahankan stable identity/history metadata;
- mempertahankan book reservation sehingga book tidak dipakai ulang secara tidak sengaja dan menggabungkan identity.

Gunakan retirement untuk karakter yang meninggalkan active cast tetapi historical Memory identity-nya harus tetap utuh.

---

## 13. Percabangan Chat

Native branches SillyTavern dapat menjadi continuity berbeda. Jika branch dan parent menulis ke unlocked Memory Books yang sama, timeline yang bertentangan dapat bercampur.

**Copy Memory Books when branching** enabled secara default.

### 13.1 Apa yang disalin

Saat STMB mengenali native branch yang baru dibuat:

- Automatic Mode menyalin active chat-bound Memory Book;
- Manual Mode menyalin main manual Memory Book;
- real group Manual Mode menyalin setiap unique unlocked character Memory Book;
- Narrator Mode menyalin omniscient book dan setiap declared character book;
- persistent real-character locks dipertahankan, bukan disalin, karena lock berarti “terus gunakan book yang sama ini.”

Semua book yang disalin dalam satu branch operation memakai available lineage number yang sama:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branching dari branch yang sudah ada mempertahankan lineage root asli, bukan membuat nama seperti `Branch 1 Branch 1`.

### 13.2 Metadata yang ditulis ulang

Di dalam copies, STMB:

- menulis ulang parent chat IDs yang cocok menjadi new branch chat ID;
- mengarahkan canonical group/character links jika kedua linked books disalin;
- memperbarui bindings branch baru agar menunjuk ke copies.

STMB mengkloning content yang ada; tidak meregenerate Memories.

### 13.3 Keamanan saat gagal

Jangan berpindah chat saat branch copying berlangsung.

Jika copying gagal, STMB menghapus inherited writable bindings milik branch baru dan mencatat failure agar branch tidak diam-diam menulis ke originals milik parent.

### 13.4 Menonaktifkan branch copies

Nonaktifkan setting ini hanya bila branch memang sengaja dimaksudkan untuk berbagi Memory Books dan riwayat berlanjut yang sama dengan parent.

---

## 14. Clips

Clip menyimpan selected chat text langsung ke entri lorebook `[STMB Clip]`. Tidak ada panggilan AI model.

### 14.1 Gunakan Clips untuk

- preference;
- promise atau secret;
- name atau alias;
- item atau pet;
- fakta relationship singkat;
- baris yang perlu dipertahankan persis atau hampir persis;
- “note to self” singkat yang tidak layak menjadi scene Memory.

### 14.2 Workflow

1. Sorot teks di dalam chat message.
2. Klik floating scissors button.
3. Pilih existing Clip entry atau buat yang baru.
4. Untuk entry baru, pilih always-active atau keyword-triggered behavior.
5. Tinjau current entry dan updated preview.
6. Rename bila perlu.
7. Save.

Floating scissors button hanya muncul setelah chat text dipilih dan dapat dinonaktifkan di main panel.

### 14.3 Format entry

Title:

```text
Seraphina Healed Me [STMB Clip]
```

Content:

```markdown
=== Seraphina Healed Me ===

- Seraphina menyembuhkan luka pengguna dengan sihir.

=== END Seraphina Healed Me ===
```

Satu Clip entry memiliki satu section. Title yang fokus mendukung activation keywords yang fokus.

### 14.4 Existing entries

Existing entry dapat diperlakukan sebagai Clip dengan menambahkan `[STMB Clip]` di akhir title. Clip entry yang panjang dapat diedit manual atau di-compact.

Clips hanya menyimpan teks yang dipilih. Source attribution tidak ditambahkan otomatis.

---

## 15. Topical Clips

Topical Clip membaca confirmed STMB Memory entries, explicit range messages dari current chat, atau keduanya, lalu meminta AI menghasilkan entri “about this topic” yang fokus. Eligible Memory sources dapat mencakup scene Memories dan consolidated summaries; Clip dan Side Prompt entries dikecualikan sebagai sumber.

### 15.1 Gunakan Topical Clip ketika

Informasi tentang satu subjek tersebar di beberapa Memories, misalnya:

- NPC yang berulang;
- riwayat relationship;
- location atau faction;
- investigation atau mystery;
- powers, injuries, promises, preferences, atau secrets;
- object penting;
- unresolved plot thread.

Topical Clip diorganisasi berdasarkan subjek, bukan chronology semua source Memory.

### 15.2 Batasan source

Topical Clip menggunakan:

- confirmed STMB Memory entries dari selected source book, termasuk eligible consolidated summaries;
- visible messages dari explicitly selected inclusive `X-Y` range di current chat.

Kontrol **Include saved Memories** dan **Include chat messages** dapat dipakai sendiri-sendiri atau bersama. Message ranges mengikuti global unhide-before-memory setting dan mengembalikan messages yang sebelumnya hidden setelah compilation.

Tidak menggunakan:

- chat messages di luar selected range;
- ordinary Clip entries;
- Side Prompt entries;
- unrelated ordinary lorebook entries.

### 15.3 Membuat Topical Clip

1. Buka Memory Books.
2. Klik **Topical Clip**.
3. Pilih source Memory Book.
4. Masukkan topic.
5. Masukkan activation keywords, atau biarkan kosong untuk memakai topic.
6. Pilih new entry atau existing `[STMB Clip]` update target.
7. Pilih saved Memories, chat messages, atau keduanya sebagai sources.
8. Opsional: pilih hanya source Memories tertentu dan/atau masukkan exact message range.
9. Pilih generation profile.
10. Generate draft.
11. Review dan edit.
12. Save hanya setelah benar.

Generated draft tidak pernah disimpan otomatis.

### 15.4 Memperbarui existing Topical Clip

Setelah run berhasil, STMB mencatat source Memories yang digunakan dan, jika relevan, source chat, message range, message IDs, dan hashes. Update berbasis Memory berikutnya biasanya hanya mengirim source Memories yang baru atau berubah bersama existing Clip content. Message ranges selalu dipilih eksplisit.

Gunakan **Rebuild from all source memories** ketika:

- current entry tidak lengkap atau berantakan;
- prompt berubah;
- Memories lama diedit secara substansial;
- seluruh topic perlu dipertimbangkan kembali.

### 15.5 Manual source selection dan token warnings

Gunakan **Use only selected memories** bila book besar, topic terbatas pada satu periode cerita, names saling overlap, atau evidence control ketat dibutuhkan.

STMB mengestimasi request size dan memperingatkan bila configured token threshold terlampaui. Kurangi sources, naikkan threshold dengan sengaja, atau pilih run once anyway.

### 15.6 Standar review

Pastikan draft:

- tetap fokus pada topic;
- mempertahankan names dan relationships;
- menyertakan major relevant facts;
- mengidentifikasi contradictions, bukan diam-diam memilih satu versi;
- tidak menciptakan explanations yang tidak didukung source Memories;
- menggabungkan updates tanpa duplicate yang tidak perlu.

### 15.7 Prompt placeholders

Custom Topical Clip prompt harus menyertakan `{{SOURCE_MEMORIES}}` saat saved Memories dipilih dan `{{SOURCE_MESSAGES}}` saat chat messages dipilih.

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Supported placeholders mencakup:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Gunakan Reset to Default jika custom prompt berhenti menghasilkan output berguna.

---

## 16. Prompt Sampingan

Side Prompt atau **Prompt Sampingan** adalah prompt STMB bernama yang berjalan terpisah dari normal character reply. Biasanya ia membuat atau memperbarui satu continuing support entry, bukan scene Memory berurutan lainnya.

Di daftar **Trackers & Side Prompts**, power icon langsung mengubah flag **Enabled** untuk seluruh prompt: hijau berarti enabled dan redup berarti disabled. Kontrol ini tidak menambah, menghapus, atau mengubah configured triggers milik prompt.

### 16.1 Penggunaan yang tepat

- tracker plot dan unresolved threads;
- relationship state;
- status NPC atau faction;
- inventory dan resources;
- injuries, statistics, atau reputation;
- timelines, dates, deadlines, dan travel;
- mystery clues, suspects, dan contradictions;
- inventions, research, dan projects;
- continuity-risk reports;
- world-state summaries.

Hindari prompt kabur seperti “track everything”, duplicate scene summaries, atau pekerjaan yang harus muncul dalam roleplay response berikutnya.

### 16.2 Output format

Side Prompts biasanya mengharapkan final plain text atau Markdown yang siap disimpan. Mereka tidak memerlukan Memory JSON. JSON hanya digunakan bila pengguna memang ingin menyimpan JSON sebagai tracker text.

### 16.3 Run sequence

Run tipikal menyusun:

1. Side Prompt instructions;
2. prior saved tracker entry, jika ada;
3. optional previous Memories;
4. optional Additional Context;
5. selected atau since-last scene text;
6. optional Response Format instructions.

Prior entry adalah existing state yang perlu direvisi, bukan bukti bahwa setiap old statement harus dipertahankan. Prompt harus secara eksplisit menghapus stale, resolved, contradicted, atau duplicate information.

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Names dengan spasi sebaiknya diberi tanda kutip. Supplied range bersifat inclusive.

Manual runs paling cocok untuk targeted analysis dan prompts yang memerlukan runtime macro values.

### 16.5 Automatic after-Memory runs

Side Prompt dapat mengaktifkan **Run automatically after memory**.

Chat kemudian menggunakan salah satu dari dua automatic selection modes:

- individually enabled Side Prompts; atau
- satu selected Side Prompt Set.

Selected set menggantikan individually enabled automatic prompts untuk chat tersebut. Ia tidak menambahkan di atasnya.

#### Memory Assistance Side Prompt

**Memory Assistance** adalah reserved Side Prompt dengan empat mode independen. Ia berjalan setelah Memories berhasil disimpan tanpa bergantung pada ordinary Side Prompt enablement atau selected Side Prompt Set. Ia tidak berjalan selama Memory regeneration.

Memory Assistance membandingkan raw processed scene dengan ordinary dan Topical Clips di setiap Memory Book yang menerima Memory. Ia mengirim title/topic, keywords, current content, stable ID, dan type dari setiap reviewed Clip ke AI.

Saat job queue tersedia, setiap target Memory Book menerima job **Memory Assistance** terpisah setelah Memory disimpan. Error pada request, response-validation, report-save, atau automatic-application menandai job itu **Failed** dan menampilkan error di queue. Saved Memory tetap **Completed**, dan retrying Memory Assistance tidak meregenerate Memory.

- **Off** menonaktifkan Memory Assistance.
- **Update** langsung meninjau lima Clips atau kurang; lebih dari lima membuka selection list. Proposed changes menunggu manual approval.
- **Update and Suggest** terlebih dahulu menjalankan satu topic-discovery request, lalu workflow existing-Clip review yang sama seperti Update.
- **Automatic** meninjau setiap Clip dalam token-based batches tanpa menanyakan Clips mana yang ditinjau. Ia langsung menerapkan valid ordinary Clip additions, sementara Topical Clip replacements tetap pending untuk approval di **Memory Assistance Suggestions**.

- Dalam Update dan Update and Suggest, selection list yang lebih besar menyediakan **Query Selected** dan **Query All**.
- Query All dan Automatic menggunakan token-based batches alih-alih memaksa semua Clip ke satu oversized request.
- Setiap ordinary Clip menerima paling banyak satu exact message excerpt yang diusulkan sebagai addition.
- Topical Clips menerima complete replacement drafts.
- AI response adalah simple JSON object yang memetakan setiap affected Clip UID langsung ke suggested excerpt atau replacement. Empty object berarti tidak ada Clip yang perlu diupdate.
- Hasil Update ditulis ke `Memory Assistance (STMB SidePrompt)` dan tetap unapplied sampai disetujui melalui **Memory Assistance Suggestions**.
- Hasil Automatic-mode mencatat berapa ordinary Clip additions yang diterapkan dan mempertahankan Topical Clip replacements serta application failures untuk manual review.
- Membatalkan selection menghapus older suggestions agar tidak dikira sebagai hasil dari scene terbaru.

Update and Suggest memakai suggestion-only prompt terpisah sebelum existing-Clip review batches. Request berisi processed scene dan lightweight list title, topic, dan keywords dari existing Topical Clips. Saat discovery, ia tidak mengirim ordinary Clips atau existing Clip bodies. AI mengembalikan nol sampai lima topic baru sebagai JSON objects berisi topic dan activation keywords; `{"topics":[]}` adalah hasil valid.

Suggested topics disimpan di Memory Assistance report. Di **Memory Assistance Suggestions**, pilih **Review Topics** untuk melihatnya sebagai checked, editable rows. Anda dapat uncheck topic yang tidak diinginkan, mengedit topic names atau keywords, atau menambahkan topic lain. Confirmed topics membuka standard Topical Clip draft workflow satu per satu. Pending topic hanya dihapus setelah Topical Clip-nya disimpan; menutup draft membiarkannya tersedia melalui **Memory Assistance Suggestions**.

Saat reviewable suggestions siap, STMB membuka completion popup untuk updated Memory Book. **Dismiss** menutup notice, sedangkan **Go to Suggestions** membuka **Memory Assistance Suggestions** dengan Memory Book itu sudah dipilih. Membuka **Memory Assistance Suggestions** dari extension menu memilih effective Memory Book current chat terlebih dahulu: chat-bound book di Automatic Mode atau resolved manual book di Manual Mode.

Prompt Update dan Topic Suggestions serta connection-profile override dapat diedit secara independen, tetapi kedua structured response contracts tetap fixed. Memory Assistance tidak dapat dihapus, diduplicate, dimasukkan ke Side Prompt Set, atau dijalankan manual.

### 16.6 Automatic visible-message intervals

Side Prompt dapat mengaktifkan **Run on visible message interval** dan menentukan jumlah visible messages sejak checkpoint.

Hidden dan system messages tidak dihitung.

Saat set aktif, hanya rows di set tersebut yang referenced prompt-nya memiliki interval trigger yang sesuai yang menjadi kandidat.

### 16.7 Side Prompt Sets

Side Prompt Set adalah ordered run list, bukan sekadar folder. Template yang sama dapat muncul lebih dari sekali dengan macro values berbeda.

Contoh:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Rows dapat menyimpan:

- prompt reference;
- optional label;
- runtime macro values;
- order;
- duplicate atau delete actions.

Rows berjalan dari atas ke bawah.

Manual set commands:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default sets dan per-chat selection

General Settings dapat menentukan:

- default set untuk solo chats;
- default set untuk group chats.

Setiap chat dapat:

1. mewarisi default yang sesuai;
2. secara eksplisit memakai individually enabled prompts;
3. memilih named set.

Empty global default berarti individual mode.

Jika selected set dihapus, STMB memperingatkan, bukan diam-diam mengganti workflow. Missing row prompt atau unresolved macro menyebabkan row itu dilewati dengan warning.

Set memilih candidate rows. Setiap referenced Side Prompt tetap memerlukan automatic trigger yang relevan untuk after-Memory atau interval execution. Manual set commands tidak memerlukan trigger checkboxes tersebut.

### 16.9 Macros

Side Prompts dapat memakai normal SillyTavern macros seperti:

```text
{{user}}
{{char}}
```

Placeholder `{{...}}` non-standard adalah runtime macros. Nilainya harus diberikan manual atau disimpan di set row.

Contoh:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Prompt dengan unresolved runtime macros tidak dapat berjalan otomatis. Automatic runs tidak dapat berhenti untuk meminta nilai.

### 16.10 Memory-count macros

STMB mendaftarkan integer macros untuk effective main Memory Book:

| Macro | Count |
|---|---|
| `{{memtier0}}` | scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

Effective main book adalah chat-bound book dalam Automatic Mode atau resolved main manual book dalam Manual Mode. Dalam multi-book group atau Narrator setup, count tidak menjumlahkan semua character books.

Count macro hanya memberi angka, bukan content entri-entri itu.

### 16.11 Message ranges

Explicit range memakai tepat inclusive range tersebut. Tanpa range, STMB memakai since-last checkpoint/cap behavior milik Side Prompt.

Gunakan explicit ranges untuk debugging, targeted cleanup, atau rerunning section tertentu.

### 16.12 Additional Context dan previous Memories

Side Prompt dapat menyertakan hingga tujuh previous scene Memories.

Sumber Additional Context-nya dapat berupa:

- none;
- **Follow chat**, memakai Context Setting yang dipilih chat;
- satu fixed named Context Setting.

Ini reference materials. Prompt tidak boleh menyalinnya mentah ke tracker tanpa alasan.

### 16.13 Lorebook targets

Side Prompt biasanya menyimpan ke effective Memory Book. Sebagai alternatif dapat memakai:

1. per-chat target override;
2. template-level target;
3. effective Memory Book sebagai fallback.

Valid per-chat override menang.

Gunakan alternate target untuk shared campaign book yang memang disengaja atau dedicated tracker book. Jangan menyebar tracker tanpa retrieval plan.

### 16.14 Side Prompt entry controls

Template dapat mengatur:

- title override;
- keywords;
- Normal, Constant, atau Vectorized activation;
- insertion position dan Outlet name;
- order mode/value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Title dan keyword fields dapat meng-expand applicable macros. **Ignore Budget** sebaiknya jarang digunakan karena banyak tracker always-included dapat menghabiskan context besar.

### 16.15 Connection profile override

Side Prompt dapat mewarisi normal Memory Books connection resolution atau bind specific STMB profile. Override berguna untuk model lebih murah atau yang lebih baik pada structured maintenance. Terlalu banyak kombinasi profile menyulitkan troubleshooting.

### 16.16 Side Prompt regeneration

Compatible saves kini menyimpan version-2 snapshot berisi:

- Side Prompt template key;
- prior entry content untuk regeneration;
- apakah entry sudah ada sebelum run dan exact prior entry state-nya, tanpa rollback snapshot yang lebih lama;
- source chat dan inclusive range;
- runtime macro values;
- fingerprint dari exact entry state yang ditulis STMB.

Untuk regenerate, buka lorebook editor dan klik **Regenerate side prompt**. Replacement memakai saved snapshot dengan current template dan current profile/context settings.

Regeneration tidak dapat selesai jika template dihapus, source chat/range tidak tersedia, atau target/source berubah selama generation. Hanya content yang diganti; existing title, keywords, dan entry settings tetap. Legacy version-1 snapshots masih mendukung regeneration, tetapi tidak dapat dipakai oleh Memory Auto-Rollback.

### 16.17 Menulis Side Prompt yang baik

Side Prompt yang baik menentukan:

- maintenance job yang tepat;
- source material apa yang ditinjau;
- apakah revise, replace, merge, atau append;
- stale information yang harus dihapus;
- stable output headings dan ordering;
- strict length limit;
- final-output-only behavior.

Contoh:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

Useful guards:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

Stable headings mengurangi drift pada repeated updates.

### 16.18 Side Prompt troubleshooting

Jika prompt tidak berjalan:

- pastikan event Memory atau interval benar-benar terjadi;
- inspect individual/set selection chat;
- pastikan referenced prompt masih ada;
- pastikan automatic trigger yang relevan enabled;
- pastikan semua runtime macros memiliki nilai;
- cek apakah `/stmb-stop` atau failed job membatalkannya.

Jika berjalan dua kali:

- cek manual plus automatic invocation;
- duplicate set rows;
- duplicate prompt copies;
- multiple tabs atau chats yang memicu work.

Jika salah book menerima output, inspect per-chat dan template-level target scopes.

Jika output tumbuh tanpa batas, tambahkan explicit replacement, pruning, item-count, dan word-count rules.

---

## 17. Consolidation

Consolidation menggabungkan lower-tier STMB Memories atau summaries menjadi higher-tier chronological recaps.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation bekerja dari existing STMB entries, bukan langsung dari raw chat.

### 17.2 Tujuan

Gunakan ketika:

- scene Memories mulai menumpuk;
- material lama tidak lagi memerlukan full scene detail;
- fase relationship, plot, atau campaign besar selesai;
- token use perlu dikurangi sambil menjaga continuity;
- diperlukan higher-level chronology yang lebih bersih.

Consolidated entries harus menekankan lasting changes, turning points, goals, consequences, relationship shifts, unresolved threads, dan stable state.

### 17.3 Manual workflow

1. Buka **Consolidate Memories**.
2. Konfirmasi Source Memory Book yang ditampilkan. Pilih book lain jika configured manual atau chat-bound book bukan consolidation source yang diinginkan. Pilihan ini hanya berlaku untuk current run dan tidak mengubah configured Memory Book chat.
3. Pilih target tier.
4. Pilih eligible source entries.
5. Pilih consolidation prompt/profile settings.
6. Tentukan apakah source entries akan disabled setelah consolidation berhasil.
7. Run dan review candidates.
8. Approve summaries yang diinginkan.

### 17.4 Readiness prompts bukan automatic consolidation

**Prompt for consolidation when a tier is ready** memantau selected target tiers. Saat saved minimum eligible count tercapai, STMB menampilkan yes/later prompt. Memilih Yes membuka consolidation interface. Ia tidak diam-diam melakukan consolidation.

### 17.5 Consolidation output schema

Ordinary consolidation mengharapkan strict JSON:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

Model dapat mengembalikan satu atau beberapa summaries. `member_ids` mengassign setiap source ke returned summary. Outliers ditempatkan di `unassigned_items`, bukan dipaksa masuk recap yang tidak terkait.

### 17.6 Previous higher-tier summary

Previous summary pada target tier dapat diberikan sebagai canon context. Ia bukan source material untuk ditulis ulang. Consolidation prompts harus membedakannya dari lower-tier entries yang diproses.

### 17.7 Previews dan failed responses

Consolidation previews dapat memungkinkan editing, accepting, regenerating one candidate dari sources yang sama, atau regenerating pending batch.

Malformed atau failed AI responses dapat diinspect dan, bila didukung, dikoreksi manual sebelum commit.

### 17.8 Source disabling

Saat enabled, STMB menonaktifkan source entries setelah consolidation berhasil agar higher-tier summary mengambil alih retrieval. Ini dapat dibalik lewat lorebook editing.

### 17.9 Prompt consolidation yang baik

Harus menentukan:

- compression target;
- apakah membuat satu recap atau jumlah coherent recap paling sedikit;
- chronology dan grouping logic;
- detail yang wajib bertahan;
- penanganan outliers eksplisit;
- exact JSON structure.

Harus mempertahankan major beats, consequences, promises, relationship changes, identifiers, unresolved threads, dan retrieval-friendly keywords sambil menghapus repeated scene-level detail.

---

## 18. Compaction

Compaction meminta AI memendekkan satu existing STMB-managed entry dan menampilkan original serta draft sebelum replacement.

### 18.1 Eligible entries

- `[STMB Clip]` entries;
- Side Prompt entries;
- STMB Memory entries.

Ordinary non-STMB lorebook entries tidak ditampilkan.

### 18.2 Workflow

1. Buka **Compaction**.
2. Pilih Memory Book.
3. Pilih Compaction Profile.
4. Opsional edit Compaction Prompt.
5. Pilih satu entry.
6. Bandingkan original dan compacted token estimates/content.
7. Edit draft bila perlu.
8. Replace, copy draft, atau cancel.

Original tidak berubah sampai **Replace with Compacted Version** dipilih.

### 18.3 Penggunaan yang baik

- koleksi Clip panjang;
- tracker content yang repetitif atau stale;
- scene Memories yang terlalu bertele-tele;
- always-active entries yang menghabiskan terlalu banyak context.

Compaction bukan untuk menambah facts, meringkas raw chat, membuat Memory baru, atau memproses ordinary lorebook entries.

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Prompt harus mempertahankan facts, names, pronouns, macros, wrapper headings, dan end markers sambil menghapus redundancy dan low-value wording.

---

## 19. Regeneration

Regeneration membuat reviewable replacement untuk existing entry. Ia tidak membuat second numbered entry dan tidak pernah overwrite tanpa approval.

### 19.1 Scene Memory regeneration

- buka source chat;
- buka Memory Book di lorebook editor;
- klik **Regenerate memory**;
- untuk canonical group entry dengan linked character entries, pilih regenerate hanya clicked entry atau semua linked entries;
- pilih current profile, prompt, previous-memory count, dan Additional Context;
- review title, content, dan keywords untuk setiap selected entry.

Original scene range dan sequence number dipertahankan. Linked entries memakai ulang selected regeneration settings yang sama tetapi generated terhadap Memory Book context masing-masing dan group/character prompt target. STMB mengumpulkan semua approvals sebelum mulai menyimpan direct regenerations. Jika semua source messages hidden, tampilkan mereka atau enable unhide-before-generation.

### 19.2 Consolidation regeneration

Higher-tier summary diregenerate dari exact linked lower-tier sources menggunakan preset khusus **Regenerate Consolidation**.

Full source set harus masih ada pada tier yang benar. Lower-tier source tidak dapat diregenerate sementara active parent summary bergantung padanya; hapus parent terlebih dahulu bila memang ingin membangun ulang lower tier.

### 19.3 Side Prompt regeneration

Lihat aturan Side Prompt snapshot di Bagian 16.16.

### 19.4 Safety checks

Tepat sebelum replacement, STMB memverifikasi bahwa:

- target entry tidak berubah;
- source chat range tidak berubah;
- required consolidation sources tidak berubah dan tersedia;
- entry masih eligible.

Jika salah satu check gagal, tidak ada yang dioverwrite.

Linked group, character, dan Narrator copies tetap independen.

---

## 20. Context untuk Generasi

Beberapa context sources dapat muncul dalam STMB request. Mereka tidak dapat dipertukarkan.

### 20.1 Current scene

Message range yang sedang diproses. Ini target material untuk ordinary scene Memory.

### 20.2 Previous Memories

Earlier scene Memories dari effective Memory Book, disertakan sebagai read-only continuity context. Pengguna biasanya dapat menyertakan 0–7.

Mereka tidak boleh diringkas ulang hanya karena muncul sebelum current scene.

### 20.3 Additional Context

Selected lorebook entries sebagai stable reference material, misalnya:

- character atau setting rules;
- canonical names dan terminology;
- campaign constraints;
- authoritative timeline;
- location references;
- facts yang diasumsikan tetapi tidak diulang dalam scene.

Additional Context muncul sebelum previous Memories dan scene transcript. Ini reference material, bukan scene lain.

### 20.4 Context Settings

Context Setting adalah reusable ordered collection dari Additional Context entries.

Workflow:

1. buka **Context Settings**;
2. buat named setting;
3. pilih lorebook entries;
4. atur urutannya;
5. pilih setting untuk current chat atau secara eksplisit pilih No Context.

Selection disimpan per chat dan bekerja dengan Current SillyTavern Settings maupun saved profiles.

Jika referenced book atau entry hilang, STMB memperingatkan, melewati stale reference, dan melanjutkan. Jika seluruh Context Setting dihapus, chats yang merujuknya berlanjut tanpa Additional Context sampai selection baru dibuat.

Context Settings dapat diduplicate, diimport, dan diexport sebagai `stmb-context-settings.json`.

### 20.5 Prior Side Prompt entry

Current tracker text yang akan direvisi. Ini state, bukan bukti bahwa semua old statements masih valid.

### 20.6 Consolidation sources

Lower-tier entries yang benar-benar menjadi material untuk grouping dan compression.

### 20.7 Previous higher-tier summary

Canon yang dibawa ke depan saat consolidation. Bukan source untuk ditulis ulang.

### 20.8 Urutan yang benar per workflow

Ordinary Memory:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompts harus memberi label target material dan reference-only material secara jelas.

---

## 21. Arsitektur Prompt, Summary Prompt Bawaan, dan Aturan Penulisan

STMB memiliki tiga structured generation systems utama plus beberapa auxiliary workflows yang lebih fokus.

### 21.1 Ordinary Memory generation

STMB mengharapkan satu JSON object:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Aturan:

- return hanya JSON object;
- gunakan exact keys `title`, `content`, dan `keywords`;
- `keywords` harus JSON array of strings;
- title singkat dan readable;
- gunakan concrete retrieval terms;
- taruh Markdown yang diinginkan di dalam string `content`;
- escape quotation marks dengan benar.

STMB dapat memperbaiki sebagian fences, trailing commas, think tags, wrappers, atau minor malformed output, tetapi prompt tidak boleh bergantung pada recovery.

Memory prompt yang kuat menyatakan:

1. desired memory style dan compression level;
2. continuity-relevant information yang harus dipertahankan;
3. filler, OOC, atau unsupported material yang harus dihilangkan;
4. exact JSON schema.

Prompt lemah menetapkan style tanpa structure, meminta analysis bukan final object, mencampurkan previous context dengan current scene, atau memakai abstract keywords.

### 21.2 Built-in Summary Prompts dan memilihnya

Preset ini hanya untuk ordinary Memory generation. Mereka tidak mengontrol Consolidation, Side Prompts, Topical Clips, atau Compaction. Profile memilih satu di **Memory Creation Method**. **Summary** adalah ordinary fallback/default bila profile tidak menentukan preset lain. Built-in berarti disediakan STMB; bukan berarti semua preset berjalan atau semuanya sama cocok untuk satu chat.

Tidak ada universal best prompt, karena detail, readability, retrieval quality, dan token cost saling tarik-menarik. Jawaban praktis singkat:

- **Default awal terbaik untuk kebanyakan pengguna: Summary.** Seimbang, general-purpose, dan cocok untuk test pertama dengan model baru.
- **Terbaik untuk long-running roleplay yang continuity-heavy: Comprehensive.** Filtering, causality, continuity, dan keyword guidance paling kuat, tetapi lebih menuntut model dan dapat menghasilkan structured Memory lebih besar.
- **Terbaik bila hemat context tokens paling penting: Minimal.** Sengaja singkat dan akan kehilangan nuance.
- **Terbaik untuk separate real-group atau Narrator character books: Group dan Character.** Gunakan bersama lewat separate group/character prompt setting di profile; ini targeting prompts, bukan competing general-purpose styles.

| Built-in prompt | Paling cocok untuk | Trade-off utama |
|---|---|---|
| **Summary** | Kebanyakan solo chats dan first-time setup. Menghasilkan detailed chronological narrative prose dengan important events, interactions, developments, revelations, outcomes, dan concrete retrieval keywords. | Menjaga detail lebih banyak dari kebutuhan user token-minimal, tetapi lebih sederhana dari preset paling structured. |
| **Comprehensive** | Cerita panjang sensitif continuity ketika causal chains, character dynamics, established facts, key exchanges, unresolved threads, dan disciplined keywords penting. Secara eksplisit memfilter incidental detail dan memperbaiki keyword construction. | Instruksi paling panjang dan demanding. Gunakan model instruction-following yang mampu dan response tokens cukup. |
| **Summarize** | User yang menginginkan Markdown sangat scannable dibagi Timeline, Story Beats, Key Interactions, Notable Details, dan Outcome. | Bullet-heavy output lebih mirip reference notes daripada natural memory dan dapat mengulang facts antar headings. |
| **Synopsis** | Scene ketika hampir setiap significant beat, interaction, detail, dan outcome lebih penting daripada compactness. | Sengaja panjang dan comprehensive; sangat tidak cocok bila lorebook/context budget sempit. |
| **Sum Up** | Chronological narrative beat record dengan scene heading dan timeline terlihat, tetapi section overhead lebih sedikit dari Summarize atau Synopsis. | Pemisahan events, character dynamics, facts, dan continuity state kurang eksplisit. |
| **Minimal** | High-volume chats, inexpensive archival coverage, atau setup yang membutuhkan Memories sangat kecil. Menghasilkan Memory singkat 2–5 kalimat. | Motives, emotional shifts, causality, dan minor continuity details dapat hilang. |
| **Northgate** | Creative-writing users yang ingin coherent third-person past-tense literary record dengan actions, emotional shifts, development, dan significant dialogue. Community style ini dikreditkan kepada Northgate di SillyTavern Discord. | Mengoptimalkan readable narrative, bukan maximum compression atau clearly separated reference categories. Built-in text tidak secara eksplisit mengecualikan OOC, jadi review bila OOC umum. |
| **Aelemar** | Major plot scenes dan emotionally consequential character moments yang harus tetap dipahami sebagai standalone record meski source scene tidak tersedia. Community style ini dikreditkan kepada Aelemar di SillyTavern Discord. | Memerlukan sedikitnya 300 words dan sengaja detail, jadi tidak cocok untuk aggressive token saving. Built-in text juga tidak secara eksplisit mengecualikan OOC. |
| **Group** | Shared/omniscient Memory Book dalam real group, atau omniscient target dalam multi-book workflow. Menjaga group decisions/state sambil mengatribusikan actions, emotions, dan knowledge ke member yang benar. | Jangan gunakan sebagai individual character Memory; sengaja fokus pada shared group continuity. |
| **Character** | Satu character-focused Memory Book dalam real-group atau multi-character workflow. Mencatat apa yang dilakukan, diketahui, dirasakan, dipelajari, disembunyikan, disalahpahami, atau dialami target character. | Sengaja menghilangkan material scene yang tidak relevan untuk target character dan membatasi unsupported private knowledge. |

Untuk instalasi baru, gunakan **Summary** sampai generation dan retrieval bekerja andal. Lalu ubah hanya prompt dan bandingkan beberapa Memories dari scene serupa. Pilih **Comprehensive** bila masalahnya omitted causality, continuity state, atau weak keywords; pilih **Minimal** bila masalahnya ukuran Memory. Mengganti prompt tidak dapat memperbaiki weak model, truncated output, poor scene boundaries, atau incorrect retrieval settings.

Exact built-in text dapat dibuat ulang untuk current SillyTavern locale. Recreating built-ins menghapus local edits pada built-ins itu tetapi tidak seharusnya menghapus unrelated custom presets. Duplicate atau export built-in yang dimodifikasi sebelum recreate.

### 21.3 Multi-character prompt targeting

Saat separate group/character prompts enabled, STMB menandai request target sebagai:

- `group` untuk canonical real-group atau omniscient Narrator Memory;
- `character` untuk satu individual character-book version.

Prompt harus secara eksplisit memakai target perspective tanpa menciptakan knowledge yang tidak didukung scene dan supplied context.

### 21.4 Side Prompt authoring

Side Prompts biasanya return plain text atau Markdown. Tulis sebagai maintenance instructions, bukan Memory prompts.

Side Prompt yang kuat:

- mendefinisikan satu narrow job;
- menjelaskan cara memakai previous tracker;
- menghapus stale state;
- menetapkan stable headings dan length limits;
- hanya return final tracker.

### 21.5 Consolidation authoring

Ordinary consolidation membutuhkan schema pada Bagian 17.5. Prompt yang kuat:

- menjaga chronology;
- membuat coherent summaries sesedikit mungkin;
- mengassign setiap used source melalui `member_ids`;
- mengidentifikasi leftovers melalui `unassigned_items`;
- menjaga major changes dan unresolved continuity;
- memakai concrete keywords.

Preset khusus **Regenerate Consolidation** hanya untuk satu replacement summary dan tidak dapat dipilih sebagai normal consolidation default.

### 21.6 Topical Clip authoring

Prompt harus menyertakan `{{SOURCE_MEMORIES}}`, tetap fokus pada requested topic, membedakan source evidence dari inference, menggabungkan new material ke existing Clip content, dan menampilkan contradictions.

### 21.7 Compaction authoring

Prompt harus menyertakan `{{ENTRY_CONTENT}}` dan memendekkan tanpa menambah unsupported facts. Ia harus menjaga structural wrappers dan macros yang dibutuhkan entry.

### 21.8 Checklist penulisan prompt

Sebelum menyelesaikan STMB prompt, jawab:

1. Material apa yang benar-benar menjadi analysis target?
2. Material mana yang hanya reference-only?
3. Apakah path ini mengharapkan strict JSON atau final plain text?
4. Informasi apa yang harus bertahan untuk retrieval kemudian?
5. Apa yang harus dihilangkan, digabungkan, dibawa ke depan, atau dibiarkan unassigned?

Return-format correctness lebih penting daripada style.

---

## 22. Summary Prompt Manager dan Consolidation Prompt Manager

### Summary Prompt Manager

Dapat create, edit, duplicate, delete, import, dan export ordinary Memory prompt presets. Assign preset melalui Memory Books profile.

Semua ordinary Memory presets harus mempertahankan required Memory JSON schema.

Lihat Bagian 21.2 untuk panduan memilih built-in Summary Prompt dan best-use cases.

### Consolidation Prompt Manager

Mengontrol prompts yang dipakai untuk mengelompokkan lower-tier entries menjadi higher-tier summaries dan memilih normal default consolidation prompt.

Preset consolidation khusus regeneration tidak dapat digunakan untuk ordinary consolidation.

### Import dan localization behavior

Built-in prompts dapat dibuat ulang dalam current app locale. Backup locally modified built-ins sebelum recreate.

---

## 23. STMB dan Ekstensi Lain

Ekstensi SillyTavern berjalan berdampingan dan dapat membaca atau mengubah data SillyTavern yang sama. STMB tidak mengesampingkan atau menonaktifkan ekstensi lain, dan tidak menetapkan prioritas atas ekstensi tersebut. Jika perilaku ekstensi saling tumpang tindih, hasil akhirnya bergantung pada pengaturan dan waktu tindakan setiap ekstensi yang terlibat.

### 23.1 Visibilitas pesan bersama

Status tersembunyi suatu pesan chat merupakan bagian dari status pesan bersama milik SillyTavern. Status tersebut bukan milik STMB secara eksklusif.

Pengaturan **Token Saving** STMB dapat menyembunyikan pesan yang sudah diproses setelah sebuah Memory disimpan. Ekstensi lain dapat menampilkan kembali pesan tersebut, dan STMB tidak akan mencegahnya. Demikian pula, **Unhide hidden messages for memory generation** dapat menampilkan pesan saat STMB memproses atau meregenerasi selected range.

### 23.2 Presence

Ekstensi Presence dan STMB sama-sama dapat mengubah status tersembunyi atau terlihat dari pesan chat. Jika Presence menampilkan pesan yang disembunyikan STMB, pengaturan Token Saving STMB tidak dihapus atau diabaikan; tindakan Presence yang terjadi kemudian telah mengubah status pesan SillyTavern yang sama.

Jika Anda menggunakan Presence dan ingin pesan yang disembunyikan STMB tetap tersembunyi, gunakan fitur penguncian pesan tersembunyi milik Presence. Saat ini Presence menyediakan perintah `/presenceLockHiddenMessages` untuk tujuan tersebut. Jalankan perintah itu untuk range pesan yang berlaku dan ulangi saat range tersebut bertambah. Lihat dokumentasi Presence untuk perilaku perintah terbaru.

STMB tidak mengonfigurasi atau menjalankan Presence secara otomatis, dan pengelolaan peserta group chat oleh STMB tidak terkait dengan Token Saving.

### 23.3 Integrasi Regex

STMB terintegrasi dengan Regex extension SillyTavern pada dua tahap:

1. **Outgoing/User Input:** transform assembled prompt sebelum dikirim.
2. **Incoming/AI Output:** membersihkan atau menstandarkan raw response sebelum parsing/saving.

Aktifkan **Use regex (advanced)**, lalu buka **Configure regex** dan pilih satu atau lebih scripts untuk tiap arah.

Penting: selection milik STMB sendiri mengontrol execution. Script yang dipilih STMB dapat berjalan bahkan jika script itu disabled dalam interface normal Regex extension.

Gunakan Regex hanya jika transform dipahami. Outgoing rule yang buruk dapat merusak required schema instructions; incoming rule yang buruk dapat merusak JSON yang sebenarnya valid.

---

## 24. Judul Entri Lorebook dan Kebijakan Karakter

### 24.1 Title placeholders

Format title profile dapat memakai:

- `{{title}}` — title buatan AI;
- `{{scene}}` — source range;
- `{{char}}` — nama character/group;
- `{{groupname}}` — display name group saat ini; menjadi `Unknown` di luar group chat;
- `{{present}}` — comma-separated characters yang hadir dalam scene: individual speakers di group chat, selected Active Cast scene di Narrator Mode, atau current character di regular character chat;
- `{{user}}` — nama user;
- `{{messages}}` — jumlah message dalam scene;
- `{{profile}}` — nama profile;
- date dan time placeholders yang didukung.

### 24.2 Auto-numbering

Numbering tokens yang didukung mencakup bentuk seperti:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB menetapkan angka berurutan dengan zero-padding sesuai format terpilih.

### 24.3 Printable Unicode

Semua printable Unicode characters diizinkan dalam title, termasuk emoji, accented text, CJK, dan symbols. Unicode control characters U+0000–U+001F dan U+007F–U+009F dihapus.

Nama file lorebook yang dipakai Auto-Create disanitasi terpisah untuk filesystem-reserved characters dan length.

---

## 25. Job Queue dan Kontrol Retry

Queue opsional membutuhkan Chat Top Bar / Chat Top Info Bar. Saat queue tersedia, regenerating Memory, consolidation, atau Side Prompt membuat regeneration job; replacement tetap dalam review sampai disetujui.

Drawer **Memory Books Jobs** dapat menampilkan:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs yang memproses chat range menampilkan starting dan ending message numbers di queue rows. Drawer juga dapat cancel active work, membuka kembali review jobs, inspect failures, retry work, dan dismiss terminal history rows.

Retry scopes:

- **Retry:** rerun satu non-Memory job, misalnya Side Prompt atau consolidation job.
- **Retry All:** rerun/resume Memory dan associated after-Memory Side Prompt work. Jika Memory sudah tersimpan, STMB dapat resume dari hasil itu alih-alih menduplikasinya.
- **Retry Memory:** rerun/resume hanya Memory dan sengaja skip after-Memory Side Prompts.

Gunakan Retry All untuk memulihkan combined workflow; gunakan Retry Memory bila tracker work tidak boleh berjalan.

Tanpa Chat Top Bar, STMB tetap menjalankan normal workflows tetapi tidak memiliki queue UI.

---

## 26. Umpan Balik Visual dan Aksesibilitas

STMB menyediakan visual states untuk scene controls, termasuk inactive, selected, valid range, in-scene, dan processing states. Warna tepat bergantung pada theme SillyTavern.

Dukungan accessibility mencakup:

- keyboard navigation;
- focus indicators;
- ARIA attributes;
- reduced-motion behavior;
- mobile-friendly controls.

Saat mengajar dari screenshot, jelaskan icon dan label yang terlihat, bukan bergantung pada warna tertentu.

---

## 27. Peta Pengaturan dan Referensi Pengaturan Saat Ini

Bagian ini adalah settings map. Ia menunjukkan lokasi setiap user-facing STMB configuration control dan fungsinya. Bagian ini juga mencantumkan saved controls dan one-run controls penting di specialized interfaces. One-time content fields yang hanya dipakai untuk membuat Clip, Topical Clip, Compaction, atau preview tertentu didokumentasikan pada workflow masing-masing dan tidak diulang di sini.

Jalur awal umum:

**magic-wand Extensions menu di samping chat input → Memory Books**

Semua path di bawah dimulai dari **Memory Books** main panel kecuali secara eksplisit bertuliskan **SillyTavern**. Control dapat tersembunyi atau disabled bila tidak berlaku untuk chat, provider, profile, atau storage mode saat ini.

Scope yang digunakan:

- **Global:** berlaku di seluruh STMB kecuali dioverride setting lebih sempit.
- **Per chat:** disimpan untuk chat atau group saat ini.
- **Per character:** mengikuti character card di compatible chats.
- **Per profile/template/setting:** disimpan dalam reusable object tersebut.
- **Per run:** hanya memengaruhi operation yang sedang disiapkan.

### 27.1 Main panel: storage, chat mode, dan active profile

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; book choice per chat | Berhenti memakai normal chat-bound lorebook sebagai automatic target STMB dan mengharuskan Memory Book dipilih untuk current chat. Tidak dapat enabled bersama Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; visible di Manual Mode | Per chat | Memilih main Memory Book yang menerima Memories untuk chat ini. Dalam Narrator Mode ini omniscient book. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; visible di real group dengan Manual Mode | Per chat | Menetapkan separate Memory Book bagi setiap real-group member. STLO dibutuhkan untuk mengonfigurasi assignment dan character-filtered retrieval behavior terkait. |
| **Character Memory Book lock** | Lock icon di samping character Memory Book assignment | Per character | Menjaga character card tetap assigned ke Memory Book yang sama di compatible Manual Mode chats. Unlock sebelum mengubah assignment. |
| **Narrator Mode** | **Current Lorebook Configuration**; hanya normal non-group chats | Per chat | Memakai selected manual book sebagai omniscient Memory Book dan mengaktifkan declared fictional cast dengan unique books sendiri. Manual Mode dan omniscient book diwajibkan. |
| **Manage Narrator Cast** | Di bawah **Narrator Mode**; juga dari Active Cast drawer | Per chat | Menambah, retire, restore, dan mengassign unique Memory Books ke declared Narrator characters. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Dalam Automatic Mode, membuat dan bind lorebook bila chat belum memilikinya. Tidak dapat enabled bersama Manual Mode. |
| **Lorebook Name Template** | Tepat di bawah **Auto-create lorebook if none exists** | Global | Memberi nama auto-created books. Mendukung `{{char}}`, `{{user}}`, `{{chat}}`. Hanya digunakan saat Auto-Create Lorebook Mode enabled. |
| **Memory profile selection** | **Memory Profiles** selector | Per run | Memilih profile untuk Memory berikutnya dan profile actions di dekatnya. Selection saja tidak mengubah saved default. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Menjadikan selected profile sebagai default untuk automatic Memories dan workflow lain kecuali confirmation, Side Prompt override, atau workflow-specific choice memilih profile lain. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**, atau **Profile Actions → Edit Profile** | Per profile | Memformat new Memory entry titles dan optional numbering dengan title macros. Main-panel control mengedit format default profile; **Edit Profile** mengubah selected profile langsung. |

### 27.2 General Settings

Buka **Settings → General Settings** di main panel.

| Setting | Scope | Fungsi |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Melewati normal pre-generation confirmation window. Wajib untuk non-interactive catch-up; independent warnings dan enabled previews masih dapat muncul. |
| **Automatically accept detected participants in future** | Global | Berhenti meminta real-group participant confirmation dan menerima detected participant set STMB untuk Memories berikutnya. |
| **Show memory previews** | Global | Membuka editable review sebelum menyimpan generated Memories dan applicable Side Prompt output. |
| **Show consolidation previews** | Global | Membuka review controls untuk generated consolidation candidates sebelum commit. |
| **Show notifications** | Global | Mengaktifkan STMB toast notifications. |
| **Show floating Clip button when text is highlighted** | Global | Menampilkan floating scissors control setelah chat text dipilih. |
| **Memory boundary indicator** | Global | Menampilkan neither control, processed-boundary divider, draggable jump button, atau keduanya. |
| **Allow scene overlap** | Global | Mengizinkan selected scene range overlap dengan message IDs yang sudah diwakili existing Memory. |
| **Refresh lorebook editor after adding memories** | Global | Refresh lorebook editor terbuka setelah STMB menulis entries agar content baru langsung terlihat. |
| **Copy Memory Books when branching** | Global | Memberi native chat branch independent copies dari active unlocked chat-bound atau manual Memory Books. Character-locked books tetap shared sesuai desain. |
| **Auto-rollback after message deletion** | Global | Mengaktifkan coordinated rollback bila message deletion atau truncation mengenai chat material yang sudah processed. Disabled secara default. Ordinary message edits dan swipes tidak memicunya. |
| **Update last message ID processed** | Global; Auto-Rollback action | Memindahkan processed checkpoint ke akhir Memory terbaru yang masih bertahan, atau membersihkannya bila tidak ada yang tersisa. |
| **Delete last Memory** | Global; Auto-Rollback action | Menghapus semua Memory yang invalid dalam rollback scope beserta linked copies-nya. Penghapusan Memory dan consolidation irreversible. |
| **Restore previous Side Prompts** | Global; Auto-Rollback action | Mengembalikan setiap affected Side Prompt yang tidak berubah ke latest exact before-state. Hanya satu rollback level yang disimpan. |
| **Default for solo chats** | Global | Memilih Side Prompt Set yang diwarisi solo chats setelah Memory. Empty selection memakai individually enabled after-Memory Side Prompts. |
| **Default for group chats** | Global | Memilih Side Prompt Set yang diwarisi real group chats setelah Memory. Empty selection memakai individually enabled after-Memory Side Prompts. |
| **Max Response Tokens** | Global | Mengoverride maximum output length untuk STMB generation. Naikkan jika JSON valid terpotong; `0` membiarkan normal provider/SillyTavern behavior tersedia sebagai fallback. |
| **Token Warning Threshold** | Global | Menampilkan confirmation warning bila estimated input request melampaui threshold. Tidak mengubah model context limit. |
| **Default Previous Memories Count** | Global | Mengatur default 0–7 prior Memories yang diberikan sebagai continuity context untuk new Memory. Run dapat override di **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Mengaktifkan regex-processing selection milik STMB. Selection ini terpisah dari apakah underlying SillyTavern regex script enabled di interface normal. |
| **Configure regex… → Outgoing scripts** | Global | Memilih scripts yang dijalankan STMB pada material sebelum dikirim ke generation provider. |
| **Configure regex… → Incoming scripts** | Global | Memilih scripts yang dijalankan STMB pada returned material sebelum parsing dan saving. |

#### Memory Auto-Rollback di General Settings

**Auto-rollback after message deletion** adalah master preference. Tiga action checkboxes dapat dipilih independen, enabled secara default, dan secara visual disabled ketika master switch off. Karena itu existing installation tidak langsung mulai menghapus apa pun hanya karena upgrade.

Auto-Rollback hanya bereaksi pada message deletion atau truncation, termasuk deletion phase saat response regeneration. Ordinary edit atau swipe tidak memicu. STMB melacak actual message identities dalam setiap chat karena deletion event value SillyTavern tidak dapat secara andal mengidentifikasi middle deletion.

Untuk tail deletion, setiap Memory dengan stored source range yang beririsan dengan removed suffix akan affected. Untuk deletion di tengah chat, STMB meminta salah satu dari tiga pilihan:

- **Full rollback** menghapus affected Memory dan semua Memory yang lebih baru.
- **Affected only** hanya menghapus overlapping Memories, mempertahankan newer Memories, lalu menggeser stored ranges, relevant Side Prompt checkpoints, dan processed checkpoint sebesar deletion count. Ini sengaja meninggalkan permanent gap dalam Memory coverage.
- **Cancel** tidak membuat perubahan Memory Books.

Rollback memakai exact `STMB_chatId`, source-range, dan canonical/link metadata di available Memory Books. Canonical group atau Narrator Memory dan semua discoverable linked copies adalah satu deletion unit. Missing canonical copies, ambiguous legacy entries tanpa chat identity yang cukup, malformed ranges, atau incomplete consolidation dependencies menghentikan seluruh rollback dan memberi repair guidance; STMB tidak menebak ownership.

Jika **Delete last Memory** dipilih, STMB melakukan preflight pada setiap direct dan transitive consolidation parent di tiap affected Memory Book. Satu combined confirmation mencantumkan consolidations yang harus dihapus. Membatalkan confirmation itu juga membatalkan checkpoint, Memory, dan Side Prompt changes. Approval menghapus consolidation ancestors, re-enable setiap existing direct source yang disabled oleh deleted consolidation dan membersihkan backlink `disabledBySummaryId`, lalu menghapus selected base Memories. Entries yang disabled secara independen oleh user tidak di-enable.

Sebelum save, STMB memeriksa ulang complete lorebook fingerprints. Lorebooks ditulis melalui normal serialized write lanes dalam sorted order, dan unchanged pre-write clones disimpan untuk compensating saves bila book berikutnya gagal. Chat checkpoint metadata baru diubah setelah semua lorebook writes berhasil. Queued work untuk chat dibatalkan sebelum preflight; active non-queued Memory creation diizinkan selesai sebelum rollback lanjut.

Side Prompt rollback memakai version-2 regeneration snapshots. Setiap snapshot mencatat apakah entry existed, exact prior state tanpa older rollback snapshot, source chat/range, dan fingerprint dari state yang ditulis STMB. Jika rolled-back run membuat entry, rollback menghapusnya. Jika current entry tidak lagi cocok dengan saved fingerprint, STMB menganggap user atau later run sudah mengubahnya dan membiarkannya. Version-1 snapshots tetap mendukung regeneration tetapi tidak cukup aman untuk rollback dan dilewati dengan warning. Successful restore mengonsumsi snapshot, jadi Side Prompt itu tidak bisa di-rollback lagi sampai run berikutnya. Jika beberapa Memories di-rollback bersama, hanya latest available before-state untuk setiap Side Prompt yang dapat dipulihkan; informasi dari older rolled-back runs mungkin tetap ada.

#### Token Saving di dalam General Settings

Kontrol berikut ada lebih bawah dalam popup **General Settings** di bawah **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Memilih no automatic hiding, semua processed messages hingga latest Memory, atau hanya range yang dipakai latest Memory. Hiding reversible dan tidak menghapus messages. |
| **Messages to leave unhidden** | Global | Membiarkan sejumlah recent messages tetap visible ketika auto-hiding untuk overlap dekat Memory boundary. `0` hide sampai applicable scene end. |
| **Unhide hidden messages for memory generation** | Global | Menjalankan equivalent `/unhide X-Y` untuk source range sebelum STMB compile. Selected auto-hide mode menentukan apa yang dihide kembali setelah save berhasil. |

### 27.3 Automatic Memories dan consolidation reminders

Buka **Settings → Automatic Memories**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Auto-create memory summaries** | Global | Mengaktifkan automatic `/nextmemory`-style Memory creation. Tanpa processed baseline, STMB saat ini dapat mulai pada message 0; first manual Memory tetap direkomendasikan untuk validasi setup dan deliberate starting boundary. |
| **Auto-Summary Interval** | Global | Mengatur berapa messages membentuk normal automatic cadence. |
| **Auto-Summary Buffer** | Global | Mengecualikan sejumlah newest messages dari automatic range yang sudah siap agar generation sedikit tertinggal dari live conversation. |
| **Prompt for consolidation when a tier is ready** | Global | Menampilkan yes/later prompt ketika monitored tier mencapai saved eligible-source minimum. Tidak pernah melakukan consolidation diam-diam. |
| **Auto-Consolidation Tiers** | Global | Memilih target tiers yang dipantau readiness prompts. Minimum tiap tier disimpan di **Consolidate Memories**. |

### 27.4 Profile editor

Pilih profile di **Memory Profiles**, lalu buka **Profile Actions → Edit Profile**. Setting ini **per profile** kecuali dinyatakan lain. Built-in **Current SillyTavern Settings** profile sengaja mengunci fields yang dikontrol SillyTavern.

| Setting | Fungsi |
|---|---|
| **Profile Name** | Menamai reusable STMB profile. Built-in profile name locked. |
| **API/Provider** | Memilih current SillyTavern routing, supported provider, Custom OpenAI-compatible connection, atau Full Manual Configuration. |
| **Use this connection profile** | Untuk **Custom OpenAI-Compatible API**, memakai active SillyTavern Custom connection atau satu named Custom connection. Saved URL dan secret digunakan sementara STMB **Model** tetap model override. |
| **Skip structured output and use plain-text completion** | Berhenti mengirim structured-output schema bila provider menolaknya. Selected prompt tetap harus membuat model mengembalikan required valid JSON STMB. |
| **Use ST's ChatCompletionService** | Meroute supported requests melalui built-in Chat Completion request helper SillyTavern. Tidak tersedia bagi Full Manual profiles. |
| **Chat Completion Preset** | Opsional menerapkan SillyTavern Chat Completion preset melalui ChatCompletionService. |
| **Model** | Memberikan exact model ID untuk profile. **Current SillyTavern Settings** membaca active model SillyTavern. |
| **Temperature** | Mengatur generation randomness. **Current SillyTavern Settings** membaca active temperature SillyTavern. |
| **Use reverse proxy** | Meneruskan configured reverse-proxy details SillyTavern untuk supported providers; dalam Full Manual Configuration secret field dilabeli proxy password. |
| **API Endpoint URL / API Key** | Memberikan separate direct endpoint dan credential hanya untuk **Full Manual Configuration**. Untuk penggunaan normal, utamakan connection yang configured/tested di SillyTavern. |
| **Memory Creation Method** | Memilih Summary Prompt preset untuk ordinary Memory generation. Prompt content dikelola di **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Menggunakan distinct prompt presets untuk group Memory Book dan character-focused Memory Books. |
| **Group Summary Prompt / Character Summary Prompt** | Memilih dua presets saat separate group/character prompting enabled. |
| **Memory Title Format** | Mengontrol title text, macros, dan automatic numbering untuk Memories dari profile ini. |
| **Activation Mode** | Menyimpan new entries sebagai **Normal** keyword activation, **Constant**, atau **Vectorized**. |
| **Insertion Position** | Memilih lokasi generated entry relatif terhadap Character, Example Messages, Author's Note, atau named Outlet. |
| **Outlet Name** | Menamai target Outlet dan hanya muncul jika **Insertion Position** = **Outlet**. |
| **Insertion Order** | **Auto** menurunkan order dari Memory number; **Manual** memakai fixed value; **Reverse** menghitung mundur dari starting value dan hanya dimaksudkan untuk Outlets. |
| **Prevent Recursion** | Mencegah content generated entry memicu lorebook entries lain saat recursive scanning. |
| **Delay Until Recursion** | Mencegah generated entry aktif pada first scan pass. Biarkan off bila tidak ada yang lain dapat memulai recursion. |
| **Also include** | Hanya legacy-profile compatibility. Older profiles dapat menampilkan ordered lorebook references; current configuration memakai per-chat **Context Settings**. |

Active SillyTavern provider, model, temperature, connection preset, dan reverse proxy dikonfigurasi di connection controls SillyTavern sendiri, bukan STMB. **Current SillyTavern Settings** membaca live values tersebut.

### 27.5 Context Settings

Buka **Settings → Context Settings**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Additional Context for this chat** | Per chat | Memilih named Context Setting, secara eksplisit menyimpan **No Context**, atau membiarkan unset agar STMB dapat prompt ketika migrated context memerlukan keputusan. |
| **Context Setting Name** | Per Context Setting | Menamai reusable Additional Context collection. |
| **Additional Context entries and order** | Per Context Setting | Memilih lorebook entries yang dikirim sebagai stable reference material dan menentukan order. Missing entries diperingatkan dan dilewati. |

**New**, **Duplicate**, **Delete**, **Import JSON**, dan **Export JSON** mengelola Context Settings; tidak mengubah generation behavior sampai setting dipilih oleh chat atau Side Prompt.

### 27.6 Trackers & Side Prompts

Buka **Settings → Trackers & Side Prompts**.

| Setting | Location dan scope | Fungsi |
|---|---|---|
| **After-memory side prompt mode for this chat** | Manager main screen; per chat | Memakai matching solo/group default, explicitly individually enabled after-Memory prompts, atau satu named Side Prompt Set. |
| **How many concurrent prompts to run at once** | Manager main screen; global | Membatasi simultaneous Side Prompt jobs ke 1–10. |
| **Side Prompt Set Name** | **New Set** atau edit set; per set | Menamai reusable ordered group dari Side Prompt runs. |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row; per set | Memilih template row, optional display/title label, literal atau set-level runtime macro values, dan menggunakan row order sebagai execution order. |
| **Enabled** | **New** atau edit ordinary Side Prompt; per template | Membuat template eligible saat chat memakai individually enabled after-Memory prompts. Trigger settings tetap menentukan kapan berjalan. |
| **Run on visible message interval / Interval** | Side Prompt editor; per template | Menjalankan setelah configured number visible messages. Automatic triggers tidak tersedia saat template membutuhkan unresolved runtime macros. |
| **Run automatically after memory** | Side Prompt editor; per template | Menjalankan template setelah successful Memory, tunduk pada chat Side Prompt mode atau selected set. |
| **Allow manual run via `/sideprompt`** | Side Prompt editor; per template | Mengizinkan explicit manual execution. |
| **Prompt / Response Format** | Side Prompt editor; per template | Mendefinisikan instruction dan optional output structure. Kedua fields dapat memakai supported Side Prompt macros. |
| **Previous memories for context** | Side Prompt editor; per template | Menyertakan 0–7 previous Memory entries sebelum selected source messages. |
| **Use additional context / Additional Context Source** | Side Prompt editor; per template | Menyertakan Additional Context dan mengikuti current chat Context Setting atau selalu memakai fixed named setting. |
| **Lorebook Target** | Side Prompt editor; per template atau per chat | Menyimpan output ke normal Memory Book atau chosen lorebook lain. Saat diubah, STMB bertanya apakah pilihan berlaku hanya untuk chat ini atau template ke depan. |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor; per template | Opsional mengontrol upserted entry title template dan comma-separated activation keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor; per template | Mengontrol activation dan placement entri lorebook Side Prompt. |
| **Insertion Order / Order Value** | Side Prompt editor; per template | Memakai automatic Memory-number ordering atau fixed manual order value. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor; per template | Menerapkan corresponding SillyTavern lorebook-entry recursion dan budget flags. |
| **Override default memory profile / Connection Profile** | Side Prompt editor; per template | Meroute Side Prompt ini melalui selected STMB profile alih-alih current default profile. |
| **Memory Assistance Mode** | Edit **Memory Assistance**; global | **Off** menonaktifkan; **Update** mengusulkan perubahan existing Clips; **Update and Suggest** juga menemukan Topical Clip topics; **Automatic** langsung menerapkan ordinary Clip additions tetapi menyisakan Topical Clip replacements untuk approval. |
| **Update Prompt / Topic Suggestions Prompt** | Edit **Memory Assistance**; per built-in template | Mengontrol dua AI tasks. Response contracts tetap fixed. |
| **Use a connection profile override** | Edit **Memory Assistance**; per built-in template | Menggunakan selected STMB profile untuk Memory Assistance alih-alih default. |

### 27.7 Prompt managers

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** atau edit | Per preset | Mendefinisikan reusable ordinary-Memory prompt. Profile menggunakannya hanya setelah **Memory Creation Method** atau group/character prompt selection menunjuk ke preset itu. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Memilih normal prompt yang dipreselect oleh **Consolidate Memories**. Regeneration-only dan group-only presets tidak dapat dipilih. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** atau edit | Per preset | Mendefinisikan reusable consolidation instructions. Dedicated regeneration dan group presets dibatasi untuk workflows tersebut. |

### 27.8 Topical Clip dan Compaction defaults

Buka **Settings → Topical Clip** atau **Settings → Compaction**.

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**, atau **Compaction → Compaction Profile** | Global shared default | Memilih STMB profile untuk Topical Clip generation dan Compaction. Mengubah di salah satu interface mengubah shared selection bagi keduanya. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Menyimpan custom prompt template untuk Topical Clip generation. **Reset to Default** kembali ke current built-in prompt. Required source macros divalidasi sebelum save atau generation. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Menyimpan custom prompt template untuk memendekkan existing Memory, Clip, dan Side Prompt entries. **Reset to Default** kembali ke current built-in prompt. `{{ENTRY_CONTENT}}` wajib. |

Memory Book, topic, keywords, source inclusion, source selection, message range, draft, dan entry yang dipilih untuk Compaction adalah per-run workflow choices, bukan persistent settings.

### 27.9 Consolidate Memories controls

Buka **Consolidate Memories** dari tombol di bagian bawah main panel. Interface ini mencampurkan saved defaults dan one-run choices.

| Setting | Scope | Fungsi |
|---|---|---|
| **Source Memory Book** | Per run | Menampilkan Memory Book yang sedang di-consolidate dan memungkinkan memilih available book lain. Mengubahnya reload eligible-entry list tanpa mengubah configured manual atau chat-bound Memory Book chat. |
| **Target tier** | Per run | Memilih higher tier yang dibuat dan karena itu immediately lower eligible source tier. |
| **Consolidation Prompt** | Per run | Memilih prompt untuk consolidation ini; awalnya memakai default dari Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Membatasi berapa lower-tier entries dikirim dalam satu analysis pass. |
| **Token Budget** | Per run | Mengatur approximate input budget untuk batching consolidation. |
| **Number of automatic summary attempts** | Per run | Membatasi repeated analysis passes untuk memperoleh usable assignments dan summaries. |
| **Saved minimum eligible entries** | Global, disimpan terpisah per target tier | Mengatur kapan chosen tier dianggap ready dan mengontrol automatic readiness prompt tier itu. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | Mengontrol cara newly consolidated entries disimpan. Terpisah dari ordinary Memory profile entry settings. |
| **Disable selected source entries after creating summaries** | Per run | Menonaktifkan successfully consolidated sources setelah commit agar higher-tier summaries dapat menggantikan mereka di retrieval. Tidak menghapus. |
| **Selected source entries** | Per run | Memilih eligible lower-tier entries yang diproses. Unchecked entries tidak diubah. |

### 27.10 Related SillyTavern World Info settings

Kontrol ini berada di luar STMB, dalam World Info/lorebook settings SillyTavern, tetapi memengaruhi apakah saved Memories diretrieve selama ordinary chat generation.

| Setting | Fungsi |
|---|---|
| **Match Whole Words** | Mengontrol keyword boundary matching. Off adalah common starting point untuk flexible Memory keywords. |
| **Scan Depth** | Mengontrol seberapa banyak recent text discan untuk lorebook activation. Nilai relatif tinggi seperti 8 adalah common starting point. |
| **Max Recursion Steps** | Membatasi recursive World Info activation. Sekitar 2 adalah common starting point. |
| **Context percentage / lorebook budget** | Membatasi berapa context yang boleh ditempati lorebook entries. Naikkan hanya dengan mempertimbangkan total context model dan competing prompt material. |

Ini rekomendasi, bukan hard requirements; lihat Bagian 10 untuk retrieval diagnosis.

---

## 28. Referensi Slash Command

### Memory commands

```text
/creatememory
```

Membuat Memory dari currently marked scene.

```text
/scenememory X-Y
```

Menetapkan inclusive range dan membuat Memory, misalnya `/scenememory 10-15`.

```text
/nextmemory
```

Membuat Memory dari message setelah highest processed boundary sampai current eligible end.

```text
/stmb-catchup interval=x start=y end=z
```

Memproses existing long chat dalam consecutive chunks.

### Side Prompt commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-boundary commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency stop

```text
/stmb-stop
```

Menghentikan semua in-flight STMB generation di mana pun, termasuk Side Prompts. Work yang sudah committed tetap tersimpan.

---

## 29. Pemecahan Masalah Berdasarkan Tahap

### 29.1 Extension/UI tidak dimuat

Gejala:

- Memory Books hilang dari magic-wand menu;
- chevrons hilang;
- tidak ada floating Clip button setelah selection.

Periksa:

1. extension installed dan enabled;
2. page reloaded;
3. character/group chat terbuka;
4. tunggu hingga sepuluh detik;
5. expand message actions;
6. inspect console hanya setelah pemeriksaan tersebut gagal.

### 29.2 Tidak ada scene terpilih

**►** dan **◄** keduanya wajib untuk marked scene. Verifikasi Current Scene di panel.

Jika range overlap existing Memory, pilih range lain atau enable Allow Scene Overlap.

### 29.3 Tidak ada valid Memory Book

Automatic Mode:

- bind lorebook ke chat; atau
- enable Auto-Create.

Manual Mode:

- pilih main manual book;
- perbaiki deleted selection;
- unlock broken character lock sebelum mengubahnya.

Real multi-book group:

- STLO harus tersedia;
- setiap required member memerlukan valid assignment;
- group book tidak boleh dipakai kembali sebagai character book.

Narrator Mode:

- Manual Mode harus enabled;
- omniscient book harus selected;
- setiap declared member memerlukan unique non-omniscient book.

### 29.4 AI gagal menghasilkan valid Memory

Periksa dengan urutan ini:

1. provider/model/profile valid;
2. response tidak truncated;
3. maximum response tokens cukup;
4. selected prompt masih meminta exact JSON;
5. schema tidak dirusak Regex;
6. provider mendukung selected structured-output mode;
7. coba Skip Structured Output hanya jika provider menolak schemas;
8. coba model yang lebih instruction-following sebelum menulis ulang prompt;
9. klik **Raw response from AI** pada persistent error notification untuk inspect captured provider response dan gunakan manual JSON correction interface bila tersedia.

Penyebab umum termasuk code fences, commentary, missing key, keywords bukan array, refusal text, atau cut-off output.

### 29.5 Memory tersimpan tetapi messages menghilang

Kemungkinan mereka auto-hidden. Ubah Token Saving settings. Hidden messages tidak dihapus.

### 29.6 Automatic Memories tidak berjalan

Periksa:

- Auto-create memory summaries enabled;
- cukup messages setelah highest processed boundary;
- interval plus buffer requirement terpenuhi;
- tidak ada postpone checkpoint yang masih aktif;
- valid Memory Book tersedia;
- tidak ada Memory job lain yang memblokir trigger;
- current chat tidak diganti selama work;
- group generation selesai sebelum trigger diharapkan.

First manual Memory direkomendasikan tetapi secara teknis tidak wajib di current version.

### 29.7 Memory ada tetapi tidak activate

Periksa:

- correct book active;
- entry enabled;
- relevant keywords;
- activation mode;
- budget;
- recursion dan Delay Until Recursion;
- STLO routing bila digunakan;
- World Info inspection/logs.

Jangan regenerate Memory sampai retrieval diuji.

### 29.8 Entry dikirim tetapi diabaikan

Ini model-use behavior. Kemungkinan tindakan:

- buat Memory lebih pendek dan eksplisit;
- perbaiki insertion position/priority;
- kurangi competing context;
- gunakan OOC reminder;
- pilih model yang lebih andal mengikuti supplied context.

### 29.9 Side Prompt tidak berjalan

Lihat Bagian 16.18. Secara khusus, selected set menekan individually enabled prompts di luar set tersebut.

### 29.10 Consolidation tidak memunculkan prompt

Verifikasi:

- readiness prompt enabled;
- target tier dipilih untuk monitoring;
- cukup eligible source entries tersedia;
- sources tidak sudah disabled/ineligible;
- saved minimum count untuk tier tercapai.

### 29.11 Regeneration button disabled

Hover atau inspect alasan yang ditampilkan. Penyebab umum:

- entry mendahului required snapshot metadata;
- source chat/range tidak tersedia;
- source entries hilang atau wrong tier;
- active parent consolidation memblokir lower source;
- original sequence number tidak dapat ditentukan;
- Side Prompt template dihapus.

### 29.12 Branch tidak menyalin books

Periksa:

- Copy Memory Books when branching enabled sebelum branch dibuat;
- itu native SillyTavern branch;
- source books ada dan dapat diload;
- chat tidak diganti selama copying;
- branch belum pernah ditandai completed/failed;
- locked books sengaja dipertahankan alih-alih disalin.

### 29.13 Cast Narrator Mode salah

Periksa:

- Active Cast selection sebelum generation;
- apakah message adalah continuation yang merge cast metadata;
- apakah swipe memulihkan older cast state;
- apakah scene mengandung legacy untagged messages yang memerlukan confirmation;
- apakah declared character retired;
- apakah setiap character book masih ada.

---

## 30. FAQ

### Apakah saya memerlukan vectors?

Tidak. Keyword activation sudah cukup dan dihasilkan otomatis. Vectors opsional.

### Apakah Memories sebaiknya memakai lorebook terpisah?

Biasanya ya untuk organization, budgeting, reuse, dan diagnosis, tetapi tidak wajib.

### Apakah STMB menghapus messages?

Tidak. Ia dapat menyembunyikan processed messages dari active context.

### Bisakah STMB digunakan sepenuhnya manual?

Ya. Tandai scenes dan buat Memories hanya saat diinginkan.

### Bisakah Automatic Memories membuat Memory pertama?

Ya di STMB saat ini. Tanpa processed baseline, ia mulai dari message 0 setelah interval plus buffer terpenuhi. First manual run tetap direkomendasikan untuk memverifikasi setup dan memilih desired starting boundary.

### Apakah consolidation berjalan otomatis?

Tidak. STMB dapat prompt saat tier ready, tetapi user mengonfirmasi dan mereview operation.

### Bisakah satu real group memakai satu Memory Book?

Ya. Ini recommended starting setup dan tidak memerlukan STLO.

### Kapan separate real-group character books berguna?

Ketika individual continuity, knowledge, speaker-specific retrieval, atau character-focused summaries sepadan dengan extra setup dan AI requests.

### Apakah Narrator Mode sama dengan Group Chat Mode?

Tidak. Group Chat Mode membaca separate SillyTavern character-card authors. Narrator Mode secara manual mendeklarasikan fictional characters yang ditulis satu Narrator card.

### Apakah Narrator Mode memerlukan STLO?

Tidak untuk active-cast retrieval path-nya. Namun membutuhkan Manual Lorebook Mode, satu omniscient book, dan unique per-character books.

### Apakah linked copies tersinkronisasi?

Tidak. Mereka linked untuk origin/consolidation metadata, bukan continuous mirroring.

### Mengapa Delay Until Recursion biasanya sebaiknya off?

Jika tidak ada lorebook entry lain yang memulai recursion, delayed Memory entry mungkin tidak pernah activate.

### Apa yang dilakukan setelah Memory pertama berhasil?

Verifikasi entry retrieval, lalu enable automatic Memories, pilih interval/buffer, enable token hiding, dan tambahkan Clips atau narrowly defined Side Prompt hanya saat dibutuhkan. Gunakan Topical Clip dan Consolidation setelah cukup Memories terkumpul.

---

## 31. Kompatibilitas, Migrasi, dan Catatan Historis Saat Ini

Bagian ini mempertahankan hanya history yang memengaruhi penggunaan saat ini.

### Current baseline

- Current documented release: v8.5.0, 1 Agustus 2026.
- SillyTavern requirement: 1.14.0 atau lebih baru.
- Narrator Mode ditambahkan di v8.5.0.
- Branch book copying, Side Prompt regeneration, dan character Memory Book locks ditambahkan di v8.4.0.
- Multi-character real-group Memory distribution hadir di v8.0.0.
- Additional Context berpindah dari profiles ke reusable per-chat Context Settings di v7.0.0; older profile context dimigrasikan.
- Topical Clip ditambahkan di v6.10.0.
- Compaction dan Clips ditambahkan di v6.6.0.
- Side Prompt Sets dan per-prompt targets ditambahkan dalam periode v6.4–v6.5.
- Consolidation menjadi multi-tier Arc-through-Epic system di v6.0.0; older Arc metadata dimigrasikan.
- Job Queue integration ditambahkan di v6.8.0 dan tetap opsional.
- Current profile defaults memakai Delay Until Recursion disabled kecuali user/profile secara eksplisit mengubahnya.

### Existing Memories dari versi lama

Hanya entries dengan flag `stmemorybooks` dan required metadata yang dikenali sebagai STMB Memories. Gunakan lorebook converter yang disediakan untuk older entries yang mendahului current metadata.

### Removed functionality

Old bookmark feature dihapus dari Memory Books di v4.0.0 dan dipisahkan dari core extension. Jangan ajarkan Memory Books bookmark controls sebagai current behavior.

### Localized built-ins

Built-in prompts dapat diregenerate sesuai active SillyTavern language. Backup customized built-ins sebelum recreation.

### Import behavior

Side Prompt import bersifat additive. Existing prompts dipertahankan; imported key conflicts direname alih-alih menimpa existing prompt.

---

## 32. Catatan Pengembang dan Lisensi

Memory Books menggunakan Bun untuk bundling/minification.

```sh
bun run build
```

Instal pre-commit build hook repository dengan:

```sh
bun run install-hooks
```

Hook melakukan build sebelum commit, men-stage build artifacts, dan membatalkan commit jika build gagal.

Memory Books Copyright © 2024–2026 Aiko Hanasaki dan dilisensikan di bawah GNU Affero General Public License v3.0. Versi modifikasi harus mempertahankan notices yang berlaku, mengidentifikasi modifications, dan mematuhi persyaratan AGPL source-availability.

---

## 33. Pohon Keputusan Diagnostik Ringkas

```text
Pengguna berkata “Memory Books tidak berfungsi.”
│
├─ Apakah menu/control terlihat?
│  ├─ Tidak → installation/loading/UI checks.
│  └─ Ya
│
├─ Bisakah scene dipilih?
│  ├─ Tidak → expand message actions; set kedua chevrons; inspect overlap.
│  └─ Ya
│
├─ Apakah ada valid effective Memory Book?
│  ├─ Tidak → bind, auto-create, select manual, atau repair multi-book bindings.
│  └─ Ya
│
├─ Apakah generation return valid complete output?
│  ├─ Tidak → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ Ya
│
├─ Apakah entry ada di intended book?
│  ├─ Tidak → save/rollback/permission/job failure.
│  └─ Ya
│
├─ Apakah SillyTavern activate dan send kemudian?
│  ├─ Tidak → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ Ya
│
└─ Apakah model memakai supplied entry?
   ├─ Tidak → model compliance, placement, competing context, entry clarity.
   └─ Ya → workflow berfungsi.
```

---

## 34. Urutan Pengajaran Minimum yang Direkomendasikan

Untuk user baru, ajarkan hanya urutan ini terlebih dahulu:

1. Buka magic-wand menu dan temukan Memory Books.
2. Gunakan Automatic Mode dengan bound book atau enable Auto-Create.
3. Pilih Current SillyTavern Settings.
4. Expand message actions dan tandai short complete scene dengan **►** dan **◄**.
5. Buat dan preview satu Memory.
6. Buka Memory Book dan verifikasi saved entry.
7. Verifikasi entry dapat activate kemudian.
8. Enable automatic Memories dan pilih interval/buffer.
9. Enable auto-hide hanya setelah menjelaskan bahwa hidden messages tidak dihapus.
10. Perkenalkan Clips, lalu Side Prompts, lalu Topical Clip/Consolidation hanya ketika user punya kebutuhan konkret.

Jangan mulai dengan custom prompts, Full Manual endpoints, multiple character books, Regex, atau consolidation kecuali problem user memang memerlukannya.

---

## 35. Ringkasan Konsep Akhir

Memory Books adalah external continuity pipeline yang dibangun di atas lorebook SillyTavern:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

Sistem bekerja paling baik ketika:

- scenes coherent;
- prompts jelas membedakan target dari reference context;
- JSON workflows mengembalikan exact schemas;
- keywords concrete;
- Memory Books deliberately assigned dan activated;
- long-running trackers memangkas stale state;
- consolidation mengurangi old detail tanpa menghapus continuity;
- users memverifikasi retrieval alih-alih menganggap saved berarti sent;
- advanced multi-book routing digunakan hanya ketika precision-nya sepadan dengan complexity.
