<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getFinancialSettings(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view financial settings.'], 403);
        }

        return response()->json([
            'success' => true,
            'commission_rate' => Setting::getCommissionRate(),
            'status' => 'success'
        ]);
    }
    
    public function updateCommissionRate(Request $request)
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can update commission rate.'], 403);
        }

        $validated = $request->validate([
            'commission_rate' => 'required|numeric|min:0|max:1'
        ]);
        
        Setting::updateOrCreate(
            ['key' => 'commission_rate'],
            [
                'value' => $validated['commission_rate'], 
                'group' => 'financial'
            ]
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Commission rate updated successfully',
            'new_rate' => (float)$validated['commission_rate']
        ]);
    }
}