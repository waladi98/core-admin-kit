<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Password rules used by registration, user management and password changes.
        // Production: at least 8 characters with upper and lower case letters and a number.
        Password::defaults(fn (): Password => $this->app->isProduction()
            ? Password::min(8)->letters()->mixedCase()->numbers()
            : Password::min(8));

        // Admins can do everything, including permissions added later.
        Gate::before(fn (User $user): ?bool => $user->hasRole(Role::ADMIN) ? true : null);

        /*
         * Flash a toast for the next page: `return to_route('users.index')->withToast('success', __('User created.'));`
         * Types: success, error, warning, info. Shown by the frontend ToastProvider.
         */
        RedirectResponse::macro('withToast', function (string $type, string $message): RedirectResponse {
            /** @var RedirectResponse $this */
            return $this->with('toast', ['id' => (string) Str::uuid(), 'type' => $type, 'message' => $message]);
        });
    }
}
