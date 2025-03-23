<?php
namespace App\Http\Controllers\API;
use Carbon\Carbon;
use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function completeSale(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $commissionRate = 0.05; // 5%
        $commission = $property->price * $commissionRate;

        $property->transaction_status = 'completed';
        $property->commission = $commission;
        $property->save();

        return response()->json([
            'message' => 'Property sale completed and commission calculated',
            'property' => $property
        ]);
    }

    public function monthlyProfitMargin()
    {
        $months = [];
        $fixedCosts = 50000;
    
        for ($i = 0; $i < 4; $i++) {
            $date = Carbon::create(2025, 3, 22)->subMonths($i);
            $startOfMonth = $date->startOfMonth();
            $endOfMonth = ($i == 0) ? Carbon::now() : $date->endOfMonth(); 
    
            $commissions = Property::where('transaction_status', 'completed')
                ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
                ->sum('commission');
    
            $profit = $commissions - $fixedCosts;
            $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;
    
            $months[] = [
                'month' => $date->format('F Y'),
                'commissions' => $commissions,
                'profit' => $profit,
                'profit_margin' => round($profitMargin, 2) . '%'
            ];
        }
    
        return response()->json(array_reverse($months));
    }


    
        // public function monthlyProfitMargin()
        // {
        //     dd(Carbon::now());
        //     $months = [];
    
        //     for ($i = 0; $i < 4; $i++) {
        //         $date = Carbon::now()->subMonths($i);
        //         $startOfMonth = $date->startOfMonth();
        //         $endOfMonth = $date->endOfMonth();
    
        //         $commissions = Property::where('transaction_status', 'completed')
        //             ->whereBetween('updated_at', [$startOfMonth, $endOfMonth])
        //             ->sum('commission');
    
        //         $fixedCosts = 50000; 
        //         $profit = $commissions - $fixedCosts;
        //         $profitMargin = $commissions > 0 ? ($profit / $commissions) * 100 : 0;
    
        //         $months[] = [
        //             'month' => $date->format('F Y'),
        //             'commissions' => $commissions,
        //             'profit' => $profit,
        //             'profit_margin' => round($profitMargin, 2) . '%'
        //         ];
        //     }
    
        //     return response()->json(array_reverse($months));
        // }

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