<?php

namespace App\Http\Controllers;

use App\Constants\UserType;
use App\Models\Booking;
use App\Models\Cost;
use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DashboardController extends Controller

    {
        public function index(Request $request)
        {
            $userType = $request->user()->user_type;
    
            if ($userType === UserType::SUPER_ADMIN) {
                // Return super-admin dashboard with super-admin options
                return response()->json([
                    'success' => 'Super Admin Dashboard',
                    
                ]);
            } elseif ($userType === UserType::ADMIN) {
                // Return admin dashboard without super-admin options
                return response()->json([
                    'success' => 'Admin Dashboard',
                   
                ]);
            } elseif ($userType === UserType::USER) {
                return response()->json(['success' => 'User Dashboard']);
            }
            
    
            // Fallback response
            return response()->json(['error' => 'Unauthorized access'], 403);
        }
         /**
     * Create a new admin user (only accessible by super-admin).
     */
    public function createAdmin(Request $request)
    {
        // Ensure the authenticated user is a super-admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can create admins.'], 403);
        }

        // Validate the request data
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone_number' => 'required|string|unique:users,phone_number',
            'country' => 'nullable|string',
            'city' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        // Create the admin user
        $admin = User::create([
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
            'phone_number' => $validatedData['phone_number'],
            'country' => $validatedData['country'],
            'city' => $validatedData['city'],
            'address' => $validatedData['address'],
            'user_type' => 'admin',
        ]);

        return response()->json([
            'success' => 'Admin created successfully',
            'admin' => $admin,
        ], 201);
    }

/**
 * Delete a regular user (accessible by both super-admin and admin).
 */
public function destroyUser(Request $request, $userId)
{
    // Ensure the authenticated user is either a super-admin or an admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins and admins can delete users.'], 403);
    }

    // Find the user to delete
    $user = User::find($userId);

    // Check if the user exists
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Prevent users from deleting themselves
    if ($user->id === $request->user()->id) {
        return response()->json(['error' => 'You cannot delete yourself.'], 403);
    }

    // Ensure the target user is a regular user
    if ($user->user_type !== UserType::USER) {
        return response()->json(['error' => 'Forbidden. You can only delete regular users.'], 403);
    }

    // Delete the user
    $user->delete();

    return response()->json([
        'success' => 'User deleted successfully',
    ], 200);
}

/**
 * Delete an admin (accessible only by super-admin).
 */
public function destroyAdmin(Request $request, $adminId)
{
    // Ensure the authenticated user is a super-admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins can delete admins.'], 403);
    }

    // Find the admin to delete
    $admin = User::find($adminId);

    // Check if the admin exists
    if (!$admin) {
        return response()->json(['error' => 'Admin not found'], 404);
    }

    // Prevent super-admin from deleting themselves
    if ($admin->id === $request->user()->id) {
        return response()->json(['error' => 'You cannot delete yourself.'], 403);
    }

    // Ensure the target user is an admin
    if ($admin->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. You can only delete admins.'], 403);
    }

    // Delete the admin
    $admin->delete();

    return response()->json([
        'success' => 'Admin deleted successfully',
    ], 200);
}
     /**
     * Show all users (accessible by super-admin and admin).
     */
    public function showUsers(Request $request)
    {
        // Ensure the authenticated user is either a super-admin or an admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins and admins can view users.'], 403);
        }

        // Fetch all users except super-admin
    $users = User::where('user_type', '!=', UserType::SUPER_ADMIN)->get();

        return response()->json([
            'success' => true,
            'users' => $users,
        ]);
    }

    /**
     * Show all admins (accessible only by super-admin).
     */
    public function showAdmins(Request $request)
    {
        // Ensure the authenticated user is a super-admin
        if ($request->user()->user_type !== UserType::SUPER_ADMIN) {
            return response()->json(['error' => 'Forbidden. Only super-admins can view admins.'], 403);
        }

        // Fetch all admins except super-admin
    $admins = User::where('user_type', UserType::ADMIN)->get();

        return response()->json([
            'success' => true,
            'admins' => $admins,
        ]);
    }

    /**
 * Edit profile for admin and super-admin.
 */
