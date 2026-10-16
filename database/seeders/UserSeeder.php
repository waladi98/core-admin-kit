<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed 100 users with a realistic mix of roles and statuses.
     *
     * Roles: 5 admins, 20 managers, 75 staff. About 1 in 5 users is inactive.
     * Join dates are spread over the last year so sorting by "Joined" is meaningful.
     */
    public function run(): void
    {
        $this->seedUsers(5, UserRole::Admin);
        $this->seedUsers(20, UserRole::Manager);
        $this->seedUsers(75, UserRole::Staff);
    }

    private function seedUsers(int $count, UserRole $role): void
    {
        User::factory()
            ->count($count)
            ->role($role)
            ->state(new Sequence(
                fn (Sequence $sequence): array => $sequence->index % 5 === 4 ? ['status' => 'inactive'] : [],
            ))
            ->state(fn (): array => ['created_at' => fake()->dateTimeBetween('-1 year')])
            ->create();
    }
}
