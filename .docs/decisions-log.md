# Decisions Log

Keputusan kecil yang diambil saat mengerjakan roadmap (`.docs/starter-kit-roadmap.md`) tanpa berhenti bertanya, sesuai arahan "pilih default terbaik". Review dan koreksi bila perlu.

## UI0 — Layout Compact & Minim Scroll

| Topik | Keputusan | Alasan |
|---|---|---|
| Shell (L1) | Tetap memakai scroll jendela browser dengan sidebar & topbar `sticky`, **bukan** `<main>` sebagai area scroll sendiri. | Efek yang sama (sidebar & topbar diam), tetapi scroll restoration Inertia, `preserveScroll`, dan scroll di HP tetap bekerja normal tanpa konfigurasi tambahan. |
| Token kepadatan | Disimpan sebagai `--spacing-*` di `@theme` (`control`, `control-sm`, `row`, `row-head`, `topbar`, `page`, `section`). | Tailwind v4 otomatis membuat utility (`h-control`, `p-page`, `gap-section`); cukup ubah satu tempat. Didaftarkan di `cn()` agar override (`h-8`) tetap menang. |
| Ukuran kontrol | Input/select/tombol default 36px, kecil 32px; baris tabel 40px; jarak antar panel 12px; padding halaman 16px. | Sesuai aturan L5, tetap ≥ 32px untuk target sentuh. |
| Judul dashboard | Sapaan "Hello, {nama} 👋" dipindah ke judul topbar; filter periode & tombol ⋯ ke topbar lewat `<TopbarActions>`. | Aturan L7 (tanpa judul ganda) tanpa kehilangan kontrol. |
| `TopbarActions` | Portal dari halaman ke slot di topbar, bukan prop di layout. | Persistent layout tidak punya akses ke state halaman; portal membuat kontrol tetap bisa memakai state halaman. |
| Tinggi chart dashboard | `clamp(11rem, 100dvh − 22rem, 18rem)`. | Statistik + chart muat di 1536×864 dan 1366×768; tidak terlalu tinggi di layar besar. |
| Activity feed | Tinggi mengikuti baris grid (`xl:[contain:size]`), daftar di-scroll di dalam panel. | Feed tidak lagi memanjangkan baris grid & halaman. |
| Form Users | `FormActions sticky` (tombol menempel di bawah layar). | Form panjang tetap bisa disimpan tanpa scroll ke bawah. |
| Form Settings | `FormActions` di dalam `FormSection` (tidak sticky). | Formnya pendek; tombol sudah terlihat. |
| `PageHeader`, `HeadingSmall` | Dihapus dari kode. | Tidak dipakai lagi; mencegah judul ganda muncul kembali. |
| Breadcrumb Settings | `Settings / Profile` dan `Settings / Password`, judul topbar "Profile settings" / "Password settings". | Konsisten dengan pola create/edit. |

## S1 — Hak Akses (Roles & Permissions)

| Topik | Keputusan | Alasan |
|---|---|---|
| Daftar permission | Enum `App\Enums\Permission` + action `SyncPermissions` (dipakai migration, seeder, command `app:sync-permissions`). | Satu sumber kebenaran di kode; role & centangannya tetap diatur dari UI. Permission yang dihapus dari enum ikut dihapus dari database. |
| Nama permission | `modul.aksi`: `users.view`, `users.create`, `users.update`, `users.delete`, `roles.view`, `roles.manage`. | Konvensi umum spatie, mudah dibaca dan dikelompokkan per modul. |
| Role bawaan | `admin` (semua akses lewat `Gate::before`, terkunci), `manager` (lihat/tambah/ubah users + lihat roles), `staff` (tanpa akses admin). | Admin tidak bisa terkunci keluar walau permission baru ditambah. Manager/staff hanya diberi default saat pertama dibuat; setelah itu diatur dari UI. |
| Role bawaan tidak bisa dihapus/diganti nama | Ya (admin, manager, staff). | Dipakai di kode (default role user baru, seeder, test). |
| Hapus role yang masih dipakai | Ditolak (409) — pindahkan user dulu. | Mencegah user kehilangan role tanpa sengaja. |
| Nama role | Disimpan sebagai slug (`finance-lead`), ditampilkan "Finance Lead". | Aman dipakai di kode/URL, tetap enak dibaca. |
| Satu role per user | Form user memilih satu role. | Sesuai kebutuhan saat ini dan lebih mudah dipahami; spatie tetap mendukung multi-role bila kelak dibutuhkan. |
| Migrasi data | Role lama di kolom `users.role` dipindah ke tabel spatie lalu kolom dihapus; jika tidak ada admin, akun pertama dijadikan admin. | Sesuai izin migrasi data. |
| Akun pemilik di DB development | `waladi.widarno@…` (id 1) dijadikan **admin** setelah migrasi. | DB development sudah berisi admin dummy dari seeder, sehingga aturan "akun pertama jadi admin" tidak berlaku dan pemilik akan kehilangan akses ke Users/Roles. |
| Menu | Grup baru **Administration**: Users & Roles & Permissions, tersembunyi tanpa permission. | Memisahkan menu pengelolaan dari menu bisnis. |
| Seeder | `admin@example.com` / `password` sebagai admin awal. | Instalasi baru langsung bisa login sebagai admin. Ganti password setelah login pertama. |

