# Finance Core — Admin Template & Grid System

> Referensi UI: `.docs/image/dashboard.png`
> Status: **PLANNING (revisi 3, final) — menunggu perintah pengerjaan**

## 0. Keputusan yang Sudah Ditetapkan

| # | Keputusan |
|---|---|
| 1 | Library chart: **Recharts** (dependency baru, disetujui) |
| 2 | Brand: **Finance Core**. Menu dan data **dummy sesuai referensi** |
| 3 | Dark mode: **belum perlu**, hanya light mode |
| 4 | **Tidak memakai shadcn/ui**. Semua komponen UI dibuat sendiri |

---

## 1. Analisa

### 1.1 Kondisi Project

| Aspek | Kondisi |
|---|---|
| Stack | Laravel 12, PHP 8.2, Inertia v2, React 19 + TypeScript, Vite 6 |
| Styling | Tailwind CSS v4 (`@theme` di `resources/css/app.css`) |
| UI saat ini | shadcn/ui di `resources/js/components/ui/` (23 komponen) |
| Pemakaian shadcn | **57 import di 26 file**: layout app, sidebar, header, halaman auth (login, register, dll.), dan halaman settings |
| Helper yang tetap berguna | `clsx`, `tailwind-merge` (`lib/utils.ts → cn()`), `class-variance-authority`, `lucide-react` |
| Headless lib terpasang | `@radix-ui/*` (bawaan shadcn), `@headlessui/react` |

### 1.2 Dampak Keputusan "Tanpa shadcn"

1. **Komponen baru dibuat di folder terpisah** agar tidak bentrok dengan shadcn:
   `resources/js/components/core/` (UI primitif) dan `resources/js/components/admin/` (widget).
2. **Halaman auth dan settings masih memakai shadcn.** Opsi:
   - **A (disarankan):** migrasi bertahap. Dashboard dan layout admin dulu, lalu auth dan settings di fase terakhir, kemudian folder `components/ui/` dan dependency Radix dihapus.
   - **B:** migrasi semuanya sekaligus (lebih lama dan berisiko).
3. **Komponen interaktif** (dropdown, collapsible, tooltip, modal) perlu logika aksesibilitas (focus, keyboard, klik di luar). Opsi:
   - Ditulis sendiri sepenuhnya, dengan hook custom `useClickOutside`, `useDisclosure` dan `useEscapeKey`.
   - Atau memakai `@headlessui/react` yang **sudah terpasang** (bukan shadcn, tanpa style). Tampilannya tetap 100% buatan sendiri.
4. **Dark mode tidak diperlukan.** Token `.dark` dan `appearance` (toggle tema) tidak dipakai pada layout baru. Penghapusannya ikut fase pembersihan.

### 1.3 Bedah Referensi UI

**Sidebar** (lebar sekitar 240px, latar abu muda)
- Logo dan "Finance Core", tombol collapse.
- Search dengan shortcut `⌘K`.
- Grup menu berlabel uppercase. Sub-menu collapsible dengan garis tree dan chevron.
- Footer berisi kartu user (avatar inisial, nama, email, dot online).

**Topbar:** breadcrumb dengan ikon, tombol notifikasi dan settings.

**Page header:** judul sapaan, subjudul, tombol date range ("Last week") dan tombol `⋮`.

**Pola card khas:** `Panel` luar (abu muda, header ikon + judul + aksi) dengan `Panel.Body` putih di dalamnya. Radius sekitar 12px, border tipis, tanpa shadow tebal.

**Widget:**
1. **StatCard ×3:** label, angka besar, delta (hijau/merah) "vs last week", sparkline area.
2. **Trend chart:** total dan delta, bar chart dengan bar aktif gelap, tooltip pill, garis referensi putus-putus, sumbu Y di kanan.
3. **Activity feed:** segmented tab (Today / Yesterday / This week), search, counter, list item dengan ikon berwarna dan waktu.
4. **Data table:** search, filter, `⋮`, kolom sortable, checkbox seleksi, badge prioritas, avatar, status berikon, aksi baris.

