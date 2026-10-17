# Finance Core — Admin Starter Kit

Starter kit aplikasi admin berbasis **Laravel 12 + Inertia v2 + React 19 + Tailwind CSS v4**, dengan design system sendiri (tanpa shadcn/Radix), hak akses yang diatur dari UI, dan antarmuka **Bahasa Indonesia & Inggris**.

## Isi

- **Layout admin** compact & minim scroll: sidebar (menu bertingkat, mode ciut, flyout), topbar dengan breadcrumb, grid 12 kolom, pola panel "card di dalam card".
- **Design system** di `resources/js/components/core`: tombol, input, select, combobox, date picker, input rupiah, upload file, tabel, pagination, modal, dropdown, toast, dialog konfirmasi, skeleton, dll. Katalog lengkap di **`/ui`** (hanya environment `local`).
- **Modul acuan CRUD**: Users (cari, filter, sort, pagination dari server, tambah/ubah/hapus).
- **Roles & Permissions** (spatie/laravel-permission): role dan izin dicentang dari UI; menu & tombol tersembunyi otomatis sesuai izin.
- **Multi-bahasa** (ID/EN) per pengguna; pesan validasi berbahasa Indonesia.
- **Umpan balik**: toast setelah simpan/hapus, dialog konfirmasi, loading state & skeleton, indikator koneksi lambat.
- **Keamanan akun**: autentikasi dua faktor (aplikasi autentikator + kode pemulihan, via Laravel Fortify), daftar sesi login & keluar dari perangkat lain, kebijakan password production.
- **Halaman error** 403/404/500/503 dan sesi kedaluwarsa (419) yang ramah.
- **Format** rupiah, angka, tanggal & waktu sesuai bahasa dan zona waktu tampilan (default Asia/Jakarta).
- **Keterbacaan** untuk pengguna 30–70 tahun: kontras teks WCAG AA, teks minimal 12px.

## Kebutuhan

| Komponen | Versi |
|---|---|
| PHP | 8.2+ dengan ekstensi `intl`, `pdo_mysql` (dan `pdo_sqlite` bila menjalankan test dengan SQLite) |
| Composer | 2.x |
| Node.js | 22.x |
| Database | MySQL 8 / MariaDB (development & production) |

## Instalasi

```bash
git clone <repo> nama-project && cd nama-project
composer install
cp .env.example .env          # lalu isi DB_DATABASE, DB_USERNAME, DB_PASSWORD
composer setup                # app key, migrasi, roles & permissions, admin, storage link, build frontend
composer dev                  # server + queue + log + Vite
```

Login pertama: **admin@example.com / password** — segera ganti kata sandinya di *Settings → Password*.

Butuh data contoh? `php artisan app:install --demo` (menambah 100 pengguna contoh).

## Perintah Penting

| Perintah | Fungsi |
|---|---|
| `composer setup` | Instalasi pertama (aman dijalankan ulang; tidak mengganti `APP_KEY`, hanya seeding bila database kosong). |
| `composer dev` | Menjalankan aplikasi untuk development. |
| `composer test:local` | Menjalankan seluruh test ke database MySQL test terpisah. |
| `php artisan app:sync-permissions` | Menyinkronkan daftar izin dari `App\Enums\Permission` ke database. |
| `npm run build` | Build frontend production. |
| `vendor/bin/pint` · `npm run format` · `npx eslint .` · `npx tsc --noEmit` | Merapikan & memeriksa kode. |

### Test

- Test **tidak boleh** memakai database development (`RefreshDatabase` mengosongkannya).
- `composer test:local` mengarah ke database **`db_pm_v6_testing`**. Untuk project baru, buat database test (mis. `nama_project_testing`) lalu ganti nama tersebut di script `test:local` pada `composer.json`.
- CI (GitHub Actions) memakai SQLite in-memory dari `phpunit.xml`.

## Struktur Penting

```
app/
├── Actions/SyncPermissions.php      # izin & role bawaan dari enum
├── Enums/Permission.php             # daftar semua izin
├── Http/Controllers/                # UserController & RoleController = contoh CRUD
├── Policies/                        # aturan akses per model
└── Support/Format.php               # format rupiah/tanggal di server
lang/id.json                         # terjemahan Indonesia (kunci = teks Inggris)
resources/js/
├── components/core/                 # design system (UI dasar)
├── components/admin/                # widget admin (sidebar, DataTable, toast flash, dll.)
├── config/navigation.ts             # menu sidebar
├── hooks/                           # useTableQuery, useCan, useTranslation, dll.
├── layouts/admin-layout.tsx         # shell admin (persistent layout)
├── lib/format.ts · lib/i18n.ts      # format & terjemahan
└── pages/                           # halaman Inertia
.docs/                               # rencana, keputusan desain, panduan
AGENTS.md                            # aturan kode & UI (dibaca juga oleh AI assistant)
```

## Membuat Modul Baru

Ikuti **`.docs/guide-new-module.md`** — langkah lengkap backend (migration, Form Request, Policy, controller, izin), frontend (halaman index/create/edit, menu, tombol sesuai izin) dan test, dengan modul Users sebagai acuan. Aturan desain & kode ada di **`AGENTS.md`**.

## Mengganti Brand

| Yang diganti | Lokasi |
|---|---|
| Nama, logo & warna brand (tanpa ubah kode) | Menu **Settings → Application** (izin `settings.manage`) |
| Nilai bawaan nama & warna brand | `config/branding.php` / `APP_NAME`, `BRAND_COLOR` di `.env` |
| Judul tab browser | `APP_NAME` di `.env` |
| Warna status, radius, kepadatan | token di `resources/css/app.css` (`--color-success`, `--spacing-control`, dll.) |
| Bahasa default & zona waktu tampilan | `APP_LOCALE`, `APP_DISPLAY_TIMEZONE` di `.env` |
| Akun admin awal | `database/seeders/DatabaseSeeder.php` |

## Deploy (Production)

1. `APP_ENV=production`, `APP_DEBUG=false` (halaman error ramah untuk 500/503 hanya aktif saat debug mati).
2. `composer install --no-dev --optimize-autoloader`, `npm ci && npm run build`.
3. `php artisan migrate --force`, `php artisan app:sync-permissions`, `php artisan storage:link`.
4. `php artisan optimize` (cache config, route, view).
5. Jalankan queue worker bila memakai antrean (`php artisan queue:work`) dan scheduler (cron `* * * * * php artisan schedule:run`) untuk membersihkan log aktivitas lama.
6. Mode pemeliharaan: `php artisan down` / `php artisan up`.

## Dokumentasi Lain

- `.docs/starter-kit-roadmap.md` — roadmap & status fitur.
- `.docs/decisions-log.md` — alasan di balik keputusan desain & teknis.
- `.docs/admin-template-grid-system.md`, `.docs/animation-plan.md` — design system & animasi.
