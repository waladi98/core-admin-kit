<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Removes old audit trail entries (ActivityLog::RETENTION_DAYS) and other prunable records.
Schedule::command('model:prune')->daily();