## S1b — Multi-bahasa

| Topik | Keputusan | Alasan |
|---|---|---|
| Format terjemahan | JSON Laravel (`lang/id.json`) dengan teks Inggris sebagai kunci; Inggris tanpa file. | Satu sumber untuk `__()` (PHP) dan `t()` (React); teks yang belum diterjemahkan tetap tampil dalam bahasa Inggris, tidak kosong. |
| Pengiriman ke frontend | Shared prop `translations` hanya untuk bahasa aktif (±240 entri). | Ringan; partial reload tidak mengirim ulang. |
| Penerjemahan di komponen inti | Breadcrumb, Panel, FormSection/FormField, Modal, DataTable, FilterTabs, sidebar, topbar menerjemahkan prop teksnya sendiri. | Halaman & modul baru cukup menulis teks Inggris; lebih sedikit kode berulang. |
| Judul dinamis | `title="Edit user · :name"` + `titleParams`, diterjemahkan di topbar. | Fungsi `layout` dijalankan sebelum bahasa disinkronkan; terjemahan harus terjadi saat topbar dirender. |
| Halaman auth | Memakai `t()` dari `useTranslation()`. | Layout auth berada di dalam halaman, jadi teks halaman dievaluasi sebelum layout. |
| Penyimpanan bahasa | `users.locale` (pengguna), session (tamu), default `APP_LOCALE`. | Bahasa ikut akun di perangkat mana pun; tamu bisa ganti di halaman login. |
| Default instalasi baru | `.env.example` → `APP_LOCALE=id`. | Target pengguna berbahasa Indonesia. `.env` lokal Anda tidak diubah (masih `en`); pilih bahasa lewat menu pengguna atau Settings → Profile. |
| Pesan validasi | `lang/id/validation.php` ditulis sendiri (aturan yang umum dipakai + nama atribut), tanpa paket tambahan. | Tanpa dependency baru; aturan yang tidak ada jatuh ke bahasa Inggris. |
| Pemilih bahasa | Menu pengguna (sidebar), bawah kartu login, dan Settings → Profile. | Mudah ditemukan tanpa halaman tambahan. |
| Data dummy dashboard | Label statistik diterjemahkan; isi activity feed & transaksi dummy tidak. | Data dummy akan dibersihkan di S11. |

## S2 — Toast, Flash & Konfirmasi

| Topik | Keputusan | Alasan |
|---|---|---|
| Mekanisme flash | Session Laravel (`->withToast()` macro) + shared prop `flash` dengan `Inertia::always`. | Klien `@inertiajs/core` 2.0.3 belum memakai fitur flash bawaan Inertia; cara ini tanpa upgrade dependency dan tetap jalan pada partial reload. |
| Id toast | UUID per flash. | Pesan yang sama yang di-flash dua kali tetap muncul dua kali, tetapi tidak dobel saat halaman dirender ulang. |
| Posisi & durasi | Kanan atas di bawah topbar; sukses 4 dtk, info 5, peringatan 6, error 8; jeda saat kursor di atasnya; maks. 4 tumpukan. | Tidak menutupi tombol aksi tabel/form; error cukup lama untuk dibaca pengguna 30–70 tahun. |
| Teks "Saved" inline di Settings | Dihapus, diganti toast. | Satu pola umpan balik di seluruh aplikasi. |
| Hapus role yang masih dipakai | Kini toast error + kembali ke halaman (sebelumnya 409). | Pengguna melihat pesan jelas, bukan halaman error. |
| `useConfirm` | Satu dialog bersama di `AdminLayout`, dipanggil dengan `await confirm({...})`; Modal hapus manual di Users & Roles diganti. | Kode halaman lebih pendek, tampilan konfirmasi seragam. Modal hapus akun (butuh input kata sandi) tetap Modal biasa. |

