<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Http\Requests\DashboardRequest;
use App\Models\ActivityLog;
use App\Support\SampleDashboardData;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Finance Core dashboard.
 *
 * Stats, chart and transactions come from SampleDashboardData (placeholder) until the project's own
 * domain models exist; the "Latest updates" feed reads the real audit trail.
 */
class DashboardController extends Controller
{
    public function __invoke(DashboardRequest $request): Response
    {
        return Inertia::render('dashboard', [
            'filters' => [
                'period' => $request->period(),
                'trendPeriod' => $request->trendPeriod(),
            ],
            'stats' => SampleDashboardData::stats($request->period()),
            'volumeTrend' => SampleDashboardData::volumeTrend($request->trendPeriod()),
            'activities' => Inertia::defer(fn (): array => $this->activities($request), 'feed'),
            'transactions' => Inertia::defer(fn (): array => SampleDashboardData::transactions(), 'table'),
        ]);
    }

    /**
     * Latest audit trail entries for the "Latest updates" feed, grouped by day in the display timezone.
     * People without `activity.view` only see their own actions.
     *
     * @return array<string, list<array{id: string, type: string, title: string, description: string, time: string}>>
     */
    private function activities(Request $request): array
    {
        $timezone = config('app.display_timezone');
        $today = now($timezone)->startOfDay();
        $groups = ['today' => [], 'yesterday' => [], 'this_week' => []];

        ActivityLog::query()
            ->with('causer')
            ->when(! $request->user()->can(Permission::ActivityView->value), fn (Builder $query) => $query->where('causer_id', $request->user()->id))
            ->where('created_at', '>=', $today->copy()->subDays(6)->utc())
            ->latest('created_at')
            ->latest('id')
            ->limit(40)
            ->get()
            ->each(function (ActivityLog $log) use (&$groups, $today, $timezone): void {
                $at = $log->created_at->copy()->setTimezone($timezone);
                $group = $at->gte($today) ? 'today' : ($at->gte($today->copy()->subDay()) ? 'yesterday' : 'this_week');

                $groups[$group][] = [
                    'id' => (string) $log->id,
                    'type' => $log->event,
                    'title' => $log->description,
                    'description' => collect([$log->causer?->name, $log->subject_label])->filter()->unique()->implode(' · '),
                    'time' => $group === 'this_week' ? $at->locale(app()->getLocale())->translatedFormat('D H:i') : $at->format('H:i'),
                ];
            });

        return $groups;
    }
}
