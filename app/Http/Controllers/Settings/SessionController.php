<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Settings → Sessions: where the account is signed in, and signing out other devices.
 * Requires the database session driver (SESSION_DRIVER=database).
 */
class SessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = config('session.driver') === 'database'
            ? DB::table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->orderByDesc('last_activity')
                ->get()
                ->map(fn (object $session): array => [
                    'id' => $session->id,
                    ...self::describeAgent((string) $session->user_agent),
                    'ipAddress' => $session->ip_address,
                    'isCurrent' => $session->id === $request->session()->getId(),
                    'lastActiveAt' => Carbon::createFromTimestamp($session->last_activity)->toIso8601String(),
                ])
                ->all()
            : [];

        return Inertia::render('settings/sessions', [
            'sessions' => $sessions,
            'isSupported' => config('session.driver') === 'database',
        ]);
    }

    public function destroyOthers(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        Auth::logoutOtherDevices($request->input('password'));

        $removed = DB::table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        ActivityLog::record('signed_out', 'Signed out other devices', $request->user(), $request->user()->name, ['sessions' => $removed]);

        return back()->withToast('success', __('Signed out of your other devices.'));
    }

    /**
     * Rough browser and platform from a user agent string, e.g. "Chrome on Windows".
     *
     * @return array{browser: string, platform: string, isMobile: bool}
     */
    public static function describeAgent(string $userAgent): array
    {
        $platforms = ['Windows' => 'Windows', 'iPhone' => 'iOS', 'iPad' => 'iPadOS', 'Android' => 'Android', 'Mac OS X' => 'macOS', 'Macintosh' => 'macOS', 'Linux' => 'Linux'];
        $browsers = ['Edg/' => 'Edge', 'OPR/' => 'Opera', 'Firefox/' => 'Firefox', 'Chrome/' => 'Chrome', 'Safari/' => 'Safari'];

        $platform = collect($platforms)->first(fn (string $name, string $needle): bool => str_contains($userAgent, $needle)) ?? 'Unknown device';
        $browser = collect($browsers)->first(fn (string $name, string $needle): bool => str_contains($userAgent, $needle)) ?? 'Unknown browser';

        return [
            'browser' => $browser,
            'platform' => $platform,
            'isMobile' => (bool) preg_match('/Mobile|Android|iPhone|iPad/i', $userAgent),
        ];
    }
}