### 1.4 Menu Dummy (Diadaptasi ke Konteks Finance)

| Grup | Menu |
|---|---|
| Main Navigation | Overview · Transactions (All / My Queue, Overdue Risk, Escalations) · Clients · Accounts & Teams ▾ · Knowledge Base ▾ · Integrations |
| Analytics & Insights | Compliance · Reports · Cashflow Analytics · Budgeting |
| Support | Feedback · Help & Support · Settings |

> Kalau ingin label persis seperti referensi (Tickets, SLA, CSAT, dan lainnya), cukup ganti isi file konfigurasi menu.

### 1.5 Grid System (12 Kolom)

```
┌──────────────────────────── 12 col ─────────────────────────────┐
│ PageHeader (12)                                                  │
├────────────┬────────────┬────────────┬──────────────────────────┤
│ Stat (3)   │ Stat (3)   │ Stat (3)   │ Activity Feed (3)        │
├────────────┴────────────┴────────────┤ row-span-2               │
│ Trend Chart (9)                      │                          │
├──────────────────────────────────────┴──────────────────────────┤
│ Data Table (12)                                                  │
└──────────────────────────────────────────────────────────────────┘
```

| Breakpoint | Stat | Chart | Feed | Table |
|---|---|---|---|---|
| `< md` | 12 | 12 | 12 | 12 (scroll-x) |
| `md` | 6 / 6 / 12 | 12 | 12 | 12 |
| `xl` | 3 / 3 / 3 | 9 | 3 (row-span-2) | 12 |

API grid yang dibuat sendiri:

```tsx
<Grid>                                       // grid-cols-12 gap-4
  <Grid.Item span={{ base: 12, md: 6, xl: 3 }}>...</Grid.Item>
  <Grid.Item span={{ base: 12, xl: 3 }} rowSpan={{ xl: 2 }}>...</Grid.Item>
</Grid>
```

Mapping `span` ke class Tailwind ditulis statis (lookup object) supaya class tidak terbuang saat build.

---

## 2. Planning & Fase Implementasi

### Fase 1 — Fondasi: Token dan Primitif ✅ SELESAI
- [x] `app.css`: token light-only `surface*`, `line*`, `ink*`, `brand*`, `success|danger|warning|info` (+ `-soft`), `rounded-panel`, `rounded-field`, `shadow-panel`, `shadow-pop`. Nama dibedakan dari token shadcn agar tidak bentrok.
- [x] Install `recharts` (v3.10.1).
- [x] Hook: `useDisclosure`, `useClickOutside`, `useEscapeKey`.
- [x] `components/core/`: `Button`, `IconButton`, `Input` (dengan ikon), `Checkbox`, `Badge`, `Avatar`, `Dropdown` (Headless UI), `Collapsible`, `SegmentedControl`, `Tooltip`, `Breadcrumb`, `Kbd` + `index.ts`.

### Fase 2 — Grid dan Layout Primitif ✅ SELESAI
- [x] `components/core/grid.tsx` (`Grid` dengan `gap` sm/md/lg, `Grid.Item` dengan `span` & `rowSpan` per breakpoint base–2xl).
- [x] `components/core/panel.tsx` (`Panel`, `Panel.Header` dengan icon/actions/trailingIcon, `Panel.Body` dengan padding none/sm/md).
- [x] `components/admin/page-header.tsx`.

