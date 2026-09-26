# PRD — Portofolio Dinamis, Pengalaman Cinematic, dan CV ATS

**Status:** Draft siap implementasi  
**Tanggal:** 25 September 2026  
**Pemilik produk:** Pemilik portofolio  
**Bahasa awal:** Indonesia; konten Inggris dapat ditambahkan kemudian

## 1. Ringkasan

Bangun situs portofolio personal yang menampilkan karya melalui video, transisi, dan interaksi scroll yang terasa cinematic, tetapi tetap cepat, mudah dibaca, dan dapat dipakai tanpa animasi. Pemilik situs mengelola konten, urutan bagian, media, pengaturan visual, SEO, dan CV melalui dashboard admin. Modul CV menghasilkan dokumen sederhana yang teksnya dapat dibaca sistem pelacakan pelamar (*Applicant Tracking System*, ATS).

Situs publik dan admin menggunakan React + TanStack Start. API bisnis menggunakan NestJS. Data, autentikasi, dan penyimpanan media menggunakan Supabase. Aplikasi dan API dideploy dalam satu proyek Netlify: TanStack Start untuk halaman, NestJS melalui Netlify Function pada `/api/*`.

## 2. Tujuan dan ukuran keberhasilan

| Tujuan | Ukuran keberhasilan awal |
| --- | --- |
| Menunjukkan identitas dan kualitas karya | Pengunjung dapat memahami profil, keahlian, dan melihat proyek unggulan dalam 60 detik. |
| Konten dapat diubah tanpa mengedit kode | Admin dapat mengubah proyek, teks, media, urutan bagian, dan tautan lalu menerbitkannya dari dashboard. |
| Pengalaman cinematic tetap nyaman | Situs mendukung `prefers-reduced-motion`, navigasi keyboard, dan fallback gambar bila video gagal atau belum dimuat. |
| Mudah ditemukan dan dibagikan | Halaman publik memiliki judul, deskripsi, gambar berbagi, dan URL proyek yang dapat diindeks. |
| CV siap dilamar | Admin dapat mengisi data sekali, memilih bagian, melihat pratinjau, dan mengunduh PDF dengan teks yang dapat dipilih/disalin. |
| Siap deploy | Build, halaman publik, login admin, API, upload media, dan ekspor CV berfungsi di deploy preview serta produksi Netlify. |

Angka performa yang ditargetkan untuk rilis awal: LCP ≤ 2,5 detik, INP ≤ 200 ms, CLS ≤ 0,1 pada halaman publik utama untuk pengujian mobile yang representatif. Ukuran video dan kondisi jaringan harus diuji; target ini bukan jaminan pada setiap perangkat.

## 3. Pengguna dan alur utama

### Pengunjung

1. Membuka beranda dan melihat identitas singkat serta visual pembuka.
2. Menjelajahi proyek melalui scroll, filter sederhana, dan halaman detail.
3. Membaca profil, pengalaman, dan keahlian.
4. Menghubungi pemilik melalui tautan email/sosial atau formulir kontak.
5. Membuka atau mengunduh CV publik yang diterbitkan admin.

### Admin

1. Login melalui Supabase Auth.
2. Mengubah konten sebagai draft, melihat pratinjau, lalu menerbitkan.
3. Mengunggah atau memilih media dan mengatur poster, teks alternatif, serta urutan tampil.
4. Mengatur pilihan efek scroll dari preset yang aman untuk performa.
5. Mengisi data CV, meninjau hasil, mengunduh PDF, dan memilih versi yang dipublikasikan.

## 4. Ruang lingkup

### MVP / rilis pertama

