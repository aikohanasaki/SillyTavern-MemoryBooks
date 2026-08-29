<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Manual Rujukan AI Lengkap

**Produk:** SillyTavern Memory Books (STMB)  
**Versi rujukan:** v8.5.0, 1 Ogos 2026  
**Tujuan:** Satu sumber rujukan tunggal yang padat untuk pembantu AI yang mengajar, menerangkan, dan menyelesaikan masalah Memory Books.

---

## Kandungan

- [1. Cara Pembantu AI Menggunakan Manual Ini](#1-cara-pembantu-ai-menggunakan-manual-ini)
- [2. Definisi Produk dan Model Mental](#2-definisi-produk-dan-model-mental)
- [3. Istilah Teras dan Pemilihan Ciri](#3-istilah-teras-dan-pemilihan-ciri)
- [4. Keperluan, Pemasangan dan Pengesahan Awal](#4-keperluan-pemasangan-dan-pengesahan-awal)
- [5. Membuka Memory Books dan Memahami Panel Utama](#5-membuka-memory-books-dan-memahami-panel-utama)
- [6. Mode Penyimpanan Memory Book](#6-mode-penyimpanan-memory-book)
- [7. Profil, Sambungan dan Penghalaan Penjanaan](#7-profil-sambungan-dan-penghalaan-penjanaan)
- [8. Babak, Memori Manual, Memori Automatik dan Catch-Up](#8-babak-memori-manual-memori-automatik-dan-catch-up)
- [9. Penjimatan Token, Mesej Tersembunyi dan Sempadan Memori](#9-penjimatan-token-mesej-tersembunyi-dan-sempadan-memori)
- [10. Pengaktifan dan Perolehan Lorebook](#10-pengaktifan-dan-perolehan-lorebook)
- [11. Mode Group Chat Sebenar](#11-mode-group-chat-sebenar)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Percabangan Chat](#13-percabangan-chat)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Prompt Sampingan](#16-prompt-sampingan)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Context untuk Penjanaan](#20-context-untuk-penjanaan)
- [21. Arsitektur Prompt, Built-in Summary Prompt, dan Peraturan Penulisan](#21-arsitektur-prompt-summary-prompt-terbina-dalam-dan-peraturan-penulisan)
- [22. Summary Prompt Manager dan Consolidation Prompt Manager](#22-summary-prompt-manager-dan-consolidation-prompt-manager)
- [23. STMB dan Extension Lain](#23-stmb-dan-extension-lain)
- [24. Tajuk Entri Lorebook dan Dasar Karakter](#24-tajuk-entri-lorebook-dan-dasar-karakter)
- [25. Job Queue dan Kawalan Retry](#25-job-queue-dan-kawalan-retry)
- [26. Maklum Balas Visual dan Kebolehcapaian](#26-maklum-balas-visual-dan-kebolehcapaian)
- [27. Peta Tetapan dan Rujukan Tetapan Semasa](#27-peta-tetapan-dan-rujukan-tetapan-semasa)
- [28. Rujukan Slash Command](#28-rujukan-slash-command)
- [29. Penyelesaian Masalah Mengikut Tahap](#29-penyelesaian-masalah-mengikut-tahap)
- [30. FAQ](#30-faq)
- [31. Keserasian, Migrasi dan Nota Sejarah Semasa](#31-keserasian-migrasi-dan-nota-sejarah-semasa)
- [32. Nota Pembangun dan Lesen](#32-nota-pembangun-dan-lesen)
- [33. Pokok Keputusan Diagnostik Ringkas](#33-pokok-keputusan-diagnostik-ringkas)
- [34. Urutan Pengajaran Minimum yang Disyorkan](#34-urutan-pengajaran-minimum-yang-disyorkan)
- [35. Ringkasan Konsep Akhir](#35-ringkasan-konsep-akhir)

---

## 1. Cara Pembantu AI Menggunakan Manual Ini

Anggap dokumen ini sebagai rujukan operasi Memory Books semasa. Dokumen ini menggantikan keperluan untuk memuatkan panduan Start Here, README, User Guide, panduan Side Prompts, panduan How STMB Works, dan changelog sejarah sebagai fail pengetahuan berasingan.

Istilah:

- STMB = SillyTavern=MemoryBooks (sambungan ini)
- ST = SillyTavern (kod dasar yang diperluas STMB)

Apabila menjawab pengguna:

1. Kekalkan terminologi Memory Books secara konsisten. **Memory Book** ialah lorebook SillyTavern yang digunakan STMB; bukan format pangkalan data berasingan.
2. Bezakan tingkah laku semasa dari tingkah laku sejarah. Jangan mengajar workflow yang sudah dipadam atau digantikan hanya kerana pernah muncul di changelog lama.
3. Bezakan **Group Chat Mode** dari **Narrator Mode**. Kedua-duanya menyelesaikan masalah yang berbeza.
4. Bezakan **generation** memori, **storage/configuration** lorebook, dan **retrieval oleh SillyTavern** selepas itu. Pengaktifan/retrieval ialah bahagian daripada kod dasar ST.
5. Jangan mencipta kawalan, label menu, tingkah laku provider, atau tetapan yang tidak diterangkan di sini.
6. Jika pengguna memberi screenshot, kenal pasti hanya kawalan yang kelihatan. Berikan tindakan seterusnya yang terus, bukan mengandaikan kawalan yang tidak kelihatan.
7. Apabila troubleshooting, cari tahap pertama yang gagal dan uji tahap itu sebelum mencadangkan penulisan semula prompt.
8. Utamakan konfigurasi ringkas yang berfungsi sebelum routing lanjutan, berbilang buku, prompt tersuai, Regex, atau automasi Side Prompt.
9. Jelaskan bahawa character filters dan Memory Book berasingan meningkatkan routing dan kerelevanan; kedua-duanya bukan sempadan keselamatan.
10. Nyatakan ketidakpastian jika versi STMB, versi SillyTavern, provider, atau prompt tersuai pengguna mungkin berbeza.

### Nota dokumen semasa

Narrator Mode sudah dilaksanakan di v8.5.0.

Sesetengah dokumen pemula lama menyatakan bahawa memori manual secara teknikal wajib sebelum memori automatik boleh dimulakan. STMB semasa boleh mencipta memori automatik pertama bermula message 0 jika belum ada processed-message baseline. Memori manual pertama masih disyorkan kerana mengesahkan sambungan, Memory Book, format output, dan sempadan awal yang dikehendaki sebelum automasi dipercayai.

---

## 2. Definisi Produk dan Model Mental

Memory Books ialah sambungan SillyTavern yang menukar julat chat yang dipilih atau dipilih automatik menjadi entri memori berstruktur yang disimpan dalam lorebook SillyTavern.

Proses asasnya:

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

STMB tidak memberikan model memori dalaman kekal. STMB mengekalkan sistem rujukan luaran dalam bentuk entri lorebook. Model chat “mengingat” apabila SillyTavern memasukkan entri lorebook yang relevan ke dalam prompt untuk AI.

### Tiga tahap berasingan

1. **Kualitas generation** — Adakah model penjana memori menghasilkan hasil yang sesuai dan berguna?
2. **Penyimpanan dan konfigurasi** — Adakah hasil disimpan ke Memory Book yang betul dengan tetapan pengaktifan yang sesuai?
3. **Retrieval dan penggunaan model** — Adakah SillyTavern mengaktifkan dan menghantar entri tersebut, dan adakah model chat menggunakannya dengan betul?

Troubleshoot ketiga tahap ini secara berasingan.

### Lorebook dan Memory Book

**Lorebook**, yang juga dikenali sebagai **World Info** di beberapa bahagian SillyTavern, ialah kumpulan entri yang boleh ditambah SillyTavern secara bersyarat ke request model. Entri lorebook biasanya mempunyai:

- title/comment;
- content;
- activation keywords atau mod pengaktifan lain;
- insertion position dan order;
- recursion dan budget controls;
- pilihan character filters dan metadata lain.

**Memory Book** ialah lorebook SillyTavern biasa yang digunakan STMB. Ia boleh dibuka, diedit, diurutkan ulang, dieksport, diimport, atau dipadam dengan alat lorebook biasa. Bergantung pada ciri yang digunakan, kandungannya boleh merangkumi:

- scene Memories;
- ringkasan Arc, Chapter, Book, Legend, Series, atau Epic;
- entri Clip dan Topical Clip;
- entri tracker Side Prompt;
- entri lain yang diurus STMB.

### Entri Memory ialah context termampat

Scene Memory bukan transcript asal. Ia ialah representasi termampat untuk mengekalkan informasi penting bagi continuity, seperti:

- events dan consequences;
- decisions dan plans;
- discoveries dan reveals;
- perubahan hubungan atau emotional state;
- knowledge, beliefs, atau misunderstandings individual;
- objects, locations, identities, promises, dan constraints yang penting.

Menyembunyikan processed messages tidak menghapusnya. Ini menghalang mesej tersebut dihantar ke AI sehingga tidak terus menggunakan active chat-history context.

---

## 3. Istilah Teras dan Pemilihan Ciri

| Keperluan | Ciri | Maksud |
|---|---|---|
| Meringkaskan satu julat chat yang dipilih atau automatik | **Memory** | “Ingat apa yang terjadi dalam babak ini.” |
| Menyimpan wording chat atau satu fakta tertentu | **Clip** | “Simpan nota ini.” |
| Mengumpulkan fakta tentang satu subjek dari Memories yang sudah disimpan | **Topical Clip** | “Kumpulkan semua yang dikatakan Memories saya tentang ini.” |
| Mengekalkan informasi yang berubah melalui run berulang | **Side Prompt / Prompt Sampingan** | “Terus kemas kini tracker ini.” |
| Menggabungkan beberapa Memory atau summary tier lebih rendah | **Consolidation** | “Gabungkan entri-entri ini menjadi recap tingkat lebih tinggi.” |
| Memendekkan satu entri yang diurus STMB | **Compaction** | “Ringkas entri ini tanpa kehilangan fakta.” |
| Menggantikan entri yang ada menggunakan sumber aslinya | **Regeneration** | “Bangun ulang entri ini dan tinjau penggantinya.” |

### Perbezaan ciri yang sering mengelirukan

- **Clip vs Topical Clip:** Clip dimulakan dari teks yang disorot dalam chat semasa. Topical Clip dimulakan dari STMB Memories yang sudah dikonfirmasi.
- **Topical Clip vs Side Prompt:** Topical Clip dijalankan manual untuk mengumpulkan satu topik. Side Prompt boleh mengekalkan tracker yang berubah secara berulang.
- **Compaction vs Consolidation:** Compaction menulis semula satu entri. Consolidation mencipta summary tier lebih tinggi dari beberapa entri.
- **Memory vs Side Prompt:** Memories biasanya ialah nota scene berurutan. Side Prompts biasanya mengemas kini atau menimpa satu dokumen pendukung yang berlanjut.
- **Generation vs retrieval:** Mencipta entri tidak menjamin SillyTavern akan mengaktifkannya kemudian.

---

## 4. Keperluan, Pemasangan dan Pengesahan Awal

### Keperluan

- SillyTavern 1.18.0 atau lebih baharu; versi kompatibel terkini disyorkan.
- Sambungan AI yang berfungsi.
- Model yang boleh mengikut instruksi dan, untuk workflow Memory dan Consolidation, mengembalikan JSON valid.
- Izin memasang sambungan pihak ketiga SillyTavern.
- Preset Chat Completion tersedia di SillyTavern bila memakai backend tempatan atau Text Completion melalui endpoint Chat Completion yang kompatibel dengan OpenAI.

### Pengguna Chat Completion biasa

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google, dan sambungan Chat Completion lain biasanya boleh memakai profil terbina dalam **Current SillyTavern Settings**.

### Pengguna tempatan dan Text Completion

KoboldCpp, llama.cpp, TextGen, Ollama, dan backend serupa biasanya paling andal jika didedahkan melalui endpoint Chat Completion kompatibel OpenAI. Malah jika roleplay biasa memakai Text Completion, SillyTavern mesti mempunyai preset Chat Completion untuk STMB.

Setup KoboldCpp tipikal:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint seperti `http://localhost:5001/v1` atau `http://127.0.0.1:5000/v1`;
- custom API key nonblank jika SillyTavern memerlukannya;
- model ID dalam format yang diharapkan endpoint, lazimnya `koboldcpp/modelname`, tanpa suffix `.gguf` yang tidak perlu;
- Chat Completion preset sudah diimport;
- response length sekurang-kurangnya 2048 token, dan 4096 sering lebih selamat.

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

### Chat Top Bar pilihan

STMB berfungsi tanpa Chat Top Bar / Chat Top Info Bar. Memasangnya menambah interface queue **Memory Books Jobs** untuk work active, completed, failed, canceled, blocked, dan review-needed.

### Pemasangan

1. Buka SillyTavern.
2. Buka panel utama **Extensions**.
3. Pilih **Install Extension**.
4. Instal repository resmi Memory Books.
5. Reload SillyTavern jika diminta.
6. Buka character chat atau group chat.
7. Tunggu beberapa detik sampai kawalan STMB terinisialisasi.

SillyTavern Extras tidak diperlukan.

### Pastikan STMB sudah dimuatkan

Sekurang-kurangnya salah satu ini mesti muncul:

- **Memory Books** di menu Extensions bergambar magic wand di samping input chat;
- chevron scene **►** dan **◄** pada expanded message actions.

Jika kedua-duanya tidak muncul:

1. tunggu hingga sepuluh detik;
2. refresh halaman;
3. pastikan extension terpasang dan enabled;
4. buka semula character atau group chat;
5. periksa browser console hanya selepas pemeriksaan dasar gagal.

---

## 5. Membuka Memory Books dan Memahami Panel Utama

Buka menu Extensions bergambar magic wand dekat input chat, lalu pilih **Memory Books**.

Panel boleh merangkumi:

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
- kawalan group-character atau Narrator bila relevan.

Untuk Memory pertama, hanya tiga keputusan yang diperlukan:

1. Memory Book mana yang menerima entri?
2. Profile/connection mana yang membuatnya?
3. Mesej chat mana yang membentuk scene?

---

## 6. Mode Penyimpanan Memory Book

### 6.1 Automatic Mode: Memory Book terikat chat

Automatic Mode ialah default biasa. STMB memakai lorebook yang terikat pada chat semasa melalui SillyTavern.

Gunakan apabila:

- satu chat mempunyai satu Memory Book utama;
- konfigurasi minimal dikehendaki;
- karakter group tidak memerlukan Memory Book berasingan.

Jika tidak ada lorebook yang terikat, bind satu di SillyTavern atau gunakan Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Aktifkan **Auto-create lorebook if none exists** agar STMB mencipta dan mengikat lorebook apabila Memory pertama disimpan.

Templat nama default boleh memakai:

- `{{char}}` — nama karakter atau group;
- `{{user}}` — nama pengguna;
- `{{chat}}` — ID/nama chat.

STMB menambah suffix angka bila perlu agar nama tidak pendua.

Auto-Create dan Manual Lorebook Mode saling eksklusif.

### 6.3 Manual Lorebook Mode

Aktifkan **Manual Lorebook Mode** untuk memilih Memory Book secara independen dari lorebook yang terikat pada chat.

Gunakan apabila:

- memories mesti berada di lorebook khusus;
- beberapa chat sengaja berkongsi satu Memory Book;
- ahli group memerlukan book berasingan;
- Narrator Mode digunakan;
- pengguna memahami rencana pengaktifan yang dihasilkan.

Pilihan main manual Memory Book disimpan untuk chat semasa kecuali persistent character lock menimpanya dalam solo chat yang kompatibel.

### 6.4 Memory Book berasingan biasanya lebih jelas

Memory Book khusus memudahkan:

- memisahkan memories dari character definitions dan tetapan lore;
- menetapkan lorebook budget dan order sendiri;
- memakai semula atau mengeksport sejarah memori;
- memeriksa entri yang diurus STMB tanpa lore lain;
- mendiagnosis pengaktifan.

Ini cadangan, bukan kewajiban.

### 6.5 Character Memory Book locks

Character Memory Book lock ialah assignment Manual Mode persisten yang terikat pada character card.

Dalam solo chat:

- manual book yang unlocked hanya milik chat semasa;
- locked book mengikut character card ke kompatibel Manual Mode chats;
- manual book tidak boleh digantikan sampai lock dilepas.

Dalam real group chat:

- per-character assignment yang unlocked hanya milik group chat semasa;
- per-character assignment yang locked mengikut character card ke kompatibel Manual Mode groups;
- locked book yang hilang menghasilkan broken-lock state yang mesti di-unlock atau diperbaiki.

Gunakan lock hanya jika karakter yang sama memang mesti berkongsi satu Memory Book berkelanjutan di beberapa cerita. Lock berbahaya untuk alternate universe atau timeline yang tidak berkaitan.

### 6.6 Tata letak awal yang disyorkan

- Solo chat: satu chat-bound atau auto-created Memory Book.
- Real group chat: satu group Memory Book.
- Narrator chat: satu omniscient Memory Book plus satu unique book untuk setiap declared character sesuai keperluan Narrator Mode.

---

## 7. Profil, Sambungan dan Penghalaan Penjanaan

Profil Memory Books mengontrol generation sekaligus tetapan entri lorebook yang dihasilkan.

### 7.1 Profil pertama yang disyorkan

Gunakan **Current SillyTavern Settings** terlebih dahulu. Profil ini memakai provider, model, dan temperature yang sedang aktif di SillyTavern.

Jangan bermula dengan menulis semula prompt atau menyiapkan Full Manual endpoint. Pertama buktikan bahawa satu Memory boleh dicipta dan disimpan.

### 7.2 Mengapa mencipta profil STMB tersimpan

Buat profil berasingan bila perlu:

- model yang lebih murah atau lebih andal untuk memories;
- provider berbeza dari roleplay;
- bind named Custom connection;
- memilih custom summary prompt;
- temperature atau maximum output behavior berbeza;
- menukar title formatting;
- menukar activation, insertion, order, atau recursion settings;
- menggunakan prompt group/omniscient dan character-focused yang berbeza.

### 7.3 Field profil

Profil boleh merangkumi:

- display name;
- API/provider;
- model ID;
- temperature;
- Summary Prompt preset;
- pilihan separate multi-character prompts;
- structured-output behavior;
- pilihan SillyTavern ChatCompletionService routing;
- pilihan Chat Completion preset;
- reverse-proxy behavior;
- title format;
- activation mod: Normal, Constant, atau Vectorized;
- insertion position, termasuk character, example-message, author’s-note, dan Outlet positions;
- Outlet name bila relevan;
- automatic atau manual order value;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Named Custom OpenAI-compatible connections

Profil Custom OpenAI-compatible boleh:

- memakai sambungan Custom SillyTavern yang sedang aktif; atau
- bind satu named Custom connection dari Connection Manager SillyTavern.

Named connection menyediakan URL dan secret tersimpan. Field model pada profil STMB masih menjadi model override. Jika named connection dipadam atau bukan lagi Custom Chat Completion connection, STMB memblokir request, bukan diam-diam mengarahkannya ke tempat lain.

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** menghalang STMB menghantar structured-output schema ke provider yang menolaknya. Model masih mesti mengembalikan JSON valid yang diminta prompt Memory atau Consolidation terpilih.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** mengarahkan request profil yang didukung melalui helper request SillyTavern dan boleh menerapkan preset Chat Completion SillyTavern terpilih. Request OpenRouter juga mewarisi provider order, quantization filters, fallback controls, dan tetapan middle-out routing SillyTavern. Kawalan OpenRouter ini masih berlaku jika ChatCompletionService gagal dan STMB mencoba semula melalui fallback request path. Jika fallback itu juga gagal, STMB mengekalkan dan melaporkan error ChatCompletionService awal serta response provider fallback. Full Manual profiles tidak memakai route ini.

### 7.7 Reverse proxy dan Full Manual Configuration

**Use reverse proxy** meneruskan detail reverse-proxy SillyTavern yang dikonfigurasi untuk provider yang didukung.

**Full Manual Configuration** menyimpan endpoint dan key berasingan di dalam profil STMB. Ini laluan pengecualian. Seboleh mungkin gunakan provider atau Custom connection yang sudah dikonfigurasi dan diuji di SillyTavern.

### 7.8 Panjang output

Setting global maximum response-token STMB boleh menimpa panjang output Chat Completion biasa untuk kerja Memory Books. JSON yang terpotong ialah penyebab umum generation gagal. Tingkatkan output length sebelum melemahkan schema atau prompt.

---

## 8. Babak, Memori Manual, Memori Automatik dan Catch-Up

### 8.1 Apa itu scene

**Scene** ialah julat message inklusif yang diproses STMB menjadi satu Memory.

Boundary yang berguna biasanya merangkumi satu unit koheren:

- satu event;
- satu conversation;
- satu investigation step;
- satu emotional atau relationship development;
- perubahan location atau goal;
- rangkaian action yang saling berkaitan.

Julat terlalu kecil dan sepele mungkin menghasilkan nilai rendah. Julat terlalu besar lebih mahal, lebih sulit diringkas, boleh melebihi context, dan sering mencampurkan event yang tidak berkaitan.

### 8.2 Menandai scene secara manual

1. Expand message actions, biasanya melalui tombol tiga titik atau serupa.
2. Klik **►** pada message pertama yang disertakan.
3. Klik **◄** pada message terakhir yang disertakan.
4. Buka Memory Books dan pengesahan start, end, speakers, message count, dan token estimate yang dipaparkan.

Kedua boundary messages termasuk.

Gunakan **Clear Scene** untuk memadam selection, atau pilih marker start/end lain untuk menggantikan salah satu boundary.

### 8.3 Mencipta Memory manual

1. Pengesahan scene.
2. Pengesahan effective Memory Book.
3. Pengesahan selected profile.
4. Klik **Create Memory**, atau gunakan `/creatememory`.
5. Tinjau confirmation, token warning, participant confirmation, atau preview windows jika muncul.
6. Setujui hasil.
7. Pastikan entri lorebook baharu ada dan Memory Status maju ke akhir scene.

Hasil Memory valid biasanya mempunyai:

- title;
- content;
- keywords;
- metadata STMB, termasuk source range dan chat identity.

### 8.4 Memory previews

Apabila **Show memory previews** aktif, tinjau dan bila perlu edit:

- title;
- memory content;
- keywords.

Periksa names, attribution, facts, consequences yang hilang, dan commentary yang tidak berkaitan. Tanpa previews, hasil valid disimpan automatik.

### 8.5 Automatic Memories

Aktifkan **Auto-create memory summaries** dan atur:

- **Auto-Summary Interval** — bilangan new messages yang diproses per automatic Memory;
- **Auto-Summary Buffer** — bilangan newest messages yang ditinggalkan agar scene yang masih berkembang tidak diringkas terlalu dini.

Contoh:

```text
Interval: 30
Buffer: 2
```

STMB menunggu sampai sekurang-kurangnya ada 32 messages selepas processed boundary, lalu mencipta Memory yang berakhir dua messages sebelum newest message.

Jika belum ada processed baseline, STMB semasa menganggap baseline `-1` dan boleh bermula dari message 0. Manual first Memory masih disyorkan untuk memvalidasi setup dan memilih titik awal yang disengaja.

Interval lebih rendah menghasilkan Memories lebih fokus dan lebih banyak requests. Interval lebih tinggi menghasilkan lebih sedikit Memories yang lebih besar, dengan risiko lebih tinggi mencampur material tidak berkaitan. Titik awal praktis sekitar 20–40 messages untuk roleplay detail dan 40–60 untuk percakapan lebih pendek/cepat.

Automatic generation boleh ditunda jika required Memory Book belum di-assignment.

### 8.6 Processed-message baseline

STMB menyimpan highest processed message untuk setiap chat. Ini menentukan:

- dari mana `/nextmemory` dimulakan;
- dari mana automatic Memories dimulakan;
- memory-boundary indicator;
- messages mana yang dianggap sudah diproses.

Gunakan:

- `/stmb-highest` untuk menampilkannya;
- `/stmb-set-highest <N>` untuk menetapkan manual;
- `/stmb-set-highest none` untuk menghapusnya.

Perubahan manual mesti disengaja kerana boleh menyebabkan julat terlewat atau terulang.

### 8.7 Catch-up untuk chat panjang yang sudah ada

Gunakan:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Contoh:

```text
/stmb-catchup interval=40 start=0 end=245
```

Julat inklusif. Chunks diproses berurutan; chunk terakhir boleh lebih kecil.

Catch-up sengaja non-interaktif. Sebelum menjalankannya:

- pilih dan uji profile yang betul;
- aktifkan **Always use default profile**;
- nonaktifkan **Show memory previews**;
- pastikan effective Memory Book tersedia, atau benarkan Auto-Create dalam Automatic Mode;
- perbaiki semua assignment multi-character yang wajib;
- pilih chunk size di bawah token-warning threshold.

STMB melakukan preflight pada setiap chunk, memproses berurutan, dan berhenti pada failure pertama atau `/stmb-stop`. Chunk terdahulu yang sudah selesai masih tersimpan. Lanjutkan dari first unfinished message, bukan mengulang seluruh julat.

Gunakan catch-up untuk konversi luas. Manual scene boundaries masih lebih baik jika sempadan sastra atau event penting.

---

## 9. Penjimatan Token, Mesej Tersembunyi dan Sempadan Memori

### 9.1 Menyembunyikan bukan memadam

Hidden messages masih berada di chat file. Mereka hanya dikeluarkan dari active chat context sampai dipaparkan semula.

### 9.2 Mode auto-hide

**Auto-hide messages after adding memory** boleh dalam bentuk:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** mengekalkan sedikit overlap terkini dekat boundary.

> **Apabila menggunakan extension Presence:** Presence boleh memaparkan semula kemudian mesej yang disembunyikan oleh STMB kerana kedua-dua extension mengubah status keterlihatan mesej SillyTavern yang dikongsi. Lihat [STMB dan Extension Lain](#23-stmb-dan-extension-lain) untuk panduan konfigurasi.

### 9.3 Unhide sebelum generation

**Unhide hidden messages for memory generation** memaparkan selected range sebelum STMB mengompilasinya. Gunakan apabila regenerating atau reprocessing range yang terdahulu hidden. Mode auto-hide terpilih menentukan apa yang disembunyikan semula selepas save berjaya.

### 9.4 Memory-boundary indicator

Indicator memakai highest processed message untuk menunjukkan di mana processed history berakhir dan unprocessed chat dimulakan.

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
- jangan gunakan auto-hide sampai pengguna memastikan satu Memory tersimpan dengan betul;
- lalu beralih ke hide all processed messages untuk manfaat penjimatan token utama.

---

## 10. Pengaktifan dan Perolehan Lorebook

### 10.1 Keywords

Normal Memories lazimnya keyword-triggered. Keyword yang baik konkret dan khas:

- nama karakter dan alias;
- named locations atau organizations;
- objects penting;
- event names;
- identifiers;
- discoveries atau actions spesifik.

Keyword lemah seperti `important event`, `conversation`, atau `secret` terlalu luas.

Memory content menentukan apa yang dipelajari model. Keywords membantu menentukan kapan SillyTavern mengambilnya.

### 10.2 Activation modes

- **Normal:** pengaktifan berbasis keyword/rule.
- **Constant:** sentiasa aktif, tunduk pada budget dan entry controls yang berlaku.
- **Vectorized:** menggunakan retrieval berbasis vector bila setup pengguna mendukungnya.

Vectors pilihan. STMB bekerja melalui keywords tanpa extension Vectors.

### 10.3 Recommended global World Info settings

Cadangan awal umum:

- Match Whole Words: off;
- Scan Depth: relatif tinggi, contohnya 8;
- Max Recursion Steps: sekitar 2;
- Context percentage: disesuaikan dengan total context dan prompt material lain.

Ini cadangan, bukan syarat keras.

### 10.4 Delay Until Recursion

Jika Memory Book ialah satu-satunya lorebook/World Info source yang aktif, biarkan **Delay Until Recursion** disabled. Jika tidak, tidak ada entry yang memulakan recursion cycle pertama dan Memory mungkin tidak pernah aktif.

### 10.5 Mendiagnosis retrieval

Jika AI “tidak mengingat”:

1. Pastikan entry ada.
2. Pastikan Memory Book yang betul aktif untuk chat.
3. Pastikan entry enabled.
4. Pastikan keywords atau activation mod sepadan dengan conversation semasa.
5. Pastikan lorebook budget menmencukupii.
6. Periksa recursion settings.
7. Gunakan World Info inspection tool atau request log untuk memastikan adakah entry betul-betul dihantar.
8. Jika sudah dihantar tetapi diabaikan, masalah berbaki ialah model behavior atau competing context, bukan penyimpanan STMB.

---

## 11. Mode Group Chat Sebenar

### 11.1 Definisi

Group Chat Mode berlaku untuk group SillyTavern nyata yang mengandungi dua atau lebih character cards berasingan.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern mencatat card mana yang menulis setiap message, sehingga STMB boleh mengekalkan speaker attribution dan mengesan ahli group yang berpartisipasi.

Tidak diperlukan switch Group Chat Mode berasingan. Buka group chat dan gunakan STMB seperti biasa.

### 11.2 Participant detection

Detected participant biasanya ialah character card yang menulis sekurang-kurangnya satu message di dalam selected scene.

STMB tidak menyimpulkan semua orang yang secara naratif hadir dari prose. Kerana itu:

- silent observer mungkin tidak dikesan;
- karakter yang hanya disebut bukan participant;
- karakter absen yang dibicarakan group tidak dipilih;
- user tidak dianggap sebagai sasaran Memory Book group-character berasingan;
- identitas speaker yang pendua atau tidak biasa mungkin perlu dikoreksi.

Jika automatic participant detection tidak menemui group characters, STMB membuka participant confirmation malah apabila automatic acceptance enabled. Warning menerangkan detection gagal dan meminta pengguna meninjau group characters mana yang hadir sebelum melanjutkan.

Participant prompt berarti: **Group character mana yang mesti diasosiasikan dengan Memory ini?** Itu tidak membuktikan siapa yang mengetahui setiap fakta atau siapa yang hadir secara fisik.

### 11.3 Satu group Memory Book

Ini tata letak awal yang disyorkan.

Gunakan Automatic Mode, Auto-Create, atau main Manual Mode book. Setiap scene menghasilkan satu canonical entry di group Memory Book. Jika participant names tersedia, entry boleh menerima inclusive SillyTavern character filter.

Inclusive filter untuk Alice dan Bob berarti entry boleh aktif apabila Alice **atau** Bob aktif. Ini tidak mencipta karakter sintetis “Alice and Bob” atau subset book berasingan.

Satu group book paling sepadan bila:

- cast lazimnya berkongsi satu cerita;
- satu summary omniscient/group-oriented menmencukupii;
- setup minimal dan lebih sedikit duplicate entries dikehendaki;
- STLO tidak diperlukan.

Satu group Memory masih boleh menyimpan asymmetric knowledge:

> Alice menemui transmitter dan menyembunyikannya. Bob percaya ruangan itu kosong.

### 11.4 Satu group book plus per-character books

Layout real-group lanjutan memakai:

- satu canonical group Memory Book;
- satu assigned character Memory Book untuk setiap ahli group.

Keperluan:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) terpasang dan enabled;
- assignment valid untuk setiap group member yang diwajibkan.

Canonical group book tidak boleh sekaligus menjadi character book. Lebih dari satu karakter boleh berkongsi character book yang sama; STMB menulis satu copy ke shared book tersebut, bukan pendua per karakter.

Apabila Memory disimpan:

1. canonical version ditulis ke group book;
2. participant selection dikonfirmasi kecuali automatic acceptance aktif;
3. linked copies ditulis ke selected participant books;
4. STMB melakukan rollback partial writes jika membolehkan bila salah satu required save gagal.

Memilih no participants di real-group participant confirmation menerapkan Memory ke semua current group members.

### 11.5 Separate group and character prompts

Secara default, group-oriented Memory yang sama disalin ke participant books.

Profile boleh mengaktifkan **Use separate group and character prompts in group chats**. Kemudian:

- Group Summary Prompt menulis canonical group version;
- Character Summary Prompt menulis individualized version untuk setiap single-character sasaran book.

Character-focused version boleh mengekalkan:

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
- adakah individualized prompts digunakan.

STLO menentukan:

- kapan lorebook aktif;
- character mana yang boleh mengaktifkannya;
- priority, position, budget, dan ordering.

Apabila STMB menetapkan character book, ia menambah avatar basename karakter ke `stlo.characterOverrides` dan mengaktifkan `stlo.onlyWhenSpeaking`, sambil mengekalkan STLO priorities, budgets, dan overrides yang sudah ada.

STMB memakai merge-only behavior. Memadam atau menggantikan assignment tidak automatik memadam STLO character override lama. Padam obsolete overrides secara manual di STLO.

### 11.7 Filters dan books bukan privacy controls

Separate books dan filters meningkatkan kerelevanan. Mereka tidak menjamin bahawa:

- satu karakter tidak pernah menerima informasi karakter lain;
- model tidak pernah melihat canonical group version;
- previous-memory context terpartisi sempurna berdasarkan knowledge;
- character book hanya mewakili conscious knowledge.

Gunakan sebagai alat context routing, bukan security boundary.

### 11.8 Linked copies tidak live-synchronized

Linked entries berkongsi metadata yang membolehkan STMB mengenali event asal yang sama, tetapi edit seterusnya independen.

Mengedit, memadam, atau compact satu copy tidak automatik menukar copy lain. Regenerating character copy juga hanya menukar copy tersebut. Namun apabila regenerating canonical group entry, STMB bertanya adakah hanya entry itu atau entry tersebut bersama semua linked character entries mesti diregenerate. Setiap selected entry menboleh generation dan approval review sendiri, sehingga character-focused prompts masih character-focused.

### 11.9 Menambah, memadam, atau mengassign ulang group member

Menambah karakter:

- assign book valid sebelum distributed Memory seterusnya;
- old Memories tidak disalin retroaktif;
- old filters tidak ditulis ulang;
- berikan historical context manual jika perlu.

Memadam karakter:

- existing entries masih ada;
- old filters dan STLO overrides masih ada;
- linked copies tidak automatik dipadam.

Menukar book karakter:

- menukar routing seterusnya;
- belum tentu memadam karakter dari STLO overrides book lama.

### 11.10 Group consolidation

Canonical group book memakai automatic group-chat consolidation analysis prompt yang mengejar omniscient chronology sambil membezakan objective events dari individual knowledge.

Character books memakai consolidation preset yang dipilih di popup. Books boleh mempunyai bilangan eligible sources berbeza. Book tanpa material menmencukupii boleh dilangkau dengan warning sementara book yang siap masih berlanjut.

Scene yang hilang dari character book ialah chronology gap. Itu tidak membuktikan absence, ignorance, atau unconsciousness. Shared character book menerima satu consolidated entry.

---

## 12. Narrator Mode

### 12.1 Definisi

Narrator Mode digunakan untuk chat one-on-one SillyTavern biasa apabila satu Narrator character card menulis beberapa fictional characters.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Tanpa Narrator Mode, SillyTavern melihat semua AI responses sebagai ditulis Narrator card. Narrator Mode menyediakan cast model manual sehingga STMB boleh mengasosiasikan scenes dan Memory Books dengan fictional characters di dalam prose Narrator.

Narrator Mode tidak tersedia di real SillyTavern group chat.

### 12.2 Required storage layout

Narrator Mode memerlukan:

- Manual Lorebook Mode;
- satu **omniscient/canonical Memory Book** terpilih;
- satu unique Memory Book untuk setiap declared cast member.

Peraturan:

- cast member tidak boleh memakai omniscient book;
- dua cast members tidak boleh berkongsi book yang sama;
- setiap declared member mesti mempunyai available book;
- retired members mengekalkan identity dan reserved book assignment sampai direstore atau ditangani lain oleh implementasi;
- Auto-Create tidak kompatibel kerana Narrator Mode bergantung pada Manual Lorebook Mode.

Berbeza dari advanced real-group layout, Narrator Mode tidak memerlukan STLO untuk active-character retrieval. STMB menyuntikkan books milik selected cast members ke active lorebook context selama generation.

### 12.3 Setup

1. Buka biasa chat milik Narrator card.
2. Aktifkan Manual Lorebook Mode.
3. Pilih main manual book; ini omniscient Memory Book.
4. Aktifkan **Narrator Mode**.
5. Buka **Manage Narrator Cast**.
6. Tambahkan setiap fictional character berdasarkan nama dan assign unique Memory Book.
7. Gunakan floating **Active Cast** drawer untuk memilih karakter yang hadir dalam pertukaran seterusnya.

Narrator Mode mesti dinyahaktifkan sebelum Manual Lorebook Mode boleh dinyahaktifkan.

### 12.4 Active Cast drawer dan timeline metadata

Floating Active Cast drawer boleh diexpand, dicollapse, dipindah, dan digunakan memilih current cast members.

Apabila generation, STMB mengambil snapshot active cast dan menyimpannya di message metadata:

- user message menerima active-cast snapshot;
- Narrator response menerima generation snapshot;
- continuation menggabungkan cast dengan existing cast metadata;
- swipe metadata disimpan berasingan untuk setiap swipe;
- memilih swipe boleh memulihkan active cast dari titik timeline tersebut;
- memadam recent messages boleh memulihkan cast state dari latest remaining tagged Narrator message.

Cast marker mencatat asosiasi, bukan semantic analysis terhadap prose.

### 12.5 Retrieval selama biasa Narrator generation

Apabila Narrator generation dimulakan, STMB memuatkan Memory Books milik active cast dan menggabungkan entri mereka ke character-lore collection yang digunakan request tersebut, mengelakkan duplicate world/UID pairs.

Akibatnya:

- hanya active-cast books yang ditambah oleh workflow Narrator ini;
- omniscient book masih mengikut biasa Manual Mode activation/configuration;
- per-character STLO filters tidak diwajibkan untuk Narrator Mode;
- cast selection mesti betul sebelum generation jika character books yang betul diharapkan masuk context.

### 12.6 Scene participant detection

Untuk selected scene, tagged Narrator responses bersifat authoritative. STMB menggabungkan cast IDs yang ditempelkan pada Narrator-authored messages.

Jika scene mengandungi untagged legacy Narrator messages, STMB fallback ke continuity information dari semua messages dan meminta pengguna mengonfirmasi scene cast. Current active cast members dipilih terdahulu. Empty selection berarti tidak ada individual cast members yang hadir.

Confirmation ini khusus untuk legacy atau incomplete cast metadata; fully tagged scenes tidak memerlukannya.

### 12.7 Memory distribution

Narrator scene Memory ditulis sebagai:

- satu canonical omniscient entry di main Memory Book;
- satu linked copy di unique Memory Book milik setiap selected participant.

Narrator copies tidak memakai native SillyTavern character filters. Sebaliknya, STMB menyimpan Narrator participant dan owner IDs di entry metadata.

Jika separate multi-character prompts disabled, participant books menerima copies dari omniscient summary. Jika enabled, setiap single-character book boleh menerima character-focused generation.

### 12.8 Narrator consolidation dan regeneration

Narrator ownership dan participant metadata dibawa melalui consolidation sources. Dengan demikian higher-tier entries mengekalkan character book mana yang mempunyai copy dan cast members mana yang berpartisipasi dalam material sumber.

Regeneration memakai metadata ini untuk menentukan adakah replacement prompt sasaran omniscient/group-oriented atau character-focused.

Seperti real-group copies, linked Narrator entries tidak live-synchronized selepas dicipta.

### 12.9 Retiring cast members

Cast manager boleh menandai member sebagai retired dan memulihkannya kemudian. Retired members:

- dipadam dari active-cast choices;
- dipadam dari active-cast ID set;
- mengekalkan stable identity/history metadata;
- mengekalkan book reservation sehingga book tidak digunakan ulang secara tidak sengaja dan menggabungkan identity.

Gunakan retirement untuk karakter yang meninggalkan active cast tetapi historical Memory identity-nya mesti masih utuh.

---

## 13. Percabangan Chat

Native branches SillyTavern boleh menjadi continuity berbeza. Jika branch dan parent menulis ke unlocked Memory Books yang sama, timeline yang bertentangan boleh bercampur.

**Copy Memory Books when branching** enabled secara default.

### 13.1 Apa yang disalin

Apabila STMB mengenali native branch yang baharu dicipta:

- Automatic Mode menyalin active chat-bound Memory Book;
- Manual Mode menyalin main manual Memory Book;
- real group Manual Mode menyalin setiap unique unlocked character Memory Book;
- Narrator Mode menyalin omniscient book dan setiap declared character book;
- persistent real-character locks dikekalkan, bukan disalin, kerana lock berarti “terus gunakan book yang sama ini.”

Semua book yang disalin dalam satu branch operation memakai available lineage number yang sama:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branching dari branch yang sudah ada mengekalkan lineage root asal, bukan mencipta nama seperti `Branch 1 Branch 1`.

### 13.2 Metadata yang ditulis ulang

Di dalam copies, STMB:

- menulis semula parent chat IDs yang sepadan menjadi new branch chat ID;
- mengarahkan canonical group/character links jika kedua linked books disalin;
- mengemas kini bindings branch baharu agar menunjuk ke copies.

STMB mengkloning content yang ada; tidak meregenerate Memories.

### 13.3 Keselamatan apabila gagal

Jangan berpindah chat apabila branch copying berterus.

Jika copying gagal, STMB memadam inherited writable bindings milik branch baharu dan mencatat failure agar branch tidak diam-diam menulis ke originals milik parent.

### 13.4 Menyahaktifkan branch copies

Nonaktifkan tetapan ini hanya bila branch memang sengaja dimaksudkan untuk berkongsi Memory Books dan sejarah berlanjut yang sama dengan parent.

---

## 14. Clips

Clip menyimpan selected chat text terus ke entri lorebook `[STMB Clip]`. Tidak ada panggilan AI model.

### 14.1 Gunakan Clips untuk

- preference;
- promise atau secret;
- name atau alias;
- item atau pet;
- fakta relationship singkat;
- baris yang perlu dikekalkan sesuai atau hampir sesuai;
- “note to self” singkat yang tidak layak menjadi scene Memory.

### 14.2 Workflow

1. Sorot teks di dalam chat message.
2. Klik floating scissors button.
3. Pilih existing Clip entry atau buat yang baharu.
4. Untuk entry baharu, pilih always-active atau keyword-triggered behavior.
5. Tinjau current entry dan updated preview.
6. Rename bila perlu.
7. Save.

Floating scissors button hanya muncul selepas chat text dipilih dan boleh dinyahaktifkan di main panel.

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

Satu Clip entry mempunyai satu section. Title yang fokus menyokong activation keywords yang fokus.

### 14.4 Existing entries

Existing entry boleh diperlakukan sebagai Clip dengan menambah `[STMB Clip]` di akhir title. Clip entry yang panjang boleh diedit manual atau di-compact.

Clips hanya menyimpan teks yang dipilih. Source attribution tidak ditambah automatik.

---

## 15. Topical Clips

Topical Clip membaca confirmed STMB Memory entries, explicit range messages dari current chat, atau kedua-duanya, lalu meminta AI menghasilkan entri “about this topic” yang fokus. Eligible Memory sources boleh merangkumi scene Memories dan consolidated summaries; Clip dan Side Prompt entries dikecualikan sebagai sumber.

### 15.1 Gunakan Topical Clip apabila

Informasi tentang satu subjek tersebar di beberapa Memories, contohnya:

- NPC yang berulang;
- sejarah relationship;
- location atau faction;
- investigation atau mystery;
- powers, injuries, promises, preferences, atau secrets;
- object penting;
- unresolved plot thread.

Topical Clip diorganisasi berdasarkan subjek, bukan chronology semua source Memory.

### 15.2 Had source

Topical Clip menggunakan:

- confirmed STMB Memory entries dari selected source book, termasuk eligible consolidated summaries;
- visible messages dari explicitly selected inclusive `X-Y` range di current chat.

Kawalan **Include saved Memories** dan **Include chat messages** boleh digunakan sendiri-sendiri atau bersama. Message ranges mengikut global unhide-before-memory tetapan dan mengembalikan messages yang terdahulu hidden selepas compilation.

Tidak menggunakan:

- chat messages di luar selected range;
- ordinary Clip entries;
- Side Prompt entries;
- unrelated ordinary lorebook entries.

### 15.3 Mencipta Topical Clip

1. Buka Memory Books.
2. Klik **Topical Clip**.
3. Pilih source Memory Book.
4. Masukkan topic.
5. Masukkan activation keywords, atau biarkan kosong untuk memakai topic.
6. Pilih new entry atau existing `[STMB Clip]` update sasaran.
7. Pilih saved Memories, chat messages, atau kedua-duanya sebagai sources.
8. Pilihan: pilih hanya source Memories tertentu dan/atau masukkan exact message range.
9. Pilih generation profile.
10. Generate draft.
11. Review dan edit.
12. Save hanya selepas betul.

Generated draft tidak pernah disimpan automatik.

### 15.4 Mengemas Kini existing Topical Clip

Selepas run berjaya, STMB mencatat source Memories yang digunakan dan, jika relevan, source chat, message range, message IDs, dan hashes. Update berbasis Memory seterusnya biasanya hanya menghantar source Memories yang baharu atau berubah bersama existing Clip content. Message ranges sentiasa dipilih eksplisit.

Gunakan **Rebuild from all source memories** apabila:

- current entry tidak lengkap atau berantakan;
- prompt berubah;
- Memories lama diedit secara substansial;
- seluruh topic perlu dipertimbangkan semula.

### 15.5 Manual source selection dan token warnings

Gunakan **Use only selected memories** bila book besar, topic terbatas pada satu periode cerita, names saling overlap, atau evidence control ketat diperlukan.

STMB mengestimasi request size dan memperingatkan bila configured token threshold terlampaui. Kurangi sources, naikkan threshold dengan sengaja, atau pilih run once anyway.

### 15.6 Standar review

Pastikan draft:

- masih fokus pada topic;
- mengekalkan names dan relationships;
- menyertakan major relevant facts;
- mengidentifikasi contradictions, bukan diam-diam memilih satu versi;
- tidak mencipta explanations yang tidak didukung source Memories;
- menggabungkan updates tanpa duplicate yang tidak perlu.

### 15.7 Prompt placeholders

Custom Topical Clip prompt mesti menyertakan `{{SOURCE_MEMORIES}}` apabila saved Memories dipilih dan `{{SOURCE_MESSAGES}}` apabila chat messages dipilih.

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Supported placeholders merangkumi:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Gunakan Reset to Default jika prompt tersuai berhenti menghasilkan output berguna.

---

## 16. Prompt Sampingan

Side Prompt atau **Prompt Sampingan** ialah prompt STMB bernama yang berjalan berasingan dari biasa character reply. Biasanya ia mencipta atau mengemas kini satu continuing support entry, bukan scene Memory berurutan lainnya.

Di daftar **Trackers & Side Prompts**, power icon terus menukar flag **Enabled** untuk seluruh prompt: hijau berarti enabled dan redup berarti disabled. Kawalan ini tidak menambah, memadam, atau menukar configured triggers milik prompt.

### 16.1 Penggunaan yang sesuai

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

Elakkan prompt kabur seperti “track everything”, duplicate scene summaries, atau kerja yang mesti muncul dalam roleplay response seterusnya.

### 16.2 Output format

Side Prompts biasanya mengharapkan final plain text atau Markdown yang siap disimpan. Mereka tidak memerlukan Memory JSON. JSON hanya digunakan bila pengguna memang ingin menyimpan JSON sebagai tracker text.

### 16.3 Run sequence

Run tipikal menyusun:

1. Side Prompt instructions;
2. prior saved tracker entry, jika ada;
3. pilihan previous Memories;
4. pilihan Additional Context;
5. selected atau since-last scene text;
6. pilihan Response Format instructions.

Prior entry ialah existing state yang perlu direvisi, bukan bukti bahawa setiap old statement mesti dikekalkan. Prompt mesti secara eksplisit memadam stale, resolved, contradicted, atau duplicate information.

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Names dengan spasi sebaiknya diberi tanda kutip. Supplied range bersifat inclusive.

Manual runs paling sepadan untuk targeted analysis dan prompts yang memerlukan runtime macro values.

### 16.5 Automatic after-Memory runs

Side Prompt boleh mengaktifkan **Run automatically after memory**.

Chat kemudian menggunakan salah satu dari dua automatic selection modes:

- individually enabled Side Prompts; atau
- satu selected Side Prompt Set.

Selected set menggantikan individually enabled automatic prompts untuk chat tersebut. Ia tidak menambah di atasnya.

#### Memory Assistance Side Prompt

**Memory Assistance** ialah reserved Side Prompt dengan empat mod independen. Ia berjalan selepas Memories berjaya disimpan tanpa bergantung pada ordinary Side Prompt enablement atau selected Side Prompt Set. Ia tidak berjalan selama Memory regeneration.

Memory Assistance membandingkan raw processed scene dengan ordinary dan Topical Clips di setiap Memory Book yang menerima Memory. Ia menghantar title/topic, keywords, current content, stable ID, dan type dari setiap reviewed Clip ke AI.

Apabila job queue tersedia, setiap sasaran Memory Book menerima job **Memory Assistance** berasingan selepas Memory disimpan. Error pada request, response-validation, report-save, atau automatic-application menandai job itu **Failed** dan memaparkan error di queue. Saved Memory masih **Completed**, dan retrying Memory Assistance tidak meregenerate Memory.

- **Off** menyahaktifkan Memory Assistance.
- **Update** terus meninjau lima Clips atau kurang; lebih dari lima membuka selection list. Proposed changes menunggu manual approval.
- **Update and Suggest** terlebih dahulu menjalankan satu topic-discovery request, lalu workflow existing-Clip review yang sama seperti Update.
- **Automatic** meninjau setiap Clip dalam token-based batches tanpa menanyakan Clips mana yang ditinjau. Ia terus menerapkan valid ordinary Clip additions, sementara Topical Clip replacements masih pending untuk approval di **Memory Assistance Suggestions**.

- Dalam Update dan Update and Suggest, selection list yang lebih besar menyediakan **Query Selected** dan **Query All**.
- Query All dan Automatic menggunakan token-based batches alih-alih memaksa semua Clip ke satu oversized request.
- Setiap ordinary Clip menerima paling banyak satu exact message excerpt yang diusulkan sebagai addition.
- Topical Clips menerima complete replacement drafts.
- AI response ialah simple JSON object yang memetakan setiap affected Clip UID terus ke suggested excerpt atau replacement. Empty object berarti tidak ada Clip yang perlu diupdate.
- Hasil Update ditulis ke `Memory Assistance (STMB SidePrompt)` dan masih unapplied sampai disetujui melalui **Memory Assistance Suggestions**.
- Hasil Automatic-mod mencatat berapa ordinary Clip additions yang diterapkan dan mengekalkan Topical Clip replacements serta application failures untuk manual review.
- Membatalkan selection memadam older suggestions agar tidak dikira sebagai hasil dari scene terkini.

Update and Suggest memakai suggestion-only prompt berasingan sebelum existing-Clip review batches. Request mengandungi processed scene dan lightweight list title, topic, dan keywords dari existing Topical Clips. Apabila discovery, ia tidak menghantar ordinary Clips atau existing Clip bodies. AI mengembalikan nol sampai lima topic baharu sebagai JSON objects mengandungi topic dan activation keywords; `{"topics":[]}` ialah hasil valid.

Suggested topics disimpan dalam Memory Assistance report. Di **Memory Assistance Suggestions**, pilih **Review Topics** untuk melihatnya sebagai checked, editable rows. Anda boleh uncheck topic yang tidak dikehendaki, mengedit topic names atau keywords, atau menambah topic lain. Confirmed topics membuka standard Topical Clip draft workflow satu demi satu. Pending topic hanya dipadam selepas Topical Clip-nya disimpan; menutup draft membiarkannya tersedia melalui **Memory Assistance Suggestions**.

Apabila reviewable suggestions siap, STMB membuka completion popup untuk updated Memory Book. **Dismiss** menutup notice, sedangkan **Go to Suggestions** membuka **Memory Assistance Suggestions** dengan Memory Book itu sudah dipilih. Membuka **Memory Assistance Suggestions** dari extension menu memilih effective Memory Book current chat terlebih dahulu: chat-bound book di Automatic Mode atau resolved manual book di Manual Mode.

Prompt Update dan Topic Suggestions serta connection-profile override boleh diedit secara independen, tetapi kedua structured response contracts masih fixed. Memory Assistance tidak boleh dipadam, diduplicate, dimasukkan ke Side Prompt Set, atau dijalankan manual.

### 16.6 Automatic visible-message intervals

Side Prompt boleh mengaktifkan **Run on visible message interval** dan menentukan bilangan visible messages sejak checkpoint.

Hidden dan system messages tidak dihitung.

Apabila set aktif, hanya rows di set tersebut yang referenced prompt-nya mempunyai interval trigger yang sesuai yang menjadi kandidat.

### 16.7 Side Prompt Sets

Side Prompt Set ialah ordered run list, bukan sekadar folder. Templat yang sama boleh muncul lebih dari sekali dengan macro values berbeza.

Contoh:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Rows boleh menyimpan:

- prompt reference;
- pilihan label;
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

General Settings boleh menentukan:

- default set untuk solo chats;
- default set untuk group chats.

Setiap chat boleh:

1. mewarisi default yang sesuai;
2. secara eksplisit memakai individually enabled prompts;
3. memilih named set.

Empty global default berarti individual mod.

Jika selected set dipadam, STMB memperingatkan, bukan diam-diam menggantikan workflow. Missing row prompt atau unresolved macro menyebabkan row itu dilangkau dengan warning.

Set memilih candidate rows. Setiap referenced Side Prompt masih memerlukan automatic trigger yang relevan untuk after-Memory atau interval execution. Manual set commands tidak memerlukan trigger checkboxes tersebut.

### 16.9 Macros

Side Prompts boleh memakai biasa SillyTavern macros seperti:

```text
{{user}}
{{char}}
```

Placeholder `{{...}}` non-standard ialah runtime macros. Nilainya mesti diberikan manual atau disimpan dalam set row.

Contoh:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

Prompt dengan unresolved runtime macros tidak boleh berjalan automatik. Automatic runs tidak boleh berhenti untuk meminta nilai.

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

Effective main book ialah chat-bound book dalam Automatic Mode atau resolved main manual book dalam Manual Mode. Dalam multi-book group atau Narrator setup, count tidak menjumlahkan semua character books.

Count macro hanya memberi angka, bukan content entri-entri itu.

### 16.11 Message ranges

Explicit range memakai sesuai inclusive range tersebut. Tanpa range, STMB memakai since-last checkpoint/cap behavior milik Side Prompt.

Gunakan explicit ranges untuk debugging, targeted cleanup, atau rerunning section tertentu.

### 16.12 Additional Context dan previous Memories

Side Prompt boleh menyertakan hingga tujuh previous scene Memories.

Sumber Additional Context-nya boleh dalam bentuk:

- none;
- **Follow chat**, memakai Context Setting yang dipilih chat;
- satu fixed named Context Setting.

Ini reference materials. Prompt tidak boleh menyalinnya mentah ke tracker tanpa alasan.

### 16.13 Lorebook targets

Side Prompt biasanya menyimpan ke effective Memory Book. Sebagai alternatif boleh memakai:

1. per-chat sasaran override;
2. templat-level sasaran;
3. effective Memory Book sebagai fallback.

Valid per-chat override menang.

Gunakan alternate sasaran untuk shared campaign book yang memang disengaja atau dedicated tracker book. Jangan menyebar tracker tanpa retrieval plan.

### 16.14 Side Prompt entry controls

Templat boleh menetapkan:

- title override;
- keywords;
- Normal, Constant, atau Vectorized activation;
- insertion position dan Outlet name;
- order mod/value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Title dan keyword fields boleh meng-expand applicable macros. **Ignore Budget** sebaiknya jarang digunakan kerana banyak tracker always-included boleh menghabiskan context besar.

### 16.15 Connection profile override

Side Prompt boleh mewarisi biasa Memory Books connection resolution atau bind specific STMB profile. Override berguna untuk model lebih murah atau yang lebih baik pada structured maintenance. Terlalu banyak kombinasi profile menyulitkan troubleshooting.

### 16.16 Side Prompt regeneration

Compatible saves kini menyimpan version-2 snapshot yang mengandungi:

- Side Prompt templat key;
- prior entry content untuk regeneration;
- sama ada entry wujud sebelum run dan exact prior entry state, tanpa rollback snapshot yang lebih lama;
- source chat dan inclusive range;
- runtime macro values;
- fingerprint bagi exact entry state yang ditulis oleh STMB.

Untuk regenerate, buka lorebook editor dan klik **Regenerate side prompt**. Replacement memakai saved snapshot dengan current templat dan current profile/context settings.

Regeneration tidak boleh selesai jika templat dipadam, source chat/range tidak tersedia, atau sasaran/source berubah semasa generation. Hanya content yang digantikan; existing title, keywords, dan entry settings kekal. Legacy version-1 snapshots masih menyokong regeneration, tetapi tidak boleh digunakan oleh Memory Auto-Rollback.

### 16.17 Menulis Side Prompt yang baik

Side Prompt yang baik menentukan:

- maintenance job yang sesuai;
- source material apa yang ditinjau;
- adakah revise, replace, merge, atau append;
- stale information yang mesti dipadam;
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

Stable headings mengurangkan drift pada repeated updates.

### 16.18 Side Prompt troubleshooting

Jika prompt tidak berjalan:

- pastikan event Memory atau interval betul-betul terjadi;
- inspect individual/set selection chat;
- pastikan referenced prompt masih ada;
- pastikan automatic trigger yang relevan enabled;
- pastikan semua runtime macros mempunyai nilai;
- cek adakah `/stmb-stop` atau failed job membatalkannya.

Jika berjalan dua kali:

- cek manual plus automatic invocation;
- duplicate set rows;
- duplicate prompt copies;
- multiple tabs atau chats yang memicu work.

Jika salah book menerima output, inspect per-chat dan templat-level sasaran scopes.

Jika output tumbuh tanpa sempadan, tambahkan explicit replacement, pruning, item-count, dan word-count rules.

---

## 17. Consolidation

Consolidation menggabungkan lower-tier STMB Memories atau summaries menjadi higher-tier chronological recaps.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation bekerja dari existing STMB entries, bukan terus dari raw chat.

### 17.2 Tujuan

Gunakan apabila:

- scene Memories bermula menumpuk;
- material lama tidak lagi memerlukan full scene detail;
- fase relationship, plot, atau campaign besar selesai;
- token use perlu dikurangi sambil mengekalkan continuity;
- diperlukan higher-level chronology yang lebih bersih.

Consolidated entries mesti menekankan lasting changes, turning points, goals, consequences, relationship shifts, unresolved threads, dan stable state.

### 17.3 Manual workflow

1. Buka **Consolidate Memories**.
2. Sahkan Source Memory Book yang dipaparkan. Pilih book lain jika configured manual atau chat-bound book bukan consolidation source yang dikehendaki. Pilihan ini hanya digunakan untuk current run dan tidak mengubah configured Memory Book chat.
3. Pilih sasaran tier.
4. Pilih eligible source entries.
5. Pilih consolidation prompt/profile settings.
6. Tentukan adakah source entries akan disabled selepas consolidation berjaya.
7. Run dan review candidates.
8. Approve summaries yang dikehendaki.

### 17.4 Readiness prompts bukan automatic consolidation

**Prompt for consolidation when a tier is ready** memantau selected sasaran tiers. Apabila saved minimum eligible count tercapai, STMB memaparkan yes/later prompt. Memilih Yes membuka consolidation interface. Ia tidak diam-diam melakukan consolidation.

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

Model boleh mengembalikan satu atau beberapa summaries. `member_ids` mengassign setiap source ke returned summary. Outliers ditempatkan di `unassigned_items`, bukan dipaksa masuk recap yang tidak berkaitan.

### 17.6 Previous higher-tier summary

Previous summary pada sasaran tier boleh diberikan sebagai canon context. Ia bukan source material untuk ditulis ulang. Consolidation prompts mesti membedakannya dari lower-tier entries yang diproses.

### 17.7 Previews dan failed responses

Consolidation previews boleh membolehkan editing, accepting, regenerating one candidate dari sources yang sama, atau regenerating pending batch.

Malformed atau failed AI responses boleh diinspect dan, bila didukung, dikoreksi manual sebelum commit.

### 17.8 Source disabling

Apabila enabled, STMB menyahaktifkan source entries selepas consolidation berjaya agar higher-tier summary mengambil alih retrieval. Ini boleh dibalik lewat lorebook editing.

### 17.9 Prompt consolidation yang baik

Mesti menentukan:

- compression sasaran;
- adakah mencipta satu recap atau bilangan coherent recap paling sedikit;
- chronology dan grouping logic;
- detail yang wajib bertahan;
- penanganan outliers eksplisit;
- exact JSON structure.

Mesti mengekalkan major beats, consequences, promises, relationship changes, identifiers, unresolved threads, dan retrieval-friendly keywords sambil memadam repeated scene-level detail.

---

## 18. Compaction

Compaction meminta AI memendekkan satu existing STMB-managed entry dan memaparkan original serta draft sebelum replacement.

### 18.1 Eligible entries

- `[STMB Clip]` entries;
- Side Prompt entries;
- STMB Memory entries.

Ordinary non-STMB lorebook entries tidak dipaparkan.

### 18.2 Workflow

1. Buka **Compaction**.
2. Pilih Memory Book.
3. Pilih Compaction Profile.
4. Pilihan edit Compaction Prompt.
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

Compaction bukan untuk menambah facts, meringkas raw chat, mencipta Memory baharu, atau memproses ordinary lorebook entries.

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Prompt mesti mengekalkan facts, names, pronouns, macros, wrapper headings, dan end markers sambil memadam redundancy dan low-value wording.

---

## 19. Regeneration

Regeneration mencipta reviewable replacement untuk existing entry. Ia tidak mencipta second numbered entry dan tidak pernah overwrite tanpa approval.

### 19.1 Scene Memory regeneration

- buka source chat;
- buka Memory Book di lorebook editor;
- klik **Regenerate memory**;
- untuk canonical group entry dengan linked character entries, pilih regenerate hanya clicked entry atau semua linked entries;
- pilih current profile, prompt, previous-memory count, dan Additional Context;
- review title, content, dan keywords untuk setiap selected entry.

Original scene range dan sequence number dikekalkan. Linked entries memakai ulang selected regeneration settings yang sama tetapi generated terhadap Memory Book context masing-masing dan group/character prompt sasaran. STMB mengumpulkan semua approvals sebelum bermula menyimpan direct regenerations. Jika semua source messages hidden, tampilkan mereka atau enable unhide-before-generation.

### 19.2 Consolidation regeneration

Higher-tier summary diregenerate dari exact linked lower-tier sources menggunakan preset khusus **Regenerate Consolidation**.

Full source set mesti masih ada pada tier yang betul. Lower-tier source tidak boleh diregenerate sementara active parent summary bergantung padanya; padam parent terlebih dahulu bila memang ingin membangun ulang lower tier.

### 19.3 Side Prompt regeneration

Lihat peraturan Side Prompt snapshot di Bahagian 16.16.

### 19.4 Safety checks

Tepat sebelum replacement, STMB mengesahkan bahawa:

- sasaran entry tidak berubah;
- source chat range tidak berubah;
- required consolidation sources tidak berubah dan tersedia;
- entry masih eligible.

Jika salah satu check gagal, tidak ada yang dioverwrite.

Linked group, character, dan Narrator copies masih independen.

---

## 20. Context untuk Penjanaan

Beberapa context sources boleh muncul dalam STMB request. Mereka tidak boleh dipertukarkan.

### 20.1 Current scene

Message range yang sedang diproses. Ini sasaran material untuk ordinary scene Memory.

### 20.2 Previous Memories

Earlier scene Memories dari effective Memory Book, disertakan sebagai read-only continuity context. Pengguna biasanya boleh menyertakan 0–7.

Mereka tidak boleh diringkas ulang hanya kerana muncul sebelum current scene.

### 20.3 Additional Context

Selected lorebook entries sebagai stable reference material, contohnya:

- character atau tetapan rules;
- canonical names dan terminology;
- campaign constraints;
- authoritative timeline;
- location references;
- facts yang diasumsikan tetapi tidak diulang dalam scene.

Additional Context muncul sebelum previous Memories dan scene transcript. Ini reference material, bukan scene lain.

### 20.4 Context Settings

Context Setting ialah reusable ordered collection dari Additional Context entries.

Workflow:

1. buka **Context Settings**;
2. buat named tetapan;
3. pilih lorebook entries;
4. atur urutannya;
5. pilih tetapan untuk current chat atau secara eksplisit pilih No Context.

Selection disimpan per chat dan bekerja dengan Current SillyTavern Settings maupun saved profiles.

Jika referenced book atau entry hilang, STMB memperingatkan, melewati stale reference, dan melanjutkan. Jika seluruh Context Setting dipadam, chats yang merujuknya berlanjut tanpa Additional Context sampai selection baharu dicipta.

Context Settings boleh diduplicate, diimport, dan diexport sebagai `stmb-context-settings.json`.

### 20.5 Prior Side Prompt entry

Current tracker text yang akan direvisi. Ini state, bukan bukti bahawa semua old statements masih valid.

### 20.6 Consolidation sources

Lower-tier entries yang betul-betul menjadi material untuk grouping dan compression.

### 20.7 Previous higher-tier summary

Canon yang dibawa ke depan apabila consolidation. Bukan source untuk ditulis ulang.

### 20.8 Urutan yang betul per workflow

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

Prompts mesti memberi label sasaran material dan reference-only material secara jelas.

---

## 21. Arsitektur Prompt, Built-in Summary Prompt, dan Peraturan Penulisan

STMB mempunyai tiga structured generation systems utama plus beberapa auxiliary workflows yang lebih fokus.

### 21.1 Ordinary Memory generation

STMB mengharapkan satu JSON object:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Peraturan:

- return hanya JSON object;
- gunakan exact keys `title`, `content`, dan `keywords`;
- `keywords` mesti JSON array of strings;
- title singkat dan readable;
- gunakan concrete retrieval terms;
- taruh Markdown yang dikehendaki di dalam string `content`;
- escape quotation marks dengan betul.

STMB boleh memperbaiki sebagian fences, trailing commas, think tags, wrappers, atau minor malformed output, tetapi prompt tidak boleh bergantung pada recovery.

Memory prompt yang kuat menyatakan:

1. desired memory style dan compression level;
2. continuity-relevant information yang mesti dikekalkan;
3. filler, OOC, atau unsupported material yang mesti dihilangkan;
4. exact JSON schema.

Prompt lemah menetapkan style tanpa structure, meminta analysis bukan final object, mencampurkan previous context dengan current scene, atau memakai abstract keywords.

### 21.2 Built-in Summary Prompts dan memilihnya

Preset ini hanya untuk ordinary Memory generation. Mereka tidak mengontrol Consolidation, Side Prompts, Topical Clips, atau Compaction. Profile memilih satu di **Memory Creation Method**. **Summary** ialah ordinary fallback/default bila profile tidak menentukan preset lain. Built-in berarti disediakan STMB; bukan berarti semua preset berjalan atau semuanya sama sepadan untuk satu chat.

Tidak ada universal best prompt, kerana detail, readability, retrieval quality, dan token cost saling tarik-menarik. Jawapan praktis singkat:

- **Default awal terbaik untuk kebanyakan pengguna: Summary.** Seimbang, general-purpose, dan sepadan untuk test pertama dengan model baharu.
- **Terbaik untuk long-running roleplay yang continuity-heavy: Comprehensive.** Filtering, causality, continuity, dan keyword guidance paling kuat, tetapi lebih menuntut model dan boleh menghasilkan structured Memory lebih besar.
- **Terbaik bila hemat context tokens paling penting: Minimal.** Sengaja singkat dan akan kehilangan nuance.
- **Terbaik untuk separate real-group atau Narrator character books: Group dan Character.** Gunakan bersama lewat separate group/character prompt tetapan di profile; ini targeting prompts, bukan competing general-purpose styles.

| Built-in prompt | Paling sepadan untuk | Trade-off utama |
|---|---|---|
| **Summary** | Kebanyakan solo chats dan first-time setup. Menghasilkan detailed chronological narrative prose dengan important events, interactions, developments, revelations, outcomes, dan concrete retrieval keywords. | Menjaga detail lebih banyak dari keperluan user token-minimal, tetapi lebih ringkas dari preset paling structured. |
| **Comprehensive** | Cerita panjang sensitif continuity apabila causal chains, character dynamics, established facts, key exchanges, unresolved threads, dan disciplined keywords penting. Secara eksplisit memfilter incidental detail dan memperbaiki keyword construction. | Instruksi paling panjang dan demanding. Gunakan model instruction-following yang mampu dan response tokens menmencukupii. |
| **Summarize** | User yang menginginkan Markdown sangat scannable dibagi Timeline, Story Beats, Key Interactions, Notable Details, dan Outcome. | Bullet-heavy output lebih mirip reference notes daripada natural memory dan boleh mengulang facts antar headings. |
| **Synopsis** | Scene apabila hampir setiap significant beat, interaction, detail, dan outcome lebih penting daripada compactness. | Sengaja panjang dan comprehensive; sangat tidak sepadan bila lorebook/context budget sempit. |
| **Sum Up** | Chronological narrative beat record dengan scene heading dan timeline kelihatan, tetapi section overhead lebih sedikit dari Summarize atau Synopsis. | Pemisahan events, character dynamics, facts, dan continuity state kurang eksplisit. |
| **Minimal** | High-volume chats, inexpensive archival coverage, atau setup yang memerlukan Memories sangat kecil. Menghasilkan Memory singkat 2–5 kalimat. | Motives, emotional shifts, causality, dan minor continuity details boleh hilang. |
| **Northgate** | Creative-writing users yang ingin coherent third-person past-tense literary record dengan actions, emotional shifts, development, dan significant dialogue. Community style ini dikreditkan kepada Northgate di SillyTavern Discord. | Mengoptimalkan readable narrative, bukan maximum compression atau clearly separated reference categories. Built-in text tidak secara eksplisit mengecualikan OOC, jadi review bila OOC umum. |
| **Aelemar** | Major plot scenes dan emotionally consequential character moments yang mesti masih dipahami sebagai standalone record meski source scene tidak tersedia. Community style ini dikreditkan kepada Aelemar di SillyTavern Discord. | Memerlukan sedikitnya 300 words dan sengaja detail, jadi tidak sepadan untuk aggressive token saving. Built-in text juga tidak secara eksplisit mengecualikan OOC. |
| **Group** | Shared/omniscient Memory Book dalam real group, atau omniscient sasaran dalam multi-book workflow. Menjaga group decisions/state sambil mengatribusikan actions, emotions, dan knowledge ke member yang betul. | Jangan gunakan sebagai individual character Memory; sengaja fokus pada shared group continuity. |
| **Character** | Satu character-focused Memory Book dalam real-group atau multi-character workflow. Mencatat apa yang dilakukan, diketahui, dirasakan, dipelajari, disembunyikan, disalahpahami, atau dialami sasaran character. | Sengaja menghilangkan material scene yang tidak relevan untuk sasaran character dan mengehadkan unsupported private knowledge. |

Untuk pemasangan baharu, gunakan **Summary** sampai generation dan retrieval bekerja andal. Lalu ubah hanya prompt dan bandingkan beberapa Memories dari scene serupa. Pilih **Comprehensive** bila masalahnya omitted causality, continuity state, atau weak keywords; pilih **Minimal** bila masalahnya ukuran Memory. Menggantikan prompt tidak boleh memperbaiki weak model, truncated output, poor scene boundaries, atau incorrect retrieval settings.

Exact built-in text boleh dicipta ulang untuk current SillyTavern locale. Recreating built-ins memadam local edits pada built-ins itu tetapi tidak semestinya memadam unrelated custom presets. Duplicate atau export built-in yang dimodifikasi sebelum recreate.

### 21.3 Multi-character prompt targeting

Apabila separate group/character prompts enabled, STMB menandai request sasaran sebagai:

- `group` untuk canonical real-group atau omniscient Narrator Memory;
- `character` untuk satu individual character-book version.

Prompt mesti secara eksplisit memakai sasaran perspective tanpa mencipta knowledge yang tidak didukung scene dan supplied context.

### 21.4 Side Prompt authoring

Side Prompts biasanya return plain text atau Markdown. Tulis sebagai maintenance instructions, bukan Memory prompts.

Side Prompt yang kuat:

- mendefinisikan satu narrow job;
- menerangkan cara memakai previous tracker;
- memadam stale state;
- menetapkan stable headings dan length limits;
- hanya return final tracker.

### 21.5 Consolidation authoring

Ordinary consolidation memerlukan schema pada Bahagian 17.5. Prompt yang kuat:

- mengekalkan chronology;
- mencipta coherent summaries sesedikit mungkin;
- mengassign setiap used source melalui `member_ids`;
- mengidentifikasi leftovers melalui `unassigned_items`;
- mengekalkan major changes dan unresolved continuity;
- memakai concrete keywords.

Preset khusus **Regenerate Consolidation** hanya untuk satu replacement summary dan tidak boleh dipilih sebagai biasa consolidation default.

### 21.6 Topical Clip authoring

Prompt mesti menyertakan `{{SOURCE_MEMORIES}}`, masih fokus pada requested topic, membezakan source evidence dari inference, menggabungkan new material ke existing Clip content, dan memaparkan contradictions.

### 21.7 Compaction authoring

Prompt mesti menyertakan `{{ENTRY_CONTENT}}` dan memendekkan tanpa menambah unsupported facts. Ia mesti mengekalkan structural wrappers dan macros yang diperlukan entry.

### 21.8 Checklist penulisan prompt

Sebelum menyelesaikan STMB prompt, jawab:

1. Material apa yang betul-betul menjadi analysis sasaran?
2. Material mana yang hanya reference-only?
3. Adakah path ini mengharapkan strict JSON atau final plain text?
4. Informasi apa yang mesti bertahan untuk retrieval kemudian?
5. Apa yang mesti dihilangkan, digabungkan, dibawa ke depan, atau dibiarkan unassigned?

Return-format correctness lebih penting daripada style.

---

## 22. Summary Prompt Manager dan Consolidation Prompt Manager

### Summary Prompt Manager

Boleh create, edit, duplicate, delete, import, dan export ordinary Memory prompt presets. Assign preset melalui Memory Books profile.

Semua ordinary Memory presets mesti mengekalkan required Memory JSON schema.

Lihat Bahagian 21.2 untuk panduan memilih built-in Summary Prompt dan best-use cases.

### Consolidation Prompt Manager

Mengontrol prompts yang digunakan untuk mengelompokkan lower-tier entries menjadi higher-tier summaries dan memilih biasa default consolidation prompt.

Preset consolidation khusus regeneration tidak boleh digunakan untuk ordinary consolidation.

### Import dan localization behavior

Built-in prompts boleh dicipta ulang dalam current app locale. Backup locally modified built-ins sebelum recreate.

---

## 23. STMB dan Extension Lain

Extension SillyTavern berjalan seiring dan boleh membaca atau mengubah data SillyTavern yang sama. STMB tidak mengatasi atau menyahdayakan extension lain, dan tidak menetapkan keutamaan atas extension tersebut. Apabila tingkah laku extension bertindih, hasil akhir bergantung pada tetapan dan masa tindakan setiap extension yang terlibat.

### 23.1 Keterlihatan mesej yang dikongsi

Sama ada sesuatu mesej chat disembunyikan ialah sebahagian daripada status mesej SillyTavern yang dikongsi. Status itu bukan milik STMB secara eksklusif.

Tetapan **Token Saving** STMB boleh menyembunyikan mesej yang telah diproses selepas suatu Memory disimpan. Extension lain kemudiannya boleh memaparkan semula mesej tersebut, dan STMB tidak akan menghalangnya. Begitu juga, **Unhide hidden messages for memory generation** boleh memaparkan mesej semasa STMB memproses atau menjana semula selected range.

### 23.2 Presence

Extension Presence dan STMB kedua-duanya boleh mengubah status tersembunyi atau kelihatan bagi mesej chat. Jika Presence memaparkan mesej yang disembunyikan STMB, tetapan Token Saving STMB tidak dipadam atau diabaikan; tindakan Presence yang berlaku kemudian telah mengubah status mesej SillyTavern yang sama.

Jika anda menggunakan Presence dan mahu mesej yang disembunyikan oleh STMB kekal tersembunyi, gunakan ciri penguncian mesej tersembunyi milik Presence. Presence kini menyediakan perintah `/presenceLockHiddenMessages` untuk tujuan ini. Jalankannya untuk range mesej yang berkaitan dan ulangi apabila range itu bertambah. Rujuk dokumentasi Presence untuk tingkah laku perintah semasa.

STMB tidak mengkonfigurasi atau menjalankan Presence secara automatik, dan pengurusan peserta group chat oleh STMB tidak berkaitan dengan Token Saving.

### 23.3 Integrasi Regex

STMB terintegrasi dengan Regex extension SillyTavern pada dua tahap:

1. **Outgoing/User Input:** transform assembled prompt sebelum dihantar.
2. **Incoming/AI Output:** membersihkan atau menstandarkan raw response sebelum parsing/saving.

Aktifkan **Use regex (advanced)**, lalu buka **Configure regex** dan pilih satu atau lebih scripts untuk tiap arah.

Penting: selection milik STMB sendiri mengontrol execution. Script yang dipilih STMB boleh berjalan malah jika script itu disabled dalam interface biasa Regex extension.

Gunakan Regex hanya jika transform dipahami. Outgoing rule yang buruk boleh merusak required schema instructions; incoming rule yang buruk boleh merusak JSON yang sebenarnya valid.

---

## 24. Tajuk Entri Lorebook dan Dasar Karakter

### 24.1 Title placeholders

Format title profile boleh memakai:

- `{{title}}` — title buatan AI;
- `{{scene}}` — source range;
- `{{char}}` — nama character/group;
- `{{groupname}}` — display name group semasa; menjadi `Unknown` di luar group chat;
- `{{present}}` — comma-separated characters yang hadir dalam scene: individual speakers dalam group chat, selected Active Cast scene dalam Narrator Mode, atau current character dalam regular character chat;
- `{{user}}` — nama user;
- `{{messages}}` — bilangan message dalam scene;
- `{{profile}}` — nama profile;
- date dan time placeholders yang disokong.

### 24.2 Auto-numbering

Numbering tokens yang didukung merangkumi bentuk seperti:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB menetapkan angka berurutan dengan zero-padding sesuai format terpilih.

### 24.3 Printable Unicode

Semua printable Unicode characters dibenarkan dalam title, termasuk emoji, accented text, CJK, dan symbols. Unicode control characters U+0000–U+001F dan U+007F–U+009F dipadam.

Nama file lorebook yang digunakan Auto-Create disanitasi berasingan untuk filesystem-reserved characters dan length.

---

## 25. Job Queue dan Kawalan Retry

Queue pilihan memerlukan Chat Top Bar / Chat Top Info Bar. Apabila queue tersedia, regenerating Memory, consolidation, atau Side Prompt mencipta regeneration job; replacement masih dalam review sampai disetujui.

Drawer **Memory Books Jobs** boleh memaparkan:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

Jobs yang memproses chat range memaparkan starting dan ending message numbers di queue rows. Drawer juga boleh cancel active work, membuka semula review jobs, inspect failures, retry work, dan dismiss terminal history rows.

Retry scopes:

- **Retry:** rerun satu non-Memory job, contohnya Side Prompt atau consolidation job.
- **Retry All:** rerun/resume Memory dan associated after-Memory Side Prompt work. Jika Memory sudah tersimpan, STMB boleh resume dari hasil itu alih-alih menduplikasinya.
- **Retry Memory:** rerun/resume hanya Memory dan sengaja skip after-Memory Side Prompts.

Gunakan Retry All untuk memulihkan combined workflow; gunakan Retry Memory bila tracker work tidak boleh berjalan.

Tanpa Chat Top Bar, STMB masih menjalankan biasa workflows tetapi tidak mempunyai queue UI.

---

## 26. Maklum Balas Visual dan Kebolehcapaian

STMB menyediakan visual states untuk scene controls, termasuk inactive, selected, valid range, in-scene, dan processing states. Warna sesuai bergantung pada theme SillyTavern.

Sokongan accessibility merangkumi:

- keyboard navigation;
- focus indicators;
- ARIA attributes;
- reduced-motion behavior;
- mobile-friendly controls.

Apabila mengajar dari screenshot, jelaskan icon dan label yang kelihatan, bukan bergantung pada warna tertentu.

---

## 27. Peta Tetapan dan Rujukan Tetapan Semasa

Bahagian ini ialah settings map. Ia menunjukkan lokasi setiap user-facing STMB configuration control dan fungsinya. Bahagian ini juga mencantumkan saved controls dan one-run controls penting di specialized interfaces. One-time content fields yang hanya digunakan untuk mencipta Clip, Topical Clip, Compaction, atau preview tertentu didokumentasikan pada workflow masing-masing dan tidak diulang di sini.

Laluan awal umum:

**magic-wand Extensions menu di samping chat input → Memory Books**

Semua path di bawah dimulakan dari **Memory Books** main panel kecuali secara eksplisit bertuliskan **SillyTavern**. Control boleh tersembunyi atau disabled bila tidak berlaku untuk chat, provider, profile, atau storage mod semasa.

Scope yang digunakan:

- **Global:** berlaku di seluruh STMB kecuali dioverride tetapan lebih sempit.
- **Per chat:** disimpan untuk chat atau group semasa.
- **Per character:** mengikut character card di compatible chats.
- **Per profile/templat/tetapan:** disimpan dalam reusable object tersebut.
- **Per run:** hanya memengaruhi operation yang sedang disiapkan.

### 27.1 Main panel: storage, chat mod, dan active profile

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mod; book choice per chat | Berhenti memakai biasa chat-bound lorebook sebagai automatic sasaran STMB dan mengmestikan Memory Book dipilih untuk current chat. Tidak boleh enabled bersama Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; visible di Manual Mode | Per chat | Memilih main Memory Book yang menerima Memories untuk chat ini. Dalam Narrator Mode ini omniscient book. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; visible di real group dengan Manual Mode | Per chat | Menetapkan separate Memory Book bagi setiap real-group member. STLO diperlukan untuk mengonfigurasi assignment dan character-filtered retrieval behavior berkaitan. |
| **Character Memory Book lock** | Lock icon di samping character Memory Book assignment | Per character | Menjaga character card masih assigned ke Memory Book yang sama di compatible Manual Mode chats. Unlock sebelum menukar assignment. |
| **Narrator Mode** | **Current Lorebook Configuration**; hanya biasa non-group chats | Per chat | Memakai selected manual book sebagai omniscient Memory Book dan mengaktifkan declared fictional cast dengan unique books sendiri. Manual Mode dan omniscient book diwajibkan. |
| **Manage Narrator Cast** | Di bawah **Narrator Mode**; juga dari Active Cast drawer | Per chat | Menambah, retire, restore, dan mengassign unique Memory Books ke declared Narrator characters. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Dalam Automatic Mode, mencipta dan bind lorebook bila chat belum mempunyainya. Tidak boleh enabled bersama Manual Mode. |
| **Lorebook Name Templat** | Tepat di bawah **Auto-create lorebook if none exists** | Global | Memberi nama auto-created books. Menyokong `{{char}}`, `{{user}}`, `{{chat}}`. Hanya digunakan apabila Auto-Create Lorebook Mode enabled. |
| **Memory profile selection** | **Memory Profiles** selector | Per run | Memilih profile untuk Memory seterusnya dan profile actions di dekatnya. Selection saja tidak menukar saved default. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Menjadikan selected profile sebagai default untuk automatic Memories dan workflow lain kecuali confirmation, Side Prompt override, atau workflow-specific choice memilih profile lain. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**, atau **Profile Actions → Edit Profile** | Per profile | Memformat new Memory entry titles dan pilihan numbering dengan title macros. Main-panel control mengedit format default profile; **Edit Profile** menukar selected profile terus. |

### 27.2 General Settings

Buka **Settings → General Settings** di main panel.

| Setting | Scope | Fungsi |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Melewati biasa pre-generation confirmation window. Wajib untuk non-interactive catch-up; independent warnings dan enabled previews masih boleh muncul. |
| **Automatically accept detected participants in future** | Global | Berhenti meminta real-group participant confirmation dan menerima detected participant set STMB untuk Memories seterusnya. |
| **Show memory previews** | Global | Membuka editable review sebelum menyimpan generated Memories dan applicable Side Prompt output. |
| **Show consolidation previews** | Global | Membuka review controls untuk generated consolidation candidates sebelum commit. |
| **Show notifications** | Global | Mengaktifkan STMB toast notifications. |
| **Show floating Clip button when text is highlighted** | Global | Memaparkan floating scissors control selepas chat text dipilih. |
| **Memory boundary indicator** | Global | Memaparkan neither control, processed-boundary divider, draggable jump button, atau kedua-duanya. |
| **Allow scene overlap** | Global | Membenarkan selected scene range overlap dengan message IDs yang sudah diwakili existing Memory. |
| **Refresh lorebook editor after adding memories** | Global | Refresh lorebook editor terbuka selepas STMB menulis entries agar content baharu terus kelihatan. |
| **Copy Memory Books when branching** | Global | Memberi native chat branch independent copies dari active unlocked chat-bound atau manual Memory Books. Character-locked books masih shared sesuai desain. |
| **Auto-rollback after message deletion** | Global | Mengaktifkan coordinated rollback apabila message deletion atau truncation mengenai chat material yang telah processed. Disabled secara default. Ordinary message edits dan swipes tidak mencetuskannya. |
| **Update last message ID processed** | Global; Auto-Rollback action | Memindahkan processed checkpoint ke hujung Memory terbaru yang masih wujud, atau membersihkannya jika tiada yang tinggal. |
| **Delete last Memory** | Global; Auto-Rollback action | Memadam semua Memory yang invalid dalam rollback scope bersama linked copies. Pemadaman Memory dan consolidation adalah irreversible. |
| **Restore previous Side Prompts** | Global; Auto-Rollback action | Memulihkan setiap affected Side Prompt yang tidak berubah kepada latest exact before-state. Hanya satu rollback level disimpan. |
| **Default for solo chats** | Global | Memilih Side Prompt Set yang diwarisi solo chats selepas Memory. Empty selection memakai individually enabled after-Memory Side Prompts. |
| **Default for group chats** | Global | Memilih Side Prompt Set yang diwarisi real group chats selepas Memory. Empty selection memakai individually enabled after-Memory Side Prompts. |
| **Max Response Tokens** | Global | Mengoverride maximum output length untuk STMB generation. Naikkan jika JSON valid terpotong; `0` membiarkan biasa provider/SillyTavern behavior tersedia sebagai fallback. |
| **Token Warning Threshold** | Global | Memaparkan confirmation warning bila estimated input request melampaui threshold. Tidak menukar model context limit. |
| **Default Previous Memories Count** | Global | Mengatur default 0–7 prior Memories yang diberikan sebagai continuity context untuk new Memory. Run boleh override di **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Mengaktifkan regex-processing selection milik STMB. Selection ini berasingan dari adakah underlying SillyTavern regex script enabled di interface biasa. |
| **Configure regex… → Outgoing scripts** | Global | Memilih scripts yang dijalankan STMB pada material sebelum dihantar ke generation provider. |
| **Configure regex… → Incoming scripts** | Global | Memilih scripts yang dijalankan STMB pada returned material sebelum parsing dan saving. |

#### Memory Auto-Rollback dalam General Settings

**Auto-rollback after message deletion** ialah master preference. Tiga action checkboxes boleh dipilih secara berasingan, enabled secara default, dan secara visual disabled ketika master switch off. Oleh itu existing installation tidak mula memadam apa-apa hanya kerana upgrade.

Auto-Rollback hanya bertindak pada message deletion atau truncation, termasuk deletion phase semasa response regeneration. Ordinary edit atau swipe tidak mencetuskannya. STMB menjejak actual message identities dalam setiap chat kerana deletion event value SillyTavern tidak dapat mengenal pasti middle deletion dengan boleh dipercayai.

Untuk tail deletion, setiap Memory yang stored source range bersilang dengan removed suffix akan affected. Untuk deletion di tengah chat, STMB meminta satu daripada tiga pilihan:

- **Full rollback** memadam affected Memory dan semua Memory yang lebih baharu.
- **Affected only** hanya memadam overlapping Memories, mengekalkan newer Memories, dan mengalihkan stored ranges, relevant Side Prompt checkpoints, dan processed checkpoint mengikut deletion count. Ini sengaja meninggalkan permanent gap dalam Memory coverage.
- **Cancel** tidak membuat perubahan Memory Books.

Rollback menggunakan exact `STMB_chatId`, source-range, dan canonical/link metadata merentasi available Memory Books. Canonical group atau Narrator Memory dan semua discoverable linked copies ialah satu deletion unit. Missing canonical copies, ambiguous legacy entries tanpa chat identity yang cukup, malformed ranges, atau incomplete consolidation dependencies menghentikan keseluruhan rollback dan memberikan repair guidance; STMB tidak meneka ownership.

Apabila **Delete last Memory** dipilih, STMB melakukan preflight bagi setiap direct dan transitive consolidation parent dalam setiap affected Memory Book. Satu combined confirmation menyenaraikan consolidations yang mesti dipadam. Membatalkan confirmation turut membatalkan checkpoint, Memory, dan Side Prompt changes. Approval memadam consolidation ancestors, re-enable setiap existing direct source yang disabled oleh deleted consolidation dan membersihkan backlink `disabledBySummaryId`, kemudian memadam selected base Memories. Entries yang disabled secara bebas oleh user tidak di-enable.

Sebelum save, STMB menyemak semula complete lorebook fingerprints. Lorebooks ditulis melalui normal serialized write lanes dalam sorted order, dan unchanged pre-write clones disimpan untuk compensating saves jika book kemudian gagal. Chat checkpoint metadata hanya berubah selepas semua lorebook writes berjaya. Queued work untuk chat dibatalkan sebelum preflight; active non-queued Memory creation dibenarkan selesai sebelum rollback diteruskan.

Side Prompt rollback menggunakan version-2 regeneration snapshots. Setiap snapshot merekod sama ada entry existed, exact prior state tanpa older rollback snapshot, source chat/range, dan fingerprint state yang ditulis STMB. Jika rolled-back run mencipta entry, rollback memadamnya. Jika current entry tidak lagi sepadan dengan saved fingerprint, STMB menganggap user atau later run telah mengubahnya dan membiarkannya. Version-1 snapshots masih menyokong regeneration tetapi tidak cukup selamat untuk rollback dan dilangkau dengan warning. Successful restore menggunakan snapshot itu, jadi Side Prompt tersebut tidak boleh di-rollback lagi sehingga run seterusnya. Jika beberapa Memories di-rollback bersama, hanya latest available before-state bagi setiap Side Prompt boleh dipulihkan; maklumat daripada older rolled-back runs mungkin kekal.

#### Token Saving di dalam General Settings

Kawalan berikut ada lebih bawah dalam popup **General Settings** di bawah **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Memilih no automatic hiding, semua processed messages hingga latest Memory, atau hanya range yang digunakan latest Memory. Hiding reversible dan tidak memadam messages. |
| **Messages to leave unhidden** | Global | Membiarkan sejumlah recent messages masih visible apabila auto-hiding untuk overlap dekat Memory boundary. `0` hide sampai applicable scene end. |
| **Unhide hidden messages for memory generation** | Global | Menjalankan equivalent `/unhide X-Y` untuk source range sebelum STMB compile. Selected auto-hide mod menentukan apa yang dihide semula selepas save berjaya. |

### 27.3 Automatic Memories dan consolidation reminders

Buka **Settings → Automatic Memories**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Auto-create memory summaries** | Global | Mengaktifkan automatic `/nextmemory`-style Memory creation. Tanpa processed baseline, STMB semasa boleh bermula pada message 0; first manual Memory masih disyorkan untuk validasi setup dan deliberate starting boundary. |
| **Auto-Summary Interval** | Global | Mengatur berapa messages membentuk biasa automatic cadence. |
| **Auto-Summary Buffer** | Global | Mengecualikan sejumlah newest messages dari automatic range yang sudah siap agar generation sedikit tertinggal dari live conversation. |
| **Prompt for consolidation when a tier is ready** | Global | Memaparkan yes/later prompt apabila monitored tier mencapai saved eligible-source minimum. Tidak pernah melakukan consolidation diam-diam. |
| **Auto-Consolidation Tiers** | Global | Memilih sasaran tiers yang dipantau readiness prompts. Minimum tiap tier disimpan dalam **Consolidate Memories**. |

### 27.4 Profile editor

Pilih profile di **Memory Profiles**, lalu buka **Profile Actions → Edit Profile**. Setting ini **per profile** kecuali dinyatakan lain. Built-in **Current SillyTavern Settings** profile sengaja mengunci fields yang dikontrol SillyTavern.

| Setting | Fungsi |
|---|---|
| **Profile Name** | Menamai reusable STMB profile. Built-in profile name locked. |
| **API/Provider** | Memilih current SillyTavern routing, supported provider, Custom OpenAI-compatible connection, atau Full Manual Configuration. |
| **Use this connection profile** | Untuk **Custom OpenAI-Compatible API**, memakai active SillyTavern Custom connection atau satu named Custom connection. Saved URL dan secret digunakan sementara STMB **Model** masih model override. |
| **Skip structured output and use plain-text completion** | Berhenti menghantar structured-output schema bila provider menolaknya. Selected prompt masih mesti mencipta model mengembalikan required valid JSON STMB. |
| **Use ST's ChatCompletionService** | Meroute supported requests melalui built-in Chat Completion request helper SillyTavern. Tidak tersedia bagi Full Manual profiles. |
| **Chat Completion Preset** | Pilihan menerapkan SillyTavern Chat Completion preset melalui ChatCompletionService. |
| **Model** | Memberikan exact model ID untuk profile. **Current SillyTavern Settings** membaca active model SillyTavern. |
| **Temperature** | Mengatur generation randomness. **Current SillyTavern Settings** membaca active temperature SillyTavern. |
| **Use reverse proxy** | Meneruskan configured reverse-proxy details SillyTavern untuk supported providers; dalam Full Manual Configuration secret field dilabeli proxy password. |
| **API Endpoint URL / API Key** | Memberikan separate direct endpoint dan credential hanya untuk **Full Manual Configuration**. Untuk penggunaan biasa, utamakan connection yang configured/tested di SillyTavern. |
| **Memory Creation Method** | Memilih Summary Prompt preset untuk ordinary Memory generation. Prompt content diurus di **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Menggunakan distinct prompt presets untuk group Memory Book dan character-focused Memory Books. |
| **Group Summary Prompt / Character Summary Prompt** | Memilih dua presets apabila separate group/character prompting enabled. |
| **Memory Title Format** | Mengontrol title text, macros, dan automatic numbering untuk Memories dari profile ini. |
| **Activation Mode** | Menyimpan new entries sebagai **Normal** keyword activation, **Constant**, atau **Vectorized**. |
| **Insertion Position** | Memilih lokasi generated entry relatif terhadap Character, Example Messages, Author's Note, atau named Outlet. |
| **Outlet Name** | Menamai sasaran Outlet dan hanya muncul jika **Insertion Position** = **Outlet**. |
| **Insertion Order** | **Auto** menurunkan order dari Memory number; **Manual** memakai fixed value; **Reverse** menghitung mundur dari starting value dan hanya dimaksudkan untuk Outlets. |
| **Prevent Recursion** | Menghalang content generated entry memicu lorebook entries lain apabila recursive scanning. |
| **Delay Until Recursion** | Menghalang generated entry aktif pada first scan pass. Biarkan off bila tidak ada yang lain boleh memulakan recursion. |
| **Also include** | Hanya legacy-profile compatibility. Older profiles boleh memaparkan ordered lorebook references; current configuration memakai per-chat **Context Settings**. |

Active SillyTavern provider, model, temperature, connection preset, dan reverse proxy dikonfigurasi di connection controls SillyTavern sendiri, bukan STMB. **Current SillyTavern Settings** membaca live values tersebut.

### 27.5 Context Settings

Buka **Settings → Context Settings**.

| Setting | Scope | Fungsi |
|---|---|---|
| **Additional Context for this chat** | Per chat | Memilih named Context Setting, secara eksplisit menyimpan **No Context**, atau membiarkan unset agar STMB boleh prompt apabila migrated context memerlukan keputusan. |
| **Context Setting Name** | Per Context Setting | Menamai reusable Additional Context collection. |
| **Additional Context entries and order** | Per Context Setting | Memilih lorebook entries yang dihantar sebagai stable reference material dan menentukan order. Missing entries diperingatkan dan dilangkau. |

**New**, **Duplicate**, **Delete**, **Import JSON**, dan **Export JSON** mengurus Context Settings; tidak menukar generation behavior sampai tetapan dipilih oleh chat atau Side Prompt.

### 27.6 Trackers & Side Prompts

Buka **Settings → Trackers & Side Prompts**.

| Setting | Location dan scope | Fungsi |
|---|---|---|
| **After-memory side prompt mod for this chat** | Manager main screen; per chat | Memakai matching solo/group default, explicitly individually enabled after-Memory prompts, atau satu named Side Prompt Set. |
| **How many concurrent prompts to run at once** | Manager main screen; global | Membatasi simultaneous Side Prompt jobs ke 1–10. |
| **Side Prompt Set Name** | **New Set** atau edit set; per set | Menamai reusable ordered group dari Side Prompt runs. |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row; per set | Memilih templat row, pilihan display/title label, literal atau set-level runtime macro values, dan menggunakan row order sebagai execution order. |
| **Enabled** | **New** atau edit ordinary Side Prompt; per templat | Mencipta templat eligible apabila chat memakai individually enabled after-Memory prompts. Trigger settings masih menentukan kapan berjalan. |
| **Run on visible message interval / Interval** | Side Prompt editor; per templat | Menjalankan selepas configured number visible messages. Automatic triggers tidak tersedia apabila templat memerlukan unresolved runtime macros. |
| **Run automatically after memory** | Side Prompt editor; per templat | Menjalankan templat selepas successful Memory, tunduk pada chat Side Prompt mod atau selected set. |
| **Allow manual run via `/sideprompt`** | Side Prompt editor; per templat | Membenarkan explicit manual execution. |
| **Prompt / Response Format** | Side Prompt editor; per templat | Mendefinisikan instruction dan pilihan output structure. Kedua fields boleh memakai supported Side Prompt macros. |
| **Previous memories for context** | Side Prompt editor; per templat | Menyertakan 0–7 previous Memory entries sebelum selected source messages. |
| **Use additional context / Additional Context Source** | Side Prompt editor; per templat | Menyertakan Additional Context dan mengikut current chat Context Setting atau sentiasa memakai fixed named tetapan. |
| **Lorebook Sasaran** | Side Prompt editor; per templat atau per chat | Menyimpan output ke biasa Memory Book atau chosen lorebook lain. Apabila ditukar, STMB bertanya adakah pilihan berlaku hanya untuk chat ini atau templat ke depan. |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor; per templat | Pilihan mengontrol upserted entry title templat dan comma-separated activation keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor; per templat | Mengontrol activation dan placement entri lorebook Side Prompt. |
| **Insertion Order / Order Value** | Side Prompt editor; per templat | Memakai automatic Memory-number ordering atau fixed manual order value. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor; per templat | Menerapkan corresponding SillyTavern lorebook-entry recursion dan budget flags. |
| **Override default memory profile / Connection Profile** | Side Prompt editor; per templat | Meroute Side Prompt ini melalui selected STMB profile alih-alih current default profile. |
| **Memory Assistance Mode** | Edit **Memory Assistance**; global | **Off** menyahaktifkan; **Update** mengusulkan perubahan existing Clips; **Update and Suggest** juga menemui Topical Clip topics; **Automatic** terus menerapkan ordinary Clip additions tetapi menyisakan Topical Clip replacements untuk approval. |
| **Update Prompt / Topic Suggestions Prompt** | Edit **Memory Assistance**; per built-in templat | Mengontrol dua AI tasks. Response contracts masih fixed. |
| **Use a connection profile override** | Edit **Memory Assistance**; per built-in templat | Menggunakan selected STMB profile untuk Memory Assistance alih-alih default. |

### 27.7 Prompt managers

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** atau edit | Per preset | Mendefinisikan reusable ordinary-Memory prompt. Profile menggunakannya hanya selepas **Memory Creation Method** atau group/character prompt selection menunjuk ke preset itu. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Memilih biasa prompt yang dipreselect oleh **Consolidate Memories**. Regeneration-only dan group-only presets tidak boleh dipilih. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** atau edit | Per preset | Mendefinisikan reusable consolidation instructions. Dedicated regeneration dan group presets dihadkan untuk workflows tersebut. |

### 27.8 Topical Clip dan Compaction defaults

Buka **Settings → Topical Clip** atau **Settings → Compaction**.

| Setting | Location | Scope | Fungsi |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**, atau **Compaction → Compaction Profile** | Global shared default | Memilih STMB profile untuk Topical Clip generation dan Compaction. Menukar di salah satu interface menukar shared selection bagi kedua-duanya. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Menyimpan prompt tersuai templat untuk Topical Clip generation. **Reset to Default** semula ke current built-in prompt. Required source macros divalidasi sebelum save atau generation. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Menyimpan prompt tersuai templat untuk memendekkan existing Memory, Clip, dan Side Prompt entries. **Reset to Default** semula ke current built-in prompt. `{{ENTRY_CONTENT}}` wajib. |

Memory Book, topic, keywords, source inclusion, source selection, message range, draft, dan entry yang dipilih untuk Compaction ialah per-run workflow choices, bukan persistent settings.

### 27.9 Consolidate Memories controls

| **Source Memory Book** | Per run | Memaparkan Memory Book yang sedang di-consolidate dan membolehkan anda memilih available book lain. Menukarnya reload eligible-entry list tanpa mengubah configured manual atau chat-bound Memory Book chat. | Buka **Consolidate Memories** dari tombol di bahagian bawah main panel. Interface ini mencampurkan saved defaults dan one-run choices.

| Setting | Scope | Fungsi |
|---|---|---|
| **Sasaran tier** | Per run | Memilih higher tier yang dicipta dan oleh itu immediately lower eligible source tier. |
| **Consolidation Prompt** | Per run | Memilih prompt untuk consolidation ini; awalnya memakai default dari Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Membatasi berapa lower-tier entries dihantar dalam satu analysis pass. |
| **Token Budget** | Per run | Mengatur approximate input budget untuk batching consolidation. |
| **Number of automatic summary attempts** | Per run | Membatasi repeated analysis passes untuk memperoleh usable assignments dan summaries. |
| **Saved minimum eligible entries** | Global, disimpan berasingan per sasaran tier | Mengatur kapan chosen tier dianggap ready dan mengontrol automatic readiness prompt tier itu. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | Mengontrol cara newly consolidated entries disimpan. Berasingan dari ordinary Memory profile entry settings. |
| **Disable selected source entries after creating summaries** | Per run | Menyahaktifkan successfully consolidated sources selepas commit agar higher-tier summaries boleh menggantikan mereka di retrieval. Tidak memadam. |
| **Selected source entries** | Per run | Memilih eligible lower-tier entries yang diproses. Unchecked entries tidak ditukar. |


### 27.10 Related SillyTavern World Info settings

Kawalan ini berada di luar STMB, dalam World Info/lorebook settings SillyTavern, tetapi memengaruhi adakah saved Memories diretrieve selama ordinary chat generation.

| Setting | Fungsi |
|---|---|
| **Match Whole Words** | Mengontrol keyword boundary matching. Off ialah common starting point untuk flexible Memory keywords. |
| **Scan Depth** | Mengontrol seberapa banyak recent text discan untuk lorebook activation. Nilai relatif tinggi seperti 8 ialah common starting point. |
| **Max Recursion Steps** | Membatasi recursive World Info activation. Sekitar 2 ialah common starting point. |
| **Context percentage / lorebook budget** | Membatasi berapa context yang boleh ditempati lorebook entries. Naikkan hanya dengan mempertimbangkan total context model dan competing prompt material. |

Ini cadangan, bukan hard requirements; lihat Bahagian 10 untuk retrieval diagnosis.

---

## 28. Rujukan Slash Command

### Memory commands

```text
/creatememory
```

Mencipta Memory dari currently marked scene.

```text
/scenememory X-Y
```

Menetapkan inclusive range dan mencipta Memory, contohnya `/scenememory 10-15`.

```text
/nextmemory
```

Mencipta Memory dari message selepas highest processed boundary sampai current eligible end.

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

Menghentikan semua in-flight STMB generation di mana pun, termasuk Side Prompts. Work yang sudah committed masih tersimpan.

---

## 29. Penyelesaian Masalah Mengikut Tahap

### 29.1 Extension/UI tidak dimuatkan

Gejala:

- Memory Books hilang dari magic-wand menu;
- chevrons hilang;
- tidak ada floating Clip button selepas selection.

Periksa:

1. extension installed dan enabled;
2. page reloaded;
3. character/group chat terbuka;
4. tunggu hingga sepuluh detik;
5. expand message actions;
6. inspect console hanya selepas pemeriksaan tersebut gagal.

### 29.2 Tidak ada scene terpilih

**►** dan **◄** kedua-duanya wajib untuk marked scene. Pengesahan Current Scene di panel.

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

- STLO mesti tersedia;
- setiap required member memerlukan valid assignment;
- group book tidak boleh digunakan semula sebagai character book.

Narrator Mode:

- Manual Mode mesti enabled;
- omniscient book mesti selected;
- setiap declared member memerlukan unique non-omniscient book.

### 29.4 AI gagal menghasilkan valid Memory

Periksa dengan urutan ini:

1. provider/model/profile valid;
2. response tidak truncated;
3. maximum response tokens menmencukupii;
4. selected prompt masih meminta exact JSON;
5. schema tidak dirusak Regex;
6. provider menyokong selected structured-output mod;
7. coba Skip Structured Output hanya jika provider menolak schemas;
8. coba model yang lebih instruction-following sebelum menulis semula prompt;
9. klik **Raw response from AI** pada persistent error notification untuk inspect captured provider response dan gunakan manual JSON correction interface bila tersedia.

Penyebab umum termasuk code fences, commentary, missing key, keywords bukan array, refusal text, atau cut-off output.

### 29.5 Memory tersimpan tetapi messages menghilang

Kemungkinan mereka auto-hidden. Ubah Token Saving settings. Hidden messages tidak dipadam.

### 29.6 Automatic Memories tidak berjalan

Periksa:

- Auto-create memory summaries enabled;
- menmencukupii messages selepas highest processed boundary;
- interval plus buffer requirement terpenuhi;
- tidak ada postpone checkpoint yang masih aktif;
- valid Memory Book tersedia;
- tidak ada Memory job lain yang memblokir trigger;
- current chat tidak digantikan selama work;
- group generation selesai sebelum trigger diharapkan.

First manual Memory disyorkan tetapi secara teknikal tidak wajib di current version.

### 29.7 Memory ada tetapi tidak activate

Periksa:

- correct book active;
- entry enabled;
- relevant keywords;
- activation mod;
- budget;
- recursion dan Delay Until Recursion;
- STLO routing bila digunakan;
- World Info inspection/logs.

Jangan regenerate Memory sampai retrieval diuji.

### 29.8 Entry dihantar tetapi diabaikan

Ini model-use behavior. Kemungkinan tindakan:

- buat Memory lebih pendek dan eksplisit;
- perbaiki insertion position/priority;
- kurangi competing context;
- gunakan OOC reminder;
- pilih model yang lebih andal mengikut supplied context.

### 29.9 Side Prompt tidak berjalan

Lihat Bahagian 16.18. Secara khusus, selected set menekan individually enabled prompts di luar set tersebut.

### 29.10 Consolidation tidak memunculkan prompt

Pengesahan:

- readiness prompt enabled;
- sasaran tier dipilih untuk monitoring;
- menmencukupii eligible source entries tersedia;
- sources tidak sudah disabled/ineligible;
- saved minimum count untuk tier tercapai.

### 29.11 Regeneration button disabled

Hover atau inspect alasan yang dipaparkan. Penyebab umum:

- entry mendahului required snapshot metadata;
- source chat/range tidak tersedia;
- source entries hilang atau wrong tier;
- active parent consolidation memblokir lower source;
- original sequence number tidak boleh ditetapkan;
- Side Prompt templat dipadam.

### 29.12 Branch tidak menyalin books

Periksa:

- Copy Memory Books when branching enabled sebelum branch dicipta;
- itu native SillyTavern branch;
- source books ada dan boleh diload;
- chat tidak digantikan selama copying;
- branch belum pernah ditandai completed/failed;
- locked books sengaja dikekalkan alih-alih disalin.

### 29.13 Cast Narrator Mode salah

Periksa:

- Active Cast selection sebelum generation;
- adakah message ialah continuation yang merge cast metadata;
- adakah swipe memulihkan older cast state;
- adakah scene mengandungi legacy untagged messages yang memerlukan confirmation;
- adakah declared character retired;
- adakah setiap character book masih ada.

---

## 30. FAQ

### Adakah saya memerlukan vectors?

Tidak. Keyword activation sudah menmencukupii dan dihasilkan automatik. Vectors pilihan.

### Adakah Memories sebaiknya memakai lorebook berasingan?

Biasanya ya untuk organization, budgeting, reuse, dan diagnosis, tetapi tidak wajib.

### Adakah STMB memadam messages?

Tidak. Ia boleh menyembunyikan processed messages dari active context.

### Bolehkah STMB digunakan sepenuhnya manual?

Ya. Tandai scenes dan buat Memories hanya apabila dikehendaki.

### Bolehkah Automatic Memories mencipta Memory pertama?

Ya di STMB semasa. Tanpa processed baseline, ia bermula dari message 0 selepas interval plus buffer terpenuhi. First manual run masih disyorkan untuk mengesahkan setup dan memilih desired starting boundary.

### Adakah consolidation berjalan automatik?

Tidak. STMB boleh prompt apabila tier ready, tetapi user mengonfirmasi dan mereview operation.

### Bolehkah satu real group memakai satu Memory Book?

Ya. Ini recommended starting setup dan tidak memerlukan STLO.

### Kapan separate real-group character books berguna?

Apabila individual continuity, knowledge, speaker-specific retrieval, atau character-focused summaries sepadan dengan extra setup dan AI requests.

### Adakah Narrator Mode sama dengan Group Chat Mode?

Tidak. Group Chat Mode membaca separate SillyTavern character-card authors. Narrator Mode secara manual mendeklarasikan fictional characters yang ditulis satu Narrator card.

### Adakah Narrator Mode memerlukan STLO?

Tidak untuk active-cast retrieval path-nya. Namun memerlukan Manual Lorebook Mode, satu omniscient book, dan unique per-character books.

### Adakah linked copies tersinkronisasi?

Tidak. Mereka linked untuk origin/consolidation metadata, bukan continuous mirroring.

### Mengapa Delay Until Recursion biasanya sebaiknya off?

Jika tidak ada lorebook entry lain yang memulakan recursion, delayed Memory entry mungkin tidak pernah activate.

### Apa yang dilakukan selepas Memory pertama berjaya?

Pengesahan entry retrieval, lalu enable automatic Memories, pilih interval/buffer, enable token hiding, dan tambahkan Clips atau narrowly defined Side Prompt hanya apabila diperlukan. Gunakan Topical Clip dan Consolidation selepas menmencukupii Memories terkumpul.

---

## 31. Keserasian, Migrasi dan Nota Sejarah Semasa

Bahagian ini mengekalkan hanya history yang memengaruhi penggunaan semasa.

### Current baseline

- Current documented release: v8.5.0, 1 Ogos 2026.
- SillyTavern requirement: 1.14.0 atau lebih baharu.
- Narrator Mode ditambah di v8.5.0.
- Branch book copying, Side Prompt regeneration, dan character Memory Book locks ditambah di v8.4.0.
- Multi-character real-group Memory distribution hadir di v8.0.0.
- Additional Context berpindah dari profiles ke reusable per-chat Context Settings di v7.0.0; older profile context dimigrasikan.
- Topical Clip ditambah di v6.10.0.
- Compaction dan Clips ditambah di v6.6.0.
- Side Prompt Sets dan per-prompt targets ditambah dalam periode v6.4–v6.5.
- Consolidation menjadi multi-tier Arc-through-Epic system di v6.0.0; older Arc metadata dimigrasikan.
- Job Queue integration ditambah di v6.8.0 dan masih pilihan.
- Current profile defaults memakai Delay Until Recursion disabled kecuali user/profile secara eksplisit mengubahnya.

### Existing Memories dari versi lama

Hanya entries dengan flag `stmemorybooks` dan required metadata yang dikenali sebagai STMB Memories. Gunakan lorebook converter yang disediakan untuk older entries yang mendahului current metadata.

### Removed functionality

Old bookmark feature dipadam daripada Memory Books di v4.0.0 dan dipisahkan dari core extension. Jangan ajarkan Memory Books bookmark controls sebagai current behavior.

### Localized built-ins

Built-in prompts boleh diregenerate sesuai active SillyTavern language. Backup customized built-ins sebelum recreation.

### Import behavior

Side Prompt import bersifat additive. Existing prompts dikekalkan; imported key conflicts direname alih-alih menimpa existing prompt.

---

## 32. Nota Pembangun dan Lesen

Memory Books menggunakan Bun untuk bundling/minification.

```sh
bun run build
```

Instal pre-commit build hook repository dengan:

```sh
bun run install-hooks
```

Hook melakukan build sebelum commit, men-stage build artifacts, dan membatalkan commit jika build gagal.

Memory Books Copyright © 2024–2026 Aiko Hanasaki dan dilisensikan di bawah GNU Affero General Public License v3.0. Versi modifikasi mesti mengekalkan notices yang berlaku, mengidentifikasi modifications, dan mematuhi keperluan AGPL source-availability.

---

## 33. Pokok Keputusan Diagnostik Ringkas

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

## 34. Urutan Pengajaran Minimum yang Disyorkan

Untuk user baharu, ajarkan hanya urutan ini terlebih dahulu:

1. Buka magic-wand menu dan temukan Memory Books.
2. Gunakan Automatic Mode dengan bound book atau enable Auto-Create.
3. Pilih Current SillyTavern Settings.
4. Expand message actions dan tandai short complete scene dengan **►** dan **◄**.
5. Buat dan preview satu Memory.
6. Buka Memory Book dan pengesahan saved entry.
7. Pengesahan entry boleh activate kemudian.
8. Enable automatic Memories dan pilih interval/buffer.
9. Enable auto-hide hanya selepas menerangkan bahawa hidden messages tidak dipadam.
10. Perkenalkan Clips, lalu Side Prompts, lalu Topical Clip/Consolidation hanya apabila user punya keperluan konkret.

Jangan bermula dengan prompt tersuai, Full Manual endpoints, multiple character books, Regex, atau consolidation kecuali problem user memang memerlukannya.

---

## 35. Ringkasan Konsep Akhir

Memory Books ialah external continuity pipeline yang dibangun di atas lorebook SillyTavern:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

Sistem bekerja paling baik apabila:

- scenes coherent;
- prompts jelas membezakan sasaran dari reference context;
- JSON workflows mengembalikan exact schemas;
- keywords concrete;
- Memory Books deliberately assigned dan activated;
- long-running trackers memangkas stale state;
- consolidation mengurangkan old detail tanpa memadam continuity;
- users mengesahkan retrieval alih-alih menganggap saved berarti sent;
- advanced multi-book routing digunakan hanya apabila precision-nya sepadan dengan complexity.
