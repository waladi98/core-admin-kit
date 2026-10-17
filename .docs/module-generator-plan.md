# Rencana: Generator Modul (`php artisan make:module`)

> Status: **selesai** (G1–G5). Panduan pemakaian: Support → Tentang template → Generator.

## Tujuan

Satu perintah membuat modul CRUD lengkap yang langsung jalan dan konsisten dengan acuan **Users** (form di halaman) atau **Vendors** (pola campuran modal + halaman), sehingga developer tinggal menyesuaikan logika bisnis.

```bash
php artisan make:module Client --pattern=mixed \
  --fields="name:string, email:email?, phone:phone?, credit_limit:currency, joined_on:date?, notes:text?" \
  --group="Master Data" --icon=Briefcase
```

Tanpa opsi → ditanya interaktif (Laravel Prompts): nama, pola, field satu per satu, grup menu, ikon.

## Yang dihasilkan

| Lapisan | File |
|---|---|
| Database | migrasi `create_clients_table` (+ kolom `status`), model (`LogsActivity`, casts), factory (+ state `inactive`), seeder 25 data |
| Akses | case `ClientsView/Create/Update/Delete` di `App\Enums\Permission` (label + group), `ClientPolicy` |
| HTTP | `ClientController`, `ClientIndexRequest` (search, filter status, sort, per page), `StoreClientRequest`/`UpdateClientRequest` (atau `QuickClientRequest` untuk pola mixed), route di `routes/modules/clients.php` |
| Frontend | `types/client.ts`, `pages/clients/index.tsx`; pola **page**: `create.tsx`, `edit.tsx`, `components/admin/client-form.tsx`; pola **mixed**: `client-quick-form.tsx`, `edit.tsx`, `show.tsx` |
| Menu | entri di `config/navigation.ts` (grup dipilih/dibuat), aksi "Add client" di `config/commands.ts` |
| Bahasa | teks baru ditambahkan ke `lang/id.json` (nilai sementara = teks Inggris, ditandai di output untuk diterjemahkan) |
| Test | `tests/Feature/ClientManagementTest.php` (akses, daftar, search, filter, simpan, validasi, ubah, hapus) |

## Tipe field

| Tipe | Kolom | Validasi | Input form | Kolom tabel |
|---|---|---|---|---|
| `string` | `string` | `string, max:255` | `Input` | teks (field pertama = judul baris, bisa dicari & di-sort) |
| `text` | `text` | `string, max:2000` | `Textarea` | — (hanya di form/detail) |
| `email` | `string` | `email` | `Input type=email` | teks, ikut dicari |
| `phone` | `string(30)` | regex angka | `Input type=tel` | teks |
| `integer` | `integer` | `integer` | `Input type=number` | angka |
| `currency` | `unsignedBigInteger` | `integer, min:0` | `CurrencyInput` | `formatCurrency`, bisa di-sort |
| `date` | `date` | `date` | `DatePicker` | `formatDate`, bisa di-sort |
| `boolean` | `boolean` | `boolean` | `Switch` | badge Ya/Tidak |
| `select(a,b,c)` | `string` + enum PHP | `Rule::enum` | `Select` | `Badge`, filter di dropdown |

Akhiran `?` = opsional (nullable). Status aktif/nonaktif selalu ada (tab filter).

## Cara mengubah file yang sudah ada

File bersama (`Permission.php`, `navigation.ts`, `commands.ts`) diberi **penanda komentar** (`// @module-generator:cases`, `:labels`, `:groups`, `:quick-actions`); generator menyisipkan baris di penanda itu. Route modul berada di file sendiri yang dimuat otomatis oleh `routes/web.php` (`routes/modules/*.php`), jadi `web.php` tidak diubah tiap modul.

Pengaman: menolak modul yang sudah ada, `--dry-run` menampilkan daftar file tanpa menulis, dan selesai menjalankan Pint + Prettier pada file baru lalu mencetak langkah berikut (`migrate`, terjemahan).

## Fase

- [x] **G1 Inti**: command, parser field & nama (singular/plural, kebab, studly), penanda di file bersama, `routes/modules`, `--dry-run`/`--no-format`.
- [x] **G2 Backend stubs**: migrasi, model, enum select, factory, seeder, policy, request, controller (page & mixed), permission.
- [x] **G3 Frontend stubs**: tipe, index, form page / quick form + show + edit, menu, command palette, terjemahan.
- [x] **G4 Test**: test stub + test untuk generator (membuat modul contoh di direktori sementara dan memeriksa hasil); uji coba: generate modul contoh → `tsc`, `eslint`, `pint`, `composer test:local` lolos → modul contoh dihapus.
- [x] **G5 Dokumen**: `guide-new-module.md` (generator jadi cara utama), `AGENTS.md`, README, decisions-log; commit.
