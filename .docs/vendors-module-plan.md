# Modul Vendor (contoh CRUD campuran modal + halaman) — Rencana

> Status: **selesai** (V1–V3).

## Tujuan

Modul acuan kedua di samping Users. Users memakai **halaman** untuk tambah/ubah; Vendor menunjukkan pola **campuran**:

| Aksi | Pola | Alasan |
|---|---|---|
| Tambah cepat | **Modal** (nama, email, telepon, kategori) | Data inti sedikit; pengguna tetap di daftar. Tombol kedua "Simpan & lengkapi" lanjut ke halaman detail. |
| Ubah cepat | **Modal** dari aksi baris (field yang sama) | Koreksi kecil tanpa pindah halaman. |
| Ubah lengkap | **Halaman** `/vendors/{id}/edit` (beberapa `FormSection`) | Banyak field, bagian terpisah, `CurrencyInput`, catatan panjang. |
| Detail | **Halaman** `/vendors/{id}` (ringkasan + riwayat aktivitas vendor) | Bisa dibagikan sebagai link, tombol Back browser bekerja. |
| Aktif/nonaktif | Aksi baris langsung (`pendingRowIds`) | Satu klik, tanpa form. |
| Hapus | `useConfirm` | Pola standar. |

Aturan yang akan ditulis di `AGENTS.md` / `guide-new-module.md`: **modal** untuk ≤ 5 field sederhana tanpa upload; **halaman** untuk form panjang/bersection, upload, atau data yang perlu link sendiri.

## Analisis

- Komponen yang sudah ada dan dipakai ulang: `Modal` + `ModalFooter`, `FormField`, `Input`, `Select`, `CurrencyInput`, `Textarea`, `Switch`, `FormSection`, `FormActions sticky`, `DataTable` (+ `mobileCard`, `pendingRowIds`), `FilterTabs`, `Pagination`, `useTableQuery`, `useConfirm`, `withToast`, `LogsActivity`.
- Form di modal memakai `useForm` Inertia: error validasi tampil di modal, modal tertutup hanya saat sukses (`onSuccess`), toast dari server.
- Modal memakai state lokal; satu-satunya pintu lewat URL adalah `/vendors?create=1` (aksi "Add vendor" di command palette).

## Desain data

Tabel `vendors`: `id` (kode `VND-0001` diturunkan dari id, tidak disimpan), `name`, `category` (enum `VendorCategory`: Goods, Services, Logistics, Utilities), `email`, `phone`, `contact_person`, `address`, `tax_number` (NPWP), `bank_name`, `bank_account_number`, `payment_term_days` (default 30), `credit_limit` (bigint rupiah), `notes`, `status` (enum `VendorStatus`: Active, Inactive), timestamps.

- Izin baru: `vendors.view`, `vendors.create`, `vendors.update`, `vendors.delete` (Manager: semua kecuali delete; Staff: view). Admin otomatis.
- Menu: grup baru **Master Data** → "Vendors" (ikon `Building2`), command palette "Add vendor".
- Factory + seeder 25 vendor contoh.

## Fase

- [x] **V1 Backend**: enum, migrasi, model (`LogsActivity`), factory, seeder, policy, izin + `app:sync-permissions`, `VendorController` (index, store, show, edit, update, quick-update, status, destroy), Form Request, route, test Pest.
- [x] **V2 Frontend**: `vendors/index` (tabel + modal tambah/ubah cepat), `vendors/show`, `vendors/edit`, komponen `vendor-quick-form`, tipe TS, menu, terjemahan ID.
- [x] **V3 Dokumen**: aturan modal vs halaman di `AGENTS.md` & `guide-new-module.md`, README, decisions-log; verifikasi penuh; commit.
