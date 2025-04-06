<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Property;
use App\Models\Cost;
use App\Models\Setting;
use App\Models\User;
use App\Models\Goal;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CommissionController extends Controller
{
    public function monthlyProfitMargin(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can access commission data.'], 403);
        }

        $months = [];
        for ($i = 0; $i < 4; $i++) {
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = ($i == 0) ? Carbon::now() : $date->copy()->endOfMonth();

            $commissions = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->sum('commission');

            $costs = Cost::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $propertiesSold = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->count();

            $newListings = Property::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $profit = $commissions - $costs;
            $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;

            $months[] = [
                'month' => $date->format('F Y'),
                'commissions' => $commissions,
                'costs' => $costs,
                'profit' => $profit,
                'profit_margin' => round($profitMargin, 2),
                'properties_sold' => $propertiesSold,
                'new_listings' => $newListings,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => array_reverse($months)
        ]);
    }

    public function completeSale(Request $request, $id)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can complete sales.'], 403);
        }

        $property = Property::findOrFail($id);
        
        if ($property->transaction_status === 'completed') {
            return response()->json(['error' => 'Property sale already completed'], 400);
        }

        $commissionRate = Setting::getCommissionRate();
        $commission = $property->price * $commissionRate;

        $property->transaction_status = 'completed';
        $property->commission = $commission;
        $property->save();

        return response()->json([
            'success' => true,
            'message' => 'Property sale completed and commission calculated',
            'property' => $property,
            'commission_rate_applied' => $commissionRate
        ]);
    }

    public function commissionsOverview(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view commissions overview.'], 403);
        }

        $totalCommissions = Property::where('transaction_status', 'completed')
            ->sum('commission');
            
        $pendingCommissions = Property::where('transaction_status', 'pending')
            ->whereNotNull('commission')
            ->sum('commission');
            
        $completedProperties = Property::where('transaction_status', 'completed')
            ->count();

        // Get current month's goal progress
        $currentMonthGoal = Goal::where('type', 'monthly_sales')
            ->whereDate('start_date', '<=', Carbon::now()->endOfMonth())
            ->whereDate('end_date', '>=', Carbon::now()->startOfMonth())
            ->first();

        $currentMonthSales = Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [Carbon::now()->startOfMonth(), Carbon::now()])
            ->sum('commission');

        $goalProgress = null;
        if ($currentMonthGoal) {
            $goalProgress = [
                'target' => $currentMonthGoal->target_amount,
                'current' => $currentMonthSales,
                'progress' => $currentMonthGoal->target_amount > 0 
                    ? min(100, ($currentMonthSales / $currentMonthGoal->target_amount) * 100)
                    : 0,
                'goal_name' => $currentMonthGoal->name
            ];
        }

        return response()->json([
            'success' => true,
            'total_commissions' => $totalCommissions,
            'pending_commissions' => $pendingCommissions,
            'completed_properties' => $completedProperties,
            'current_month_goal' => $goalProgress
        ]);
    }

    public function propertyStatistics(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view property statistics.'], 403);
        }

        $totalProperties = Property::count();
        $activeListings = Property::where('approval_status', 'accepted')->count();
        $soldProperties = Property::where('transaction_status', 'completed')->count();
        $averageTimeToSell = Property::where('transaction_status', 'completed')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as average_days')
            ->first()->average_days;

        return response()->json([
            'success' => true,
            'total_properties' => $totalProperties,
            'active_listings' => $activeListings,
            'sold_properties' => $soldProperties,
            'average_time_to_sell' => round($averageTimeToSell, 1)
        ]);
    }

    public function agentPerformance(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view agent performance.'], 403);
        }

        $topAgents = User::whereHas('properties', function($query) {
                $query->where('transaction_status', 'completed');
            })
            ->withCount(['properties as completed_sales' => function($query) {
                $query->where('transaction_status', 'completed');
            }])
            ->withSum(['properties as total_commission' => function($query) {
                $query->where('transaction_status', 'completed');
            }], 'commission')
            ->orderByDesc('total_commission')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'top_agents' => $topAgents
        ]);
    }

    public function yearlySummary(Request $request, $year = null)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view yearly summary.'], 403);
        }

        $year = $year ?? Carbon::now()->year;
        
        $summary = [];
        for ($month = 1; $month <= 12; $month++) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $summary[] = [
                'month' => $start->format('F'),
                'sales' => Property::where('transaction_status', 'completed')
                    ->whereBetween('updated_at', [$start, $end])
                    ->count(),
                'revenue' => Property::where('transaction_status', 'completed')
                    ->whereBetween('updated_at', [$start, $end])
                    ->sum('commission'),
                'new_listings' => Property::whereBetween('created_at', [$start, $end])
                    ->count()
            ];
        }

        // Get yearly goal if exists
        $yearlyGoal = Goal::where('type', 'yearly_sales')
            ->whereYear('start_date', $year)
            ->whereYear('end_date', $year)
            ->first();

        if ($yearlyGoal) {
            $totalYearRevenue = array_sum(array_column($summary, 'revenue'));
            $yearlyProgress = [
                'target' => $yearlyGoal->target_amount,
                'current' => $totalYearRevenue,
                'progress' => $yearlyGoal->target_amount > 0 
                    ? min(100, ($totalYearRevenue / $yearlyGoal->target_amount) * 100)
                    : 0,
                'goal_name' => $yearlyGoal->name
            ];
        }

        return response()->json([
            'success' => true,
            'year' => $year,
            'summary' => $summary,
            'yearly_goal' => $yearlyProgress ?? null
        ]);
    }

    public function costAnalysis(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view cost analysis.'], 403);
        }

        $categories = Cost::select('category')
            ->selectRaw('SUM(amount) as total_amount')
            ->groupBy('category')
            ->orderByDesc('total_amount')
            ->get();

        $monthlyCosts = Cost::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories,
            'monthly_costs' => $monthlyCosts
        ]);
    }

    /**
     * Goal Tracking Methods
     */
    public function setSalesGoal(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can set goals.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:monthly_sales,yearly_sales,new_listings,agent_performance',
            'target_amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $goal = Goal::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Goal set successfully',
            'goal' => $goal
        ]);
    }

    public function getGoalsProgress(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view goals.'], 403);
        }

        $goals = Goal::with('user')->get()->map(function ($goal) {
            $currentValue = 0;
            
            switch ($goal->type) {
                case 'monthly_sales':
                    $currentValue = Property::where('transaction_status', 'completed')
                        ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
                        ->sum('commission');
                    break;
                    
                case 'yearly_sales':
                    $currentValue = Property::where('transaction_status', 'completed')
                        ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
                        ->sum('commission');
                    break;
                    
                case 'new_listings':
                    $currentValue = Property::whereBetween('created_at', [$goal->start_date, $goal->end_date])
                        ->count();
                    break;
                    
                case 'agent_performance':
                    if ($goal->user_id) {
                        $currentValue = Property::where('user_id', $goal->user_id)
                            ->where('transaction_status', 'completed')
                            ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
                            ->sum('commission');
                    }
                    break;
            }

            $progress = $goal->target_amount > 0 
                ? min(100, ($currentValue / $goal->target_amount) * 100 )
                : 0;

            return [
                'id' => $goal->id,
                'name' => $goal->name,
                'type' => $goal->type,
                'target_amount' => $goal->target_amount,
                'current_value' => $currentValue,
                'progress' => round($progress, 2),
                'start_date' => $goal->start_date->format('Y-m-d'),
                'end_date' => $goal->end_date->format('Y-m-d'),
                'user' => $goal->user ? $goal->user->only(['id', 'name', 'email']) : null,
                'time_remaining' => now()->diffInDays($goal->end_date, false)
            ];
        });

        return response()->json([
            'success' => true,
            'goals' => $goals
        ]);
    }

    public function monthlyProfitMarginWithGoals(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can access commission data.'], 403);
        }

        $months = [];
        for ($i = 0; $i < 6; $i++) { // Show last 6 months for better context
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = ($i == 0) ? Carbon::now() : $date->copy()->endOfMonth();

            $commissions = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->sum('commission');

            $costs = Cost::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->sum('amount');

            $propertiesSold = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->count();

            $newListings = Property::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $profit = $commissions - $costs;
            $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;

            $months[] = [
                'month' => $date->format('F Y'),
                'commissions' => $commissions,
                'costs' => $costs,
                'profit' => $profit,
                'profit_margin' => round($profitMargin, 2),
                'properties_sold' => $propertiesSold,
                'new_listings' => $newListings,
            ];
        }

        // Add goals to each month
        foreach ($months as &$month) {
            $monthDate = Carbon::createFromFormat('F Y', $month['month']);
            $startOfMonth = $monthDate->copy()->startOfMonth();
            $endOfMonth = $monthDate->copy()->endOfMonth();
            
            $monthlyGoals = Goal::where('type', 'monthly_sales')
                ->whereDate('start_date', '<=', $endOfMonth)
                ->whereDate('end_date', '>=', $startOfMonth)
                ->get();
                
            $month['goals'] = $monthlyGoals->map(function ($goal) use ($month) {
                $progress = $goal->target_amount > 0 
                    ? min(100, ($month['commissions'] / $goal->target_amount) * 100) 
                    : 0;
                    
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'target' => $goal->target_amount,
                    'current' => $month['commissions'],
                    'progress' => round($progress, 2)
                ];
            });
        }

        return response()->json([
            'success' => true,
            'data' => array_reverse($months)
        ]);
    }

    public function getGoalDetails(Request $request, $id)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view goal details.'], 403);
        }

        $goal = Goal::with('user')->findOrFail($id);

        $currentValue = 0;
        $details = [];
        
        switch ($goal->type) {
            case 'monthly_sales':
            case 'yearly_sales':
                $properties = Property::where('transaction_status', 'completed')
                    ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
                    ->with('user')
                    ->get();
                
                $currentValue = $properties->sum('commission');
                $details['properties'] = $properties;
                break;
                
            case 'new_listings':
                $properties = Property::whereBetween('created_at', [$goal->start_date, $goal->end_date])
                    ->with('user')
                    ->get();
                
                $currentValue = $properties->count();
                $details['listings'] = $properties;
                break;
                
            case 'agent_performance':
                if ($goal->user_id) {
                    $properties = Property::where('user_id', $goal->user_id)
                        ->where('transaction_status', 'completed')
                        ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
                        ->get();
                    
                    $currentValue = $properties->sum('commission');
                    $details['properties'] = $properties;
                }
                break;
        }

        $progress = $goal->target_amount > 0 
            ? min(100, ($currentValue / $goal->target_amount) * 100 )
            : 0;

        return response()->json([
            'success' => true,
            'goal' => $goal,
            'current_value' => $currentValue,
            'progress' => round($progress, 2),
            'time_remaining' => now()->diffInDays($goal->end_date, false),
            'details' => $details
        ]);
    }
    public function createYearlyGoal(Request $request)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can set goals.'], 403);
    }

    $validated = $request->validate([
        'year' => 'required|integer|min:2000|max:2100',
        'target_amount' => 'required|numeric|min:0',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string'
    ]);

    // Check if goal already exists for this year
    $existingGoal = Goal::where('type', 'yearly_sales')
        ->whereYear('start_date', $validated['year'])
        ->first();

    if ($existingGoal) {
        return response()->json([
            'error' => 'A yearly goal already exists for ' . $validated['year']
        ], 409);
    }

    $goal = Goal::create([
        'name' => $validated['name'],
        'type' => 'yearly_sales',
        'target_amount' => $validated['target_amount'],
        'start_date' => Carbon::create($validated['year'], 1, 1)->startOfYear(),
        'end_date' => Carbon::create($validated['year'], 12, 31)->endOfYear(),
        'description' => $validated['description'] ?? null
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Yearly goal created successfully',
        'goal' => $goal
    ]);
}

