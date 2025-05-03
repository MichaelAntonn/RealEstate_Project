<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

        public function run()
        {
            $premiumPlan = SubscriptionPlan::where('name', 'Premium')->first();
    
            if (!$premiumPlan) {
                $this->command->error('Premium plan not found.');
                return;
            }
    
            $emails = [
                'OmarYoussef@gmail.com',
                'SalmaAli@gmail.com',
                'YaraMahmoud@gmail.com',
                'MohamedKhaled@gmail.com.com',
            ];
    
            foreach ($emails as $email) {
                $user = User::where('email', $email)->first();
    
                if ($user) {
                    $startsAt = Carbon::now();
                    $endsAt = $startsAt->copy()->addDays($premiumPlan->duration_in_days);
    
                    Subscription::create([
                        'user_id' => $user->id,
                        'plan_id' => $premiumPlan->id,
                        'plan_name' => $premiumPlan->name,
                        'price' => $premiumPlan->price,
                        'duration_in_days' => $premiumPlan->duration_in_days,
                        'starts_at' => $startsAt,
                        'ends_at' => $endsAt,
                        'status' => 'active',
                        'payment_gateway' => 'manual',
                        'payment_reference' => 'Seeder_' . uniqid(),
                        'last_payment_attempt' => now(),
                        'auto_renew' => false,
                    ]);
                }
            }
        }}
