<?php

namespace Database\Factories;

use App\Enums\VendorCategory;
use App\Enums\VendorStatus;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'category' => fake()->randomElement(VendorCategory::cases()),
            'email' => fake()->companyEmail(),
            'phone' => fake()->numerify('08##########'),
            'contact_person' => fake()->name(),
            'address' => fake()->address(),
            'tax_number' => fake()->numerify('##.###.###.#-###.###'),
            'bank_name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga']),
            'bank_account_number' => fake()->numerify('##########'),
            'payment_term_days' => fake()->randomElement([0, 14, 30, 45, 60]),
            'credit_limit' => fake()->randomElement([0, 10, 25, 50, 100, 250]) * 1_000_000,
            'notes' => null,
            'status' => VendorStatus::Active,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['status' => VendorStatus::Inactive]);
    }

    /**
     * Only the fields of the quick-add modal, as right after a quick create.
     */
    public function minimal(): static
    {
        return $this->state(fn (): array => [
            'contact_person' => null,
            'address' => null,
            'tax_number' => null,
            'bank_name' => null,
            'bank_account_number' => null,
            'credit_limit' => 0,
        ]);
    }
}
