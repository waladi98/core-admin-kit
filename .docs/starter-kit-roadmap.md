# Finance Core — Starter Kit Roadmap

> Status: **PLANNING — menunggu perintah pengerjaan per fase**
> Tujuan: template ini dipakai sebagai titik awal project-project berikutnya, sehingga fitur yang hampir selalu dibutuhkan sudah tersedia dan konsisten.

## 1. Kondisi Saat Ini

| Area | Status |
|---|---|
| Design system (`components/core`) | ✅ 22 komponen, tanpa shadcn/Radix |
| Layout admin, grid, Panel | ✅ |
| Dashboard + chart | ✅ (data dummy) |
| Animasi & loading state | ✅ (`.docs/animation-plan.md`) |
| Auth & settings (profile, password) | ✅ dimigrasi ke Finance Core |
| Modul Users | ✅ modul acuan CRUD (S0) |
| Git | ✅ commit awal `4c3ac5f`, belum ada remote |
| Hak akses per role | ❌ semua user login bisa akses semua halaman |
| Toast / flash message | ❌ |
| Search `⌘K` & lonceng notifikasi | ❌ hanya tampilan |
| Halaman error | ❌ masih bawaan Laravel |

## 2. Prinsip

- Setiap fitur dibuat **generik dan bisa dipakai ulang**, bukan khusus satu modul.
- Mengikuti aturan di `AGENTS.md` (core/admin components, token warna, loading state, test).
- Setiap fase ditutup dengan: Pint, `tsc`, ESLint, build, `composer test:local`, update `AGENTS.md` bila ada pola baru, dan **satu commit per fase**.
- Dependency baru hanya dengan persetujuan.

## 3. Fase

### Fase S0 — Selesaikan Modul Users (acuan CRUD) ✅ SELESAI
- [x] Jalankan verifikasi Fase 5 di `users-module-plan.md` (Pint, test, build) dan perbaiki bila ada error.
- [x] Review konsistensi dengan `AGENTS.md` (pakai `useTableQuery`, `DataTable` loading, `Pagination`, `Modal`).
- [x] Tandai Users sebagai **modul acuan**: dokumentasikan langkah membuat modul CRUD baru (`.docs/guide-new-module.md`).

### Fase S1 — Hak Akses (Role & Permission)
- [ ] Permission didefinisikan di satu tempat (enum/config), dipetakan ke `UserRole`.
- [ ] Policy (`UserPolicy`, dst.) + Gate; controller memakai `authorize`.
- [ ] Inertia shared prop `auth.can` (daftar permission user).
- [ ] Hook `useCan('users.manage')` + komponen `<Can>` di frontend.
- [ ] Menu sidebar: field `permission` di `config/navigation.ts`, otomatis tersembunyi.
- [ ] Seeder akun admin awal.
- [ ] Test: akses ditolak (403) & menu tersembunyi.

### Fase S2 — Feedback: Toast, Flash & Konfirmasi
- [ ] `core/toast.tsx` + `ToastProvider` (success, error, warning, info; auto-hide; stack).
- [ ] Flash message dari Laravel (`Inertia::flash` / session) otomatis jadi toast.
- [ ] Hook `useConfirm()` → `await confirm({ title, description, tone: 'danger' })`.
- [ ] Modul Users memakai toast & `useConfirm` sebagai contoh.

### Fase S3 — Komponen Form Lengkap
- [ ] `FormField` (label + input + hint + error), `Textarea`, `Switch`, `RadioGroup`, `CheckboxGroup`.
- [ ] `Combobox` (searchable select, Headless UI), `DatePicker`, `FileUpload` (+ preview avatar).
- [ ] `CurrencyInput` (format Rupiah).
- [ ] Form Users di-refactor memakai `FormField`.

### Fase S4 — Halaman Error & State Global
- [ ] Halaman 403, 404, 419, 500, 503 bergaya Finance Core (Inertia error page di `bootstrap/app.php`).
- [ ] Halaman maintenance.
- [ ] Error boundary React untuk widget yang gagal render.

