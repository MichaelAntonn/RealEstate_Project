<?php

namespace App\Services;

use App\Models\Cost;
use Carbon\Carbon;

class CostAnalysisService
{
    public function getCostCategories(): array
    {
        return Cost::select('category')
            ->selectRaw('SUM(amount) as total_amount')
            ->groupBy('category')
            ->orderByDesc('total_amount')
            ->get()
            ->toArray();
    }

    public function getMonthlyCosts(int $year = null): array
    {
        $year = $year ?? Carbon::now()->year;

        return Cost::selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }
}