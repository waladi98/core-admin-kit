<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the appearance settings page is shown to signed-in users', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('appearance.edit'))
        ->assertInertia(fn (Assert $page) => $page->component('settings/appearance'));
});

test('guests are sent to the login page', function () {
    $this->get(route('appearance.edit'))->assertRedirect(route('login'));
});