## S3 — Komponen Form

| Topik | Keputusan | Alasan |
|---|---|---|
| DatePicker | Memakai picker bawaan browser (`<input type="date">`) yang distyle, nilai ISO `YYYY-MM-DD`. | Tanpa dependency; kalender otomatis mengikuti bahasa & format pengguna, aksesibel, nyaman di HP. Kalender kustom (rentang tanggal, dll.) bisa ditambah nanti bila dibutuhkan. |
| Combobox | Wrapper Headless UI Combobox; filter lokal, atau `onSearch` untuk pencarian ke server. | Navigasi keyboard & ARIA sudah teruji; tampilan tetap Finance Core. |
| Radio/Checkbox group | Input native yang distyle, varian `list` dan `cards`. | Aksesibel tanpa library; varian kartu cocok untuk pilihan dengan deskripsi. |
| CurrencyInput | Ditampilkan dengan pemisah ribuan sesuai bahasa, nilai berupa angka bulat (tanpa desimal). | Rupiah praktis tidak memakai sen; aman dikirim ke kolom integer/decimal. |
| FileUpload | Validasi jenis & ukuran di browser untuk umpan balik cepat; server tetap memvalidasi. | Keamanan tetap di server. |
| Contoh nyata | Foto profil di Settings → Profile (`users.avatar_path`, disk `public`, `php artisan storage:link`). File lama dihapus saat diganti, dihapus, atau akun dihapus. | Menjadi acuan pola upload untuk modul lain. |
| Form Users | Tidak diubah (sudah memakai `FormField`). | Tugas roadmap "refactor ke FormField" sudah terpenuhi sejak revisi Users. |

## S4 — Halaman Error

| Topik | Keputusan | Alasan |
|---|---|---|
| Kapan halaman ramah dipakai | 403/404 selalu; 500/503 hanya saat `APP_DEBUG=false`. | Developer tetap melihat detail error saat development; pengguna production melihat pesan yang jelas. |
| 419 (CSRF/halaman kedaluwarsa) | Kembali ke halaman sebelumnya dengan toast error. | Lebih ramah daripada halaman error untuk kejadian umum (tab dibiarkan lama). |
| Halaman maintenance | Halaman error yang sama dengan status 503 (`php artisan down`). | Satu desain untuk semua kondisi; tidak perlu view Blade terpisah. |
| Bahasa halaman error | Ditentukan di handler (bahasa pengguna / session / default) dan dikirim bersama terjemahan. | 404 dapat terjadi sebelum middleware web (bahasa & shared props) berjalan. |
| Tombol | "Kembali" + "Ke dasbor" (sudah login) / "Ke beranda" (tamu); tidak ada tombol beranda saat 503. | Selalu ada jalan keluar yang jelas. |
| Error boundary | Per halaman (di `AdminLayout`, reset saat pindah halaman) dan per chart. | Satu widget rusak tidak membuat seluruh layar kosong. |

## S5 — Format & Zona Waktu

| Topik | Keputusan | Alasan |
|---|---|---|
| Penyimpanan waktu | Database tetap UTC (`APP_TIMEZONE=UTC`). | Praktik standar; aman bila kelak ada pengguna/cabang di zona lain (WITA/WIT). |
| Tampilan waktu | `APP_DISPLAY_TIMEZONE` (default `Asia/Jakarta`), dipakai `lib/format.ts` dan `App\Support\Format`; dibagikan ke frontend sebagai prop `timezone`. | Satu tempat untuk mengganti zona tampilan per instalasi. |
| Mata uang | Rupiah tanpa desimal; `id`: "Rp 1.250.000", `en`: "IDR 1,250,000". | Sesuai kebiasaan penulisan rupiah; tetap jelas untuk pengguna berbahasa Inggris. |
| Tanggal tanpa jam (`YYYY-MM-DD`) | Diperlakukan sebagai tanggal kalender, tidak digeser zona waktu. | Mencegah tanggal "mundur sehari" di zona berbeda. |
| Backend helper | `App\Support\Format` memakai `Illuminate\Support\Number` (butuh ekstensi PHP `intl`). | Format sama dengan frontend; `intl` dicatat sebagai kebutuhan server di README (S11). |

