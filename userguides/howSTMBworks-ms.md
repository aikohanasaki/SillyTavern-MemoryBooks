# Cara SillyTavern Memory Books (STMB) Berfungsi

Ini ialah penjelasan peringkat tinggi tentang cara STMB berfungsi. Ia bukan untuk menerangkan kod. Sebaliknya, dokumen ini menerangkan maklumat apa yang STMB himpunkan, dalam susunan apa ia dihantar, dan apakah yang dijangka akan dipulangkan oleh model.

Gunakan dokumen ini untuk membantu anda menulis atau mengedit prompt bagi STMB.

## 3 Aliran Prompt Utama STMB

STMB mempunyai tiga aliran kerja utama:

1. Penjanaan memori
2. Prom Sampingan
3. Konsolidasi

Ketiga-tiganya berkait, tetapi tidak menjangkakan jenis output yang sama.

- Penjanaan memori menjangkakan JSON yang ketat.
- Prom Sampingan biasanya menjangkakan teks biasa yang bersih (boleh menggunakan Markdown atau format entri lorebook lain, JANGAN GUNAKAN JSON dalam Prom Sampingan).
- Konsolidasi menjangkakan JSON yang ketat, tetapi dalam skema yang berbeza daripada memori.

## I. Penjanaan Memori

Apabila anda mencipta memori, STMB menghantar satu prompt yang telah dihimpunkan dan biasanya mengandungi bahagian-bahagian ini dalam susunan berikut:

1. Teks prompt memori atau pratetap yang dipilih
   - Ini ialah blok arahan daripada Pengurus Prom Ringkasan.
   - Ia memberitahu model jenis ringkasan yang perlu ditulis dan bentuk JSON yang perlu dipulangkan.
   - Makro seperti `{{user}}` dan `{{char}}` akan diselesaikan sebelum penghantaran.

2. Konteks memori terdahulu yang bersifat pilihan
   - Jika sesuatu larian dikonfigurasikan untuk memasukkan memori terdahulu, memori itu disisipkan sebagai konteks baca sahaja.
   - Ia ditandakan dengan jelas sebagai konteks dan bukan bahan yang perlu diringkaskan sekali lagi.

3. Transkrip babak semasa
   - Julat sembang yang dipilih diformatkan baris demi baris sebagai `Speaker: message`.
   - Inilah babak sebenar yang sepatutnya ditukarkan oleh model menjadi memori.

Bentuk kasarnya:

```text
[arahan prompt / pratetap memori]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[sifar atau lebih memori terdahulu]
=== END PREVIOUS SCENE CONTEXT - PROCESS ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### Perkara yang patut dipulangkan oleh model

Kami menjangkakan satu objek JSON:

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Amalan terbaik:

- Pulangkan objek JSON sahaja.
- Gunakan kekunci yang tepat, iaitu `title`, `content`, dan `keywords`.
- Pastikan `keywords` ialah tatasusunan JSON sebenar yang mengandungi rentetan.
- Pastikan tajuk ringkas dan mudah dibaca.
- Pastikan kata kunci konkrit dan mesra pengambilan: tempat, objek, nama khas, tindakan yang tersendiri, dan pengenal.

STMB kadangkala boleh menyelamatkan output yang sedikit bersepah, tetapi prompt tidak sepatutnya bergantung pada hal itu.

### Ciri-ciri prompt memori yang baik

Prompt memori yang baik menerangkan empat perkara dengan jelas:

1. Beritahu model jenis memori yang perlu ditulis
   - Log babak yang terperinci
   - Sinopsis yang padat
   - Imbas kembali yang minimum
   - Memori naratif yang lebih bersifat sastera

2. Beritahu model perkara yang penting
   - rentak cerita
   - keputusan
   - perubahan watak
   - pendedahan
   - hasil
   - butiran yang penting untuk kesinambungan

3. Beritahu model perkara yang perlu diabaikan
   - biasanya OOC
   - bahan pengisi
   - sembang hiasan semata-mata, jika anda mahukan memori yang lebih ketat

4. Beritahu model dengan tepat JSON apa yang perlu dipulangkan

### Ciri-ciri prompt memori yang lemah

Prompt yang lemah biasanya gagal dalam salah satu cara berikut:

- Ia menerangkan gaya penulisan, tetapi tidak bentuk JSON.
- Ia meminta "analisis yang membantu" atau "pemikiran" dan bukannya objek memori yang siap.
- Ia menggalakkan kata kunci yang abstrak dan bukannya istilah konkrit untuk pengambilan.
- Ia tidak membezakan konteks terdahulu dengan babak semasa.
- Ia meminta terlalu banyak format output sekali gus.

### Nasihat praktikal untuk menulis prompt memori

- Nyatakan dengan jelas sama ada ringkasan itu perlu menyeluruh atau cekap token.
- Jika anda mahu Markdown di dalam `content`, nyatakan dengan terang.
- Jika anda mahukan memori yang pendek, hadkan badan teks, bukan skema JSON.
- Jika anda mahu pengambilan yang kuat, gunakan ruang prompt untuk kualiti kata kunci, bukan hanya gaya ringkasan.
- Anggap memori terdahulu sebagai konteks kesinambungan, bukan bahan untuk ditulis semula.

## II. Prom Sampingan

Prom Sampingan BUKAN memori. Ia ialah prompt penjejak atau kemas kini yang biasanya menulis atau menulis ganti entri lorebook yang berasingan. Ini konsep yang sangat berbeza daripada memori dan sangat penting untuk sentiasa diingat.

Apabila satu Prom Sampingan berjalan, STMB biasanya menghimpunkan bahagian-bahagian ini dalam susunan berikut:

1. Teks arahan utama Prom Sampingan
   - Inilah prompt tugas sebenar untuk penjejak tersebut.
   - Makro ST standard seperti `{{user}}` dan `{{char}}` akan diselesaikan.
   - Makro runtime tersuai juga boleh dimasukkan untuk larian manual.

2. Entri terdahulu yang bersifat pilihan
   - Jika Prom Sampingan itu sudah mempunyai kandungan yang disimpan, STMB boleh memasukkan versi semasa terlebih dahulu.
   - Ini membolehkan model mengemas kini penjejak sedia ada dan bukannya menulis semula dari awal setiap kali.

3. Konteks memori terdahulu yang bersifat pilihan
   - Jika templat meminta memori terdahulu, STMB menyisipkannya sebagai konteks baca sahaja.

4. Teks babak yang telah dikompilasi
   - Inilah bahan babak semasa yang perlu diberi reaksi oleh penjejak.

5. Panduan format respons yang bersifat pilihan
   - Ini tidak dikuatkuasakan sebagai skema parser.
   - Ia hanyalah arahan tambahan tentang format output yang anda mahukan.

Bentuk kasarnya:

```text
[arahan Prom Sampingan]

