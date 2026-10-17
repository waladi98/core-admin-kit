<?php

use App\Actions\SyncPermissions;
use App\Enums\Permission;
use App\Models\ActivityLog;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

/**
 * Creates the vendors.* permissions and gives existing built-in roles their defaults
 * (SyncPermissions only applies defaults to roles it creates).
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        ActivityLog::withoutRecording(function (): void {
            (new SyncPermissions)();

            foreach ([Role::MANAGER, Role::STAFF] as $roleName) {
                $vendorPermissions = array_filter(
                    Permission::defaultsFor($roleName),
                    fn (Permission $permission): bool => str_starts_with($permission->value, 'vendors.'),
                );

                Role::findByName($roleName, 'web')->givePermissionTo(array_map(fn (Permission $permission): string => $permission->value, $vendorPermissions));
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
