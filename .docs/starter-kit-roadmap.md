# Finance Core — Starter Kit Roadmap

> Status: **dikerjakan berurutan (S0 ✅, UI0 ✅, S1 ✅, S1b ✅, S2 ✅, S3 ✅, S4 ✅, S5 ✅, S11 ✅ — v1.0.0 siap di-tag; v1.x: S6 ✅, S7 ✅, S8 ✅, S9 ✅, S10 ✅, S12 ✅ (dark mode) — semua fase selesai)** — keputusan kecil dicatat di `.docs/decisions-log.md`
> Tujuan: template ini dipakai sebagai titik awal project-project berikutnya, sehingga fitur yang hampir selalu dibutuhkan sudah tersedia dan konsisten.

## 1. Kondisi Saat Ini

| Area | Status |
|---|---|
| Design system (`components/core`) | ✅ tanpa shadcn/Radix (Button, Input, Select, Table, Panel, Grid, Modal, Drawer, Dropdown, FilterTabs, FormSection/FormField, Pagination, Skeleton, dll.) |
| Layout admin, sidebar, grid, Panel | ✅ persistent layout, sidebar rail + flyout, scrollbar tipis |
| Dashboard + chart | ✅ (data dummy) |
| Animasi & loading state | ✅ (`.docs/animation-plan.md`) |
| Keterbacaan (usia 30–70) | ✅ kontras teks WCAG AA, teks min. 12px |
| Auth & settings (profile, password) | ✅ dimigrasi ke Finance Core |
| Modul Users | ✅ modul acuan CRUD (S0), pola index & form sesuai referensi |
| Git | ✅ sudah ada commit, belum ada remote |
| Hak akses per role | ✅ roles & permissions diatur dari UI (spatie) |
| Multi-bahasa | ✅ Indonesia & Inggris, per pengguna |
| Toast / flash message | ✅ `withToast()`, `useToast`, `useConfirm` |
| Search `⌘K` & lonceng notifikasi | ✅ command palette & notifikasi database |
| Halaman error | ✅ 403/404/419/500/503 bergaya Finance Core |

## 2. Prinsip

- Setiap fitur dibuat **generik dan bisa dipakai ulang**, bukan khusus satu modul.
- Mengikuti aturan di `AGENTS.md` (core/admin components, token warna, keterbacaan, layout, loading state, test).
- Setiap fase ditutup dengan: Pint, `tsc`, ESLint, build, `composer test:local`, update `AGENTS.md` bila ada pola baru, dan **satu commit per fase**.
- Dependency baru hanya dengan persetujuan.

## 3. Keputusan (17 Okt 2026)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Hak akses (S1) | **Permission diatur dari UI** dan mudah diubah → `spatie/laravel-permission` + halaman **Roles & Permissions**. Enum `UserRole` diganti role dari database. Dependency disetujui saat S1 dimulai. |
| 2 | Bahasa | **Multi-bahasa** (Indonesia & Inggris), fase fondasi **S1b**. |
| 3 | 2FA (S10) | **Laravel Fortify** (paket resmi, teruji; UI tetap Finance Core). Dependency disetujui saat S10 dimulai. |
| 4 | Syarat `v1.0.0` | **UI0, S1, S1b, S2, S3, S4, S5, S11** (S0 sudah). S6–S10 menyusul di `v1.x`. |
| 5 | Kepadatan UI | **Compact & minim scroll** → fase **UI0**. |
| 6 | Ukuran layar | Acuan desain **1536×864**, minimum nyaman **1366×768**, diuji juga 1920×1080. |

## 4. Urutan Pengerjaan

