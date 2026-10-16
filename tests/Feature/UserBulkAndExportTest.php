<?php

use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Aaron Admin', 'email' => 'aaron@example.com']);
});

test('users can be exported as CSV following the current filters and sort', function () {
    User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
    User::factory()->create(['name' => 'Citra Lestari', 'email' => 'citra@example.com']);
    User::factory()->inactive()->create(['name' => 'Dedi Inactive', 'email' => 'dedi@example.com']);

    $response = $this->actingAs($this->admin)->get(route('users.export', ['status' => 'active', 'sort' => '-name', 'search' => 'example.com']));

    $response->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->headers->get('content-disposition'))->toContain('users-');

    $lines = array_values(array_filter(explode("\n", ltrim($response->streamedContent(), "\u{FEFF}"))));

    expect($lines[0])->toBe('Name,Email,Role,Status,Joined')
        ->and(count($lines))->toBe(4)
        ->and($lines[1])->toStartWith('"Citra Lestari"')
        ->and($lines[3])->toStartWith('"Aaron Admin"')
        ->and(implode("\n", $lines))->not->toContain('Dedi');
});

test('users without view permission cannot export', function () {
    $this->actingAs(User::factory()->create())->get(route('users.export'))->assertForbidden();
});

test('selected users can be deactivated and activated in bulk, skipping your own account', function () {
    $users = User::factory()->count(2)->create();
    $ids = [...$users->modelKeys(), $this->admin->id];

    $this->actingAs($this->admin)
        ->from(route('users.index'))
        ->post(route('users.bulk'), ['action' => 'deactivate', 'ids' => $ids])
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('toast.message', '2 users updated.');

    expect($users->fresh()->every(fn (User $user) => $user->status === UserStatus::Inactive))->toBeTrue()
        ->and($this->admin->fresh()->status)->toBe(UserStatus::Active);

    $this->actingAs($this->admin)->post(route('users.bulk'), ['action' => 'activate', 'ids' => $ids]);

    expect($users->fresh()->every(fn (User $user) => $user->status === UserStatus::Active))->toBeTrue();
});

test('selected users can be deleted in bulk, skipping your own account', function () {
    $users = User::factory()->count(3)->create();

    $this->actingAs($this->admin)
        ->post(route('users.bulk'), ['action' => 'delete', 'ids' => [...$users->modelKeys(), $this->admin->id]])
        ->assertSessionHas('toast.message', '3 users updated.');

    expect(User::query()->count())->toBe(1);
    $this->assertModelExists($this->admin);
});

test('bulk actions need the matching permission', function () {
    $manager = User::factory()->role(Role::MANAGER)->create();
    $user = User::factory()->create();

    $this->actingAs($manager)->post(route('users.bulk'), ['action' => 'delete', 'ids' => [$user->id]])->assertForbidden();
    $this->actingAs($manager)->post(route('users.bulk'), ['action' => 'deactivate', 'ids' => [$user->id]])->assertRedirect();

    $this->assertModelExists($user);
    expect($user->fresh()->status)->toBe(UserStatus::Inactive);
});

test('bulk actions validate the action and ids', function () {
    $this->actingAs($this->admin)
        ->post(route('users.bulk'), ['action' => 'promote', 'ids' => []])
        ->assertSessionHasErrors(['action', 'ids']);
});
