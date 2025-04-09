<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\Goal;
use App\Services\CommissionCalculationService;
use App\Services\GoalTrackingService;
use App\Services\PropertyStatisticsService;
use App\Services\CostAnalysisService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CommissionController extends Controller
{
    public function __construct(
        private CommissionCalculationService $commissionService,
        private GoalTrackingService $goalService,
        private PropertyStatisticsService $propertyStatsService,
        private CostAnalysisService $costAnalysisService
    ) {}

    public function monthlyProfitMargin(Request $request)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'data' => $this->commissionService->calculateMonthlyProfitMargins()
        ]);
    }

    public function completeSale(Request $request, $id)
    {
        $this->authorizeAccess($request);
        $property = Property::findOrFail($id);

        if ($property->transaction_status === 'completed') {
            return $this->errorResponse('Property sale already completed', 400);
        }

        $result = $this->commissionService->completeSale($property);
        return $this->successResponse([
            'message' => 'Property sale completed and commission calculated',
            ...$result
        ]);
    }

    public function commissionsOverview(Request $request)
    {
        $this->authorizeAccess($request);
        $data = $this->commissionService->getCommissionsOverview();
        $data['current_month_goal'] = $this->goalService->getMonthlyGoalProgress();

        return $this->successResponse($data);
    }

    public function propertyStatistics(Request $request)
    {
        $this->authorizeAccess($request);
        return $this->successResponse(
            $this->propertyStatsService->getPropertyStats()
        );
    }

    public function agentPerformance(Request $request)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'top_agents' => $this->propertyStatsService->getAgentPerformance()
        ]);
    }

    public function yearlySummary(Request $request, $year = null)
    {
        $this->authorizeAccess($request);
        $year = $year ?? Carbon::now()->year;

        return $this->successResponse([
            'year' => $year,
            'summary' => $this->commissionService->getYearlySummary($year),
            'yearly_goal' => $this->goalService->getYearlyGoalProgress($year)
        ]);
    }

    public function costAnalysis(Request $request)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'categories' => $this->costAnalysisService->getCostCategories(),
            'monthly_costs' => $this->costAnalysisService->getMonthlyCosts()
        ]);
    }

    public function getYearlyGoalProgress(Request $request, $year)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'goal' => $this->goalService->getYearlyGoalProgress($year),
            'monthly_progress' => $this->goalService->getMonthlyBreakdown($year)
        ]);
    }

    // Helper methods
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

    protected function errorResponse(string $message, int $status = 400)
    {
        return response()->json(['success' => false, 'error' => $message], $status);
    }

    public function costTrends(Request $request)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'trends' => $this->costAnalysisService->getCostTrends()
        ]);
    }

    public function profitAnalysis(Request $request, $year = null)
    {
        $this->authorizeAccess($request);
        return $this->successResponse([
            'analysis' => $this->commissionService->getProfitAnalysis($year)
        ]);
    }

}
