<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;
use App\Support\AppSettings;
use App\Support\Translations;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
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
            // Unread count for the bell; the list itself is only loaded when the bell opens.
            'notifications' => fn (): array => ['unreadCount' => $request->user()?->unreadNotifications()->count() ?? 0],
            'notificationItems' => Inertia::optional(fn (): array => $this->notificationItemsOf($request->user())),
            'branding' => fn (): array => AppSettings::branding(),
            'locale' => app()->getLocale(),
            'locales' => SetLocale::available(),
            'timezone' => config('app.display_timezone'),
            'translations' => fn (): array => Translations::forLocale(app()->getLocale()),
        ]);
    }

    /**
     * Latest notifications for the bell dropdown.
     *
     * @return list<array{id: string, title: string, body: string, params: array<string, mixed>, url: string|null, tone: string, readAt: string|null, createdAt: string}>
     */
    private function notificationItemsOf(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        return $user->notifications()->latest()->limit(15)->get()->map(fn (DatabaseNotification $notification): array => [
            'id' => $notification->id,
            'title' => (string) ($notification->data['title'] ?? ''),
            'body' => (string) ($notification->data['body'] ?? ''),
            'params' => (array) ($notification->data['params'] ?? []),
            'url' => $notification->data['url'] ?? null,
            'tone' => (string) ($notification->data['tone'] ?? 'info'),
            'readAt' => $notification->read_at?->toIso8601String(),
            'createdAt' => $notification->created_at->toIso8601String(),
        ])->all();
    }

    /**
     * Frontend-only marker for pages that only admins may open (not a real permission).
     */
    public const ADMIN_MARKER = 'role:admin';

    /**
     * Permission names the frontend uses to show or hide menus and buttons.
     * Admins get every permission (they pass all checks through Gate::before) plus the
     * marker `role:admin` for admin-only pages such as Support → About template.
     *
     * @return list<string>
     */
    private function permissionsOf(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        if ($user->hasRole(Role::ADMIN)) {
            return [...Permission::values(), self::ADMIN_MARKER];
        }

        return $user->getAllPermissions()->pluck('name')->values()->all();
    }
}
