<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Switches the interface language. Saved on the user when signed in,
 * otherwise only for the current session (e.g. on the login page).
 */
class LocaleController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(array_keys(SetLocale::available()))],
        ]);

        $request->session()->put(SetLocale::SESSION_KEY, $validated['locale']);
        $request->user()?->update(['locale' => $validated['locale']]);

        return back();
    }
}
