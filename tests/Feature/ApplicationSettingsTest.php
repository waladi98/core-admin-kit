<?php

use App\Models\Role;
use App\Models\User;
use App\Rules\ReadableBrandColor;
use App\Support\AppSettings;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->admin = User::factory()->admin()->create();
});

function applicationPayload(array $overrides = []): array
{
    return ['_method' => 'patch', 'name' => 'Koperasi Maju', 'color' => '#0f766e', ...$overrides];
}

test('branding defaults come from config and are shared with every page', function () {
    $this->actingAs($this->admin)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('branding.name', config('branding.name'))
            ->where('branding.color', config('branding.color'))
            ->where('branding.logoUrl', null)
        );
});

test('administrators can change the name, color and logo', function () {
    $this->actingAs($this->admin)
        ->post(route('application.update'), applicationPayload(['logo' => UploadedFile::fake()->image('logo.png', 64, 64)]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('application.edit'));

    $branding = AppSettings::branding();

    expect($branding['name'])->toBe('Koperasi Maju')
        ->and($branding['color'])->toBe('#0f766e')
        ->and($branding['logoUrl'])->not->toBeNull();

    Storage::disk('public')->assertExists(AppSettings::get('logo_path'));

    $this->actingAs($this->admin)
        ->get(route('users.index'))
        ->assertInertia(fn (Assert $page) => $page->where('branding.name', 'Koperasi Maju'));
});

test('the logo can be removed', function () {
    $this->actingAs($this->admin)->post(route('application.update'), applicationPayload(['logo' => UploadedFile::fake()->image('logo.png')]));
    $path = AppSettings::get('logo_path');

    $this->actingAs($this->admin)->post(route('application.update'), applicationPayload(['remove_logo' => true]));

    Storage::disk('public')->assertMissing($path);
    expect(AppSettings::branding()['logoUrl'])->toBeNull();
});

test('a brand color that makes white text unreadable is rejected', function () {
    $this->actingAs($this->admin)
        ->post(route('application.update'), applicationPayload(['color' => '#fde047']))
        ->assertSessionHasErrors('color');

    $this->actingAs($this->admin)
        ->post(route('application.update'), applicationPayload(['color' => 'blue']))
        ->assertSessionHasErrors('color');

    expect(ReadableBrandColor::contrastWithWhite('#1f2937'))->toBeGreaterThan(4.5)
        ->and(ReadableBrandColor::contrastWithWhite('#fde047'))->toBeLessThan(4.5);
});

test('only people with the settings permission can open or change application settings', function () {
    $manager = User::factory()->role(Role::MANAGER)->create();

    $this->actingAs($manager)->get(route('application.edit'))->assertForbidden();
    $this->actingAs($manager)->post(route('application.update'), applicationPayload())->assertForbidden();

    $this->actingAs($this->admin)->get(route('application.edit'))->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('settings/application')->has('defaults'));
});