### Fase S5 — Utilitas
- [ ] `lib/format.ts`: Rupiah, angka, persen, tanggal & waktu Indonesia, tanggal relatif.
- [ ] Konfigurasi locale & timezone (`Asia/Jakarta`).
- [ ] Helper backend untuk format yang sama (konsisten server–client).

### Fase S6 — Navigasi & Notifikasi
- [ ] Command palette `⌘K`: cari menu & halaman (dari `config/navigation.ts`), bisa diperluas per modul.
- [ ] Notifikasi: Laravel Database Notifications + dropdown lonceng (badge jumlah belum dibaca, tandai sudah dibaca).

### Fase S7 — DataTable Lanjutan
- [ ] Aksi massal (bulk delete/update) memakai seleksi yang sudah ada.
- [ ] Export CSV dari server (mengikuti filter aktif).
- [ ] Atur kolom yang tampil (disimpan per user).
- [ ] Tampilan kartu di layar kecil.

### Fase S8 — Pengaturan Aplikasi & Branding
- [ ] Nama aplikasi, logo, warna brand di satu tempat (`config/branding.php` + token CSS).
- [ ] Halaman Settings → Application (khusus admin).
- [ ] `BrandLogo` membaca konfigurasi.

### Fase S9 — Audit Log
- [ ] Tabel `activity_logs` + trait `LogsActivity` untuk model.
- [ ] Halaman Activity Log (pakai `DataTable` + `useTableQuery`).
- [ ] Activity feed dashboard membaca data asli.

### Fase S10 — Keamanan Akun
- [ ] Two-factor authentication.
- [ ] Daftar sesi login aktif + logout perangkat lain.
- [ ] Kebijakan password (`Password::defaults()`), rate limit login.

### Fase S11 — Kesiapan Starter Kit
- [ ] Halaman katalog komponen `/ui` (hanya di environment local).
- [ ] Bersihkan: data dummy dashboard jadi contoh yang mudah dihapus, rapikan menu placeholder, halaman `welcome`.
- [ ] README: instalasi, setup database test, ganti brand, membuat modul baru, struktur folder.
- [ ] Script setup (`composer setup`): copy `.env`, key, migrate, seed, build.
- [ ] Perbaiki CI (`.github/workflows`) agar test & lint jalan.
- [ ] Tag versi `v1.0.0`.

### Fase S12 — Opsional
- [ ] Dark mode (token sudah siap).
- [ ] Multi-bahasa (Indonesia / Inggris).
- [ ] Test frontend (Vitest) untuk hook penting.

## 4. Urutan yang Disarankan

0. **FIX** — perbaiki masalah saat pindah halaman (detail menunggu konfirmasi user).
1. **S0** — modul Users selesai & jadi acuan.
2. **UI0** — layout compact.
3. **S1 → S1b → S2 → S3 → S4** — fondasi yang dipakai semua modul.
3. **S5 → S6 → S7** — produktivitas.
4. **S8 → S9 → S10** — kebutuhan aplikasi finance.
5. **S11** — rilis starter kit `v1.0.0`.

## 5. Keputusan (17 Okt 2026)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Hak akses (S1) | **Permission diatur dari UI** dan mudah diubah → `spatie/laravel-permission` (dependency baru, disetujui saat S1 dimulai). Tambah halaman **Roles & Permissions** (CRUD role, centang permission per role). Enum `UserRole` diganti role dari database. |
| 2 | Bahasa | **Multi-bahasa** (Indonesia & Inggris) → dipindah dari S12 ke fase fondasi (**S1b**), supaya semua teks baru langsung memakai terjemahan. |
| 3 | 2FA (S10) | **Rekomendasi: Laravel Fortify** — paket resmi Laravel, sudah teruji untuk 2FA (TOTP + recovery codes), dipakai starter kit resmi Laravel; hanya backend, UI tetap Finance Core. Dependency baru, disetujui saat S10 dimulai. |
| 4 | Syarat `v1.0.0` | **Rekomendasi: S0, UI0, S1, S1b, S2, S3, S4, S5, S11.** S6–S10 menyusul di `v1.x` karena tidak semua project membutuhkannya. |
| 5 | Kepadatan UI | **Compact/padat** → fase baru **UI0** (lihat di bawah), dikerjakan sebelum S1. |

