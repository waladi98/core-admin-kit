<?php

namespace App\Enums;

/**
 * Active / inactive status shared by modules made with `php artisan make:module`.
 */
enum RecordStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';

    /**
     * Human-readable label for the status.
     */
    public function label(): string
    {
        return match ($this) {
            self::Active => __('Active'),
            self::Inactive => __('Inactive'),
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $status): array => ['value' => $status->value, 'label' => $status->label()], self::cases());
    }
}
