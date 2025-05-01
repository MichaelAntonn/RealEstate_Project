<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Propaganistas\LaravelPhone\Rules\Phone;

class UserDashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $user = Auth::user();

        $stats = [
            'properties' => [
                'total' => Property::where('user_id', $user->id)->count(),
                'pending' => Property::where('user_id', $user->id)
                    ->where('approval_status', 'pending')
                    ->count(),
                'approved' => Property::where('user_id', $user->id)
                    ->where('approval_status', 'accepted')
                    ->count(),
                'rejected' => Property::where('user_id', $user->id)
                    ->where('approval_status', 'rejected')
                    ->count(),
            ],
            'bookings' => [
    'total' => Booking::where('user_id', $user->id)->count(),
    'upcoming' => Booking::where('user_id', $user->id)
        ->where('visit_date', '>', now())
        ->count(),
    'completed' => Booking::where('user_id', $user->id)
        ->where('visit_date', '<', now())
        ->where('status', 'confirmed')
        ->count(),
],
            'reviews' => [
                'given' => Review::where('user_id', $user->id)->count(),
                'received' => Review::whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count(),
                'average_rating' => Review::whereHas('property', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->avg('rating'),
            ],
        ];

        return response()->json([
            'success' => true,
            'dashboard' => $stats,
        ]);
    }

    /**
     * Get user statistics
     */
    public function userStatistics()
    {
        $user = Auth::user();

        $stats = [
            'joined_date' => $user->created_at->format('M d, Y'),
            'properties_added' => Property::where('user_id', $user->id)->count(),
            'bookings_made' => Booking::where('user_id', $user->id)->count(),
            'reviews_given' => Review::where('user_id', $user->id)->count(),
        ];

        return response()->json([
            'success' => true,
            'statistics' => $stats,
        ]);
    }

    /**
     * Get user profile
     */
    public function getProfile()
    {
        $user = Auth::user();

        return response()->json([
            'success' => true,
            'profile' => $user->only([
                'id',
                'first_name',
                'last_name',
                'email',
                'phone_number',
                'country',
                'city',
                'address',
                'profile_image'
            ]),
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone_number' => [
                'nullable',
                new Phone($request->country),
                Rule::unique('users')->ignore($user->id),
            ],
            'country' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'profile_image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        $user->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profile' => $user->only([
                'first_name',
                'last_name',
                'email',
                'phone_number',
                'country',
                'city',
                'address',
                'profile_image'
            ]),
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/|different:current_password',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors(),
                'message' => $validator->errors()->has('new_password.confirmed') ? 'The password confirmation does not match.' : null
            ], 400);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Delete user account
     */
    public function deleteAccount()
    {
        $user = Auth::user();

        // Soft delete the user
        $user->delete();

        // Log the user out
        Auth::logout();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }

    /**
     * Get user properties with filters
     */
    public function getProperties(Request $request)
    {
        $user = Auth::user();

        $query = Property::where('user_id', $user->id);

        // Apply filters
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->input('approval_status'));
        }
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $properties = $query->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'properties' => $properties,
        ]);
    }

    /**
     * Get user bookings
     */
    public function getBookings(Request $request)
    {
        $user = Auth::user();

        $query = Booking::where('user_id', $user->id)
            ->with(['property' => function($query) {
                $query->select('id', 'title', 'cover_image');
            }]);

        // Apply filters
        if ($request->has('status')) {
            $status = $request->input('status');
            if ($status === 'upcoming') {
                $query->where('visit_date', '>', now());
            } elseif ($status === 'completed') {
                $query->where('visit_date', '<', now())
                      ->where('status', 'confirmed');
            } elseif ($status === 'current') {
                $query->where('visit_date', '>=', now()->subDay())
                      ->where('visit_date', '<=', now()->addDay());
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'start_date');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $bookings = $query->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Get user reviews
     */
    public function getReviews(Request $request)
    {
        $user = Auth::user();

        $query = Review::where('user_id', $user->id)
            ->with(['property' => function($query) {
                $query->select('id', 'title');
            }]);

        // Apply filters
        if ($request->has('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $reviews = $query->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }
}
