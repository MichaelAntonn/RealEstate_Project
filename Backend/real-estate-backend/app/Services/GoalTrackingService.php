<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\Property;
use Carbon\Carbon;

class GoalTrackingService
{
    public function getMonthlyGoalProgress(): ?array
    {
        $currentMonthGoal = Goal::where('type', 'monthly_sales')
            ->whereDate('start_date', '<=', Carbon::now()->endOfMonth())
            ->whereDate('end_date', '>=', Carbon::now()->startOfMonth())
            ->first();

        if (!$currentMonthGoal) {
            return null;
        }

        $currentMonthSales = Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [Carbon::now()->startOfMonth(), Carbon::now()])
            ->sum('commission');

        return $this->formatGoalProgress($currentMonthGoal, $currentMonthSales);
    }

    public function getYearlyGoalProgress(int $year): ?array
    {
        $goal = Goal::where('type', 'yearly_sales')
            ->whereYear('start_date', $year)
            ->whereYear('end_date', $year)
            ->first();

        if (!$goal) {
            return null;
        }

        $totalCommission = Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [$goal->start_date, $goal->end_date])
            ->sum('commission');

        return $this->formatGoalProgress($goal, $totalCommission);
    }

    public function getMonthlyBreakdown(int $year): array
    {
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
                'target' => (Goal::getYearlyTarget($year) / 12) * $month,
                'progress_percentage' => Goal::getYearlyTarget($year) > 0 
                    ? min(100, ($totalCommission / Goal::getYearlyTarget($year)) * 100)
                    : 0
            ];
        }

        return $monthlyProgress;
    }

    public function createYearlyGoal(array $data): Goal
    {
        return Goal::create([
            'name' => $data['name'],
            'type' => 'yearly_sales',
            'target_amount' => $data['target_amount'],
            'start_date' => Carbon::create($data['year'], 1, 1)->startOfYear(),
            'end_date' => Carbon::create($data['year'], 12, 31)->endOfYear(),
            'description' => $data['description'] ?? null
        ]);
    }

    protected function formatGoalProgress(Goal $goal, float $currentValue): array
    {
        return [
            'target' => $goal->target_amount,
            'current' => $currentValue,
            'progress' => $goal->target_amount > 0 
                ? min(100, ($currentValue / $goal->target_amount) * 100)
                : 0,
            'goal_name' => $goal->name,
            'time_remaining' => now()->diffInDays($goal->end_date, false)
        ];
    }
}