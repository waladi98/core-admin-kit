<?php

namespace App\Http\Requests;

use App\Enums\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Bulk action on the selected users table rows.
 */
class BulkUserRequest extends FormRequest
{
    /**
     * @var list<string>
     */
    public const ACTIONS = ['activate', 'deactivate', 'delete'];

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $permission = $this->input('action') === 'delete' ? Permission::UsersDelete : Permission::UsersUpdate;

        return $this->user()?->can($permission->value) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'action' => ['required', 'string', Rule::in(self::ACTIONS)],
            'ids' => ['required', 'array', 'min:1', 'max:500'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }
}
