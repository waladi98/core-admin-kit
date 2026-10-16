<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

/**
 * Loads the JSON translations shared with the frontend.
 *
 * Keys are the English texts, so English needs no file: missing keys
 * simply show the key itself, both in `__()` and in the frontend `t()`.
 */
class Translations
{
    /**
     * @var array<string, array<string, string>>
     */
    private static array $loaded = [];

    /**
     * @return array<string, string>
     */
    public static function forLocale(string $locale): array
    {
        if (isset(self::$loaded[$locale])) {
            return self::$loaded[$locale];
        }

        $path = lang_path("{$locale}.json");

        return self::$loaded[$locale] = File::exists($path) ? (array) json_decode(File::get($path), true) : [];
    }
}
