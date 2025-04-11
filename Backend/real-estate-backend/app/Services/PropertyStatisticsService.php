<?php

namespace App\Services;

use App\Models\Property;
use App\Models\User;

class PropertyStatisticsService
{
    public function getPropertyStats(): array
    {
        return [
            'total_properties' => Property::count(),
            'active_listings' => Property::where('approval_status', 'accepted')->count(),
            'sold_properties' => Property::where('transaction_status', 'completed')->count(),
            'average_time_to_sell' => $this->getAverageTimeToSell()
        ];
    }

    public function getAgentPerformance(int $limit = 5): array
    {
        return User::whereHas('properties', function($query) {
                $query->where('transaction_status', 'completed');
            })
            ->withCount(['properties as completed_sales' => function($query) {
                $query->where('transaction_status', 'completed');
            }])
            ->withSum(['properties as total_commission' => function($query) {
                $query->where('transaction_status', 'completed');
            }], 'commission')
            ->orderByDesc('total_commission')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    protected function getAverageTimeToSell(): float
    {
        $result = Property::where('transaction_status', 'completed')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as average_days')
            ->first();

        return round($result->average_days ?? 0, 1);
    }
}