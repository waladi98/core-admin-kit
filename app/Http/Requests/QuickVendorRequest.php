<?php

namespace App\Http\Requests;

use App\Enums\VendorCategory;
use App\Models\Vendor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The few fields of the quick add / quick edit modal on the vendors list.
 */
class QuickVendorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Vendor|null $vendor */
        $vendor = $this->route('vendor');

        return $vendor === null
            ? ($this->user()?->can('create', Vendor::class) ?? false)
            : ($this->user()?->can('update', $vendor) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(VendorCategory::class)],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]+$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => __('Use digits, spaces, +, - or brackets only.'),
        ];
    }
}
