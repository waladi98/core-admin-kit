<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;
use App\Models\Vendor;

/**
 * Admins pass every check through `Gate::before` (AppServiceProvider).
 */
class VendorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::VendorsView->value);
    }

    public function view(User $user, Vendor $vendor): bool
    {
        return $user->can(Permission::VendorsView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(Permission::VendorsCreate->value);
    }

    public function update(User $user, Vendor $vendor): bool
    {
        return $user->can(Permission::VendorsUpdate->value);
    }

    public function delete(User $user, Vendor $vendor): bool
    {
        return $user->can(Permission::VendorsDelete->value);
    }
}