## S11 — Kesiapan Starter Kit

| Topik | Keputusan | Alasan |
|---|---|---|
| Menu placeholder | Dihapus; tersisa Overview, Administration (Users, Roles & Permissions), Settings. Contoh sub-menu ditulis sebagai komentar di `config/navigation.ts`. | Starter kit bersih; tidak ada menu yang tidak berfungsi. |
| Dashboard | Tetap sebagai contoh tampilan (chart, feed, tabel) dengan lencana **"Data contoh"** di topbar. | Menunjukkan pola widget; jelas bahwa angkanya dummy. Hapus lencana saat dashboard memakai data asli. |
| Halaman `welcome` & prop `quote` | Dihapus; `/` diarahkan ke `/dashboard` (tamu → login). | Sisa bawaan starter kit Laravel. |
| Seeder | `DatabaseSeeder` hanya membuat admin; 100 pengguna contoh lewat `app:install --demo` / `UserSeeder`. | Instalasi baru tidak berisi data dummy. |
| `composer setup` / `app:install` | Idempoten: tidak mengganti `APP_KEY`, hanya seeding bila belum ada pengguna, membuat storage link bila belum ada. | Aman dijalankan ulang oleh siapa pun di tim. |
| CI | Jalan di `master`/`main`/`develop`; test di PHP 8.2 & 8.4 (SQLite, `intl`); lint dalam mode **cek** (Pint `--test`, Prettier `--check`, ESLint, `tsc`). | Sebelumnya CI tidak pernah jalan (branch `master` tidak dipantau) dan lint hanya memperbaiki tanpa gagal. 7 file bawaan dirapikan Pint agar CI hijau. |
| Katalog `/ui` | Hanya `local`, berbahasa Inggris (khusus developer). | Bukan halaman pengguna. |
| Tag `v1.0.0` | **Belum dibuat** — menunggu Anda setelah uji manual di browser. | Sesuai kesepakatan izin. |
| Test di SQLite | Belum bisa diuji lokal (tanpa `pdo_sqlite`); CI akan menjadi pemeriksa pertama. | Bila ada perbedaan SQLite vs MySQL, perbaiki dari hasil CI. |

## S6 — Command Palette & Notifikasi

| Topik | Keputusan | Alasan |
|---|---|---|
| Isi command palette | Semua halaman di menu (tersaring izin, diterjemahkan) + aksi cepat dari `config/commands.ts`. Pencarian per kata, juga cocok dengan teks Inggris & kata kunci. | Tanpa konfigurasi tambahan per modul selain aksi "tambah". |
| Kotak "Cari apa saja" di sidebar | Kini membuka command palette (sebelumnya hanya tampilan). | Satu tempat pencarian. |
| Notifikasi | Laravel Database Notifications + kelas umum `AppNotification`; teks disimpan sebagai kunci Inggris + parameter, diterjemahkan saat dibaca. | Penerima membaca dalam bahasanya sendiri, walau pengirim memakai bahasa lain. |
| Pemuatan daftar | Jumlah belum dibaca dikirim di setiap halaman & dicek tiap 60 detik (`usePoll`); daftar (15 terbaru) baru dimuat saat lonceng dibuka (`Inertia::optional`). | Halaman tetap ringan. |
| Contoh notifikasi | Selamat datang untuk pengguna baru; pemberitahuan saat role diubah oleh orang lain. | Contoh nyata untuk modul lain. |
| Real-time (WebSocket) | Belum; cukup polling 60 detik. | Tanpa dependency/server tambahan (Reverb/Pusher) — bisa ditambah nanti. |

## S7 — DataTable Lanjutan

