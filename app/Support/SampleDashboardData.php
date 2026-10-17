<?php

namespace App\Support;

/**
 * Sample figures for the dashboard stats, volume chart and transaction table.
 *
 * Everything in this class is placeholder data. When a project has its own domain models,
 * replace the calls in DashboardController and delete this class (see README → "Dashboard contoh").
 */
class SampleDashboardData
{
    /**
     * Multiplier applied to the weekly figures for each reporting period.
     *
     * @var array<string, float>
     */
    private const PERIOD_SCALE = [
        'this_week' => 0.9,
        'last_week' => 1.0,
        'last_month' => 4.2,
        'last_quarter' => 12.6,
    ];

    /**
     * @return list<array{key: string, label: string, value: string, change: float, trend: list<int>}>
     */
    public static function stats(string $period): array
    {
        $scale = self::PERIOD_SCALE[$period];

        return [
            [
                'key' => 'current_balance',
                'label' => __('Current Balance'),
                'value' => Format::currencyCompact(round(3_484_000_000 * $scale)),
                'change' => 7.1,
                'trend' => [12, 18, 14, 22, 16, 24, 19, 21, 17, 20],
            ],
            [
                'key' => 'daily_transactions',
                'label' => __('Daily Avg. Transactions'),
                'value' => Format::number(round(486 * min($scale, 1.1))),
                'change' => 2.0,
                'trend' => [10, 11, 10, 14, 12, 16, 13, 17, 15, 18],
            ],
            [
                'key' => 'compliance_rate',
                'label' => __('Compliance Rate'),
                'value' => Format::percent(92),
                'change' => -1.3,
                'trend' => [18, 14, 16, 12, 17, 13, 15, 19, 14, 12],
            ],
        ];
    }

    /**
     * @return array{total: int, change: float, highlightIndex: int, points: list<array{label: string, value: int}>}
     */
    public static function volumeTrend(string $period): array
    {
        $points = match ($period) {
            'last_month' => ['Week 1' => 2140, 'Week 2' => 2380, 'Week 3' => 1960, 'Week 4' => 2510],
            'last_quarter' => ['Jul' => 8420, 'Aug' => 9150, 'Sep' => 7980],
            default => ['Sun' => 410, 'Mon' => 452, 'Tue' => 584, 'Wed' => 498, 'Thu' => 720, 'Fri' => 650, 'Sat' => 395],
        };

        if ($period === 'this_week') {
            $points = array_map(fn (int $value): int => (int) round($value * self::PERIOD_SCALE[$period]), $points);
        }

        $formattedPoints = collect($points)
            ->map(fn (int $value, string $label): array => ['label' => $label, 'value' => $value])
            ->values()
            ->all();

        return [
            'total' => array_sum($points),
            'change' => 8.0,
            'highlightIndex' => min(2, count($formattedPoints) - 1),
            'points' => $formattedPoints,
        ];
    }

    /**
     * @return list<array{id: string, reference: string, subject: string, priority: string, assignee: array{name: string, avatar: string|null}, status: string, createdAt: string, dueIn: string}>
     */
    public static function transactions(): array
    {
        $rows = [
            ['2319', 'Payment failed on invoice', 'high', 'John Doe', 'in_review', '2025-08-18', '2h left'],
            ['2320', 'Invoice settlement', 'medium', 'Sarah Lee', 'completed', '2025-08-19', '1h left'],
            ['2321', 'Expense report export', 'low', 'John Doe', 'in_progress', '2025-08-19', '1d left'],
            ['2322', 'Contract renewal payment', 'medium', 'Michael Wong', 'overdue', '2025-08-20', '9h overdue'],
        ];

        return array_map(fn (array $row): array => [
            'id' => $row[0],
            'reference' => '#TRX-'.$row[0],
            'subject' => $row[1],
            'priority' => $row[2],
            'assignee' => ['name' => $row[3], 'avatar' => null],
            'status' => $row[4],
            'createdAt' => $row[5],
            'dueIn' => $row[6],
        ], $rows);
    }
}
