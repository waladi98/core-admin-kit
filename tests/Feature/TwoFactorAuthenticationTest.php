<?php

use App\Enums\UserStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use PragmaRX\Google2FA\Google2FA;

function userWithTwoFactor(array $attributes = []): User
{
    $user = User::factory()->create($attributes);
    app(EnableTwoFactorAuthentication::class)($user);
    $user->forceFill(['two_factor_confirmed_at' => now()])->save();

    return $user->fresh();
}

function currentCode(User $user): string
{
    return app(Google2FA::class)->getCurrentOtp(decrypt($user->two_factor_secret));
}

test('signing in with two-factor enabled asks for a code first', function () {
    $user = userWithTwoFactor();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('two-factor.login'));

    $this->assertGuest();
    $this->get(route('two-factor.login'))
        ->assertInertia(fn (Assert $page) => $page->component('auth/two-factor-challenge'));
});

test('a valid authenticator code completes the sign in', function () {
    $user = userWithTwoFactor();
    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

    $this->post(route('two-factor.login.store'), ['code' => currentCode($user)])
        ->assertRedirect('/dashboard');

    $this->assertAuthenticatedAs($user);
});

test('a wrong code is rejected', function () {
    $user = userWithTwoFactor();
    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

    $this->post(route('two-factor.login.store'), ['code' => '000000'])
        ->assertSessionHasErrors('code');

    $this->assertGuest();
});

test('a recovery code completes the sign in once', function () {
    $user = userWithTwoFactor();
    $recoveryCode = $user->recoveryCodes()[0];
    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);

    $this->post(route('two-factor.login.store'), ['recovery_code' => $recoveryCode]);

    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->recoveryCodes())->not->toContain($recoveryCode);
});

test('the challenge page needs a pending sign in', function () {
    $this->get(route('two-factor.login'))->assertRedirect(route('login'));
});

test('inactive users are stopped before the challenge', function () {
    $user = userWithTwoFactor(['status' => UserStatus::Inactive]);

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');

    expect(session()->has('login.id'))->toBeFalse();
});

test('the two-factor settings page requires a confirmed password', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('two-factor.show'))
        ->assertRedirect(route('password.confirm'));
});

test('a user can enable, confirm and disable two-factor authentication', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->withSession(['auth.password_confirmed_at' => time()]);

    $this->post(route('two-factor.enable'))->assertRedirect();
    $user->refresh();

    $this->get(route('two-factor.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('state', 'pending')
            ->where('secretKey', decrypt($user->two_factor_secret))
            ->whereType('qrCodeSvg', 'string'));

    $this->post(route('two-factor.confirm'), ['code' => currentCode($user)])->assertRedirect();

    expect($user->fresh()->hasEnabledTwoFactorAuthentication())->toBeTrue();
    $this->get(route('two-factor.show'))
        ->assertInertia(fn (Assert $page) => $page->where('state', 'enabled')->has('recoveryCodes', 8));

    $this->delete(route('two-factor.disable'))->assertRedirect();

    expect($user->fresh()->two_factor_secret)->toBeNull();
});
