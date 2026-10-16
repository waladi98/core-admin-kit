<?php

namespace Database\Factories;

use App\Enums\UserStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => UserStatus::Active,
        ];
    }

    /**
     * Every user gets the default role unless a state assigns another one.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (User $user): void {
            if (! $user->roles()->exists()) {
                $user->assignRole(Role::DEFAULT);
            }
        });
    }

    /**
     * Indicate that the user has the given role (by name, e.g. Role::MANAGER).
     */
    public function role(string $role): static
    {
        return $this->afterCreating(fn (User $user) => $user->syncRoles([$role]));
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->role(Role::ADMIN);
    }

    /**
     * Indicate that the user is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatus::Inactive,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