public function editProfile(Request $request)
{
    // Get the authenticated user
    $user = $request->user();

    // Ensure the authenticated user is either an admin or super-admin
    if ($user->user_type !== UserType::ADMIN && $user->user_type !== UserType::SUPER_ADMIN) {
        return response()->json(['error' => 'Forbidden. Only admins and super-admins can edit their profiles.'], 403);
    }

    // Validate the request data
    $validatedData = $request->validate([
           'first_name' => 'sometimes|string|max:255',
        'last_name' => 'sometimes|string|max:255',
        'email' => 'sometimes|email|unique:users,email,' . $user->id,
        'password' => 'sometimes|string|min:8',
        'phone_number' => 'sometimes|string|unique:users,phone_number,' . $user->id,
        'address' => 'nullable|string',
        'profile_image' => 'nullable|string',
        'identity_document' => 'nullable|string',
        'country' => 'nullable|string',
        'city' => 'nullable|string',
        
    ]);

    // Update the user's profile
    if (isset($validatedData['password'])) {
        $validatedData['password'] = Hash::make($validatedData['password']);
    }

    $user->update($validatedData);

    return response()->json([
        'success' => 'Profile updated successfully',
        'user' => $user,
    ], 200);
}

// General Statistics (Super-Admin and Admin)
public function generalStatistics(Request $request)
{
    // Ensure the authenticated user is either a super-admin or an admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins and admins can view statistics.'], 403);
    }

    // Number of properties
    $totalProperties = Property::count();

    // Number of users
    $totalUsers = User::count();

    // Number of bookings (requests)
    $totalBookings = Booking::count();

    // Total commissions (from completed transactions)
    $totalCommissions = Property::where('transaction_status', 'completed')->sum('commission');

    // Total costs
    $totalCosts = Cost::sum('amount');

    // Net profit
    $netProfit = $totalCommissions - $totalCosts;

    // Number of reviews
    $totalReviews = Review::count();

    return response()->json([
        'success' => true,
        'statistics' => [
            'total_properties' => $totalProperties,
            'total_users' => $totalUsers,
            'total_bookings' => $totalBookings,
            'total_commissions' => $totalCommissions,
            'total_costs' => $totalCosts,
            'net_profit' => $netProfit,
            'total_reviews' => $totalReviews
        ]
    ]);
}