### Fase 3 — Shell Admin ✅ SELESAI
- [x] `types/navigation.ts` + `config/navigation.ts`: menu dummy finance (`AdminNavGroup[]`). Menu tanpa `href` = placeholder.
- [x] `components/admin/sidebar/` (`sidebar`, `sidebar-nav`, `sidebar-user`): brand, search `⌘K`/`Ctrl+K`, grup, sub-menu tree, user card (Profile, Log out), collapse ke mode ikon (disimpan di localStorage).
- [x] `components/core/drawer.tsx` (Headless UI Dialog) untuk sidebar mobile.
- [x] `components/admin/topbar.tsx` (tombol menu mobile, breadcrumb, notifikasi, settings).
- [x] `layouts/admin-layout.tsx`, dipakai `pages/dashboard.tsx` (isi masih placeholder Panel).

### Fase 4 — Widget Dashboard ✅ SELESAI
- [x] `types/dashboard.ts` (StatMetric, VolumeTrend, Activity, TransactionRow).
- [x] `StatCard` + `Sparkline` (Recharts `AreaChart`) + `TrendBadge`.
- [x] `TrendChart` (Recharts `BarChart`, bar aktif ikut hover, tooltip pill, `ReferenceLine` putus-putus, sumbu Y kanan).
- [x] `ActivityFeed` (tab periode, search, counter, ikon berwarna per tipe).
- [x] `core/table.tsx` + `DataTable` generik (sort 3 arah, seleksi + indeterminate, aksi baris, empty state).
- [x] `TransactionTable` (search, filter status, menu ⋮) + `PriorityBadge`, `StatusBadge`.
- [x] `PeriodSelect` (dropdown periode).
- [x] Data sementara di `pages/dashboard-sample-data.ts` (dipindah ke controller di Fase 5).

### Fase 5 — Halaman Dashboard ✅ SELESAI (test belum bisa dijalankan)
- [x] `DashboardController` (invokable) + `DashboardRequest` (validasi `period`, `trend_period`). Props: `filters`, `stats`, `volumeTrend` langsung; `activities` (grup `feed`) dan `transactions` (grup `table`) via deferred props.
- [x] `pages/dashboard.tsx` memakai props server, skeleton animasi untuk deferred props, dropdown periode memicu partial reload (`only`). `dashboard-sample-data.ts` dihapus.
- [x] `tests/Feature/DashboardTest.php`: 5 test (guest, akses, deferred props, filter periode, validasi periode).
- [x] Test lolos di MySQL lokal (`composer test:local` → database `db_pm_v6_testing`): 30 test, 122 assertion.

### Fase 6 — Migrasi dan Pembersihan ✅ SELESAI
- [x] Core baru: `Label`, `Modal` + `ModalFooter` (Headless UI). `admin/brand-logo.tsx` dipakai sidebar & auth.
- [x] Halaman auth (login, register, forgot/reset/confirm password, verify email) & settings (profile, password) memakai `components/core`. Tombol submit diberi `type="submit"` eksplisit. Checkbox "Remember me" kini terhubung ke form.
- [x] `auth-simple-layout` bergaya Finance Core (panel card-in-card). `settings/layout` + halaman settings memakai `AdminLayout`.
- [x] `delete-user` memakai `Modal`.
- [x] Fitur appearance/dark mode dicabut: route `settings/appearance`, `initializeTheme()` di `app.tsx`.
- [x] `app.css`: token shadcn & blok `.dark` dihapus, base style memakai token Finance Core.
- [x] Hapus file lama (disetujui user): `components/ui/`, `app-*`, `appearance-*`, `nav-*`, `breadcrumbs`, `heading`, `icon`, `user-info`, `user-menu-content`, hook `use-appearance|use-initials|use-mobile*`, `layouts/app/`, `layouts/app-layout.tsx`, `auth-card-layout`, `auth-split-layout`, `pages/settings/appearance.tsx`, `components.json`. Lalu rapikan `types/index.ts` (`BreadcrumbItem`, `NavItem`, `NavGroup`).
- [x] Uninstall `@radix-ui/*` (13 paket). `tailwindcss-animate` tetap dipakai (Tooltip).

