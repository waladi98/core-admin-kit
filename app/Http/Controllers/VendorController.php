<?php

namespace App\Http\Controllers;

use App\Enums\VendorCategory;
use App\Enums\VendorStatus;
use App\Http\Requests\QuickVendorRequest;
use App\Http\Requests\UpdateVendorRequest;
use App\Http\Requests\VendorIndexRequest;
use App\Models\ActivityLog;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vendors: the example of a mixed CRUD module.
 *
 * - Quick add and quick edit happen in a modal on the list (store, quickUpdate).
 * - The full form and the detail view are pages (edit/update, show).
 */
class VendorController extends Controller
{
    public function index(VendorIndexRequest $request): Response|RedirectResponse
    {
        Gate::authorize('viewAny', Vendor::class);

        $sort = $request->sort();

        // Search and category apply to both the table and the status tab counts.
        $filtered = $this->filteredQuery($request);

        $statusCounts = (clone $filtered)
            ->toBase()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $vendors = (clone $filtered)
            ->when($request->status(), fn (Builder $query, VendorStatus $status) => $query->where('status', $status))
            ->orderBy(ltrim($sort, '-'), Str::startsWith($sort, '-') ? 'desc' : 'asc')
            ->orderBy('id')
            ->paginate($request->perPage())
            ->withQueryString();

        // A page past the end (e.g. after deleting the last row of the last page) falls back to the last page.
        if ($vendors->isEmpty() && $vendors->currentPage() > 1) {
            return to_route('vendors.index', [...$request->query(), 'page' => $vendors->lastPage()]);
        }

        return Inertia::render('vendors/index', [
            'vendors' => [
                'data' => $vendors->getCollection()->map(fn (Vendor $vendor): array => $this->present($vendor))->all(),
                'currentPage' => $vendors->currentPage(),
                'lastPage' => $vendors->lastPage(),
                'perPage' => $vendors->perPage(),
                'from' => $vendors->firstItem(),
                'to' => $vendors->lastItem(),
                'total' => $vendors->total(),
            ],
            'filters' => [
                'search' => $request->search(),
                'category' => $request->category()?->value,
                'status' => $request->status()?->value,
                'sort' => $sort,
                'perPage' => $request->perPage(),
            ],
            'statusCounts' => [
                'all' => (int) $statusCounts->sum(),
                ...collect(VendorStatus::cases())->mapWithKeys(fn (VendorStatus $status): array => [
                    $status->value => (int) ($statusCounts[$status->value] ?? 0),
                ])->all(),
            ],
            'categoryOptions' => VendorCategory::options(),
        ]);
    }

    /**
     * Quick add from the modal. "Save & complete details" (`continue`) opens the full edit page.
     */
    public function store(QuickVendorRequest $request): RedirectResponse
    {
        $vendor = Vendor::create($request->validated());

        if ($request->boolean('continue')) {
            return to_route('vendors.edit', $vendor)->withToast('success', __(':name was added. Complete the details below.', ['name' => $vendor->name]));
        }

        return back()->withToast('success', __(':name was added.', ['name' => $vendor->name]));
    }

    public function show(Vendor $vendor): Response
    {
        Gate::authorize('view', $vendor);

        return Inertia::render('vendors/show', [
            'vendor' => $this->present($vendor, detailed: true),
            'history' => Inertia::defer(fn (): array => $this->history($vendor)),
        ]);
    }

    public function edit(Vendor $vendor): Response
    {
        Gate::authorize('update', $vendor);

        return Inertia::render('vendors/edit', [
            'vendor' => $this->present($vendor, detailed: true),
            'categoryOptions' => VendorCategory::options(),
            'statusOptions' => array_map(fn (VendorStatus $status): array => ['value' => $status->value, 'label' => $status->label()], VendorStatus::cases()),
        ]);
    }

    /**
     * Full form (edit page). Goes to the detail page afterwards.
     */
    public function update(UpdateVendorRequest $request, Vendor $vendor): RedirectResponse
    {
        $vendor->update($request->validated());

        return to_route('vendors.show', $vendor)->withToast('success', __('Vendor updated.'));
    }

