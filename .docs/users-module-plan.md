# Modul Kelola Users — Rencana Implementasi

## Analisis

- Tabel `users` saat ini hanya punya `name`, `email`, `password`, `email_verified_at`; **belum ada kolom `role` dan `status`**.
- `User` model: fillable `name`, `email`, `password`; casts via `casts()`.
- UI core sudah punya `Avatar`, `Badge`, `Button`, `Input`, `Label`, `Dropdown`, `Modal`, `Panel`, `Grid`, `Table`; admin punya `DataTable`, `PageHeader`, `StatusBadge`.
- **Belum ada** primitive `Select` → dibuat di `components/core/`.
- **Update (animasi A1–A4 selesai):** `Pagination` (dengan `loadingPage`) sudah ada di `components/core/pagination.tsx`, jangan dibuat ulang. Gunakan juga `useTableQuery` (search debounce, filter, sort `name|-name`, page), `DataTable` (`sort`/`onSortChange`, `isLoading`, `pendingRowIds`, `emptyState`, kolom `sortable`/`skeleton`) dan `Skeleton`. Lihat `.docs/animation-plan.md` §B2 dan aturan "Motion & Loading States" di `AGENTS.md`.
- Navigasi: `Accounts & Teams` di Main Navigation masih placeholder → tambah entri baru `Users` dengan `href: '/users'`.
- Rute admin berada di grup middleware `auth` di `routes/web.php`.

## Keputusan desain

| Hal | Keputusan |
|---|---|
| Role | Enum `App\Enums\UserRole`: `Admin`, `Manager`, `Staff` (string-backed: `admin`, `manager`, `staff`) |
| Status | Enum `App\Enums\UserStatus`: `Active`, `Inactive` (`active`, `inactive`) |
| Form tambah/edit | Halaman terpisah `users/create` & `users/edit` (pola `settings/profile.tsx`) |
| Password | Wajib saat tambah, opsional saat edit (kosong = tidak diubah) |
| Hapus | `Modal` konfirmasi dari aksi `Dropdown` per baris; user tidak bisa menghapus dirinya sendiri |
| Search/filter | Query string `?search=&role=&page=`, partial reload Inertia dengan `preserveState` + debounce search |
| Pagination | `paginate(10)->withQueryString()`, dikirim sebagai props camelCase |
| Otorisasi | Semua user ter-autentikasi (tanpa policy role) — bisa diperketat nanti |

## Fase

### Fase 1 — Backend data
- [x] Enum `UserRole`, `UserStatus`
- [x] Migration tambah kolom `role` (default `staff`) & `status` (default `active`) ke `users`
- [x] Update `User` model (fillable, casts enum) dan `UserFactory` (+ state `role()`, `admin()`, `inactive()`)

### Fase 2 — Backend modul
- [x] `UserController` (resource: index, create, store, edit, update, destroy) dengan `Inertia::render()`
- [x] `StoreUserRequest`, `UpdateUserRequest`, `UserIndexRequest` (search/role/sort `name|email|created_at`, prefix `-` = desc)
- [x] Named routes `users.*` di grup `auth`
- [x] Pest feature tests: listing, search, filter role, sort, pagination, store/update validasi, destroy, larangan hapus diri sendiri, guest redirect — **belum dijalankan** (PHP lokal tanpa `pdo_sqlite`)

Props index: `users { data[], currentPage, lastPage, perPage, from, to, total }`, `filters { search, role, sort }`, `roleOptions [{value,label}]`. Item user: `id, name, email, avatar, role, roleLabel, status, statusLabel, createdAt`. Create/edit: `roleOptions`, `statusOptions` (+ `user` di edit).

### Fase 3 — Frontend primitives & types
- [x] `components/core/select.tsx` (native select, cva `size`, `options`, `placeholder`, `invalid`), export di `index.ts` — `Pagination` sudah ada
- [x] `types/user-management.ts` (ManagedUser, Paginated<T>, UserFilters, UserIndexProps, UserEditProps, UserFormData)

> Tes dijalankan ke MySQL terpisah: `$env:DB_CONNECTION='mysql'; $env:DB_DATABASE='db_pm_v6_test'; php artisan test --compact tests/Feature/UserManagementTest.php` (jangan ke `db_pm_v6`, `RefreshDatabase` menghapus data). Status: 13/15 lulus, 2 menunggu halaman Fase 4.

### Fase 4 — Frontend halaman
- [x] `pages/users/index.tsx`: `AdminLayout` + `PageHeader` (tombol Tambah) + `Panel` berisi toolbar (search `Input`, filter role `Select`) + `DataTable` (Avatar+nama, email, role `Badge`, status `Badge`, aksi `Dropdown`, sort server via `useTableQuery`) + `Pagination` + `Modal` hapus (`pendingRowIds`)
- [x] `pages/users/create.tsx`, `pages/users/edit.tsx` + komponen form bersama `components/admin/user-form.tsx`
- [x] Menu `Users` (`UserCog`, `/users`) di `config/navigation.ts` (Main Navigation)

Status: tsc, eslint, prettier, `npm run build` OK; `UserManagementTest` 15/15 lulus (MySQL `db_pm_v6_test`).

### Fase 5 — Verifikasi
- [x] `vendor/bin/pint --dirty --format agent`, `php artisan test --compact tests/Feature/UserManagementTest.php`, `npm run build` / tsc

### Fase 6 — Penyempurnaan (S0 roadmap)
- [x] User berstatus `inactive` tidak bisa login (`LoginRequest`) dan sesi aktifnya otomatis keluar (middleware `EnsureUserIsActive` di grup web).
- [x] Halaman tabel yang melewati batas (mis. setelah menghapus baris terakhir di halaman terakhir) diarahkan ke halaman terakhir.
- [x] Test tambahan untuk kedua perilaku di atas.
- [x] Panduan modul baru: `.docs/guide-new-module.md`.