- Halaman publik: beranda, daftar proyek, detail proyek, tentang, dan kontak.
- Beranda terdiri dari blok terkelola: hero, pengantar, proyek unggulan, keahlian/pengalaman ringkas, dan CTA kontak. Admin dapat mengaktifkan, menonaktifkan, dan mengurutkan blok yang tersedia.
- Visual cinematic: video hero opsional, poster fallback, reveal saat elemen masuk viewport, transisi antarbagian, dan efek parallax ringan pada desktop. Semua memakai preset; admin tidak memasukkan JavaScript/CSS bebas.
- Konten proyek: judul, slug, ringkasan, deskripsi, peran, tahun, kategori, teknologi, gambar/video, tautan demo/repo, status draft/published, unggulan, dan urutan.
- Dashboard admin: ringkasan status konten, CRUD proyek, pengaturan profil, beranda, media, SEO, kontak, tema dasar, dan CV.
- Media: unggah gambar, video, dan dokumen ke Supabase Storage; validasi jenis/ukuran, preview, poster video, alt text, dan peringatan bila aset sedang dipakai sebelum dihapus.
- Kontak: email dan tautan sosial yang bisa diatur admin; formulir kontak dengan validasi dan perlindungan spam dasar, disimpan sebagai pesan di dashboard. Notifikasi email bersifat tahap berikutnya.
- CV ATS: satu sumber data untuk identitas, ringkasan, pengalaman, pendidikan, proyek, keahlian, sertifikasi, dan tautan; urutan bagian; template satu kolom; pratinjau; ekspor PDF; publikasi CV terpilih.
- SEO: metadata per halaman/proyek, canonical URL, Open Graph, sitemap, robots.txt, dan status 404 untuk slug tidak ada.
- Autentikasi admin tunggal dan otorisasi server pada seluruh operasi tulis.

### Sesudah MVP

- Multi bahasa konten, beberapa admin dengan peran berbeda, blog, analitik dashboard, formulir dengan notifikasi email, beberapa tema, beberapa varian CV untuk lowongan berbeda, ekspor DOCX, dan integrasi video streaming khusus.

### Di luar ruang lingkup

- AI yang menulis CV atau memberi skor ATS otomatis.
- Editor halaman bebas seperti website builder umum.
- Garansi lolos ATS atau garansi mendapat pekerjaan.
- Pemrosesan video/transcoding di Netlify Function.

## 5. Kebutuhan fungsional dan kriteria terima

| ID | Fitur | Kriteria terima |
| --- | --- | --- |
| PUB-01 | Beranda dinamis | Perubahan teks, urutan blok, proyek unggulan, poster, dan video yang diterbitkan muncul di situs publik tanpa deploy ulang. Draft tidak terlihat publik. |
| PUB-02 | Proyek | Pengunjung dapat membuka daftar dan detail proyek melalui URL stabil; proyek tidak terbit mengembalikan 404 untuk publik. |
| PUB-03 | Cinematic scroll | Efek berjalan tanpa memblokir scroll atau input; video tidak otomatis memutar dengan suara; mode reduced motion menampilkan konten tanpa animasi esensial. |
| PUB-04 | Responsif | Konten dan navigasi berfungsi pada mobile, tablet, dan desktop; media tidak menutupi teks atau kontrol. |
| PUB-05 | Kontak | Formulir menampilkan status kirim/gagal, menyimpan pesan satu kali, dan membatasi spam; tautan email tetap tersedia. |
| ADM-01 | Login | Hanya akun admin yang diizinkan dapat masuk; rute dashboard dan endpoint tulis menolak pengguna lain. |
| ADM-02 | Konten | Admin dapat membuat, mengedit, menyimpan draft, melihat pratinjau, menerbitkan, menarik publikasi, dan menghapus proyek. |
| ADM-03 | Media | Admin dapat unggah dan memilih media, mengisi alt text, mengatur poster video, serta melihat pemakaian aset. Upload gagal memberi pesan jelas. |
| ADM-04 | Pengaturan | Admin dapat mengubah profil, tautan sosial, kontak, SEO dasar, warna/tema terbatas, dan preset efek; perubahan dapat dipratinjau sebelum diterbitkan. |
| ADM-05 | Keamanan konten | Teks dan URL yang disimpan divalidasi; admin tidak dapat menyisipkan script melalui field konten; penghapusan aset yang dipakai memerlukan penggantian atau pelepasan referensi. |
| CV-01 | Penyusunan CV | Admin dapat menambah, mengubah, mengurutkan, menyembunyikan, dan menghapus entri pengalaman, pendidikan, proyek, skill, serta sertifikasi. |
| CV-02 | Pratinjau & ekspor | PDF A4 satu kolom berisi teks yang dapat dipilih/disalin, urutan baca logis, judul bagian biasa, tautan aktif, dan tidak bergantung pada gambar untuk informasi penting. |
| CV-03 | Publikasi CV | Admin dapat menyimpan draft CV, mengunduhnya, lalu menerbitkan versi pilihan; tautan publik selalu menuju versi terbit terakhir. |
| CV-04 | Pemeriksaan dasar | Sebelum ekspor, sistem menandai field penting yang kosong, tautan rusak secara format, dan konten yang terpotong pada pratinjau halaman. Tidak memberi klaim skor ATS universal. |
| DEP-01 | Deploy | Deploy preview dan produksi memiliki konfigurasi environment terpisah; URL langsung ke halaman proyek dan dashboard berfungsi setelah refresh. |

