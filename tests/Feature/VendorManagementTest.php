<?php

use App\Enums\VendorCategory;
use App\Enums\VendorStatus;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('vendors.index'))->assertRedirect(route('login'));
});

test('vendors index lists vendors with status counts and filters', function () {
    Vendor::factory()->count(11)->create(['category' => VendorCategory::Goods]);
    Vendor::factory()->inactive()->create(['name' => 'Zeta Logistik', 'category' => VendorCategory::Logistics]);

    $this->actingAs($this->admin)
        ->get(route('vendors.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('vendors/index')
            ->has('vendors.data', 10)
            ->where('vendors.total', 12)
            ->where('statusCounts', ['all' => 12, 'active' => 11, 'inactive' => 1])
            ->has('categoryOptions', 4)
        );

    $this->actingAs($this->admin)
        ->get(route('vendors.index', ['category' => 'logistics', 'status' => 'inactive']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('vendors.data', 1)
            ->where('vendors.data.0.name', 'Zeta Logistik')
            ->where('vendors.data.0.statusLabel', 'Inactive')
        );
});

test('vendors can be found by name or by their code', function () {
    $vendor = Vendor::factory()->create(['name' => 'Sinar Jaya']);
    Vendor::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('vendors.index', ['search' => 'sinar']))
        ->assertInertia(fn (Assert $page) => $page->has('vendors.data', 1)->where('vendors.data.0.id', $vendor->id));

    $this->actingAs($this->admin)
        ->get(route('vendors.index', ['search' => $vendor->code]))
        ->assertInertia(fn (Assert $page) => $page->has('vendors.data', 1)->where('vendors.data.0.code', $vendor->code));
});

test('quick add from the modal stays on the list', function () {
    $this->actingAs($this->admin)
        ->from(route('vendors.index'))
        ->post(route('vendors.store'), ['name' => 'PT Baru', 'category' => 'services', 'email' => 'halo@baru.test', 'phone' => '0812 3456'])
        ->assertRedirect(route('vendors.index'))
        ->assertSessionHas('toast.type', 'success');

    $vendor = Vendor::sole();
    expect($vendor->name)->toBe('PT Baru')
        ->and($vendor->status)->toBe(VendorStatus::Active)
        ->and($vendor->payment_term_days)->toBe(30);
});

test('save and complete details opens the full edit page', function () {
    $this->actingAs($this->admin)
        ->from(route('vendors.index'))
        ->post(route('vendors.store'), ['name' => 'PT Lengkap', 'category' => 'goods', 'continue' => true])
        ->assertRedirect(route('vendors.edit', Vendor::sole()));
});

test('quick add validates the modal fields', function () {
    $this->actingAs($this->admin)
        ->from(route('vendors.index'))
        ->post(route('vendors.store'), ['name' => '', 'category' => 'unknown', 'email' => 'not-an-email', 'phone' => 'abc'])
        ->assertSessionHasErrors(['name', 'category', 'email', 'phone']);

    expect(Vendor::count())->toBe(0);
});

test('quick edit only changes the modal fields', function () {
    $vendor = Vendor::factory()->create(['tax_number' => '01.234.567.8-901.000', 'credit_limit' => 50_000_000]);

    $this->actingAs($this->admin)
        ->from(route('vendors.index'))
        ->patch(route('vendors.quick-update', $vendor), ['name' => 'Nama Baru', 'category' => 'utilities', 'email' => null, 'phone' => null, 'credit_limit' => 1])
        ->assertRedirect(route('vendors.index'));

    $vendor->refresh();
    expect($vendor->name)->toBe('Nama Baru')
        ->and($vendor->category)->toBe(VendorCategory::Utilities)
        ->and($vendor->credit_limit)->toBe(50_000_000)
        ->and($vendor->tax_number)->toBe('01.234.567.8-901.000');
});

test('the full edit page saves every field and opens the detail page', function () {
    $vendor = Vendor::factory()->minimal()->create();

    $this->actingAs($this->admin)
        ->get(route('vendors.edit', $vendor))
        ->assertInertia(fn (Assert $page) => $page->component('vendors/edit')->where('vendor.isIncomplete', true)->has('statusOptions', 2));

    $this->actingAs($this->admin)
        ->put(route('vendors.update', $vendor), [
            'name' => 'PT Lengkap',
            'category' => 'goods',
            'email' => 'finance@lengkap.test',
            'phone' => '021 555 0101',
            'contact_person' => 'Budi',
            'address' => 'Jl. Sudirman 1, Jakarta',
            'tax_number' => '01.234.567.8-901.000',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'payment_term_days' => 45,
            'credit_limit' => 75_000_000,
            'notes' => 'Kirim invoice sebelum tanggal 25.',
            'status' => 'inactive',
        ])
        ->assertRedirect(route('vendors.show', $vendor));

    $vendor->refresh();
    expect($vendor->credit_limit)->toBe(75_000_000)
        ->and($vendor->status)->toBe(VendorStatus::Inactive)
        ->and($vendor->bank_account_number)->toBe('1234567890');
});

test('the detail page shows the vendor and defers its history', function () {
    $vendor = Vendor::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('vendors.show', $vendor))
        ->assertInertia(fn (Assert $page) => $page
            ->component('vendors/show')
            ->where('vendor.code', $vendor->code)
            ->missing('history')
            ->loadDeferredProps(fn (Assert $reload) => $reload->has('history', 1)->where('history.0.event', 'created'))
        );
});

