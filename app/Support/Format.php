<?php

namespace App\Support;

use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Number;

/**
 * Display formatting for the server side (exports, emails, PDFs, flash messages).
 * Mirrors resources/js/lib/format.ts so both sides show the same values.
 *
 * Uses the current app locale and the display timezone (config app.display_timezone).
 * Requires the PHP intl extension.
 */
class Format
{
    /**
     * "Rp 1.250.000" (id) / "IDR 1,250,000" (en). Whole units, no decimals.
     */
    public static function currency(int|float|null $amount, string $currency = 'IDR'): string
    {
        return $amount === null ? '—' : (string) Number::currency($amount, in: $currency, locale: self::locale(), precision: 0);
    }

    /**
     * Short rupiah for cards and charts: "Rp 3,5 M" (id) / "IDR 3.5B" (en). Below one thousand it equals currency().
     */
    public static function currencyCompact(int|float|null $amount, string $currency = 'IDR'): string
    {
        if ($amount === null) {
            return '—';
        }

        $isIndonesian = self::locale() === 'id';
        $units = $isIndonesian
            ? [1e12 => ' T', 1e9 => ' M', 1e6 => ' jt', 1e3 => ' rb']
            : [1e12 => 'T', 1e9 => 'B', 1e6 => 'M', 1e3 => 'K'];

        foreach ($units as $size => $suffix) {
            if (abs($amount) >= $size) {
                $symbol = $isIndonesian && $currency === 'IDR' ? 'Rp' : $currency;

                return $symbol."\u{A0}".self::number($amount / $size, 1).str_replace(' ', "\u{A0}", $suffix);
            }
        }

        return self::currency($amount, $currency);
    }

    /**
     * "1.250.000" (id) / "1,250,000" (en).
     */
    public static function number(int|float|null $value, int $maxDecimals = 2): string
    {
        return $value === null ? '—' : (string) Number::format($value, maxPrecision: $maxDecimals, locale: self::locale());
    }

    /**
     * Percent where 7.5 means 7.5%: "7,5%" (id) / "7.5%" (en).
     */
    public static function percent(int|float|null $value, int $maxDecimals = 1): string
    {
        return $value === null ? '—' : (string) Number::percentage($value, maxPrecision: $maxDecimals, locale: self::locale());
    }

    /**
     * "17 Okt 2026" (id) / "17 Oct 2026" (en), in the display timezone.
     */
    public static function date(CarbonInterface|string|null $date): string
    {
        return self::inDisplayTimezone($date)?->translatedFormat('j M Y') ?? '—';
    }

    /**
     * "17 Okt 2026 14.30" (id) / "17 Oct 2026 14:30" (en), in the display timezone.
     */
    public static function dateTime(CarbonInterface|string|null $date): string
    {
        $carbon = self::inDisplayTimezone($date);

        return $carbon === null ? '—' : $carbon->translatedFormat(self::locale() === 'id' ? 'j M Y H.i' : 'j M Y H:i');
    }

    /**
     * "3 jam yang lalu" (id) / "3 hours ago" (en).
     */
    public static function relative(CarbonInterface|string|null $date): string
    {
        return self::inDisplayTimezone($date)?->diffForHumans() ?? '—';
    }

    private static function inDisplayTimezone(CarbonInterface|string|null $date): ?CarbonInterface
    {
        if ($date === null || $date === '') {
            return null;
        }

        return Carbon::parse($date)->setTimezone(config('app.display_timezone'))->locale(self::locale());
    }

    private static function locale(): string
    {
        return app()->getLocale();
    }
}