| Urutan | Fase | Isi singkat | Status | Wajib v1.0.0 |
|---|---|---|---|---|
| 1 | **S0** | Modul Users jadi acuan CRUD | ✅ | ✅ |
| 2 | **UI0** | Layout compact & minim scroll | ✅ | ✅ |
| 3 | **S1** | Hak akses: roles & permissions dari UI | ✅ | ✅ |
| 4 | **S1b** | Multi-bahasa (ID/EN) | ✅ | ✅ |
| 5 | **S2** | Toast, flash message, `useConfirm` | ✅ | ✅ |
| 6 | **S3** | Komponen form lengkap | ✅ | ✅ |
| 7 | **S4** | Halaman error & error boundary | ✅ | ✅ |
| 8 | **S5** | Format Rupiah, tanggal, locale & timezone | ✅ | ✅ |
| 9 | **S11** | Kesiapan starter kit & rilis `v1.0.0` | ✅ (tag menunggu) | ✅ |
| 10 | S6 | Command palette `⌘K` & notifikasi | ✅ | v1.x |
| 11 | S7 | DataTable lanjutan | ✅ | v1.x |
| 12 | S8 | Pengaturan aplikasi & branding | ✅ | v1.x |
| 13 | S9 | Audit log | ✅ | v1.x |
| 14 | S10 | Keamanan akun (2FA, sesi) | ✅ | v1.x |
| 15 | S12 | Opsional: dark mode ✅ (test frontend/Vitest tidak diambil) | ✅ | v1.x |

## 5. Detail Fase

### S0 — Modul Users sebagai acuan CRUD ✅
- [x] Verifikasi (Pint, test, build) dan perbaikan.
- [x] Review konsistensi dengan `AGENTS.md`.
- [x] Panduan modul baru: `.docs/guide-new-module.md`.
- [x] Revisi tampilan index & form sesuai `.docs/image/index_crud.png` dan `create.png`.

### UI0 — Layout Compact & Minim Scroll ✅

**Aturan layout:** *minim scroll, tetap nyaman dan responsif.*

| # | Aturan | Desktop (≥ 1024px) | Tablet / HP (< 1024px) |
|---|---|---|---|
| L1 | Shell setinggi layar | Sidebar & topbar diam; hanya area konten yang bergerak. | Sama, sidebar jadi drawer. |
| L2 | Halaman index pas satu layar | Panel tabel mengisi sisa layar; header tabel & pagination selalu terlihat. | Scroll halaman biasa (tanpa scroll bersarang). |
| L3 | Form tanpa scroll panjang | Grid 3 kolom, section dikelompokkan; tombol Save/Cancel menempel di bawah layar. | 1 kolom; tombol tetap menempel. |
| L4 | Dashboard muat satu layar (1536×864) | Tinggi chart & feed mengikuti layar; feed di-scroll di dalam panel. | Panel bertumpuk. |
| L5 | Kepadatan compact | Padding konten 16px, gap grid 12px, baris tabel 40px, input/tombol 32–36px, teks 13–14px. | Target sentuh min. 32px. |
| L6 | Konten panjang di dalam komponen | Modal, dropdown, sidebar, feed: `max-height` + scroll internal. | Sama. |
| L7 | Tanpa judul ganda | Judul dari breadcrumb / topbar `title`; tanpa `PageHeader`. | Sama. |
| L8 | Target layar | 1536×864 (acuan), 1366×768 (minimum), 1920×1080. | 768×1024, 390×844. |

**Tugas:**
- [x] `Panel fill` + `DataTable stickyHeader`: tabel scroll di dalam panel, pagination selalu terlihat *(diterapkan di /users)*.
- [x] Sebagian kepadatan: baris tabel 40px, header tabel 36px, padding konten 16px.
- [x] Users tanpa `PageHeader`; form memakai `FormSection` + topbar `title`.
- [x] Lebar halaman stabil saat scrollbar muncul (`scrollbar-gutter`), scrollbar tipis.
- [x] Token kepadatan di satu tempat; terapkan ke `Grid` gap, `Input`, `Button`, `Select`.
- [x] `FormActions sticky`: bar tombol menempel di bawah layar.
- [x] Dashboard: hapus `PageHeader`, tinggi chart & feed berbasis tinggi layar, feed scroll internal.
- [x] Settings: hapus `PageHeader`, pakai topbar `title` + `FormSection`.
- [x] Modal & dropdown: `max-h` + scroll internal.
- [ ] Uji manual di browser pada ukuran L8 (belum bisa dilakukan oleh asisten; perlu dicek user).
- [x] `AGENTS.md`: bagian "Layout Rules" L1–L8.

