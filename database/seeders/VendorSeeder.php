<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    /**
     * Seed 25 sample vendors; about 1 in 5 is inactive and a few have only the quick-add fields.
     */
    public function run(): void
    {
        Vendor::factory()
            ->count(25)
            ->state(new Sequence(
                fn (Sequence $sequence): array => match (true) {
                    $sequence->index % 5 === 4 => ['status' => 'inactive'],
                    $sequence->index % 7 === 3 => ['contact_person' => null, 'address' => null, 'tax_number' => null, 'bank_name' => null, 'bank_account_number' => null],
                    default => [],
                },
            ))
            ->state(fn (): array => ['created_at' => fake()->dateTimeBetween('-6 months')])
            ->create();
    }
}
