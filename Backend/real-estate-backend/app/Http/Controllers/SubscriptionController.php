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
            'plan_name' => 'required|string',
            'price' => 'required|numeric',
            'duration_in_days' => 'required|integer|min:1',
        ]);

        $company = Auth::user(); 

        $startsAt = Carbon::now();
        $endsAt = $startsAt->copy()->addDays($request->duration_in_days);

        $subscription = Subscription::create([
            'company_id' => $company->company_id,
            'plan_name' => $request->plan_name,
            'price' => $request->price,
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
            ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features'])
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
            ->select(['id', 'name', 'duration_in_days', 'description', 'features'])
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
            ->select(['id', 'name', 'price', 'duration_in_days', 'description', 'features'])
            ->get()
            ->map(function ($plan) {
                $plan->features = is_array($plan->features) ? $plan->features : json_decode($plan->features, true);
                return $plan;
            });

        $trialPlan = SubscriptionPlan::where('is_trial', true)
            ->select(['id', 'name', 'duration_in_days', 'description', 'features'])
            ->first();

        if ($trialPlan) {
            $trialPlan->features = is_array($trialPlan->features) ? $trialPlan->features : json_decode($trialPlan->features, true);
        }

        return response()->json([
            'regular_plans' => $regularPlans,
            'trial_plan' => $trialPlan,
        ]);
    }
}