test('status can be switched from the table row', function () {
    $vendor = Vendor::factory()->create();

    $this->actingAs($this->admin)->from(route('vendors.index'))->patch(route('vendors.toggle-status', $vendor))->assertRedirect(route('vendors.index'));
    expect($vendor->fresh()->status)->toBe(VendorStatus::Inactive);

    $this->actingAs($this->admin)->patch(route('vendors.toggle-status', $vendor));
    expect($vendor->fresh()->status)->toBe(VendorStatus::Active);
});

test('deleting goes back to the list, also from the detail page', function () {
    [$first, $second] = Vendor::factory()->count(2)->create();

    $this->actingAs($this->admin)->from(route('vendors.index'))->delete(route('vendors.destroy', $first))->assertRedirect(route('vendors.index'));
    $this->actingAs($this->admin)->from(route('vendors.show', $second))->delete(route('vendors.destroy', $second), ['from_detail' => true])->assertRedirect(route('vendors.index'));

    expect(Vendor::count())->toBe(0)
        ->and(ActivityLog::where('event', 'deleted')->where('subject_type', (new Vendor)->getMorphClass())->count())->toBe(2);
});

test('managers can add and edit but not delete vendors', function () {
    $manager = User::factory()->role(Role::MANAGER)->create();
    $vendor = Vendor::factory()->create();

    $this->actingAs($manager)->post(route('vendors.store'), ['name' => 'PT Manager', 'category' => 'goods'])->assertRedirect();
    $this->actingAs($manager)->patch(route('vendors.quick-update', $vendor), ['name' => 'Ubah', 'category' => 'goods'])->assertRedirect();
    $this->actingAs($manager)->delete(route('vendors.destroy', $vendor))->assertForbidden();
});

test('staff can only view vendors', function () {
    $staff = User::factory()->role(Role::STAFF)->create();
    $vendor = Vendor::factory()->create();

    $this->actingAs($staff)->get(route('vendors.index'))->assertOk();
    $this->actingAs($staff)->get(route('vendors.show', $vendor))->assertOk();
    $this->actingAs($staff)->get(route('vendors.edit', $vendor))->assertForbidden();
    $this->actingAs($staff)->post(route('vendors.store'), ['name' => 'PT Staff', 'category' => 'goods'])->assertForbidden();
    $this->actingAs($staff)->patch(route('vendors.toggle-status', $vendor))->assertForbidden();
});
