<?php

use App\Models\User;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('an unknown page shows the Finance Core 404 page', function () {
    $this->get('/this-page-does-not-exist')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 404)
            ->where('isSignedIn', false)
        );
});

test('the error page follows the signed-in user language', function () {
    $user = User::factory()->create(['locale' => 'id']);

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertForbidden()
        ->assertInertia(fn (Assert $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('isSignedIn', true)
            ->where('locale', 'id')
            ->where('translations.Access denied', 'Akses ditolak')
        );
});

test('server errors show the friendly page only when debug is off', function () {
    Route::middleware('web')->get('/_test/server-error', fn () => throw new RuntimeException('Boom'));

    config(['app.debug' => false]);

    $this->get('/_test/server-error')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 500));

    config(['app.debug' => true]);

    $this->get('/_test/server-error')
        ->assertStatus(500)
        ->assertDontSee('"component":"error"', false);
});

test('maintenance mode shows the friendly 503 page when debug is off', function () {
    config(['app.debug' => false]);
    $this->app->maintenanceMode()->activate([]);

    try {
        $this->get(route('login'))
            ->assertStatus(503)
            ->assertInertia(fn (Assert $page) => $page->component('error')->where('status', 503));
    } finally {
        $this->app->maintenanceMode()->deactivate();
    }
});

test('an expired page sends the user back with a toast instead of an error', function () {
    Route::middleware('web')->post('/_test/expired', fn () => throw new TokenMismatchException);

    $this->from(route('login'))
        ->post('/_test/expired')
        ->assertRedirect(route('login'))
        ->assertSessionHas('toast.type', 'error');
});
