# 🎡 Side Prompts

Side Prompt adalah run prompt STMB tambahan untuk pemeliharaan chat. Side Prompt dapat menganalisis, melacak, meringkas, merapikan, atau memperbarui catatan pendukung tanpa membuat balasan karakter normal harus mengerjakan semua itu.

Gunakan Side Prompt ketika sebuah chat membutuhkan tracker berjalan, laporan hubungan, daftar plot, log penemuan, lembar status NPC, timeline, atau dokumen pendukung serupa. Karakter tetap bisa roleplay. Side Prompt menangani pekerjaan administrasinya. ❤️

## Daftar Isi

- [Apa Itu Side Prompt](#apa-itu-side-prompt)
- [Kapan Menggunakannya](#kapan-menggunakannya)
- [Panduan Setup Cepat](#panduan-setup-cepat)
- [Cara Run Bekerja](#cara-run-bekerja)
- [Run Manual](#run-manual)
- [Run Otomatis Setelah Memory](#run-otomatis-setelah-memory)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [Rentang Pesan](#rentang-pesan)
- [Menulis Side Prompt yang Baik](#menulis-side-prompt-yang-baik)
- [Contoh](#contoh)
- [Troubleshooting](#troubleshooting)
- [Inti Penting](#inti-penting)

---

## Apa Itu Side Prompt

Side Prompt adalah prompt bernama yang berjalan terpisah dari balasan karakter normal.

Side Prompt dapat menghasilkan atau memperbarui:

- tracker plot
- tracker hubungan
- catatan NPC atau faksi
- daftar inventaris/sumber daya
- timeline
- papan misteri/petunjuk
- tracker penemuan atau proyek
- laporan kontinuitas
- catatan cleanup
- entri pendukung bergaya lorebook

Side Prompt berbeda dari memory normal. Memory biasanya menyimpan ringkasan scene secara berurutan. Side Prompt biasanya memelihara dokumen status berjalan yang diperbarui atau ditimpa.

Side Prompt juga **tidak** harus mengembalikan JSON. Teks biasa dan Markdown boleh digunakan kecuali prompt atau target penyimpanan spesifik Anda membutuhkan format yang lebih ketat.

---

## Kapan Menggunakannya

Gunakan Side Prompt untuk pekerjaan pendukung yang terstruktur.

Penggunaan yang baik:

- **Poin plot:** thread aktif, thread selesai, loose end
- **Hubungan:** trust, ketegangan, ketertarikan, batasan, tujuan
- **NPC:** apa yang diketahui, diinginkan, baru dilakukan, atau perlu dilakukan berikutnya oleh tiap NPC
- **Timeline:** tanggal, perjalanan, cedera, deadline, hitung mundur
- **Status dunia:** lokasi, objek, faksi, atau sumber daya yang berubah
- **Misteri:** petunjuk, tersangka, kontradiksi, pertanyaan yang belum terjawab
- **Proyek:** penemuan, riset, blocker, scope drift, langkah berikutnya
- **Kontinuitas:** risiko halusinasi yang mungkin muncul atau konteks yang hilang

Penggunaan yang buruk:

- apa pun yang harus muncul di dalam balasan karakter berikutnya
- prompt “buat ceritanya lebih baik” yang terlalu kabur
- prompt analisis raksasa yang menghasilkan esai setiap run
- ringkasan memory duplikat tanpa pekerjaan terpisah

Side Prompt bukan sihir. Side Prompt yang kabur hanyalah kekaburan yang terorganisir.

---

## Panduan Setup Cepat

Perlu versi klik demi klik? Gunakan [panduan Scribe untuk mengaktifkan Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Jalur singkatnya: buka **Extensions**, buka **Memory Books**, klik **Side Prompts**, pilih prompt yang Anda inginkan, aktifkan, opsional aktifkan **Run automatically after memory**, lalu **Save** dan **Close**.

---

## Cara Run Bekerja

Run Side Prompt normal mengikuti alur dasar yang sama:

1. STMB memilih pesan yang akan ditinjau.
2. Side Prompt disiapkan.
3. Macro yang dibutuhkan diisi.
4. Model menghasilkan output Side Prompt.
5. STMB memeriksa output.
6. Hasilnya dipratinjau, disimpan, diperbarui, atau dilewati sesuai pengaturan Side Prompt.

Side Prompt manual, Side Prompt after-memory, dan baris Side Prompt Set seharusnya terasa seperti bagian dari sistem yang sama. Semuanya berbagi perilaku eksekusi umum untuk preview, batching, pemeriksaan respons kosong, penyimpanan, penghentian, dan notifikasi.

---

## Run Manual

Gunakan `/sideprompt` untuk menjalankan satu Side Prompt secara manual.

Bentuk dasar:

```txt
/sideprompt "Prompt Name"
```

Dengan rentang pesan:

```txt
/sideprompt "Prompt Name" 10-20
```

Dengan runtime macro:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Gunakan tanda kutip untuk nama prompt yang memiliki spasi.

Run manual paling cocok untuk pemeriksaan sekali pakai, update tertarget, dan prompt yang membutuhkan nilai macro khusus.

---

## Run Otomatis Setelah Memory

Beberapa Side Prompt dapat berjalan otomatis setelah sebuah memory dibuat.

Ini berguna ketika tracker harus tetap mutakhir seiring chat berkembang. Misalnya, tracker hubungan atau tracker plot dapat diperbarui setelah tiap memory.

Ada dua mode after-memory:

- **Use individually-enabled side prompts** — perilaku lama; Side Prompt apa pun dengan **Run automatically after memory** aktif dapat berjalan.
- **Use a named Side Prompt Set** — set yang dipilih berjalan sebagai gantinya.

Side Prompt Set yang dipilih menggantikan Side Prompt after-memory yang diaktifkan satu per satu. Side Prompt Set **tidak** ditambahkan di atasnya. Ini mencegah run duplikat akibat checkbox lama yang terlupakan.

---

## Side Prompt Sets

Side Prompt Sets mengelompokkan beberapa Side Prompt menjadi satu workflow berurutan.

Sebuah set adalah daftar run yang terurut, bukan sekadar folder. Side Prompt yang sama dapat muncul lebih dari sekali dengan nilai macro yang berbeda.

Contoh set:

1. Relationship Tracker dengan `{{npc name}} = Alice`
2. Relationship Tracker dengan `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

Ini memungkinkan satu template prompt memelihara entri terpisah untuk NPC, faksi, lokasi, atau proyek yang berbeda.

### Mengelola Sets

Buka **🎡 Trackers & Side Prompts** untuk membuat, mengedit, menduplikasi, menghapus, atau mengurutkan ulang set.

Setiap baris dapat menyertakan:

- sebuah Side Prompt
- label baris opsional
- nilai macro tersimpan
- kontrol duplikasi/hapus
- kontrol naik/turun

Baris berjalan dari atas ke bawah. Letakkan tracker dasar terlebih dahulu dan prompt cleanup/pelaporan setelahnya.

### Menjalankan Set Secara Manual

Jalankan set dengan nilai tersimpan:

```txt
/sideprompt-set "Set Name"
```

Dengan rentang:

```txt
/sideprompt-set "Set Name" 10-20
```

Jalankan set reusable dengan nilai macro:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Gunakan `/sideprompt-macroset` ketika set memiliki token reusable yang masih membutuhkan nilai.

### Set atau Baris yang Hilang

Side Prompt Sets dibuat ketat dengan sengaja:

- Jika tidak ada set yang dipilih, perilaku after-memory yang diaktifkan satu per satu digunakan.
- Jika sebuah set dipilih, Side Prompt after-memory yang diaktifkan satu per satu diabaikan.
- Jika set yang dipilih sudah dihapus, tidak ada yang berjalan dan STMB memperingatkan Anda.
- Jika sebuah baris menunjuk ke prompt yang sudah dihapus, baris itu dilewati dan STMB memperingatkan Anda.
- Jika sebuah baris masih membutuhkan nilai macro, baris itu dilewati dan STMB memperingatkan Anda.

Fallback diam-diam lebih buruk. Jika workflow yang dipilih rusak, Anda perlu tahu.

---

## Macros

Side Prompt dapat menggunakan macro SillyTavern normal seperti `{{user}}` dan `{{char}}`.

Side Prompt juga dapat menggunakan runtime macro, yaitu placeholder yang diisi ketika Side Prompt berjalan.

Contoh runtime macro:

```txt
{{npc name}}
```

Run manual:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Nilai set tersimpan:

```txt
{{npc name}} = Alice
```

Nilai set-level reusable:

```txt
{{npc name}} = {{npc_1}}
```

Lalu jalankan:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Tips Macro

Gunakan nama yang membosankan:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Hindari nama seperti:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Spasi mudah dibaca di UI. Underscore biasanya lebih tidak merepotkan di slash command.

Side Prompt dengan runtime macro khusus sebaiknya tidak diotomatisasi satu per satu kecuali nilai yang dibutuhkan disimpan di suatu tempat, seperti di dalam baris Side Prompt Set. Run otomatis tidak bisa berhenti dan bertanya siapa yang dimaksud oleh `{{npc name}}`.

---

## Rentang Pesan

Side Prompt dapat berjalan pada rentang pesan tertentu.

```txt
/sideprompt "Plot Points" 50-80
```

Jika Anda memberikan rentang, STMB menggunakan rentang itu.

Jika Anda tidak memberikan rentang, STMB menggunakan perilaku normal since-last Side Prompt dengan logic cap/checkpoint yang sudah ada.

Untuk tracking rutin, perilaku since-last lebih mudah. Untuk debugging atau cleanup tertarget, rentang eksplisit lebih jelas.

Penyusunan rentang Side Prompt seharusnya mengikuti preferensi hidden-message yang sama seperti memory, termasuk pengaturan global unhide-before-memory.

---

## Menulis Side Prompt yang Baik

Side Prompt yang baik punya tugas. Side Prompt yang buruk cuma punya vibe.

Jelaskan dengan tegas:

- apa yang harus ditinjau
- apa yang harus diperbarui
- apa yang harus diabaikan
- format output yang harus digunakan
- seberapa panjang outputnya
- apakah output harus mengganti, merevisi, atau menambahkan

### Sengaja Buat Output Tetap Singkat

Tracker akan membengkak jika tidak diberi batasan.

Lemah:

```txt
Update the relationship tracker.
```

Lebih baik:

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

Guardrail yang berguna:

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### Gunakan Heading yang Stabil

Heading yang stabil membuat update berulang lebih bersih.

Bagus:

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

Buruk:

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### Jangan Meminta Semuanya

Side Prompt yang meminta setiap detail biasanya akan menghasilkan setiap detail.

Pilih yang penting. Tracker plot biasanya membutuhkan hook yang belum selesai, apa yang berubah, siapa yang tahu, dan apa yang perlu ditindaklanjuti. Tracker plot tidak membutuhkan setiap ekspresi wajah dalam scene.

### Buat Penggunaan Macro Jelas

Nama yang baik:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

Nama yang kurang berguna:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

Pengguna tidak seharusnya perlu membuka seluruh isi prompt hanya untuk memahami kenapa prompt itu meminta sebuah nilai.

---

## Contoh

### Plot Points Tracker

Gunakan ini ketika chat memiliki beberapa storyline aktif.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Bentuk yang disarankan:

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### Relationship Tracker Dengan Macro

Prompt membutuhkan:

```txt
{{npc name}}
```

Run manual:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Baris set:

| Baris | Side Prompt | Macro Tersimpan |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

Ini menghindari kebutuhan membuat definisi prompt terpisah untuk setiap NPC.

### Tracker Penemuan atau Proyek

Gunakan ini ketika pengguna terus menemukan, meneliti, membangun, atau mengubah sesuatu seiring waktu.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

Ini biasanya lebih bersih daripada menyimpan sepuluh entri memory yang semuanya hanya mengatakan bahwa proyek itu ada.

### Reusable Cast Pass

Buat set menggunakan token runtime set-level:

```txt
{{npc_1}}
{{npc_2}}
```

Jalankan:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Gunakan ulang nanti:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Set yang sama. Cast berbeda. 💡

---

## Troubleshooting

### Side Prompt saya tidak berjalan setelah memory.

Periksa:

- Apakah memory benar-benar berjalan?
- Apakah Side Prompt diaktifkan untuk run after-memory?
- Apakah chat menggunakan **Use individually-enabled side prompts**?
- Apakah chat menggunakan Side Prompt Set sebagai gantinya?
- Apakah prompt membutuhkan nilai macro yang belum diberikan?
- Apakah prompt dihapus, diganti nama, atau dipindahkan?

Jika chat menggunakan Side Prompt Set, checkbox after-memory yang diaktifkan satu per satu diabaikan untuk chat itu.

### Side Prompt Set saya tidak berjalan.

Periksa:

- Apakah set dipilih untuk chat ini?
- Apakah set masih ada?
- Apakah semua baris menunjuk ke Side Prompt yang masih ada?
- Apakah semua macro yang dibutuhkan memiliki nilai tersimpan atau nilai yang diberikan?

Run otomatis tidak bisa meminta nilai yang hilang. Simpan nilai macro di set atau jalankan secara manual dengan `/sideprompt-macroset`.

### Satu baris dilewati.

Kemungkinan penyebab:

- Side Prompt yang dirujuk sudah dihapus
- Side Prompt yang dirujuk sudah diganti nama
- baris memiliki macro yang belum terselesaikan
- model mengembalikan respons kosong atau tidak valid

STMB seharusnya memberi peringatan, bukan pura-pura semuanya berhasil.

### Output terlalu panjang.

Tambahkan batas keras:

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

Model tidak secara alami tahu kapan sebuah tracker sudah menjadi terlalu besar untuk berguna. Beri tahu secara eksplisit.

### Side Prompt berjalan dua kali.

Periksa kemungkinan:

- run manual plus run otomatis
- baris duplikat di dalam set
- salinan Side Prompt yang sama berulang
- beberapa chat atau tab memicu pekerjaan dalam waktu berdekatan

Side Prompt Set yang dipilih seharusnya menggantikan prompt after-memory yang diaktifkan satu per satu, sehingga mencegah salah satu penyebab umum run duplikat.

### Pesan yang dianalisis salah.

Gunakan rentang eksplisit:

```txt
/sideprompt "Plot Points" 50-80
```

Perilaku since-last memang nyaman. Rentang eksplisit lebih baik untuk debugging.

### Tracker terus menyimpan informasi basi.

Beri instruksi pada Side Prompt untuk menghapus informasi basi.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Tracker tidak akan tetap bersih secara kebetulan.

---

## Inti Penting

### Untuk Pengguna

Gunakan Side Prompt ketika Anda ingin bantuan terstruktur untuk memelihara chat panjang.

Run manual paling cocok untuk analisis sekali pakai. Run after-memory atau Side Prompt Sets paling cocok untuk tracker yang harus tetap mutakhir.

### Untuk Botmakers

Bangun Side Prompt seperti alat pemeliharaan, bukan prosa roleplay.

Gunakan heading stabil, aturan output ketat, dan perilaku update yang jelas. Gunakan macro ketika satu prompt harus bekerja untuk beberapa NPC, faksi, lokasi, atau proyek.

### Untuk Admin

Side Prompt menambahkan lebih banyak pekerjaan generatif.

Artinya, Side Prompt harus predictable, inspectable, dan membosankan dalam arti terbaik. Sets membantu karena membuat workflow yang dimaksud eksplisit, bukan membiarkannya menjadi sup checkbox.
