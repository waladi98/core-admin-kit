<?php

use App\Models\User;
use App\Support\Format;
use Illuminate\Support\Carbon;

test('currency is shown in rupiah without decimals, following the language', function () {
    app()->setLocale('id');
    expect(Format::currency(1250000))->toBe("Rp\u{A0}1.250.000");

    app()->setLocale('en');
    expect(Format::currency(1250000))->toBe("IDR\u{A0}1,250,000");
});

test('numbers and percentages follow the language', function () {
    app()->setLocale('id');
    expect(Format::number(1250000.5))->toBe('1.250.000,5')
        ->and(Format::percent(7.5))->toBe('7,5%');

    app()->setLocale('en');
    expect(Format::number(1250000.5))->toBe('1,250,000.5')
        ->and(Format::percent(7.5))->toBe('7.5%');
});

test('dates stored in UTC are shown in the display timezone', function () {
    config(['app.display_timezone' => 'Asia/Jakarta']);
    app()->setLocale('id');

    // 20:30 UTC on 16 Oct is 03:30 on 17 Oct in Jakarta (UTC+7).
    $moment = Carbon::parse('2026-10-16 20:30:00', 'UTC');

    expect(Format::date($moment))->toBe('17 Okt 2026')
        ->and(Format::dateTime($moment))->toBe('17 Okt 2026 03.30');

    app()->setLocale('en');
    expect(Format::dateTime($moment))->toBe('17 Oct 2026 03:30');
});

test('relative times follow the language', function () {
    Carbon::setTestNow(Carbon::parse('2026-10-17 10:00:00', 'UTC'));

    app()->setLocale('id');
    expect(Format::relative(Carbon::parse('2026-10-17 07:00:00', 'UTC')))->toBe('3 jam yang lalu');

    app()->setLocale('en');
    expect(Format::relative(Carbon::parse('2026-10-17 07:00:00', 'UTC')))->toBe('3 hours ago');

    Carbon::setTestNow();
});

test('empty values are shown as a dash', function () {
    expect(Format::currency(null))->toBe('—')
        ->and(Format::number(null))->toBe('—')
        ->and(Format::date(null))->toBe('—')
        ->and(Format::relative(''))->toBe('—');
});

test('the display timezone is shared with the frontend', function () {
    config(['app.display_timezone' => 'Asia/Makassar']);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('timezone', 'Asia/Makassar'));
});