=== PRIOR ENTRY ===
[teks penjejak sedia ada, jika ada]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[memori terdahulu pilihan]
=== END PREVIOUS SCENE CONTEXT ===

=== SCENE TEXT ===
[teks babak yang telah dikompilasi]

=== RESPONSE FORMAT ===
[panduan format pilihan]
```

### Perkara yang patut dipulangkan oleh model

STMB menjangkakan teks biasa yang sedia untuk disimpan.

Inilah perbezaan utama berbanding memori:

- Prom Sampingan tidak mahukan JSON.
- STMB biasanya menyimpan teks yang dipulangkan itu sebagaimana adanya.
- Jika anda meminta JSON di dalam Prom Sampingan, JSON itu hanyalah teks kecuali aliran kerja anda sendiri memerlukannya.

Ini bermaksud prompt Prom Sampingan perlu mensasarkan output akhir yang terus boleh digunakan, bukannya JSON memori yang mesra parser.

### Ciri-ciri prompt Prom Sampingan yang baik

Prompt Prom Sampingan yang baik adalah sempit fokusnya, stabil, dan mudah dikemas kini.

Contoh:

- Kekalkan senarai pelakon mengikut tertib kepentingan.
- Jejak status hubungan semasa.
- Jejak bebenang plot yang belum selesai.
- Jejak perkara yang `{{char}}` percaya pada masa ini tentang `{{user}}`.

Perumusan Prom Sampingan yang baik biasanya melakukan perkara-perkara ini:

1. Mentakrifkan kerja dengan jelas
   - "Kekalkan penjejak pelakon"
   - "Kemas kini helaian hubungan semasa"
   - "Kekalkan laporan bebenang yang belum selesai"

2. Menyatakan sama ada perlu mengemas kini, menggantikan, atau menambah
   - Ini penting kerana teks entri terdahulu mungkin disertakan.

3. Mentakrifkan susun atur output
   - tajuk
   - struktur poin
   - seksyen
   - peraturan susunan

4. Menyatakan perkara yang tidak patut dimasukkan
   - spekulasi
   - item berulang
   - maklumat lapuk
   - penceritaan tentang tugas itu sendiri

### Ciri-ciri prompt Prom Sampingan yang lemah

- Ia terlalu luas: "jejak semuanya".
- Ia tidak pernah menyatakan sama ada entri lama perlu disemak semula atau ditulis semula.
- Ia meminta chain-of-thought atau penjelasan dan bukannya teks penjejak akhir.
- Ia membiarkan format terlalu kabur sehingga penjejak itu semakin hanyut dari semasa ke semasa.

### Nasihat praktikal untuk menulis Prom Sampingan

- Tulis Prom Sampingan seperti arahan penyelenggaraan, bukan seperti prompt ringkasan.
- Andaikan model mungkin melihat penjejak semasa terlebih dahulu, kemudian babak baharu.
- Pastikan setiap penjejak tertumpu pada satu tugas sahaja.
- Gunakan medan Format Respons untuk mengawal susun atur, nama seksyen, dan aturan.

## III. Konsolidasi

Konsolidasi menggabungkan entri aras rendah menjadi ringkasan aras lebih tinggi.

Contoh:

- memori menjadi ringkasan Arc
- ringkasan Arc menjadi ringkasan bab
- ringkasan bab menjadi ringkasan buku

Apabila Konsolidasi berjalan, STMB biasanya menghimpunkan bahagian-bahagian ini dalam susunan berikut:

1. Teks prompt konsolidasi atau pratetap yang dipilih
   - Ini menerangkan cara model perlu memampatkan entri sumber.
   - Ia juga mentakrifkan skema JSON yang perlu dipulangkan oleh model.

2. Ringkasan aras lebih tinggi terdahulu yang bersifat pilihan
   - Jika ringkasan terdahulu pada tier itu dibawa ke hadapan, ia akan disertakan dahulu sebagai konteks kanon.
   - Prompt itu memberitahu model supaya tidak menulis semulanya.

3. Entri aras lebih rendah yang dipilih dalam tertib kronologi
   - Setiap item sumber disertakan bersama pengecam, tajuk, dan kandungannya.
   - Inilah bahan yang sepatutnya dikelompokkan, dimampatkan, dan ditukar oleh model menjadi ringkasan aras lebih tinggi.

Bentuk kasarnya:

```text
[arahan prompt / pratetap konsolidasi]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[ringkasan aras lebih tinggi terdahulu, jika ada]
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

