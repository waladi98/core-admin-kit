<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActivityLogIndexRequest;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Activity log: the audit trail of who did what, newest first.
 */
class ActivityLogController extends Controller
{
    public function index(ActivityLogIndexRequest $request): Response|RedirectResponse
    {
        $searched = ActivityLog::query()->when($request->search(), fn (Builder $query, string $search) => $query->where(
            fn (Builder $query) => $query
                ->whereLike('description', "%{$search}%")
                ->orWhereLike('subject_label', "%{$search}%")
                ->orWhereHas('causer', fn (Builder $causer) => $causer->whereLike('name', "%{$search}%"))
        ));

        $eventCounts = (clone $searched)->toBase()->selectRaw('event, count(*) as total')->groupBy('event')->pluck('total', 'event');

        $logs = (clone $searched)
            ->with('causer')
            ->when($request->event(), fn (Builder $query, string $event) => $query->where('event', $event))
            ->latest('created_at')
            ->latest('id')
            ->paginate($request->perPage())
            ->withQueryString();

        if ($logs->isEmpty() && $logs->currentPage() > 1) {
            return to_route('activity.index', [...$request->query(), 'page' => $logs->lastPage()]);
        }

        return Inertia::render('activity/index', [
            'logs' => [
                'data' => $logs->getCollection()->map(fn (ActivityLog $log): array => self::present($log))->all(),
                'currentPage' => $logs->currentPage(),
                'lastPage' => $logs->lastPage(),
                'perPage' => $logs->perPage(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
                'total' => $logs->total(),
            ],
            'filters' => [
                'search' => $request->search(),
                'event' => $request->event(),
                'perPage' => $request->perPage(),
            ],
            'eventCounts' => [
                'all' => (int) $eventCounts->sum(),
                ...collect(ActivityLogIndexRequest::EVENTS)->mapWithKeys(fn (string $event): array => [$event => (int) ($eventCounts[$event] ?? 0)])->all(),
            ],
        ]);
    }

    /**
     * @return array{id: int, event: string, description: string, subjectType: string|null, subjectLabel: string|null, causer: array{name: string, avatar: string|null}|null, properties: array<string, mixed>, ipAddress: string|null, createdAt: string}
     */
    public static function present(ActivityLog $log): array
    {
        return [
            'id' => $log->id,
            'event' => $log->event,
            'description' => $log->description,
            'subjectType' => $log->subject_type ? Str::headline(class_basename($log->subject_type)) : null,
            'subjectLabel' => $log->subject_label,
            'causer' => $log->causer ? ['name' => $log->causer->name, 'avatar' => $log->causer->avatar] : null,
            'properties' => $log->properties ?? [],
            'ipAddress' => $log->ip_address,
            'createdAt' => $log->created_at->toIso8601String(),
        ];
    }
}
