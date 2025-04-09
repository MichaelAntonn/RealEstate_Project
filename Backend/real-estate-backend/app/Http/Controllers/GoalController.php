<?php

namespace App\Http\Controllers;
use App\Services\GoalTrackingService;
use App\Constants\UserType;


use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(
        
        private GoalTrackingService $goalService,
        
    ) {}

    public function getMonthlyGoalProgress($year, $month, Request $request)
    {
        $this->authorizeAccess($request);
        $monthlyGoalProgress = $this->goalService->getMonthlyGoalProgress();

        if ($monthlyGoalProgress === null) {
            return response()->json(['message' => 'No monthly goal found for the current month'], 404);
        }

        return response()->json($monthlyGoalProgress);
    }

    public function getYearlyGoalProgress($year,Request $request)
    {
        $this->authorizeAccess($request);
        $yearlyGoalProgress = $this->goalService->getYearlyGoalProgress($year);

        if ($yearlyGoalProgress === null) {
            return response()->json(['message' => 'No yearly goal found for the given year'], 404);
        }

        return response()->json($yearlyGoalProgress);
    }

    public function getMonthlyBreakdown(Request $request, $year)
    {
        $this->authorizeAccess($request);

        $monthlyProgress = $this->goalService->getMonthlyBreakdown($year);

        return $this->successResponse([
            'monthly_progress' => $monthlyProgress
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
