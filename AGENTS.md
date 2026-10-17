<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

## Foundational Context

This application is a Laravel application running on PHP 8.2. Always use the APIs that match the installed major version of each package — do not assume a version.

Before relying on a package's API, confirm its installed version:
- PHP packages: run `composer show --direct` to list direct dependencies with versions, or `composer show <vendor/package>` for a single package.
- JS packages: check `package.json` for the installed versions.

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If a frontend change doesn't show in the UI or you get a "Unable to locate file in Vite manifest" error, run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Use `search-docs` before changes that depend on Laravel ecosystem APIs, behavior, configuration, or version-specific syntax. Skip it for copy-only edits and other changes where package documentation is irrelevant. Reuse sufficient results already in context instead of searching again.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Project Rules

- This project contains committed, area-grouped rules in `.ai/rules` when that directory exists, including path-scoped framework guidelines under `.ai/rules/boost`. Before you enter plan mode or create/edit any file, you MUST first: open @.ai/rules/index.md (it maps file globs to rule files), read every rule file whose globs cover the path(s) in scope, and run `grep -rin 'keyword' .ai/rules` to catch what a path match alone misses. Do not write code until you have read and are following every matching rule. If `.ai/rules` does not exist, continue without it.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Add or update tests for behavior and logic changes when a test provides meaningful regression coverage.
- Pure copy, styling, and layout-only changes do not require new or updated tests.
- When test coverage applies, run the affected tests and ensure they pass.
- Test the changed behavior and its important failure modes, but do not add tests beyond them.
- Read the `testing-best-practices` skill before writing tests.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v2

- Use all Inertia features from v1 and v2. Check the documentation before making changes to ensure the correct approach.
- New features: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

=== laravel/v12 rules ===

# Laravel 12

- CRITICAL: ALWAYS use `search-docs` tool for version-specific Laravel documentation and updated code examples.
- This project uses the streamlined Laravel 11+ structure: register middleware, exceptions, and routing in `bootstrap/app.php` and service providers in `bootstrap/providers.php`. There is no `app/Http/Kernel.php` or `app/Console/Kernel.php`, and commands in `app/Console/Commands/` auto-register.

## Database

- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.

- Laravel 12 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models

- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

# Pest

- This project uses Pest. Create tests with `php artisan make:test --pest {name}`.
- Do not include the test suite directory in `{name}`. Use `SomeFeatureTest`, not `Feature/SomeFeatureTest`.
- Read the `testing-best-practices` skill for guidance on coverage, naming, structure, dependency isolation, and review.
- Do not delete tests or test files without approval. They are part of the application.

## Running Tests

- Run the narrowest set of tests that covers the change. Pass a file path or `--filter=testName` to `php artisan test --compact`.
- Rerun a test after each change to it.
- Run `vendor/bin/pest` to call the test runner directly. It accepts the same file path and `--filter=testName` arguments.
- After the feature tests pass, ask the user to run the complete suite with `php artisan test --compact`.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>


# Finance Core Admin Template Rules

These rules apply to every admin page and module. Full design reference: `.docs/admin-template-grid-system.md`.

## Workflow

- For any new module or feature, follow this order: (1) analyze, (2) write the plan and implementation phases to `.docs/`, (3) present the plan, (4) wait for an explicit go-ahead before writing code. Then implement one phase at a time and update the phase checklist in the `.docs/` plan.

## UI Consistency

