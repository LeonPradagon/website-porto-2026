# Rencana portofolio Jhansen Wilson

Sumber: [PRD.md](./PRD.md) dan [portofolio lama](https://portofolio-jet-six.vercel.app/). Diperbarui 25 September 2026.

## Selesai

- [x] Fondasi React, TypeScript, TanStack Start, dan build Netlify.
- [x] Landing page responsif dengan hero cinematic, navigasi, proyek, skill, profil, dan kontak.
- [x] Benchmark [MotionSites 3D Portfolio](https://motionsites.ai/?prompt=3d-jack-portfolio-hero) diterjemahkan menjadi identitas sendiri: hero asimetris bertema software engineering, panel potret bergaris teknis, navigasi ringkas, dan tipografi editorial.
- [x] Palet seluruh landing page diganti menjadi midnight navy, teal, dan warm peach; bagian About, layanan, proyek, serta kontak mengikuti identitas visual baru.
- [x] Profil Jhansen Wilson, tujuh proyek, lima kelompok kemampuan IT, tautan GitHub/LinkedIn/email, foto, dan CV ditampilkan.
- [x] Empat tangkapan layar proyek asli dipakai dan dioptimalkan sebagai JPEG; tiga proyek tanpa tangkapan layar khusus memakai aset cinematic editorial baru yang diberi label jelas.
- [x] Hero tertahan saat scroll dan potret otomatis zoom; marquee visual proyek dua baris kembali sebelum rangkaian cinematic tiga adegan; kartu proyek menumpuk serta mengecil secara halus di desktop.
- [x] Konten tetap dapat dibaca dengan `prefers-reduced-motion`, navigasi keyboard, serta tanpa JavaScript animasi; kartu proyek menjadi daftar biasa di mobile.
- [x] Tautan email dan kode proyek aktif; CV tersedia sebagai PDF lokal.
- [x] Setiap proyek memiliki URL detail stabil, halaman detail menampilkan ringkasan, media, kategori, tech stack, dan repository; slug tidak dikenal mengembalikan not found.
- [x] Metadata Open Graph per proyek dan metadata situs tersedia; canonical dan gambar sosial absolut aktif ketika `VITE_SITE_URL` diset.
- [x] Supabase client menggunakan URL + publishable key dari environment; beranda dan halaman detail mengambil proyek published dari Supabase dengan fallback lokal.
- [x] Dashboard `/admin` menyediakan login Supabase Auth dan CRUD proyek; RLS migration membatasi draft dan mutasi ke admin.
- [x] Drizzle schema, SQL migration, grants, kebijakan RLS, dan seed tujuh proyek tersedia; panduan setup ada di [supabase/README.md](./supabase/README.md).
- [x] TypeScript dan build produksi lulus; tampilan desktop dan mobile diperiksa di browser lokal.

## Perlu diverifikasi sebelum publikasi

- [ ] Konfirmasi izin publikasi tangkapan layar proyek profesional dan kode repositorinya.
- [ ] Periksa ulang bio, status pekerjaan, dan isi CV agar sesuai keadaan terkini.
- [ ] Siapkan tangkapan layar asli Rebuilt Durasi, IDIP, dan TNDE bila tersedia; saat ini portofolio lama memakai gambar GitHub generik yang sama.
- [ ] Tambahkan sudut/tampilan proyek kedua untuk galeri tiap kartu bila media asli tersedia; saat ini satu tangkapan layar dipakai sebagai dua crop pada proyek yang memilikinya.
- [ ] Audit aksesibilitas dan performa di perangkat representatif.
- [ ] Tinjau enam peringatan `npm audit` level high pada rantai dependensi plugin Netlify (`sharp`/`ipx`).

## Berikutnya sesuai PRD

### 0. Uji kelayakan arsitektur

- [ ] Deploy preview TanStack Start SSR di Netlify.
- [ ] Hubungkan `/api/health` dari NestJS Function ke Supabase; ukur cold start dan refresh URL langsung.

### 1. Data dan admin

- [x] Drizzle schema awal proyek/admin dan RLS migration sudah dibuat; penerapan ke proyek Supabase dan bootstrap akun admin masih menunggu.
- [x] CRUD proyek dengan draft/publish tersedia di `/admin`; media masih URL/aset lokal.
- [ ] CRUD profil, media, dan pengaturan beranda.
- [ ] Verifikasi autentikasi admin dan CRUD pada proyek Supabase live; `.env.local` dan `SUPABASE_DB_URL` belum ada di workspace saat ini.
- [ ] Endpoint NestJS tervalidasi serta otorisasi server.

### 2. Konten publik dinamis

- [ ] Sumber konten proyek dinamis dari database; halaman detail saat ini memakai data lokal dan belum memiliki draft/published.
- [ ] Media Supabase Storage dengan validasi, alt text, poster, dan pemeriksaan pemakaian.
- [ ] Atur `VITE_SITE_URL` untuk domain produksi, lalu verifikasi canonical dan Open Graph absolut; sitemap dan robots.txt.

### 3. Cinematic dan media

- [ ] Video hero opsional dengan poster, mute, kontrol jeda, dan fallback pada mobile/hemat data.
- [ ] Preset efek yang dapat diatur admin.
- [ ] Ukur LCP, INP, dan CLS sesuai target PRD.
- [ ] Video/aset Higgsfield belum dibuat karena kredit workspace Higgsfield habis.

### 4. Kontak dan CV

- [ ] Formulir kontak tervalidasi, anti-spam, penyimpanan pesan, dan inbox admin.
- [ ] Builder CV satu sumber data dengan preview dan versi terbit.
- [ ] PDF A4 satu kolom dengan teks yang dapat dipilih.

### 5. Rilis

- [ ] Uji keamanan endpoint/RLS, aksesibilitas, mobile, dan deploy preview.
- [ ] Rilis produksi setelah kriteria terima MVP di PRD terpenuhi.

## Menjalankan lokal

Gunakan Node.js 22.12 atau lebih baru. Jalankan `npm install`, lalu `npm run dev`. Pemeriksaan: `npm run typecheck` dan `npm run build`.
