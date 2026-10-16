<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('pages share the current locale, the available locales and their translations', function () {
    $user = User::factory()->create(['locale' => 'id']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'id')
            ->where('locales', ['en' => 'English', 'id' => 'Bahasa Indonesia'])
            ->where('translations.Users', 'Pengguna')
        );
});

test('english needs no translation file and falls back to the keys', function () {
    $user = User::factory()->create(['locale' => 'en']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'en')->where('translations', []));
});

test('guests can switch the language for their session', function () {
    $this->from(route('login'))
        ->post(route('locale.update'), ['locale' => 'id'])
        ->assertRedirect(route('login'))
        ->assertSessionHas('locale', 'id');

    $this->get(route('login'))->assertInertia(fn (Assert $page) => $page->where('locale', 'id'));
});

test('switching the language while signed in is saved on the user', function () {
    $user = User::factory()->create(['locale' => 'en']);

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('locale.update'), ['locale' => 'id'])
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->locale)->toBe('id');
});

test('an unsupported language is rejected', function () {
    $this->post(route('locale.update'), ['locale' => 'fr'])->assertSessionHasErrors('locale');
});

test('the language can be changed from the profile settings', function () {
    $user = User::factory()->create(['locale' => null]);

    $this->actingAs($user)
        ->patch(route('profile.update'), ['name' => $user->name, 'email' => $user->email, 'locale' => 'id'])
        ->assertSessionHasNoErrors();

    expect($user->fresh()->locale)->toBe('id');
});

test('validation messages follow the user language', function () {
    $admin = User::factory()->admin()->create(['locale' => 'id']);

    $this->actingAs($admin)
        ->post(route('users.store'), [])
        ->assertSessionHasErrors(['name' => 'Nama wajib diisi.']);
});

test('server-side labels are translated', function () {
    $admin = User::factory()->admin()->create(['locale' => 'id']);

    $this->actingAs($admin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('statusOptions.0.label', 'Aktif')
            ->where('roleOptions.0.label', 'Admin')
        );
});
