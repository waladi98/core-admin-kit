<?php

namespace App\Enums;

enum VendorCategory: string
{
    case Goods = 'goods';
    case Services = 'services';
    case Logistics = 'logistics';
    case Utilities = 'utilities';

    /**
     * Human-readable label for the category.
     */
    public function label(): string
    {
        return match ($this) {
            self::Goods => __('Goods'),
            self::Services => __('Services'),
            self::Logistics => __('Logistics'),
            self::Utilities => __('Utilities'),
        };
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(fn (self $category): array => ['value' => $category->value, 'label' => $category->label()], self::cases());
    }
}
