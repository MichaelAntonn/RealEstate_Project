<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function subscribeCompany(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id', 
            'price' => 'required|numeric',
            'duration_in_days' => 'required|integer|min:1',
        ]);
    
        $company = Auth::user(); 
    
        $startsAt = Carbon::now();
        $endsAt = $startsAt->copy()->addDays($request->duration_in_days);
    
        $plan = SubscriptionPlan::findOrFail($request->plan_id); 
    
        $subscription = Subscription::create([
            'company_id' => $company->company_id,
            'plan_id' => $plan->id, 
            'price' => $plan->price,
            'duration_in_days' => $request->duration_in_days,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'active',
        ]);
    
        return response()->json(['message' => 'Subscription created successfully.', 'subscription' => $subscription]);
    }
    

    public function show($id)
    {
        // Load company with its subscription
        $company = Company::with('subscription')->find($id);

        if (!$company) {
            return response()->json(['message' => 'Company not found'], 404);
        }

        return response()->json([
            'company' => $company,
            'subscription_status' => $company->subscription?->status ?? 'no subscription',
            'subscription_details' => $company->subscription,
        ]);
    }

    public function subscribe(Request $request)
{
    $request->validate([
        'plan_id' => 'required|exists:subscription_plans,id', 
    ]);

    $company = Auth::user(); 

    $plan = SubscriptionPlan::findOrFail($request->plan_id); 

    $startsAt = Carbon::now();
    $endsAt = $startsAt->copy()->addDays($plan->duration_in_days);

    $subscription = Subscription::create([
        'company_id' => $company->company_id,
        'plan_id' => $plan->id, 
        'price' => $plan->price,
        'duration_in_days' => $plan->duration_in_days,
        'starts_at' => $startsAt,
        'ends_at' => $endsAt,
        'status' => 'active',
    ]);

    return response()->json([
        'message' => 'Subscription successful.',
        'subscription' => $subscription
    ]);
}


    public function subscribeToTrial(Request $request)
    {
        $company = Auth::user();

        // Check if company already used the trial
        if ($company->has_used_trial) {
            return response()->json(['message' => 'Trial already used.'], 403);
        }

        // Get the trial plan
        $trialPlan = SubscriptionPlan::where('is_trial', true)->first();

        if (!$trialPlan) {
            return response()->json(['message' => 'No trial plan available.'], 404);
        }

        $startsAt = Carbon::now();
        $endsAt = $startsAt->copy()->addDays($trialPlan->duration_in_days);

        Subscription::create([
            'company_id' => $company->company_id,
            'plan_id' => $trialPlan->id,
            'price' => 0.00,
            'duration_in_days' => $trialPlan->duration_in_days,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'active',
        ]);

        $company->update(['has_used_trial' => true]);

        return response()->json(['message' => 'Trial subscription activated.']);
    }

    /**
     * Get all available subscription plans (for both authenticated and unauthenticated users)
     */
    public function getPlans()
    {
        $plans = SubscriptionPlan::where('is_trial', false)
            ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features','max_properties_allowed'])
            ->get()
            ->map(function ($plan) {
                $plan->features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
                return $plan;
            });

        return response()->json($plans);
    }

    /**
     * Get trial plan (for both authenticated and unauthenticated users)
     */
    public function getTrialPlan()
    {
        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->select(['id', 'name', 'duration_in_days', 'description', 'features','max_properties_allowed'])
            ->first();
        
        if (!$trialPlan) {
            return response()->json(['message' => 'No trial plan available'], 404);
        }
        
        // Ensure features is properly formatted
        $trialPlan->features = is_array($trialPlan->features) ? $trialPlan->features : json_decode($trialPlan->features, true);
        
        return response()->json($trialPlan);
    }

    /**
     * Get all plans including trial (for registration page)
     */
    public function getAllPlansForRegistration()
    {
        $regularPlans = SubscriptionPlan::where('is_trial', false)
            ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features','max_properties_allowed'])
            ->get()
            ->map(function ($plan) {
                $plan->features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
                return $plan;
            });

        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->select(['id', 'name', 'duration_in_days', 'description', 'features','max_properties_allowed'])
            ->first();

        if ($trialPlan) {
            $trialPlan->features = is_array($trialPlan->features) ? $trialPlan->features : json_decode($trialPlan->features, true);
        }

        return response()->json([
            'regular_plans' => $regularPlans,
            'trial_plan' => $trialPlan,
        ]);
    }
    public function cancelSubscription()
    {
        // Get the company associated with the currently authenticated user
        $company = Auth::user()->company; 
        
        // Find the active subscription for the company
        $subscription = Subscription::where('company_id', $company->company_id)
                                    ->where('status', 'active')
                                    ->first();
    
        // If no active subscription is found
        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }
    
        // Update the subscription status to "canceled"
        $subscription->update(['status' => 'canceled']);
    
        // Optionally, log the cancellation event for tracking
        // Log::info('Subscription canceled', ['subscription_id' => $subscription->id]);
    
        return response()->json(['message' => 'Subscription has been canceled successfully.']);
    }
    
    public function updateSubscription(Request $request, $id)
    {
        // Get the company associated with the currently authenticated user
        $company = Auth::user()->company;
    
        // Check if the subscription exists and belongs to the company
        $subscription = Subscription::where('company_id', $company->company_id)
            ->where('id', $id)
            ->first();
    
        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found or does not belong to this company'], 404);
        }
    
        // Validate the incoming request data
        $validatedData = $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id', // Ensure the plan exists in subscription_plans table
            'status' => 'nullable|in:active,canceled,pending', // Status must be one of the valid options
            'expiry_date' => 'nullable|date', // Validate the expiry date
        ]);
    
        // Check if any of the validated data has changed
        $changes = [];
        foreach ($validatedData as $key => $value) {
            if ($subscription->$key != $value) {
                $changes[$key] = $value;
            }
        }
    
        // If there are any changes, update the subscription
        if (!empty($changes)) {
            $subscription->update($changes);
            return response()->json(['message' => 'Subscription updated successfully', 'subscription' => $subscription]);
        }
    
        return response()->json(['message' => 'No changes detected for the subscription'], 400);
    }

public function getUpcomingExpirations(Request $request)
{
    $days = $request->input('days', 7); 
    $upcomingExpirations = Subscription::where('status', 'active')
        ->whereBetween('ends_at', [Carbon::now(), Carbon::now()->addDays($days)])
        ->with('company')
        ->orderBy('ends_at')
        ->get();

    return response()->json([
        'upcoming_expirations' => $upcomingExpirations,
        'days_threshold' => $days
    ]);
}
public function getCurrentSubscriptionStatus()
{
    $company = Auth::user();
    
    $subscription = Subscription::where('company_id', $company->company_id)
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

