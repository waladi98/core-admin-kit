<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

/**
 * Adds sign-ins and sign-outs to the audit trail.
 */
class LogAuthenticationActivity
{
    public function handleLogin(Login $event): void
    {
        if ($event->user instanceof User) {
            ActivityLog::record('signed_in', 'Signed in', $event->user, $event->user->name, causer: $event->user);
        }
    }

    public function handleLogout(Logout $event): void
    {
        if ($event->user instanceof User) {
            ActivityLog::record('signed_out', 'Signed out', $event->user, $event->user->name, causer: $event->user);
        }
    }
}
