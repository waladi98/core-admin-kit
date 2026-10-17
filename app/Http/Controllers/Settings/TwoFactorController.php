<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Settings → Two-factor (page) and the sign-in challenge page.
 * Enabling, confirming, disabling and recovery codes are handled by Fortify's controllers
 * (routes in routes/settings.php and routes/auth.php).
 */
class TwoFactorController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $isPending = $user->two_factor_secret !== null && $user->two_factor_confirmed_at === null;
        $isEnabled = $user->hasEnabledTwoFactorAuthentication();

        return Inertia::render('settings/two-factor', [
            'state' => $isEnabled ? 'enabled' : ($isPending ? 'pending' : 'disabled'),
            // Only while setting up: the QR code and key to add the account to an authenticator app.
            'qrCodeSvg' => $isPending ? $user->twoFactorQrCodeSvg() : null,
            'secretKey' => $isPending ? decrypt($user->two_factor_secret) : null,
            // The page sits behind password confirmation, so the codes can be shown.
            'recoveryCodes' => $isEnabled ? $user->recoveryCodes() : [],
        ]);
    }

    /**
     * The code page shown after a correct password when 2FA is enabled.
     */
    public function challenge(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return to_route('login');
        }

        return Inertia::render('auth/two-factor-challenge');
    }
}
