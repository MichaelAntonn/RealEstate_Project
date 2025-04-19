<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Subscription;
use Illuminate\Http\Request;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Carbon;

class SubscriptionPlanController extends Controller
{
        /**
         * Display all subscription plans
         */
        public function index(Request $request)
        {
            $this->authorizeAdmin($request);

            $plans = SubscriptionPlan::all();
            return response()->json($plans);
        }
    
        /**
         * Display a single subscription plan in detail
         */
        public function show($id, Request $request)
        {
            $this->authorizeAdmin($request);

            $plan = SubscriptionPlan::find($id);
    
            if (!$plan) {
                return response()->json(['message' => 'Subscription plan not found'], 404);
            }
    
            return response()->json($plan);
        }
    
        /**
         * Add a new subscription plan
         */
        public function store(Request $request)
        {
            $this->authorizeSuperAdmin($request);

            $validated = $request->validate([
                'name' => 'required|string|unique:subscription_plans,name',
                'price' => 'required|numeric|min:0',
                'duration_in_days' => 'required|integer|min:1',
                'description' => 'nullable|string',
                'features' => 'nullable|array',
                'max_properties_allowed' => 'required|integer',
                'is_trial' => 'required|boolean',
            ]);
    
            $plan = SubscriptionPlan::create([
                'name' => $validated['name'],
                'price' => $validated['price'],
                'duration_in_days' => $validated['duration_in_days'],
                'description' => $validated['description'] ?? null,
                'features' => $validated['features'] ?? [],
                'max_properties_allowed' => $validated['max_properties_allowed'],
                'is_trial' => $validated['is_trial'],
            ]);
    
            return response()->json(['message' => 'Subscription plan created successfully', 'plan' => $plan], 201);
        }
    
        /**
         * Update an existing subscription plan
         */
        public function update(Request $request, $id)
        {
            $this->authorizeSuperAdmin($request);

            $plan = SubscriptionPlan::find($id);
    
            if (!$plan) {
                return response()->json(['message' => 'Subscription plan not found'], 404);
            }
    
            $validated = $request->validate([
                'name' => 'sometimes|string|unique:subscription_plans,name,' . $id,
                'price' => 'sometimes|numeric|min:0',
                'duration_in_days' => 'sometimes|integer|min:1',
                'description' => 'nullable|string',
                'features' => 'nullable|array',
                'max_properties_allowed' => 'sometimes|integer',
                'is_trial' => 'sometimes|boolean',
            ]);
    
            $plan->update($validated);
    
            return response()->json(['message' => 'Subscription plan updated successfully', 'plan' => $plan]);
        }
    
        /**
         * Delete a subscription plan
         */
        public function destroy($id, Request $request)
        {
            $this->authorizeSuperAdmin($request);

            $plan = SubscriptionPlan::find($id);
    
            if (!$plan) {
                return response()->json(['message' => 'Subscription plan not found'], 404);
            }
    
            $plan->delete();
    
            return response()->json(['message' => 'Subscription plan deleted successfully']);
        }


        public function getSubscriptionReports(Request $request)
{
    $this->authorizeAdmin($request);

    $totalSubscriptions = Subscription::count();
    $activeSubscriptions = Subscription::where('status', 'active')->count();
    $expiredSubscriptions = Subscription::where('status', 'expired')->count();
    $canceledSubscriptions = Subscription::where('status', 'canceled')->count();
    
    $expiringThisWeek = Subscription::where('status', 'active')
        ->whereBetween('ends_at', [Carbon::now(), Carbon::now()->addDays(7)])
        ->count();

    return response()->json([
        'total_subscriptions' => $totalSubscriptions,
        'active_subscriptions' => $activeSubscriptions,
        'expired_subscriptions' => $expiredSubscriptions,
        'canceled_subscriptions' => $canceledSubscriptions,
        'expiring_this_week' => $expiringThisWeek,
        'report_date' => Carbon::now()->toDateTimeString()
    ]);
}
public function checkExpiredSubscriptions(Request $request)
{
    $this->authorizeAdmin($request);

    $expiredSubscriptions = Subscription::where('ends_at', '<=', Carbon::now())
        ->where('status', 'active')
        ->get();

    foreach ($expiredSubscriptions as $subscription) {
        $subscription->update(['status' => 'expired']);
        
        // notifications
    }

    return response()->json([
        'message' => 'Expired subscriptions checked.',
        'count' => $expiredSubscriptions->count()
    ]);
}

        /**
         * Ensure the user is an admin or super-admin
         */
        protected function authorizeAdmin(Request $request): void
        {
            if (!in_array($request->user()->user_type, [UserType::SUPER_ADMIN, UserType::ADMIN])) {
                abort(403, 'Forbidden. Only admins can perform this action.');
            }
        }

        /**
         * Ensure the user is a super-admin
         */
        protected function authorizeSuperAdmin(Request $request): void
        {
            if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
                abort(403, 'Forbidden. Only super-admins can perform this action.');
            }
        }
}
