<?php

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Aaron Admin', 'email' => 'aaron@example.com']);
});

test('guests are redirected to the login page', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('users index lists users with pagination and filters', function () {
    User::factory()->count(12)->create();

    $this->actingAs($this->admin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/index')
            ->has('users.data', 10)
            ->where('users.data.0.name', 'Aaron Admin')
            ->where('users.data.0.role', 'admin')
            ->where('users.data.0.roleLabel', 'Admin')
            ->where('users.data.0.status', 'active')
            ->where('users.total', 13)
            ->where('users.lastPage', 2)
            ->where('filters.sort', 'name')
            ->has('roleOptions', 3)
        );
});

test('users index returns the requested page', function () {
    User::factory()->count(12)->create();

    $this->actingAs($this->admin)
        ->get(route('users.index', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 3)
            ->where('users.currentPage', 2)
            ->where('users.from', 11)
        );
});

test('users index searches by name or email', function () {
    User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
    User::factory()->create(['name' => 'Citra', 'email' => 'citra.budi@example.com']);
    User::factory()->create(['name' => 'Dewi', 'email' => 'dewi@example.com']);

    $this->actingAs($this->admin)
        ->get(route('users.index', ['search' => 'budi']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 2)
            ->where('filters.search', 'budi')
        );
});

test('users index filters by role', function () {
    User::factory()->count(2)->role(UserRole::Manager)->create();
    User::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->get(route('users.index', ['role' => 'manager']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('users.data', 2)
            ->where('users.data.0.role', 'manager')
            ->where('filters.role', 'manager')
        );
});

test('users index sorts descending by name', function () {
    User::factory()->create(['name' => 'Zack']);

    $this->actingAs($this->admin)
        ->get(route('users.index', ['sort' => '-name']))
        ->assertInertia(fn (Assert $page) => $page->where('users.data.0.name', 'Zack'));
});

test('users index rejects invalid filters', function () {
    $this->actingAs($this->admin)
        ->get(route('users.index', ['role' => 'owner', 'sort' => 'password']))
        ->assertSessionHasErrors(['role', 'sort']);
});

test('create and edit pages render with options', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->get(route('users.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/create')
            ->has('roleOptions', 3)
            ->has('statusOptions', 2)
        );

    $this->actingAs($this->admin)
        ->get(route('users.edit', $user))
        ->assertInertia(fn (Assert $page) => $page
            ->component('users/edit')
            ->where('user.id', $user->id)
            ->where('user.email', $user->email)
        );
});

test('a user can be created', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Eka Putri',
            'email' => 'eka@example.com',
            'role' => 'manager',
            'status' => 'inactive',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $user = User::where('email', 'eka@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->role)->toBe(UserRole::Manager)
        ->and($user->status)->toBe(UserStatus::Inactive)
        ->and(Hash::check('password', $user->password))->toBeTrue();
});

test('creating a user validates input', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => '',
            'email' => 'aaron@example.com',
            'role' => 'owner',
            'status' => 'banned',
            'password' => 'password',
            'password_confirmation' => 'different',
        ])
        ->assertSessionHasErrors(['name', 'email', 'role', 'status', 'password']);
});

test('a user can be updated without changing the password', function () {
    $user = User::factory()->create(['email' => 'old@example.com']);
    $originalPassword = $user->password;

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), [
            'name' => 'Updated Name',
            'email' => 'old@example.com',
            'role' => 'admin',
            'status' => 'inactive',
            'password' => '',
            'password_confirmation' => '',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('users.index'));

    $user->refresh();

    expect($user->name)->toBe('Updated Name')
        ->and($user->role)->toBe(UserRole::Admin)
        ->and($user->status)->toBe(UserStatus::Inactive)
        ->and($user->password)->toBe($originalPassword);
});

test('updating a user can change the password', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'staff',
            'status' => 'active',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('updating a user rejects an email taken by another user', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => 'aaron@example.com',
            'role' => 'staff',
            'status' => 'active',
        ])
        ->assertSessionHasErrors('email');
});

test('a user can be deleted', function () {
    $user = User::factory()->create();

    $this->actingAs($this->admin)
        ->from(route('users.index'))
        ->delete(route('users.destroy', $user))
        ->assertRedirect(route('users.index'));

    $this->assertModelMissing($user);
});

test('users cannot delete their own account from user management', function () {
    $this->actingAs($this->admin)
        ->delete(route('users.destroy', $this->admin))
        ->assertForbidden();

    $this->assertModelExists($this->admin);
});