### Perkara yang patut dipulangkan oleh model

STMB menjangkakan objek JSON yang berbentuk seperti ini:

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

Idea penting:

- Konsolidasi boleh memulangkan satu ringkasan atau beberapa ringkasan.
- `member_ids` memberitahu STMB entri sumber mana yang tergolong dalam setiap ringkasan yang dipulangkan.
- `unassigned_items` ialah cara model menyatakan "entri ini tidak sesuai dengan ringkasan yang baru saya cipta".

### Ciri-ciri prompt konsolidasi yang baik

Prompt konsolidasi yang baik melakukan tiga perkara dengan baik:

1. Mentakrifkan sasaran pemampatan
   - satu Arc
   - satu atau beberapa Arc
   - imbas kembali yang padat tetapi lengkap
   - imbas kembali yang dimampatkan secara agresif

2. Mentakrifkan logik pemilihan
   - mengekalkan kronologi
   - mengekalkan kesinambungan
   - menggabungkan item yang berkaitan
   - meninggalkan item yang tidak berkaitan sebagai tidak ditugaskan

3. Mentakrifkan struktur JSON dengan sangat jelas

Prompt konsolidasi yang terbaik juga memberitahu model perkara yang perlu dipelihara:

- rentak utama
- titik perubahan
- janji
- akibat
- bebenang yang belum selesai
- perubahan hubungan
- petikan atau pengenal yang kritikal untuk kesinambungan

### Ciri-ciri prompt konsolidasi yang lemah

- Ia meminta imbas kembali, tetapi tidak pernah menerangkan cara mengelompokkan entri sumber.
- Ia tidak memberitahu model apa yang perlu dilakukan terhadap item yang terpencil.
- Ia tidak mewajibkan `member_ids`.
- Ia meminta prosa bebas dan bukannya objek JSON konsolidasi.
- Ia terlalu menumpukan gaya dan terlalu kurang mentakrifkan pemilihan serta pengelompokan.

### Nasihat praktikal untuk menulis prompt konsolidasi

- Beritahu model sama ada anda mahukan satu imbas kembali yang koheren atau bilangan imbas kembali yang paling kecil tetapi masih koheren.
- Wajibkan kronologi.
- Wajibkan pengendalian baki dengan jelas.
- Pastikan kata kunci di sini juga konkrit; ringkasan aras lebih tinggi masih perlu mempunyai nilai untuk pengambilan.

## Peraturan Sebenar untuk Menulis Prompt

Apabila menulis untuk STMB, jangan hanya berfikir, "Apakah yang saya mahu AI katakan?"

Fikirkan:

1. Apakah konteks yang akan diletakkan oleh STMB sebelum babak?
2. Apakah unit sebenar bahan yang sedang dianalisis?
3. Adakah aliran ini menjangkakan JSON yang ketat atau teks biasa akhir?
4. Apakah maklumat yang perlu kekal untuk pengambilan kemudian?
5. Apakah yang model perlu abaikan, mampatkan, pelihara, atau bawa ke hadapan?

Jika prompt anda menjawab lima soalan ini dengan jelas, ia biasanya akan berfungsi dengan baik bersama STMB.

## Nota Gaya FAQ

- "Bolehkah saya melihat apa yang sebenarnya dihantar kepada AI?"
  Ya. Semak output terminal atau log anda jika anda mahu memeriksa prompt yang telah dihimpunkan.

- "Adakah STMB memaksa output yang baik walaupun prompt saya lemah?"
  Tidak juga. STMB kadangkala boleh menyelamatkan JSON yang cacat, tetapi ia tidak boleh membaiki prompt yang kabur dan meminta perkara yang salah.

- "Apakah yang patut saya optimumkan dahulu apabila menulis semula prompt?"
  Optimumkan dahulu format output. Kemudian optimumkan butiran apa yang perlu dikekalkan. Gaya datang selepas itu.
