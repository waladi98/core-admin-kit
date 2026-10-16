<?php

use App\Models\Role;
use App\Models\User;

test('the install command creates the admin account on an empty database', function () {
    $this->artisan('app:install')->assertSuccessful();

    $admin = User::query()->where('email', 'admin@example.com')->first();

    expect($admin)->not->toBeNull()
        ->and($admin->hasRole(Role::ADMIN))->toBeTrue()
        ->and(Role::query()->pluck('name')->sort()->values()->all())->toBe(['admin', 'manager', 'staff']);
});

test('the install command is safe to run again and keeps the existing app key and users', function () {
    $key = config('app.key');
    $user = User::factory()->create();

    $this->artisan('app:install')->assertSuccessful();
    $this->artisan('app:install')->assertSuccessful();

    expect(config('app.key'))->toBe($key)
        ->and(User::query()->count())->toBe(1)
        ->and(User::query()->where('email', 'admin@example.com')->exists())->toBeFalse();

    $this->assertModelExists($user);
});