public function getYearlyGoals(Request $request)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can view goals.'], 403);
    }

    $goals = Goal::where('type', 'yearly_sales')
        ->orderBy('start_date', 'desc')
        ->get()
        ->map(function ($goal) {
            return $this->formatYearlyGoalWithProgress($goal);
        });

    return response()->json([
        'success' => true,
        'goals' => $goals
    ]);
}

public function getYearlyGoalDetails(Request $request, $year)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can view goals.'], 403);
    }

    $goal = Goal::where('type', 'yearly_sales')
        ->whereYear('start_date', $year)
        ->firstOrFail();

    return response()->json([
        'success' => true,
        'goal' => $this->formatYearlyGoalWithProgress($goal)
    ]);
}

public function updateYearlyGoal(Request $request, $id)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can update goals.'], 403);
    }

    $validated = $request->validate([
        'target_amount' => 'required|numeric|min:0',
        'name' => 'required|string|max:255',
        'description' => 'nullable|string'
    ]);

    $goal = Goal::where('type', 'yearly_sales')
        ->findOrFail($id);

    $goal->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Yearly goal updated successfully',
        'goal' => $this->formatYearlyGoalWithProgress($goal)
    ]);
}

public function deleteYearlyGoal(Request $request, $id)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can delete goals.'], 403);
    }

    $goal = Goal::where('type', 'yearly_sales')
        ->findOrFail($id);

    $goal->delete();

    return response()->json([
        'success' => true,
        'message' => 'Yearly goal deleted successfully'
    ]);
}

