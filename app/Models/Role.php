<?php

namespace App\Models;

use App\Concerns\LogsActivity;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Application role. Roles and their permissions are managed from the
 * Roles & Permissions page; the built-in roles below are created by
 * `App\Actions\SyncPermissions`.
 */
class Role extends SpatieRole
{
    use LogsActivity;

    /** Full access to everything; its permissions cannot be changed and it cannot be deleted. */
    public const ADMIN = 'admin';

    public const MANAGER = 'manager';

    public const STAFF = 'staff';

    /**
     * Role given to new users when none is chosen.
     */
    public const DEFAULT = self::STAFF;

    /**
     * @var list<string>
     */
    public const BUILT_IN = [self::ADMIN, self::MANAGER, self::STAFF];

    public function isAdmin(): bool
    {
        return $this->name === self::ADMIN;
    }

    public function isBuiltIn(): bool
    {
        return in_array($this->name, self::BUILT_IN, true);
    }

    /**
     * Human-readable name, e.g. "finance-lead" → "Finance Lead".
     */
    public function label(): string
    {
        return __(Str::headline($this->name));
    }

    /**
     * Name stored in the audit trail (English, translated when shown).
     */
    public function activityLabel(): string
    {
        return Str::headline($this->name);
    }
}
