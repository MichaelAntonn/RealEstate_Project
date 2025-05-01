<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class AutoRenewSubscriptions extends Command
{
    protected $signature = 'subscriptions:renew';
    protected $description = 'Automatically renew subscriptions that are set to auto-renew and are about to expire';

    public function handle()
    {
        $today = Carbon::now()->startOfDay();

        // Subscriptions that expire today and have auto_renew enabled
        $subscriptions = Subscription::where('status', 'active')
            ->whereDate('ends_at', $today)
            ->where('auto_renew', true)
            ->get();

        foreach ($subscriptions as $subscription) {
            $plan = SubscriptionPlan::find($subscription->plan_id);

            if (!$plan) {
                $this->error("Plan not found for subscription ID: {$subscription->id}");
                continue;
            }

            // Mark the old subscription as expired
            $subscription->update(['status' => 'expired']);

            // Create a new subscription with the same plan
            $newSubscription = Subscription::create([
                'user_id' => $subscription->user_id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'price' => $plan->price,
                'duration_in_days' => $plan->duration_in_days,
                'starts_at' => Carbon::now(),
                'ends_at' => Carbon::now()->addDays($plan->duration_in_days),
                'status' => 'active',
                'auto_renew' => true,
            ]);

            $this->info("Renewed subscription for user ID: {$subscription->user_id}");
        }

        return Command::SUCCESS;
    }
}
