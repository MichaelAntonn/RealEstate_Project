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
            ->map(function($item) {
                return [
                    'category' => $item->category,
                    'total_amount' => $item->total_amount,
                    'percentage' => $this->getPercentageOfTotal($item->total_amount)
                ];
            })
            ->toArray();
    }

    public function getMonthlyCosts(int $year = null): array
    {
        $year = $year ?? Carbon::now()->year;
        $months = [];

        for ($month = 1; $month <= 12; $month++) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $fixedCosts = Cost::where('type', Cost::TYPE_FIXED)
                ->whereBetween('created_at', [$start, $end])
                ->sum('amount');

            $variableCosts = Cost::where('type', Cost::TYPE_VARIABLE)
                ->whereBetween('created_at', [$start, $end])
                ->sum('amount');

            $months[] = [
                'month' => $start->format('F'),
                'total' => $fixedCosts + $variableCosts,
                'fixed_costs' => $fixedCosts,
                'variable_costs' => $variableCosts,
                'year' => $year
            ];
        }

        return $months;
    }

    public function getCostTrends(int $months = 12): array
    {
        $trends = [];
        $now = Carbon::now();

        for ($i = 0; $i < $months; $i++) {
            $date = $now->copy()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $total = Cost::whereBetween('created_at', [$start, $end])->sum('amount');

            $trends[] = [
                'month' => $date->format('Y-m'),
                'total' => $total,
                'fixed' => Cost::where('type', Cost::TYPE_FIXED)
                    ->whereBetween('created_at', [$start, $end])
                    ->sum('amount'),
                'variable' => Cost::where('type', Cost::TYPE_VARIABLE)
                    ->whereBetween('created_at', [$start, $end])
                    ->sum('amount')
            ];
        }

        return array_reverse($trends);
    }

    protected function getPercentageOfTotal(float $amount): float
    {
        $total = Cost::sum('amount');
        return $total > 0 ? round(($amount / $total) * 100, 2) : 0;
    }
}