### Fase 7 — QA ✅ SELESAI (kecuali test & cek visual)
- [x] TypeScript 0 error: form type di login/register/reset-password diubah ke `type` alias, cast `mixBlendMode` di `welcome.tsx`.
- [x] Recharts di-lazy-load (`admin/lazy-charts.tsx`) dengan placeholder: chunk dashboard 410 KB → 24 KB.
- [x] Responsif: `Panel.Header` kini wrap (toolbar tabel turun ke baris baru di layar sempit).
- [x] `tsc`, `eslint`, `prettier --check`, `npm run build`, Pint: lolos.
- [x] Test PHP lolos via `composer test:local` (MySQL `db_pm_v6_testing`). CI tetap memakai SQLite in-memory dari `phpunit.xml`.
- [ ] Cek visual di browser (mobile 375px, tablet 768px, desktop 1440px).

---

## 3. Struktur File Target

```
resources/js/
├── config/navigation.ts
├── hooks/  use-disclosure.ts · use-click-outside.ts · use-escape-key.ts
├── components/
│   ├── core/    button · icon-button · input · checkbox · badge · avatar · dropdown
│   │            collapsible · segmented-control · tooltip · breadcrumb · kbd
│   │            grid · panel
│   └── admin/   sidebar/ · topbar · page-header · stat-card · sparkline · trend-chart
│                activity-feed · data-table · priority-badge · status-badge
├── layouts/admin-layout.tsx
└── pages/dashboard.tsx
app/Http/Controllers/DashboardController.php
tests/Feature/DashboardTest.php
```

---

## 4. Keputusan Lanjutan (Final)

| # | Keputusan |
|---|---|
| 1 | Migrasi **opsi A**: dashboard dulu, auth dan settings di Fase 6 |
| 2 | Komponen interaktif memakai **pendekatan hybrid** (lihat §5) |
| 3 | Label menu memakai **konteks finance** seperti di §1.4 |

## 5. Strategi Komponen Interaktif (Hybrid + Wrapper)

**Prinsip:** halaman dan widget **hanya boleh import dari `components/core`**, tidak pernah langsung dari library.

| Jenis komponen | Pendekatan |
|---|---|
| Sederhana: Button, Input, Badge, Avatar, Checkbox, Grid, Panel, Collapsible, SegmentedControl, Kbd, Breadcrumb | **100% buatan sendiri** |
| Kompleks aksesibilitas: Dropdown/Menu, Modal/Dialog, Drawer, Popover, Select/Combobox, Tabs, Tooltip | **`@headlessui/react` di dalam wrapper `core`**. Style 100% milik sendiri |

```tsx
// components/core/dropdown.tsx  ← satu-satunya file yang tahu Headless UI
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
export function Dropdown(...) { ... }   // API & style milik Finance Core

// pemakaian di mana pun
import { Dropdown } from '@/components/core/dropdown';
```

**Alasan dan kemudahan untuk kebutuhan ke depan:**
- **Aksesibilitas siap pakai:** keyboard, focus trap, ARIA, klik di luar dan ESC sudah teruji. Menulisnya sendiri rawan bug.
- **Library bisa diganti dengan mudah:** jika suatu saat Headless UI diganti (atau ditulis sendiri), yang diubah hanya file wrapper, bukan ratusan halaman.
- **API konsisten:** semua komponen punya props seragam (`variant`, `size`, `className`) via `cva`, sehingga mudah dipelajari tim.
- **Mudah diperluas:** kebutuhan baru seperti Combobox, DatePicker, Toast, Command Palette (`⌘K`) dan Form field tinggal ditambah sebagai wrapper baru di `core`, dengan pola yang sama.
- **Tidak ada dependency baru:** `@headlessui/react` sudah terpasang dan tidak membawa CSS.
- **Bisa dibaca sebagai katalog:** `components/core/index.ts` meng-export semua komponen, sehingga menjadi "design system" internal Finance Core.

> **Menunggu perintah pengerjaan.**