// Latest Properties (Super-Admin and Admin)
public function latestProperties(Request $request)
{
    // Ensure the authenticated user is either a super-admin or an admin
    if ($request->user()->user_type !== UserType::SUPER_ADMIN && $request->user()->user_type !== UserType::ADMIN) {
        return response()->json(['error' => 'Forbidden. Only super-admins and admins can view latest properties.'], 403);
    }

    $latestProperties = Property::with('user')
        ->orderBy('created_at', 'desc')
        ->take(5) // Get the 5 most recent
        ->get();

    return response()->json([
        'success' => true,
        'latest_properties' => $latestProperties
    ]);
}
// User Activities (Admin can get for any user, regular user gets their own)
public function userActivities(Request $request, $userId = null)
{
    $authUser = $request->user();
    $userType = $authUser->user_type;

    // Case 1: Admin (super-admin or admin) accessing any user's activities
    if ($userType === UserType::SUPER_ADMIN || $userType === UserType::ADMIN) {
        if ($userId && !User::find($userId)) {
            return response()->json(['error' => 'User not found'], 404);
        }
        $targetUserId = $userId; // Admin can specify any user
    }
    // Case 2: Regular user accessing their own activities
    elseif ($userType === UserType::USER) {
        $targetUserId = $authUser->id; // Regular user can only see their own
    }
    // Unauthorized access
    else {
        return response()->json(['error' => 'Unauthorized access'], 403);
    }

    // Get the limit from the request, default to 20
    $limit = $request->query('limit', 20);

    $activities = [];

    // 1. Property Additions
    $propertyAdditionsQuery = Property::select('id', 'title', 'user_id', 'created_at')
        ->with(['user' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
        }])
        ->orderBy('created_at', 'desc')
        ->take(10);
    if ($targetUserId) {
        $propertyAdditionsQuery->where('user_id', $targetUserId);
    }
    $propertyAdditions = $propertyAdditionsQuery->get()
        ->map(function ($property) {
            return [
                'type' => 'property_added',
                'description' => "User {$property->user->first_name} {$property->user->last_name} added property '{$property->title}'",
                'timestamp' => $property->created_at,
                'user_id' => $property->user_id,
                'property_id' => $property->id
            ];
        });

    // 2. Property Purchases
    $propertyPurchasesQuery = Property::where('transaction_status', 'completed')
        ->select('id', 'title', 'user_id', 'updated_at')
        ->with(['user' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
        }])
        ->orderBy('updated_at', 'desc')
        ->take(10);
    if ($targetUserId) {
        $propertyPurchasesQuery->where('user_id', $targetUserId);
    }
    $propertyPurchases = $propertyPurchasesQuery->get()
        ->map(function ($property) {
            return [
                'type' => 'property_purchased',
                'description' => "Property '{$property->title}' was purchased (completed transaction)",
                'timestamp' => $property->updated_at,
                'user_id' => $property->user_id,
                'property_id' => $property->id
            ];
        });

    // 3. Booking Additions
    $bookingAdditionsQuery = Booking::select('id', 'user_id', 'property_id', 'created_at')
        ->with(['user' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
        }, 'property' => function ($query) {
            $query->select('id', 'title');
        }])
        ->orderBy('created_at', 'desc')
        ->take(10);
    if ($targetUserId) {
        $bookingAdditionsQuery->where('user_id', $targetUserId);
    }
    $bookingAdditions = $bookingAdditionsQuery->get()
        ->map(function ($booking) {
            return [
                'type' => 'booking_added',
                'description' => "User {$booking->user->first_name} {$booking->user->last_name} booked property '{$booking->property->title}'",
                'timestamp' => $booking->created_at,
                'user_id' => $booking->user_id,
                'property_id' => $booking->property_id
            ];
        });

    // 4. Booking Updates
    $bookingUpdatesQuery = Booking::whereColumn('created_at', '!=', 'updated_at')
        ->select('id', 'user_id', 'property_id', 'status', 'updated_at')
        ->with(['user' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
        }, 'property' => function ($query) {
            $query->select('id', 'title');
        }])
        ->orderBy('updated_at', 'desc')
        ->take(10);
    if ($targetUserId) {
        $bookingUpdatesQuery->where('user_id', $targetUserId);
    }
    $bookingUpdates = $bookingUpdatesQuery->get()
        ->map(function ($booking) {
            return [
                'type' => 'booking_updated',
                'description' => "Booking for property '{$booking->property->title}' by user {$booking->user->first_name} {$booking->user->last_name} updated to status '{$booking->status}'",
                'timestamp' => $booking->updated_at,
                'user_id' => $booking->user_id,
                'property_id' => $booking->property_id
            ];
        });

    // 5. Reviews
    $reviewsQuery = Review::select('id', 'user_id', 'property_id', 'rating', 'comment', 'created_at')
        ->with(['user' => function ($query) {
            $query->select('id', 'first_name', 'last_name');
        }, 'property' => function ($query) {
            $query->select('id', 'title');
        }])
        ->orderBy('created_at', 'desc')
        ->take(10);
    if ($targetUserId) {
        $reviewsQuery->where('user_id', $targetUserId);
    }
    $reviews = $reviewsQuery->get()
        ->map(function ($review) {
            return [
                'type' => 'review_added',
                'description' => "User {$review->user->first_name} {$review->user->last_name} reviewed property '{$review->property->title}' with rating {$review->rating}: '{$review->comment}'",
                'timestamp' => $review->created_at,
                'user_id' => $review->user_id,
                'property_id' => $review->property_id
            ];
        });

    // Merge all activities
    $activities = array_merge(
        $propertyAdditions->toArray(),
        $propertyPurchases->toArray(),
        $bookingAdditions->toArray(),
        $bookingUpdates->toArray(),
        $reviews->toArray()
    );

    // Sort by timestamp (most recent first)
    usort($activities, function ($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });

    // Apply the dynamic limit
    $activities = array_slice($activities, 0, $limit);

    return response()->json([
        'success' => true,
        'activities' => $activities
    ]);
}
public function userStatistics(Request $request)
{
    $user = $request->user();
    
    return response()->json([
        'success' => true,
        'statistics' => [
            'properties_listed' => Property::where('user_id', $user->id)->count(),
            'properties_sold' => Property::where('user_id', $user->id)
                ->where('transaction_status', 'completed')
                ->count(),
            'active_bookings' => Booking::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->count(),
            'reviews_given' => Review::where('user_id', $user->id)->count()
        ]
    ]);
}
}
