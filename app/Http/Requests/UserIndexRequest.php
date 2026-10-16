<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
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

    public function sort(): string
    {
        return $this->validated('sort') ?? self::DEFAULT_SORT;
    }
}
