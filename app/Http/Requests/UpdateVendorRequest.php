<?php

namespace App\Http\Requests;

use App\Enums\VendorStatus;
use Illuminate\Validation\Rule;

/**
 * Every vendor field, for the full edit page.
 */
class UpdateVendorRequest extends QuickVendorRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'contact_person' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:1000'],
            'tax_number' => ['nullable', 'string', 'max:30'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'bank_account_number' => ['nullable', 'string', 'max:50', 'regex:/^[0-9\-\s]+$/'],
            'payment_term_days' => ['required', 'integer', 'min:0', 'max:365'],
            'credit_limit' => ['required', 'integer', 'min:0', 'max:1000000000000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::enum(VendorStatus::class)],
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
            ...parent::messages(),
            'bank_account_number.regex' => __('Use digits, spaces or - only.'),
        ];
    }
}
