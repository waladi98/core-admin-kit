# Finance Core — Animasi & Loading State

> Status: **SELESAI (A1–A4 + toast)** — sisa: uji manual di browser

## 1. Analisa

### Kondisi saat ini

| Area | Kondisi |
|---|---|
| Progress bar navigasi | Bawaan Inertia (`app.tsx`), warna `#4B5563`, setting default. Tidak ada indikator lain saat pindah halaman. |
| Skeleton | Dibuat ad-hoc: `SkeletonBlock` di `pages/dashboard.tsx` dan `ChartPlaceholder` di `admin/lazy-charts.tsx`. Hanya `animate-pulse`, belum ada komponen core. |
| Animasi masuk komponen | Belum ada. Halaman dan panel muncul langsung tanpa transisi. |
| Partial reload (ganti periode) | Data lama tetap tampil tanpa tanda sedang memuat. |
| Deferred props | Skeleton → konten berganti mendadak, tanpa fade. |
| Tombol | `Button isLoading` sudah ada (spinner). |
| Dependency | `tailwindcss-animate` terpasang. **Tidak perlu library baru.** |

### Prinsip

- Animasi pendek dan halus (150–400 ms), tidak menghalangi interaksi.
- Menghormati `prefers-reduced-motion`: animasi dimatikan untuk user yang memintanya.
- Loading indicator ditunda (±250 ms), supaya pada koneksi cepat tidak ada "kedipan".
- Semua dibuat sebagai komponen atau hook di `core`, supaya modul baru (mis. Users) tinggal pakai.

## 2. Desain per Kebutuhan

### A. Saat komponen dimuat (enter animation)

- Keyframe `fc-enter` di `app.css`: fade + naik 6px.
- Utility class `animate-enter`, dengan delay lewat CSS variable `--enter-delay`.
- `Grid` mendapat prop `stagger`: setiap `Grid.Item` muncul berurutan (jeda ±40 ms per item).
- `AdminLayout`: isi `<main>` diberi animasi masuk setiap kali URL berganti.
- Dropdown, Modal dan Drawer sudah punya transisi (Headless UI); durasinya diseragamkan.

### B. Data sedang dimuat (pending)

- **`core/skeleton.tsx`**: komponen `Skeleton` dengan efek shimmer (kilau bergerak), menggantikan `SkeletonBlock` dan `ChartPlaceholder`.
- **Preset skeleton** di `admin/`: `TableSkeleton`, `ListSkeleton`, `ChartSkeleton`, untuk dipakai ulang di modul lain.
- **Deferred props**: konten yang baru datang di-fade-in (komponen `FadeIn`).
- **Partial reload** (ganti periode, filter, sort, pagination):
  - Hook `useReloading(propNames)` membaca event router Inertia.
  - Panel terkait mendapat prop `isLoading`: isi diredupkan, muncul progress bar tipis di atas body, dan klik ganda dicegah.
- **Tombol submit**: tetap memakai `Button isLoading`. Dicek ulang agar semua form memakainya.

### B2. Load data di tabel (`DataTable`)

| Kondisi | Perilaku |
|---|---|
| **Pertama kali dimuat** (deferred / belum ada data) | `DataTable isLoading` tanpa data: header tetap tampil, body diisi baris skeleton (jumlah = `skeletonRows`, default 5). Lebar skeleton mengikuti kolom, avatar bulat, badge pendek. |
| **Reload** (sort, search, filter, pagination dari server) | Baris lama tetap tampil tapi diredupkan (`opacity-50`), progress bar tipis berjalan di bawah header, klik dinonaktifkan. Ikon sort di kolom yang diklik berubah jadi spinner. |
| **Data baru masuk** | Baris fade-in berurutan (stagger ±20 ms per baris, maksimal 10 baris agar tidak lambat). |
| **Aksi per baris** (hapus, ubah status) | Baris yang diproses diredupkan + spinner di kolom aksi (`pendingRowIds`). Setelah sukses, baris yang dihapus fade-out lalu hilang. |
| **Data kosong / hasil filter kosong** | Empty state (ikon + pesan + tombol reset filter) dengan fade-in. |
| **Pagination** | Tombol halaman yang diklik menampilkan spinner; tombol lain dinonaktifkan sampai selesai. |
| **Search** | Input search diberi debounce (±300 ms) dan ikon search berubah jadi spinner selama request berjalan. |

Props baru `DataTable`: `isLoading`, `skeletonRows`, `pendingRowIds`, `emptyState`.
Hook `useTableQuery()` (dipakai modul Users dkk.): menggabungkan search (debounce), filter, sort dan page menjadi satu `router.get(..., { only, preserveState, preserveScroll, replace })`, lalu mengembalikan `isLoading` untuk `DataTable`.

### C. Pindah halaman saat internet lambat

- **Progress bar Inertia** disesuaikan dengan brand: warna `brand`, `delay: 250`, tanpa spinner bawaan.
- **Hook `useNavigationPending()`** (event `start`/`finish` router, ditunda 250 ms):
  - Konten `<main>` diredupkan dan tidak bisa diklik selama halaman berikutnya dimuat.
  - Menu sidebar yang diklik menampilkan spinner kecil sampai halaman tujuan terbuka.
- **Lebih dari ±8 detik** (opsional): muncul toast kecil "Koneksi lambat, masih memuat…".
- **Prefetch**: sudah aktif di menu sidebar (`Link prefetch`). Diperluas ke link penting lain supaya pindah halaman terasa instan.

## 3. Fase Implementasi