## 6. Pengalaman visual dan interaksi

- **Arah visual:** editorial, gelap/terang sesuai identitas pemilik, tipografi kuat, ruang kosong yang cukup, gerak yang mendukung cerita proyek.
- **Hero:** judul, peran, CTA, poster, dan video pendek tanpa suara bila disediakan. Poster harus tampil sebelum video siap. Pada layar kecil atau koneksi hemat data, tampilkan poster saja bila perlu.
- **Scroll:** tiap bagian masuk secara bertahap; proyek unggulan dapat memakai pinning atau parallax ringan setelah diuji pada mobile. Konten tetap dapat dibaca jika efek gagal.
- **Navigasi:** menu jelas, indikator posisi halaman opsional, fokus keyboard terlihat, tautan lompat ke konten.
- **Kontrol media:** video yang berjalan otomatis harus muted, inline, dan bisa dihentikan. Animasi hanya dipakai bila tidak melanggar preferensi reduced motion.
- **Aksesibilitas:** kontras teks memadai, alt text gambar informatif, label formulir, heading berurutan, dan operasi inti tanpa pointer.

## 7. Dashboard admin

| Menu | Data yang dikelola |
| --- | --- |
| Ringkasan | Jumlah proyek draft/terbit, pesan baru, aset media, status CV publik. |
| Beranda | Teks hero, media hero, pilihan proyek unggulan, blok aktif, urutan, preset efek. |
| Proyek | Daftar, detail, kategori, media, tautan, status publikasi, urutan. |
| Profil | Bio, pengalaman ringkas, keahlian, foto, tautan sosial, kontak. |
| Media | Pustaka gambar/video/dokumen, metadata, pemakaian. |
| CV ATS | Data CV, urutan bagian, pratinjau, ekspor, publikasi. |
| Pesan | Daftar pesan kontak, detail, status sudah dibaca. |
| Pengaturan | Identitas situs, metadata SEO, domain/canonical, tema terbatas, pengaturan efek. |

Untuk MVP, satu akun admin cukup. Pembuatan akun admin dilakukan melalui konfigurasi proyek, bukan pendaftaran publik.

## 8. Arsitektur dan teknologi

| Lapisan | Pilihan | Tanggung jawab |
| --- | --- | --- |
| Frontend | React + TypeScript + TanStack Start, Router, Query | UI publik/admin, routing, SSR halaman publik, cache data klien, formulir dan pratinjau CV. |
| API | NestJS + TypeScript sebagai Netlify Function | Validasi input, pemeriksaan hak admin, operasi konten, pesan kontak, dan URL/media yang memerlukan aturan server. |
| Data | Supabase Postgres | Konten, pengaturan, pesan, data CV, status publikasi. |
| Auth | Supabase Auth | Sesi admin; API memverifikasi token dan status admin. |
| Berkas | Supabase Storage | Gambar, video terkompresi, poster, dokumen CV terbit. |
| Hosting | Netlify | Build/deploy frontend SSR dan Function API; deploy preview; environment produksi. |

**Alur:** browser/SSR meminta konten publik melalui `/api/*`; Netlify meneruskan permintaan ke Function NestJS; NestJS membaca/menulis Supabase. Operasi admin mengirim token pengguna, lalu NestJS memeriksa identitas dan hak admin di server. Kunci `service_role` Supabase, bila diperlukan, hanya ada di environment server. Browser hanya menerima kredensial publik yang memang dirancang untuk klien.

