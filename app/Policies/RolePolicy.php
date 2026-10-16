<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Role;
use App\Models\User;

/**
 * Admins pass every check through `Gate::before` (AppServiceProvider); rules that
 * must hold even for admins (the admin role is locked) are enforced in RoleController.
 */
class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::RolesView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(Permission::RolesManage->value);
    }

    public function update(User $user, Role $role): bool
    {
        return $user->can(Permission::RolesManage->value) && ! $role->isAdmin();
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->can(Permission::RolesManage->value) && ! $role->isBuiltIn();
    }
}
