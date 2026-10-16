<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\Translations;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'permissions' => fn (): array => $this->permissionsOf($request->user()),
            ],
            // Set with `->withToast($type, $message)` on a redirect; shown once as a toast.
            // Always included, so toasts also arrive after partial reloads (e.g. deleting a table row).
            'flash' => Inertia::always(fn (): array => ['toast' => $request->session()->get('toast')]),
            'locale' => app()->getLocale(),
            'locales' => SetLocale::available(),
            'timezone' => config('app.display_timezone'),
            'translations' => fn (): array => Translations::forLocale(app()->getLocale()),
        ]);
    }

    /**
     * Permission names the frontend uses to show or hide menus and buttons.
     * Admins get every permission (they pass all checks through Gate::before).
     *
     * @return list<string>
     */
    private function permissionsOf(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        if ($user->hasRole(Role::ADMIN)) {
            return Permission::values();
        }

        return $user->getAllPermissions()->pluck('name')->values()->all();
    }
}
