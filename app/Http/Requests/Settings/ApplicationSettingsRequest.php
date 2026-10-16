<?php

namespace App\Http\Requests\Settings;

use App\Enums\Permission;
use App\Rules\ReadableBrandColor;
use Illuminate\Foundation\Http\FormRequest;

class ApplicationSettingsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can(Permission::SettingsManage->value) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:50'],
            'color' => ['required', 'string', new ReadableBrandColor],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp,svg', 'max:1024'],
            'remove_logo' => ['boolean'],
        ];
    }
}
