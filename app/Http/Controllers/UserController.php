<?php

namespace App\Http\Controllers;

use App\Enums\UserStatus;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserIndexRequest;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Kelola Users: list, create, edit and delete application users.
 */
class UserController extends Controller
{
    public function index(UserIndexRequest $request): Response|RedirectResponse
    {
        Gate::authorize('viewAny', User::class);

        $sort = $request->sort();

        // Search and role apply to both the table and the status tab counts.
        $filtered = User::query()
            ->when($request->search(), fn (Builder $query, string $search) => $query->where(
                fn (Builder $query) => $query->whereLike('name', "%{$search}%")->orWhereLike('email', "%{$search}%")
            ))
            ->when($request->role(), fn (Builder $query, string $role) => $query->role($role));

        $statusCounts = (clone $filtered)
            ->toBase()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $users = (clone $filtered)
            ->with('roles')
            ->when($request->status(), fn (Builder $query, UserStatus $status) => $query->where('status', $status))
            ->orderBy(ltrim($sort, '-'), Str::startsWith($sort, '-') ? 'desc' : 'asc')
            ->orderBy('id')
            ->paginate($request->perPage())
            ->withQueryString();

        // A page past the end (e.g. after deleting the last row of the last page) falls back to the last page.
        if ($users->isEmpty() && $users->currentPage() > 1) {
            return to_route('users.index', [...$request->query(), 'page' => $users->lastPage()]);
        }

        return Inertia::render('users/index', [
            'users' => [
                'data' => $users->getCollection()->map(fn (User $user): array => $this->present($user))->all(),
                'currentPage' => $users->currentPage(),
                'lastPage' => $users->lastPage(),
                'perPage' => $users->perPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem(),
                'total' => $users->total(),
            ],
            'filters' => [
                'search' => $request->search(),
                'role' => $request->role(),
                'status' => $request->status()?->value,
                'sort' => $sort,
                'perPage' => $request->perPage(),
            ],
            'statusCounts' => [
                'all' => (int) $statusCounts->sum(),
                ...collect(UserStatus::cases())->mapWithKeys(fn (UserStatus $status): array => [
                    $status->value => (int) ($statusCounts[$status->value] ?? 0),
                ])->all(),
            ],
            'statusOptions' => $this->statusOptions(),
            'roleOptions' => $this->roleOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('users/create', [
            'roleOptions' => $this->roleOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::create($request->safe()->except('role'));
            $user->syncRoles([$request->validated('role')]);

            return $user;
        });

        $user->notify(new AppNotification('Welcome to :app', 'Your account is ready. Open your profile to add a photo and choose your language.', ['app' => config('app.name')], route('profile.edit'), 'success'));

        return to_route('users.index')->withToast('success', __('User created.'));
    }

    public function edit(User $user): Response
    {
        Gate::authorize('update', $user);

        return Inertia::render('users/edit', [
            'user' => $this->present($user->load('roles')),
            'roleOptions' => $this->roleOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $previousRole = $user->roles->first()?->name;

        DB::transaction(function () use ($request, $user): void {
            $user->update(collect($request->safe()->except('role'))->filter(
                fn (mixed $value, string $key): bool => $key !== 'password' || filled($value)
            )->all());

            $user->syncRoles([$request->validated('role')]);
        });

        $newRole = Role::findByName($request->validated('role'));

        if ($previousRole !== $newRole->name && $user->isNot($request->user())) {
            $user->notify(new AppNotification('Your role was changed', 'You are now :role. Some menus may have changed.', ['role' => Str::headline($newRole->name)], route('dashboard')));
        }

        return to_route('users.index')->withToast('success', __('User updated.'));
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, __('You cannot delete your own account here.'));

        Gate::authorize('delete', $user);

        $user->delete();

        return back()->withToast('success', __(':name was deleted.', ['name' => $user->name]));
    }

    /**
     * @return array{id: int, name: string, email: string, avatar: string|null, role: string, roleLabel: string, status: string, statusLabel: string, createdAt: string}
     */
    private function present(User $user): array
    {
        /** @var Role|null $role */
        $role = $user->roles->first();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'role' => $role->name ?? '',
            'roleLabel' => $role?->label() ?? '—',
            'status' => $user->status->value,
            'statusLabel' => $user->status->label(),
            'createdAt' => $user->created_at->toDateString(),
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function roleOptions(): array
    {
        return Role::query()->orderBy('name')->get()->map(fn (Role $role): array => ['value' => $role->name, 'label' => $role->label()])->all();
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function statusOptions(): array
    {
        return array_map(fn (UserStatus $status): array => ['value' => $status->value, 'label' => $status->label()], UserStatus::cases());
    }
}