- shadcn/ui and Radix are removed. Never add them back or introduce another UI kit.
- Pages and widgets import UI only from `@/components/core` (primitives) and `@/components/admin` (admin widgets). Never import `@headlessui/react` outside `components/core`; it is used only inside wrappers there (Dropdown, Drawer, Modal).
- Every authenticated admin page uses `AdminLayout` (`@/layouts/admin-layout`) as an Inertia **persistent layout**, never by wrapping JSX inside the page: `Page.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;` (settings pages nest `SettingsLayout` inside). For breadcrumbs that depend on props, type the argument as `ReactElement<PageProps>` and read `page.props`. Wrapping the layout inside the page remounts the sidebar on every navigation.
- Lay out content with `Grid` / `Grid.Item` (12 columns, responsive `span` and `rowSpan`).
- Wrap every content block in `Panel` > `Panel.Header` + `Panel.Body` (the card-in-card pattern). Use `Panel.Body padding="none"` for tables.
- Reuse before creating: `DataTable` for tables (see `components/admin/transaction-table.tsx`), `Badge`, `Avatar`, `Dropdown` for row actions, `Modal` + `ModalFooter` for confirmations (see `components/delete-user.tsx`), and `Label` + `Input` + `InputError` + `Button type="submit"` for forms (see `pages/settings/profile.tsx`).
- `Button` in core defaults to `type="button"`, so form submit buttons must set `type="submit"`.
- Form controls available in `@/components/core`: `Input`, `Textarea`, `Select` (short lists), `Combobox` (searchable/long lists, optional `onSearch` for server search), `Checkbox`, `CheckboxGroup`, `RadioGroup` (`variant="cards"` for few options with descriptions), `Switch` (yes/no settings), `DatePicker` (native picker, ISO `YYYY-MM-DD` value), `CurrencyInput` (shows "Rp 1.250.000", value is a number), `FileUpload` (drag & drop, `variant="avatar"` with preview). Wrap each in `FormField`.
- File uploads: send with `post(url, { forceFormData: true })` and `_method: 'patch'|'put'` in the data; validate on the server (`image`/`mimes`, `max`), store on the `public` disk, expose a URL accessor and delete the file when the record is deleted (see `User::avatar`).
- New primitives (e.g. Select, Pagination) go in `components/core/` using the same conventions (`cva` variants, `cn()`, props `variant`/`size`/`className`) and are exported from `components/core/index.ts`.
- Branding (name, logo, brand color) is editable on Settings → Application (`AppSettings`, `settings` table, defaults in `config/branding.php`) and shared as the `branding` prop; `useBrandColor()` overrides `--color-brand` at runtime. Never hard-code the app name or brand color; use `<BrandLogo>` and `bg-brand`/`text-brand`. Brand colors must keep white text readable (`ReadableBrandColor`).
- Use only Finance Core color tokens: `surface*`, `line*`, `ink*`, `brand*`, `success|danger|warning|info` (+ `-soft`), `rounded-panel`, `rounded-field`, `shadow-panel`, `shadow-pop`. Do not use raw Tailwind palette colors such as `text-gray-500` or `bg-red-50`.
- Light mode only. Do not add `dark:` variants.
- Every scrollable area inside the shell (sidebar, panels, feeds, menus, modals) uses the `scrollbar-thin` utility; add `scroll-fade-y` when content scrolls under fixed edges. Do not style scrollbars per component.
- Charts use Recharts and are loaded through `components/admin/lazy-charts.tsx`.
- Data-loading sections that are deferred show an animated skeleton placeholder.

## New Modules

- Build every new CRUD module by following .docs/guide-new-module.md, using the Users module (/users) as the reference implementation.

## Page Patterns

- **Index (list) pages**: no `PageHeader`; the breadcrumb is the page title. One `<Panel fill>` holds everything (on desktop it fits the screen height so only the table rows scroll; header and pagination stay visible): `Panel.Header` with icon + title on the left and search `Input`, Filter `Dropdown` and the primary action (e.g. "Add user", `buttonVariants({ size: 'sm' })`) on the right; `Panel.Toolbar` with `FilterTabs` (counts from the server) for the main status filter; `Panel.Body padding="none" className="flex flex-col"` with `DataTable stickyHeader` (`rowNumberOffset`, `Badge shape="pill"`, row actions `MoreHorizontal`) and a footer `Pagination` (wrapper `shrink-0`) with `perPage` / `onPerPageChange`. Reference: `resources/js/pages/users/index.tsx`, `.docs/image/index_crud.png`.
- **Tables, extra features** (see Users): `useColumnVisibility(tableKey, columns)` + `<ColumnToggle>` (mark always-visible columns `hideable: false`); `selectable` + `bulkActions={(ids) => …}` for bulk actions posted to a `{module}.bulk` route that skips the current user and checks permissions per row; CSV export through a `{module}.export` route that reuses the index filters (`toQueryParams(table.query)` for the link, `streamDownload` + `lazy()` on the server); `mobileCard={(row) => …}` for a card layout below 768px.
- **Create / edit pages**: pass `title` to `AdminLayout` so the topbar shows a small breadcrumb above the page title; no `PageHeader`. Group fields in `FormSection` (icon, title, description) with `FormField` (`required`, `hint`, `error`) in a `md:grid-cols-2 xl:grid-cols-3` grid, then `FormActions` below the sections (Cancel as secondary link, submit `Button` with `Check` icon). Reference: `resources/js/components/admin/user-form.tsx`, `.docs/image/create.png`.

