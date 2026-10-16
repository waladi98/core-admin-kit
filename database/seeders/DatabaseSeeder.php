<?php

namespace Database\Seeders;

use App\Actions\SyncPermissions;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(SyncPermissions $syncPermissions): void
    {
        $syncPermissions();

        // First administrator. Change the password after the first sign-in.
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Administrator', 'password' => 'password', 'email_verified_at' => now()],
        );
        $admin->syncRoles([Role::ADMIN]);

        $this->call(UserSeeder::class);
    }
}