### Fase UI0 — Layout Compact & Minim Scroll (dikerjakan sebelum S1)

**Aturan layout (berlaku untuk semua halaman):** *minim scroll, tetap nyaman dan responsif.*

| # | Aturan | Desktop (≥ 1024px) | Tablet / HP (< 1024px) |
|---|---|---|---|
| L1 | **Shell setinggi layar** | Sidebar & topbar diam; hanya area konten yang bergerak. | Sama, sidebar jadi drawer. |
| L2 | **Halaman index pas satu layar** | Panel tabel mengisi sisa tinggi layar; **header tabel & pagination selalu terlihat**, hanya baris tabel yang di-scroll di dalam panel. | Scroll halaman biasa (hindari scroll bersarang di HP). |
| L3 | **Form tanpa scroll panjang** | Field grid 3 kolom (`xl`), section dikelompokkan; **tombol Save/Cancel menempel di bawah layar** (sticky) sehingga selalu terlihat. | 1 kolom; tombol tetap sticky di bawah. |
| L4 | **Dashboard muat satu layar** (target 1440×900) | Tinggi chart & feed mengikuti tinggi layar; daftar panjang (activity feed) di-scroll di dalam panel. | Panel bertumpuk, scroll halaman biasa. |
| L5 | **Kepadatan compact** | Padding konten 16px, gap grid 12px, baris tabel 40px, input/tombol 32–36px, teks 13–14px. | Sama; target sentuh minimal 32px. |
| L6 | **Konten panjang di dalam komponen** | Modal, dropdown, sidebar, feed: `max-height` + scroll internal, bukan memanjangkan halaman. | Sama. |
| L7 | **Tanpa judul ganda** | Judul dari breadcrumb / topbar `title`; tanpa `PageHeader`. | Sama. |
| L8 | **Target layar** (keputusan: ukuran rata-rata) | **Acuan desain: 1536×864** (ukuran terbanyak di laptop 1080p dengan scaling 125%). **Batas minimum harus tetap nyaman: 1366×768.** Diuji juga di 1920×1080. | 768×1024, 390×844. |

**Tugas:**
- [ ] Shell `h-dvh`: `AdminLayout` jadi kolom tinggi layar, `<main>` satu-satunya area scroll (desktop).
- [x] Prop `fill` di `Panel` (+ `DataTable` `stickyHeader` / body scroll internal) agar panel tabel mengisi sisa tinggi layar; pagination tetap di dasar panel. *(diterapkan di /users)*
- [ ] `FormActions sticky`: bar tombol menempel di bawah area konten dengan latar & garis atas.
- [ ] Dashboard: tinggi chart & feed berbasis tinggi layar (`clamp`/`dvh`), feed scroll internal.
- [ ] *(sebagian: baris tabel 40px, header tabel 36px, padding konten 16px sudah diterapkan)* Token kepadatan di satu tempat (`--density-*` / default `size`), terapkan ke `main`, `Grid`, `Panel`, `Table`, `Input`, `Button`, `Select`.
- [ ] Hapus `PageHeader` di Dashboard & Settings (Users sudah).
- [ ] Modal & dropdown: `max-h` + scroll internal.
- [ ] Uji di ukuran layar L8; pastikan di < 1024px tidak ada scroll bersarang.
- [ ] Update aturan `AGENTS.md` ("Layout Rules" L1–L8).

### Fase S1b — Multi-bahasa (setelah S1)
- [ ] Sumber terjemahan Laravel (`lang/id`, `lang/en`) dibagikan ke frontend via Inertia.
- [ ] Hook `useTranslation()` / fungsi `t('users.create')` di frontend.
- [ ] Pilihan bahasa per user (Settings → Profile) + middleware locale.
- [ ] Migrasi semua teks UI yang ada (layout, menu, dashboard, auth, settings, users).
- [ ] Format tanggal/angka mengikuti locale (terhubung ke S5).

> **Menunggu perintah pengerjaan.**
