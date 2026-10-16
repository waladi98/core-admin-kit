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
