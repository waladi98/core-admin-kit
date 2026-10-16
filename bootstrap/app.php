<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use App\Support\Translations;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            SetLocale::class,
            EnsureUserIsActive::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Friendly Finance Core error pages. 403/404 always; 500/503 only when debug is off,
        // so developers still see the full error locally.
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();

            if ($status === 419) {
                return back()->withToast('error', __('The page expired. Please try again.'));
            }

            $friendly = in_array($status, [403, 404], true) || (in_array($status, [500, 503], true) && ! config('app.debug'));

            if (! $friendly || ($request->expectsJson() && ! $request->header('X-Inertia'))) {
                return $response;
            }

            $locale = SetLocale::resolve($request->user()?->locale ?? ($request->hasSession() ? $request->session()->get(SetLocale::SESSION_KEY) : null));
            app()->setLocale($locale);

            return Inertia::render('error', [
                'status' => $status,
                'isSignedIn' => $request->user() !== null,
                'locale' => $locale,
                'locales' => SetLocale::available(),
                'translations' => Translations::forLocale($locale),
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
