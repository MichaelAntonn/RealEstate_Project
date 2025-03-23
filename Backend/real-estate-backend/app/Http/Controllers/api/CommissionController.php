<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    // إتمام البيع وحساب العمولة
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

    // لوحة إجمالي الأرباح من العمولات
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