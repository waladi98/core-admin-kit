<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Finance Core dashboard.
 *
 * All figures are dummy data until the finance domain models exist.
 */
class DashboardController extends Controller
{
    /**
     * Multiplier applied to the weekly dummy figures for each reporting period.
     *
     * @var array<string, float>
     */
    private const PERIOD_SCALE = [
        'this_week' => 0.9,
        'last_week' => 1.0,
        'last_month' => 4.2,
        'last_quarter' => 12.6,
    ];

    public function __invoke(DashboardRequest $request): Response
    {
        return Inertia::render('dashboard', [
            'filters' => [
                'period' => $request->period(),
                'trendPeriod' => $request->trendPeriod(),
            ],
            'stats' => $this->stats($request->period()),
            'volumeTrend' => $this->volumeTrend($request->trendPeriod()),
            'activities' => Inertia::defer(fn (): array => $this->activities(), 'feed'),
            'transactions' => Inertia::defer(fn (): array => $this->transactions(), 'table'),
        ]);
    }

    /**
     * @return list<array{key: string, label: string, value: string, change: float, trend: list<int>}>
     */
    private function stats(string $period): array
    {
        $scale = self::PERIOD_SCALE[$period];

        return [
            [
                'key' => 'current_balance',
                'label' => __('Current Balance'),
                'value' => '$'.number_format(3484 * $scale).'K',
                'change' => 7.1,
                'trend' => [12, 18, 14, 22, 16, 24, 19, 21, 17, 20],
            ],
            [
                'key' => 'daily_transactions',
                'label' => __('Daily Avg. Transactions'),
                'value' => number_format(486 * min($scale, 1.1)),
                'change' => 2.0,
                'trend' => [10, 11, 10, 14, 12, 16, 13, 17, 15, 18],
            ],
            [
                'key' => 'compliance_rate',
                'label' => __('Compliance Rate'),
                'value' => '92%',
                'change' => -1.3,
                'trend' => [18, 14, 16, 12, 17, 13, 15, 19, 14, 12],
            ],
        ];
    }

    /**
     * @return array{total: int, change: float, highlightIndex: int, points: list<array{label: string, value: int}>}
     */
    private function volumeTrend(string $period): array
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
     * @return array<string, list<array{id: string, type: string, title: string, description: string, time: string}>>
     */
    private function activities(): array
    {
        return [
            'today' => [
                ['id' => 'a1', 'type' => 'transaction', 'title' => 'Transaction Updated', 'description' => 'TRX-2319 payment status updated', 'time' => '11:20 AM'],
                ['id' => 'a2', 'type' => 'client', 'title' => 'New Client Added', 'description' => 'PT. Alpha Indonesia registered', 'time' => '11:15 AM'],
                ['id' => 'a3', 'type' => 'reassignment', 'title' => 'Approver Reassigned', 'description' => 'TRX-2322 moved to Michael Wong', 'time' => '11:00 AM'],
                ['id' => 'a4', 'type' => 'risk', 'title' => 'Overdue Risk', 'description' => 'TRX-2320 "Invoice settlement"', 'time' => '10:45 AM'],
                ['id' => 'a5', 'type' => 'knowledge', 'title' => 'Knowledge Base', 'description' => 'New policy published: "Refund Procedure"', 'time' => '10:30 AM'],
                ['id' => 'a6', 'type' => 'feedback', 'title' => 'Client Feedback', 'description' => '"Fast reconciliation, thanks Sarah!"', 'time' => '10:30 AM'],
            ],
            'yesterday' => [
                ['id' => 'b1', 'type' => 'transaction', 'title' => 'Transaction Approved', 'description' => 'TRX-2301 approved by Finance Lead', 'time' => '04:10 PM'],
                ['id' => 'b2', 'type' => 'risk', 'title' => 'Budget Alert', 'description' => 'Marketing budget reached 90%', 'time' => '01:25 PM'],
                ['id' => 'b3', 'type' => 'client', 'title' => 'Client Updated', 'description' => 'CV. Maju Jaya changed billing address', 'time' => '09:05 AM'],
            ],
            'this_week' => [
                ['id' => 'c1', 'type' => 'knowledge', 'title' => 'Knowledge Base', 'description' => 'Article updated: "Month-end Closing"', 'time' => 'Mon'],
                ['id' => 'c2', 'type' => 'reassignment', 'title' => 'Team Changed', 'description' => 'Sarah Lee joined Treasury team', 'time' => 'Mon'],
            ],
        ];
    }

    /**
     * @return list<array{id: string, reference: string, subject: string, priority: string, assignee: array{name: string, avatar: string|null}, status: string, createdAt: string, dueIn: string}>
     */
    private function transactions(): array
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
