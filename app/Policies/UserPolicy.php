<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

/**
 * Admins pass every check through `Gate::before` (AppServiceProvider).
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::UsersView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(Permission::UsersCreate->value);
    }

    public function update(User $user, User $model): bool
    {
        return $user->can(Permission::UsersUpdate->value);
    }

    /**
     * Deleting your own account here is blocked in the controller for everyone, admins included.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->can(Permission::UsersDelete->value) && $user->isNot($model);
    }
}