| Topik | Keputusan | Alasan |
|---|---|---|
| Penyimpanan kolom yang disembunyikan | `localStorage` per pengguna & per tabel. | Tanpa tabel database baru; pilihan tampilan cukup per perangkat. Bisa dipindah ke database bila perlu sinkron antar perangkat. |
| Export | CSV dari server (UTF-8 + BOM agar nama ber-aksen tampil benar di Excel), mengikuti search/filter/sort aktif, streaming per 500 baris. | Tetap ringan untuk data besar; tanpa dependency Excel. |
| Aksi massal Users | Aktifkan, nonaktifkan, hapus; akun sendiri selalu dilewati; izin dicek per baris; hapus massal minta konfirmasi. | Aman dan konsisten dengan aturan hapus satu per satu. |
| Pilihan baris | Tetap tersimpan saat pindah halaman tabel, dikosongkan setelah aksi massal berhasil. | Memungkinkan memilih baris dari beberapa halaman. |
| Tampilan HP | Di bawah 768px baris tampil sebagai kartu (`mobileCard`). | Tabel lebar tidak nyaman di layar kecil. |

## S8 — Pengaturan Aplikasi & Branding

| Topik | Keputusan | Alasan |
|---|---|---|
| Penyimpanan | Tabel `settings` (key/value) via `App\Support\AppSettings` dengan cache; nilai bawaan di `config/branding.php`. | Admin bisa mengubah tanpa deploy; cache menjaga performa. |
| Warna brand saat runtime | Token `--color-brand` di-override pada `<html>` oleh `useBrandColor()`; `--color-brand-hover` dihitung otomatis (`color-mix`). | Semua komponen (termasuk dialog & toast di luar layout) ikut berubah tanpa build ulang. |
| Validasi warna | Hanya warna dengan kontras ≥ 4.5:1 terhadap teks putih (WCAG AA); pratinjau & rasio kontras ditampilkan saat memilih. | Mengikuti aturan keterbacaan untuk pengguna 30–70 tahun. |
| Izin | Permission baru `settings.manage` (otomatis dimiliki Admin); menu Application tersembunyi tanpa izin. | Konsisten dengan S1. |
| Halaman error | Ikut memakai branding; bila database bermasalah, jatuh ke nilai config. | Halaman error tidak boleh ikut gagal. |
| Judul tab browser | Tetap dari `APP_NAME`. | Judul dibentuk saat aplikasi dimuat; ubah `APP_NAME` bila nama berubah permanen. |

## S9 — Audit Log

| Topik | Keputusan | Alasan |
|---|---|---|
| Implementasi | Tabel `activity_logs` + trait `LogsActivity` + `ActivityLog::record()` buatan sendiri (tanpa paket tambahan). | Ringan, sesuai kebutuhan, mudah dibaca tim. |
| Isi catatan | Siapa (causer), kejadian, deskripsi (kunci Inggris, diterjemahkan saat tampil), nama data saat itu (tetap ada walau data dihapus), perubahan field lama → baru, alamat IP. | Cukup untuk audit tanpa menyimpan data sensitif. |
| Data sensitif | Atribut `hidden` (password, token, path foto) tidak pernah dicatat; `locale` & verifikasi email diabaikan. | Keamanan & mengurangi catatan tak penting. |
| Kejadian manual | Login/logout, perubahan izin role (ditambah/dihapus), perubahan pengaturan aplikasi. | Aksi penting yang tidak lewat event model. |
| Aksi massal | Aktifkan/nonaktifkan disimpan satu per satu agar tiap perubahan tercatat. | Audit lengkap. |
| Akses | Halaman Activity Log butuh `activity.view`; feed dashboard menampilkan aktivitas semua orang hanya bagi pemegang izin itu, selain itu hanya aktivitas sendiri. | Privasi antar pengguna. |
| Retensi | 365 hari, dibersihkan harian oleh `model:prune` (butuh scheduler). | Database tidak membengkak. |
| Urutan migrasi | Migrasi role (S1) memakai `ActivityLog::withoutRecording()` karena tabel log dibuat belakangan. | Ditemukan saat test: instalasi baru akan gagal tanpa ini. |
| Dashboard | Feed "Pembaruan terbaru" kini data asli; statistik, chart & tabel transaksi masih contoh. | |

## S10 — Keamanan Akun (bagian 1, tanpa dependency)

