<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('pages share the unread count but load the list only when asked', function () {
    $user = User::factory()->create();
    $user->notify(new AppNotification('Welcome to :app', 'Body', ['app' => 'Finance Core']));
    $this->travel(1)->minute();
    $user->notify(new AppNotification('Second'));

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unreadCount', 2)
            ->missing('notificationItems')
        );

    $version = app(HandleInertiaRequests::class)->version(request());

    $this->actingAs($user)
        ->get(route('dashboard'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) $version,
            'X-Inertia-Partial-Component' => 'dashboard',
            'X-Inertia-Partial-Data' => 'notifications,notificationItems',
        ])
        ->assertJsonCount(2, 'props.notificationItems')
        ->assertJsonPath('props.notificationItems.1.title', 'Welcome to :app')
        ->assertJsonPath('props.notificationItems.1.params.app', 'Finance Core');
});

test('a notification can be marked as read, and so can all of them', function () {
    $user = User::factory()->create();
    $user->notify(new AppNotification('One'));
    $user->notify(new AppNotification('Two'));
    $first = $user->notifications()->first();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('notifications.read', $first->id))
        ->assertRedirect(route('dashboard'));

    expect($first->fresh()->read_at)->not->toBeNull()
        ->and($user->unreadNotifications()->count())->toBe(1);

    $this->actingAs($user)->post(route('notifications.read-all'));

    expect($user->unreadNotifications()->count())->toBe(0);
});

test('users cannot mark notifications of someone else', function () {
    $owner = User::factory()->create();
    $owner->notify(new AppNotification('Private'));

    $this->actingAs(User::factory()->create())
        ->post(route('notifications.read', $owner->notifications()->first()->id))
        ->assertNotFound();

    expect($owner->unreadNotifications()->count())->toBe(1);
});

test('a new user gets a welcome notification', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('users.store'), [
        'name' => 'Rina',
        'email' => 'rina@example.com',
        'role' => Role::STAFF,
        'status' => 'active',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    Notification::assertSentTo(User::query()->where('email', 'rina@example.com')->first(), AppNotification::class, fn (AppNotification $notification) => $notification->title === 'Welcome to :app');
});

test('a user is told when someone else changes their role', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();

    $payload = ['name' => $user->name, 'email' => $user->email, 'status' => 'active'];

    $this->actingAs($admin)->put(route('users.update', $user), [...$payload, 'role' => Role::MANAGER]);
    Notification::assertSentTo($user, AppNotification::class, fn (AppNotification $notification) => $notification->params === ['role' => 'Manager']);

    Notification::fake();
    $this->actingAs($admin)->put(route('users.update', $user), [...$payload, 'role' => Role::MANAGER]);
    Notification::assertNothingSent();
});
