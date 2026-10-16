<?php

namespace App\Concerns;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Records created/updated/deleted events of a model in the audit trail (activity_logs).
 *
 * The description is "{Model} created|updated|deleted" (English, translated when shown).
 * Updates store the changed fields as {"old": …, "new": …}. Hidden attributes (passwords,
 * tokens) and the names in `$activityIgnored` are never recorded.
 *
 * Optional on the model:
 *   protected array $activityIgnored = ['locale'];   // fields not worth logging
 *   public function activityLabel(): string { … }    // name shown in the log (default: name/title/id)
 *
 * @mixin Model
 */
trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(fn (Model $model) => $model->logActivity('created'));

        static::updated(function (Model $model): void {
            $changes = $model->activityChanges();

            if ($changes !== []) {
                $model->logActivity('updated', ['changes' => $changes]);
            }
        });

        static::deleted(fn (Model $model) => $model->logActivity('deleted'));
    }

    /**
     * @param  array<string, mixed>  $properties
     */
    public function logActivity(string $event, array $properties = []): void
    {
        ActivityLog::record(
            event: $event,
            description: Str::headline(class_basename($this)).' '.$event,
            subject: $this,
            subjectLabel: $this->activityLabel(),
            properties: $properties,
        );
    }

    public function activityLabel(): string
    {
        return (string) ($this->getAttribute('name') ?? $this->getAttribute('title') ?? '#'.$this->getKey());
    }

    /**
     * Changed fields of the last save, without secrets and ignored fields.
     *
     * @return array<string, array{old: mixed, new: mixed}>
     */
    protected function activityChanges(): array
    {
        $ignored = [...$this->getHidden(), ...($this->activityIgnored ?? []), 'updated_at', 'created_at', 'remember_token'];
        $changes = [];

        foreach ($this->getChanges() as $attribute => $newValue) {
            if (in_array($attribute, $ignored, true)) {
                continue;
            }

            $oldValue = $this->getOriginal($attribute);

            $changes[$attribute] = [
                'old' => $oldValue instanceof \BackedEnum ? $oldValue->value : $oldValue,
                'new' => $this->getAttribute($attribute) instanceof \BackedEnum ? $this->getAttribute($attribute)->value : $newValue,
            ];
        }

        return $changes;
    }
}
