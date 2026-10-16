<?php

use App\Models\ActivityLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('dashboard renders stats and trend immediately and defers the feed and table', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    ActivityLog::record('signed_in', 'Signed in', $user, $user->name, causer: $user);

    $this->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('filters.period', 'last_week')
            ->where('filters.trendPeriod', 'last_week')
            ->has('stats', 3)
            ->has('volumeTrend.points', 7)
            ->missing('activities')
            ->missing('transactions')
            ->loadDeferredProps(['feed', 'table'], fn (Assert $reload) => $reload
                ->has('activities.today', 1)
                ->has('activities.yesterday')
                ->has('activities.this_week')
                ->has('transactions', 4)
                ->where('transactions.0.reference', '#TRX-2319')
            )
        );
});

test('dashboard trend follows the selected trend period', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/dashboard?period=last_month&trend_period=last_quarter')
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.period', 'last_month')
            ->where('filters.trendPeriod', 'last_quarter')
            ->has('volumeTrend.points', 3)
            ->where('volumeTrend.points.0.label', 'Jul')
        );
});

test('dashboard rejects an unknown period', function () {
    $this->actingAs(User::factory()->create());

    $this->get('/dashboard?period=forever')->assertSessionHasErrors('period');
});
