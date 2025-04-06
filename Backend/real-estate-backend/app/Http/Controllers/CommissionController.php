<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Property;
use App\Models\Cost;
use App\Models\Setting;
use App\Models\User;
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

        return response()->json([
            'success' => true,
            'total_commissions' => $totalCommissions,
            'pending_commissions' => $pendingCommissions,
            'completed_properties' => $completedProperties
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

        return response()->json([
            'success' => true,
            'year' => $year,
            'summary' => $summary
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
}