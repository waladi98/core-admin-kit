<?php

namespace App\Providers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

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
