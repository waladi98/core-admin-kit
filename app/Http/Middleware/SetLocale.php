<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Uses the signed-in user's language, else the one chosen this session,
 * else the application default (APP_LOCALE).
 */
class SetLocale
{
    public const SESSION_KEY = 'locale';

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = self::resolve($request->user()?->locale ?? $request->session()->get(self::SESSION_KEY));

        App::setLocale($locale);
        Carbon::setLocale($locale);

        return $next($request);
    }

    /**
     * The given locale when it is supported, otherwise the default one.
     */
    public static function resolve(?string $locale): string
    {
        return array_key_exists((string) $locale, self::available()) ? (string) $locale : config('app.locale');
    }

    /**
     * @return array<string, string>
     */
    public static function available(): array
    {
        return config('app.available_locales', ['en' => 'English']);
    }
}
