<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Consultant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ConsultantController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'type' => 'required|string|max:100',
            'message' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $consultant = Consultant::create($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'Consultant request submitted successfully!',
            'data' => $consultant
        ], 201);
    }

    public function index(Request $request)
    {
        $user = Auth::user();

        // Allow only admin or super-admin
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        // Start building the consultants query
        $query = Consultant::query();

        // Filter by full name
        if ($request->filled('full_name')) {
            $query->where('full_name', 'LIKE', '%' . $request->full_name . '%');
        }

        // Filter by email
        if ($request->filled('email')) {
            $query->where('email', 'LIKE', '%' . $request->email . '%');
        }

        // Filter by phone
        if ($request->filled('phone')) {
            $query->where('phone', 'LIKE', '%' . $request->phone . '%');
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by seen status
        if ($request->filled('seen')) {
            $query->where('seen', filter_var($request->seen, FILTER_VALIDATE_BOOLEAN));
        }

        // Number of results per page (default 10)
        $perPage = $request->get('per_page', 10);

        // Execute the query ordered by seen status (unseen first) and latest
        $consultants = $query->orderBy('seen', 'asc')->latest()->paginate($perPage);

        return response()->json([
            'status' => true,
            'data' => $consultants,
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();

        // Allow only admin or super-admin
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        // Find the consultant
        $consultant = Consultant::findOrFail($id);

        if (!$consultant) {
            return response()->json([
                'status' => false,
                'message' => 'Consultant not found.',
            ], 404);
        }

        // Mark as seen
        if (!$consultant->seen) {
            $consultant->seen = true;
            $consultant->save();
        }

        return response()->json([
            'status' => true,
            'data' => $consultant,
        ]);
    }

    public function updateSeen(Request $request, $id)
    {
        $user = Auth::user();

        // Allow only admin or super-admin
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        // Find the consultant
        $consultant = Consultant::findOrFail($id);

        if (!$consultant) {
            return response()->json([
                'status' => false,
                'message' => 'Consultant not found.',
            ], 404);
        }

        // Toggle seen status
        $consultant->seen = !$consultant->seen;
        $consultant->save();

        return response()->json([
            'status' => true,
            'message' => $consultant->seen ? 'Marked as seen' : 'Marked as unseen',
            'data' => $consultant,
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();

        // Check user permissions
        if (!in_array($user->user_type, [UserType::ADMIN, UserType::SUPER_ADMIN])) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        // Try to find the consultant
        $consultant = Consultant::findOrFail($id);

        if (!$consultant) {
            return response()->json([
                'status' => false,
                'message' => 'Consultant not found.',
            ], 404);
        }

        // Delete the consultant
        $consultant->delete();

        return response()->json([
            'status' => true,
            'message' => 'Consultant deleted successfully.',
        ]);
    }
}