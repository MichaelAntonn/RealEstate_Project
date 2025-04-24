<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example data - adjust based on your actual company and plan IDs
        $subscriptions = [
            [
                'company_id' => 1,
                'plan_id' => 1,
                'plan_name' => 'Basic Plan',
                'price' => 99.99,
                'duration_in_days' => 30,
                'starts_at' => Carbon::now(),
                'ends_at' => Carbon::now()->addDays(30),
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company_id' => 2,
                'plan_id' => 2,
                'plan_name' => 'Pro Plan',
                'price' => 199.99,
                'duration_in_days' => 90,
                'starts_at' => Carbon::now()->subDays(90),
                'ends_at' => Carbon::now(),
                'status' => 'expired',
                'created_at' => now()->subDays(90),
                'updated_at' => now(),
            ],
        ];

        DB::table('subscriptions')->insert($subscriptions);
    
    }
}