### Fase A1 — Fondasi animasi ✅ SELESAI
- [x] `app.css`: easing `--ease-fc`; keyframe `fc-enter`, `fc-fade`, `fc-shimmer`, `fc-progress`; utility `animate-enter`, `animate-fade`, `animate-shimmer`, `animate-progress` (delay via CSS var `--enter-delay`); blok `prefers-reduced-motion`.
- [x] `core/skeleton.tsx`: `Skeleton` (shape `rect|circle|text`, shimmer) + `SkeletonText` (multi-baris).
- [x] `core/fade-in.tsx`: `FadeIn` (variant `rise|fade`, prop `delay`).
- [x] `Grid` prop `stagger` (`true` = 40 ms per item, atau angka custom; maksimal 10 item berurutan). Dipakai di `pages/dashboard.tsx`.

### Fase A2 — Loading data ✅ SELESAI
- [x] Hook `hooks/use-reloading.ts`: `useReloading(['propName'])` → `true` selama partial reload yang meminta prop tersebut (muncul setelah 200 ms).
- [x] `Panel` prop `isLoading`: isi `Panel.Body` redup + tidak bisa diklik, progress bar tipis berjalan di tepi atas body, `aria-busy`.
- [x] `components/admin/skeletons.tsx`: `TableSkeleton` (rows, columns, hasSelection), `ListSkeleton`, `ChartSkeleton`.
- [x] `lazy-charts.tsx` memakai `Skeleton` / `ChartSkeleton`.
- [x] Dashboard: skeleton ad-hoc diganti preset, feed & tabel fade-in saat deferred props datang, StatCard (`isLoading`) & panel trend redup saat ganti periode.

### Fase A2b — Loading di tabel ✅ SELESAI
- [x] `DataTable`: `isLoading` (tanpa data → baris skeleton sesuai kolom; dengan data → redup + progress bar di bawah header), `skeletonRows`, kolom `skeleton: 'text' | 'avatar' | 'badge'`, `pendingRowIds` (baris redup + spinner di kolom aksi, fade-out saat terhapus), `emptyState` (default ikon + pesan, fade-in), baris fade-in berurutan (20 ms, maks 10).
- [x] `DataTable` mendukung sort dari server: prop `sort` + `onSortChange`, kolom `sortable: true`; ikon sort jadi spinner selama request.
- [x] `types/table.ts` (`TableSort`, `SortDirection`).
- [x] `core/pagination.tsx`: `Pagination` (ringkasan "Showing x–y of z", halaman + ellipsis, `loadingPage` → spinner di tombol yang diklik, tombol lain nonaktif).
- [x] Hook `hooks/use-table-query.ts`: `useTableQuery({ url, only, initial })` → `query` (langsung berubah, tidak menunggu server), `setSearch` (debounce 300 ms), `setFilter`, `setSort`, `setPage`, `reset`, `isLoading`, `isSearching`, `loadingPage`, `hasActiveFilters`. Query string: `?search=&sort=name|-name&page=&<filter>=`.
- [x] `TransactionTable`: prop `isLoading` (dipakai sebagai fallback deferred di dashboard), bentuk skeleton per kolom, empty state + tombol "Reset filters".

### Fase A3 — Navigasi lambat ✅ SELESAI (toast dilewati)
- [x] `app.tsx`: progress bar warna brand `#1f2937`, `delay: 250`, tanpa spinner bawaan.
- [x] Hook `hooks/use-navigation-pending.ts`: `{ isPending, pendingPath }`, hanya untuk navigasi halaman (GET tanpa `only`/`except`); partial reload & submit form tidak terhitung.
- [x] `AdminLayout`: `<main>` redup (60%) + tidak bisa diklik saat navigasi > 250 ms; isi halaman fade-in setiap halaman baru dibuka.
- [x] `SidebarNav`: ikon menu tujuan berubah jadi spinner (menu utama & sub-menu, juga di mode collapse).
- [x] Toast "Slow connection" (`admin/slow-connection-notice.tsx`): muncul di kanan bawah jika navigasi > 8 detik (`useNavigationPending().isSlow`), dengan tombol **Cancel** (`router.cancel()`).

### Fase A4 — QA ✅ SELESAI (kecuali uji manual di browser)
- [x] `tsc`, `eslint`, `prettier --check`, `build`: lolos.
- [x] Aturan `prefers-reduced-motion` terverifikasi ada di CSS hasil build.
- [x] Aturan "Motion & Loading States" ditambahkan ke `AGENTS.md`.
- [x] `users-module-plan.md` diberi catatan: `Pagination` sudah ada, pakai `useTableQuery` & state loading `DataTable`.
- [ ] Uji manual: DevTools → Network → "Slow 3G" (dashboard, ganti periode, filter tabel, pindah halaman, prefetch saat hover tidak meredupkan halaman).
- [ ] Uji manual: DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce".

## 4. Catatan Terhadap Modul Users

`.docs/users-module-plan.md` sudah ada. Disarankan **mengerjakan animasi lebih dulu**, supaya modul Users langsung memakai `Skeleton`, `Panel isLoading`, `useReloading`, `DataTable isLoading` dan `useTableQuery` (tabel dengan pagination, filter dan sort dari server sangat terbantu oleh indikator ini). Komponen `Pagination` di `users-module-plan.md` sebaiknya ikut dibuat dengan state loading per tombol seperti di §B2.

## 5. Pertanyaan

1. Toast "koneksi lambat" (opsional di A3): perlu atau tidak?
2. Urutan: animasi dulu baru modul Users (disarankan), atau sebaliknya?

> **Menunggu perintah pengerjaan.**