**Keputusan TanStack:** gunakan TanStack Start untuk SSR agar halaman proyek dinamis memiliki HTML dan metadata awal yang dapat diindeks. TanStack Query dipakai untuk data dashboard dan pembaruan setelah mutasi. Hindari membuat logika bisnis ganda di server function TanStack Start dan NestJS; NestJS adalah pemilik aturan API.

**Catatan kelayakan NestJS di Netlify:** NestJS harus dibungkus sebagai HTTP handler Function, diinisialisasi sekali per instance yang hangat, dan diuji pada deploy preview. Netlify menjalankan Function secara sementara, sehingga startup dingin, batas waktu eksekusi, dan ukuran payload perlu diperhatikan. Upload video dilakukan langsung ke Supabase Storage melalui mekanisme upload yang diotorisasi, bukan lewat body Function. Jika uji awal menunjukkan startup atau bundel NestJS tidak memenuhi target, keputusan hosting API perlu ditinjau sebelum membangun seluruh fitur; syarat bahwa frontend dideploy di Netlify tetap berlaku.

### Rancangan data awal

| Entitas | Isi utama |
| --- | --- |
| `site_settings` | Identitas situs, SEO default, tema, kontak, preset efek. |
| `page_sections` | Jenis blok, urutan, status aktif, isi terstruktur, status draft/terbit. |
| `projects` | Slug unik, detail, kategori, urutan, unggulan, status, metadata SEO. |
| `project_media` | Relasi proyek ke aset, urutan, jenis, alt text, poster. |
| `media_assets` | Path Storage, jenis, ukuran, dimensi/durasi, metadata, pemakaian. |
| `profile_entries` | Bio, pengalaman, skill, dan tautan profil untuk situs publik. |
| `contact_messages` | Nama, email, pesan, waktu, status baca. |
| `cv_profiles` / `cv_entries` | Data CV, bagian, urutan, status draft/terbit, versi. |
| `admin_users` | ID pengguna Auth yang berhak mengelola situs. |

Skema final boleh menggabungkan entitas yang sederhana, tetapi status draft/terbit dan referensi media harus tetap jelas. Semua tabel yang dapat diakses melalui API Supabase diberi grant dan Row Level Security sesuai perannya; pesan kontak dan draft CV tidak boleh terbaca publik.

## 9. CV ATS: aturan produk

- Template utama satu kolom, tanpa tabel tata letak, ikon sebagai pengganti teks, kotak teks, atau informasi penting dalam header/footer.
- Bagian memakai nama umum: Ringkasan, Pengalaman Kerja, Pendidikan, Keahlian, Proyek, Sertifikasi.
- Setiap pengalaman memuat jabatan, organisasi, lokasi opsional, rentang tanggal, dan butir pencapaian; admin menulis isinya sendiri.
- Ekspor awal memakai print stylesheet browser ke PDF atau generator PDF yang menghasilkan teks nyata. Pilihan teknis ditetapkan melalui uji: teks harus dapat disalin dalam urutan benar dan tidak terpotong di pergantian halaman.
- Informasi pribadi yang tampil di CV publik dipilih admin. Draft CV tidak tersedia bagi pengunjung.
- Label “ramah ATS” berarti mengikuti praktik format sederhana dan teks terbaca; tidak menjanjikan kompatibilitas dengan setiap vendor ATS.

## 10. Kebutuhan nonfungsional

- **Performa:** gunakan video pendek dan terkompresi, poster responsif, lazy load media di bawah layar pertama, dan hentikan animasi yang tidak terlihat. Lakukan pengukuran pada perangkat mobile nyata atau simulasi yang setara.
- **Keamanan:** validasi server, otorisasi per endpoint, pembatasan ukuran/jenis upload, rate limit formulir kontak, sanitasi konten yang dirender, dan rahasia hanya di server. RLS menjadi lapisan pengaman data.
- **Keandalan:** error state yang jelas untuk pengunjung/admin; operasi simpan tidak menggandakan data; media yang gagal tidak merusak layout.
- **SEO:** SSR halaman publik, metadata unik, sitemap hanya untuk konten published, canonical URL, dan deskripsi gambar berbagi.
- **Privasi:** kumpulkan hanya data formulir yang diperlukan; tampilkan pemberitahuan penggunaan data kontak; sediakan cara menghapus pesan di admin.
- **Pemeliharaan:** konfigurasi melalui environment; migrasi skema database terdokumentasi; logging error API tanpa menyimpan token atau isi sensitif di log.