public function getYearlyGoalProgress(Request $request, $year)
{
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can view goals.'], 403);
    }

    $goal = Goal::where('type', 'yearly_sales')
        ->whereYear('start_date', $year)
        ->firstOrFail();

    $monthlyProgress = [];
    $totalCommission = 0;

    for ($month = 1; $month <= 12; $month++) {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = Carbon::create($year, $month, 1)->endOfMonth();

        $monthCommission = Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [$start, $end])
            ->sum('commission');

        $totalCommission += $monthCommission;

        $monthlyProgress[] = [
            'month' => $start->format('F'),
            'commission' => $monthCommission,
            'cumulative' => $totalCommission,
            'target' => ($goal->target_amount / 12) * $month,
            'progress_percentage' => $goal->target_amount > 0 
                ? min(100, ($totalCommission / $goal->target_amount) * 100)
                : 0
        ];
    }

    return response()->json([
        'success' => true,
        'goal' => $this->formatYearlyGoalWithProgress($goal),
        'monthly_progress' => $monthlyProgress,
        'yearly_summary' => [
            'target' => $goal->target_amount,
            'actual' => $totalCommission,
            'progress_percentage' => $goal->target_amount > 0 
                ? min(100, ($totalCommission / $goal->target_amount) * 100)
                : 0,
            'remaining' => max(0, $goal->target_amount - $totalCommission)
        ]
    ]);
}

// Helper method
protected function formatYearlyGoalWithProgress(Goal $goal)
{
    $currentCommission = Property::where('transaction_status', 'completed')
        ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
        ->sum('commission');

    $progress = $goal->target_amount > 0 
        ? min(100, ($currentCommission / $goal->target_amount) * 100)
        : 0;

    return [
        'id' => $goal->id,
        'year' => $goal->start_date->format('Y'),
        'name' => $goal->name,
        'description' => $goal->description,
        'target_amount' => $goal->target_amount,
        'current_amount' => $currentCommission,
        'progress_percentage' => round($progress, 2),
        'start_date' => $goal->start_date->format('Y-m-d'),
        'end_date' => $goal->end_date->format('Y-m-d'),
        'created_at' => $goal->created_at,
        'updated_at' => $goal->updated_at,
        'time_remaining' => now()->diffInDays($goal->end_date, false)
    ];
}
}