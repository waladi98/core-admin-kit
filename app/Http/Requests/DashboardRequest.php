<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DashboardRequest extends FormRequest
{
    /**
     * Reporting periods available on the dashboard.
     *
     * @var list<string>
     */
    public const PERIODS = ['this_week', 'last_week', 'last_month', 'last_quarter'];

    public const DEFAULT_PERIOD = 'last_week';

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
        return [
            'period' => ['nullable', 'string', Rule::in(self::PERIODS)],
            'trend_period' => ['nullable', 'string', Rule::in(self::PERIODS)],
        ];
    }

    public function period(): string
    {
        return $this->validated('period') ?? self::DEFAULT_PERIOD;
    }

    public function trendPeriod(): string
    {
        return $this->validated('trend_period') ?? self::DEFAULT_PERIOD;
    }
}