## Permissions (spatie/laravel-permission)

- Every permission is a case of `App\Enums\Permission` (`users.view`, `users.create`, …) with `label()` and `group()`. After adding a case run `php artisan app:sync-permissions` (also run by the seeder and the roles migration); never create permissions ad hoc.
- Roles live in the database (`App\Models\Role`, constants `Role::ADMIN|MANAGER|STAFF`) and are managed on the Roles & Permissions page (`/roles`). Admin passes every check via `Gate::before` and cannot be edited; built-in roles cannot be renamed or deleted.
- Backend: one Policy per model calling `$user->can(Permission::X->value)`; controllers call `Gate::authorize(...)`, Form Requests `authorize()` with `$this->user()->can(...)`. Rules that must hold even for admins (e.g. not deleting yourself) are enforced in the controller.
- Frontend: `auth.permissions` is shared by `HandleInertiaRequests`. Hide what the user cannot use with `useCan('users.create')`, `usePermissions()` or `<Can permission="…">` (`@/components/admin/can`); add `permission` to entries in `config/navigation.ts`. The UI only hides things — the server always enforces.
- Passwords: always validate with `Password::defaults()` (stricter in production, set in `AppServiceProvider`). Sensitive account actions (signing out other devices, deleting the account) require `current_password`.
- Tests: users get the `staff` role by default; use `User::factory()->admin()` or `->role(Role::MANAGER)`.

## Translations (Indonesian & English)

- Write every UI text in English and translate it; add the Indonesian text to `lang/id.json` (keys are the English texts, English needs no file). Placeholders use `:name`.
- Backend: `__('Text')` for labels and messages sent to the frontend (enum `label()`, abort messages, flash messages). Validation messages come from `lang/id/validation.php`; add new attribute names to its `attributes` array.
- Frontend: inside components use `const { t } = useTranslation()`; helper code rendered under `AdminLayout` may use `__()` from `@/lib/i18n`. Auth pages (layout inside the page) must use `t()`.
- Core components translate string props themselves: `Breadcrumb` titles, `Panel.Header` title, `FormSection` title/description, `FormField` label/hint, `Modal` title/description, `DataTable` header/emptyMessage, `FilterTabs` labels, sidebar menu (`config/navigation.ts`), topbar `title` (+ `titleParams` for `:placeholders`). Pass English strings to them; do not pre-translate.
- Show money, numbers, percents and dates with `@/lib/format` (`formatCurrency`, `formatNumber`, `formatCompact`, `formatPercent`, `formatDate`, `formatDateTime`, `formatRelative`) on the frontend and `App\Support\Format` on the server (exports, emails, messages). Never call `Intl`/`number_format`/`date()` directly or hard-code `'en-US'`. Dates are stored in UTC (`APP_TIMEZONE`) and displayed in `APP_DISPLAY_TIMEZONE` (default Asia/Jakarta); send dates to the frontend as ISO strings.
- The user's language is stored in `users.locale` (switcher in the user menu, auth pages and Settings → Profile); guests use the session; default is `APP_LOCALE`.

## Feedback: Toasts & Confirmations

- After every create/update/delete, redirect with `->withToast('success'|'error'|'warning'|'info', __('…'))` (macro in `AppServiceProvider`). The `flash` shared prop is `Inertia::always`, so toasts also arrive after partial reloads; `FlashToasts` in the layouts shows them. Do not render inline "Saved" texts.
- Expected business-rule failures (e.g. a role still in use) return `back()->withToast('error', …)` instead of aborting; use `abort(403)` only for authorization.
- Client-only messages: `const toast = useToast(); toast.success(t('…'))`.
- Destructive actions ask first with `const confirm = useConfirm(); if (await confirm({ title, description, confirmLabel, tone: 'danger' })) { … }` (English texts; the dialog translates them). Use a custom `Modal` only when the dialog needs inputs (e.g. password confirmation in `delete-user.tsx`).