    /**
     * Quick edit from the modal: only the modal fields change; the user stays on the list.
     */
    public function quickUpdate(QuickVendorRequest $request, Vendor $vendor): RedirectResponse
    {
        $vendor->update($request->validated());

        return back()->withToast('success', __('Vendor updated.'));
    }

    /**
     * Switch between active and inactive straight from the table row.
     */
    public function toggleStatus(Vendor $vendor): RedirectResponse
    {
        Gate::authorize('update', $vendor);

        $vendor->update(['status' => $vendor->status === VendorStatus::Active ? VendorStatus::Inactive : VendorStatus::Active]);

        return back()->withToast('success', $vendor->status === VendorStatus::Active
            ? __(':name is active again.', ['name' => $vendor->name])
            : __(':name was deactivated.', ['name' => $vendor->name]));
    }

    public function destroy(Request $request, Vendor $vendor): RedirectResponse
    {
        Gate::authorize('delete', $vendor);

        $vendor->delete();

        $toast = __(':name was deleted.', ['name' => $vendor->name]);

        // Deleting from the detail page cannot go "back" to a page that no longer exists.
        return $request->boolean('from_detail')
            ? to_route('vendors.index')->withToast('success', $toast)
            : back()->withToast('success', $toast);
    }

    /**
     * Vendors matching the search text (name, email, contact or code such as "VND-0007") and category.
     *
     * @return Builder<Vendor>
     */
    private function filteredQuery(VendorIndexRequest $request): Builder
    {
        return Vendor::query()
            ->when($request->search(), fn (Builder $query, string $search) => $query->where(
                fn (Builder $query) => $query
                    ->whereLike('name', "%{$search}%")
                    ->orWhereLike('email', "%{$search}%")
                    ->orWhereLike('contact_person', "%{$search}%")
                    ->when(Vendor::idFromCode($search), fn (Builder $query, int $id) => $query->orWhere('id', $id))
            ))
            ->when($request->category(), fn (Builder $query, VendorCategory $category) => $query->where('category', $category));
    }

    /**
     * Audit trail entries about this vendor, newest first.
     *
     * @return list<array{id: int, event: string, description: string, causer: string|null, createdAt: string}>
     */
    private function history(Vendor $vendor): array
    {
        return ActivityLog::query()
            ->with('causer')
            ->where('subject_type', $vendor->getMorphClass())
            ->where('subject_id', $vendor->getKey())
            ->latest('created_at')
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (ActivityLog $log): array => [
                'id' => $log->id,
                'event' => $log->event,
                'description' => __($log->description),
                'causer' => $log->causer?->name,
                'createdAt' => $log->created_at->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Vendor $vendor, bool $detailed = false): array
    {
        $summary = [
            'id' => $vendor->id,
            'code' => $vendor->code,
            'name' => $vendor->name,
            'category' => $vendor->category->value,
            'categoryLabel' => $vendor->category->label(),
            'email' => $vendor->email,
            'phone' => $vendor->phone,
            'contactPerson' => $vendor->contact_person,
            'creditLimit' => $vendor->credit_limit,
            'status' => $vendor->status->value,
            'statusLabel' => $vendor->status->label(),
            // Quick-added vendors still miss the details that only the full form asks for.
            'isIncomplete' => blank($vendor->bank_account_number) || blank($vendor->tax_number),
            'createdAt' => $vendor->created_at->toIso8601String(),
        ];

        if (! $detailed) {
            return $summary;
        }

        return [
            ...$summary,
            'address' => $vendor->address,
            'taxNumber' => $vendor->tax_number,
            'bankName' => $vendor->bank_name,
            'bankAccountNumber' => $vendor->bank_account_number,
            'paymentTermDays' => $vendor->payment_term_days,
            'notes' => $vendor->notes,
            'updatedAt' => $vendor->updated_at->toIso8601String(),
        ];
    }
}
