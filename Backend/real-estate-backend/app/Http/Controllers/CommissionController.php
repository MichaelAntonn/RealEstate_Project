<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Cost;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CommissionController extends Controller
{
    // public function monthlyProfitMargin()
    // {
    //     $months = [];

    //     for ($i = 0; $i < 4; $i++) {
    //         $date = Carbon::create(2025, 3, 22)->subMonths($i); // Fixed date for testing
    //         $startOfMonth = $date->startOfMonth();
    //         $endOfMonth = $date->endOfMonth();

    //         // Calculate total commissions for the month
    //         $commissions = Property::where('transaction_status', 'completed')
    //             ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
    //             ->sum('commission');

    //         // Calculate total costs for the month based on created_at
    //         $costs = Cost::whereBetween('created_at', [$startOfMonth, $endOfMonth])
    //             ->sum('amount');

    //         $profit = $commissions - $costs;
    //         $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;

    //         $months[] = [
    //             'month' => $date->format('F Y'),
    //             'commissions' => $commissions,
    //             'costs' => $costs,
    //             'profit' => $profit,
    //             'profit_margin' => round($profitMargin, 2) . '%'
    //         ];
    //     }

    //     return response()->json(array_reverse($months));
    // }

    // public function monthlyProfitMargin()
    // {
    //     $months = [];
    //     for ($i = 0; $i < 4; $i++) {
    //         $date = Carbon::now()->subMonths($i); // Fixed date for testing: March 22, 2025
    //         $startOfMonth = $date->startOfMonth();
    //         $endOfMonth = ($i == 0) ? Carbon::now() : $date->endOfMonth(); // Current month ends today, others end at month-end

    //         // Calculate total commissions for the month
    //         $commissions = Property::where('transaction_status', 'completed')
    //             ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
    //             ->sum('commission');

    //         // Calculate total costs for the month based on created_at
    //         $costs = Cost::whereBetween('created_at', [$startOfMonth, $endOfMonth])
    //             ->sum('amount');

    //         $profit = $commissions - $costs;
    //         $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;

    //         $months[] = [
    //             'month' => $date->format('F Y'),
    //             'commissions' => $commissions,
    //             'costs' => $costs,
    //             'profit' => $profit,
    //             'profit_margin' => round($profitMargin, 2) . '%'
    //         ];
    //     }

    //     return response()->json(array_reverse($months));
    // }


    // public function completeSale(Request $request, $id)
    // {
    //     $property = Property::findOrFail($id);

    //     $commissionRate = 0.05; // 5%
    //     $commission = $property->price * $commissionRate;

    //     $property->transaction_status = 'completed';
    //     $property->commission = $commission;
    //     $property->save();

    //     return response()->json([
    //         'message' => 'Property sale completed and commission calculated',
    //         'property' => $property
    //     ]);
    // }


    public function monthlyProfitMargin()
    {
        \Log::info("Current date: " . Carbon::now());
    
        $months = [];
        $totalPropertiesSold = 0;
        $totalNewUsers = 0;
        $totalAddedProperties = 0;
    
        $uniqueMonths = []; // Track months to prevent duplicates
    
        for ($i = 0; $i < 5; $i++) {
            $date = Carbon::now()->subMonths($i)->startOfMonth();
            $startOfMonth = $date->clone(); // Ensure start date is not modified
            $endOfMonth = ($i == 0) ? Carbon::now()->endOfDay() : $date->clone()->endOfMonth()->endOfDay();
    
            // Prevent duplicate months
            $formattedMonth = $date->format('F Y');
            if (in_array($formattedMonth, $uniqueMonths)) {
                continue;
            }
            $uniqueMonths[] = $formattedMonth;
    
            \Log::info("Month: {$formattedMonth}, Start: {$startOfMonth}, End: {$endOfMonth}");
    
            $propertiesSold = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->count();
            $totalPropertiesSold += $propertiesSold;
    
            $newUsers = User::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            \Log::info("New users for {$formattedMonth}: {$newUsers}");
            $totalNewUsers += $newUsers;
    
            $addedProperties = Property::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
            \Log::info("Added properties for {$formattedMonth}: {$addedProperties}");
            $totalAddedProperties += $addedProperties;
    
            $commissions = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->sum('commission');
            \Log::info("Commissions for {$formattedMonth}: {$commissions}");
    
            $costs = Cost::whereBetween('created_at', [$startOfMonth, $endOfMonth])->sum('amount');
            \Log::info("Costs for {$formattedMonth}: {$costs}");
    
            $profit = $commissions - $costs;
            $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;
    
            $months[] = [
                'month' => $formattedMonth,
                'properties_sold' => $propertiesSold,
                'new_users' => $newUsers,
                'added_properties' => $addedProperties,
                'commissions' => $commissions,
                'costs' => $costs,
                'profit' => $profit,
                'profit_margin' => round($profitMargin, 2) . '%'
            ];
        }
    
        return response()->json([
            'monthly_data' => array_reverse($months),
            'total_properties_sold' => $totalPropertiesSold,
            'total_new_users' => $totalNewUsers,
            'total_added_properties' => $totalAddedProperties
        ]);
    }
    

    public function commissionsOverview()
    {
        $totalCommissions = Property::where('transaction_status', 'completed')
            ->sum('commission');
        $pendingCommissions = Property::where('transaction_status', 'pending')
            ->whereNotNull('commission')
            ->sum('commission');
        $completedProperties = Property::where('transaction_status', 'completed')
            ->count();

        return response()->json([
            'total_commissions' => $totalCommissions,
            'pending_commissions' => $pendingCommissions,
            'completed_properties' => $completedProperties
        ]);
    }
}

//     public function commissionsOverview()
//     {
//         $totalCommissions = Property::where('transaction_status', 'completed')
//             ->sum('commission');
//         $pendingCommissions = Property::where('transaction_status', 'pending')
//             ->whereNotNull('commission')
//             ->sum('commission');
//         $completedProperties = Property::where('transaction_status', 'completed')
//             ->count();

//         return response()->json([
//             'total_commissions' => $totalCommissions,
//             'pending_commissions' => $pendingCommissions,
//             'completed_properties' => $completedProperties
//         ]);
//     }
// }