## Errors

- HTTP errors render `resources/js/pages/error.tsx` via `$exceptions->respond()` in `bootstrap/app.php`: 403/404 always, 500/503 only when `APP_DEBUG=false` (so local debugging keeps Laravel's error screen). 419 (expired page) goes back with an error toast. Do not add Blade error views.
- The error page is standalone (a 404 can happen before the web middleware runs); the handler passes `locale` and `translations` itself.
- React rendering errors: `AdminLayout` wraps each page in `ErrorBoundary` (reset on navigation); wrap risky widgets (charts, embeds) in `<ErrorBoundary>` from `@/components/admin/error-boundary` so one failure does not blank the page.

## Command Palette & Notifications

- The command palette (⌘K / Ctrl+K, sidebar search) lists every permitted page from `config/navigation.ts` plus `config/commands.ts` quick actions. Add each new module's "create" action to `quickActions` with its `permission`.
- In-app notifications: `$user->notify(new AppNotification($title, $body, $params, url: ..., tone: 'info'|'success'|'warning'|'danger'))`. Title/body are English keys with `:placeholders` (add them to `lang/id.json`); pass untranslated values in `$params` (they are translated for the reader). The bell shows the unread count (polled every minute) and loads the list only when opened (`notificationItems` optional prop).

## Audit Trail

- Add `use LogsActivity;` (`App\Concerns`) to every business model: created/updated/deleted are recorded with changed fields (hidden attributes and `$activityIgnored` are skipped). Override `activityLabel()` when the record name is not `name`/`title`.
- Record other important actions with `ActivityLog::record($event, 'English description', $subject, $label, $properties)` (e.g. approvals, permission changes, settings) and add the description to `lang/id.json`.
- Bulk updates must save models one by one (not `Model::query()->update()`) so every change is recorded.
- Code that runs before the `activity_logs` table exists (old migrations) wraps writes in `ActivityLog::withoutRecording()`.
- The Activity log page needs `activity.view`; without it the dashboard feed only shows the user's own actions. Entries older than `ActivityLog::RETENTION_DAYS` are pruned daily (`model:prune`, needs the scheduler: `php artisan schedule:work` locally, a cron entry in production).

## Account Security

- Laravel Fortify is installed for two-factor authentication only (`config/fortify.php`). Its routes are ignored (`Fortify::ignoreRoutes()`); the 2FA endpoints are registered by hand in `routes/settings.php` and `routes/auth.php`. Do not enable other Fortify features: sign-in, registration and password reset stay in our own controllers.
- `LoginRequest::authenticate()` returns `true` when the two-factor challenge is still needed; checks for blocked/inactive users must run before that point.
- Pages that show secrets (2FA setup, recovery codes) sit behind the `password.confirm` middleware.

## Navigation

- Add sidebar menu entries in `resources/js/config/navigation.ts` (type `AdminNavGroup[]`). Entries without `href` are placeholders.
- The component catalog at `/ui` (`resources/js/pages/ui.tsx`, local environment only) shows every core component; add new core components there. It is developer-only and stays in English.
- Setup & commands for humans are in `README.md` (`composer setup`, `app:install`, `app:sync-permissions`, deploy steps).

## Backend

- Each module uses a controller with `Inertia::render()`, a Form Request for validation, named routes inside the `auth` middleware group, and Pest feature tests (including deferred props via `loadDeferredProps` when used).
- Send props with the same camelCase keys as the TypeScript types in `resources/js/types/`.
- Local tests: this machine has no SQLite PHP extension. Run tests with `composer test:local`, which points at the separate MySQL database `db_pm_v6_testing`. For a single file: set `DB_CONNECTION=mysql` and `DB_DATABASE=db_pm_v6_testing` in the environment, then `php artisan test --compact <path>`. Never run tests against the development database `db_pm_v6`: `RefreshDatabase` wipes it. Do not change the database settings in `phpunit.xml` (CI uses SQLite in-memory).

## Layout Rules (compact, minimal scrolling)

Design target: 1536×864 viewport; must stay comfortable at 1366×768; check 1920×1080, 768×1024 and 390×844.

- L1 Shell: sidebar and topbar stay fixed (sticky); only the page content moves.
- L2 Index pages: `<Panel fill>` + `DataTable stickyHeader` so the table header and pagination stay visible on desktop; below 1024px the page scrolls normally (no nested scrolling on touch screens).
- L3 Forms: fields in `md:grid-cols-2 xl:grid-cols-3`; long create/edit forms end with `<FormActions sticky>` so Save stays visible. Short settings forms put `FormActions` inside the `FormSection`.
- L4 Dashboards fit one desktop viewport: chart heights follow the screen (`h-[clamp(…,calc(100dvh-…),…)]`); long lists scroll inside their panel (`min-h-0 flex-1 overflow-y-auto scrollbar-thin`). A grid item that must not stretch its row uses `xl:[contain:size]`.
- L5 Density comes from the spacing tokens in `app.css` (`h-control`, `h-control-sm`, `h-row`, `h-row-head`, `h-topbar`, `p-page`, `gap-section`). Use them instead of fixed sizes; change density only there. Custom tokens are registered in `cn()` (`lib/utils.ts`) so overrides merge correctly.
- L6 Long content scrolls inside its component: `Modal` body, `Dropdown` menus (`max-h-80`), sidebar, feeds.
- L7 No duplicate titles: no `PageHeader` (removed). Index pages take their title from the breadcrumb; create/edit/settings/dashboard pass `title` to `AdminLayout`. Page-level controls (e.g. a period filter) go in the topbar via `<TopbarActions>` from `@/components/admin/topbar-actions`.
- L8 The page width never jumps: `html` reserves the scrollbar gutter; do not override `scrollbar-gutter` or the `padding-right` rule on `html`.

## Readability (users aged 30–70)

- Text must meet WCAG AA contrast (≥ 4.5:1) on `surface` and `surface-muted`. Use only the text tokens: `ink` (headings, values), `ink-soft` (body), `ink-muted` (descriptions, secondary labels, ≥ 7:1), `ink-subtle` (placeholders, hints, timestamps, icons; ≥ 4.5:1). Never lighten text with opacity (`text-ink/50`, `opacity-60` on text) or with lighter grays; `line*` tokens are for borders only, never for text.
- Minimum text size is 12px (`text-xs`); body and table text 13–14px (`text-[13px]`, `text-sm`). No `text-[9px]`–`text-[11px]`. Only avatar initials may be smaller.
- Important information is never conveyed by color alone: pair status colors with a label or icon.
- Disabled controls may use `opacity-50`; everything readable must stay at full contrast.

## Motion & Loading States

Full reference: `.docs/animation-plan.md`. Never hand-roll pulse blocks, spinners or fade CSS on a page; use these:

- Entrance: `Grid stagger` for page grids, `FadeIn` (from `@/components/core`) for content that appears later (e.g. inside `<Deferred>`). Utilities `animate-enter` / `animate-fade` use the `--enter-delay` CSS variable.
- Placeholders: `Skeleton` / `SkeletonText` (core) and the presets `TableSkeleton`, `ListSkeleton`, `ChartSkeleton` (`@/components/admin/skeletons`). Every `<Deferred>` needs a skeleton `fallback` shaped like the real content.
- Partial reloads of a panel: `useReloading(['propName'])` and pass the result to `Panel isLoading` (or a widget's `isLoading`).
- Server-driven tables: use `useTableQuery({ url, only, initial })` with `DataTable` (`sort`, `onSortChange`, `isLoading`, `pendingRowIds`, `emptyState`, column `sortable` and `skeleton`) and core `Pagination` (`loadingPage`). The server reads `search`, `sort` (`name` or `-name` for descending), `page` and filter keys from the query string.
- Row actions in progress (delete, status change): add the row id to `DataTable pendingRowIds` until the request finishes.
- Form submits: `Button type="submit" isLoading={processing}`.
- Page navigation feedback (progress bar, dimmed `<main>`, sidebar spinner) is global via `useNavigationPending` in `AdminLayout`; pages do not add their own.
- Loading indicators appear only after about 200–250 ms. Keep animations between 150 and 400 ms. Never disable the global `prefers-reduced-motion` rule in `app.css`.