## 11. Deployment Netlify

1. Hubungkan repositori ke Netlify; gunakan build TanStack Start dengan plugin Netlify yang sesuai versi paket saat implementasi. Konfigurasi dasar saat ini: build `vite build`, publish `dist/client`.
2. Tempatkan wrapper NestJS sebagai Netlify Function di luar folder publish dan route `/api/*` menuju Function tersebut.
3. Simpan URL/kunci Supabase dan konfigurasi domain di environment Netlify. Pisahkan proyek atau setidaknya data Supabase untuk preview dan produksi.
4. Terapkan migrasi Supabase sebelum frontend versi baru memakai skema baru. Uji login, SSR, API, upload, dan PDF pada deploy preview.
5. Pasang domain dan HTTPS; perbarui URL redirect Auth, canonical, dan sitemap untuk domain produksi.

Konfigurasi build Netlify dan dukungan TanStack Start mengikuti dokumentasi resmi saat implementasi karena plugin dan detail build dapat berubah. Jangan menganggap proses NestJS sebagai server yang berjalan terus menerus.

## 12. Tahap pengerjaan dan gerbang keputusan

| Tahap | Hasil yang harus ada |
| --- | --- |
| 0. Uji kelayakan | Deploy preview sederhana: TanStack Start SSR → `/api/health` NestJS Function → Supabase. Ukur cold start, ukuran bundel, dan refresh URL langsung. Putuskan kelayakan satu proyek Netlify sebelum pengembangan penuh. |
| 1. Fondasi | Skema dan RLS Supabase, Auth admin, layout publik/admin, konfigurasi environment, CI build. |
| 2. Konten | CRUD proyek/profil/beranda, media, draft/published, halaman publik dan SEO. |
| 3. Pengalaman | Video, preset scroll, responsif, reduced motion, optimasi media/performa. |
| 4. CV dan kontak | Builder CV, PDF, publikasi CV, formulir dan inbox pesan. |
| 5. Rilis | Uji aksesibilitas, mobile, performa, keamanan dasar, deploy preview, lalu produksi. |

## 13. Definisi selesai untuk rilis MVP

- Semua kriteria terima MVP pada bagian 5 lulus di deploy preview dan produksi.
- Admin dapat menerbitkan perubahan konten tanpa commit atau redeploy.
- Pengunjung dapat memakai situs sepenuhnya dengan reduced motion dan ketika video gagal dimuat.
- URL proyek menghasilkan HTML dan metadata yang sesuai; draft tidak dapat diakses publik.
- PDF CV yang diekspor berisi teks yang dapat dipilih/disalin dan tidak memotong isi penting pada contoh CV panjang.
- Tidak ada kunci rahasia di bundle browser; endpoint tulis menolak pengguna non-admin; kebijakan data Supabase teruji.

## 14. Keputusan yang perlu dikonfirmasi sebelum desain akhir

1. Nama/identitas visual, target audiens utama (rekruter, calon klien, atau keduanya), dan contoh portofolio yang disukai.
2. Sumber video: aset milik sendiri atau perlu dibuat; durasi, format, dan izin penggunaannya.
3. Bahasa rilis pertama: Indonesia saja atau Indonesia + Inggris.
4. CV publik: semua orang boleh mengunduh atau hanya admin yang mengunduh.
5. Detail kontak: formulir + inbox, atau cukup email/sosial.

## Referensi teknis

- [Netlify: TanStack Start](https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/) — dukungan SSR dan konfigurasi build.
- [Netlify: Functions](https://docs.netlify.com/build/functions/overview/) dan [konfigurasi/batas Function](https://docs.netlify.com/build/functions/configuration/) — model eksekusi dan routing API.
- [NestJS: Serverless FAQ](https://docs.nestjs.com/faq/serverless) — pertimbangan cold start NestJS.
- [Supabase: Auth](https://supabase.com/docs/guides/auth), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), dan [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) — autentikasi dan kontrol akses data/media.
