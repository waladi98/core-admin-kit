<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use App\Enums\VendorCategory;
use App\Enums\VendorStatus;
use Database\Factories\VendorFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A supplier the company pays. Example module for the mixed modal + page CRUD pattern.
 */
class Vendor extends Model
{
    /** @use HasFactory<VendorFactory> */
    use HasFactory, LogsActivity;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'category',
        'email',
        'phone',
        'contact_person',
        'address',
        'tax_number',
        'bank_name',
        'bank_account_number',
        'payment_term_days',
        'credit_limit',
        'notes',
        'status',
    ];

    /**
     * Reference shown to people, e.g. "VND-0007". Derived from the id, so it never needs to be stored.
     *
     * @return Attribute<string, never>
     */
    protected function code(): Attribute
    {
        return Attribute::get(fn (): string => self::codeFor((int) $this->id));
    }

    public static function codeFor(int $id): string
    {
        return 'VND-'.str_pad((string) $id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * The id inside a code such as "VND-0007" or "vnd-7", or null when the text is not a code.
     */
    public static function idFromCode(string $text): ?int
    {
        return preg_match('/^vnd-?0*(\d+)$/i', trim($text), $matches) ? (int) $matches[1] : null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'category' => VendorCategory::class,
            'status' => VendorStatus::class,
            'payment_term_days' => 'integer',
            'credit_limit' => 'integer',
        ];
    }
}
