<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Setting;
use Illuminate\Http\Request;
use App\Services\GoalTrackingService;
use Carbon\Carbon;

class SettingController extends Controller
{
    public function __construct(

        private GoalTrackingService $goalService,

    ) {}
    public function getFinancialSettings(Request $request)
    {
        $this->authorizeAccess($request);

        return response()->json([
            'success' => true,
            'commission_rate' => Setting::getCommissionRate(),
            'status' => 'success'
        ]);
    }

    public function updateCommissionRate(Request $request)
    {
        $this->authorizeAccess($request);

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

    public function createMonthlyGoal(Request $request)
    {
        $this->authorizeAccess($request);

        $currentYear = date('Y');
        $currentMonth = date('m');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:monthly_sales,yearly_sales',
            'goal_type' => 'required|in:units,commission',
            'target_amount' => 'required_if:goal_type,commission|numeric|min:0|nullable',
            'target_units' => 'required_if:goal_type,units|integer|min:1|nullable',
            'year' => [
                'required',
                'numeric',
                'digits:4',
                'min:' . $currentYear,
                function ($attribute, $value, $fail) use ($currentYear, $currentMonth, $request) {
                    if ($value == $currentYear && $request->input('month') < $currentMonth) {
                        $fail('Cannot create a goal for a past month in the current year.');
                    }
                }
            ],
            'month' => [
                'required',
                'numeric',
                'between:1,12',
                function ($attribute, $value, $fail) use ($currentYear, $currentMonth, $request) {
                    $year = $request->input('year');
                    if ($year == $currentYear && $value < $currentMonth) {
                        $fail('Cannot create a goal for a past month in the current year.');
                    }
                }
            ],
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id'
        ]);

        $data['type'] = 'monthly_sales';

        // Convert year/month to dates
        $data['start_date'] = Carbon::create($data['year'], $data['month'], 1)->startOfMonth();
        $data['end_date'] = Carbon::create($data['year'], $data['month'], 1)->endOfMonth();

        unset($data['year'], $data['month']);

        $goal = $this->goalService->createMonthlyGoal($data);

        return $this->successResponse([
            'message' => 'Monthly goal created successfully.',
            'goal' => $goal
        ]);
    }

    public function createYearlyGoal(Request  $request)
    {
        $this->authorizeAccess($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:monthly_sales,yearly_sales',
            'goal_type' => 'required|in:units,commission',
            'target_amount' => 'required_if:goal_type,commission|numeric|min:0|nullable',
            'target_units' => 'required_if:goal_type,units|integer|min:1|nullable',
            'year' => [
                'required',
                'numeric',
                'digits:4',
                'min:' . date('Y'), // Ensures year isn't in past
            ],
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id' // For agent-specific goals
        ]);

        $data['type'] = 'yearly_sales';

        // Convert year to start and end dates
        $data['start_date'] = Carbon::create($data['year'], 1, 1)->startOfYear();
        $data['end_date'] = Carbon::create($data['year'], 12, 31)->endOfYear();

        unset($data['year']);

        $goal = $this->goalService->createYearlyGoal($data);

        return $this->successResponse([
            'message' => 'Yearly goal created successfully.',
            'goal' => $goal
        ]);
    }
    public function updateMonthlyGoal(Request $request, $goalId)
    {
        $this->authorizeAccess($request);

        $currentYear = date('Y');
        $currentMonth = date('m');

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:monthly_sales,yearly_sales',
            'goal_type' => 'nullable|in:units,commission',
            'target_amount' => 'nullable|required_if:goal_type,commission|numeric|min:0',
            'target_units' => 'nullable|required_if:goal_type,units|integer|min:1',
            'year' => [
                'nullable',
                'numeric',
                'digits:4',
                'min:' . $currentYear,
                function ($attribute, $value, $fail) use ($currentYear, $currentMonth, $request) {
                    if ($value == $currentYear && $request->input('month') < $currentMonth) {
                        $fail('Cannot update goal to a past month in the current year.');
                    }
                }
            ],
            'month' => [
                'nullable',
                'numeric',
                'between:1,12',
                function ($attribute, $value, $fail) use ($currentYear, $currentMonth, $request) {
                    if ($request->input('year') == $currentYear && $value < $currentMonth) {
                        $fail('Cannot update goal to a past month in the current year.');
                    }
                }
            ],
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id'
        ]);
        if (isset($data['type'])) {
            $data['type'] = 'monthly_sales';
        }

        // If year/month are being updated, convert to dates
        if (isset($data['year']) && isset($data['month'])) {
            $data['start_date'] = Carbon::create($data['year'], $data['month'], 1)->startOfMonth();
            $data['end_date'] = Carbon::create($data['year'], $data['month'], 1)->endOfMonth();
            unset($data['year'], $data['month']);
        }

        $goal = $this->goalService->updateMonthlyGoal($data, $goalId);

        return $this->successResponse([
            'message' => 'Monthly goal updated successfully.',
            'goal' => $goal
        ]);
    }

    public function updateYearlyGoal(Request $request, $goalId)
    {
        $this->authorizeAccess($request);

        $currentYear = date('Y');

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:monthly_sales,yearly_sales',
            'goal_type' => 'nullable|in:units,commission',
            'target_amount' => 'nullable|required_if:goal_type,commission|numeric|min:0',
            'target_units' => 'nullable|required_if:goal_type,units|integer|min:1',
            'year' => [
                'nullable',
                'numeric',
                'digits:4',
                'min:' . $currentYear,
                function ($attribute, $value, $fail) use ($currentYear) {
                    if ($value < $currentYear) {
                        $fail('Cannot update goal to a past year.');
                    }
                }
            ],
            'description' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id'
        ]);

        if (isset($data['type'])) {
            $data['type'] = 'yearly_sales';
        }

        // If year is being updated, convert to dates
        if (isset($data['year'])) {
            $data['start_date'] = Carbon::create($data['year'], 1, 1)->startOfYear();
            $data['end_date'] = Carbon::create($data['year'], 12, 31)->endOfYear();
            unset($data['year']);
        }

        $goal = $this->goalService->updateYearlyGoal($data, $goalId);

        return $this->successResponse([
            'message' => 'Yearly goal updated successfully.',
            'goal' => $goal
        ]);
    }
    public function getMonthlyTarget(Request $request)
{
    $this->authorizeAccess($request);

    $validated = $request->validate([
        'month' => 'nullable|integer|between:1,12',
        'year' => 'nullable|integer|digits:4'
    ]);

    $target = $this->goalService->getMonthlyTargets(
        $validated['month'] ?? null,
        $validated['year'] ?? null
    );

    return $this->successResponse([
        'target' => $target
    ]);
}

public function getYearlyTarget(Request $request)
{
    $this->authorizeAccess($request);

    $validated = $request->validate([
        'year' => 'nullable|integer|digits:4'
    ]);

    $target = $this->goalService->getYearlyTargets(
        $validated['year'] ?? null
    );

    return $this->successResponse([
        'target' => $target
    ]);
}

public function deleteGoal(Request $request, $goalId)
{
    $this->authorizeAccess($request);

    $deleted = $this->goalService->deleteGoal($goalId);

    if (!$deleted) {
        return response()->json([
            'success' => false,
            'message' => 'Goal not found or could not be deleted'
        ], 404);
    }

    return $this->successResponse([
        'message' => 'Goal deleted successfully'
    ]);
}

    protected function authorizeAccess(Request $request): void
    {
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            abort(403, 'Forbidden. Only super-admins can access this resource.');
        }
    }

    protected function successResponse(array $data, int $status = 200)
    {
        return response()->json(['success' => true, ...$data], $status);
    }
}
