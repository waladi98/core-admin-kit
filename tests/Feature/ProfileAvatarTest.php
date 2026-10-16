<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

function profilePayload(User $user, array $overrides = []): array
{
    return ['_method' => 'patch', 'name' => $user->name, 'email' => $user->email, ...$overrides];
}

test('a profile photo can be uploaded and is exposed as the avatar url', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('me.jpg', 200, 200)]))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    Storage::disk('public')->assertExists($user->avatar_path);
    expect($user->avatar)->toBe(Storage::disk('public')->url($user->avatar_path))
        ->and($user->toArray())->not->toHaveKey('avatar_path');
});

test('uploading a new photo replaces the old file', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('old.jpg')]));
    $oldPath = $user->refresh()->avatar_path;

    $this->actingAs($user)->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('new.png')]));

    Storage::disk('public')->assertMissing($oldPath);
    Storage::disk('public')->assertExists($user->refresh()->avatar_path);
});

test('the photo can be removed', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('me.jpg')]));
    $path = $user->refresh()->avatar_path;

    $this->actingAs($user)->post(route('profile.update'), profilePayload($user, ['remove_avatar' => true]));

    Storage::disk('public')->assertMissing($path);
    expect($user->refresh()->avatar_path)->toBeNull()
        ->and($user->avatar)->toBeNull();
});

test('only images up to 2 MB are accepted', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->create('report.pdf', 100, 'application/pdf')]))
        ->assertSessionHasErrors('avatar');

    $this->actingAs($user)
        ->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('huge.jpg')->size(3000)]))
        ->assertSessionHasErrors('avatar');

    expect($user->refresh()->avatar_path)->toBeNull();
});

test('deleting a user also removes their photo', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post(route('profile.update'), profilePayload($user, ['avatar' => UploadedFile::fake()->image('me.jpg')]));
    $path = $user->refresh()->avatar_path;

    $user->delete();

    Storage::disk('public')->assertMissing($path);
});
