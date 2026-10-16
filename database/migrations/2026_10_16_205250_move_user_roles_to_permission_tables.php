<?php

use App\Actions\SyncPermissions;
use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Moves each user's role from the old `users.role` column into the
 * spatie permission tables, then drops the column.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The audit trail table is created by a later migration, so do not record anything here.
        ActivityLog::withoutRecording(fn () => (new SyncPermissions)());

        $roleIds = Role::query()->pluck('id', 'name');

        DB::table('users')->select(['id', 'role'])->orderBy('id')->each(function (object $user) use ($roleIds): void {
            $roleId = $roleIds[$user->role] ?? $roleIds[Role::DEFAULT];

            DB::table('model_has_roles')->insertOrIgnore([
                'role_id' => $roleId,
                'model_type' => User::class,
                'model_id' => $user->id,
            ]);
        });

        // Keep at least one administrator: if nobody was an admin, the first account becomes one.
        $hasAdmin = DB::table('model_has_roles')->where('role_id', $roleIds[Role::ADMIN])->exists();
        $firstUserId = DB::table('users')->min('id');

        if (! $hasAdmin && $firstUserId !== null) {
            DB::table('model_has_roles')->where('model_type', User::class)->where('model_id', $firstUserId)->delete();
            DB::table('model_has_roles')->insert([
                'role_id' => $roleIds[Role::ADMIN],
                'model_type' => User::class,
                'model_id' => $firstUserId,
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default(Role::DEFAULT)->index()->after('email');
        });

        DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', User::class)
            ->whereIn('roles.name', Role::BUILT_IN)
            ->select(['model_has_roles.model_id', 'roles.name'])
            ->orderBy('model_has_roles.model_id')
            ->each(fn (object $row) => DB::table('users')->where('id', $row->model_id)->update(['role' => $row->name]));
    }
};
