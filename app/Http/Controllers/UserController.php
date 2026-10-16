<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserIndexRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $sort = $request->sort();

        // Search and role apply to both the table and the status tab counts.
        $filtered = User::query()
            ->when($request->search(), fn (Builder $query, string $search) => $query->where(
                fn (Builder $query) => $query->whereLike('name', "%{$search}%")->orWhereLike('email', "%{$search}%")
            ))
            ->when($request->role(), fn (Builder $query, UserRole $role) => $query->where('role', $role));

        $statusCounts = (clone $filtered)
            ->toBase()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $users = (clone $filtered)
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
                'role' => $request->role()?->value,
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
            'statusOptions' => $this->options(UserStatus::cases()),
            'roleOptions' => $this->options(UserRole::cases()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roleOptions' => $this->options(UserRole::cases()),
            'statusOptions' => $this->options(UserStatus::cases()),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return to_route('users.index');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('users/edit', [
            'user' => $this->present($user),
            'roleOptions' => $this->options(UserRole::cases()),
            'statusOptions' => $this->options(UserStatus::cases()),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update(collect($request->validated())->filter(
            fn (mixed $value, string $key): bool => $key !== 'password' || filled($value)
        )->all());

        return to_route('users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'You cannot delete your own account here.');

        $user->delete();

        return back();
    }

    /**
     * @return array{id: int, name: string, email: string, avatar: string|null, role: string, roleLabel: string, status: string, statusLabel: string, createdAt: string}
     */
    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => null,
            'role' => $user->role->value,
            'roleLabel' => $user->role->label(),
            'status' => $user->status->value,
            'statusLabel' => $user->status->label(),
            'createdAt' => $user->created_at->toDateString(),
        ];
    }

    /**
     * @param  list<UserRole|UserStatus>  $cases
     * @return list<array{value: string, label: string}>
     */
    private function options(array $cases): array
    {
        return array_map(fn (UserRole|UserStatus $case): array => ['value' => $case->value, 'label' => $case->label()], $cases);
    }
}
