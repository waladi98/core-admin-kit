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
    case SettingsManage = 'settings.manage';
    case ActivityView = 'activity.view';
    case VendorsView = 'vendors.view';
    case VendorsCreate = 'vendors.create';
    case VendorsUpdate = 'vendors.update';
    case VendorsDelete = 'vendors.delete';

    /**
     * Human-readable label shown next to the checkbox.
     */
    public function label(): string
    {
        return match ($this) {
            self::UsersView => __('View users'),
            self::UsersCreate => __('Create users'),
            self::UsersUpdate => __('Edit users'),
            self::UsersDelete => __('Delete users'),
            self::RolesView => __('View roles'),
            self::RolesManage => __('Create, edit and delete roles'),
            self::SettingsManage => __('Change application name, logo and colors'),
            self::ActivityView => __("View everyone's activity"),
            self::VendorsView => __('View vendors'),
            self::VendorsCreate => __('Create vendors'),
            self::VendorsUpdate => __('Edit vendors'),
            self::VendorsDelete => __('Delete vendors'),
        };
    }

    /**
     * Module the permission belongs to, used to group checkboxes.
     */
    public function group(): string
    {
        return match ($this) {
            self::UsersView, self::UsersCreate, self::UsersUpdate, self::UsersDelete => __('Users'),
            self::RolesView, self::RolesManage => __('Roles & Permissions'),
            self::SettingsManage => __('Application settings'),
            self::ActivityView => __('Activity log'),
            self::VendorsView, self::VendorsCreate, self::VendorsUpdate, self::VendorsDelete => __('Vendors'),
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
            Role::MANAGER => [self::UsersView, self::UsersCreate, self::UsersUpdate, self::RolesView, self::VendorsView, self::VendorsCreate, self::VendorsUpdate],
            Role::STAFF => [self::VendorsView],
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
