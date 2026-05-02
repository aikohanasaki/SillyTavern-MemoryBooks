# 🎡 Side Prompts

Side Prompt ialah larian prompt STMB tambahan untuk penyelenggaraan chat. Ia boleh menganalisis, menjejak, meringkaskan, membersihkan, atau mengemas kini nota sokongan tanpa memaksa balasan karakter biasa melakukan semua kerja itu.

Gunakannya apabila chat memerlukan tracker berterusan, laporan hubungan, senarai plot, log ciptaan, helaian status NPC, garis masa, atau dokumen sokongan yang seumpamanya. Karakter boleh terus roleplay. Side Prompt mengurus kerja kertas. ❤️

## Kandungan

- [Apa Itu Side Prompt](#apa-itu-side-prompt)
- [Bila Patut Digunakan](#bila-patut-digunakan)
- [Panduan Persediaan Ringkas](#panduan-persediaan-ringkas)
- [Cara Larian Berfungsi](#cara-larian-berfungsi)
- [Larian Manual](#larian-manual)
- [Larian Automatik Selepas Memory](#larian-automatik-selepas-memory)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [Julat Mesej](#julat-mesej)
- [Menulis Side Prompt Yang Baik](#menulis-side-prompt-yang-baik)
- [Contoh](#contoh)
- [Penyelesaian Masalah](#penyelesaian-masalah)
- [Ringkasan Utama](#ringkasan-utama)

---

## Apa Itu Side Prompt

Side Prompt ialah prompt bernama yang berjalan secara berasingan daripada balasan karakter biasa.

Ia boleh menghasilkan atau mengemas kini:

- tracker plot
- tracker hubungan
- nota NPC atau puak
- senarai inventori/sumber
- garis masa
- papan misteri/petunjuk
- tracker ciptaan atau projek
- laporan kesinambungan
- nota pembersihan
- entri sokongan bergaya lorebook

Side Prompt berbeza daripada memory biasa. Memory biasanya menyimpan ringkasan babak secara berurutan. Side Prompt biasanya menyelenggara dokumen keadaan berterusan yang dikemas kini atau ditulis ganti.

Side Prompt juga **tidak** perlu mengembalikan JSON. Teks biasa dan Markdown boleh digunakan melainkan prompt atau sasaran simpanan tertentu anda memerlukan format yang lebih ketat.

---

## Bila Patut Digunakan

Gunakan Side Prompt untuk kerja sokongan berstruktur.

Kegunaan yang baik:

- **Titik plot:** benang aktif, benang selesai, perkara tertinggal
- **Hubungan:** kepercayaan, ketegangan, tarikan, batasan, matlamat
- **NPC:** perkara yang setiap NPC tahu, mahu, lakukan baru-baru ini, atau perlukan seterusnya
- **Garis masa:** tarikh, perjalanan, kecederaan, tarikh akhir, kira detik
- **Keadaan dunia:** lokasi, objek, puak, atau sumber yang berubah
- **Misteri:** petunjuk, suspek, percanggahan, soalan belum terjawab
- **Projek:** ciptaan, penyelidikan, halangan, scope drift, langkah seterusnya
- **Kesinambungan:** risiko halusinasi yang mungkin berlaku atau konteks yang hilang

Kegunaan yang tidak baik:

- apa-apa yang mesti muncul dalam balasan karakter seterusnya
- prompt “jadikan cerita lebih baik” yang kabur
- prompt analisis gergasi yang menghasilkan esei setiap kali dijalankan
- ringkasan memory pendua tanpa kerja berasingan

Side Prompt bukan sihir. Side Prompt yang kabur cuma kekaburan yang disusun.

---

## Panduan Persediaan Ringkas

Perlukan versi klik demi klik? Gunakan [panduan Scribe untuk menghidupkan Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Laluan ringkasnya ialah: buka **Extensions**, buka **Memory Books**, klik **Side Prompts**, pilih prompt yang anda mahu, hidupkannya, hidupkan **Run automatically after memory** jika mahu, kemudian **Save** dan **Close**.

---

## Cara Larian Berfungsi

Larian Side Prompt biasa mengikut laluan asas yang sama:

1. STMB memilih mesej untuk disemak.
2. Side Prompt disediakan.
3. Sebarang macro yang diperlukan diisi.
4. Model menjana output Side Prompt.
5. STMB menyemak output.
6. Hasilnya dipratonton, disimpan, dikemas kini, atau dilangkau mengikut tetapan Side Prompt.

Side Prompt manual, Side Prompt selepas-memory, dan baris Side Prompt Set sepatutnya terasa seperti sistem yang sama. Semuanya berkongsi tingkah laku pelaksanaan umum yang sama untuk pratonton, batching, semakan respons kosong, simpanan, pengendalian henti, dan pemberitahuan.

---

## Larian Manual

Gunakan `/sideprompt` untuk menjalankan satu Side Prompt secara manual.

Bentuk asas:

```txt
/sideprompt "Prompt Name"
```

Dengan julat mesej:

```txt
/sideprompt "Prompt Name" 10-20
```

Dengan macro runtime:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Gunakan tanda petik untuk nama prompt yang mempunyai ruang.

Larian manual paling sesuai untuk semakan sekali sahaja, kemas kini bersasar, dan prompt yang memerlukan nilai macro tersuai.

---

## Larian Automatik Selepas Memory

Sesetengah Side Prompt boleh berjalan secara automatik selepas memory dibuat.

Ini berguna apabila tracker patut kekal terkini semasa chat berkembang. Contohnya, tracker hubungan atau tracker plot boleh dikemas kini selepas setiap memory.

Terdapat dua mod selepas-memory:

- **Use individually-enabled side prompts** — tingkah laku lama; mana-mana Side Prompt dengan **Run automatically after memory** yang dihidupkan boleh berjalan.
- **Use a named Side Prompt Set** — set yang dipilih berjalan sebagai ganti.

Side Prompt Set yang dipilih menggantikan Side Prompt selepas-memory yang dihidupkan secara individu. Ia **tidak** ditambah kepada Side Prompt tersebut. Ini mengelakkan larian pendua disebabkan kotak semak lama yang pengguna terlupa.

---

## Side Prompt Sets

Side Prompt Sets mengumpulkan beberapa Side Prompt ke dalam satu aliran kerja tersusun.

Set ialah senarai larian bertertib, bukan sekadar folder. Side Prompt yang sama boleh muncul lebih daripada sekali dengan nilai macro yang berbeza.

Contoh set:

1. Relationship Tracker dengan `{{npc name}} = Alice`
2. Relationship Tracker dengan `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

Ini membolehkan satu template prompt menyelenggara entri berasingan untuk NPC, puak, lokasi, atau projek yang berbeza.

### Mengurus Set

Buka **🎡 Trackers & Side Prompts** untuk mencipta, mengedit, menduplikasi, memadam, atau menyusun semula set.

Setiap baris boleh menyertakan:

- Side Prompt
- label baris pilihan
- nilai macro yang disimpan
- kawalan duplikasi/padam
- kawalan naik/turun

Baris berjalan dari atas ke bawah. Letakkan tracker asas dahulu dan prompt pembersihan/pelaporan kemudian.

### Menjalankan Set Secara Manual

Jalankan set dengan nilai tersimpan:

```txt
/sideprompt-set "Set Name"
```

Dengan julat:

```txt
/sideprompt-set "Set Name" 10-20
```

Jalankan set boleh guna semula dengan nilai macro:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Gunakan `/sideprompt-macroset` apabila set mempunyai token boleh guna semula yang masih memerlukan nilai.

### Set atau Baris Hilang

Side Prompt Sets bersifat ketat dengan sengaja:

- Jika tiada set dipilih, tingkah laku selepas-memory yang dihidupkan secara individu digunakan.
- Jika set dipilih, prompt selepas-memory yang dihidupkan secara individu diabaikan.
- Jika set yang dipilih telah dipadam, tiada apa-apa berjalan dan STMB memberi amaran.
- Jika baris menunjuk kepada prompt yang telah dipadam, baris itu dilangkau dan STMB memberi amaran.
- Jika baris masih memerlukan nilai macro, baris itu dilangkau dan STMB memberi amaran.

Fallback senyap lebih buruk. Jika aliran kerja yang dipilih rosak, anda patut tahu.

---

## Macros

Side Prompt boleh menggunakan macro SillyTavern biasa seperti `{{user}}` dan `{{char}}`.

Side Prompt juga boleh menggunakan macro runtime, iaitu placeholder yang diisi apabila Side Prompt berjalan.

Contoh macro runtime:

```txt
{{npc name}}
```

Larian manual:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Nilai set tersimpan:

```txt
{{npc name}} = Alice
```

Nilai set-level boleh guna semula:

```txt
{{npc name}} = {{npc_1}}
```

Kemudian jalankan:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Petua Macro

Gunakan nama yang membosankan:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Elakkan nama seperti:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Ruang mudah dibaca dalam UI. Garis bawah biasanya kurang menyusahkan dalam slash command.

Side Prompt dengan macro runtime tersuai tidak patut diautomasikan secara individu melainkan nilai yang diperlukan disimpan di sesuatu tempat, seperti dalam baris Side Prompt Set. Larian automatik tidak boleh berhenti dan bertanya siapa yang dimaksudkan oleh `{{npc name}}`.

---

## Julat Mesej

Side Prompt boleh berjalan terhadap julat mesej tertentu.

```txt
/sideprompt "Plot Points" 50-80
```

Jika anda memberikan julat, STMB menggunakan julat itu.

Jika anda tidak memberikan julat, STMB menggunakan tingkah laku biasa sejak Side Prompt terakhir dengan logik cap/checkpoint sedia ada.

Untuk penjejakan rutin, tingkah laku sejak-kali-terakhir lebih mudah. Untuk debugging atau pembersihan bersasar, julat eksplisit lebih jelas.

Penyusunan julat Side Prompt patut mengikut keutamaan mesej tersembunyi yang sama seperti memory, termasuk tetapan global unhide-before-memory.

---

## Menulis Side Prompt Yang Baik

Side Prompt yang baik mempunyai tugas. Side Prompt yang buruk hanya mempunyai vibes.

Jelaskan:

- perkara yang patut disemak
- perkara yang patut dikemas kini
- perkara yang patut diabaikan
- format output yang diperlukan
- panjang output yang dikehendaki
- sama ada ia patut mengganti, menyemak semula, atau menambah

### Sengajakan Output Pendek

Tracker akan membesar melainkan diberitahu supaya tidak.

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

### Gunakan Heading Yang Stabil

Heading stabil menjadikan kemas kini berulang lebih bersih.

Baik:

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

### Jangan Minta Semuanya

Side Prompt yang meminta setiap butiran biasanya akan menghasilkan setiap butiran.

Pilih perkara yang penting. Tracker plot biasanya memerlukan hook yang belum selesai, perkara yang berubah, siapa yang tahu, dan perkara yang perlu disusuli. Ia tidak memerlukan setiap ekspresi muka dalam babak.

### Jadikan Penggunaan Macro Jelas

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

Pengguna tidak sepatutnya perlu membuka seluruh badan prompt untuk memahami sebab prompt itu meminta sesuatu nilai.

---

## Contoh

### Plot Points Tracker

Gunakan ini apabila chat mempunyai beberapa jalan cerita aktif.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Bentuk cadangan:

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

Prompt memerlukan:

```txt
{{npc name}}
```

Larian manual:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Baris set:

| Baris | Side Prompt | Macro Tersimpan |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

Ini mengelakkan anda daripada membuat definisi prompt berasingan untuk setiap NPC.

### Tracker Ciptaan atau Projek

Gunakan ini apabila pengguna terus mencipta, menyelidik, membina, atau mengubah sesuatu dari semasa ke semasa.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

Ini biasanya lebih bersih daripada menyimpan sepuluh entri memory yang semuanya mengatakan projek itu wujud.

### Cast Pass Boleh Guna Semula

Cipta set menggunakan token runtime set-level:

```txt
{{npc_1}}
{{npc_2}}
```

Jalankannya:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Guna semula kemudian:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Set yang sama. Cast yang berbeza. 💡

---

## Penyelesaian Masalah

### Side Prompt saya tidak berjalan selepas memory.

Semak:

- Adakah memory benar-benar berjalan?
- Adakah Side Prompt dihidupkan untuk larian selepas-memory?
- Adakah chat menggunakan **Use individually-enabled side prompts**?
- Adakah chat menggunakan Side Prompt Set sebaliknya?
- Adakah prompt memerlukan nilai macro yang tidak diberikan?
- Adakah prompt dipadam, dinamakan semula, atau dipindahkan?

Jika chat menggunakan Side Prompt Set, kotak semak selepas-memory yang dihidupkan secara individu diabaikan untuk chat itu.

### Side Prompt Set saya tidak berjalan.

Semak:

- Adakah set dipilih untuk chat ini?
- Adakah set itu masih wujud?
- Adakah semua baris menunjuk kepada Side Prompt yang wujud?
- Adakah semua macro yang diperlukan mempunyai nilai tersimpan atau nilai yang diberikan?

Larian automatik tidak boleh meminta nilai yang hilang. Simpan nilai macro dalam set atau jalankannya secara manual dengan `/sideprompt-macroset`.

### Satu baris dilangkau.

Punca yang mungkin:

- Side Prompt rujukan telah dipadam
- Side Prompt rujukan telah dinamakan semula
- baris mempunyai macro yang belum diselesaikan
- model mengembalikan respons kosong atau tidak sah

STMB patut memberi amaran dan bukannya berpura-pura semuanya berjaya.

### Output terlalu panjang.

Tambah had keras:

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

Model tidak tahu secara semula jadi bila tracker sudah menjadi terlalu besar sehingga tidak berguna. Beritahu model.

### Ia berjalan dua kali.

Semak kemungkinan:

- larian manual bersama larian automatik
- baris pendua dalam set
- salinan berulang Side Prompt yang sama
- beberapa chat atau tab mencetuskan kerja hampir serentak

Side Prompt Set yang dipilih patut menggantikan prompt selepas-memory yang dihidupkan secara individu, yang mengelakkan satu punca larian pendua yang biasa.

### Mesej yang salah dianalisis.

Gunakan julat eksplisit:

```txt
/sideprompt "Plot Points" 50-80
```

Tingkah laku sejak-kali-terakhir memang mudah. Julat eksplisit lebih baik untuk debugging.

### Tracker terus menyimpan maklumat lapuk.

Beritahu Side Prompt supaya membuang maklumat lapuk.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Tracker tidak kekal bersih secara kebetulan.

---

## Ringkasan Utama

### Untuk Pengguna

Gunakan Side Prompt apabila anda mahu bantuan berstruktur untuk menyelenggara chat panjang.

Larian manual paling sesuai untuk analisis sekali sahaja. Larian selepas-memory atau Side Prompt Sets paling sesuai untuk tracker yang patut kekal terkini.

### Untuk Botmakers

Bina Side Prompt seperti alat penyelenggaraan, bukan prosa roleplay.

Gunakan heading stabil, peraturan output yang ketat, dan tingkah laku kemas kini yang jelas. Gunakan macro apabila satu prompt patut berfungsi untuk beberapa NPC, puak, lokasi, atau projek.

### Untuk Admins

Side Prompt menambah lebih banyak kerja penjanaan.

Ini bermaksud Side Prompt patut boleh dijangka, boleh diperiksa, dan membosankan dengan cara yang terbaik. Sets membantu kerana ia menjadikan aliran kerja yang dimaksudkan jelas dan bukannya bergantung pada sup kotak semak.
