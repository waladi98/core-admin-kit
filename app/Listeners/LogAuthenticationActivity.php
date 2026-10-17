<?php

namespace App\Listeners;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Laravel\Fortify\Events\TwoFactorAuthenticationConfirmed;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;

/**
 * Adds sign-ins, sign-outs and two-factor changes to the audit trail.
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

    public function handleTwoFactorConfirmed(TwoFactorAuthenticationConfirmed $event): void
    {
        if ($event->user instanceof User) {
            ActivityLog::record('changed', 'Two-factor authentication enabled', $event->user, $event->user->name, causer: $event->user);
        }
    }

    public function handleTwoFactorDisabled(TwoFactorAuthenticationDisabled $event): void
    {
        if ($event->user instanceof User) {
            ActivityLog::record('changed', 'Two-factor authentication disabled', $event->user, $event->user->name, causer: $event->user);
        }
    }
}
