# Panduan Membuat Modul CRUD Baru

> Modul acuan: **Users** (`/users`). Salin polanya, ganti nama entitas.
> Contoh di bawah memakai entitas fiktif **Client** (`clients`).

## Ringkasan File

| Lapisan | File acuan (Users) | File baru (Client) |
|---|---|---|
| Enum (opsional) | `app/Enums/UserRole.php` | `app/Enums/ClientType.php` |
| Migration | `database/migrations/*_add_role_and_status_to_users_table.php` | `php artisan make:migration create_clients_table` |
| Model + Factory | `app/Models/User.php`, `database/factories/UserFactory.php` | `php artisan make:model Client -mf` |
| Request daftar | `app/Http/Requests/UserIndexRequest.php` | `ClientIndexRequest` |
| Request simpan | `StoreUserRequest.php`, `UpdateUserRequest.php` | `StoreClientRequest`, `UpdateClientRequest` |
| Controller | `app/Http/Controllers/UserController.php` | `php artisan make:controller ClientController --resource` |
| Route | `routes/web.php` → `Route::resource('users', …)->except('show')` | `Route::resource('clients', …)` |
| Tipe TS | `resources/js/types/user-management.ts` | `resources/js/types/client.ts` |
| Halaman daftar | `resources/js/pages/users/index.tsx` | `pages/clients/index.tsx` |
| Form bersama | `resources/js/components/admin/user-form.tsx` | `components/admin/client-form.tsx` |
| Halaman tambah/edit | `pages/users/create.tsx`, `pages/users/edit.tsx` | `pages/clients/create.tsx`, `edit.tsx` |
| Menu | `resources/js/config/navigation.ts` | tambah `{ title: 'Clients', icon: Building2, href: '/clients' }` |
| Test | `tests/Feature/UserManagementTest.php` | `tests/Feature/ClientManagementTest.php` |

## Langkah

### 1. Backend

1. **Migration, model, factory** — `php artisan make:model Client -mf --no-interaction`. Kolom status/tipe pakai enum string (lihat `UserRole`) dengan method `label()`. Cast enum di `casts()`. Buat state factory yang berguna (mis. `inactive()`).
2. **`ClientIndexRequest`** — validasi query string tabel:
   - `search` (`nullable|string|max:100`)
   - filter (mis. `type` → `Rule::enum(...)`)
   - `sort` → **wajib whitelist** `Rule::in([...kolom, ...'-kolom'])` karena dipakai di `orderBy` (lihat `UserIndexRequest::SORTABLE`).
   - Helper `search()`, `sort()`, dst. agar controller bersih.
3. **Controller `index`** — pola Users:
   - query `when(search)`, `when(filter)`, `orderBy` dari sort, `paginate(PER_PAGE)->withQueryString()`;
   - jika halaman melewati akhir (`isEmpty() && currentPage() > 1`) → redirect ke `lastPage()`;
   - kirim props camelCase: `{ data, currentPage, lastPage, perPage, from, to, total }`, `filters`, dan opsi dropdown `{ value, label }[]`;
   - ubah model jadi array lewat method `present()` (jangan kirim model mentah).
4. **`store` / `update` / `destroy`** — pakai Form Request, `to_route('clients.index')` setelah simpan, `back()` setelah hapus.
5. **Route** — di dalam grup `auth` di `routes/web.php`.

### 2. Frontend

1. **Tipe** di `types/client.ts` (ikuti `types/user-management.ts`: `Paginated<T>`, props halaman, data form).
2. **Halaman daftar** (`pages/clients/index.tsx`), salin dari `pages/users/index.tsx`:
   - `useTableQuery({ url: route('clients.index'), only: ['clients', 'filters'], initial })`;
   - **tanpa `PageHeader`** (judul cukup dari breadcrumb); `Panel.Header`: ikon + judul, lalu search `Input` (ikon spinner saat `isSearching`), tombol Filter (`Dropdown`) dan tombol utama (mis. **Add client**);
   - `Panel.Toolbar` berisi `FilterTabs` dengan jumlah per status dari server (lihat `statusCounts` di `UserController`);
   - `DataTable` dengan `sort` / `onSortChange` / `isLoading` / `pendingRowIds` / `emptyState`; kolom `sortable` harus sama dengan whitelist backend; set `skeleton` per kolom;
   - `DataTable rowNumberOffset` untuk kolom `#`, badge `shape="pill"`;
   - `Pagination` di footer panel dengan `loadingPage`, `perPage` dan `onPerPageChange` (backend menerima `per_page` dari whitelist);
   - hapus lewat `Modal` + `router.delete(..., { only: ['clients'], preserveState: true, preserveScroll: true })`, id baris dimasukkan ke `pendingRowIds` selama request.
3. **Form** — satu komponen form untuk tambah & edit (lihat `user-form.tsx`): `useForm`, field dikelompokkan dalam `FormSection` + `FormField` (`required`, `hint`, `error`) grid 3 kolom, lalu `FormActions` (Cancel + Save dengan ikon `Check`). Halaman create/edit memberi `title` ke `AdminLayout` dan tidak memakai `PageHeader`.
4. **Persistent layout** di setiap halaman:
   ```tsx
   ClientsIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;
   ```
   Breadcrumb dinamis (mis. nama data di halaman edit): ketik argumen sebagai `ReactElement<Props>` dan baca `page.props` (lihat `pages/users/edit.tsx`).
5. **Menu** — tambahkan di `config/navigation.ts`.

### 3. Test (Pest)

Salin struktur `UserManagementTest.php`, minimal:
- tamu diarahkan ke login;
- daftar + pagination, search, filter, sort, filter tidak valid ditolak, halaman lewat batas diarahkan;
- create & edit render dengan opsi;
- simpan valid, validasi gagal, update, hapus.

Jalankan: `composer test:local` (MySQL `db_pm_v6_testing`).

### 4. Checklist Selesai

- [ ] `vendor/bin/pint --dirty --format agent`
- [ ] `npx tsc --noEmit`, `npx eslint resources/js`, `npm run build`
- [ ] `composer test:local` lolos
- [ ] Uji manual: search, filter, sort, pagination, tambah, edit, hapus (juga dengan DevTools "Slow 3G")
- [ ] Commit satu modul = satu commit
