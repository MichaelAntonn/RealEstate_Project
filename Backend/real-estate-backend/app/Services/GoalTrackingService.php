<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\Property;
use Carbon\Carbon;

class GoalTrackingService
{
    public function getMonthlyGoalProgress(int $month = null, int $year = null): ?array
    {
        $month = $month ?? date('m');
        $year = $year ?? date('Y');

        $currentMonthGoal = Goal::where('type', 'monthly_sales')
            ->whereYear('start_date', '=', $year)
            ->whereMonth('start_date', '=', $month)
            ->whereYear('end_date', '=', $year)
            ->first();

        if (!$currentMonthGoal) {
            return null;
        }

        $totalAchieved = $this->calculateAchievedValue($currentMonthGoal);

        return $this->formatGoalProgress($currentMonthGoal, $totalAchieved);
    }

    public function getYearlyGoalProgress(int $year = null): ?array
    {
        $year = $year ?? date('Y');

        $goal = Goal::where('type', 'yearly_sales')
            ->whereYear('start_date', $year)
            ->whereYear('end_date', $year)
            ->first();

        if (!$goal) {
            return null;
        }

        $totalAchieved = $this->calculateAchievedValue($goal);

        return $this->formatGoalProgress($goal, $totalAchieved);
    }

    public function getMonthlyBreakdown(int $year): array
    {
        $monthlyProgress = [];
        $totalCommission = 0;
        $yearlyGoal = Goal::where('type', 'yearly_sales')
            ->whereYear('start_date', $year)
            ->whereYear('end_date', $year)
            ->first();

        $yearlyTarget = $yearlyGoal ? ($yearlyGoal->goal_type === 'commission' ? $yearlyGoal->target_amount : 0) : 0;

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
                'target' => $yearlyTarget > 0 ? ($yearlyTarget / 12) * $month : 0,
                'progress_percentage' => $yearlyTarget > 0
                    ? min(100, ($totalCommission / $yearlyTarget) * 100)
                    : 0
            ];
        }

        return $monthlyProgress;
    }

    public function createYearlyGoal(array $data): Goal
    {
        $targetAmount = $data['goal_type'] === 'commission' ? $data['target_amount'] : null;
        $targetUnits = $data['goal_type'] === 'units' ? $data['target_units'] : null;

        return Goal::create([
            'name' => $data['name'],
            'type' => 'yearly_sales',
            'goal_type' => $data['goal_type'],
            'target_amount' => $targetAmount,
            'target_units' => $targetUnits,
            'start_date' => $data['start_date'] ?? Carbon::create($data['year'], 1, 1)->startOfYear(),
            'end_date' => $data['end_date'] ?? Carbon::create($data['year'], 12, 31)->endOfYear(),
            'description' => $data['description'] ?? null,
            'user_id' => $data['user_id'] ?? null
        ]);
    }


    public function createMonthlyGoal(array $data): Goal
    {
        $targetAmount = $data['goal_type'] === 'commission' ? $data['target_amount'] : null;
        $targetUnits = $data['goal_type'] === 'units' ? $data['target_units'] : null;

        return Goal::create([
            'name' => $data['name'],
            'type' => 'monthly_sales',
            'goal_type' => $data['goal_type'],
            'target_amount' => $targetAmount,
            'target_units' => $targetUnits,
            'start_date' => $data['start_date'] ?? Carbon::create($data['year'], $data['month'], 1)->startOfMonth(),
            'end_date' => $data['end_date'] ?? Carbon::create($data['year'], $data['month'], 1)->endOfMonth(),
            'description' => $data['description'] ?? null,
            'user_id' => $data['user_id'] ?? null
        ]);
    }

    public function updateMonthlyGoal(array $data, int $goalId): ?Goal
    {
        $goal = Goal::find($goalId);

        if (!$goal) {
            return null;
        }

        $updateData = [
            'name' => $data['name'] ?? $goal->name,
            'goal_type' => $data['goal_type'] ?? $goal->goal_type,
            'description' => $data['description'] ?? $goal->description,
            'user_id' => $data['user_id'] ?? $goal->user_id
        ];

        if (isset($data['goal_type'])) {
            $updateData['target_amount'] = $data['goal_type'] === 'commission' 
                ? ($data['target_amount'] ?? $goal->target_amount) 
                : null;
            
            $updateData['target_units'] = $data['goal_type'] === 'units' 
                ? ($data['target_units'] ?? $goal->target_units) 
                : null;
        } else {
            if (isset($data['target_amount'])) {
                $updateData['target_amount'] = $data['target_amount'];
            }
            if (isset($data['target_units'])) {
                $updateData['target_units'] = $data['target_units'];
            }
        }

        if (isset($data['start_date'])) {
            $updateData['start_date'] = $data['start_date'];
            $updateData['end_date'] = $data['end_date'] ?? Carbon::parse($data['start_date'])->endOfMonth();
        }

        $goal->update($updateData);

        return $goal;
    }

    public function updateYearlyGoal(array $data, int $goalId): ?Goal
    {
        $goal = Goal::find($goalId);

        if (!$goal) {
            return null;
        }

        $updateData = [
            'name' => $data['name'] ?? $goal->name,
            'goal_type' => $data['goal_type'] ?? $goal->goal_type,
            'description' => $data['description'] ?? $goal->description,
            'user_id' => $data['user_id'] ?? $goal->user_id
        ];

        if (isset($data['goal_type'])) {
            $updateData['target_amount'] = $data['goal_type'] === 'commission' 
                ? ($data['target_amount'] ?? $goal->target_amount) 
                : null;
            
            $updateData['target_units'] = $data['goal_type'] === 'units' 
                ? ($data['target_units'] ?? $goal->target_units) 
                : null;
        } else {
            if (isset($data['target_amount'])) {
                $updateData['target_amount'] = $data['target_amount'];
            }
            if (isset($data['target_units'])) {
                $updateData['target_units'] = $data['target_units'];
            }
        }

        if (isset($data['start_date'])) {
            $updateData['start_date'] = $data['start_date'];
            $updateData['end_date'] = $data['end_date'] ?? Carbon::parse($data['start_date'])->endOfYear();
        }

        $goal->update($updateData);

        return $goal;
    }

    public function getMonthlyTargets(int $month = null, int $year = null): ?array
    {
        $month = $month ?? date('m');
        $year = $year ?? date('Y');
    
        $monthlyGoals = Goal::where('type', 'monthly_sales')
            ->whereYear('start_date', '=', $year)
            ->whereMonth('start_date', '=', $month)
            ->whereYear('end_date', '=', $year)
            ->get();
    
        if ($monthlyGoals->isEmpty()) {
            return null;
        }
    
        return $monthlyGoals->map(function ($goal) {
            return [
                'goal_type' => $goal->goal_type,
                'target_value' => [
                    'units' => $goal->target_units ?? null,
                    'amount' => $goal->target_amount ?? null,
                ],
                'target_units' => $goal->target_units ?? null,
                'target_amount' => $goal->target_amount ?? null,
                'name' => $goal->name,
                'description' => $goal->description,
                'start_date' => $goal->start_date,
                'end_date' => $goal->end_date,
            ];
        })->toArray();
    }
    

    public function getYearlyTargets(int $year = null): ?array
    {
        $year = $year ?? date('Y');
    
        $yearlyGoals = Goal::where('type', 'yearly_sales')
            ->whereYear('start_date', $year)
            ->whereYear('end_date', $year)
            ->get();
    
        if ($yearlyGoals->isEmpty()) {
            return null;
        }
    
        return $yearlyGoals->map(function ($goal) {
            return [
                'goal_type' => $goal->goal_type,
                'target_value' => $goal->goal_type === 'units' 
                    ? $goal->target_units 
                    : $goal->target_amount,
                'target_units' => $goal->target_units ?? null,
                'target_amount' => $goal->target_amount ?? null,
                'name' => $goal->name,
                'description' => $goal->description,
                'start_date' => $goal->start_date,
                'end_date' => $goal->end_date,
            ];
        })->toArray();
    }
    

    protected function calculateAchievedValue(Goal $goal): float
    {
        $query = Property::where('transaction_status', 'completed')
            ->whereBetween('updated_at', [$goal->start_date, $goal->end_date]);

        if ($goal->user_id) {
            $query->where('user_id', $goal->user_id);
        }

        return $goal->goal_type === 'commission' 
            ? $query->sum('commission')
            : $query->count();
    }

    protected function formatGoalProgress(Goal $goal, float $currentValue): array
    {
        $target = $goal->goal_type === 'units' ? $goal->target_units : $goal->target_amount;
        $progress = $target > 0 ? min(100, ($currentValue / $target) * 100) : 0;

        return [
            'target' => $target,
            'current' => $currentValue,
            'progress' => $progress,
            'goal_name' => $goal->name,
            'time_remaining' => now()->diffInDays($goal->end_date, false),
            'status' => $progress >= 100 ? 'completed' : 'in_progress',
            'goal_type' => $goal->goal_type,
            'user_id' => $goal->user_id
        ];
    }
    public function deleteGoal(int $goalId): bool
{
    $goal = Goal::find($goalId);
    
    if (!$goal) {
        return false;
    }

    return $goal->delete();
}
}