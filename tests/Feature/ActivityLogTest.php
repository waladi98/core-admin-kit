<?php

use App\Enums\Permission;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create(['name' => 'Aaron Admin']);
});

test('creating, updating and deleting a user is recorded with the changed fields but never secrets', function () {
    $this->actingAs($this->admin)->post(route('users.store'), [
        'name' => 'Rina',
        'email' => 'rina@example.com',
        'role' => Role::STAFF,
        'status' => 'active',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);
    $user = User::query()->where('email', 'rina@example.com')->firstOrFail();

    $this->actingAs($this->admin)->put(route('users.update', $user), [
        'name' => 'Rina Wati',
        'email' => 'rina@example.com',
        'role' => Role::STAFF,
        'status' => 'inactive',
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ]);

    $this->actingAs($this->admin)->delete(route('users.destroy', $user));

    $logs = ActivityLog::query()->where('subject_type', $user->getMorphClass())->where('subject_id', $user->id)->orderBy('id')->get();

    expect($logs->pluck('event')->all())->toBe(['created', 'updated', 'deleted'])
        ->and($logs->first()->causer_id)->toBe($this->admin->id)
        ->and($logs[1]->description)->toBe('User updated')
        ->and($logs[1]->properties['changes'])->toEqualCanonicalizing([
            'name' => ['old' => 'Rina', 'new' => 'Rina Wati'],
            'status' => ['old' => 'active', 'new' => 'inactive'],
        ])
        ->and($logs->last()->subject_label)->toBe('Rina Wati');
});

test('role permission changes are recorded', function () {
    $this->actingAs($this->admin)->put(route('roles.update', Role::findByName(Role::STAFF)), [
        'name' => 'staff',
        'permissions' => [Permission::UsersView->value],
    ]);

    $log = ActivityLog::query()->where('event', 'changed')->latest('id')->firstOrFail();

    expect($log->description)->toBe('Role permissions changed')
        ->and($log->properties)->toEqualCanonicalizing(['added' => ['users.view'], 'removed' => []]);
});

test('signing in and out is recorded', function () {
    $user = User::factory()->create();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'password']);
    $this->post(route('logout'));

    expect(ActivityLog::query()->where('causer_id', $user->id)->pluck('event')->all())->toBe(['signed_in', 'signed_out']);
});

test('the activity log page lists entries with filters and needs permission', function () {
    ActivityLog::record('signed_in', 'Signed in', $this->admin, 'Aaron Admin', causer: $this->admin);
    ActivityLog::record('changed', 'Application settings changed', subjectLabel: 'Finance Core', causer: $this->admin);

    $this->actingAs($this->admin)
        ->get(route('activity.index', ['event' => 'changed']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('activity/index')
            ->has('logs.data', 1)
            ->where('logs.data.0.description', 'Application settings changed')
            ->where('logs.data.0.causer.name', 'Aaron Admin')
            ->where('eventCounts.signed_in', 1)
        );

    $this->actingAs(User::factory()->role(Role::MANAGER)->create())->get(route('activity.index'))->assertForbidden();
});

test('the dashboard feed shows real activity and only your own without the activity permission', function () {
    $staff = User::factory()->create(['name' => 'Sari Staff']);
    ActivityLog::record('signed_in', 'Signed in', $staff, 'Sari Staff', causer: $staff);
    ActivityLog::record('signed_in', 'Signed in', $this->admin, 'Aaron Admin', causer: $this->admin);

    $this->actingAs($staff)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->loadDeferredProps('feed', fn (Assert $reload) => $reload
            ->has('activities.today', 1)
            ->where('activities.today.0.title', 'Signed in')
            ->where('activities.today.0.description', 'Sari Staff')
        ));
});

test('entries older than the retention period are pruned', function () {
    $old = ActivityLog::record('signed_in', 'Signed in', causer: $this->admin);
    $old->forceFill(['created_at' => Carbon::now()->subDays(ActivityLog::RETENTION_DAYS + 1)])->save();
    $recent = ActivityLog::record('signed_in', 'Signed in', causer: $this->admin);

    $this->artisan('model:prune', ['--model' => ActivityLog::class])->assertSuccessful();

    $this->assertModelMissing($old);
    $this->assertModelExists($recent);
});
