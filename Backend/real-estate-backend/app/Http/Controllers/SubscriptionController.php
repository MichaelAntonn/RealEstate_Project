<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Notifications\SubscriptionCanceled;
use App\Notifications\SubscriptionCreated;
use App\Notifications\SubscriptionPending;
use App\Notifications\TrialSubscriptionActivated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth as FacadesAuth;

class SubscriptionController extends Controller
{
    public function subscribe(Request $request)
    {
        $user = Auth::user();

        // // Check if the user already has an active subscription
        // $existingSubscription = Subscription::where('user_id', $user->id)
        //     ->whereIn('status', ['active', 'pending'])
        //     ->first();


        //     // If the user has an active subscription, prevent them from having more than one
        // if ($existingSubscription) {
        //     return response()->json(['message' => 'You already have an active or pending subscription.'], 400);

        // }

        // Validate the request data
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'auto_renew' => 'required|boolean'
        ]);

        // Get the authenticated user and the selected subscription plan
        $user = Auth::user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $autoRenew = $request->boolean('auto_renew');

        // Create the new subscription with a 'pending' status
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'duration_in_days' => $plan->duration_in_days,
            'starts_at' => null,
            'ends_at' => null,
            'status' => 'pending',
            'auto_renew' => $autoRenew,
        ]);

        $user->notify(new SubscriptionCreated($subscription));

        // Return a response indicating the subscription is created and awaiting payment
        return response()->json([
            'message' => 'Subscription created and waiting for payment.',
            'subscription' => $subscription,
        ]);
    }

    public function subscribeToTrial(Request $request)
    {
        // Get the current user
        $user = Auth::user();

        // Check if the user has used the trial plan before
        if ($user->has_used_trial) {
            return response()->json(['message' => 'Trial already used.'], 403);
        }

        // Get the trial plan
        $trialPlan = SubscriptionPlan::where('is_trial', true)->first();

        if (!$trialPlan) {
            return response()->json(['message' => 'No trial plan available.'], 404);
        }

        // Set the start and end date
        $startsAt = Carbon::now();
        $endsAt = $startsAt->copy()->addDays($trialPlan->duration_in_days);

        // Create the trial subscription for the user
        $subscription = Subscription::create([
            'user_id' => $user->id,  // Replace company_id with user_id
            'plan_id' => $trialPlan->id,
            'plan_name' => $trialPlan->name,
            'price' => 0.00,  // Free subscription
            'duration_in_days' => $trialPlan->duration_in_days,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'active',
        ]);

        // Update user to mark trial as used
        $user->update(['has_used_trial' => true]);

        // TrialSubscriptionActivated
        $user->notify(new TrialSubscriptionActivated($subscription));


        return response()->json(['message' => 'Trial subscription activated.']);
    }

    public function cancelSubscription()
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found.'], 404);
        }

        $subscription->update(['status' => 'canceled']);

        $user->notify(new SubscriptionCanceled($subscription));


        return response()->json(['message' => 'Subscription has been canceled successfully.']);
    }

    public function renewSubscription()
    {
        $userId = Auth::id(); // Get the logged-in user's id automatically

        $subscription = Subscription::where('user_id', $userId)
            ->whereIn('status', ['active', 'expired'])
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No subscription found for the user.'], 404);
        }

        $plan = SubscriptionPlan::find($subscription->plan_id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }

        $startsAt = now();
        $endsAt = $startsAt->copy()->addDays($plan->duration_in_days);

        $newSubscription = Subscription::create([
            'user_id' => $userId,
            'plan_id' => $subscription->plan_id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'duration_in_days' => $plan->duration_in_days,
            'starts_at' => null,
            'ends_at' => null,
            'status' => 'pending',
            'auto_renew' => $subscription->auto_renew,
        ]);

        Auth::user()->notify(new SubscriptionPending($newSubscription));

        return response()->json([
            'message' => 'Subscription renewed successfully.',
            'subscription' => $newSubscription
        ], 200);
    }

    // public function changePlan(Request $request)
    // {
    //     $request->validate([
    //         'new_plan_id' => 'required|exists:subscription_plans,id',
    //     ]);

    //     $user = Auth::user();
    //     $newPlan = SubscriptionPlan::findOrFail($request->new_plan_id);

    //     // Get the current subscription
    //     $subscription = Subscription::where('user_id', $user->id)
    //         ->where('status', 'active')
    //         ->first();

    //     if (!$subscription) {
    //         return response()->json(['message' => 'No active subscription found'], 404);
    //     }

    //     // Change the subscription plan
    //     $subscription->update([
    //         'plan_id' => $newPlan->id,
    //         'plan_name' => $newPlan->name,
    //         'price' => $newPlan->price,
    //         'duration_in_days' => $newPlan->duration_in_days,
    //         'ends_at' => Carbon::now()->addDays($newPlan->duration_in_days),
    //     ]);

    //     return response()->json(['message' => 'Plan changed successfully', 'subscription' => $subscription]);
    // }

    public function autoRenewSubscription($userId)
    {
        $subscription = Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->where('auto_renew', true)  // Make sure the subscription has auto-renew enabled
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription with auto-renew found.'], 404);
        }

        $plan = SubscriptionPlan::find($subscription->plan_id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found.'], 404);
        }

        // Calculate renewal dates
        $startsAt = Carbon::now();
        $endsAt = Carbon::now()->addDays($plan->duration_in_days);

        // Renew the subscription
        $newSubscription = Subscription::create([
            'user_id' => $subscription->user_id,
            'plan_id' => $subscription->plan_id,
            'plan_name' => $plan->name,
            'price' => $plan->price,
            'duration_in_days' => $plan->duration_in_days,
            'starts_at' => null,
            'ends_at' => null,
            'status' => 'pending',
            'auto_renew' => true, // Auto-renew
        ]);

        return response()->json(['message' => 'Subscription auto-renewed successfully', 'subscription' => $newSubscription]);
    }
    public function getPropertyLimitStatus()
    {
        $user = Auth::user();

        $activeSubscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$activeSubscription) {
            return response()->json(['message' => 'No active subscription found.'], 404);
        }

        $plan = SubscriptionPlan::find($activeSubscription->plan_id);

        if (!$plan) {
            return response()->json(['message' => 'Subscription plan not found.'], 404);
        }

        // احسب عدد العقارات اللي أنشأها المستخدم
        $propertiesCount = \App\Models\Property::where('user_id', $user->id)->count(); // غيّر اسم الموديل لو مختلف

        $maxAllowed = $plan->max_properties_allowed;
        $remaining = max(0, $maxAllowed - $propertiesCount);

        return response()->json([
            'max_allowed' => $maxAllowed,
            'used' => $propertiesCount,
            'remaining' => $remaining,
        ]);
    }

    public function cancelAutoRenewSubscription()
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('auto_renew', true) // Ensure subscription has auto-renew
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription with auto-renew found.'], 404);
        }

        $subscription->update(['auto_renew' => false]);

        return response()->json(['message' => 'Auto-renewal has been disabled for your subscription.']);
    }

    public function getPlans()
    {
        $plans = SubscriptionPlan::where('is_trial', false)
            ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features', 'max_properties_allowed'])
            ->get()
            ->map(function ($plan) {
                $plan->features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
                return $plan;
            });

        return response()->json($plans);
    }

    public function getTrialPlan()
    {
        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->select(['id', 'name', 'duration_in_days', 'description', 'features', 'max_properties_allowed'])
            ->first();

        if (!$trialPlan) {
            return response()->json(['message' => 'No trial plan available'], 404);
        }

        $trialPlan->features = is_array($trialPlan->features) ? $trialPlan->features : json_decode($trialPlan->features, true);

        return response()->json($trialPlan);
    }

    public function getAllPlansForRegistration()
    {
        $user = Auth::user();
        $regularPlans = SubscriptionPlan::where('is_trial', false)
        ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features', 'max_properties_allowed'])
        ->get()
        ->map(function ($plan) {
            $plan->features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
            return $plan;
        });

    $trialPlan = null;

    if (!$user->has_used_trial) {
        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->select(['id', 'name', 'duration_in_days', 'description', 'features', 'max_properties_allowed'])
            ->first();

        if ($trialPlan) {
            $trialPlan->features = is_array($trialPlan->features) ? $trialPlan->features : json_decode($trialPlan->features, true);
        }
    }

    return response()->json([
        'regular_plans' => $regularPlans,
        'trial_plan' => $trialPlan,
    ]);
    }

    public function getUpcomingExpirations(Request $request)
    {
        $days = $request->input('days', 7);
        $upcomingExpirations = Subscription::where('status', 'active')
            ->whereBetween('ends_at', [Carbon::now(), Carbon::now()->addDays($days)])
            ->with('user')
            ->orderBy('ends_at')
            ->get();

        return response()->json([
            'upcoming_expirations' => $upcomingExpirations,
            'days_threshold' => $days
        ]);
    }

    public function getCurrentSubscriptionStatus()
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        $now = Carbon::now();
        $endsAt = Carbon::parse($subscription->ends_at);

        $data = [
            'plan_name' => $subscription->plan_name,
            'status' => $subscription->status,
            'start_date' => $subscription->starts_at,
            'end_date' => $subscription->ends_at,
            'days_remaining' => $now->diffInDays($endsAt, false),
            'is_expired' => $now->greaterThan($endsAt),
            'is_near_expiration' => $now->diffInDays($endsAt, false) <= 7
        ];

        return response()->json($data);
    }
}
