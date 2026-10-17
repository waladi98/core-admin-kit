<?php

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('the seeded built-in roles exist and admin has every permission', function () {
    expect(Role::query()->pluck('name')->sort()->values()->all())->toBe(['admin', 'manager', 'staff'])
        ->and(Role::findByName(Role::ADMIN)->permissions->pluck('name')->sort()->values()->all())
        ->toBe(collect(Permission::values())->sort()->values()->all());
});

test('the sync command is safe to run again and keeps permissions set from the UI', function () {
    Role::findByName(Role::STAFF)->givePermissionTo(Permission::UsersView->value);

    $this->artisan('app:sync-permissions')->assertSuccessful();

    expect(Role::findByName(Role::STAFF)->hasPermissionTo(Permission::UsersView->value))->toBeTrue()
        ->and(Role::query()->count())->toBe(3);
});

test('users without permission cannot open user or role management', function () {
    $staff = User::factory()->create();

    $this->actingAs($staff)->get(route('users.index'))->assertForbidden();
    $this->actingAs($staff)->get(route('users.create'))->assertForbidden();
    $this->actingAs($staff)->get(route('roles.index'))->assertForbidden();
});

test('managers can view and create users but cannot delete them', function () {
    $manager = User::factory()->role(Role::MANAGER)->create();
    $target = User::factory()->create();

    $this->actingAs($manager)->get(route('users.index'))->assertOk();
    $this->actingAs($manager)->get(route('users.create'))->assertOk();
    $this->actingAs($manager)->delete(route('users.destroy', $target))->assertForbidden();

    $this->assertModelExists($target);
});

test('the signed-in user permissions are shared with the frontend', function () {
    $manager = User::factory()->role(Role::MANAGER)->create();

    $this->actingAs($manager)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.permissions', fn ($permissions) => collect($permissions)->sort()->values()->all() === ['roles.view', 'users.create', 'users.update', 'users.view'])
        );

    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->has('auth.permissions', count(Permission::cases()) + 1)); // + the role:admin menu marker
});

test('roles index lists roles with user and permission counts', function () {
    User::factory()->count(2)->role(Role::MANAGER)->create();

    $this->actingAs($this->admin)
        ->get(route('roles.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('roles/index')
            ->has('roles', 3)
            ->where('roles.0.name', 'admin')
            ->where('roles.0.permissionsCount', count(Permission::cases()))
            ->where('totalPermissions', count(Permission::cases()))
        );
});

test('a role can be created with permissions and its name is stored as a slug', function () {
    $this->actingAs($this->admin)
        ->post(route('roles.store'), [
            'name' => 'Finance Lead',
            'permissions' => [Permission::UsersView->value, Permission::UsersUpdate->value],
        ])
        ->assertRedirect(route('roles.index'));

    $role = Role::findByName('finance-lead');

    expect($role->permissions->pluck('name')->sort()->values()->all())->toBe(['users.update', 'users.view']);
});

test('creating a role validates the name and permissions', function () {
    $this->actingAs($this->admin)
        ->post(route('roles.store'), ['name' => 'Manager', 'permissions' => ['payroll.approve']])
        ->assertSessionHasErrors(['name', 'permissions.0']);
});

test('changing a role permissions from the UI takes effect for its users', function () {
    $staff = User::factory()->create();

    $this->actingAs($staff)->get(route('users.index'))->assertForbidden();

    $this->actingAs($this->admin)
        ->put(route('roles.update', Role::findByName(Role::STAFF)), [
            'name' => 'Renamed',
            'permissions' => [Permission::UsersView->value],
        ])
        ->assertRedirect(route('roles.index'));

    expect(Role::findByName(Role::STAFF)->name)->toBe('staff');

    $this->actingAs($staff->fresh())->get(route('users.index'))->assertOk();
});

test('the admin role cannot be changed', function () {
    $this->actingAs($this->admin)
        ->put(route('roles.update', Role::findByName(Role::ADMIN)), ['name' => 'admin', 'permissions' => []])
        ->assertForbidden();

    expect(Role::findByName(Role::ADMIN)->permissions)->toHaveCount(count(Permission::cases()));
});

test('built-in roles and roles that still have users cannot be deleted', function () {
    $custom = Role::create(['name' => 'auditor', 'guard_name' => 'web']);
    User::factory()->role('auditor')->create();

    $this->actingAs($this->admin)->delete(route('roles.destroy', Role::findByName(Role::STAFF)))->assertForbidden();
    $this->actingAs($this->admin)
        ->from(route('roles.index'))
        ->delete(route('roles.destroy', $custom))
        ->assertRedirect(route('roles.index'))
        ->assertSessionHas('toast.type', 'error');

    $this->assertModelExists($custom);
});

test('an unused custom role can be deleted', function () {
    $custom = Role::create(['name' => 'auditor', 'guard_name' => 'web']);

    $this->actingAs($this->admin)
        ->from(route('roles.index'))
        ->delete(route('roles.destroy', $custom))
        ->assertRedirect(route('roles.index'));

    $this->assertModelMissing($custom);
});
