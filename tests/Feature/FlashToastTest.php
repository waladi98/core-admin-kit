<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('saving a user flashes a success toast that the next page receives', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Rina Wati',
            'email' => 'rina@example.com',
            'role' => 'staff',
            'status' => 'active',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('toast.type', 'success')
        ->assertSessionHas('toast.message', 'User created.');

    $this->actingAs($this->admin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('flash.toast.type', 'success')
            ->where('flash.toast.message', 'User created.')
            ->has('flash.toast.id')
        );
});

test('the toast is included in partial reloads, e.g. after deleting a table row', function () {
    $user = User::factory()->create(['name' => 'Budi']);

    $this->actingAs($this->admin)
        ->from(route('users.index'))
        ->delete(route('users.destroy', $user))
        ->assertSessionHas('toast.message', 'Budi was deleted.');

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->actingAs($this->admin)
        ->get(route('users.index'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) $version,
            'X-Inertia-Partial-Component' => 'users/index',
            'X-Inertia-Partial-Data' => 'users,statusCounts',
        ])
        ->assertOk()
        ->assertJsonPath('props.flash.toast.message', 'Budi was deleted.')
        ->assertJsonMissingPath('props.roleOptions');
});

test('toast messages follow the user language', function () {
    $admin = User::factory()->admin()->create(['locale' => 'id']);
    $user = User::factory()->create();

    $this->actingAs($admin)
        ->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'role' => 'staff',
            'status' => 'active',
        ])
        ->assertSessionHas('toast.message', 'Pengguna berhasil diperbarui.');
});

test('pages without a flashed toast share an empty toast', function () {
    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('flash.toast', null));
});
