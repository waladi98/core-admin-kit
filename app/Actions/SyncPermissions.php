<?php

namespace App\Actions;

use App\Enums\Permission as PermissionName;
use App\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * Makes the database match `App\Enums\Permission`:
 * creates new permissions, removes ones no longer in the enum,
 * creates missing built-in roles with their default permissions,
 * and gives the admin role every permission.
 *
 * Safe to run repeatedly; permissions already given to roles from the UI are kept.
 */
class SyncPermissions
{
    public function __invoke(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (PermissionName::cases() as $permission) {
            Permission::findOrCreate($permission->value, 'web');
        }

        Permission::query()
            ->where('guard_name', 'web')
            ->whereNotIn('name', PermissionName::values())
            ->delete();

        foreach (Role::BUILT_IN as $roleName) {
            $role = Role::query()->firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

            if ($role->wasRecentlyCreated && ! $role->isAdmin()) {
                $role->syncPermissions(array_map(fn (PermissionName $permission): string => $permission->value, PermissionName::defaultsFor($roleName)));
            }
        }

        Role::findByName(Role::ADMIN, 'web')->syncPermissions(PermissionName::values());

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
