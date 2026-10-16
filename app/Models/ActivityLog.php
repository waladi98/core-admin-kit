<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One audit trail entry. Create entries with `ActivityLog::record()` or the LogsActivity trait.
 *
 * @property array<string, mixed>|null $properties
 */
class ActivityLog extends Model
{
    use MassPrunable;

    /** Entries older than this are removed by `php artisan model:prune` (scheduled daily). */
    public const RETENTION_DAYS = 365;

    public const UPDATED_AT = null;

    private static bool $recording = true;

    protected $fillable = [
        'causer_id',
        'subject_type',
        'subject_id',
        'event',
        'description',
        'subject_label',
        'properties',
        'ip_address',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'properties' => 'array',
        ];
    }

    /**
     * Write an entry for the current request (causer and IP are filled in automatically).
     *
     * @param  array<string, mixed>  $properties
     */
    public static function record(string $event, string $description, ?Model $subject = null, ?string $subjectLabel = null, array $properties = [], ?User $causer = null): ?self
    {
        if (! self::$recording) {
            return null;
        }

        $causer ??= auth()->user();

        return self::query()->create([
            // A user who just deleted their own account no longer exists and cannot be referenced.
            'causer_id' => $causer?->exists ? $causer->getKey() : null,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'event' => $event,
            'description' => $description,
            'subject_label' => $subjectLabel,
            'properties' => $properties ?: null,
            'ip_address' => request()?->ip(),
        ]);
    }

    /**
     * Run something without writing audit entries, e.g. inside migrations that run
     * before the activity_logs table exists, or for bulk system imports.
     *
     * @template TReturn
     *
     * @param  callable(): TReturn  $callback
     * @return TReturn
     */
    public static function withoutRecording(callable $callback): mixed
    {
        $previous = self::$recording;
        self::$recording = false;

        try {
            return $callback();
        } finally {
            self::$recording = $previous;
        }
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @return Builder<self>
     */
    public function prunable(): Builder
    {
        return static::query()->where('created_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
