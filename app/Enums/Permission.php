<?php

namespace App\Enums;

use App\Models\Role;

/**
 * Every permission the application checks, in one place.
 *
 * Add a case here, then run `php artisan app:sync-permissions` (also run by
 * the seeder) to create it in the database. Roles get permissions from the
 * Roles & Permissions page.
 */
enum Permission: string
{
    case UsersView = 'users.view';
    case UsersCreate = 'users.create';
    case UsersUpdate = 'users.update';
    case UsersDelete = 'users.delete';
    case RolesView = 'roles.view';
    case RolesManage = 'roles.manage';

    /**
     * Human-readable label shown next to the checkbox.
     */
    public function label(): string
    {
        return match ($this) {
            self::UsersView => 'View users',
            self::UsersCreate => 'Create users',
            self::UsersUpdate => 'Edit users',
            self::UsersDelete => 'Delete users',
            self::RolesView => 'View roles',
            self::RolesManage => 'Create, edit and delete roles',
        };
    }

    /**
     * Module the permission belongs to, used to group checkboxes.
     */
    public function group(): string
    {
        return match ($this) {
            self::UsersView, self::UsersCreate, self::UsersUpdate, self::UsersDelete => 'Users',
            self::RolesView, self::RolesManage => 'Roles & Permissions',
        };
    }

    /**
     * Permissions given to a built-in role the first time it is created.
     * Admin is not listed: it always has every permission.
     *
     * @return list<self>
     */
    public static function defaultsFor(string $role): array
    {
        return match ($role) {
            Role::MANAGER => [self::UsersView, self::UsersCreate, self::UsersUpdate, self::RolesView],
            default => [],
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $permission): string => $permission->value, self::cases());
    }
}