| Topik | Keputusan | Alasan |
|---|---|---|
| Daftar sesi | Dibaca dari tabel `sessions` (driver database, bawaan `.env.example`); browser & platform ditebak dari user agent tanpa library. | Tanpa dependency; cukup untuk mengenali perangkat. |
| Keluar dari perangkat lain | Wajib konfirmasi kata sandi + dialog konfirmasi; `Auth::logoutOtherDevices()` dan baris sesi lain dihapus; dicatat di audit trail. | Mencegah penyalahgunaan bila perangkat ditinggal dalam keadaan login. |
| Kebijakan password | Production: min. 8 karakter, huruf besar & kecil, angka. Non-production: min. 8. | Aman di production tanpa merepotkan development/test. Pemeriksaan kebocoran (`uncompromised`) tidak dipakai karena butuh akses internet ke layanan luar. |
| Rate limit login | Sudah ada (5 percobaan per email + IP, bawaan starter kit). | — |
| 2FA | Dikerjakan di bagian 2 (Laravel Fortify). | Sesuai kesepakatan. |

## S10 — Keamanan Akun (bagian 2, 2FA dengan Laravel Fortify)

| Topik | Keputusan | Alasan |
|---|---|---|
| Cakupan Fortify | Hanya fitur 2FA (TOTP + kode pemulihan, wajib konfirmasi kode). `Fortify::ignoreRoutes()`; controller Fortify dipasang di route kita sendiri. Login, reset password, dll tetap milik aplikasi. | Halaman auth yang sudah ada tidak berubah; permukaan baru minimal. |
| Alur login | `LoginRequest` memeriksa kata sandi & status aktif dulu; bila 2FA aktif, user belum login — `login.id` disimpan di session lalu diarahkan ke halaman kode. | User nonaktif tidak sampai ke tahap kode. |
| Rate limit kode | 5 percobaan/menit per sesi login (`throttle:two-factor`). | Mencegah tebak kode. |
| Halaman pengaturan | Settings → Dua faktor, di balik konfirmasi kata sandi; QR & kunci hanya tampil saat menunggu konfirmasi; kode pemulihan bisa disalin & dibuat ulang. | Rahasia tidak tampil tanpa verifikasi ulang. |
| Audit | Aktivasi & penonaktifan 2FA dicatat di audit trail. | Jejak perubahan keamanan. |
| Passkeys | Migrasi passkeys dari Fortify tidak dipakai. | Di luar cakupan. |
## S12 — Dark mode

| Topik | Keputusan | Alasan |
|---|---|---|
| Mekanisme | Kelas `.dark` di `<html>` yang mengganti nilai token warna; komponen tidak diubah selain mengganti warna tetap (overlay, teks tombol bahaya, gradien chart, warna progress) menjadi token. | Satu sumber warna; modul baru otomatis mendukung dark mode. |
| Pilihan | Terang / Gelap / Ikuti perangkat (default), di Settings → Tampilan dan command palette. Disimpan di `localStorage` per browser; script inline di `app.blade.php` memasang tema sebelum render pertama. | Tanpa migrasi & tanpa kedipan terang saat halaman dibuka. |
| Warna brand | Brand pilihan admin disimpan di `--brand-source`; di dark mode tombol brand memakai tint terang dari warna itu dengan teks gelap. | Warna brand apa pun tetap terbaca di latar gelap. |
| Kontras | Token teks dark lolos WCAG AA di surface & surface-muted (ink-subtle ≈ 7:1). | Aturan keterbacaan pengguna 30–70 tahun. |
## Support — Halaman Tentang Template

| Topik | Keputusan | Alasan |
|---|---|---|
| Akses | Hanya role admin (cek `hasRole` di controller). Menu memakai penanda `role:admin` yang hanya dikirim ke admin; bukan izin sungguhan, jadi tidak bisa diberikan ke role lain. | Permintaan pengguna: hanya admin yang melihat. |
| Versi paket | Dibaca dari `composer.lock` & `package-lock.json` saat halaman dibuka. | Selalu sesuai yang terpasang, tanpa diperbarui manual. |
| Ikon | Daftar diambil dari import `lucide-react` di `resources/js`; ditampilkan lewat peta `icons` Lucide. Chunk halaman ±120 KB gzip, hanya dimuat di halaman ini. | Daftar otomatis mengikuti kode; hanya ikon yang dipakai (sesuai rekomendasi). |
| Token | Nilai warna & ukuran dibaca dari CSS variable aktif, sehingga ikut tema terang/gelap. | Satu sumber kebenaran: `app.css`. |