### S1 — Hak Akses: Roles & Permissions dari UI ✅
- [x] Install `spatie/laravel-permission` (persetujuan dependency).
- [x] Daftar permission di satu tempat (mis. `users.view`, `users.create`, `users.update`, `users.delete`, `roles.manage`), disinkronkan lewat seeder/command.
- [x] Migrasi data: enum `UserRole` → role database (Admin, Manager, Staff); kolom `role` lama dihapus setelah data dipindah.
- [x] Policy + `authorize` di controller; middleware permission di route.
- [x] Halaman **Roles & Permissions**: daftar role, tambah/edit role, centang permission per role (dikelompokkan per modul).
- [x] Form Users: pilih role dari database.
- [x] Shared prop `auth.permissions` → hook `useCan('users.create')` + komponen `<Can>`.
- [x] Sidebar: field `permission` di `config/navigation.ts`, menu otomatis tersembunyi.
- [x] Seeder akun admin awal.
- [x] Test: 403, menu tersembunyi, perubahan permission dari UI langsung berlaku.

### S1b — Multi-bahasa (Indonesia & Inggris) ✅
- [x] Terjemahan Laravel (`lang/id`, `lang/en`) dibagikan ke frontend via Inertia.
- [x] Hook `useTranslation()` / `t('users.create')`.
- [x] Pilihan bahasa per user (Settings → Profile) + middleware locale.
- [x] Migrasi semua teks UI yang ada (layout, menu, dashboard, auth, settings, users, roles).
- [x] Format tanggal/angka mengikuti locale (terhubung ke S5).

### S2 — Feedback: Toast, Flash & Konfirmasi ✅
- [x] `core/toast.tsx` + `ToastProvider` (success, error, warning, info; auto-hide; stack).
- [x] Flash message dari Laravel otomatis jadi toast.
- [x] Hook `useConfirm()` → `await confirm({ title, description, tone: 'danger' })`.
- [x] Users & Roles memakai toast & `useConfirm` sebagai contoh.

### S3 — Komponen Form Lengkap ✅
- [x] `Textarea`, `Switch`, `RadioGroup`, `CheckboxGroup` (`FormField` sudah ada).
- [x] `Combobox` (searchable select, Headless UI), `DatePicker`, `FileUpload` (+ preview avatar).
- [x] `CurrencyInput` (format Rupiah).

### S4 — Halaman Error & State Global ✅
- [x] Halaman 403, 404, 419, 500, 503 bergaya Finance Core.
- [x] Halaman maintenance.
- [x] Error boundary React untuk widget yang gagal render.

### S5 — Utilitas Format ✅
- [x] `lib/format.ts`: Rupiah, angka, persen, tanggal & waktu, tanggal relatif (mengikuti locale S1b).
- [x] Timezone `Asia/Jakarta`.
- [x] Helper backend dengan format yang sama.

### S11 — Kesiapan Starter Kit & `v1.0.0` ✅ (tag menunggu user)
- [x] Halaman katalog komponen `/ui` (hanya environment local).
- [x] Bersihkan data dummy dashboard, menu placeholder, halaman `welcome`.
- [x] README: instalasi, database test, ganti brand, membuat modul baru, struktur folder.
- [x] Script `composer setup`: copy `.env`, key, migrate, seed, build.
- [x] Perbaiki CI (`.github/workflows`).
- [ ] Tag `v1.0.0` — dibuat oleh user setelah uji manual di browser.

### v1.x — Setelah Rilis
- **S6** ✅ Command palette `⌘K` (menu & halaman) + notifikasi database di lonceng.
- **S7** ✅ DataTable: aksi massal, export CSV, atur kolom, tampilan kartu di HP.
- **S8** ✅ Pengaturan aplikasi & branding (nama, logo, warna) + halaman Settings → Application.
- **S9** ✅ Audit log + halaman Activity Log; activity feed dashboard memakai data asli.
- **S10** 2FA (Fortify), sesi login aktif, kebijakan password & rate limit.
- **S12** Opsional: dark mode, test frontend (Vitest).

> **Menunggu perintah pengerjaan.**
