<?php

use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admins see the packages and icons the template uses', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('support.about'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('support/about')
            ->where('packages', fn ($packages) => collect($packages)->firstWhere('name', 'tailwindcss')['version'] !== null
                && collect($packages)->firstWhere('name', 'laravel/framework')['version'] !== null)
            ->where('icons', fn ($icons) => collect($icons)->contains('UserCog') && ! collect($icons)->contains('LucideIcon'))
        );
});

test('only admins may open the about page', function (string $role) {
    $this->actingAs(User::factory()->role($role)->create())
        ->get(route('support.about'))
        ->assertForbidden();
})->with([Role::MANAGER, Role::STAFF]);

test('only admins get the admin marker for the menu', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.permissions', fn ($permissions) => collect($permissions)->contains('role:admin')));

    $this->actingAs(User::factory()->role(Role::MANAGER)->create())
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('auth.permissions', fn ($permissions) => ! collect($permissions)->contains('role:admin')));
});
