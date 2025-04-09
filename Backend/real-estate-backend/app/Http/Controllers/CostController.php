<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\CostRequest;
use App\Models\Cost;
use Illuminate\Http\Request;
use App\Constants\UserType;

class CostController extends Controller
{
    // Helper method to check if user is super-admin
    protected function authorizeSuperAdmin(Request $request): void
 {
     if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
         abort(403, 'Forbidden. Only super-admins can perform this action.');
     }
 }
 public function index(Request $request)
 {
     $this->authorizeSuperAdmin($request);
 
     $query = Cost::query();
 
     if ($request->has('search')) {
         $query->where('description', 'like', '%' . $request->search . '%');
     }
 
     if ($request->has('month') && $request->has('year')) {
         $query->forMonth($request->month, $request->year);
     }
 
     if ($request->has('type')) {
         $query->ofType($request->type);
     }
 
     // Add filter by category
     if ($request->has('category')) {
         $query->where('category', $request->category);
     }
 
     $perPage = $request->input('per_page', 10);
     $costs = $query->paginate($perPage);
 
     $costsData = collect($costs->items())->map(function ($cost) {
         return [
             'id' => $cost->id,
             'amount' => $cost->amount,
             'description' => $cost->description,
             'category' => $cost->category,
             'type' => $cost->type,
             'month' => $cost->month,
             'year' => $cost->year,
             'created_at' => $cost->created_at,
             'user_id' => $cost->user_id
         ];
     });
 
     return response()->json([
         'costs' => $costsData,
         'pagination' => [
             'current_page' => $costs->currentPage(),
             'last_page' => $costs->lastPage(),
             'total' => $costs->total(),
             'per_page' => $costs->perPage()
         ],
         'categories' => Cost::getCategories(),
         'types' => Cost::getTypes()
     ]);
 }
    // إنشاء مصروف جديد
    public function store(CostRequest $request)
    {
        // Ensure the authenticated user is a super-admin
        $this->authorizeSuperAdmin($request);

        $category = $request->category == 'Other' 
            ? $request->custom_category 
            : $request->category;

        $cost = Cost::create([
            'user_id' => $request->user_id ?? auth()->id(),
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $category,
            'custom_category' => $request->category == 'Other' ? $request->custom_category : null,
            'type' => $request->type,
            'month' => $request->month,
            'year' => $request->year,
        ]);

        return response()->json($cost, 201);
    }

    // عرض مصروف معين
    public function show(Cost $cost,Request $request)
    {
        // Ensure the authenticated user is a super-admin
        $this->authorizeSuperAdmin($request);

        return response()->json($cost);
    }

    // تحديث مصروف
    public function update(CostRequest $request, Cost $cost)
    {
        // Ensure the authenticated user is a super-admin
        $this->authorizeSuperAdmin($request);

        $cost->update($request->validated());
        return response()->json($cost);
    }

    // حذف مصروف
    public function destroy(Cost $cost,Request $request)
    {
        // Ensure the authenticated user is a super-admin
        $this->authorizeSuperAdmin($request);

        $cost->delete();
        return response()->json(null, 204);
    }

    // الحصول على ملخص المصاريف لشهر معين
    public function summary(Request $request)
    {
        $this->authorizeSuperAdmin($request);


        $request->validate([
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $costs = Cost::query()
            ->forMonth($request->month, $request->year)
            ->get();

        $total = $costs->sum('amount');
        $fixed = $costs->where('type', Cost::TYPE_FIXED)->sum('amount');
        $variable = $costs->where('type', Cost::TYPE_VARIABLE)->sum('amount');

        $byCategory = $costs->groupBy('category')->map->sum('amount');

        return response()->json([
            'total' => $total,
            'fixed' => $fixed,
            'variable' => $variable,
            'by_category' => $byCategory
        ]);
    }

    public function usedCategories(Request $request)
    {
        $this->authorizeSuperAdmin($request);


        $categories = Cost::query()
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json($categories);
    }
}