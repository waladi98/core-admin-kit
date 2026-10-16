<?php

namespace App\Http\Controllers;

use App\Enums\Permission;
use App\Http\Requests\RoleRequest;
use App\Models\ActivityLog;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Roles & Permissions: manage roles and tick the permissions each role has.
 */
class RoleController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);

        $roles = Role::query()
            ->withCount(['users', 'permissions'])
            ->orderByRaw('case when name = ? then 0 else 1 end', [Role::ADMIN])
            ->orderBy('name')
            ->get();

        return Inertia::render('roles/index', [
            'roles' => $roles->map(fn (Role $role): array => [
                ...$this->present($role),
                'usersCount' => $role->users_count,
                'permissionsCount' => $role->isAdmin() ? count(Permission::cases()) : $role->permissions_count,
            ])->all(),
            'totalPermissions' => count(Permission::cases()),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $role = Role::create(['name' => $request->validated('name'), 'guard_name' => 'web']);
            $role->syncPermissions($request->validated('permissions'));
        });

        return to_route('roles.index')->withToast('success', __('Role created.'));
    }

    public function edit(Role $role): Response
    {
        Gate::authorize('viewAny', Role::class);

        return Inertia::render('roles/edit', [
            'role' => [
                ...$this->present($role),
                'permissions' => $role->isAdmin() ? Permission::values() : $role->permissions->pluck('name')->all(),
            ],
            'permissionGroups' => $this->permissionGroups(),
            'canUpdate' => request()->user()->can('update', $role) && ! $role->isAdmin(),
        ]);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        abort_if($role->isAdmin(), 403, __('The admin role always has every permission.'));

        DB::transaction(function () use ($request, $role): void {
            // Built-in role names are referenced in code, so only their permissions can change.
            if (! $role->isBuiltIn()) {
                $role->update(['name' => $request->validated('name')]);
            }

            $before = $role->permissions->pluck('name')->all();
            $role->syncPermissions($request->validated('permissions'));
            $after = $role->fresh()->permissions->pluck('name')->all();

            $added = array_values(array_diff($after, $before));
            $removed = array_values(array_diff($before, $after));

            if ($added !== [] || $removed !== []) {
                ActivityLog::record('changed', 'Role permissions changed', $role, $role->activityLabel(), ['added' => $added, 'removed' => $removed]);
            }
        });

        return to_route('roles.index')->withToast('success', __('Role updated.'));
    }

    public function destroy(Role $role): RedirectResponse
    {
        abort_if($role->isBuiltIn(), 403, __('Built-in roles cannot be deleted.'));
        Gate::authorize('delete', $role);

        if ($role->users()->exists()) {
            return back()->withToast('error', __('Move the users to another role before deleting this one.'));
        }

        $role->delete();

        return back()->withToast('success', __('Role deleted.'));
    }

    /**
     * @return array{id: int, name: string, label: string, isAdmin: bool, isBuiltIn: bool}
     */
    private function present(Role $role): array
    {
        return [
            'id' => $role->id,
            'name' => $role->name,
            'label' => $role->label(),
            'isAdmin' => $role->isAdmin(),
            'isBuiltIn' => $role->isBuiltIn(),
        ];
    }

    /**
     * Permissions grouped by module for the checkbox matrix.
     *
     * @return list<array{group: string, permissions: list<array{value: string, label: string}>}>
     */
    private function permissionGroups(): array
    {
        return collect(Permission::cases())
            ->groupBy(fn (Permission $permission): string => $permission->group())
            ->map(fn ($permissions, string $group): array => [
                'group' => $group,
                'permissions' => $permissions->map(fn (Permission $permission): array => [
                    'value' => $permission->value,
                    'label' => $permission->label(),
                ])->values()->all(),
            ])
            ->values()
            ->all();
    }
}
