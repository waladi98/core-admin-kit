<?php

use App\Http\Controllers\Settings\SessionController;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Testing\AssertableInertia as Assert;

function addSession(User $user, string $id, string $userAgent): void
{
    DB::table('sessions')->insert([
        'id' => $id,
        'user_id' => $user->id,
        'ip_address' => '10.0.0.5',
        'user_agent' => $userAgent,
        'payload' => base64_encode('a:0:{}'),
        'last_activity' => now()->subMinutes(5)->getTimestamp(),
    ]);
}

test('the sessions page lists where the account is signed in', function () {
    config(['session.driver' => 'database']);
    $user = User::factory()->create();
    addSession($user, 'phone-session', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1');
    addSession(User::factory()->create(), 'someone-else', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36');

    $this->actingAs($user)
        ->get(route('sessions.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/sessions')
            ->where('isSupported', true)
            ->where('sessions', fn ($sessions) => collect($sessions)->pluck('id')->contains('phone-session') && ! collect($sessions)->pluck('id')->contains('someone-else'))
        );
});

test('other devices can be signed out after confirming the password', function () {
    config(['session.driver' => 'database']);
    $user = User::factory()->create();
    addSession($user, 'old-laptop', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Firefox/121.0');
    addSession($user, 'old-phone', 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36');

    $this->actingAs($user)
        ->delete(route('sessions.destroy-others'), ['password' => 'wrong'])
        ->assertSessionHasErrors('password');

    expect(DB::table('sessions')->whereIn('id', ['old-laptop', 'old-phone'])->count())->toBe(2);

    $this->actingAs($user)
        ->from(route('sessions.index'))
        ->delete(route('sessions.destroy-others'), ['password' => 'password'])
        ->assertRedirect(route('sessions.index'))
        ->assertSessionHas('toast.type', 'success');

    expect(DB::table('sessions')->whereIn('id', ['old-laptop', 'old-phone'])->count())->toBe(0);
});

test('user agents are described as browser and platform', function () {
    expect(SessionController::describeAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0'))
        ->toBe(['browser' => 'Edge', 'platform' => 'Windows', 'isMobile' => false])
        ->and(SessionController::describeAgent('Mozilla/5.0 (Linux; Android 14) Chrome/120.0 Mobile Safari/537.36'))
        ->toBe(['browser' => 'Chrome', 'platform' => 'Android', 'isMobile' => true]);
});

test('production requires stronger passwords', function () {
    $this->app['env'] = 'production';

    $rule = Password::default();

    expect(validator(['password' => 'password'], ['password' => [$rule]])->fails())->toBeTrue()
        ->and(validator(['password' => 'Rahasia123'], ['password' => [Password::default()]])->passes())->toBeTrue();

    $this->app['env'] = 'testing';

    expect(validator(['password' => 'password'], ['password' => [Password::default()]])->passes())->toBeTrue();
});
