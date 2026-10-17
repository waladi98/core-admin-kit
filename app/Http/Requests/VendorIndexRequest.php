<?php

namespace App\Http\Requests;

use App\Enums\VendorCategory;
use App\Enums\VendorStatus;
use App\Models\Vendor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VendorIndexRequest extends FormRequest
{
    /**
     * Columns the vendors table can be sorted by. Prefix with `-` for descending.
     *
     * @var list<string>
     */
    public const SORTABLE = ['name', 'credit_limit', 'created_at'];

    public const DEFAULT_SORT = 'name';

    /**
     * Allowed page sizes for the "entries per page" select.
     *
     * @var list<int>
     */
    public const PER_PAGE_OPTIONS = [10, 25, 50, 100];

    public const DEFAULT_PER_PAGE = 10;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Vendor::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $sorts = collect(self::SORTABLE)->flatMap(fn (string $column): array => [$column, '-'.$column])->all();

        return [
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', Rule::enum(VendorCategory::class)],
            'status' => ['nullable', 'string', Rule::enum(VendorStatus::class)],
            'per_page' => ['nullable', 'integer', Rule::in(self::PER_PAGE_OPTIONS)],
            'sort' => ['nullable', 'string', Rule::in($sorts)],
        ];
    }

    public function search(): ?string
    {
        $search = trim((string) $this->validated('search'));

        return $search === '' ? null : $search;
    }

    public function category(): ?VendorCategory
    {
        return VendorCategory::tryFrom((string) $this->validated('category'));
    }

    public function status(): ?VendorStatus
    {
        return VendorStatus::tryFrom((string) $this->validated('status'));
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? self::DEFAULT_PER_PAGE);
    }

    public function sort(): string
    {
        return $this->validated('sort') ?? self::DEFAULT_SORT;
    }
}
