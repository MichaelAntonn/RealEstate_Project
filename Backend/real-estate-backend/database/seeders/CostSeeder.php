<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cost;

class CostSeeder extends Seeder
{
    public function run(): void
    {
        Cost::create([
            'user_id' => 1, // Assuming admin user with ID 1
            'amount' => 60000,
            'description' => 'Operational costs for December',
            'created_at' => '2024-12-15 10:00:00', // Fixed date in December
            'updated_at' => '2024-12-15 10:00:00',
        ]);

        Cost::create([
            'user_id' => 1,
            'amount' => 55000,
            'description' => 'Operational costs for January',
            'created_at' => '2025-01-20 14:00:00', // Fixed date in January
            'updated_at' => '2025-01-20 14:00:00',
        ]);

        Cost::create([
            'user_id' => 1,
            'amount' => 50000,
            'description' => 'Operational costs for February',
            'created_at' => '2025-02-10 09:00:00', // Fixed date in February
            'updated_at' => '2025-02-10 09:00:00',
        ]);

        Cost::create([
            'user_id' => 1,
            'amount' => 70000,
            'description' => 'Operational costs for March',
            'created_at' => '2025-03-05 16:00:00', // Fixed date in March
            'updated_at' => '2025-03-05 16:00:00',
        ]);
    }
}