<?php

namespace App\Services;

use App\Models\Property;
use App\Models\Cost;
use App\Models\Setting;
use Carbon\Carbon;

class CommissionCalculationService
{
    public function calculateMonthlyProfitMargins(int $monthsToShow = 6): array
    {
        $months = [];
        
        for ($i = 0; $i < $monthsToShow; $i++) {    
            $date = Carbon::now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = ($i == 0) ? Carbon::now() : $date->copy()->endOfMonth();

            $commissions = $this->getCommissions($startOfMonth, $endOfMonth);
            $costs = $this->getCosts($startOfMonth, $endOfMonth);
            $profit = $commissions - $costs;

            $months[] = [
                'month' => $date->format('F Y'),
                'commissions' => $commissions,
                'costs' => $costs,
                'profit' => $profit,
                'profit_margin' => $commissions > 0 ? round(($profit / $commissions) * 100, 2) : 0,
                'properties_sold' => $this->getCompletedPropertiesCount($startOfMonth, $endOfMonth),
                'new_listings' => $this->getNewListingsCount($startOfMonth, $endOfMonth),
            ];
        }

        return array_reverse($months);
    }

    public function completeSale(Property $property): array
    {
        $commissionRate = Setting::getCommissionRate();
        $commission = $property->price * $commissionRate;

        $property->update([
            'transaction_status' => 'completed',
            'commission' => $commission
        ]);

        return [
            'property' => $property,
            'commission_rate_applied' => $commissionRate
        ];
    }

    public function getCommissionsOverview(): array
    {
        return [
            'total_commissions' => Property::where('transaction_status', 'completed')->sum('commission'),
            'pending_commissions' => Property::where('transaction_status', 'pending')
                ->whereNotNull('commission')
                ->sum('commission'),
            'completed_properties' => Property::where('transaction_status', 'completed')->count()
        ];
    }

    public function getYearlySummary(int $year): array
    {
        $summary = [];
        for ($month = 1; $month <= 12; $month++) {
            $start = Carbon::create($year, $month, 1)->startOfMonth();
            $end = Carbon::create($year, $month, 1)->endOfMonth();

            $summary[] = [
                'month' => $start->format('F'),
                'sales' => $this->getCompletedPropertiesCount($start, $end),
                'revenue' => $this->getCommissions($start, $end),
                'new_listings' => $this->getNewListingsCount($start, $end)
            ];
        }

        return $summary;
    }

    protected function getCommissions(Carbon $start, Carbon $end): float
    {
        return Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [$start, $end])
            ->sum('commission');
    }

    protected function getCosts(Carbon $start, Carbon $end): float
    {
        return Cost::whereBetween('created_at', [$start, $end])
            ->sum('amount');
    }

    protected function getCompletedPropertiesCount(Carbon $start, Carbon $end): int
    {
        return Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [$start, $end])
            ->count();
    }

    protected function getNewListingsCount(Carbon $start, Carbon $end): int
    {
        return Property::whereBetween('created_at', [$start, $end])->count();
    }
    public function getProfitAnalysis(int $year = null): array
{
    $year = $year ?? Carbon::now()->year;
    $analysis = [];

    for ($month = 1; $month <= 12; $month++) {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = Carbon::create($year, $month, 1)->endOfMonth();

        $revenue = $this->getCommissions($start, $end);
        $costs = $this->getCosts($start, $end);
        $profit = $revenue - $costs;

        $analysis[] = [
            'month' => $start->format('F'),
            'revenue' => $revenue,
            'costs' => $costs,
            'profit' => $profit,
            'margin' => $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0,
            'cost_ratio' => $revenue > 0 ? round(($costs / $revenue) * 100, 2) : 0
        ];
    }

    return $analysis;
}
}