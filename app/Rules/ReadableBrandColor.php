<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

/**
 * A #rrggbb color that keeps white text readable on top of it (WCAG AA, contrast ≥ 4.5:1),
 * because the brand color is used behind white button and badge text.
 */
class ReadableBrandColor implements ValidationRule
{
    public const MINIMUM_CONTRAST = 4.5;

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! preg_match('/^#[0-9a-fA-F]{6}$/', $value)) {
            $fail(__('Choose a color in the #RRGGBB format.'));

            return;
        }

        if (self::contrastWithWhite($value) < self::MINIMUM_CONTRAST) {
            $fail(__('This color is too light for white text. Choose a darker color.'));
        }
    }

    public static function contrastWithWhite(string $hex): float
    {
        $channels = array_map(function (string $pair): float {
            $value = hexdec($pair) / 255;

            return $value <= 0.03928 ? $value / 12.92 : (($value + 0.055) / 1.055) ** 2.4;
        }, str_split(ltrim($hex, '#'), 2));

        $luminance = 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];

        return round(1.05 / ($luminance + 0.05), 2);
    }
}
