<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $this->call([
            AdminSeeder::class,
            UserSeeder::class,
            PropertySeeder::class,
            BookingSeeder::class,
            CostSeeder::class,
            ReviewSeeder::class,
            SubscriptionPlansSeeder::class,
            CompanySeeder::class,
            SubscriptionSeeder::class,
            // BlogsSeeder::class,
            ConsultantSeeder::class,
            SettingsTableSeeder::class
        ]);
    }
}
