<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserIndexRequest extends FormRequest
{
    /**
     * Columns the users table can be sorted by. Prefix with `-` for descending.
     *
     * @var list<string>
     */
    public const SORTABLE = ['name', 'email', 'created_at'];

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
        return true;
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
            'role' => ['nullable', 'string', Rule::enum(UserRole::class)],
            'status' => ['nullable', 'string', Rule::enum(UserStatus::class)],
            'per_page' => ['nullable', 'integer', Rule::in(self::PER_PAGE_OPTIONS)],
            'sort' => ['nullable', 'string', Rule::in($sorts)],
        ];
    }

    public function search(): ?string
    {
        $search = trim((string) $this->validated('search'));

        return $search === '' ? null : $search;
    }

    public function role(): ?UserRole
    {
        return UserRole::tryFrom((string) $this->validated('role'));
    }

    public function status(): ?UserStatus
    {
        return UserStatus::tryFrom((string) $this->validated('status'));
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
