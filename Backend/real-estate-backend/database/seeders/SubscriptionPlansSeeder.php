<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\DB;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('subscription_plans')->insert([
            [
                'name' => 'Basic',
                'price' => 100.00,
                'duration_in_days' => 30,
                'description' => 'Ideal for individuals looking to list a small number of properties.',
                'features' => json_encode([
                    'max_properties_allowed' => 5,
                    'priority_support' => false,
                    'additional_features' => false
                ]),
                'is_trial' => false,
                'max_properties_allowed' => 5,
            ],
            [
                'name' => 'Standard',
                'price' => 250.00,
                'duration_in_days' => 90,
                'description' => 'Suitable for small businesses with a moderate number of properties to list.',
                'features' => json_encode([
                    'max_properties_allowed' => 20,
                    'priority_support' => true,
                    'additional_features' => false
                ]),
                'is_trial' => false,
                'max_properties_allowed' => 20,
            ],
            [
                'name' => 'Premium',
                'price' => 500.00,
                'duration_in_days' => 180,
                'description' => 'Perfect for businesses with a large portfolio of properties.',
                'features' => json_encode([
                    'max_properties_allowed' => 50,
                    'priority_support' => true,
                    'additional_features' => true
                ]),
                'is_trial' => false,
                'max_properties_allowed' => 50,
            ],
            [
                'name' => 'Free Trial',
                'price' => 0.00,
                'duration_in_days' => 7,
                'description' => 'A trial plan to test the features and list a limited number of properties.',
                'features' => json_encode([
                    'max_properties_allowed' => 1,
                    'priority_support' => false,
                    'additional_features' => false
                ]),
                'is_trial' => true,
                'max_properties_allowed' => 1,
            ]
        ]);
    }

}
