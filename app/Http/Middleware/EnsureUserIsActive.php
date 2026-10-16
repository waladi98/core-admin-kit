<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Signs out users whose account was deactivated while they were logged in.
 */
class EnsureUserIsActive
{
    public const INACTIVE_MESSAGE = 'Your account is inactive. Please contact an administrator.';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->status === UserStatus::Inactive) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('login')->withErrors(['email' => self::INACTIVE_MESSAGE]);
        }

        return $next($request);
    }
}
