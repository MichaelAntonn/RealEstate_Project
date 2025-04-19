<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic',
                'price' => 99.00,
                'duration_in_days' => 30,
                'description' => 'Basic subscription plan with essential features',
                'features' => json_encode([
                    'Property listings limit: 10',
                    'Basic analytics',
                    'Email support'
                ]),
                'max_properties_allowed' => 10,
                'is_trial' => false
            ],
            [
                'name' => 'Professional',
                'price' => 199.00,
                'duration_in_days' => 30,
                'description' => 'Professional plan with advanced features',
                'features' => json_encode([
                    'Property listings limit: 50',
                    'Advanced analytics',
                    'Priority support',
                    'Featured listings'
                ]),
                'max_properties_allowed' => 15,
                'is_trial' => false
            ],
            [
                'name' => 'Enterprise',
                'price' => 499.00,
                'duration_in_days' => 30,
                'description' => 'Enterprise plan with all features',
                'features' => json_encode([
                    'Unlimited property listings',
                    'Advanced analytics dashboard',
                    '24/7 dedicated support',
                    'Featured listings priority',
                    'API access'
                ]),
                'max_properties_allowed' => -1,
                'is_trial' => false
            ],
            [
                'name' => 'Free Trial',
                'price' => 0.00,
                'duration_in_days' => 7,
                'description' => '7-day free trial with Professional features',
                'features' => json_encode([
                    'Property listings limit: 20',
                    'Basic analytics',
                    'Email support'
                ]),
                'is_trial' => true
            ]
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}
