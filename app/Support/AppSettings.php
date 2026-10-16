<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

/**
 * Application settings editable from the UI, with defaults from config/branding.php.
 * Values are cached; `set()` clears the cache.
 */
class AppSettings
{
    private const CACHE_KEY = 'app-settings';

    /**
     * @return array<string, string|null>
     */
    public static function all(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, function (): array {
            if (! Schema::hasTable('settings')) {
                return [];
            }

            return DB::table('settings')->pluck('value', 'key')->all();
        });

        return [...config('branding'), ...array_filter($stored, fn (?string $value): bool => $value !== null)];
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        return self::all()[$key] ?? $default;
    }

    /**
     * @param  array<string, string|null>  $values  null removes the setting (back to the default).
     */
    public static function set(array $values): void
    {
        foreach ($values as $key => $value) {
            if ($value === null) {
                DB::table('settings')->where('key', $key)->delete();

                continue;
            }

            DB::table('settings')->updateOrInsert(['key' => $key], ['value' => $value, 'updated_at' => now(), 'created_at' => now()]);
        }

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Values the frontend needs for the brand (sidebar, login page, colors).
     *
     * @return array{name: string, color: string, logoUrl: string|null}
     */
    public static function branding(): array
    {
        $logoPath = self::get('logo_path');

        return [
            'name' => (string) self::get('name'),
            'color' => (string) self::get('color'),
            'logoUrl' => $logoPath ? Storage::disk('public')->url($logoPath) : null,
        ];
    }
}
